-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('student', 'teacher')),
  points INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Problems table
CREATE TABLE IF NOT EXISTS problems (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  difficulty VARCHAR(20) NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  points INTEGER NOT NULL,
  test_cases JSONB NOT NULL,
  examples TEXT[] NOT NULL,
  starting_code JSONB NOT NULL,
  is_public BOOLEAN DEFAULT TRUE,
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  tags TEXT[]
);

-- Submissions table
CREATE TABLE IF NOT EXISTS submissions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) NOT NULL,
  problem_id INTEGER REFERENCES problems(id) NOT NULL,
  code TEXT NOT NULL,
  language VARCHAR(50) NOT NULL,
  passed BOOLEAN NOT NULL,
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  execution_time FLOAT,
  memory_used INTEGER
);

-- Insert sample users
INSERT INTO users (email, password, name, role, points)
VALUES 
  ('student@example.com', '$2b$10$rICguVBMUoA5qC.x7mFTBe0NjZmL8xW5XHvdVr.TK/dkUJzQWFKfC', 'Demo Student', 'student', 0),
  ('teacher@example.com', '$2b$10$rICguVBMUoA5qC.x7mFTBe0NjZmL8xW5XHvdVr.TK/dkUJzQWFKfC', 'Demo Teacher', 'teacher', 0)
ON CONFLICT (email) DO NOTHING;

-- Insert sample problems
INSERT INTO problems (title, description, difficulty, points, test_cases, examples, starting_code, is_public, created_by, tags)
VALUES (
  'Two Sum',
  'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice.',
  'easy',
  10,
  '[
    {"input": "nums = [2,7,11,15], target = 9", "expectedOutput": "[0,1]"},
    {"input": "nums = [3,2,4], target = 6", "expectedOutput": "[1,2]"},
    {"input": "nums = [3,3], target = 6", "expectedOutput": "[0,1]"}
  ]',
  ARRAY['Example 1: Input: nums = [2,7,11,15], target = 9 Output: [0,1] Explanation: Because nums[0] + nums[1] == 9, we return [0, 1].', 
        'Example 2: Input: nums = [3,2,4], target = 6 Output: [1,2]', 
        'Example 3: Input: nums = [3,3], target = 6 Output: [0,1]'],
  '{
    "javascript": "/**\n * @param {number[]} nums\n * @param {number} target\n * @return {number[]}\n */\nfunction twoSum(nums, target) {\n  // Write your code here\n}",
    "python": "def twoSum(nums, target):\n    # Write your code here\n    pass",
    "java": "class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        // Write your code here\n    }\n}",
    "cpp": "class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        // Write your code here\n    }\n};"
  }',
  TRUE,
  2,
  ARRAY['array', 'hash-table', 'beginner']
),
(
  'Reverse String',
  'Write a function that reverses a string. The input string is given as an array of characters.',
  'easy',
  5,
  '[
    {"input": "s = [\"h\",\"e\",\"l\",\"l\",\"o\"]", "expectedOutput": "[\"o\",\"l\",\"l\",\"e\",\"h\"]"},
    {"input": "s = [\"H\",\"a\",\"n\",\"n\",\"a\",\"h\"]", "expectedOutput": "[\"h\",\"a\",\"n\",\"n\",\"a\",\"H\"]"}
  ]',
  ARRAY['Example 1: Input: s = ["h","e","l","l","o"] Output: ["o","l","l","e","h"]', 
        'Example 2: Input: s = ["H","a","n","n","a","h"] Output: ["h","a","n","n","a","H"]'],
  '{
    "javascript": "/**\n * @param {character[]} s\n * @return {void} Do not return anything, modify s in-place instead.\n */\nfunction reverseString(s) {\n  // Write your code here\n}",
    "python": "def reverseString(s):\n    \"\"\"\n    :type s: List[str]\n    :rtype: None Do not return anything, modify s in-place instead.\n    \"\"\"\n    # Write your code here\n    pass",
    "java": "class Solution {\n    public void reverseString(char[] s) {\n        // Write your code here\n    }\n}",
    "cpp": "class Solution {\npublic:\n    void reverseString(vector<char>& s) {\n        // Write your code here\n    }\n};"
  }',
  TRUE,
  2,
  ARRAY['string', 'two-pointers', 'beginner']
),
(
  'Palindrome Number',
  'Given an integer x, return true if x is a palindrome, and false otherwise.',
  'medium',
  15,
  '[
    {"input": "x = 121", "expectedOutput": "true"},
    {"input": "x = -121", "expectedOutput": "false"},
    {"input": "x = 10", "expectedOutput": "false"}
  ]',
  ARRAY['Example 1: Input: x = 121 Output: true Explanation: 121 reads as 121 from left to right and from right to left.', 
        'Example 2: Input: x = -121 Output: false Explanation: From left to right, it reads -121. From right to left, it becomes 121-. Therefore it is not a palindrome.', 
        'Example 3: Input: x = 10 Output: false Explanation: Reads 01 from right to left. Therefore it is not a palindrome.'],
  '{
    "javascript": "/**\n * @param {number} x\n * @return {boolean}\n */\nfunction isPalindrome(x) {\n  // Write your code here\n}",
    "python": "def isPalindrome(x):\n    \"\"\"\n    :type x: int\n    :rtype: bool\n    \"\"\"\n    # Write your code here\n    pass",
    "java": "class Solution {\n    public boolean isPalindrome(int x) {\n        // Write your code here\n    }\n}",
    "cpp": "class Solution {\npublic:\n    bool isPalindrome(int x) {\n        // Write your code here\n    }\n};"
  }',
  TRUE,
  2,
  ARRAY['math', 'string', 'intermediate']
)
ON CONFLICT DO NOTHING;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_submissions_user_id ON submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_submissions_problem_id ON submissions(problem_id);
CREATE INDEX IF NOT EXISTS idx_problems_difficulty ON problems(difficulty);
CREATE INDEX IF NOT EXISTS idx_problems_is_public ON problems(is_public);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role); 