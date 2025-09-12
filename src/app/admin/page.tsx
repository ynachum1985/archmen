"use client"

// Force dynamic rendering to avoid build-time Supabase client creation
export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Settings,
  Users,
  BarChart3,
  Plus,
  Search,
  FileText,
  Brain,
  Database,
  Sparkles
} from 'lucide-react'

import { Input } from "@/components/ui/input"

import ArchetypeEditor from "@/components/ArchetypeEditor"
import { EnhancedAssessmentBuilder } from "@/components/admin/EnhancedAssessmentBuilder"

import { assessmentIntegrationService } from "@/lib/services/assessment-integration.service"
import { AIPersonalityManager } from "@/components/admin/AIPersonalityManager"
import { EmbeddingConfigManager } from "@/components/admin/EmbeddingConfigManager"

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
  description: string
  impact_score: number
  growth_potential_score?: number | null
  awareness_difficulty_score?: number | null
  trigger_intensity_score?: number | null
  integration_complexity_score?: number | null
  shadow_depth_score?: number | null
  archetype_images?: string[] | null
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



interface LinguisticPattern {
  id: string
  archetype_name: string
  patterns: string | null // Simplified to single text field
  created_at: string
  updated_at: string
}

interface Archetype {
  id: string
  name: string
  description: string
  impact_score: number
  growth_potential_score?: number | null
  awareness_difficulty_score?: number | null
  trigger_intensity_score?: number | null
  integration_complexity_score?: number | null
  shadow_depth_score?: number | null
  archetype_images?: string[] | null
  traits: unknown
  psychology_profile: unknown
  is_active: boolean | null
  created_at: string
  updated_at: string
  linguisticPattern?: LinguisticPattern
}

