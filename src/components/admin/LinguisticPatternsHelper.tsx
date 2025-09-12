'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Copy, ChevronDown, ChevronUp, Sparkles } from 'lucide-react'

interface LinguisticPatternsHelperProps {
  onPatternSelect?: (pattern: string) => void
  className?: string
}

const LINGUISTIC_PATTERN_CATEGORIES = [
  {
    name: "Keywords",
    description: "Core terms and vocabulary they frequently use",
    examples: [
      "leadership, control, authority, responsibility, decision",
      "love, connection, intimacy, passion, romance, heart",
      "wisdom, knowledge, understanding, insight, truth, learning",
      "strength, courage, discipline, challenge, victory, battle"
    ]
  },
  {
    name: "Common Phrases",
    description: "Typical expressions and speech patterns",
    examples: [
      "I need to take charge, Let me handle this, I'm responsible for",
      "I feel like, My heart tells me, I love when, I need connection",
      "I think, I understand, I've learned, Let me explain, I know",
      "I can handle it, I'll fight for, I won't give up, I'm strong enough"
    ]
  },
  {
    name: "Emotional Indicators",
    description: "Feeling words and emotional expressions they use",
    examples: [
      "frustrated when not in control, confident in decisions, protective",
      "passionate, loving, vulnerable, heartbroken, connected, romantic",
      "curious, thoughtful, analytical, wise, understanding, patient",
      "determined, fierce, competitive, resilient, bold, courageous"
    ]
  },
  {
    name: "Behavioral Patterns",
    description: "Actions and behaviors they describe",
    examples: [
      "takes initiative, makes decisions quickly, organizes others",
      "seeks deep connection, prioritizes relationships, expresses emotions freely",
      "asks questions, seeks understanding, analyzes situations, shares knowledge",
      "faces challenges head-on, pushes through obstacles, protects others"
    ]
  },
  {
    name: "Sentence Structure",
    description: "How they construct their sentences",
    examples: [
      "Short, direct commands vs. long explanatory sentences",
      "Question-heavy vs. statement-heavy communication",
      "Complex, nuanced sentences vs. simple, clear statements",
      "Imperative mood vs. conditional mood usage"
    ]
  },
  {
    name: "Pronoun Usage",
    description: "Frequency and patterns of pronoun use",
    examples: [
      "High use of 'I' statements (self-focused)",
      "Frequent 'you' usage (other-focused)",
      "Regular 'we' usage (collective-focused)",
      "Avoids personal pronouns (detached)"
    ]
  },
  {
    name: "Temporal Language",
    description: "Time-focused language patterns",
    examples: [
      "Past-focused: 'I used to', 'Back when', 'Previously'",
      "Present-focused: 'Right now', 'Currently', 'At this moment'",
      "Future-focused: 'I will', 'Going forward', 'In the future'",
      "Timeless: 'Always', 'Never', 'Eternal', 'Forever'"
    ]
  },
  {
    name: "Certainty Markers",
    description: "Language indicating confidence or uncertainty",
    examples: [
      "Absolute: 'Always', 'Never', 'Definitely', 'Absolutely'",
      "Uncertain: 'Maybe', 'Sometimes', 'Perhaps', 'Possibly'",
      "Qualified: 'Usually', 'Often', 'Typically', 'Generally'",
      "Conditional: 'If', 'When', 'Unless', 'Provided that'"
    ]
  },
  {
    name: "Responsibility Language",
    description: "How they assign blame, credit, and accountability",
    examples: [
      "Self-accountable: 'I should', 'I need to', 'I'm responsible'",
      "Other-blaming: 'They should', 'You need to', 'It's their fault'",
      "External factors: 'It happened', 'Things went wrong', 'Circumstances'",
      "Shared responsibility: 'We should', 'Together we', 'Our responsibility'"
    ]
  },
  {
    name: "Emotional Intensity",
    description: "Level of emotional language used",
    examples: [
      "Mild: 'a bit upset', 'somewhat happy', 'slightly concerned'",
      "Moderate: 'upset', 'happy', 'concerned', 'excited'",
      "Strong: 'devastated', 'ecstatic', 'terrified', 'furious'",
      "Extreme: 'destroyed', 'over the moon', 'paralyzed with fear'"
    ]
  },
  {
    name: "Metaphors & Imagery",
    description: "Types of metaphors and imagery they use",
    examples: [
      "War/Battle: 'fighting for', 'battle', 'victory', 'defeat', 'strategy'",
      "Journey/Path: 'journey', 'path', 'destination', 'crossroads', 'milestone'",
      "Nature: 'growing', 'blooming', 'rooted', 'flowing', 'stormy'",
      "Building/Construction: 'foundation', 'building', 'structure', 'framework'"
    ]
  }
]

const LLM_PROMPT_TEMPLATE = `Create comprehensive linguistic patterns for the [ARCHETYPE_NAME] archetype that help AI detect this pattern in user responses about relationships. Include:

• Keywords: Core terms they use
• Common Phrases: Typical expressions  
• Emotional Indicators: Feeling words they use
• Behavioral Patterns: Actions they describe
• Sentence Structure: Short/long, commands/questions
• Pronoun Usage: I/you/we frequency patterns
• Temporal Language: Past/present/future focus
• Certainty Markers: Always/never vs maybe/sometimes
• Responsibility Language: Who they blame/credit
• Emotional Intensity: Mild vs extreme language
• Metaphors: War, nurturing, business, etc.

Focus on language patterns that reveal this archetype's shadow aspects in relationships and relating.`

export function LinguisticPatternsHelper({ onPatternSelect, className }: LinguisticPatternsHelperProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }

  const copyLLMPrompt = () => {
    copyToClipboard(LLM_PROMPT_TEMPLATE)
  }

  const copyAllPatterns = () => {
    const allPatterns = LINGUISTIC_PATTERN_CATEGORIES.map(category => 
      `${category.name}:\n${category.examples.join('\n')}`
    ).join('\n\n')
    copyToClipboard(allPatterns)
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Linguistic Patterns Helper</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="space-y-4">
          {/* Quick Actions */}
          <div className="flex gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={copyLLMPrompt}
              className="flex items-center gap-2"
            >
              <Sparkles className="h-4 w-4" />
              Copy LLM Prompt
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={copyAllPatterns}
              className="flex items-center gap-2"
            >
              <Copy className="h-4 w-4" />
              Copy All Examples
            </Button>
          </div>

          {/* Pattern Categories */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {LINGUISTIC_PATTERN_CATEGORIES.map((category) => (
              <div
                key={category.name}
                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedCategory === category.name 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedCategory(
                  selectedCategory === category.name ? null : category.name
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="outline" className="text-xs">
                    {category.name}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      copyToClipboard(category.examples.join('\n'))
                    }}
                    className="h-6 w-6 p-0"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
                <p className="text-xs text-gray-600 mb-2">{category.description}</p>
                
                {selectedCategory === category.name && (
                  <div className="space-y-1">
                    {category.examples.map((example, index) => (
                      <div
                        key={index}
                        className="text-xs bg-gray-50 p-2 rounded cursor-pointer hover:bg-gray-100"
                        onClick={(e) => {
                          e.stopPropagation()
                          if (onPatternSelect) {
                            onPatternSelect(example)
                          } else {
                            copyToClipboard(example)
                          }
                        }}
                      >
                        {example}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* LLM Prompt Template */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium mb-2 text-sm">LLM Prompt Template:</h4>
            <div className="text-xs font-mono bg-white p-3 rounded border">
              {LLM_PROMPT_TEMPLATE}
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  )
}
