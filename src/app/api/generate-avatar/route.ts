import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      text,
      voice = 'female-1',
      style = 'professional',
      archetype = 'Archetype'
    } = body

    if (!text?.trim()) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 })
    }

    const supabase = await createClient()

    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // Check if D-ID API key is available
    if (!process.env.DID_API_KEY) {
      return NextResponse.json({
        success: false,
        error: 'D-ID API key not configured',
        message: 'Avatar generation requires D-ID API key to be set in environment variables'
      }, { status: 501 })
    }

    // D-ID API integration
    const voiceConfig = getVoiceConfig(voice)
    const styleConfig = getStyleConfig(style)

    const didResponse = await fetch('https://api.d-id.com/talks', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${process.env.DID_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        script: {
          type: 'text',
          input: text,
          provider: {
            type: voiceConfig.provider,
            voice_id: voiceConfig.voice_id,
            voice_config: {
              style: styleConfig
            }
          }
        },
        source_url: 'https://d-id-public-bucket.s3.amazonaws.com/alice.jpg', // Default D-ID avatar
        config: {
          fluent: true,
          pad_audio: 0.0,
          driver_expressions: {
            expressions: [
              {
                start_frame: 0,
                expression: 'neutral',
                intensity: 1.0
              }
            ]
          }
        }
      })
    })

    const didData = await didResponse.json()

    if (!didResponse.ok) {
      throw new Error(didData.error || 'Failed to generate avatar')
    }

    // Poll for completion
    const talkId = didData.id
    let videoUrl = ''

    // Wait for video generation to complete
    for (let i = 0; i < 30; i++) { // Max 30 attempts (5 minutes)
      await new Promise(resolve => setTimeout(resolve, 10000)) // Wait 10 seconds

      const statusResponse = await fetch(`https://api.d-id.com/talks/${talkId}`, {
        headers: {
          'Authorization': `Basic ${process.env.DID_API_KEY}`,
        }
      })

      const statusData = await statusResponse.json()

      if (statusData.status === 'done') {
        videoUrl = statusData.result_url
        break
      } else if (statusData.status === 'error') {
        throw new Error('Avatar generation failed')
      }
    }

    if (!videoUrl) {
      throw new Error('Avatar generation timed out')
    }

    // Return successful response
    return NextResponse.json({
      success: true,
      videoUrl,
      talkId,
      provider: 'd-id',
      text,
      voice,
      style,
      archetype,
      message: 'Avatar generated successfully!'
    })

  } catch (error) {
    console.error('Error in generate avatar API:', error)

    return NextResponse.json({
      error: 'Avatar generation coming soon',
      details: 'This feature is being implemented with D-ID API integration'
    }, { status: 501 }) // 501 Not Implemented
  }
}

// Helper function to get voice configuration
function getVoiceConfig(voice: string) {
  const voiceMap = {
    'female-1': { provider: 'microsoft', voice_id: 'en-US-JennyNeural' },
    'female-2': { provider: 'microsoft', voice_id: 'en-US-AriaNeural' },
    'male-1': { provider: 'microsoft', voice_id: 'en-US-GuyNeural' },
    'male-2': { provider: 'microsoft', voice_id: 'en-US-DavisNeural' }
  }
  
  return voiceMap[voice as keyof typeof voiceMap] || voiceMap['female-1']
}

// Helper function to get style configuration
function getStyleConfig(style: string) {
  const styleMap = {
    'professional': 'professional',
    'friendly': 'friendly',
    'wise': 'calm',
    'energetic': 'excited'
  }
  
  return styleMap[style as keyof typeof styleMap] || 'professional'
}
