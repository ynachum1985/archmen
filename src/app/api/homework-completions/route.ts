import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const taskId = searchParams.get('taskId')
    const limit = searchParams.get('limit')

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId parameter' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    let query = supabase
      .from('homework_task_completions')
      .select(`
        *,
        user_homework_tasks (
          title,
          task_type,
          difficulty_level
        )
      `)
      .eq('user_id', userId)

    if (taskId) {
      query = query.eq('homework_task_id', taskId)
    }

    if (limit) {
      query = query.limit(parseInt(limit))
    }

    query = query.order('completed_at', { ascending: false })

    const { data: completions, error } = await query

    if (error) {
      console.error('Error fetching homework completions:', error)
      return NextResponse.json(
        { error: 'Failed to fetch homework completions' },
        { status: 500 }
      )
    }

    return NextResponse.json({ completions: completions || [] })
  } catch (error) {
    console.error('Error in homework completions API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      userId,
      homeworkTaskId,
      completionRating,
      completionNotes,
      timeSpentMinutes,
      moodBefore,
      moodAfter,
      insights,
      challenges,
      metadata
    } = body

    if (!userId || !homeworkTaskId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data: completion, error } = await supabase
      .from('homework_task_completions')
      .insert({
        user_id: userId,
        homework_task_id: homeworkTaskId,
        completion_rating: completionRating,
        completion_notes: completionNotes,
        time_spent_minutes: timeSpentMinutes,
        mood_before: moodBefore,
        mood_after: moodAfter,
        insights,
        challenges,
        metadata: metadata || {},
        completed_at: new Date().toISOString(),
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating homework completion:', error)
      return NextResponse.json(
        { error: 'Failed to create homework completion' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, completion })
  } catch (error) {
    console.error('Error in homework completions API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
