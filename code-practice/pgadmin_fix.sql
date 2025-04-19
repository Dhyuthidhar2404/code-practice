-- Set test_cases for problems if not already set
UPDATE problems
SET test_cases = COALESCE(test_cases, 
  jsonb_build_array(
    jsonb_build_object(
      'id', 1,
      'input', 'nums = [2, 7, 11, 15], target = 9',
      'expectedOutput', '[0, 1]'
    ),
    jsonb_build_object(
      'id', 2,
      'input', 'nums = [3, 2, 4], target = 6',
      'expectedOutput', '[1, 2]'
    ),
    jsonb_build_object(
      'id', 3,
      'input', 'nums = [3, 3], target = 6',
      'expectedOutput', '[0, 1]'
    )
  )::jsonb
)
WHERE id = 1 AND (test_cases IS NULL OR test_cases::text = '[]' OR test_cases::text = 'null');

UPDATE problems
SET test_cases = COALESCE(test_cases, 
  jsonb_build_array(
    jsonb_build_object(
      'id', 1,
      'input', 's = ["h","e","l","l","o"]',
      'expectedOutput', '["o","l","l","e","h"]'
    ),
    jsonb_build_object(
      'id', 2,
      'input', 's = ["H","a","n","n","a","h"]',
      'expectedOutput', '["h","a","n","n","a","H"]'
    )
  )::jsonb
)
WHERE id = 2 AND (test_cases IS NULL OR test_cases::text = '[]' OR test_cases::text = 'null');

UPDATE problems
SET test_cases = COALESCE(test_cases, 
  jsonb_build_array(
    jsonb_build_object(
      'id', 1,
      'input', 'x = 121',
      'expectedOutput', 'true'
    ),
    jsonb_build_object(
      'id', 2,
      'input', 'x = -121',
      'expectedOutput', 'false'
    ),
    jsonb_build_object(
      'id', 3,
      'input', 'x = 10',
      'expectedOutput', 'false'
    )
  )::jsonb
)
WHERE id = 3 AND (test_cases IS NULL OR test_cases::text = '[]' OR test_cases::text = 'null');

-- Verify test cases were set correctly
SELECT id, title, test_cases FROM problems; 