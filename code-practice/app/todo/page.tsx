"use client"

import TodoList from "@/app/components/Todo"

export default function TodoPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text">
        Todo Manager
      </h1>
      <p className="text-center text-gray-600 mb-8 max-w-lg mx-auto">
        Keep track of your tasks and stay organized with this simple todo list manager.
      </p>
      <TodoList />
    </div>
  )
} 