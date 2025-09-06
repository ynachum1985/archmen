'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { 
  Save, 
  Eye, 
  Upload, 
  Plus, 
  X, 
  FileText, 
  Download,
  Trash2,
  Settings,
  Brain,
  MessageCircle,

} from 'lucide-react'
import { CategoryService, type AssessmentCategory } from '@/lib/services/category.service'
import { FileUploadService, type UploadedFile } from '@/lib/services/file-upload.service'

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
  const [uploadingFile, setUploadingFile] = useState(false)
  
  const categoryService = new CategoryService()
  const fileUploadService = new FileUploadService()

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
      await fileUploadService.ensureBucketExists()
    } catch (error) {
      console.error('Error initializing file storage:', error)
    }
  }

  const handleCreateCategory = async () => {
    try {
      const category = await categoryService.createCategory({
        ...newCategory,
        is_active: true
      })
      setCategories(prev => [...prev, category])
      setNewCategory({ name: '', description: '', color: 'blue', icon: 'Folder' })
      setShowNewCategoryDialog(false)
    } catch (error) {
      console.error('Error creating category:', error)
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    setUploadingFile(true)
    try {
      const uploadPromises = Array.from(files).map(file => {
        if (!fileUploadService.isValidFileType(file)) {
          throw new Error(`Invalid file type: ${file.name}`)
        }
        if (!fileUploadService.isValidFileSize(file)) {
          throw new Error(`File too large: ${file.name}`)
        }
        return fileUploadService.uploadFile(file)
      })

      const uploadedFiles = await Promise.all(uploadPromises)
      setConfig(prev => ({
        ...prev,
        referenceFiles: [...prev.referenceFiles, ...uploadedFiles]
      }))
    } catch (error) {
      console.error('Error uploading files:', error)
      alert('Error uploading files. Please try again.')
    } finally {
      setUploadingFile(false)
      // Reset file input
      event.target.value = ''
    }
  }

  const handleRemoveFile = async (fileId: string) => {
    try {
      await fileUploadService.deleteFile(fileId)
      setConfig(prev => ({
        ...prev,
        referenceFiles: prev.referenceFiles.filter(file => file.id !== fileId)
      }))
    } catch (error) {
      console.error('Error removing file:', error)
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
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Enhanced Assessment Builder</h1>
          <p className="text-gray-600 mt-1">Create AI-powered archetype assessments with advanced questioning strategies</p>
        </div>
        <div className="flex gap-3">
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
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="ai-config">AI Configuration</TabsTrigger>
          <TabsTrigger value="questioning">Questioning Strategy</TabsTrigger>
          <TabsTrigger value="files">Reference Files</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
                  onValueChange={(value) => setConfig(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoadingCategories ? (
                      <SelectItem value="loading" disabled>Loading categories...</SelectItem>
                    ) : (
                      categories.map(category => (
                        <SelectItem key={category.id} value={category.name}>
                          {category.name}
                        </SelectItem>
                      ))
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
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Configuration Tab */}
        <TabsContent value="ai-config" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                AI System Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="questioningStrategy">Questioning Strategy</Label>
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
                  <Label htmlFor="questioningDepth">Questioning Depth</Label>
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
            </CardContent>
          </Card>
        </TabsContent>

        {/* Questioning Strategy Tab */}
        <TabsContent value="questioning" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Questioning Strategy & Examples
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Response Requirements */}
              <div>
                <h3 className="text-lg font-medium mb-4">Response Requirements</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="minSentences">Minimum Sentences</Label>
                    <Input
                      id="minSentences"
                      type="number"
                      value={config.responseRequirements.minSentences}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        responseRequirements: {
                          ...prev.responseRequirements,
                          minSentences: parseInt(e.target.value) || 2
                        }
                      }))}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="maxSentences">Maximum Sentences</Label>
                    <Input
                      id="maxSentences"
                      type="number"
                      value={config.responseRequirements.maxSentences}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        responseRequirements: {
                          ...prev.responseRequirements,
                          maxSentences: parseInt(e.target.value) || 8
                        }
                      }))}
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>

              {/* Adaptive Logic */}
              <div>
                <h3 className="text-lg font-medium mb-4">Adaptive Logic</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="minQuestions">Min Questions</Label>
                    <Input
                      id="minQuestions"
                      type="number"
                      value={config.adaptiveLogic.minQuestions}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        adaptiveLogic: {
                          ...prev.adaptiveLogic,
                          minQuestions: parseInt(e.target.value) || 8
                        }
                      }))}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="maxQuestions">Max Questions</Label>
                    <Input
                      id="maxQuestions"
                      type="number"
                      value={config.adaptiveLogic.maxQuestions}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        adaptiveLogic: {
                          ...prev.adaptiveLogic,
                          maxQuestions: parseInt(e.target.value) || 15
                        }
                      }))}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="evidenceThreshold">Evidence Threshold</Label>
                    <Input
                      id="evidenceThreshold"
                      type="number"
                      value={config.adaptiveLogic.evidenceThreshold}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        adaptiveLogic: {
                          ...prev.adaptiveLogic,
                          evidenceThreshold: parseInt(e.target.value) || 3
                        }
                      }))}
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>

              {/* Question Examples */}
              <div>
                <h3 className="text-lg font-medium mb-4">Question Examples</h3>
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
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reference Files Tab */}
        <TabsContent value="files" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Reference Files & Documents
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="fileUpload">Upload Reference Documents</Label>
                <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600 mb-2">
                    Upload PDF, Word, Text, or Markdown files for AI reference
                  </p>
                  <p className="text-xs text-gray-500 mb-4">
                    Maximum file size: 10MB. Supported formats: PDF, DOC, DOCX, TXT, MD, JSON, CSV
                  </p>
                  <input
                    id="fileUpload"
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,.txt,.md,.json,.csv"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Button
                    onClick={() => document.getElementById('fileUpload')?.click()}
                    disabled={uploadingFile}
                    className="flex items-center gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    {uploadingFile ? 'Uploading...' : 'Choose Files'}
                  </Button>
                </div>
              </div>

              {/* Uploaded Files List */}
              {config.referenceFiles.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium mb-4">Uploaded Files</h3>
                  <div className="space-y-2">
                    {config.referenceFiles.map((file) => (
                      <div key={file.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-gray-500" />
                          <div>
                            <p className="font-medium">{file.name}</p>
                            <p className="text-sm text-gray-500">
                              {fileUploadService.formatFileSize(file.size)} • {file.type}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(file.url, '_blank')}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRemoveFile(file.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
