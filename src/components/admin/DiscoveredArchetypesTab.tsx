'use client'

import { useState, useEffect } from 'react'
import { ChevronDown, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface DiscoveredArchetype {
  id: string
  name: string
  description: string
  discoveredIn: string // Assessment name
  discoveredAt: string // Date
  confidenceScore: number // 0-100
  impactScore: number // 1-7
  timesDetected: number
  traits?: string[]
  shadow?: string[]
  gold?: string[]
  psychologyProfile?: Record<string, unknown>
  archetypeImages?: string[]
}

interface DiscoveredArchetypesTabProps {
  adminView?: boolean
}

export function DiscoveredArchetypesTab({ adminView = true }: DiscoveredArchetypesTabProps) {
  const [archetypes, setArchetypes] = useState<DiscoveredArchetype[]>([])
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadArchetypes()
  }, [])

  const loadArchetypes = async () => {
    try {
      setLoading(true)
      // TODO: Replace with actual API call to fetch discovered archetypes
      // For now, using sample data
      const sampleArchetypes: DiscoveredArchetype[] = [
        {
          id: '1',
          name: 'The Narcissist',
          description: 'Self-centered, needs constant validation, lacks empathy',
          discoveredIn: 'Relationship Patterns Assessment',
          discoveredAt: '2025-10-15',
          confidenceScore: 92,
          impactScore: 7,
          timesDetected: 3,
          traits: ['self-centered', 'manipulative', 'lacks empathy', 'needs validation'],
          shadow: ['Fragile ego', 'Deep insecurity', 'Fear of abandonment'],
          gold: ['Confidence', 'Charisma', 'Ability to inspire'],
          psychologyProfile: {
            coreMotivation: 'Validation and admiration',
            coreFear: 'Being seen as ordinary',
            defensePattern: 'Projection and gaslighting'
          }
        },
        {
          id: '2',
          name: 'The Avoidant',
          description: 'Emotionally distant, fears intimacy, prioritizes independence',
          discoveredIn: 'Emotional Intimacy Assessment',
          discoveredAt: '2025-10-10',
          confidenceScore: 85,
          impactScore: 6,
          timesDetected: 2,
          traits: ['emotionally distant', 'independent', 'avoids conflict', 'self-reliant'],
          shadow: ['Loneliness', 'Disconnection', 'Inability to ask for help'],
          gold: ['Self-sufficiency', 'Emotional stability', 'Independence']
        },
        {
          id: '3',
          name: 'The Caregiver',
          description: 'Nurturing, puts others first, struggles with boundaries',
          discoveredIn: 'Relationship Patterns Assessment',
          discoveredAt: '2025-10-08',
          confidenceScore: 78,
          impactScore: 5,
          timesDetected: 1,
          traits: ['nurturing', 'selfless', 'boundary-less', 'people-pleaser'],
          shadow: ['Codependency', 'Martyrdom', 'Loss of self'],
          gold: ['Compassion', 'Generosity', 'Ability to support']
        }
      ]
      setArchetypes(sampleArchetypes)
    } catch (error) {
      console.error('Error loading archetypes:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredArchetypes = archetypes.filter(arch =>
    arch.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    arch.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getConfidenceColor = (score: number) => {
    if (score >= 85) return 'bg-red-100 text-red-800'
    if (score >= 70) return 'bg-orange-100 text-orange-800'
    return 'bg-yellow-100 text-yellow-800'
  }

  const getImpactColor = (score: number) => {
    if (score >= 6) return 'bg-red-100 text-red-800'
    if (score >= 4) return 'bg-orange-100 text-orange-800'
    return 'bg-yellow-100 text-yellow-800'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-medium">Discovered Archetypes</h2>
          <p className="text-gray-600 text-sm mt-1">
            {adminView ? 'All archetypes discovered across assessments' : 'Your discovered archetypes'}
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-gray-900">{archetypes.length}</p>
          <p className="text-xs text-gray-500">Total discovered</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Search archetypes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Archetypes Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
        </div>
      ) : filteredArchetypes.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-gray-500">No archetypes found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredArchetypes.map((archetype) => (
            <ArchetypeCard
              key={archetype.id}
              archetype={archetype}
              isExpanded={expandedId === archetype.id}
              onToggle={() => setExpandedId(expandedId === archetype.id ? null : archetype.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

interface ArchetypeCardProps {
  archetype: DiscoveredArchetype
  isExpanded: boolean
  onToggle: () => void
}

function ArchetypeCard({ archetype, isExpanded, onToggle }: ArchetypeCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer" onClick={onToggle}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <CardTitle className="text-lg">{archetype.name}</CardTitle>
            <p className="text-xs text-gray-500 mt-1">{archetype.description}</p>
          </div>
          <ChevronDown
            className={`w-5 h-5 text-gray-400 transition-transform flex-shrink-0 ${
              isExpanded ? '' : '-rotate-90'
            }`}
          />
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Metrics Row */}
        <div className="flex gap-2 flex-wrap">
          <Badge className={`${getConfidenceColor(archetype.confidenceScore)} border-0`}>
            Confidence: {archetype.confidenceScore}%
          </Badge>
          <Badge className={`${getImpactColor(archetype.impactScore)} border-0`}>
            Impact: {archetype.impactScore}/7
          </Badge>
          <Badge variant="outline" className="text-xs">
            Detected {archetype.timesDetected}x
          </Badge>
        </div>

        {/* Discovery Info */}
        <div className="text-xs text-gray-600 space-y-1">
          <p>
            <span className="font-medium">Discovered in:</span> {archetype.discoveredIn}
          </p>
          <p>
            <span className="font-medium">Date:</span> {new Date(archetype.discoveredAt).toLocaleDateString()}
          </p>
        </div>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
            {/* Traits */}
            {archetype.traits && archetype.traits.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Traits</h4>
                <div className="flex flex-wrap gap-1">
                  {archetype.traits.map((trait, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">
                      {trait}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Shadow */}
            {archetype.shadow && archetype.shadow.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Shadow Aspects</h4>
                <ul className="text-xs text-gray-700 space-y-1">
                  {archetype.shadow.map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-red-500 mt-1">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Gold */}
            {archetype.gold && archetype.gold.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Gold / Gifts</h4>
                <ul className="text-xs text-gray-700 space-y-1">
                  {archetype.gold.map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-emerald-500 mt-1">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Psychology Profile */}
            {archetype.psychologyProfile && (
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Psychology Profile</h4>
                <div className="text-xs text-gray-700 space-y-1">
                  {Object.entries(archetype.psychologyProfile).map(([key, value]) => (
                    <p key={key}>
                      <span className="font-medium capitalize">{key.replace(/_/g, ' ')}:</span>{' '}
                      {String(value)}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

