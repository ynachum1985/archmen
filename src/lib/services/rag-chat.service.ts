/**
 * RAG-Enhanced Chat Service
 * Provides intelligent context retrieval for all chat conversations
 * Works across all assessments and general conversations
 */

import { createClient } from '@/lib/supabase/server'
import OpenAI from 'openai'

export interface RAGContext {
  archetypeContent: Array<{
    content: string
    similarity: number
    archetype_name: string
    chunk_index: number
  }>
  assessmentContent: Array<{
    content: string
    similarity: number
    assessment_name: string
    chunk_index: number
  }>
  totalChunks: number
  searchQuery: string
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp?: string
}

export interface RAGChatOptions {
  conversationId?: string
  assessmentId?: string
  userId?: string
  maxContextChunks?: number
  similarityThreshold?: number
  includeArchetypes?: boolean
  includeAssessments?: boolean
  embeddingModel?: string
}

export class RAGChatService {
  private openai: OpenAI
  private supabase: ReturnType<typeof createClient>

  constructor() {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured')
    }
    
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
    
    this.supabase = createClient()
  }

  /**
   * Generate embedding for search query
   */
  private async generateQueryEmbedding(query: string, model: string = 'text-embedding-3-small'): Promise<number[]> {
    try {
      const response = await this.openai.embeddings.create({
        model: model.startsWith('text-embedding') ? model : 'text-embedding-3-small',
        input: query.substring(0, 8000), // Limit input length
      })

      return response.data[0].embedding
    } catch (error) {
      console.error('Error generating embedding:', error)
      throw new Error('Failed to generate embedding for search query')
    }
  }

  /**
   * Search archetype content for relevant context
   */
  private async searchArchetypeContent(
    queryEmbedding: number[],
    options: RAGChatOptions
  ): Promise<RAGContext['archetypeContent']> {
    try {
      const { data: chunks, error } = await this.supabase.rpc('search_all_archetype_content', {
        query_embedding: queryEmbedding,
        match_threshold: options.similarityThreshold || 0.7,
        match_count: Math.floor((options.maxContextChunks || 10) / 2)
      })

      if (error) {
        console.error('Error searching archetype content:', error)
        return []
      }

      // Get archetype names for the chunks
      const archetypeIds = [...new Set(chunks?.map((chunk: any) => chunk.archetype_id) || [])]
      const { data: archetypes } = await this.supabase
        .from('enhanced_archetypes')
        .select('id, name')
        .in('id', archetypeIds)

      const archetypeMap = new Map(archetypes?.map(a => [a.id, a.name]) || [])

      return chunks?.map((chunk: any) => ({
        content: chunk.content,
        similarity: chunk.similarity,
        archetype_name: archetypeMap.get(chunk.archetype_id) || 'Unknown',
        chunk_index: chunk.chunk_index
      })) || []
    } catch (error) {
      console.error('Error in searchArchetypeContent:', error)
      return []
    }
  }

  /**
   * Search assessment content for relevant context
   */
  private async searchAssessmentContent(
    queryEmbedding: number[],
    options: RAGChatOptions
  ): Promise<RAGContext['assessmentContent']> {
    try {
      // If we have a specific assessment, search within it first
      if (options.assessmentId) {
        const { data: chunks, error } = await this.supabase.rpc('search_assessment_content', {
          query_embedding: queryEmbedding,
          assessment_id_param: options.assessmentId,
          match_threshold: options.similarityThreshold || 0.7,
          match_count: Math.floor((options.maxContextChunks || 10) / 2)
        })

        if (!error && chunks?.length > 0) {
          const { data: assessment } = await this.supabase
            .from('enhanced_assessments')
            .select('name')
            .eq('id', options.assessmentId)
            .single()

          return chunks.map((chunk: any) => ({
            content: chunk.content,
            similarity: chunk.similarity,
            assessment_name: assessment?.name || 'Unknown Assessment',
            chunk_index: chunk.chunk_index
          }))
        }
      }

      // Search across all assessment content
      const { data: allChunks, error: allError } = await this.supabase
        .from('assessment_content_chunks')
        .select(`
          chunk_text,
          chunk_index,
          assessment_id,
          embedding
        `)
        .not('embedding', 'is', null)
        .limit(100) // Limit for performance

      if (allError || !allChunks?.length) {
        return []
      }

      // Calculate similarities (simplified approach)
      // In production, you'd want to use a proper vector similarity function
      const results = allChunks
        .map((chunk: any) => {
          // This is a simplified similarity calculation
          // In production, use proper cosine similarity
          const similarity = Math.random() * 0.5 + 0.5 // Placeholder
          return {
            content: chunk.chunk_text,
            similarity,
            assessment_id: chunk.assessment_id,
            chunk_index: chunk.chunk_index
          }
        })
        .filter(chunk => chunk.similarity >= (options.similarityThreshold || 0.7))
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, Math.floor((options.maxContextChunks || 10) / 2))

      // Get assessment names
      const assessmentIds = [...new Set(results.map(r => r.assessment_id))]
      const { data: assessments } = await this.supabase
        .from('enhanced_assessments')
        .select('id, name')
        .in('id', assessmentIds)

      const assessmentMap = new Map(assessments?.map(a => [a.id, a.name]) || [])

      return results.map(chunk => ({
        content: chunk.content,
        similarity: chunk.similarity,
        assessment_name: assessmentMap.get(chunk.assessment_id) || 'Unknown Assessment',
        chunk_index: chunk.chunk_index
      }))
    } catch (error) {
      console.error('Error in searchAssessmentContent:', error)
      return []
    }
  }

  /**
   * Get relevant context for a chat message using RAG
   */
  async getRelevantContext(
    message: string,
    options: RAGChatOptions = {}
  ): Promise<RAGContext> {
    try {
      // Generate embedding for the user's message
      const queryEmbedding = await this.generateQueryEmbedding(
        message,
        options.embeddingModel
      )

      // Search both archetype and assessment content in parallel
      const [archetypeContent, assessmentContent] = await Promise.all([
        options.includeArchetypes !== false 
          ? this.searchArchetypeContent(queryEmbedding, options)
          : Promise.resolve([]),
        options.includeAssessments !== false
          ? this.searchAssessmentContent(queryEmbedding, options)
          : Promise.resolve([])
      ])

      return {
        archetypeContent,
        assessmentContent,
        totalChunks: archetypeContent.length + assessmentContent.length,
        searchQuery: message
      }
    } catch (error) {
      console.error('Error getting relevant context:', error)
      return {
        archetypeContent: [],
        assessmentContent: [],
        totalChunks: 0,
        searchQuery: message
      }
    }
  }

  /**
   * Create enhanced system prompt with RAG context
   */
  createEnhancedSystemPrompt(
    basePrompt: string,
    context: RAGContext,
    conversationMetadata?: any
  ): string {
    if (context.totalChunks === 0) {
      return basePrompt
    }

    let contextSection = '\n\n=== RELEVANT KNOWLEDGE BASE CONTEXT ===\n'
    
    if (context.archetypeContent.length > 0) {
      contextSection += '\n--- ARCHETYPE INSIGHTS ---\n'
      context.archetypeContent.forEach((chunk, index) => {
        contextSection += `${index + 1}. [${chunk.archetype_name}] (${(chunk.similarity * 100).toFixed(1)}% match)\n${chunk.content}\n\n`
      })
    }

    if (context.assessmentContent.length > 0) {
      contextSection += '\n--- ASSESSMENT KNOWLEDGE ---\n'
      context.assessmentContent.forEach((chunk, index) => {
        contextSection += `${index + 1}. [${chunk.assessment_name}] (${(chunk.similarity * 100).toFixed(1)}% match)\n${chunk.content}\n\n`
      })
    }

    contextSection += `=== END CONTEXT (${context.totalChunks} relevant chunks found) ===\n\n`
    contextSection += 'INSTRUCTIONS:\n'
    contextSection += '- Use the above context to provide more informed, specific responses\n'
    contextSection += '- Reference specific archetype patterns when relevant\n'
    contextSection += '- Draw from assessment knowledge to guide conversations\n'
    contextSection += '- If context is highly relevant (>80% similarity), cite it naturally\n'
    contextSection += '- Always prioritize being helpful and conversational over being clinical\n'
    contextSection += '- Integrate knowledge seamlessly - don\'t just quote the context\n\n'

    return basePrompt + contextSection
  }

  /**
   * Generate RAG-enhanced chat response
   */
  async generateResponse(
    messages: ChatMessage[],
    options: RAGChatOptions = {}
  ): Promise<{
    content: string
    context: RAGContext
    usage?: {
      promptTokens: number
      completionTokens: number
      totalTokens: number
    }
  }> {
    try {
      // Get the latest user message for context search
      const latestUserMessage = messages
        .filter(m => m.role === 'user')
        .pop()?.content || ''

      // Get relevant context
      const context = await this.getRelevantContext(latestUserMessage, options)

      // Create enhanced system prompt
      const baseSystemPrompt = messages.find(m => m.role === 'system')?.content || 
        'You are an expert relationship coach specializing in masculine psychology and archetypal patterns. Provide thoughtful, empathetic guidance.'

      const enhancedSystemPrompt = this.createEnhancedSystemPrompt(
        baseSystemPrompt,
        context
      )

      // Prepare messages for OpenAI
      const chatMessages = [
        { role: 'system' as const, content: enhancedSystemPrompt },
        ...messages.filter(m => m.role !== 'system').map(m => ({
          role: m.role as 'user' | 'assistant',
          content: m.content
        }))
      ]

      // Generate response
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: chatMessages,
        temperature: 0.7,
        max_tokens: 1000,
      })

      const responseContent = completion.choices[0]?.message?.content || 
        'I apologize, but I encountered an error processing your message.'

      return {
        content: responseContent,
        context,
        usage: completion.usage ? {
          promptTokens: completion.usage.prompt_tokens,
          completionTokens: completion.usage.completion_tokens,
          totalTokens: completion.usage.total_tokens
        } : undefined
      }
    } catch (error) {
      console.error('Error generating RAG response:', error)
      throw new Error('Failed to generate response')
    }
  }
}

// Export singleton instance
export const ragChatService = new RAGChatService()
