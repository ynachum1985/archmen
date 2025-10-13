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
  Minus,
  Upload,
  Search,
  Zap,
  DollarSign,
  Clock,
  BarChart3,
  TestTube,
  Sparkles,
  Info
} from 'lucide-react'

import { AIPersonality, aiPersonalityService } from '@/lib/services/ai-personality.service'
import { LLM_PROVIDERS, type LLMProvider, type LLMConfig, multiLLMService } from '@/lib/services/multi-llm.service'

import { ArchetypeContentBuilder } from './ArchetypeContentBuilder'
import { AssessmentTestingChat } from './AssessmentTestingChat'
import { EmbeddingSettingsDialog } from './EmbeddingSettingsDialog'
import { AssessmentContentDisplay } from './AssessmentContentDisplay'
import { AssessmentGatewayBuilder } from './AssessmentGatewayBuilderSimple'
import Link from 'next/link'

interface EnhancedAssessmentConfig {
  id?: string | number // Add id property for database identification
  name: string
  description: string
  category: string
  purpose: string
  assessmentPrompt: string // Dedicated prompt field for LLM instructions
  expectedDuration: number

  // Status Management
  status?: 'draft' | 'live' | 'archived'
  is_active?: boolean

  // Level and Gateway Configuration
  assessment_level: number // 1, 2, or 3
  gateway_configuration: Record<string, any>
  has_custom_gateways: boolean
  general_gateways_enabled: boolean

  // Quiz Configuration
  quiz_set_questions_prompt?: string
  quiz_experience_analysis_prompt?: string
  quiz_enabled?: boolean
  quiz_passing_score?: number
  quiz_max_attempts?: number

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



  // Live Assessment LLM Configuration
  liveProvider?: LLMProvider
  liveModel?: string

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
  onAssessmentChange?: (config: EnhancedAssessmentConfig) => void
  onNext?: () => void // Navigate to Knowledge Base tab
  hideKnowledgeBase?: boolean // Hide Knowledge Base section when in tabbed dialog
}

