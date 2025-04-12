"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { codeTemplates, questions } from "@/lib/data"
import api from "@/lib/api" // Assuming you're using your axios instance

// Add the imports for the new types
import type { User, UserRole, Submission, StudentPerformance, Question, TestCase } from "@/lib/types"

// Add user state and authentication methods to the context type
type AppContextType = {
  // Existing properties...
  currentPage: string
  userPoints: number
  solvedQuestions: string[]  // Changed from number[] to string[]
  selectedLanguage: string
  currentQuestion: Question | null
  setCurrentQuestion: (question: Question | null) => void  // Added setCurrentQuestion
  isMobileMenuOpen: boolean
  snippets: any[]
  toasts: any[]
  activeModal: string | null
  modalData: any
  mainEditorContent: string
  solutionEditorContent: string
  navigateTo: (page: string) => void
  setIsMobileMenuOpen: (isOpen: boolean) => void
  showToast: (title: string, message: string, type?: string) => void
  removeToast: (id: number) => void
  showModal: (modalType: string, data?: any) => void
  hideModal: () => void
  updatePoints: (newPoints: number) => void
  createConfetti: () => void
  formatCode: (code: string) => string
  runCode: () => void
  submitSolution: () => Promise<any[]>
  saveSnippet: (name: string, description: string) => boolean
  deleteSnippet: (id: number) => void
  loadSnippet: (snippet: any) => void
  openQuestion: (questionId: string) => void  // Changed from number to string
  setSelectedLanguage: (language: string) => void
  setMainEditorContent: (content: string) => void
  setSolutionEditorContent: (content: string) => void

  // User authentication
  currentUser: User | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name: string, role: UserRole) => Promise<void>
  logout: () => void

  // Teacher specific functions
  createQuestion: (question: Omit<Question, "id">) => Promise<void>
  getStudentPerformance: () => Promise<StudentPerformance[]>
  getSubmissions: (questionId?: string, userId?: string) => Promise<Submission[]>  // Changed questionId from number to string

  // New properties
  questions: Question[]
  setQuestions: React.Dispatch<React.SetStateAction<Question[]>>
}

const AppContext = createContext<AppContextType | undefined>(undefined)

// Storage Utilities
const Storage = {
  isAvailable: () => {
    try {
      const test = "test"
      localStorage.setItem(test, test)
      localStorage.removeItem(test)
      return true
    } catch (e) {
      return false
    }
  },
  getData: (key: string, defaultValue: any) => {
    try {
      if (Storage.isAvailable()) {
        const data = localStorage.getItem(key)
        return data ? JSON.parse(data) : defaultValue
      }
      return defaultValue
    } catch (e) {
      console.error(`Error getting ${key} from storage:`, e)
      return defaultValue
    }
  },
  saveData: (key: string, data: any) => {
    try {
      if (Storage.isAvailable()) {
        localStorage.setItem(key, JSON.stringify(data))
        return true
      }
      return false
    } catch (e) {
      console.error(`Error saving ${key} to storage:`, e)
      return false
    }
  },
}

