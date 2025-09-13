'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  BookOpen,
  Heart,
  Target,
  Moon,
  Library,
  Save,
  Image as ImageIcon,
  Video,
  FileText,
  Link as LinkIcon
} from 'lucide-react'

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
}

const PAGE_TYPES = [
  { id: 'opening', name: 'Opening', icon: Heart, description: 'Contextual introduction to this archetype' },
  { id: 'theoretical', name: 'Theoretical Understanding', icon: BookOpen, description: 'Core concepts and theory' },
  { id: 'embodiment', name: 'Embodiment Practices', icon: Target, description: 'Physical and experiential practices' },
  { id: 'integration', name: 'Integration Practices', icon: Moon, description: 'Daily life integration methods' },
  { id: 'shadow', name: 'Shadow Work', icon: Moon, description: 'Working with shadow aspects' },
  { id: 'resources', name: 'Resources', icon: Library, description: 'Additional materials and references' }
]

const BLOCK_TYPES = [
  { id: 'text', name: 'Text', icon: FileText, description: 'Rich text content' },
  { id: 'image', name: 'Image', icon: ImageIcon, description: 'Image with caption' },
  { id: 'video', name: 'Video', icon: Video, description: 'Video embed or link' },
  { id: 'exercise', name: 'Exercise', icon: Target, description: 'Interactive exercise or practice' },
  { id: 'resource_link', name: 'Resource Link', icon: LinkIcon, description: 'External resource or article' }
]

interface ArchetypeContentBuilderProps {
  onContentChange?: (archetypeId: string, content: ArchetypeContent) => void
}

