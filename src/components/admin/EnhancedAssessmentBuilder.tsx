'use client'

import { useState, useEffect } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import {
  Save,
  Eye,
  Plus,
  X
} from 'lucide-react'
import { CategoryService, type AssessmentCategory } from '@/lib/services/category.service'
import { AIPersonality, aiPersonalityService } from '@/lib/services/ai-personality.service'
import { ReportTemplatePreview } from './ReportTemplatePreview'
import { ArchetypeContentBuilder } from './ArchetypeContentBuilder'
import Link from 'next/link'

interface EnhancedAssessmentConfig {
  name: string
  description: string
  category: string
  purpose: string
  expectedDuration: number
  
  // AI Configuration
  systemPrompt: string

  // AI Settings
  minQuestions: number
  maxQuestions: number
  evidenceThreshold: number
  adaptationSensitivity: number
  cycleSettings: {
    maxCycles: number
    evidencePerCycle: number
  }

  // AI Personality
  selectedPersonalityId?: string
  combinedPrompt: string // description + purpose + system prompt combined
  
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
  


  // Report Generation (AI chooses archetypes freely)
  reportGeneration: string

  // Report and Answers Configuration
  reportAnswers?: {
    theoreticalUnderstanding: string
    embodimentPractices: string
    integrationPractices: string
    resourceLinks: string[]
    archetypeCards: string[]
  }
}

interface EnhancedAssessmentBuilderProps {
  assessment?: EnhancedAssessmentConfig
  onSave: (config: EnhancedAssessmentConfig) => void
  onTest: (config: EnhancedAssessmentConfig) => void
}

const defaultConfig: EnhancedAssessmentConfig = {
  name: '',
  description: '',
  category: '',
  purpose: '',
  expectedDuration: 15,
  systemPrompt: `You are an expert archetypal analyst with deep knowledge of human psychology and behavioral patterns. Your role is to identify archetypal patterns through natural conversation.

ANALYSIS APPROACH:
- Draw from the complete database of 55+ archetypes
- Analyze language patterns, emotional vocabulary, responsibility patterns, and power dynamics
- Use adaptive questioning to gather sufficient evidence
- Remain curious, non-judgmental, and focused on helping the person understand themselves

QUESTIONING STRATEGY:
- Ask open-ended questions that require 2-3 sentence responses minimum
- Use follow-up prompts if responses are too brief
- Adapt questioning based on emerging patterns
- Ask 8-15 questions total, stopping when sufficient evidence is gathered`,

  // AI Settings
  minQuestions: 8,
  maxQuestions: 15,
  evidenceThreshold: 0.7,
  adaptationSensitivity: 0.5,
  cycleSettings: {
    maxCycles: 3,
    evidencePerCycle: 3
  },

  // AI Personality
  selectedPersonalityId: undefined,
  combinedPrompt: '',
  questionExamples: {
    openEnded: [
      "Tell me about a time when you felt most authentic and true to yourself. What were you doing, and what made that moment special?",
      "Describe a challenging situation you've faced recently. How did you approach it, and what drove your decisions?",
      "When you think about your ideal life, what role do you see yourself playing? What would you be contributing to the world?"
    ],
    followUp: [
      "Can you tell me more about that feeling you described?",
      "What specifically made you choose that approach?",
      "How did that experience change your perspective?"
    ],
    clarifying: [
      "When you say [specific word/phrase], what does that mean to you personally?",
      "Can you give me a specific example of what that looks like in practice?",
      "How would you distinguish that from [related concept]?"
    ],
    deepening: [
      "What do you think drives that pattern in your life?",
      "If you could go back to that moment, what would you want to understand better about yourself?",
      "What fears or hopes do you think might be influencing that choice?"
    ]
  },
  responseRequirements: {
    minSentences: 2,
    maxSentences: 8,
    followUpPrompts: [
      "I'd love to hear more about that. Can you expand on what you mean?",
      "That's interesting. Can you give me a specific example?",
      "Help me understand that better - what did that look like for you?"
    ]
  },
  reportGeneration: `Generate a comprehensive archetypal analysis that includes:

1. PRIMARY ARCHETYPE: The dominant archetypal pattern with confidence score
2. SECONDARY INFLUENCES: Supporting archetypal energies
3. LANGUAGE ANALYSIS: Key patterns in emotional vocabulary, responsibility language, and power dynamics
4. SHADOW PATTERNS: Potential blind spots or underdeveloped aspects
5. INTEGRATION RECOMMENDATIONS: Specific suggestions for growth and development

The AI should freely choose from all available archetypes based on the evidence gathered, without being constrained to a predefined list.`,
  reportAnswers: {
    theoreticalUnderstanding: `Provide deep theoretical context about the discovered archetype(s):
- Historical and mythological origins
- Psychological foundations and core motivations
- How this archetype manifests in modern life
- Common patterns and behaviors associated with this archetype`,
    embodimentPractices: `Suggest specific embodiment practices to help integrate the archetype:
- Physical practices (movement, posture, breathing)
- Visualization and meditation techniques
- Daily rituals and habits
- Creative expression methods`,
    integrationPractices: `Recommend integration practices for balanced development:
- Shadow work exercises
- Journaling prompts and reflection questions
- Relationship and communication practices
- Professional and life application strategies`,
    resourceLinks: [],
    archetypeCards: []
  }
}

