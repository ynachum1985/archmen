"use client"

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { AssessmentBuilder } from '@/components/admin/AssessmentBuilder'
import { EnhancedLinguisticAssessment } from '@/components/chat/EnhancedLinguisticAssessment'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Settings, TestTube, BarChart3, Users } from 'lucide-react'
import Link from 'next/link'

interface AssessmentConfig {
  name: string
  description: string
  purpose: string
  targetArchetypes: string[]
  analysisInstructions: string
  questioningStyle: string
  expectedDuration: number
  completionCriteria: string
}

interface ArchetypeScore {
  name: string
  score: number
  confidence: number
  evidence: string[]
  traits: string[]
}

export default function AssessmentDetailPage() {
  const params = useParams()
  const assessmentId = params.id as string
  
  const [activeTab, setActiveTab] = useState('builder')
  const [assessmentConfig, setAssessmentConfig] = useState<AssessmentConfig | null>(null)
  const [testResults, setTestResults] = useState<ArchetypeScore[] | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Load assessment data
  useEffect(() => {
    loadAssessment()
  }, [assessmentId])

  const loadAssessment = async () => {
    setIsLoading(true)
    try {
      // For now, load the existing "Relationship Patterns Assessment" data
      // In a real app, this would fetch from the database
      const mockConfig: AssessmentConfig = {
        name: "Relationship Patterns Assessment",
        description: "Discover your main archetype patterns in relationships and explore your shadow aspects.",
        purpose: "Discover the user's dominant relationship archetypes by analyzing their communication patterns, emotional expression, attachment styles, and interpersonal dynamics. Focus on how they navigate intimacy, conflict, and emotional connection.",
        targetArchetypes: [
          "The Lover",
          "The Caregiver", 
          "The Innocent",
          "The Sage",
          "The Hero",
          "The Rebel",
          "The Magician",
          "The Explorer"
        ],
        analysisInstructions: "Focus on emotional language, attachment patterns, communication about relationships, conflict resolution approaches, and expressions of intimacy. Look for patterns in how they describe love, trust, vulnerability, and connection. Analyze their metaphors for relationships and emotional processing style.",
        questioningStyle: "Ask open-ended questions that invite storytelling about relationships and emotional experiences. Start with recent relationship dynamics, then explore deeper patterns. Use follow-up questions that explore emotional responses, attachment behaviors, and relationship values. Maintain a warm, non-judgmental tone that encourages vulnerability.",
        expectedDuration: 15,
        completionCriteria: "Continue until you have high confidence in identifying the top 2-3 relationship archetypes, with at least 6-8 meaningful exchanges that reveal deep emotional and relational patterns. Look for consistent themes in their language about love, trust, intimacy, and emotional expression."
      }
      
      setAssessmentConfig(mockConfig)
    } catch (error) {
      console.error('Error loading assessment:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveAssessment = async (config: AssessmentConfig) => {
    try {
      // In a real app, this would save to the database
      console.log('Saving assessment config:', config)
      setAssessmentConfig(config)
      
      // Show success message (you might want to add a toast notification)
      alert('Assessment configuration saved successfully!')
    } catch (error) {
      console.error('Error saving assessment:', error)
      alert('Error saving assessment. Please try again.')
    }
  }

  const handleTestAssessment = (config: AssessmentConfig) => {
    setAssessmentConfig(config)
    setActiveTab('test')
  }

  const handleTestComplete = (results: ArchetypeScore[]) => {
    setTestResults(results)
    setActiveTab('results')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-slate-700 rounded w-1/3"></div>
            <div className="h-64 bg-slate-700 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/admin">
            <Button variant="outline" className="border-slate-600 text-white hover:bg-slate-700">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Admin
            </Button>
          </Link>
          
          <div>
            <h1 className="text-2xl font-bold text-white">
              {assessmentConfig?.name || 'Assessment Configuration'}
            </h1>
            <p className="text-gray-400">
              Configure AI-driven assessment parameters and test the experience
            </p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-slate-800 border-slate-700">
            <TabsTrigger 
              value="builder" 
              className="data-[state=active]:bg-teal-600 data-[state=active]:text-white"
            >
              <Settings className="mr-2 h-4 w-4" />
              Configure Assessment
            </TabsTrigger>
            <TabsTrigger 
              value="test"
              className="data-[state=active]:bg-teal-600 data-[state=active]:text-white"
              disabled={!assessmentConfig}
            >
              <TestTube className="mr-2 h-4 w-4" />
              Test Experience
            </TabsTrigger>
            <TabsTrigger 
              value="results"
              className="data-[state=active]:bg-teal-600 data-[state=active]:text-white"
              disabled={!testResults}
            >
              <BarChart3 className="mr-2 h-4 w-4" />
              Test Results
            </TabsTrigger>
          </TabsList>

          {/* Builder Tab */}
          <TabsContent value="builder">
            {assessmentConfig && (
              <AssessmentBuilder
                assessment={assessmentConfig}
                onSave={handleSaveAssessment}
                onTest={handleTestAssessment}
              />
            )}
          </TabsContent>

          {/* Test Tab */}
          <TabsContent value="test">
            {assessmentConfig && (
              <EnhancedLinguisticAssessment
                config={assessmentConfig}
                onComplete={handleTestComplete}
              />
            )}
          </TabsContent>

          {/* Results Tab */}
          <TabsContent value="results">
            {testResults && (
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-2xl text-white flex items-center gap-2">
                    <Users className="h-6 w-6 text-teal-400" />
                    Assessment Test Results
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Results from your test run of the assessment
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {testResults
                    .sort((a, b) => b.score - a.score)
                    .map((archetype, index) => (
                      <div key={index} className="space-y-4">
                        <div className="flex justify-between items-center">
                          <h3 className="text-xl font-semibold text-white">
                            #{index + 1} {archetype.name}
                          </h3>
                          <div className="flex gap-2">
                            <Badge className="bg-teal-600 text-white">
                              Score: {Math.round(archetype.score * 100)}%
                            </Badge>
                            <Badge variant="outline" className="border-slate-600 text-slate-400">
                              Confidence: {Math.round(archetype.confidence * 100)}%
                            </Badge>
                          </div>
                        </div>

                        {archetype.traits && archetype.traits.length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium text-white mb-2">Key Traits Identified:</h4>
                            <div className="flex flex-wrap gap-2">
                              {archetype.traits.map((trait, i) => (
                                <Badge 
                                  key={i} 
                                  variant="secondary" 
                                  className="bg-slate-700 text-gray-300"
                                >
                                  {trait}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {archetype.evidence && archetype.evidence.length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium text-white mb-2">Linguistic Evidence:</h4>
                            <ul className="space-y-1 text-sm text-gray-400">
                              {archetype.evidence.map((evidence, i) => (
                                <li key={i} className="flex items-start gap-2">
                                  <span className="text-teal-400 mt-1">•</span>
                                  {evidence}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {index < testResults.length - 1 && (
                          <hr className="border-slate-700" />
                        )}
                      </div>
                    ))}

                  <div className="flex gap-4 mt-6">
                    <Button 
                      onClick={() => setActiveTab('builder')}
                      variant="outline"
                      className="border-slate-600 text-white hover:bg-slate-700"
                    >
                      Modify Configuration
                    </Button>
                    <Button 
                      onClick={() => setActiveTab('test')}
                      className="bg-teal-600 hover:bg-teal-700 text-white"
                    >
                      Test Again
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
} 