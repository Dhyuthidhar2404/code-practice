"use client"

import { useEffect, useRef } from "react"

interface CodeEditorProps {
  value: string
  onChange: (value: string) => void
  language: string
  runCode?: () => void
}

export default function CodeEditor({ value, onChange, language, ...props }: CodeEditorProps) {
  const editorRef = useRef<HTMLTextAreaElement>(null)

  const getLanguageClass = () => {
    switch (language) {
      case "python":
        return "language-python"
      case "java":
        return "language-java"
      case "cpp":
        return "language-cpp"
      default:
        return "language-javascript"
    }
  }

  // Handle tab key in textarea
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Handle tab key
      if (e.key === "Tab" && editorRef.current === document.activeElement) {
        e.preventDefault()
        const start = editorRef.current.selectionStart
        const end = editorRef.current.selectionEnd

        // Insert tab at cursor position
        const newValue = value.substring(0, start) + "  " + value.substring(end)
        onChange(newValue)

        // Move cursor after the inserted tab
        setTimeout(() => {
          if (editorRef.current) {
            editorRef.current.selectionStart = editorRef.current.selectionEnd = start + 2
          }
        }, 0)
      }

      // Add Ctrl+Enter to run code
      if (e.key === "Enter" && (e.ctrlKey || e.metaKey) && props.runCode) {
        e.preventDefault()
        props.runCode()
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => {
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [value, onChange, props.runCode])

  return (
    <textarea
      ref={editorRef}
      className={`w-full h-full bg-[#1E1E1E] text-[#D4D4D4] p-4 font-mono text-sm resize-none outline-none ${getLanguageClass()}`}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      spellCheck="false"
    />
  )
}

