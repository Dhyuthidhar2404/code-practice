"use client"

import { useState, useEffect } from "react"
import { useAppContext } from "./app-context"
import CodeEditor from "../components/code-editor"
import { AlignLeft, Save, FolderOpen, CheckCircle, ArrowLeft, Trophy, PlayCircle } from "lucide-react"
import LanguageSelector from "./language-selector"

export default function QuestionDetailPage() {
  const {
    currentQuestion,
    navigateTo,
    submitSolution,
    formatCode,
    showModal,
    selectedLanguage,
    solutionEditorContent,
    setSolutionEditorContent,
    userPoints,
    isSubmitting,
    showToast
  } = useAppContext()

  const [testResults, setTestResults] = useState<any[]>([])
  const [localIsSubmitting, setLocalIsSubmitting] = useState(false)
  const [runOutput, setRunOutput] = useState("")
  const [isRunning, setIsRunning] = useState(false)
  const [cooldownActive, setCooldownActive] = useState(false)
  const [cooldownSeconds, setCooldownSeconds] = useState(0)
  const [isChecking, setIsChecking] = useState(false)
  const [outputBoxText, setOutputBoxText] = useState("")

  // Longer cooldown period to match server-side settings
  const COOLDOWN_PERIOD_SECONDS = 60;

  useEffect(() => {
    // Countdown timer for cooldown
    let timer: NodeJS.Timeout | null = null;
    
    if (cooldownActive && cooldownSeconds > 0) {
      timer = setTimeout(() => {
        setCooldownSeconds(prev => prev - 1);
      }, 1000);
    } else if (cooldownSeconds === 0 && cooldownActive) {
      setCooldownActive(false);
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [cooldownActive, cooldownSeconds]);

  if (!currentQuestion) {
    return (
      <section id="question-detail" className="container mx-auto px-4 py-8">
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
    setIsChecking(true);
    setOutputBoxText("Running tests against your code...");

    try {
      const results = await submitSolution();
      
      if (results && Array.isArray(results)) {
        // Format and display test case results
        const formattedOutput = formatTestResults(results);
        setOutputBoxText(formattedOutput);
      } else {
        // Handle case where no results were returned
        setOutputBoxText("No test results returned. Please try again later.");
      }
    } catch (error) {
      console.error("Error submitting solution:", error);
      
      // Handle rate limit error specifically
      if (error instanceof Error && error.message.includes('429')) {
        try {
          const errorData = JSON.parse(error.message.split('429')?.[1]?.trim() || '{}');
          const cooldownSecs = errorData.cooldownRemaining || 60;
          
          setOutputBoxText(
            `⚠️ Rate Limit Exceeded ⚠️\n\n` +
            `The code execution service is rate limited.\n` +
            `Please wait ${cooldownSecs} seconds before trying again.\n\n` +
            `This helps ensure fair usage of computational resources.`
          );
        } catch (e) {
          // If parsing fails, show generic message
          setOutputBoxText(
            `⚠️ Rate Limit Exceeded ⚠️\n\n` +
            `The code execution service is rate limited.\n` +
            `Please wait 60 seconds before trying again.`
          );
        }
      } else if (error instanceof Error && error.message.includes('offline mode')) {
        // Handle offline mode error
        setOutputBoxText(
          `⚠️ Offline Mode ⚠️\n\n` +
          `The code execution service is currently running in offline mode due to API rate limits.\n` +
          `Your code has been analyzed, but actual execution results are unavailable.\n` +
          `Results shown may be approximations based on code analysis.`
        );
      } else {
        // For other errors, show generic message
        setOutputBoxText(`Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`);
      }
    } finally {
      setIsChecking(false);
    }
  };

  const handleFormatCode = () => {
    setSolutionEditorContent(formatCode(solutionEditorContent))
  }

  const handleRunCode = async () => {
    if (cooldownActive) {
      showToast("Rate limit", `Please wait ${cooldownSeconds} seconds before trying again`, "warning");
      return;
    }
    
    setIsRunning(true);
    setRunOutput("Running your code...");
    
    try {
      // Run the code on the server
      const response = await fetch('http://localhost:5000/api/submissions/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: solutionEditorContent,
          language_id: getLanguageId(selectedLanguage),
          stdin: getFirstTestCaseInput(),
        }),
      });
      
      if (response.status === 429) {
        // Rate limit hit - set cooldown
        setCooldownActive(true);
        setCooldownSeconds(COOLDOWN_PERIOD_SECONDS); // Longer cooldown to match server settings
        
        // Display a more detailed message
        setRunOutput(`Rate limit reached. Please wait ${COOLDOWN_PERIOD_SECONDS} seconds before trying again.\n\nThis happens because the code execution service (Judge0) has usage limits on its free tier.`);
        
        throw new Error("Rate limit reached. Please wait before trying again.");
      }
      
      if (!response.ok) {
        const errorText = await response.text();
        setRunOutput(`Server error: ${response.status}\n${errorText}`);
        throw new Error(`Error ${response.status}: ${errorText}`);
      }
      
      const result = await response.json();
      
      // Check if we're in offline mode
      if (result.offlineMode) {
        setRunOutput(
          `⚠️ Offline Mode ⚠️\n\n` +
          `The code execution service is currently in offline mode due to API rate limits.\n` +
          `${result.message || ''}\n\n` +
          `Output (approximate): ${result.stdout || 'Unavailable in offline mode'}`
        );
        return;
      }
      
      // Display the execution result
      if (result.stdout) {
        setRunOutput(`Output:\n${result.stdout}`);
      } else if (result.stderr) {
        setRunOutput(`Error:\n${result.stderr}`);
      } else if (result.compile_output) {
        setRunOutput(`Compilation Error:\n${result.compile_output}`);
      } else {
        setRunOutput(`Status: ${result.status?.description || 'Unknown'}`);
      }
    } catch (error) {
      console.error("Error running code:", error);
      
      // Avoid overriding the rate limit message we already set
      if (!(error instanceof Error && error.message.includes("Rate limit"))) {
        setRunOutput(`Error running code: ${error instanceof Error ? error.message : String(error)}`);
      }
      
      // Activate cooldown on any API error that might be rate-limit related
      if ((error instanceof Error && error.message.includes("Rate limit")) || 
          (error instanceof Error && error.message.includes("429"))) {
        setCooldownActive(true);
        setCooldownSeconds(COOLDOWN_PERIOD_SECONDS);
        showToast("Rate Limit", `Please wait ${COOLDOWN_PERIOD_SECONDS} seconds before trying again`, "warning");
      }
    } finally {
      setIsRunning(false);
    }
  };
  
  const getLanguageId = (lang: string): number => {
    const languageMap: Record<string, number> = {
      javascript: 63,
      python: 71,
      java: 62,
      cpp: 54,
      csharp: 51,
    };
    return languageMap[lang.toLowerCase()] || 63; // Default to JavaScript
  };
  
  const getFirstTestCaseInput = (): string => {
    if (!currentQuestion) return '';
    
    // Try to get input from test cases
    if (Array.isArray(currentQuestion.test_cases) && currentQuestion.test_cases.length > 0) {
      return currentQuestion.test_cases[0].input || '';
    }
    
    // Fall back to examples
    if (Array.isArray(currentQuestion.examples) && currentQuestion.examples.length > 0) {
      return currentQuestion.examples[0] || '';
    }
    
    return '';
  };

  // Use either global or local submitting state
  const isCurrentlySubmitting = isSubmitting || localIsSubmitting;

  // Function to format test result output with better error handling
  const formatTestResults = (results: any[]) => {
    if (!results || results.length === 0) {
      return "No test results available";
    }

    // Check if any results indicate offline mode
    const isOfflineMode = results.some(result => result.offlineMode);
    
    if (isOfflineMode) {
      let output = "⚠️ Offline Evaluation Mode ⚠️\n\n";
      output += "The code execution service is currently using offline mode due to API rate limits.\n";
      output += "Results shown below are approximations based on code analysis.\n\n";
      
      let allTestsPassed = true;
      
      results.forEach((result, index) => {
        if (!result.passed) allTestsPassed = false;
        
        const status = result.passed ? "✅ PASSED" : "❌ FAILED";
        output += `Test Case ${index + 1}: ${status}\n`;
        output += `Input: ${result.input || "No input"}\n`;
        output += `Expected: ${result.expected || "No expected output"}\n`;
        if (result.actual && result.actual !== "Evaluated offline") {
          output += `Output: ${result.actual}\n`;
        } else {
          output += `Output: Unavailable in offline mode\n`;
        }
        output += "\n";
      });
      
      // Add summary at the top
      output = `${allTestsPassed ? "✅ All tests passed!" : "❌ Some tests failed"} (Offline Mode)\n\n${output}`;
      
      return output;
    }

    // Check if this is a rate limit error
    const isRateLimited = results.some(
      result => result.status === "Error" && 
      (result.actual?.includes("Rate limit") || result.actual?.includes("429"))
    );
    
    if (isRateLimited) {
      return "⚠️ Rate limit exceeded. Please wait before trying again.";
    }

    let output = "";
    let allPassed = true;
    
    results.forEach((result, index) => {
      const status = result.passed ? "✅ PASSED" : "❌ FAILED";
      
      if (!result.passed) {
        allPassed = false;
      }
      
      output += `Test Case ${index + 1}: ${status}\n`;
      output += `Input: ${result.input || "No input"}\n`;
      output += `Expected: ${result.expected || "No expected output"}\n`;
      output += `Actual: ${result.actual || "No output"}\n`;
      
      // Add error details if available
      if (!result.passed && result.actual?.includes("Error")) {
        output += `Details: ${result.actual}\n`;
      }
      
      output += "\n";
    });
    
    // Summary at the top
    output = `${allPassed ? "✅ All tests passed!" : "❌ Some tests failed"}\n\n${output}`;
    
    return output;
  };

  return (
    <section id="question-detail" className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg p-6 shadow">
          <div className="flex justify-between items-start">
            <div>
              <span
                className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-2 ${
                  currentQuestion.difficulty === "easy"
                    ? "bg-green-100 text-green-500"
                    : currentQuestion.difficulty === "medium"
                      ? "bg-amber-100 text-amber-500"
                      : "bg-red-100 text-red-500"
                }`}
              >
                {currentQuestion.difficulty.charAt(0).toUpperCase() + currentQuestion.difficulty.slice(1)}
              </span>
              <h2 className="text-2xl font-bold mb-2">{currentQuestion.title}</h2>
            </div>
            <div className="flex items-center bg-gradient-to-r from-primary to-secondary text-white px-3 py-2 rounded-lg shadow">
              <Trophy className="h-4 w-4 mr-1" />
              <span className="font-medium">{userPoints} points</span>
            </div>
          </div>
          <p className="text-gray-600 mb-4">{currentQuestion.description}</p>
          <h3 className="text-lg font-semibold mb-2">Examples:</h3>
          {currentQuestion.examples && currentQuestion.examples.map((example: string, index: number) => (
            <div key={index} className="bg-gray-100 rounded-lg p-4 font-mono text-sm mb-2">
              {example}
            </div>
          ))}
          
          {/* Point value display */}
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
            {currentQuestion.difficulty === "easy" 
              ? "5"
              : currentQuestion.difficulty === "medium"
                ? "10"
                : "20"} points for correct solution
          </div>
        </div>
        
        <div className="flex flex-col gap-4 h-full">
          {/* Language Selector Component */}
          <LanguageSelector />
          
          <div className="bg-[#1E1E1E] rounded-lg overflow-hidden shadow h-[400px]">
            <CodeEditor
              value={solutionEditorContent}
              onChange={setSolutionEditorContent}
              language={selectedLanguage}
              runCode={handleSubmit}
            />
          </div>
          
          <div className="flex flex-wrap gap-2">
            {/* Add a status display area at the top of the results section */}
            {cooldownActive && (
              <div className="mb-4 p-4 bg-yellow-100 border border-yellow-300 rounded-lg">
                <h3 className="text-lg font-semibold text-yellow-700 mb-2">Rate Limit Active</h3>
                <p className="text-yellow-700">
                  The code execution service is currently rate limited. Please wait <span className="font-bold">{cooldownSeconds}</span> seconds before submitting.
                </p>
                <p className="text-sm text-yellow-600 mt-2">
                  This happens because Judge0 (the code execution service) has usage limits on its free tier.
                </p>
              </div>
            )}
            
            {/* Button styling changes for better cooldown visibility */}
            <button
              id="submit-solution"
              className={`bg-primary text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary/90 transition-colors flex-1 justify-center ${
                isCurrentlySubmitting || cooldownActive ? "opacity-70 pointer-events-none" : ""
              } ${cooldownActive ? "bg-yellow-500" : ""}`}
              onClick={handleSubmit}
              disabled={isCurrentlySubmitting || cooldownActive}
            >
              {isCurrentlySubmitting ? (
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
              ) : cooldownActive ? (
                <>
                  <svg className="animate-pulse h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 6v6l4 2" />
                  </svg>
                  Cooldown: {cooldownSeconds}s
                </>
              ) : (
                <>
                  <CheckCircle className="h-5 w-5" /> Submit Solution
                </>
              )}
            </button>
            
            <button
              className={`bg-emerald-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-emerald-700 transition-colors ${
                isRunning || cooldownActive ? "opacity-70 pointer-events-none" : ""
              }`}
              onClick={handleRunCode}
              disabled={isRunning || cooldownActive}
            >
              {isRunning ? (
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
              ) : cooldownActive ? (
                <span className="text-sm">{cooldownSeconds}s</span>
              ) : (
                <PlayCircle className="h-5 w-5" />
              )}
              {cooldownActive ? "Cooling down" : "Run Code"}
            </button>
            
            <button
              className="border border-gray-300 bg-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-50 transition-colors"
              onClick={handleFormatCode}
              disabled={isCurrentlySubmitting}
            >
              <AlignLeft className="h-5 w-5" /> Format
            </button>
            
            <button
              className="border border-gray-300 bg-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-50 transition-colors"
              onClick={() => showModal("snippets", { mode: "save" })}
              disabled={isCurrentlySubmitting}
            >
              <Save className="h-5 w-5" /> Save
            </button>
            
            <button
              className="border border-gray-300 bg-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-50 transition-colors"
              onClick={() => showModal("snippets", { mode: "load" })}
              disabled={isCurrentlySubmitting}
            >
              <FolderOpen className="h-5 w-5" /> Load
            </button>
          </div>
          
          {runOutput && (
            <div className="mt-4">
              <h3 className="text-lg font-semibold mb-2">Run Output:</h3>
              <div className="bg-gray-800 text-white p-4 rounded-lg font-mono text-sm overflow-auto max-h-[200px]">
                <pre>{runOutput}</pre>
              </div>
            </div>
          )}
          
          {testResults.length > 0 && (
            <div className="mt-4">
              <h3 className="text-lg font-semibold mb-2">Test Results:</h3>
              {testResults.map((test, index) => {
                // Determine if the test really passed by comparing outputs
                const normalizeOutput = (str: string): string => String(str || '').replace(/[\s'\[\]"]/g, '').toLowerCase();
                const expectedNormalized = normalizeOutput(test.expectedOutput);
                const actualNormalized = normalizeOutput(test.actualOutput);
                
                // Consider the test passed if normalized values match, regardless of server assessment
                const visuallyPassed = expectedNormalized === actualNormalized;
                
                return (
                  <div key={index} className={`p-4 rounded-lg mb-2 ${visuallyPassed ? "bg-green-100" : "bg-red-100"}`}>
                    <strong>Test Case {index + 1}:</strong>
                    <div className="font-mono text-sm mt-1">
                      <span className="font-medium">Input:</span> 
                      <span className="ml-1">{test.input}</span>
                    </div>
                    <div className="mt-1">
                      <span className="font-medium">Expected:</span> 
                      <span className="font-mono text-sm ml-1">{test.expectedOutput}</span>
                    </div>
                    {test.actualOutput && (
                      <div className="mt-1">
                        <span className="font-medium">Your output:</span> 
                        <span className="font-mono text-sm ml-1">{test.actualOutput}</span>
                      </div>
                    )}
                    {test.status && (
                      <div className="mt-1">
                        <span className="font-medium">Status:</span> 
                        <span className="font-mono text-sm ml-1">{test.status}</span>
                      </div>
                    )}
                    <div className={`font-medium mt-2 ${visuallyPassed ? "text-green-500" : "text-red-500"}`}>
                      {visuallyPassed ? "✓ Passed" : "✗ Failed"}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          
          <button
            id="back-to-questions"
            className="bg-white text-primary px-4 py-2 rounded-lg border border-primary hover:bg-gray-50 transition-colors flex items-center gap-2 mt-auto w-fit"
            onClick={() => navigateTo("questions")}
            disabled={isCurrentlySubmitting}
          >
            <ArrowLeft className="h-4 w-4" /> Back to Questions
          </button>
        </div>
      </div>
    </section>
  )
}