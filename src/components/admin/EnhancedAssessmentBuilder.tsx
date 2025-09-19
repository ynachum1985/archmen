'use client'

import { useState, useEffect } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'

import {
  Save,
  Eye,
  Plus,
  Zap,
  DollarSign,
  Clock,
  BarChart3,
  TestTube,
  Sparkles
} from 'lucide-react'
import { CategoryService, type AssessmentCategory } from '@/lib/services/category.service'
import { AIPersonality, aiPersonalityService } from '@/lib/services/ai-personality.service'
import { LLM_PROVIDERS, type LLMProvider, type LLMConfig, multiLLMService } from '@/lib/services/multi-llm.service'

import { ArchetypeContentBuilder } from './ArchetypeContentBuilder'
import { AssessmentTestingChat } from './AssessmentTestingChat'
import { EmbeddingSettingsDialog } from './EmbeddingSettingsDialog'
import { AssessmentContentDisplay } from './AssessmentContentDisplay'
import Link from 'next/link'

interface EnhancedAssessmentConfig {
  id?: string | number // Add id property for database identification
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
  id: undefined, // Will be set when assessment is saved
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
  const [isProcessingContent, setIsProcessingContent] = useState(false)
  const [textContents, setTextContents] = useState<string[]>([''])
  const [referenceUrls, setReferenceUrls] = useState<string[]>([''])
  const [uploadedFiles, setUploadedFiles] = useState<File[][]>([[]])

  // LLM Testing states
  const [selectedProvider, setSelectedProvider] = useState<LLMProvider>('openai')
  const [selectedModel, setSelectedModel] = useState<string>('gpt-4-turbo-preview')
  const [testTemperature, setTestTemperature] = useState<number>(0.7)
  const [testMaxTokens, setTestMaxTokens] = useState<number>(2000)
  const [testPrompt, setTestPrompt] = useState<string>('')
  const [testResults, setTestResults] = useState<any[]>([])
  const [isTestingLLM, setIsTestingLLM] = useState<boolean>(false)
  const [availableProviders, setAvailableProviders] = useState<LLMProvider[]>([])
  const [showLLMComparison, setShowLLMComparison] = useState<boolean>(false)

  // Chat Testing state
  const [chatMessages, setChatMessages] = useState<Array<{role: 'user' | 'assistant', content: string, timestamp: Date}>>([])
  const [currentInput, setCurrentInput] = useState('')
  const [isChatLoading, setIsChatLoading] = useState(false)
  const [chatSession, setChatSession] = useState<{questionCount: number, responses: string[]}>({questionCount: 0, responses: []})
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

