import { NextRequest, NextResponse } from 'next/server'
import { enhancedAIService } from '@/lib/services/enhanced-ai.service'

export async function POST(request: NextRequest) {
  try {
    const { personalityId, personalityName, content } = await request.json()

    if (!personalityId || !personalityName || !content) {
      return NextResponse.json(
        { error: 'Missing required fields: personalityId, personalityName, content' },
        { status: 400 }
      )
    }

    console.log(`Generating embeddings for AI personality: ${personalityName}`)

    // Prepare content for embedding generation
    const personalityContent = [
      `AI Personality: ${personalityName}`,
      `Description: ${content.description}`,
      `Tone: ${content.tone}`,
      `Challenge Level: ${content.challengeLevel}/10`,
      `Emotional Attunement: ${content.emotionalAttunement}/10`,
      `Open-ended Questions:`,
      ...(content.openEndedQuestions || []).map((q: string, i: number) => `${i + 1}. ${q}`)
    ].filter(Boolean).join('\n\n')

    // Generate embeddings using the enhanced AI service
    // For now, we'll use a simple approach - in the future this could be expanded
    // to store embeddings in a dedicated table for personality content
    const service = enhancedAIService.getInstance()

    // Generate embedding for the personality content
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const embedding = await (service as any).getEmbedding(personalityContent)

    // Store in ai_personalities table (if it exists) or log for now
    console.log(`Generated embedding vector of length ${embedding.length} for ${personalityName}`)

    const result = {
      embeddingCount: 1,
      vectorLength: embedding.length
    }

    console.log(`Successfully generated embeddings for AI personality: ${personalityName}`)

    return NextResponse.json({
      success: true,
      message: `Embeddings generated successfully for ${personalityName}`,
      personalityId,
      personalityName,
      embeddingCount: result.embeddingCount || 1
    })

  } catch (error) {
    console.error('Error generating personality embeddings:', error)
    return NextResponse.json(
      { 
        error: 'Failed to generate embeddings',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
