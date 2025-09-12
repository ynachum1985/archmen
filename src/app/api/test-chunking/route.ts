import { NextResponse } from 'next/server'

interface TestConfig {
  name: string
  chunk_size: number
  chunk_overlap: number
  split_by: string
  test_queries: string[]
  sample_content: string
}

interface ChunkingTestResult {
  config_name: string
  chunk_size: number
  chunk_overlap: number
  split_by: string
  score: number
  avg_relevance: number
  avg_time: number
  chunks_generated: number
  test_results: Array<{
    query: string
    relevance_score: number
    retrieval_time: number
    top_chunks: Array<{
      content: string
      similarity: number
    }>
  }>
}

export async function POST(request: Request) {
  try {
    const { testConfigs } = await request.json()

    if (!testConfigs || !Array.isArray(testConfigs)) {
      return NextResponse.json(
        { error: 'Invalid test configurations provided' },
        { status: 400 }
      )
    }

    const results: ChunkingTestResult[] = []

    // Sample content for testing (you can expand this)
    const sampleContent = `
    Attachment theory, developed by John Bowlby, describes the emotional bonds between people. 
    It suggests that early relationships with caregivers shape our ability to form relationships throughout life.
    
    There are four main attachment styles: secure, anxious-preoccupied, dismissive-avoidant, and disorganized.
    Secure attachment develops when caregivers are consistently responsive and available.
    
    Archetypes, as described by Carl Jung, are universal patterns or images that derive from the collective unconscious.
    They appear in dreams, literature, art, and religion across cultures.
    
    The Shadow archetype represents the hidden, repressed, or denied aspects of the self.
    Shadow work involves acknowledging and integrating these aspects for psychological wholeness.
    
    In relationships, archetypal patterns influence how we connect with others.
    The Lover archetype seeks passion and intimacy, while the Caregiver focuses on nurturing and support.
    `

    for (const config of testConfigs) {
      // Simulate chunking with different strategies
      const chunks = await simulateChunking(sampleContent, config)
      
      // Test each query against the chunks
      const testResults = []
      let totalRelevance = 0
      let totalTime = 0

      for (const query of config.test_queries) {
        const queryStartTime = Date.now()
        
        // Simulate retrieval and scoring
        const retrievalResults = await simulateRetrieval(query, chunks)
        const queryTime = Date.now() - queryStartTime
        
        const relevanceScore = calculateRelevanceScore(query, retrievalResults)
        
        testResults.push({
          query,
          relevance_score: relevanceScore,
          retrieval_time: queryTime,
          top_chunks: retrievalResults.slice(0, 3).map(chunk => ({
            content: chunk.content.substring(0, 100) + '...',
            similarity: chunk.similarity
          }))
        })
        
        totalRelevance += relevanceScore
        totalTime += queryTime
      }

      const avgRelevance = totalRelevance / config.test_queries.length
      const avgTime = totalTime / config.test_queries.length
      
      // Calculate overall score (weighted combination of relevance and efficiency)
      const score = (avgRelevance * 0.8) + ((1000 - Math.min(avgTime, 1000)) / 1000 * 0.2)

      results.push({
        config_name: config.name,
        chunk_size: config.chunk_size,
        chunk_overlap: config.chunk_overlap,
        split_by: config.split_by,
        score,
        avg_relevance: avgRelevance,
        avg_time: avgTime,
        chunks_generated: chunks.length,
        test_results: testResults
      })
    }

    // Sort results by score (best first)
    results.sort((a, b) => b.score - a.score)

    return NextResponse.json(results)

  } catch (error) {
    console.error('Error testing chunking strategies:', error)
    return NextResponse.json(
      { error: 'Failed to test chunking strategies' },
      { status: 500 }
    )
  }
}

async function simulateChunking(content: string, config: TestConfig) {
  const chunks = []
  const words = content.split(/\s+/)
  
  // Rough token estimation (1 token ≈ 0.75 words)
  const wordsPerChunk = Math.floor(config.chunk_size * 0.75)
  const overlapWords = Math.floor(config.chunk_overlap * 0.75)
  
  let startIndex = 0
  let chunkId = 0
  
  while (startIndex < words.length) {
    const endIndex = Math.min(startIndex + wordsPerChunk, words.length)
    const chunkWords = words.slice(startIndex, endIndex)
    
    if (chunkWords.length > 0) {
      chunks.push({
        id: `chunk_${chunkId}`,
        content: chunkWords.join(' '),
        metadata: {
          source: 'test_content',
          chunk_index: chunkId,
          start_word: startIndex,
          end_word: endIndex,
          strategy: config.split_by
        }
      })
      chunkId++
    }
    
    // Move start index forward, accounting for overlap
    startIndex = endIndex - overlapWords
    if (startIndex >= endIndex) break
  }
  
  return chunks
}

async function simulateRetrieval(query: string, chunks: { content: string; metadata: Record<string, unknown> }[]) {
  // Simple keyword-based similarity for testing
  // In real implementation, this would use actual embeddings
  const queryWords = query.toLowerCase().split(/\s+/)
  
  const scoredChunks = chunks.map(chunk => {
    const chunkWords = chunk.content.toLowerCase().split(/\s+/)
    let matches = 0
    
    for (const queryWord of queryWords) {
      if (chunkWords.some(word => word.includes(queryWord) || queryWord.includes(word))) {
        matches++
      }
    }
    
    const similarity = matches / queryWords.length
    
    return {
      ...chunk,
      similarity,
      score: similarity
    }
  })
  
  // Sort by similarity and return top results
  return scoredChunks
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, 5)
}

function calculateRelevanceScore(query: string, results: { content: string; score: number }[]): number {
  if (results.length === 0) return 0
  
  // Calculate relevance based on top results
  const topResult = results[0]
  const avgTopThree = results.slice(0, 3).reduce((sum, r) => sum + r.score, 0) / Math.min(3, results.length)

  // Weighted score: top result matters most, but consistency in top 3 also important
  return (topResult.score * 0.6) + (avgTopThree * 0.4)
}
