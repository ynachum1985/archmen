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

    // Environment variable debugging
    console.log('=== ENVIRONMENT VARIABLE CHECK ===')
    console.log('NEXT_PUBLIC_SUPABASE_URL:', !!process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30) + '...')
    console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 30) + '...')
    console.log('SUPABASE_SERVICE_ROLE_KEY:', !!process.env.SUPABASE_SERVICE_ROLE_KEY, process.env.SUPABASE_SERVICE_ROLE_KEY?.substring(0, 30) + '...')
    console.log('OPENAI_API_KEY:', !!process.env.OPENAI_API_KEY, process.env.OPENAI_API_KEY?.substring(0, 30) + '...')
    console.log('=== END ENVIRONMENT CHECK ===')

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
  try {
    // Environment variable debugging
    console.log('=== ENVIRONMENT VARIABLE CHECK (GET) ===')
    console.log('NEXT_PUBLIC_SUPABASE_URL:', !!process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30) + '...')
    console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 30) + '...')
    console.log('SUPABASE_SERVICE_ROLE_KEY:', !!process.env.SUPABASE_SERVICE_ROLE_KEY, process.env.SUPABASE_SERVICE_ROLE_KEY?.substring(0, 30) + '...')
    console.log('OPENAI_API_KEY:', !!process.env.OPENAI_API_KEY, process.env.OPENAI_API_KEY?.substring(0, 30) + '...')
    console.log('=== END ENVIRONMENT CHECK ===')

    return NextResponse.json({
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      hasOpenAIKey: !!process.env.OPENAI_API_KEY,
      supabaseUrlLength: process.env.NEXT_PUBLIC_SUPABASE_URL?.length || 0,
      anonKeyLength: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length || 0,
      serviceKeyLength: process.env.SUPABASE_SERVICE_ROLE_KEY?.length || 0,
      openaiKeyLength: process.env.OPENAI_API_KEY?.length || 0,
      timestamp: new Date().toISOString()
    })
  } catch (error: any) {
    console.error('Environment check error:', error)
    return NextResponse.json({ error: 'Environment check failed', details: error.message }, { status: 500 })
  }
}
