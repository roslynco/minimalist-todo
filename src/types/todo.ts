/**
 * Priority levels for todos
 */
export type Priority = 'low' | 'medium' | 'high';

/**
 * Available categories for organizing todos
 */
export type Category = 'personal' | 'work' | 'shopping' | 'health' | 'other';

/**
 * Core Todo item interface
 */
export interface Todo {
  /** Unique identifier for the todo */
  id: string;
  /** Title/description of the todo */
  title: string;
  /** Whether the todo has been completed */
  completed: boolean;
  /** Optional due date as ISO date string */
  dueDate: string | null;
  /** Optional category for organization */
  category: Category | null;
  /** Priority level of the todo */
  priority: Priority;
  /** Creation timestamp as ISO date string */
  createdAt: string;
  /** Order index for drag-and-drop reordering */
  order: number;
}

