'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Star, 
  RotateCcw, 
  Lightbulb, 
  Target, 
  TrendingUp,
  Eye,
  Heart,
  Zap
} from 'lucide-react'

interface ArchetypeResult {
  id: string
  name: string
  description: string
  confidenceScore: number
  isPrimary: boolean
  insights: {
    currentInfluence: string
    growthOpportunity: string
    integrationTip: string
    whyThisArchetype: string
  }
}

interface FlippableArchetypeCardsProps {
  archetypes: ArchetypeResult[]
}

export function FlippableArchetypeCards({ archetypes }: FlippableArchetypeCardsProps) {
  const [flippedCards, setFlippedCards] = useState<Set<string>>(new Set())

  const toggleCard = (archetypeId: string) => {
    setFlippedCards(prev => {
      const newSet = new Set(prev)
      if (newSet.has(archetypeId)) {
        newSet.delete(archetypeId)
      } else {
        newSet.add(archetypeId)
      }
      return newSet
    })
  }

  const getArchetypeGradient = (name: string, isPrimary: boolean) => {
    const gradients = {
      'The Sage': 'from-purple-500 to-indigo-600',
      'The Hero': 'from-red-500 to-orange-600',
      'The Caregiver': 'from-green-500 to-emerald-600',
      'The Creator': 'from-yellow-500 to-amber-600',
      'The Innocent': 'from-blue-400 to-cyan-500',
      'The Explorer': 'from-teal-500 to-green-600',
      'The Rebel': 'from-gray-700 to-black',
      'The Lover': 'from-pink-500 to-rose-600',
      'The Jester': 'from-orange-400 to-yellow-500',
      'The Everyman': 'from-blue-600 to-indigo-700',
      'The Magician': 'from-violet-600 to-purple-700',
      'The Ruler': 'from-amber-600 to-orange-700'
    }
    
    const baseGradient = gradients[name as keyof typeof gradients] || 'from-gray-500 to-gray-600'
    return isPrimary ? `${baseGradient} shadow-lg shadow-purple-500/25` : baseGradient
  }

  const getArchetypeIcon = (name: string) => {
    const icons = {
      'The Sage': Eye,
      'The Hero': Zap,
      'The Caregiver': Heart,
      'The Creator': Lightbulb,
      'The Innocent': Star,
      'The Explorer': Target,
      'The Rebel': RotateCcw,
      'The Lover': Heart,
      'The Jester': Star,
      'The Everyman': TrendingUp,
      'The Magician': Zap,
      'The Ruler': Target
    }
    
    return icons[name as keyof typeof icons] || Star
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Your Archetypal Profile</h2>
        <p className="text-gray-600">Click any card to explore deeper insights</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {archetypes.map((archetype) => {
          const isFlipped = flippedCards.has(archetype.id)
          const IconComponent = getArchetypeIcon(archetype.name)
          
          return (
            <div
              key={archetype.id}
              className="relative h-80 perspective-1000"
              style={{ perspective: '1000px' }}
            >
              <div
                className={`relative w-full h-full transition-transform duration-700 transform-style-preserve-3d cursor-pointer ${
                  isFlipped ? 'rotate-y-180' : ''
                }`}
                onClick={() => toggleCard(archetype.id)}
                style={{ transformStyle: 'preserve-3d' }}
              >
                {/* Front of Card */}
                <Card 
                  className={`absolute inset-0 w-full h-full backface-hidden bg-gradient-to-br ${getArchetypeGradient(archetype.name, archetype.isPrimary)} text-white border-0`}
                  style={{ backfaceVisibility: 'hidden' }}
                >
                  <CardContent className="p-6 h-full flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <IconComponent className="h-8 w-8" />
                        {archetype.isPrimary && (
                          <Badge className="bg-white/20 text-white border-white/30">
                            Primary
                          </Badge>
                        )}
                      </div>
                      
                      <h3 className="text-xl font-bold mb-3">{archetype.name}</h3>
                      <p className="text-white/90 text-sm leading-relaxed">
                        {archetype.description}
                      </p>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-white/80">Confidence</span>
                        <span className="text-lg font-bold">{Math.round(archetype.confidenceScore)}%</span>
                      </div>
                      
                      <div className="w-full bg-white/20 rounded-full h-2">
                        <div 
                          className="bg-white rounded-full h-2 transition-all duration-500"
                          style={{ width: `${archetype.confidenceScore}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-center pt-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-white/80 hover:text-white hover:bg-white/10"
                        >
                          <RotateCcw className="h-4 w-4 mr-2" />
                          Flip for insights
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Back of Card */}
                <Card 
                  className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 bg-white border border-gray-200"
                  style={{ 
                    backfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)'
                  }}
                >
                  <CardContent className="p-6 h-full">
                    <div className="h-full flex flex-col">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-gray-900">{archetype.name} Insights</h3>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-gray-500 hover:text-gray-700"
                        >
                          <RotateCcw className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="space-y-4 flex-1">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Target className="h-4 w-4 text-blue-500" />
                            <span className="text-sm font-medium text-gray-700">Current Influence</span>
                          </div>
                          <p className="text-sm text-gray-600 leading-relaxed">
                            {archetype.insights.currentInfluence}
                          </p>
                        </div>

                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <TrendingUp className="h-4 w-4 text-green-500" />
                            <span className="text-sm font-medium text-gray-700">Growth Opportunity</span>
                          </div>
                          <p className="text-sm text-gray-600 leading-relaxed">
                            {archetype.insights.growthOpportunity}
                          </p>
                        </div>

                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Lightbulb className="h-4 w-4 text-yellow-500" />
                            <span className="text-sm font-medium text-gray-700">Integration Tip</span>
                          </div>
                          <p className="text-sm text-gray-600 leading-relaxed">
                            {archetype.insights.integrationTip}
                          </p>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-2 mb-2">
                          <Eye className="h-4 w-4 text-purple-500" />
                          <span className="text-sm font-medium text-gray-700">Why This Archetype?</span>
                        </div>
                        <p className="text-xs text-gray-500 leading-relaxed">
                          {archetype.insights.whyThisArchetype}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
