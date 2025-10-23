/**
 * AI MODERATION SYSTEM FOR ARCHMEN
 * 
 * Multi-layer content moderation specifically designed for men's relationship coaching
 * Combines OpenAI Moderation API, Google Perspective API, and custom rules
 * 
 * Focus Areas:
 * - Preventing harmful advice about relationships
 * - Detecting misogynistic or toxic masculinity patterns
 * - Protecting against manipulation tactics
 * - Ensuring respectful discourse about women and relationships
 */

import OpenAI from 'openai'

// Types for moderation results
export interface ModerationResult {
  flagged: boolean
  categories: {
    harassment: boolean
    harassment_threatening: boolean
    hate: boolean
    hate_threatening: boolean
    self_harm: boolean
    self_harm_instructions: boolean
    self_harm_intent: boolean
    sexual: boolean
    sexual_minors: boolean
    violence: boolean
    violence_graphic: boolean
    // Custom categories for ArchMen
    toxic_masculinity: boolean
    misogyny: boolean
    manipulation: boolean
    relationship_abuse: boolean
  }
  category_scores: Record<string, number>
  confidence: number
  reasoning?: string
  action: 'allow' | 'flag' | 'block' | 'human_review'
}

export interface PerspectiveResult {
  toxicity: number
  severe_toxicity: number
  identity_attack: number
  insult: number
  profanity: number
  threat: number
}

