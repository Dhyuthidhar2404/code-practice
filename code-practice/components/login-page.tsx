"use client"

import type React from "react"

import { useState } from "react"
import { useAppContext } from "./app-context"

export default function LoginPage() {
  const { login, register, navigateTo } = useAppContext()
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [role, setRole] = useState<"student" | "teacher">("student")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      if (isLogin) {
        await login(email, password)
      } else {
        await register(email, password, name, role)
      }
    } catch (err: any) {
      setError(err.message || "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold">{isLogin ? "Login to CodePractice" : "Create an Account"}</h1>
          <p className="text-gray-600 mt-2">
            {isLogin ? "Enter your credentials to access your account" : "Join our coding practice platform"}
          </p>
        </div>

        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="mb-4">
              <label htmlFor="name" className="block text-gray-700 font-medium mb-2">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
          )}

          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700 font-medium mb-2">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          <div className="mb-6">
            <label htmlFor="password" className="block text-gray-700 font-medium mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          {!isLogin && (
            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-2">Account Type</label>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="role"
                    value="student"
                    checked={role === "student"}
                    onChange={() => setRole("student")}
                    className="mr-2"
                  />
                  Student
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="role"
                    value="teacher"
                    checked={role === "teacher"}
                    onChange={() => setRole("teacher")}
                    className="mr-2"
                  />
                  Teacher
                </label>
              </div>
            </div>
          )}

          <button
            type="submit"
            className={`w-full bg-primary text-white py-2 rounded-lg hover:bg-primary/90 transition-colors ${
              isLoading ? "opacity-70 cursor-not-allowed" : ""
            }`}
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin h-5 w-5 mr-2"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Processing...
              </span>
            ) : isLogin ? (
              "Login"
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button onClick={() => setIsLogin(!isLogin)} className="text-primary hover:underline">
            {isLogin ? "Need an account? Sign up" : "Already have an account? Login"}
          </button>
        </div>

        {isLogin && (
          <div className="mt-6 border-t pt-4">
            <p className="text-gray-600 mb-2 text-center text-sm">Quick login with demo accounts:</p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={async () => {
                  setEmail("student@example.com");
                  setPassword("student@123");
                  setIsLoading(true);
                  try {
                    await login("student@example.com", "student@123");
                  } catch (err: any) {
                    setError(err.message || "An error occurred");
                  } finally {
                    setIsLoading(false);
                  }
                }}
                className="bg-blue-500 text-white px-3 py-2 rounded text-sm hover:bg-blue-600"
              >
                Student
              </button>
              <button
                type="button"
                onClick={async () => {
                  setEmail("teacher@example.com");
                  setPassword("teacher@123");
                  setIsLoading(true);
                  try {
                    await login("teacher@example.com", "teacher@123");
                  } catch (err: any) {
                    setError(err.message || "An error occurred");
                  } finally {
                    setIsLoading(false);
                  }
                }}
                className="bg-green-500 text-white px-3 py-2 rounded text-sm hover:bg-green-600"
              >
                Teacher
              </button>
              <button
                type="button"
                onClick={async () => {
                  setEmail("test@example.com");
                  setPassword("password");
                  setIsLoading(true);
                  try {
                    await login("test@example.com", "password");
                  } catch (err: any) {
                    setError(err.message || "An error occurred");
                  } finally {
                    setIsLoading(false);
                  }
                }}
                className="bg-purple-500 text-white px-3 py-2 rounded text-sm hover:bg-purple-600"
              >
                Test User
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

