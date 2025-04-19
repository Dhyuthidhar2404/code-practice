const axios = require('axios');
require('dotenv').config();

// Configuration constants
const JUDGE0_API = process.env.JUDGE0_API || 'https://judge0-ce.p.rapidapi.com';
const JUDGE0_KEY = process.env.JUDGE0_KEY;
const JUDGE0_HOST = process.env.JUDGE0_HOST || 'judge0-ce.p.rapidapi.com';

// Validate API key on module load
if (!JUDGE0_KEY) {
  console.error('FATAL: Judge0 API Key is not set. Code execution will fail.');
}

// Comprehensive Language IDs for Judge0
const LANGUAGE_IDS = {
  // Scripting Languages
  javascript: 63,
  python: 71,
  ruby: 72,
  php: 68,
  typescript: 74,
  perl: 54,
  
  // Compiled Languages
  java: 62,
  cpp: 54,
  c: 50,
  'c#': 51,
  go: 60,
  rust: 93,
  swift: 85,
  kotlin: 78,
  scala: 81,
  
  // Other Languages
  haskell: 81,
  lua: 64,
  r: 80,
  dart: 91
};

// Status mapping for better error understanding
const SUBMISSION_STATUSES = {
  1: 'In Queue',
  2: 'Processing',
  3: 'Accepted',
  4: 'Wrong Answer',
  5: 'Time Limit Exceeded',
  6: 'Compilation Error',
  7: 'Runtime Error',
  8: 'Memory Limit Exceeded',
  9: 'Output Limit Exceeded',
  10: 'File I/O Error',
  11: 'Abnormal Termination',
  12: 'Internal Error'
};

// Get language ID with flexible input
const getLanguageId = (language) => {
  if (typeof language === 'number') return language;
  
  const normalizedLanguage = String(language).toLowerCase();
  const languageId = LANGUAGE_IDS[normalizedLanguage];
  
  if (!languageId) {
    throw new Error(`Unsupported language: ${language}`);
  }
  
  return languageId;
};

// Submit code to Judge0 API
const submitCode = async (code, language, stdin = '', options = {}) => {
  // Default options
  const {
    timeout = 10000,  // 10 seconds
    maxAttempts = 10,
    logExecution = false
  } = options;

  // Input validation
  if (!code) {
    throw new Error('Code is required');
  }

  try {
    // Resolve language ID
    const languageId = getLanguageId(language);

    // Optional logging
    if (logExecution) {
      console.log('Code Submission Details:', {
        language,
        languageId,
        codeLength: code.length,
        inputLength: stdin.length
      });
    }

    // Create submission
    const submissionResponse = await axios({
      method: 'POST',
      url: `${JUDGE0_API}/submissions`,
      params: { base64_encoded: 'false', fields: '*' },
      headers: {
        'content-type': 'application/json',
        'X-RapidAPI-Key': JUDGE0_KEY,
        'X-RapidAPI-Host': JUDGE0_HOST
      },
      data: {
        source_code: code,
        language_id: languageId,
        stdin: stdin,
        redirect_stderr_to_stdout: true,
        compile_output_only: false
      }
    });

    const token = submissionResponse.data.token;

    // Polling function for submission result
    const getSubmissionResult = async (submissionToken) => {
      const resultResponse = await axios({
        method: 'GET',
        url: `${JUDGE0_API}/submissions/${submissionToken}`,
        params: { base64_encoded: 'false', fields: '*' },
        headers: {
          'X-RapidAPI-Key': JUDGE0_KEY,
          'X-RapidAPI-Host': JUDGE0_HOST
        }
      });
      
      return resultResponse.data;
    };

    // Poll for results with timeout and attempt limit
    let result;
    let attempts = 0;
    const startTime = Date.now();

    do {
      // Wait before next attempt
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      result = await getSubmissionResult(token);
      attempts++;

      // Check for timeout
      if (Date.now() - startTime > timeout) {
        throw new Error('Submission timed out');
      }
    } while (result.status.id <= 2 && attempts < maxAttempts);

    // Enrich result with human-readable status
    result.statusDescription = SUBMISSION_STATUSES[result.status.id] || 'Unknown Status';

    // Log result for debugging
    if (logExecution) {
      console.log('Submission Result:', {
        status: result.statusDescription,
        time: result.time,
        memory: result.memory
      });
    }

    return result;
  } catch (error) {
    // Comprehensive error logging
    console.error('Code Submission Error:', {
      message: error.message,
      details: error.response ? error.response.data : null
    });

    // Throw a meaningful error
    throw new Error(
      error.response 
        ? `Code execution failed: ${error.response.data.message || 'Unknown error'}` 
        : error.message
    );
  }
};

module.exports = {
  submitCode,
  LANGUAGE_IDS,
  getLanguageId,
  SUBMISSION_STATUSES
};