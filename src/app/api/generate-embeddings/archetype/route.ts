import { NextRequest, NextResponse } from 'next/server'
import { enhancedAIService } from '@/lib/services/enhanced-ai.service'

export async function POST(request: NextRequest) {
  try {
    const { archetypeId, archetypeName, content } = await request.json()

    if (!archetypeId || !archetypeName || !content) {
      return NextResponse.json(
        { error: 'Missing required fields: archetypeId, archetypeName, content' },
        { status: 400 }
      )
    }

    console.log(`Generating embeddings for archetype: ${archetypeName}`)

    // Prepare content for embedding generation
    const archetypeContent = [
      `Archetype: ${archetypeName}`,
      `Description: ${content.description}`,
      `Assessment Context: ${content.assessmentContext}`,
      `Current Influence: ${content.insights?.currentInfluence}`,
      `Growth Opportunity: ${content.insights?.growthOpportunity}`,
      `Integration Tip: ${content.insights?.integrationTip}`,
      `Articles: ${content.resources?.articles?.join(', ') || 'None'}`,
      `Exercises: ${content.resources?.exercises?.join(', ') || 'None'}`,
      `Affirmations: ${content.resources?.affirmations?.join(', ') || 'None'}`
    ].filter(Boolean).join('\n\n')

    // Generate embeddings using the enhanced AI service
    // For now, we'll use a simple approach - in the future this could be expanded
    // to store embeddings in a dedicated table for archetype content
    const service = enhancedAIService.getInstance()

    // Generate embedding for the archetype content
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const embedding = await (service as any).getEmbedding(archetypeContent)

    // Store in enhanced_archetypes table (if it exists) or log for now
    console.log(`Generated embedding vector of length ${embedding.length} for ${archetypeName}`)

    const result = {
      embeddingCount: 1,
      vectorLength: embedding.length
    }

    console.log(`Successfully generated embeddings for archetype: ${archetypeName}`)

    return NextResponse.json({
      success: true,
      message: `Embeddings generated successfully for ${archetypeName}`,
      archetypeId,
      archetypeName,
      embeddingCount: result.embeddingCount || 1
    })

  } catch (error) {
    console.error('Error generating archetype embeddings:', error)
    return NextResponse.json(
      { 
        error: 'Failed to generate embeddings',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