const defaultConfig: EnhancedAssessmentConfig = {
  id: undefined, // Will be set when assessment is saved
  name: '',
  description: '',
  category: '',
  purpose: '',
  assessmentPrompt: '',
  expectedDuration: 15,

  // Status Management
  status: 'draft',
  is_active: false,

  // Level and Gateway Configuration
  assessment_level: 1,
  gateway_configuration: {},
  has_custom_gateways: false,
  general_gateways_enabled: true,

  // Quiz Configuration
  quiz_enabled: true,
  quiz_passing_score: 70,
  quiz_max_attempts: 3,

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



  // Live Assessment LLM Configuration
  liveProvider: 'openai',
  liveModel: 'gpt-4-turbo-preview',

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
  onAssessmentChange,
  onNext,
  hideKnowledgeBase = false
}: EnhancedAssessmentBuilderProps) {
  // Merge assessment with defaults to ensure all required fields exist
  const [config, setConfig] = useState<EnhancedAssessmentConfig>(() => {
    if (!assessment) return defaultConfig

    return {
      ...defaultConfig,
      ...assessment,
      // Ensure critical fields have defaults
      assessment_level: assessment.assessment_level || defaultConfig.assessment_level,
      gateway_configuration: assessment.gateway_configuration || defaultConfig.gateway_configuration,
      has_custom_gateways: assessment.has_custom_gateways ?? defaultConfig.has_custom_gateways,
      general_gateways_enabled: assessment.general_gateways_enabled ?? defaultConfig.general_gateways_enabled,
      quiz_enabled: assessment.quiz_enabled ?? defaultConfig.quiz_enabled,
      quiz_passing_score: assessment.quiz_passing_score || defaultConfig.quiz_passing_score,
      quiz_max_attempts: assessment.quiz_max_attempts || defaultConfig.quiz_max_attempts,
      liveProvider: assessment.liveProvider || defaultConfig.liveProvider,
      liveModel: assessment.liveModel || defaultConfig.liveModel
    }
  })
  const [personalities, setPersonalities] = useState<AIPersonality[]>([])
  const [isLoadingPersonalities, setIsLoadingPersonalities] = useState(true)
  const [showTestingChat, setShowTestingChat] = useState(false)

  const [isProcessingContent, setIsProcessingContent] = useState(false)
  const [textContents, setTextContents] = useState<string[]>([''])
  const [referenceUrls, setReferenceUrls] = useState<string[]>([''])
  const [uploadedFiles, setUploadedFiles] = useState<File[][]>([[]])

  // Embedding settings state - OPTIMIZED VALUES (see EMBEDDING_CONFIGURATION_ANALYSIS.md)
  const [chunkSize, setChunkSize] = useState(400)  // Optimal: 300-500 tokens
  const [chunkOverlap, setChunkOverlap] = useState(80)  // 20% overlap (industry standard)
  const [embeddingModel, setEmbeddingModel] = useState('text-embedding-3-small')  // Best performance/cost
  const [topK, setTopK] = useState(10)
  const [similarityThreshold, setSimilarityThreshold] = useState(0.7)

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

  // Live Assessment LLM Configuration states
  const [liveProvider, setLiveProvider] = useState<LLMProvider>('openai')
  const [liveModel, setLiveModel] = useState<string>('gpt-4-turbo-preview')

  // Chat Testing state
  const [chatMessages, setChatMessages] = useState<Array<{role: 'user' | 'assistant', content: string, timestamp: Date}>>([])
  const [currentInput, setCurrentInput] = useState('')
  const [isChatLoading, setIsChatLoading] = useState(false)
  const [isApiActivated, setIsApiActivated] = useState(false)
  const [chatSession, setChatSession] = useState<{questionCount: number, responses: string[]}>({questionCount: 0, responses: []})

  // Embedding Testing state
  const [testQuery, setTestQuery] = useState('')
  const [isTestingEmbedding, setIsTestingEmbedding] = useState(false)
  const [embeddingTestResults, setEmbeddingTestResults] = useState<Array<{content: string, similarity: number}> | null>(null)


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

  // Initialize chat when provider/model changes and API is activated
  useEffect(() => {
    if (selectedProvider && selectedModel && assessment && isApiActivated) {
      initializeChat()
    }
  }, [selectedProvider, selectedModel, assessment, isApiActivated])

  // Sync live provider and model with config
  useEffect(() => {
    setLiveProvider(config.liveProvider || 'openai')
    setLiveModel(config.liveModel || 'gpt-4-turbo-preview')
  }, [config.liveProvider, config.liveModel])

  // Helper function to update config and notify parent
  const updateConfig = (updater: (prev: EnhancedAssessmentConfig) => EnhancedAssessmentConfig) => {
    setConfig(prev => {
      const newConfig = updater(prev)
      // Notify parent component of changes (for Knowledge Base and Gateways tabs)
      if (onAssessmentChange) {
        onAssessmentChange(newConfig)
      }
      // Auto-save as draft when changes are made
      handleAutoSave(newConfig)
      return newConfig
    })
  }

  // Auto-save function (saves as draft without user interaction)
  const handleAutoSave = async (configToSave: EnhancedAssessmentConfig) => {
    try {
      const assessmentToSave = {
        ...configToSave,
        status: 'draft', // Always save as draft during building
        is_active: false
      }

      const response = await fetch('/api/sync-assessments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(assessmentToSave),
      })

      if (response.ok) {
        const result = await response.json()
        if (result.assessment && result.assessment.id) {
          // Update config with ID from database
          setConfig(prev => ({
            ...prev,
            id: result.assessment.id
          }))
        }
      }
    } catch (error) {
      console.error('Auto-save failed:', error)
      // Don't show error to user for auto-save failures
    }
  }

  // Update config when live provider/model changes
  useEffect(() => {
    updateConfig(prev => ({
      ...prev,
      liveProvider,
      liveModel
    }))
  }, [liveProvider, liveModel])

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

    if (!isApiActivated) {
      console.log('API not activated, skipping chat message')
      return
    }

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
          content: config.assessmentPrompt || config.systemPrompt || 'You are an AI assessment assistant.'
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
          assessmentId: config.id || config.name,
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

    if (!isApiActivated) {
      alert('Please activate the API first to prevent accidental token usage.')
      return
    }

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
        credentials: 'include', // Include cookies for authentication
        body: JSON.stringify({
          assessmentId: config.id || config.name,
          assessmentName: config.name,
          textContent: allTextContent,
          referenceUrl: allReferenceUrls[0] || '',
          referenceUrls: allReferenceUrls,
          category: config.category,
          settings: {
            chunkSize,
            chunkOverlap,
            embeddingModel,
            topK,
            similarityThreshold
          }
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







  const handleSave = async () => {
    // Ensure assessment is saved as draft initially so it appears in user dashboard
    const assessmentToSave = {
      ...config,
      status: config.status || 'draft',
      is_active: config.status === 'live' || config.is_active === true
    }

    // Save to parent component
    onSave(assessmentToSave)

    // Also sync to database
    try {
      const response = await fetch('/api/sync-assessments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          assessment: {
            name: assessmentToSave.name,
            description: assessmentToSave.description,
            category: assessmentToSave.category,
            purpose: assessmentToSave.purpose,
            systemPrompt: assessmentToSave.systemPrompt,
            assessmentPrompt: assessmentToSave.assessmentPrompt,
            minQuestions: assessmentToSave.minQuestions,
            maxQuestions: assessmentToSave.maxQuestions,
            evidenceThreshold: assessmentToSave.evidenceThreshold,
            adaptationSensitivity: assessmentToSave.adaptationSensitivity,
            expectedDuration: assessmentToSave.expectedDuration,
            questionExamples: assessmentToSave.questionExamples,
            responseRequirements: assessmentToSave.responseRequirements,
            adaptiveLogic: assessmentToSave.cycleSettings,
            cycleSettings: assessmentToSave.cycleSettings,
            selectedPersonalityId: assessmentToSave.selectedPersonalityId,
            reportGeneration: assessmentToSave.reportGeneration,
            assessment_level: assessmentToSave.assessment_level,
            status: assessmentToSave.status,
            is_active: assessmentToSave.is_active
          }
        })
      })

      const result = await response.json()
      if (result.success) {
        console.log(`Assessment ${result.action} successfully in database`)
        // Update config with any returned data (like ID for new assessments)
        if (result.assessment) {
          setConfig(prev => ({
            ...prev,
            id: result.assessment.id,
            ...result.assessment
          }))
        }
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

      const systemPrompt = config.assessmentPrompt || config.systemPrompt || `You are conducting the "${config.name}" assessment. Be empathetic and ask thoughtful follow-up questions.`

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

        const systemPrompt = config.assessmentPrompt || config.systemPrompt || `You are conducting the "${config.name}" assessment. Be empathetic and ask thoughtful follow-up questions.`

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
      openrouter: 'bg-indigo-100 text-indigo-800',
      openai: 'bg-green-100 text-green-800',
      anthropic: 'bg-orange-100 text-orange-800',
      kimi: 'bg-blue-100 text-blue-800',
      groq: 'bg-yellow-100 text-yellow-800',
      perplexity: 'bg-teal-100 text-teal-800',
      together: 'bg-pink-100 text-pink-800',
      local: 'bg-purple-100 text-purple-800'
    }
    return colors[provider] || 'bg-gray-100 text-gray-800'
  }

  const handleTest = () => {
    setShowTestingChat(true)
  }

  // Handle embedding test
  const handleTestEmbedding = async () => {
    if (!testQuery.trim()) return

    setIsTestingEmbedding(true)
    setEmbeddingTestResults(null)

    try {
      const response = await fetch('/api/test-embedding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: testQuery,
          assessmentId: config.id || config.name
        })
      })

      if (response.ok) {
        const data = await response.json()
        setEmbeddingTestResults(data.results || [])
      } else {
        console.error('Error testing embedding:', response.statusText)
        alert('Error testing embedding. Please check the console for details.')
      }
    } catch (error) {
      console.error('Error testing embedding:', error)
      alert('Error testing embedding. Please check the console for details.')
    } finally {
      setIsTestingEmbedding(false)
    }
  }





  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Assessment Builder Content - No more nested tabs */}
      <div className="space-y-6">
          {/* Assessment Configuration - Moved to Top */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="assessmentTitle">Assessment Title</Label>
              <Input
                id="assessmentTitle"
                value={config.name}
                onChange={(e) => updateConfig(prev => ({ ...prev, name: e.target.value, category: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="description">Assessment Description</Label>
                <Textarea
                  id="description"
                  value={config.description}
                  onChange={(e) => updateConfig(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="resize-y overflow-auto max-h-32"
                />
              </div>
              <div>
                <Label htmlFor="purpose">Assessment Purpose</Label>
                <Textarea
                  id="purpose"
                  value={config.purpose}
                  onChange={(e) => setConfig(prev => ({ ...prev, purpose: e.target.value }))}
                  rows={3}
                  className="resize-y overflow-auto max-h-32"
                />
              </div>
              <div>
                <Label htmlFor="assessmentLevel">Assessment Level</Label>
                <Select
                  value={(config.assessment_level || 1).toString()}
                  onValueChange={(value) => updateConfig(prev => ({ ...prev, assessment_level: parseInt(value) }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-blue-100 text-blue-800">Level 1</Badge>
                        <span>Foundation</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="2">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-purple-100 text-purple-800">Level 2</Badge>
                        <span>Integration</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="3">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-red-100 text-red-800">Level 3</Badge>
                        <span>Mastery</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500 mt-1">
                  {config.assessment_level === 1 && "Basic relationship patterns and archetypal discovery"}
                  {config.assessment_level === 2 && "Shadow work and emotional integration (requires maturity 6+)"}
                  {config.assessment_level === 3 && "Advanced concepts like polyamory and patriarchy (requires maturity 8+)"}
                </p>
              </div>
              <div>
                <Label htmlFor="assessmentPrompt">Assessment Prompt</Label>
                <Textarea
                  id="assessmentPrompt"
                  value={config.assessmentPrompt}
                  onChange={(e) => setConfig(prev => ({ ...prev, assessmentPrompt: e.target.value }))}
                  rows={4}
                  placeholder="Enter the specific prompt instructions for the LLM conducting this assessment..."
                  className="resize-y overflow-auto max-h-48"
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



            {/* Live Assessment LLM Configuration */}
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Live Assessment LLM Configuration</Label>
                <p className="text-xs text-gray-600 mt-1">
                  Choose the provider and model that will be used for live assessments with users
                </p>
              </div>

              <div className="flex items-center gap-4">
                <div className="space-y-1">
                  <Label className="text-xs">LLM Provider</Label>
                  <Select value={liveProvider} onValueChange={setLiveProvider}>
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
                  <Select value={liveModel} onValueChange={setLiveModel}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Select model" />
                    </SelectTrigger>
                    <SelectContent className="animate-none">
                      {liveProvider && Object.keys(LLM_PROVIDERS[liveProvider as keyof typeof LLM_PROVIDERS].models).map((model) => (
                        <SelectItem key={model} value={model}>
                          {model}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {liveProvider && liveModel && (
                  <div className="text-xs text-gray-500">
                    {(() => {
                      const provider = LLM_PROVIDERS[liveProvider as keyof typeof LLM_PROVIDERS]
                      const model = provider?.models[liveModel as keyof typeof provider.models]
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

              {liveProvider && liveModel && (
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-700">
                    <strong>Live Configuration:</strong> Users will experience assessments using {LLM_PROVIDERS[liveProvider].name} - {liveModel}
                  </p>
                </div>
              )}
            </div>

            {/* Knowledge Base Section */}
            {config.name && !hideKnowledgeBase && (
              <div className="border-t pt-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium">Knowledge Base</h3>
                    <p className="text-sm text-gray-600">Add content that the AI can reference when conducting this assessment</p>
                  </div>

                  {/* File Upload Section */}
                  <div className="space-y-3">
                    {uploadedFiles.map((fileGroup, groupIndex) => (
                      <div key={groupIndex} className="flex items-start gap-2">
                        <div className="flex-1">
                          <input
                            type="file"
                            multiple
                            onChange={(e) => {
                              const files = Array.from(e.target.files || [])
                              const updatedFiles = [...uploadedFiles]
                              updatedFiles[groupIndex] = files
                              setUploadedFiles(updatedFiles)
                            }}
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                          />
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const updatedFiles = uploadedFiles.filter((_, i) => i !== groupIndex)
                            setUploadedFiles(updatedFiles.length === 0 ? [[]] : updatedFiles)
                          }}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setUploadedFiles([...uploadedFiles, []])}
                      className="text-gray-600 hover:text-gray-800"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add File Upload
                    </Button>
                  </div>

                  {/* Text Content Section */}
                  <div className="space-y-3">
                    {textContents.map((content, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <Textarea
                          value={content}
                          onChange={(e) => {
                            const updatedContents = [...textContents]
                            updatedContents[index] = e.target.value
                            setTextContents(updatedContents)
                          }}
                          placeholder={`Enter content about ${config.name}...`}
                          rows={4}
                          className="resize-y border-gray-200 text-sm flex-1 overflow-auto max-h-48"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const updatedContents = textContents.filter((_, i) => i !== index)
                            setTextContents(updatedContents.length === 0 ? [''] : updatedContents)
                          }}
                          className="text-gray-400 hover:text-gray-600 mt-1"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setTextContents([...textContents, ''])}
                      className="text-gray-600 hover:text-gray-800"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Text Content
                    </Button>
                  </div>

                  {/* Reference URLs Section */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Reference URLs</Label>
                    {referenceUrls.map((url, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Input
                          value={url}
                          onChange={(e) => {
                            const updatedUrls = [...referenceUrls]
                            updatedUrls[index] = e.target.value
                            setReferenceUrls(updatedUrls)
                          }}
                          placeholder="https://example.com/article-about-assessment"
                          className="flex-1"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const updatedUrls = referenceUrls.filter((_, i) => i !== index)
                            setReferenceUrls(updatedUrls.length === 0 ? [''] : updatedUrls)
                          }}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setReferenceUrls([...referenceUrls, ''])}
                      className="text-gray-600 hover:text-gray-800"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Reference URL
                    </Button>
                  </div>

                  {/* Embedding Settings */}
                  <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                    <h4 className="text-sm font-medium text-gray-900">Embedding Settings</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <Label htmlFor="chunkSize" className="text-xs">Chunk Size</Label>
                        <Input
                          id="chunkSize"
                          type="number"
                          value={chunkSize}
                          onChange={(e) => setChunkSize(parseInt(e.target.value) || 1000)}
                          className="mt-1 h-8 text-xs"
                        />
                      </div>
                      <div>
                        <Label htmlFor="chunkOverlap" className="text-xs">Chunk Overlap</Label>
                        <Input
                          id="chunkOverlap"
                          type="number"
                          value={chunkOverlap}
                          onChange={(e) => setChunkOverlap(parseInt(e.target.value) || 200)}
                          className="mt-1 h-8 text-xs"
                        />
                      </div>
                      <div>
                        <Label htmlFor="embeddingModel" className="text-xs">Embedding Model</Label>
                        <Select value={embeddingModel} onValueChange={setEmbeddingModel}>
                          <SelectTrigger className="mt-1 h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="text-embedding-3-small">OpenAI: text-embedding-3-small (1536d)</SelectItem>
                            <SelectItem value="mistral-embed">Mistral: mistral-embed (1024d) - Best cost/accuracy</SelectItem>
                            <SelectItem value="voyage-large-2">Voyage: voyage-large-2 (1536d)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="topK" className="text-xs">Top K Results</Label>
                        <Input
                          id="topK"
                          type="number"
                          value={topK}
                          onChange={(e) => setTopK(parseInt(e.target.value) || 10)}
                          className="mt-1 h-8 text-xs"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <Label htmlFor="similarityThreshold" className="text-xs">Similarity Threshold</Label>
                        <Input
                          id="similarityThreshold"
                          type="number"
                          step="0.1"
                          min="0"
                          max="1"
                          value={similarityThreshold}
                          onChange={(e) => setSimilarityThreshold(parseFloat(e.target.value) || 0.7)}
                          className="mt-1 h-8 text-xs w-32"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Process Content Button */}
                  <div className="flex justify-between items-center">
                    <Button
                      onClick={handleProcessContent}
                      disabled={isProcessingContent}
                      className="bg-emerald-500 hover:bg-emerald-600"
                    >
                      {isProcessingContent ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Processing...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 mr-2" />
                          Process & Embed Content
                        </>
                      )}
                    </Button>

                    {/* Test Embedding Quality */}
                    <div className="flex items-center gap-2">
                      <Input
                        value={testQuery}
                        onChange={(e) => setTestQuery(e.target.value)}
                        placeholder="Ask something about this assessment..."
                        className="w-64"
                      />
                      <Button
                        onClick={handleTestEmbedding}
                        disabled={isTestingEmbedding || !testQuery.trim()}
                        variant="outline"
                        size="sm"
                      >
                        {isTestingEmbedding ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                        ) : (
                          <>
                            <Search className="h-4 w-4 mr-1" />
                            Test
                          </>
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Test Results */}
                  {embeddingTestResults && (
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="text-sm font-medium text-blue-900 mb-2">Embedding Test Results</h4>
                      {embeddingTestResults.length > 0 ? (
                        <div className="space-y-2">
                          {embeddingTestResults.map((result, index) => (
                            <div key={index} className="bg-white p-3 rounded border">
                              <div className="flex justify-between items-start mb-1">
                                <span className="text-xs text-blue-600 font-medium">
                                  Similarity: {(result.similarity * 100).toFixed(1)}%
                                </span>
                              </div>
                              <p className="text-sm text-gray-700">{result.content}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-blue-700">No relevant content found. Try adjusting your query or adding more content.</p>
                      )}
                    </div>
                  )}

                  {/* Existing Content Display */}
                  <div className="mt-6">
                    <AssessmentContentDisplay
                      assessmentId={config.id?.toString() || config.name}
                      assessmentName={config.name}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Next Step Navigation */}
            <div className="border-t pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium">Next Step</h3>
                  <p className="text-sm text-gray-600">
                    Your assessment is automatically saved as a draft. Continue to add knowledge base content.
                  </p>
                </div>

                <Button
                  onClick={() => {
                    // Ensure final save before moving to next step
                    handleAutoSave(config)
                    if (onNext) {
                      onNext()
                    }
                  }}
                  disabled={!config.name.trim()}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8"
                >
                  Next: Knowledge Base →
                </Button>
              </div>
            </div>

        {/* End of Assessment Builder Content */}
      </div>

      {/* Testing Chat Modal */}
      {showTestingChat && (
        <AssessmentTestingChat
          config={config}
          onClose={() => setShowTestingChat(false)}
        />
      )}



    </div>
  )
}
