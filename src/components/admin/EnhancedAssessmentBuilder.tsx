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
  Plus
} from 'lucide-react'
import { CategoryService, type AssessmentCategory } from '@/lib/services/category.service'
import { AIPersonality, aiPersonalityService } from '@/lib/services/ai-personality.service'

import { ArchetypeContentBuilder } from './ArchetypeContentBuilder'
import { AssessmentTestingChat } from './AssessmentTestingChat'
import { EmbeddingSettingsDialog } from './EmbeddingSettingsDialog'
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
  onTest?: (config: EnhancedAssessmentConfig) => void
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
  onSave
}: EnhancedAssessmentBuilderProps) {
  const [config, setConfig] = useState<EnhancedAssessmentConfig>(assessment || defaultConfig)
  const [categories, setCategories] = useState<AssessmentCategory[]>([])
  const [personalities, setPersonalities] = useState<AIPersonality[]>([])
  const [isLoadingCategories, setIsLoadingCategories] = useState(true)
  const [isLoadingPersonalities, setIsLoadingPersonalities] = useState(true)
  const [showNewCategoryDialog, setShowNewCategoryDialog] = useState(false)
  const [showTestingChat, setShowTestingChat] = useState(false)
  const [newCategory, setNewCategory] = useState({ name: '', description: '', color: 'blue', icon: 'Folder' })
  const categoryService = new CategoryService()

  // Handle assessment prop changes
  useEffect(() => {
    if (assessment) {
      // Merge assessment with default config to ensure all properties exist
      setConfig({
        ...defaultConfig,
        ...assessment,
        cycleSettings: {
          ...defaultConfig.cycleSettings,
          ...(assessment.cycleSettings || {})
        },
        reportAnswers: {
          ...defaultConfig.reportAnswers,
          ...(assessment.reportAnswers || {})
        },
        questionExamples: {
          ...defaultConfig.questionExamples,
          ...(assessment.questionExamples || {})
        }
      })
    }
  }, [assessment])

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
    setShowTestingChat(true)
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
      <Tabs defaultValue="setup" className="space-y-6">
        <TabsList className={`grid w-full ${assessment ? 'grid-cols-3' : 'grid-cols-2'}`}>
          <TabsTrigger value="setup">Setup</TabsTrigger>
          <TabsTrigger value="reports">Report and Answers</TabsTrigger>
          {assessment && <TabsTrigger value="testing">Testing</TabsTrigger>}
        </TabsList>

        {/* Setup Tab */}
        <TabsContent value="setup" className="space-y-6">
          {/* AI Personality Selection */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-gray-900">AI Personality</h4>
              <Link
                href="/admin?tab=ai-personality"
                className="text-gray-600 hover:text-gray-700 text-xs font-medium flex items-center gap-1"
              >
                <Plus className="h-3 w-3" />
                Manage
              </Link>
            </div>
            <Select
              value={config.selectedPersonalityId || 'default'}
              onValueChange={(value) => setConfig(prev => ({ ...prev, selectedPersonalityId: value === 'default' ? undefined : value }))}
            >
              <SelectTrigger className="h-9 text-sm">
                <SelectValue placeholder="Choose AI personality" />
              </SelectTrigger>
              <SelectContent>
                {isLoadingPersonalities ? (
                  <SelectItem value="loading" disabled>Loading personalities...</SelectItem>
                ) : (
                  <>
                    <SelectItem value="default">Default personality</SelectItem>
                    {personalities.map(personality => (
                      <SelectItem key={personality.id} value={personality.id}>
                        {personality.name} - {personality.description}
                      </SelectItem>
                    ))}
                  </>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Basic Configuration */}
          <div className="space-y-4">
            {/* Basic Information */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Basic Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              </div>
            </div>



            {/* Question & Cycle Settings - Compact Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Question Settings */}
              <div className="bg-gray-50 p-3 rounded-lg">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Question Settings</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="minQuestions" className="text-xs">Min Questions</Label>
                    <Input
                      id="minQuestions"
                      type="number"
                      min="3"
                      max="20"
                      value={config.minQuestions}
                      onChange={(e) => setConfig(prev => ({ ...prev, minQuestions: parseInt(e.target.value) || 8 }))}
                      className="mt-1 h-7 text-xs"
                    />
                  </div>
                  <div>
                    <Label htmlFor="maxQuestions" className="text-xs">Max Questions</Label>
                    <Input
                      id="maxQuestions"
                      type="number"
                      min="5"
                      max="30"
                      value={config.maxQuestions}
                      onChange={(e) => setConfig(prev => ({ ...prev, maxQuestions: parseInt(e.target.value) || 15 }))}
                      className="mt-1 h-7 text-xs"
                    />
                  </div>
                  <div>
                    <Label htmlFor="evidenceThreshold" className="text-xs">Evidence Threshold</Label>
                    <Input
                      id="evidenceThreshold"
                      type="number"
                      min="0.1"
                      max="1.0"
                      step="0.1"
                      value={config.evidenceThreshold}
                      onChange={(e) => setConfig(prev => ({ ...prev, evidenceThreshold: parseFloat(e.target.value) || 0.7 }))}
                      className="mt-1 h-7 text-xs"
                    />
                  </div>
                  <div>
                    <Label htmlFor="adaptationSensitivity" className="text-xs">Adaptation Sensitivity</Label>
                    <Input
                      id="adaptationSensitivity"
                      type="number"
                      min="0.1"
                      max="1.0"
                      step="0.1"
                      value={config.adaptationSensitivity}
                      onChange={(e) => setConfig(prev => ({ ...prev, adaptationSensitivity: parseFloat(e.target.value) || 0.5 }))}
                      className="mt-1 h-7 text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Cycle Settings */}
              <div className="bg-gray-50 p-3 rounded-lg">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Cycle Settings</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="maxCycles" className="text-xs">Max Cycles</Label>
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
                      className="mt-1 h-7 text-xs"
                    />
                  </div>
                  <div>
                    <Label htmlFor="evidencePerCycle" className="text-xs">Evidence Per Cycle</Label>
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
                      className="mt-1 h-7 text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>


          </div>

          {/* Combined Prompt Section */}
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Assessment Description & System Prompt</h3>

            {/* Category - moved here */}
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
              <SelectTrigger className="h-8 text-sm">
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
                    <SelectItem value="create-new" className="text-emerald-600 font-medium">
                      + Create New Category
                    </SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>

            {/* Category Embedding Configuration */}
            {config.category && config.category !== 'create-new' && (
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium text-blue-900">Category Knowledge Base</h4>
                  <EmbeddingSettingsDialog
                    trigger={
                      <Button variant="outline" size="sm" className="flex items-center gap-1 border-blue-300 text-blue-700 hover:bg-blue-100">
                        <span className="text-lg">✨</span>
                        Embedding Settings
                      </Button>
                    }
                    title={`Embedding Settings for ${config.category}`}
                    description={`Configure how ${config.category} content is processed and embedded for AI reference`}
                    itemId={config.category}
                    itemType="archetype"
                    onSave={(settings) => {
                      console.log('Category embedding settings saved:', settings)
                      // Here you would save the settings for this category
                    }}
                  />
                </div>
                <p className="text-sm text-blue-700 mb-3">
                  Upload documents, books, and reference materials specific to {config.category}.
                  The AI will use this content to provide more informed and accurate assessments.
                </p>
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm text-blue-900">Upload Documents</Label>
                    <Input
                      type="file"
                      multiple
                      accept=".pdf,.txt,.doc,.docx"
                      className="mt-1 border-blue-200 bg-white"
                    />
                  </div>
                  <div>
                    <Label className="text-sm text-blue-900">Add Text Content</Label>
                    <Textarea
                      placeholder={`Paste ${config.category} content, book excerpts, or reference material here...`}
                      className="mt-1 border-blue-200 bg-white"
                      rows={4}
                    />
                  </div>
                  <div>
                    <Label className="text-sm text-blue-900">Reference Links</Label>
                    <Input
                      placeholder={`https://example.com/${config.category.toLowerCase()}-guide`}
                      className="mt-1 border-blue-200 bg-white"
                    />
                  </div>
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                    Process & Embed Content
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Description and Purpose - moved here */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="description" className="text-sm">Assessment Description</Label>
              <Textarea
                id="description"
                value={config.description}
                onChange={(e) => setConfig(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe what this assessment measures..."
                className="mt-1 text-sm border-gray-200"
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="purpose" className="text-sm">Assessment Purpose</Label>
              <Textarea
                id="purpose"
                value={config.purpose}
                onChange={(e) => setConfig(prev => ({ ...prev, purpose: e.target.value }))}
                placeholder="Define the specific goals and outcomes..."
                className="mt-1 text-sm border-gray-200"
                rows={3}
              />
            </div>
          </div>

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

          {/* Assessment Testing */}
          <div className="space-y-4">
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h4 className="text-sm font-medium text-green-900 mb-3">Test Assessment</h4>
              <p className="text-sm text-green-700 mb-4">
                Test your assessment configuration with a live chatbot interface to see how it performs.
              </p>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={handleTest}
                  className="flex items-center gap-2 border-green-300 text-green-700 hover:bg-green-100"
                >
                  <Eye className="h-4 w-4" />
                  Test Assessment
                </Button>
                <Button
                  onClick={handleSave}
                  className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600"
                >
                  <Save className="h-4 w-4" />
                  Save Assessment
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Report & Answers Tab */}
        <TabsContent value="reports" className="space-y-8">
          {/* Archetype Content Builder */}
          <ArchetypeContentBuilder
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




        </TabsContent>

        {/* Testing Tab - Only shown when editing an existing assessment */}
        {assessment && (
          <TabsContent value="testing" className="space-y-6">
            <div className="bg-white border rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Test Assessment</h3>
                  <p className="text-sm text-gray-600">
                    Test your assessment configuration with a live chat interface
                  </p>
                </div>
                <Button
                  onClick={() => setShowTestingChat(true)}
                  className="flex items-center gap-2"
                >
                  <Eye className="h-4 w-4" />
                  Start Test
                </Button>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Assessment Configuration Summary</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Questions:</span>
                    <span className="ml-1 font-medium">{config.minQuestions}-{config.maxQuestions}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Duration:</span>
                    <span className="ml-1 font-medium">{config.expectedDuration} min</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Category:</span>
                    <span className="ml-1 font-medium">{config.category || 'Not set'}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">AI Personality:</span>
                    <span className="ml-1 font-medium">
                      {personalities.find(p => p.id === config.selectedPersonalityId)?.name || 'Default'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="text-sm font-medium text-blue-900 mb-2">Testing Instructions</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Click "Start Test" to open the assessment chat interface</li>
                  <li>• Answer questions as a test user would to validate the flow</li>
                  <li>• Check that the AI personality and questioning style match your expectations</li>
                  <li>• Verify that the assessment reaches appropriate conclusions</li>
                  <li>• Make adjustments to the configuration as needed</li>
                </ul>
              </div>
            </div>
          </TabsContent>
        )}
      </Tabs>

      {/* Testing Chat Modal */}
      {showTestingChat && (
        <AssessmentTestingChat
          config={config}
          onClose={() => setShowTestingChat(false)}
        />
      )}

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
              className="bg-emerald-500 hover:bg-emerald-600"
            >
              Create Category
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
