import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { AIModeration } from '@/lib/moderation/ai-moderation'
import { withAPIMiddleware } from '@/lib/middleware/api-validation'
import { z } from 'zod'

// Validation schema
const moderateContentSchema = z.object({
  content: z.string().min(1).max(10000),
  context: z.object({
    userId: z.string().optional(),
    assessmentId: z.string().optional(),
    conversationType: z.enum(['assessment', 'chat', 'feedback']).optional(),
    messageId: z.string().optional()
  }).optional()
})

async function moderateContentHandler(request: NextRequest) {
  try {
    const body = await request.json()
    const { content, context } = moderateContentSchema.parse(body)

    // Initialize moderation system
    const moderation = new AIModeration(
      process.env.OPENAI_API_KEY!,
      process.env.PERSPECTIVE_API_KEY // Optional
    )

    // Run moderation
    const result = await moderation.moderateContent(content, context)

    // If content is blocked, log the incident
    if (result.action === 'block') {
      await logModerationIncident(content, result, context)
    }

    // Return moderation result
    return NextResponse.json({
      success: true,
      moderation: {
        flagged: result.flagged,
        action: result.action,
        confidence: result.confidence,
        categories: result.categories,
        reasoning: result.reasoning
      }
    })

  } catch (error) {
    console.error('Content moderation error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Moderation service temporarily unavailable' },
      { status: 500 }
    )
  }
}

async function logModerationIncident(content: string, result: any, context: any) {
  try {
    const supabase = createClient()
    
    await supabase
      .from('moderation_incidents')
      .insert({
        content_hash: await hashContent(content), // Don't store actual content for privacy
        flagged_categories: Object.keys(result.categories).filter(key => result.categories[key]),
        confidence: result.confidence,
        action_taken: result.action,
        reasoning: result.reasoning,
        user_id: context?.userId,
        assessment_id: context?.assessmentId,
        conversation_type: context?.conversationType,
        created_at: new Date().toISOString()
      })
  } catch (error) {
    console.error('Failed to log moderation incident:', error)
  }
}

async function hashContent(content: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(content)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

export const POST = withAPIMiddleware(moderateContentHandler)
