"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAppContext } from "./app-context"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { ArrowRight, Users, Award, BookOpen, CheckCircle, XCircle, BarChart2 } from "lucide-react"
import type { StudentPerformance } from "@/lib/types"
import { questions } from "@/lib/data"

export default function TeacherDashboard() {
  const { getStudentPerformance, navigateTo } = useAppContext()
  const [students, setStudents] = useState<StudentPerformance[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")

  // Calculate statistics
  const totalStudents = students.length
  const totalQuestions = questions.length
  const totalSubmissions = students.reduce((acc, student) => acc + student.totalAttempts, 0)
  const averageSuccessRate =
    students.length > 0 ? students.reduce((acc, student) => acc + student.successRate, 0) / students.length : 0

  // Prepare data for charts
  const difficultyDistribution = [
    { name: "Easy", count: questions.filter((q) => q.difficulty === "easy").length },
    { name: "Medium", count: questions.filter((q) => q.difficulty === "medium").length },
    { name: "Hard", count: questions.filter((q) => q.difficulty === "hard").length },
  ]

  const studentPerformanceData = students.map((student) => ({
    name: student.name.split(" ")[0], // Just use first name for chart
    solved: student.solvedQuestions,
    attempts: student.totalAttempts,
    successRate: Math.round(student.successRate),
  }))

  const questionDifficultyColors = ["#10B981", "#F59E0B", "#EF4444"]

  // Question completion rate data
  const questionCompletionData = questions.map((question) => {
    const solvedCount = students.filter(
      (student) => student.solvedQuestions > 0 && Math.random() > 0.5, // Simulate which questions are solved
    ).length

    return {
      id: question.id,
      name: question.title.length > 15 ? question.title.substring(0, 15) + "..." : question.title,
      difficulty: question.difficulty,
      completionRate: Math.round((solvedCount / totalStudents) * 100) || 0,
    }
  })

  useEffect(() => {
    const loadData = async () => {
      try {
        const studentData = await getStudentPerformance()
        setStudents(studentData)
        setIsLoading(false)
      } catch (error) {
        console.error("Error loading student performance:", error)
        setIsLoading(false)
      }
    }

    loadData()
  }, [getStudentPerformance])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Teacher Dashboard</h1>
        <button
          onClick={() => navigateTo("student-performance")}
          className="flex items-center text-primary hover:text-primary/80"
        >
          View Detailed Student Performance <ArrowRight className="ml-1 h-4 w-4" />
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Total Students"
          value={totalStudents}
          icon={<Users className="h-8 w-8 text-blue-500" />}
          description="Registered students"
        />
        <StatCard
          title="Total Questions"
          value={totalQuestions}
          icon={<BookOpen className="h-8 w-8 text-green-500" />}
          description="Available coding challenges"
        />
        <StatCard
          title="Total Submissions"
          value={totalSubmissions}
          icon={<BarChart2 className="h-8 w-8 text-purple-500" />}
          description="Code submissions"
        />
        <StatCard
          title="Success Rate"
          value={`${averageSuccessRate.toFixed(1)}%`}
          icon={<Award className="h-8 w-8 text-amber-500" />}
          description="Average success rate"
        />
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab("overview")}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "overview"
                ? "border-primary text-primary"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("students")}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "students"
                ? "border-primary text-primary"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Student Performance
          </button>
          <button
            onClick={() => setActiveTab("questions")}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "questions"
                ? "border-primary text-primary"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Question Analytics
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg shadow p-6">
        {activeTab === "overview" && (
          <div className="space-y-8">
            <div>
              <h2 className="text-lg font-semibold mb-4">Question Difficulty Distribution</h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={difficultyDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="count"
                      nameKey="name"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {difficultyDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={questionDifficultyColors[index]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} questions`, "Count"]} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => {
                  const isSubmission = Math.random() > 0.5
                  const randomStudent = students[Math.floor(Math.random() * students.length)]
                  const randomQuestion = questions[Math.floor(Math.random() * questions.length)]
                  const success = Math.random() > 0.3

                  return (
                    <div key={i} className="flex items-start p-3 border-b">
                      {isSubmission ? (
                        success ? (
                          <CheckCircle className="h-5 w-5 text-green-500 mt-1 mr-3 flex-shrink-0" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500 mt-1 mr-3 flex-shrink-0" />
                        )
                      ) : (
                        <BookOpen className="h-5 w-5 text-blue-500 mt-1 mr-3 flex-shrink-0" />
                      )}
                      <div>
                        <p className="font-medium">
                          {randomStudent?.name || "Student"}{" "}
                          {isSubmission
                            ? `${success ? "successfully solved" : "attempted"} the question`
                            : "viewed the question"}
                        </p>
                        <p className="text-sm text-gray-500">
                          {randomQuestion?.title || "Question"} • {Math.floor(Math.random() * 60)} minutes ago
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {activeTab === "students" && (
          <div>
            <h2 className="text-lg font-semibold mb-4">Student Performance Comparison</h2>
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={studentPerformanceData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={60} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="solved" name="Problems Solved" fill="#4F46E5" />
                  <Bar dataKey="attempts" name="Total Attempts" fill="#9333EA" />
                  <Bar dataKey="successRate" name="Success Rate (%)" fill="#10B981" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-8">
              <h2 className="text-lg font-semibold mb-4">Student Rankings</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Rank
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Student
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Problems Solved
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Success Rate
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Last Activity
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {students
                      .sort((a, b) => b.solvedQuestions - a.solvedQuestions)
                      .map((student, index) => (
                        <tr key={student.userId}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{index + 1}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 bg-primary text-white rounded-full flex items-center justify-center">
                                {student.name.charAt(0)}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{student.name}</div>
                                <div className="text-sm text-gray-500">{student.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {student.solvedQuestions} / {questions.length}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{student.successRate.toFixed(1)}%</div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                              <div
                                className="bg-primary h-2.5 rounded-full"
                                style={{ width: `${student.successRate}%` }}
                              ></div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(Date.now() - Math.random() * 86400000 * 7).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === "questions" && (
          <div>
            <h2 className="text-lg font-semibold mb-4">Question Completion Rates</h2>
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={questionCompletionData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={60} />
                  <YAxis label={{ value: "Completion Rate (%)", angle: -90, position: "insideLeft" }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="completionRate" name="Completion Rate (%)" fill="#4F46E5">
                    {questionCompletionData.map((entry, index) => {
                      const colorIndex = entry.difficulty === "easy" ? 0 : entry.difficulty === "medium" ? 1 : 2
                      return <Cell key={`cell-${index}`} fill={questionDifficultyColors[colorIndex]} />
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-8">
              <h2 className="text-lg font-semibold mb-4">Question Details</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        ID
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Title
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Difficulty
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Completion Rate
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Avg. Attempts
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {questions.map((question) => {
                      const completionRate = Math.floor(Math.random() * 100)
                      const avgAttempts = (Math.random() * 5 + 1).toFixed(1)

                      return (
                        <tr key={question.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {question.id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{question.title}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                question.difficulty === "easy"
                                  ? "bg-green-100 text-green-800"
                                  : question.difficulty === "medium"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-red-100 text-red-800"
                              }`}
                            >
                              {question.difficulty.charAt(0).toUpperCase() + question.difficulty.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{completionRate}%</div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                              <div
                                className={`h-2.5 rounded-full ${
                                  completionRate > 70
                                    ? "bg-green-500"
                                    : completionRate > 30
                                      ? "bg-yellow-500"
                                      : "bg-red-500"
                                }`}
                                style={{ width: `${completionRate}%` }}
                              ></div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{avgAttempts} attempts</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({
  title,
  value,
  icon,
  description,
}: { title: string; value: number | string; icon: React.ReactNode; description: string }) {
  return (
    <div className="bg-white rounded-lg shadow p-6 flex items-start">
      <div className="mr-4">{icon}</div>
      <div>
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <p className="text-3xl font-bold text-primary mt-1">{value}</p>
        <p className="text-sm text-gray-500 mt-1">{description}</p>
      </div>
    </div>
  )
}

