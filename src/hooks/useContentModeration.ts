import { useState, useCallback } from 'react'

interface ModerationContext {
  userId?: string
  assessmentId?: string
  conversationType?: 'assessment' | 'chat' | 'feedback'
  messageId?: string
}

interface ModerationResult {
  flagged: boolean
  action: 'allow' | 'flag' | 'block' | 'human_review'
  confidence: number
  categories: Record<string, boolean>
  reasoning?: string
}

interface UseModerationReturn {
  moderateContent: (content: string, context?: ModerationContext) => Promise<ModerationResult>
  isLoading: boolean
  error: string | null
  lastResult: ModerationResult | null
}

export function useContentModeration(): UseModerationReturn {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastResult, setLastResult] = useState<ModerationResult | null>(null)

  const moderateContent = useCallback(async (
    content: string, 
    context?: ModerationContext
  ): Promise<ModerationResult> => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/moderate-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          context
        })
      })

      if (!response.ok) {
        throw new Error(`Moderation failed: ${response.status}`)
      }

      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.error || 'Moderation failed')
      }

      const result = data.moderation
      setLastResult(result)
      
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      
      // Return a safe default that flags for human review
      const fallbackResult: ModerationResult = {
        flagged: true,
        action: 'human_review',
        confidence: 0,
        categories: {},
        reasoning: 'Moderation service error'
      }
      
      setLastResult(fallbackResult)
      return fallbackResult
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    moderateContent,
    isLoading,
    error,
    lastResult
  }
}

// Helper hook for real-time content moderation in forms
export function useRealTimeModeration(
  debounceMs: number = 1000,
  context?: ModerationContext
) {
  const { moderateContent, isLoading, error, lastResult } = useContentModeration()
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null)

  const moderateWithDebounce = useCallback((content: string) => {
    // Clear existing timer
    if (debounceTimer) {
      clearTimeout(debounceTimer)
    }

    // Set new timer
    const timer = setTimeout(() => {
      if (content.trim().length > 10) { // Only moderate substantial content
        moderateContent(content, context)
      }
    }, debounceMs)

    setDebounceTimer(timer)
  }, [moderateContent, context, debounceMs, debounceTimer])

  return {
    moderateWithDebounce,
    isLoading,
    error,
    lastResult
  }
}

// Helper function to get user-friendly moderation messages
export function getModerationMessage(result: ModerationResult): {
  title: string
  message: string
  severity: 'info' | 'warning' | 'error'
} {
  switch (result.action) {
    case 'block':
      return {
        title: 'Content Blocked',
        message: 'This content violates our community guidelines and cannot be posted. Please revise your message to focus on respectful, constructive communication.',
        severity: 'error'
      }
    
    case 'flag':
      return {
        title: 'Content Flagged',
        message: 'This content has been flagged for review. It may contain language that could be harmful or inappropriate for our community.',
        severity: 'warning'
      }
    
    case 'human_review':
      return {
        title: 'Under Review',
        message: 'Your content is being reviewed by our moderation team. We\'ll notify you once the review is complete.',
        severity: 'info'
      }
    
    default:
      return {
        title: 'Content Approved',
        message: 'Your content meets our community guidelines.',
        severity: 'info'
      }
  }
}

// Helper function to check if content should be allowed to post
export function shouldAllowContent(result: ModerationResult): boolean {
  return result.action === 'allow' || (result.action === 'flag' && result.confidence < 0.8)
}

// Helper function to get specific category warnings
export function getCategoryWarnings(categories: Record<string, boolean>): string[] {
  const warnings: string[] = []
  
  if (categories.misogyny) {
    warnings.push('Content may contain disrespectful language about women')
  }
  
  if (categories.toxic_masculinity) {
    warnings.push('Content may promote harmful masculine stereotypes')
  }
  
  if (categories.manipulation) {
    warnings.push('Content may suggest manipulative relationship tactics')
  }
  
  if (categories.relationship_abuse) {
    warnings.push('Content may promote abusive relationship behaviors')
  }
  
  if (categories.harassment) {
    warnings.push('Content may be harassing or threatening')
  }
  
  if (categories.violence) {
    warnings.push('Content may contain violent language or threats')
  }
  
  if (categories.self_harm) {
    warnings.push('Content may reference self-harm - please reach out for support if needed')
  }

  return warnings
}