      // Initialize LLM testing - get providers from server
      try {
        const response = await fetch('/api/llm-providers')
        if (response.ok) {
          const data = await response.json()
          setAvailableProviders(data.providers)

          if (data.providers.length > 0 && !selectedProvider) {
            setSelectedProvider(data.providers[0])
          }
        } else {
          console.error('Failed to fetch LLM providers')
          // Fallback to local only
          setAvailableProviders(['local'])
          setSelectedProvider('local')
        }
      } catch (error) {
        console.error('Error fetching LLM providers:', error)
        // Fallback to local only
        setAvailableProviders(['local'])
        setSelectedProvider('local')
      }
    }
    initialize()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Set default test prompt based on assessment
  useEffect(() => {
    if (config.name && !testPrompt) {
      setTestPrompt(`You are conducting the "${config.name}" assessment. A user responds: "I often find myself in situations where I feel overwhelmed by my partner's emotions, but I don't know how to help them without losing myself in the process."

Please provide a thoughtful response that:
1. Acknowledges their experience
2. Asks a follow-up question to understand their relationship patterns
3. Maintains the assessment's focus on ${config.category || 'relationship dynamics'}
4. Uses an empathetic but professional tone

Keep the response under 150 words and end with a specific question.`)
    }
  }, [config.name, config.category, testPrompt])

  // Initialize chat when provider/model changes
  useEffect(() => {
    if (selectedProvider && selectedModel && assessment) {
      initializeChat()
    }
  }, [selectedProvider, selectedModel, assessment])

  // Initialize chat session
  const initializeChat = async () => {
    if (!assessment || !selectedProvider || !selectedModel) return

    setChatMessages([])
    setChatSession({questionCount: 0, responses: []})

    // Send initial assessment question
    setIsChatLoading(true)
    try {
      const response = await sendChatMessage('', true) // true for initial message
      if (response) {
        setChatMessages([{
          role: 'assistant',
          content: response,
          timestamp: new Date()
        }])
      }
    } catch (error) {
      console.error('Failed to initialize chat:', error)
    } finally {
      setIsChatLoading(false)
    }
  }

  // Send chat message
  const sendChatMessage = async (userMessage: string, isInitial = false) => {
    if (!selectedProvider || !selectedModel || (!userMessage.trim() && !isInitial)) return

    setIsChatLoading(true)

    try {
      // Add user message to chat if not initial
      if (!isInitial && userMessage.trim()) {
        setChatMessages(prev => [...prev, {
          role: 'user',
          content: userMessage.trim(),
          timestamp: new Date()
        }])

        // Update session
        setChatSession(prev => ({
          questionCount: prev.questionCount + 1,
          responses: [...prev.responses, userMessage.trim()]
        }))
      }

      // Prepare messages for API
      const messages = [
        {
          role: 'system' as const,
          content: config.combinedPrompt || config.systemPrompt || 'You are an AI assessment assistant.'
        },
        ...chatMessages.map(msg => ({
          role: msg.role,
          content: msg.content
        })),
        ...(userMessage.trim() ? [{
          role: 'user' as const,
          content: userMessage.trim()
        }] : [])
      ]

      // Call the enhanced chat API with selected provider
      const response = await fetch('/api/enhanced-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages,
          assessmentId: assessment.id,
          provider: selectedProvider,
          model: selectedModel,
          temperature: testTemperature,
          maxTokens: testMaxTokens
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get response')
      }

      const data = await response.json()

      // Add AI response to chat
      setChatMessages(prev => [...prev, {
        role: 'assistant',
        content: data.content,
        timestamp: new Date()
      }])

      return data.content
    } catch (error) {
      console.error('Chat error:', error)
      setChatMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      }])
    } finally {
      setIsChatLoading(false)
    }
  }

  // Handle send message
  const handleSendMessage = async () => {
    if (!currentInput.trim() || isChatLoading) return

    const message = currentInput.trim()
    setCurrentInput('')
    await sendChatMessage(message)
  }

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  // Handle process content
  const handleProcessContent = async () => {
    const allTextContent = textContents.filter(text => text.trim()).join('\n\n')
    const allReferenceUrls = referenceUrls.filter(url => url.trim())

    if (!config.name || (!allTextContent && allReferenceUrls.length === 0)) return

    setIsProcessingContent(true)
    try {
      const response = await fetch('/api/process-assessment-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          assessmentId: config.id || config.name,
          assessmentName: config.name,
          textContent: allTextContent,
          referenceUrl: allReferenceUrls[0] || '',
          referenceUrls: allReferenceUrls,
          category: config.category
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to process content')
      }

      const result = await response.json()
      console.log('Content processed successfully:', result)

      // Clear the inputs after successful processing
      setTextContents([''])
      setReferenceUrls([''])
      setUploadedFiles([[]])

      // Show success message
      alert('Content processed and embedded successfully!')

    } catch (error) {
      console.error('Error processing content:', error)
      alert('Failed to process content. Please try again.')
    } finally {
      setIsProcessingContent(false)
    }
  }

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

  const handleSave = async () => {
    // Save to parent component
    onSave(config)

    // Also sync to database
    try {
      const response = await fetch('/api/sync-assessments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          assessment: {
            name: config.name,
            description: config.description,
            category: config.category,
            purpose: config.purpose,
            systemPrompt: config.systemPrompt,
            combinedPrompt: config.combinedPrompt,
            minQuestions: config.minQuestions,
            maxQuestions: config.maxQuestions,
            evidenceThreshold: config.evidenceThreshold,
            adaptationSensitivity: config.adaptationSensitivity,
            expectedDuration: config.expectedDuration,
            questionExamples: config.questionExamples,
            responseRequirements: config.responseRequirements,
            adaptiveLogic: config.cycleSettings,
            cycleSettings: config.cycleSettings,
            selectedPersonalityId: config.selectedPersonalityId,
            reportGeneration: config.reportGeneration
          }
        })
      })

      const result = await response.json()
      if (result.success) {
        console.log(`Assessment ${result.action} successfully in database`)
      } else {
        console.error('Failed to sync assessment to database:', result.error)
      }
    } catch (error) {
      console.error('Error syncing assessment to database:', error)
    }
  }

  // LLM Testing Functions
  const runSingleLLMTest = async () => {
    if (!selectedProvider || !selectedModel || !testPrompt.trim()) return

    setIsTestingLLM(true)
    try {
      const service = multiLLMService.getInstance()
      const startTime = Date.now()

      const llmConfig: LLMConfig = {
        provider: selectedProvider,
        model: selectedModel,
        temperature: testTemperature,
        maxTokens: testMaxTokens
      }

      const systemPrompt = config.combinedPrompt || config.systemPrompt || `You are conducting the "${config.name}" assessment. Be empathetic and ask thoughtful follow-up questions.`

      const result = await service.generateChatCompletion([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: testPrompt }
      ], llmConfig)

      const responseTime = Date.now() - startTime

      const testResult = {
        provider: selectedProvider,
        model: selectedModel,
        response: result.content,
        cost: result.cost,
        responseTime,
        usage: result.usage,
        timestamp: new Date().toISOString()
      }

      setTestResults(prev => [testResult, ...prev])
    } catch (error) {
      console.error('LLM test failed:', error)
      alert(`Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsTestingLLM(false)
    }
  }

  const runLLMComparison = async () => {
    setIsTestingLLM(true)
    const results: any[] = []

    // Test configurations for comparison
    const testConfigs = [
      { provider: 'openai' as LLMProvider, model: 'gpt-4-turbo-preview' },
      { provider: 'openai' as LLMProvider, model: 'gpt-3.5-turbo' },
      { provider: 'anthropic' as LLMProvider, model: 'claude-3-5-sonnet-20241022' },
      { provider: 'kimi' as LLMProvider, model: 'moonshot-v1-8k' },
      { provider: 'groq' as LLMProvider, model: 'llama-3.1-8b-instant' },
      { provider: 'perplexity' as LLMProvider, model: 'llama-3.1-8b-instruct' },
      { provider: 'together' as LLMProvider, model: 'meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo' }
    ]

    for (const testConfig of testConfigs) {
      if (!availableProviders.includes(testConfig.provider)) continue

      try {
        const service = multiLLMService.getInstance()
        const startTime = Date.now()

        const llmConfig: LLMConfig = {
          ...testConfig,
          temperature: testTemperature,
          maxTokens: testMaxTokens
        }

        const systemPrompt = config.combinedPrompt || config.systemPrompt || `You are conducting the "${config.name}" assessment. Be empathetic and ask thoughtful follow-up questions.`

        const result = await service.generateChatCompletion([
          { role: 'system', content: systemPrompt },
          { role: 'user', content: testPrompt }
        ], llmConfig)

        const responseTime = Date.now() - startTime

        results.push({
          provider: testConfig.provider,
          model: testConfig.model,
          response: result.content,
          cost: result.cost,
          responseTime,
          usage: result.usage,
          timestamp: new Date().toISOString()
        })

        // Small delay between requests
        await new Promise(resolve => setTimeout(resolve, 500))
      } catch (error) {
        console.error(`Test failed for ${testConfig.provider}/${testConfig.model}:`, error)
      }
    }

    setTestResults(prev => [...results, ...prev])
    setIsTestingLLM(false)
  }

  const clearTestResults = () => {
    setTestResults([])
  }

  const getProviderColor = (provider: LLMProvider) => {
    const colors = {
      openai: 'bg-green-100 text-green-800',
      anthropic: 'bg-orange-100 text-orange-800',
      kimi: 'bg-blue-100 text-blue-800',
      local: 'bg-purple-100 text-purple-800'
    }
    return colors[provider]
  }

  const handleTest = () => {
    setShowTestingChat(true)
  }



  // Update combined prompt when relevant fields change
  useEffect(() => {
    const combinedPrompt = [
      config.description && `ASSESSMENT DESCRIPTION: ${config.description}`,
      config.purpose && `ASSESSMENT PURPOSE: ${config.purpose}`
    ].filter(Boolean).join('\n\n')

    setConfig(prev => ({ ...prev, combinedPrompt }))
  }, [config.description, config.purpose])

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
          {/* Assessment Configuration - Moved to Top */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="assessmentTitle">Assessment Title</Label>
              <Input
                id="assessmentTitle"
                value={config.name}
                onChange={(e) => setConfig(prev => ({ ...prev, name: e.target.value, category: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="description">Assessment Description</Label>
                <Textarea
                  id="description"
                  value={config.description}
                  onChange={(e) => setConfig(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="purpose">Assessment Purpose</Label>
                <Textarea
                  id="purpose"
                  value={config.purpose}
                  onChange={(e) => setConfig(prev => ({ ...prev, purpose: e.target.value }))}
                  rows={3}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="duration">Duration (min)</Label>
              <Input
                id="duration"
                type="number"
                value={config.expectedDuration}
                onChange={(e) => setConfig(prev => ({ ...prev, expectedDuration: parseInt(e.target.value) || 15 }))}
                className="w-32"
              />
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





            {/* AI Personality Selection */}
            <div>
              <Label className="text-sm font-medium">AI Personality</Label>
              <Select
                value={config.selectedPersonalityId || 'default'}
                onValueChange={(value) => setConfig(prev => ({ ...prev, selectedPersonalityId: value === 'default' ? undefined : value }))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose AI personality" />
                </SelectTrigger>
                <SelectContent className="animate-none">
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

            {config.name && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium">Knowledge Base</h4>
                  <EmbeddingSettingsDialog
                    trigger={
                      <Button variant="outline" size="sm">
                        <span className="text-lg">✨</span>
                        Settings
                      </Button>
                    }
                    title={`Embedding Settings for ${config.name}`}
                    description={`Configure how ${config.name} content is processed and embedded for AI reference`}
                    itemId={config.name}
                    itemType="assessment"
                    onSave={async (settings) => {
                      console.log('Assessment embedding settings saved:', settings)
                      // Save to Supabase
                      try {
                        const supabase = await import('@/lib/supabase/client').then(m => m.createClient())
                        const { error } = await supabase
                          .from('assessment_embedding_settings')
                          .upsert({
                            assessment_id: config.id || config.name,
                            settings: settings,
                            updated_at: new Date().toISOString()
                          })
                        if (error) {
                          console.error('Error saving embedding settings:', error)
                        } else {
                          console.log('Embedding settings saved to Supabase')
                        }
                      } catch (error) {
                        console.error('Error saving embedding settings:', error)
                      }
                    }}
                  />
                </div>

                <div className="space-y-3">
                  {/* Upload Documents */}
                  <div>
                    <Label className="text-sm">Upload Documents</Label>
                    {uploadedFiles.map((files, index) => (
                      <div key={index} className="mt-1 flex items-start gap-2">
                        <div className="flex-1">
                          <Input
                            type="file"
                            multiple
                            accept=".pdf,.txt,.doc,.docx"
                            onChange={(e) => {
                              const newFiles = Array.from(e.target.files || [])
                              if (newFiles.length > 0) {
                                const updatedFiles = [...uploadedFiles]
                                updatedFiles[index] = newFiles
                                setUploadedFiles(updatedFiles)
                                console.log('Files selected:', newFiles)
                              }
                            }}
                            className="file:mr-4 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100"
                          />
                          {files.length > 0 && (
                            <div className="text-xs text-gray-600 mt-1">
                              {files.map(file => file.name).join(', ')}
                            </div>
                          )}
                        </div>
                        {uploadedFiles.length > 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-xs text-red-600 hover:text-red-800"
                            onClick={() => {
                              const updatedFiles = uploadedFiles.filter((_, i) => i !== index)
                              setUploadedFiles(updatedFiles.length === 0 ? [[]] : updatedFiles)
                            }}
                          >
                            −
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-1 h-6 px-2 text-xs"
                      onClick={() => setUploadedFiles([...uploadedFiles, []])}
                    >
                      +
                    </Button>
                  </div>

                  {/* Add Text Content */}
                  <div>
                    <Label className="text-sm">Add Text Content</Label>
                    {textContents.map((content, index) => (
                      <div key={index} className="mt-1 flex items-start gap-2">
                        <Textarea
                          value={content}
                          onChange={(e) => {
                            const updatedContents = [...textContents]
                            updatedContents[index] = e.target.value
                            setTextContents(updatedContents)
                          }}
                          placeholder={content ? "" : "Paste content here..."}
                          rows={6}
                          className="flex-1"
                        />
                        {textContents.length > 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-xs text-red-600 hover:text-red-800 mt-1"
                            onClick={() => {
                              const updatedContents = textContents.filter((_, i) => i !== index)
                              setTextContents(updatedContents.length === 0 ? [''] : updatedContents)
                            }}
                          >
                            −
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-1 h-6 px-2 text-xs"
                      onClick={() => setTextContents([...textContents, ''])}
                    >
                      +
                    </Button>
                  </div>

                  {/* Reference Links */}
                  <div>
                    <Label className="text-sm">Reference Links</Label>
                    {referenceUrls.map((url, index) => (
                      <div key={index} className="mt-1 flex items-center gap-2">
                        <Input
                          value={url}
                          onChange={(e) => {
                            const updatedUrls = [...referenceUrls]
                            updatedUrls[index] = e.target.value
                            setReferenceUrls(updatedUrls)
                          }}
                          placeholder={url ? "" : "https://example.com/reference"}
                          className="flex-1"
                        />
                        {referenceUrls.length > 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-xs text-red-600 hover:text-red-800"
                            onClick={() => {
                              const updatedUrls = referenceUrls.filter((_, i) => i !== index)
                              setReferenceUrls(updatedUrls.length === 0 ? [''] : updatedUrls)
                            }}
                          >
                            −
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-1 h-6 px-2 text-xs"
                      onClick={() => setReferenceUrls([...referenceUrls, ''])}
                    >
                      +
                    </Button>
                  </div>

                  <Button
                    onClick={handleProcessContent}
                    disabled={isProcessingContent || (textContents.every(t => !t.trim()) && referenceUrls.every(u => !u.trim()) && uploadedFiles.every(files => files.length === 0))}
                    className="w-full"
                  >
                    {isProcessingContent ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <span className="mr-2">🧠</span>
                        Process & Embed Content
                      </>
                    )}
                  </Button>
                </div>

                <AssessmentContentDisplay
                  assessmentId={config.id || config.name}
                  assessmentName={config.name}
                />
              </div>
            )}
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
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Assessment Testing</CardTitle>
                    <CardDescription>
                      Test this assessment with different LLM providers - experience it as a user would
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="space-y-1">
                      <Label className="text-xs">LLM Provider</Label>
                      <Select value={selectedProvider} onValueChange={setSelectedProvider}>
                        <SelectTrigger className="w-40">
                          <SelectValue placeholder="Select provider" />
                        </SelectTrigger>
                        <SelectContent className="animate-none">
                          {availableProviders.map((provider) => (
                            <SelectItem key={provider} value={provider}>
                              {LLM_PROVIDERS[provider as keyof typeof LLM_PROVIDERS].name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs">Model</Label>
                      <Select value={selectedModel} onValueChange={setSelectedModel}>
                        <SelectTrigger className="w-48">
                          <SelectValue placeholder="Select model" />
                        </SelectTrigger>
                        <SelectContent className="animate-none">
                          {selectedProvider && Object.keys(LLM_PROVIDERS[selectedProvider as keyof typeof LLM_PROVIDERS].models).map((model) => (
                            <SelectItem key={model} value={model}>
                              {model}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {selectedProvider && selectedModel && (
                      <div className="text-xs text-gray-500">
                        {(() => {
                          const provider = LLM_PROVIDERS[selectedProvider as keyof typeof LLM_PROVIDERS]
                          const model = provider?.models[selectedModel as keyof typeof provider.models]
                          if (model && 'inputCost' in model && 'outputCost' in model) {
                            return (
                              <>
                                <div>Cost: ${model.inputCost}/1K in</div>
                                <div>${model.outputCost}/1K out</div>
                              </>
                            )
                          } else if (model && 'inputCost' in model) {
                            return <div>Cost: ${model.inputCost}/1K tokens</div>
                          } else {
                            return <div>Free (Local)</div>
                          }
                        })()}
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Chat Interface */}
                  <div className="h-96 border rounded-lg p-4 bg-white overflow-y-auto">
                    {chatMessages.length === 0 ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                          <p className="text-gray-500 mb-2">
                            {!selectedProvider || !selectedModel
                              ? 'Select an LLM provider and model to start testing'
                              : 'Chat will initialize when you select a provider and model'
                            }
                          </p>
                          {selectedProvider && selectedModel && (
                            <p className="text-sm text-blue-600">
                              Using {LLM_PROVIDERS[selectedProvider].name} - {selectedModel}
                            </p>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {chatMessages.map((message, index) => (
                          <div
                            key={index}
                            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-[80%] rounded-lg p-3 ${
                                message.role === 'user'
                                  ? 'bg-blue-500 text-white'
                                  : 'bg-gray-100 text-gray-900'
                              }`}
                            >
                              <p className="whitespace-pre-wrap">{message.content}</p>
                              <p className="text-xs mt-1 opacity-70">
                                {message.timestamp.toLocaleTimeString()}
                              </p>
                            </div>
                          </div>
                        ))}
                        {isChatLoading && (
                          <div className="flex justify-start">
                            <div className="bg-gray-100 rounded-lg p-3">
                              <div className="flex items-center space-x-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                                <span className="text-sm text-gray-600">AI is thinking...</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Input Area */}
                  <div className="flex gap-2">
                    <Input
                      value={currentInput}
                      onChange={(e) => setCurrentInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type your response to the assessment question..."
                      className="flex-1"
                      disabled={!selectedProvider || !selectedModel || isChatLoading}
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!selectedProvider || !selectedModel || !currentInput.trim() || isChatLoading}
                    >
                      {isChatLoading ? 'Sending...' : 'Send'}
                    </Button>
                  </div>

                  {/* Status and Info */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4">
                      {selectedProvider && selectedModel && (
                        <div className="text-gray-600">
                          <span className="font-medium">Provider:</span> {LLM_PROVIDERS[selectedProvider].name} - {selectedModel}
                        </div>
                      )}
                      {chatSession.questionCount > 0 && (
                        <div className="text-gray-600">
                          <span className="font-medium">Questions:</span> {chatSession.questionCount}
                        </div>
                      )}
                    </div>

                    {chatMessages.length > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={initializeChat}
                        disabled={isChatLoading}
                      >
                        Reset Chat
                      </Button>
                    )}
                  </div>

                  {!selectedProvider || !selectedModel ? (
                    <p className="text-sm text-amber-600 bg-amber-50 p-2 rounded">
                      Please select an LLM provider and model to start testing the assessment
                    </p>
                  ) : null}
                </div>
              </CardContent>
            </Card>

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
                <SelectContent className="bg-white border border-gray-200 shadow-lg z-50 animate-none">
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
