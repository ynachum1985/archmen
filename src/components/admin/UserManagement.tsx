'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  Users,
  Search,
  Mail,
  Calendar,
  Shield,
  Key,
  BarChart3,
  Settings,
  Eye,
  UserCheck,
  UserX,
  RefreshCw,
  MessageSquare,
  FileText,
  Clock,
  Brain,
  Target,
  TrendingUp,
  ChevronDown,
  ChevronRight
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface User {
  id: string
  email: string
  created_at: string
  last_sign_in_at?: string
  email_confirmed_at?: string
  user_metadata?: Record<string, any>
  app_metadata?: Record<string, any>
}

interface UserProgress {
  user_id: string
  assessments_completed: number
  quiz_attempts: number
  last_activity: string
  current_level: number
  emotional_maturity_score?: number
}

interface AssessmentAttempt {
  id: string
  assessment_name: string
  assessment_level: number
  started_at: string
  completed_at?: string
  readiness_score?: number
  emotional_maturity_score?: number
  quiz_passed: boolean
  specific_feedback?: string
  conversation_history: ConversationMessage[]
}

interface ConversationMessage {
  id: string
  question_number: number
  question_type: 'set_question' | 'experience_based' | 'conclusion'
  question_text: string
  user_response?: string
  ai_reasoning?: string
  timestamp: string
  question_context?: any
}

