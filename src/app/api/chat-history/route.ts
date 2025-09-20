import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const assessmentSessionId = searchParams.get('assessmentSessionId')

    if (!assessmentSessionId) {
      return NextResponse.json(
        { error: 'Missing assessmentSessionId' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Get chat history for the assessment session
    const { data: messages, error } = await supabase
      .from('assessment_chat_history')
      .select('*')
      .eq('assessment_session_id', assessmentSessionId)
      .order('message_index', { ascending: true })

    if (error) {
      console.error('Error fetching chat history:', error)
      return NextResponse.json(
        { error: 'Failed to fetch chat history' },
        { status: 500 }
      )
    }

    return NextResponse.json({ messages: messages || [] })
  } catch (error) {
    console.error('Error in chat history API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { assessmentSessionId, userId, messageType, content, messageIndex } = body

    if (!assessmentSessionId || !userId || !messageType || !content || messageIndex === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Add new message to chat history
    const { data, error } = await supabase
      .from('assessment_chat_history')
      .insert({
        assessment_session_id: assessmentSessionId,
        user_id: userId,
        message_type: messageType,
        content: content,
        message_index: messageIndex,
        created_at: new Date().toISOString()
      })
      .select()

    if (error) {
      console.error('Error saving chat message:', error)
      return NextResponse.json(
        { error: 'Failed to save message' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Error in chat history API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
