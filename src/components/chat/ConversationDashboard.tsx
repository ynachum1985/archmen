'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import {
  Plus,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Home,
  ChevronDown,
  ChevronUp,
  Brain,
  Calendar,
  Settings
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { ModernCalendarView } from '@/components/calendar/ModernCalendarView'
import { InlineSettingsView } from '@/components/settings/InlineSettingsView'



interface Assessment {
  id: string
  name: string
  description: string
  category: string
  expected_duration: number
  assessment_level: number
  status: 'draft' | 'live' | 'archived'
  is_active: boolean
}

interface ConversationDashboardProps {
  userId: string
}



export function ConversationDashboard({ userId }: ConversationDashboardProps) {
  const [assessments, setAssessments] = useState<Assessment[]>([])
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mainAssessmentCompleted, setMainAssessmentCompleted] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [currentAssessment, setCurrentAssessment] = useState<any>(null)
  const [level1Open, setLevel1Open] = useState(true)
  const [level2Open, setLevel2Open] = useState(true)
  const [level3Open, setLevel3Open] = useState(true)
  const [sidebarWidth, setSidebarWidth] = useState(320) // Default width in pixels
  const [isResizing, setIsResizing] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState<string>('live')
  const [currentView, setCurrentView] = useState<'tasks' | 'settings'>('tasks')

  useEffect(() => {
    loadAssessments()
    checkMainAssessmentCompleted().then(setMainAssessmentCompleted)
    checkAdminStatus()
  }, [userId])

  useEffect(() => {
    loadAssessments()
  }, [isAdmin])







  const checkAdminStatus = async () => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', user.id)
          .single()

        if (!error && data) {
          setIsAdmin(data.is_admin || false)
          // If admin, default to showing all statuses
          if (data.is_admin) {
            setSelectedStatus('all')
          }
        }
      }
    } catch (error) {
      console.error('Error checking admin status:', error)
    }
  }

  const loadAssessments = async () => {
    try {
      const supabase = createClient()
      let query = supabase
        .from('enhanced_assessments')
        .select('id, name, description, category, expected_duration, assessment_level, status, is_active')

      // Admin users see all assessments, regular users only see live ones
      if (!isAdmin) {
        query = query.eq('status', 'live').eq('is_active', true)
      }

      query = query.order('assessment_level', { ascending: true })
        .order('name', { ascending: true })

      const { data, error } = await query

      if (error) throw error

      setAssessments(data || [])
    } catch (error) {
      console.error('Error loading assessments:', error)
    }
  }

  const handleCurrentAssessmentStatusChange = async (newStatus: 'draft' | 'live' | 'archived') => {
    if (!currentAssessment || !isAdmin) return

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('enhanced_assessments')
        .update({
          status: newStatus,
          is_active: newStatus === 'live'
        })
        .eq('id', currentAssessment.id)

      if (error) throw error

      // Update current assessment state
      setCurrentAssessment(prev => ({ ...prev, status: newStatus }))

      // Reload assessments to reflect changes
      loadAssessments()
    } catch (error) {
      console.error('Error updating assessment status:', error)
    }
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsResizing(true)
    e.preventDefault()
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (!isResizing) return

    const newWidth = e.clientX
    if (newWidth >= 250 && newWidth <= 500) { // Min 250px, Max 500px
      setSidebarWidth(newWidth)
    }
  }

  const handleMouseUp = () => {
    setIsResizing(false)
  }

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isResizing])

  const getAssessmentsByLevel = (level: number) => {
    return assessments.filter(assessment => assessment.assessment_level === level)
  }

  const getLevelTitle = (level: number) => {
    const titles = {
      1: 'Foundation - Basic Relationship Patterns',
      2: 'Integration - Shadow Work & Emotional Depth',
      3: 'Mastery - Advanced Concepts & Patriarchy Deconstruction'
    }
    return titles[level as keyof typeof titles] || `Level ${level}`
  }

  const checkMainAssessmentCompleted = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('conversations')
        .select('metadata')
        .eq('user_id', userId)
        .not('metadata->>assessmentId', 'is', null)

      if (error) throw error

      // Check if user has completed the main assessment
      const mainAssessmentId = '550e8400-e29b-41d4-a716-446655440001' // Main Assessment ID
      const hasCompletedMain = data?.some(conv =>
        conv.metadata?.assessmentId === mainAssessmentId &&
        conv.metadata?.status === 'completed'
      )

      return hasCompletedMain || false
    } catch (error) {
      console.error('Error checking main assessment:', error)
      return false
    }
  }



  const navigateToActiveAssessment = async () => {
    try {
      const supabase = createClient()

      // Find the most recent active conversation for this user
      const { data: conversations, error } = await supabase
        .from('conversations')
        .select('id, metadata')
        .eq('user_id', userId)
        .not('metadata->>assessmentId', 'is', null)
        .order('updated_at', { ascending: false })
        .limit(1)

      if (error) throw error

      if (conversations && conversations.length > 0) {
        // Navigate to the active assessment chat
        const conversationId = conversations[0].id
        const assessmentId = conversations[0].metadata?.assessmentId

        if (assessmentId) {
          window.location.href = `/chat/${conversationId}`
          return
        }
      }

      // If no active conversation, create a new one with the main assessment
      const mainAssessmentId = '550e8400-e29b-41d4-a716-446655440001'
      const { data: assessment } = await supabase
        .from('enhanced_assessments')
        .select('*')
        .eq('id', mainAssessmentId)
        .single()

      if (assessment) {
        await createNewConversation(assessment)
      }
    } catch (error) {
      console.error('Error navigating to active assessment:', error)
    }
  }

  const createNewConversation = async (assessment?: Assessment) => {
    try {
      const supabase = createClient()

      const welcomeMessage = assessment
        ? `Hello! I'm here to guide you through the "${assessment.name}" assessment. This will take approximately ${assessment.expected_duration} minutes. ${assessment.description} Let's begin - what brings you to explore this topic today?`
        : "Hello! I'm here to help you discover your archetypal patterns through conversation. Let's begin this journey of self-discovery together. What brings you here today?"

      const { data, error } = await supabase
        .from('conversations')
        .insert({
          user_id: userId,
          messages: [{
            role: 'assistant',
            content: welcomeMessage,
            timestamp: new Date().toISOString()
          }],
          metadata: {
            title: assessment ? assessment.name : 'General Conversation',
            status: 'active',
            phase: 'assessment',
            assessmentId: assessment?.id,
            category: assessment?.category
          }
        })
        .select()
        .single()

      if (error) throw error

      const newConversation: Conversation = {
        id: data.id,
        title: assessment ? assessment.name : 'General Conversation',
        lastMessage: welcomeMessage.substring(0, 50) + '...',
        timestamp: new Date(),
        isActive: true
      }

      setConversations(prev => [newConversation, ...prev])
      setActiveConversationId(data.id)
      setCurrentAssessment(assessment || null) // Set current assessment for status management
    } catch (error) {
      console.error('Error creating conversation:', error)
    }
  }



  return (
    <div className="flex h-screen bg-gray-50/30">
      {/* Sidebar - Hidden on mobile */}
      <div
        className={`hidden md:flex bg-white/60 backdrop-blur-sm border-r border-gray-200/50 flex-col transition-all duration-300 relative`}
        style={{ width: sidebarCollapsed ? '64px' : `${sidebarWidth}px` }}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-200/50 flex items-center justify-between">
          {!sidebarCollapsed && (
            <h2 className="font-medium text-gray-900">Assessments</h2>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="text-gray-600 hover:text-gray-900 hover:bg-gray-100/60"
          >
            {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>

        {/* Content */}
        <ScrollArea className="flex-1 p-2 h-0">
          {!sidebarCollapsed && (
            <div className="space-y-4 h-full overflow-y-auto">
              {/* Assessment Levels */}
              <div className="space-y-2">
                {/* Level 1 */}
                <Collapsible open={level1Open} onOpenChange={setLevel1Open}>
                  <CollapsibleTrigger className="flex items-center justify-between w-full p-2 text-left hover:bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">{getLevelTitle(1)}</span>
                    {level1Open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-1 pl-2">
                    {getAssessmentsByLevel(1).map((assessment) => {
                      const isMainAssessment = assessment.id === '550e8400-e29b-41d4-a716-446655440001'
                      const isAccessible = isAdmin || isMainAssessment || mainAssessmentCompleted

                      return (
                        <button
                          key={assessment.id}
                          onClick={() => isAccessible ? createNewConversation(assessment) : null}
                          disabled={!isAccessible}
                          className={`w-full text-left p-3 rounded-lg transition-all duration-200 border border-transparent ${
                            isAccessible
                              ? 'hover:bg-gray-50/60 hover:border-gray-200/40 cursor-pointer'
                              : 'opacity-50 cursor-not-allowed bg-gray-100/30'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <Brain className={`h-3 w-3 ${isAccessible ? 'text-blue-500' : 'text-gray-400'}`} />
                            <div className={`font-medium text-sm truncate ${
                              isAccessible ? 'text-gray-900' : 'text-gray-500'
                            }`}>
                              {assessment.name}
                              {isMainAssessment && (
                                <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                                  Start Here
                                </span>
                              )}
                              {!isAccessible && (
                                <span className="ml-2 text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                                  Locked
                                </span>
                              )}
                            </div>
                          </div>

                          <div className={`text-xs truncate ${isAccessible ? 'text-gray-500' : 'text-gray-400'}`}>
                            {assessment.description}
                          </div>
                          <div className={`text-xs mt-1 ${isAccessible ? 'text-gray-400' : 'text-gray-300'}`}>
                            {assessment.expected_duration} min • {assessment.category}
                          </div>
                          {!isAccessible && (
                            <div className="text-xs text-gray-400 mt-1 italic">
                              Complete Main Assessment to unlock
                            </div>
                          )}
                        </button>
                      )
                    })}
                  </CollapsibleContent>
                </Collapsible>

                {/* Level 2 */}
                <Collapsible open={level2Open} onOpenChange={setLevel2Open}>
                  <CollapsibleTrigger className="flex items-center justify-between w-full p-2 text-left hover:bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">{getLevelTitle(2)}</span>
                    {level2Open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-1 pl-2">
                    {getAssessmentsByLevel(2).map((assessment) => {
                      const isAccessible = isAdmin || mainAssessmentCompleted

                      return (
                        <button
                          key={assessment.id}
                          onClick={() => isAccessible ? createNewConversation(assessment) : null}
                          disabled={!isAccessible}
                          className={`w-full text-left p-3 rounded-lg transition-all duration-200 border border-transparent ${
                            isAccessible
                              ? 'hover:bg-gray-50/60 hover:border-gray-200/40 cursor-pointer'
                              : 'opacity-50 cursor-not-allowed bg-gray-100/30'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <Brain className={`h-3 w-3 ${isAccessible ? 'text-purple-500' : 'text-gray-400'}`} />
                            <div className={`font-medium text-sm truncate ${
                              isAccessible ? 'text-gray-900' : 'text-gray-500'
                            }`}>
                              {assessment.name}
                              {!isAccessible && (
                                <span className="ml-2 text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                                  Locked
                                </span>
                              )}
                            </div>
                          </div>

                          <div className={`text-xs truncate ${isAccessible ? 'text-gray-500' : 'text-gray-400'}`}>
                            {assessment.description}
                          </div>
                          <div className={`text-xs mt-1 ${isAccessible ? 'text-gray-400' : 'text-gray-300'}`}>
                            {assessment.expected_duration} min • {assessment.category}
                          </div>
                          {!isAccessible && (
                            <div className="text-xs text-gray-400 mt-1 italic">
                              Complete Main Assessment to unlock
                            </div>
                          )}
                        </button>
                      )
                    })}
                  </CollapsibleContent>
                </Collapsible>

                {/* Level 3 */}
                <Collapsible open={level3Open} onOpenChange={setLevel3Open}>
                  <CollapsibleTrigger className="flex items-center justify-between w-full p-2 text-left hover:bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">{getLevelTitle(3)}</span>
                    {level3Open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-1 pl-2">
                    {getAssessmentsByLevel(3).map((assessment) => {
                      const isAccessible = isAdmin || mainAssessmentCompleted

                      return (
                        <button
                          key={assessment.id}
                          onClick={() => isAccessible ? createNewConversation(assessment) : null}
                          disabled={!isAccessible}
                          className={`w-full text-left p-3 rounded-lg transition-all duration-200 border border-transparent ${
                            isAccessible
                              ? 'hover:bg-gray-50/60 hover:border-gray-200/40 cursor-pointer'
                              : 'opacity-50 cursor-not-allowed bg-gray-100/30'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <Brain className={`h-3 w-3 ${isAccessible ? 'text-red-500' : 'text-gray-400'}`} />
                            <div className={`font-medium text-sm truncate ${
                              isAccessible ? 'text-gray-900' : 'text-gray-500'
                            }`}>
                              {assessment.name}
                              {!isAccessible && (
                                <span className="ml-2 text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                                  Locked
                                </span>
                              )}
                            </div>
                          </div>

                          <div className={`text-xs truncate ${isAccessible ? 'text-gray-500' : 'text-gray-400'}`}>
                            {assessment.description}
                          </div>
                          <div className={`text-xs mt-1 ${isAccessible ? 'text-gray-400' : 'text-gray-300'}`}>
                            {assessment.expected_duration} min • {assessment.category}
                          </div>
                          {!isAccessible && (
                            <div className="text-xs text-gray-400 mt-1 italic">
                              Complete Main Assessment to unlock
                            </div>
                          )}
                        </button>
                      )
                    })}
                  </CollapsibleContent>
                </Collapsible>
              </div>


            </div>
          )}
        </ScrollArea>

        {/* Resize Handle */}
        {!sidebarCollapsed && (
          <div
            className="absolute top-0 right-0 w-1 h-full bg-gray-300 hover:bg-blue-500 cursor-col-resize transition-colors"
            onMouseDown={handleMouseDown}
            style={{ cursor: isResizing ? 'col-resize' : 'col-resize' }}
          />
        )}
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white/60 backdrop-blur-sm border-b border-gray-200/50 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-gray-700" />
              </div>
              <div>
                <h1 className="font-medium text-gray-900">ArchMen</h1>
                <p className="text-xs text-gray-500">AI-powered conversation</p>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            {/* Admin Status Management for Current Assessment */}
            {isAdmin && currentAssessment && (
              <Select
                value={currentAssessment.status || 'draft'}
                onValueChange={handleCurrentAssessmentStatusChange}
              >
                <SelectTrigger className="h-8 w-24 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="live">Live</SelectItem>
                  <SelectItem value="archived">Archive</SelectItem>
                </SelectContent>
              </Select>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentView('tasks')}
                className={`text-gray-600 hover:text-gray-900 hover:bg-gray-100/60 ${
                  currentView === 'tasks' ? 'bg-gray-100 text-gray-900' : ''
                }`}
              >
                <Calendar className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentView('settings')}
                className={`text-gray-600 hover:text-gray-900 hover:bg-gray-100/60 ${
                  currentView === 'settings' ? 'bg-gray-100 text-gray-900' : ''
                }`}
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Assessment Selector */}
        <div className="md:hidden bg-white/40 border-b border-gray-200/50 p-3">
          <div className="flex items-center gap-2 overflow-x-auto">
            <span className="text-xs font-medium text-gray-600 whitespace-nowrap">
              Assessments:
            </span>
            {assessments.map((assessment) => {
              const isMainAssessment = assessment.id === '550e8400-e29b-41d4-a716-446655440001'
              const isAccessible = isAdmin || isMainAssessment || mainAssessmentCompleted

              return (
                <button
                  key={assessment.id}
                  onClick={() => isAccessible ? createNewConversation(assessment) : null}
                  disabled={!isAccessible}
                  className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                    isAccessible
                      ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {assessment.name}
                </button>
              )
            })}
          </div>
        </div>

        {/* Dynamic Content Area */}
        {currentView === 'tasks' ? (
          <ModernCalendarView userId={userId} currentAssessmentId={currentAssessment?.id} />
        ) : currentView === 'settings' ? (
          <InlineSettingsView userId={userId} />
        ) : null}

      </div>






    </div>
  )
}
