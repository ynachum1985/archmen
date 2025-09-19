import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Check which LLM API keys are configured (without exposing the actual keys)
    const envCheck = {
      OPENAI_API_KEY: !!process.env.OPENAI_API_KEY,
      ANTHROPIC_API_KEY: !!process.env.ANTHROPIC_API_KEY,
      KIMI_API_KEY: !!process.env.KIMI_API_KEY,
      GROQ_API_KEY: !!process.env.GROQ_API_KEY,
      PERPLEXITY_API_KEY: !!process.env.PERPLEXITY_API_KEY,
      TOGETHER_API_KEY: !!process.env.TOGETHER_API_KEY,
      OPENROUTER_API_KEY: !!process.env.OPENROUTER_API_KEY,
      // Also check for common variations
      OPENROUTER_API_KEY_ALT: !!process.env.OPENROUTER_KEY,
      NODE_ENV: process.env.NODE_ENV,
      VERCEL_ENV: process.env.VERCEL_ENV
    }
    
    return NextResponse.json({
      message: 'Environment variable check (boolean values only)',
      env: envCheck,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Error checking environment:', error)
    return NextResponse.json(
      { error: 'Failed to check environment' },
      { status: 500 }
    )
  }
}
