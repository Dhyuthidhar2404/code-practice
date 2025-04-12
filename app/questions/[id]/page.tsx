"use client"

import { useEffect, useState } from 'react'
import { useAppContext } from '@/components/app-context'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useRouter } from 'next/navigation'

export default function QuestionDetail({ params }: { params: { id: string } }) {
  const { currentQuestion, setCurrentQuestion } = useAppContext()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!params.id) return;
    
    const fetchQuestionData = async () => {
      setIsLoading(true);
      try {
        // Direct API call
        const response = await fetch(`http://localhost:5000/api/problems/${params.id}`);
        const data = await response.json();
        console.log("API Response:", data);
        
        // Set directly to context
        setCurrentQuestion(data);
      } catch (error) {
        console.error("Error fetching question:", error);
        setError("Failed to load question. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchQuestionData();
  }, [params.id, setCurrentQuestion]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-4">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-4 w-1/3" />
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-red-500">{error}</div>
        <Button onClick={() => router.push('/questions')} className="mt-4">
          Back to Questions
        </Button>
      </div>
    )
  }

  if (!currentQuestion) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Question not found</h2>
          <Button onClick={() => router.push('/questions')}>
            Back to Questions
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{currentQuestion.title}</h1>
        <div className="flex gap-2 mb-4">
          <span className={`px-2 py-1 rounded-full text-sm ${
            currentQuestion.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
            currentQuestion.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }`}>
            {currentQuestion.difficulty}
          </span>
          <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-800 text-sm">
            {currentQuestion.points} points
          </span>
        </div>
      </div>

      <Tabs defaultValue="description" className="space-y-4">
        <TabsList>
          <TabsTrigger value="description">Description</TabsTrigger>
          <TabsTrigger value="solution">Solution</TabsTrigger>
          <TabsTrigger value="submissions">Submissions</TabsTrigger>
        </TabsList>

        <TabsContent value="description">
          <Card>
            <CardHeader>
              <CardTitle>Problem Description</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                {currentQuestion.description}
              </div>
              
              {currentQuestion.examples && currentQuestion.examples.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-2">Examples</h3>
                  {currentQuestion.examples.map((example, index) => (
                    <div key={index} className="mb-4 p-4 bg-gray-50 rounded">
                      <p className="font-medium">Example {index + 1}:</p>
                      <pre className="mt-2">{example}</pre>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="solution">
          <Card>
            <CardHeader>
              <CardTitle>Solution</CardTitle>
            </CardHeader>
            <CardContent>
              {currentQuestion.solution ? (
                <div className="prose max-w-none">
                  {currentQuestion.solution}
                </div>
              ) : (
                <p>No solution available yet.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="submissions">
          <Card>
            <CardHeader>
              <CardTitle>Your Submissions</CardTitle>
            </CardHeader>
            <CardContent>
              <p>No submissions yet.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-8">
        <Button onClick={() => router.push('/questions')} className="mr-4">
          Back to Questions
        </Button>
        <Button onClick={() => router.push(`/questions/${params.id}/solve`)}>
          Solve Problem
        </Button>
      </div>
    </div>
  )
} 