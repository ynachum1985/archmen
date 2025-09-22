import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const status = searchParams.get('status')

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId parameter' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    let query = supabase
      .from('user_calendar_events')
      .select(`
        *,
        user_homework_tasks (
          title,
          description,
          task_type,
          difficulty_level,
          estimated_duration_minutes,
          instructions
        )
      `)
      .eq('user_id', userId)

    if (startDate) {
      query = query.gte('start_time', startDate)
    }

    if (endDate) {
      query = query.lte('start_time', endDate)
    }

    if (status) {
      query = query.eq('status', status)
    }

    query = query.order('start_time', { ascending: true })

    const { data: events, error } = await query

    if (error) {
      console.error('Error fetching calendar events:', error)
      return NextResponse.json(
        { error: 'Failed to fetch calendar events' },
        { status: 500 }
      )
    }

    return NextResponse.json({ events: events || [] })
  } catch (error) {
    console.error('Error in calendar events API:', error)
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
      title,
      description,
      startTime,
      endTime,
      isAllDay,
      eventType,
      reminderMinutes,
      location,
      notes,
      recurrenceRule
    } = body

    if (!userId || !title || !startTime || !endTime) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data: event, error } = await supabase
      .from('user_calendar_events')
      .insert({
        user_id: userId,
        homework_task_id: homeworkTaskId,
        title,
        description,
        start_time: startTime,
        end_time: endTime,
        is_all_day: isAllDay || false,
        event_type: eventType || 'homework',
        status: 'scheduled',
        reminder_minutes: reminderMinutes || [15],
        location,
        notes,
        recurrence_rule: recurrenceRule,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating calendar event:', error)
      return NextResponse.json(
        { error: 'Failed to create calendar event' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, event })
  } catch (error) {
    console.error('Error in calendar events API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      eventId,
      title,
      description,
      startTime,
      endTime,
      isAllDay,
      status,
      reminderMinutes,
      location,
      notes,
      recurrenceRule
    } = body

    if (!eventId) {
      return NextResponse.json(
        { error: 'Missing eventId' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const updateData: any = {
      updated_at: new Date().toISOString()
    }

    if (title !== undefined) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (startTime !== undefined) updateData.start_time = startTime
    if (endTime !== undefined) updateData.end_time = endTime
    if (isAllDay !== undefined) updateData.is_all_day = isAllDay
    if (status !== undefined) updateData.status = status
    if (reminderMinutes !== undefined) updateData.reminder_minutes = reminderMinutes
    if (location !== undefined) updateData.location = location
    if (notes !== undefined) updateData.notes = notes
    if (recurrenceRule !== undefined) updateData.recurrence_rule = recurrenceRule

    const { data: event, error } = await supabase
      .from('user_calendar_events')
      .update(updateData)
      .eq('id', eventId)
      .select()
      .single()

    if (error) {
      console.error('Error updating calendar event:', error)
      return NextResponse.json(
        { error: 'Failed to update calendar event' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, event })
  } catch (error) {
    console.error('Error in calendar events API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const eventId = searchParams.get('eventId')

    if (!eventId) {
      return NextResponse.json(
        { error: 'Missing eventId parameter' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { error } = await supabase
      .from('user_calendar_events')
      .delete()
      .eq('id', eventId)

    if (error) {
      console.error('Error deleting calendar event:', error)
      return NextResponse.json(
        { error: 'Failed to delete calendar event' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in calendar events API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
