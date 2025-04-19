"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { codeTemplates, questions } from "@/lib/data"

// Add the imports for the new types
import type { User, UserRole, Submission, StudentPerformance, Question } from "@/lib/types"

// Add user state and authentication methods to the context type
type AppContextType = {
  // Existing properties...
  currentPage: string
  userPoints: number
  solvedQuestions: number[]
  selectedLanguage: string
  currentQuestion: any
  isMobileMenuOpen: boolean
  snippets: any[]
  toasts: any[]
  activeModal: string | null
  modalData: any
  mainEditorContent: string
  solutionEditorContent: string
  isSubmitting: boolean
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
  openQuestion: (questionId: number) => void
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
  getSubmissions: (questionId?: number, userId?: string) => Promise<Submission[]>
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

// Add this helper function to map language names to Judge0 language IDs
const getLanguageId = (language: string): number => {
  const languageMap: Record<string, number> = {
    javascript: 63,  // JavaScript (Node.js 12.14.0)
    typescript: 74,  // TypeScript (4.2.3)
    python: 71,      // Python (3.8.1)
    java: 62,        // Java (OpenJDK 13.0.1)
    cpp: 54,         // C++ (GCC 9.2.0)
    csharp: 51,      // C# (Mono 6.6.0)
  };
  
  return languageMap[language.toLowerCase()] || 63; // Default to JavaScript
};

export function AppProvider({ children }: { children: ReactNode }) {
  // App State
  const [currentPage, setCurrentPage] = useState("home")
  const [userPoints, setUserPoints] = useState(0)
  const [solvedQuestions, setSolvedQuestions] = useState<number[]>([])
  const [selectedLanguage, setSelectedLanguage] = useState("javascript")
  const [currentQuestion, setCurrentQuestion] = useState<any>(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [snippets, setSnippets] = useState<any[]>([])
  const [toasts, setToasts] = useState<any[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Editor Content State
  const [mainEditorContent, setMainEditorContent] = useState(codeTemplates.javascript)
  const [solutionEditorContent, setSolutionEditorContent] = useState("")

  // Modals
  const [activeModal, setActiveModal] = useState<string | null>(null)
  const [modalData, setModalData] = useState<any>({})

  // Add user state to the AppProvider
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

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

  // Save user data from storage on initial render
  useEffect(() => {
    const userData = Storage.getData("codePracticeUserData", { points: 0, solvedQuestions: [] })
    setUserPoints(userData.points)
    setSolvedQuestions(userData.solvedQuestions)
    const savedSnippets = Storage.getData("codeSnippets", [])
    setSnippets(savedSnippets)
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
      questionId: 1,
      code: "function twoSum(nums, target) { return [0, 1]; }",
      language: "javascript",
      passed: true,
      submittedAt: new Date().toISOString(),
    },
    {
      id: "2",
      userId: "1",
      questionId: 2,
      code: "function isPalindrome(x) { return x.toString() === x.toString().split('').reverse().join(''); }",
      language: "javascript",
      passed: true,
      submittedAt: new Date().toISOString(),
    },
  ]

  // Authentication methods
  const login = async (email: string, password: string) => {
    try {
      console.log(`Attempting to login with email: ${email}`);
      
      // Make the API call to authenticate
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      console.log(`Response status: ${response.status}`);

      if (!response.ok) {
        let errorMessage = 'Invalid email or password';
        try {
        const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
          console.error('Login error response:', errorData);
        } catch (e) {
          console.error('Failed to parse error response:', e);
          // If we can't parse the JSON, use the status text
          errorMessage = `Login failed: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('Login successful, user data received');
      
      // Format userData object from response
      const userData: User = {
        id: data.id,
        name: data.name,
        email: data.email,
        role: data.role,
        createdAt: new Date().toISOString(),
      };
      
      // Store the JWT token in localStorage for subsequent API calls
      localStorage.setItem('token', data.token);
      
      setCurrentUser(userData);
      setIsAuthenticated(true);
      Storage.saveData("currentUser", userData);

      // If the user is a student, fetch their solved questions and points
      if (userData.role === "student") {
        try {
          const token = data.token;
          const submissionsResponse = await fetch('http://localhost:5000/api/submissions/user/' + userData.id, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (submissionsResponse.ok) {
            const submissions = await submissionsResponse.json();
            // Get solved problem IDs - look for passed: true
            const solvedProblemIds = [...new Set(
              submissions
                .filter((s: any) => s.passed === true)
                .map((s: any) => Number(s.problem_id))
            )] as number[];
            
            setSolvedQuestions(solvedProblemIds);
            
            // Set points from user data or calculate
            if (data.points !== undefined) {
              setUserPoints(data.points);
            }
          }
        } catch (error) {
          console.error("Error fetching user submissions:", error);
        }
      }

      showToast("Login Successful", `Welcome back, ${userData.name}!`, "success");
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

      const data = await response.json();
      
      // Format userData object from response
      const userData: User = {
        id: data.id,
        name: data.name,
        email: data.email,
        role: data.role,
        createdAt: new Date().toISOString(),
      };
      
      // Store the JWT token in localStorage for subsequent API calls
      localStorage.setItem('token', data.token);
      
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

  const getSubmissions = async (questionId?: number, userId?: string): Promise<Submission[]> => {
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
    // If user isn't authenticated and trying to access protected pages, redirect to login
    if (!isAuthenticated && page !== "home" && page !== "login" && page !== "todo") {
      setCurrentPage("login")
      return
    }

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

  // Create confetti animation using createConfetti function instead
  const createConfetti = () => {
    if (typeof window === 'undefined') return; // Skip on server-side

    const colors = ["#4F46E5", "#9333EA", "#FBBF24", "#10B981", "#EF4444"];
    
    // Create container for confetti
    const confettiContainer = document.createElement('div');
    confettiContainer.style.position = 'fixed';
    confettiContainer.style.top = '0';
    confettiContainer.style.left = '0';
    confettiContainer.style.width = '100%';
    confettiContainer.style.height = '100%';
    confettiContainer.style.pointerEvents = 'none';
    confettiContainer.style.zIndex = '9999';
    document.body.appendChild(confettiContainer);
    
    // Create confetti pieces
    for (let i = 0; i < 100; i++) {
      const confetti = document.createElement("div");
      confetti.className = "confetti";
      
      // Random properties
      const size = Math.random() * 10 + 5;
      const colorIndex = Math.floor(Math.random() * colors.length);
      const left = Math.random() * 100;
      const duration = Math.random() * 3 + 2;
      const delay = Math.random() * 0.5;
      
      // Set styles
      confetti.style.width = `${size}px`;
      confetti.style.height = `${size}px`;
      confetti.style.backgroundColor = colors[colorIndex];
      confetti.style.position = 'absolute';
      confetti.style.left = `${left}vw`;
      confetti.style.top = '-20px';
      confetti.style.borderRadius = '50%';
      confetti.style.opacity = '0.8';
      confetti.style.transform = 'rotate(0deg)';
      confetti.style.animation = `fall ${duration}s ease-in forwards ${delay}s`;
      
      confettiContainer.appendChild(confetti);
      
      // Create CSS animation if it doesn't exist
      if (!document.getElementById('confetti-animation')) {
        const style = document.createElement('style');
        style.id = 'confetti-animation';
        style.innerHTML = `
          @keyframes fall {
            from {
              transform: translateY(0) rotate(0deg);
              opacity: 0.8;
            }
            to {
              transform: translateY(100vh) rotate(720deg);
              opacity: 0;
            }
          }
        `;
        document.head.appendChild(style);
      }
      
      // Remove after animation completes
      setTimeout(() => {
        confetti.remove();
        // Remove container once all confetti is gone
        if (i === 99) {
          setTimeout(() => confettiContainer.remove(), (duration + delay) * 1000);
        }
      }, (duration + delay) * 1000);
    }
  }

  // Format code
  const formatCode = (code: string) => {
    try {
      // Language-specific formatting
      const language = selectedLanguage.toLowerCase();
      let formatted = "";
      
      // Split the code into lines
      const lines = code.split("\n");
      
      // Initialize indentation tracking
      let indentLevel = 0;
      let inMultiLineComment = false;
      
      // Track Python block context to handle indentation correctly
      const pythonBlockStack: number[] = [];
      let inPythonBlock = false;
      
      // Define language-specific patterns and rules
      const patterns: Record<string, any> = {
        python: {
          indentSize: 4,
          indentChar: " ",
          // In Python, don't decrease indent for return/break/continue inside a block
          decreaseIndentBefore: /^(else|elif|except|finally)\b/,
          increaseIndentAfter: /:\s*(#.*)?$/,
          maintainIndentAfter: /#/,
          blockStatements: /^(if|for|while|def|class|with|try|elif|else|except|finally)\b/,
          multilineComment: {
            start: /^\s*["']{3}/,
            end: /["']{3}$/
          }
        },
        javascript: {
          indentSize: 2,
          indentChar: " ",
          decreaseIndentBefore: /^\s*[})\]]/,
          increaseIndentAfter: /[{([](?:\s*\/\/.*)?$/,
          maintainIndentAfter: /\/\//,
          specialCases: {
            arrowFunctionBraces: /=>\s*{(?:\s*\/\/.*)?$/
          },
          multilineComment: {
            start: /^\s*\/\*/,
            end: /\*\//
          }
        },
        java: {
          indentSize: 4,
          indentChar: " ",
          decreaseIndentBefore: /^\s*[})\]]/,
          increaseIndentAfter: /[{([](?:\s*\/\/.*)?$/,
          maintainIndentAfter: /\/\//,
          multilineComment: {
            start: /^\s*\/\*/,
            end: /\*\//
          }
        },
        cpp: {
          indentSize: 4,
          indentChar: " ",
          decreaseIndentBefore: /^\s*[})\]]/,
          increaseIndentAfter: /[{([](?:\s*\/\/.*)?$/,
          maintainIndentAfter: /\/\//,
          multilineComment: {
            start: /^\s*\/\*/,
            end: /\*\//
          }
        },
        csharp: {
          indentSize: 4,
          indentChar: " ",
          decreaseIndentBefore: /^\s*[})\]]/,
          increaseIndentAfter: /[{([](?:\s*\/\/.*)?$/,
          maintainIndentAfter: /\/\//,
          multilineComment: {
            start: /^\s*\/\*/,
            end: /\*\//
          }
        }
      };
      
      // Use JavaScript as default if language not supported
      const config = patterns[language] || patterns.javascript;
      
      // Special handling for Python indentation
      const isPython = language === 'python';
      
      // Calculate the original indentation for each line
      const originalIndents: number[] = [];
      for (const line of lines) {
        const match = line.match(/^(\s*)/);
        const indent = match ? match[1].length : 0;
        originalIndents.push(indent);
      }
      
      // Process each line
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmedLine = line.trim();
        
        // Skip empty lines
        if (trimmedLine.length === 0) {
          formatted += "\n";
          continue;
        }
        
        // Handle multiline comments
        if (config.multilineComment) {
          if (!inMultiLineComment && trimmedLine.match(config.multilineComment.start)) {
            inMultiLineComment = !trimmedLine.match(config.multilineComment.end);
          } else if (inMultiLineComment && trimmedLine.match(config.multilineComment.end)) {
            inMultiLineComment = false;
          }
        }
        
        // Special handling for Python
        if (isPython) {
          // Check if this is a block statement (if, for, while, etc.)
          const isBlockStatement = config.blockStatements && trimmedLine.match(config.blockStatements);
          
          // If this line ends with a colon, it's starting a new block
          if (trimmedLine.match(config.increaseIndentAfter)) {
            // Add the line with current indentation
            formatted += config.indentChar.repeat(indentLevel * config.indentSize) + trimmedLine + "\n";
            
            // Push current indent level to stack before increasing
            pythonBlockStack.push(indentLevel);
            indentLevel++;
            inPythonBlock = true;
            continue;
          }
          
          // Handle dedenting in Python
          // Check if we're moving out of a block based on original indentation compared to previous line
          if (inPythonBlock && i > 0 && originalIndents[i] < originalIndents[i-1]) {
            // Calculate how many levels we need to dedent by comparing with stack
            while (pythonBlockStack.length > 0 && 
                  (isBlockStatement || 
                   originalIndents[i] <= pythonBlockStack[pythonBlockStack.length-1] * config.indentSize)) {
              // Pop from stack and decrease indent level
              pythonBlockStack.pop();
              indentLevel = Math.max(0, indentLevel - 1);
            }
          }
          
          // Add the line with calculated indentation
          formatted += config.indentChar.repeat(indentLevel * config.indentSize) + trimmedLine + "\n";
          
          // Special handling for else/elif/except/finally
          if (config.decreaseIndentBefore && trimmedLine.match(config.decreaseIndentBefore)) {
            // We've already added the line, and we'll handle the block indent on the next iteration
          }
          
          continue;
        }
        
        // Non-Python languages
        // Check if the line starts with a pattern that should decrease indentation
        if (config.decreaseIndentBefore && !inMultiLineComment && 
            trimmedLine.match(config.decreaseIndentBefore)) {
          indentLevel = Math.max(0, indentLevel - 1);
        }
        
        // Add indentation and the line
        formatted += config.indentChar.repeat(indentLevel * config.indentSize) + trimmedLine + "\n";
        
        // Check if the line ends with a pattern that should increase indentation
        if (!inMultiLineComment) {
          if (config.increaseIndentAfter && trimmedLine.match(config.increaseIndentAfter)) {
            indentLevel++;
          } else if (config.specialCases && config.specialCases.arrowFunctionBraces && 
                    trimmedLine.match(config.specialCases.arrowFunctionBraces)) {
            indentLevel++;
          }
        }
      }
      
      showToast("Code Formatted", "Your code has been formatted", "success");
      return formatted.trimEnd(); // Remove trailing newline
    } catch (error: any) {
      console.error("Formatting error:", error);
      showToast("Formatting Error", error.message, "error");
      return code;
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
          console.log = () => {
            consoleOutput.push(Array.from(arguments).join(" "))
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
    // Try to evaluate each test case with the solution
    for (const testCase of question.testCases) {
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

  // Update the submitSolution function to correctly handle test cases
  const submitSolution = async () => {
    if (!currentQuestion) {
      showToast('Error', 'No question selected', 'error')
      return []
    }

    try {
      setIsSubmitting(true)
      
      // Get language ID for the selected language
      const languageId = getLanguageId(selectedLanguage)
      
      console.log(`Submitting solution for ${currentQuestion.title} in ${selectedLanguage}...`)
      
      // Get auth token from localStorage
      const token = localStorage.getItem('token') || '';
      
      // Submit solution to server
      const response = await fetch(`http://localhost:5000/api/submissions/${currentQuestion.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          code: solutionEditorContent,
          language: selectedLanguage,
        })
      })
      
      // If we get a rate limit response, handle it specially
      if (response.status === 429) {
        const errorData = await response.json();
        const cooldownSeconds = errorData.cooldownRemaining || 60;
        
        // Show a more detailed toast
        showToast(
          'Rate Limit Exceeded', 
          `The code execution service is rate limited. Please wait ${cooldownSeconds} seconds before trying again.`, 
          'error'
        );
        
        // Throw a specific error that components can handle
        throw new Error(`API Error (429): ${JSON.stringify(errorData)}`);
      }
      
      if (!response.ok) {
        const errorText = await response.text()
        showToast('Error', `Failed to submit solution (${response.status})`, 'error')
        throw new Error(`API Error (${response.status}): ${errorText}`)
      }
      
      const data = await response.json()
      
      console.log('Submission result:', data)
      
      // Handle the case where all tests passed
      if (data.allPassed) {
        console.log('All tests passed!')
        
        // Display points earned and play confetti
        if (data.pointsEarned > 0) {
          // Update user points
          setUserPoints(data.totalPoints)
          
          // Show success message with points
          showToast(
            'Success!', 
            `You earned ${data.pointsEarned} points! Total: ${data.totalPoints}`, 
            'success'
          )
          
          // Show congratulations modal
          showModal('congratulations', {
            pointsEarned: data.pointsEarned,
            totalPoints: data.totalPoints,
            difficulty: currentQuestion.difficulty
          })
          
          // Play confetti animation using createConfetti function instead
          createConfetti();
        } else if (data.alreadySolved) {
          // Already solved, just show success
          showToast('Success!', 'Your solution is correct!', 'success')
        } else {
          // Generic success message
          showToast('Success!', 'All tests passed!', 'success')
        }
      } else {
        // Not all tests passed
        showToast('Incorrect', 'Some tests failed. Check the results below.', 'error')
      }
      
      // Return evaluation results for display
      return data.evaluationResults || []
    } catch (error) {
      console.error('Error submitting solution:', error)
      
      // Don't show another toast for rate limit errors since we already did that
      if (!(error instanceof Error && error.message.includes('429'))) {
        showToast('Error', `Failed to submit: ${error instanceof Error ? error.message : String(error)}`, 'error')
      }
      
      return []
    } finally {
      setIsSubmitting(false)
    }
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

  // Get a question by ID
  const getQuestion = (id: number) => {
    return questions.find((q) => q.id === id)
  }

  // Load the initial question
  const openQuestion = (questionId: number) => {
    console.log("Opening question:", questionId);
    
    // Check if the question ID is valid
    if (!questionId || isNaN(questionId)) {
      showToast("Error", "Invalid question ID", "error");
      return;
    }
    
    // First check authentication
    if (!isAuthenticated) {
      showToast("Authentication Required", "Please log in to solve challenges", "error");
      return;
    }
    
    // Fetch the question from API if available
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';
    const token = localStorage.getItem('token');
    
    fetch(`${API_BASE_URL}/problems/${questionId}`, {
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json'
      }
    })
    .then(response => {
      if (response.ok) {
        return response.json();
      }
      // If API call fails, fallback to local data
      console.log(`API call failed for problem ${questionId}, falling back to local data`);
      const localQuestion = questions.find(q => Number(q.id) === questionId);
      if (!localQuestion) {
        throw new Error('Question not found');
      }
      return localQuestion;
    })
    .then(question => {
      console.log("Question data:", question);
      
      // Ensure test_cases is properly parsed if it's a string
      let testCases = [];
      if (question.test_cases) {
        try {
          // Convert string to array if needed
          if (typeof question.test_cases === 'string') {
            testCases = JSON.parse(question.test_cases);
          } else {
            testCases = question.test_cases;
          }
          
          // Log the test cases for debugging
          console.log(`Found ${testCases.length} test cases for problem ${questionId}:`, testCases);
        } catch (e) {
          console.error('Error parsing test cases:', e);
        }
      }
      
      // Process the question data
      const processedQuestion = {
        ...question,
        id: Number(question.id), // Ensure id is a number
        // Make sure these fields exist with appropriate defaults
        difficulty: question.difficulty || 'easy',
        points: question.points || 10,
        examples: question.examples || [],
        testCases: question.testCases || [],
        test_cases: testCases
      };
      
      // Set current question
      setCurrentQuestion(processedQuestion);
      
      // Try to fetch starter code from the API
      fetch(`${API_BASE_URL}/submissions/starter/${questionId}/${selectedLanguage}`)
        .then(response => {
          if (response.ok) {
            return response.json();
          }
          throw new Error('Failed to load starter code');
        })
        .then(data => {
          // Set the solution editor content with the starter code
          setSolutionEditorContent(data.starterCode || '// No starter code available');
        })
        .catch(error => {
          console.error('Error loading starter code:', error);
          
          // Fallback to language-specific templates
          const templates = {
            javascript: {
              '1': "/**\n * @param {number[]} nums\n * @param {number} target\n * @return {number[]}\n */\nfunction twoSum(nums, target) {\n  // Write your code here\n}",
              '2': "/**\n * @param {character[]} s\n * @return {void} Do not return anything, modify s in-place instead.\n */\nfunction reverseString(s) {\n  // Write your code here\n}",
              '3': "/**\n * @param {number} x\n * @return {boolean}\n */\nfunction isPalindrome(x) {\n  // Write your code here\n}",
              'default': "// Write your solution here"
            },
            python: {
              '1': "def twoSum(nums, target):\n    # Write your code here\n    pass",
              '2': "def reverseString(s):\n    # Write your code here\n    pass",
              '3': "def isPalindrome(x):\n    # Write your code here\n    pass",
              'default': "# Write your solution here"
            }
          };
          
          const langTemplates = templates[selectedLanguage as keyof typeof templates] 
            || templates.javascript;
          const template = langTemplates[questionId.toString()] || langTemplates.default;
          
          setSolutionEditorContent(template);
        });
    })
    .catch(error => {
      console.error('Error opening question:', error);
      showToast("Error", `Failed to open question: ${error.message}`, "error");
      return;
    });
    
    // Navigate to question detail
    setCurrentPage("question-detail");
  };
  
  // Load starter code for a specific question and language
  const loadStarterCode = async (questionId: number, language: string) => {
    try {
      // Try to load from the API
      const response = await fetch(`http://localhost:5000/api/submissions/starter/${questionId}/${language}`);
      
      if (response.ok) {
        const data = await response.json();
        setSolutionEditorContent(data.starterCode || '// No starter code available');
      } else {
        // Fallback to any starter code in the question
        if (currentQuestion?.starting_code?.[language]) {
          setSolutionEditorContent(currentQuestion.starting_code[language]);
        } else {
          // Default templates
          type CodeTemplates = {
            [key: string]: {
              [key: string]: string;
            };
          };
          
          const defaultTemplates: CodeTemplates = {
            javascript: {
              default: "function solution() {\n  // Write your code here\n}",
              '1': "/**\n * @param {number[]} nums\n * @param {number} target\n * @return {number[]}\n */\nfunction twoSum(nums, target) {\n  // Write your code here\n}",
              '2': "/**\n * @param {character[]} s\n * @return {void} Do not return anything, modify s in-place instead.\n */\nfunction reverseString(s) {\n  // Write your code here\n}",
              '3': "/**\n * @param {number} x\n * @return {boolean}\n */\nfunction isPalindrome(x) {\n  // Write your code here\n}"
            },
            python: {
              default: "def solution():\n    # Write your code here\n    pass",
              '1': "def twoSum(nums, target):\n    # Write your code here\n    pass",
              '2': "def reverseString(s):\n    # Write your code here\n    pass",
              '3': "def isPalindrome(x):\n    # Write your code here\n    pass"
            },
            java: {
              default: "class Solution {\n    public void solution() {\n        // Write your code here\n    }\n}",
              '1': "class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        // Write your code here\n        return null;\n    }\n}",
              '2': "class Solution {\n    public void reverseString(char[] s) {\n        // Write your code here\n    }\n}",
              '3': "class Solution {\n    public boolean isPalindrome(int x) {\n        // Write your code here\n        return false;\n    }\n}"
            }
          };
          
          const langTemplates = defaultTemplates[language] || defaultTemplates.javascript;
          const problemIdStr = questionId.toString();
          
          // Use non-null assertion to tell TypeScript this is safe
          const template = langTemplates[problemIdStr] || langTemplates["default"];
          setSolutionEditorContent(template);
        }
      }
    } catch (error) {
      console.error("Error loading starter code:", error);
      setSolutionEditorContent('// Error loading starter code');
    }
  };
  
  // Function to set the selected language and update code templates
  const updateSelectedLanguage = (language: string) => {
    setSelectedLanguage(language);

    // If on question detail page, load starter code for the new language
    if (currentPage === "question-detail" && currentQuestion) {
      loadStarterCode(Number(currentQuestion.id), language);
    } else {
      // If on compiler page, update main editor with template
      const templates: Record<string, string> = {
        javascript: `function solution() {\n  // Write your JavaScript code here\n  console.log("Hello World!");\n}\n\nsolution();`,
        python: `def solution():\n    # Write your Python code here\n    print("Hello World!")\n\nsolution()`,
        java: `public class Main {\n    public static void main(String[] args) {\n        // Write your Java code here\n        System.out.println("Hello World!");\n    }\n}`,
        cpp: `#include <iostream>\n\nint main() {\n    // Write your C++ code here\n    std::cout << "Hello World!" << std::endl;\n    return 0;\n}`,
        csharp: `using System;\n\nclass Program {\n    static void Main() {\n        // Write your C# code here\n        Console.WriteLine("Hello World!");\n    }\n}`
      };
      
      setMainEditorContent(templates[language] || templates.javascript);
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
    isMobileMenuOpen,
    snippets,
    toasts,
    activeModal,
    modalData,
    mainEditorContent,
    solutionEditorContent,
    isSubmitting,
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
    setSelectedLanguage: updateSelectedLanguage,
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

