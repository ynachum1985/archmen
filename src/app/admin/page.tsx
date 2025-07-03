"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Brain, 
  Plus, 
  Settings, 
  TestTube, 
  Users, 
  MessageCircle,
  Target,
  Sparkles
} from 'lucide-react'
import Link from 'next/link'

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

export default function AdminPage() {
  const [assessments, setAssessments] = useState<AssessmentOverview[]>([])
  const [activeTab, setActiveTab] = useState('assessments')

  useEffect(() => {
    // Load assessments - for now using mock data
    const mockAssessments: AssessmentOverview[] = [
      {
        id: '1',
        name: 'Relationship Patterns Assessment',
        description: 'AI-driven discovery of relationship archetypes through linguistic analysis',
        type: 'ai-driven',
        status: 'active',
        targetArchetypes: ['The Lover', 'The Caregiver', 'The Innocent', 'The Sage'],
        sessions: 0,
        completion: 0,
        lastUpdated: new Date()
      }
    ]
    setAssessments(mockAssessments)
  }, [])

  return (
    <div className="min-h-screen bg-slate-900 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Admin Console</h1>
            <p className="text-gray-400">Develop assessments, archetypes, and content</p>
          </div>
          <Button className="bg-teal-600 hover:bg-teal-700 text-white">
            <Plus className="mr-2 h-4 w-4" />
            Create Assessment
          </Button>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-slate-800 border-slate-700">
            <TabsTrigger 
              value="assessments" 
              className="data-[state=active]:bg-teal-600 data-[state=active]:text-white"
            >
              <Brain className="mr-2 h-4 w-4" />
              Assessments
            </TabsTrigger>
            <TabsTrigger 
              value="archetypes"
              className="data-[state=active]:bg-teal-600 data-[state=active]:text-white"
            >
              <Users className="mr-2 h-4 w-4" />
              Archetype Content
            </TabsTrigger>
            <TabsTrigger 
              value="linguistics"
              className="data-[state=active]:bg-teal-600 data-[state=active]:text-white"
            >
              <MessageCircle className="mr-2 h-4 w-4" />
              Archetype Linguistics
            </TabsTrigger>
            <TabsTrigger 
              value="ai-assistant"
              className="data-[state=active]:bg-teal-600 data-[state=active]:text-white"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              AI Assistant
            </TabsTrigger>
          </TabsList>

          {/* Assessments Tab */}
          <TabsContent value="assessments" className="space-y-6">
            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-400">Total Assessments</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{assessments.length}</div>
                  <p className="text-xs text-gray-400">AI-driven experiences</p>
                </CardContent>
              </Card>
              
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-400">Active Sessions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">0</div>
                  <p className="text-xs text-gray-400">Users taking assessments</p>
                </CardContent>
              </Card>
              
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-400">Completion Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">--</div>
                  <p className="text-xs text-gray-400">Average completion</p>
                </CardContent>
              </Card>
            </div>

            {/* Assessments List */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-white">AI-Driven Assessments</h2>
              
              {assessments.map((assessment) => (
                <Card key={assessment.id} className="bg-slate-800/50 border-slate-700 hover:border-teal-600/50 transition-colors">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <CardTitle className="text-xl text-white flex items-center gap-2">
                          <Brain className="h-5 w-5 text-teal-400" />
                          {assessment.name}
                        </CardTitle>
                        <CardDescription className="text-gray-400">
                          {assessment.description}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge 
                          className={
                            assessment.status === 'active' 
                              ? 'bg-green-600 text-white' 
                              : 'bg-yellow-600 text-white'
                          }
                        >
                          {assessment.status}
                        </Badge>
                        <Badge variant="outline" className="border-teal-600 text-teal-400">
                          AI-Driven
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {/* Target Archetypes */}
                    <div>
                      <h4 className="text-sm font-medium text-white mb-2">Target Archetypes</h4>
                      <div className="flex flex-wrap gap-2">
                        {assessment.targetArchetypes.slice(0, 4).map((archetype) => (
                          <Badge 
                            key={archetype}
                            variant="secondary" 
                            className="bg-slate-700 text-gray-300 text-xs"
                          >
                            {archetype}
                          </Badge>
                        ))}
                        {assessment.targetArchetypes.length > 4 && (
                          <Badge variant="secondary" className="bg-slate-700 text-gray-300 text-xs">
                            +{assessment.targetArchetypes.length - 4} more
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-lg font-semibold text-white">{assessment.sessions}</div>
                        <div className="text-xs text-gray-400">Sessions</div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-white">{assessment.completion}%</div>
                        <div className="text-xs text-gray-400">Completion</div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-white">
                          {assessment.lastUpdated.toLocaleDateString()}
                        </div>
                        <div className="text-xs text-gray-400">Last Updated</div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Link href={`/admin/assessment/${assessment.id}`} className="flex-1">
                        <Button className="w-full bg-teal-600 hover:bg-teal-700 text-white">
                          <Settings className="mr-2 h-4 w-4" />
                          Configure
                        </Button>
                      </Link>
                      <Link href={`/admin/assessment/${assessment.id}?tab=test`} className="flex-1">
                        <Button variant="outline" className="w-full border-slate-600 text-white hover:bg-slate-700">
                          <TestTube className="mr-2 h-4 w-4" />
                          Test AI
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Archetype Content Tab */}
          <TabsContent value="archetypes" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-xl text-white flex items-center gap-2">
                  <Users className="h-5 w-5 text-teal-400" />
                  Archetype Content Management
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Manage archetype descriptions, traits, and characteristics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <p className="text-gray-400 mb-4">Archetype content management coming soon</p>
                  <Button className="bg-teal-600 hover:bg-teal-700 text-white">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Archetype
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Archetype Linguistics Tab */}
          <TabsContent value="linguistics" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-xl text-white flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-teal-400" />
                  Archetype Linguistic Patterns
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Define language patterns and indicators for each archetype
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <p className="text-gray-400 mb-4">Linguistic pattern management coming soon</p>
                  <Button className="bg-teal-600 hover:bg-teal-700 text-white">
                    <Target className="mr-2 h-4 w-4" />
                    Define Patterns
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI Assistant Tab */}
          <TabsContent value="ai-assistant" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-xl text-white flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-teal-400" />
                  AI Assistant Configuration
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Configure AI behavior, prompts, and analysis parameters
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <p className="text-gray-400 mb-4">AI assistant configuration coming soon</p>
                  <Button className="bg-teal-600 hover:bg-teal-700 text-white">
                    <Brain className="mr-2 h-4 w-4" />
                    Configure AI
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
} 