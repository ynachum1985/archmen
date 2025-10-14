import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

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

    const supabase = await createClient()

    // Update the assessment status
    const { data, error } = await supabase
      .from('assessments')
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
        { error: 'Failed to update assessment status' },
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
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

