'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Sparkles, ChevronDown, ChevronUp } from 'lucide-react'

interface InlineArchetypeCardProps {
  archetypeName: string
  description: string
  confidenceScore: number
  isNewlyRevealed?: boolean
  insights?: {
    currentInfluence?: string
    growthOpportunity?: string
    integrationTip?: string
  }
}

export function InlineArchetypeCard({
  archetypeName,
  description,
  confidenceScore,
  isNewlyRevealed = false,
  insights
}: InlineArchetypeCardProps) {
  const [isExpanded, setIsExpanded] = useState(isNewlyRevealed)

  const getConfidenceColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-orange-600'
  }

  const getConfidenceBg = (score: number) => {
    if (score >= 80) return 'bg-green-50 border-green-200'
    if (score >= 60) return 'bg-yellow-50 border-yellow-200'
    return 'bg-orange-50 border-orange-200'
  }

  return (
    <Card className={`border-2 ${getConfidenceBg(confidenceScore)} ${isNewlyRevealed ? 'shadow-lg' : 'shadow-sm'}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {isNewlyRevealed && (
                <div className="flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
                  <Sparkles className="h-3 w-3" />
                  New Discovery
                </div>
              )}
            </div>
            <CardTitle className="text-lg">{archetypeName}</CardTitle>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            {isExpanded ? (
              <ChevronUp className="h-5 w-5" />
            ) : (
              <ChevronDown className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* Confidence Score */}
        <div className="mt-3 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Confidence Match</span>
            <span className={`font-semibold ${getConfidenceColor(confidenceScore)}`}>
              {Math.round(confidenceScore)}%
            </span>
          </div>
          <Progress value={confidenceScore} className="h-2" />
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-4">
          {/* Description */}
          <div>
            <p className="text-sm text-gray-700 leading-relaxed">
              {description}
            </p>
          </div>

          {/* Insights */}
          {insights && (
            <div className="space-y-3 pt-2 border-t border-gray-200">
              {insights.currentInfluence && (
                <div>
                  <h4 className="text-xs font-semibold text-gray-700 mb-1">How This Shows Up</h4>
                  <p className="text-sm text-gray-600">
                    {insights.currentInfluence}
                  </p>
                </div>
              )}

              {insights.growthOpportunity && (
                <div>
                  <h4 className="text-xs font-semibold text-gray-700 mb-1">Growth Opportunity</h4>
                  <p className="text-sm text-gray-600">
                    {insights.growthOpportunity}
                  </p>
                </div>
              )}

              {insights.integrationTip && (
                <div>
                  <h4 className="text-xs font-semibold text-gray-700 mb-1">Integration Tip</h4>
                  <p className="text-sm text-gray-600">
                    {insights.integrationTip}
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  )
}

