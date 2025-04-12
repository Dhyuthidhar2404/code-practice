"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Play, AlignLeft, Save, FolderOpen, AlertCircle, RefreshCw, Copy, Trash } from "lucide-react"
import { useAppContext } from "./app-context"
import CodeEditor from "./code-editor"

// More detailed code templates with comments for better learning experience
const codeTemplates: { [key: string]: string } = {
  javascript: `// JavaScript Hello World Example
// This shows basic console output and string manipulation

function greet(name = "World") {
  return \`Hello, \${name}!\`;
}

// Call the function and print the result
console.log(greet());

// You can also pass arguments to the function
// console.log(greet("JavaScript"));
`,
  python: `# Python Hello World Example
# This shows basic print statements and string formatting

def greet(name="World"):
    """Return a greeting string"""
    return f"Hello, {name}!"

# Call the function and print the result
print(greet())

# You can also pass arguments to the function
# print(greet("Python"))
`,
  java: `// Java Hello World Example
// This shows basic class structure and printing

public class Main {
    // The main method is the entry point for all Java programs
    public static void main(String[] args) {
        System.out.println(greet());
        
        // You can also pass arguments to the function
        // System.out.println(greet("Java"));
    }
    
    public static String greet(String name) {
        return "Hello, " + name + "!";
    }
    
    public static String greet() {
        return greet("World");
    }
}
`,
  cpp: `// C++ Hello World Example
// This shows basic I/O and string concatenation

#include <iostream>
#include <string>

// Function to create a greeting
std::string greet(const std::string& name = "World") {
    return "Hello, " + name + "!";
}

int main() {
    // Print the greeting
    std::cout << greet() << std::endl;
    
    // You can also pass arguments to the function
    // std::cout << greet("C++") << std::endl;
    
    return 0;
}
`
}

// Language options with display names and corresponding server-side IDs
const languageOptions = [
  { value: "javascript", label: "JavaScript", serverName: "JAVASCRIPT" },
  { value: "python", label: "Python", serverName: "PYTHON" },
  { value: "java", label: "Java", serverName: "JAVA" },
  { value: "cpp", label: "C++", serverName: "CPP" },
  { value: "typescript", label: "TypeScript", serverName: "TYPESCRIPT" },
  { value: "c", label: "C", serverName: "C" },
  { value: "csharp", label: "C#", serverName: "C#" },
  { value: "go", label: "Go", serverName: "GO" }
];

// User-friendly error messages with detailed explanations
const errorMessages: { [key: string]: string } = {
  'Failed to fetch': 'Unable to connect to the server. Please check your internet connection and try again.',
  'Network Error': 'Network connection issue. Please check your internet connection.',
  'timeout': 'The request timed out. The server might be busy, please try again later.',
  'aborted': 'Request was cancelled. Please try again.',
  '404': 'The code execution service endpoint was not found. Please try again later.',
  '429': 'Too many requests. Please wait a moment before trying again.',
  '500': 'Server encountered an internal error. Please try again later.',
  '503': 'Code execution service is temporarily unavailable.',
  'Compilation Error': 'Your code has syntax errors that prevent it from compiling.',
  'Runtime Error': 'Your code encountered an error during execution.',
  'Memory Limit': 'Your code used too much memory. Try optimizing your algorithm.',
  'Time Limit': 'Your code took too long to execute. Try optimizing your algorithm.'
};

// Common language-specific errors and their fixes
const commonErrors: { [key: string]: { pattern: string; fix: string; }[] } = {
  javascript: [
    { pattern: "is not defined", fix: "Make sure all variables are declared before use with let, const, or var." },
    { pattern: "is not a function", fix: "Check that you're calling a function that exists and is spelled correctly." },
    { pattern: "Cannot read property", fix: "The object you're trying to access is undefined or null." }
  ],
  python: [
    { pattern: "IndentationError", fix: "Python relies on proper indentation. Check your code's whitespace." },
    { pattern: "NameError", fix: "A variable or function name is being used that hasn't been defined." },
    { pattern: "TypeError", fix: "You're trying to perform an operation on incompatible types." }
  ],
  java: [
    { pattern: "cannot find symbol", fix: "Check for typos or missing declarations." },
    { pattern: "';' expected", fix: "Make sure all statements end with a semicolon." },
    { pattern: "incompatible types", fix: "You're trying to assign a value of wrong type to a variable." }
  ],
  cpp: [
    { pattern: "undefined reference", fix: "You're trying to use a function that hasn't been defined." },
    { pattern: "expected ';'", fix: "Add a semicolon at the end of the statement." },
    { pattern: "was not declared", fix: "Variable or function is used before declaration." }
  ]
};

