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

            {/* Archetype List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Sample Archetypes */}
              {[
                { name: "The Lover", category: "Relationship", description: "Seeks connection and intimacy" },
                { name: "The Caregiver", category: "Relationship", description: "Nurtures and supports others" },
                { name: "The Sage", category: "Wisdom", description: "Seeks truth and understanding" },
                { name: "The Hero", category: "Action", description: "Overcomes challenges courageously" },
                { name: "The Innocent", category: "Purity", description: "Maintains optimism and faith" },
                { name: "The Explorer", category: "Freedom", description: "Seeks adventure and discovery" }
              ].map((archetype, index) => (
                <Card key={index} className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
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

            {/* Linguistic Patterns */}
            <div className="space-y-4">
              {[
                { 
                  archetype: "The Lover", 
                  keywords: ["connection", "intimacy", "heart", "passion"],
                  phrases: ["I feel deeply", "we're meant to be", "my heart tells me"],
                  emotions: ["romantic", "passionate", "vulnerable"]
                },
                { 
                  archetype: "The Caregiver", 
                  keywords: ["help", "support", "care", "nurture"],
                  phrases: ["let me help", "I'm here for you", "take care of yourself"],
                  emotions: ["compassionate", "protective", "selfless"]
                },
                { 
                  archetype: "The Hero", 
                  keywords: ["challenge", "overcome", "victory", "strength"],
                  phrases: ["I can do this", "never give up", "fight for what's right"],
                  emotions: ["determined", "courageous", "resilient"]
                }
              ].map((pattern, index) => (
                <Card key={index} className="bg-white border border-gray-200 shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-medium text-gray-900">{pattern.archetype}</h3>
                      <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-600">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Keywords</h4>
                        <div className="flex flex-wrap gap-1">
                          {pattern.keywords.map((keyword, i) => (
                            <Badge key={i} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                              {keyword}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Common Phrases</h4>
                        <div className="space-y-1">
                          {pattern.phrases.slice(0, 2).map((phrase, i) => (
                            <p key={i} className="text-sm text-gray-600 italic">&ldquo;{phrase}&rdquo;</p>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Emotional Tone</h4>
                        <div className="flex flex-wrap gap-1">
                          {pattern.emotions.map((emotion, i) => (
                            <Badge key={i} variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                              {emotion}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
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
                      <Badge className="bg-green-100 text-green-800 border-green-200">Updated</Badge>
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