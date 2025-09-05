"use client"

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
  Search
} from 'lucide-react'
import { AssessmentBuilder } from '@/components/admin/AssessmentBuilder'
import { SimplifiedAssessmentBuilder } from '@/components/admin/SimplifiedAssessmentBuilder'
// import { CreateAssessmentDialog } from '@/components/admin/CreateAssessmentDialog'
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import ArchetypeEditor from "@/components/ArchetypeEditor"

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
  linguisticPattern?: LinguisticPattern
}

export default function AdminPage() {
  // const [assessments] = useState<AssessmentOverview[]>([])
  // const [archetypes] = useState<Archetype[]>([])
  // const [linguisticPatterns] = useState<LinguisticPattern[]>([])
  const [isSimplifiedMode, setIsSimplifiedMode] = useState(true)
  const [archetypes, setArchetypes] = useState<Archetype[]>([])
  const [loading, setLoading] = useState(true)

  // Filter states
  const [archetypeSearch, setArchetypeSearch] = useState('')
  const [archetypeCategory, setArchetypeCategory] = useState('all')

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



  // Filter functions
  const filteredArchetypes = archetypes.filter(archetype => {
    const matchesSearch = archetype.name.toLowerCase().includes(archetypeSearch.toLowerCase()) ||
                         archetype.description.toLowerCase().includes(archetypeSearch.toLowerCase())
    const matchesCategory = archetypeCategory === 'all' || archetype.category === archetypeCategory
    return matchesSearch && matchesCategory
  })

  // Get unique categories
  const archetypeCategories = [...new Set(archetypes.map(a => a.category))].filter(Boolean)

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

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-light text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage assessments, archetypes, and linguistic patterns</p>
        </div>

        <Tabs defaultValue="assessment" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-gray-50 p-1">
            <TabsTrigger value="assessment" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Assessment
            </TabsTrigger>
            <TabsTrigger value="archetypes" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Archetypes
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          {/* Assessment Tab */}
          <TabsContent value="assessment" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Assessment Configuration</CardTitle>
                <CardDescription>Configure AI-powered archetype assessments</CardDescription>
                <div className="flex items-center gap-4 mt-4">
                                      <Button
                      variant={isSimplifiedMode ? "default" : "outline"}
                      onClick={() => setIsSimplifiedMode(true)}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Simple Mode
                    </Button>
                    <Button
                      variant={!isSimplifiedMode ? "default" : "outline"}
                      onClick={() => setIsSimplifiedMode(false)}
                    >
                      Advanced Mode
                    </Button>
                </div>
              </CardHeader>
              <CardContent>
                {isSimplifiedMode ? (
                  <SimplifiedAssessmentBuilder 
                    onSave={handleSaveSimplifiedAssessment}
                    onTest={handleTestAssessment}
                  />
                ) : (
                  <AssessmentBuilder 
                    onSave={handleSaveAssessment}
                    onTest={handleTestAssessment}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Archetypes Tab */}
          <TabsContent value="archetypes" className="mt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-medium">Archetypes</h2>
                  <p className="text-gray-600 text-sm">{archetypes.length} total archetypes</p>
                </div>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Archetype
                </Button>
              </div>

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
                <div className="min-w-[150px]">
                  <Select value={archetypeCategory} onValueChange={setArchetypeCategory}>
                    <SelectTrigger className="bg-white border-gray-300">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-gray-300 shadow-lg z-50">
                      <SelectItem value="all">All Categories</SelectItem>
                      {archetypeCategories.map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
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
                            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                              {archetype.category}
                            </Badge>
                            <span className="text-sm text-gray-500">Impact: {archetype.impact_score}/7</span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{archetype.description}</p>
                        </div>
                        <div className="text-gray-400 text-xl font-light">
                          {expandedArchetype === archetype.id ? '−' : '+'}
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