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

  const supabase = createClient()

  useEffect(() => {
    loadUsers()
    loadUserProgress()
  }, [])

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
        // Detailed mock user for demonstration
        {
          id: 'demo_user_001',
          email: 'sarah.johnson@example.com',
          created_at: '2024-01-10T09:00:00Z',
          last_sign_in_at: '2024-03-15T14:30:00Z',
          email_confirmed_at: '2024-01-10T09:15:00Z',
          user_metadata: { name: 'Sarah Johnson' },
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

      // Add mock progress for demo user
      progressMap['demo_user_001'] = {
        user_id: 'demo_user_001',
        assessments_completed: 2,
        quiz_attempts: 3,
        last_activity: '2024-03-15T14:30:00Z',
        current_level: 2,
        emotional_maturity_score: 9
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
      // In a real implementation, this would call an API endpoint
      // For now, we'll create comprehensive mock data
      const mockDetailedHistory: UserDetailedHistory = {
        user,
        assessments: [
          {
            id: 'attempt_1',
            assessment_name: 'Relationship Foundations',
            assessment_level: 1,
            started_at: '2024-01-15T10:30:00Z',
            completed_at: '2024-01-15T11:15:00Z',
            readiness_score: 85,
            emotional_maturity_score: 8,
            quiz_passed: true,
            specific_feedback: 'Excellent self-awareness and communication skills. Shows strong foundation for deeper work. Areas for growth: boundary setting and conflict resolution.',
            conversation_history: [
              {
                id: 'msg_1',
                question_number: 1,
                question_type: 'set_question',
                question_text: 'Welcome to your readiness assessment for Relationship Foundations. Let\'s start by exploring your communication patterns. How do you typically express your needs in close relationships?',
                user_response: 'I try to be direct but kind. Sometimes I struggle when the other person gets defensive, and I end up backing down to avoid conflict.',
                ai_reasoning: 'User shows awareness of communication style and identifies specific challenge with defensive responses. This indicates good self-reflection but potential boundary issues.',
                timestamp: '2024-01-15T10:32:00Z',
                question_context: { assessment_level: 1, quiz_phase: 'introduction' }
              },
              {
                id: 'msg_2',
                question_number: 2,
                question_type: 'set_question',
                question_text: 'That shows good self-awareness about your communication style. When you mention backing down to avoid conflict, can you tell me about a recent situation where this happened and how it felt for you?',
                user_response: 'Last week with my partner about household responsibilities. They got upset when I brought it up, so I just said "never mind" and did the tasks myself. I felt frustrated and unheard, but also guilty for causing tension.',
                ai_reasoning: 'Clear example of conflict avoidance and people-pleasing patterns. User experiences emotional consequences but prioritizes harmony over needs. This is common Level 1 pattern.',
                timestamp: '2024-01-15T10:35:00Z',
                question_context: { previous_response: 'backing down to avoid conflict', quiz_phase: 'set_questions' }
              },
              {
                id: 'msg_3',
                question_number: 3,
                question_type: 'experience_based',
                question_text: 'I can hear the internal conflict between wanting to be heard and wanting to maintain harmony. This is actually very common and shows emotional intelligence. How do you think this pattern might be affecting your relationships over time?',
                user_response: 'I think it builds resentment on my side, and my partner probably doesn\'t even realize there are issues because I don\'t follow through on conversations. It\'s not sustainable, but I don\'t know how to change it without causing more problems.',
                ai_reasoning: 'Excellent insight into long-term consequences. User understands the systemic impact and expresses desire for change while acknowledging fear. Ready for foundational work.',
                timestamp: '2024-01-15T10:38:00Z',
                question_context: { quiz_phase: 'experience_analysis' }
              },
              {
                id: 'msg_4',
                question_number: 4,
                question_type: 'conclusion',
                question_text: 'ASSESSMENT: Based on our conversation, you demonstrate strong self-awareness, emotional intelligence, and insight into relationship patterns. Your ability to identify specific examples and understand long-term consequences shows readiness for foundational relationship work. Score: 85/100. You\'re well-prepared to explore communication skills, boundary setting, and conflict resolution in the Relationship Foundations assessment.',
                user_response: '',
                ai_reasoning: 'User meets all criteria for Level 1 readiness: self-awareness (high), specific examples (provided), emotional insight (demonstrated), growth motivation (expressed). Score reflects strong foundation with room for skill development.',
                timestamp: '2024-01-15T10:42:00Z',
                question_context: { final_assessment: true }
              }
            ]
          },
          {
            id: 'attempt_2',
            assessment_name: 'Shadow Work Integration',
            assessment_level: 2,
            started_at: '2024-02-20T14:15:00Z',
            completed_at: '2024-02-20T15:00:00Z',
            readiness_score: 78,
            emotional_maturity_score: 9,
            quiz_passed: true,
            specific_feedback: 'Significant growth since Level 1. Shows integration of previous insights and readiness for shadow work. Demonstrates emotional regulation and deeper self-reflection.',
            conversation_history: [
              {
                id: 'msg_5',
                question_number: 1,
                question_type: 'set_question',
                question_text: 'Welcome back! I can see from your previous assessment that you scored 85/100 and showed excellent self-awareness around communication patterns. How have you been applying those insights since completing Relationship Foundations?',
                user_response: 'I\'ve been practicing speaking up more, even when it feels uncomfortable. I had that conversation with my partner about household tasks again, and this time I stayed present even when they got defensive. It was hard but we actually worked it out.',
                ai_reasoning: 'Clear evidence of integration and application of previous insights. User demonstrates growth in conflict tolerance and boundary maintenance. This shows readiness for deeper work.',
                timestamp: '2024-02-20T14:17:00Z',
                question_context: { assessment_level: 2, previous_score: 85, quiz_phase: 'experience_analysis' }
              },
              {
                id: 'msg_6',
                question_number: 2,
                question_type: 'experience_based',
                question_text: 'That\'s remarkable progress! You\'ve moved from avoiding conflict to staying present through difficulty. Shadow work involves exploring the parts of ourselves we typically avoid or judge. What aspects of yourself do you find most challenging to accept?',
                user_response: 'I struggle with my anger. I was taught that anger is bad, so I suppress it, but then it comes out as passive-aggression or I turn it on myself. I\'m starting to see that my anger might actually be telling me something important about my boundaries.',
                ai_reasoning: 'Sophisticated understanding of shadow dynamics. User identifies suppressed emotion, recognizes unhealthy expressions, and shows insight into anger as boundary information. Ready for shadow integration work.',
                timestamp: '2024-02-20T14:22:00Z',
                question_context: { quiz_phase: 'shadow_exploration' }
              }
            ]
          }
        ],
        total_conversations: 8,
        avg_session_duration: 42,
        progression_timeline: [
          {
            date: '2024-01-15',
            event: 'Completed Level 1 Assessment',
            details: 'Relationship Foundations - Score: 85/100'
          },
          {
            date: '2024-02-20',
            event: 'Completed Level 2 Assessment',
            details: 'Shadow Work Integration - Score: 78/100'
          },
          {
            date: '2024-03-01',
            event: 'Started Level 3 Assessment',
            details: 'Advanced Relationship Dynamics - In Progress'
          }
        ]
      }

      setUserDetailedHistory(mockDetailedHistory)
    } catch (error) {
      console.error('Error loading detailed user history:', error)
    } finally {
      setIsLoadingHistory(false)
    }
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
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <Users className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-medium">{user.user_metadata?.name || 'Unknown User'}</h3>
                            <p className="text-sm text-gray-600">{user.email}</p>
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
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              User Analysis Dashboard
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
