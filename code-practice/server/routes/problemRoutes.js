// Get a problem by ID
const getProblemById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      `SELECT p.*, u.name as creator_name 
       FROM problems p 
       LEFT JOIN users u ON p.created_by = u.id
       WHERE p.id = $1`,
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Problem not found' });
    }
    
    const problem = result.rows[0];
    
    // Process test cases to ensure they are in the right format
    if (problem.test_cases) {
      try {
        // Ensure test_cases is parsed as JSON if it's a string
        if (typeof problem.test_cases === 'string') {
          problem.test_cases = JSON.parse(problem.test_cases);
        }
        
        // Format test cases if needed
        if (!Array.isArray(problem.test_cases)) {
          problem.test_cases = [];
          console.warn(`Problem ${id} has invalid test_cases format, resetting to empty array`);
        }
      } catch (parseError) {
        console.error(`Error parsing test_cases for problem ${id}:`, parseError);
        problem.test_cases = [];
      }
    } else {
      problem.test_cases = [];
    }
    
    // Check if the user has already solved this problem
    if (req.user) {
      const solvedResult = await pool.query(
        'SELECT * FROM submissions WHERE user_id = $1 AND problem_id = $2 AND passed = true',
        [req.user.id, id]
      );
      
      problem.solved = solvedResult.rows.length > 0;
    } else {
      problem.solved = false;
    }
    
    res.json(problem);
  } catch (error) {
    console.error('Error getting problem:', error);
    res.status(500).json({ error: 'Failed to get problem' });
  }
}; 