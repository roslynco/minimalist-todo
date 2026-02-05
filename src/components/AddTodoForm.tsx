'use client';

import * as React from 'react';
import { CalendarIcon, PlusIcon } from 'lucide-react';
import { format } from 'date-fns';
import { Popover } from 'radix-ui';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useTodos } from '@/hooks/useTodos';
import type { Category, Priority } from '@/types/todo';

const CATEGORIES: Category[] = ['personal', 'work', 'shopping', 'health', 'other'];
const PRIORITIES: Priority[] = ['low', 'medium', 'high'];

const CATEGORY_LABELS: Record<Category, string> = {
  personal: 'Personal',
  work: 'Work',
  shopping: 'Shopping',
  health: 'Health',
  other: 'Other',
};

const PRIORITY_LABELS: Record<Priority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
};

export function AddTodoForm() {
  const { addTodo } = useTodos();

  const [title, setTitle] = React.useState('');
  const [dueDate, setDueDate] = React.useState<Date | undefined>(undefined);
  const [category, setCategory] = React.useState<Category | ''>('');
  const [priority, setPriority] = React.useState<Priority>('medium');
  const [datePickerOpen, setDatePickerOpen] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) return;

    addTodo({
      title: title.trim(),
      dueDate: dueDate ? dueDate.toISOString() : null,
      category: category || null,
      priority,
    });

    // Reset form
    setTitle('');
    setDueDate(undefined);
    setCategory('');
    setPriority('medium');
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row sm:items-end sm:gap-2">
      {/* Title Input */}
      <div className="flex-1">
        <Input
          type="text"
          placeholder="What needs to be done?"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full"
          aria-label="Todo title"
          required
        />
      </div>

      {/* Due Date Picker */}
      <Popover.Root open={datePickerOpen} onOpenChange={setDatePickerOpen}>
        <Popover.Trigger asChild>
          <Button
            type="button"
            variant="outline"
            className={cn(
              'w-full justify-start text-left font-normal sm:w-[180px]',
              !dueDate && 'text-muted-foreground'
            )}
          >
            <CalendarIcon className="mr-2 size-4" />
            {dueDate ? format(dueDate, 'MMM d, yyyy') : 'Due date'}
          </Button>
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content
            className="z-50 w-auto rounded-md border bg-popover p-0 text-popover-foreground shadow-md"
            align="start"
            sideOffset={4}
          >
            <Calendar
              mode="single"
              selected={dueDate}
              onSelect={(date) => {
                setDueDate(date);
                setDatePickerOpen(false);
              }}
              initialFocus
            />
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>

      {/* Category Select */}
      <Select value={category} onValueChange={(value) => setCategory(value as Category)}>
        <SelectTrigger className="w-full sm:w-[130px]" aria-label="Category">
          <SelectValue placeholder="Category" />
        </SelectTrigger>
        <SelectContent>
          {CATEGORIES.map((cat) => (
            <SelectItem key={cat} value={cat}>
              {CATEGORY_LABELS[cat]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Priority Select */}
      <Select value={priority} onValueChange={(value) => setPriority(value as Priority)}>
        <SelectTrigger className="w-full sm:w-[110px]" aria-label="Priority">
          <SelectValue placeholder="Priority" />
        </SelectTrigger>
        <SelectContent>
          {PRIORITIES.map((p) => (
            <SelectItem key={p} value={p}>
              {PRIORITY_LABELS[p]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Submit Button */}
      <Button type="submit" disabled={!title.trim()}>
        <PlusIcon className="size-4 sm:mr-1" />
        <span className="hidden sm:inline">Add</span>
      </Button>
    </form>
  );
}

