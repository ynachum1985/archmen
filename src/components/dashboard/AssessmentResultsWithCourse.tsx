'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import {
  BookOpen,
  Lock,
  CheckCircle,
  Clock,
  ArrowRight,
  Play
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { FloatingChatbot } from './FloatingChatbot'
import { FlippableArchetypeCards } from './FlippableArchetypeCards'

interface ArchetypeResult {
  id: string
  name: string
  description: string
  confidenceScore: number
  isPrimary: boolean
  insights: {
    currentInfluence: string
    growthOpportunity: string
    integrationTip: string
    whyThisArchetype: string
  }
}

interface ChatMessage {
  id: string
  message_type: 'question' | 'answer' | 'system' | 'follow_up'
  content: string
  message_index: number
  created_at: string
}

interface CourseWeek {
  week: number
  title: string
  description: string
  isUnlocked: boolean
  isCompleted: boolean
  isFree: boolean
  estimatedTime: string
  content: {
    theory: string
    practice: string[]
    reflection: string[]
    integration: string[]
  }
}

interface AssessmentResultsWithCourseProps {
  assessmentId: string
  assessmentName: string
  discoveredArchetypes: ArchetypeResult[]
  userId: string
}

export function AssessmentResultsWithCourse({
  assessmentId,
  assessmentName,
  discoveredArchetypes,
  userId
}: AssessmentResultsWithCourseProps) {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [courseWeeks, setCourseWeeks] = useState<CourseWeek[]>([])
  const [isLoadingChat, setIsLoadingChat] = useState(true)
  const [isLoadingCourse, setIsLoadingCourse] = useState(true)
  const [activeTab, setActiveTab] = useState('results')

  const primaryArchetype = discoveredArchetypes.find(a => a.isPrimary) || discoveredArchetypes[0]
  const secondaryArchetypes = discoveredArchetypes.filter(a => !a.isPrimary)

  useEffect(() => {
    loadChatHistory()
    loadCourseProgress()
  }, [assessmentId, userId])

  const loadChatHistory = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('assessment_chat_history')
        .select('*')
        .eq('assessment_session_id', assessmentId)
        .order('message_index', { ascending: true })

      if (error) throw error
      setChatMessages(data || [])
    } catch (error) {
      console.error('Error loading chat history:', error)
    } finally {
      setIsLoadingChat(false)
    }
  }

  const loadCourseProgress = async () => {
    try {
      const supabase = createClient()
      
      // Load user's course progress
      const { data: progress, error } = await supabase
        .from('user_course_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('assessment_id', assessmentId)

      if (error) throw error

      // Generate course weeks based on discovered archetypes
      const weeks = generateCourseWeeks(discoveredArchetypes, progress || [])
      setCourseWeeks(weeks)
    } catch (error) {
      console.error('Error loading course progress:', error)
    } finally {
      setIsLoadingCourse(false)
    }
  }

  const generateCourseWeeks = (archetypes: ArchetypeResult[], progress: any[]): CourseWeek[] => {
    const primaryName = primaryArchetype?.name || 'Your Archetype'
    
    return [
      {
        week: 1,
        title: `Understanding Your ${primaryName}`,
        description: `Explore the core essence and patterns of your primary archetype`,
        isUnlocked: true,
        isCompleted: progress.some(p => p.week_number === 1 && p.completed_at),
        isFree: true,
        estimatedTime: '15 min',
        content: {
          theory: `Deep dive into the ${primaryName} archetype and its influence on your life`,
          practice: ['Daily awareness meditation', 'Archetype journaling'],
          reflection: ['When do you feel most aligned with this energy?', 'What triggers this archetype?'],
          integration: ['Identify 3 daily situations where this archetype appears']
        }
      },
      {
        week: 2,
        title: 'Shadow Work Foundations',
        description: 'Explore the shadow aspects and hidden potentials',
        isUnlocked: true,
        isCompleted: progress.some(p => p.week_number === 2 && p.completed_at),
        isFree: true,
        estimatedTime: '20 min',
        content: {
          theory: 'Understanding shadow work and its importance for integration',
          practice: ['Shadow dialogue exercise', 'Trigger awareness practice'],
          reflection: ['What aspects of yourself do you resist?', 'Where does this archetype become destructive?'],
          integration: ['Practice conscious choice when triggered']
        }
      },
      {
        week: 3,
        title: 'Integration Practices',
        description: 'Learn practical techniques for conscious integration',
        isUnlocked: progress.some(p => p.week_number <= 2 && p.completed_at) || false,
        isCompleted: progress.some(p => p.week_number === 3 && p.completed_at),
        isFree: false,
        estimatedTime: '25 min',
        content: {
          theory: 'Advanced integration techniques for archetypal energies',
          practice: ['Energy balancing meditation', 'Archetype switching exercise'],
          reflection: ['How can you use this energy constructively?', 'What other archetypes balance this one?'],
          integration: ['Create daily practices for conscious archetype activation']
        }
      },
      {
        week: 4,
        title: 'Relationship Dynamics',
        description: 'Understand how your archetypes affect relationships',
        isUnlocked: progress.some(p => p.week_number <= 3 && p.completed_at) || false,
        isCompleted: progress.some(p => p.week_number === 4 && p.completed_at),
        isFree: false,
        estimatedTime: '30 min',
        content: {
          theory: 'Archetypal dynamics in relationships and communication',
          practice: ['Relationship mapping exercise', 'Communication style awareness'],
          reflection: ['How do your archetypes show up in relationships?', 'What patterns do you want to change?'],
          integration: ['Practice conscious communication from different archetypal perspectives']
        }
      },
      {
        week: 5,
        title: 'Real-World Application',
        description: 'Apply your archetypal awareness in daily life',
        isUnlocked: progress.some(p => p.week_number <= 4 && p.completed_at) || false,
        isCompleted: progress.some(p => p.week_number === 5 && p.completed_at),
        isFree: false,
        estimatedTime: '35 min',
        content: {
          theory: 'Practical application strategies for work, relationships, and personal growth',
          practice: ['Situational archetype selection', 'Goal alignment with archetypal strengths'],
          reflection: ['Where can you apply this knowledge most effectively?', 'What changes do you want to make?'],
          integration: ['Create a personal archetypal development plan']
        }
      },
      {
        week: 6,
        title: 'Mastery & Next Steps',
        description: 'Consolidate your learning and plan your continued journey',
        isUnlocked: progress.some(p => p.week_number <= 5 && p.completed_at) || false,
        isCompleted: progress.some(p => p.week_number === 6 && p.completed_at),
        isFree: false,
        estimatedTime: '40 min',
        content: {
          theory: 'Advanced archetypal work and continued development paths',
          practice: ['Integration assessment', 'Future visioning exercise'],
          reflection: ['How have you grown through this process?', 'What areas need continued attention?'],
          integration: ['Design your ongoing archetypal development practice']
        }
      }
    ]
  }

  const completedWeeks = courseWeeks.filter(w => w.isCompleted).length
  const progressPercentage = (completedWeeks / courseWeeks.length) * 100

  return (
    <div className="space-y-8">
      {/* Floating Chatbot */}
      <FloatingChatbot
        assessmentId={assessmentId}
        assessmentName={assessmentName}
        userId={userId}
        initialMessages={chatMessages}
      />

      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">{assessmentName} Results</h1>
        <p className="text-gray-600">Your personalized archetypal journey</p>
      </div>

      {/* Flippable Archetype Cards */}
      <FlippableArchetypeCards archetypes={discoveredArchetypes} />

      {/* Mini-Course Section */}
      <div className="space-y-6">
        {/* Course Progress */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-semibold">Your Integration Journey</h3>
                <p className="text-gray-600">6-week personalized course based on your archetypes</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">{completedWeeks}/6</div>
                <div className="text-sm text-gray-500">Weeks Complete</div>
              </div>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </CardContent>
        </Card>

        {/* Course Weeks */}
        <div className="space-y-4">
          {courseWeeks.map((week) => (
            <Card key={week.week} className={`${!week.isUnlocked ? 'opacity-60' : ''}`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      week.isCompleted ? 'bg-green-500 text-white' :
                      week.isUnlocked ? 'bg-blue-500 text-white' : 'bg-gray-300'
                    }`}>
                      {week.isCompleted ? <CheckCircle className="h-5 w-5" /> :
                       week.isUnlocked ? <Play className="h-5 w-5" /> : <Lock className="h-5 w-5" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">Week {week.week}: {week.title}</h3>
                        {week.isFree && <Badge variant="secondary">Free</Badge>}
                        {!week.isFree && <Badge>Premium</Badge>}
                      </div>
                      <p className="text-sm text-gray-600">{week.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {week.estimatedTime}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div>
                    {week.isUnlocked ? (
                      <Button size="sm">
                        {week.isCompleted ? 'Review' : 'Start'}
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    ) : (
                      <Button size="sm" variant="outline" disabled>
                        <Lock className="h-4 w-4 mr-2" />
                        Locked
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
