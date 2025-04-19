"use client"

import { useState, useEffect } from "react"
import { useAppContext } from "./app-context"
import type { StudentPerformance, Submission } from "@/lib/types"
import { questions } from "@/lib/data"
import { BarChart2, ArrowLeft } from "lucide-react"
import StudentReport from "./student-report"

export default function StudentPerformancePage() {
  const { getStudentPerformance, getSubmissions, navigateTo } = useAppContext()
  const [students, setStudents] = useState<StudentPerformance[]>([])
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null)
  const [selectedQuestion, setSelectedQuestion] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [viewMode, setViewMode] = useState<"list" | "report">("list")

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

  const handleViewSubmissions = async (studentId: string, questionId?: number) => {
    setSelectedStudent(studentId)
    setSelectedQuestion(questionId || null)

    try {
      const submissionData = await getSubmissions(questionId, studentId)
      setSubmissions(submissionData)
    } catch (error) {
      console.error("Error loading submissions:", error)
    }
  }

  const handleViewReport = (studentId: string) => {
    setSelectedStudent(studentId)
    setViewMode("report")
  }

  const handleBackToList = () => {
    setViewMode("list")
    setSelectedStudent(null)
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (viewMode === "report" && selectedStudent) {
    return <StudentReport studentId={selectedStudent} onBack={handleBackToList} />
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Student Performance</h1>
        <button
          onClick={() => navigateTo("teacher-dashboard")}
          className="flex items-center text-primary hover:text-primary/80"
        >
          <BarChart2 className="mr-1 h-4 w-4" /> View Dashboard
        </button>
      </div>

      {students.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No student data available yet.</div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
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
                    Solved Questions
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Total Attempts
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
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {students.map((student) => (
                  <tr key={student.userId}>
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
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{student.solvedQuestions}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{student.totalAttempts}</div>
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
                      <div className="flex space-x-3">
                        <button
                          onClick={() => handleViewSubmissions(student.userId)}
                          className="text-primary hover:text-primary/80"
                        >
                          View Submissions
                        </button>
                        <button
                          onClick={() => handleViewReport(student.userId)}
                          className="text-primary hover:text-primary/80"
                        >
                          Detailed Report
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {selectedStudent && submissions.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center mb-4">
                <button onClick={() => setSelectedStudent(null)} className="mr-2 p-1 rounded-full hover:bg-gray-100">
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <h2 className="text-xl font-semibold">
                  {selectedQuestion
                    ? `Submissions for ${questions.find((q) => q.id === selectedQuestion)?.title || `Question #${selectedQuestion}`}`
                    : "All Submissions"}
                </h2>
              </div>
              <div className="space-y-4">
                {submissions.map((submission) => {
                  const question = questions ? questions.find((q) => q.id === submission.questionId) : null
                  return (
                    <div key={submission.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between mb-2">
                        <h3 className="font-medium">{question?.title || `Question #${submission.questionId}`}</h3>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            submission.passed ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                          }`}
                        >
                          {submission.passed ? "Passed" : "Failed"}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500 mb-2">
                        Submitted: {new Date(submission.submittedAt).toLocaleString()}
                      </div>
                      <div className="bg-gray-100 p-3 rounded font-mono text-sm overflow-x-auto">{submission.code}</div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

