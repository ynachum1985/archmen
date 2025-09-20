import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import OpenAI from 'openai'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      prompt,
      provider = 'openai',
      model = 'dall-e-3',
      size = '1024x1024',
      quality = 'standard',
      style = 'vivid',
      // Legacy support
      archetypeName,
      description,
      style: legacyStyle = 'mystical'
    } = body

    // Handle legacy format
    let finalPrompt = prompt
    if (!prompt && archetypeName) {
      finalPrompt = createArchetypePrompt(archetypeName, description, legacyStyle)
    }

    if (!finalPrompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
    }

    const supabase = await createClient()

    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    let imageUrl: string

    if (provider === 'openai') {
      if (!process.env.OPENAI_API_KEY) {
        return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 })
      }

      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      })

      const response = await openai.images.generate({
        model: model,
        prompt: finalPrompt,
        size: size as '256x256' | '512x512' | '1024x1024' | '1792x1024' | '1024x1792',
        quality: quality as 'standard' | 'hd',
        style: style as 'vivid' | 'natural',
        n: 1,
      })

      imageUrl = response.data[0]?.url || ''

    } else if (provider === 'openrouter') {
      if (!process.env.OPENROUTER_API_KEY) {
        return NextResponse.json({ error: 'OpenRouter API key not configured' }, { status: 500 })
      }

      // For OpenRouter image generation, we'll use a different approach
      // Since OpenRouter doesn't have a direct images.generate endpoint like OpenAI
      // We'll need to use their chat completion with image generation models
      const openrouter = new OpenAI({
        apiKey: process.env.OPENROUTER_API_KEY,
        baseURL: 'https://openrouter.ai/api/v1'
      })

      try {
        const response = await openrouter.images.generate({
          model: model,
          prompt: finalPrompt,
          size: size as '256x256' | '512x512' | '1024x1024' | '1792x1024' | '1024x1792',
          n: 1,
        })

        imageUrl = response.data[0]?.url || ''
      } catch (error) {
        // If direct image generation fails, return an error with suggestion
        console.error('OpenRouter image generation error:', error)
        return NextResponse.json({
          error: 'OpenRouter image generation not available. Please use OpenAI provider for image generation.'
        }, { status: 400 })
      }

    } else {
      return NextResponse.json({ error: 'Unsupported provider' }, { status: 400 })
    }

    if (!imageUrl) {
      return NextResponse.json({ error: 'Failed to generate image' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      imageUrl,
      provider,
      model,
      prompt: finalPrompt
    })

  } catch (error) {
    console.error('Error in generate image API:', error)

    // Handle specific OpenAI errors
    if (error instanceof Error) {
      if (error.message.includes('content_policy_violation')) {
        return NextResponse.json({
          error: 'Content policy violation: Please modify your prompt to comply with content guidelines'
        }, { status: 400 })
      }

      if (error.message.includes('rate_limit_exceeded')) {
        return NextResponse.json({
          error: 'Rate limit exceeded: Please try again later'
        }, { status: 429 })
      }

      if (error.message.includes('insufficient_quota')) {
        return NextResponse.json({
          error: 'Insufficient quota: Please check your API usage'
        }, { status: 402 })
      }
    }

    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

function createArchetypePrompt(archetypeName: string, description: string, style: string): string {
  const stylePrompts = {
    mystical: "mystical, ethereal, soft lighting, spiritual energy, flowing forms",
    modern: "clean, contemporary, minimalist, professional, sophisticated",
    artistic: "artistic, painterly, expressive, creative, inspirational",
    nature: "natural, organic, earth tones, harmonious with nature",
    geometric: "geometric patterns, sacred geometry, symmetrical, balanced"
  }

  const styleDescription = stylePrompts[style as keyof typeof stylePrompts] || stylePrompts.mystical

  return `Create a symbolic representation of "${archetypeName}" - ${description}. 
    Style: ${styleDescription}. 
    The image should be suitable for a psychology/personal development context, 
    avoiding literal representations of people. Focus on symbols, abstract concepts, 
    and metaphorical imagery that represents the archetype's essence. 
    The image should feel inspiring, professional, and appropriate for a wellness application.
    Avoid text, words, or letters in the image.`
} 