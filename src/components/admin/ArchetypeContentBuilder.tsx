'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Save, BookOpen, Heart, Target, Moon, Library } from 'lucide-react'

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
  opening: ArchetypeContentPage
  theoretical: ArchetypeContentPage
  embodiment: ArchetypeContentPage
  integration: ArchetypeContentPage
  shadow: ArchetypeContentPage
  resources: ArchetypeContentPage
}

interface Archetype {
  id: string
  name: string
  description: string
  content?: ArchetypeContent
  metrics?: {
    impact_level?: number
    complexity_score?: number
    integration_difficulty?: number
    shadow_intensity?: number
  }
  linguistic_patterns?: string
  theoretical_understanding?: string
  embodiment_practices?: string
  integration_practices?: string
  shadow_work?: string
  resources?: string
  structured_content?: ArchetypeContent
}

const PAGE_TYPES = [
  { id: 'opening', name: 'Overview', icon: Heart, description: 'Contextual introduction to this archetype' },
  { id: 'theoretical', name: 'Understanding', icon: BookOpen, description: 'Core concepts and theory' },
  { id: 'embodiment', name: 'Embodiment', icon: Target, description: 'Physical and experiential practices' },
  { id: 'integration', name: 'Integration', icon: Moon, description: 'Daily life integration methods' },
  { id: 'shadow', name: 'Shadow Work', icon: Moon, description: 'Working with shadow aspects' },
  { id: 'resources', name: 'Resources', icon: Library, description: 'Additional materials and references' }
]

// Placeholder images for different archetypes - mapped to actual archetype names
const ARCHETYPE_IMAGES: Record<string, string> = {
  // Leadership & Authority
  'theadvicegiver': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop&crop=face',
  'theadvocate': 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=300&fit=crop&crop=face',
  'thealphamale': 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=300&fit=crop&crop=face',
  'thecommander': 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=300&fit=crop&crop=face',

  // Emotional & Caring
  'theempath': 'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=400&h=300&fit=crop&crop=face',
  'theemotionalcoach': 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=300&fit=crop&crop=face',
  'theharmonizer': 'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=400&h=300&fit=crop&crop=face',
  'thewhiteknight': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop&crop=face',

  // Romantic & Relationship
  'thelover': 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=300&fit=crop&crop=face',
  'theromanticealist': 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=300&fit=crop&crop=face',
  'thegentleman': 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=300&fit=crop&crop=face',

  // Rebellious & Independent
  'thebadboy': 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=300&fit=crop&crop=face',
  'themaverick': 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=300&fit=crop&crop=face',
  'theprovoateur': 'https://images.unsplash.com/photo-1566492031773-4f4e44671d66?w=400&h=300&fit=crop&crop=face',
  'thetrickster': 'https://images.unsplash.com/photo-1566492031773-4f4e44671d66?w=400&h=300&fit=crop&crop=face',

  // Wise & Philosophical
  'thephilosopher': 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=300&fit=crop&crop=face',
  'theguru': 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=300&fit=crop&crop=face',
  'themagician': 'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=400&h=300&fit=crop&crop=face',

  // Traditional & Stoic
  'thestoic': 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=300&fit=crop&crop=face',
  'thetraditionalist': 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=300&fit=crop&crop=face',
  'thebloke': 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=300&fit=crop&crop=face',
  'thepragmatist': 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=300&fit=crop&crop=face',

  // Problematic & Shadow
  'thenarcissist': 'https://images.unsplash.com/photo-1566492031773-4f4e44671d66?w=400&h=300&fit=crop&crop=face',
  'themisogynist': 'https://images.unsplash.com/photo-1552058544-f2b08422138a?w=400&h=300&fit=crop&crop=face',
  'thesaboteur': 'https://images.unsplash.com/photo-1552058544-f2b08422138a?w=400&h=300&fit=crop&crop=face',
  'thewomaniser': 'https://images.unsplash.com/photo-1566492031773-4f4e44671d66?w=400&h=300&fit=crop&crop=face',
  'thecompulsiveliar': 'https://images.unsplash.com/photo-1552058544-f2b08422138a?w=400&h=300&fit=crop&crop=face',

  // Avoidant & Withdrawn
  'theavoidant': 'https://images.unsplash.com/photo-1552058544-f2b08422138a?w=400&h=300&fit=crop&crop=face',
  'thestonewaller': 'https://images.unsplash.com/photo-1552058544-f2b08422138a?w=400&h=300&fit=crop&crop=face',
  'thedefeatist': 'https://images.unsplash.com/photo-1552058544-f2b08422138a?w=400&h=300&fit=crop&crop=face',
  'theunattainablelover': 'https://images.unsplash.com/photo-1552058544-f2b08422138a?w=400&h=300&fit=crop&crop=face',

  // Evolved & Positive
  'theempoweredman': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop&crop=face',
  'thenewmasculine': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop&crop=face',
  'theidealist': 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=300&fit=crop&crop=face',

  // Provider & Practical
  'thebreadwinner': 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=300&fit=crop&crop=face',
  'themrfixit': 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=300&fit=crop&crop=face',

  // Default fallback
  'default': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop&crop=face'
}

interface ArchetypeContentBuilderProps {
  onContentChange?: (archetypeId: string, content: ArchetypeContent) => void
}

