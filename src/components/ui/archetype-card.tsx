"use client"

import { useState } from 'react'
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { 
  Play, 
  Pause, 
  Volume2, 
  Eye, 
  Heart, 
  Sparkles,
  ExternalLink,
  Download
} from 'lucide-react'
import Image from 'next/image'

interface ArchetypeCardProps {
  archetype: {
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
  }
  isRevealed: boolean
  onReveal?: () => void
  size?: 'compact' | 'full'
  interactive?: boolean
}

export function ArchetypeCard({ 
  archetype, 
  isRevealed, 
  onReveal, 
  size = 'full',
  interactive = true 
}: ArchetypeCardProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [selectedMedia, setSelectedMedia] = useState<string | null>(null)

  const handleMediaPlay = (mediaType: string) => {
    setIsPlaying(!isPlaying)
    setSelectedMedia(mediaType)
  }

  if (!isRevealed) {
    return (
      <Card className="relative overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 border-0 shadow-md hover:shadow-lg transition-all duration-300">
        <div className="h-48 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mx-auto animate-pulse">
              <Sparkles className="w-8 h-8 text-slate-400" />
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-slate-200 rounded w-24 mx-auto animate-pulse"></div>
              <div className="h-3 bg-slate-200 rounded w-32 mx-auto animate-pulse"></div>
            </div>
            <Progress value={archetype.confidenceScore} className="w-32 mx-auto" />
            <p className="text-sm text-slate-500">
              {Math.round(archetype.confidenceScore)}% confidence
            </p>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card 
      className={`relative overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-500 ${
        size === 'compact' ? 'h-64' : 'h-auto'
      }`}
      style={{ 
        background: archetype.visualContent.backgroundColor || 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)' 
      }}
    >
      {/* Header with Image */}
      <div className="relative h-32 overflow-hidden">
        {archetype.visualContent.primaryImage ? (
          <Image
            src={archetype.visualContent.primaryImage}
            alt={archetype.name}
            fill
            className="object-cover"
          />
        ) : (
          <div 
            className="w-full h-full bg-gradient-to-br from-slate-200 to-slate-300"
            style={{ backgroundColor: archetype.visualContent.accentColor || '#e2e8f0' }}
          >
            <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
              <Sparkles className="w-12 h-12 text-white opacity-80" />
            </div>
          </div>
        )}
        
        {/* Confidence Badge */}
        <div className="absolute top-3 right-3">
          <Badge className="bg-white bg-opacity-90 text-slate-700 border-0">
            {Math.round(archetype.confidenceScore)}% match
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Title & Description */}
        <div>
          <h3 className="text-xl font-medium text-slate-900 mb-2">
            {archetype.name}
          </h3>
          <p className="text-slate-600 text-sm leading-relaxed">
            {archetype.description}
          </p>
        </div>

        {/* Assessment Context */}
        <div className="bg-white bg-opacity-50 rounded-lg p-4 border-0">
          <p className="text-sm text-slate-700 font-medium mb-2">
            How this shows up in your assessment:
          </p>
          <p className="text-sm text-slate-600 leading-relaxed">
            {archetype.assessmentContext}
          </p>
        </div>

        {/* Insights */}
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <Heart className="w-4 h-4 text-rose-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-slate-700">Current Influence</p>
              <p className="text-sm text-slate-600">{archetype.insights.currentInfluence}</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <Sparkles className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-slate-700">Growth Opportunity</p>
              <p className="text-sm text-slate-600">{archetype.insights.growthOpportunity}</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <Eye className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-slate-700">Integration Tip</p>
              <p className="text-sm text-slate-600">{archetype.insights.integrationTip}</p>
            </div>
          </div>
        </div>

        {/* Media Content */}
        {(archetype.mediaContent.meditationAudio || archetype.mediaContent.integrationVideo || archetype.mediaContent.guidanceAudio) && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-slate-700">Integration Resources</h4>
            <div className="grid grid-cols-1 gap-2">
              {archetype.mediaContent.meditationAudio && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleMediaPlay('meditation')}
                  className="bg-white bg-opacity-50 border-0 hover:bg-white hover:bg-opacity-70 w-full justify-start"
                >
                  {isPlaying && selectedMedia === 'meditation' ? 
                    <Pause className="w-4 h-4 mr-2" /> : 
                    <Play className="w-4 h-4 mr-2" />
                  }
                  Guided Meditation
                </Button>
              )}
              
              {archetype.mediaContent.integrationVideo && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleMediaPlay('video')}
                  className="bg-white bg-opacity-50 border-0 hover:bg-white hover:bg-opacity-70 w-full justify-start"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Integration Video
                </Button>
              )}
              
              {archetype.mediaContent.guidanceAudio && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleMediaPlay('guidance')}
                  className="bg-white bg-opacity-50 border-0 hover:bg-white hover:bg-opacity-70 w-full justify-start"
                >
                  <Volume2 className="w-4 h-4 mr-2" />
                  Voice Guidance
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Resources */}
        {archetype.resources.articles && archetype.resources.articles.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-slate-700">Learn More</h4>
            <div className="space-y-2">
              {archetype.resources.articles.slice(0, 2).map((article, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start p-0 h-auto text-slate-600 hover:text-slate-900"
                >
                  <ExternalLink className="w-3 h-3 mr-2 flex-shrink-0" />
                  <span className="text-xs">{article}</span>
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {interactive && (
          <div className="flex gap-2 pt-4">
            <Button 
              size="sm" 
              className="flex-1 bg-slate-800 hover:bg-slate-900 text-white border-0"
            >
              Explore Deeper
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="bg-white bg-opacity-50 border-0 hover:bg-white hover:bg-opacity-70"
            >
              <Download className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </Card>
  )
} 