export function EnhancedAssessmentBuilder({ 
  assessment, 
  onSave, 
  onTest 
}: EnhancedAssessmentBuilderProps) {
  const [config, setConfig] = useState<EnhancedAssessmentConfig>(assessment || defaultConfig)
  const [categories, setCategories] = useState<AssessmentCategory[]>([])
  const [personalities, setPersonalities] = useState<AIPersonality[]>([])
  const [isLoadingCategories, setIsLoadingCategories] = useState(true)
  const [isLoadingPersonalities, setIsLoadingPersonalities] = useState(true)
  const [showNewCategoryDialog, setShowNewCategoryDialog] = useState(false)
  const [newCategory, setNewCategory] = useState({ name: '', description: '', color: 'blue', icon: 'Folder' })
  const categoryService = new CategoryService()

  useEffect(() => {
    const initialize = async () => {
      await loadCategories()
      await loadPersonalities()
      await initializeFileStorage()
    }
    initialize()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const loadCategories = async () => {
    try {
      await categoryService.initializeDefaultCategories()
      const categoriesData = await categoryService.getAllCategories()
      setCategories(categoriesData)
    } catch (error) {
      console.error('Error loading categories:', error)
    } finally {
      setIsLoadingCategories(false)
    }
  }

  const loadPersonalities = async () => {
    try {
      await aiPersonalityService.initializeDefaultPersonalities()
      const personalitiesData = await aiPersonalityService.getActivePersonalities()
      setPersonalities(personalitiesData)
    } catch (error) {
      console.error('Error loading personalities:', error)
    } finally {
      setIsLoadingPersonalities(false)
    }
  }

  const initializeFileStorage = async () => {
    try {
      // Initialize storage bucket if needed
      console.log('File storage initialized')
    } catch (error) {
      console.error('Error initializing file storage:', error)
    }
  }





  const handleCreateCategory = async () => {
    try {
      const createdCategory = await categoryService.createCategory({
        name: newCategory.name,
        description: newCategory.description,
        color: newCategory.color,
        icon: newCategory.icon,
        is_active: true
      })

      setCategories(prev => [...prev, createdCategory])
      setConfig(prev => ({ ...prev, category: createdCategory.name }))
      setNewCategory({ name: '', description: '', color: 'blue', icon: 'Folder' })
      setShowNewCategoryDialog(false)
    } catch (error) {
      console.error('Error creating category:', error)
    }
  }

  const handleSave = () => {
    onSave(config)
  }

  const handleTest = () => {
    onTest(config)
  }

  // Update combined prompt when relevant fields change
  useEffect(() => {
    const combinedPrompt = [
      config.description && `ASSESSMENT DESCRIPTION: ${config.description}`,
      config.purpose && `ASSESSMENT PURPOSE: ${config.purpose}`,
      config.systemPrompt && `SYSTEM INSTRUCTIONS: ${config.systemPrompt}`
    ].filter(Boolean).join('\n\n')

    setConfig(prev => ({ ...prev, combinedPrompt }))
  }, [config.description, config.purpose, config.systemPrompt])

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Action Buttons */}
      <div className="flex justify-end gap-3">
        <Button
          variant="outline"
          onClick={handleTest}
          className="flex items-center gap-2"
        >
          <Eye className="h-4 w-4" />
          Test Assessment
        </Button>
        <Button
          onClick={handleSave}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
        >
          <Save className="h-4 w-4" />
          Save Assessment
        </Button>
      </div>

      <Tabs defaultValue="ai-setup" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="ai-setup">AI Setup</TabsTrigger>
          <TabsTrigger value="reports">Report and Answers</TabsTrigger>
        </TabsList>

        {/* AI Setup Tab */}
        <TabsContent value="ai-setup" className="space-y-8">
          {/* Fixed AI Settings */}
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">AI Configuration Settings</h3>

            {/* Basic Information */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Basic Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="name" className="text-sm">Assessment Name</Label>
                  <Input
                    id="name"
                    value={config.name}
                    onChange={(e) => setConfig(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Leadership Archetype Discovery"
                    className="mt-1 h-8 text-sm"
                  />
                </div>
                <div>
                  <Label htmlFor="duration" className="text-sm">Duration (min)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={config.expectedDuration}
                    onChange={(e) => setConfig(prev => ({ ...prev, expectedDuration: parseInt(e.target.value) || 15 }))}
                    className="mt-1 h-8 text-sm"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="category" className="text-sm">Category</Label>
                    <Dialog open={showNewCategoryDialog} onOpenChange={setShowNewCategoryDialog}>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="flex items-center gap-1 text-gray-600 hover:text-gray-800 h-6 px-2">
                          <Plus className="h-3 w-3" />
                          New
                        </Button>
                      </DialogTrigger>
                    <DialogContent className="border-gray-200">
                      <DialogHeader>
                        <DialogTitle>Create New Category</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="categoryName">Category Name</Label>
                          <Input
                            id="categoryName"
                            value={newCategory.name}
                            onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="e.g., Spiritual Development"
                            className="border-gray-200"
                          />
                        </div>
                        <div>
                          <Label htmlFor="categoryDescription">Description</Label>
                          <Textarea
                            id="categoryDescription"
                            value={newCategory.description}
                            onChange={(e) => setNewCategory(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="Describe this category..."
                            rows={2}
                            className="border-gray-200"
                          />
                        </div>
                        <div className="flex gap-4">
                          <Button onClick={handleCreateCategory} className="flex-1">
                            Create Category
                          </Button>
                          <Button variant="outline" onClick={() => setShowNewCategoryDialog(false)}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                <Select
                  value={config.category}
                  onValueChange={(value) => {
                    if (value === 'create-new') {
                      setShowNewCategoryDialog(true)
                    } else {
                      setConfig(prev => ({ ...prev, category: value }))
                    }
                  }}
                >
                  <SelectTrigger className="mt-1 h-8 text-sm">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoadingCategories ? (
                      <SelectItem value="loading" disabled>Loading categories...</SelectItem>
                    ) : (
                      <>
                        {categories.map(category => (
                          <SelectItem key={category.id} value={category.name}>
                            {category.name}
                          </SelectItem>
                        ))}
                        <SelectItem value="create-new" className="text-blue-600 font-medium">
                          + Create New Category
                        </SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
                </div>
              </div>
            </div>

            {/* Question Settings */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Question Settings</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="minQuestions" className="text-sm">Min Questions</Label>
                  <Input
                    id="minQuestions"
                    type="number"
                    min="3"
                    max="20"
                    value={config.minQuestions}
                    onChange={(e) => setConfig(prev => ({ ...prev, minQuestions: parseInt(e.target.value) || 8 }))}
                    className="mt-1 h-8 text-sm"
                  />
                </div>
                <div>
                  <Label htmlFor="maxQuestions" className="text-sm">Max Questions</Label>
                  <Input
                    id="maxQuestions"
                    type="number"
                    min="5"
                    max="30"
                    value={config.maxQuestions}
                    onChange={(e) => setConfig(prev => ({ ...prev, maxQuestions: parseInt(e.target.value) || 15 }))}
                    className="mt-1 h-8 text-sm"
                  />
                </div>
                <div>
                  <Label htmlFor="evidenceThreshold" className="text-sm">Evidence Threshold</Label>
                  <Input
                    id="evidenceThreshold"
                    type="number"
                    min="0.1"
                    max="1.0"
                    step="0.1"
                    value={config.evidenceThreshold}
                    onChange={(e) => setConfig(prev => ({ ...prev, evidenceThreshold: parseFloat(e.target.value) || 0.7 }))}
                    className="mt-1 h-8 text-sm"
                  />
                </div>
                <div>
                  <Label htmlFor="adaptationSensitivity" className="text-sm">Adaptation Sensitivity</Label>
                  <Input
                    id="adaptationSensitivity"
                    type="number"
                    min="0.1"
                    max="1.0"
                    step="0.1"
                    value={config.adaptationSensitivity}
                    onChange={(e) => setConfig(prev => ({ ...prev, adaptationSensitivity: parseFloat(e.target.value) || 0.5 }))}
                    className="mt-1 h-8 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Cycle Settings */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Cycle Settings</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="maxCycles" className="text-sm">Max Cycles</Label>
                  <Input
                    id="maxCycles"
                    type="number"
                    min="1"
                    max="10"
                    value={config.cycleSettings.maxCycles}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      cycleSettings: {
                        ...prev.cycleSettings,
                        maxCycles: parseInt(e.target.value) || 3
                      }
                    }))}
                    className="mt-1 h-8 text-sm"
                  />
                </div>
                <div>
                  <Label htmlFor="evidencePerCycle" className="text-sm">Evidence Per Cycle</Label>
                  <Input
                    id="evidencePerCycle"
                    type="number"
                    min="1"
                    max="10"
                    value={config.cycleSettings.evidencePerCycle}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      cycleSettings: {
                        ...prev.cycleSettings,
                        evidencePerCycle: parseInt(e.target.value) || 3
                      }
                    }))}
                    className="mt-1 h-8 text-sm"
                  />
                </div>
              </div>
            </div>


          </div>

          {/* Combined Prompt Section */}
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Assessment Description & System Prompt</h3>
            <div>
              <Label htmlFor="combinedPrompt">Combined Prompt (Description + Purpose + System Instructions)</Label>
              <Textarea
                id="combinedPrompt"
                value={config.combinedPrompt}
                onChange={(e) => setConfig(prev => ({ ...prev, combinedPrompt: e.target.value }))}
                placeholder="This will automatically combine your description, purpose, and system prompt. You can also edit it directly here..."
                className="mt-1 font-mono text-sm border-gray-200"
                rows={15}
              />
              <p className="text-sm text-gray-500 mt-2">
                This field automatically combines your assessment description, purpose, and system prompt. You can edit it directly or it will update when you change the individual fields above.
              </p>
            </div>
          </div>

          {/* AI Personality Selection */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">AI Personality</h3>
              <Link
                href="/admin?tab=ai-personality"
                className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
              >
                <Plus className="h-4 w-4" />
                Manage Personalities
              </Link>
            </div>

            <div>
              <Label htmlFor="personality">Select AI Personality</Label>
              <Select
                value={config.selectedPersonalityId || 'default'}
                onValueChange={(value) => setConfig(prev => ({ ...prev, selectedPersonalityId: value === 'default' ? undefined : value }))}
              >
                <SelectTrigger className="mt-1 border-gray-200">
                  <SelectValue placeholder="Choose an AI personality for this assessment" />
                </SelectTrigger>
                <SelectContent>
                  {isLoadingPersonalities ? (
                    <SelectItem value="loading" disabled>Loading personalities...</SelectItem>
                  ) : (
                    <>
                      <SelectItem value="default">No specific personality (use default)</SelectItem>
                      {personalities.map(personality => (
                        <SelectItem key={personality.id} value={personality.id}>
                          {personality.name} - {personality.description}
                        </SelectItem>
                      ))}
                    </>
                  )}
                </SelectContent>
              </Select>
              <p className="text-sm text-gray-500 mt-2">
                Choose an AI personality that defines the questioning style and approach for this assessment.
                <Link href="/admin?tab=ai-personality" className="text-blue-600 hover:text-blue-700 ml-1">
                  Create or configure personalities here.
                </Link>
              </p>
            </div>
          </div>
        </TabsContent>

        {/* Report & Answers Tab */}
        <TabsContent value="reports" className="space-y-8">
          {/* Archetype Content Builder */}
          <ArchetypeContentBuilder
            initialContent={{
              theoreticalUnderstanding: config.reportAnswers?.theoreticalUnderstanding,
              embodimentPractices: config.reportAnswers?.embodimentPractices,
              integrationPractices: config.reportAnswers?.integrationPractices,
              resourceLinks: config.reportAnswers?.resourceLinks
            }}
            onContentChange={(archetypeId, content) => {
              console.log('Content updated for archetype:', archetypeId, content)
              // Here you can save the content to your database
            }}
          />

          {/* Report Generation */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Report Generation Instructions</h3>
            <Textarea
              value={config.reportGeneration}
              onChange={(e) => setConfig(prev => ({ ...prev, reportGeneration: e.target.value }))}
              className="font-mono text-sm"
              rows={8}
              placeholder="Define how the AI should generate assessment reports..."
            />
          </div>



          {/* Report Template Preview */}
          <div className="mt-8">
            <ReportTemplatePreview reportAnswers={config.reportAnswers} />
          </div>
        </TabsContent>
      </Tabs>

      {/* New Category Dialog */}
      <Dialog open={showNewCategoryDialog} onOpenChange={setShowNewCategoryDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Category</DialogTitle>
            <DialogDescription>
              Add a new assessment category with custom styling.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category-name" className="text-right">
                Name
              </Label>
              <Input
                id="category-name"
                value={newCategory.name}
                onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                className="col-span-3"
                placeholder="e.g., Career Development"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category-description" className="text-right">
                Description
              </Label>
              <Input
                id="category-description"
                value={newCategory.description}
                onChange={(e) => setNewCategory(prev => ({ ...prev, description: e.target.value }))}
                className="col-span-3"
                placeholder="Brief description of the category"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category-color" className="text-right">
                Color
              </Label>
              <Select
                value={newCategory.color}
                onValueChange={(value) => setNewCategory(prev => ({ ...prev, color: value }))}
              >
                <SelectTrigger className="col-span-3 bg-white border-gray-300 shadow-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-200 shadow-lg z-50">
                  <SelectItem value="blue" className="hover:bg-gray-50">Blue</SelectItem>
                  <SelectItem value="green" className="hover:bg-gray-50">Green</SelectItem>
                  <SelectItem value="purple" className="hover:bg-gray-50">Purple</SelectItem>
                  <SelectItem value="orange" className="hover:bg-gray-50">Orange</SelectItem>
                  <SelectItem value="red" className="hover:bg-gray-50">Red</SelectItem>
                  <SelectItem value="indigo" className="hover:bg-gray-50">Indigo</SelectItem>
                  <SelectItem value="pink" className="hover:bg-gray-50">Pink</SelectItem>
                  <SelectItem value="teal" className="hover:bg-gray-50">Teal</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewCategoryDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateCategory}
              disabled={!newCategory.name.trim()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Create Category
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
