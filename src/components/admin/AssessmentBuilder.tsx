"use client"

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Brain, 
  Save, 
  Eye, 
  Settings, 
  Target, 
  MessageCircle, 
  Users, 
  Sparkles,
  FileText,
  CheckCircle,
  Palette,
  Filter
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface AssessmentConfig {
  name: string
  description: string
  purpose: string
  targetArchetypes: string[]
  analysisInstructions: string
  questioningStyle: string
  expectedDuration: number
  completionCriteria: string
  systemPrompt: string
  conversationFlow: string
  archetypeMapping: string
  reportGeneration: string
  // New fields for enhanced configuration
  theme: 'career' | 'relationships' | 'personal-growth' | 'leadership' | 'creativity' | 'shadow-work' | 'custom'
  difficultyLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  focusedArchetypes: string[]
  useGlobalLinguistics: boolean
  customLinguisticFocus: string
}

interface AssessmentBuilderProps {
  assessment?: AssessmentConfig
  onSave: (config: AssessmentConfig) => void
  onTest: (config: AssessmentConfig) => void
}

const navigationItems = [
  { id: 'overview', label: 'Overview', icon: Settings, description: 'Basic information and setup' },
  { id: 'theme', label: 'Theme & Focus', icon: Palette, description: 'Archetypal themes and focus areas' },
  { id: 'purpose', label: 'Purpose & Goals', icon: Target, description: 'Define assessment objectives' },
  { id: 'ai-instructions', label: 'AI Instructions', icon: Brain, description: 'Core AI behavior and analysis' },
  { id: 'conversation', label: 'Conversation Flow', icon: MessageCircle, description: 'Question style and interaction' },
  { id: 'archetypes', label: 'Archetype Selection', icon: Filter, description: 'Choose specific archetypes to focus on' },
  { id: 'analysis', label: 'Analysis Engine', icon: Sparkles, description: 'Linguistic analysis parameters' },
  { id: 'reporting', label: 'Report Generation', icon: FileText, description: 'Output format and insights' },
  { id: 'completion', label: 'Completion Criteria', icon: CheckCircle, description: 'When to end assessment' },
]

