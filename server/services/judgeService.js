// server/services/judgeService.js
const axios = require('axios');
require('dotenv').config();

// Configuration constants
const JUDGE0_API = process.env.JUDGE0_API || 'https://judge0-ce.p.rapidapi.com';
const JUDGE0_KEY = process.env.JUDGE0_KEY;
const JUDGE0_HOST = process.env.JUDGE0_HOST || 'judge0-ce.p.rapidapi.com';

// Validate API key on module load
if (!JUDGE0_KEY) {
  console.warn('WARNING: Judge0 API Key is not set. Code execution will be simulated in development mode.');
}

// Comprehensive Language IDs for Judge0
const LANGUAGE_IDS = {
  // Scripting Languages
  JAVASCRIPT: 63,
  PYTHON: 71,
  RUBY: 72,
  PHP: 68,
  TYPESCRIPT: 74,
  PERL: 54,
  
  // Compiled Languages
  JAVA: 62,
  CPP: 54,
  C: 50,
  'C#': 51,
  GO: 60,
  RUST: 93,
  SWIFT: 85,
  KOTLIN: 78,
  SCALA: 81,
  
  // Other Languages
  HASKELL: 81,
  LUA: 64,
  R: 80,
  DART: 91
};

// Add lowercase mappings for easier lookup
Object.entries(LANGUAGE_IDS).forEach(([key, value]) => {
  LANGUAGE_IDS[key.toLowerCase()] = value;
});

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
    throw new Error(`Unsupported language: ${language}. Supported languages are: ${Object.keys(LANGUAGE_IDS).filter(k => !k.includes('_') && k === k.toUpperCase()).join(', ')}`);
  }
  
  return languageId;
};

// Simulate code execution in development mode when no API key is present
const simulateCodeExecution = async (code, language, stdin = '') => {
  console.log('DEVELOPMENT MODE: Simulating code execution');
  
  // Wait a random amount of time to simulate processing
  await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
  
  // Simple test for if it's a "Hello World" program
  const isHelloWorld = code.includes('Hello') || code.includes('hello');
  
  // For JavaScript, try to actually evaluate simple code
  let evaluatedOutput = '';
  if (language === LANGUAGE_IDS.JAVASCRIPT || language === LANGUAGE_IDS.javascript) {
    try {
      // CAUTION: eval is dangerous in production, but this is just for dev simulation
      // Create a sandbox function that takes stdin as input
      const sandboxFn = new Function('input', `
        const console = { log: function(...args) { return args.join(' '); } };
        try {
          ${code}
          return 'Execution completed successfully';
        } catch(e) {
          return 'Runtime error: ' + e.message;
        }
      `);
      evaluatedOutput = sandboxFn(stdin);
    } catch (e) {
      evaluatedOutput = `Compilation error: ${e.message}`;
    }
  }
  
  return {
    status: { id: 3, description: 'Accepted' },
    statusDescription: 'Accepted',
    stdout: isHelloWorld ? 'Hello, World!' : evaluatedOutput || 'Execution completed successfully',
    stderr: '',
    compile_output: '',
    time: (Math.random() * 0.5).toFixed(3),
    memory: Math.floor(Math.random() * 5000),
    simulated: true  // Flag to indicate this was simulated
  };
};

// Rate limiting helper
const rateLimiter = {
  queue: [],
  processing: false,
  
  async execute(fn) {
    return new Promise((resolve, reject) => {
      this.queue.push({ fn, resolve, reject });
      this.processQueue();
    });
  },
  
  async processQueue() {
    if (this.processing || this.queue.length === 0) return;
    
    this.processing = true;
    const { fn, resolve, reject } = this.queue.shift();
    
    try {
      resolve(await fn());
    } catch (error) {
      reject(error);
    } finally {
      this.processing = false;
      // Wait 300ms between API calls to avoid rate limits
      setTimeout(() => this.processQueue(), 300);
    }
  }
};

