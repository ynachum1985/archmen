"use client"

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Settings, 
  Brain, 
  Target, 
  FileText,
  Save, 
  Eye,
  Plus,
  X
} from 'lucide-react'

interface SimplifiedAssessmentConfig {
  // Overview & Purpose
  name: string
  description: string
  purpose: string
  expectedDuration: number
  
  // AI Configuration
  systemPrompt: string
  questioningStyle: string
  
  // Assessment Setup
  targetArchetypes: string[]
  completionCriteria: string
  
  // Report Generation
  reportGeneration: string
}

interface SimplifiedAssessmentBuilderProps {
  assessment?: SimplifiedAssessmentConfig
  onSave: (config: SimplifiedAssessmentConfig) => void
  onTest: (config: SimplifiedAssessmentConfig) => void
}

const defaultConfig: SimplifiedAssessmentConfig = {
  name: '',
  description: '',
  purpose: '',
  expectedDuration: 10,
  systemPrompt: `You are an expert psychological assessor specializing in archetype identification through natural conversation. 

Your approach:
- Ask thoughtful, open-ended questions that reveal deep patterns
- Analyze language use, emotional expressions, and communication styles
- Maintain a warm, curious, and professional demeanor
- Guide the conversation naturally without feeling clinical

Focus on understanding the person's authentic self-expression and underlying motivations.`,
  questioningStyle: `Ask questions that invite storytelling and emotional sharing:
- Tell me about a time when you felt most like yourself...
- What kind of situations bring out your best qualities?
- How do you typically respond when facing challenges?
- What draws you to certain people or experiences?

Follow emotional threads and explore patterns across different life areas.`,
  targetArchetypes: [],
  completionCriteria: '6-8 meaningful exchanges that reveal consistent patterns',
  reportGeneration: `Generate a comprehensive report that includes:
- Primary archetype identification with confidence scores
- Key behavioral patterns and traits observed
- Specific evidence from language and responses
- Growth opportunities and integration suggestions
- Actionable insights for personal development`
}

