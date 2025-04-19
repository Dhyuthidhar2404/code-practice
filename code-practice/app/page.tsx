"use client"

import { useState, useEffect } from "react"
import Navigation from "@/components/navigation"
import HomePage from "@/components/home-page"
import CompilerPage from "@/components/compiler-page"
import QuestionsPage from "@/components/questions-page"
import QuestionDetailPage from "@/components/question-detail-page"
import Footer from "@/components/footer"
import ToastContainer from "@/components/toast-container"
import Modal from "@/components/modal"
import { AppProvider, useAppContext } from "@/components/app-context"
import LoginPage from "@/components/login-page"
import CreateQuestionPage from "@/components/create-question-page"
import StudentPerformancePage from "@/components/student-performance-page"
import TeacherDashboard from "@/components/teacher-dashboard"
import dynamic from "next/dynamic"

export default function CodePractice() {
  return (
    <AppProvider>
      <div className="flex flex-col min-h-screen bg-[#F9FAFB]">
        <Navigation />
        <main className="flex-1 container mx-auto px-4 py-8">
          <MainContent />
        </main>
        <Footer />
        <ToastContainer />
        <Modal />
      </div>
    </AppProvider>
  )
}

function MainContent() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return <ActivePage />
}

// Update the ActivePage component to include the new pages
function ActivePage() {
  const { currentPage, isAuthenticated } = useAppContext()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  // Redirect to login if not authenticated (except for home page)
  if (!isAuthenticated && currentPage !== "home" && currentPage !== "login" && currentPage !== "todo") {
    return <LoginPage />
  }

  switch (currentPage) {
    case "home":
      return <HomePage />
    case "compiler":
      return <CompilerPage />
    case "questions":
      return <QuestionsPage />
    case "question-detail":
      return <QuestionDetailPage />
    case "login":
      return <LoginPage />
    case "create-question":
      return <CreateQuestionPage />
    case "student-performance":
      return <StudentPerformancePage />
    case "teacher-dashboard":
      return <TeacherDashboard />
    case "todo":
      const TodoPage = dynamic(() => import('@/app/todo/page'), { ssr: false })
      return <TodoPage />
    default:
      return <HomePage />
  }
}