export function ArchetypeContentBuilder({ onContentChange }: ArchetypeContentBuilderProps) {
  const [archetypes, setArchetypes] = useState<Archetype[]>([])
  const [selectedArchetype, setSelectedArchetype] = useState<string>('')
  const [selectedPage, setSelectedPage] = useState<string>('opening')
  const [content, setContent] = useState<ArchetypeContent>({
    opening: { blocks: [] },
    theoretical: { blocks: [] },
    embodiment: { blocks: [] },
    integration: { blocks: [] },
    shadow: { blocks: [] },
    resources: { blocks: [] }
  })
  const [isLoading, setIsLoading] = useState(false)

  // Load archetypes from the existing database
  useEffect(() => {
    const loadArchetypes = async () => {
      try {
        // This would connect to your existing archetype service
        // For now, using sample data
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
      } catch (error) {
        console.error('Error loading archetypes:', error)
      }
    }

    loadArchetypes()
  }, [])

  // Load content for selected archetype
  useEffect(() => {
    if (selectedArchetype) {
      loadArchetypeContent()
    }
  }, [selectedArchetype])

  const loadArchetypeContent = async () => {
    try {
      setIsLoading(true)
      // Load existing content for this archetype
      // This would connect to your content storage system
      
      // For now, initialize with empty content
      const emptyContent: ArchetypeContent = {
        opening: { blocks: [] },
        theoretical: { blocks: [] },
        embodiment: { blocks: [] },
        integration: { blocks: [] },
        shadow: { blocks: [] },
        resources: { blocks: [] }
      }
      
      setContent(emptyContent)
    } catch (error) {
      console.error('Error loading archetype content:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const addContentBlock = (pageId: string, blockType: string) => {
    const newBlock: ContentBlock = {
      id: `block_${Date.now()}`,
      type: blockType as ContentBlock['type'],
      content: {
        text: blockType === 'text' ? 'Enter your content here...' : '',
        title: blockType !== 'text' ? 'Enter title...' : '',
        description: blockType !== 'text' ? 'Enter description...' : '',
        url: ['image', 'video', 'resource_link'].includes(blockType) ? '' : undefined
      }
    }

    setContent(prev => ({
      ...prev,
      [pageId]: {
        ...prev[pageId as keyof ArchetypeContent],
        blocks: [...prev[pageId as keyof ArchetypeContent].blocks, newBlock]
      }
    }))
  }

  const updateContentBlock = (pageId: string, blockId: string, updates: Partial<ContentBlock['content']>) => {
    setContent(prev => ({
      ...prev,
      [pageId]: {
        ...prev[pageId as keyof ArchetypeContent],
        blocks: prev[pageId as keyof ArchetypeContent].blocks.map(block =>
          block.id === blockId
            ? { ...block, content: { ...block.content, ...updates } }
            : block
        )
      }
    }))
  }

  const removeContentBlock = (pageId: string, blockId: string) => {
    setContent(prev => ({
      ...prev,
      [pageId]: {
        ...prev[pageId as keyof ArchetypeContent],
        blocks: prev[pageId as keyof ArchetypeContent].blocks.filter(block => block.id !== blockId)
      }
    }))
  }

  const saveContent = async () => {
    if (!selectedArchetype) return

    try {
      setIsLoading(true)
      // Save content to your storage system
      console.log('Saving content for archetype:', selectedArchetype, content)
      
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

  const selectedPageData = content[selectedPage as keyof ArchetypeContent]

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Archetype Content Builder
            </CardTitle>
            <CardDescription>
              Create rich, contextual content for each archetype in your assessment
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button onClick={saveContent} disabled={isLoading || !selectedArchetype}>
              <Save className="h-4 w-4 mr-2" />
              Save Content
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Archetype Selection */}
        <div className="space-y-2">
          <Label>Select Archetype</Label>
          <Select value={selectedArchetype} onValueChange={setSelectedArchetype}>
            <SelectTrigger>
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

        {selectedArchetype && (
          <Tabs value={selectedPage} onValueChange={setSelectedPage} className="space-y-4">
            <TabsList className="grid grid-cols-6 w-full">
              {PAGE_TYPES.map((page) => {
                const Icon = page.icon
                const blockCount = content[page.id as keyof ArchetypeContent]?.blocks.length || 0
                return (
                  <TabsTrigger key={page.id} value={page.id} className="flex flex-col gap-1 h-auto py-2">
                    <Icon className="h-4 w-4" />
                    <span className="text-xs">{page.name}</span>
                    {blockCount > 0 && (
                      <Badge variant="secondary" className="text-xs px-1 py-0">
                        {blockCount}
                      </Badge>
                    )}
                  </TabsTrigger>
                )
              })}
            </TabsList>

            {PAGE_TYPES.map((page) => (
              <TabsContent key={page.id} value={page.id} className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">{page.name}</h3>
                    <p className="text-sm text-muted-foreground">{page.description}</p>
                  </div>
                  <div className="flex gap-2">
                    {BLOCK_TYPES.map((blockType) => {
                      const BlockIcon = blockType.icon
                      return (
                        <Button
                          key={blockType.id}
                          variant="outline"
                          size="sm"
                          onClick={() => addContentBlock(page.id, blockType.id)}
                          title={`Add ${blockType.name}`}
                        >
                          <BlockIcon className="h-4 w-4" />
                        </Button>
                      )
                    })}
                  </div>
                </div>

                <div className="space-y-4">
                  {selectedPageData?.blocks.map((block) => (
                    <ContentBlockEditor
                      key={block.id}
                      block={block}
                      onUpdate={(updates) => updateContentBlock(page.id, block.id, updates)}
                      onRemove={() => removeContentBlock(page.id, block.id)}
                    />
                  ))}

                  {selectedPageData?.blocks.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No content blocks yet. Add some content using the buttons above.</p>
                    </div>
                  )}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        )}
      </CardContent>
    </Card>
  )
}

interface ContentBlockEditorProps {
  block: ContentBlock
  onUpdate: (updates: Partial<ContentBlock['content']>) => void
  onRemove: () => void
}

function ContentBlockEditor({ block, onUpdate, onRemove }: ContentBlockEditorProps) {
  const blockType = BLOCK_TYPES.find(t => t.id === block.type)
  const Icon = blockType?.icon || FileText

  return (
    <Card className="border-l-4 border-l-blue-500">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4" />
            <span className="font-medium">{blockType?.name}</span>
          </div>
          <Button variant="ghost" size="sm" onClick={onRemove}>
            ×
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {block.type === 'text' && (
          <Textarea
            value={block.content.text || ''}
            onChange={(e) => onUpdate({ text: e.target.value })}
            placeholder="Enter your content here..."
            rows={4}
          />
        )}

        {block.type !== 'text' && (
          <>
            <div>
              <Label>Title</Label>
              <Input
                value={block.content.title || ''}
                onChange={(e) => onUpdate({ title: e.target.value })}
                placeholder="Enter title..."
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={block.content.description || ''}
                onChange={(e) => onUpdate({ description: e.target.value })}
                placeholder="Enter description..."
                rows={2}
              />
            </div>
            {['image', 'video', 'resource_link'].includes(block.type) && (
              <div>
                <Label>URL</Label>
                <Input
                  value={block.content.url || ''}
                  onChange={(e) => onUpdate({ url: e.target.value })}
                  placeholder="Enter URL..."
                />
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
