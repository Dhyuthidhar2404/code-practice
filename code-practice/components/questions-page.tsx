"use client"

import { useState, useEffect } from 'react';
import { Trophy } from "lucide-react";
import { useAppContext } from "./app-context";

// API response type
type ApiProblem = {
  id: string | number;
  title: string;
  description: string;
  difficulty: string;
  points?: number;
  testCases?: any;
  createdAt?: string;
  tags?: string[];
  [key: string]: any; // For any other properties
}

// Frontend Question type with strict difficulty typing
type Question = {
  id: string | number;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
  tags?: string[];
}

export default function QuestionsPage() {
  const { solvedQuestions, openQuestion, userPoints } = useAppContext();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState<'all' | 'easy' | 'medium' | 'hard'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Calculate points based on difficulty
  const getDifficultyPoints = (difficulty: string): number => {
    switch(difficulty?.toLowerCase()) {
      case 'easy': return 10;
      case 'medium': return 20;
      case 'hard': return 30;
      default: return 5;
    }
  };

  useEffect(() => {
    async function fetchQuestions() {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('token');
        
        console.log('Fetching problems from API...');
        const response = await fetch('http://localhost:5000/api/problems', {
          method: 'GET',
          headers: {
            'Authorization': token ? `Bearer ${token}` : '',
            'Content-Type': 'application/json'
          }
        });
        
        console.log('Response status:', response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Server response:', errorText);
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Raw API Response:', data);
  
        // Determine where the problems array is located in the response
        let problemsArray: ApiProblem[] = [];
        
        if (Array.isArray(data)) {
          // Direct array response
          problemsArray = data;
          console.log('Found direct array of problems');
        } else if (data.problems && Array.isArray(data.problems)) {
          // { problems: [...] } format
          problemsArray = data.problems;
          console.log('Found problems in data.problems');
        } else if (data.data && Array.isArray(data.data)) {
          // { data: [...] } format
          problemsArray = data.data;
          console.log('Found problems in data.data');
        } else {
          console.error('Unexpected API response format:', data);
          throw new Error('Unexpected API response format');
        }
  
        console.log(`Processing ${problemsArray.length} problems`);
        
        // Process and validate each problem
        const processedProblems: Question[] = problemsArray
          .filter(problem => problem && problem.title && problem.description) // Ensure valid data
          .map((problem: ApiProblem) => ({
            id: problem.id,
            title: problem.title,
            description: problem.description,
            // Ensure difficulty is one of the expected values
            difficulty: ['easy', 'medium', 'hard'].includes(problem.difficulty?.toLowerCase()) 
              ? problem.difficulty.toLowerCase() as 'easy' | 'medium' | 'hard'
              : 'easy',
            // Use provided points or calculate based on difficulty
            points: problem.points || getDifficultyPoints(problem.difficulty),
            tags: problem.tags || []
          }));
  
        console.log(`Processed ${processedProblems.length} valid problems`);
        
        setQuestions(processedProblems);
        setFilteredQuestions(processedProblems);
      } catch (err) {
        console.error('Error fetching questions:', err);
        setError(`Failed to load questions: ${err instanceof Error ? err.message : 'Unknown error'}`);
        setQuestions([]);
        setFilteredQuestions([]);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchQuestions();
  }, []);

  // Filter questions based on difficulty and search query
  useEffect(() => {
    let result = questions;

    if (selectedDifficulty !== 'all') {
      result = result.filter(q => q.difficulty === selectedDifficulty);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(q => 
        q.title.toLowerCase().includes(query) ||
        q.description.toLowerCase().includes(query) ||
        q.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }

    setFilteredQuestions(result);
  }, [selectedDifficulty, searchQuery, questions]);

  const getDifficultyClasses = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'bg-green-100 text-green-500';
      case 'medium': return 'bg-amber-100 text-amber-500';
      case 'hard': return 'bg-red-100 text-red-500';
      default: return 'bg-gray-100 text-gray-500';
    }
  };

  if (isLoading) {
    return (
      <section id="questions" className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Coding Challenges</h2>
          <div className="flex items-center bg-gradient-to-r from-primary to-secondary text-white px-3 py-2 rounded-lg shadow">
            <Trophy className="h-4 w-4 mr-1" />
            <span className="font-medium">{userPoints} points</span>
          </div>
        </div>
        <div className="flex justify-center items-center p-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="questions" className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Coding Challenges</h2>
          <div className="flex items-center bg-gradient-to-r from-primary to-secondary text-white px-3 py-2 rounded-lg shadow">
            <Trophy className="h-4 w-4 mr-1" />
            <span className="font-medium">{userPoints} points</span>
          </div>
        </div>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
          <button 
            className="mt-4 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </section>
    );
  }

  return (
    <section id="questions" className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Coding Challenges</h2>
        <div className="flex items-center bg-gradient-to-r from-primary to-secondary text-white px-3 py-2 rounded-lg shadow">
          <Trophy className="h-4 w-4 mr-1" />
          <span className="font-medium">{userPoints} points</span>
        </div>
      </div>
      <p className="text-gray-600 mb-6">
        Solve algorithmic problems and earn points. Each difficulty level offers different point rewards.
      </p>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-2">
        {['all', 'easy', 'medium', 'hard'].map(difficulty => (
          <button
            key={difficulty}
            onClick={() => setSelectedDifficulty(difficulty as any)}
            className={`px-4 py-2 rounded-md ${
              selectedDifficulty === difficulty 
                ? 'bg-primary text-white' 
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
          >
            {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
          </button>
        ))}
        <input
          type="text"
          placeholder="Search questions..."
          className="ml-auto px-4 py-2 border rounded-md w-full sm:w-64"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Stats */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-gray-600">Questions Available</p>
            <p className="text-2xl font-bold">{questions.length}</p>
          </div>
          <div>
            <p className="text-gray-600">Solved Questions</p>
            <p className="text-2xl font-bold">{solvedQuestions.length}</p>
          </div>
          <div>
            <p className="text-gray-600">Completion Rate</p>
            <p className="text-2xl font-bold">
              {questions.length > 0 ? Math.round((solvedQuestions.length / questions.length) * 100) : 0}%
            </p>
          </div>
        </div>
      </div>

      {/* Questions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredQuestions.length > 0 ? (
          filteredQuestions.map((question) => (
            <div
              key={question.id}
              className={`bg-white rounded-lg p-6 shadow hover:-translate-y-1 hover:shadow-md transition-all relative overflow-hidden ${
                solvedQuestions.includes(Number(question.id)) ? "border-l-4 border-green-500" : ""
              }`}
            >
              {solvedQuestions.includes(Number(question.id)) && (
                <div className="absolute top-4 right-4 bg-green-500 text-white w-6 h-6 rounded-full flex items-center justify-center font-bold">
                  ✓
                </div>
              )}
              <span
                className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-2 ${
                  getDifficultyClasses(question.difficulty)
                }`}
              >
                {question.difficulty.charAt(0).toUpperCase() + question.difficulty.slice(1)}
              </span>
              <h3 className="text-xl font-semibold mb-2">{question.title}</h3>
              <p className="text-gray-600 mb-4">
                {question.description.length > 100
                  ? question.description.substring(0, 100) + "..."
                  : question.description}
              </p>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-1 text-gray-600 font-medium">
                  <Trophy className="h-4 w-4" /> {question.points} points
                </div>
                <button
                  className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
                  onClick={() => {
                    const questionId = typeof question.id === 'string' ? parseInt(question.id, 10) : question.id;
                    if (!isNaN(questionId)) {
                      openQuestion(questionId);
                    } else {
                      console.error("Invalid question ID:", question.id);
                    }
                  }}
                >
                  Solve Challenge
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-3 text-center text-gray-500 p-10">
            No questions match your current filters.
          </div>
        )}
      </div>
    </section>
  );
}