import { NextResponse } from 'next/server'
import OpenAI from 'openai'

// Initialize OpenAI client
const openai = process.env.OPENAI_API_KEY 
  ? new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
  : null

export async function POST(request: Request) {
  try {
    // Check if OpenAI is configured
    if (!openai) {
      return NextResponse.json(
        { error: 'OpenAI API key is not configured. Please set OPENAI_API_KEY environment variable.' },
        { status: 500 }
      )
    }

    const { archetypeName, description, style = 'mystical' } = await request.json()
    
    if (!archetypeName) {
      return NextResponse.json(
        { error: 'Archetype name is required' },
        { status: 400 }
      )
    }

    // Create a detailed prompt for the archetype image
    const prompt = createArchetypePrompt(archetypeName, description, style)

    // Generate the image using DALL-E 3
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      n: 1,
      size: "1024x1024",
      quality: "standard",
      style: "natural", // or "vivid" for more dramatic results
    })

    const imageUrl = response.data?.[0]?.url

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'Failed to generate image' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      imageUrl,
      prompt: prompt // Return the prompt for reference
    })
    
  } catch (error: unknown) {
    console.error('Error generating image:', error)
    
    // Handle specific OpenAI errors
    if (error instanceof Error && error.message.includes('content_policy_violation')) {
      return NextResponse.json(
        { error: 'Content policy violation. Please try a different description.' },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to generate image' },
      { status: 500 }
    )
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