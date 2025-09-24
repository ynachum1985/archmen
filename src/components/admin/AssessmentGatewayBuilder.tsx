'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Shield,
  Plus,
  Trash2,
  Settings,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Brain,
  Clock,
  Heart,
  Lock,
  Unlock,
  ArrowUp,
  ArrowDown,
  Save,
  BarChart3
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface GatewayTemplate {
  id: string
  name: string
  description: string
  gateway_type: 'content_integration' | 'emotional_readiness' | 'prerequisite_completion' | 'time_based' | 'ai_verification' | 'custom'
  is_general: boolean
  level_restriction?: number
  configuration: Record<string, any>
  verification_prompt?: string
  success_criteria: Record<string, any>
  failure_actions: Record<string, any>
  is_active: boolean
}

interface GatewayAssignment {
  id: string
  assessment_id: string
  gateway_template_id: string
  is_enabled: boolean
  custom_configuration: Record<string, any>
  order_index: number
  gateway_template: GatewayTemplate
}

interface AssessmentGatewayBuilderProps {
  assessmentId: string
  assessmentLevel: number
  assessmentName: string
  onGatewaysChange?: (gateways: GatewayAssignment[]) => void
  onQuizPromptsChange?: (prompts: { setQuestions: string; experienceAnalysis: string }) => void
}

