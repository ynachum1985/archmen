'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Lock, 
  Unlock, 
  TrendingUp, 
  Users, 
  CheckCircle, 
  XCircle,
  AlertTriangle,
  BarChart3,
  Settings,
  Eye
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { ProgressionService } from '@/lib/services/progression.service'

interface AssessmentLevel {
  id: string
  level_number: number
  name: string
  description: string
  theme: string
  emotional_maturity_required: number
  integration_requirements: Record<string, any>
  unlock_criteria: Record<string, any>
  is_active: boolean
}

interface UserProgressionSummary {
  user_id: string
  current_level: number
  emotional_maturity_score: number
  completed_assessments: string[]
  blocked_until?: string
  progression_notes?: string
}

export function ProgressionManager() {
  const [levels, setLevels] = useState<AssessmentLevel[]>([])
  const [userProgressions, setUserProgressions] = useState<UserProgressionSummary[]>([])
  const [selectedLevel, setSelectedLevel] = useState<AssessmentLevel | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('levels')

  const progressionService = new ProgressionService()
  const supabase = createClient()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setIsLoading(true)
    try {
      // Load assessment levels
      const levelsData = await progressionService.getAssessmentLevels()
      setLevels(levelsData)

      // Load user progressions summary
      const { data: progressions, error } = await supabase
        .from('user_progression')
        .select('user_id, current_level, emotional_maturity_score, completed_assessments, blocked_until, progression_notes')
        .order('current_level', { ascending: false })
        .limit(50)

      if (error) throw error
      setUserProgressions(progressions || [])
    } catch (error) {
      console.error('Error loading progression data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const updateLevel = async (levelId: string, updates: Partial<AssessmentLevel>) => {
    try {
      const { error } = await supabase
        .from('assessment_levels')
        .update(updates)
        .eq('id', levelId)

      if (error) throw error
      
      // Reload data
      await loadData()
    } catch (error) {
      console.error('Error updating level:', error)
      alert('Failed to update level')
    }
  }

  const getLevelStats = (levelNumber: number) => {
    const usersAtLevel = userProgressions.filter(p => p.current_level === levelNumber).length
    const usersBlocked = userProgressions.filter(p => p.blocked_until && new Date(p.blocked_until) > new Date()).length
    return { usersAtLevel, usersBlocked }
  }

  const getEmotionalMaturityColor = (score: number) => {
    if (score >= 8) return 'text-green-600'
    if (score >= 6) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getLevelThemeColor = (theme: string) => {
    switch (theme) {
      case 'relationships_dating': return 'bg-blue-100 text-blue-800'
      case 'shadow_integration': return 'bg-purple-100 text-purple-800'
      case 'advanced_concepts': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <BarChart3 className="h-8 w-8 animate-pulse mx-auto mb-2" />
          <p>Loading progression data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Progression Management</h2>
        <p className="text-gray-600">
          Manage assessment levels, user progression, and content integration requirements
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="levels" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Assessment Levels
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            User Progression
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        {/* Assessment Levels Tab */}
        <TabsContent value="levels" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {levels.map((level) => {
              const stats = getLevelStats(level.level_number)
              return (
                <Card key={level.id} className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => setSelectedLevel(level)}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold text-blue-600">{level.level_number}</span>
                        </div>
                        {level.name}
                      </CardTitle>
                      {level.is_active ? (
                        <Unlock className="h-4 w-4 text-green-500" />
                      ) : (
                        <Lock className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <Badge className={getLevelThemeColor(level.theme)}>
                        {level.theme.replace('_', ' ')}
                      </Badge>
                      
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {level.description}
                      </p>
                      
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500">
                          Emotional Maturity: {level.emotional_maturity_required}/10
                        </span>
                        <span className="text-blue-600">
                          {stats.usersAtLevel} users
                        </span>
                      </div>

                      {stats.usersBlocked > 0 && (
                        <div className="flex items-center gap-1 text-xs text-orange-600">
                          <AlertTriangle className="h-3 w-3" />
                          {stats.usersBlocked} blocked
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Level Details Modal/Panel */}
          {selectedLevel && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Level {selectedLevel.level_number}: {selectedLevel.name}</span>
                  <Button variant="outline" onClick={() => setSelectedLevel(null)}>
                    Close
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Description</Label>
                    <Textarea 
                      value={selectedLevel.description}
                      onChange={(e) => setSelectedLevel({
                        ...selectedLevel,
                        description: e.target.value
                      })}
                      rows={3}
                    />
                  </div>
                  
                  <div>
                    <Label>Theme</Label>
                    <Input 
                      value={selectedLevel.theme}
                      onChange={(e) => setSelectedLevel({
                        ...selectedLevel,
                        theme: e.target.value
                      })}
                    />
                  </div>
                  
                  <div>
                    <Label>Emotional Maturity Required (1-10)</Label>
                    <Input 
                      type="number"
                      min="1"
                      max="10"
                      value={selectedLevel.emotional_maturity_required}
                      onChange={(e) => setSelectedLevel({
                        ...selectedLevel,
                        emotional_maturity_required: parseInt(e.target.value)
                      })}
                    />
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedLevel.is_active}
                      onChange={(e) => setSelectedLevel({
                        ...selectedLevel,
                        is_active: e.target.checked
                      })}
                    />
                    <Label>Active</Label>
                  </div>
                </div>

                <div>
                  <Label>Integration Requirements (JSON)</Label>
                  <Textarea 
                    value={JSON.stringify(selectedLevel.integration_requirements, null, 2)}
                    onChange={(e) => {
                      try {
                        const parsed = JSON.parse(e.target.value)
                        setSelectedLevel({
                          ...selectedLevel,
                          integration_requirements: parsed
                        })
                      } catch (error) {
                        // Invalid JSON, don't update
                      }
                    }}
                    rows={4}
                    className="font-mono text-sm"
                  />
                </div>

                <Button 
                  onClick={() => updateLevel(selectedLevel.id, selectedLevel)}
                  className="w-full"
                >
                  Update Level
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* User Progression Tab */}
        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Progression Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {userProgressions.map((progression) => (
                  <div key={progression.user_id} 
                       className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-blue-600">
                          {progression.current_level}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{progression.user_id.slice(0, 8)}...</p>
                        <p className="text-sm text-gray-500">
                          {progression.completed_assessments.length} assessments completed
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className={`text-sm font-medium ${getEmotionalMaturityColor(progression.emotional_maturity_score)}`}>
                          Emotional Maturity: {progression.emotional_maturity_score}/10
                        </p>
                        {progression.blocked_until && new Date(progression.blocked_until) > new Date() && (
                          <p className="text-xs text-orange-600">
                            Blocked until {new Date(progression.blocked_until).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Level Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {levels.map((level) => {
                    const stats = getLevelStats(level.level_number)
                    const percentage = userProgressions.length > 0 
                      ? (stats.usersAtLevel / userProgressions.length) * 100 
                      : 0
                    
                    return (
                      <div key={level.id} className="flex items-center justify-between">
                        <span className="text-sm">Level {level.level_number}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-500 h-2 rounded-full"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-500 w-8">
                            {stats.usersAtLevel}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Emotional Maturity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Average Score:</span>
                    <span className="font-medium">
                      {userProgressions.length > 0 
                        ? (userProgressions.reduce((sum, p) => sum + p.emotional_maturity_score, 0) / userProgressions.length).toFixed(1)
                        : '0'}/10
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>High Maturity (8+):</span>
                    <span className="text-green-600">
                      {userProgressions.filter(p => p.emotional_maturity_score >= 8).length}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Needs Support (≤5):</span>
                    <span className="text-red-600">
                      {userProgressions.filter(p => p.emotional_maturity_score <= 5).length}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Progression Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Total Users:</span>
                    <span className="font-medium">{userProgressions.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Currently Blocked:</span>
                    <span className="text-orange-600">
                      {userProgressions.filter(p => p.blocked_until && new Date(p.blocked_until) > new Date()).length}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Advanced Level (3+):</span>
                    <span className="text-purple-600">
                      {userProgressions.filter(p => p.current_level >= 3).length}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
