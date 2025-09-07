'use client'

import { useState, useEffect } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { QuestioningFlowBuilder, QuestioningFlow } from './QuestioningFlowBuilder'
import { ReferenceManager, type ReferenceLink } from './ReferenceManager'
import {
  Save,
  Eye,
  Plus,
  X
} from 'lucide-react'
import { CategoryService, type AssessmentCategory } from '@/lib/services/category.service'
import { type UploadedFile } from '@/lib/services/file-upload.service'

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
  referenceFiles: UploadedFile[]
  referenceLinks: ReferenceLink[]

  // Advanced Questioning Flow
  questioningFlow?: QuestioningFlow

  // Report Generation (AI chooses archetypes freely)
  reportGeneration: string
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
  questioningStrategy: 'adaptive',
  questioningDepth: 'moderate',
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
  adaptiveLogic: {
    minQuestions: 8,
    maxQuestions: 15,
    evidenceThreshold: 3,
    adaptationTriggers: [
      "Strong archetypal pattern emerges",
      "User shows resistance or discomfort",
      "Response patterns become repetitive",
      "Emotional depth increases significantly"
    ]
  },
  referenceFiles: [],
  referenceLinks: [],
  reportGeneration: `Generate a comprehensive archetypal analysis that includes:

1. PRIMARY ARCHETYPE: The dominant archetypal pattern with confidence score
2. SECONDARY INFLUENCES: Supporting archetypal energies
3. LANGUAGE ANALYSIS: Key patterns in emotional vocabulary, responsibility language, and power dynamics
4. SHADOW PATTERNS: Potential blind spots or underdeveloped aspects
5. INTEGRATION RECOMMENDATIONS: Specific suggestions for growth and development

The AI should freely choose from all available archetypes based on the evidence gathered, without being constrained to a predefined list.`
}

