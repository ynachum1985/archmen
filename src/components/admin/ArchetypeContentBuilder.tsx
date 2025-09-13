'use client'

import { useState, useEffect, useCallback } from 'react'
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
  Link as LinkIcon,
  GripVertical
} from 'lucide-react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import {
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

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
  initialContent?: {
    theoreticalUnderstanding?: string
    embodimentPractices?: string
    integrationPractices?: string
    resourceLinks?: string[]
  }
}

export function ArchetypeContentBuilder({ onContentChange, initialContent }: ArchetypeContentBuilderProps) {
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

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

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

  const loadArchetypeContent = useCallback(async () => {
    try {
      setIsLoading(true)

      // Initialize content with data from initialContent if available
      const newContent: ArchetypeContent = {
        opening: { blocks: [] },
        theoretical: {
          blocks: initialContent?.theoreticalUnderstanding ? [{
            id: `block_${Date.now()}_theoretical`,
            type: 'text',
            content: { text: initialContent.theoreticalUnderstanding }
          }] : []
        },
        embodiment: {
          blocks: initialContent?.embodimentPractices ? [{
            id: `block_${Date.now()}_embodiment`,
            type: 'text',
            content: { text: initialContent.embodimentPractices }
          }] : []
        },
        integration: {
          blocks: initialContent?.integrationPractices ? [{
            id: `block_${Date.now()}_integration`,
            type: 'text',
            content: { text: initialContent.integrationPractices }
          }] : []
        },
        shadow: { blocks: [] },
        resources: {
          blocks: initialContent?.resourceLinks?.map((link, index) => ({
            id: `block_${Date.now()}_resource_${index}`,
            type: 'resource_link' as const,
            content: {
              url: link,
              title: `Resource ${index + 1}`,
              description: 'Additional resource for deeper exploration'
            }
          })) || []
        }
      }

      setContent(newContent)
    } catch (error) {
      console.error('Error loading archetype content:', error)
    } finally {
      setIsLoading(false)
    }
  }, [initialContent])

  // Load content for selected archetype
  useEffect(() => {
    if (selectedArchetype) {
      loadArchetypeContent()
    }
  }, [selectedArchetype, loadArchetypeContent])

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

  const handleDragEnd = (event: DragEndEvent, pageId: string) => {
    const { active, over } = event

    if (active.id !== over?.id) {
      setContent(prev => {
        const pageContent = prev[pageId as keyof ArchetypeContent]
        const oldIndex = pageContent.blocks.findIndex(block => block.id === active.id)
        const newIndex = pageContent.blocks.findIndex(block => block.id === over?.id)

        return {
          ...prev,
          [pageId]: {
            ...pageContent,
            blocks: arrayMove(pageContent.blocks, oldIndex, newIndex)
          }
        }
      })
    }
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



  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <BookOpen className="h-6 w-6" />
            Archetype Content Builder
          </h2>
          <p className="text-muted-foreground">
            Create rich, contextual content for each archetype - edit directly in the preview below
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={saveContent} disabled={isLoading || !selectedArchetype}>
            <Save className="h-4 w-4 mr-2" />
            Save Content
          </Button>
        </div>
      </div>

      {/* Archetype Selection */}
      <Card>
        <CardContent className="p-4">
          <div className="space-y-2">
            <Label>Select Archetype to Edit</Label>
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
        </CardContent>
      </Card>

      {/* Live Preview Editor */}
      {selectedArchetype && (
        <LivePreviewEditor
          archetype={archetypes.find(a => a.id === selectedArchetype)}
          content={content}
          onContentChange={setContent}
          onAddBlock={addContentBlock}
          onUpdateBlock={updateContentBlock}
          onRemoveBlock={removeContentBlock}
          onDragEnd={handleDragEnd}
          sensors={sensors}
        />
      )}
    </div>
  )
}

interface LivePreviewEditorProps {
  archetype?: Archetype
  content: ArchetypeContent
  onContentChange: (content: ArchetypeContent) => void
  onAddBlock: (pageId: string, blockType: string) => void
  onUpdateBlock: (pageId: string, blockId: string, updates: Partial<ContentBlock['content']>) => void
  onRemoveBlock: (pageId: string, blockId: string) => void
  onDragEnd: (event: DragEndEvent, pageId: string) => void
  sensors: ReturnType<typeof useSensors>
}

