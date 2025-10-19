'use client'

import { useEffect, useState } from 'react'
import { Sparkles, ChevronDown } from 'lucide-react'

interface AssessmentProgressBarProps {
  messageCount: number
  detectedArchetypesCount: number
  minQuestions: number
  maxQuestions: number
  minArchetypes: number
  minConfidence: number
  sessionData?: Record<string, any>
}

export function AssessmentProgressBar({
  messageCount,
  detectedArchetypesCount,
  minQuestions,
  maxQuestions,
  minArchetypes,
  minConfidence,
  sessionData
}: AssessmentProgressBarProps) {
  const [progress, setProgress] = useState(0)
  const [stage, setStage] = useState<'questions' | 'confidence' | 'archetype'>('questions')
  const [showDebug, setShowDebug] = useState(false)

  useEffect(() => {
    // Calculate conversation turns (each user message = 1 turn)
    // messageCount includes both user and AI messages, so divide by 2
    const conversationTurns = Math.ceil(messageCount / 2)

    // Calculate progress based on questions answered
    const questionsProgress = Math.min(conversationTurns / minQuestions, 1)

    // If we have detected archetypes, we're past the first reveal
    if (detectedArchetypesCount > 0) {
      setProgress(1)
      setStage('archetype')
    } else if (conversationTurns >= minQuestions) {
      // We've had enough questions, waiting for confidence threshold
      setProgress(0.7)
      setStage('confidence')
    } else {
      // Still building up conversation
      setProgress(questionsProgress * 0.7)
      setStage('questions')
    }
  }, [messageCount, detectedArchetypesCount, minQuestions])

  const getStageLabel = () => {
    const conversationTurns = Math.ceil(messageCount / 2)
    switch (stage) {
      case 'questions':
        return `Building conversation... (${conversationTurns}/${minQuestions} questions)`
      case 'confidence':
        return `Analyzing patterns... (${minConfidence}% confidence needed)`
      case 'archetype':
        return `${detectedArchetypesCount}/${minArchetypes} archetype${detectedArchetypesCount !== 1 ? 's' : ''} revealed!`
      default:
        return ''
    }
  }

  const getStageColor = () => {
    switch (stage) {
      case 'questions':
        return 'bg-blue-500'
      case 'confidence':
        return 'bg-purple-500'
      case 'archetype':
        return 'bg-green-500'
      default:
        return 'bg-gray-500'
    }
  }

  return (
    <div className="px-4 py-3 bg-white/40 border-b border-gray-200/50">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-gray-600" />
            <span className="text-xs font-medium text-gray-700">
              {getStageLabel()}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">
              {Math.round(progress * 100)}%
            </span>
            <button
              onClick={() => setShowDebug(!showDebug)}
              className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
              title="Toggle debug info"
            >
              <ChevronDown className={`h-3 w-3 transition-transform ${showDebug ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full h-1.5 bg-gray-200/50 rounded-full overflow-hidden">
          <div
            className={`h-full ${getStageColor()} transition-all duration-500 ease-out rounded-full`}
            style={{ width: `${progress * 100}%` }}
          />
        </div>

        {/* Debug Info */}
        {showDebug && (
          <div className="mt-3 p-2 bg-gray-100/50 rounded text-xs text-gray-600 space-y-1 font-mono">
            <div>Questions: {Math.ceil(messageCount / 2)}/{minQuestions}</div>
            <div>Archetypes: {detectedArchetypesCount}/{minArchetypes}</div>
            <div>Confidence: {minConfidence}% needed</div>
            {sessionData?.discovered_archetypes && (
              <div className="mt-2 pt-2 border-t border-gray-300/50">
                <div className="font-semibold mb-1">Detected Archetypes:</div>
                {Object.entries(sessionData.discovered_archetypes).map(([name, score]: [string, any]) => (
                  <div key={name} className="text-gray-500">
                    {name}: {typeof score === 'number' ? Math.round(score * 100) : score}%
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

