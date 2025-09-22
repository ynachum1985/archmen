import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const assessmentId = searchParams.get('assessmentId')
    const isActive = searchParams.get('isActive')

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId parameter' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    let query = supabase
      .from('user_homework_tasks')
      .select(`
        *,
        enhanced_archetypes (
          name,
          description
        )
      `)
      .eq('user_id', userId)

    if (assessmentId) {
      query = query.eq('assessment_id', assessmentId)
    }

    if (isActive !== null) {
      query = query.eq('is_active', isActive === 'true')
    }

    query = query.order('priority', { ascending: true })
      .order('created_at', { ascending: false })

    const { data: tasks, error } = await query

    if (error) {
      console.error('Error fetching homework tasks:', error)
      return NextResponse.json(
        { error: 'Failed to fetch homework tasks' },
        { status: 500 }
      )
    }

    return NextResponse.json({ tasks: tasks || [] })
  } catch (error) {
    console.error('Error in homework tasks API:', error)
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
      assessmentId,
      archetypeId,
      title,
      description,
      taskType,
      frequency,
      frequencyCount,
      difficultyLevel,
      estimatedDurationMinutes,
      instructions,
      assignedBy,
      dueDate,
      priority,
      tags
    } = body

    if (!userId || !title || !taskType || !frequency) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data: task, error } = await supabase
      .from('user_homework_tasks')
      .insert({
        user_id: userId,
        assessment_id: assessmentId,
        archetype_id: archetypeId,
        title,
        description,
        task_type: taskType,
        frequency,
        frequency_count: frequencyCount || 1,
        difficulty_level: difficultyLevel || 'beginner',
        estimated_duration_minutes: estimatedDurationMinutes || 15,
        instructions: instructions || {},
        assigned_by: assignedBy || 'ai',
        due_date: dueDate,
        priority: priority || 3,
        tags: tags || [],
        assigned_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating homework task:', error)
      return NextResponse.json(
        { error: 'Failed to create homework task' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, task })
  } catch (error) {
    console.error('Error in homework tasks API:', error)
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
      taskId,
      title,
      description,
      taskType,
      frequency,
      frequencyCount,
      difficultyLevel,
      estimatedDurationMinutes,
      instructions,
      dueDate,
      priority,
      tags,
      isActive,
      completedAt,
      completionNotes
    } = body

    if (!taskId) {
      return NextResponse.json(
        { error: 'Missing taskId' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const updateData: any = {
      updated_at: new Date().toISOString()
    }

    if (title !== undefined) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (taskType !== undefined) updateData.task_type = taskType
    if (frequency !== undefined) updateData.frequency = frequency
    if (frequencyCount !== undefined) updateData.frequency_count = frequencyCount
    if (difficultyLevel !== undefined) updateData.difficulty_level = difficultyLevel
    if (estimatedDurationMinutes !== undefined) updateData.estimated_duration_minutes = estimatedDurationMinutes
    if (instructions !== undefined) updateData.instructions = instructions
    if (dueDate !== undefined) updateData.due_date = dueDate
    if (priority !== undefined) updateData.priority = priority
    if (tags !== undefined) updateData.tags = tags
    if (isActive !== undefined) updateData.is_active = isActive
    if (completedAt !== undefined) updateData.completed_at = completedAt
    if (completionNotes !== undefined) updateData.completion_notes = completionNotes

    const { data: task, error } = await supabase
      .from('user_homework_tasks')
      .update(updateData)
      .eq('id', taskId)
      .select()
      .single()

    if (error) {
      console.error('Error updating homework task:', error)
      return NextResponse.json(
        { error: 'Failed to update homework task' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, task })
  } catch (error) {
    console.error('Error in homework tasks API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const taskId = searchParams.get('taskId')

    if (!taskId) {
      return NextResponse.json(
        { error: 'Missing taskId parameter' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { error } = await supabase
      .from('user_homework_tasks')
      .delete()
      .eq('id', taskId)

    if (error) {
      console.error('Error deleting homework task:', error)
      return NextResponse.json(
        { error: 'Failed to delete homework task' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in homework tasks API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
