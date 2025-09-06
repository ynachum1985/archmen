"use client"

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { EnhancedAssessmentBuilder } from '@/components/admin/EnhancedAssessmentBuilder'
import { EnhancedLinguisticAssessment } from '@/components/chat/EnhancedLinguisticAssessment'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Settings, TestTube, BarChart3, Users } from 'lucide-react'
import Link from 'next/link'

interface EnhancedAssessmentConfig {
  name: string
  description: string
  category: string
  purpose: string
  expectedDuration: number

  // AI Configuration
  systemPrompt: string
  questioningStrategy: 'adaptive' | 'progressive' | 'exploratory' | 'focused'
  questioningDepth: 'surface' | 'moderate' | 'deep' | 'profound'

  // Questioning Examples
  questionExamples: {
    openEnded: string[]
    followUp: string[]
    clarifying: string[]
    deepening: string[]
  }

  // Response Requirements
  responseRequirements: {
    minSentences: number
    maxSentences: number
    followUpPrompts: string[]
  }

  // Adaptive Logic
  adaptiveLogic: {
    minQuestions: number
    maxQuestions: number
    evidenceThreshold: number
    adaptationTriggers: string[]
  }

  // Files and References
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  referenceFiles: any[]

  // Report Generation (AI chooses archetypes freely)
  reportGeneration: string
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
  const [assessmentConfig, setAssessmentConfig] = useState<EnhancedAssessmentConfig | null>(null)
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
      const mockConfig: EnhancedAssessmentConfig = {
        name: "Relationship Patterns Assessment",
        description: "Discover your main archetype patterns in relationships and explore your shadow aspects.",
        category: "Relationships",
        purpose: "Discover the user's dominant relationship archetypes by analyzing their communication patterns, emotional expression, attachment styles, and interpersonal dynamics. Focus on how they navigate intimacy, conflict, and emotional connection.",
        expectedDuration: 15,
        systemPrompt: "You are an expert psychological assessor specializing in relationship archetype identification through linguistic analysis. Your role is to conduct natural, engaging conversations that reveal deep emotional and relational patterns through language use, metaphors, and communication styles.",
        questioningStrategy: "adaptive",
        questioningDepth: "moderate",
        questionExamples: {
          openEnded: [
            "Tell me about a recent relationship experience that felt significant to you. What made it meaningful?",
            "How do you typically express love or care for someone important to you?",
            "Describe a time when you had to navigate conflict in a relationship. What was your approach?"
          ],
          followUp: [
            "What emotions came up for you in that moment?",
            "How did that experience shape how you view relationships?",
            "What do you think drove that particular response?"
          ],
          clarifying: [
            "When you say 'connection,' what does that look like for you?",
            "How would you define intimacy in your own words?",
            "What does trust mean to you in a relationship context?"
          ],
          deepening: [
            "What patterns do you notice in how you approach relationships?",
            "What fears or hopes influence how you connect with others?",
            "How do you think your past experiences shape your current relationship style?"
          ]
        },
        responseRequirements: {
          minSentences: 2,
          maxSentences: 8,
          followUpPrompts: [
            "I'd love to hear more about that feeling. Can you expand on what you experienced?",
            "That sounds important. Can you give me a specific example?",
            "Help me understand that better - what did that look like in your relationship?"
          ]
        },
        adaptiveLogic: {
          minQuestions: 8,
          maxQuestions: 15,
          evidenceThreshold: 3,
          adaptationTriggers: [
            "Strong relationship archetype pattern emerges",
            "User shows emotional vulnerability or resistance",
            "Attachment patterns become clear",
            "Communication style patterns are evident"
          ]
        },
        referenceFiles: [],
        reportGeneration: "Provide a comprehensive analysis of relationship patterns with specific linguistic evidence and archetype confidence scores. The AI should freely choose from all available archetypes based on the evidence gathered."
      }
      
