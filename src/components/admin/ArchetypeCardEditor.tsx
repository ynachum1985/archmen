"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ArchetypeCard } from "@/components/ui/archetype-card"
import { 
  Save, 
  Eye, 
  Upload, 
  Palette, 
  Sparkles, 
  Heart, 
  Volume2,
  Play,
  Link,
  Wand2
} from 'lucide-react'

interface ArchetypeCardData {
  id: string
  name: string
  description: string
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

interface ArchetypeCardEditorProps {
  archetype?: ArchetypeCardData
  assessmentId?: string
  onSave: (data: ArchetypeCardData) => void
  onPreview?: () => void
}

export function ArchetypeCardEditor({ 
  archetype,
  assessmentId,
  onSave,
  onPreview
}: ArchetypeCardEditorProps) {
  const [cardData, setCardData] = useState<ArchetypeCardData>(archetype || {
    id: '',
    name: '',
    description: '',
    assessmentContext: '',
    visualContent: {
      backgroundColor: '#f8fafc',
      accentColor: '#e2e8f0'
    },
    mediaContent: {},
    insights: {
      currentInfluence: '',
      growthOpportunity: '',
      integrationTip: ''
    },
    resources: {
      articles: [],
      exercises: [],
      affirmations: []
    }
  })

  const [isGenerating, setIsGenerating] = useState(false)
  const [previewMode, setPreviewMode] = useState(false)
  const [newResource, setNewResource] = useState('')

  const handleSave = () => {
    onSave(cardData)
  }

  const handleGenerateImage = async () => {
    setIsGenerating(true)
    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          archetypeName: cardData.name,
          description: cardData.description,
          style: 'mystical' // You could make this configurable
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate image')
      }

      setCardData(prev => ({
        ...prev,
        visualContent: {
          ...prev.visualContent,
          primaryImage: data.imageUrl
        }
      }))
    } catch (error) {
      console.error('Error generating image:', error)
      alert('Failed to generate image. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleAddResource = (type: 'articles' | 'exercises' | 'affirmations') => {
    if (newResource.trim()) {
      setCardData(prev => ({
        ...prev,
        resources: {
          ...prev.resources,
          [type]: [...(prev.resources[type] || []), newResource.trim()]
        }
      }))
      setNewResource('')
    }
  }

  const handleRemoveResource = (type: 'articles' | 'exercises' | 'affirmations', index: number) => {
    setCardData(prev => ({
      ...prev,
      resources: {
        ...prev.resources,
        [type]: prev.resources[type]?.filter((_, i) => i !== index) || []
      }
    }))
  }

  if (previewMode) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-light text-slate-900">Preview</h2>
          <Button 
            variant="outline" 
            onClick={() => setPreviewMode(false)}
            className="border-0 bg-slate-100 hover:bg-slate-200"
          >
            Back to Editor
          </Button>
        </div>
        
        <div className="max-w-md mx-auto">
          <ArchetypeCard 
            archetype={{
              ...cardData,
              confidenceScore: 85
            }}
            isRevealed={true}
            interactive={false}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-light text-slate-900">
            {archetype ? 'Edit' : 'Create'} Archetype Card
          </h2>
          <p className="text-slate-600 text-sm mt-1">
            Design how this archetype appears during assessments
          </p>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            onClick={() => setPreviewMode(true)}
            className="border-0 bg-slate-100 hover:bg-slate-200"
          >
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </Button>
          <Button 
            onClick={handleSave}
            className="bg-slate-800 hover:bg-slate-900 text-white border-0"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Card
          </Button>
        </div>
      </div>

      <Tabs defaultValue="content" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-slate-100 border-0">
          <TabsTrigger value="content" className="data-[state=active]:bg-white">Content</TabsTrigger>
          <TabsTrigger value="visuals" className="data-[state=active]:bg-white">Visuals</TabsTrigger>
          <TabsTrigger value="media" className="data-[state=active]:bg-white">Media</TabsTrigger>
          <TabsTrigger value="resources" className="data-[state=active]:bg-white">Resources</TabsTrigger>
        </TabsList>

        {/* Content Tab */}
        <TabsContent value="content" className="space-y-6">
          <Card className="border-0 bg-slate-50">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-slate-600" />
                <h3 className="text-lg font-medium text-slate-900">Core Content</h3>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name" className="text-slate-700">Archetype Name</Label>
                  <Input
                    id="name"
                    value={cardData.name}
                    onChange={(e) => setCardData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="The Wise Mentor"
                    className="mt-1 border-0 bg-white"
                  />
                </div>
                <div>
                  <Label htmlFor="id" className="text-slate-700">Unique ID</Label>
                  <Input
                    id="id"
                    value={cardData.id}
                    onChange={(e) => setCardData(prev => ({ ...prev, id: e.target.value }))}
                    placeholder="wise-mentor"
                    className="mt-1 border-0 bg-white"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description" className="text-slate-700">Description</Label>
                <Textarea
                  id="description"
                  value={cardData.description}
                  onChange={(e) => setCardData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="A brief, inspiring description of this archetype..."
                  className="mt-1 border-0 bg-white"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="assessmentContext" className="text-slate-700">Assessment Context</Label>
                <Textarea
                  id="assessmentContext"
                  value={cardData.assessmentContext}
                  onChange={(e) => setCardData(prev => ({ ...prev, assessmentContext: e.target.value }))}
                  placeholder="Explain how this archetype manifests in the specific assessment context..."
                  className="mt-1 border-0 bg-white"
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-slate-50">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-rose-500" />
                <h3 className="text-lg font-medium text-slate-900">Insights</h3>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="currentInfluence" className="text-slate-700">Current Influence</Label>
                <Textarea
                  id="currentInfluence"
                  value={cardData.insights.currentInfluence}
                  onChange={(e) => setCardData(prev => ({ 
                    ...prev, 
                    insights: { ...prev.insights, currentInfluence: e.target.value } 
                  }))}
                  placeholder="How this archetype is currently influencing the user's life..."
                  className="mt-1 border-0 bg-white"
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="growthOpportunity" className="text-slate-700">Growth Opportunity</Label>
                <Textarea
                  id="growthOpportunity"
                  value={cardData.insights.growthOpportunity}
                  onChange={(e) => setCardData(prev => ({ 
                    ...prev, 
                    insights: { ...prev.insights, growthOpportunity: e.target.value } 
                  }))}
                  placeholder="What growth opportunities this archetype presents..."
                  className="mt-1 border-0 bg-white"
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="integrationTip" className="text-slate-700">Integration Tip</Label>
                <Textarea
                  id="integrationTip"
                  value={cardData.insights.integrationTip}
                  onChange={(e) => setCardData(prev => ({ 
                    ...prev, 
                    insights: { ...prev.insights, integrationTip: e.target.value } 
                  }))}
                  placeholder="A practical tip for integrating this archetype..."
                  className="mt-1 border-0 bg-white"
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Visuals Tab */}
        <TabsContent value="visuals" className="space-y-6">
          <Card className="border-0 bg-slate-50">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Palette className="w-5 h-5 text-blue-500" />
                <h3 className="text-lg font-medium text-slate-900">Visual Design</h3>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-slate-700">Primary Image</Label>
                  <div className="mt-2 space-y-3">
                    <div className="w-full h-32 bg-slate-200 rounded-lg flex items-center justify-center overflow-hidden">
                      {cardData.visualContent.primaryImage ? (
                        <img 
                          src={cardData.visualContent.primaryImage} 
                          alt="Preview" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Sparkles className="w-8 h-8 text-slate-400" />
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline"
                        size="sm"
                        onClick={handleGenerateImage}
                        disabled={isGenerating}
                        className="flex-1 border-0 bg-white hover:bg-slate-100"
                      >
                        <Wand2 className="w-4 h-4 mr-2" />
                        {isGenerating ? 'Generating...' : 'Generate AI Image'}
                      </Button>
                      <Button 
                        variant="outline"
                        size="sm"
                        className="border-0 bg-white hover:bg-slate-100"
                      >
                        <Upload className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-slate-700">Colors</Label>
                  <div className="mt-2 space-y-3">
                    <div>
                      <Label className="text-sm text-slate-600">Background</Label>
                      <div className="flex gap-2 mt-1">
                        <Input
                          type="color"
                          value={cardData.visualContent.backgroundColor}
                          onChange={(e) => setCardData(prev => ({ 
                            ...prev, 
                            visualContent: { ...prev.visualContent, backgroundColor: e.target.value } 
                          }))}
                          className="w-12 h-8 border-0 rounded cursor-pointer"
                        />
                        <Input
                          value={cardData.visualContent.backgroundColor}
                          onChange={(e) => setCardData(prev => ({ 
                            ...prev, 
                            visualContent: { ...prev.visualContent, backgroundColor: e.target.value } 
                          }))}
                          className="flex-1 border-0 bg-white"
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm text-slate-600">Accent</Label>
                      <div className="flex gap-2 mt-1">
                        <Input
                          type="color"
                          value={cardData.visualContent.accentColor}
                          onChange={(e) => setCardData(prev => ({ 
                            ...prev, 
                            visualContent: { ...prev.visualContent, accentColor: e.target.value } 
                          }))}
                          className="w-12 h-8 border-0 rounded cursor-pointer"
                        />
                        <Input
                          value={cardData.visualContent.accentColor}
                          onChange={(e) => setCardData(prev => ({ 
                            ...prev, 
                            visualContent: { ...prev.visualContent, accentColor: e.target.value } 
                          }))}
                          className="flex-1 border-0 bg-white"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Media Tab */}
        <TabsContent value="media" className="space-y-6">
          <Card className="border-0 bg-slate-50">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Volume2 className="w-5 h-5 text-purple-500" />
                <h3 className="text-lg font-medium text-slate-900">Integration Media</h3>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="meditationAudio" className="text-slate-700">Meditation Audio URL</Label>
                <Input
                  id="meditationAudio"
                  value={cardData.mediaContent.meditationAudio || ''}
                  onChange={(e) => setCardData(prev => ({ 
                    ...prev, 
                    mediaContent: { ...prev.mediaContent, meditationAudio: e.target.value } 
                  }))}
                  placeholder="https://..."
                  className="mt-1 border-0 bg-white"
                />
              </div>

              <div>
                <Label htmlFor="integrationVideo" className="text-slate-700">Integration Video URL</Label>
                <Input
                  id="integrationVideo"
                  value={cardData.mediaContent.integrationVideo || ''}
                  onChange={(e) => setCardData(prev => ({ 
                    ...prev, 
                    mediaContent: { ...prev.mediaContent, integrationVideo: e.target.value } 
                  }))}
                  placeholder="https://..."
                  className="mt-1 border-0 bg-white"
                />
              </div>

              <div>
                <Label htmlFor="guidanceAudio" className="text-slate-700">Voice Guidance URL</Label>
                <Input
                  id="guidanceAudio"
                  value={cardData.mediaContent.guidanceAudio || ''}
                  onChange={(e) => setCardData(prev => ({ 
                    ...prev, 
                    mediaContent: { ...prev.mediaContent, guidanceAudio: e.target.value } 
                  }))}
                  placeholder="https://..."
                  className="mt-1 border-0 bg-white"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Resources Tab */}
        <TabsContent value="resources" className="space-y-6">
          <Card className="border-0 bg-slate-50">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Link className="w-5 h-5 text-green-500" />
                <h3 className="text-lg font-medium text-slate-900">Learning Resources</h3>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Articles */}
              <div>
                <Label className="text-slate-700">Articles</Label>
                <div className="mt-2 space-y-2">
                  {cardData.resources.articles?.map((article, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-white rounded">
                      <span className="flex-1 text-sm">{article}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveResource('articles', index)}
                        className="w-6 h-6 p-0 text-slate-400 hover:text-red-500"
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <Input
                      value={newResource}
                      onChange={(e) => setNewResource(e.target.value)}
                      placeholder="Article title or URL"
                      className="flex-1 border-0 bg-white"
                    />
                    <Button
                      onClick={() => handleAddResource('articles')}
                      className="bg-slate-800 hover:bg-slate-900 text-white border-0"
                    >
                      Add
                    </Button>
                  </div>
                </div>
              </div>

              {/* Exercises */}
              <div>
                <Label className="text-slate-700">Exercises</Label>
                <div className="mt-2 space-y-2">
                  {cardData.resources.exercises?.map((exercise, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-white rounded">
                      <span className="flex-1 text-sm">{exercise}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveResource('exercises', index)}
                        className="w-6 h-6 p-0 text-slate-400 hover:text-red-500"
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <Input
                      value={newResource}
                      onChange={(e) => setNewResource(e.target.value)}
                      placeholder="Exercise description"
                      className="flex-1 border-0 bg-white"
                    />
                    <Button
                      onClick={() => handleAddResource('exercises')}
                      className="bg-slate-800 hover:bg-slate-900 text-white border-0"
                    >
                      Add
                    </Button>
                  </div>
                </div>
              </div>

              {/* Affirmations */}
              <div>
                <Label className="text-slate-700">Affirmations</Label>
                <div className="mt-2 space-y-2">
                  {cardData.resources.affirmations?.map((affirmation, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-white rounded">
                      <span className="flex-1 text-sm">{affirmation}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveResource('affirmations', index)}
                        className="w-6 h-6 p-0 text-slate-400 hover:text-red-500"
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <Input
                      value={newResource}
                      onChange={(e) => setNewResource(e.target.value)}
                      placeholder="Affirmation text"
                      className="flex-1 border-0 bg-white"
                    />
                    <Button
                      onClick={() => handleAddResource('affirmations')}
                      className="bg-slate-800 hover:bg-slate-900 text-white border-0"
                    >
                      Add
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 