// Submit code to Judge0 API
const submitCode = async (code, language, stdin = '', options = {}) => {
  // Default options
  const {
    timeout = 15000,  // 15 seconds
    maxAttempts = 15,
    logExecution = false,
    waitBetweenPolls = 1000
  } = options;

  // Input validation
  if (!code) {
    throw new Error('Code is required');
  }

  // If no API key is set, use simulation for development
  if (!JUDGE0_KEY) {
    return simulateCodeExecution(code, language, stdin);
  }

  // Use rate limiter for API calls
  return rateLimiter.execute(async () => {
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
        },
        timeout: 10000 // 10s timeout for the initial request
      });

      const token = submissionResponse.data.token;

      // Polling function for submission result
      const getSubmissionResult = async (submissionToken) => {
        try {
          const resultResponse = await axios({
            method: 'GET',
            url: `${JUDGE0_API}/submissions/${submissionToken}`,
            params: { base64_encoded: 'false', fields: '*' },
            headers: {
              'X-RapidAPI-Key': JUDGE0_KEY,
              'X-RapidAPI-Host': JUDGE0_HOST
            },
            timeout: 5000 // 5s timeout for polling requests
          });
          
          return resultResponse.data;
        } catch (error) {
          if (error.response && error.response.status === 429) {
            // Handle rate limiting
            console.warn('Rate limited by Judge0 API, waiting longer before retry');
            await new Promise(resolve => setTimeout(resolve, 2000)); // Wait longer
            return { status: { id: 1, description: 'In Queue' } };
          }
          throw error;
        }
      };

      // Poll for results with timeout and attempt limit
      let result;
      let attempts = 0;
      const startTime = Date.now();

      do {
        // Wait before next attempt, increasing delay if taking a long time
        const delay = attempts > 5 ? waitBetweenPolls * 2 : waitBetweenPolls;
        await new Promise(resolve => setTimeout(resolve, delay));
        
        result = await getSubmissionResult(token);
        attempts++;

        // Check for timeout
        if (Date.now() - startTime > timeout) {
          throw new Error('Submission timed out after ' + (timeout / 1000) + ' seconds');
        }
        
        // Extra safety check
        if (attempts >= maxAttempts) {
          throw new Error(`Max polling attempts (${maxAttempts}) reached`);
        }
      } while (result.status.id <= 2 && attempts < maxAttempts);

      // Enrich result with human-readable status
      result.statusDescription = SUBMISSION_STATUSES[result.status.id] || 'Unknown Status';

      // Normalize outputs for consistency
      result.stdout = result.stdout || '';
      result.stderr = result.stderr || '';
      result.compile_output = result.compile_output || '';

      // Log result for debugging
      if (logExecution) {
        console.log('Submission Result:', {
          status: result.statusDescription,
          time: result.time,
          memory: result.memory,
          outputLength: (result.stdout || '').length,
          errorLength: (result.stderr || '').length
        });
      }

      return result;
    } catch (error) {
      // Comprehensive error logging
      console.error('Code Submission Error:', {
        message: error.message,
        details: error.response ? {
          status: error.response.status,
          data: error.response.data
        } : 'No response details',
        code: error.code
      });

      // Handle specific error cases
      if (error.code === 'ECONNABORTED') {
        throw new Error('Connection to Judge0 API timed out. Please try again later.');
      }
      
      if (error.response) {
        if (error.response.status === 429) {
          throw new Error('Judge0 API rate limit exceeded. Please try again in a few moments.');
        }
        throw new Error(`Code execution failed: ${error.response.data.message || `Server responded with status ${error.response.status}`}`);
      }

      // Generic error
      throw new Error(`Code execution failed: ${error.message}`);
    }
  });
};

module.exports = {
  submitCode,
  LANGUAGE_IDS,
  getLanguageId,
  SUBMISSION_STATUSES
};