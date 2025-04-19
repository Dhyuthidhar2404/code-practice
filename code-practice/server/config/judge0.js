const axios = require('axios');
require('dotenv').config();

// Judge0 API configuration
const JUDGE0_API = process.env.JUDGE0_API || 'https://judge0-ce.p.rapidapi.com';
const JUDGE0_API_KEY = process.env.JUDGE0_API_KEY || '78f149d28cmsh20fe71cbdf33180p17affajsn4358bd4fe871';
const JUDGE0_API_HOST = process.env.JUDGE0_API_HOST || 'judge0-ce.p.rapidapi.com';

// Rate limiting configuration
const RATE_LIMIT_DELAY = 2000; // 2 seconds between requests
const MAX_RETRIES = 3;         // Maximum number of retries
const COOLDOWN_PERIOD = 60000; // 1 minute cooldown after hitting rate limits

// Log the configuration (omit sensitive parts of the key)
const maskedKey = JUDGE0_API_KEY ? 
  JUDGE0_API_KEY.substring(0, 5) + '...' + JUDGE0_API_KEY.substring(JUDGE0_API_KEY.length - 5) : 
  'not set';
console.log(`Judge0 API configuration: 
  API URL: ${JUDGE0_API}
  API Host: ${JUDGE0_API_HOST}
  API Key: ${maskedKey}
  Rate limit delay: ${RATE_LIMIT_DELAY}ms
  Max retries: ${MAX_RETRIES}
  Cooldown period: ${COOLDOWN_PERIOD}ms
`);

// Language mapping (from your app's language names to Judge0 language IDs)
const languageMap = {
  javascript: 63,  // JavaScript (Node.js 12.14.0)
  typescript: 74,  // TypeScript (4.2.3)
  python: 71,      // Python (3.8.1)
  java: 62,        // Java (OpenJDK 13.0.1)
  cpp: 54,         // C++ (GCC 9.2.0)
  csharp: 51,      // C# (Mono 6.6.0)
  rust: 73,        // Rust (1.40.0)
  go: 59,          // Go (1.13.5)
  php: 68,         // PHP (7.4.1)
  ruby: 72,        // Ruby (2.7.0)
  // Add more languages as needed
};

// Basic headers for all requests
const getHeaders = () => ({
  'content-type': 'application/json',
  'X-RapidAPI-Key': JUDGE0_API_KEY,
  'X-RapidAPI-Host': JUDGE0_API_HOST
});

module.exports = {
  JUDGE0_API,
  languageMap,
  getHeaders,
  RATE_LIMIT_DELAY,
  MAX_RETRIES,
  COOLDOWN_PERIOD
};