export function AppProvider({ children }: { children: ReactNode }) {
  // App State
  const [currentPage, setCurrentPage] = useState("home")
  const [userPoints, setUserPoints] = useState(0)
  const [solvedQuestions, setSolvedQuestions] = useState<string[]>([])  // Changed from number[] to string[]
  const [selectedLanguage, setSelectedLanguage] = useState("javascript")
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [snippets, setSnippets] = useState<any[]>([])
  const [toasts, setToasts] = useState<any[]>([])

  // Editor Content State
  const [mainEditorContent, setMainEditorContent] = useState(codeTemplates.javascript)
  const [solutionEditorContent, setSolutionEditorContent] = useState("")

  // Modals
  const [activeModal, setActiveModal] = useState<string | null>(null)
  const [modalData, setModalData] = useState<any>({})

  // Add user state to the AppProvider
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // New state for questions
  const [questions, setQuestions] = useState<Question[]>([])

  useEffect(() => {
    const loadUserFromStorage = async () => {
      const savedUser = Storage.getData("currentUser", null);
      const token = localStorage.getItem('token');
      
      if (savedUser && token) {
        try {
          // Verify the token is still valid
          const response = await fetch('http://localhost:5000/api/auth/profile', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (response.ok) {
            setCurrentUser(savedUser);
            setIsAuthenticated(true);
            
            // If student, load their data
            if (savedUser.role === "student") {
              // You can add the code to fetch submissions and points here
            }
          } else {
            // Token expired or invalid
            logout();
          }
        } catch (error) {
          console.error("Error validating authentication:", error);
          logout();
        }
      }
    };
    
    loadUserFromStorage();
  }, []);

  // Load user data from storage on initial render
  useEffect(() => {
    const userData = Storage.getData("codePracticeUserData", { points: 0, solvedQuestions: [] })
    setUserPoints(userData.points)
    setSolvedQuestions(userData.solvedQuestions)
    const savedSnippets = Storage.getData("codeSnippets", [])
    setSnippets(savedSnippets)

    // Load user authentication data
    const savedUser = Storage.getData("currentUser", null)
    if (savedUser) {
      setCurrentUser(savedUser)
      setIsAuthenticated(true)
    }
  }, [])

  // Save user data when points or solved questions change
  useEffect(() => {
    Storage.saveData("codePracticeUserData", { points: userPoints, solvedQuestions })
  }, [userPoints, solvedQuestions])

  // Save snippets when they change
  useEffect(() => {
    Storage.saveData("codeSnippets", snippets)
  }, [snippets])

  // Mock users for demo purposes
  const mockUsers: User[] = [
    {
      id: "1",
      email: "student@example.com",
      name: "Demo Student",
      role: "student",
      createdAt: new Date().toISOString(),
    },
    {
      id: "2",
      email: "teacher@example.com",
      name: "Demo Teacher",
      role: "teacher",
      createdAt: new Date().toISOString(),
    },
  ]

  // Mock submissions for demo purposes
  const mockSubmissions: Submission[] = [
    {
      id: "1",
      userId: "1",
      questionId: "1",  // Changed from number to string
      code: "function twoSum(nums, target) { return [0, 1]; }",
      language: "javascript",
      passed: true,
      submittedAt: new Date().toISOString(),
    },
    {
      id: "2",
      userId: "1",
      questionId: "2",  // Changed from number to string
      code: "function isPalindrome(x) { return x.toString() === x.toString().split('').reverse().join(''); }",
      language: "javascript",
      passed: true,
      submittedAt: new Date().toISOString(),
    },
  ]

  // Authentication methods
  const login = async (email: string, password: string) => {
    try {
      // Make the API call to authenticate
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Invalid email or password");
      }

      const userData = await response.json();
      
      // Store the JWT token in localStorage for subsequent API calls
      localStorage.setItem('token', userData.token);
      
      setCurrentUser(userData);
      setIsAuthenticated(true);
      Storage.saveData("currentUser", userData);

      // If the user is a student, fetch their solved questions and points
      if (userData.role === "student") {
        try {
          const submissionsResponse = await fetch('http://localhost:5000/api/submissions/user', {
            headers: {
              'Authorization': `Bearer ${userData.token}`
            }
          });
          
          if (submissionsResponse.ok) {
            const submissions = await submissionsResponse.json();
            const solvedSubmissions = submissions.filter((s: any) => s.status === 'Accepted');
            // Explicitly convert to string[] to ensure type safety
            const solvedQuestionIds = [...new Set(solvedSubmissions.map((s: any) => String(s.problemId)))] as string[];
            setSolvedQuestions(solvedQuestionIds);
            
            // Calculate points based on problems solved
            // You'll need to fetch problem details to get points
            const problemsResponse = await fetch('http://localhost:5000/api/problems', {
              headers: {
                'Authorization': `Bearer ${userData.token}`
              }
            });
            
            if (problemsResponse.ok) {
              const problems = await problemsResponse.json();
              const points = solvedQuestionIds.reduce((total: number, qId: string) => {
                const problem = problems.find((p: any) => p.id === qId);
                return total + (problem?.points || 0);
              }, 0);
              
              setUserPoints(points);
            }
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }

      navigateTo("home");
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  }

  const register = async (email: string, password: string, name: string, role: UserRole) => {
    try {
      // Make the API call to register
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email, 
          password, 
          name, 
          role 
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Registration failed");
      }

      const userData = await response.json();
      
      // Store the JWT token in localStorage for subsequent API calls
      localStorage.setItem('token', userData.token);
      
      setCurrentUser(userData);
      setIsAuthenticated(true);
      Storage.saveData("currentUser", userData);

      navigateTo("home");
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  }

  const logout = () => {
    // Clear the JWT token from localStorage
    localStorage.removeItem('token');
    
    setCurrentUser(null);
    setIsAuthenticated(false);
    Storage.saveData("currentUser", null);
    
    // Reset user data
    setSolvedQuestions([]);
    setUserPoints(0);
    
    navigateTo("login");
  }

  // Teacher specific methods
  const createQuestion = async (question: Omit<Question, "id">) => {
    if (!currentUser || currentUser.role !== "teacher") {
      throw new Error("Unauthorized")
    }
  
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error("Not authenticated")
      }
  
      const response = await fetch('http://localhost:5000/api/problems', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(question)
      })
  
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to create question")
      }
  
      const newQuestion = await response.json()
      showToast("Question Created", "Your question has been created successfully", "success")
      
      // Navigate to the questions page to see the newly created question
      navigateTo("questions")
      
      if (newQuestion) {
        setQuestions(prev => [...prev, newQuestion as Question]);
      }
      
      return newQuestion
    } catch (error) {
      console.error("Error creating question:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to create question";
      showToast("Error", errorMessage, "error")
      throw error
    }
  }

  const getStudentPerformance = async (): Promise<StudentPerformance[]> => {
    // In a real app, this would make an API call to get student performance
    if (!currentUser || currentUser.role !== "teacher") {
      throw new Error("Unauthorized")
    }

    // Get all students
    const students = mockUsers.filter((u) => u.role === "student")

    // Calculate performance for each student
    return students.map((student) => {
      const studentSubmissions = mockSubmissions.filter((s) => s.userId === student.id)
      const totalAttempts = studentSubmissions.length
      const passedSubmissions = studentSubmissions.filter((s) => s.passed)
      const solvedQuestionIds = [...new Set(passedSubmissions.map((s) => s.questionId))]

      return {
        userId: student.id,
        name: student.name,
        email: student.email,
        solvedQuestions: solvedQuestionIds.length,
        totalAttempts,
        successRate: totalAttempts > 0 ? (passedSubmissions.length / totalAttempts) * 100 : 0,
      }
    })
  }

  const getSubmissions = async (questionId?: string, userId?: string): Promise<Submission[]> => {
    // In a real app, this would make an API call to get submissions
    if (!currentUser || currentUser.role !== "teacher") {
      throw new Error("Unauthorized")
    }

    let filteredSubmissions = [...mockSubmissions]

    if (questionId) {
      filteredSubmissions = filteredSubmissions.filter((s) => s.questionId === questionId)
    }

    if (userId) {
      filteredSubmissions = filteredSubmissions.filter((s) => s.userId === userId)
    }

    return filteredSubmissions
  }

  // Navigate to a page
  const navigateTo = (page: string) => {
    setCurrentPage(page)
    setIsMobileMenuOpen(false)
    // Dispatch custom event for page change
    window.dispatchEvent(
      new CustomEvent("pageChange", {
        detail: { page },
      }),
    )
  }

  // Add a toast notification
  const showToast = (title: string, message: string, type = "info") => {
    const id = Date.now()
    setToasts((prev) => [...prev, { id, title, message, type }])
    // Auto-remove toast after 5 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id))
    }, 5000)
  }

  // Remove a toast
  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }

  // Show a modal
  const showModal = (modalType: string, data = {}) => {
    setActiveModal(modalType)
    setModalData(data)
  }

  // Hide the active modal
  const hideModal = () => {
    setActiveModal(null)
    setModalData({})
  }

  // Update points with animation
  const updatePoints = (newPoints: number) => {
    if (newPoints === userPoints) return
    setUserPoints(newPoints)
    // Show toast for points change
    if (newPoints > userPoints) {
      showToast("Points Earned", `+${newPoints - userPoints} points`, "success")
    } else {
      showToast("Points Deducted", `-${userPoints - newPoints} points`, "info")
    }
  }

  // Create confetti effect
  const createConfetti = () => {
    const colors = ["#4F46E5", "#9333EA", "#FBBF24", "#10B981", "#EF4444"]
    for (let i = 0; i < 100; i++) {
      const confetti = document.createElement("div")
      confetti.className = "confetti"
      // Random properties
      const size = Math.random() * 10 + 5
      const colorIndex = Math.floor(Math.random() * colors.length)
      const left = Math.random() * 100
      const duration = Math.random() * 3 + 2
      const delay = Math.random() * 0.5
      confetti.style.width = `${size}px`
      confetti.style.height = `${size}px`
      confetti.style.backgroundColor = colors[colorIndex]
      confetti.style.left = `${left}vw`
      confetti.style.top = "-20px"
      confetti.style.animationDuration = `${duration}s`
      confetti.style.animationDelay = `${delay}s`
      document.body.appendChild(confetti)
      // Remove after animation completes
      setTimeout(
        () => {
          confetti.remove()
        },
        (duration + delay) * 1000,
      )
    }
  }

  // Format code
  const formatCode = (code: string) => {
    try {
      // Simple formatting for demonstration
      let formatted = ""
      let indentLevel = 0
      const lines = code.split("\n")
      for (const line of lines) {
        const trimmed = line.trim()
        // Adjust indent level based on braces
        if (trimmed.endsWith("}") || trimmed.endsWith("})") || trimmed === "}" || trimmed === "});") {
          indentLevel = Math.max(0, indentLevel - 1)
        }
        // Add proper indentation
        if (trimmed.length > 0) {
          formatted += "  ".repeat(indentLevel) + trimmed + "\n"
        } else {
          formatted += "\n"
        }
        // Increase indent level for new blocks
        if (trimmed.endsWith("{") || trimmed.endsWith("({") || trimmed === "{") {
          indentLevel++
        }
      }
      showToast("Code Formatted", "Your code has been formatted", "success")
      return formatted
    } catch (error: any) {
      showToast("Formatting Error", error.message, "error")
      return code
    }
  }

  // Handle code execution
  const runCode = async () => {
    const outputContent = document.getElementById("output-content")
    // Clear previous output
    if (outputContent) {
      outputContent.innerHTML = "Running..."
    }
    // Simulate code execution
    setTimeout(() => {
      let output = ""
      const executionTime = Math.random() * 100 + 50 // Random time between 50-150ms
      try {
        if (selectedLanguage === "javascript") {
          // For JavaScript, actually run the code
          const consoleOutput: string[] = []
          const originalConsoleLog = console.log
          // Override console.log to capture output
          console.log = (...args: any[]) => {
            consoleOutput.push(args.join(" "))
          }
          // Execute the code in a try-catch block
          try {
            const result = eval(mainEditorContent)
            // Restore original console.log
            console.log = originalConsoleLog
            // Format output
            output = consoleOutput.join("\n")
            if (result !== undefined && !consoleOutput.includes(result.toString())) {
              output += (output ? "\n" : "") + result
            }
          } catch (error: any) {
            output = `Error: ${error.message}`
          } finally {
            // Ensure console.log is restored
            console.log = originalConsoleLog
          }
        } else {
          // For other languages, simulate output
          if (mainEditorContent.includes("Hello")) {
            output = "Hello, World!"
          } else {
            output = "Program executed successfully."
          }
        }
      } catch (error: any) {
        output = `Error: ${error.message}`
      }
      // Display output with execution time
      if (outputContent) {
        outputContent.innerHTML = `
          <div style="color: #10B981;">▶ Program Output:</div>
          <pre style="margin: 0.5rem 0;">${output}</pre>
          <div style="color: #6B7280; margin-top: 1rem; font-size: 0.875rem;">
            Execution time: ${executionTime.toFixed(2)} ms
          </div>
        `
      }
      showToast("Code executed", "Your code ran successfully!", "success")
    }, 1000)
  }

  // Evaluate JavaScript solution
  const evaluateJavaScriptSolution = (solutionCode: string, question: any) => {
    const results = []
    // Make sure testCases exists with a default empty array if it doesn't
    const testCases = question.testCases || [];
    
    // Try to evaluate each test case with the solution
    for (const testCase of testCases) {
      try {
        // Parse the input
        const inputStr = testCase.input
        const parsedInput: Record<string, any> = {}
        // Extract variable names and values
        inputStr.split(",").forEach((part: string) => {
          const [varName, varValue] = part.trim().split("=")
          if (varName && varValue) {
            // Try to parse as JSON if possible
            try {
              parsedInput[varName.trim()] = JSON.parse(varValue.trim())
            } catch {
              // Otherwise keep as string
              parsedInput[varName.trim()] = varValue.trim()
            }
          }
        })
        // Extract the function name from the solution
        const functionNameMatch = solutionCode.match(/function\s+([a-zA-Z0-9_]+)\s*\(/)
        if (!functionNameMatch) {
          throw new Error("Could not identify function name")
        }
        const functionName = functionNameMatch[1]
        // Create a safe evaluation environment
        const evalFunction = new Function(
          ...Object.keys(parsedInput),
          solutionCode + `\n return ${functionName}(${Object.keys(parsedInput).join(",")});`,
        )
        // Execute the function with the inputs
        const output = evalFunction(...Object.values(parsedInput))
        // Format output and compare with expected
        const outputStr = JSON.stringify(output)
        let expectedOutputStr = testCase.expectedOutput
        // Try to normalize both for comparison
        try {
          // Remove quotes if comparing string literals
          if (expectedOutputStr.startsWith('"') && expectedOutputStr.endsWith('"')) {
            expectedOutputStr = expectedOutputStr.slice(1, -1)
          }
          const normalizedExpected = JSON.parse(expectedOutputStr.replace(/'/g, '"'))
          const normalizedOutput = JSON.parse(outputStr)
          const passed = JSON.stringify(normalizedOutput) === JSON.stringify(normalizedExpected)
          results.push({
            passed: passed,
            output: outputStr,
          })
        } catch {
          // If normalization fails, do a simple string comparison
          const passed = outputStr === expectedOutputStr
          results.push({
            passed: passed,
            output: outputStr,
          })
        }
      } catch (error: any) {
        results.push({
          passed: false,
          output: `Error: ${error.message}`,
        })
      }
    }
    return results
  }

  // Update the submitSolution function to track submissions
  const submitSolution = async () => {
    if (!currentUser || !currentQuestion) return []

    // For JavaScript solutions, attempt actual evaluation
    let allPassed = true
    let evaluatedResults: any[] = []
    
    // Convert the ID to string explicitly to avoid type comparison issues
    const questionId = String(currentQuestion.id);
    
    if (selectedLanguage === "javascript" && !solvedQuestions.includes(questionId)) {
      try {
        // Try to actually evaluate the JavaScript solution
        evaluatedResults = evaluateJavaScriptSolution(solutionEditorContent, currentQuestion)
        allPassed = evaluatedResults.every((result) => result.passed)
      } catch (error) {
        console.error("Error evaluating solution:", error)
        // If evaluation fails, fall back to simulated results
        evaluatedResults = []
        allPassed = false
      }
    }

    // Simulate testing for other languages
    if (selectedLanguage !== "javascript" || evaluatedResults.length === 0) {
      // For solved problems, make all test cases pass
      allPassed = solvedQuestions.includes(questionId) ? true : Math.random() > 0.3 // 70% chance of passing for unsolved problems
    }

    // Display results
    const testCases = currentQuestion.testCases || [];
    const testResults = testCases.map((testCase: TestCase, index: number) => {
      // Use evaluated results if available, otherwise use simulation
      let passed
      let actualOutput = ""
      if (evaluatedResults[index]) {
        // Use actual evaluation result
        passed = evaluatedResults[index].passed
        actualOutput = evaluatedResults[index].output
      } else {
        // For solved problems, make all test cases pass
        passed = solvedQuestions.includes(questionId) ? true : allPassed
      }
      return {
        ...testCase,
        passed,
        actualOutput,
      }
    })

    // Record the submission
    const submission: Submission = {
      id: String(Date.now()),
      userId: currentUser.id,
      questionId: questionId,
      code: solutionEditorContent,
      language: selectedLanguage,
      passed: allPassed,
      submittedAt: new Date().toISOString(),
    }

    // In a real app, you would save this to a database
    mockSubmissions.push(submission)

    // If all tests passed
    if (allPassed) {
      // Add to solved questions if not already solved
      if (!solvedQuestions.includes(questionId)) {
        setSolvedQuestions([...solvedQuestions, questionId])
        updatePoints(userPoints + currentQuestion.points)
        // Show success modal
        showModal("success", {
          points: currentQuestion.points,
        })
        // Create confetti effect
        createConfetti()
      } else {
        // Show toast for already solved
        showToast("Already Solved", "You have already earned points for this challenge.", "info")
      }
    } else {
      // Show error toast
      showToast("Solution incorrect", "Some test cases failed. Try again!", "error")
      // Deduct points for incorrect submission (25% of problem value)
      const pointsDeduction = Math.round(currentQuestion.points * 0.25)
      if (userPoints >= pointsDeduction) {
        updatePoints(userPoints - pointsDeduction)
      }
    }

    // Return test results for display
    return testResults
  }

  // Create a new snippet
  const saveSnippet = (name: string, description: string) => {
    if (!name) {
      showToast("Error", "Please provide a name for your snippet", "error")
      return false
    }
    const code = currentPage === "compiler" ? mainEditorContent : solutionEditorContent
    // Create snippet object
    const snippet = {
      id: Date.now(),
      name,
      description,
      language: selectedLanguage,
      code,
      date: new Date().toISOString(),
    }
    // Add to snippets array
    setSnippets([...snippets, snippet])
    showToast("Snippet saved", "Your code snippet has been saved.", "success")
    return true
  }

  // Delete a snippet
  const deleteSnippet = (id: number) => {
    setSnippets(snippets.filter((snippet) => snippet.id !== id))
    showToast("Snippet deleted", "Your code snippet has been deleted.", "info")
  }

  // Load a snippet
  const loadSnippet = (snippet: any) => {
    // Set language if different
    if (snippet.language !== selectedLanguage) {
      setSelectedLanguage(snippet.language)
    }
    // Load code
    if (currentPage === "compiler") {
      setMainEditorContent(snippet.code)
    } else if (currentPage === "question-detail") {
      setSolutionEditorContent(snippet.code)
    }
    showToast("Snippet loaded", `Loaded snippet: ${snippet.name}`, "success")
  }

  // Open a question detail - fixed implementation
  const openQuestion = async (id: string) => {
    try {
      console.log('Opening question:', id);
      
      // First check if we already have the question in our local state
      const existingQuestion = questions.find(q => q.id === id);
      
      if (existingQuestion) {
        console.log('Found question in local state:', existingQuestion.title);
        setCurrentQuestion(existingQuestion);
        // Store in localStorage before navigation
        localStorage.setItem('currentQuestion', JSON.stringify(existingQuestion));
        // Use direct window location navigation which is more reliable
        window.location.href = `/question/${id}`;
        return;
      }
      
      // If not in local state, try to fetch from API
      const token = localStorage.getItem('token');
      
      try {
        const res = await fetch(`http://localhost:5000/api/problems/${id}`, {
          method: 'GET',
          headers: {
            'Authorization': token ? `Bearer ${token}` : '',
            'Content-Type': 'application/json'
          }
        });
        
        if (!res.ok) {
          throw new Error(`API returned status ${res.status}`);
        }
        
        const question = await res.json();
        console.log('Fetched question from API:', question.title || 'Unnamed Question');
        
        if (question && question.id) {
          setCurrentQuestion(question);
          // Store in localStorage before navigation
          localStorage.setItem('currentQuestion', JSON.stringify(question));
          // Use direct window location navigation which is more reliable
          window.location.href = `/question/${id}`;
        } else {
          throw new Error('Invalid question data received');
        }
      } catch (apiError) {
        console.error('API fetch failed, using direct navigation:', apiError);
        // If API fails, just navigate directly and let the detail page handle it
        window.location.href = `/question/${id}`;
      }
    } catch (error) {
      console.error('Error in openQuestion:', error);
      // Last resort fallback
      window.location.href = `/question/${id}`;
    }
  };
  // Add the new methods to the context value
  const contextValue: AppContextType = {
    // State
    currentPage,
    userPoints,
    solvedQuestions,
    selectedLanguage,
    currentQuestion,
    setCurrentQuestion,  // Added setCurrentQuestion to context value
    isMobileMenuOpen,
    snippets,
    toasts,
    activeModal,
    modalData,
    mainEditorContent,
    solutionEditorContent,
    // Actions
    navigateTo,
    setIsMobileMenuOpen,
    showToast,
    removeToast,
    showModal,
    hideModal,
    updatePoints,
    createConfetti,
    formatCode,
    runCode,
    submitSolution,
    saveSnippet,
    deleteSnippet,
    loadSnippet,
    openQuestion,
    setSelectedLanguage,
    setMainEditorContent,
    setSolutionEditorContent,

    // User authentication
    currentUser,
    isAuthenticated,
    login,
    register,
    logout,

    // Teacher specific functions
    createQuestion,
    getStudentPerformance,
    getSubmissions,

    // New properties
    questions,
    setQuestions,
  }

  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
}

export function useAppContext() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider")
  }
  return context
}
