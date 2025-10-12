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
  ChevronDown,
  ChevronUp,
  AlertCircle
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface RankedAlias {
  name: string
  strength: 'strong' | 'moderate' | 'mild'
  confidence: number
}

interface EmergingArchetype {
  archetype_id: string
  archetype_name: string
  confidence_score: number
  impact_score: number
  ranked_aliases: RankedAlias[]
  evidence: string[]
  detected_at: string
}

interface EmergingArchetypesViewProps {
  userId: string
  conversationId?: string
}

export function EmergingArchetypesView({ userId, conversationId }: EmergingArchetypesViewProps) {
  const [archetypes, setArchetypes] = useState<EmergingArchetype[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedArchetype, setExpandedArchetype] = useState<string | null>(null)

  useEffect(() => {
    if (conversationId) {
      loadEmergingArchetypes()
    }
  }, [conversationId])

  const loadEmergingArchetypes = async () => {
    try {
      const supabase = createClient()
      
      // Get the conversation's emerging archetypes
      const { data: conversation, error } = await supabase
        .from('conversations')
        .select('emerging_archetypes')
        .eq('id', conversationId)
        .eq('user_id', userId)
        .single()

      if (error) throw error

      if (conversation?.emerging_archetypes) {
        setArchetypes(conversation.emerging_archetypes as EmergingArchetype[])
      }
    } catch (error) {
      console.error('Error loading emerging archetypes:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStrengthColor = (strength: string) => {
    switch (strength) {
      case 'strong':
        return 'bg-red-100 text-red-700 border-red-200'
      case 'moderate':
        return 'bg-orange-100 text-orange-700 border-orange-200'
      case 'mild':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600'
    if (confidence >= 60) return 'text-orange-600'
    return 'text-gray-600'
  }

  const handleAddToCollection = async (archetype: EmergingArchetype) => {
    try {
      const supabase = createClient()

      // Call the upsert function to add/update archetype in user's collection
      const { data, error } = await supabase.rpc('upsert_user_archetype', {
        p_user_id: userId,
        p_archetype_id: archetype.archetype_id,
        p_conversation_id: conversationId,
        p_assessment_id: null, // Will be set from conversation metadata if available
        p_confidence_score: archetype.confidence_score,
        p_primary_alias: archetype.ranked_aliases[0]?.name || archetype.archetype_name,
        p_ranked_aliases: archetype.ranked_aliases,
        p_discovery_summary: `Detected through conversation patterns with ${archetype.confidence_score}% confidence`,
        p_evidence: archetype.evidence
      })

      if (error) throw error

      alert(`${archetype.archetype_name} added to your collection!`)
    } catch (error) {
      console.error('Error adding to collection:', error)
      alert('Failed to add archetype to collection')
    }
  }

  const handleAddToHomework = async (archetype: EmergingArchetype) => {
    // TODO: Implement add to homework functionality
    console.log('Add to homework:', archetype)
  }

  const handleScheduleWork = async (archetype: EmergingArchetype) => {
    // TODO: Implement schedule work functionality
    console.log('Schedule work:', archetype)
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white/40 backdrop-blur-sm">
        <div className="text-center">
          <Sparkles className="h-12 w-12 text-gray-400 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Loading discovered patterns...</p>
        </div>
      </div>
    )
  }

  if (!conversationId) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white/40 backdrop-blur-sm">
        <div className="text-center max-w-md px-4">
          <Sparkles className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Assessment Selected</h3>
          <p className="text-gray-600">
            Select an assessment from the sidebar to start discovering your archetypal patterns.
          </p>
        </div>
      </div>
    )
  }

  if (archetypes.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white/40 backdrop-blur-sm">
        <div className="text-center max-w-md px-4">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Patterns Detected Yet</h3>
          <p className="text-gray-600">
            Continue your conversation and archetypal patterns will emerge as the AI analyzes your responses.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col bg-white/40 backdrop-blur-sm">
      {/* Header */}
      <div className="border-b border-gray-200/50 p-4 bg-white/60 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-purple-600" />
          </div>
          <div>
            <h2 className="font-medium text-gray-900">Emerging Archetypes</h2>
            <p className="text-xs text-gray-500">
              {archetypes.length} {archetypes.length === 1 ? 'pattern' : 'patterns'} discovered
            </p>
          </div>
        </div>
      </div>

      {/* Archetypes List */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {archetypes
            .sort((a, b) => b.confidence_score - a.confidence_score)
            .map((archetype) => (
              <Card key={archetype.archetype_id} className="border-gray-200/50 shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg flex items-center gap-2">
                        {archetype.archetype_name}
                        <Badge variant="outline" className="ml-2">
                          Impact: {archetype.impact_score}/7
                        </Badge>
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-2">
                        <TrendingUp className={`h-4 w-4 ${getConfidenceColor(archetype.confidence_score)}`} />
                        <span className={`text-sm font-medium ${getConfidenceColor(archetype.confidence_score)}`}>
                          {archetype.confidence_score}% confidence
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setExpandedArchetype(
                        expandedArchetype === archetype.archetype_id ? null : archetype.archetype_id
                      )}
                    >
                      {expandedArchetype === archetype.archetype_id ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  {/* Ranked Aliases */}
                  {archetype.ranked_aliases && archetype.ranked_aliases.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-gray-600 mb-2">Also shows up as:</p>
                      <div className="space-y-1">
                        {archetype.ranked_aliases.map((alias, idx) => (
                          <div key={idx} className="flex items-center justify-between text-sm">
                            <span className="text-gray-700">{alias.name}</span>
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${getStrengthColor(alias.strength)}`}
                            >
                              {alias.strength}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Evidence (when expanded) */}
                  {expandedArchetype === archetype.archetype_id && archetype.evidence && archetype.evidence.length > 0 && (
                    <div className="pt-3 border-t border-gray-200">
                      <p className="text-xs font-medium text-gray-600 mb-2">Evidence from conversation:</p>
                      <div className="space-y-2">
                        {archetype.evidence.slice(0, 3).map((quote, idx) => (
                          <div key={idx} className="text-xs text-gray-600 italic bg-gray-50 p-2 rounded">
                            "{quote}"
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="space-y-2 pt-2">
                    <Button
                      variant="default"
                      size="sm"
                      className="w-full text-xs"
                      onClick={() => handleAddToCollection(archetype)}
                    >
                      <Sparkles className="h-3 w-3 mr-1" />
                      Add to My Archetypes
                    </Button>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 text-xs"
                        onClick={() => handleAddToHomework(archetype)}
                      >
                        <BookOpen className="h-3 w-3 mr-1" />
                        Homework
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 text-xs"
                        onClick={() => handleScheduleWork(archetype)}
                      >
                        <Calendar className="h-3 w-3 mr-1" />
                        Schedule
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      </ScrollArea>
    </div>
  )
}

