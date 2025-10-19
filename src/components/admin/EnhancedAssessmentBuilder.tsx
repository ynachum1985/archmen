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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

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
  description: string // User-facing description (shown to users)
  category: string
  assessmentPrompt: string // AI instructions (what the LLM sees)

  // Status Management
  status?: 'draft' | 'live' | 'archived'
  is_active?: boolean

  // Level Configuration
  assessment_level: number // 1, 2, or 3

  // AI Settings
  minQuestions: number
  maxQuestions: number

  // Completion Criteria (Option 2: Hybrid)
  minArchetypes?: number  // Minimum archetypes to discover
  minConfidence?: number  // Minimum confidence threshold (0-100)

  // Live Assessment LLM Configuration
  liveProvider?: LLMProvider
  liveModel?: string

  // Report Generation (AI chooses archetypes freely)
  reportGeneration: string
}

interface EnhancedAssessmentBuilderProps {
  assessment?: EnhancedAssessmentConfig
  onSave: (config: EnhancedAssessmentConfig) => void
  onTest?: (config: EnhancedAssessmentConfig) => void
  onAssessmentChange?: (config: EnhancedAssessmentConfig) => void
  onSaveComplete?: () => void // Called after successful save
  hideKnowledgeBase?: boolean // Hide Knowledge Base section when in tabbed dialog
  hideNextStep?: boolean // Hide Next Step section when in tabbed dialog
}

