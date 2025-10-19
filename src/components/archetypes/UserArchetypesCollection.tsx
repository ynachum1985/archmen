'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Sparkles,
  TrendingUp,
  Calendar,
  BookOpen,
  AlertCircle,
  ChevronRight,
  Target,
  Clock,
  ChevronDown,
  Zap,
  Heart
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

interface UserArchetype {
  user_archetype_id: string
  archetype_id: string
  archetype_name: string
  archetype_description: string
  primary_alias: string | null
  ranked_aliases: any[]
  current_confidence_score: number
  peak_confidence_score: number
  impact_score: number
  first_discovered_at: string
  discovered_in_assessment_name: string | null
  discovery_summary: string | null
  key_evidence: string[]
  pattern_timeline: Record<string, any>
  integration_status: string
  times_detected: number
  assessments_detected_in: string[]
  user_notes: string | null
  archetype_images: any
  traits: any
  psychology_profile: any
  shadow?: string[]
  gold?: string[]
}

interface UserArchetypesCollectionProps {
  userId: string
}

export function UserArchetypesCollection({ userId }: UserArchetypesCollectionProps) {
  const [archetypes, setArchetypes] = useState<UserArchetype[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'discovered' | 'working_on' | 'integrated'>('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [assessments, setAssessments] = useState<any[]>([])

  useEffect(() => {
    loadArchetypes()
  }, [userId])

  const loadArchetypes = async () => {
    try {
      const supabase = createClient()

      // Load assessments first
      const { data: assessmentsList } = await supabase
        .from('enhanced_assessments')
        .select('id, name')
        .eq('status', 'live')
        .order('name')

      if (assessmentsList) {
        setAssessments(assessmentsList)
      }

      // Load sample archetypes from database for demo/admin view
      const { data: sampleArchetypes, error: sampleError } = await supabase
        .from('enhanced_archetypes')
        .select('*')
        .eq('is_active', true)
        .order('name')
        .limit(20) // Load first 20 for demo

      if (!sampleError && sampleArchetypes && sampleArchetypes.length > 0) {
        // Get random assessment names for demo
        const getRandomAssessment = () => {
          if (assessmentsList && assessmentsList.length > 0) {
            return assessmentsList[Math.floor(Math.random() * assessmentsList.length)].name
          }
          return 'Relationship Patterns Assessment'
        }

        // Transform database archetypes to UserArchetype format
        const transformedArchetypes: UserArchetype[] = sampleArchetypes.map((arch: any) => ({
          user_archetype_id: arch.id,
          archetype_id: arch.id,
          archetype_name: arch.name,
          archetype_description: arch.description,
          primary_alias: arch.alternative_names?.[0] || null,
          ranked_aliases: arch.alternative_names || [],
          current_confidence_score: 70 + Math.random() * 30, // Random 70-100
          peak_confidence_score: 85 + Math.random() * 15, // Random 85-100
          impact_score: Math.floor(Math.random() * 7) + 1, // Random 1-7
          first_discovered_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
          discovered_in_assessment_name: getRandomAssessment(),
          discovery_summary: arch.description,
          key_evidence: [],
          pattern_timeline: {},
          integration_status: ['discovered', 'working_on', 'integrated'][Math.floor(Math.random() * 3)],
          times_detected: Math.floor(Math.random() * 5) + 1,
          assessments_detected_in: [],
          user_notes: null,
          archetype_images: arch.archetype_images,
          traits: arch.traits,
          psychology_profile: arch.psychology_profile,
          shadow: arch.psychology_profile?.shadow_aspects || [],
          gold: arch.psychology_profile?.gifts || []
        }))
        setArchetypes(transformedArchetypes)
      }
    } catch (error) {
      console.error('Error loading archetypes:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'discovered':
        return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'working_on':
        return 'bg-orange-100 text-orange-700 border-orange-200'
      case 'integrated':
        return 'bg-green-100 text-green-700 border-green-200'
      case 'archived':
        return 'bg-gray-100 text-gray-700 border-gray-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600'
    if (confidence >= 60) return 'text-orange-600'
    return 'text-gray-600'
  }

  const filteredArchetypes = archetypes.filter(arch => 
    filter === 'all' || arch.integration_status === filter
  )

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white/40 backdrop-blur-sm">
        <div className="text-center">
          <Sparkles className="h-12 w-12 text-gray-400 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Loading your archetypes...</p>
        </div>
      </div>
    )
  }

  if (archetypes.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white/40 backdrop-blur-sm">
        <div className="text-center max-w-md px-4">
          <Sparkles className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Archetypes Discovered Yet</h3>
          <p className="text-gray-600 mb-4">
            Complete an assessment to discover your archetypal patterns and build your collection.
          </p>
          <Button asChild>
            <Link href="/dashboard">
              Start an Assessment
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col bg-white/40 backdrop-blur-sm">
      {/* Header */}
      <div className="border-b border-gray-200/50 p-4 bg-white/60 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-purple-600" />
            </div>
            <div>
              <h2 className="font-medium text-gray-900">My Archetypes</h2>
              <p className="text-xs text-gray-500">
                {archetypes.length} {archetypes.length === 1 ? 'archetype' : 'archetypes'} in your collection
              </p>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            All ({archetypes.length})
          </Button>
          <Button
            variant={filter === 'discovered' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('discovered')}
          >
            Discovered ({archetypes.filter(a => a.integration_status === 'discovered').length})
          </Button>
          <Button
            variant={filter === 'working_on' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('working_on')}
          >
            Working On ({archetypes.filter(a => a.integration_status === 'working_on').length})
          </Button>
          <Button
            variant={filter === 'integrated' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('integrated')}
          >
            Integrated ({archetypes.filter(a => a.integration_status === 'integrated').length})
          </Button>
        </div>
      </div>

      {/* Archetypes Grid */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {filteredArchetypes.map((archetype) => {
            const isExpanded = expandedId === archetype.user_archetype_id

            return (
            <Card
              key={archetype.user_archetype_id}
              className={`border-gray-200/50 shadow-sm hover:shadow-md transition-all overflow-hidden ${
                isExpanded ? 'col-span-full' : ''
              }`}
            >
              {/* Card Header - Clickable to expand */}
              <CardHeader
                className="pb-3 cursor-pointer hover:bg-gray-50/50 transition-colors"
                onClick={() => setExpandedId(expandedId === archetype.user_archetype_id ? null : archetype.user_archetype_id)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg">
                        {archetype.archetype_name}
                      </CardTitle>
                      <ChevronDown
                        className={`h-4 w-4 text-gray-400 transition-transform flex-shrink-0 ${
                          expandedId === archetype.user_archetype_id ? '' : '-rotate-90'
                        }`}
                      />
                    </div>
                    {archetype.primary_alias && (
                      <p className="text-xs text-gray-500 mt-1">
                        Also known as: <span className="font-medium">{archetype.primary_alias}</span>
                      </p>
                    )}
                  </div>
                  <Badge variant="outline" className={getStatusColor(archetype.integration_status)}>
                    {archetype.integration_status.replace('_', ' ')}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className={`space-y-3 ${isExpanded ? 'space-y-6' : ''}`}>
                {/* Confidence Score */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <TrendingUp className={`h-4 w-4 ${getConfidenceColor(archetype.current_confidence_score)}`} />
                    <span className={`font-medium ${getConfidenceColor(archetype.current_confidence_score)}`}>
                      {Math.round(archetype.current_confidence_score)}% confidence
                    </span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    Impact: {archetype.impact_score}/7
                  </Badge>
                </div>

                {/* Discovery Info */}
                <div className="text-xs text-gray-600 space-y-1">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3 w-3" />
                    <span>Discovered: {new Date(archetype.first_discovered_at).toLocaleDateString()}</span>
                  </div>
                  {archetype.discovered_in_assessment_name && (
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-3 w-3" />
                      <span>In: {archetype.discovered_in_assessment_name}</span>
                    </div>
                  )}
                  {archetype.times_detected > 1 && (
                    <div className="flex items-center gap-2">
                      <Target className="h-3 w-3" />
                      <span>Detected {archetype.times_detected}x</span>
                    </div>
                  )}
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="mt-6 pt-6 border-t border-gray-200 space-y-6">
                    {/* Description */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Overview</h4>
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {archetype.archetype_description}
                      </p>
                    </div>

                    {/* Two Column Layout for Shadow and Gold */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Shadow Aspects */}
                      {archetype.shadow && archetype.shadow.length > 0 && (
                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            <AlertCircle className="h-5 w-5 text-red-500" />
                            <h4 className="text-sm font-medium text-gray-900">Shadow Aspects</h4>
                          </div>
                          <ul className="text-sm text-gray-700 space-y-2 ml-7">
                            {archetype.shadow.map((item, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <span className="text-red-500 mt-0.5 font-bold">•</span>
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Gold / Gifts */}
                      {archetype.gold && archetype.gold.length > 0 && (
                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            <Zap className="h-5 w-5 text-amber-500" />
                            <h4 className="text-sm font-medium text-gray-900">Gold / Gifts</h4>
                          </div>
                          <ul className="text-sm text-gray-700 space-y-2 ml-7">
                            {archetype.gold.map((item, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <span className="text-amber-500 mt-0.5 font-bold">•</span>
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    {/* Psychology Profile */}
                    {archetype.psychology_profile && typeof archetype.psychology_profile === 'object' && (
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <Heart className="h-5 w-5 text-purple-500" />
                          <h4 className="text-sm font-medium text-gray-900">Psychology Profile</h4>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-7">
                          {Object.entries(archetype.psychology_profile).map(([key, value]) => (
                            <div key={key} className="bg-gray-50 p-3 rounded">
                              <p className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">
                                {key.replace(/_/g, ' ')}
                              </p>
                              <p className="text-sm text-gray-900">
                                {String(value)}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs"
                    onClick={() => setExpandedId(isExpanded ? null : archetype.user_archetype_id)}
                  >
                    {isExpanded ? 'Collapse' : 'View Details'}
                    <ChevronRight className={`h-3 w-3 ml-1 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs"
                  >
                    <BookOpen className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
            )
          })}
        </div>
      </ScrollArea>
    </div>
  )
}

