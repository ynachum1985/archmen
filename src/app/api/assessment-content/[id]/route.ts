import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    let { id } = params

    // Decode URL-encoded assessment ID/name
    id = decodeURIComponent(id)

    // If ID is not a UUID, try to find the assessment by name
    let assessmentId = id
    if (!id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      const { data: assessment, error: assessmentError } = await supabase
        .from('enhanced_assessments')
        .select('id')
        .eq('name', id)
        .single()

      if (assessmentError || !assessment) {
        return NextResponse.json({
          error: 'Assessment not found',
          chunks: [],
          settings: null,
          totalChunks: 0,
          totalCharacters: 0
        }, { status: 404 })
      }

      assessmentId = assessment.id
    }

    // Fetch content chunks for the assessment
    const { data: chunks, error } = await supabase
      .from('assessment_content_chunks')
      .select('*')
      .eq('assessment_id', assessmentId)
      .order('chunk_index', { ascending: true })

    if (error) {
      console.error('Error fetching content chunks:', error)
      return NextResponse.json({ error: 'Failed to fetch content chunks' }, { status: 500 })
    }

    // Also fetch embedding settings
    const { data: settings, error: settingsError } = await supabase
      .from('assessment_embedding_settings')
      .select('*')
      .eq('assessment_id', assessmentId)
      .single()

    if (settingsError && settingsError.code !== 'PGRST116') { // PGRST116 is "not found"
      console.error('Error fetching embedding settings:', settingsError)
    }

    return NextResponse.json({
      chunks: chunks || [],
      settings: settings || null,
      totalChunks: chunks?.length || 0,
      totalCharacters: chunks?.reduce((sum, chunk) => sum + chunk.chunk_size, 0) || 0
    })

  } catch (error) {
    console.error('Error in assessment-content API:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // Delete a specific chunk by ID
    const { error } = await supabase
      .from('assessment_content_chunks')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting content chunk:', error)
      return NextResponse.json({ error: 'Failed to delete content chunk' }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Content chunk deleted successfully' })

  } catch (error) {
    console.error('Error in delete assessment-content API:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
