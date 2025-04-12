"use client"

import { Trophy, LogOut } from "lucide-react"
import { useAppContext } from "./app-context"

export default function Navigation() {
  const {
    currentPage,
    navigateTo,
    userPoints,
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    currentUser,
    isAuthenticated,
    logout,
  } = useAppContext()

  return (
    <div className="sticky top-0 z-50 bg-white shadow">
      <div className="container mx-auto flex justify-between items-center h-[70px] px-6">
        <a
          href="#"
          className="text-2xl font-bold text-primary flex items-center"
          onClick={(e) => {
            e.preventDefault()
            navigateTo("home")
          }}
        >
          <span className="mr-2 text-secondary">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
              />
            </svg>
          </span>
          CodePractice
        </a>
        <button className="md:hidden p-2 text-gray-700" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            {isMobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
        <ul
          className={`md:flex md:items-center md:space-x-6 ${isMobileMenuOpen ? "absolute top-[70px] left-0 w-full bg-white shadow flex flex-col p-4 space-y-4" : "hidden"}`}
        >
          <li>
            <a
              className={`font-medium cursor-pointer hover:text-primary transition-colors ${currentPage === "home" ? "text-primary relative after:absolute after:left-0 after:bottom-0 after:w-full after:h-0.5 after:bg-primary" : "text-gray-700"}`}
              onClick={() => navigateTo("home")}
            >
              Home
            </a>
          </li>

          {isAuthenticated ? (
            <>
              <li>
                <a
                  className={`font-medium cursor-pointer hover:text-primary transition-colors ${currentPage === "compiler" ? "text-primary relative after:absolute after:left-0 after:bottom-0 after:w-full after:h-0.5 after:bg-primary" : "text-gray-700"}`}
                  onClick={() => navigateTo("compiler")}
                >
                  Compiler
                </a>
              </li>
              <li>
                <a
                  className={`font-medium cursor-pointer hover:text-primary transition-colors ${currentPage === "questions" ? "text-primary relative after:absolute after:left-0 after:bottom-0 after:w-full after:h-0.5 after:bg-primary" : "text-gray-700"}`}
                  onClick={() => navigateTo("questions")}
                >
                  Questions
                </a>
              </li>

              {/* Teacher-specific navigation items */}
              {currentUser?.role === "teacher" && (
                <>
                  <li>
                    <a
                      className={`font-medium cursor-pointer hover:text-primary transition-colors ${currentPage === "teacher-dashboard" ? "text-primary relative after:absolute after:left-0 after:bottom-0 after:w-full after:h-0.5 after:bg-primary" : "text-gray-700"}`}
                      onClick={() => navigateTo("teacher-dashboard")}
                    >
                      Dashboard
                    </a>
                  </li>
                  <li>
                    <a
                      className={`font-medium cursor-pointer hover:text-primary transition-colors ${currentPage === "create-question" ? "text-primary relative after:absolute after:left-0 after:bottom-0 after:w-full after:h-0.5 after:bg-primary" : "text-gray-700"}`}
                      onClick={() => navigateTo("create-question")}
                    >
                      Create Question
                    </a>
                  </li>
                  <li>
                    <a
                      className={`font-medium cursor-pointer hover:text-primary transition-colors ${currentPage === "student-performance" ? "text-primary relative after:absolute after:left-0 after:bottom-0 after:w-full after:h-0.5 after:bg-primary" : "text-gray-700"}`}
                      onClick={() => navigateTo("student-performance")}
                    >
                      Student Performance
                    </a>
                  </li>
                </>
              )}

              {/* Student-specific items */}
              {currentUser?.role === "student" && (
                <li>
                  <div className="bg-gradient-to-r from-primary to-secondary text-white px-4 py-2 rounded-lg font-semibold animate-pulse">
                    <Trophy className="inline-block mr-1 h-4 w-4" /> {userPoints} Points
                  </div>
                </li>
              )}

              {/* User menu */}
              <li className="relative ml-4">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-700">{currentUser?.name}</span>
                  <button onClick={logout} className="text-gray-500 hover:text-primary" title="Logout">
                    <LogOut className="h-4 w-4" />
                  </button>
                </div>
              </li>
            </>
          ) : (
            <li>
              <a
                className={`font-medium cursor-pointer hover:text-primary transition-colors ${currentPage === "login" ? "text-primary relative after:absolute after:left-0 after:bottom-0 after:w-full after:h-0.5 after:bg-primary" : "text-gray-700"}`}
                onClick={() => navigateTo("login")}
              >
                Login
              </a>
            </li>
          )}
        </ul>
      </div>
      <div className="h-1 bg-gradient-to-r from-primary to-secondary"></div>
    </div>
  )
}

