"use client"

import { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import type { Monaco } from '@monaco-editor/react'

// Dynamic import of Monaco editor to prevent server-side rendering issues
const Editor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
  loading: () => <div className="text-center p-4 text-gray-400">Loading editor...</div>
})

// Define Monaco type for use in our component
type MonacoType = typeof import('monaco-editor')
let monaco: MonacoType | null = null

// Import monaco on client side only
if (typeof window !== 'undefined') {
  import('monaco-editor').then((m) => {
    monaco = m
  })
}

type CodeEditorProps = {
  value: string
  onChange: (value: string) => void
  language: string
  runCode?: () => void
  theme?: string
  height?: string
}

export default function CodeEditor({ 
  value, 
  onChange, 
  language, 
  runCode,
  theme = 'vs-dark',
  height = '100%'
}: CodeEditorProps) {
  const editorRef = useRef<any>(null)
  const [debugMode, setDebugMode] = useState(false)
  const [breakpoints, setBreakpoints] = useState<number[]>([])
  const [editorValue, setEditorValue] = useState(value)
  const [isClient, setIsClient] = useState(false)

  // Check if we're running on client side
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Add CSS for breakpoints
  useEffect(() => {
    if (typeof document === 'undefined') return;
    
    // Add CSS for breakpoint styling if not already present
    if (!document.getElementById('monaco-breakpoint-styles')) {
      const style = document.createElement('style');
      style.id = 'monaco-breakpoint-styles';
      style.innerHTML = `
        .breakpoint {
          background: #e51400;
          border-radius: 50%;
          width: 8px !important;
          height: 8px !important;
          margin-left: 5px;
          margin-top: 6px;
        }
        .monaco-editor .margin {
          cursor: pointer;
        }
      `;
      document.head.appendChild(style);
      console.log('Added breakpoint styles');
    }
  }, [isClient]);

  // Update editor value when prop value changes
  useEffect(() => {
    setEditorValue(value);
  }, [value]);

  // Map simplified language names to Monaco's language identifiers
  const getMonacoLanguage = (lang: string): string => {
    const languageMap: Record<string, string> = {
      javascript: 'javascript',
      typescript: 'typescript',
      python: 'python',
      java: 'java',
      cpp: 'cpp',
      c: 'c',
      csharp: 'csharp',
      ruby: 'ruby',
      php: 'php',
      go: 'go',
      rust: 'rust'
    }
    return languageMap[lang.toLowerCase()] || 'plaintext'
  }

  // Handle editor mounting
  const handleEditorDidMount = (editor: any, monacoInstance: Monaco) => {
    editorRef.current = editor
    
    // Add keyboard shortcut for running code (Ctrl+Enter or Cmd+Enter)
    editor.addCommand(
      monacoInstance.KeyMod.CtrlCmd | monacoInstance.KeyCode.Enter, 
      () => {
        if (runCode) runCode()
      }
    )

    // Add keyboard shortcut for toggling debug mode (Ctrl+Shift+D or Cmd+Shift+D)
    editor.addCommand(
      monacoInstance.KeyMod.CtrlCmd | monacoInstance.KeyMod.Shift | monacoInstance.KeyCode.KeyD,
      () => {
        setDebugMode(!debugMode)
        console.log(`Debug mode ${!debugMode ? 'enabled' : 'disabled'}`)
      }
    )

    // Set up breakpoint handling
    if (monaco) {
      const model = editor.getModel();
      if (model) {
        // Create decoration type for breakpoints
        const breakpointDecorationType = {
          glyphMarginClassName: 'breakpoint',
          glyphMarginHoverMessage: { value: 'Breakpoint' }
        };

        // Handle mouse clicks on glyph margin to toggle breakpoints
        editor.onMouseDown((e: any) => {
          if (e.target.type === monaco?.editor.MouseTargetType.GUTTER_GLYPH_MARGIN) {
            const lineNumber = e.target.position?.lineNumber;
            if (lineNumber) {
              const currentDecorations = model.getLineDecorations(lineNumber, lineNumber)
                .filter((d: any) => d.options.glyphMarginClassName === 'breakpoint');
              
              if (currentDecorations.length > 0) {
                // Remove breakpoint
                model.deltaDecorations(
                  currentDecorations.map((d: any) => d.id),
                  []
                );
                setBreakpoints(prev => prev.filter(bp => bp !== lineNumber));
                console.log(`Breakpoint removed at line ${lineNumber}`);
              } else {
                // Add breakpoint
                if (monaco) {
                  model.deltaDecorations(
                    [],
                    [{
                      range: new monaco.Range(lineNumber, 1, lineNumber, 1),
                      options: breakpointDecorationType
                    }]
                  );
                  setBreakpoints(prev => [...prev, lineNumber]);
                  console.log(`Breakpoint added at line ${lineNumber}`);
                }
              }
            }
          }
        });
      }
    }

    // Focus editor when mounted
    editor.focus()
  }

  // Handle editor value changes
  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      setEditorValue(value);
      onChange(value);
      if (debugMode) {
        console.log('Editor content changed:', value.substring(0, 100) + (value.length > 100 ? '...' : ''));
      }
    }
  }

  // Editor options for customization
  const editorOptions = {
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    fontSize: 14,
    fontFamily: 'JetBrains Mono, Menlo, Monaco, Consolas, monospace',
    lineNumbers: 'on' as const,
    roundedSelection: true,
    automaticLayout: true,
    scrollbar: {
      useShadows: false,
      verticalScrollbarSize: 10,
      horizontalScrollbarSize: 10,
      alwaysConsumeMouseWheel: false
    },
    padding: { top: 10 },
    suggest: { 
      showKeywords: true,
      showSnippets: true
    },
    tabSize: 2,
    wordWrap: 'on' as const,
    formatOnPaste: true,
    formatOnType: true,
    autoIndent: 'full' as const,
    autoClosingBrackets: 'always' as const,
    autoClosingQuotes: 'always' as const,
    autoSurround: 'languageDefined' as const,
    cursorBlinking: 'smooth' as const,
    folding: true,
    mouseWheelZoom: true,
    parameterHints: {
      enabled: true
    },
    debug: debugMode,
    glyphMargin: true, // Enable breakpoint margin
  }

  // If we're not on client side, show nothing or loading state
  if (!isClient) {
    return <div className="text-center p-4 text-gray-400">Loading editor...</div>
  }

  return (
    <div className="relative h-full w-full">
      <Editor
        height={height}
        width="100%"
        language={getMonacoLanguage(language)}
        value={editorValue}
        theme={theme}
        options={editorOptions}
        onChange={handleEditorChange}
        onMount={handleEditorDidMount}
      />
      {debugMode && (
        <div className="absolute top-2 right-2 bg-yellow-500 text-black px-2 py-1 rounded text-sm">
          Debug Mode
        </div>
      )}
    </div>
  )
}