export function AssessmentGatewayBuilder({
  assessmentId,
  assessmentLevel,
  assessmentName,
  onGatewaysChange,
  onQuizPromptsChange
}: AssessmentGatewayBuilderProps) {
  const [gateways, setGateways] = useState<GatewayAssignment[]>([])
  const [availableTemplates, setAvailableTemplates] = useState<GatewayTemplate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAddGateway, setShowAddGateway] = useState(false)
  const [editingGateway, setEditingGateway] = useState<GatewayAssignment | null>(null)

  // Quiz prompts state
  const [setQuestionsPrompt, setSetQuestionsPrompt] = useState('')
  const [experienceAnalysisPrompt, setExperienceAnalysisPrompt] = useState('')

  const supabase = createClient()

  useEffect(() => {
    loadGateways()
    loadAvailableTemplates()
    loadQuizPrompts()
  }, [assessmentId])

  const loadGateways = async () => {
    try {
      // Skip loading if assessmentId is 'new' (assessment not saved yet)
      if (assessmentId === 'new') {
        setGateways([])
        onGatewaysChange?.([])
        return
      }

      const { data, error } = await supabase
        .from('assessment_gateway_assignments')
        .select(`
          *,
          gateway_template:assessment_gateway_templates(*)
        `)
        .eq('assessment_id', assessmentId)
        .order('order_index')

      if (error) {
        console.warn('Gateway assignments table may not exist yet:', error)
        setGateways([])
        onGatewaysChange?.([])
        return
      }

      setGateways(data || [])
      onGatewaysChange?.(data || [])
    } catch (error) {
      console.error('Error loading gateways:', error)
      setGateways([])
      onGatewaysChange?.([])
    }
  }

  const loadAvailableTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('assessment_gateway_templates')
        .select('*')
        .eq('is_active', true)
        .or(`level_restriction.is.null,level_restriction.eq.${assessmentLevel}`)
        .order('name')

      if (error) {
        console.warn('Gateway templates table may not exist yet:', error)
        setAvailableTemplates([])
        return
      }

      setAvailableTemplates(data || [])
    } catch (error) {
      console.error('Error loading templates:', error)
      setAvailableTemplates([])
    } finally {
      setIsLoading(false)
    }
  }

  const loadQuizPrompts = async () => {
    try {
      // Skip loading if assessmentId is 'new' (assessment not saved yet)
      if (assessmentId === 'new') {
        setSetQuestionsPrompt(getDefaultSetQuestionsPrompt())
        setExperienceAnalysisPrompt(getDefaultExperienceAnalysisPrompt())
        return
      }

      const { data, error } = await supabase
        .from('enhanced_assessments')
        .select('quiz_set_questions_prompt, quiz_experience_analysis_prompt')
        .eq('id', assessmentId)
        .single()

      if (error) {
        console.warn('Could not load quiz prompts, using defaults:', error)
        setSetQuestionsPrompt(getDefaultSetQuestionsPrompt())
        setExperienceAnalysisPrompt(getDefaultExperienceAnalysisPrompt())
        return
      }

      if (data) {
        setSetQuestionsPrompt(data.quiz_set_questions_prompt || getDefaultSetQuestionsPrompt())
        setExperienceAnalysisPrompt(data.quiz_experience_analysis_prompt || getDefaultExperienceAnalysisPrompt())
      }
    } catch (error) {
      console.error('Error loading quiz prompts:', error)
      // Set defaults if loading fails
      setSetQuestionsPrompt(getDefaultSetQuestionsPrompt())
      setExperienceAnalysisPrompt(getDefaultExperienceAnalysisPrompt())
    }
  }

  const saveQuizPrompts = async () => {
    try {
      // Can't save if assessment not created yet
      if (assessmentId === 'new') {
        alert('Please save the assessment first before configuring quiz prompts')
        return
      }

      const { error } = await supabase
        .from('enhanced_assessments')
        .update({
          quiz_set_questions_prompt: setQuestionsPrompt,
          quiz_experience_analysis_prompt: experienceAnalysisPrompt
        })
        .eq('id', assessmentId)

      if (error) throw error

      onQuizPromptsChange?.({
        setQuestions: setQuestionsPrompt,
        experienceAnalysis: experienceAnalysisPrompt
      })

      alert('Quiz prompts saved successfully!')
    } catch (error) {
      console.error('Error saving quiz prompts:', error)
      alert('Failed to save quiz prompts. The assessment may need to be saved first.')
    }
  }

  const getDefaultSetQuestionsPrompt = () => {
    return `You are conducting a readiness assessment for the "${assessmentName}" assessment (Level ${assessmentLevel}).

ASSESSMENT CONTEXT:
- Assessment Name: ${assessmentName}
- Level: ${assessmentLevel} ${assessmentLevel === 1 ? '(Foundation)' : assessmentLevel === 2 ? '(Integration)' : '(Mastery)'}
- Purpose: Determine if the user is ready for this specific assessment

SET QUESTIONS TO ASK:
Ask 3-5 specific questions that test readiness for this assessment. Questions should be:
- Directly relevant to the assessment topic
- Appropriate for Level ${assessmentLevel} complexity
- Designed to reveal emotional maturity and understanding
- Focused on practical application and self-awareness

QUESTION EXAMPLES FOR LEVEL ${assessmentLevel}:
${assessmentLevel === 1 ? `
- "Describe a recent relationship challenge and how you handled it."
- "What patterns do you notice in your relationships?"
- "How do you typically respond when someone disagrees with you?"
` : assessmentLevel === 2 ? `
- "Can you give an example of a time you recognized a shadow aspect of yourself?"
- "How do you handle difficult emotions when they arise?"
- "Describe a situation where you had to face an uncomfortable truth about yourself."
` : `
- "How do you handle jealousy or possessiveness in relationships?"
- "Describe your understanding of healthy power dynamics."
- "How do you navigate conflicts about deeply held beliefs or values?"
`}

EVALUATION CRITERIA:
- Emotional maturity appropriate for Level ${assessmentLevel}
- Self-awareness and reflection capability
- Practical understanding of relevant concepts
- Readiness for the specific assessment content

Ask questions one at a time, wait for responses, and evaluate their readiness based on depth of insight and emotional maturity.`
  }

  const getDefaultExperienceAnalysisPrompt = () => {
    return `You are analyzing the user's previous assessment history and experience to determine readiness for the "${assessmentName}" assessment (Level ${assessmentLevel}).

ANALYSIS CONTEXT:
- Target Assessment: ${assessmentName} (Level ${assessmentLevel})
- Required Analysis: Review user's journey and growth to assess readiness

PREVIOUS EXPERIENCE TO ANALYZE:
1. **Completed Assessments**: Review which assessments they've completed and their results
2. **Archetype Integration**: Analyze how well they've integrated their discovered archetypes
3. **Growth Patterns**: Look for evidence of emotional growth and self-awareness development
4. **Content Engagement**: Review their engagement with previous assessment content and insights
5. **Reflection Quality**: Assess the depth and maturity of their previous reflections

LEVEL ${assessmentLevel} READINESS CRITERIA:
${assessmentLevel === 1 ? `
- Basic emotional awareness and self-reflection
- Willingness to explore relationship patterns
- Open to feedback and new perspectives
- Basic communication skills
` : assessmentLevel === 2 ? `
- Completion of Level 1 assessments with integration
- Demonstrated emotional regulation skills
- Evidence of shadow work readiness
- Ability to face difficult truths about themselves
- Emotional maturity score of 6+ from previous assessments
` : `
- Completion of Level 2 assessments with deep integration
- Advanced emotional maturity (8+ score)
- Evidence of complex relationship understanding
- Ability to handle challenging concepts without emotional overwhelm
- Demonstrated growth through previous shadow work
`}

ANALYSIS APPROACH:
1. Review their assessment history and archetype discoveries
2. Analyze the quality and depth of their previous responses
3. Look for patterns of growth and integration
4. Assess emotional maturity progression
5. Generate 2-3 targeted questions based on gaps or areas needing verification

CUSTOM QUESTIONS:
Based on your analysis, create 2-3 personalized questions that:
- Address any concerns about their readiness
- Test integration of previous learning
- Verify emotional maturity for Level ${assessmentLevel} content
- Explore specific areas where more growth might be needed

Provide a thorough but compassionate assessment of their readiness.`
  }

  const addGateway = async (templateId: string) => {
    try {
      const maxOrder = Math.max(...gateways.map(g => g.order_index), -1)
      
      const { data, error } = await supabase
        .from('assessment_gateway_assignments')
        .insert({
          assessment_id: assessmentId,
          gateway_template_id: templateId,
          order_index: maxOrder + 1,
          is_enabled: true,
          custom_configuration: {}
        })
        .select(`
          *,
          gateway_template:assessment_gateway_templates(*)
        `)
        .single()

      if (error) throw error
      
      const newGateways = [...gateways, data]
      setGateways(newGateways)
      onGatewaysChange?.(newGateways)
      setShowAddGateway(false)
    } catch (error) {
      console.error('Error adding gateway:', error)
      alert('Failed to add gateway')
    }
  }

  const removeGateway = async (gatewayId: string) => {
    try {
      const { error } = await supabase
        .from('assessment_gateway_assignments')
        .delete()
        .eq('id', gatewayId)

      if (error) throw error
      
      const newGateways = gateways.filter(g => g.id !== gatewayId)
      setGateways(newGateways)
      onGatewaysChange?.(newGateways)
    } catch (error) {
      console.error('Error removing gateway:', error)
      alert('Failed to remove gateway')
    }
  }

  const updateGateway = async (gatewayId: string, updates: Partial<GatewayAssignment>) => {
    try {
      const { error } = await supabase
        .from('assessment_gateway_assignments')
        .update(updates)
        .eq('id', gatewayId)

      if (error) throw error
      
      const newGateways = gateways.map(g => 
        g.id === gatewayId ? { ...g, ...updates } : g
      )
      setGateways(newGateways)
      onGatewaysChange?.(newGateways)
    } catch (error) {
      console.error('Error updating gateway:', error)
      alert('Failed to update gateway')
    }
  }

  const moveGateway = async (gatewayId: string, direction: 'up' | 'down') => {
    const currentIndex = gateways.findIndex(g => g.id === gatewayId)
    if (currentIndex === -1) return

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
    if (newIndex < 0 || newIndex >= gateways.length) return

    const newGateways = [...gateways]
    const [movedGateway] = newGateways.splice(currentIndex, 1)
    newGateways.splice(newIndex, 0, movedGateway)

    // Update order_index for all affected gateways
    const updates = newGateways.map((gateway, index) => ({
      id: gateway.id,
      order_index: index
    }))

    try {
      for (const update of updates) {
        await supabase
          .from('assessment_gateway_assignments')
          .update({ order_index: update.order_index })
          .eq('id', update.id)
      }

      // Update local state
      const updatedGateways = newGateways.map((gateway, index) => ({
        ...gateway,
        order_index: index
      }))
      
      setGateways(updatedGateways)
      onGatewaysChange?.(updatedGateways)
    } catch (error) {
      console.error('Error reordering gateways:', error)
      alert('Failed to reorder gateways')
    }
  }

  const getGatewayIcon = (type: string) => {
    switch (type) {
      case 'emotional_readiness': return <Heart className="h-4 w-4" />
      case 'ai_verification': return <Brain className="h-4 w-4" />
      case 'time_based': return <Clock className="h-4 w-4" />
      case 'prerequisite_completion': return <CheckCircle className="h-4 w-4" />
      case 'content_integration': return <Shield className="h-4 w-4" />
      default: return <Settings className="h-4 w-4" />
    }
  }

  const getGatewayTypeColor = (type: string) => {
    switch (type) {
      case 'emotional_readiness': return 'bg-red-100 text-red-800'
      case 'ai_verification': return 'bg-purple-100 text-purple-800'
      case 'time_based': return 'bg-blue-100 text-blue-800'
      case 'prerequisite_completion': return 'bg-green-100 text-green-800'
      case 'content_integration': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Shield className="h-8 w-8 animate-pulse mx-auto mb-2" />
          <p>Loading assessment gateways...</p>
        </div>
      </div>
    )
  }

  // Always show the simplified quiz prompts interface
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Set Questions Prompt */}
      <div className="space-y-3">
        <Label htmlFor="setQuestionsPrompt" className="text-base font-medium">
          Set Questions Prompt
        </Label>
        <Textarea
          id="setQuestionsPrompt"
          value={setQuestionsPrompt}
          onChange={(e) => setSetQuestionsPrompt(e.target.value)}
          rows={16}
          className="font-mono text-sm resize-none"
          placeholder="Enter the prompt that guides the AI to ask standard readiness questions..."
        />
      </div>

      {/* Experience Analysis Prompt */}
      <div className="space-y-3">
        <Label htmlFor="experienceAnalysisPrompt" className="text-base font-medium">
          Experience Analysis Prompt
        </Label>
        <Textarea
          id="experienceAnalysisPrompt"
          value={experienceAnalysisPrompt}
          onChange={(e) => setExperienceAnalysisPrompt(e.target.value)}
          rows={16}
          className="font-mono text-sm resize-none"
          placeholder="Enter the prompt that guides the AI to analyze user history and create personalized questions..."
        />
      </div>

      {/* Save Button - Full Width */}
      <div className="lg:col-span-2 flex justify-end pt-4">
        <Button
          onClick={saveQuizPrompts}
          className="flex items-center gap-2"
          disabled={assessmentId === 'new'}
        >
          <Save className="h-4 w-4" />
          {assessmentId === 'new' ? 'Save Assessment First' : 'Save Quiz Prompts'}
        </Button>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Assessment Gateways</h3>
          <p className="text-sm text-gray-600">
            Configure requirements users must meet before accessing this assessment
          </p>
        </div>
        <Button 
          onClick={() => setShowAddGateway(true)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Gateway
        </Button>
      </div>

      {/* Current Gateways */}
      <div className="space-y-3">
        {gateways.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex items-center justify-center p-8">
              <div className="text-center">
                <Shield className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">No gateways configured</p>
                <p className="text-sm text-gray-400">Add gateways to control access to this assessment</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          gateways.map((gateway, index) => (
            <Card key={gateway.id} className="border-l-4 border-l-blue-500">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      {getGatewayIcon(gateway.gateway_template.gateway_type)}
                      <span className="font-medium">{gateway.gateway_template.name}</span>
                    </div>
                    <Badge className={getGatewayTypeColor(gateway.gateway_template.gateway_type)}>
                      {gateway.gateway_template.gateway_type.replace('_', ' ')}
                    </Badge>
                    {gateway.gateway_template.is_general && (
                      <Badge variant="outline">General</Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={gateway.is_enabled}
                      onCheckedChange={(enabled) => 
                        updateGateway(gateway.id, { is_enabled: enabled })
                      }
                    />
                    
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => moveGateway(gateway.id, 'up')}
                        disabled={index === 0}
                      >
                        <ArrowUp className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => moveGateway(gateway.id, 'down')}
                        disabled={index === gateways.length - 1}
                      >
                        <ArrowDown className="h-3 w-3" />
                      </Button>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingGateway(gateway)}
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeGateway(gateway.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <p className="text-sm text-gray-600 mb-3">
                  {gateway.gateway_template.description}
                </p>
                
                {gateway.gateway_template.verification_prompt && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <Label className="text-xs font-medium text-gray-700">AI Verification Prompt:</Label>
                    <p className="text-xs text-gray-600 mt-1">
                      {gateway.gateway_template.verification_prompt}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Add Gateway Dialog */}
      {showAddGateway && (
        <Card className="border-2 border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Add Assessment Gateway
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {availableTemplates
                .filter(template => !gateways.some(g => g.gateway_template_id === template.id))
                .map(template => (
                  <div 
                    key={template.id}
                    className="flex items-center justify-between p-3 bg-white rounded-lg border cursor-pointer hover:border-blue-300"
                    onClick={() => addGateway(template.id)}
                  >
                    <div className="flex items-center gap-3">
                      {getGatewayIcon(template.gateway_type)}
                      <div>
                        <p className="font-medium">{template.name}</p>
                        <p className="text-sm text-gray-600">{template.description}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge className={getGatewayTypeColor(template.gateway_type)}>
                        {template.gateway_type.replace('_', ' ')}
                      </Badge>
                      {template.is_general && (
                        <Badge variant="outline">General</Badge>
                      )}
                      {template.level_restriction && (
                        <Badge variant="secondary">Level {template.level_restriction}</Badge>
                      )}
                    </div>
                  </div>
                ))}
              
              {availableTemplates.filter(template => 
                !gateways.some(g => g.gateway_template_id === template.id)
              ).length === 0 && (
                <p className="text-center text-gray-500 py-4">
                  All available gateways have been added
                </p>
              )}
            </div>
            
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setShowAddGateway(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quiz Prompts Configuration */}
      <div className="space-y-6 mt-8 pt-8 border-t">
        <div>
          <h3 className="text-lg font-medium mb-2">Conversational Gateway Quiz</h3>
          <p className="text-sm text-gray-600 mb-6">
            Configure the AI prompts for the conversational quiz that users must pass before accessing this assessment.
            The quiz will be conducted in the chat interface as a natural conversation.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Set Questions Prompt */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-blue-600" />
                Set Questions Prompt
              </CardTitle>
              <CardDescription>
                Defines the standard questions the AI should ask to assess readiness for this specific assessment.
                These are consistent questions that test core competencies for Level {assessmentLevel}.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="setQuestionsPrompt">AI Prompt for Set Questions</Label>
                  <Textarea
                    id="setQuestionsPrompt"
                    value={setQuestionsPrompt}
                    onChange={(e) => setSetQuestionsPrompt(e.target.value)}
                    rows={12}
                    className="font-mono text-sm"
                    placeholder="Enter the prompt that guides the AI to ask standard readiness questions..."
                  />
                </div>
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-xs text-blue-700 font-medium mb-1">Purpose:</p>
                  <p className="text-xs text-blue-600">
                    This prompt tells the AI what specific questions to ask to test if the user is ready for
                    the "{assessmentName}" assessment. Questions should be relevant to Level {assessmentLevel} complexity.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Experience Analysis Prompt */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-purple-600" />
                Experience Analysis Prompt
              </CardTitle>
              <CardDescription>
                Guides the AI to analyze the user's previous assessment history and generate personalized
                questions based on their journey and growth patterns.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="experienceAnalysisPrompt">AI Prompt for Experience Analysis</Label>
                  <Textarea
                    id="experienceAnalysisPrompt"
                    value={experienceAnalysisPrompt}
                    onChange={(e) => setExperienceAnalysisPrompt(e.target.value)}
                    rows={12}
                    className="font-mono text-sm"
                    placeholder="Enter the prompt that guides the AI to analyze user history and create personalized questions..."
                  />
                </div>
                <div className="bg-purple-50 p-3 rounded-lg">
                  <p className="text-xs text-purple-700 font-medium mb-1">Purpose:</p>
                  <p className="text-xs text-purple-600">
                    This prompt tells the AI to review the user's previous assessments, archetype discoveries,
                    and growth patterns to create personalized readiness questions for "{assessmentName}".
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button
            onClick={saveQuizPrompts}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            Save Quiz Prompts
          </Button>
        </div>

        {/* Preview Section */}
        <Card className="bg-gray-50">
          <CardHeader>
            <CardTitle className="text-sm">How the Conversational Gateway Works</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-gray-600">
            <div className="space-y-2">
              <p><strong>1. User attempts to access assessment:</strong> They click on "{assessmentName}" in their dashboard</p>
              <p><strong>2. Gateway quiz initiated:</strong> AI starts a conversation using both prompts above</p>
              <p><strong>3. Set questions asked:</strong> AI asks standard readiness questions for Level {assessmentLevel}</p>
              <p><strong>4. Experience analysis:</strong> AI reviews their history and asks personalized follow-up questions</p>
              <p><strong>5. Readiness evaluation:</strong> AI determines if they're ready and either grants access or provides guidance</p>
              <p><strong>6. Assessment access:</strong> If ready, they can proceed to the full "{assessmentName}" assessment</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
