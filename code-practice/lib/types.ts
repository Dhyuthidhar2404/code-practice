export type UserRole = "student" | "teacher"

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  createdAt: string
}

export interface Submission {
  id: string
  userId: string
  questionId: number
  code: string
  language: string
  passed: boolean
  submittedAt: string
}

export interface StudentPerformance {
  userId: string
  name: string
  email: string
  solvedQuestions: number
  totalAttempts: number
  successRate: number
}

export interface Question {
  id: number
  title: string
  difficulty: string
  description: string
  points: number
  examples: string[]
  testCases: TestCase[]
  startingCode: Record<string, string>
  createdBy?: string
  isPublic?: boolean
}

export interface TestCase {
  input: string
  expectedOutput: string
}

