# CodePractice Project

This is a practice platform for coding exercises and challenges built with Next.js.

## Recent Updates

### Todo List Component

A new Todo List component has been added to help users manage tasks:

- Create new tasks
- Mark tasks as completed
- Delete tasks
- Track progress with a completion counter

The Todo component is accessible from the main navigation bar. It doesn't require login, making it available to all users.

### Question Solving System

The question solving system has been enhanced:

- Students can now solve coding challenges and earn points
- Points are displayed in the top-right corner of the questions and question detail pages
- Correctly solved questions are tracked in the database
- Progress statistics show completion rates
- Teacher users can create and manage problems

## Features

- Interactive code editor with syntax highlighting
- Code execution system
- Coding challenges with different difficulty levels
- Points and rewards system
- User authentication for students and teachers
- Teacher dashboard for managing questions and viewing student performance

## Tech Stack

- Next.js
- React
- TypeScript
- TailwindCSS
- Shadcn UI Components
- PostgreSQL database

## Getting Started

### Prerequisites

- Node.js 16+
- NPM or Yarn
- PostgreSQL database

### Database Setup

1. Install PostgreSQL if you don't have it already
2. Create a new database called `code_practice`:
   ```sql
   CREATE DATABASE code_practice;
   ```
3. Copy the `.env.example` file to `.env` and update the `DATABASE_URL` if needed:
   ```
   cp .env.example .env
   ```
4. Run the database setup script:
   ```
   npm run db:setup
   ```
   
This will create all necessary tables and populate them with sample data, including:
- Sample users (student and teacher)
- Sample coding problems
- Database indexes for performance

### Sample User Credentials

- **Student User**: student@example.com / password
- **Teacher User**: teacher@example.com / password

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd code-practice
```

2. Install dependencies:

```bash
npm install
```

3. Set up the database (as described above)

### Running the Application

To run both the frontend and backend:

```bash
npm run dev:all
```

This will start:
- The Next.js frontend on http://localhost:3000
- The backend API server on http://localhost:5000

To run only the frontend:

```bash
npm run dev
```

To run only the backend:

```bash
npm run server
```

## Usage

1. Log in with one of the sample accounts or register a new account
2. Navigate to the Questions page to browse available coding challenges
3. Click "Solve Challenge" on any question
4. Write your solution in the code editor
5. Click "Submit Solution" to test your solution
6. Earn points for correctly solved problems

## Keyboard Shortcuts

- **Ctrl+Enter**: Run/Submit code
- **Ctrl+Shift+D**: Toggle debug mode

## Troubleshooting

### API Connection Issues

If you encounter API connection issues:

1. Ensure the backend server is running (`npm run server`)
2. Check that your JUDGE0_API_KEY is valid
3. Enable debug mode to see detailed logs
4. Check browser console for any errors

### Theme Loading Issues

If themes are not loading correctly:

1. Try using one of the built-in themes: VS Dark, VS Light, Oceanic Next, Monokai, or GitHub
2. Check browser console for theme loading errors

## License

This project is licensed under the MIT License. 