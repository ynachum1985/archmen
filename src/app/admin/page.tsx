"use client"

import { useState, useEffect } from 'react'
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
  Target,
  MessageSquare
} from 'lucide-react'
// import Link from 'next/link'
// import { archetypeService } from '@/lib/services/archetype.service'
import { ArchetypeCardManager } from '@/components/admin/ArchetypeCardManager'
import { AssessmentBuilder } from '@/components/admin/AssessmentBuilder'
import { SimplifiedAssessmentBuilder } from '@/components/admin/SimplifiedAssessmentBuilder'
// import { CreateAssessmentDialog } from '@/components/admin/CreateAssessmentDialog'

// Commented out unused interfaces for simplified version
/*
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
*/

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

// interface Archetype {
//   id: string
//   name: string
//   category: string
//   description: string
//   impact_score: number
//   traits: unknown
//   psychology_profile: unknown
//   is_active: boolean | null
//   created_at: string
//   updated_at: string
// }

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

export default function AdminPage() {
  // const [assessments] = useState<AssessmentOverview[]>([])
  // const [archetypes] = useState<Archetype[]>([])
  // const [linguisticPatterns] = useState<LinguisticPattern[]>([])
  const [activeTab, setActiveTab] = useState('overview')
  // const [loading] = useState(true)
  // const [showCreateDialog] = useState(false)
  const [assessmentMode, setAssessmentMode] = useState<'simplified' | 'advanced'>('simplified')
  const [linguisticPatterns, setLinguisticPatterns] = useState<LinguisticPattern[]>([])
  const [loading, setLoading] = useState(true)
  const [dataStats, setDataStats] = useState({ archetypes: 0, patterns: 0 })

  // Load data from database
  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch('/api/check-data')
        const data = await response.json()
        
        setLinguisticPatterns(data.patterns?.data || [])
        setDataStats({
          archetypes: data.archetypes?.count || 0,
          patterns: data.patterns?.count || 0
        })
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadData()
  }, [])

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
              value="linguistics"
              className="data-[state=active]:bg-blue-500 data-[state=active]:text-white text-gray-600 px-6 py-3 rounded-md font-medium"
            >
              <MessageSquare className="mr-2 h-4 w-4" />
              Linguistics
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

            {/* Data Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Database Overview</CardTitle>
                <CardDescription>Current data in your Supabase database</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Archetypes</p>
                      <p className="text-2xl font-bold text-blue-600">{dataStats.archetypes}</p>
                    </div>
                    <Users className="h-8 w-8 text-blue-500" />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Linguistic Patterns</p>
                      <p className="text-2xl font-bold text-green-600">{dataStats.patterns}</p>
                    </div>
                    <MessageSquare className="h-8 w-8 text-green-500" />
                  </div>
                </div>
                {dataStats.archetypes < 20 && (
                  <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      <strong>Notice:</strong> You have {dataStats.archetypes} archetypes in your database. 
                      You mentioned expecting 55 archetypes. Would you like me to populate the missing ones?
                    </p>
                  </div>
                )}
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

          {/* Linguistics Tab */}
          <TabsContent value="linguistics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Archetype Linguistics
                </CardTitle>
                <CardDescription>
                  Manage linguistic patterns, keywords, and behavioral indicators for each archetype
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-600">Total Patterns</p>
                              <p className="text-2xl font-bold">{linguisticPatterns.length}</p>
                            </div>
                            <MessageSquare className="h-6 w-6 text-blue-500" />
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-600">Covered Archetypes</p>
                              <p className="text-2xl font-bold">
                                {new Set(linguisticPatterns.map(p => p.archetype_name)).size}
                              </p>
                            </div>
                            <Users className="h-6 w-6 text-green-500" />
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-600">Categories</p>
                              <p className="text-2xl font-bold">
                                {new Set(linguisticPatterns.map(p => p.category)).size}
                              </p>
                            </div>
                            <Target className="h-6 w-6 text-purple-500" />
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Patterns List */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Linguistic Patterns by Archetype</h3>
                      {linguisticPatterns.length === 0 ? (
                        <Card>
                          <CardContent className="p-8 text-center">
                            <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <h4 className="text-lg font-medium text-gray-900 mb-2">No Linguistic Patterns Found</h4>
                            <p className="text-gray-600 mb-4">
                              Your database doesn&apos;t contain any linguistic patterns yet. 
                              These patterns help the AI identify archetypal traits in user responses.
                            </p>
                            <Button className="bg-blue-600 hover:bg-blue-700">
                              Add First Pattern
                            </Button>
                          </CardContent>
                        </Card>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {linguisticPatterns.map((pattern) => (
                            <Card key={pattern.id}>
                              <CardHeader>
                                <CardTitle className="text-lg">{pattern.archetype_name}</CardTitle>
                                <CardDescription>
                                  <Badge variant="outline">{pattern.category}</Badge>
                                </CardDescription>
                              </CardHeader>
                              <CardContent>
                                <div className="space-y-3">
                                  {pattern.keywords && pattern.keywords.length > 0 && (
                                    <div>
                                      <p className="text-sm font-medium text-gray-700">Keywords:</p>
                                      <div className="flex flex-wrap gap-1 mt-1">
                                        {pattern.keywords.slice(0, 5).map((keyword, idx) => (
                                          <Badge key={idx} variant="secondary" className="text-xs">
                                            {keyword}
                                          </Badge>
                                        ))}
                                        {pattern.keywords.length > 5 && (
                                          <Badge variant="outline" className="text-xs">
                                            +{pattern.keywords.length - 5} more
                                          </Badge>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                  
                                  {pattern.emotional_indicators && pattern.emotional_indicators.length > 0 && (
                                    <div>
                                      <p className="text-sm font-medium text-gray-700">Emotional Indicators:</p>
                                      <p className="text-sm text-gray-600">
                                        {pattern.emotional_indicators.slice(0, 2).join(', ')}
                                        {pattern.emotional_indicators.length > 2 && '...'}
                                      </p>
                                    </div>
                                  )}
                                  
                                  {pattern.behavioral_patterns && pattern.behavioral_patterns.length > 0 && (
                                    <div>
                                      <p className="text-sm font-medium text-gray-700">Behavioral Patterns:</p>
                                      <p className="text-sm text-gray-600">
                                        {pattern.behavioral_patterns.slice(0, 1).join(', ')}
                                        {pattern.behavioral_patterns.length > 1 && '...'}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
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