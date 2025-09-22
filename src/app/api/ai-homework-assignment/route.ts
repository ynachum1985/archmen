import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      userId,
      assessmentId,
      discoveredArchetypes,
      conversationContext,
      userProgress
    } = body

    if (!userId || !discoveredArchetypes || !Array.isArray(discoveredArchetypes)) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Get AI homework suggestions based on archetypes
    const archetypeIds = discoveredArchetypes.map(a => a.id).filter(Boolean)
    
    let suggestionsQuery = supabase
      .from('ai_homework_suggestions')
      .select('*')
      .eq('is_active', true)

    if (archetypeIds.length > 0) {
      suggestionsQuery = suggestionsQuery.in('archetype_id', archetypeIds)
    } else {
      // Get generic suggestions if no specific archetype IDs
      suggestionsQuery = suggestionsQuery.is('archetype_id', null)
    }

    const { data: suggestions, error: suggestionsError } = await suggestionsQuery

    if (suggestionsError) {
      console.error('Error fetching AI suggestions:', suggestionsError)
      return NextResponse.json(
        { error: 'Failed to fetch homework suggestions' },
        { status: 500 }
      )
    }

    // Get user's existing tasks to avoid duplicates
    const { data: existingTasks, error: tasksError } = await supabase
      .from('user_homework_tasks')
      .select('title, task_type')
      .eq('user_id', userId)
      .eq('is_active', true)

    if (tasksError) {
      console.error('Error fetching existing tasks:', tasksError)
    }

    const existingTaskTitles = new Set(existingTasks?.map(t => t.title) || [])

    // Filter suggestions to avoid duplicates and select appropriate ones
    const availableSuggestions = (suggestions || []).filter(s => 
      !existingTaskTitles.has(s.title)
    )

    // AI logic to select appropriate homework based on context
    const selectedHomework = selectHomeworkForUser({
      suggestions: availableSuggestions,
      archetypes: discoveredArchetypes,
      conversationContext,
      userProgress,
      existingTasks: existingTasks || []
    })

    // Create the selected homework tasks
    const createdTasks = []
    for (const homework of selectedHomework) {
      const { data: task, error: createError } = await supabase
        .from('user_homework_tasks')
        .insert({
          user_id: userId,
          assessment_id: assessmentId,
          archetype_id: homework.archetype_id,
          title: homework.title,
          description: homework.description,
          task_type: homework.task_type,
          frequency: homework.frequency,
          frequency_count: homework.frequency_count || 1,
          difficulty_level: homework.difficulty_level,
          estimated_duration_minutes: homework.estimated_duration_minutes,
          instructions: homework.instructions,
          assigned_by: 'ai',
          priority: homework.priority || 3,
          tags: homework.tags || [],
          assigned_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (createError) {
        console.error('Error creating homework task:', createError)
      } else {
        createdTasks.push(task)
      }
    }

    // Generate AI response about the assigned homework
    const aiResponse = generateHomeworkAssignmentResponse({
      assignedTasks: createdTasks,
      archetypes: discoveredArchetypes,
      conversationContext
    })

    return NextResponse.json({
      success: true,
      assignedTasks: createdTasks,
      aiResponse,
      message: `I've assigned ${createdTasks.length} personalized integration practices for you!`
    })

  } catch (error) {
    console.error('Error in AI homework assignment:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function selectHomeworkForUser({
  suggestions,
  archetypes,
  conversationContext,
  userProgress,
  existingTasks
}: {
  suggestions: any[]
  archetypes: any[]
  conversationContext?: string
  userProgress?: any
  existingTasks: any[]
}) {
  const selectedHomework = []
  const primaryArchetype = archetypes.find(a => a.isPrimary) || archetypes[0]
  
  // Always assign a daily affirmation if none exists
  if (!existingTasks.some(t => t.task_type === 'affirmation')) {
    const affirmationSuggestion = suggestions.find(s => s.task_type === 'affirmation')
    if (affirmationSuggestion) {
      selectedHomework.push({
        ...affirmationSuggestion,
        title: `Daily ${primaryArchetype?.name || 'Archetype'} Affirmation`,
        description: `Strengthen your connection to your ${primaryArchetype?.name || 'primary archetype'} energy`,
        frequency: 'daily',
        frequency_count: 1,
        priority: 1
      })
    }
  }

  // Assign a weekly reflection if none exists
  if (!existingTasks.some(t => t.task_type === 'journaling')) {
    const journalingSuggestion = suggestions.find(s => s.task_type === 'journaling')
    if (journalingSuggestion) {
      selectedHomework.push({
        ...journalingSuggestion,
        title: `Weekly ${primaryArchetype?.name || 'Archetype'} Reflection`,
        description: `Reflect on how your ${primaryArchetype?.name || 'primary archetype'} showed up this week`,
        frequency: 'weekly',
        frequency_count: 1,
        priority: 2
      })
    }
  }

  // Add an integration practice based on archetype
  if (!existingTasks.some(t => t.task_type === 'integration_practice')) {
    const integrationSuggestion = suggestions.find(s => s.task_type === 'integration_practice')
    if (integrationSuggestion) {
      selectedHomework.push({
        ...integrationSuggestion,
        title: `${primaryArchetype?.name || 'Archetype'} Integration Practice`,
        description: `Practice embodying your ${primaryArchetype?.name || 'primary archetype'} in daily situations`,
        frequency: 'weekly',
        frequency_count: 3,
        priority: 2
      })
    }
  }

  // Limit to 3 initial tasks to avoid overwhelming the user
  return selectedHomework.slice(0, 3)
}

function generateHomeworkAssignmentResponse({
  assignedTasks,
  archetypes,
  conversationContext
}: {
  assignedTasks: any[]
  archetypes: any[]
  conversationContext?: string
}) {
  const primaryArchetype = archetypes.find(a => a.isPrimary) || archetypes[0]
  const archetypeName = primaryArchetype?.name || 'your primary archetype'

  if (assignedTasks.length === 0) {
    return `It looks like you already have a good set of integration practices! Keep up the great work with your current homework. Feel free to ask me if you'd like to explore new practices or need guidance with your existing ones.`
  }

  const taskTypes = assignedTasks.map(t => t.task_type)
  let response = `Perfect! Based on our conversation and your ${archetypeName} archetype, I've created some personalized integration practices for you:\n\n`

  assignedTasks.forEach((task, index) => {
    response += `${index + 1}. **${task.title}** (${task.frequency})\n   ${task.description}\n\n`
  })

  response += `These practices are designed to help you:\n`
  response += `• Strengthen your connection to your ${archetypeName} energy\n`
  response += `• Develop greater self-awareness and integration\n`
  response += `• Create positive daily habits aligned with your authentic self\n\n`
  response += `You can schedule these in your calendar below and I'll help you track your progress. Remember, consistency is more important than perfection - even 5 minutes a day can create meaningful change!\n\n`
  response += `How do these practices feel to you? Would you like me to adjust anything or explain more about any of them?`

  return response
}
