-- Insert or update demo users with bcrypt hashed passwords
-- NOTE: These passwords are all 'password', 'student@123', and 'teacher@123'

-- Student account with password 'password' and 'student@123'
INSERT INTO users (email, password, name, role, points)
VALUES 
  ('student@example.com', '$2b$10$rICguVBMUoA5qC.x7mFTBe0NjZmL8xW5XHvdVr.TK/dkUJzQWFKfC', 'Demo Student', 'student', 50)
ON CONFLICT (email) 
DO UPDATE SET 
  password = '$2b$10$rICguVBMUoA5qC.x7mFTBe0NjZmL8xW5XHvdVr.TK/dkUJzQWFKfC',
  points = 50;

-- Teacher account with password 'password' and 'teacher@123'
INSERT INTO users (email, password, name, role, points)
VALUES 
  ('teacher@example.com', '$2b$10$rICguVBMUoA5qC.x7mFTBe0NjZmL8xW5XHvdVr.TK/dkUJzQWFKfC', 'Demo Teacher', 'teacher', 0)
ON CONFLICT (email) 
DO UPDATE SET 
  password = '$2b$10$rICguVBMUoA5qC.x7mFTBe0NjZmL8xW5XHvdVr.TK/dkUJzQWFKfC';

-- Test account with password 'password'
INSERT INTO users (email, password, name, role, points)
VALUES 
  ('test@example.com', '$2b$10$rICguVBMUoA5qC.x7mFTBe0NjZmL8xW5XHvdVr.TK/dkUJzQWFKfC', 'Test User', 'student', 25)
ON CONFLICT (email) 
DO UPDATE SET 
  password = '$2b$10$rICguVBMUoA5qC.x7mFTBe0NjZmL8xW5XHvdVr.TK/dkUJzQWFKfC',
  points = 25; 