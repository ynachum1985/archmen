'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Save } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface AssessmentGatewayBuilderProps {
  assessmentId: string
  assessmentLevel: number
  assessmentName: string
  onGatewaysChange?: (gateways: any[]) => void
  onQuizPromptsChange?: (prompts: { setQuestions: string; experienceAnalysis: string }) => void
}

export function AssessmentGatewayBuilder({
  assessmentId,
  assessmentLevel,
  assessmentName,
  onGatewaysChange,
  onQuizPromptsChange
}: AssessmentGatewayBuilderProps) {
  const [setQuestionsPrompt, setSetQuestionsPrompt] = useState('')
  const [experienceAnalysisPrompt, setExperienceAnalysisPrompt] = useState('')

  const supabase = createClient()

  useEffect(() => {
    loadQuizPrompts()
  }, [assessmentId])

  const getDefaultSetQuestionsPrompt = () => {
    switch (assessmentLevel) {
      case 1:
        return `You are conducting a readiness assessment for the "${assessmentName}" assessment (Level 1 - Foundation).

Ask 3-4 questions that test basic emotional awareness, relationship patterns, and readiness for archetypal discovery. Focus on:
- Communication skills and self-reflection ability
- Openness to feedback and personal growth
- Basic emotional regulation capabilities
- Willingness to explore relationship patterns

Keep questions conversational and supportive. Ask one question at a time and wait for responses.`

      case 2:
        return `You are conducting a readiness assessment for the "${assessmentName}" assessment (Level 2 - Integration).

Ask 3-4 questions that test emotional maturity, shadow work readiness, and integration capabilities. Focus on:
- Ability to face difficult truths about oneself
- Emotional regulation under stress and conflict
- Previous personal growth work and integration
- Readiness for deeper psychological exploration

Ensure the user demonstrates emotional maturity of 6+ before proceeding.`

      case 3:
        return `You are conducting a readiness assessment for the "${assessmentName}" assessment (Level 3 - Mastery).

Ask 3-4 questions that test advanced emotional maturity and readiness for complex concepts. Focus on:
- Handling of challenging relationship dynamics
- Emotional stability with controversial topics
- Integration of previous learning and shadow work
- Readiness for advanced psychological concepts

This assessment requires emotional maturity of 8+ and demonstrated mastery of previous levels.`

      default:
        return `You are conducting a readiness assessment for the "${assessmentName}" assessment.

Ask 3-4 questions to assess if the user is ready for this assessment content.`
    }
  }

  const getDefaultExperienceAnalysisPrompt = () => {
    switch (assessmentLevel) {
      case 1:
        return `IMPORTANT: You will receive the user's assessment history above (if any). Use this information to create appropriate questions.

Analyze the user's basic readiness for foundational archetypal work in "${assessmentName}".

Review their USER ASSESSMENT HISTORY section (if they have previous assessments) and assess:
- Openness to self-discovery and personal growth
- Basic emotional awareness and self-reflection
- Readiness to explore relationship patterns
- Willingness to receive feedback
- Any patterns from previous assessment attempts

Generate 1-2 personalized questions based on their history and any gaps or areas needing verification before they can access this foundational assessment. If this is their first assessment, focus on basic readiness indicators.`

      case 2:
        return `IMPORTANT: You will receive the user's complete assessment history above. Use this information to create personalized questions.

Analyze the user's previous assessment history and growth patterns to determine readiness for "${assessmentName}" (Level 2).

Review their USER ASSESSMENT HISTORY section and look for evidence of:
- Emotional maturity development since Level 1
- Integration of previous insights and archetype discoveries
- Readiness for shadow work and deeper psychological exploration
- Ability to handle more challenging personal truths
- Specific patterns from their previous assessment feedback

Generate 2-3 personalized questions based on their actual journey, referencing specific insights from their previous assessments when relevant. If they have no previous assessments, focus on foundational readiness questions.`

      case 3:
        return `IMPORTANT: You will receive the user's complete assessment history above. Use this information to create highly personalized questions.

Analyze the user's complete assessment journey and emotional development to determine readiness for "${assessmentName}" (Level 3).

Review their USER ASSESSMENT HISTORY section and examine their progression through:
- Shadow work integration and emotional maturity development
- Ability to handle complex relationship dynamics
- Previous archetype integration and personal growth
- Readiness for advanced topics like polyamory, patriarchy deconstruction, or complex relationship concepts
- Specific growth areas identified in previous assessments
- Emotional maturity progression over time

Generate 2-3 highly personalized questions that test their readiness for these advanced psychological concepts, directly referencing their previous assessment insights and growth patterns. If they haven't completed sufficient prerequisite assessments, address this gap.`

      default:
        return `Analyze the user's previous assessment history and experience to determine readiness for "${assessmentName}".

Generate personalized questions based on their journey and growth patterns.`
    }
  }

  const loadQuizPrompts = async () => {
    try {
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
      setSetQuestionsPrompt(getDefaultSetQuestionsPrompt())
      setExperienceAnalysisPrompt(getDefaultExperienceAnalysisPrompt())
    }
  }

  const saveQuizPrompts = async () => {
    try {
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
}