      setAssessmentConfig(mockConfig)
    } catch (error) {
      console.error('Error loading assessment:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveAssessment = async (config: EnhancedAssessmentConfig) => {
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

  const handleTestAssessment = (config: EnhancedAssessmentConfig) => {
    setAssessmentConfig(config)
    setActiveTab('test')
  }

  const handleTestComplete = (results: ArchetypeScore[]) => {
    setTestResults(results)
    setActiveTab('results')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-8">
        {/* Header */}
        <div className="flex items-center gap-6 mb-8">
          <Link href="/admin">
            <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Admin
            </Button>
          </Link>
          
          <div>
            <h1 className="text-3xl font-light text-gray-900 mb-2">
              {assessmentConfig?.name || 'Assessment Configuration'}
            </h1>
            <p className="text-gray-600">
              Configure AI-driven assessment parameters and test the experience
            </p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="bg-white border border-gray-200 p-1 rounded-lg shadow-sm">
            <TabsTrigger 
              value="builder" 
              className="data-[state=active]:bg-blue-500 data-[state=active]:text-white text-gray-600 px-6 py-3 rounded-md font-medium"
            >
              <Settings className="mr-2 h-4 w-4" />
              Configure Assessment
            </TabsTrigger>
            <TabsTrigger 
              value="test"
              className="data-[state=active]:bg-blue-500 data-[state=active]:text-white text-gray-600 px-6 py-3 rounded-md font-medium"
              disabled={!assessmentConfig}
            >
              <TestTube className="mr-2 h-4 w-4" />
              Test Experience
            </TabsTrigger>
            <TabsTrigger 
              value="results"
              className="data-[state=active]:bg-blue-500 data-[state=active]:text-white text-gray-600 px-6 py-3 rounded-md font-medium"
              disabled={!testResults}
            >
              <BarChart3 className="mr-2 h-4 w-4" />
              Test Results
            </TabsTrigger>
          </TabsList>

          {/* Builder Tab */}
          <TabsContent value="builder">
            {assessmentConfig && (
              <EnhancedAssessmentBuilder
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
                config={{
                  name: assessmentConfig.name,
                  description: assessmentConfig.description,
                  purpose: assessmentConfig.purpose,
                  targetArchetypes: [], // AI chooses freely from all archetypes
                  analysisInstructions: assessmentConfig.systemPrompt,
                  questioningStyle: assessmentConfig.questioningStrategy,
                  expectedDuration: assessmentConfig.expectedDuration,
                  completionCriteria: `Use ${assessmentConfig.questioningStrategy} questioning with ${assessmentConfig.questioningDepth} depth. Ask ${assessmentConfig.adaptiveLogic.minQuestions}-${assessmentConfig.adaptiveLogic.maxQuestions} questions.`
                }}
                onComplete={handleTestComplete}
              />
            )}
          </TabsContent>

          {/* Results Tab */}
          <TabsContent value="results">
            {testResults && (
              <Card className="bg-white border border-gray-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-2xl font-light text-gray-900 flex items-center gap-3">
                    <Users className="h-6 w-6 text-blue-500" />
                    Assessment Test Results
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    Results from your test run of the assessment
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                  {testResults
                    .sort((a, b) => b.score - a.score)
                    .map((archetype, index) => (
                      <div key={index} className="space-y-4">
                        <div className="flex justify-between items-center">
                          <h3 className="text-xl font-medium text-gray-900">
                            #{index + 1} {archetype.name}
                          </h3>
                          <div className="flex gap-3">
                            <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                              Score: {Math.round(archetype.score * 100)}%
                            </Badge>
                            <Badge variant="outline" className="border-gray-300 text-gray-600">
                              Confidence: {Math.round(archetype.confidence * 100)}%
                            </Badge>
                          </div>
                        </div>

                        {archetype.traits && archetype.traits.length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium text-gray-700 mb-3">Key Traits Identified:</h4>
                            <div className="flex flex-wrap gap-2">
                              {archetype.traits.map((trait, i) => (
                                <Badge 
                                  key={i} 
                                  variant="outline" 
                                  className="bg-green-50 text-green-700 border-green-200"
                                >
                                  {trait}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {archetype.evidence && archetype.evidence.length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium text-gray-700 mb-3">Linguistic Evidence:</h4>
                            <ul className="space-y-2 text-sm text-gray-600">
                              {archetype.evidence.map((evidence, i) => (
                                <li key={i} className="flex items-start gap-3">
                                  <span className="text-blue-500 mt-1">•</span>
                                  {evidence}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {index < testResults.length - 1 && (
                          <hr className="border-gray-200" />
                        )}
                      </div>
                    ))}

                  <div className="flex gap-4 mt-8 pt-6 border-t border-gray-200">
                    <Button 
                      onClick={() => setActiveTab('builder')}
                      variant="outline"
                      className="border-gray-300 text-gray-700 hover:bg-gray-50"
                    >
                      Modify Configuration
                    </Button>
                    <Button 
                      onClick={() => setActiveTab('test')}
                      className="bg-blue-500 hover:bg-blue-600 text-white"
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