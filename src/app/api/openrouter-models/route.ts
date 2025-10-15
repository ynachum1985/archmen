import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const response = await fetch('https://openrouter.ai/api/v1/models', {
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      },
      next: { revalidate: 3600 } // Cache for 1 hour
    })

    if (!response.ok) {
      throw new Error('Failed to fetch OpenRouter models')
    }

    const data = await response.json()
    
    // Transform the data to match our format
    const models = data.data.map((model: any) => ({
      id: model.id,
      name: model.name,
      pricing: {
        prompt: parseFloat(model.pricing.prompt),
        completion: parseFloat(model.pricing.completion),
      },
      contextLength: model.context_length,
      description: model.description
    }))

    return NextResponse.json({ models })
  } catch (error) {
    console.error('Error fetching OpenRouter models:', error)
    return NextResponse.json(
      { error: 'Failed to fetch OpenRouter models' },
      { status: 500 }
    )
  }
}

