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
import { EnhancedArchetypeChat } from '../chat/EnhancedArchetypeChat'
import { FlippableArchetypeCards } from './FlippableArchetypeCards'
import { HomeworkCalendar } from './HomeworkCalendar'

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

interface AssessmentResultsWithHomeworkProps {
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
}: AssessmentResultsWithHomeworkProps) {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [isLoadingChat, setIsLoadingChat] = useState(true)
  const [homeworkRefreshKey, setHomeworkRefreshKey] = useState(0)

  const primaryArchetype = discoveredArchetypes.find(a => a.isPrimary) || discoveredArchetypes[0]
  const secondaryArchetypes = discoveredArchetypes.filter(a => !a.isPrimary)

  useEffect(() => {
    loadChatHistory()
  }, [assessmentId, userId])

  const handleHomeworkAssigned = () => {
    // Trigger refresh of homework calendar
    setHomeworkRefreshKey(prev => prev + 1)
  }

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



  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      {/* Full Chatbot Interface at Top */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto">
          <EnhancedArchetypeChat
            userId={userId}
            assessmentId={assessmentId}
            discoveredArchetypes={discoveredArchetypes}
            onHomeworkAssigned={handleHomeworkAssigned}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">{assessmentName} Results</h1>
          <p className="text-gray-600">Your personalized archetypal journey</p>
        </div>

        {/* Flippable Archetype Cards */}
        <FlippableArchetypeCards archetypes={discoveredArchetypes} />

        {/* Homework Calendar Section */}
        <HomeworkCalendar
          key={homeworkRefreshKey}
          userId={userId}
          assessmentId={assessmentId}
          discoveredArchetypes={discoveredArchetypes}
        />
      </div>
    </div>
  )
}
