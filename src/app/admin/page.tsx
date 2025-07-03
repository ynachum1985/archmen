"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent } from "@/components/ui/card"
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
  Sparkles,
  Edit,
  BarChart3
} from 'lucide-react'
import Link from 'next/link'
import { archetypeService } from '@/lib/services/archetype.service'

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
  traits: any
  psychology_profile: any
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

export default function AdminPage() {
  const [assessments, setAssessments] = useState<AssessmentOverview[]>([])
  const [archetypes, setArchetypes] = useState<Archetype[]>([])
  const [linguisticPatterns, setLinguisticPatterns] = useState<LinguisticPattern[]>([])
  const [activeTab, setActiveTab] = useState('assessments')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      
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

      // Load real archetype data from Supabase
      const archetypeData = await archetypeService.getAllArchetypes()
      setArchetypes(archetypeData)

      // Load linguistic patterns
      const patternsData = await archetypeService.getAllLinguisticPatterns()
      setLinguisticPatterns(patternsData)

    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
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
              <MessageCircle className="mr-2 h-4 w-4" />
              Linguistics
            </TabsTrigger>
            <TabsTrigger 
              value="ai-assistant"
              className="data-[state=active]:bg-blue-500 data-[state=active]:text-white text-gray-600 px-6 py-3 rounded-md font-medium"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              AI Assistant
            </TabsTrigger>
          </TabsList>

          {/* Assessments Tab */}
          <TabsContent value="assessments" className="space-y-8">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="bg-white border border-gray-200 shadow-sm">
                <CardContent className="p-6">
                  <div className="text-3xl font-light text-gray-900 mb-1">{assessments.length}</div>
                  <p className="text-sm text-gray-500">Total Assessments</p>
                </CardContent>
              </Card>
              
              <Card className="bg-white border border-gray-200 shadow-sm">
                <CardContent className="p-6">
                  <div className="text-3xl font-light text-gray-900 mb-1">0</div>
                  <p className="text-sm text-gray-500">Active Sessions</p>
                </CardContent>
              </Card>
              
              <Card className="bg-white border border-gray-200 shadow-sm">
                <CardContent className="p-6">
                  <div className="text-3xl font-light text-gray-900 mb-1">--</div>
                  <p className="text-sm text-gray-500">Completion Rate</p>
                </CardContent>
              </Card>

              <Card className="bg-white border border-gray-200 shadow-sm">
                <CardContent className="p-6 flex items-center justify-center">
                  <Button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium">
                    <Plus className="mr-2 h-4 w-4" />
                    New Assessment
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Assessments List */}
            <div className="space-y-6">
              <h2 className="text-2xl font-light text-gray-900">Assessments</h2>
              
              {assessments.map((assessment) => (
                <Card key={assessment.id} className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-8">
                    <div className="flex justify-between items-start mb-6">
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <h3 className="text-xl font-medium text-gray-900">{assessment.name}</h3>
                          <Badge 
                            className={
                              assessment.status === 'active' 
                                ? 'bg-green-100 text-green-800 border-green-200' 
                                : 'bg-yellow-100 text-yellow-800 border-yellow-200'
                            }
                          >
                            {assessment.status}
                          </Badge>
                        </div>
                        <p className="text-gray-600 max-w-2xl">{assessment.description}</p>
                      </div>
                    </div>

                    {/* Target Archetypes */}
                    <div className="mb-6">
                      <h4 className="text-sm font-medium text-gray-700 mb-3">Target Archetypes</h4>
                      <div className="flex flex-wrap gap-2">
                        {assessment.targetArchetypes.map((archetype) => (
                          <Badge 
                            key={archetype}
                            variant="outline" 
                            className="bg-gray-50 text-gray-600 border-gray-200 px-3 py-1"
                          >
                            {archetype}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-8 mb-6 py-4 border-t border-gray-100">
                      <div>
                        <div className="text-2xl font-light text-gray-900">{assessment.sessions}</div>
                        <div className="text-sm text-gray-500">Sessions</div>
                      </div>
                      <div>
                        <div className="text-2xl font-light text-gray-900">{assessment.completion}%</div>
                        <div className="text-sm text-gray-500">Completion</div>
                      </div>
                      <div>
                        <div className="text-2xl font-light text-gray-900">
                          {assessment.lastUpdated.toLocaleDateString()}
                        </div>
                        <div className="text-sm text-gray-500">Last Updated</div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                      <Link href={`/admin/assessment/${assessment.id}`}>
                        <Button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium">
                          <Settings className="mr-2 h-4 w-4" />
                          Configure
                        </Button>
                      </Link>
                      <Link href={`/admin/assessment/${assessment.id}?tab=test`}>
                        <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg font-medium">
                          <TestTube className="mr-2 h-4 w-4" />
                          Test
                        </Button>
                      </Link>
                      <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg font-medium">
                        <BarChart3 className="mr-2 h-4 w-4" />
                        Analytics
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Archetype Content Tab */}
          <TabsContent value="archetypes" className="space-y-8">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-light text-gray-900 mb-2">Archetype Content</h2>
                <p className="text-gray-600">Manage archetype definitions and characteristics</p>
              </div>
              <Button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium">
                <Plus className="mr-2 h-4 w-4" />
                Add Archetype
              </Button>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="text-gray-500">Loading archetypes...</div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {archetypes.map((archetype) => (
                  <Card key={archetype.id} className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900 mb-1">{archetype.name}</h3>
                          <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200 text-xs">
                            {archetype.category}
                          </Badge>
                        </div>
                        <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-600">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-gray-600 text-sm mb-4">{archetype.description}</p>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="border-gray-300 text-gray-700 hover:bg-gray-50 text-xs">
                          Edit Details
                        </Button>
                        <Button variant="outline" size="sm" className="border-gray-300 text-gray-700 hover:bg-gray-50 text-xs">
                          View Patterns
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Archetype Linguistics Tab */}
          <TabsContent value="linguistics" className="space-y-8">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-light text-gray-900 mb-2">Linguistic Patterns</h2>
                <p className="text-gray-600">Define language patterns for archetype detection</p>
              </div>
              <Button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium">
                <Plus className="mr-2 h-4 w-4" />
                Add Pattern
              </Button>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="text-gray-500">Loading linguistic patterns...</div>
              </div>
            ) : (
              <div className="space-y-4">
                {linguisticPatterns.map((pattern) => (
                  <Card key={pattern.id} className="bg-white border border-gray-200 shadow-sm">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-lg font-medium text-gray-900">{pattern.archetype_name}</h3>
                        <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-600">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Keywords</h4>
                          <div className="flex flex-wrap gap-1">
                            {pattern.keywords?.slice(0, 5).map((keyword, i) => (
                              <Badge key={i} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                                {keyword}
                              </Badge>
                            ))}
                            {(pattern.keywords?.length || 0) > 5 && (
                              <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200 text-xs">
                                +{(pattern.keywords?.length || 0) - 5} more
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Common Phrases</h4>
                          <div className="space-y-1">
                            {pattern.phrases?.slice(0, 2).map((phrase, i) => (
                              <p key={i} className="text-sm text-gray-600 italic">&ldquo;{phrase}&rdquo;</p>
                            ))}
                            {(pattern.phrases?.length || 0) > 2 && (
                              <p className="text-xs text-gray-500">+{(pattern.phrases?.length || 0) - 2} more phrases</p>
                            )}
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Emotional Indicators</h4>
                          <div className="flex flex-wrap gap-1">
                            {pattern.emotional_indicators?.slice(0, 3).map((emotion, i) => (
                              <Badge key={i} variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                                {emotion}
                              </Badge>
                            ))}
                            {(pattern.emotional_indicators?.length || 0) > 3 && (
                              <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200 text-xs">
                                +{(pattern.emotional_indicators?.length || 0) - 3} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {linguisticPatterns.length === 0 && (
                  <Card className="bg-white border border-gray-200 shadow-sm">
                    <CardContent className="p-12 text-center">
                      <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Linguistic Patterns</h3>
                      <p className="text-gray-600 mb-4">Add linguistic patterns to help the AI identify archetypes</p>
                      <Button className="bg-blue-500 hover:bg-blue-600 text-white">
                        <Plus className="mr-2 h-4 w-4" />
                        Add First Pattern
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </TabsContent>

          {/* AI Assistant Tab */}
          <TabsContent value="ai-assistant" className="space-y-8">
            <div>
              <h2 className="text-2xl font-light text-gray-900 mb-2">AI Assistant</h2>
              <p className="text-gray-600">Configure AI behavior and analysis parameters</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-white border border-gray-200 shadow-sm">
                <CardContent className="p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Quick Actions</h3>
                  <div className="space-y-3">
                    <Button variant="outline" className="w-full justify-start border-gray-300 text-gray-700 hover:bg-gray-50 p-4">
                      <Brain className="mr-3 h-5 w-5" />
                      <div className="text-left">
                        <div className="font-medium">Generate Questions</div>
                        <div className="text-sm text-gray-500">Create new assessment scenarios</div>
                      </div>
                    </Button>
                    <Button variant="outline" className="w-full justify-start border-gray-300 text-gray-700 hover:bg-gray-50 p-4">
                      <TestTube className="mr-3 h-5 w-5" />
                      <div className="text-left">
                        <div className="font-medium">Test Analysis</div>
                        <div className="text-sm text-gray-500">Validate archetype detection</div>
                      </div>
                    </Button>
                    <Button variant="outline" className="w-full justify-start border-gray-300 text-gray-700 hover:bg-gray-50 p-4">
                      <Users className="mr-3 h-5 w-5" />
                      <div className="text-left">
                        <div className="font-medium">Expand Archetypes</div>
                        <div className="text-sm text-gray-500">Add new definitions</div>
                      </div>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border border-gray-200 shadow-sm">
                <CardContent className="p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">System Status</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">AI Model</span>
                      <Badge className="bg-green-100 text-green-800 border-green-200">Active</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Analysis Engine</span>
                      <Badge className="bg-green-100 text-green-800 border-green-200">Online</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Pattern Database</span>
                      <Badge className="bg-green-100 text-green-800 border-green-200">
                        {linguisticPatterns.length} patterns
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Archetypes</span>
                      <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                        {archetypes.length} defined
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
} 