export function SimplifiedAssessmentBuilder({ 
  assessment, 
  onSave, 
  onTest 
}: SimplifiedAssessmentBuilderProps) {
  const [config, setConfig] = useState<SimplifiedAssessmentConfig>(
    assessment || defaultConfig
  )
  const [newArchetype, setNewArchetype] = useState('')

  const handleAddArchetype = () => {
    if (newArchetype.trim() && !config.targetArchetypes.includes(newArchetype.trim())) {
      setConfig(prev => ({
        ...prev,
        targetArchetypes: [...prev.targetArchetypes, newArchetype.trim()]
      }))
      setNewArchetype('')
    }
  }

  const handleRemoveArchetype = (archetype: string) => {
    setConfig(prev => ({
      ...prev,
      targetArchetypes: prev.targetArchetypes.filter(a => a !== archetype)
    }))
  }

  const handleSave = () => {
    onSave(config)
  }

  const handleTest = () => {
    onTest(config)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddArchetype()
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Assessment Builder</h1>
          <p className="text-gray-600 mt-1">Create AI-powered archetype assessments with ease</p>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            onClick={handleTest}
            className="flex items-center gap-2"
          >
            <Eye className="h-4 w-4" />
            Test
          </Button>
          <Button 
            onClick={handleSave}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
          >
            <Save className="h-4 w-4" />
            Save Assessment
          </Button>
        </div>
      </div>

      {/* Simplified Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="ai-config" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            AI Setup
          </TabsTrigger>
          <TabsTrigger value="assessment" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Assessment
          </TabsTrigger>
          <TabsTrigger value="reporting" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Reports
          </TabsTrigger>
        </TabsList>

        {/* Overview & Purpose */}
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Overview & Purpose
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Assessment Name</Label>
                  <Input
                    id="name"
                    value={config.name}
                    onChange={(e) => setConfig(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Leadership Archetype Discovery"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={config.expectedDuration}
                    onChange={(e) => setConfig(prev => ({ ...prev, expectedDuration: parseInt(e.target.value) || 10 }))}
                    className="mt-1"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={config.description}
                  onChange={(e) => setConfig(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of what this assessment measures..."
                  className="mt-1"
                  rows={3}
                />
              </div>
              
              <div>
                <Label htmlFor="purpose">Assessment Purpose</Label>
                <Textarea
                  id="purpose"
                  value={config.purpose}
                  onChange={(e) => setConfig(prev => ({ ...prev, purpose: e.target.value }))}
                  placeholder="What should this assessment discover about the user? Be specific about the psychological patterns, behaviors, or characteristics you want to uncover..."
                  className="mt-1"
                  rows={4}
                />
                <p className="text-sm text-gray-500 mt-2">
                  This forms the foundation for all AI analysis and questioning strategies.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Configuration */}
        <TabsContent value="ai-config" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                AI Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="systemPrompt">AI Personality & Behavior</Label>
                <Textarea
                  id="systemPrompt"
                  value={config.systemPrompt}
                  onChange={(e) => setConfig(prev => ({ ...prev, systemPrompt: e.target.value }))}
                  placeholder="Define how the AI should behave and approach the assessment..."
                  className="mt-1"
                  rows={6}
                />
                <p className="text-sm text-gray-500 mt-2">
                  This defines the AI&apos;s core identity and approach to conducting assessments.
                </p>
              </div>

              <Separator />

              <div>
                <Label htmlFor="questioningStyle">Questioning Style & Flow</Label>
                <Textarea
                  id="questioningStyle"
                  value={config.questioningStyle}
                  onChange={(e) => setConfig(prev => ({ ...prev, questioningStyle: e.target.value }))}
                  placeholder="How should the AI ask questions and structure conversations?"
                  className="mt-1"
                  rows={8}
                />
                <p className="text-sm text-gray-500 mt-2">
                  Define the conversation flow, question types, and interaction patterns.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Assessment Setup */}
        <TabsContent value="assessment" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Assessment Setup
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Target Archetypes</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    value={newArchetype}
                    onChange={(e) => setNewArchetype(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="e.g., The Visionary Leader"
                    className="flex-1"
                  />
                  <Button onClick={handleAddArchetype} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                
                {config.targetArchetypes.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {config.targetArchetypes.map((archetype) => (
                      <Badge 
                        key={archetype}
                        variant="secondary" 
                        className="cursor-pointer hover:bg-red-100 hover:text-red-800 transition-colors"
                        onClick={() => handleRemoveArchetype(archetype)}
                      >
                        {archetype}
                        <X className="h-3 w-3 ml-1" />
                      </Badge>
                    ))}
                  </div>
                )}
                <p className="text-sm text-gray-500 mt-2">
                  Add the archetypes this assessment can identify. Click badges to remove.
                </p>
              </div>

              <Separator />

              <div>
                <Label htmlFor="completionCriteria">Completion Criteria</Label>
                <Textarea
                  id="completionCriteria"
                  value={config.completionCriteria}
                  onChange={(e) => setConfig(prev => ({ ...prev, completionCriteria: e.target.value }))}
                  placeholder="When should the assessment end? e.g., 6-8 meaningful exchanges or when confidence in top archetype exceeds 80%"
                  className="mt-1"
                  rows={3}
                />
                <p className="text-sm text-gray-500 mt-2">
                  Define when the assessment should conclude and generate results.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Report Generation */}
        <TabsContent value="reporting" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Report Generation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <Label htmlFor="reportGeneration">Report Structure & Content</Label>
                <Textarea
                  id="reportGeneration"
                  value={config.reportGeneration}
                  onChange={(e) => setConfig(prev => ({ ...prev, reportGeneration: e.target.value }))}
                  placeholder="Define what should be included in the final assessment report..."
                  className="mt-1"
                  rows={6}
                />
                <p className="text-sm text-gray-500 mt-2">
                  Specify the format, sections, and type of insights to include in assessment reports.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Footer Actions */}
      <div className="flex justify-between pt-6 border-t">
        <div className="text-sm text-gray-500">
          Assessment configuration will be saved automatically as you make changes.
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleTest}>
            <Eye className="h-4 w-4 mr-2" />
            Test Assessment
          </Button>
          <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
            <Save className="h-4 w-4 mr-2" />
            Save & Deploy
          </Button>
        </div>
      </div>
    </div>
  )
} 