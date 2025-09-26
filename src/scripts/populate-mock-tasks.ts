import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Mock task data for different assessments
const mockTasks = [
  // Level 1 - Foundation Assessment Tasks
  {
    assessment_id: '550e8400-e29b-41d4-a716-446655440001', // Foundation Assessment
    tasks: [
      {
        title: 'Daily Self-Reflection Journal',
        description: 'Write 3 things you learned about yourself today and one pattern you noticed.',
        task_type: 'journaling',
        frequency: 'daily',
        difficulty_level: 'beginner',
        estimated_duration_minutes: 10,
        priority: 1,
        tags: ['self-awareness', 'reflection']
      },
      {
        title: 'Morning Intention Setting',
        description: 'Set a clear intention for how you want to show up in the world today.',
        task_type: 'reflection',
        frequency: 'daily',
        difficulty_level: 'beginner',
        estimated_duration_minutes: 5,
        priority: 2,
        tags: ['intention', 'mindfulness']
      },
      {
        title: 'Weekly Pattern Recognition',
        description: 'Review your week and identify recurring emotional or behavioral patterns.',
        task_type: 'reflection',
        frequency: 'weekly',
        difficulty_level: 'intermediate',
        estimated_duration_minutes: 20,
        priority: 1,
        tags: ['patterns', 'awareness']
      }
    ]
  },
  // Level 1 - Shadow Work Introduction
  {
    assessment_id: '550e8400-e29b-41d4-a716-446655440002',
    tasks: [
      {
        title: 'Shadow Trigger Awareness',
        description: 'Notice when you feel triggered and write down what specifically bothered you.',
        task_type: 'shadow_work',
        frequency: 'daily',
        difficulty_level: 'beginner',
        estimated_duration_minutes: 8,
        priority: 1,
        tags: ['shadow', 'triggers', 'awareness']
      },
      {
        title: 'Projection Reflection',
        description: 'When you judge someone, ask: "How might this quality exist in me?"',
        task_type: 'shadow_work',
        frequency: 'daily',
        difficulty_level: 'intermediate',
        estimated_duration_minutes: 10,
        priority: 2,
        tags: ['projection', 'shadow', 'self-inquiry']
      }
    ]
  },
  // Level 2 - Relationship Dynamics
  {
    assessment_id: '550e8400-e29b-41d4-a716-446655440003',
    tasks: [
      {
        title: 'Relationship Pattern Mapping',
        description: 'Map out recurring patterns in your close relationships and identify your role.',
        task_type: 'reflection',
        frequency: 'weekly',
        difficulty_level: 'intermediate',
        estimated_duration_minutes: 25,
        priority: 1,
        tags: ['relationships', 'patterns', 'dynamics']
      },
      {
        title: 'Boundary Practice',
        description: 'Practice saying no to one small request today with kindness and clarity.',
        task_type: 'behavioral_change',
        frequency: 'daily',
        difficulty_level: 'intermediate',
        estimated_duration_minutes: 5,
        priority: 2,
        tags: ['boundaries', 'practice', 'communication']
      },
      {
        title: 'Empathy vs Codependency Check',
        description: 'When helping others, ask: "Am I helping from love or from need?"',
        task_type: 'reflection',
        frequency: 'daily',
        difficulty_level: 'advanced',
        estimated_duration_minutes: 8,
        priority: 1,
        tags: ['empathy', 'codependency', 'boundaries']
      }
    ]
  },
  // Level 2 - Career & Purpose
  {
    assessment_id: '550e8400-e29b-41d4-a716-446655440004',
    tasks: [
      {
        title: 'Values Alignment Check',
        description: 'Rate how well your current work aligns with your core values (1-10).',
        task_type: 'reflection',
        frequency: 'weekly',
        difficulty_level: 'beginner',
        estimated_duration_minutes: 15,
        priority: 1,
        tags: ['values', 'career', 'alignment']
      },
      {
        title: 'Purpose Meditation',
        description: 'Spend 10 minutes in quiet reflection asking: "What wants to emerge through me?"',
        task_type: 'meditation',
        frequency: 'daily',
        difficulty_level: 'intermediate',
        estimated_duration_minutes: 10,
        priority: 2,
        tags: ['purpose', 'meditation', 'calling']
      },
      {
        title: 'Skill Development Planning',
        description: 'Identify one skill that would help you express your purpose more fully.',
        task_type: 'reflection',
        frequency: 'monthly',
        difficulty_level: 'intermediate',
        estimated_duration_minutes: 30,
        priority: 1,
        tags: ['skills', 'development', 'growth']
      }
    ]
  },
  // Level 3 - Advanced Shadow Integration
  {
    assessment_id: '550e8400-e29b-41d4-a716-446655440005',
    tasks: [
      {
        title: 'Shadow Integration Dialogue',
        description: 'Have a written conversation with a disowned part of yourself.',
        task_type: 'shadow_work',
        frequency: 'weekly',
        difficulty_level: 'advanced',
        estimated_duration_minutes: 30,
        priority: 1,
        tags: ['shadow', 'integration', 'dialogue']
      },
      {
        title: 'Unconscious Pattern Interruption',
        description: 'Catch yourself in an unconscious pattern and consciously choose differently.',
        task_type: 'behavioral_change',
        frequency: 'daily',
        difficulty_level: 'advanced',
        estimated_duration_minutes: 5,
        priority: 1,
        tags: ['patterns', 'consciousness', 'choice']
      }
    ]
  },
  // Level 3 - Spiritual Integration
  {
    assessment_id: '550e8400-e29b-41d4-a716-446655440006',
    tasks: [
      {
        title: 'Sacred Practice',
        description: 'Engage in a practice that connects you to something greater than yourself.',
        task_type: 'meditation',
        frequency: 'daily',
        difficulty_level: 'intermediate',
        estimated_duration_minutes: 20,
        priority: 1,
        tags: ['spiritual', 'sacred', 'connection']
      },
      {
        title: 'Meaning-Making Reflection',
        description: 'Reflect on how your challenges are serving your spiritual growth.',
        task_type: 'reflection',
        frequency: 'weekly',
        difficulty_level: 'advanced',
        estimated_duration_minutes: 25,
        priority: 1,
        tags: ['meaning', 'growth', 'spiritual']
      }
    ]
  }
]

