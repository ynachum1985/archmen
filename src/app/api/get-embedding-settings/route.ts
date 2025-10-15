import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service-client'

export async function GET(request: NextRequest) {
  try {
    const supabase = createServiceClient()
    const { searchParams } = new URL(request.url)
    const assessmentId = searchParams.get('assessmentId')

    if (!assessmentId) {
      return NextResponse.json({ error: 'Assessment ID is required' }, { status: 400 })
    }

    // Fetch embedding settings
    const { data: settings, error } = await supabase
      .from('assessment_embedding_settings')
      .select('*')
      .eq('assessment_id', assessmentId)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
      console.error('Error fetching embedding settings:', error)
      return NextResponse.json({ 
        error: 'Failed to fetch embedding settings',
        details: error.message 
      }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true,
      settings: settings || null
    })
  } catch (error) {
    console.error('Error in get-embedding-settings API:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