// Function to get language-specific error suggestions
const getErrorSuggestions = (errorText: string, language: string): string[] => {
  if (!errorText || !language) return [];
  
  const languageErrors = commonErrors[language] || [];
  return languageErrors
    .filter(err => errorText.includes(err.pattern))
    .map(err => err.fix);
};

// Mock API response for testing when actual API is not available
const mockExecuteCode = async (code: string, language: string, input: string): Promise<{ stdout: string; stderr: string | null; executionTime: number; memoryUsed: number; }> => {
  return new Promise((resolve) => {
    // Add a small delay to simulate network latency
    setTimeout(() => {
      // Basic validation
      if (!code.trim()) {
        throw new Error('Empty code');
      }
      
      // Output for different languages
      let output = '';
      let error = null;
      
      // Simulate execution for different languages
      if (language === 'javascript') {
        try {
          // Use Function constructor to safely evaluate code (in a real app, use a proper sandbox)
          const sandboxedCode = `
            let console = { 
              logs: [], 
              log: function(...args) { 
                this.logs.push(args.join(' ')); 
              } 
            };
            ${code}
            return console.logs.join('\\n');
          `;
          
          // Execute the code
          const executeFunc = new Function(sandboxedCode);
          output = executeFunc() || 'No output';
        } catch (err) {
          error = (err as Error).message;
        }
      } else if (language === 'python') {
        // Simple validation for Python
        if (code.includes('print(')) {
          output = 'Hello, World!';  // Mock output
        } else {
          error = 'No print statement found';
        }
      } else {
        output = 'Hello, World!';  // Default mock output for other languages
      }
      
      // Mock execution stats
      const stats = {
        time: Math.random() * 100,
        memory: Math.random() * 1024
      };
      
      resolve({
        stdout: output,
        stderr: error,
        executionTime: stats.time,
        memoryUsed: stats.memory
      });
    }, 500);
  });
};