export function ArchetypeContentBuilder({ onContentChange }: ArchetypeContentBuilderProps) {
  const [archetypes, setArchetypes] = useState<Archetype[]>([])
  const [selectedArchetype, setSelectedArchetype] = useState<string>('')
  const [content] = useState<ArchetypeContent>({
    opening: { blocks: [] },
    theoretical: { blocks: [] },
    embodiment: { blocks: [] },
    integration: { blocks: [] },
    shadow: { blocks: [] },
    resources: { blocks: [] }
  })
  const [isLoading, setIsLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState('opening')

  // Load archetypes from the existing database
  useEffect(() => {
    const loadArchetypes = async () => {
      try {
        // Import the archetype service
        const { ArchetypeService } = await import('@/lib/services/archetype.service')
        const archetypeService = new ArchetypeService()
        
        // Load all active archetypes
        const loadedArchetypes = await archetypeService.getAllArchetypes()
        
        // Transform to match our interface
        const transformedArchetypes: Archetype[] = loadedArchetypes
          .filter(a => a.is_active)
          .map(a => ({
            id: a.id,
            name: a.name,
            description: a.description,
            metrics: a.psychology_profile as Record<string, unknown>,
            linguistic_patterns: '',
            theoretical_understanding: '',
            embodiment_practices: '',
            integration_practices: '',
            shadow_work: '',
            resources: '',
            structured_content: {
              opening: { blocks: [] },
              theoretical: { blocks: [] },
              embodiment: { blocks: [] },
              integration: { blocks: [] },
              shadow: { blocks: [] },
              resources: { blocks: [] }
            }
          }))
        
        setArchetypes(transformedArchetypes)
        if (transformedArchetypes.length > 0) {
          setSelectedArchetype(transformedArchetypes[0].id)
        }
      } catch (error) {
        console.error('Error loading archetypes:', error)
        // Fallback to sample data
        const sampleArchetypes: Archetype[] = [
          { id: 'hero', name: 'The Hero', description: 'The courageous leader who faces challenges' },
          { id: 'sage', name: 'The Sage', description: 'The wise teacher and seeker of truth' },
          { id: 'lover', name: 'The Lover', description: 'The passionate connector and romantic' },
          { id: 'caregiver', name: 'The Caregiver', description: 'The nurturing protector and helper' }
        ]
        setArchetypes(sampleArchetypes)
        if (sampleArchetypes.length > 0) {
          setSelectedArchetype(sampleArchetypes[0].id)
        }
      }
    }

    loadArchetypes()
  }, [])

  const saveContent = async () => {
    if (!selectedArchetype) return

    try {
      setIsLoading(true)
      
      // Save content to the database using Supabase
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      
      const { error } = await supabase
        .from('enhanced_archetypes')
        .update({
          structured_content: content,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedArchetype)
      
      if (error) {
        throw error
      }
      
      // Call the callback if provided
      onContentChange?.(selectedArchetype, content)
      
      // Show success message
      alert('Content saved successfully!')
    } catch (error) {
      console.error('Error saving content:', error)
      alert('Error saving content. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full space-y-4">
      {/* Header with Save Button and Archetype Selection */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 max-w-md">
          <Select value={selectedArchetype} onValueChange={setSelectedArchetype}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Choose an archetype to edit" />
            </SelectTrigger>
            <SelectContent>
              {archetypes.map((archetype) => (
                <SelectItem key={archetype.id} value={archetype.id}>
                  <div className="flex flex-col">
                    <span className="font-medium">{archetype.name}</span>
                    <span className="text-sm text-muted-foreground">{archetype.description}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={saveContent} disabled={isLoading || !selectedArchetype}>
          <Save className="h-4 w-4 mr-2" />
          Save Content
        </Button>
      </div>

      {/* Live Preview Editor */}
      {selectedArchetype && (
        <div className="grid grid-cols-12 gap-6 min-h-[600px]">
          {/* Left Side - Archetype Cards */}
          <div className="col-span-4 space-y-4">
            <h3 className="text-lg font-semibold">Archetype Preview</h3>
            
            {/* Primary Archetype Card */}
            <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 overflow-hidden">
              <div className="relative h-32 overflow-hidden">
                {(() => {
                  const currentArchetype = archetypes.find(a => a.id === selectedArchetype)
                  const archetypeName = currentArchetype?.name.toLowerCase().replace(/[^a-z]/g, '') || 'default'
                  const imageUrl = ARCHETYPE_IMAGES[archetypeName] || ARCHETYPE_IMAGES['default']

                  return (
                    <>
                      <img
                        src={imageUrl}
                        alt={currentArchetype?.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute bottom-3 left-3 right-3">
                        <h4 className="font-bold text-white text-lg">
                          {currentArchetype?.name}
                        </h4>
                        <Badge variant="secondary" className="text-xs bg-white/90 text-blue-900">
                          Primary • 85% match
                        </Badge>
                      </div>
                    </>
                  )
                })()}
              </div>
              <CardContent className="p-4">
                <p className="text-sm text-blue-800">
                  {archetypes.find(a => a.id === selectedArchetype)?.description}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Right Side - Content Pages */}
          <div className="col-span-8">
            <div className="h-full">
              <div className="pb-4">
                {/* Page Navigation - Clean tabs without borders */}
                <div className="flex gap-1 flex-wrap">
                  {PAGE_TYPES.map((page) => {
                    const hasContent = content[page.id as keyof ArchetypeContent]?.blocks.length > 0
                    const isActive = currentPage === page.id
                    return (
                      <button
                        key={page.id}
                        onClick={() => setCurrentPage(page.id)}
                        className={`px-3 py-2 text-sm font-medium rounded-t-lg transition-colors relative ${
                          isActive 
                            ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-500' 
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                        }`}
                      >
                        {page.name}
                        {hasContent && (
                          <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full" />
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="space-y-6 bg-white rounded-lg p-6">
                <div className="text-center py-12 text-muted-foreground">
                  <BookOpen className="h-16 w-16 mx-auto mb-4 opacity-30" />
                  <p className="text-lg font-medium">Content Editor Coming Soon</p>
                  <p className="text-sm">This will be the content editing interface for {PAGE_TYPES.find(p => p.id === currentPage)?.name}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
