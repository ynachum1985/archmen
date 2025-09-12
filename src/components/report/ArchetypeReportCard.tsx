'use client'

import { useState } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  RotateCcw,
  BookOpen,
  Heart,
  Target,
  Play
} from 'lucide-react'

interface DiscoveredArchetype {
  id: string
  name: string
  description: string
  confidenceScore: number
  assessmentContext: string
  archetype_images?: string[]
  impact_score?: number
  growth_potential_score?: number
  awareness_difficulty_score?: number
  trigger_intensity_score?: number
  integration_complexity_score?: number
  shadow_depth_score?: number
  insights: {
    currentInfluence: string
    growthOpportunity: string
    integrationTip: string
    shadowPattern?: string
  }
  resources: {
    theoreticalUnderstanding: string
    embodimentPractices: string[]
    integrationPractices: string[]
    articles?: string[]
    exercises?: string[]
    affirmations?: string[]
  }
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
}

interface ArchetypeReportCardProps {
  archetype: DiscoveredArchetype
  isFlipped?: boolean
  onFlip?: () => void
  size?: 'normal' | 'compact'
}

export function ArchetypeReportCard({ 
  archetype, 
  isFlipped = false, 
  onFlip,
  size = 'normal' 
}: ArchetypeReportCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  
  const cardHeight = size === 'compact' ? 'h-64' : 'h-96'
  const images = archetype.archetype_images || []
  
  const nextImage = () => {
    if (images.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % images.length)
    }
  }

  const getConfidenceColor = (score: number) => {
    if (score >= 80) return 'bg-green-500'
    if (score >= 60) return 'bg-yellow-500'
    return 'bg-orange-500'
  }

  return (
    <div className={`relative ${cardHeight} w-full max-w-sm mx-auto perspective-1000`}>
      <div 
        className={`relative w-full h-full transition-transform duration-700 transform-style-preserve-3d ${
          isFlipped ? 'rotate-y-180' : ''
        }`}
      >
        {/* Front of Card */}
        <Card className={`absolute inset-0 w-full h-full backface-hidden border-0 shadow-lg overflow-hidden ${
          isFlipped ? 'pointer-events-none' : ''
        }`}>
          {/* Cover Image */}
          <div 
            className="relative h-2/3 bg-gradient-to-br from-slate-200 to-slate-300 overflow-hidden"
            style={{
              background: archetype.visualContent.backgroundColor || 
                         'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            }}
          >
            {images.length > 0 ? (
              <>
                <img 
                  src={images[currentImageIndex]} 
                  alt={archetype.name}
                  className="w-full h-full object-cover"
                />
                {images.length > 1 && (
                  <div className="absolute bottom-2 right-2 flex gap-1">
                    {images.map((_, index) => (
                      <div
                        key={index}
                        className={`w-2 h-2 rounded-full ${
                          index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                        }`}
                      />
                    ))}
                  </div>
                )}
                {images.length > 1 && (
                  <button
                    onClick={nextImage}
                    className="absolute inset-0 w-full h-full bg-transparent"
                  />
                )}
              </>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center text-white">
                  <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-80" />
                  <p className="text-lg font-medium">{archetype.name}</p>
                </div>
              </div>
            )}
            
            {/* Confidence Badge */}
            <div className="absolute top-4 right-4">
              <Badge 
                className={`${getConfidenceColor(archetype.confidenceScore)} text-white border-0`}
              >
                {archetype.confidenceScore}% match
              </Badge>
            </div>
          </div>

          {/* Card Info */}
          <CardContent className="h-1/3 p-4 flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-lg text-gray-900 mb-1">{archetype.name}</h3>
              <p className="text-sm text-gray-600 line-clamp-2">{archetype.description}</p>
            </div>
            
            <div className="flex items-center justify-between mt-3">
              <div className="flex gap-2">
                {archetype.impact_score && (
                  <Badge variant="outline" className="text-xs">
                    Impact: {archetype.impact_score}/7
                  </Badge>
                )}
                {archetype.growth_potential_score && (
                  <Badge variant="outline" className="text-xs">
                    Growth: {archetype.growth_potential_score}/7
                  </Badge>
                )}
              </div>
              
              {onFlip && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onFlip}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <RotateCcw className="w-4 h-4 mr-1" />
                  Details
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Back of Card */}
        <Card className={`absolute inset-0 w-full h-full backface-hidden rotate-y-180 border-0 shadow-lg ${
          !isFlipped ? 'pointer-events-none' : ''
        }`}>
          <CardContent className="h-full p-4 overflow-y-auto">
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-lg text-gray-900">{archetype.name}</h3>
                {onFlip && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onFlip}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                )}
              </div>

              {/* Assessment Context */}
              <div>
                <h4 className="font-medium text-sm text-gray-700 mb-1 flex items-center">
                  <Target className="w-4 h-4 mr-1" />
                  Your Pattern
                </h4>
                <p className="text-xs text-gray-600">{archetype.assessmentContext}</p>
              </div>

              {/* Current Influence */}
              <div>
                <h4 className="font-medium text-sm text-gray-700 mb-1 flex items-center">
                  <Heart className="w-4 h-4 mr-1" />
                  Current Influence
                </h4>
                <p className="text-xs text-gray-600">{archetype.insights.currentInfluence}</p>
              </div>

              {/* Growth Opportunity */}
              <div>
                <h4 className="font-medium text-sm text-gray-700 mb-1">Growth Opportunity</h4>
                <p className="text-xs text-gray-600">{archetype.insights.growthOpportunity}</p>
              </div>

              {/* Integration Tip */}
              <div>
                <h4 className="font-medium text-sm text-gray-700 mb-1">Integration Tip</h4>
                <p className="text-xs text-gray-600">{archetype.insights.integrationTip}</p>
              </div>

              {/* Media Content */}
              {(archetype.mediaContent.meditationAudio || archetype.mediaContent.integrationVideo) && (
                <div>
                  <h4 className="font-medium text-sm text-gray-700 mb-2">Resources</h4>
                  <div className="flex gap-2">
                    {archetype.mediaContent.meditationAudio && (
                      <Button variant="outline" size="sm" className="text-xs">
                        <Play className="w-3 h-3 mr-1" />
                        Meditation
                      </Button>
                    )}
                    {archetype.mediaContent.integrationVideo && (
                      <Button variant="outline" size="sm" className="text-xs">
                        <Play className="w-3 h-3 mr-1" />
                        Video
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {/* Metrics */}
              {(archetype.impact_score || archetype.growth_potential_score) && (
                <div>
                  <h4 className="font-medium text-sm text-gray-700 mb-2">Metrics</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {archetype.impact_score && (
                      <div className="text-center p-2 bg-gray-50 rounded">
                        <div className="font-medium">Impact</div>
                        <div className="text-gray-600">{archetype.impact_score}/7</div>
                      </div>
                    )}
                    {archetype.growth_potential_score && (
                      <div className="text-center p-2 bg-gray-50 rounded">
                        <div className="font-medium">Growth</div>
                        <div className="text-gray-600">{archetype.growth_potential_score}/7</div>
                      </div>
                    )}
                    {archetype.trigger_intensity_score && (
                      <div className="text-center p-2 bg-gray-50 rounded">
                        <div className="font-medium">Trigger</div>
                        <div className="text-gray-600">{archetype.trigger_intensity_score}/7</div>
                      </div>
                    )}
                    {archetype.integration_complexity_score && (
                      <div className="text-center p-2 bg-gray-50 rounded">
                        <div className="font-medium">Integration</div>
                        <div className="text-gray-600">{archetype.integration_complexity_score}/7</div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// CSS for 3D flip effect is in globals.css