// Custom patterns for relationship coaching context
const TOXIC_PATTERNS = {
  misogyny: [
    /\b(women are|females are|girls are).*(inferior|stupid|emotional|irrational|crazy)\b/i,
    /\b(all women|every woman).*(lie|cheat|manipulate|use men)\b/i,
    /\bwomen.*(belong in|should stay in).*(kitchen|home)\b/i,
    /\b(alpha|beta|sigma).*(male|men).*(deserve|own|control).*(women|females)\b/i,
  ],
  manipulation: [
    /\b(gaslight|manipulate|control).*(her|women|girlfriend|wife)\b/i,
    /\bmake her (think|believe|feel).*(she's crazy|she's wrong)\b/i,
    /\b(isolate|separate).*(her from).*(friends|family)\b/i,
    /\b(emotional|psychological).*(abuse|manipulation)\b/i,
  ],
  toxic_masculinity: [
    /\b(real men|true men).*(don't|never).*(cry|show emotion|express feelings)\b/i,
    /\bmen.*(should|must).*(dominate|control|be aggressive)\b/i,
    /\b(weakness|feminine).*(in men|for men)\b/i,
    /\bmen.*(can't|shouldn't).*(be vulnerable|show weakness)\b/i,
  ],
  relationship_abuse: [
    /\b(force|make).*(her|women).*(have sex|be intimate)\b/i,
    /\bif she says no.*(ignore|persist|keep trying)\b/i,
    /\b(threaten|intimidate).*(to leave|with violence)\b/i,
    /\b(track|monitor|spy on).*(her|girlfriend|wife)\b/i,
  ]
}

// Severity thresholds by moderation level
const THRESHOLDS = {
  strict: {
    openai: { block: 0.6, flag: 0.3, allow: 0.1 },
    perspective: { toxicity: 0.5, severe_toxicity: 0.3, identity_attack: 0.4, insult: 0.4, profanity: 0.6, threat: 0.2 }
  },
  moderate: {
    openai: { block: 0.8, flag: 0.5, allow: 0.3 },
    perspective: { toxicity: 0.7, severe_toxicity: 0.5, identity_attack: 0.6, insult: 0.6, profanity: 0.8, threat: 0.4 }
  },
  lenient: {
    openai: { block: 0.9, flag: 0.7, allow: 0.5 },
    perspective: { toxicity: 0.85, severe_toxicity: 0.7, identity_attack: 0.8, insult: 0.8, profanity: 0.9, threat: 0.6 }
  }
}

export class AIModeration {
  private openai: OpenAI
  private perspectiveApiKey?: string

  constructor(openaiApiKey: string, perspectiveApiKey?: string) {
    this.openai = new OpenAI({ apiKey: openaiApiKey })
    this.perspectiveApiKey = perspectiveApiKey
  }

  /**
   * Main moderation function - runs all checks
   */
  async moderateContent(content: string, context?: {
    userId?: string
    assessmentId?: string
    conversationType?: 'assessment' | 'chat' | 'feedback'
    moderationLevel?: 'strict' | 'moderate' | 'lenient' | 'disabled'
  }): Promise<ModerationResult> {
    try {
      // For assessments, use lenient moderation by default (only block serious concerns)
      const moderationLevel = context?.conversationType === 'assessment'
        ? 'lenient'
        : (context?.moderationLevel || 'moderate')

      // Run moderation checks in parallel
      const [openaiResult, perspectiveResult, customResult] = await Promise.allSettled([
        this.checkOpenAIModerationAPI(content),
        this.checkPerspectiveAPI(content),
        this.checkCustomPatterns(content)
      ])

      // Combine results
      const result = this.combineResults(
        openaiResult.status === 'fulfilled' ? openaiResult.value : null,
        perspectiveResult.status === 'fulfilled' ? perspectiveResult.value : null,
        customResult.status === 'fulfilled' ? customResult.value : null,
        content,
        { ...context, moderationLevel }
      )

      // Log for monitoring
      await this.logModerationResult(content, result, context)

      return result
    } catch (error) {
      console.error('Moderation error:', error)

      // Fail-safe: for assessments, allow content to proceed (don't block on error)
      // For other contexts, flag for human review
      const isAssessment = context?.conversationType === 'assessment'

      return {
        flagged: false,
        categories: {
          harassment: false,
          harassment_threatening: false,
          hate: false,
          hate_threatening: false,
          self_harm: false,
          self_harm_instructions: false,
          self_harm_intent: false,
          sexual: false,
          sexual_minors: false,
          violence: false,
          violence_graphic: false,
          toxic_masculinity: false,
          misogyny: false,
          manipulation: false,
          relationship_abuse: false,
        },
        category_scores: {},
        confidence: 0,
        reasoning: isAssessment ? 'Moderation system error - allowing for assessment' : 'Moderation system error',
        action: isAssessment ? 'allow' : 'human_review'
      }
    }
  }

  /**
   * OpenAI Moderation API check
   */
  private async checkOpenAIModerationAPI(content: string) {
    try {
      const response = await this.openai.moderations.create({
        input: content,
        model: 'text-moderation-latest'
      })

      return response.results[0]
    } catch (error) {
      console.error('OpenAI moderation error:', error)
      return null
    }
  }

  /**
   * Google Perspective API check
   */
  private async checkPerspectiveAPI(content: string): Promise<PerspectiveResult | null> {
    if (!this.perspectiveApiKey) {
      return null
    }

    try {
      // Truncate content to 3000 chars (Perspective API limit)
      const truncatedContent = content.substring(0, 3000)

      const response = await fetch(
        `https://commentanalyzer.googleapis.com/v1alpha1/comments:analyze?key=${this.perspectiveApiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            requestedAttributes: {
              TOXICITY: {},
              SEVERE_TOXICITY: {},
              IDENTITY_ATTACK: {},
              INSULT: {},
              PROFANITY: {},
              THREAT: {}
            },
            comment: { text: truncatedContent },
            languages: ['en'],
            clientToken: 'archmen-assessment' // Add client token for tracking
          })
        }
      )

      if (!response.ok) {
        const errorText = await response.text()
        console.warn(`Perspective API error: ${response.status}`, errorText)
        return null
      }

      const data = await response.json()

      return {
        toxicity: data.attributeScores?.TOXICITY?.summaryScore?.value || 0,
        severe_toxicity: data.attributeScores?.SEVERE_TOXICITY?.summaryScore?.value || 0,
        identity_attack: data.attributeScores?.IDENTITY_ATTACK?.summaryScore?.value || 0,
        insult: data.attributeScores?.INSULT?.summaryScore?.value || 0,
        profanity: data.attributeScores?.PROFANITY?.summaryScore?.value || 0,
        threat: data.attributeScores?.THREAT?.summaryScore?.value || 0
      }
    } catch (error) {
      console.warn('Perspective API error (continuing without it):', error)
      return null
    }
  }

  /**
   * Custom pattern matching for relationship-specific content
   */
  private async checkCustomPatterns(content: string) {
    const results = {
      toxic_masculinity: false,
      misogyny: false,
      manipulation: false,
      relationship_abuse: false,
      matches: [] as string[]
    }

    // Check each pattern category
    for (const [category, patterns] of Object.entries(TOXIC_PATTERNS)) {
      for (const pattern of patterns) {
        if (pattern.test(content)) {
          results[category as keyof typeof results] = true
          results.matches.push(`${category}: ${pattern.source}`)
        }
      }
    }

    return results
  }

  /**
   * Combine all moderation results into final decision
   */
  private combineResults(
    openaiResult: any,
    perspectiveResult: PerspectiveResult | null,
    customResult: any,
    content: string,
    context?: any
  ): ModerationResult {
    // Get moderation level from context, default to 'moderate'
    const moderationLevel = context?.moderationLevel || 'moderate'
    const thresholds = THRESHOLDS[moderationLevel as keyof typeof THRESHOLDS] || THRESHOLDS.moderate
    let flagged = false
    let action: 'allow' | 'flag' | 'block' | 'human_review' = 'allow'
    let confidence = 1.0
    const reasoning: string[] = []

    // OpenAI results
    const categories = {
      harassment: openaiResult?.categories?.harassment || false,
      harassment_threatening: openaiResult?.categories?.['harassment/threatening'] || false,
      hate: openaiResult?.categories?.hate || false,
      hate_threatening: openaiResult?.categories?.['hate/threatening'] || false,
      self_harm: openaiResult?.categories?.['self-harm'] || false,
      self_harm_instructions: openaiResult?.categories?.['self-harm/instructions'] || false,
      self_harm_intent: openaiResult?.categories?.['self-harm/intent'] || false,
      sexual: openaiResult?.categories?.sexual || false,
      sexual_minors: openaiResult?.categories?.['sexual/minors'] || false,
      violence: openaiResult?.categories?.violence || false,
      violence_graphic: openaiResult?.categories?.['violence/graphic'] || false,
      toxic_masculinity: customResult?.toxic_masculinity || false,
      misogyny: customResult?.misogyny || false,
      manipulation: customResult?.manipulation || false,
      relationship_abuse: customResult?.relationship_abuse || false,
    }

    // Check OpenAI flags
    if (openaiResult?.flagged) {
      flagged = true
      action = 'block'
      reasoning.push('OpenAI moderation flagged content')
    }

    // Check Perspective API scores using level-specific thresholds
    if (perspectiveResult) {
      if (perspectiveResult.toxicity > thresholds.perspective.toxicity) {
        flagged = true
        action = action === 'allow' ? 'flag' : action
        reasoning.push(`High toxicity score: ${perspectiveResult.toxicity.toFixed(2)} (threshold: ${thresholds.perspective.toxicity})`)
      }

      if (perspectiveResult.threat > thresholds.perspective.threat) {
        flagged = true
        action = 'block'
        reasoning.push(`Threat detected: ${perspectiveResult.threat.toFixed(2)} (threshold: ${thresholds.perspective.threat})`)
      }

      if (perspectiveResult.severe_toxicity > thresholds.perspective.severe_toxicity) {
        flagged = true
        action = 'block'
        reasoning.push(`Severe toxicity detected: ${perspectiveResult.severe_toxicity.toFixed(2)}`)
      }

      if (perspectiveResult.identity_attack > thresholds.perspective.identity_attack) {
        flagged = true
        action = action === 'allow' ? 'flag' : action
        reasoning.push(`Identity attack detected: ${perspectiveResult.identity_attack.toFixed(2)}`)
      }
    }

    // Check custom patterns
    if (customResult?.relationship_abuse || customResult?.manipulation) {
      flagged = true
      action = 'block'
      reasoning.push('Relationship abuse or manipulation patterns detected')
    }

    if (customResult?.misogyny || customResult?.toxic_masculinity) {
      flagged = true
      action = action === 'allow' ? 'flag' : action
      reasoning.push('Toxic masculinity or misogynistic content detected')
    }

    // Calculate confidence based on agreement between systems
    const agreementCount = [openaiResult?.flagged, perspectiveResult && perspectiveResult.toxicity > 0.5, customResult?.matches?.length > 0].filter(Boolean).length
    confidence = agreementCount / 3

    return {
      flagged,
      categories,
      category_scores: {
        ...openaiResult?.category_scores,
        ...perspectiveResult,
        custom_patterns: customResult?.matches?.length || 0
      },
      confidence,
      reasoning: reasoning.join('; '),
      action
    }
  }

  /**
   * Log moderation results for monitoring and improvement
   */
  private async logModerationResult(content: string, result: ModerationResult, context?: any) {
    // In production, this would log to your monitoring system
    console.log('Moderation result:', {
      flagged: result.flagged,
      action: result.action,
      confidence: result.confidence,
      context,
      timestamp: new Date().toISOString()
    })
  }
}