const defaultConfig: EnhancedAssessmentConfig = {
  id: undefined, // Will be set when assessment is saved
  name: '',
  description: '', // User-facing description
  category: '',
  assessmentPrompt: `You are an expert archetypal analyst with deep knowledge of human psychology and behavioral patterns. Your role is to identify archetypal patterns through natural conversation.

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

  // Status Management
  status: 'draft',
  is_active: false,

  // Level Configuration
  assessment_level: 1,

  // AI Settings (Level 1 defaults - will be overridden based on assessment_level)
  minQuestions: 8,
  maxQuestions: 12,

  // Completion Criteria (Level 1 defaults)
  minArchetypes: 2,
  minConfidence: 70,

  // Live Assessment LLM Configuration
  liveProvider: 'openrouter',
  liveModel: 'anthropic/claude-3.5-sonnet',

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
  onAssessmentChange,
  onSaveComplete,
  hideKnowledgeBase = false,
  hideNextStep = false
}: EnhancedAssessmentBuilderProps) {
  // Merge assessment with defaults to ensure all required fields exist
  const [config, setConfig] = useState<EnhancedAssessmentConfig>(() => {
    if (!assessment) return defaultConfig

    return {
      ...defaultConfig,
      ...assessment,
      // Ensure critical fields have defaults
      assessment_level: assessment.assessment_level || defaultConfig.assessment_level,
      liveProvider: assessment.liveProvider || defaultConfig.liveProvider,
      liveModel: assessment.liveModel || defaultConfig.liveModel
    }
  })

  // Track if component has mounted to prevent auto-save on initial load
  const [hasMounted, setHasMounted] = useState(false)
  const autoSaveTimeoutRef = useState<NodeJS.Timeout | null>(null)
  const [personalities, setPersonalities] = useState<AIPersonality[]>([])
  const [isLoadingPersonalities, setIsLoadingPersonalities] = useState(true)
  const [showTestingChat, setShowTestingChat] = useState(false)

  const [isProcessingContent, setIsProcessingContent] = useState(false)
  const [textContents, setTextContents] = useState<string[]>([''])

  // Auto-update completion criteria when assessment level changes
  useEffect(() => {
    const levelCriteria = {
      1: { minQuestions: 8, maxQuestions: 12, minArchetypes: 2, minConfidence: 70 },
      2: { minQuestions: 10, maxQuestions: 15, minArchetypes: 4, minConfidence: 80 },
      3: { minQuestions: 12, maxQuestions: 18, minArchetypes: 6, minConfidence: 85 }
    }

    const criteria = levelCriteria[config.assessment_level as 1 | 2 | 3]
    if (criteria) {
      setConfig(prev => ({
        ...prev,
        minQuestions: criteria.minQuestions,
        maxQuestions: criteria.maxQuestions,
        minArchetypes: criteria.minArchetypes,
        minConfidence: criteria.minConfidence
      }))
    }
  }, [config.assessment_level])

  // Load embedding settings when assessment is loaded
  useEffect(() => {
    const loadEmbeddingSettings = async () => {
      if (!config.id) return

      try {
        const response = await fetch(`/api/get-embedding-settings?assessmentId=${config.id}`)
        if (response.ok) {
          const data = await response.json()
          if (data.settings) {
            setChunkSize(data.settings.chunk_size || 400)
            setChunkOverlap(data.settings.chunk_overlap || 80)
            setEmbeddingModel(data.settings.embedding_model || 'openrouter/text-embedding-3-small')
            setMaxContextTokens(data.settings.context_window || 4000)

            // Load additional settings from JSONB settings field
            if (data.settings.settings) {
              setTopK(data.settings.settings.topK || 10)
              setSimilarityThreshold(data.settings.settings.similarityThreshold || 0.7)
              setEnableMetadataFiltering(data.settings.settings.enableMetadataFiltering || false)
            }
          }
        }
      } catch (error) {
        console.error('Error loading embedding settings:', error)
      }
    }

    loadEmbeddingSettings()
  }, [config.id])
  const [referenceUrls, setReferenceUrls] = useState<string[]>([''])
  const [uploadedFiles, setUploadedFiles] = useState<File[][]>([[]])

  // Embedding settings state - OPTIMIZED VALUES (see EMBEDDING_CONFIGURATION_ANALYSIS.md)
  const [chunkSize, setChunkSize] = useState(400)  // Optimal: 300-500 tokens
  const [chunkOverlap, setChunkOverlap] = useState(80)  // 20% overlap (industry standard)
  const [embeddingModel, setEmbeddingModel] = useState('openrouter/text-embedding-3-small')  // Best performance/cost via OpenRouter
  const [topK, setTopK] = useState(10)  // Industry standard: 5-10 results
  const [similarityThreshold, setSimilarityThreshold] = useState(0.7)  // 70% minimum relevance
  const [maxContextTokens, setMaxContextTokens] = useState(4000)  // Max tokens to send to LLM
  const [enableMetadataFiltering, setEnableMetadataFiltering] = useState(false)  // Filter by category/tags

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
  const [liveProvider, setLiveProvider] = useState<LLMProvider>('openrouter')
  const [liveModel, setLiveModel] = useState<string>('anthropic/claude-3.5-sonnet')
  const [isSyncingModels, setIsSyncingModels] = useState(false)
  const [syncedOpenRouterModels, setSyncedOpenRouterModels] = useState<string[]>([])

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

  // Mark component as mounted after initial render
  useEffect(() => {
    setHasMounted(true)

    // Cleanup timeout on unmount
    return () => {
      if (autoSaveTimeoutRef[0]) {
        clearTimeout(autoSaveTimeoutRef[0])
      }
    }
  }, [])

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
    setLiveProvider(config.liveProvider || 'openrouter')
    setLiveModel(config.liveModel || 'anthropic/claude-3.5-sonnet')
  }, [config.liveProvider, config.liveModel])

  // Load synced OpenRouter models from database on mount
  useEffect(() => {
    const loadSyncedModels = async () => {
      try {
        const response = await fetch('/api/get-synced-models')
        if (response.ok) {
          const data = await response.json()
          if (data.models && Array.isArray(data.models)) {
            const modelIds = data.models.map((m: any) => m.id)
            setSyncedOpenRouterModels(modelIds)
          }
        }
      } catch (error) {
        console.error('Error loading synced models:', error)
        // Silently fail - will use hardcoded models as fallback
      }
    }
    loadSyncedModels()
  }, [])

  // Helper function to update config and notify parent
  const updateConfig = (updater: (prev: EnhancedAssessmentConfig) => EnhancedAssessmentConfig) => {
    setConfig(prev => {
      const newConfig = updater(prev)
      // Notify parent component of changes
      if (onAssessmentChange) {
        onAssessmentChange(newConfig)
      }
      // Auto-save as draft when changes are made (but not on initial mount)
      if (hasMounted) {
        // Debounce auto-save to prevent too many requests
        if (autoSaveTimeoutRef[0]) {
          clearTimeout(autoSaveTimeoutRef[0])
        }
        autoSaveTimeoutRef[0] = setTimeout(() => {
          handleAutoSave(newConfig)
        }, 1000) // Wait 1 second after last change
      }
      return newConfig
    })
  }

  // Save state
  const [isSaving, setIsSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')

  // Comprehensive save function (saves assessment + embedding settings)
  const handleSave = async (configToSave: EnhancedAssessmentConfig, showFeedback = false) => {
    try {
      if (showFeedback) {
        setIsSaving(true)
        setSaveStatus('saving')
      }

      // Don't save if there's no name yet
      if (!configToSave.name || configToSave.name.trim() === '') {
        if (showFeedback) {
          setSaveStatus('error')
          setTimeout(() => setSaveStatus('idle'), 2000)
        }
        return
      }

      const assessmentToSave = {
        ...configToSave,
        status: configToSave.status || 'draft',
        is_active: configToSave.is_active ?? false
      }

      // Save assessment
      const response = await fetch('/api/sync-assessments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          assessment: {
            id: assessmentToSave.id,
            name: assessmentToSave.name,
            description: assessmentToSave.description,
            category: assessmentToSave.category,
            assessmentPrompt: assessmentToSave.assessmentPrompt,
            minQuestions: assessmentToSave.minQuestions,
            maxQuestions: assessmentToSave.maxQuestions,
            minArchetypes: assessmentToSave.minArchetypes,
            minConfidence: assessmentToSave.minConfidence,
            reportGeneration: assessmentToSave.reportGeneration,
            assessment_level: assessmentToSave.assessment_level,
            status: assessmentToSave.status,
            is_active: assessmentToSave.is_active,
            liveProvider: assessmentToSave.liveProvider,
            liveModel: assessmentToSave.liveModel
          }
        }),
      })

      if (response.ok) {
        const result = await response.json()
        let assessmentId = configToSave.id

        if (result.assessment && result.assessment.id) {
          assessmentId = result.assessment.id
          // Update config with ID from database
          setConfig(prev => ({
            ...prev,
            id: result.assessment.id
          }))
        }

        // Save embedding settings if we have an assessment ID
        if (assessmentId) {
          await saveEmbeddingSettings(assessmentId)
        }

        if (showFeedback) {
          setSaveStatus('saved')
          setTimeout(() => setSaveStatus('idle'), 2000)
        }
      } else {
        const errorData = await response.json()
        console.error('Save failed:', errorData)
        if (showFeedback) {
          setSaveStatus('error')
          setTimeout(() => setSaveStatus('idle'), 2000)
        }
      }
    } catch (error) {
      console.error('Save failed:', error)
      if (showFeedback) {
        setSaveStatus('error')
        setTimeout(() => setSaveStatus('idle'), 2000)
      }
    } finally {
      if (showFeedback) {
        setIsSaving(false)
      }
    }
  }

  // Save embedding settings to database
  const saveEmbeddingSettings = async (assessmentId: string | number) => {
    try {
      const response = await fetch('/api/save-embedding-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          assessmentId,
          settings: {
            chunkSize,
            chunkOverlap,
            embeddingModel,
            topK,
            similarityThreshold,
            maxContextTokens,
            enableMetadataFiltering
          }
        }),
      })

      if (!response.ok) {
        console.error('Failed to save embedding settings')
      }
    } catch (error) {
      console.error('Error saving embedding settings:', error)
    }
  }

  // Auto-save function (saves as draft without user interaction)
  const handleAutoSave = async (configToSave: EnhancedAssessmentConfig) => {
    // Only auto-save if we have an ID (existing assessment)
    // Don't auto-save new assessments to prevent duplicates
    if (!configToSave.id) {
      return
    }
    await handleSave(configToSave, false)
  }

  // Sync OpenRouter models
  const handleSyncOpenRouterModels = async () => {
    setIsSyncingModels(true)
    try {
      const response = await fetch('/api/sync-openrouter-models', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      if (!response.ok) {
        throw new Error('Failed to sync models')
      }

      const data = await response.json()

      // Extract model IDs from the synced models
      if (data.models && Array.isArray(data.models)) {
        const modelIds = data.models.map((m: any) => m.id)
        setSyncedOpenRouterModels(modelIds)
      }

      alert(`✅ Successfully synced ${data.modelCount} models from OpenRouter!\n\nLatest models including new releases are now available.`)
    } catch (error) {
      console.error('Error syncing OpenRouter models:', error)
      alert(`❌ Failed to sync OpenRouter models: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsSyncingModels(false)
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
      {/* Header with Save Button */}
      <div className="flex items-center justify-between bg-white p-4 rounded-lg border border-gray-200 sticky top-0 z-10 shadow-sm">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            {config.id ? 'Edit Assessment' : 'Create Assessment'}
          </h2>
          <p className="text-sm text-gray-500">
            {config.name || 'Untitled Assessment'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {saveStatus === 'saved' && (
            <span className="text-sm text-green-600 flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Saved
            </span>
          )}
          {saveStatus === 'error' && (
            <span className="text-sm text-red-600">Save failed</span>
          )}
          <Button
            onClick={async () => {
              await handleSave(config, true)
              onSave(config)
              if (onSaveComplete) {
                onSaveComplete()
              }
            }}
            disabled={!config.name.trim() || isSaving}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isSaving ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
                Save Assessment
              </>
            )}
          </Button>
        </div>
      </div>

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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="description">Assessment Description</Label>
                <p className="text-xs text-gray-500 mb-1">User-facing description (shown to users)</p>
                <Textarea
                  id="description"
                  value={config.description}
                  onChange={(e) => updateConfig(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="resize-y overflow-auto max-h-32"
                  placeholder="The primary assessment that appears on the homepage for new users"
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
            </div>

            <div>
              <Label htmlFor="assessmentPrompt">Assessment Prompt</Label>
              <p className="text-xs text-gray-500 mb-1">AI instructions (what the LLM sees)</p>
              <Textarea
                id="assessmentPrompt"
                value={config.assessmentPrompt}
                onChange={(e) => setConfig(prev => ({ ...prev, assessmentPrompt: e.target.value }))}
                rows={6}
                placeholder="You are an expert archetypal analyst... Ask open-ended questions... Analyze language patterns..."
                className="resize-y overflow-auto max-h-64"
              />
            </div>
          </div>



            {/* Question Settings - Simplified */}
            <TooltipProvider delayDuration={300} skipDelayDuration={100}>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Question Settings</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <div className="flex items-center gap-1 mb-1">
                      <Label htmlFor="minQuestions" className="text-xs">Min Questions</Label>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-3 w-3 text-gray-400 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-xs">
                          <p className="text-xs">Minimum number of questions required before assessment can complete. Ensures sufficient data for accurate archetype detection.</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <Input
                      id="minQuestions"
                      type="number"
                      min="3"
                      max="20"
                      defaultValue={config.minQuestions}
                      onBlur={(e) => {
                        const value = parseInt(e.target.value) || 8
                        setConfig(prev => ({ ...prev, minQuestions: value }))
                      }}
                      className="h-8 text-sm"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-1 mb-1">
                      <Label htmlFor="maxQuestions" className="text-xs">Max Questions</Label>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-3 w-3 text-gray-400 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-xs">
                          <p className="text-xs">Maximum number of questions allowed. Assessment will automatically complete when this limit is reached, even if archetype criteria aren't met.</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <Input
                      id="maxQuestions"
                      type="number"
                      min="5"
                      max="30"
                      defaultValue={config.maxQuestions}
                      onBlur={(e) => {
                        const value = parseInt(e.target.value) || 15
                        setConfig(prev => ({ ...prev, maxQuestions: value }))
                      }}
                      className="h-8 text-sm"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-1 mb-1">
                      <Label htmlFor="minArchetypes" className="text-xs">Min Archetypes</Label>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-3 w-3 text-gray-400 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-xs">
                          <p className="text-xs">Minimum number of archetypes that must be discovered at the specified confidence level before assessment can complete. Higher values provide more comprehensive results.</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <Input
                      id="minArchetypes"
                      type="number"
                      min="1"
                      max="10"
                      defaultValue={config.minArchetypes || 2}
                      onBlur={(e) => {
                        const value = parseInt(e.target.value) || 2
                        setConfig(prev => ({ ...prev, minArchetypes: value }))
                      }}
                      className="h-8 text-sm"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-1 mb-1">
                      <Label htmlFor="minConfidence" className="text-xs">Min Confidence (%)</Label>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-3 w-3 text-gray-400 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-xs">
                          <p className="text-xs">Minimum confidence threshold (30-100%) required for archetype detection. Higher values ensure more accurate results but may require more questions. Recommended: 70% for Level 1, 80% for Level 2, 85% for Level 3.</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <Input
                      id="minConfidence"
                      type="number"
                      min="30"
                      max="100"
                      step="5"
                      defaultValue={config.minConfidence || 70}
                      onBlur={(e) => {
                        const value = parseInt(e.target.value) || 70
                        setConfig(prev => ({ ...prev, minConfidence: value }))
                      }}
                      className="h-8 text-sm"
                    />
                  </div>
                </div>
              </div>
            </TooltipProvider>

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
                  <div className="flex items-center gap-2">
                    <Select value={liveModel} onValueChange={setLiveModel}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Select model" />
                      </SelectTrigger>
                      <SelectContent className="animate-none">
                        {liveProvider && (
                          <>
                            {/* Show synced OpenRouter models if available */}
                            {liveProvider === 'openrouter' && syncedOpenRouterModels.length > 0 ? (
                              <>
                                <div className="px-2 py-1.5 text-xs font-semibold text-gray-600 bg-gray-50">
                                  Latest Models ({syncedOpenRouterModels.length})
                                </div>
                                {syncedOpenRouterModels.map((model) => (
                                  <SelectItem key={model} value={model}>
                                    {model}
                                  </SelectItem>
                                ))}
                              </>
                            ) : (
                              /* Fall back to hardcoded models */
                              Object.keys(LLM_PROVIDERS[liveProvider as keyof typeof LLM_PROVIDERS].models).map((model) => (
                                <SelectItem key={model} value={model}>
                                  {model}
                                </SelectItem>
                              ))
                            )}
                          </>
                        )}
                      </SelectContent>
                    </Select>
                    {liveProvider === 'openrouter' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleSyncOpenRouterModels}
                        disabled={isSyncingModels}
                        className="h-9"
                        title="Sync latest OpenRouter models"
                      >
                        <Sparkles className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
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


            </div>

            {/* Knowledge Base Section - Always Available */}
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
                  <TooltipProvider delayDuration={300} skipDelayDuration={100}>
                    <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                      <h4 className="text-sm font-medium text-gray-900">Embedding Settings</h4>

                      {/* Row 1: Core Settings */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="min-w-0">
                          <div className="flex items-center gap-1 mb-1">
                            <Label htmlFor="chunkSize" className="text-xs">Chunk Size</Label>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="h-3 w-3 text-gray-400 cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent className="max-w-xs">
                                <p className="text-xs">How much text per chunk (in tokens). 400 = ~300 words. Optimal: 300-500 for balanced context.</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                          <Input
                            id="chunkSize"
                            type="number"
                            defaultValue={chunkSize}
                            onBlur={(e) => setChunkSize(parseInt(e.target.value) || 400)}
                            className="h-8 text-xs w-full"
                          />
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-1 mb-1">
                            <Label htmlFor="chunkOverlap" className="text-xs">Chunk Overlap</Label>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="h-3 w-3 text-gray-400 cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent className="max-w-xs">
                                <p className="text-xs">Overlap between chunks (in tokens). 80 = 20% overlap. Prevents losing context at boundaries.</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                          <Input
                            id="chunkOverlap"
                            type="number"
                            defaultValue={chunkOverlap}
                            onBlur={(e) => setChunkOverlap(parseInt(e.target.value) || 80)}
                            className="h-8 text-xs w-full"
                          />
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-1 mb-1">
                            <Label htmlFor="embeddingModel" className="text-xs">Embedding Model</Label>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="h-3 w-3 text-gray-400 cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent className="max-w-xs">
                                <p className="text-xs">AI model for converting text to vectors. text-embedding-3-small = best cost/performance.</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                          <Select value={embeddingModel} onValueChange={setEmbeddingModel}>
                            <SelectTrigger className="h-8 text-xs w-full">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="max-w-[280px]">
                              <SelectItem value="openrouter/text-embedding-3-small">OpenRouter: text-embedding-3-small</SelectItem>
                              <SelectItem value="text-embedding-3-small">OpenAI Direct: text-embedding-3-small</SelectItem>
                              <SelectItem value="mistral-embed">Mistral: mistral-embed</SelectItem>
                              <SelectItem value="voyage-large-2">Voyage: voyage-large-2</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-1 mb-1">
                            <Label htmlFor="topK" className="text-xs">Top K Results</Label>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="h-3 w-3 text-gray-400 cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent className="max-w-xs">
                                <p className="text-xs">How many relevant chunks to retrieve. 10 = industry standard. Higher = more context but slower.</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                          <Input
                            id="topK"
                            type="number"
                            defaultValue={topK}
                            onBlur={(e) => setTopK(parseInt(e.target.value) || 10)}
                            className="h-8 text-xs w-full"
                          />
                        </div>
                      </div>

                      {/* Row 2: Advanced Settings */}
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-2 border-t border-gray-200">
                        <div>
                          <div className="flex items-center gap-1 mb-1">
                            <Label htmlFor="similarityThreshold" className="text-xs">Similarity Threshold</Label>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="h-3 w-3 text-gray-400 cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent className="max-w-xs">
                                <p className="text-xs">Minimum relevance score (0-1). 0.7 = 70% match required. Filters out irrelevant results.</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                          <Input
                            id="similarityThreshold"
                            type="number"
                            step="0.05"
                            min="0"
                            max="1"
                            defaultValue={similarityThreshold}
                            onBlur={(e) => setSimilarityThreshold(parseFloat(e.target.value) || 0.7)}
                            className="h-8 text-xs"
                          />
                        </div>

                        <div>
                          <div className="flex items-center gap-1 mb-1">
                            <Label htmlFor="maxContextTokens" className="text-xs">Max Context Tokens</Label>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="h-3 w-3 text-gray-400 cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent className="max-w-xs">
                                <p className="text-xs">Maximum tokens to send to LLM. 4000 = balanced. Higher = more context but slower/costlier.</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                          <Input
                            id="maxContextTokens"
                            type="number"
                            step="1000"
                            min="1000"
                            max="16000"
                            defaultValue={maxContextTokens}
                            onBlur={(e) => setMaxContextTokens(parseInt(e.target.value) || 4000)}
                            className="h-8 text-xs"
                          />
                        </div>

                        <div className="flex items-center gap-2">
                          <input
                            id="enableMetadataFiltering"
                            type="checkbox"
                            checked={enableMetadataFiltering}
                            onChange={(e) => setEnableMetadataFiltering(e.target.checked)}
                            className="h-4 w-4 rounded border-gray-300"
                          />
                          <div className="flex items-center gap-1">
                            <Label htmlFor="enableMetadataFiltering" className="text-xs cursor-pointer">Metadata Filtering</Label>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="h-3 w-3 text-gray-400 cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent className="max-w-xs">
                                <p className="text-xs">Filter results by category, tags, or archetype. Improves precision for specific queries.</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TooltipProvider>

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
