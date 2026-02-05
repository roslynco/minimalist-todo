import { AddTodoForm } from '@/components/AddTodoForm';
import { TodoList } from '@/components/TodoList';

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            To-Do
          </h1>
          <p className="mt-2 text-muted-foreground">
            Stay organized. Get things done.
          </p>
        </header>

        {/* Add Todo Form */}
        <section className="mb-8">
          <AddTodoForm />
        </section>

        {/* Todo List with Filters */}
        <section>
          <TodoList />
        </section>
      </main>
    </div>
  );
}