export default function AdminPage() {
  const [archetypes, setArchetypes] = useState<Archetype[]>([])
  const [loading, setLoading] = useState(true)

  // Filter states
  const [archetypeSearch, setArchetypeSearch] = useState('')
  // Removed isGeneratingEmbeddings state - now handled individually per archetype

  // Editor states
  const [expandedArchetype, setExpandedArchetype] = useState<string | null>(null)
  const [editingArchetype, setEditingArchetype] = useState<Archetype | null>(null)

  // Load data from database
  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch('/api/check-data')
        const data = await response.json()

        if (data.archetypes?.data) {
          // Merge linguistic patterns with archetypes
          const archetypesWithPatterns = data.archetypes.data.map((archetype: Archetype) => {
            const pattern = data.patterns?.data?.find((p: LinguisticPattern) => p.archetype_name === archetype.name)
            return {
              ...archetype,
              linguisticPattern: pattern
            }
          })
          setArchetypes(archetypesWithPatterns)
        }
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])





  // Filter functions
  const filteredArchetypes = archetypes.filter(archetype => {
    const matchesSearch = archetype.name.toLowerCase().includes(archetypeSearch.toLowerCase()) ||
                         archetype.description.toLowerCase().includes(archetypeSearch.toLowerCase())
    return matchesSearch
  })

  // Assessment categories for specialized assessments
  const assessmentCategories = [
    {
      id: 'sexuality-intimacy',
      name: 'Sexuality & Intimacy',
      description: 'Explore sexual archetypes and intimacy patterns in relationships',
      status: 'Draft',
      archetypeCount: 12,
      questionCount: 15,
      completionRate: 0
    },
    {
      id: 'monogamy-polyamory',
      name: 'Monogamy vs. Polyamory',
      description: 'Assess relationship structure preferences and patterns',
      status: 'Active',
      archetypeCount: 8,
      questionCount: 12,
      completionRate: 78
    },
    {
      id: 'relationship-patterns',
      name: 'Relationship Patterns',
      description: 'Identify recurring relationship dynamics and complexes',
      status: 'Draft',
      archetypeCount: 15,
      questionCount: 18,
      completionRate: 0
    },
    {
      id: 'patriarchy-influence',
      name: 'Patriarchy\'s Influence',
      description: 'Examine how patriarchal conditioning affects relational dynamics',
      status: 'Draft',
      archetypeCount: 10,
      questionCount: 14,
      completionRate: 0
    },
    {
      id: 'consent-boundaries',
      name: 'Consent & Boundaries',
      description: 'Assess understanding and practice of consent and emotional safety',
      status: 'Draft',
      archetypeCount: 9,
      questionCount: 16,
      completionRate: 0
    },
    {
      id: 'modern-dating',
      name: 'Modern Dating',
      description: 'Navigate contemporary dating challenges and patterns',
      status: 'Active',
      archetypeCount: 11,
      questionCount: 13,
      completionRate: 45
    }
  ]

  const handleToggleArchetype = (archetypeId: string) => {
    if (expandedArchetype === archetypeId) {
      setExpandedArchetype(null)
      setEditingArchetype(null)
    } else {
      setExpandedArchetype(archetypeId)
      const archetype = archetypes.find(a => a.id === archetypeId)
      setEditingArchetype(archetype || null)
    }
  }

  const handleSaveArchetype = async (updatedArchetype: Archetype) => {
    try {
      // Here you would typically save to the database
      // For now, just update the local state
      setArchetypes(prev => prev.map(a =>
        a.id === updatedArchetype.id ? updatedArchetype : a
      ))
      console.log('Archetype saved:', updatedArchetype)
    } catch (error) {
      console.error('Error saving archetype:', error)
    }
  }

  const handleSaveEnhancedAssessment = async (assessmentData: unknown) => {
    try {
      console.log('Enhanced Assessment saved:', assessmentData)

      // Save to database using the integration service
      const assessmentId = await assessmentIntegrationService.createMainAssessment(assessmentData as Record<string, unknown>)
      console.log('Assessment saved with ID:', assessmentId)

      alert('Assessment saved successfully! This will now be available on the homepage.')
    } catch (error) {
      console.error('Error saving enhanced assessment:', error)
      alert('Error saving assessment. Please try again.')
    }
  }

  const handleTestEnhancedAssessment = async (assessmentData: unknown) => {
    try {
      console.log('Testing Enhanced Assessment:', assessmentData)
      // Here you would navigate to test page or open test modal
      alert('Test functionality will be implemented soon!')
    } catch (error) {
      console.error('Error testing enhanced assessment:', error)
    }
  }

  // Removed bulk generateEmbeddings function - now handled individually per archetype

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-light text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage assessments, archetypes, and linguistic patterns</p>
        </div>

        <Tabs defaultValue="assessments" className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-gray-50 p-1">
            <TabsTrigger value="assessments" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Assessments
            </TabsTrigger>
            <TabsTrigger value="builder" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Builder
            </TabsTrigger>
            <TabsTrigger value="archetypes" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Archetypes
            </TabsTrigger>
            <TabsTrigger value="ai-personality" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              AI Personality
            </TabsTrigger>
            <TabsTrigger value="embeddings" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Embeddings
            </TabsTrigger>

            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          {/* Assessments Tab - Overview of existing assessments */}
          <TabsContent value="assessments" className="mt-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-medium">Assessment Overview</h2>
                  <p className="text-gray-600 text-sm">Manage and monitor your specialized archetype assessments</p>
                </div>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  New Assessment
                </Button>
              </div>

              {/* Main Assessment Section */}
              <Card className="border-2 border-teal-200 bg-teal-50">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg text-teal-800">Homepage Main Assessment</CardTitle>
                      <CardDescription className="text-teal-600">
                        The primary assessment that appears on the homepage for new users
                      </CardDescription>
                    </div>
                    <Badge variant="secondary" className="bg-teal-100 text-teal-800">Main</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <p className="text-sm text-teal-700">
                      Create or update the main assessment that users will see when they visit the homepage.
                      This assessment should be designed to give users a taste of the full archetype analysis experience.
                    </p>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="bg-teal-600 hover:bg-teal-700"
                        onClick={() => {
                          // Switch to builder tab with main assessment preset
                          const builderTab = document.querySelector('[value="builder"]') as HTMLElement
                          builderTab?.click()
                        }}
                      >
                        Create Main Assessment
                      </Button>
                      <Button size="sm" variant="outline" className="border-teal-600 text-teal-600">
                        View Current
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Assessment Categories */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {assessmentCategories.map((category) => (
                  <Card key={category.id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{category.name}</CardTitle>
                        <Badge variant="secondary">{category.status}</Badge>
                      </div>
                      <CardDescription className="text-sm">{category.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm text-gray-600">
                        <div>Target Archetypes: {category.archetypeCount}</div>
                        <div>Questions: {category.questionCount}</div>
                        <div>Completion Rate: {category.completionRate}%</div>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Button size="sm" variant="outline" className="flex-1">
                          Edit
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1">
                          Test
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Builder Tab - Assessment creation form */}
          <TabsContent value="builder" className="mt-6">
            <EnhancedAssessmentBuilder
              onSave={handleSaveEnhancedAssessment}
              onTest={handleTestEnhancedAssessment}
            />
          </TabsContent>

          {/* Archetypes Tab */}
          <TabsContent value="archetypes" className="mt-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-medium">Archetypes</h2>
                  <p className="text-gray-600 text-sm">{archetypes.length} total archetypes</p>
                </div>
                <div className="flex gap-2">
                  {/* Bulk Generate Embeddings button removed - now handled individually per archetype */}
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Archetype
                  </Button>
                </div>
              </div>

              {/* Simple Linguistic Patterns Examples */}
              <details className="mb-6">
                <summary className="cursor-pointer text-sm text-blue-600 hover:text-blue-800 mb-2">
                  📋 Linguistic Pattern Examples
                </summary>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
                  <div><strong>Keywords:</strong> leadership, control, authority, responsibility, decision, love, connection, intimacy, passion, wisdom, knowledge, strength, courage</div>
                  <div><strong>Phrases:</strong> &quot;I need to take charge&quot;, &quot;Let me handle this&quot;, &quot;I feel like&quot;, &quot;My heart tells me&quot;, &quot;I think&quot;, &quot;I understand&quot;, &quot;I can handle it&quot;</div>
                  <div><strong>Emotional:</strong> frustrated when not in control, confident, protective, passionate, loving, vulnerable, curious, thoughtful, determined, fierce</div>
                  <div><strong>Behavioral:</strong> takes initiative, makes decisions quickly, seeks deep connection, prioritizes relationships, asks questions, faces challenges head-on</div>
                  <div><strong>Sentence patterns:</strong> Short commands vs. long explanations, question-heavy vs. statement-heavy</div>
                  <div><strong>Pronouns:</strong> High &quot;I&quot; usage (self-focused), frequent &quot;you&quot; (other-focused), regular &quot;we&quot; (collective-focused)</div>
                  <div><strong>Temporal:</strong> Past-focused (&quot;I used to&quot;), present-focused (&quot;right now&quot;), future-focused (&quot;I will&quot;)</div>
                  <div><strong>Certainty:</strong> &quot;Always/never&quot; vs. &quot;maybe/sometimes&quot;, &quot;definitely&quot; vs. &quot;perhaps&quot;</div>
                  <div><strong>Responsibility:</strong> &quot;I should&quot; vs. &quot;they should&quot; vs. &quot;it happened&quot;</div>
                  <div><strong>Intensity:</strong> Mild (&quot;a bit upset&quot;) vs. extreme (&quot;devastated&quot;)</div>
                  <div><strong>Metaphors:</strong> War/battle, journey/path, nature/growth, building/construction</div>
                </div>
              </details>

              {/* Filters */}
              <div className="flex gap-4 items-center p-4 bg-gray-50 rounded-lg">
                <div className="flex-1 max-w-md">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search archetypes..."
                      value={archetypeSearch}
                      onChange={(e) => setArchetypeSearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                {/* Category filter removed - archetypes will be categorized by assessment type */}
              </div>

              {/* Archetypes List */}
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredArchetypes.map((archetype) => (
                    <div key={archetype.id} className="border border-gray-200 rounded-lg overflow-hidden">
                      {/* Archetype Header - Clickable */}
                      <div
                        className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
                        onClick={() => handleToggleArchetype(archetype.id)}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <h3 className="font-medium text-gray-900">{archetype.name}</h3>
                            <span className="text-sm text-gray-500">Impact: {archetype.impact_score}/7</span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{archetype.description}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              // TODO: Add individual archetype embedding generation
                              console.log(`Generate embeddings for ${archetype.name}`)
                            }}
                            className="text-gray-400 hover:text-blue-600"
                            title={`Generate embeddings for ${archetype.name}`}
                          >
                            <Sparkles className="w-4 h-4" />
                          </Button>
                          <div className="text-gray-400 text-xl font-light">
                            {expandedArchetype === archetype.id ? '−' : '+'}
                          </div>
                        </div>
                      </div>

                      {/* Expanded Content - Inline Editor */}
                      {expandedArchetype === archetype.id && editingArchetype && (
                        <ArchetypeEditor
                          archetype={editingArchetype}
                          onSave={handleSaveArchetype}
                          onCancel={() => {
                            setExpandedArchetype(null)
                            setEditingArchetype(null)
                          }}
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* AI Personality Tab */}
          <TabsContent value="ai-personality" className="mt-6">
            <AIPersonalityManager />
          </TabsContent>

          {/* Embeddings Tab */}
          <TabsContent value="embeddings" className="mt-6">
            <EmbeddingConfigManager />
          </TabsContent>



          {/* Analytics Tab */}
          <TabsContent value="analytics" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Analytics Dashboard</CardTitle>
                <CardDescription>Track assessment performance and user engagement</CardDescription>
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


      </div>
    </div>
  )
} 