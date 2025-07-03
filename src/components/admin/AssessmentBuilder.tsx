"use client"

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Brain, Save, Eye, Settings, Target, MessageCircle, Users } from 'lucide-react'

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

interface AssessmentBuilderProps {
  assessment?: AssessmentConfig
  onSave: (config: AssessmentConfig) => void
  onTest: (config: AssessmentConfig) => void
}

export function AssessmentBuilder({ assessment, onSave, onTest }: AssessmentBuilderProps) {
  const [config, setConfig] = useState<AssessmentConfig>(assessment || {
    name: '',
    description: '',
    purpose: '',
    targetArchetypes: [],
    analysisInstructions: '',
    questioningStyle: 'conversational',
    expectedDuration: 10,
    completionCriteria: ''
  })

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

  return (
    <div className="space-y-8">
      {/* Header */}
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardHeader className="pb-6">
          <CardTitle className="text-2xl font-light text-gray-900 flex items-center gap-3">
            <Brain className="h-6 w-6 text-blue-500" />
            AI Assessment Builder
          </CardTitle>
          <CardDescription className="text-gray-600 text-base">
            Define the purpose and goals for your AI-driven assessment
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Basic Information */}
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-medium text-gray-900 flex items-center gap-2">
            <Settings className="h-5 w-5 text-blue-500" />
            Basic Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="name" className="text-gray-700 font-medium">Assessment Name</Label>
              <Input
                id="name"
                value={config.name}
                onChange={(e) => setConfig(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Leadership Archetype Discovery"
                className="mt-2 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <Label htmlFor="duration" className="text-gray-700 font-medium">Expected Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                value={config.expectedDuration}
                onChange={(e) => setConfig(prev => ({ ...prev, expectedDuration: parseInt(e.target.value) || 10 }))}
                className="mt-2 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="description" className="text-gray-700 font-medium">Description</Label>
            <Textarea
              id="description"
              value={config.description}
              onChange={(e) => setConfig(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Brief description of what this assessment measures"
              className="mt-2 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Assessment Purpose & Goals */}
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-medium text-gray-900 flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-500" />
            Assessment Purpose & AI Instructions
          </CardTitle>
          <CardDescription className="text-gray-600">
            Define what the AI should accomplish and how it should analyze responses
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="purpose" className="text-gray-700 font-medium">Assessment Purpose</Label>
            <Textarea
              id="purpose"
              value={config.purpose}
              onChange={(e) => setConfig(prev => ({ ...prev, purpose: e.target.value }))}
              placeholder="e.g., Discover the user's dominant leadership archetypes by analyzing their communication patterns, decision-making style, and relationship dynamics in professional settings..."
              className="mt-2 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              rows={4}
            />
            <p className="text-xs text-gray-500 mt-2">
              This tells the AI what the assessment is trying to accomplish
            </p>
          </div>

          <div>
            <Label htmlFor="analysis" className="text-gray-700 font-medium">Linguistic Analysis Instructions</Label>
            <Textarea
              id="analysis"
              value={config.analysisInstructions}
              onChange={(e) => setConfig(prev => ({ ...prev, analysisInstructions: e.target.value }))}
              placeholder="e.g., Focus on power language, collaborative vs. directive communication, emotional expression, problem-solving approaches, and authority relationships. Look for patterns in metaphors, decision-making language, and interpersonal dynamics..."
              className="mt-2 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              rows={4}
            />
            <p className="text-xs text-gray-500 mt-2">
              Specific instructions for how the AI should analyze language patterns
            </p>
          </div>

          <div>
            <Label htmlFor="completion" className="text-gray-700 font-medium">Completion Criteria</Label>
            <Textarea
              id="completion"
              value={config.completionCriteria}
              onChange={(e) => setConfig(prev => ({ ...prev, completionCriteria: e.target.value }))}
              placeholder="e.g., Continue until you have high confidence in identifying the top 2-3 archetypes, with at least 5-7 meaningful exchanges that reveal deep patterns..."
              className="mt-2 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              rows={3}
            />
            <p className="text-xs text-gray-500 mt-2">
              When should the AI consider the assessment complete?
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Target Archetypes */}
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-medium text-gray-900 flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-500" />
            Target Archetypes
          </CardTitle>
          <CardDescription className="text-gray-600">
            Define which archetypes this assessment can discover
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex gap-3">
            <Input
              value={newArchetype}
              onChange={(e) => setNewArchetype(e.target.value)}
              placeholder="e.g., The Visionary Leader"
              className="flex-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              onKeyPress={(e) => e.key === 'Enter' && handleAddArchetype()}
            />
            <Button 
              onClick={handleAddArchetype}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6"
            >
              Add
            </Button>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {config.targetArchetypes.map((archetype) => (
              <Badge 
                key={archetype}
                variant="outline" 
                className="bg-blue-50 text-blue-700 border-blue-200 cursor-pointer hover:bg-blue-100 px-3 py-1"
                onClick={() => handleRemoveArchetype(archetype)}
              >
                {archetype} ×
              </Badge>
            ))}
          </div>
          
          {config.targetArchetypes.length === 0 && (
            <p className="text-gray-500 text-sm">
              Add archetypes that this assessment can identify (e.g., The King, The Warrior, The Sage)
            </p>
          )}
        </CardContent>
      </Card>

      {/* Questioning Style */}
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-medium text-gray-900 flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-blue-500" />
            Questioning Style & Approach
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <Label htmlFor="style" className="text-gray-700 font-medium">AI Questioning Instructions</Label>
            <Textarea
              id="style"
              value={config.questioningStyle}
              onChange={(e) => setConfig(prev => ({ ...prev, questioningStyle: e.target.value }))}
              placeholder="e.g., Ask open-ended questions that invite storytelling. Start with recent experiences, then dig deeper into patterns. Use follow-up questions that explore emotional responses and decision-making processes. Maintain a warm, curious tone..."
              className="mt-2 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              rows={4}
            />
            <p className="text-xs text-gray-500 mt-2">
              How should the AI ask questions and interact with users?
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-4 pt-4">
        <Button 
          onClick={handleSave}
          className="bg-blue-500 hover:bg-blue-600 text-white flex-1 py-3 text-base font-medium"
        >
          <Save className="mr-2 h-4 w-4" />
          Save Assessment
        </Button>
        <Button 
          onClick={handleTest}
          variant="outline"
          className="border-gray-300 text-gray-700 hover:bg-gray-50 flex-1 py-3 text-base font-medium"
        >
          <Eye className="mr-2 h-4 w-4" />
          Test Assessment
        </Button>
      </div>
    </div>
  )
} 