"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { ArchetypeCard } from "@/components/ui/archetype-card"
import { 
  Sparkles, 
  Eye, 
  TrendingUp,
  Star,
  Zap
} from 'lucide-react'

interface ArchetypeScore {
  name: string
  score: number
  confidence: number
  evidence: string[]
  traits: string[]
}

interface DiscoveredArchetype {
  id: string
  name: string
  description: string
  confidenceScore: number
  assessmentContext: string
  visualContent: {
    primaryImage?: string
    backgroundColor?: string
    accentColor?: string
  }
  mediaContent: {
    meditationAudio?: string
    integrationVideo?: string
    guidanceAudio?: string
  }
  insights: {
    currentInfluence: string
    growthOpportunity: string
    integrationTip: string
  }
  resources: {
    articles?: string[]
    exercises?: string[]
    affirmations?: string[]
  }
  revealedAt?: Date
}

interface ProgressiveArchetypeDiscoveryProps {
  archetypeScores: ArchetypeScore[]
  conversationTurn: number
  // onArchetypeExplore: (archetypeId: string) => void
}

export function ProgressiveArchetypeDiscovery({ 
  archetypeScores, 
  conversationTurn,
  // onArchetypeExplore 
}: ProgressiveArchetypeDiscoveryProps) {
  const [discoveredArchetypes, setDiscoveredArchetypes] = useState<DiscoveredArchetype[]>([])
  const [recentlyRevealed, setRecentlyRevealed] = useState<string | null>(null)

  // Mock archetype card data - in real app, this would come from your database/API
  const archetypeCardData: Record<string, Omit<DiscoveredArchetype, 'confidenceScore' | 'revealedAt'>> = {
    'The Wise Mentor': {
      id: 'wise-mentor',
      name: 'The Wise Mentor',
      description: 'A guiding presence that offers wisdom and clarity in times of uncertainty',
      assessmentContext: 'Your responses show a natural tendency to provide thoughtful guidance and help others see deeper truths.',
      visualContent: {
        backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        accentColor: '#8B5CF6'
      },
      mediaContent: {
        meditationAudio: '/audio/mentor-meditation.mp3',
        integrationVideo: '/video/mentor-integration.mp4'
      },
      insights: {
        currentInfluence: 'You naturally step into advisory roles and people seek your perspective on important decisions.',
        growthOpportunity: 'Develop your ability to ask powerful questions that unlock deeper insights.',
        integrationTip: 'Create space for others to discover their own wisdom rather than providing all the answers.'
      },
      resources: {
        articles: ['The Art of Powerful Questions', 'Mentoring vs Coaching: Key Differences'],
        exercises: ['Daily Reflection Practice', 'Question-Based Listening'],
        affirmations: ['I trust others to find their own path', 'My wisdom serves the highest good']
      }
    },
    'The Caregiver': {
      id: 'caregiver',
      name: 'The Caregiver',
      description: 'A nurturing force that puts others\' needs first and finds joy in service',
      assessmentContext: 'Your language patterns reveal a deep empathy and natural inclination to support and nurture others.',
      visualContent: {
        backgroundColor: 'linear-gradient(135deg, #ffeaa7 0%, #fab1a0 100%)',
        accentColor: '#E17055'
      },
      mediaContent: {
        meditationAudio: '/audio/caregiver-meditation.mp3'
      },
      insights: {
        currentInfluence: 'You instinctively prioritize others\' well-being and often sacrifice your own needs for their comfort.',
        growthOpportunity: 'Learn to set healthy boundaries while maintaining your compassionate nature.',
        integrationTip: 'Remember that caring for yourself enables you to care for others more effectively.'
      },
      resources: {
        articles: ['Healthy Boundaries for Caregivers', 'Self-Care Without Guilt'],
        exercises: ['Boundary Setting Practice', 'Self-Compassion Meditation'],
        affirmations: ['I deserve care and kindness too', 'My well-being matters']
      }
    },
    'The Lover': {
      id: 'lover',
      name: 'The Lover',
      description: 'A passionate soul that seeks deep connection and experiences life fully',
      assessmentContext: 'Your responses show a rich emotional life and a desire for meaningful, intimate connections.',
      visualContent: {
        backgroundColor: 'linear-gradient(135deg, #fd79a8 0%, #e84393 100%)',
        accentColor: '#E84393'
      },
      mediaContent: {
        meditationAudio: '/audio/lover-meditation.mp3',
        integrationVideo: '/video/lover-integration.mp4'
      },
      insights: {
        currentInfluence: 'You approach relationships with intensity and seek deep emotional bonds with others.',
        growthOpportunity: 'Balance your desire for closeness with respect for personal autonomy.',
        integrationTip: 'Channel your passionate nature into creative expression and meaningful connections.'
      },
      resources: {
        articles: ['Healthy Intimacy Patterns', 'Passion vs Attachment'],
        exercises: ['Emotional Regulation Practices', 'Creative Expression'],
        affirmations: ['I love deeply while respecting boundaries', 'My passion is a gift to the world']
      }
    }
  }

  // Determine which archetypes should be revealed based on confidence thresholds
  useEffect(() => {
    const confidenceThresholds = {
      peek: 0.3,    // Show as "emerging"
      reveal: 0.6,  // Fully reveal the card
      primary: 0.8  // Mark as primary archetype
    }

    const newDiscoveries: DiscoveredArchetype[] = []
    
    archetypeScores.forEach(score => {
      if (score.confidence >= confidenceThresholds.peek) {
        const cardData = archetypeCardData[score.name]
        if (cardData) {
          const existingArchetype = discoveredArchetypes.find(arch => arch.name === score.name)
          
          if (!existingArchetype) {
            // New discovery
            const newArchetype: DiscoveredArchetype = {
              ...cardData,
              confidenceScore: score.confidence * 100,
              revealedAt: new Date()
            }
            newDiscoveries.push(newArchetype)
            setRecentlyRevealed(newArchetype.id)
            
            // Clear the "recently revealed" highlight after 5 seconds
            setTimeout(() => setRecentlyRevealed(null), 5000)
          } else {
            // Update confidence score
            existingArchetype.confidenceScore = score.confidence * 100
          }
        }
      }
    })

    if (newDiscoveries.length > 0) {
      setDiscoveredArchetypes(prev => [...prev, ...newDiscoveries])
    }
  }, [archetypeScores, conversationTurn, discoveredArchetypes, archetypeCardData])

  const sortedArchetypes = discoveredArchetypes.sort((a, b) => b.confidenceScore - a.confidenceScore)
  const primaryArchetype = sortedArchetypes.find(arch => arch.confidenceScore >= 80)

  if (discoveredArchetypes.length === 0) {
    return (
      <Card className="border-0 bg-gradient-to-br from-slate-50 to-slate-100">
        <CardContent className="p-8 text-center">
          <div className="space-y-4">
            <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mx-auto animate-pulse">
              <Sparkles className="w-8 h-8 text-slate-400" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-slate-900 mb-2">Discovering Your Archetypes</h3>
              <p className="text-slate-600 text-sm">
                As our conversation deepens, your unique archetypal patterns will begin to emerge here
              </p>
            </div>
            <div className="flex justify-center">
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Progress value={Math.min(conversationTurn * 15, 95)} className="w-24" />
                <span>{conversationTurn} exchanges</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h3 className="text-xl font-medium text-slate-900 flex items-center justify-center gap-2">
          <Eye className="w-5 h-5 text-blue-500" />
          Your Emerging Archetypes
        </h3>
        <p className="text-slate-600 text-sm">
          {primaryArchetype 
            ? `${primaryArchetype.name} is your strongest pattern`
            : 'Patterns are still emerging - continue the conversation'
          }
        </p>
      </div>

      {/* Primary Archetype Highlight */}
      {primaryArchetype && (
        <Card className="border-0 bg-gradient-to-r from-blue-50 to-purple-50 shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500" />
                <CardTitle className="text-lg text-slate-900">Primary Archetype</CardTitle>
              </div>
              <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                {Math.round(primaryArchetype.confidenceScore)}% match
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <ArchetypeCard 
              archetype={primaryArchetype}
              isRevealed={true}
              size="full"
              interactive={true}
            />
          </CardContent>
        </Card>
      )}

      {/* Other Discovered Archetypes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sortedArchetypes
          .filter(arch => arch.confidenceScore < 80) // Exclude primary archetype
          .map((archetype) => (
            <div 
              key={archetype.id}
              className={`transition-all duration-500 ${
                recentlyRevealed === archetype.id 
                  ? 'ring-2 ring-blue-400 ring-opacity-50 animate-pulse' 
                  : ''
              }`}
            >
              <Card className="border-0 bg-white shadow-md hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {archetype.confidenceScore >= 60 ? (
                        <TrendingUp className="w-4 h-4 text-green-500" />
                      ) : (
                        <Zap className="w-4 h-4 text-amber-500" />
                      )}
                      <span className="text-sm font-medium text-slate-700">
                        {archetype.confidenceScore >= 60 ? 'Strong Pattern' : 'Emerging Pattern'}
                      </span>
                    </div>
                    <Badge variant="outline" className="border-slate-300 text-slate-600">
                      {Math.round(archetype.confidenceScore)}%
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <ArchetypeCard 
                    archetype={archetype}
                    isRevealed={archetype.confidenceScore >= 60}
                    size="compact"
                    interactive={archetype.confidenceScore >= 60}
                  />
                </CardContent>
              </Card>
            </div>
          ))}
      </div>

      {/* Progress Indicator */}
      <Card className="border-0 bg-slate-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between text-sm text-slate-600">
            <span>Discovery Progress</span>
            <span>{discoveredArchetypes.length} patterns found</span>
          </div>
          <Progress 
            value={Math.min(conversationTurn * 10 + discoveredArchetypes.length * 15, 100)} 
            className="mt-2" 
          />
          <p className="text-xs text-slate-500 mt-2 text-center">
            Continue the conversation to deepen your archetypal understanding
          </p>
        </CardContent>
      </Card>
    </div>
  )
} 