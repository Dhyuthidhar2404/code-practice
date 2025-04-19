"use client"

import { useState } from "react"
import { Check, Trash2 } from "lucide-react"

interface Todo {
  id: string
  text: string
  completed: boolean
}

export default function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [newTodo, setNewTodo] = useState("")

  const addTodo = () => {
    if (newTodo.trim() === "") return
    
    const todo: Todo = {
      id: crypto.randomUUID(),
      text: newTodo,
      completed: false
    }
    
    setTodos([...todos, todo])
    setNewTodo("")
  }

  const toggleTodo = (id: string) => {
    setTodos(
      todos.map(todo =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    )
  }

  const deleteTodo = (id: string) => {
    setTodos(todos.filter(todo => todo.id !== id))
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4">Todo List</h2>
      
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addTodo()}
          placeholder="Add a new task..."
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <button
          onClick={addTodo}
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
        >
          Add
        </button>
      </div>
      
      <ul className="space-y-2">
        {todos.map(todo => (
          <li
            key={todo.id}
            className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-md"
          >
            <div className="flex items-center gap-2">
              <button
                onClick={() => toggleTodo(todo.id)}
                className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                  todo.completed ? "bg-primary border-primary" : "border-gray-400"
                }`}
              >
                {todo.completed && <Check className="w-3 h-3 text-white" />}
              </button>
              <span className={todo.completed ? "line-through text-gray-500" : ""}>
                {todo.text}
              </span>
            </div>
            <button
              onClick={() => deleteTodo(todo.id)}
              className="text-gray-500 hover:text-red-500"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </li>
        ))}
      </ul>
      
      {todos.length > 0 && (
        <div className="mt-4 text-sm text-gray-500">
          {todos.filter(todo => todo.completed).length} of {todos.length} tasks completed
        </div>
      )}
    </div>
  )
} 