function LivePreviewEditor({
  archetype,
  content,
  onAddBlock,
  onUpdateBlock,
  onRemoveBlock,
  onDragEnd,
  sensors
}: LivePreviewEditorProps) {
  const [currentPage, setCurrentPage] = useState('opening')

  if (!archetype) return null

  const currentPageContent = content[currentPage as keyof ArchetypeContent]
  const currentPageInfo = PAGE_TYPES.find(p => p.id === currentPage)

  return (
    <div className="grid grid-cols-12 gap-6 min-h-[600px]">
      {/* Left Side - Archetype Cards */}
      <div className="col-span-4 space-y-4">
        <h3 className="text-lg font-semibold">Archetype Preview</h3>

        {/* Primary Archetype Card */}
        <Card className="border-2 border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-blue-900">{archetype.name}</h4>
                <Badge variant="secondary" className="text-xs">Primary • 85% match</Badge>
              </div>
            </div>
            <p className="text-sm text-blue-800">{archetype.description}</p>
          </CardContent>
        </Card>

        {/* Related Archetypes */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-600">Related Archetypes</h4>
          {['The Sage', 'The Explorer'].map((name, index) => (
            <Card key={index} className="border border-gray-200">
              <CardContent className="p-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center">
                    <BookOpen className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{name}</p>
                    <Badge variant="outline" className="text-xs">{65 - index * 10}% match</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Right Side - Content Pages */}
      <div className="col-span-8">
        <Card className="h-full">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  {currentPageInfo?.icon && <currentPageInfo.icon className="h-5 w-5" />}
                  {currentPageInfo?.name}
                </CardTitle>
                <CardDescription>{currentPageInfo?.description}</CardDescription>
              </div>

              {/* Page Navigation */}
              <div className="flex gap-1">
                {PAGE_TYPES.map((page) => {
                  const Icon = page.icon
                  const hasContent = content[page.id as keyof ArchetypeContent]?.blocks.length > 0
                  return (
                    <Button
                      key={page.id}
                      variant={currentPage === page.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page.id)}
                      className="flex flex-col gap-1 h-auto py-2 px-3"
                    >
                      <Icon className="h-4 w-4" />
                      <span className="text-xs">{page.name}</span>
                      {hasContent && <div className="w-1 h-1 bg-current rounded-full" />}
                    </Button>
                  )
                })}
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Add Content Section */}
            <div className="bg-gray-50 p-4 rounded-lg border-2 border-dashed border-gray-300">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Add Content Block:</h4>
              <div className="flex flex-wrap gap-2">
                {BLOCK_TYPES.map((blockType) => {
                  const BlockIcon = blockType.icon
                  return (
                    <Button
                      key={blockType.id}
                      variant="outline"
                      size="sm"
                      onClick={() => onAddBlock(currentPage, blockType.id)}
                      className="flex items-center gap-2"
                    >
                      <BlockIcon className="h-4 w-4" />
                      <span className="text-xs">{blockType.name}</span>
                    </Button>
                  )
                })}
              </div>
            </div>

            {/* Content Blocks */}
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={(event) => onDragEnd(event, currentPage)}
            >
              <SortableContext
                items={currentPageContent?.blocks.map(block => block.id) || []}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-4">
                  {currentPageContent?.blocks.map((block) => (
                    <SortableContentBlockEditor
                      key={block.id}
                      block={block}
                      onUpdate={(updates) => onUpdateBlock(currentPage, block.id, updates)}
                      onRemove={() => onRemoveBlock(currentPage, block.id)}
                    />
                  ))}

                  {(currentPageContent?.blocks.length === 0) && (
                    <div className="text-center py-12 text-muted-foreground">
                      <BookOpen className="h-16 w-16 mx-auto mb-4 opacity-30" />
                      <p className="text-lg font-medium">No content yet</p>
                      <p className="text-sm">Add content blocks using the buttons above to get started</p>
                    </div>
                  )}
                </div>
              </SortableContext>
            </DndContext>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

interface ContentBlockEditorProps {
  block: ContentBlock
  onUpdate: (updates: Partial<ContentBlock['content']>) => void
  onRemove: () => void
}

type SortableContentBlockEditorProps = ContentBlockEditorProps

function SortableContentBlockEditor(props: SortableContentBlockEditorProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: props.block.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div ref={setNodeRef} style={style}>
      <ContentBlockEditor {...props} dragHandleProps={{ ...attributes, ...listeners }} />
    </div>
  )
}

interface ContentBlockEditorPropsWithDrag extends ContentBlockEditorProps {
  dragHandleProps?: {
    [key: string]: unknown
  }
}

function ContentBlockEditor({ block, onUpdate, onRemove, dragHandleProps }: ContentBlockEditorPropsWithDrag) {
  const blockType = BLOCK_TYPES.find(t => t.id === block.type)
  const Icon = blockType?.icon || FileText

  return (
    <Card className="border-l-4 border-l-blue-500">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {dragHandleProps && (
              <div {...dragHandleProps} className="cursor-grab active:cursor-grabbing">
                <GripVertical className="h-4 w-4 text-gray-400" />
              </div>
            )}
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
