'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BookOpen, ExternalLink, Sparkles, Heart, Target, Moon, Library, Video } from 'lucide-react'
import Image from 'next/image'

interface ContentBlock {
  id: string
  type: 'text' | 'image' | 'video' | 'exercise' | 'resource_link'
  content: {
    text?: string
    url?: string
    title?: string
    description?: string
  }
}

interface ArchetypeContentPage {
  blocks: ContentBlock[]
}

interface ArchetypeContent {
  opening?: ArchetypeContentPage
  theoretical?: ArchetypeContentPage
  embodiment?: ArchetypeContentPage
  integration?: ArchetypeContentPage
  shadow?: ArchetypeContentPage
  resources?: ArchetypeContentPage
}

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
  // New structured content
  structuredContent?: ArchetypeContent
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

function ArchetypeDetailPanel({ archetype }: ArchetypeDetailPanelProps) {
  const [activeTab, setActiveTab] = useState('overview')

  // Check if we have structured content
  const hasStructuredContent = archetype.structuredContent && Object.keys(archetype.structuredContent).length > 0

  const contentPages = [
    { id: 'overview', name: 'Overview', icon: Heart },
    { id: 'theoretical', name: 'Understanding', icon: BookOpen },
    { id: 'embodiment', name: 'Embodiment', icon: Target },
    { id: 'integration', name: 'Integration', icon: Moon },
    { id: 'shadow', name: 'Shadow Work', icon: Moon },
    { id: 'resources', name: 'Resources', icon: Library }
  ]

  return (
    <Card className="h-full">
      <CardContent className="p-8">
        {/* Header */}
        <div className="border-b pb-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-slate-900">{archetype.name}</h2>
            <Badge variant="secondary" className="text-lg px-3 py-1">
              {Math.round(archetype.confidenceScore)}% match
            </Badge>
          </div>
          <p className="text-slate-600 text-lg leading-relaxed">{archetype.description}</p>
        </div>

        {hasStructuredContent ? (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid grid-cols-6 w-full">
              {contentPages.map((page) => {
                const Icon = page.icon
                const hasContent = archetype.structuredContent?.[page.id as keyof ArchetypeContent]?.blocks?.length > 0
                return (
                  <TabsTrigger key={page.id} value={page.id} className="flex flex-col gap-1 h-auto py-2">
                    <Icon className="h-4 w-4" />
                    <span className="text-xs">{page.name}</span>
                    {hasContent && <div className="w-1 h-1 bg-blue-500 rounded-full" />}
                  </TabsTrigger>
                )
              })}
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <ArchetypeOverviewContent archetype={archetype} />
            </TabsContent>

            {contentPages.slice(1).map((page) => (
              <TabsContent key={page.id} value={page.id} className="space-y-6">
                <StructuredContentRenderer
                  content={archetype.structuredContent?.[page.id as keyof ArchetypeContent]}
                  fallbackContent={getFallbackContent(archetype, page.id)}
                />
              </TabsContent>
            ))}
          </Tabs>
        ) : (
          <div className="space-y-8">
            <ArchetypeOverviewContent archetype={archetype} />
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Helper component for overview content
function ArchetypeOverviewContent({ archetype }: { archetype: ArchetypeResult }) {
  return (
    <div className="space-y-8">
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
    </div>
  )
}

// Component for rendering structured content blocks
function StructuredContentRenderer({ content, fallbackContent }: {
  content?: ArchetypeContentPage
  fallbackContent?: React.ReactNode
}) {
  if (!content || content.blocks.length === 0) {
    return fallbackContent ? <div>{fallbackContent}</div> : (
      <div className="text-center py-8 text-muted-foreground">
        <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No content available for this section yet.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {content.blocks.map((block) => (
        <ContentBlockRenderer key={block.id} block={block} />
      ))}
    </div>
  )
}

// Component for rendering individual content blocks
function ContentBlockRenderer({ block }: { block: ContentBlock }) {
  switch (block.type) {
    case 'text':
      return (
        <div className="prose prose-slate max-w-none">
          <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
            {block.content.text}
          </p>
        </div>
      )

    case 'image':
      return (
        <div className="space-y-3">
          {block.content.url && (
            <div className="relative w-full h-64 rounded-lg overflow-hidden">
              <Image
                src={block.content.url}
                alt={block.content.title || 'Content image'}
                fill
                className="object-cover"
              />
            </div>
          )}
          {block.content.title && (
            <h4 className="font-semibold text-slate-900">{block.content.title}</h4>
          )}
          {block.content.description && (
            <p className="text-slate-700">{block.content.description}</p>
          )}
        </div>
      )

    case 'video':
      return (
        <div className="space-y-3">
          {block.content.title && (
            <h4 className="font-semibold text-slate-900">{block.content.title}</h4>
          )}
          {block.content.url && (
            <div className="aspect-video rounded-lg overflow-hidden bg-slate-100 flex items-center justify-center">
              <div className="text-center">
                <Video className="h-12 w-12 mx-auto mb-2 text-slate-400" />
                <p className="text-sm text-slate-600">Video: {block.content.url}</p>
              </div>
            </div>
          )}
          {block.content.description && (
            <p className="text-slate-700">{block.content.description}</p>
          )}
        </div>
      )

    case 'exercise':
      return (
        <Card className="border-l-4 border-l-blue-500 bg-blue-50/50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Target className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
              <div className="space-y-2">
                {block.content.title && (
                  <h4 className="font-semibold text-slate-900">{block.content.title}</h4>
                )}
                {block.content.description && (
                  <p className="text-slate-700">{block.content.description}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )

    case 'resource_link':
      return (
        <Card className="border-l-4 border-l-green-500 bg-green-50/50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <ExternalLink className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
              <div className="space-y-2">
                {block.content.title && (
                  <h4 className="font-semibold text-slate-900">{block.content.title}</h4>
                )}
                {block.content.description && (
                  <p className="text-slate-700">{block.content.description}</p>
                )}
                {block.content.url && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={block.content.url} target="_blank" rel="noopener noreferrer">
                      Visit Resource
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )

    default:
      return null
  }
}

// Helper function to get fallback content for legacy support
function getFallbackContent(archetype: ArchetypeResult, pageId: string) {
  switch (pageId) {
    case 'theoretical':
      return (
        <div>
          <h3 className="text-xl font-semibold text-slate-900 mb-3">Theoretical Understanding</h3>
          <p className="text-slate-700 leading-relaxed">{archetype.resources.theoreticalUnderstanding}</p>
        </div>
      )

    case 'embodiment':
      return (
        <div>
          <h3 className="text-xl font-semibold text-slate-900 mb-3">Embodiment Practices</h3>
          <ul className="space-y-2">
            {archetype.resources.embodimentPractices.map((practice, index) => (
              <li key={index} className="text-slate-700 flex items-start gap-2">
                <span className="text-blue-500 mt-1">•</span>
                {practice}
              </li>
            ))}
          </ul>
        </div>
      )

    case 'integration':
      return (
        <div>
          <h3 className="text-xl font-semibold text-slate-900 mb-3">Integration Practices</h3>
          <ul className="space-y-2">
            {archetype.resources.integrationPractices.map((practice, index) => (
              <li key={index} className="text-slate-700 flex items-start gap-2">
                <span className="text-blue-500 mt-1">•</span>
                {practice}
              </li>
            ))}
          </ul>
        </div>
      )

    default:
      return null
  }
}
