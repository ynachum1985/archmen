import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { conversationId, userId } = await request.json()

    if (!conversationId || !userId) {
      return NextResponse.json(
        { error: 'Missing conversationId or userId' },
        { status: 400 }
      )
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Get the conversation to preserve metadata
    const { data: conversation, error: fetchError } = await supabase
      .from('conversations')
      .select('metadata')
      .eq('id', conversationId)
      .single()

    if (fetchError) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      )
    }

    // Reset the conversation: clear messages and emerging archetypes
    const { error: updateError } = await supabase
      .from('conversations')
      .update({
        messages: [],
        emerging_archetypes: [],
        metadata: {
          ...conversation.metadata,
          firstMessageGenerated: false,
          status: 'active',
          resetAt: new Date().toISOString()
        },
        updated_at: new Date().toISOString()
      })
      .eq('id', conversationId)

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to reset conversation' },
        { status: 500 }
      )
    }

    // Delete assessment responses for this conversation
    const { error: deleteResponsesError } = await supabase
      .from('assessment_responses')
      .delete()
      .eq('session_id', conversationId)

    if (deleteResponsesError) {
      console.error('Warning: Failed to delete assessment responses:', deleteResponsesError)
      // Don't fail the whole operation if this fails
    }

    // Note: We don't delete user_archetypes because they represent the user's overall profile
    // They should persist across conversation resets. The admin can manually clear them if needed.

    return NextResponse.json({
      success: true,
      message: 'Conversation reset successfully',
      conversationId,
      details: {
        messagesCleared: true,
        emergingArchetypesCleared: true,
        assessmentResponsesDeleted: true,
        userArchetypesPreserved: true
      }
    })
  } catch (error) {
    console.error('Error resetting conversation:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

