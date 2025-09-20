import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { assessment } = body

    if (!assessment) {
      return NextResponse.json({ error: 'Assessment data is required' }, { status: 400 })
    }

    // Check if assessment already exists
    const { data: existingAssessment, error: checkError } = await supabase
      .from('enhanced_assessments')
      .select('id')
      .eq('name', assessment.name)
      .single()

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "not found"
      console.error('Error checking existing assessment:', checkError)
      return NextResponse.json({ error: 'Failed to check existing assessment' }, { status: 500 })
    }

    let result
    if (existingAssessment) {
      // Update existing assessment
      const { data, error } = await supabase
        .from('enhanced_assessments')
        .update({
          description: assessment.description,
          category: assessment.category,
          purpose: assessment.purpose,
          system_prompt: assessment.systemPrompt,
          combined_prompt: assessment.combinedPrompt,
          min_questions: assessment.minQuestions || 8,
          max_questions: assessment.maxQuestions || 15,
          evidence_threshold: (assessment.evidenceThreshold || 75) / 100, // Convert percentage to decimal
          adaptation_sensitivity: (assessment.adaptationSensitivity || 65) / 100,
          expected_duration: assessment.expectedDuration || 20,
          question_examples: assessment.questionExamples || {},
          response_requirements: assessment.responseRequirements || {},
          adaptive_logic: assessment.adaptiveLogic || {},
          cycle_settings: assessment.cycleSettings || { maxCycles: 3, evidencePerCycle: 3 },
          selected_personality_id: assessment.selectedPersonalityId || null,
          report_generation: assessment.reportGeneration || null,
          is_active: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingAssessment.id)
        .select()
        .single()

      if (error) {
        console.error('Error updating assessment:', error)
        return NextResponse.json({ error: 'Failed to update assessment' }, { status: 500 })
      }
      result = data
    } else {
      // Create new assessment
      const { data, error } = await supabase
        .from('enhanced_assessments')
        .insert({
          name: assessment.name,
          description: assessment.description,
          category: assessment.category,
          purpose: assessment.purpose,
          system_prompt: assessment.systemPrompt,
          combined_prompt: assessment.combinedPrompt,
          min_questions: assessment.minQuestions || 8,
          max_questions: assessment.maxQuestions || 15,
          evidence_threshold: (assessment.evidenceThreshold || 75) / 100,
          adaptation_sensitivity: (assessment.adaptationSensitivity || 65) / 100,
          expected_duration: assessment.expectedDuration || 20,
          question_examples: assessment.questionExamples || {},
          response_requirements: assessment.responseRequirements || {},
          adaptive_logic: assessment.adaptiveLogic || {},
          cycle_settings: assessment.cycleSettings || { maxCycles: 3, evidencePerCycle: 3 },
          selected_personality_id: assessment.selectedPersonalityId || null,
          report_generation: assessment.reportGeneration || null,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating assessment:', error)
        return NextResponse.json({ error: 'Failed to create assessment' }, { status: 500 })
      }
      result = data
    }

    return NextResponse.json({
      success: true,
      assessment: result,
      action: existingAssessment ? 'updated' : 'created'
    })

  } catch (error) {
    console.error('Error in sync-assessments API:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    // Fetch all assessments from assessment_templates table (the new enhanced assessments)
    const { data: assessments, error } = await supabase
      .from('assessment_templates')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching assessments:', error)
      return NextResponse.json({ error: 'Failed to fetch assessments' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      assessments: assessments || []
    })

  } catch (error) {
    console.error('Error in get assessments API:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
