import { NextRequest, NextResponse } from 'next/server'
import { AIModeration } from '@/lib/moderation/ai-moderation'

export async function POST(request: NextRequest) {
  try {
    const { content } = await request.json()
    
    if (!content) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      )
    }

    // Initialize moderation system
    const moderation = new AIModeration(
      process.env.OPENAI_API_KEY!,
      process.env.PERSPECTIVE_API_KEY // Optional
    )

    // Test content moderation
    const result = await moderation.moderateContent(content, {
      userId: 'test-user',
      conversationType: 'chat'
    })

    return NextResponse.json({
      success: true,
      content: content.substring(0, 100) + (content.length > 100 ? '...' : ''),
      moderation: {
        flagged: result.flagged,
        action: result.action,
        confidence: result.confidence,
        categories: result.categories,
        reasoning: result.reasoning
      }
    })

  } catch (error) {
    console.error('Moderation test error:', error)
    return NextResponse.json(
      { error: 'Moderation test failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// Test cases for different types of content
export async function GET() {
  const testCases = [
    {
      name: 'Safe content',
      content: 'I want to improve my communication skills in relationships and be more understanding.'
    },
    {
      name: 'Misogynistic content',
      content: 'Women are all emotional and irrational, you need to control them to have a good relationship.'
    },
    {
      name: 'Manipulation advice',
      content: 'You should gaslight her and make her think she\'s crazy when she questions you.'
    },
    {
      name: 'Toxic masculinity',
      content: 'Real men don\'t cry or show emotions, that\'s weakness and women don\'t respect weak men.'
    },
    {
      name: 'Relationship abuse',
      content: 'If she says no, just keep trying until she gives in. Force her to be intimate.'
    },
    {
      name: 'Borderline content',
      content: 'Sometimes you need to be firm with women and show them who\'s in charge.'
    }
  ]

  return NextResponse.json({
    message: 'Moderation test cases',
    testCases,
    instructions: 'POST to this endpoint with {"content": "text to test"} to test moderation'
  })
}
