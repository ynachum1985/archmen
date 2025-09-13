"use client"

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Copy,
  Eye,
  Image as ImageIcon,
  Sparkles
} from 'lucide-react'
import { ArchetypeCard } from "@/components/ui/archetype-card"
import { ArchetypeCardEditor } from "./ArchetypeCardEditor"

interface ArchetypeCardData {
  id: string
  name: string
  description: string
  category?: string
  assessmentContext: string
  impact_score?: number
  growth_potential_score?: number
  awareness_difficulty_score?: number
  trigger_intensity_score?: number
  integration_complexity_score?: number
  shadow_depth_score?: number
  archetype_images?: string[]
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
  // New content structure
  content?: {
    overview?: string
    theoretical?: string
    embodiment?: string
    integration?: string
    shadowWork?: string
  }
  resources: {
    articles?: string[]
    exercises?: string[]
    affirmations?: string[]
  }
  assessmentId?: string
  createdAt?: string
  updatedAt?: string
}

export function ArchetypeCardManager() {
  const [cards, setCards] = useState<ArchetypeCardData[]>([
    // Mock data
    {
      id: 'wise-mentor',
      name: 'The Wise Mentor',
      description: 'A guiding presence that offers wisdom and clarity in times of uncertainty',
      assessmentContext: 'This archetype emerges when you show deep empathy, ask thoughtful questions, and naturally guide others toward their own insights.',
      visualContent: {
        backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        accentColor: '#8B5CF6'
      },
      mediaContent: {
        meditationAudio: 'https://example.com/meditation.mp3',
        integrationVideo: 'https://example.com/integration.mp4'
      },
      insights: {
        currentInfluence: 'You naturally step into advisory roles and people seek your perspective on important decisions.',
        growthOpportunity: 'Develop your ability to ask powerful questions that unlock deeper insights.',
        integrationTip: 'Create space for others to discover their own wisdom rather than providing all the answers.'
      },
      resources: {
        articles: ['The Art of Powerful Questions', 'Mentoring vs Coaching: Key Differences'],
        exercises: ['Daily Reflection Practice', 'Question-Based Listening'],
        affirmations: ['I trust others to find their own path', 'My wisdom serves the highest good']
      }
    }
  ])

  const [currentView, setCurrentView] = useState<'list' | 'editor'>('list')
  const [selectedCard, setSelectedCard] = useState<ArchetypeCardData | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [generatingEmbeddings, setGeneratingEmbeddings] = useState<string | null>(null)

  const handleCreateCard = () => {
    setSelectedCard(null)
    setCurrentView('editor')
  }

  const handleEditCard = (card: ArchetypeCardData) => {
    setSelectedCard(card)
    setCurrentView('editor')
  }

  const handleSaveCard = (cardData: ArchetypeCardData) => {
    if (selectedCard) {
      // Update existing card
      setCards(prev => prev.map(card => 
        card.id === selectedCard.id ? { ...cardData, updatedAt: new Date().toISOString() } : card
      ))
    } else {
      // Create new card
      setCards(prev => [...prev, { ...cardData, createdAt: new Date().toISOString() }])
    }
    setCurrentView('list')
    setSelectedCard(null)
  }

  const handleDuplicateCard = (card: ArchetypeCardData) => {
    const duplicatedCard = {
      ...card,
      id: `${card.id}-copy`,
      name: `${card.name} (Copy)`,
      createdAt: new Date().toISOString()
    }
    setCards(prev => [...prev, duplicatedCard])
  }

  const handleDeleteCard = (cardId: string) => {
    if (confirm('Are you sure you want to delete this card?')) {
      setCards(prev => prev.filter(card => card.id !== cardId))
    }
  }

  const handleGenerateEmbeddings = async (card: ArchetypeCardData) => {
    setGeneratingEmbeddings(card.id)
    try {
      const response = await fetch('/api/generate-embeddings/archetype', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          archetypeId: card.id,
          archetypeName: card.name,
          content: {
            description: card.description,
            assessmentContext: card.assessmentContext,
            insights: card.insights,
            resources: card.resources
          }
        })
      })

      if (!response.ok) throw new Error('Failed to generate embeddings')

      const data = await response.json()
      console.log(`Embeddings generated for ${card.name}:`, data)
      alert(`Embeddings generated successfully for ${card.name}!`)
    } catch (error) {
      console.error(`Error generating embeddings for ${card.name}:`, error)
      alert(`Failed to generate embeddings for ${card.name}. Please try again.`)
    } finally {
      setGeneratingEmbeddings(null)
    }
  }

  const filteredCards = cards.filter(card => 
    card.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    card.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (currentView === 'editor') {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            onClick={() => setCurrentView('list')}
            className="border-0 bg-slate-100 hover:bg-slate-200"
          >
            ← Back to Cards
          </Button>
        </div>
        
        <ArchetypeCardEditor 
          archetype={selectedCard || undefined}
          onSave={handleSaveCard}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-light text-slate-900">Archetype Cards</h2>
          <p className="text-slate-600 text-sm mt-1">
            Create and manage archetype cards for your assessments
          </p>
        </div>
        <Button 
          onClick={handleCreateCard}
          className="bg-slate-800 hover:bg-slate-900 text-white border-0"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Card
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input
            placeholder="Search cards..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 border-0 bg-slate-100"
          />
        </div>
        <Badge variant="outline" className="border-0 bg-slate-100 text-slate-600">
          {filteredCards.length} cards
        </Badge>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCards.map((card) => (
          <Card key={card.id} className="border-0 bg-slate-50 hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg text-slate-900">{card.name}</CardTitle>
                  <p className="text-sm text-slate-600 mt-1">{card.description}</p>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditCard(card)}
                    className="w-8 h-8 p-0 text-slate-400 hover:text-slate-600"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDuplicateCard(card)}
                    className="w-8 h-8 p-0 text-slate-400 hover:text-slate-600"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteCard(card.id)}
                    className="w-8 h-8 p-0 text-slate-400 hover:text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Image Section */}
              <div className="relative h-32 bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg overflow-hidden">
                {card.archetype_images && card.archetype_images.length > 0 ? (
                  <div className="relative w-full h-full">
                    <img
                      src={card.archetype_images[0]}
                      alt={card.name}
                      className="w-full h-full object-cover"
                    />
                    {card.archetype_images.length > 1 && (
                      <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                        +{card.archetype_images.length - 1} more
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <ImageIcon className="w-8 h-8 text-slate-400 mx-auto mb-1" />
                      <p className="text-xs text-slate-500">Add archetype image</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Impact Scores */}
              {(card.impact_score || card.growth_potential_score) && (
                <div className="grid grid-cols-3 gap-2 text-xs">
                  {card.impact_score && (
                    <div className="text-center">
                      <div className="font-medium text-slate-700">Impact</div>
                      <div className="text-slate-500">{card.impact_score}/7</div>
                    </div>
                  )}
                  {card.growth_potential_score && (
                    <div className="text-center">
                      <div className="font-medium text-slate-700">Growth</div>
                      <div className="text-slate-500">{card.growth_potential_score}/7</div>
                    </div>
                  )}
                  {card.trigger_intensity_score && (
                    <div className="text-center">
                      <div className="font-medium text-slate-700">Trigger</div>
                      <div className="text-slate-500">{card.trigger_intensity_score}/7</div>
                    </div>
                  )}
                </div>
              )}

              {/* Mini Preview */}
              <div className="w-full h-24 rounded-lg overflow-hidden">
                <ArchetypeCard
                  archetype={{
                    ...card,
                    confidenceScore: 85
                  }}
                  isRevealed={true}
                  size="compact"
                  interactive={false}
                />
              </div>

              {/* Metadata */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs text-slate-500">
                  <span>Assessment Context</span>
                  <span>{card.assessmentContext ? 'Configured' : 'Not set'}</span>
                </div>
                <div className="flex justify-between items-center text-xs text-slate-500">
                  <span>Media Content</span>
                  <span>
                    {Object.values(card.mediaContent).filter(Boolean).length} items
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs text-slate-500">
                  <span>Resources</span>
                  <span>
                    {(card.resources.articles?.length || 0) + 
                     (card.resources.exercises?.length || 0) + 
                     (card.resources.affirmations?.length || 0)} items
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditCard(card)}
                  className="flex-1 border-0 bg-white hover:bg-slate-100"
                >
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleGenerateEmbeddings(card)}
                  disabled={generatingEmbeddings === card.id}
                  className="border-0 bg-white hover:bg-slate-100"
                  title={`Generate embeddings for ${card.name}`}
                >
                  <Sparkles className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-0 bg-white hover:bg-slate-100"
                >
                  <Eye className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredCards.length === 0 && (
        <Card className="border-0 bg-slate-50">
          <CardContent className="text-center py-12">
            <ImageIcon className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">
              {searchTerm ? 'No cards found' : 'No archetype cards yet'}
            </h3>
            <p className="text-slate-600 mb-4">
              {searchTerm 
                ? 'Try adjusting your search terms'
                : 'Create your first archetype card to get started'
              }
            </p>
            {!searchTerm && (
              <Button 
                onClick={handleCreateCard}
                className="bg-slate-800 hover:bg-slate-900 text-white border-0"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create First Card
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
} 