async function populateMockTasks() {
  try {
    console.log('Starting to populate mock tasks...')

    // Get all users to assign tasks to
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('id')
      .limit(10) // Limit to first 10 users for testing

    if (usersError) {
      console.error('Error fetching users:', usersError)
      return
    }

    if (!users || users.length === 0) {
      console.log('No users found to assign tasks to')
      return
    }

    console.log(`Found ${users.length} users`)

    // For each user, create tasks for each assessment
    for (const user of users) {
      console.log(`Creating tasks for user ${user.id}`)

      for (const assessmentTasks of mockTasks) {
        for (const task of assessmentTasks.tasks) {
          // Create due dates - some past, some future
          const daysOffset = Math.floor(Math.random() * 14) - 7 // -7 to +7 days
          const dueDate = new Date()
          dueDate.setDate(dueDate.getDate() + daysOffset)

          // Randomly mark some tasks as completed
          const isCompleted = Math.random() < 0.3 // 30% chance of being completed
          const completedAt = isCompleted ? new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) : null

          const taskData = {
            user_id: user.id,
            assessment_id: assessmentTasks.assessment_id,
            title: task.title,
            description: task.description,
            task_type: task.task_type,
            frequency: task.frequency,
            difficulty_level: task.difficulty_level,
            estimated_duration_minutes: task.estimated_duration_minutes,
            priority: task.priority,
            tags: task.tags,
            due_date: dueDate.toISOString(),
            completed_at: completedAt?.toISOString() || null,
            assigned_by: 'ai',
            is_active: true,
            assigned_at: new Date().toISOString()
          }

          const { error: insertError } = await supabase
            .from('user_homework_tasks')
            .insert(taskData)

          if (insertError) {
            console.error('Error inserting task:', insertError)
          }
        }
      }
    }

    console.log('Successfully populated mock tasks!')

    // Show summary
    const { data: taskCount, error: countError } = await supabase
      .from('user_homework_tasks')
      .select('id', { count: 'exact' })

    if (!countError) {
      console.log(`Total tasks in database: ${taskCount?.length || 0}`)
    }

  } catch (error) {
    console.error('Error populating mock tasks:', error)
  }
}

// Run the script
populateMockTasks()
