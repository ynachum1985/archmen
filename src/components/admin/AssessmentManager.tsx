'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ADVANCED_ARCHETYPE_SCENARIOS } from '@/data/advanced-scenarios'

interface AssessmentStats {
  totalSessions: number
  completedSessions: number
  averageCompletion: number
  topArchetypes: { name: string; count: number }[]
  conversionRate: number
}

export function AssessmentManager() {
  const [stats, setStats] = useState<AssessmentStats>({
    totalSessions: 0,
    completedSessions: 0,
    averageCompletion: 0,
    topArchetypes: [],
    conversionRate: 0
  })

  // Mock data for demonstration
  useEffect(() => {
    // In production, this would fetch from your analytics API
    setStats({
      totalSessions: 247,
      completedSessions: 189,
      averageCompletion: 76.5,
      topArchetypes: [
        { name: 'Warrior', count: 45 },
        { name: 'Lover', count: 38 },
        { name: 'Sage', count: 32 },
        { name: 'Hermit', count: 28 },
        { name: 'Caregiver', count: 24 }
      ],
      conversionRate: 23.8
    })
  }, [])

  const mockRecentSessions = [
    {
      id: 'sess_001',
      started: '2024-01-15T10:30:00Z',
      completed: true,
      primaryArchetype: 'Warrior',
      confidence: 87,
      questionsAnswered: 8,
      assessmentType: 'free'
    },
    {
      id: 'sess_002', 
      started: '2024-01-15T11:15:00Z',
      completed: true,
      primaryArchetype: 'Lover',
      confidence: 92,
      questionsAnswered: 20,
      assessmentType: 'paid'
    },
    {
      id: 'sess_003',
      started: '2024-01-15T12:00:00Z',
      completed: false,
      primaryArchetype: null,
      confidence: 0,
      questionsAnswered: 3,
      assessmentType: 'free'
    }
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-200 mb-2">Assessment Manager</h2>
        <p className="text-slate-400">
          Monitor assessment performance, analyze user patterns, and manage the question bank
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-slate-800 border-slate-700">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sessions">Recent Sessions</TabsTrigger>
          <TabsTrigger value="questions">Question Bank</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-teal-300 text-sm font-medium">Total Sessions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-200">{stats.totalSessions}</div>
                <p className="text-slate-400 text-sm">All time</p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-orange-300 text-sm font-medium">Completion Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-200">{stats.averageCompletion}%</div>
                <p className="text-slate-400 text-sm">{stats.completedSessions} completed</p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-purple-300 text-sm font-medium">Conversion Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-200">{stats.conversionRate}%</div>
                <p className="text-slate-400 text-sm">Free to paid</p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-green-300 text-sm font-medium">Top Archetype</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-200">
                  {stats.topArchetypes[0]?.name || 'N/A'}
                </div>
                <p className="text-slate-400 text-sm">
                  {stats.topArchetypes[0]?.count || 0} users
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Top Archetypes */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-slate-200">Most Common Archetypes</CardTitle>
              <CardDescription className="text-slate-400">
                Distribution of primary archetypes from completed assessments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.topArchetypes.map((archetype, index) => (
                  <div key={archetype.name} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        index === 0 ? 'bg-teal-600 text-white' : 
                        index === 1 ? 'bg-orange-600 text-white' :
                        'bg-slate-600 text-slate-300'
                      }`}>
                        {index + 1}
                      </div>
                      <span className="text-slate-200 font-medium">{archetype.name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-slate-300">{archetype.count} users</span>
                      <div className="w-20 bg-slate-700 rounded-full h-2">
                        <div 
                          className="bg-teal-500 h-2 rounded-full"
                          style={{ 
                            width: `${(archetype.count / stats.topArchetypes[0].count) * 100}%` 
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sessions" className="space-y-6">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-slate-200">Recent Assessment Sessions</CardTitle>
              <CardDescription className="text-slate-400">
                Latest user assessment sessions and their outcomes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockRecentSessions.map((session) => (
                  <div key={session.id} className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg border border-slate-600">
                    <div className="flex items-center space-x-4">
                      <Badge 
                        variant={session.completed ? "default" : "secondary"}
                        className={session.completed ? "bg-green-600" : "bg-yellow-600"}
                      >
                        {session.completed ? 'Completed' : 'Abandoned'}
                      </Badge>
                      <div>
                        <div className="text-slate-200 font-medium">
                          Session {session.id}
                        </div>
                        <div className="text-slate-400 text-sm">
                          {new Date(session.started).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      {session.completed ? (
                        <>
                          <div className="text-slate-200 font-medium">
                            {session.primaryArchetype}
                          </div>
                          <div className="text-slate-400 text-sm">
                            {session.confidence}% confidence • {session.questionsAnswered} questions
                          </div>
                        </>
                      ) : (
                        <div className="text-slate-400">
                          {session.questionsAnswered} questions answered
                        </div>
                      )}
                      <Badge 
                        variant="outline" 
                        className={session.assessmentType === 'paid' ? 'border-orange-500 text-orange-300' : 'border-teal-500 text-teal-300'}
                      >
                        {session.assessmentType}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="questions" className="space-y-6">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-slate-200">Question Bank Management</CardTitle>
              <CardDescription className="text-slate-400">
                Manage assessment scenarios and their performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-slate-300 font-medium">
                    Total Questions: {ADVANCED_ARCHETYPE_SCENARIOS.length}
                  </span>
                  <Button size="sm" className="bg-teal-600 hover:bg-teal-700">
                    Add New Question
                  </Button>
                </div>
                
                <div className="space-y-3">
                  {ADVANCED_ARCHETYPE_SCENARIOS.slice(0, 5).map((scenario) => (
                    <div key={scenario.id} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg border border-slate-600">
                      <div>
                        <div className="text-slate-200 font-medium">{scenario.title}</div>
                        <div className="text-slate-400 text-sm">
                          Category: {scenario.category} • Targets: {scenario.targetArchetypes.join(', ')}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" className="border-slate-600 text-slate-300">
                          Edit
                        </Button>
                        <Button size="sm" variant="outline" className="border-slate-600 text-slate-300">
                          Analytics
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-slate-200">Assessment Analytics</CardTitle>
              <CardDescription className="text-slate-400">
                Detailed analytics and insights from assessment data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <div className="text-slate-400 mb-4">📊</div>
                <h3 className="text-slate-300 text-lg font-medium mb-2">
                  Advanced Analytics Coming Soon
                </h3>
                <p className="text-slate-400 text-sm">
                  Detailed question performance, user journey analysis, and conversion insights
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 