"use client"

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { assessmentService } from '@/lib/services/assessment.service'
import { ArrowRight, ArrowLeft, Sparkles, Heart, Shield, Brain, Users, Crown, Compass, Star } from 'lucide-react'
import type { Database } from '@/lib/types/database'

type AssessmentTemplate = Database['public']['Tables']['assessment_templates']['Row']
type AssessmentQuestion = Database['public']['Tables']['assessment_questions']['Row']

interface AssessmentQuizProps {
  onDiscoveredArchetypes: (archetypes: string[]) => void
  onQuizComplete: (results: any) => void
}

interface QuizAnswer {
  questionId: string
  selectedOption: number
  optionText: string
}

const archetypeIcons = {
  'The Lover': Heart,
  'The Hero': Shield,
  'The Sage': Brain,
  'The Caregiver': Users,
  'The Ruler': Crown,
  'The Explorer': Compass,
  'The Innocent': Star,
  'The Creator': Sparkles,
} as const

const archetypeColors = {
  'The Lover': 'bg-rose-500',
  'The Hero': 'bg-blue-500',
  'The Sage': 'bg-purple-500',
  'The Caregiver': 'bg-green-500',
  'The Ruler': 'bg-amber-500',
  'The Explorer': 'bg-orange-500',
  'The Innocent': 'bg-cyan-500',
  'The Creator': 'bg-pink-500',
} as const