export function AssessmentBuilder({ assessment, onSave, onTest }: AssessmentBuilderProps) {
  const [config, setConfig] = useState<AssessmentConfig>(assessment || {
    name: '',
    description: '',
    purpose: '',
    targetArchetypes: [],
    analysisInstructions: '',
    questioningStyle: '',
    expectedDuration: 10,
    completionCriteria: '',
    systemPrompt: '',
    conversationFlow: '',
    archetypeMapping: '',
    reportGeneration: '',
    theme: 'personal-growth',
    difficultyLevel: 'intermediate',
    focusedArchetypes: [],
    useGlobalLinguistics: true,
    customLinguisticFocus: ''
  })

  const [activeSection, setActiveSection] = useState('overview')
  // const [newArchetype, setNewArchetype] = useState('')
  const [availableArchetypes, setAvailableArchetypes] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  // Theme configurations
  const themeConfigs = {
    'career': {
      name: 'Career & Professional Development',
      description: 'Focus on professional archetypes, leadership patterns, and career-related behaviors',
      systemPrompt: `You are an expert career assessment specialist focusing on professional archetype identification. 

FOCUS AREAS:
- Leadership styles and management approaches
- Professional communication patterns
- Career motivation and decision-making
- Workplace relationship dynamics
- Professional goal-setting and achievement patterns

RECOMMENDED ARCHETYPES: The Ruler, The Achiever, The Sage, The Creator, The Caregiver, The Hero`,
      questioningStyle: 'Focus on professional experiences, leadership situations, workplace challenges, and career aspirations',
      suggestedDuration: 15
    },
    'relationships': {
      name: 'Relationships & Social Dynamics',
      description: 'Explore interpersonal patterns, attachment styles, and relationship archetypes',
      systemPrompt: `You are an expert relationship dynamics assessor specializing in interpersonal archetype identification.

FOCUS AREAS:
- Attachment styles and relationship patterns
- Communication in intimate relationships
- Conflict resolution approaches
- Emotional expression and vulnerability
- Love languages and connection styles

RECOMMENDED ARCHETYPES: The Lover, The Caregiver, The Innocent, The Sage, The Jester, The Rebel`,
      questioningStyle: 'Ask about relationship experiences, emotional responses, communication styles, and interpersonal dynamics',
      suggestedDuration: 18
    },
    'personal-growth': {
      name: 'Personal Growth & Self-Discovery',
      description: 'Comprehensive archetypal assessment for personal development and self-awareness',
      systemPrompt: `You are an expert personal development specialist focusing on comprehensive archetype identification.

FOCUS AREAS:
- Core personality patterns and traits
- Personal values and life philosophy
- Growth mindset and learning patterns
- Self-perception and identity
- Life purpose and meaning-making

RECOMMENDED ARCHETYPES: The Seeker, The Sage, The Innocent, The Creator, The Magician, The Hero`,
      questioningStyle: 'Explore personal values, life experiences, growth challenges, and self-reflection patterns',
      suggestedDuration: 20
    },
    'leadership': {
      name: 'Leadership & Influence',
      description: 'Identify leadership archetypes and influence patterns in various contexts',
      systemPrompt: `You are an expert leadership assessment specialist focusing on influence and leadership archetype identification.

FOCUS AREAS:
- Leadership philosophy and approach
- Decision-making under pressure
- Team dynamics and influence strategies
- Vision creation and communication
- Power dynamics and authority styles

RECOMMENDED ARCHETYPES: The Ruler, The Hero, The Sage, The Magician, The Caregiver, The Rebel`,
      questioningStyle: 'Focus on leadership experiences, decision-making processes, team interactions, and influence strategies',
      suggestedDuration: 16
    },
    'creativity': {
      name: 'Creativity & Innovation',
      description: 'Explore creative archetypes and innovation patterns in thinking and expression',
      systemPrompt: `You are an expert creativity assessment specialist focusing on creative archetype identification.

FOCUS AREAS:
- Creative process and inspiration patterns
- Innovation and problem-solving approaches
- Artistic expression and aesthetic preferences
- Risk-taking in creative endeavors
- Relationship with originality and tradition

RECOMMENDED ARCHETYPES: The Creator, The Magician, The Jester, The Rebel, The Explorer, The Innocent`,
      questioningStyle: 'Explore creative processes, artistic preferences, innovation approaches, and creative challenges',
      suggestedDuration: 14
    },
    'shadow-work': {
      name: 'Shadow Work & Integration',
      description: 'Advanced assessment focusing on shadow aspects and psychological integration',
      systemPrompt: `You are an expert depth psychology specialist focusing on shadow archetype identification and integration.

FOCUS AREAS:
- Unconscious patterns and blind spots
- Rejected or denied aspects of self
- Projection and defense mechanisms
- Integration of opposite traits
- Relationship with dark or difficult emotions

RECOMMENDED ARCHETYPES: The Shadow, The Destroyer, The Rebel, The Trickster, The Wounded Healer, The Sage`,
      questioningStyle: 'Carefully explore difficult emotions, rejected aspects, unconscious patterns, and integration challenges',
      suggestedDuration: 25
    },
    'custom': {
      name: 'Custom Theme',
      description: 'Create your own custom assessment theme with specific focus areas',
      systemPrompt: 'You are an expert archetype assessment specialist. Customize your approach based on the specific focus areas defined below.',
      questioningStyle: 'Adapt your questioning style based on the custom theme requirements',
      suggestedDuration: 15
    }
  }

  // Load archetypes from database
  useEffect(() => {
    const loadArchetypes = async () => {
      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from('enhanced_archetypes')
          .select('name')
          .order('name')
        
        if (error) {
          console.error('Error loading archetypes:', error)
        } else {
          setAvailableArchetypes(data?.map(item => item.name) || [])
        }
      } catch (error) {
        console.error('Error loading archetypes:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadArchetypes()
  }, [])

  // const handleAddArchetype = () => {
  //   if (newArchetype.trim() && !config.targetArchetypes.includes(newArchetype.trim())) {
  //     setConfig(prev => ({
  //       ...prev,
  //       targetArchetypes: [...prev.targetArchetypes, newArchetype.trim()]
  //     }))
  //     setNewArchetype('')
  //   }
  // }

  // const handleRemoveArchetype = (archetype: string) => {
  //   setConfig(prev => ({
  //     ...prev,
  //     targetArchetypes: prev.targetArchetypes.filter(a => a !== archetype)
  //   }))
  // }

  const handleSave = () => {
    onSave(config)
  }

  const handleTest = () => {
    onTest(config)
  }

  const renderContent = () => {
    switch (activeSection) {
      case 'theme':
        return (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-light text-gray-900 mb-3">Theme & Focus</h2>
              <p className="text-gray-600 mb-8">Choose the archetypal theme and difficulty level for this assessment.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="bg-white border border-gray-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-medium text-gray-900">Assessment Theme</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="theme" className="text-gray-700 font-medium text-sm">Primary Focus Area</Label>
                    <Select value={config.theme} onValueChange={(value: string) => setConfig(prev => ({ ...prev, theme: value as typeof config.theme }))}>
                       <SelectTrigger className="mt-2">
                         <SelectValue placeholder="Select a theme" />
                       </SelectTrigger>
                       <SelectContent>
                         <SelectItem value="career">Career & Professional Development</SelectItem>
                         <SelectItem value="relationships">Relationships & Social Dynamics</SelectItem>
                         <SelectItem value="personal-growth">Personal Growth & Self-Discovery</SelectItem>
                         <SelectItem value="leadership">Leadership & Influence</SelectItem>
                         <SelectItem value="creativity">Creativity & Innovation</SelectItem>
                         <SelectItem value="shadow-work">Shadow Work & Integration</SelectItem>
                         <SelectItem value="custom">Custom Theme</SelectItem>
                       </SelectContent>
                     </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="difficulty" className="text-gray-700 font-medium text-sm">Complexity Level</Label>
                    <Select value={config.difficultyLevel} onValueChange={(value: string) => setConfig(prev => ({ ...prev, difficultyLevel: value as typeof config.difficultyLevel }))}>
                       <SelectTrigger className="mt-2">
                         <SelectValue placeholder="Select difficulty" />
                       </SelectTrigger>
                       <SelectContent>
                         <SelectItem value="beginner">Beginner - Surface patterns</SelectItem>
                         <SelectItem value="intermediate">Intermediate - Behavioral insights</SelectItem>
                         <SelectItem value="advanced">Advanced - Deep psychological patterns</SelectItem>
                         <SelectItem value="expert">Expert - Unconscious dynamics</SelectItem>
                       </SelectContent>
                     </Select>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border border-gray-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-medium text-gray-900">Linguistic Analysis</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="useGlobalLinguistics"
                      checked={config.useGlobalLinguistics}
                      onChange={(e) => setConfig(prev => ({ ...prev, useGlobalLinguistics: e.target.checked }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <Label htmlFor="useGlobalLinguistics" className="text-sm text-gray-700">
                      Use Global Archetype Database
                    </Label>
                  </div>
                  <p className="text-xs text-gray-500">
                    {config.useGlobalLinguistics 
                      ? "AI will analyze against all 55 archetypes and their linguistic patterns from the database." 
                      : "AI will use only the specific archetypes you select below."}
                  </p>
                  
                  {!config.useGlobalLinguistics && (
                    <div>
                      <Label htmlFor="customLinguisticFocus" className="text-gray-700 font-medium text-sm">Custom Linguistic Focus</Label>
                      <Textarea
                        id="customLinguisticFocus"
                        value={config.customLinguisticFocus}
                        onChange={(e) => setConfig(prev => ({ ...prev, customLinguisticFocus: e.target.value }))}
                        placeholder="Describe specific linguistic patterns, word choices, or communication styles to analyze..."
                        className="mt-2"
                        rows={4}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Theme Configuration Details */}
            {config.theme && themeConfigs[config.theme] && (
              <Card className="bg-blue-50 border border-blue-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-medium text-blue-900 flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    {themeConfigs[config.theme].name} Configuration
                  </CardTitle>
                  <CardDescription className="text-blue-700">
                    {themeConfigs[config.theme].description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label className="text-blue-900 font-medium text-sm">Recommended AI System Prompt</Label>
                    <Textarea
                      value={config.systemPrompt || themeConfigs[config.theme].systemPrompt}
                      onChange={(e) => setConfig(prev => ({ ...prev, systemPrompt: e.target.value }))}
                      className="mt-2 bg-white border-blue-200 focus:border-blue-500 focus:ring-blue-500"
                      rows={8}
                    />
                    <p className="text-xs text-blue-600 mt-2">
                      This prompt will be used as the AI&apos;s system instructions. You can customize it for your specific needs.
                    </p>
                  </div>

                  <div>
                    <Label className="text-blue-900 font-medium text-sm">Questioning Style</Label>
                    <Textarea
                      value={config.questioningStyle || themeConfigs[config.theme].questioningStyle}
                      onChange={(e) => setConfig(prev => ({ ...prev, questioningStyle: e.target.value }))}
                      className="mt-2 bg-white border-blue-200 focus:border-blue-500 focus:ring-blue-500"
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-blue-900 font-medium text-sm">Suggested Duration</Label>
                      <Input
                        type="number"
                        value={config.expectedDuration || themeConfigs[config.theme].suggestedDuration}
                        onChange={(e) => setConfig(prev => ({ ...prev, expectedDuration: parseInt(e.target.value) || 15 }))}
                        className="mt-2 bg-white border-blue-200 focus:border-blue-500 focus:ring-blue-500"
                      />
                      <p className="text-xs text-blue-600 mt-1">Minutes</p>
                    </div>
                    <div>
                      <Label className="text-blue-900 font-medium text-sm">Auto-populate from Theme</Label>
                      <Button 
                        onClick={() => {
                          const theme = themeConfigs[config.theme]
                          setConfig(prev => ({
                            ...prev,
                            systemPrompt: theme.systemPrompt,
                            questioningStyle: theme.questioningStyle,
                            expectedDuration: theme.suggestedDuration
                          }))
                        }}
                        variant="outline"
                        className="w-full mt-2 border-blue-200 text-blue-700 hover:bg-blue-100"
                      >
                        Use Theme Defaults
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )
      
      case 'overview':
        return (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-light text-gray-900 mb-3">Assessment Overview</h2>
              <p className="text-gray-600 mb-8">Configure the basic information and settings for your AI-driven assessment.</p>
            </div>

            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-medium text-gray-900">Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="name" className="text-gray-700 font-medium text-sm">Assessment Name</Label>
                    <Input
                      id="name"
                      value={config.name}
                      onChange={(e) => setConfig(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Leadership Archetype Discovery"
                      className="mt-2 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <Label htmlFor="duration" className="text-gray-700 font-medium text-sm">Expected Duration (minutes)</Label>
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
                  <Label htmlFor="description" className="text-gray-700 font-medium text-sm">Description</Label>
                  <Textarea
                    id="description"
                    value={config.description}
                    onChange={(e) => setConfig(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Brief description of what this assessment measures and its intended use..."
                    className="mt-2 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        )

      case 'purpose':
        return (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-light text-gray-900 mb-3">Purpose & Goals</h2>
              <p className="text-gray-600 mb-8">Define what this assessment should accomplish and its core objectives.</p>
            </div>

            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardContent className="p-8">
                <div>
                  <Label htmlFor="purpose" className="text-gray-700 font-medium text-base mb-3 block">Assessment Purpose</Label>
                  <Textarea
                    id="purpose"
                    value={config.purpose}
                    onChange={(e) => setConfig(prev => ({ ...prev, purpose: e.target.value }))}
                    placeholder="Describe in detail what this assessment is designed to discover about the user. For example:

&lsquo;This assessment is designed to identify the user&rsquo;s dominant leadership archetypes by analyzing their communication patterns, decision-making approaches, and interpersonal dynamics in professional settings. The goal is to reveal unconscious patterns that influence their leadership style, team interactions, and strategic thinking processes.&rsquo;"
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-sm leading-relaxed"
                    rows={12}
                  />
                  <p className="text-xs text-gray-500 mt-3 leading-relaxed">
                    Be specific about what psychological patterns, behaviors, or characteristics you want to uncover. 
                    This forms the foundation for all AI analysis and questioning strategies.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )

      case 'ai-instructions':
        return (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-light text-gray-900 mb-3">AI Instructions</h2>
              <p className="text-gray-600 mb-8">Configure how the AI should behave, analyze responses, and conduct the assessment.</p>
            </div>

            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardContent className="p-8 space-y-8">
                <div>
                  <Label htmlFor="systemPrompt" className="text-gray-700 font-medium text-base mb-3 block">System Prompt</Label>
                  <Textarea
                    id="systemPrompt"
                    value={config.systemPrompt}
                    onChange={(e) => setConfig(prev => ({ ...prev, systemPrompt: e.target.value }))}
                    placeholder={`You are an expert psychological assessor specializing in archetype identification through linguistic analysis. 

CONTEXT & KNOWLEDGE BASE:
- You have access to ${availableArchetypes.length} comprehensive archetype profiles with detailed linguistic patterns
- Each archetype has specific keywords, communication styles, and behavioral indicators
- You can analyze conversations against the full database or focus on specific archetypes

ASSESSMENT THEME: ${config.theme.toUpperCase().replace('-', ' ')}
COMPLEXITY LEVEL: ${config.difficultyLevel.toUpperCase()}
${config.focusedArchetypes.length > 0 ? `FOCUSED ARCHETYPES: ${config.focusedArchetypes.join(', ')}` : 'ANALYSIS SCOPE: All available archetypes'}

YOUR ROLE:
1. Conduct ${config.theme}-focused conversations that reveal archetypal patterns
2. Analyze responses against the comprehensive database of linguistic patterns
3. Identify subtle patterns through word choice, metaphors, and communication styles
4. Maintain warmth and professionalism while gathering deep insights
5. Ask follow-up questions that explore underlying motivations and patterns

ANALYSIS APPROACH:
- Cross-reference responses against database patterns
- Look for consistency across multiple exchanges
- Weight recent responses more heavily
- Track evidence for each potential archetype match`}
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-sm leading-relaxed"
                    rows={18}
                  />
                  <p className="text-xs text-gray-500 mt-3 leading-relaxed">
                    This system prompt dynamically incorporates your theme, difficulty level, and archetype selection to provide contextual AI behavior.
                  </p>
                </div>

                <Separator />

                <div>
                  <Label htmlFor="analysisInstructions" className="text-gray-700 font-medium text-base mb-3 block">Analysis Instructions</Label>
                  
                  {config.useGlobalLinguistics ? (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Brain className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium text-green-800">Using Global Archetype Database</span>
                      </div>
                      <p className="text-sm text-green-700">
                        The AI will automatically analyze responses against all {availableArchetypes.length} archetypes and their linguistic patterns from your database. 
                        {config.focusedArchetypes.length > 0 && ` It will prioritize the ${config.focusedArchetypes.length} selected archetypes while considering others as secondary matches.`}
                      </p>
                    </div>
                  ) : (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Target className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-800">Custom Analysis Focus</span>
                      </div>
                      <p className="text-sm text-blue-700">
                        The AI will use your custom linguistic focus instructions below instead of the global database.
                      </p>
                    </div>
                  )}

                  <Textarea
                    id="analysisInstructions"
                    value={config.analysisInstructions}
                    onChange={(e) => setConfig(prev => ({ ...prev, analysisInstructions: e.target.value }))}
                    placeholder={config.useGlobalLinguistics ? `GLOBAL DATABASE ANALYSIS INSTRUCTIONS:

ANALYSIS FRAMEWORK:
- Access the comprehensive database of ${availableArchetypes.length} archetype profiles
- Each archetype has specific linguistic patterns, keywords, and behavioral indicators
- Cross-reference user responses against database patterns
- Generate confidence scores for each potential archetype match

SCORING METHODOLOGY:
1. KEYWORD MATCHING (25% weight)
   - Direct matches with archetype-specific vocabulary from database
   - Frequency and contextual usage of key terms
   - Emotional intensity and linguistic markers

2. COMMUNICATION STYLE (35% weight)
   - Reference database patterns for communication styles
   - Analyze direct vs indirect communication patterns
   - Power dynamics and authority markers in language
   - Collaborative vs competitive expressions

3. PSYCHOLOGICAL INDICATORS (40% weight)
   - Decision-making language patterns from database
   - Risk tolerance and values-based expressions
   - Emotional regulation and expression styles
   - Temporal orientation and thinking patterns

FOCUS AREAS FOR ${config.theme.toUpperCase().replace('-', ' ')} THEME:
- Look for ${config.theme}-specific linguistic patterns in database
- Weight theme-relevant indicators more heavily
- Cross-reference with difficulty level: ${config.difficultyLevel}

EVIDENCE TRACKING:
- Maintain specific quotes supporting each archetype match
- Track confidence evolution across conversation
- Note contradictions or complexity in patterns` : `CUSTOM LINGUISTIC ANALYSIS INSTRUCTIONS:

For each user response, analyze the following linguistic elements:

LANGUAGE PATTERNS:
- Word choice and vocabulary sophistication
- Metaphors and imagery used
- Emotional language and intensity
- Abstract vs. concrete thinking patterns

COMMUNICATION STYLE:
- Direct vs. indirect communication
- Power language and authority markers
- Collaborative vs. competitive language
- Relationship-focused vs. task-focused expressions

PSYCHOLOGICAL INDICATORS:
- Decision-making language patterns
- Risk tolerance expressions
- Values and priorities revealed through language
- Emotional regulation and expression styles

Look for recurring patterns across multiple responses...

${config.customLinguisticFocus ? `CUSTOM FOCUS: ${config.customLinguisticFocus}` : ''}`}
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-sm leading-relaxed"
                    rows={config.useGlobalLinguistics ? 25 : 20}
                    disabled={config.useGlobalLinguistics}
                  />
                  <p className="text-xs text-gray-500 mt-3 leading-relaxed">
                    {config.useGlobalLinguistics 
                      ? "These instructions are automatically generated based on your database and configuration. The AI will use your 55 archetypes and their linguistic patterns."
                      : "Define specific linguistic elements to analyze when not using the global database."
                    }
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )

      case 'conversation':
        return (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-light text-gray-900 mb-3">Conversation Flow</h2>
              <p className="text-gray-600 mb-8">Define how the AI should structure conversations and ask questions.</p>
            </div>

            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardContent className="p-8">
                <div>
                  <Label htmlFor="conversationFlow" className="text-gray-700 font-medium text-base mb-3 block">Conversation Strategy</Label>
                  <Textarea
                    id="conversationFlow"
                    value={config.conversationFlow}
                    onChange={(e) => setConfig(prev => ({ ...prev, conversationFlow: e.target.value }))}
                    placeholder="CONVERSATION STRUCTURE:

OPENING (1-2 exchanges):
- Start with warm, open-ended questions about recent experiences
- Focus on situations relevant to the assessment purpose
- Example: &lsquo;Tell me about a recent situation where you had to make an important decision. What was going through your mind?&rsquo;

EXPLORATION PHASE (3-5 exchanges):
- Dig deeper into patterns revealed in initial responses
- Ask about emotional responses, thought processes, and motivations
- Use follow-up questions like &lsquo;What did that feel like?&rsquo; or &lsquo;How did you approach that?&rsquo;

PATTERN IDENTIFICATION (2-3 exchanges):
- Explore recurring themes and behavioral patterns
- Ask about similar situations and consistent responses
- Focus on values, priorities, and decision-making frameworks

QUESTION STYLES:
- Use open-ended questions that invite storytelling
- Ask about specific examples rather than general preferences
- Explore both positive and challenging experiences
- Follow emotional threads and unexplored areas

TONE AND APPROACH:
- Maintain genuine curiosity and warmth
- Avoid clinical or interrogative language
- Show interest in their unique perspective
- Create a safe space for authentic sharing"
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-sm leading-relaxed"
                    rows={25}
                  />
                  <p className="text-xs text-gray-500 mt-3 leading-relaxed">
                    Detailed instructions for how conversations should flow, what types of questions to ask, and how to maintain engagement.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )

      case 'archetypes':
        return (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-light text-gray-900 mb-3">Archetype Selection</h2>
              <p className="text-gray-600 mb-8">Choose specific archetypes to focus on, or use the global database for comprehensive analysis.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="bg-white border border-gray-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-medium text-gray-900">Available Archetypes</CardTitle>
                  <p className="text-sm text-gray-600">Select from your database of {availableArchetypes.length} archetypes</p>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
                    </div>
                  ) : (
                    <ScrollArea className="h-96">
                      <div className="space-y-2">
                        {availableArchetypes.map((archetype) => (
                          <div 
                            key={archetype}
                            className={`p-3 rounded-lg border transition-all cursor-pointer ${
                              config.focusedArchetypes.includes(archetype)
                                ? 'bg-blue-50 border-blue-200 text-blue-900'
                                : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                            }`}
                            onClick={() => {
                              setConfig(prev => ({
                                ...prev,
                                focusedArchetypes: prev.focusedArchetypes.includes(archetype)
                                  ? prev.focusedArchetypes.filter(a => a !== archetype)
                                  : [...prev.focusedArchetypes, archetype]
                              }))
                            }}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">{archetype}</span>
                              {config.focusedArchetypes.includes(archetype) && (
                                <Badge variant="outline" className="bg-blue-100 text-blue-700 text-xs">
                                  Selected
                                </Badge>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-white border border-gray-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-medium text-gray-900">Selected Archetypes</CardTitle>
                  <p className="text-sm text-gray-600">
                    {config.focusedArchetypes.length === 0 
                      ? "No specific selection - using global database"
                      : `${config.focusedArchetypes.length} archetypes selected`
                    }
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {config.focusedArchetypes.length === 0 ? (
                      <div className="text-center py-12 text-gray-500">
                        <Users className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                        <p className="text-sm">No specific archetypes selected.</p>
                        <p className="text-xs mt-1">AI will analyze against all available archetypes.</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {config.focusedArchetypes.map((archetype) => (
                          <div 
                            key={archetype}
                            className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200"
                          >
                            <span className="text-sm font-medium text-blue-900">{archetype}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setConfig(prev => ({
                                  ...prev,
                                  focusedArchetypes: prev.focusedArchetypes.filter(a => a !== archetype)
                                }))
                              }}
                              className="text-blue-600 hover:text-blue-800 hover:bg-blue-100"
                            >
                              Remove
                            </Button>
                          </div>
                        ))}
                        
                        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                          <p className="text-xs text-gray-600">
                            <strong>Analysis Focus:</strong> The AI will primarily analyze responses against these {config.focusedArchetypes.length} selected archetypes, 
                            using their specific linguistic patterns and behavioral indicators from the database.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-medium text-gray-900">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setConfig(prev => ({ ...prev, focusedArchetypes: [] }))}
                  >
                    Clear All
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setConfig(prev => ({ ...prev, focusedArchetypes: availableArchetypes.slice(0, 12) }))}
                  >
                    Select Core 12
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setConfig(prev => ({ ...prev, focusedArchetypes: availableArchetypes.filter(a => a.toLowerCase().includes('leader')) }))}
                  >
                    Leadership Focus
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setConfig(prev => ({ ...prev, focusedArchetypes: availableArchetypes.filter(a => a.toLowerCase().includes('creative') || a.toLowerCase().includes('artist')) }))}
                  >
                    Creative Focus
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )

      case 'analysis':
        return (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-light text-gray-900 mb-3">Analysis Engine</h2>
              <p className="text-gray-600 mb-8">Configure the linguistic analysis parameters and scoring methodology.</p>
            </div>

            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardContent className="p-8">
                <div>
                  <Label htmlFor="questioningStyle" className="text-gray-700 font-medium text-base mb-3 block">Analysis Framework</Label>
                  <Textarea
                    id="questioningStyle"
                    value={config.questioningStyle}
                    onChange={(e) => setConfig(prev => ({ ...prev, questioningStyle: e.target.value }))}
                    placeholder="ANALYSIS METHODOLOGY:

SCORING SYSTEM:
For each response, assign confidence scores (0-1) for each archetype based on:

1. KEYWORD MATCHING (20% weight):
   - Direct matches with archetype-specific vocabulary
   - Frequency and context of key terms
   - Emotional intensity of language

2. LINGUISTIC PATTERNS (30% weight):
   - Sentence structure and complexity
   - Metaphor usage and imagery
   - Abstract vs concrete thinking patterns
   - Temporal orientation (past/present/future focus)

3. COMMUNICATION STYLE (25% weight):
   - Direct vs indirect communication
   - Power dynamics in language
   - Collaborative vs competitive expressions
   - Emotional expression patterns

4. DECISION-MAKING INDICATORS (25% weight):
   - Risk tolerance language
   - Value-based expressions
   - Process vs outcome orientation
   - Individual vs collective focus

CONFIDENCE THRESHOLDS:
- High confidence: 0.8+ consistent across multiple responses
- Medium confidence: 0.6-0.79 with some variation
- Low confidence: Below 0.6 or high variation

PATTERN ACCUMULATION:
- Track patterns across all responses
- Weight recent responses more heavily
- Look for consistency and reinforcement
- Note contradictions or complexity

EVIDENCE TRACKING:
- Maintain specific quotes that support each archetype
- Track behavioral examples mentioned
- Note emotional responses and triggers
- Document decision-making processes described"
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-sm leading-relaxed"
                    rows={25}
                  />
                  <p className="text-xs text-gray-500 mt-3 leading-relaxed">
                    Define the specific methodology for analyzing responses and calculating archetype scores.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )

      case 'reporting':
        return (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-light text-gray-900 mb-3">Report Generation</h2>
              <p className="text-gray-600 mb-8">Configure how the final assessment report should be structured and presented.</p>
            </div>

            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardContent className="p-8">
                <div>
                  <Label htmlFor="reportGeneration" className="text-gray-700 font-medium text-base mb-3 block">Report Structure & Content</Label>
                  <Textarea
                    id="reportGeneration"
                    value={config.reportGeneration}
                    onChange={(e) => setConfig(prev => ({ ...prev, reportGeneration: e.target.value }))}
                    placeholder="ASSESSMENT REPORT STRUCTURE:

1. EXECUTIVE SUMMARY:
   - Primary archetype with confidence level
   - Secondary archetype (if applicable)
   - Key insights in 2-3 sentences

2. ARCHETYPE PROFILE:
   - Detailed description of primary archetype
   - Strengths and natural tendencies
   - Potential growth areas and shadows
   - Real-world applications and implications

3. LINGUISTIC ANALYSIS:
   - Key language patterns identified
   - Communication style characteristics
   - Decision-making patterns observed
   - Emotional expression tendencies

4. SUPPORTING EVIDENCE:
   - Specific quotes that reveal archetype
   - Behavioral examples mentioned
   - Pattern consistency across responses
   - Notable linguistic markers

5. DEVELOPMENT INSIGHTS:
   - Opportunities for growth and development
   - Potential blind spots or challenges
   - Strategies for leveraging strengths
   - Areas for increased self-awareness

6. PRACTICAL APPLICATIONS:
   - How this shows up in relationships
   - Professional implications and opportunities
   - Communication recommendations
   - Leadership or interaction style insights

TONE AND STYLE:
- Use affirming, growth-oriented language
- Avoid pathologizing or negative framing
- Focus on potential and possibilities
- Provide actionable insights
- Maintain professional yet accessible tone

EVIDENCE INTEGRATION:
- Include 3-5 specific quotes as evidence
- Explain how each quote reveals archetype
- Show pattern consistency across responses
- Connect insights to real-world applications"
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-sm leading-relaxed"
                    rows={25}
                  />
                  <p className="text-xs text-gray-500 mt-3 leading-relaxed">
                    Define how the final report should be structured, what content to include, and the tone to use.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )

      case 'completion':
        return (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-light text-gray-900 mb-3">Completion Criteria</h2>
              <p className="text-gray-600 mb-8">Define when the assessment should end and generate the final report.</p>
            </div>

            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardContent className="p-8">
                <div>
                  <Label htmlFor="completionCriteria" className="text-gray-700 font-medium text-base mb-3 block">Completion Logic</Label>
                  <Textarea
                    id="completionCriteria"
                    value={config.completionCriteria}
                    onChange={(e) => setConfig(prev => ({ ...prev, completionCriteria: e.target.value }))}
                    placeholder="COMPLETION CRITERIA:

PRIMARY CRITERIA (Must meet ALL):
1. MINIMUM EXCHANGES: At least 5 meaningful exchanges completed
2. CONFIDENCE THRESHOLD: Primary archetype confidence score ≥ 0.75
3. PATTERN CONSISTENCY: Same primary archetype identified in last 3 responses
4. EVIDENCE SUFFICIENCY: At least 4 supporting quotes/examples collected

SECONDARY CRITERIA (Meet at least 2):
1. DEPTH ACHIEVED: Responses show emotional depth and personal insight
2. PATTERN STABILITY: Archetype scores stable across last 2 exchanges
3. COMPREHENSIVE COVERAGE: Multiple life areas/situations explored
4. TIME LIMIT: Maximum 15 exchanges reached

QUALITY CHECKS:
- User responses are substantive (more than one sentence)
- Patterns are internally consistent
- Evidence supports primary archetype clearly
- Secondary archetype (if any) is distinct from primary

EARLY COMPLETION TRIGGERS:
- User explicitly indicates they want to finish
- Responses become repetitive or lack new insights
- Clear archetype emerges with very high confidence (≥0.9)

EXTENSION TRIGGERS:
- Conflicting patterns require clarification
- Multiple archetypes showing similar high scores
- User responses reveal complexity requiring deeper exploration
- Insufficient evidence for confident assessment

FALLBACK CRITERIA:
- If maximum exchanges reached without meeting confidence threshold
- Provide assessment based on available data with appropriate caveats
- Suggest areas for further exploration or reassessment"
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-sm leading-relaxed"
                    rows={20}
                  />
                  <p className="text-xs text-gray-500 mt-3 leading-relaxed">
                    Define the specific conditions that determine when the assessment is complete and ready for reporting.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar Navigation */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-xl font-medium text-gray-900 flex items-center gap-3">
            <Brain className="h-6 w-6 text-blue-500" />
            Assessment Builder
          </h1>
          <p className="text-sm text-gray-600 mt-2">Configure your AI-driven assessment</p>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-4 space-y-2">
            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full text-left p-4 rounded-lg transition-colors ${
                  activeSection === item.id
                    ? 'bg-blue-50 border border-blue-200 text-blue-900'
                    : 'hover:bg-gray-50 text-gray-700'
                }`}
              >
                <div className="flex items-start gap-3">
                  <item.icon className={`h-5 w-5 mt-0.5 ${
                    activeSection === item.id ? 'text-blue-600' : 'text-gray-400'
                  }`} />
                  <div>
                    <div className="font-medium text-sm">{item.label}</div>
                    <div className="text-xs text-gray-500 mt-1">{item.description}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>

        {/* Actions */}
        <div className="p-4 border-t border-gray-200 space-y-3">
          <Button 
            onClick={handleSave}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2.5 font-medium"
          >
            <Save className="mr-2 h-4 w-4" />
            Save Configuration
          </Button>
          <Button 
            onClick={handleTest}
            variant="outline"
            className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 py-2.5 font-medium"
          >
            <Eye className="mr-2 h-4 w-4" />
            Test Assessment
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-8">
            {renderContent()}
          </div>
        </ScrollArea>
      </div>
    </div>
  )
} 