'use client';

import { useMemo, useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useTodos } from '@/hooks/useTodos';
import type { Todo, Category, Priority } from '@/types/todo';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TodoItem } from './TodoItem';

type SortOption = 'order' | 'dueDate' | 'priority' | 'createdAt';
type CompletionFilter = 'all' | 'active' | 'completed';

const CATEGORIES: Array<Category | 'all'> = ['all', 'personal', 'work', 'shopping', 'health', 'other'];
const PRIORITY_ORDER: Record<Priority, number> = { high: 0, medium: 1, low: 2 };

function sortTodos(todos: Todo[], sortBy: SortOption): Todo[] {
  return [...todos].sort((a, b) => {
    switch (sortBy) {
      case 'dueDate':
        // Todos without due date go to the end
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      case 'priority':
        return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
      case 'createdAt':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'order':
      default:
        return a.order - b.order;
    }
  });
}

export function TodoList() {
  const { todos, reorderTodos, toggleTodo, updateTodo, deleteTodo } = useTodos();
  const [categoryFilter, setCategoryFilter] = useState<Category | 'all'>('all');
  const [completionFilter, setCompletionFilter] = useState<CompletionFilter>('all');
  const [sortBy, setSortBy] = useState<SortOption>('order');

  const handleUpdate = (id: string, title: string) => {
    updateTodo({ id, title });
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const filteredAndSortedTodos = useMemo(() => {
    let result = todos;

    // Filter by category
    if (categoryFilter !== 'all') {
      result = result.filter((todo) => todo.category === categoryFilter);
    }

    // Filter by completion status
    if (completionFilter === 'active') {
      result = result.filter((todo) => !todo.completed);
    } else if (completionFilter === 'completed') {
      result = result.filter((todo) => todo.completed);
    }

    // Sort
    return sortTodos(result, sortBy);
  }, [todos, categoryFilter, completionFilter, sortBy]);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      reorderTodos(active.id as string, over.id as string);
    }
  }

  const isEmpty = filteredAndSortedTodos.length === 0;

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle>Your Tasks</CardTitle>
        <div className="flex flex-wrap gap-2 mt-3">
          {/* Category Filter */}
          <Select value={categoryFilter} onValueChange={(v) => setCategoryFilter(v as Category | 'all')}>
            <SelectTrigger className="w-[130px]" size="sm">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Completion Filter */}
          <Select value={completionFilter} onValueChange={(v) => setCompletionFilter(v as CompletionFilter)}>
            <SelectTrigger className="w-[130px]" size="sm">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>

          {/* Sort */}
          <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
            <SelectTrigger className="w-[140px]" size="sm">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="order">Manual Order</SelectItem>
              <SelectItem value="dueDate">Due Date</SelectItem>
              <SelectItem value="priority">Priority</SelectItem>
              <SelectItem value="createdAt">Created</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {isEmpty ? (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-lg">No tasks found</p>
            <p className="text-sm mt-1">
              {todos.length === 0
                ? 'Add a task to get started!'
                : 'Try adjusting your filters.'}
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[400px]">
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={filteredAndSortedTodos.map((t) => t.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-2 pr-4">
                  {filteredAndSortedTodos.map((todo) => (
                    <TodoItem
                      key={todo.id}
                      todo={todo}
                      onToggle={toggleTodo}
                      onUpdate={handleUpdate}
                      onDelete={deleteTodo}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}

