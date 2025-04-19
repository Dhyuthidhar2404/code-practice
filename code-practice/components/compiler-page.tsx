"use client"

import { useState, useEffect, useCallback } from "react"
import { Play, AlignLeft, Save, FolderOpen, Trash2, Settings, Code, Copy } from "lucide-react"
import { useAppContext } from "./app-context"
import dynamic from 'next/dynamic'

// Dynamically import components that use browser APIs
const CodeEditor = dynamic(() => import("../components/code-editor"), { ssr: false })
import LanguagesDropdown from "./LanguagesDropdown"
import ThemeDropdown from "./ThemeDropdown"
import { defineTheme } from "../lib/defineTheme"
import { languageOptions } from "../constants/languageOptions"
import { executeCode, languageIdMap, ExecutionResult } from "../services/compilerService"

// Define a type for supported languages
type SupportedLanguage = 'javascript' | 'typescript' | 'python' | 'java' | 'cpp' | 'csharp';

// Define a type for editor themes
type EditorTheme = {
  value: string;
  label: string;
  key?: string;
};

const codeTemplates: Record<SupportedLanguage, string> = {
  javascript: `// JavaScript code here
console.log('Hello, world!');

function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

console.log(fibonacci(10)); // Output: 55
`,
  typescript: `// TypeScript code here
function greet(name: string): string {
  return \`Hello, \${name}!\`;
}

console.log(greet("TypeScript"));

// Generic function example
function identity<T>(arg: T): T {
  return arg;
}

console.log(identity<number>(123));
`,
  python: `# Python code here
print('Hello, world!')

def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

print(fibonacci(10)) # Output: 55
`,
  java: `// Java code here
public class Main {
  public static void main(String[] args) {
    System.out.println("Hello, world!");
    System.out.println(fibonacci(10)); // Output: 55
  }
  
  public static int fibonacci(int n) {
    if (n <= 1)
      return n;
    return fibonacci(n-1) + fibonacci(n-2);
  }
}
`,
  cpp: `// C++ code here
#include <iostream>

int fibonacci(int n) {
  if (n <= 1)
    return n;
  return fibonacci(n-1) + fibonacci(n-2);
}

int main() {
  std::cout << "Hello, world!" << std::endl;
  std::cout << fibonacci(10) << std::endl; // Output: 55
  return 0;
}
`,
  csharp: `// C# code here
using System;

class Program {
  static void Main() {
    Console.WriteLine("Hello, world!");
    Console.WriteLine(Fibonacci(10)); // Output: 55
  }
  
  static int Fibonacci(int n) {
    if (n <= 1)
      return n;
    return Fibonacci(n-1) + Fibonacci(n-2);
  }
}
`
}

// Define API response types for better type safety
interface ApiResponse {
  testResults?: ExecutionResult[];
  submission?: {
    executionTime: number;
    memoryUsed: number;
  };
}

// Update the theme state to restrict to only supported themes
const initialTheme = { 
  value: "vs-dark", 
  label: "VS Dark",
  key: "vs-dark"
};

// List of known supported themes
const supportedThemes = [
  { value: "vs-dark", label: "VS Dark", key: "vs-dark" },
  { value: "vs-light", label: "VS Light", key: "vs-light" },
  { value: "oceanic-next", label: "Oceanic Next", key: "oceanic-next" },
  { value: "monokai", label: "Monokai", key: "monokai" },
  { value: "github", label: "GitHub", key: "github" }
];

