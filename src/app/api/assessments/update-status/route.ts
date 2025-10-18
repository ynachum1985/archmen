import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { assessmentId, status } = await request.json()

    if (!assessmentId || !status) {
      return NextResponse.json(
        { error: 'Assessment ID and status are required' },
        { status: 400 }
      )
    }

    if (!['draft', 'live', 'archived'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be draft, live, or archived' },
        { status: 400 }
      )
    }

    const supabase = createServiceClient()

    if (!supabase) {
      return NextResponse.json(
        { error: 'Supabase client not available' },
        { status: 500 }
      )
    }

    // Update the assessment status in enhanced_assessments table
    const { data, error } = await supabase
      .from('enhanced_assessments')
      .update({
        status,
        is_active: status === 'live' // Set is_active based on status
      })
      .eq('id', assessmentId)
      .select()
      .single()

    if (error) {
      console.error('Error updating assessment status:', error)
      return NextResponse.json(
        { error: 'Failed to update assessment status', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      assessment: data,
      message: `Assessment status updated to ${status}`
    })
  } catch (error) {
    console.error('Error in update-status API:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

