import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { z } from 'zod'

const ModerationSettingsSchema = z.object({
  openai_thresholds: z.object({
    block: z.number().min(0).max(1),
    flag: z.number().min(0).max(1),
    allow: z.number().min(0).max(1)
  }),
  perspective_thresholds: z.object({
    toxicity: z.number().min(0).max(1),
    severe_toxicity: z.number().min(0).max(1),
    identity_attack: z.number().min(0).max(1),
    insult: z.number().min(0).max(1),
    profanity: z.number().min(0).max(1),
    threat: z.number().min(0).max(1)
  }),
  auto_block_categories: z.array(z.string()),
  human_review_categories: z.array(z.string()),
  notification_settings: z.object({
    admin_email: z.boolean(),
    slack_webhook: z.boolean(),
    dashboard_alerts: z.boolean()
  })
})

export async function GET() {
  try {
    const supabase = createServiceClient()

    // Check if user is admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    // Load moderation settings using service role for admin access
    const serviceSupabase = createServiceClient()
    const { data: settingsData, error } = await serviceSupabase
      .from('moderation_settings')
      .select('setting_name, setting_value')

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to load settings' }, { status: 500 })
    }

    // Convert settings array to object
    const settings: any = {}
    settingsData?.forEach(setting => {
      settings[setting.setting_name] = setting.setting_value
    })

    return NextResponse.json({ settings })
  } catch (error) {
    console.error('Error loading moderation settings:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = createClient()

    // Check if user is admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const body = await request.json()
    const validatedSettings = ModerationSettingsSchema.parse(body)

    // Update each setting individually using service role
    const serviceSupabase = createServiceClient()
    const updates = [
      { setting_name: 'openai_thresholds', setting_value: validatedSettings.openai_thresholds },
      { setting_name: 'perspective_thresholds', setting_value: validatedSettings.perspective_thresholds },
      { setting_name: 'auto_block_categories', setting_value: validatedSettings.auto_block_categories },
      { setting_name: 'human_review_categories', setting_value: validatedSettings.human_review_categories },
      { setting_name: 'notification_settings', setting_value: validatedSettings.notification_settings }
    ]

    for (const update of updates) {
      const { error } = await serviceSupabase
        .from('moderation_settings')
        .update({
          setting_value: update.setting_value,
          updated_at: new Date().toISOString()
        })
        .eq('setting_name', update.setting_name)

      if (error) {
        console.error(`Failed to update ${update.setting_name}:`, error)
        return NextResponse.json({ 
          error: `Failed to update ${update.setting_name}` 
        }, { status: 500 })
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Settings updated successfully' 
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Invalid settings format',
        details: error.errors 
      }, { status: 400 })
    }

    console.error('Error updating moderation settings:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
