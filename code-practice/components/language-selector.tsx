import { useState } from 'react';
import { Code } from 'lucide-react';
import { useAppContext } from './app-context';

// Available programming languages
const LANGUAGES = [
  { id: "javascript", name: "JavaScript" },
  { id: "python", name: "Python" },
  { id: "java", name: "Java" },
  { id: "cpp", name: "C++" },
  { id: "csharp", name: "C#" }
];

// Language templates for each problem ID
const CODE_TEMPLATES: Record<string, Record<string, string>> = {
  'javascript': {
    'default': "function solution() {\n  // Write your code here\n}",
    '1': "/**\n * @param {number[]} nums\n * @param {number} target\n * @return {number[]}\n */\nfunction twoSum(nums, target) {\n  // Write your code here\n}",
    '2': "/**\n * @param {character[]} s\n * @return {void} Do not return anything, modify s in-place instead.\n */\nfunction reverseString(s) {\n  // Write your code here\n}",
    '3': "/**\n * @param {number} x\n * @return {boolean}\n */\nfunction isPalindrome(x) {\n  // Write your code here\n}"
  },
  'python': {
    'default': "def solution():\n    # Write your code here\n    pass",
    '1': "def twoSum(nums, target):\n    # Write your code here\n    pass",
    '2': "def reverseString(s):\n    # Write your code here\n    pass",
    '3': "def isPalindrome(x):\n    # Write your code here\n    pass"
  },
  'java': {
    'default': "class Solution {\n    public void solution() {\n        // Write your code here\n    }\n}",
    '1': "class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        // Write your code here\n        return null;\n    }\n}",
    '2': "class Solution {\n    public void reverseString(char[] s) {\n        // Write your code here\n    }\n}",
    '3': "class Solution {\n    public boolean isPalindrome(int x) {\n        // Write your code here\n        return false;\n    }\n}"
  },
  'cpp': {
    'default': "#include <vector>\n\nclass Solution {\npublic:\n    // Write your code here\n};"
  },
  'csharp': {
    'default': "using System;\n\npublic class Solution {\n    // Write your code here\n}"
  }
};

export default function LanguageSelector() {
  const { 
    selectedLanguage, 
    setSelectedLanguage, 
    currentQuestion,
    setSolutionEditorContent 
  } = useAppContext();
  
  const [showMenu, setShowMenu] = useState(false);
  
  // Get language display name
  const getCurrentLanguageName = () => {
    return LANGUAGES.find(lang => lang.id === selectedLanguage)?.name || "JavaScript";
  };
  
  // Handle language change
  const handleLanguageChange = async (languageId: string) => {
    // Hide dropdown
    setShowMenu(false);
    
    // If language hasn't changed, do nothing
    if (languageId === selectedLanguage) return;
    
    // Update application language state
    setSelectedLanguage(languageId);
    
    // Load code template for the current problem
    if (currentQuestion) {
      try {
        // Try to load from API
        const response = await fetch(
          `http://localhost:5000/api/submissions/starter/${currentQuestion.id}/${languageId}`
        );
        
        if (response.ok) {
          const data = await response.json();
          setSolutionEditorContent(data.starterCode);
          return;
        }
      } catch (error) {
        console.error("Error loading starter code from API:", error);
      }
      
      // Fallback to local templates
      const templates = CODE_TEMPLATES[languageId] || CODE_TEMPLATES.javascript;
      const problemId = currentQuestion.id.toString();
      const template = templates[problemId] || templates.default;
      setSolutionEditorContent(template);
    }
  };
  
  return (
    <div className="relative">
      <button 
        className="flex items-center gap-2 px-3 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors mb-2"
        onClick={() => setShowMenu(!showMenu)}
      >
        <Code size={16} />
        {getCurrentLanguageName()}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`h-4 w-4 transition-transform ${showMenu ? 'rotate-180' : ''}`}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>
      
      {showMenu && (
        <div className="absolute z-10 mt-1 w-48 bg-white rounded-md shadow-lg py-1 text-gray-700">
          {LANGUAGES.map(language => (
            <button
              key={language.id}
              className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                selectedLanguage === language.id ? 'bg-gray-50 font-medium' : ''
              }`}
              onClick={() => handleLanguageChange(language.id)}
            >
              {language.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
} 