"use client"

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
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
  CheckCircle
} from 'lucide-react'

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
}

interface AssessmentBuilderProps {
  assessment?: AssessmentConfig
  onSave: (config: AssessmentConfig) => void
  onTest: (config: AssessmentConfig) => void
}

const navigationItems = [
  { id: 'overview', label: 'Overview', icon: Settings, description: 'Basic information and setup' },
  { id: 'purpose', label: 'Purpose & Goals', icon: Target, description: 'Define assessment objectives' },
  { id: 'ai-instructions', label: 'AI Instructions', icon: Brain, description: 'Core AI behavior and analysis' },
  { id: 'conversation', label: 'Conversation Flow', icon: MessageCircle, description: 'Question style and interaction' },
  { id: 'archetypes', label: 'Archetype Mapping', icon: Users, description: 'Target archetypes and patterns' },
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
    reportGeneration: ''
  })

  const [activeSection, setActiveSection] = useState('overview')
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

  const renderContent = () => {
    switch (activeSection) {
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
                    placeholder="You are an expert psychological assessor specializing in archetype identification through linguistic analysis. Your role is to:

1. Conduct natural, engaging conversations that reveal deep psychological patterns
2. Analyze language use, metaphors, emotional expressions, and communication styles
3. Identify archetypal patterns through subtle linguistic cues
4. Maintain a warm, professional, and curious demeanor
5. Ask follow-up questions that explore underlying motivations and patterns

Your analysis should focus on..."
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-sm leading-relaxed"
                    rows={15}
                  />
                  <p className="text-xs text-gray-500 mt-3 leading-relaxed">
                    Define the AI's core identity, role, and behavioral guidelines. This sets the foundation for all interactions.
                  </p>
                </div>

                <Separator />

                <div>
                  <Label htmlFor="analysisInstructions" className="text-gray-700 font-medium text-base mb-3 block">Linguistic Analysis Instructions</Label>
                  <Textarea
                    id="analysisInstructions"
                    value={config.analysisInstructions}
                    onChange={(e) => setConfig(prev => ({ ...prev, analysisInstructions: e.target.value }))}
                    placeholder="For each user response, analyze the following linguistic elements:

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

Look for recurring patterns across multiple responses..."
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-sm leading-relaxed"
                    rows={20}
                  />
                  <p className="text-xs text-gray-500 mt-3 leading-relaxed">
                    Specify exactly what linguistic elements the AI should analyze and how to interpret them for archetype identification.
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
              <h2 className="text-2xl font-light text-gray-900 mb-3">Archetype Mapping</h2>
              <p className="text-gray-600 mb-8">Define which archetypes this assessment can identify and their characteristics.</p>
            </div>

            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardContent className="p-8 space-y-8">
                <div>
                  <Label className="text-gray-700 font-medium text-base mb-3 block">Target Archetypes</Label>
                  <div className="flex gap-3 mb-4">
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
                  
                  <div className="flex flex-wrap gap-2 mb-6">
                    {config.targetArchetypes.map((archetype) => (
                      <Badge 
                        key={archetype}
                        variant="outline" 
                        className="bg-blue-50 text-blue-700 border-blue-200 cursor-pointer hover:bg-blue-100 px-3 py-2 text-sm"
                        onClick={() => handleRemoveArchetype(archetype)}
                      >
                        {archetype} ×
                      </Badge>
                    ))}
                  </div>
                </div>

                <Separator />

                <div>
                  <Label htmlFor="archetypeMapping" className="text-gray-700 font-medium text-base mb-3 block">Archetype Characteristics & Patterns</Label>
                  <Textarea
                    id="archetypeMapping"
                    value={config.archetypeMapping}
                    onChange={(e) => setConfig(prev => ({ ...prev, archetypeMapping: e.target.value }))}
                    placeholder="Define each archetype with specific linguistic and behavioral patterns:

THE VISIONARY LEADER:
Linguistic Patterns:
- Uses future-oriented language (&lsquo;imagine&rsquo;, &lsquo;envision&rsquo;, &lsquo;transform&rsquo;)
- Speaks in big picture terms and metaphors
- Expresses confidence in possibilities and change
- Uses inspirational and motivational language

Communication Style:
- Speaks with passion and conviction
- Focuses on potential and opportunity
- Uses inclusive language (&lsquo;we can&rsquo;, &lsquo;together&rsquo;)
- Comfortable with ambiguity and uncertainty

Decision-Making Patterns:
- Considers long-term impact over short-term gains
- Willing to take calculated risks
- Values innovation and creativity
- Seeks input but makes decisive choices

THE ANALYTICAL STRATEGIST:
Linguistic Patterns:
- Uses precise, data-driven language
- Breaks down complex ideas systematically
- References facts, metrics, and evidence
- Speaks in logical sequences and frameworks

[Continue for each archetype...]"
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-sm leading-relaxed"
                    rows={20}
                  />
                  <p className="text-xs text-gray-500 mt-3 leading-relaxed">
                    Provide detailed descriptions of each archetype's linguistic patterns, communication style, and behavioral indicators.
                  </p>
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