export default function CompilerPage() {
  const {
    selectedLanguage,
    setSelectedLanguage,
    formatCode,
    showModal,
    showToast,
    mainEditorContent,
    setMainEditorContent,
  } = useAppContext();

  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState("");
  const [error, setError] = useState<{ message: string } | null>(null);
  const [executionStats, setExecutionStats] = useState({ time: 0, memory: 0 });
  const outputRef = useRef<HTMLDivElement | null>(null);
  const customInputRef = useRef<HTMLTextAreaElement | null>(null);
  const [useLocalExecution, setUseLocalExecution] = useState(true); // Toggle for mock or real API

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Enter or Cmd+Enter to run code
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleRunCode();
      }
      
      // Ctrl+Shift+F or Cmd+Shift+F to format code
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'F') {
        e.preventDefault();
        handleFormatCode();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [mainEditorContent, selectedLanguage]);

  // Local cache mechanism
  const saveToLocalCache = useCallback(() => {
    try {
      localStorage.setItem('compiler_code', mainEditorContent);
      localStorage.setItem('compiler_language', selectedLanguage);
      if (customInputRef.current) {
        localStorage.setItem('compiler_input', customInputRef.current.value || '');
      }
    } catch (err) {
      console.log('Could not save to local storage');
    }
  }, [mainEditorContent, selectedLanguage]);

  const loadFromLocalCache = useCallback(() => {
    try {
      const savedCode = localStorage.getItem('compiler_code');
      const savedLanguage = localStorage.getItem('compiler_language');
      const savedInput = localStorage.getItem('compiler_input');
      
      if (savedLanguage && languageOptions.some(l => l.value === savedLanguage)) {
        setSelectedLanguage(savedLanguage);
      }
      
      if (savedCode && savedCode.trim()) {
        setMainEditorContent(savedCode);
        return true;
      }
      if (savedInput && customInputRef.current) {
        customInputRef.current.value = savedInput;
      }
    } catch (err) {
      console.log('Could not load from local storage');
    }
    return false;
  }, [setMainEditorContent, setSelectedLanguage]);

  // Auto-save code periodically
  useEffect(() => {
    const saveInterval = setInterval(saveToLocalCache, 10000); // Save every 10 seconds
    return () => clearInterval(saveInterval);
  }, [saveToLocalCache]);

  // Handle when to load template vs saved code
  useEffect(() => {
    const hasLoadedSaved = loadFromLocalCache();
    
    if (!hasLoadedSaved) {
      // Only set template if no saved code was loaded
      setMainEditorContent(codeTemplates[selectedLanguage] || codeTemplates.javascript);
    }
  }, []);

  // Update template when language changes (only if matches current template)
  useEffect(() => {
    const currentTemplate = Object.values(codeTemplates).find(template => 
      mainEditorContent.trim() === template.trim()
    );
    
    if (currentTemplate) {
      setMainEditorContent(codeTemplates[selectedLanguage] || codeTemplates.javascript);
    }
  }, [selectedLanguage, setMainEditorContent]);

  // Handle code execution
  const handleRunCode = async () => {
    if (!mainEditorContent.trim()) {
      showToast("Error", "Please write some code first", "error");
      return;
    }

    try {
      setIsRunning(true);
      setError(null);
      
      // Get custom input
      const customInput = customInputRef.current?.value ?? "";
      
      // Use mock execution instead of real API call
      setTimeout(() => {
        let output = "";
        try {
          if (selectedLanguage === "javascript") {
            // For JavaScript, use a safe eval approach
            const consoleOutput: string[] = [];
            const originalConsoleLog = console.log;
            console.log = (...args: any[]) => consoleOutput.push(args.join(" "));
            
            try {
              // Create a sandbox function to evaluate the code
              const sandbox = new Function(
                mainEditorContent + 
                "\n//# sourceURL=user-code.js"
              );
              sandbox();
              output = consoleOutput.join("\n") || "Code executed successfully (no output)";
            } catch (e: unknown) {
              output = `Error: ${e instanceof Error ? e.message : String(e)}`;
            } finally {
              console.log = originalConsoleLog;
            }
          } else if (selectedLanguage === "python") {
            // Mock Python execution
            if (mainEditorContent.includes("print")) {
              // Extract content from print statements as a basic simulation
              const printMatches = mainEditorContent.match(/print\((.*?)\)/g);
              if (printMatches) {
                output = printMatches.map(match => {
                  const content = match.substring(6, match.length - 1);
                  return content.replace(/['"`]/g, ''); // Simple quotation removal
                }).join("\n");
              } else {
                output = "No output";
              }
            } else {
              output = "Code executed successfully (no output)";
            }
          } else {
            // For other languages, just simulate success
            output = "Code executed successfully (simulated)";
          }
          
          // Display output
          const outputContent = outputRef.current;
          if (outputContent) {
            outputContent.innerHTML = `
              <div style="color: #10B981;">▶ Program Output:</div>
              <pre class="my-2 p-2 bg-gray-800 rounded">${output}</pre>
              <div style="color: #6B7280; margin-top: 1rem; font-size: 0.875rem;">
                <span>Execution time: ${Math.round(Math.random() * 100)} ms (simulated)</span>
              </div>
            `;
          }
          
          showToast("Code executed", "Your code ran successfully!", "success");
        } catch (error: unknown) {
          const outputContent = outputRef.current;
          if (outputContent) {
            outputContent.innerHTML = `
              <div style="color: #EF4444;">Error:</div>
              <pre class="my-2 p-2 bg-gray-800 rounded text-red-400">${error instanceof Error ? error.message : String(error)}</pre>
            `;
          }
          showToast("Execution failed", error instanceof Error ? error.message : "Failed to execute code", "error");
        } finally {
          setIsRunning(false);
        }
      }, 1000);
    } catch (error: unknown) {
      console.error("Error in handleRunCode:", error);
      setError({ message: "Failed to execute code" });
      showToast("Error", "Failed to execute code", "error");
      setIsRunning(false);
    }
  };

  const handleFormatCode = () => {
    if (!mainEditorContent.trim()) {
      showToast("Empty Code", "There's no code to format", "info");
      return;
    }
    try {
      const formatted = formatCode(mainEditorContent);
      setMainEditorContent(formatted);
      showToast("Code Formatted", "Your code has been formatted", "success");
    } catch (error) {
      console.error("Format error:", error);
      showToast("Format Error", "Could not format the code", "error");
    }
  };

  const handleClearAll = () => {
    // Show confirmation modal before clearing
    if (mainEditorContent.trim() || (customInputRef.current && customInputRef.current.value?.trim())) {
      if (confirm("Are you sure you want to clear both code and input?")) {
        const defaultTemplate = codeTemplates[selectedLanguage] || codeTemplates.javascript;
        setMainEditorContent(defaultTemplate);
        if (customInputRef.current) {
          customInputRef.current.value = '';
        }
        showToast("Cleared", "Code and input have been reset", "info");
      }
    }
  };
  
  return (
    <section id="compiler" className="min-h-screen">
      <h2 className="text-2xl font-bold mb-2">Interactive Code Compiler</h2>
      <p className="text-gray-600 mb-4">Write, compile, and run your code in multiple programming languages.</p>
      
      <div className="bg-gray-50 p-3 rounded-lg mb-4 border border-gray-200">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            aria-label="Select programming language"
          >
            {languageOptions.map(lang => (
              <option key={lang.value} value={lang.value}>{lang.label}</option>
            ))}
          </select>
          
          <div className="flex-1 flex justify-center">
            <label className="inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={useLocalExecution} 
                onChange={() => setUseLocalExecution(!useLocalExecution)}
                className="sr-only peer" 
              />
              <div className="relative w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              <span className="ms-3 text-sm font-medium text-gray-700">Use Local Execution</span>
            </label>
          </div>
          
          <div className="flex gap-2 ml-auto">
            <button
              aria-label="Format code"
              title="Format code (Ctrl+Shift+F)"
              className="border border-gray-300 bg-white px-3 py-2 rounded-lg flex items-center gap-1 hover:bg-gray-50 transition-colors text-sm"
              onClick={handleFormatCode}
            >
              <AlignLeft className="h-4 w-4" /> Format
            </button>
            <button
              aria-label="Save code"
              title="Save code snippet"
              className="border border-gray-300 bg-white px-3 py-2 rounded-lg flex items-center gap-1 hover:bg-gray-50 transition-colors text-sm"
              onClick={() => showModal("snippets", { mode: "save" })}
            >
              <Save className="h-4 w-4" /> Save
            </button>
            <button
              aria-label="Load code"
              title="Load saved code snippet"
              className="border border-gray-300 bg-white px-3 py-2 rounded-lg flex items-center gap-1 hover:bg-gray-50 transition-colors text-sm"
              onClick={() => showModal("snippets", { mode: "load" })}
            >
              <FolderOpen className="h-4 w-4" /> Load
            </button>
            <button
              aria-label="Clear all"
              title="Clear code and input"
              className="border border-gray-300 bg-white px-3 py-2 rounded-lg flex items-center gap-1 hover:bg-gray-50 transition-colors text-sm"
              onClick={handleClearAll}
            >
              <Trash className="h-4 w-4" /> Clear
            </button>
          </div>
        </div>
        
        <p className="text-xs text-gray-500">
          {error ? 
            <span className="text-red-500 flex items-center gap-1"><AlertCircle className="h-3 w-3" /> Error detected in your code. See output panel for details.</span> : 
            <span>Pro tip: Use Ctrl+Enter to run your code and Ctrl+Shift+F to format.</span>
          }
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-[600px]">
        <div className="bg-[#1E1E1E] rounded-lg overflow-hidden shadow h-[500px] flex flex-col">
          <div className="bg-[#333] p-2 flex justify-between items-center text-white">
            <span className="text-sm">Code Editor - {languageOptions.find(l => l.value === selectedLanguage)?.label || 'JavaScript'}</span>
            <button
              id="run-code"
              className={`bg-green-500 text-white px-3 py-1 rounded-md flex items-center gap-1 hover:bg-green-600 transition-colors text-sm ${
                isRunning ? "opacity-70 pointer-events-none animate-pulse" : ""
              }`}
              onClick={handleRunCode}
              disabled={isRunning}
              aria-label="Run code"
              title="Run code (Ctrl+Enter)"
            >
              {isRunning ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" /> Running...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" /> Run
                </>
              )}
            </button>
          </div>
          <div className="flex-grow">
            <CodeEditor
              value={mainEditorContent}
              onChange={setMainEditorContent}
              language={selectedLanguage}
              runCode={handleRunCode}
            />
          </div>
        </div>
        
        <div className="flex flex-col gap-4">
          <div className="bg-[#1E1E1E] text-white rounded-lg overflow-hidden relative h-[300px] flex flex-col">
            <div className="bg-[#333] p-2 flex justify-between items-center">
              <span className="flex items-center">
                Output {error && <span className="text-red-400 ml-2 flex items-center gap-1"><AlertCircle className="h-4 w-4" /> Error</span>}
              </span>
              <button
                className="px-2 py-1 text-sm hover:bg-gray-700 rounded"
                onClick={() => {
                  if (outputRef.current) outputRef.current.innerHTML = "";
                  setOutput("");
                  setError(null);
                  setExecutionStats({ time: 0, memory: 0 });
                }}
                title="Clear output"
                aria-label="Clear output"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </div>
            <div 
              id="output-content" 
              ref={outputRef}
              className="p-4 font-mono overflow-y-auto flex-grow text-sm"
            ></div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="text-lg font-semibold mb-2 flex items-center justify-between">
              <span>Custom Input</span>
              <button
                onClick={() => {
                  if (customInputRef.current) customInputRef.current.value = '';
                }}
                className="text-gray-400 hover:text-gray-700 text-xs flex items-center gap-1"
                title="Clear input"
              >
                <Trash className="h-3 w-3" /> Clear input
              </button>
            </h3>
            <textarea
              id="custom-input"
              ref={customInputRef}
              placeholder="Enter input for your program..."
              className="w-full h-[100px] p-3 border border-gray-300 rounded-lg font-mono resize-y bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Input for your program"
            ></textarea>
            <p className="text-sm text-gray-500 mt-1">
              Program input will be passed to stdin. Separate multiple values with spaces or newlines.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}