"use client"

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
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
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-2xl text-white flex items-center gap-2">
            <Brain className="h-6 w-6 text-teal-400" />
            AI Assessment Builder
          </CardTitle>
          <CardDescription className="text-gray-400">
            Define the purpose and goals for your AI-driven assessment
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Basic Information */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-lg text-white flex items-center gap-2">
            <Settings className="h-5 w-5 text-teal-400" />
            Basic Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name" className="text-white">Assessment Name</Label>
              <Input
                id="name"
                value={config.name}
                onChange={(e) => setConfig(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Leadership Archetype Discovery"
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>
            <div>
              <Label htmlFor="duration" className="text-white">Expected Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                value={config.expectedDuration}
                onChange={(e) => setConfig(prev => ({ ...prev, expectedDuration: parseInt(e.target.value) || 10 }))}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="description" className="text-white">Description</Label>
            <Textarea
              id="description"
              value={config.description}
              onChange={(e) => setConfig(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Brief description of what this assessment measures"
              className="bg-slate-700 border-slate-600 text-white"
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      {/* Assessment Purpose & Goals */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-lg text-white flex items-center gap-2">
            <Target className="h-5 w-5 text-teal-400" />
            Assessment Purpose & AI Instructions
          </CardTitle>
          <CardDescription className="text-gray-400">
            Define what the AI should accomplish and how it should analyze responses
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="purpose" className="text-white">Assessment Purpose</Label>
            <Textarea
              id="purpose"
              value={config.purpose}
              onChange={(e) => setConfig(prev => ({ ...prev, purpose: e.target.value }))}
              placeholder="e.g., Discover the user's dominant leadership archetypes by analyzing their communication patterns, decision-making style, and relationship dynamics in professional settings..."
              className="bg-slate-700 border-slate-600 text-white"
              rows={4}
            />
            <p className="text-xs text-gray-400 mt-1">
              This tells the AI what the assessment is trying to accomplish
            </p>
          </div>

          <div>
            <Label htmlFor="analysis" className="text-white">Linguistic Analysis Instructions</Label>
            <Textarea
              id="analysis"
              value={config.analysisInstructions}
              onChange={(e) => setConfig(prev => ({ ...prev, analysisInstructions: e.target.value }))}
              placeholder="e.g., Focus on power language, collaborative vs. directive communication, emotional expression, problem-solving approaches, and authority relationships. Look for patterns in metaphors, decision-making language, and interpersonal dynamics..."
              className="bg-slate-700 border-slate-600 text-white"
              rows={4}
            />
            <p className="text-xs text-gray-400 mt-1">
              Specific instructions for how the AI should analyze language patterns
            </p>
          </div>

          <div>
            <Label htmlFor="completion" className="text-white">Completion Criteria</Label>
            <Textarea
              id="completion"
              value={config.completionCriteria}
              onChange={(e) => setConfig(prev => ({ ...prev, completionCriteria: e.target.value }))}
              placeholder="e.g., Continue until you have high confidence in identifying the top 2-3 archetypes, with at least 5-7 meaningful exchanges that reveal deep patterns..."
              className="bg-slate-700 border-slate-600 text-white"
              rows={3}
            />
            <p className="text-xs text-gray-400 mt-1">
              When should the AI consider the assessment complete?
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Target Archetypes */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-lg text-white flex items-center gap-2">
            <Users className="h-5 w-5 text-teal-400" />
            Target Archetypes
          </CardTitle>
          <CardDescription className="text-gray-400">
            Define which archetypes this assessment can discover
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={newArchetype}
              onChange={(e) => setNewArchetype(e.target.value)}
              placeholder="e.g., The Visionary Leader"
              className="bg-slate-700 border-slate-600 text-white flex-1"
              onKeyPress={(e) => e.key === 'Enter' && handleAddArchetype()}
            />
            <Button 
              onClick={handleAddArchetype}
              className="bg-teal-600 hover:bg-teal-700 text-white"
            >
              Add
            </Button>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {config.targetArchetypes.map((archetype) => (
              <Badge 
                key={archetype}
                variant="outline" 
                className="border-teal-600 text-teal-400 cursor-pointer hover:bg-teal-600/20"
                onClick={() => handleRemoveArchetype(archetype)}
              >
                {archetype} ×
              </Badge>
            ))}
          </div>
          
          {config.targetArchetypes.length === 0 && (
            <p className="text-gray-400 text-sm">
              Add archetypes that this assessment can identify (e.g., The King, The Warrior, The Sage)
            </p>
          )}
        </CardContent>
      </Card>

      {/* Questioning Style */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-lg text-white flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-teal-400" />
            Questioning Style & Approach
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="style" className="text-white">AI Questioning Instructions</Label>
            <Textarea
              id="style"
              value={config.questioningStyle}
              onChange={(e) => setConfig(prev => ({ ...prev, questioningStyle: e.target.value }))}
              placeholder="e.g., Ask open-ended questions that invite storytelling. Start with recent experiences, then dig deeper into patterns. Use follow-up questions that explore emotional responses and decision-making processes. Maintain a warm, curious tone..."
              className="bg-slate-700 border-slate-600 text-white"
              rows={4}
            />
            <p className="text-xs text-gray-400 mt-1">
              How should the AI ask questions and interact with users?
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-4">
        <Button 
          onClick={handleSave}
          className="bg-teal-600 hover:bg-teal-700 text-white flex-1"
        >
          <Save className="mr-2 h-4 w-4" />
          Save Assessment
        </Button>
        <Button 
          onClick={handleTest}
          variant="outline"
          className="border-slate-600 text-white hover:bg-slate-700 flex-1"
        >
          <Eye className="mr-2 h-4 w-4" />
          Test Assessment
        </Button>
      </div>
    </div>
  )
} 