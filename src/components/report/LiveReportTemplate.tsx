'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Play, BookOpen, ExternalLink, Sparkles } from 'lucide-react'
import Image from 'next/image'

interface ArchetypeResult {
  id: string
  name: string
  description: string
  confidenceScore: number
  isPrimary: boolean
  assessmentContext: string
  visualContent: {
    primaryImage?: string
    backgroundColor?: string
    accentColor?: string
  }
  insights: {
    currentInfluence: string
    growthOpportunity: string
    integrationTip: string
    whyThisArchetype: string
  }
  resources: {
    theoreticalUnderstanding: string
    embodimentPractices: string[]
    integrationPractices: string[]
    articles?: string[]
    videos?: string[]
    exercises?: string[]
  }
  mediaContent: {
    meditationAudio?: string
    integrationVideo?: string
    guidanceAudio?: string
  }
}

interface LiveReportTemplateProps {
  assessmentResults: {
    id: string
    assessmentName: string
    completedAt: string
    discoveredArchetypes: ArchetypeResult[]
    overallInsights: {
      primaryPattern: string
      relationshipTheme: string
      growthAreas: string[]
      strengthAreas: string[]
    }
  }
  isPreview?: boolean
}

export function LiveReportTemplate({ assessmentResults, isPreview = false }: LiveReportTemplateProps) {
  const [selectedArchetype, setSelectedArchetype] = useState<ArchetypeResult>(
    assessmentResults.discoveredArchetypes.find(a => a.isPrimary) || assessmentResults.discoveredArchetypes[0]
  )

  const primaryArchetypes = assessmentResults.discoveredArchetypes.filter(a => a.isPrimary).slice(0, 3)
  const relatedArchetypes = assessmentResults.discoveredArchetypes.filter(a => !a.isPrimary).slice(0, 4)

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2 mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Your Archetypal Profile</h1>
        <p className="text-slate-600">Assessment: {assessmentResults.assessmentName}</p>
        <p className="text-sm text-slate-500">Completed on {new Date(assessmentResults.completedAt).toLocaleDateString()}</p>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side - Archetype Cards */}
        <div className="lg:col-span-1 space-y-6">
          {/* Primary Archetypes */}
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Primary Archetypes</h3>
            <div className="space-y-3">
              {primaryArchetypes.map((archetype) => (
                <ArchetypeCard
                  key={archetype.id}
                  archetype={archetype}
                  isSelected={selectedArchetype.id === archetype.id}
                  onClick={() => setSelectedArchetype(archetype)}
                />
              ))}
            </div>
          </div>

          {/* Related Archetypes */}
          {relatedArchetypes.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Related Archetypes</h3>
              <div className="space-y-3">
                {relatedArchetypes.map((archetype) => (
                  <ArchetypeCard
                    key={archetype.id}
                    archetype={archetype}
                    isSelected={selectedArchetype.id === archetype.id}
                    onClick={() => setSelectedArchetype(archetype)}
                    size="compact"
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Side - Detailed Information */}
        <div className="lg:col-span-2">
          <ArchetypeDetailPanel archetype={selectedArchetype} isPreview={isPreview} />
        </div>
      </div>
    </div>
  )
}

interface ArchetypeCardProps {
  archetype: ArchetypeResult
  isSelected: boolean
  onClick: () => void
  size?: 'normal' | 'compact'
}

function ArchetypeCard({ archetype, isSelected, onClick, size = 'normal' }: ArchetypeCardProps) {
  const cardHeight = size === 'compact' ? 'h-20' : 'h-32'
  const imageHeight = size === 'compact' ? 'h-20' : 'h-32'
  
  return (
    <Card 
      className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
        isSelected ? 'ring-2 ring-blue-500 shadow-lg' : 'hover:shadow-md'
      }`}
      onClick={onClick}
    >
      <div className={`relative ${cardHeight} overflow-hidden`}>
        {/* Background Image */}
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
              <Sparkles className="w-8 h-8 text-white opacity-80" />
            </div>
          </div>
        )}
        
        {/* Overlay Content */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-3">
          <div className="text-white">
            <h4 className={`font-semibold ${size === 'compact' ? 'text-sm' : 'text-base'}`}>
              {archetype.name}
            </h4>
            {size === 'normal' && (
              <Badge className="mt-1 bg-white/20 text-white border-white/30">
                {Math.round(archetype.confidenceScore)}% match
              </Badge>
            )}
          </div>
        </div>

        {/* Selection Indicator */}
        {isSelected && (
          <div className="absolute top-2 right-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full border-2 border-white"></div>
          </div>
        )}
      </div>
    </Card>
  )
}

interface ArchetypeDetailPanelProps {
  archetype: ArchetypeResult
  isPreview?: boolean
}

function ArchetypeDetailPanel({ archetype, isPreview }: ArchetypeDetailPanelProps) {
  return (
    <Card className="h-full">
      <CardContent className="p-8 space-y-8">
        {/* Header */}
        <div className="border-b pb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-slate-900">{archetype.name}</h2>
            <Badge variant="secondary" className="text-lg px-3 py-1">
              {Math.round(archetype.confidenceScore)}% match
            </Badge>
          </div>
          <p className="text-slate-600 text-lg leading-relaxed">{archetype.description}</p>
        </div>

        {/* Why This Archetype */}
        <div>
          <h3 className="text-xl font-semibold text-slate-900 mb-3">Why This Archetype Appeared</h3>
          <p className="text-slate-700 leading-relaxed">{archetype.insights.whyThisArchetype}</p>
        </div>

        {/* Current Influence */}
        <div>
          <h3 className="text-xl font-semibold text-slate-900 mb-3">Current Influence</h3>
          <p className="text-slate-700 leading-relaxed">{archetype.insights.currentInfluence}</p>
        </div>

        {/* Growth Opportunity */}
        <div>
          <h3 className="text-xl font-semibold text-slate-900 mb-3">Growth Opportunity</h3>
          <p className="text-slate-700 leading-relaxed">{archetype.insights.growthOpportunity}</p>
        </div>

        {/* Integration Tip */}
        <div>
          <h3 className="text-xl font-semibold text-slate-900 mb-3">Integration Tip</h3>
          <p className="text-slate-700 leading-relaxed">{archetype.insights.integrationTip}</p>
        </div>

        {/* Resources Section */}
        <div className="space-y-6 border-t pt-6">
          <h3 className="text-xl font-semibold text-slate-900">Resources & Practices</h3>
          
          {/* Theoretical Understanding */}
          {archetype.resources.theoreticalUnderstanding && (
            <div>
              <h4 className="font-medium text-slate-900 mb-2">Theoretical Understanding</h4>
              <p className="text-slate-700 text-sm leading-relaxed">{archetype.resources.theoreticalUnderstanding}</p>
            </div>
          )}

          {/* Embodiment Practices */}
          {archetype.resources.embodimentPractices.length > 0 && (
            <div>
              <h4 className="font-medium text-slate-900 mb-2">Embodiment Practices</h4>
              <ul className="space-y-1">
                {archetype.resources.embodimentPractices.map((practice, index) => (
                  <li key={index} className="text-slate-700 text-sm flex items-start gap-2">
                    <span className="text-blue-500 mt-1">•</span>
                    {practice}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Media Content */}
          {(archetype.mediaContent.integrationVideo || archetype.mediaContent.meditationAudio) && (
            <div>
              <h4 className="font-medium text-slate-900 mb-3">Media Resources</h4>
              <div className="flex gap-3">
                {archetype.mediaContent.integrationVideo && (
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <Play className="h-4 w-4" />
                    Integration Video
                  </Button>
                )}
                {archetype.mediaContent.meditationAudio && (
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <Play className="h-4 w-4" />
                    Meditation Audio
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* External Resources */}
          {(archetype.resources.articles?.length || archetype.resources.videos?.length) && (
            <div>
              <h4 className="font-medium text-slate-900 mb-3">Additional Resources</h4>
              <div className="space-y-2">
                {archetype.resources.articles?.map((article, index) => (
                  <Button key={index} variant="ghost" size="sm" className="justify-start h-auto p-2">
                    <BookOpen className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="text-left text-sm">{article}</span>
                    <ExternalLink className="h-3 w-3 ml-auto flex-shrink-0" />
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
