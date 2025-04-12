"use client"

import { useState, useEffect } from "react"
import { useAppContext } from "./app-context"
import CodeEditor from "./code-editor"
import { AlignLeft, Save, FolderOpen, CheckCircle, ArrowLeft } from "lucide-react"
import { useParams } from "next/navigation"

export default function QuestionDetailPage() {
  const {
    currentQuestion,
    setCurrentQuestion,
    navigateTo,
    submitSolution,
    formatCode,
    showModal,
    selectedLanguage,
    solutionEditorContent,
    setSolutionEditorContent,
  } = useAppContext()

  const [testResults, setTestResults] = useState<any[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true) // Start with loading state
  const [error, setError] = useState<string | null>(null)
  const [questionData, setQuestionData] = useState<any>(null) // Local state for question
  
  // Get the question ID from the URL
  const params = useParams()
  const questionId = Array.isArray(params?.id) ? params.id[0] : params?.id

  // Always fetch directly from API
  useEffect(() => {
    if (!questionId) return;
    
    const fetchQuestionDirectly = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        console.log('Directly fetching question data for ID:', questionId);
        
        const response = await fetch(`http://localhost:5000/api/problems/${questionId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          console.error(`Failed API response: ${response.status}`);
          throw new Error(`Failed to fetch question: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('API Response:', data);
        
        if (!data || !data.id) {
          throw new Error('Invalid question data received');
        }
        
        // Set both local and context state
        setQuestionData(data);
        setCurrentQuestion(data);
        
        // Save to localStorage for backup
        localStorage.setItem('currentQuestion', JSON.stringify(data));
        
        console.log('Successfully loaded question:', data.title);
      } catch (err) {
        console.error('Error loading question:', err);
        setError('Failed to load question data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchQuestionDirectly();
  }, [questionId, setCurrentQuestion]);

  // Show loading state
  if (isLoading) {
    return (
      <section id="question-detail">
        <div className="text-center my-12">
          <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold">Loading question...</h2>
        </div>
      </section>
    )
  }

  // Show error state
  if (error) {
    return (
      <section id="question-detail">
        <div className="text-center my-12">
          <h2 className="text-2xl font-bold mb-4 text-red-500">Error</h2>
          <p className="mb-4">{error}</p>
          <button
            className="bg-white text-primary px-4 py-2 rounded-lg border border-primary hover:bg-gray-50 transition-colors flex items-center gap-2 mx-auto"
            onClick={() => navigateTo("questions")}
          >
            <ArrowLeft className="h-4 w-4" /> Back to Questions
          </button>
        </div>
      </section>
    )
  }

  // Prefer local question data over context
  const displayQuestion = questionData || currentQuestion;

  // No question selected
  if (!displayQuestion) {
    return (
      <section id="question-detail">
        <div className="text-center my-12">
          <h2 className="text-2xl font-bold mb-4">No question selected</h2>
          <button
            className="bg-white text-primary px-4 py-2 rounded-lg border border-primary hover:bg-gray-50 transition-colors flex items-center gap-2 mx-auto"
            onClick={() => navigateTo("questions")}
          >
            <ArrowLeft className="h-4 w-4" /> Back to Questions
          </button>
        </div>
      </section>
    )
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      const results = await submitSolution()
      setTestResults(results || [])
    } catch (err) {
      console.error("Error submitting solution:", err)
      // You could add an error toast here
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleFormatCode = () => {
    setSolutionEditorContent(formatCode(solutionEditorContent))
  }

  return (
    <section id="question-detail">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg p-6 shadow">
          <div>
            <span
              className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-2 ${
                displayQuestion.difficulty === "easy"
                  ? "bg-green-100 text-green-500"
                  : displayQuestion.difficulty === "medium"
                    ? "bg-amber-100 text-amber-500"
                    : "bg-red-100 text-red-500"
              }`}
            >
              {displayQuestion.difficulty.charAt(0).toUpperCase() + displayQuestion.difficulty.slice(1)}
            </span>
            <h2 className="text-2xl font-bold mb-2">{displayQuestion.title}</h2>
          </div>
          <p className="text-gray-600 mb-4">{displayQuestion.description}</p>
          <h3 className="text-lg font-semibold mb-2">Examples:</h3>
          {displayQuestion.examples?.map((example: string, index: number) => (
            <div key={index} className="bg-gray-100 rounded-lg p-4 font-mono text-sm mb-2">
              {example}
            </div>
          ))}
          <div className="flex items-center gap-1 text-gray-600 font-medium mt-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
              />
            </svg>
            {displayQuestion.points} points for correct solution
          </div>
        </div>
        <div className="flex flex-col gap-4 h-full">
          <div className="bg-[#1E1E1E] rounded-lg overflow-hidden shadow h-[300px]">
            <CodeEditor
              value={solutionEditorContent}
              onChange={setSolutionEditorContent}
              language={selectedLanguage}
              runCode={handleSubmit}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              id="submit-solution"
              className={`bg-primary text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary/90 transition-colors flex-1 justify-center ${
                isSubmitting ? "opacity-70 pointer-events-none animate-pulse" : ""
              }`}
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Checking...
                </>
              ) : (
                <>
                  <CheckCircle className="h-5 w-5" /> Submit Solution
                </>
              )}
            </button>
            <button
              className="border border-gray-300 bg-white px-4 py-2 rounded-lg flex items-center gap-2"
              onClick={handleFormatCode}
            >
              <AlignLeft className="h-5 w-5" /> Format
            </button>
            <button
              className="border border-gray-300 bg-white px-4 py-2 rounded-lg flex items-center gap-2"
              onClick={() => showModal("snippets", { mode: "save" })}
            >
              <Save className="h-5 w-5" /> Save
            </button>
            <button
              className="border border-gray-300 bg-white px-4 py-2 rounded-lg flex items-center gap-2"
              onClick={() => showModal("snippets", { mode: "load" })}
            >
              <FolderOpen className="h-5 w-5" /> Load
            </button>
          </div>
          {testResults.length > 0 && (
            <div className="mt-4">
              <h3 className="text-lg font-semibold mb-2">Test Results:</h3>
              {testResults.map((test, index) => (
                <div key={index} className={`p-4 rounded-lg mb-2 ${test.passed ? "bg-green-100" : "bg-red-100"}`}>
                  <strong>Test Case {index + 1}:</strong>
                  <div>{test.input}</div>
                  <div>Expected: {test.expectedOutput}</div>
                  {test.actualOutput && <div>Your output: {test.actualOutput}</div>}
                  <div className={`font-medium mt-2 ${test.passed ? "text-green-500" : "text-red-500"}`}>
                    {test.passed ? "✓ Passed" : "✗ Failed"}
                  </div>
                </div>
              ))}
            </div>
          )}
          <button
            id="back-to-questions"
            className="bg-white text-primary px-4 py-2 rounded-lg border border-primary hover:bg-gray-50 transition-colors flex items-center gap-2 mt-auto w-fit"
            onClick={() => navigateTo("questions")}
          >
            <ArrowLeft className="h-4 w-4" /> Back to Questions
          </button>
        </div>
      </div>
    </section>
  )
}