-- Check if users table exists
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_schema = 'public'
   AND table_name = 'users'
);

-- First, query to see the user ids we need to preserve
SELECT id, email, name, role, points FROM users
WHERE email IN ('student@example.com', 'teacher@example.com', 'test@example.com');

-- Instead of deleting the users, we'll update them to maintain foreign key relationships
-- Update the teacher account (preserve the ID but update other details)
UPDATE users
SET 
  password = '$2a$10$rICguVBMUoA5qC.x7mFTBe0NjZmL8xW5XHvdVr.TK/dkUJzQWFKfC',
  name = 'Demo Teacher',
  role = 'teacher',
  points = 0
WHERE email = 'teacher@example.com'
OR id = 2; -- Update by ID as well in case email was changed

-- Update or insert student account
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM users WHERE email = 'student@example.com') THEN
    -- Update if exists
    UPDATE users
    SET 
      password = '$2a$10$rICguVBMUoA5qC.x7mFTBe0NjZmL8xW5XHvdVr.TK/dkUJzQWFKfC',
      name = 'Demo Student',
      role = 'student',
      points = 50
    WHERE email = 'student@example.com';
  ELSE
    -- Insert if doesn't exist
    INSERT INTO users (email, password, name, role, points)
    VALUES ('student@example.com', '$2a$10$rICguVBMUoA5qC.x7mFTBe0NjZmL8xW5XHvdVr.TK/dkUJzQWFKfC', 'Demo Student', 'student', 50);
  END IF;
END $$;

-- Update or insert test account
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM users WHERE email = 'test@example.com') THEN
    -- Update if exists
    UPDATE users
    SET 
      password = '$2a$10$rICguVBMUoA5qC.x7mFTBe0NjZmL8xW5XHvdVr.TK/dkUJzQWFKfC',
      name = 'Test User',
      role = 'student',
      points = 25
    WHERE email = 'test@example.com';
  ELSE
    -- Insert if doesn't exist
    INSERT INTO users (email, password, name, role, points)
    VALUES ('test@example.com', '$2a$10$rICguVBMUoA5qC.x7mFTBe0NjZmL8xW5XHvdVr.TK/dkUJzQWFKfC', 'Test User', 'student', 25);
  END IF;
END $$;

-- Change password hash format if needed (PostgreSQL version compatibility)
UPDATE users 
SET password = REPLACE(password, '$2a$', '$2y$') 
WHERE email IN ('student@example.com', 'teacher@example.com', 'test@example.com')
AND password LIKE '$2a$%';

-- Verify users were updated correctly
SELECT id, email, name, role, points FROM users
WHERE email IN ('student@example.com', 'teacher@example.com', 'test@example.com');

-- Check problems relationships
SELECT p.id, p.title, p.created_by, u.email, u.name, u.role
FROM problems p
JOIN users u ON p.created_by = u.id
ORDER BY p.id;

-- Verify problems table exists and has data
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_schema = 'public'
   AND table_name = 'problems'
);

-- Check if we have problems in the database
SELECT COUNT(*) FROM problems; 