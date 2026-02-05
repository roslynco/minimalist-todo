'use client';

import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { format } from 'date-fns';
import { GripVertical, Pencil, Trash2, Calendar } from 'lucide-react';

import type { Todo, Priority, Category } from '@/types/todo';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

export interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onUpdate: (id: string, title: string) => void;
  onDelete: (id: string) => void;
}

const priorityColors: Record<Priority, string> = {
  high: 'bg-red-500',
  medium: 'bg-yellow-500',
  low: 'bg-green-500',
};

const categoryLabels: Record<Category, string> = {
  personal: 'Personal',
  work: 'Work',
  shopping: 'Shopping',
  health: 'Health',
  other: 'Other',
};

export function TodoItem({ todo, onToggle, onUpdate, onDelete }: TodoItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(todo.title);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: todo.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Focus input when entering edit mode
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleDoubleClick = () => {
    if (!todo.completed) {
      setEditValue(todo.title);
      setIsEditing(true);
    }
  };

  const handleEditClick = () => {
    setEditValue(todo.title);
    setIsEditing(true);
  };

  const handleSave = () => {
    const trimmed = editValue.trim();
    if (trimmed && trimmed !== todo.title) {
      onUpdate(todo.id, trimmed);
    } else {
      setEditValue(todo.title);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setEditValue(todo.title);
      setIsEditing(false);
    }
  };

  const formattedDueDate = todo.dueDate ? format(new Date(todo.dueDate), 'MMM d') : null;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'flex items-center gap-3 rounded-lg border bg-card p-3 shadow-sm transition-all',
        isDragging && 'opacity-50 shadow-lg',
        todo.completed && 'bg-muted/50'
      )}
    >
      {/* Drag Handle */}
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab touch-none text-muted-foreground hover:text-foreground focus:outline-none"
        aria-label="Drag to reorder"
      >
        <GripVertical className="size-5" />
      </button>

      {/* Priority Indicator */}
      <div
        className={cn('size-2 shrink-0 rounded-full', priorityColors[todo.priority])}
        title={`${todo.priority} priority`}
      />

      {/* Checkbox */}
      <Checkbox
        checked={todo.completed}
        onCheckedChange={() => onToggle(todo.id)}
        aria-label={todo.completed ? 'Mark as incomplete' : 'Mark as complete'}
      />

      {/* Title - Editable */}
      <div className="flex flex-1 items-center gap-2 min-w-0">
        {isEditing ? (
          <Input
            ref={inputRef}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            className="h-7 text-sm"
          />
        ) : (
          <span
            onDoubleClick={handleDoubleClick}
            className={cn(
              'flex-1 truncate cursor-default',
              todo.completed && 'text-muted-foreground line-through'
            )}
          >
            {todo.title}
          </span>
        )}
      </div>

      {/* Category Badge */}
      {todo.category && (
        <Badge variant="secondary" className="shrink-0 text-xs">
          {categoryLabels[todo.category]}
        </Badge>
      )}

      {/* Due Date */}
      {formattedDueDate && (
        <span className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
          <Calendar className="size-3" />
          {formattedDueDate}
        </span>
      )}

      {/* Edit Button */}
      <Button
        variant="ghost"
        size="icon-xs"
        onClick={handleEditClick}
        disabled={todo.completed}
        aria-label="Edit todo"
      >
        <Pencil className="size-3.5" />
      </Button>

      {/* Delete Button */}
      <Button
        variant="ghost"
        size="icon-xs"
        onClick={() => onDelete(todo.id)}
        aria-label="Delete todo"
        className="text-destructive hover:text-destructive"
      >
        <Trash2 className="size-3.5" />
      </Button>
    </div>
  );
}

