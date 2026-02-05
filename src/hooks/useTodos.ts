'use client';

import { useCallback, useSyncExternalStore } from 'react';
import type { Todo, Priority, Category } from '@/types/todo';

const STORAGE_KEY = 'minimalist-todos';

/**
 * Input type for creating a new todo (omits auto-generated fields)
 */
export interface CreateTodoInput {
  title: string;
  dueDate?: string | null;
  category?: Category | null;
  priority?: Priority;
}

/**
 * Input type for updating an existing todo (all fields optional except id)
 */
export interface UpdateTodoInput {
  id: string;
  title?: string;
  dueDate?: string | null;
  category?: Category | null;
  priority?: Priority;
  completed?: boolean;
}

// In-memory cache for todos (single source of truth)
let todosCache: Todo[] = [];
const listeners: Set<() => void> = new Set();

function emitChange() {
  for (const listener of listeners) {
    listener();
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot(): Todo[] {
  return todosCache;
}

function getServerSnapshot(): Todo[] {
  return [];
}

/**
 * Initialize from localStorage (called once on first hook mount)
 */
function initializeFromStorage() {
  if (typeof window === 'undefined') return;
  if (todosCache.length > 0) return; // Already initialized

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      todosCache = JSON.parse(stored) as Todo[];
    }
  } catch (error) {
    console.error('Failed to load todos from localStorage:', error);
  }
}

/**
 * Persist todos to localStorage
 */
function persistToStorage(todos: Todo[]) {
  todosCache = todos;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  } catch (error) {
    console.error('Failed to save todos to localStorage:', error);
  }
  emitChange();
}

/**
 * Custom hook for managing todos with localStorage persistence.
 * SSR-safe: uses useSyncExternalStore with server snapshot returning empty array.
 */
export function useTodos() {
  // Initialize from storage on first render (client-side only)
  if (typeof window !== 'undefined') {
    initializeFromStorage();
  }

  const todos = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  /**
   * Add a new todo
   */
  const addTodo = useCallback((input: CreateTodoInput) => {
    const newTodo: Todo = {
      id: crypto.randomUUID(),
      title: input.title,
      completed: false,
      dueDate: input.dueDate ?? null,
      category: input.category ?? null,
      priority: input.priority ?? 'medium',
      createdAt: new Date().toISOString(),
      order: Date.now(), // Use timestamp for initial ordering
    };

    persistToStorage([...todosCache, newTodo]);
    return newTodo;
  }, []);

  /**
   * Update an existing todo
   */
  const updateTodo = useCallback((input: UpdateTodoInput) => {
    const updated = todosCache.map((todo) =>
      todo.id === input.id
        ? {
            ...todo,
            ...(input.title !== undefined && { title: input.title }),
            ...(input.dueDate !== undefined && { dueDate: input.dueDate }),
            ...(input.category !== undefined && { category: input.category }),
            ...(input.priority !== undefined && { priority: input.priority }),
            ...(input.completed !== undefined && { completed: input.completed }),
          }
        : todo
    );
    persistToStorage(updated);
  }, []);

  /**
   * Delete a todo by id
   */
  const deleteTodo = useCallback((id: string) => {
    persistToStorage(todosCache.filter((todo) => todo.id !== id));
  }, []);

  /**
   * Toggle a todo's completed status
   */
  const toggleTodo = useCallback((id: string) => {
    const updated = todosCache.map((todo) =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );
    persistToStorage(updated);
  }, []);

  /**
   * Reorder todos after drag-and-drop.
   * @param activeId - The id of the todo being dragged
   * @param overId - The id of the todo being dragged over
   */
  const reorderTodos = useCallback((activeId: string, overId: string) => {
    const oldIndex = todosCache.findIndex((t) => t.id === activeId);
    const newIndex = todosCache.findIndex((t) => t.id === overId);

    if (oldIndex === -1 || newIndex === -1) return;

    const result = [...todosCache];
    const [removed] = result.splice(oldIndex, 1);
    result.splice(newIndex, 0, removed);

    // Update order values to reflect new positions
    const reordered = result.map((todo, index) => ({
      ...todo,
      order: index,
    }));
    persistToStorage(reordered);
  }, []);

  return {
    todos,
    addTodo,
    updateTodo,
    deleteTodo,
    toggleTodo,
    reorderTodos,
  };
}

