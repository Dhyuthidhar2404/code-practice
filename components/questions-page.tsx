"use client"

import { useState, useEffect } from 'react';
import { Trophy } from "lucide-react";
import { useAppContext } from "./app-context";
import Link from 'next/link';

// API response type
type ApiProblem = {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  points: number;
  tags?: string[];
  [key: string]: any;
}

// Frontend Question type with strict difficulty typing
type Question = {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
  tags?: string[];
}

export default function QuestionsPage() {
  const { setQuestions, solvedQuestions = [] } = useAppContext();
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState<'all' | 'easy' | 'medium' | 'hard'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch questions on component mount
  useEffect(() => {
    async function fetchQuestions() {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('token');
        
        const response = await fetch('http://localhost:5000/api/problems', {
          method: 'GET',
          headers: {
            'Authorization': token ? `Bearer ${token}` : '',
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch questions');
        }

        const data = await response.json();
        console.log('Raw API Response:', data);
        const processedQuestions = Array.isArray(data) ? data : [];
        
        // Save questions to context
        setQuestions(processedQuestions);
        
        // Also set them to local state for filtering
        setFilteredQuestions(processedQuestions);
        setError(null);
      } catch (err) {
        console.error('Error fetching questions:', err);
        setError('Failed to load questions. Please try again later.');
        setFilteredQuestions([]);
      } finally {
        setIsLoading(false);
      }
    }

    fetchQuestions();
  }, [setQuestions]);

  // Update filtered questions when filters change
  useEffect(() => {
    let filtered = filteredQuestions;

    if (selectedDifficulty !== 'all') {
      filtered = filtered.filter(q => q.difficulty === selectedDifficulty);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(q => 
        q.title.toLowerCase().includes(query) ||
        q.description.toLowerCase().includes(query) ||
        (q.tags && q.tags.some(tag => tag.toLowerCase().includes(query)))
      );
    }

    setFilteredQuestions(filtered);
  }, [selectedDifficulty, searchQuery]);

  const getDifficultyClasses = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Helper function to store question in localStorage before navigation
  const prepareForNavigation = (question: Question) => {
    // Store the current question in localStorage to ensure it's available on the detail page
    localStorage.setItem('currentQuestion', JSON.stringify(question));
    console.log(`Stored question in localStorage: ${question.id} - ${question.title}`);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Coding Problems</h1>
        <div className="flex flex-wrap gap-4 mb-4">
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value as 'all' | 'easy' | 'medium' | 'hard')}
            className="px-4 py-2 border rounded-md"
          >
            <option value="all">All Difficulties</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
          <input
            type="text"
            placeholder="Search problems..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-4 py-2 border rounded-md flex-grow"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredQuestions.map((question) => (
          <div
            key={question.id}
            className="border rounded-lg p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex justify-between items-start mb-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyClasses(question.difficulty)}`}>
                {question.difficulty}
              </span>
              {solvedQuestions.includes(question.id) && (
                <span className="text-green-500">✓ Solved</span>
              )}
            </div>
            <h2 className="text-xl font-semibold mb-2">{question.title}</h2>
            <p className="text-gray-600 mb-4">{question.description}</p>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-1">
                <Trophy className="h-5 w-5 text-yellow-500" />
                <span className="font-medium">{question.points} points</span>
              </div>
              <Link 
                href={`/question/${question.id}`}
                onClick={() => prepareForNavigation(question)}
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
              >
                Solve
              </Link>
            </div>
          </div>
        ))}
      </div>

      {filteredQuestions.length === 0 && !isLoading && (
        <div className="text-center text-gray-500 mt-8">
          No problems found matching your criteria.
        </div>
      )}
    </div>
  );
}