// Code templates for different languages
export const codeTemplates = {
  javascript:
    '// Write your JavaScript code here\n\nfunction example() {\n  console.log("Hello, World!");\n  return "Hello, World!";\n}\n\nexample();',
  python:
    '# Write your Python code here\n\ndef example():\n    print("Hello, World!")\n    return "Hello, World!"\n\nexample()',
  java: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n\n    public static String example() {\n        return "Hello, World!";\n    }\n}',
  cpp: '#include <iostream>\n\nusing namespace std;\n\nstring example() {\n    cout << "Hello, World!" << endl;\n    return "Hello, World!";\n}\n\nint main() {\n    example();\n    return 0;\n}',
}

// Sample coding challenges
export const questions = [
  {
    id: 1,
    title: "Two Sum",
    difficulty: "easy",
    description:
      "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to target.",
    points: 5,
    examples: [
      "Input: nums = [2,7,11,15], target = 9\nOutput: [0,1]\nExplanation: Because nums[0] + nums[1] == 9, we return [0, 1].",
      "Input: nums = [3,2,4], target = 6\nOutput: [1,2]",
    ],
    testCases: [
      { input: "nums = [2,7,11,15], target = 9", expectedOutput: "[0,1]" },
      { input: "nums = [3,2,4], target = 6", expectedOutput: "[1,2]" },
      { input: "nums = [3,3], target = 6", expectedOutput: "[0,1]" },
    ],
    startingCode: {
      javascript:
        "/**\n * @param {number[]} nums\n * @param {number} target\n * @return {number[]}\n */\nfunction twoSum(nums, target) {\n    // Your code here\n}",
      python: "def twoSum(nums, target):\n    # Your code here\n    pass",
      java: "class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        // Your code here\n    }\n}",
      cpp: "class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        // Your code here\n    }\n};",
    },
  },
  {
    id: 2,
    title: "Palindrome Number",
    difficulty: "easy",
    description:
      "Given an integer x, return true if x is a palindrome, and false otherwise. A palindrome is a number that reads the same backward as forward.",
    points: 5,
    examples: [
      "Input: x = 121\nOutput: true\nExplanation: 121 reads as 121 from left to right and from right to left.",
      "Input: x = -121\nOutput: false\nExplanation: From left to right, it reads -121. From right to left, it becomes 121-. Therefore it is not a palindrome.",
    ],
    testCases: [
      { input: "x = 121", expectedOutput: "true" },
      { input: "x = -121", expectedOutput: "false" },
      { input: "x = 10", expectedOutput: "false" },
    ],
    startingCode: {
      javascript:
        "/**\n * @param {number} x\n * @return {boolean}\n */\nfunction isPalindrome(x) {\n    // Your code here\n}",
      python: "def isPalindrome(x):\n    # Your code here\n    pass",
      java: "class Solution {\n    public boolean isPalindrome(int x) {\n        // Your code here\n    }\n}",
      cpp: "class Solution {\npublic:\n    bool isPalindrome(int x) {\n        // Your code here\n    }\n};",
    },
  },
  {
    id: 3,
    title: "Valid Parentheses",
    difficulty: "medium",
    description:
      "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid. An input string is valid if: Open brackets must be closed by the same type of brackets, and open brackets must be closed in the correct order.",
    points: 10,
    examples: ['Input: s = "()"\nOutput: true', 'Input: s = "()[]{}"\nOutput: true', 'Input: s = "(]"\nOutput: false'],
    testCases: [
      { input: 's = "()"', expectedOutput: "true" },
      { input: 's = "()[]{}"\nOutput: true', expectedOutput: "true" },
      { input: 's = "(]"', expectedOutput: "false" },
      { input: 's = "([)]"', expectedOutput: "false" },
      { input: 's = "{[]}"', expectedOutput: "true" },
    ],
    startingCode: {
      javascript:
        "/**\n * @param {string} s\n * @return {boolean}\n */\nfunction isValid(s) {\n    // Your code here\n}",
      python: "def isValid(s):\n    # Your code here\n    pass",
      java: "class Solution {\n    public boolean isValid(String s) {\n        // Your code here\n    }\n}",
      cpp: "class Solution {\npublic:\n    bool isValid(string s) {\n        // Your code here\n    }\n};",
    },
  },
  {
    id: 4,
    title: "Maximum Subarray",
    difficulty: "medium",
    description:
      "Given an integer array nums, find the subarray with the largest sum, and return its sum. A subarray is a contiguous non-empty sequence of elements within an array.",
    points: 10,
    examples: [
      "Input: nums = [-2,1,-3,4,-1,2,1,-5,4]\nOutput: 6\nExplanation: The subarray [4,-1,2,1] has the largest sum 6.",
      "Input: nums = [1]\nOutput: 1\nExplanation: The subarray with the largest sum is [1], with a sum of 1.",
      "Input: nums = [5,4,-1,7,8]\nOutput: 23\nExplanation: The subarray with the largest sum is [5,4,-1,7,8], with a sum of 23.",
    ],
    testCases: [
      { input: "nums = [-2,1,-3,4,-1,2,1,-5,4]", expectedOutput: "6" },
      { input: "nums = [1]", expectedOutput: "1" },
      { input: "nums = [5,4,-1,7,8]", expectedOutput: "23" },
    ],
    startingCode: {
      javascript:
        "/**\n * @param {number[]} nums\n * @return {number}\n */\nfunction maxSubArray(nums) {\n    // Your code here\n}",
      python: "def maxSubArray(nums):\n    # Your code here\n    pass",
      java: "class Solution {\n    public int maxSubArray(int[] nums) {\n        // Your code here\n    }\n}",
      cpp: "class Solution {\npublic:\n    int maxSubArray(vector<int>& nums) {\n        // Your code here\n    }\n};",
    },
  },
  {
    id: 5,
    title: "Longest Palindromic Substring",
    difficulty: "hard",
    description:
      "Given a string s, return the longest palindromic substring in s. A palindrome is a string that reads the same backward as forward.",
    points: 20,
    examples: [
      'Input: s = "babad"\nOutput: "bab"\nExplanation: "aba" is also a valid answer.',
      'Input: s = "cbbd"\nOutput: "bb"\nExplanation: "bb" is the longest palindromic substring.',
    ],
    testCases: [
      { input: 's = "babad"', expectedOutput: '"bab"' },
      { input: 's = "cbbd"', expectedOutput: '"bb"' },
      { input: 's = "a"', expectedOutput: '"a"' },
      { input: 's = "ac"', expectedOutput: '"a"' },
    ],
    startingCode: {
      javascript:
        "/**\n * @param {string} s\n * @return {string}\n */\nfunction longestPalindrome(s) {\n    // Your code here\n}",
      python: "def longestPalindrome(s):\n    # Your code here\n    pass",
      java: "class Solution {\n    public String longestPalindrome(String s) {\n        // Your code here\n    }\n}",
      cpp: "class Solution {\npublic:\n    string longestPalindrome(string s) {\n        // Your code here\n    }\n};",
    },
  },
]

