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
  Clock
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
}

interface UserArchetypesCollectionProps {
  userId: string
}

export function UserArchetypesCollection({ userId }: UserArchetypesCollectionProps) {
  const [archetypes, setArchetypes] = useState<UserArchetype[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'discovered' | 'working_on' | 'integrated'>('all')

  useEffect(() => {
    loadArchetypes()
  }, [userId])

  const loadArchetypes = async () => {
    try {
      const supabase = createClient()
      
      const { data, error } = await supabase
        .rpc('get_user_archetype_collection', { p_user_id: userId })

      if (error) throw error

      setArchetypes(data || [])
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
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredArchetypes.map((archetype) => (
            <Card key={archetype.user_archetype_id} className="border-gray-200/50 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      {archetype.archetype_name}
                      <Badge variant="outline" className="ml-2">
                        Impact: {archetype.impact_score}/7
                      </Badge>
                    </CardTitle>
                    {archetype.primary_alias && (
                      <p className="text-sm text-gray-600 mt-1">
                        Also known as: <span className="font-medium">{archetype.primary_alias}</span>
                      </p>
                    )}
                  </div>
                  <Badge variant="outline" className={getStatusColor(archetype.integration_status)}>
                    {archetype.integration_status.replace('_', ' ')}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                {/* Confidence Score */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <TrendingUp className={`h-4 w-4 ${getConfidenceColor(archetype.current_confidence_score)}`} />
                    <span className={`font-medium ${getConfidenceColor(archetype.current_confidence_score)}`}>
                      {archetype.current_confidence_score}% confidence
                    </span>
                  </div>
                  {archetype.peak_confidence_score > archetype.current_confidence_score && (
                    <span className="text-xs text-gray-500">
                      Peak: {archetype.peak_confidence_score}%
                    </span>
                  )}
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
                      <span>Detected {archetype.times_detected} times</span>
                    </div>
                  )}
                </div>

                {/* Discovery Summary */}
                {archetype.discovery_summary && (
                  <p className="text-sm text-gray-700 line-clamp-2 italic">
                    "{archetype.discovery_summary}"
                  </p>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs"
                    asChild
                  >
                    <Link href={`/dashboard/archetypes/${archetype.user_archetype_id}`}>
                      View Details
                      <ChevronRight className="h-3 w-3 ml-1" />
                    </Link>
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
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}

