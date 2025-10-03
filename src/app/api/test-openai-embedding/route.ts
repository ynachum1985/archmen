import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

// Initialize OpenAI
const getOpenAI = () => {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured')
  }
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  })
}

export async function POST(request: NextRequest) {
  try {
    const { text = 'Test embedding text', model = 'text-embedding-3-small' } = await request.json()

    console.log(`Testing embedding generation for text: "${text.substring(0, 100)}..."`)
    console.log(`Using model: ${model}`)

    const openai = getOpenAI()

    const response = await openai.embeddings.create({
      model: model,
      input: text
    })

    if (!response.data || !response.data[0] || !response.data[0].embedding) {
      throw new Error('Invalid embedding response from OpenAI')
    }

    const embedding = response.data[0].embedding
    console.log(`Successfully generated embedding with ${embedding.length} dimensions`)

    return NextResponse.json({
      success: true,
      dimensions: embedding.length,
      model: model,
      textLength: text.length,
      embedding: embedding.slice(0, 5), // Just show first 5 values for testing
      message: 'Embedding generated successfully'
    })

  } catch (error) {
    console.error('Test embedding error:', error)
    
    return NextResponse.json({
      error: 'Embedding generation failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Test OpenAI embedding endpoint. Use POST with { "text": "your text", "model": "text-embedding-3-small" }'
  })
}
