"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAppContext } from '@/components/app-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface Question {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  tags?: string[];
}

export default function QuestionsPage() {
  const { questions, setQuestions, openQuestion } = useAppContext()
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [difficulty, setDifficulty] = useState('all')
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true)
        const response = await fetch('http://localhost:5000/api/problems')
        if (!response.ok) {
          throw new Error('Failed to fetch questions')
        }
        const data = await response.json()
        setQuestions(data)
      } catch (error) {
        console.error('Error fetching questions:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchQuestions()
  }, [setQuestions])

  const filteredQuestions = questions.filter((question: Question) => {
    const matchesSearch = question.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         question.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesDifficulty = difficulty === 'all' || question.difficulty === difficulty
    const matchesTags = selectedTags.length === 0 || 
                       (question.tags && selectedTags.every(tag => question.tags?.includes(tag)))
    return matchesSearch && matchesDifficulty && matchesTags
  })

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <Input
          placeholder="Search questions..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1"
        />
        <Select value={difficulty} onValueChange={setDifficulty}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Difficulty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Difficulties</SelectItem>
            <SelectItem value="easy">Easy</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="hard">Hard</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredQuestions.map((question: Question) => (
          <div key={question.id} className="relative">
            <Card className="h-full">
              <CardHeader>
                <CardTitle>{question.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">{question.description}</p>
                <div className="flex gap-2">
                  <span className={`px-2 py-1 rounded-full text-sm ${
                    question.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                    question.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {question.difficulty}
                  </span>
                  {question.tags?.map((tag, index) => (
                    <span key={index} className="px-2 py-1 rounded-full bg-blue-100 text-blue-800 text-sm">
                      {tag}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Link href={`/questions/${question.id}/solve`} className="absolute bottom-4 right-4">
              <Button className="bg-blue-500 text-white hover:bg-blue-600 transition-colors">
                Solve
              </Button>
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
} 