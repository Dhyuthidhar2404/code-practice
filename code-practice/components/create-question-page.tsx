"use client"

import type React from "react"

import { useState } from "react"
import { useAppContext } from "./app-context"
import type { Question, TestCase } from "@/lib/types"

export default function CreateQuestionPage() {
  const { createQuestion, navigateTo, showToast } = useAppContext()
  const [title, setTitle] = useState("")
  const [difficulty, setDifficulty] = useState("easy")
  const [description, setDescription] = useState("")
  const [points, setPoints] = useState(5)
  const [examples, setExamples] = useState<string[]>([""])
  const [testCases, setTestCases] = useState<Partial<TestCase>[]>([{ input: "", expectedOutput: "" }])
  const [startingCode, setStartingCode] = useState({
    javascript: "// Write your JavaScript solution here\n\n",
    python: "# Write your Python solution here\n\n",
    java: "// Write your Java solution here\n\n",
    cpp: "// Write your C++ solution here\n\n",
  })
  const [isPublic, setIsPublic] = useState(true)
  const [activeTab, setActiveTab] = useState("javascript")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleAddExample = () => {
    setExamples([...examples, ""])
  }

  const handleExampleChange = (index: number, value: string) => {
    const newExamples = [...examples]
    newExamples[index] = value
    setExamples(newExamples)
  }

  const handleRemoveExample = (index: number) => {
    const newExamples = [...examples]
    newExamples.splice(index, 1)
    setExamples(newExamples)
  }

  const handleAddTestCase = () => {
    setTestCases([...testCases, { input: "", expectedOutput: "" }])
  }

  const handleTestCaseChange = (index: number, field: keyof TestCase, value: string) => {
    const newTestCases = [...testCases]
    newTestCases[index] = { ...newTestCases[index], [field]: value }
    setTestCases(newTestCases)
  }

  const handleRemoveTestCase = (index: number) => {
    const newTestCases = [...testCases]
    newTestCases.splice(index, 1)
    setTestCases(newTestCases)
  }

  const handleStartingCodeChange = (language: string, code: string) => {
    setStartingCode({
      ...startingCode,
      [language]: code,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Validate form
      if (
        !title ||
        !description ||
        examples.some((ex) => !ex) ||
        testCases.some((tc) => !tc.input || !tc.expectedOutput)
      ) {
        throw new Error("Please fill in all required fields")
      }

      // Create question object
      const newQuestion: Omit<Question, "id"> = {
        title,
        difficulty,
        description,
        points,
        examples: examples.filter((ex) => ex.trim() !== ""),
        testCases: testCases.filter((tc) => tc.input && tc.expectedOutput) as TestCase[],
        startingCode,
        isPublic,
      }

      await createQuestion(newQuestion)
      navigateTo("questions")
    } catch (err: any) {
      showToast("Error", err.message, "error")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Create New Question</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="title" className="block text-gray-700 font-medium mb-2">
              Question Title*
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              required
            />
          </div>

          <div>
            <label htmlFor="difficulty" className="block text-gray-700 font-medium mb-2">
              Difficulty Level*
            </label>
            <select
              id="difficulty"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="description" className="block text-gray-700 font-medium mb-2">
            Problem Description*
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg h-32"
            required
          />
        </div>

        <div>
          <label htmlFor="points" className="block text-gray-700 font-medium mb-2">
            Points*
          </label>
          <input
            type="number"
            id="points"
            value={points}
            onChange={(e) => setPoints(Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            min="1"
            required
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-gray-700 font-medium">Examples*</label>
            <button type="button" onClick={handleAddExample} className="text-primary hover:text-primary/80">
              + Add Example
            </button>
          </div>
          {examples.map((example, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <textarea
                value={example}
                onChange={(e) => handleExampleChange(index, e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                placeholder={`Example ${index + 1}: Input: nums = [2,7,11,15], target = 9\nOutput: [0,1]`}
                required
              />
              {examples.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveExample(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  &times;
                </button>
              )}
            </div>
          ))}
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-gray-700 font-medium">Test Cases*</label>
            <button type="button" onClick={handleAddTestCase} className="text-primary hover:text-primary/80">
              + Add Test Case
            </button>
          </div>
          {testCases.map((testCase, index) => (
            <div
              key={index}
              className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4 p-4 border border-gray-200 rounded-lg"
            >
              <div>
                <label className="block text-gray-700 text-sm mb-1">Input</label>
                <textarea
                  value={testCase.input}
                  onChange={(e) => handleTestCaseChange(index, "input", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="nums = [2,7,11,15], target = 9"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm mb-1">Expected Output</label>
                <textarea
                  value={testCase.expectedOutput}
                  onChange={(e) => handleTestCaseChange(index, "expectedOutput", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="[0,1]"
                  required
                />
              </div>
              {testCases.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveTestCase(index)}
                  className="text-red-500 hover:text-red-700 md:col-span-2 w-fit"
                >
                  Remove Test Case
                </button>
              )}
            </div>
          ))}
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-2">Starting Code</label>
          <div className="border border-gray-300 rounded-lg overflow-hidden">
            <div className="flex border-b">
              {Object.keys(startingCode).map((lang) => (
                <button
                  key={lang}
                  type="button"
                  className={`px-4 py-2 ${activeTab === lang ? "bg-gray-100 font-medium" : ""}`}
                  onClick={() => setActiveTab(lang)}
                >
                  {lang.charAt(0).toUpperCase() + lang.slice(1)}
                </button>
              ))}
            </div>
            <textarea
              value={startingCode[activeTab as keyof typeof startingCode]}
              onChange={(e) => handleStartingCodeChange(activeTab, e.target.value)}
              className="w-full px-3 py-2 h-64 font-mono"
            />
          </div>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="isPublic"
            checked={isPublic}
            onChange={(e) => setIsPublic(e.target.checked)}
            className="mr-2"
          />
          <label htmlFor="isPublic" className="text-gray-700">
            Make this question public to all students
          </label>
        </div>

        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => navigateTo("questions")}
            className="px-6 py-2 border border-gray-300 rounded-lg"
          >
            Cancel
          </button>
          <button
            type="submit"
            className={`px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 ${
              isSubmitting ? "opacity-70 cursor-not-allowed" : ""
            }`}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating..." : "Create Question"}
          </button>
        </div>
      </form>
    </div>
  )
}

