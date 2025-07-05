"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Brain, 
  Settings, 
  Users, 
  Sparkles,
  BarChart3,
  FileText,
  Target
} from 'lucide-react'
// import Link from 'next/link'
// import { archetypeService } from '@/lib/services/archetype.service'
import { ArchetypeCardManager } from '@/components/admin/ArchetypeCardManager'
import { AssessmentBuilder } from '@/components/admin/AssessmentBuilder'
import { SimplifiedAssessmentBuilder } from '@/components/admin/SimplifiedAssessmentBuilder'
// import { CreateAssessmentDialog } from '@/components/admin/CreateAssessmentDialog'

interface AssessmentOverview {
  id: string
  name: string
  description: string
  type: 'ai-driven' | 'traditional'
  status: 'active' | 'draft' | 'archived'
  targetArchetypes: string[]
  sessions: number
  completion: number
  lastUpdated: Date
}

interface Archetype {
  id: string
  name: string
  category: string
  description: string
  impact_score: number
  traits: unknown
  psychology_profile: unknown
  is_active: boolean | null
  created_at: string
  updated_at: string
}

interface LinguisticPattern {
  id: string
  archetype_name: string
  category: string
  keywords: string[] | null
  phrases: string[] | null
  emotional_indicators: string[] | null
  behavioral_patterns: string[] | null
  created_at: string
  updated_at: string
}

interface AssessmentConfig {
  name: string
  description: string
  purpose: string
  targetArchetypes: string[]
  analysisInstructions: string
  questioningStyle: string
  expectedDuration: number
  completionCriteria: string
  systemPrompt: string
  conversationFlow: string
  archetypeMapping: string
  reportGeneration: string
}

interface SimplifiedAssessmentConfig {
  name: string
  description: string
  purpose: string
  expectedDuration: number
  systemPrompt: string
  questioningStyle: string
  targetArchetypes: string[]
  completionCriteria: string
  reportGeneration: string
}

export default function AdminPage() {
  // const [assessments] = useState<AssessmentOverview[]>([])
  // const [archetypes] = useState<Archetype[]>([])
  // const [linguisticPatterns] = useState<LinguisticPattern[]>([])
  const [activeTab, setActiveTab] = useState('overview')
  // const [loading] = useState(true)
  // const [showCreateDialog] = useState(false)
  const [assessmentMode, setAssessmentMode] = useState<'simplified' | 'advanced'>('simplified')

  // Data loading would be implemented here in production

  const handleSaveAssessment = (config: AssessmentConfig) => {
    console.log('Saving assessment:', config)
    // In a real app, this would save to your database
  }

  const handleSaveSimplifiedAssessment = (config: SimplifiedAssessmentConfig) => {
    console.log('Saving simplified assessment:', config)
    // In a real app, this would save to your database
  }

  const handleTestAssessment = (config: AssessmentConfig | SimplifiedAssessmentConfig) => {
    console.log('Testing assessment:', config)
    // In a real app, this would open a test interface
  }

  const stats = {
    totalAssessments: 12,
    activeUsers: 847,
    completionRate: 78,
    avgDuration: 12
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-light text-gray-900 mb-3">Admin Console</h1>
          <p className="text-lg text-gray-600">Manage assessments and content</p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="bg-white border border-gray-200 p-1 rounded-lg shadow-sm">
            <TabsTrigger 
              value="overview" 
              className="data-[state=active]:bg-blue-500 data-[state=active]:text-white text-gray-600 px-6 py-3 rounded-md font-medium"
            >
              <BarChart3 className="mr-2 h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="assessments"
              className="data-[state=active]:bg-blue-500 data-[state=active]:text-white text-gray-600 px-6 py-3 rounded-md font-medium"
            >
              <Brain className="mr-2 h-4 w-4" />
              Assessments
            </TabsTrigger>
            <TabsTrigger 
              value="archetypes"
              className="data-[state=active]:bg-blue-500 data-[state=active]:text-white text-gray-600 px-6 py-3 rounded-md font-medium"
            >
              <Users className="mr-2 h-4 w-4" />
              Archetypes
            </TabsTrigger>
            <TabsTrigger 
              value="analytics"
              className="data-[state=active]:bg-blue-500 data-[state=active]:text-white text-gray-600 px-6 py-3 rounded-md font-medium"
            >
              <Target className="mr-2 h-4 w-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Assessments</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalAssessments}</div>
                  <p className="text-xs text-muted-foreground">Active configurations</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.activeUsers}</div>
                  <p className="text-xs text-muted-foreground">Monthly active users</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.completionRate}%</div>
                  <p className="text-xs text-muted-foreground">Assessment completion</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg Duration</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.avgDuration}m</div>
                  <p className="text-xs text-muted-foreground">Average assessment time</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest assessment completions and user interactions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium">Leadership Assessment completed</p>
                      <p className="text-xs text-gray-500">User identified as &quot;Visionary Leader&quot; - 5 minutes ago</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium">New archetype card created</p>
                      <p className="text-xs text-gray-500">&quot;The Innovator&quot; card added to system - 12 minutes ago</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium">Assessment configuration updated</p>
                      <p className="text-xs text-gray-500">Relationship Assessment modified - 1 hour ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Assessments Tab */}
          <TabsContent value="assessments" className="space-y-8">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Assessment Builder</CardTitle>
                    <CardDescription>Create and configure AI-powered archetype assessments</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant={assessmentMode === 'simplified' ? 'default' : 'outline'}
                      onClick={() => setAssessmentMode('simplified')}
                      size="sm"
                    >
                      <Sparkles className="h-4 w-4 mr-2" />
                      Simplified
                    </Button>
                    <Button 
                      variant={assessmentMode === 'advanced' ? 'default' : 'outline'}
                      onClick={() => setAssessmentMode('advanced')}
                      size="sm"
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Advanced
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {assessmentMode === 'simplified' ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        Recommended
                      </Badge>
                      <span>Streamlined interface with 4 focused sections</span>
                    </div>
                    <SimplifiedAssessmentBuilder 
                      onSave={handleSaveSimplifiedAssessment}
                      onTest={handleTestAssessment}
                    />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Badge variant="outline">Advanced</Badge>
                      <span>Full configuration with 8 detailed sections</span>
                    </div>
                    <AssessmentBuilder 
                      onSave={handleSaveAssessment}
                      onTest={handleTestAssessment}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Archetype Content Tab */}
          <TabsContent value="archetypes" className="space-y-8">
            <ArchetypeCardManager />
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Analytics Dashboard</CardTitle>
                <CardDescription>
                  Track assessment performance and user engagement
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Analytics Coming Soon</h3>
                  <p className="text-gray-600">
                    Detailed analytics and reporting features will be available in the next update.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Create Assessment Dialog - Coming Soon */}
        {/* <CreateAssessmentDialog 
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
          onAssessmentCreated={(assessment) => {
            console.log('New assessment created:', assessment)
            setShowCreateDialog(false)
          }}
        /> */}
      </div>
    </div>
  )
} 