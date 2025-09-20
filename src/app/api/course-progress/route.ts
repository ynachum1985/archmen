import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const assessmentId = searchParams.get('assessmentId')

    if (!userId || !assessmentId) {
      return NextResponse.json(
        { error: 'Missing userId or assessmentId' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Get user's course progress
    const { data: progress, error } = await supabase
      .from('user_course_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('assessment_id', assessmentId)
      .order('week_number', { ascending: true })

    if (error) {
      console.error('Error fetching course progress:', error)
      return NextResponse.json(
        { error: 'Failed to fetch course progress' },
        { status: 500 }
      )
    }

    return NextResponse.json({ progress: progress || [] })
  } catch (error) {
    console.error('Error in course progress API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, assessmentId, weekNumber, action } = body

    if (!userId || !assessmentId || !weekNumber || !action) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    if (action === 'complete') {
      // Mark week as completed
      const { data, error } = await supabase
        .from('user_course_progress')
        .upsert({
          user_id: userId,
          assessment_id: assessmentId,
          week_number: weekNumber,
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()

      if (error) {
        console.error('Error updating course progress:', error)
        return NextResponse.json(
          { error: 'Failed to update progress' },
          { status: 500 }
        )
      }

      // Auto-unlock next week if this was a free week or user has paid access
      if (weekNumber < 6) {
        await supabase
          .from('user_course_progress')
          .upsert({
            user_id: userId,
            assessment_id: assessmentId,
            week_number: weekNumber + 1,
            unlocked_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
      }

      return NextResponse.json({ success: true, data })
    }

    if (action === 'unlock') {
      // Unlock a specific week (for paid users)
      const { data, error } = await supabase
        .from('user_course_progress')
        .upsert({
          user_id: userId,
          assessment_id: assessmentId,
          week_number: weekNumber,
          unlocked_at: new Date().toISOString(),
          payment_status: 'paid',
          updated_at: new Date().toISOString()
        })
        .select()

      if (error) {
        console.error('Error unlocking week:', error)
        return NextResponse.json(
          { error: 'Failed to unlock week' },
          { status: 500 }
        )
      }

      return NextResponse.json({ success: true, data })
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error in course progress API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