export function EnhancedAssessmentBuilder({ 
  assessment, 
  onSave, 
  onTest 
}: EnhancedAssessmentBuilderProps) {
  const [config, setConfig] = useState<EnhancedAssessmentConfig>(assessment || defaultConfig)
  const [categories, setCategories] = useState<AssessmentCategory[]>([])
  const [isLoadingCategories, setIsLoadingCategories] = useState(true)
  const [showNewCategoryDialog, setShowNewCategoryDialog] = useState(false)
  const [newCategory, setNewCategory] = useState({ name: '', description: '', color: 'blue', icon: 'Folder' })
  const categoryService = new CategoryService()

  useEffect(() => {
    const initialize = async () => {
      await loadCategories()
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

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview & AI Setup</TabsTrigger>
          <TabsTrigger value="questioning">Questioning & Flow</TabsTrigger>
          <TabsTrigger value="files">Reference Files</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-8">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <Label htmlFor="duration">Expected Duration (minutes)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={config.expectedDuration}
                  onChange={(e) => setConfig(prev => ({ ...prev, expectedDuration: parseInt(e.target.value) || 15 }))}
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
                placeholder="Describe what this assessment aims to discover..."
                className="mt-1"
                rows={3}
              />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <Label htmlFor="category">Category</Label>
                <Dialog open={showNewCategoryDialog} onOpenChange={setShowNewCategoryDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="flex items-center gap-1">
                      <Plus className="h-3 w-3" />
                      New Category
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
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
                <SelectTrigger className="mt-1">
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

            <div>
              <Label htmlFor="purpose">Assessment Purpose</Label>
              <Textarea
                id="purpose"
                value={config.purpose}
                onChange={(e) => setConfig(prev => ({ ...prev, purpose: e.target.value }))}
                placeholder="What specific insights should this assessment provide?"
                className="mt-1"
                rows={3}
              />
            </div>
          </div>

          {/* AI Configuration */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">AI Configuration</h3>
            <div>
              <Label htmlFor="systemPrompt">System Prompt</Label>
              <Textarea
                id="systemPrompt"
                value={config.systemPrompt}
                onChange={(e) => setConfig(prev => ({ ...prev, systemPrompt: e.target.value }))}
                className="mt-1 font-mono text-sm"
                rows={12}
              />
            </div>

            <div>
              <Label htmlFor="reportGeneration">Report Generation Instructions</Label>
              <Textarea
                id="reportGeneration"
                value={config.reportGeneration}
                onChange={(e) => setConfig(prev => ({ ...prev, reportGeneration: e.target.value }))}
                className="mt-1"
                rows={8}
              />
            </div>
          </div>
        </TabsContent>



        {/* Questioning & Flow Tab */}
        <TabsContent value="questioning" className="space-y-8">
          {/* Questioning Strategy */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Questioning Strategy</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="questioningStrategy">Strategy</Label>
                <Select
                  value={config.questioningStrategy}
                  onValueChange={(value: 'adaptive' | 'progressive' | 'exploratory' | 'focused') => setConfig(prev => ({ ...prev, questioningStrategy: value }))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="adaptive">Adaptive - Adjusts based on responses</SelectItem>
                    <SelectItem value="progressive">Progressive - Builds complexity gradually</SelectItem>
                    <SelectItem value="exploratory">Exploratory - Wide-ranging discovery</SelectItem>
                    <SelectItem value="focused">Focused - Targeted deep-dive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="questioningDepth">Depth</Label>
                <Select
                  value={config.questioningDepth}
                  onValueChange={(value: 'surface' | 'moderate' | 'deep' | 'profound') => setConfig(prev => ({ ...prev, questioningDepth: value }))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="surface">Surface - Basic patterns</SelectItem>
                    <SelectItem value="moderate">Moderate - Behavioral insights</SelectItem>
                    <SelectItem value="deep">Deep - Psychological patterns</SelectItem>
                    <SelectItem value="profound">Profound - Unconscious dynamics</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Advanced Flow Builder */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Flow Builder</h3>
            <QuestioningFlowBuilder
              flow={config.questioningFlow}
              onSave={(flow) => setConfig(prev => ({ ...prev, questioningFlow: flow }))}
              onTest={(flow) => {
                console.log('Testing questioning flow:', flow)
                alert('Flow testing will be implemented in the chat interface!')
              }}
            />
          </div>

          {/* Question Examples */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Question Examples</h3>
            <div className="space-y-4">
              {Object.entries(config.questionExamples).map(([type, examples]) => (
                <div key={type}>
                  <Label className="capitalize">{type.replace(/([A-Z])/g, ' $1')} Questions</Label>
                  <div className="mt-2 space-y-2">
                    {examples.map((example, index) => (
                      <div key={index} className="flex gap-2">
                        <Textarea
                          value={example}
                          onChange={(e) => {
                            const newExamples = [...examples]
                            newExamples[index] = e.target.value
                            setConfig(prev => ({
                              ...prev,
                              questionExamples: {
                                ...prev.questionExamples,
                                [type]: newExamples
                              }
                            }))
                          }}
                          className="flex-1"
                          rows={2}
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const newExamples = examples.filter((_, i) => i !== index)
                            setConfig(prev => ({
                              ...prev,
                              questionExamples: {
                                ...prev.questionExamples,
                                [type]: newExamples
                              }
                            }))
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setConfig(prev => ({
                          ...prev,
                          questionExamples: {
                            ...prev.questionExamples,
                            [type]: [...examples, '']
                          }
                        }))
                      }}
                      className="flex items-center gap-1"
                    >
                      <Plus className="h-3 w-3" />
                      Add Example
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Reference Files Tab */}
        <TabsContent value="files" className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Reference Files & Links</h3>
            <p className="text-sm text-gray-600">
              Upload documents and add reference links for the AI to use during assessments
            </p>
            <ReferenceManager
              files={config.referenceFiles}
              links={config.referenceLinks}
              onFilesChange={(files) => setConfig(prev => ({ ...prev, referenceFiles: files }))}
              onLinksChange={(links) => setConfig(prev => ({ ...prev, referenceLinks: links }))}
            />
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
