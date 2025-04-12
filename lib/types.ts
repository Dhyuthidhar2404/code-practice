// lib/types.ts - Update your types file with these definitions

export type UserRole = 'student' | 'teacher' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: string;
}

export interface Submission {
  id: string;
  userId: string;
  questionId: string;  // Changed from number to string
  code: string;
  language: string;
  passed: boolean;
  submittedAt: string;
}

export interface Question {
  id: string;  // Changed from number to string
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
  tags?: string[];
  examples?: string[];
  testCases?: TestCase[];
  solution?: string;
}

export interface TestCase {
  input: string;
  expectedOutput: string;
}

export interface StudentPerformance {
  userId: string;
  name: string;
  email: string;
  solvedQuestions: number;
  totalAttempts: number;
  successRate: number;
}