export default function CompilerPage() {
  const {
    selectedLanguage,
    setSelectedLanguage,
    formatCode,
    showModal,
    showToast,
    mainEditorContent,
    setMainEditorContent,
  } = useAppContext()

  const [isRunning, setIsRunning] = useState(false)
  const [output, setOutput] = useState("")
  const [executionStats, setExecutionStats] = useState({ time: 0, memory: 0 })
  const [customInput, setCustomInput] = useState("")
  const [isApiAvailable, setIsApiAvailable] = useState(true)
  const [debugLogs, setDebugLogs] = useState<string[]>([])
  const [isDebugMode, setIsDebugMode] = useState(false)
  const [theme, setTheme] = useState<EditorTheme>(initialTheme)
  
  // Setup keyboard shortcuts using inline listeners
  const [enterPress, setEnterPress] = useState(false);
  const [ctrlPress, setCtrlPress] = useState(false);
  
  // Effect to handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter") setEnterPress(true);
      if (e.key === "Control") setCtrlPress(true);
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "Enter") setEnterPress(false); 
      if (e.key === "Control") setCtrlPress(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);
  
  // Effect to run code on Ctrl+Enter
  useEffect(() => {
    if (enterPress && ctrlPress) {
      handleRunCode();
    }
  }, [ctrlPress, enterPress]);

  // Initialize theme
  useEffect(() => {
    defineTheme("oceanic-next").then(() => {
      setTheme({ 
        value: "oceanic-next", 
        label: "Oceanic Next",
        key: "oceanic-next"
      });
    });
  }, []);

  // Check if the API is available on component mount
  useEffect(() => {
    const checkApiStatus = async () => {
      try {
        console.log('Checking API status...')
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';
        const response = await fetch(`${API_BASE_URL}/submissions/health`, { 
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          signal: AbortSignal.timeout(3000)
        });
        setIsApiAvailable(response.ok);
        if (isDebugMode) {
          setDebugLogs(prev => [...prev, `API Status: ${response.ok ? 'Available' : 'Unavailable'}`])
        }
      } catch (error) {
        console.warn("API health check failed:", error);
        setIsApiAvailable(false);
        if (isDebugMode) {
          setDebugLogs(prev => [...prev, `API Health Check Error: ${error}`])
        }
      }
    };
    
    checkApiStatus();
  }, [isDebugMode]);

  const updateOutputContent = (html: string) => {
    const outputContent = document.getElementById("output-content");
    if (outputContent) {
      outputContent.innerHTML = html;
      if (isDebugMode) {
        setDebugLogs(prev => [...prev, `Output updated: ${html.substring(0, 100)}...`])
      }
    }
  }

  const handleRunCode = async () => {
    try {
      setIsRunning(true);
      if (isDebugMode) {
        setDebugLogs(prev => [...prev, 'Starting code execution...'])
      }
      
      // Clear previous output
      updateOutputContent("Running...");
      
      if (!isApiAvailable) {
        throw new Error('API server is not available. Please ensure the backend service is running.');
      }
      
      if (isDebugMode) {
        setDebugLogs(prev => [...prev, `Submitting code for language: ${selectedLanguage}`])
        setDebugLogs(prev => [...prev, `Using language ID: ${languageIdMap[selectedLanguage]}`])
      }
      
      // Use the compiler service to execute code
      const result = await executeCode(
        mainEditorContent,
        selectedLanguage,
        customInput
      );
      
      if (isDebugMode) {
        setDebugLogs(prev => [...prev, `Execution result: ${JSON.stringify(result).substring(0, 150)}...`])
      }
      
      // Process the execution result
      const outputText = result.stdout || '';
      const errorText = result.stderr || result.compile_output || '';
      const executionTime = result.time || 0;
      const memoryUsed = result.memory || 0;
      
      setOutput(outputText);
      setExecutionStats({
        time: executionTime,
        memory: memoryUsed
      });
      
      // Format the output display
      updateOutputContent(`
        <div style="color: #10B981;">▶ Program Output:</div>
        <pre style="margin: 0.5rem 0;">${outputText}</pre>
        ${errorText ? `<div style="color: #EF4444; margin-top: 0.5rem;">Error:</div><pre style="margin: 0.5rem 0; color: #EF4444;">${errorText}</pre>` : ''}
        <div style="color: #6B7280; margin-top: 1rem; font-size: 0.875rem;">
          Execution time: ${executionTime.toFixed(2)} ms
          Memory used: ${(memoryUsed / 1024).toFixed(2)} KB
          ${result.status ? `Status: ${result.status.id} - ${result.status.description}` : ''}
        </div>
      `);
      
      showToast("Code executed", "Your code ran successfully!", "success");
    } catch (error) {
      console.error("Error executing code:", error);
      
      if (isDebugMode) {
        setDebugLogs(prev => [...prev, `Execution Error: ${error}`])
      }
      
      // Display error in output
      updateOutputContent(`
        <div style="color: #EF4444;">Error:</div>
        <pre style="margin: 0.5rem 0; color: #EF4444;">${error instanceof Error ? error.message : 'Failed to execute code'}</pre>
      `);
      
      showToast("Execution failed", "There was an error running your code", "error");
    } finally {
      setIsRunning(false);
      if (isDebugMode) {
        setDebugLogs(prev => [...prev, 'Code execution completed'])
      }
    }
  }

  const handleFormatCode = () => {
    try {
      const formattedCode = formatCode(mainEditorContent);
      setMainEditorContent(formattedCode);
      showToast("Code formatted", "Your code has been formatted successfully!", "success");
    } catch (error) {
      console.error("Error formatting code:", error);
      showToast("Format failed", "There was an error formatting your code", "error");
    }
  }

  const clearOutput = () => {
    updateOutputContent("");
    setOutput("");
    setExecutionStats({ time: 0, memory: 0 });
  }

  const handleLanguageChange = (selectedOption: any) => {
    const newLanguage = selectedOption.value as SupportedLanguage;
    
    // Show confirmation dialog if there's existing code
    if (mainEditorContent && mainEditorContent !== codeTemplates[selectedLanguage as SupportedLanguage]) {
      if (window.confirm("Changing language will reset your code. Continue?")) {
        setSelectedLanguage(newLanguage);
        setMainEditorContent(codeTemplates[newLanguage]);
      }
    } else {
      setSelectedLanguage(newLanguage);
      setMainEditorContent(codeTemplates[newLanguage]);
    }
  }

  const handleThemeChange = (selectedTheme: any) => {
    const themeValue = selectedTheme.value;
    
    // Check if the theme is in our supported list
    const isSupported = supportedThemes.some(theme => theme.value === themeValue);
    
    if (!isSupported) {
      console.log(`Theme ${themeValue} is not in supported list, falling back to oceanic-next`);
      showToast("Theme not available", "Selected theme is not supported. Using Oceanic Next instead.", "info");
      
      const fallbackTheme = supportedThemes.find(t => t.value === "oceanic-next") || initialTheme;
      defineTheme("oceanic-next").then(() => {
        setTheme(fallbackTheme);
      });
      return;
    }
    
    // Use theme from our supported list to ensure it has all properties
    const safeTheme = supportedThemes.find(t => t.value === themeValue) || initialTheme;
    
    defineTheme(themeValue).then(() => {
      setTheme(safeTheme);
    });
  }

  const handleSaveCode = () => {
    if (!mainEditorContent.trim()) {
      showToast("Empty code", "There's no code to save", "error");
      return;
    }
    showModal("snippets", { mode: "save" });
  }

  const handleLoadCode = () => {
    showModal("snippets", { mode: "load" });
  }

  const copyCode = () => {
    navigator.clipboard.writeText(mainEditorContent)
      .then(() => showToast("Copied!", "Code copied to clipboard", "success"))
      .catch(err => showToast("Copy failed", "Failed to copy code", "error"));
  }

  // Update editor content when language changes only if needed
  useEffect(() => {
    if (!mainEditorContent) {
      setMainEditorContent(codeTemplates[selectedLanguage as SupportedLanguage] || codeTemplates.javascript);
    }
  }, [selectedLanguage, mainEditorContent, setMainEditorContent]);

  return (
    <section id="compiler" className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-2">Interactive Code Compiler</h2>
      <p className="text-gray-600 mb-4">Write, compile, and run your code in multiple programming languages.</p>
      
      {!isApiAvailable && (
        <div className="mb-4 p-3 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded">
          <strong>Warning:</strong> API server is not available. Code execution will not work. Please ensure the backend service is running at http://localhost:5000.
        </div>
      )}
      
      <div className="flex flex-wrap gap-4 mb-4">
        <div>
          <LanguagesDropdown 
            onSelectChange={handleLanguageChange} 
            selectedLanguage={selectedLanguage} 
          />
        </div>
        
        <div>
          <ThemeDropdown 
            handleThemeChange={handleThemeChange} 
            theme={theme} 
          />
        </div>
        
        <button
          id="run-code"
          className={`bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
            isRunning ? "opacity-70 pointer-events-none animate-pulse" : ""
          }`}
          onClick={handleRunCode}
          disabled={isRunning || !isApiAvailable}
          aria-label="Run code"
        >
          {isRunning ? (
            <>
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Processing...
            </>
          ) : (
            <>
              <Play className="h-5 w-5" /> Run Code
            </>
          )}
        </button>
        
        <button
          className="border border-gray-300 bg-white hover:bg-gray-50 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          onClick={handleFormatCode}
          aria-label="Format code"
        >
          <AlignLeft className="h-5 w-5" /> Format
        </button>
        
        <button
          className="border border-gray-300 bg-white hover:bg-gray-50 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          onClick={handleSaveCode}
          aria-label="Save code"
        >
          <Save className="h-5 w-5" /> Save
        </button>
        
        <button
          className="border border-gray-300 bg-white hover:bg-gray-50 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          onClick={handleLoadCode}
          aria-label="Load code"
        >
          <FolderOpen className="h-5 w-5" /> Load
        </button>
        
        <button
          className="border border-gray-300 bg-white hover:bg-gray-50 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          onClick={copyCode}
          aria-label="Copy code"
        >
          <Copy className="h-5 w-5" /> Copy
        </button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 min-h-[600px]">
        <div className="lg:col-span-2 bg-[#1E1E1E] rounded-lg overflow-hidden shadow h-[400px] md:h-[600px]">
          <CodeEditor
            value={mainEditorContent}
            onChange={setMainEditorContent}
            language={selectedLanguage}
            runCode={handleRunCode}
            theme={theme.value}
            height="100%"
          />
        </div>
        
        <div className="flex flex-col">
          <div className="bg-[#1E1E1E] text-white rounded-lg overflow-hidden relative h-[300px] md:h-[400px]">
            <div className="bg-[#333] p-2 flex justify-between items-center">
              <span>Output</span>
              <div className="flex items-center gap-2">
                <button
                  className="p-1 rounded hover:bg-[#444] transition-colors"
                  onClick={() => setIsDebugMode(!isDebugMode)}
                  aria-label="Toggle debug mode"
                >
                  {isDebugMode ? 'Debug On' : 'Debug Off'}
                </button>
                <button
                  className="p-1 rounded hover:bg-[#444] transition-colors"
                  onClick={clearOutput}
                  aria-label="Clear output"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div id="output-content" className="p-4 font-mono overflow-y-auto h-[calc(100%-40px)]"></div>
          </div>
          
          {isDebugMode && (
            <div className="mt-4 bg-[#1E1E1E] text-white rounded-lg overflow-hidden">
              <div className="bg-[#333] p-2">
                <span>Debug Logs</span>
              </div>
              <div className="p-4 font-mono overflow-y-auto max-h-[200px] text-sm">
                {debugLogs.map((log, index) => (
                  <div key={index} className="mb-1 text-gray-400">
                    {log}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="mt-4">
            <h3 className="text-lg font-semibold mb-2">Custom Input</h3>
            <textarea
              id="custom-input"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              placeholder="Enter input for your program..."
              className="w-full h-[150px] p-3 border border-gray-300 rounded-lg font-mono resize-y bg-white"
              aria-label="Custom input for program"
            ></textarea>
          </div>
        </div>
      </div>
    </section>
  )
}