'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Save, BookOpen, Heart, Target, Moon, Library, Type, Image, Video, Link, FileText, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

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

interface SingleArchetypeContentBuilderProps {
  archetypeId: string
  archetypeName: string
}

const PAGE_TYPES = [
  { id: 'opening', name: 'Opening', icon: BookOpen, color: 'blue' },
  { id: 'theoretical', name: 'Theoretical', icon: Heart, color: 'purple' },
  { id: 'embodiment', name: 'Embodiment', icon: Target, color: 'green' },
  { id: 'integration', name: 'Integration', icon: Moon, color: 'orange' },
  { id: 'shadow', name: 'Shadow Work', icon: Moon, color: 'red' },
  { id: 'resources', name: 'Resources', icon: Library, color: 'gray' }
]

export function SingleArchetypeContentBuilder({ 
  archetypeId, 
  archetypeName 
}: SingleArchetypeContentBuilderProps) {
  const [content, setContent] = useState<ArchetypeContent>({
    opening: { blocks: [] },
    theoretical: { blocks: [] },
    embodiment: { blocks: [] },
    integration: { blocks: [] },
    shadow: { blocks: [] },
    resources: { blocks: [] }
  })
  
  const [currentPage, setCurrentPage] = useState<keyof ArchetypeContent>('opening')
  const [blocks, setBlocks] = useState<ContentBlock[]>([])
  const [editingBlock, setEditingBlock] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Load existing content
  useEffect(() => {
    loadContent()
  }, [archetypeId])

  // Update blocks when page changes
  useEffect(() => {
    setBlocks(content[currentPage].blocks)
  }, [currentPage, content])

  const loadContent = async () => {
    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      
      const { data, error } = await supabase
        .from('enhanced_archetypes')
        .select('structured_content')
        .eq('id', archetypeId)
        .single()

      if (error) throw error

      if (data?.structured_content) {
        setContent(data.structured_content)
      }
    } catch (error) {
      console.error('Error loading content:', error)
    }
  }

  const saveContent = async () => {
    try {
      setIsLoading(true)
      
      // Update content with current blocks
      const updatedContent = {
        ...content,
        [currentPage]: { blocks }
      }
      
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      
      const { error } = await supabase
        .from('enhanced_archetypes')
        .update({
          structured_content: updatedContent,
          updated_at: new Date().toISOString()
        })
        .eq('id', archetypeId)

      if (error) throw error
      
      setContent(updatedContent)
      alert('Content saved successfully!')
    } catch (error) {
      console.error('Error saving content:', error)
      alert('Error saving content. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const addBlock = (type: ContentBlock['type']) => {
    const newBlock: ContentBlock = {
      id: Date.now().toString(),
      type,
      content: {
        text: type === 'text' ? 'Enter your content here...' : '',
        title: type !== 'text' ? 'New ' + type : '',
        description: '',
        url: ''
      }
    }
    setBlocks(prev => [...prev, newBlock])
    setEditingBlock(newBlock.id)
  }

  const updateBlock = (blockId: string, updates: Partial<ContentBlock['content']>) => {
    setBlocks(prev => prev.map(block =>
      block.id === blockId
        ? { ...block, content: { ...block.content, ...updates } }
        : block
    ))
  }

  const deleteBlock = (blockId: string) => {
    setBlocks(prev => prev.filter(block => block.id !== blockId))
    if (editingBlock === blockId) {
      setEditingBlock(null)
    }
  }

  const renderBlockEditor = (block: ContentBlock) => {
    const isEditing = editingBlock === block.id

    if (!isEditing) {
      return (
        <div 
          className="p-4 border rounded-lg cursor-pointer hover:bg-gray-50"
          onClick={() => setEditingBlock(block.id)}
        >
          <div className="flex items-center justify-between mb-2">
            <Badge variant="outline">{block.type}</Badge>
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation()
                deleteBlock(block.id)
              }}
            >
              ×
            </Button>
          </div>
          {block.type === 'text' ? (
            <p className="text-sm text-gray-600 truncate">{block.content.text}</p>
          ) : (
            <div>
              <p className="font-medium text-sm">{block.content.title}</p>
              <p className="text-xs text-gray-500">{block.content.description}</p>
            </div>
          )}
        </div>
      )
    }

    return (
      <div className="p-4 border-2 border-blue-200 rounded-lg bg-blue-50">
        <div className="flex items-center justify-between mb-4">
          <Badge>{block.type}</Badge>
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => setEditingBlock(null)}
            >
              Done
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => deleteBlock(block.id)}
            >
              Delete
            </Button>
          </div>
        </div>

        {block.type === 'text' ? (
          <Textarea
            value={block.content.text || ''}
            onChange={(e) => updateBlock(block.id, { text: e.target.value })}
            placeholder="Enter your content..."
            rows={6}
          />
        ) : (
          <div className="space-y-3">
            <Input
              value={block.content.title || ''}
              onChange={(e) => updateBlock(block.id, { title: e.target.value })}
              placeholder="Title"
            />
            <Textarea
              value={block.content.description || ''}
              onChange={(e) => updateBlock(block.id, { description: e.target.value })}
              placeholder="Description"
              rows={3}
            />
            {(block.type === 'image' || block.type === 'video' || block.type === 'resource_link') && (
              <Input
                value={block.content.url || ''}
                onChange={(e) => updateBlock(block.id, { url: e.target.value })}
                placeholder="URL"
              />
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Content Builder - {archetypeName}</h3>
        <Button onClick={saveContent} disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Content
            </>
          )}
        </Button>
      </div>

      {/* Page Selector */}
      <div className="flex gap-2 flex-wrap">
        {PAGE_TYPES.map((page) => {
          const Icon = page.icon
          return (
            <Button
              key={page.id}
              variant={currentPage === page.id ? "default" : "outline"}
              size="sm"
              onClick={() => setCurrentPage(page.id as keyof ArchetypeContent)}
              className="flex items-center gap-2"
            >
              <Icon className="h-4 w-4" />
              {page.name}
            </Button>
          )
        })}
      </div>

      {/* Content Editor */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-lg font-medium">
              {PAGE_TYPES.find(p => p.id === currentPage)?.name} Content
            </h4>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => addBlock('text')}
                className="flex items-center gap-1"
              >
                <Type className="h-4 w-4" />
                Text
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => addBlock('image')}
                className="flex items-center gap-1"
              >
                <Image className="h-4 w-4" />
                Image
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => addBlock('video')}
                className="flex items-center gap-1"
              >
                <Video className="h-4 w-4" />
                Video
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => addBlock('exercise')}
                className="flex items-center gap-1"
              >
                <Target className="h-4 w-4" />
                Exercise
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => addBlock('resource_link')}
                className="flex items-center gap-1"
              >
                <Link className="h-4 w-4" />
                Link
              </Button>
            </div>
          </div>

          {/* Blocks */}
          <div className="space-y-4">
            {blocks.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>No content blocks yet. Add some content using the buttons above.</p>
              </div>
            ) : (
              blocks.map(block => (
                <div key={block.id}>
                  {renderBlockEditor(block)}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
