"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAppContext } from "./app-context"
import { ArrowLeft, Clock, CheckCircle, XCircle, Award, BookOpen } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import type { Submission } from "@/lib/types"
import { questions } from "@/lib/data"

export default function StudentReport({ studentId, onBack }: { studentId: string; onBack: () => void }) {
  const { getSubmissions } = useAppContext()
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [student, setStudent] = useState<any>(null)

  // Generate some mock data for the student's progress over time
  const generateProgressData = () => {
    const data = []
    const today = new Date()

    for (let i = 30; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)

      // Cumulative solved questions (increasing over time)
      const solved = Math.min(Math.floor(Math.random() * 3) + (30 - i) / 5, questions.length)

      data.push({
        date: date.toISOString().split("T")[0],
        solved: Math.floor(solved),
        attempts: Math.floor(solved) + Math.floor(Math.random() * 5),
      })
    }

    return data
  }

  const progressData = generateProgressData()

  // Calculate statistics
  const totalSubmissions = submissions.length
  const successfulSubmissions = submissions.filter((s) => s.passed).length
  const successRate = totalSubmissions > 0 ? (successfulSubmissions / totalSubmissions) * 100 : 0

  // Get solved questions
  const solvedQuestionIds = [...new Set(submissions.filter((s) => s.passed).map((s) => s.questionId))]
  const solvedQuestions = questions.filter((q) => solvedQuestionIds.includes(q.id))

  // Calculate points
  const totalPoints = solvedQuestions.reduce((total, q) => total + q.points, 0)

  // Get most recent submissions
  const recentSubmissions = [...submissions]
    .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
    .slice(0, 5)

  useEffect(() => {
    const loadData = async () => {
      try {
        const submissionData = await getSubmissions(undefined, studentId)
        setSubmissions(submissionData)

        // Mock student data
        setStudent({
          id: studentId,
          name: "Demo Student",
          email: "student@example.com",
          joinedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
        })

        setIsLoading(false)
      } catch (error) {
        console.error("Error loading student data:", error)
        setIsLoading(false)
      }
    }

    loadData()
  }, [getSubmissions, studentId])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center mb-6">
        <button onClick={onBack} className="mr-4 p-2 rounded-full hover:bg-gray-100">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-2xl font-bold">Student Report</h1>
      </div>

      {/* Student Profile */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center">
          <div className="h-20 w-20 bg-primary text-white rounded-full flex items-center justify-center text-3xl font-bold">
            {student?.name.charAt(0)}
          </div>
          <div className="ml-6">
            <h2 className="text-2xl font-bold">{student?.name}</h2>
            <p className="text-gray-600">{student?.email}</p>
            <p className="text-sm text-gray-500 mt-1">Joined on {new Date(student?.joinedAt).toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Solved Problems"
          value={solvedQuestionIds.length}
          icon={<CheckCircle className="h-8 w-8 text-green-500" />}
          description={`${Math.round((solvedQuestionIds.length / questions.length) * 100)}% completion`}
        />
        <StatCard
          title="Total Submissions"
          value={totalSubmissions}
          icon={<Clock className="h-8 w-8 text-blue-500" />}
          description={`${successfulSubmissions} successful`}
        />
        <StatCard
          title="Success Rate"
          value={`${successRate.toFixed(1)}%`}
          icon={<Award className="h-8 w-8 text-amber-500" />}
          description="Successful submissions"
        />
        <StatCard
          title="Total Points"
          value={totalPoints}
          icon={<BookOpen className="h-8 w-8 text-purple-500" />}
          description="Points earned"
        />
      </div>

      {/* Progress Chart */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Progress Over Time</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={progressData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="solved" name="Problems Solved" stroke="#4F46E5" activeDot={{ r: 8 }} />
              <Line type="monotone" dataKey="attempts" name="Total Attempts" stroke="#9333EA" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Submissions */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Recent Submissions</h2>
        <div className="space-y-4">
          {recentSubmissions.length > 0 ? (
            recentSubmissions.map((submission) => {
              const question = questions.find((q) => q.id === submission.questionId)
              return (
                <div key={submission.id} className="flex border-b pb-4">
                  {submission.passed ? (
                    <CheckCircle className="h-5 w-5 text-green-500 mt-1 mr-3 flex-shrink-0" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500 mt-1 mr-3 flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <h3 className="font-medium">{question?.title || `Question #${submission.questionId}`}</h3>
                      <span className="text-sm text-gray-500">{new Date(submission.submittedAt).toLocaleString()}</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      Language: <span className="font-medium">{submission.language}</span>
                    </p>
                    <div className="bg-gray-100 p-3 rounded font-mono text-sm mt-2 overflow-x-auto max-h-32">
                      {submission.code}
                    </div>
                  </div>
                </div>
              )
            })
          ) : (
            <p className="text-gray-500 text-center py-4">No submissions yet</p>
          )}
        </div>
      </div>

      {/* Solved Problems */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Solved Problems</h2>
        {solvedQuestions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {solvedQuestions.map((question) => (
              <div key={question.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <h3 className="font-medium">{question.title}</h3>
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
                </div>
                <p className="text-sm text-gray-600 mt-1">{question.points} points</p>
                <p className="text-sm text-gray-500 mt-2 line-clamp-2">{question.description}</p>
                <div className="mt-3 text-xs text-green-600">
                  Solved on {new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">No problems solved yet</p>
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

