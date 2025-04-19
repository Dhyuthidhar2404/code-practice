/**
 * Compiler Service - Handles code execution requests to the backend
 */

// Define API response types for better type safety
export interface ExecutionResult {
  stdout?: string;
  stderr?: string;
  compile_output?: string;
  message?: string;
  memory?: number;
  time?: number;
  token?: string;
  status?: {
    id: number;
    description: string;
  };
}

export interface SubmissionRequest {
  code: string;
  language_id: number;
  stdin?: string;
}

// Map language identifiers to their respective IDs
export const languageIdMap: Record<string, number> = {
  javascript: 63,
  typescript: 74,
  python: 71,
  java: 62,
  cpp: 54,
  csharp: 51,
  rust: 73,
  go: 59,
  php: 68,
  ruby: 72
};

/**
 * Execute code using the backend API
 * @param code Source code to execute
 * @param languageValue Language identifier (from languageOptions)
 * @param input Standard input for the program
 * @returns Promise with execution result
 */
export const executeCode = async (
  code: string,
  languageValue: string,
  input: string = ''
): Promise<ExecutionResult> => {
  try {
    console.log(`Executing ${languageValue} code...`);
    
    // Validate input parameters
    if (!code || code.trim() === '') {
      throw new Error('No code provided');
    }
    
    // Find language ID from the language value
    const languageId = languageIdMap[languageValue];
    if (!languageId) {
      throw new Error(`Unsupported language: ${languageValue}`);
    }

    // Get the API base URL from environment or use default
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';
    console.log(`Using API endpoint: ${API_BASE_URL}/submissions/execute`);
    
    // Make API request to the server
    try {
      const response = await fetch(`${API_BASE_URL}/submissions/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code,
          language_id: languageId,
          stdin: input
        }),
        signal: AbortSignal.timeout(30000) // 30 second timeout
      });

      if (!response.ok) {
        const errorData = await response.text();
        let errorMessage;
        try {
          // Try to parse as JSON
          const errorJson = JSON.parse(errorData);
          errorMessage = errorJson.message || errorJson.error || `HTTP error ${response.status}`;
        } catch {
          // If not JSON, use text as is
          errorMessage = errorData || `HTTP error ${response.status}`;
        }
        throw new Error(`API Error (${response.status}): ${errorMessage}`);
      }

      const result = await response.json();
      console.log('Execution result:', result);
      
      return {
        stdout: result.stdout || '',
        stderr: result.stderr || '',
        compile_output: result.compile_output || '',
        message: result.message || '',
        memory: result.memory_used || 0,
        time: result.execution_time || 0,
        status: result.status
      };
    } catch (fetchError: any) {
      // Specific error handling for fetch issues
      if (fetchError.name === 'AbortError') {
        throw new Error('Request timed out. The server took too long to respond.');
      }
      if (fetchError.message.includes('NetworkError')) {
        throw new Error('Network error. Please check your internet connection.');
      }
      throw fetchError; // Re-throw other errors
    }
  } catch (error) {
    console.error('Error executing code:', error);
    return {
      stderr: error instanceof Error ? error.message : 'Unknown error occurred',
      status: {
        id: 500,
        description: 'Internal Server Error'
      }
    };
  }
};

/**
 * Execute code on local backend server
 */
const executeCodeOnLocalBackend = async (
  code: string,
  languageId: number,
  input: string
): Promise<ExecutionResult> => {
  try {
    const response = await fetch('http://localhost:5000/api/submissions/execute', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code: code,
        language_id: languageId,
        stdin: input
      }),
      signal: AbortSignal.timeout(30000) // 30 second timeout
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    console.log('Local backend response:', data);
    
    // Map the local backend response to our expected format
    return {
      stdout: data.stdout || data.output || '',
      stderr: data.stderr || data.error || '',
      compile_output: data.compile_output || '',
      message: data.message || '',
      memory: data.memory_used || 0,
      time: data.execution_time || 0,
      status: data.status || { id: 0, description: 'Success' }
    };
  } catch (error) {
    console.error('Local backend execution error:', error);
    throw error;
  }
};

/**
 * Execute code on Judge0 RapidAPI
 */
const executeCodeOnRapidApi = async (
  code: string,
  languageId: number,
  input: string
): Promise<ExecutionResult> => {
  try {
    // Check if RapidAPI credentials are available
    const rapidApiKey = process.env.NEXT_PUBLIC_RAPID_API_KEY;
    const rapidApiHost = process.env.NEXT_PUBLIC_RAPID_API_HOST;
    const rapidApiUrl = process.env.NEXT_PUBLIC_RAPID_API_URL;
    
    if (!rapidApiKey || !rapidApiHost || !rapidApiUrl) {
      throw new Error('RapidAPI credentials are not configured');
    }
    
    // Encode the code and input in base64
    const base64Code = btoa(code);
    const base64Input = input ? btoa(input) : '';
    
    // Submit code to Judge0 API
    const submissionResponse = await fetch(rapidApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-RapidAPI-Key': rapidApiKey,
        'X-RapidAPI-Host': rapidApiHost
      },
      body: JSON.stringify({
        language_id: languageId,
        source_code: base64Code,
        stdin: base64Input,
        base64_encoded: true
      })
    });
    
    if (!submissionResponse.ok) {
      throw new Error(`RapidAPI submission error: ${submissionResponse.status}`);
    }
    
    const submissionData = await submissionResponse.json();
    const token = submissionData.token;
    
    if (!token) {
      throw new Error('No token received from Judge0 API');
    }
    
    // Use the token to get the results
    let result = await checkSubmissionStatus(token, rapidApiUrl, rapidApiHost, rapidApiKey);
    return result;
  } catch (error) {
    console.error('RapidAPI execution error:', error);
    throw error;
  }
};

/**
 * Check the status of a Judge0 submission
 */
const checkSubmissionStatus = async (
  token: string,
  rapidApiUrl: string,
  rapidApiHost: string,
  rapidApiKey: string
): Promise<ExecutionResult> => {
  try {
    // Poll the submission status until it's completed or times out
    let maxAttempts = 10;
    let attemptDelay = 1000; // 1 second
    
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const statusResponse = await fetch(`${rapidApiUrl}/${token}?base64_encoded=true&fields=*`, {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': rapidApiKey,
          'X-RapidAPI-Host': rapidApiHost
        }
      });
      
      if (!statusResponse.ok) {
        throw new Error(`Status check failed: ${statusResponse.status}`);
      }
      
      const data = await statusResponse.json();
      
      // Check if the submission is still processing
      if (data.status?.id <= 2) { // 1-2 are processing states
        // Wait before checking again
        await new Promise(resolve => setTimeout(resolve, attemptDelay));
        continue;
      }
      
      // Decode base64 outputs
      const stdout = data.stdout ? atob(data.stdout) : '';
      const stderr = data.stderr ? atob(data.stderr) : '';
      const compile_output = data.compile_output ? atob(data.compile_output) : '';
      
      return {
        stdout,
        stderr,
        compile_output,
        message: data.message || '',
        memory: data.memory,
        time: data.time,
        token: token,
        status: data.status
      };
    }
    
    throw new Error('Execution timed out after multiple attempts');
  } catch (error) {
    console.error('Status check error:', error);
    throw error;
  }
}; 