export function AssessmentQuiz({ onDiscoveredArchetypes, onQuizComplete }: AssessmentQuizProps) {
  const [assessment, setAssessment] = useState<AssessmentTemplate | null>(null)
  const [questions, setQuestions] = useState<AssessmentQuestion[]>([])
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<QuizAnswer[]>([])
  const [discoveredArchetypes, setDiscoveredArchetypes] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [quizStarted, setQuizStarted] = useState(false)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)

  useEffect(() => {
    loadAssessment()
  }, [])

  const loadAssessment = async () => {
    try {
      const templates = await assessmentService.getActiveTemplates()
      const freeAssessment = templates.find(t => t.is_free)
      
      if (freeAssessment) {
        setAssessment(freeAssessment)
        const assessmentQuestions = await assessmentService.getQuestionsByTemplateId(freeAssessment.id)
        setQuestions(assessmentQuestions)
      }
    } catch (error) {
      console.error('Error loading assessment:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const startQuiz = () => {
    setQuizStarted(true)
    setCurrentQuestion(0)
    setAnswers([])
    setDiscoveredArchetypes([])
    setSelectedOption(null)
  }

  const handleAnswerSelect = (optionIndex: number) => {
    setSelectedOption(optionIndex)
  }

  const handleNext = () => {
    if (selectedOption === null) return

    const question = questions[currentQuestion]
    const options = JSON.parse(question.options as string)
    const newAnswer: QuizAnswer = {
      questionId: question.id,
      selectedOption: selectedOption,
      optionText: options[selectedOption]
    }

    const newAnswers = [...answers, newAnswer]
    setAnswers(newAnswers)

    // Analyze current answers to discover archetypes
    const currentArchetypes = analyzeAnswers(newAnswers)
    setDiscoveredArchetypes(currentArchetypes)
    onDiscoveredArchetypes(currentArchetypes)

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
      setSelectedOption(null)
    } else {
      // Quiz complete
      completeQuiz(newAnswers, currentArchetypes)
    }
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
      setAnswers(answers.slice(0, -1))
      setSelectedOption(null)
    }
  }

  const analyzeAnswers = (currentAnswers: QuizAnswer[]): string[] => {
    const archetypeScores: { [key: string]: number } = {}
    
    currentAnswers.forEach((answer, index) => {
      const question = questions[index]
      if (question.scoring_weights) {
        const weights = JSON.parse(question.scoring_weights as string)
        const selectedWeights = Object.entries(weights).map(([archetype, scores]) => ({
          archetype,
          score: (scores as number[])[answer.selectedOption] || 0
        }))

        selectedWeights.forEach(({ archetype, score }) => {
          archetypeScores[archetype] = (archetypeScores[archetype] || 0) + score
        })
      }
    })

    // Return top 3 archetypes with scores > 0
    return Object.entries(archetypeScores)
      .filter(([_, score]) => score > 0)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([archetype]) => archetype)
  }

  const completeQuiz = (finalAnswers: QuizAnswer[], archetypes: string[]) => {
    const results = {
      assessment_id: assessment?.id,
      answers: finalAnswers,
      discovered_archetypes: archetypes,
      completed_at: new Date().toISOString()
    }
    onQuizComplete(results)
  }

  const progress = questions.length > 0 ? ((currentQuestion + 1) / questions.length) * 100 : 0

  if (isLoading) {
    return (
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-8 text-center">
          <div className="text-gray-400">Loading assessment...</div>
        </CardContent>
      </Card>
    )
  }

  if (!assessment || questions.length === 0) {
    return (
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-8 text-center">
          <div className="text-gray-400">No assessment available</div>
        </CardContent>
      </Card>
    )
  }

  if (!quizStarted) {
    return (
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-2xl text-white flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-teal-400" />
            {assessment.name}
          </CardTitle>
          <CardDescription className="text-gray-400">
            {assessment.description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-sm text-gray-400">
              <p>✨ {assessment.intro_text}</p>
              <p className="mt-2">📊 {questions.length} questions • ⏱️ {assessment.estimated_duration_minutes} minutes</p>
            </div>
            
            <Button 
              onClick={startQuiz}
              className="w-full bg-teal-600 hover:bg-teal-700 text-white"
            >
              Start Assessment
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  const question = questions[currentQuestion]
  const options = JSON.parse(question.options as string)

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg text-white">
            Question {currentQuestion + 1} of {questions.length}
          </CardTitle>
          <Badge variant="outline" className="border-teal-600 text-teal-400">
            {Math.round(progress)}% Complete
          </Badge>
        </div>
        <Progress value={progress} className="w-full h-2" />
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <h3 className="text-xl text-white font-medium leading-relaxed">
            {question.question_text}
          </h3>
          
          <div className="space-y-3">
            {options.map((option: string, index: number) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(index)}
                className={`w-full p-4 text-left rounded-lg border-2 transition-all hover:border-teal-500 ${
                  selectedOption === index
                    ? 'border-teal-500 bg-teal-500/10 text-white'
                    : 'border-slate-600 text-gray-300 hover:bg-slate-700/50'
                }`}
              >
                {option}
              </button>
            ))}
          </div>

          <div className="flex justify-between items-center pt-4">
            <Button
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
              variant="outline"
              className="border-slate-600 text-white hover:bg-slate-700"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>
            
            <Button
              onClick={handleNext}
              disabled={selectedOption === null}
              className="bg-teal-600 hover:bg-teal-700 text-white"
            >
              {currentQuestion === questions.length - 1 ? 'Complete' : 'Next'}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function DiscoveredArchetypes({ archetypes }: { archetypes: string[] }) {
  if (archetypes.length === 0) {
    return (
      <Card className="bg-slate-800/30 border-slate-700">
        <CardContent className="p-6 text-center">
          <div className="text-gray-400">
            <Sparkles className="h-12 w-12 mx-auto mb-4 text-slate-500" />
            <p>Your archetypes will appear here as you progress through the assessment</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-slate-800/30 border-slate-700">
      <CardHeader>
        <CardTitle className="text-lg text-white flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-teal-400" />
          Discovered Archetypes
        </CardTitle>
        <CardDescription className="text-gray-400">
          These patterns are emerging from your responses
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {archetypes.map((archetype, index) => {
            const Icon = archetypeIcons[archetype as keyof typeof archetypeIcons] || Star
            const colorClass = archetypeColors[archetype as keyof typeof archetypeColors] || 'bg-slate-500'
            
            return (
              <div key={archetype} className="flex items-center gap-3 p-3 rounded-lg bg-slate-700/50 border border-slate-600">
                <div className={`p-2 rounded-full ${colorClass}`}>
                  <Icon className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-white">{archetype}</h4>
                  <p className="text-sm text-gray-400">
                    {index === 0 && "Primary pattern"}
                    {index === 1 && "Secondary pattern"}
                    {index === 2 && "Emerging pattern"}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
} 