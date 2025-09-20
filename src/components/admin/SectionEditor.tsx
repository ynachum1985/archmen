'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Save,
  X,
  Plus,
  Trash2,
  Image,
  Video,
  FileText,
  Upload,
  Lightbulb,
  Target,
  Heart,
  Zap,
  Wand2
} from 'lucide-react'
import { MediaCreationStudio } from './MediaCreationStudio'

interface CourseSection {
  id: string
  type: 'theory' | 'practice' | 'reflection' | 'integration'
  title: string
  content: string
  estimatedMinutes: number
  orderIndex: number
  mediaAssets: MediaAsset[]
}

interface MediaAsset {
  id: string
  type: 'image' | 'video' | 'audio' | 'document'
  url: string
  title: string
  description?: string
}

interface SectionEditorProps {
  section: CourseSection | null
  isOpen: boolean
  onSave: (section: CourseSection) => void
  onCancel: () => void
  archetypeName?: string
}

export function SectionEditor({ section, isOpen, onSave, onCancel, archetypeName = 'Archetype' }: SectionEditorProps) {
  const [formData, setFormData] = useState<CourseSection>({
    id: '',
    type: 'theory',
    title: '',
    content: '',
    estimatedMinutes: 15,
    orderIndex: 0,
    mediaAssets: []
  })

  useEffect(() => {
    if (section) {
      setFormData(section)
    } else {
      setFormData({
        id: `section-${Date.now()}`,
        type: 'theory',
        title: '',
        content: '',
        estimatedMinutes: 15,
        orderIndex: 0,
        mediaAssets: []
      })
    }
  }, [section])

  const handleSave = () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      alert('Please fill in title and content')
      return
    }
    onSave(formData)
  }

  const addMediaAsset = () => {
    const newAsset: MediaAsset = {
      id: `media-${Date.now()}`,
      type: 'image',
      url: '',
      title: 'New Media Asset',
      description: ''
    }
    setFormData(prev => ({
      ...prev,
      mediaAssets: [...prev.mediaAssets, newAsset]
    }))
  }

  const updateMediaAsset = (assetId: string, updates: Partial<MediaAsset>) => {
    setFormData(prev => ({
      ...prev,
      mediaAssets: prev.mediaAssets.map(asset =>
        asset.id === assetId ? { ...asset, ...updates } : asset
      )
    }))
  }

  const removeMediaAsset = (assetId: string) => {
    setFormData(prev => ({
      ...prev,
      mediaAssets: prev.mediaAssets.filter(asset => asset.id !== assetId)
    }))
  }

  const getSectionIcon = (type: string) => {
    switch (type) {
      case 'theory': return <Lightbulb className="h-4 w-4" />
      case 'practice': return <Target className="h-4 w-4" />
      case 'reflection': return <Heart className="h-4 w-4" />
      case 'integration': return <Zap className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  const getMediaIcon = (type: string) => {
    switch (type) {
      case 'image': return <Image className="h-4 w-4" />
      case 'video': return <Video className="h-4 w-4" />
      case 'audio': return <FileText className="h-4 w-4" />
      case 'document': return <FileText className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[9999] p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white shadow-2xl">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getSectionIcon(formData.type)}
              Edit Section
            </div>
            <Button variant="ghost" size="sm" onClick={onCancel}>
              <X className="h-4 w-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="section-type">Section Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value: CourseSection['type']) => 
                  setFormData(prev => ({ ...prev, type: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="theory">
                    <div className="flex items-center gap-2">
                      <Lightbulb className="h-4 w-4" />
                      Theory
                    </div>
                  </SelectItem>
                  <SelectItem value="practice">
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      Practice
                    </div>
                  </SelectItem>
                  <SelectItem value="reflection">
                    <div className="flex items-center gap-2">
                      <Heart className="h-4 w-4" />
                      Reflection
                    </div>
                  </SelectItem>
                  <SelectItem value="integration">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4" />
                      Integration
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="estimated-minutes">Estimated Time (minutes)</Label>
              <Input
                id="estimated-minutes"
                type="number"
                min="5"
                max="120"
                value={formData.estimatedMinutes}
                onChange={(e) => 
                  setFormData(prev => ({ 
                    ...prev, 
                    estimatedMinutes: parseInt(e.target.value) || 15 
                  }))
                }
              />
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="section-title">Section Title</Label>
            <Input
              id="section-title"
              value={formData.title}
              onChange={(e) => 
                setFormData(prev => ({ ...prev, title: e.target.value }))
              }
              placeholder="Enter section title..."
            />
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Label htmlFor="section-content">Content</Label>
            <Textarea
              id="section-content"
              value={formData.content}
              onChange={(e) => 
                setFormData(prev => ({ ...prev, content: e.target.value }))
              }
              placeholder="Enter section content..."
              rows={8}
              className="resize-none"
            />
            <p className="text-xs text-gray-500">
              Supports markdown formatting. Use **bold**, *italic*, and other markdown syntax.
            </p>
          </div>

          {/* Media Assets */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Media Assets</Label>
              <Button size="sm" variant="outline" onClick={addMediaAsset}>
                <Plus className="h-4 w-4 mr-2" />
                Add Media
              </Button>
            </div>

            {formData.mediaAssets.length > 0 ? (
              <div className="space-y-3">
                {formData.mediaAssets.map((asset) => (
                  <Card key={asset.id} className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Media Type</Label>
                        <Select
                          value={asset.type}
                          onValueChange={(value: MediaAsset['type']) => 
                            updateMediaAsset(asset.id, { type: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="image">
                              <div className="flex items-center gap-2">
                                <Image className="h-4 w-4" />
                                Image
                              </div>
                            </SelectItem>
                            <SelectItem value="video">
                              <div className="flex items-center gap-2">
                                <Video className="h-4 w-4" />
                                Video
                              </div>
                            </SelectItem>
                            <SelectItem value="audio">
                              <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4" />
                                Audio
                              </div>
                            </SelectItem>
                            <SelectItem value="document">
                              <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4" />
                                Document
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Title</Label>
                        <Input
                          value={asset.title}
                          onChange={(e) => 
                            updateMediaAsset(asset.id, { title: e.target.value })
                          }
                          placeholder="Media title..."
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>URL</Label>
                        <div className="flex gap-2">
                          <Input
                            value={asset.url}
                            onChange={(e) => 
                              updateMediaAsset(asset.id, { url: e.target.value })
                            }
                            placeholder="Media URL..."
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => removeMediaAsset(asset.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="md:col-span-3 space-y-2">
                        <Label>Description (optional)</Label>
                        <Input
                          value={asset.description || ''}
                          onChange={(e) => 
                            updateMediaAsset(asset.id, { description: e.target.value })
                          }
                          placeholder="Media description..."
                        />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
                <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm">No media assets added yet</p>
                <p className="text-xs">Click "Add Media" to include images, videos, or documents</p>
              </div>
            )}
          </div>

          {/* Media Creation Studio */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>AI Media Creation</Label>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  // Toggle media creation studio visibility
                  const studio = document.getElementById('media-creation-studio')
                  if (studio) {
                    studio.style.display = studio.style.display === 'none' ? 'block' : 'none'
                  }
                }}
              >
                <Wand2 className="h-4 w-4 mr-2" />
                Create Media
              </Button>
            </div>

            <div id="media-creation-studio" style={{ display: 'none' }}>
              <MediaCreationStudio
                onMediaCreated={(asset) => {
                  setFormData(prev => ({
                    ...prev,
                    mediaAssets: [...prev.mediaAssets, asset]
                  }))
                  // Hide the studio after creating media
                  const studio = document.getElementById('media-creation-studio')
                  if (studio) studio.style.display = 'none'
                }}
                archetypeName={archetypeName}
                sectionType={formData.type}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              Save Section
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
