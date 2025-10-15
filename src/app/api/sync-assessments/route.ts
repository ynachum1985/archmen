import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = createServiceClient()

    // Handle build-time scenario where Supabase client might be null
    if (!supabase) {
      return NextResponse.json(
        { error: 'Supabase client not available' },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { assessment } = body

    if (!assessment) {
      return NextResponse.json({ error: 'Assessment data is required' }, { status: 400 })
    }

    // Validate assessment has a name
    if (!assessment.name || assessment.name.trim() === '') {
      return NextResponse.json({ error: 'Assessment name is required' }, { status: 400 })
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
          assessment_prompt: assessment.assessmentPrompt,
          min_questions: assessment.minQuestions || 8,
          max_questions: assessment.maxQuestions || 15,
          min_archetypes: assessment.minArchetypes || 2,
          min_confidence: assessment.minConfidence || 70,
          report_generation: assessment.reportGeneration || null,
          assessment_level: assessment.assessment_level || 1,
          status: assessment.status || 'draft',
          is_active: assessment.status === 'live' || assessment.is_active === true,
          live_provider: assessment.liveProvider || 'openai',
          live_model: assessment.liveModel || 'gpt-4-turbo-preview',
          updated_at: new Date().toISOString()
        })
        .eq('id', existingAssessment.id)
        .select()
        .single()

      if (error) {
        console.error('Error updating assessment:', error)
        console.error('Assessment data:', assessment)
        return NextResponse.json({
          error: 'Failed to update assessment',
          details: error.message,
          code: error.code
        }, { status: 500 })
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
          assessment_prompt: assessment.assessmentPrompt,
          min_questions: assessment.minQuestions || 8,
          max_questions: assessment.maxQuestions || 15,
          min_archetypes: assessment.minArchetypes || 2,
          min_confidence: assessment.minConfidence || 70,
          report_generation: assessment.reportGeneration || null,
          assessment_level: assessment.assessment_level || 1,
          status: assessment.status || 'draft',
          is_active: assessment.status === 'live' || assessment.is_active === true,
          live_provider: assessment.liveProvider || 'openai',
          live_model: assessment.liveModel || 'gpt-4-turbo-preview',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating assessment:', error)
        console.error('Assessment data:', assessment)
        return NextResponse.json({
          error: 'Failed to create assessment',
          details: error.message,
          code: error.code
        }, { status: 500 })
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
    const supabase = createServiceClient()

    // Handle build-time scenario where Supabase client might be null
    if (!supabase) {
      return NextResponse.json(
        { error: 'Supabase client not available' },
        { status: 500 }
      )
    }

    // Fetch all assessments from enhanced_assessments table
    const { data: assessments, error } = await supabase
      .from('enhanced_assessments')
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
