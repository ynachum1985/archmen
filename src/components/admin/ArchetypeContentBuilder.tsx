'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

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
            metrics: a.psychology_profile as any, // Will be updated with proper metrics structure
            linguistic_patterns: '', // Will be populated from linguistic_patterns table
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

  // Auto-populate content when archetype is selected
  useEffect(() => {
    if (selectedArchetype) {
      const archetype = archetypes.find(a => a.id === selectedArchetype)
      if (archetype) {
        // Auto-populate content from archetype data
        const newContent: ArchetypeContent = {
          opening: {
            blocks: archetype.description ? [{
              id: `block_${Date.now()}_opening`,
              type: 'text',
              content: { text: archetype.description }
            }] : []
          },
          theoretical: {
            blocks: archetype.theoretical_understanding ? [{
              id: `block_${Date.now()}_theoretical`,
              type: 'text',
              content: { text: archetype.theoretical_understanding }
            }] : initialContent?.theoreticalUnderstanding ? [{
              id: `block_${Date.now()}_theoretical_init`,
              type: 'text',
              content: { text: initialContent.theoreticalUnderstanding }
            }] : []
          },
          embodiment: {
            blocks: archetype.embodiment_practices ? [{
              id: `block_${Date.now()}_embodiment`,
              type: 'text',
              content: { text: archetype.embodiment_practices }
            }] : initialContent?.embodimentPractices ? [{
              id: `block_${Date.now()}_embodiment_init`,
              type: 'text',
              content: { text: initialContent.embodimentPractices }
            }] : []
          },
          integration: {
            blocks: archetype.integration_practices ? [{
              id: `block_${Date.now()}_integration`,
              type: 'text',
              content: { text: archetype.integration_practices }
            }] : initialContent?.integrationPractices ? [{
              id: `block_${Date.now()}_integration_init`,
              type: 'text',
              content: { text: initialContent.integrationPractices }
            }] : []
          },
          shadow: {
            blocks: archetype.shadow_work ? [{
              id: `block_${Date.now()}_shadow`,
              type: 'text',
              content: { text: archetype.shadow_work }
            }] : []
          },
          resources: {
            blocks: archetype.resources ? [{
              id: `block_${Date.now()}_resources`,
              type: 'text',
              content: { text: archetype.resources }
            }] : initialContent?.resourceLinks?.length ?
              initialContent.resourceLinks.map((link, index) => ({
                id: `block_${Date.now()}_resource_${index}`,
                type: 'resource_link',
                content: { url: link, title: `Resource ${index + 1}` }
              })) : []
          }
        }

        setContent(newContent)
      }
    }
  }, [selectedArchetype, archetypes, initialContent])



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

  return (
    <div className="grid grid-cols-12 gap-6 min-h-[600px]">
      {/* Left Side - Archetype Cards */}
      <div className="col-span-4 space-y-4">
        <h3 className="text-lg font-semibold">Archetype Preview</h3>

        {/* Primary Archetype Card */}
        <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 overflow-hidden">
          <div className="relative h-32 bg-gradient-to-br from-blue-400 to-blue-600">
            <div className="absolute inset-0 bg-black/20" />
            <div className="absolute bottom-3 left-3 right-3">
              <h4 className="font-bold text-white text-lg">{archetype.name}</h4>
              <Badge variant="secondary" className="text-xs bg-white/90 text-blue-900">
                Primary • 85% match
              </Badge>
            </div>
          </div>
          <CardContent className="p-4">
            <p className="text-sm text-blue-800">{archetype.description}</p>
          </CardContent>
        </Card>

        {/* Related Archetypes */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-600">Related Archetypes</h4>
          {[
            { name: 'The Sage', color: 'from-purple-400 to-purple-600' },
            { name: 'The Explorer', color: 'from-green-400 to-green-600' }
          ].map((archetype, index) => (
            <Card key={index} className="border border-gray-200 overflow-hidden">
              <div className={`relative h-16 bg-gradient-to-br ${archetype.color}`}>
                <div className="absolute inset-0 bg-black/20" />
                <div className="absolute bottom-2 left-2 right-2">
                  <p className="text-sm font-semibold text-white">{archetype.name}</p>
                </div>
              </div>
              <CardContent className="p-2">
                <Badge variant="outline" className="text-xs">{65 - index * 10}% match</Badge>
              </CardContent>
            </Card>
          ))}
        </div>
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
            {/* Add Content Section */}
            <div className="bg-gray-50 p-4 rounded-lg">
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
          </div>
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
          <RichTextEditor
            content={block.content.text || ''}
            onChange={(content) => onUpdate({ text: content })}
            placeholder="Enter your content here..."
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

interface RichTextEditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
}

function RichTextEditor({ content, onChange, placeholder }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: placeholder || 'Start typing...',
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
  })

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content)
    }
  }, [content, editor])

  if (!editor) {
    return null
  }

  return (
    <div className="border rounded-md">
      {/* Toolbar */}
      <div className="border-b p-2 flex gap-1 flex-wrap">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive('bold') ? 'bg-gray-200' : ''}
        >
          <strong>B</strong>
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive('italic') ? 'bg-gray-200' : ''}
        >
          <em>I</em>
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={editor.isActive('heading', { level: 2 }) ? 'bg-gray-200' : ''}
        >
          H2
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={editor.isActive('heading', { level: 3 }) ? 'bg-gray-200' : ''}
        >
          H3
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive('bulletList') ? 'bg-gray-200' : ''}
        >
          • List
        </Button>
      </div>

      {/* Editor */}
      <EditorContent
        editor={editor}
        className="prose prose-sm max-w-none p-3 min-h-[100px] focus-within:outline-none"
      />
    </div>
  )
}
