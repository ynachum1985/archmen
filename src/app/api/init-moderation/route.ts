import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST() {
  try {
    const supabase = createServiceClient()

    // Initialize default moderation settings
    const defaultSettings = [
      {
        setting_name: 'openai_thresholds',
        setting_value: {
          harassment: 0.7,
          harassment_threatening: 0.7,
          hate: 0.7,
          hate_threatening: 0.7,
          self_harm: 0.7,
          self_harm_instructions: 0.7,
          self_harm_intent: 0.7,
          sexual: 0.7,
          sexual_minors: 0.7,
          violence: 0.7,
          violence_graphic: 0.7
        }
      },
      {
        setting_name: 'perspective_thresholds',
        setting_value: {
          TOXICITY: 0.7,
          SEVERE_TOXICITY: 0.7,
          IDENTITY_ATTACK: 0.7,
          INSULT: 0.7,
          PROFANITY: 0.7,
          THREAT: 0.7
        }
      },
      {
        setting_name: 'auto_block_categories',
        setting_value: [
          'harassment_threatening',
          'hate_threatening', 
          'self_harm_instructions',
          'sexual_minors',
          'violence_graphic',
          'SEVERE_TOXICITY',
          'THREAT'
        ]
      },
      {
        setting_name: 'human_review_categories',
        setting_value: [
          'harassment',
          'hate',
          'self_harm',
          'sexual',
          'violence',
          'TOXICITY',
          'IDENTITY_ATTACK',
          'INSULT',
          'PROFANITY'
        ]
      },
      {
        setting_name: 'notification_settings',
        setting_value: {
          email_alerts: true,
          slack_webhook: '',
          alert_threshold: 'high'
        }
      }
    ]

    // Insert settings if they don't exist
    for (const setting of defaultSettings) {
      const { error } = await supabase
        .from('moderation_settings')
        .upsert({
          ...setting,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'setting_name',
          ignoreDuplicates: true
        })

      if (error) {
        console.error(`Failed to initialize ${setting.setting_name}:`, error)
      }
    }

    // Initialize default patterns
    const defaultPatterns = [
      {
        pattern_name: 'Misogynistic Language',
        pattern_regex: '\\b(women are|females are|girls are).*(inferior|stupid|emotional|irrational|weak)',
        category: 'misogyny',
        severity: 'high',
        description: 'Detects generalizations that demean women',
        is_active: true,
        created_by: 'admin'
      },
      {
        pattern_name: 'Toxic Masculinity',
        pattern_regex: '\\b(real men|alpha male|beta male|simp|cuck)\\b',
        category: 'toxic_masculinity',
        severity: 'medium',
        description: 'Detects toxic masculinity terminology',
        is_active: true,
        created_by: 'admin'
      },
      {
        pattern_name: 'Manipulation Tactics',
        pattern_regex: '\\b(gaslight|manipulate|control her|make her).*(jealous|dependent|insecure)',
        category: 'manipulation',
        severity: 'high',
        description: 'Detects relationship manipulation advice',
        is_active: true,
        created_by: 'admin'
      },
      {
        pattern_name: 'Relationship Abuse',
        pattern_regex: '\\b(isolate her|cut off|prevent her from|stop her from).*(friends|family|work|activities)',
        category: 'abuse',
        severity: 'critical',
        description: 'Detects advice promoting isolation and control',
        is_active: true,
        created_by: 'admin'
      }
    ]

    // Insert patterns if they don't exist
    for (const pattern of defaultPatterns) {
      const { error } = await supabase
        .from('moderation_patterns')
        .upsert({
          ...pattern,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'pattern_name',
          ignoreDuplicates: true
        })

      if (error) {
        console.error(`Failed to initialize pattern ${pattern.pattern_name}:`, error)
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Moderation settings and patterns initialized successfully' 
    })

  } catch (error) {
    console.error('Error initializing moderation settings:', error)
    return NextResponse.json({ 
      error: 'Failed to initialize moderation settings' 
    }, { status: 500 })
  }
}