interface UserDetailedHistory {
  user: User
  assessments: AssessmentAttempt[]
  total_conversations: number
  avg_session_duration: number
  progression_timeline: Array<{
    date: string
    event: string
    details: string
  }>
}

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [userProgress, setUserProgress] = useState<Record<string, UserProgress>>({})
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showUserDetails, setShowUserDetails] = useState(false)
  const [userDetailedHistory, setUserDetailedHistory] = useState<UserDetailedHistory | null>(null)
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)
  const [expandedAssessment, setExpandedAssessment] = useState<string | null>(null)
  const [expandedConversation, setExpandedConversation] = useState<string | null>(null)
  const [liveConversations, setLiveConversations] = useState<any[]>([])
  const [isLiveMonitoring, setIsLiveMonitoring] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    loadUsers()
    loadUserProgress()
    startLiveMonitoring()
  }, [])

  const startLiveMonitoring = () => {
    setIsLiveMonitoring(true)

    // Set up real-time subscription for live conversations
    const subscription = supabase
      .channel('live_conversations')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'assessment_quiz_attempts',
          filter: 'completed_at=is.null'
        },
        (payload) => {
          console.log('Live conversation update:', payload)
          loadLiveConversations()
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'quiz_question_responses'
        },
        (payload) => {
          console.log('Live question response:', payload)
          loadLiveConversations()
        }
      )
      .subscribe()

    // Initial load
    loadLiveConversations()

    return () => {
      subscription.unsubscribe()
      setIsLiveMonitoring(false)
    }
  }

  const loadLiveConversations = async () => {
    try {
      const { data: liveAttempts, error } = await supabase
        .from('assessment_quiz_attempts')
        .select(`
          id,
          user_id,
          started_at,
          enhanced_assessments!inner(name, assessment_level),
          quiz_question_responses(
            id,
            question_number,
            question_text,
            user_response,
            created_at
          )
        `)
        .is('completed_at', null)
        .order('started_at', { ascending: false })
        .limit(10)

      if (error) throw error

      setLiveConversations(liveAttempts || [])
    } catch (error) {
      console.error('Error loading live conversations:', error)
    }
  }

  const loadUsers = async () => {
    try {
      // Note: In production, you'd need admin privileges to access auth.users
      // For now, we'll get users from our own tables that reference auth.users
      const { data, error } = await supabase
        .from('assessment_quiz_attempts')
        .select('user_id')
        .order('created_at', { ascending: false })

      if (error) {
        console.warn('Could not load users from quiz attempts:', error)
        setUsers([])
        return
      }

      // Get unique user IDs
      const uniqueUserIds = [...new Set(data?.map(item => item.user_id) || [])]
      
      // Create comprehensive mock user data with one detailed example
      const mockUsers: User[] = [
        // Real user with test data for demonstration
        {
          id: '1db3df34-7431-4870-9e5b-d2dcb083e3db',
          email: 'yossinac@gmail.com',
          created_at: '2024-01-10T09:00:00Z',
          last_sign_in_at: '2024-03-15T14:30:00Z',
          email_confirmed_at: '2024-01-10T09:15:00Z',
          user_metadata: { name: 'Test User with Real Data' },
          app_metadata: { role: 'user' }
        },
        // Additional mock users
        ...uniqueUserIds.slice(0, 9).map((userId, index) => ({
          id: userId,
          email: `user${index + 2}@example.com`,
          created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
          last_sign_in_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
          email_confirmed_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
          user_metadata: { name: `User ${index + 2}` },
          app_metadata: { role: 'user' }
        }))
      ]

      setUsers(mockUsers)
    } catch (error) {
      console.error('Error loading users:', error)
      setUsers([])
    } finally {
      setIsLoading(false)
    }
  }

  const loadUserProgress = async () => {
    try {
      const { data: quizData, error: quizError } = await supabase
        .from('assessment_quiz_attempts')
        .select('user_id, created_at, quiz_passed, readiness_score, emotional_maturity_score')

      if (quizError) {
        console.warn('Could not load user progress:', quizError)
        return
      }

      // Aggregate user progress data
      const progressMap: Record<string, UserProgress> = {}
      
      quizData?.forEach(attempt => {
        if (!progressMap[attempt.user_id]) {
          progressMap[attempt.user_id] = {
            user_id: attempt.user_id,
            assessments_completed: 0,
            quiz_attempts: 0,
            last_activity: attempt.created_at,
            current_level: 1,
            emotional_maturity_score: attempt.emotional_maturity_score
          }
        }

        progressMap[attempt.user_id].quiz_attempts += 1
        if (attempt.quiz_passed) {
          progressMap[attempt.user_id].assessments_completed += 1
        }
        
        // Update last activity if this is more recent
        if (new Date(attempt.created_at) > new Date(progressMap[attempt.user_id].last_activity)) {
          progressMap[attempt.user_id].last_activity = attempt.created_at
          progressMap[attempt.user_id].emotional_maturity_score = attempt.emotional_maturity_score
        }
      })

      // Add mock progress for real test user
      progressMap['1db3df34-7431-4870-9e5b-d2dcb083e3db'] = {
        user_id: '1db3df34-7431-4870-9e5b-d2dcb083e3db',
        assessments_completed: 1,
        quiz_attempts: 1,
        last_activity: '2024-01-15T11:15:00Z',
        current_level: 1,
        emotional_maturity_score: 8
      }

      setUserProgress(progressMap)
    } catch (error) {
      console.error('Error loading user progress:', error)
    }
  }

  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.user_metadata?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const resetUserPassword = async (userId: string) => {
    try {
      // In a real implementation, you'd call Supabase admin API
      alert(`Password reset email would be sent to user ${userId}`)
    } catch (error) {
      console.error('Error resetting password:', error)
      alert('Failed to reset password')
    }
  }

  const toggleUserStatus = async (userId: string, disable: boolean) => {
    try {
      // In a real implementation, you'd call Supabase admin API
      alert(`User ${userId} would be ${disable ? 'disabled' : 'enabled'}`)
    } catch (error) {
      console.error('Error updating user status:', error)
      alert('Failed to update user status')
    }
  }

  const loadDetailedUserHistory = async (user: User) => {
    setIsLoadingHistory(true)
    try {
      // Load real user assessment history from database
      const { data: assessmentAttempts, error: attemptsError } = await supabase
        .from('assessment_quiz_attempts')
        .select(`
          id,
          assessment_id,
          user_id,
          started_at,
          completed_at,
          readiness_score,
          emotional_maturity_score,
          quiz_passed,
          specific_feedback,
          enhanced_assessments!inner(
            name,
            assessment_level,
            category
          )
        `)
        .eq('user_id', user.id)
        .order('started_at', { ascending: true })

      if (attemptsError) {
        console.error('Error loading assessment attempts:', attemptsError)
        throw attemptsError
      }

      // Load conversation history for each assessment
      const assessmentsWithConversations: AssessmentAttempt[] = []

      for (const attempt of assessmentAttempts || []) {
        const { data: conversations, error: convError } = await supabase
          .from('quiz_question_responses')
          .select('*')
          .eq('quiz_attempt_id', attempt.id)
          .order('question_number', { ascending: true })

        if (convError) {
          console.error('Error loading conversations:', convError)
          continue
        }

        const conversationHistory: ConversationMessage[] = conversations?.map(conv => ({
          id: conv.id,
          question_number: conv.question_number,
          question_type: conv.question_type || 'set_question',
          question_text: conv.question_text || '',
          user_response: conv.user_response,
          ai_reasoning: conv.response_analysis?.ai_reasoning || 'No AI reasoning recorded',
          timestamp: conv.created_at,
          question_context: conv.question_context
        })) || []

        assessmentsWithConversations.push({
          id: attempt.id,
          assessment_name: attempt.enhanced_assessments.name,
          assessment_level: attempt.enhanced_assessments.assessment_level,
          started_at: attempt.started_at,
          completed_at: attempt.completed_at,
          readiness_score: attempt.readiness_score,
          emotional_maturity_score: attempt.emotional_maturity_score,
          quiz_passed: attempt.quiz_passed,
          specific_feedback: attempt.specific_feedback,
          conversation_history: conversationHistory
        })
      }

      // Calculate analytics
      const totalConversations = assessmentsWithConversations.reduce(
        (sum, assessment) => sum + assessment.conversation_history.length, 0
      )

      const avgSessionDuration = assessmentsWithConversations.length > 0
        ? Math.round(assessmentsWithConversations.reduce((sum, assessment) => {
            if (assessment.completed_at && assessment.started_at) {
              const duration = new Date(assessment.completed_at).getTime() - new Date(assessment.started_at).getTime()
              return sum + (duration / (1000 * 60)) // Convert to minutes
            }
            return sum
          }, 0) / assessmentsWithConversations.filter(a => a.completed_at).length)
        : 0

      // Create progression timeline
      const progressionTimeline = assessmentsWithConversations.map(assessment => ({
        date: new Date(assessment.started_at).toLocaleDateString(),
        event: assessment.completed_at ? 'Completed Assessment' : 'Started Assessment',
        details: `${assessment.assessment_name} (Level ${assessment.assessment_level})${
          assessment.readiness_score ? ` - Score: ${assessment.readiness_score}/100` : ''
        }`
      }))

      const realDetailedHistory: UserDetailedHistory = {
        user,
        assessments: assessmentsWithConversations,
        total_conversations: totalConversations,
        avg_session_duration: avgSessionDuration,
        progression_timeline: progressionTimeline
      }

      setUserDetailedHistory(realDetailedHistory)
    } catch (error) {
      console.error('Error loading detailed user history:', error)
      // Fallback to empty state
      setUserDetailedHistory({
        user,
        assessments: [],
        total_conversations: 0,
        avg_session_duration: 0,
        progression_timeline: []
      })
    } finally {
      setIsLoadingHistory(false)
    }
  }

  const isUserLive = (userId: string) => {
    return liveConversations.some(conv => conv.user_id === userId)
  }

  const getUserLiveConversation = (userId: string) => {
    return liveConversations.find(conv => conv.user_id === userId)
  }

  const viewUserDetails = async (user: User) => {
    setSelectedUser(user)
    setShowUserDetails(true)
    await loadDetailedUserHistory(user)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Users className="h-8 w-8 animate-pulse mx-auto mb-2" />
          <p>Loading users...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Users
            {liveConversations.length > 0 && (
              <Badge className="ml-1 h-5 w-5 p-0 text-xs bg-green-500 text-white">
                {liveConversations.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="progress" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Progress
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          {/* Search and Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                User Search
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search by email or name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Button onClick={loadUsers} variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Users List */}
          <div className="grid gap-4">
            {filteredUsers.length === 0 ? (
              <Card>
                <CardContent className="flex items-center justify-center p-8">
                  <div className="text-center">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No users found</p>
                    <p className="text-sm text-gray-500">Users will appear here as they sign up and use assessments</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              filteredUsers.map((user) => {
                const progress = userProgress[user.id]
                return (
                  <Card key={user.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              isUserLive(user.id) ? 'bg-green-100' : 'bg-blue-100'
                            }`}>
                              <Users className={`h-5 w-5 ${
                                isUserLive(user.id) ? 'text-green-600' : 'text-blue-600'
                              }`} />
                            </div>
                            {/* Live Indicator */}
                            {isUserLive(user.id) && (
                              <div className="absolute -top-1 -right-1 h-4 w-4 bg-green-500 rounded-full border-2 border-white">
                                <div className="h-full w-full bg-green-400 rounded-full animate-ping"></div>
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium">{user.user_metadata?.name || 'Unknown User'}</h3>
                              {isUserLive(user.id) && (
                                <Badge className="bg-green-500 text-white text-xs px-2 py-0">
                                  LIVE
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-600">{user.email}</p>
                            {isUserLive(user.id) && (
                              <div className="text-xs text-green-600 font-medium mt-1">
                                📝 Taking: {getUserLiveConversation(user.id)?.enhanced_assessments?.name}
                              </div>
                            )}
                            <div className="flex items-center gap-4 mt-1">
                              <span className="text-xs text-gray-500">
                                Joined: {new Date(user.created_at).toLocaleDateString()}
                              </span>
                              {user.last_sign_in_at && (
                                <span className="text-xs text-gray-500">
                                  Last active: {new Date(user.last_sign_in_at).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          {progress && (
                            <div className="text-right">
                              <div className="text-sm font-medium">
                                {progress.assessments_completed} assessments completed
                              </div>
                              <div className="text-xs text-gray-500">
                                {progress.quiz_attempts} quiz attempts
                              </div>
                              {progress.emotional_maturity_score && (
                                <Badge variant="outline" className="text-xs">
                                  Maturity: {progress.emotional_maturity_score}/10
                                </Badge>
                              )}
                            </div>
                          )}

                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => viewUserDetails(user)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => resetUserPassword(user.id)}
                            >
                              <Key className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })
            )}
          </div>
        </TabsContent>

        <TabsContent value="progress" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Progress Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{users.length}</div>
                  <div className="text-sm text-blue-700">Total Users</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {Object.values(userProgress).reduce((sum, p) => sum + p.assessments_completed, 0)}
                  </div>
                  <div className="text-sm text-green-700">Assessments Completed</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {Object.values(userProgress).reduce((sum, p) => sum + p.quiz_attempts, 0)}
                  </div>
                  <div className="text-sm text-purple-700">Quiz Attempts</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>



        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Management Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Authentication Settings</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Configure user authentication and access controls
                  </p>
                  <Button variant="outline" size="sm">
                    Configure Auth Settings
                  </Button>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">User Permissions</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Manage user roles and assessment access levels
                  </p>
                  <Button variant="outline" size="sm">
                    Manage Permissions
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Enhanced User Details Dialog */}
      <Dialog open={showUserDetails} onOpenChange={setShowUserDetails}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              User Analysis Dashboard
              {selectedUser && isUserLive(selectedUser.id) && (
                <Badge className="bg-green-500 text-white">
                  <div className="w-2 h-2 bg-white rounded-full mr-1 animate-pulse"></div>
                  LIVE NOW
                </Badge>
              )}
            </DialogTitle>
            <DialogDescription>
              Comprehensive view of user interactions, assessments, and AI conversations
            </DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <div className="space-y-6">
              {/* User Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">User Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <Label className="text-xs text-gray-500">Email</Label>
                      <p className="text-sm font-medium">{selectedUser.email}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">Name</Label>
                      <p className="text-sm font-medium">{selectedUser.user_metadata?.name || 'Not set'}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">Member Since</Label>
                      <p className="text-sm font-medium">{new Date(selectedUser.created_at).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">Last Active</Label>
                      <p className="text-sm font-medium">
                        {selectedUser.last_sign_in_at
                          ? new Date(selectedUser.last_sign_in_at).toLocaleDateString()
                          : 'Never'
                        }
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Live Conversation Section */}
              {selectedUser && isUserLive(selectedUser.id) && (
                <Card className="border-green-200 bg-green-50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-green-700">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                      Live Assessment in Progress
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {(() => {
                      const liveConv = getUserLiveConversation(selectedUser.id)
                      if (!liveConv) return null

                      return (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium text-green-800">
                                {liveConv.enhanced_assessments?.name}
                              </h4>
                              <p className="text-sm text-green-600">
                                Level {liveConv.enhanced_assessments?.assessment_level} •
                                Started {new Date(liveConv.started_at).toLocaleTimeString()}
                              </p>
                            </div>
                            <Badge variant="outline" className="border-green-300 text-green-700">
                              {liveConv.quiz_question_responses?.length || 0} questions answered
                            </Badge>
                          </div>

                          {/* Latest Question/Response */}
                          {liveConv.quiz_question_responses && liveConv.quiz_question_responses.length > 0 && (
                            <div className="bg-white p-3 rounded border border-green-200">
                              <div className="text-xs text-green-600 font-medium mb-1">Latest Question:</div>
                              <div className="text-sm mb-2">
                                {liveConv.quiz_question_responses[liveConv.quiz_question_responses.length - 1]?.question_text}
                              </div>
                              {liveConv.quiz_question_responses[liveConv.quiz_question_responses.length - 1]?.user_response && (
                                <>
                                  <div className="text-xs text-green-600 font-medium mb-1">User Response:</div>
                                  <div className="text-sm text-green-700 bg-green-50 p-2 rounded">
                                    {liveConv.quiz_question_responses[liveConv.quiz_question_responses.length - 1]?.user_response}
                                  </div>
                                </>
                              )}
                              <div className="text-xs text-gray-500 mt-2">
                                {new Date(liveConv.quiz_question_responses[liveConv.quiz_question_responses.length - 1]?.created_at).toLocaleTimeString()}
                              </div>
                            </div>
                          )}

                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => loadLiveConversations()}
                              className="border-green-300 text-green-700 hover:bg-green-100"
                            >
                              <RefreshCw className="h-3 w-3 mr-1" />
                              Refresh Live Data
                            </Button>
                          </div>
                        </div>
                      )
                    })()}
                  </CardContent>
                </Card>
              )}

              {/* Loading State */}
              {isLoadingHistory && (
                <Card>
                  <CardContent className="flex items-center justify-center p-8">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                      <p className="text-gray-600">Loading detailed history...</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Detailed History */}
              {userDetailedHistory && (
                <>
                  {/* Progress Statistics */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5" />
                        Progress Statistics
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-3 bg-blue-50 rounded-lg">
                          <div className="text-2xl font-bold text-blue-600">{userDetailedHistory.assessments.length}</div>
                          <div className="text-sm text-blue-700">Assessments</div>
                        </div>
                        <div className="text-center p-3 bg-green-50 rounded-lg">
                          <div className="text-2xl font-bold text-green-600">{userDetailedHistory.total_conversations}</div>
                          <div className="text-sm text-green-700">AI Conversations</div>
                        </div>
                        <div className="text-center p-3 bg-purple-50 rounded-lg">
                          <div className="text-2xl font-bold text-purple-600">{userDetailedHistory.avg_session_duration}m</div>
                          <div className="text-sm text-purple-700">Avg Session</div>
                        </div>
                        <div className="text-center p-3 bg-orange-50 rounded-lg">
                          <div className="text-2xl font-bold text-orange-600">
                            {userDetailedHistory.assessments[userDetailedHistory.assessments.length - 1]?.emotional_maturity_score || 'N/A'}
                          </div>
                          <div className="text-sm text-orange-700">Latest Maturity</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Assessment History */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Assessment History & AI Conversations
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {userDetailedHistory.assessments.map((assessment) => (
                        <div key={assessment.id} className="border rounded-lg p-4">
                          <div
                            className="flex items-center justify-between cursor-pointer"
                            onClick={() => setExpandedAssessment(
                              expandedAssessment === assessment.id ? null : assessment.id
                            )}
                          >
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-2">
                                {expandedAssessment === assessment.id ?
                                  <ChevronDown className="h-4 w-4" /> :
                                  <ChevronRight className="h-4 w-4" />
                                }
                                <Target className="h-5 w-5 text-blue-600" />
                              </div>
                              <div>
                                <h4 className="font-medium">{assessment.assessment_name}</h4>
                                <p className="text-sm text-gray-600">
                                  Level {assessment.assessment_level} •
                                  {assessment.completed_at ?
                                    ` Completed ${new Date(assessment.completed_at).toLocaleDateString()}` :
                                    ' In Progress'
                                  }
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              {assessment.readiness_score && (
                                <Badge variant={assessment.quiz_passed ? "default" : "destructive"}>
                                  {assessment.readiness_score}/100
                                </Badge>
                              )}
                              <Badge variant="outline">
                                Maturity: {assessment.emotional_maturity_score}/10
                              </Badge>
                            </div>
                          </div>

                          {expandedAssessment === assessment.id && (
                            <div className="mt-4 space-y-4">
                              {/* AI Feedback */}
                              {assessment.specific_feedback && (
                                <div className="bg-blue-50 p-3 rounded-lg">
                                  <Label className="text-sm font-medium text-blue-700">AI Assessment Summary</Label>
                                  <p className="text-sm text-blue-600 mt-1">{assessment.specific_feedback}</p>
                                </div>
                              )}

                              {/* Conversation History */}
                              <div className="space-y-3">
                                <Label className="text-sm font-medium">Complete AI Conversation</Label>
                                {assessment.conversation_history.map((message, index) => (
                                  <div key={message.id} className="border-l-4 border-gray-200 pl-4 py-2">
                                    <div className="flex items-center gap-2 mb-2">
                                      <MessageSquare className="h-4 w-4 text-gray-500" />
                                      <span className="text-xs text-gray-500">
                                        Q{message.question_number} • {message.question_type} •
                                        {new Date(message.timestamp).toLocaleTimeString()}
                                      </span>
                                    </div>

                                    <div className="space-y-2">
                                      <div className="bg-gray-50 p-3 rounded">
                                        <Label className="text-xs text-gray-600">AI Question:</Label>
                                        <p className="text-sm mt-1">{message.question_text}</p>
                                      </div>

                                      {message.user_response && (
                                        <div className="bg-blue-50 p-3 rounded">
                                          <Label className="text-xs text-blue-600">User Response:</Label>
                                          <p className="text-sm mt-1">{message.user_response}</p>
                                        </div>
                                      )}

                                      {message.ai_reasoning && (
                                        <div className="bg-yellow-50 p-3 rounded">
                                          <Label className="text-xs text-yellow-700 flex items-center gap-1">
                                            <Brain className="h-3 w-3" />
                                            AI Reasoning & Analysis:
                                          </Label>
                                          <p className="text-sm mt-1 text-yellow-600">{message.ai_reasoning}</p>
                                        </div>
                                      )}

                                      {message.question_context && (
                                        <details className="text-xs">
                                          <summary className="text-gray-500 cursor-pointer">Context Data</summary>
                                          <pre className="text-gray-400 mt-1 bg-gray-100 p-2 rounded text-xs overflow-x-auto">
                                            {JSON.stringify(message.question_context, null, 2)}
                                          </pre>
                                        </details>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Progression Timeline */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        Progression Timeline
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {userDetailedHistory.progression_timeline.map((event, index) => (
                          <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <span className="font-medium">{event.event}</span>
                                <span className="text-sm text-gray-500">{event.date}</span>
                              </div>
                              <p className="text-sm text-gray-600">{event.details}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}

              {/* Admin Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Admin Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => resetUserPassword(selectedUser.id)}
                    >
                      <Key className="h-4 w-4 mr-2" />
                      Reset Password
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => toggleUserStatus(selectedUser.id, false)}
                    >
                      <UserCheck className="h-4 w-4 mr-2" />
                      Enable User
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => toggleUserStatus(selectedUser.id, true)}
                    >
                      <UserX className="h-4 w-4 mr-2" />
                      Disable User
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
