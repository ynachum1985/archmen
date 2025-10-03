import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Test environment variable access
    const envVars = {
      NEXT_PUBLIC_SUPABASE_URL: {
        exists: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        value: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'NOT_SET',
        length: process.env.NEXT_PUBLIC_SUPABASE_URL?.length || 0
      },
      NEXT_PUBLIC_SUPABASE_ANON_KEY: {
        exists: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        value: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'NOT_SET',
        length: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length || 0
      },
      SUPABASE_SERVICE_ROLE_KEY: {
        exists: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        value: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'NOT_SET',
        length: process.env.SUPABASE_SERVICE_ROLE_KEY?.length || 0
      },
      OPENAI_API_KEY: {
        exists: !!process.env.OPENAI_API_KEY,
        value: process.env.OPENAI_API_KEY ? 'SET' : 'NOT_SET',
        length: process.env.OPENAI_API_KEY?.length || 0
      }
    }

    return NextResponse.json({
      message: 'Environment variable test',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      vercel: {
        region: process.env.VERCEL_REGION || 'unknown',
        deployment_id: process.env.VERCEL_DEPLOYMENT_ID || 'unknown'
      },
      envVars
    })
  } catch (error) {
    console.error('Environment variable test error:', error)
    return NextResponse.json(
      { 
        error: 'Environment variable test failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
