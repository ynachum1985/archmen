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
  RefreshCw
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

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [userProgress, setUserProgress] = useState<Record<string, UserProgress>>({})
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showUserDetails, setShowUserDetails] = useState(false)

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
      
      // For demo purposes, create mock user data
      const mockUsers: User[] = uniqueUserIds.slice(0, 10).map((userId, index) => ({
        id: userId,
        email: `user${index + 1}@example.com`,
        created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        last_sign_in_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        email_confirmed_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        user_metadata: { name: `User ${index + 1}` },
        app_metadata: { role: 'user' }
      }))

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

  const viewUserDetails = (user: User) => {
    setSelectedUser(user)
    setShowUserDetails(true)
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

      {/* User Details Dialog */}
      <Dialog open={showUserDetails} onOpenChange={setShowUserDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>
              Detailed information and management options for this user
            </DialogDescription>
          </DialogHeader>
          
          {selectedUser && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Email</Label>
                  <p className="text-sm">{selectedUser.email}</p>
                </div>
                <div>
                  <Label>Name</Label>
                  <p className="text-sm">{selectedUser.user_metadata?.name || 'Not set'}</p>
                </div>
                <div>
                  <Label>Created</Label>
                  <p className="text-sm">{new Date(selectedUser.created_at).toLocaleString()}</p>
                </div>
                <div>
                  <Label>Last Sign In</Label>
                  <p className="text-sm">
                    {selectedUser.last_sign_in_at 
                      ? new Date(selectedUser.last_sign_in_at).toLocaleString()
                      : 'Never'
                    }
                  </p>
                </div>
              </div>

              {userProgress[selectedUser.id] && (
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-2">Progress Summary</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>Assessments Completed: {userProgress[selectedUser.id].assessments_completed}</div>
                    <div>Quiz Attempts: {userProgress[selectedUser.id].quiz_attempts}</div>
                    <div>Current Level: {userProgress[selectedUser.id].current_level}</div>
                    <div>
                      Emotional Maturity: {userProgress[selectedUser.id].emotional_maturity_score || 'Not assessed'}/10
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-4">
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
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
