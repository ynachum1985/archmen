'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
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
import {
  BookOpen,
  Plus,
  GripVertical,
  Edit,
  Trash2,
  Image,
  Video,
  FileText,
  Lightbulb,
  Target,
  Heart,
  Zap,
  Clock,
  Star
} from 'lucide-react'
import { SectionEditor } from './SectionEditor'

interface CourseWeek {
  id: string
  weekNumber: number
  title: string
  description: string
  isUnlocked: boolean
  isPremium: boolean
  estimatedTime: string
  sections: CourseSection[]
}

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

interface CourseContentBuilderProps {
  archetypeId: string
  archetypeName: string
}

// Sortable Section Component
function SortableSection({ section, onEdit, onDelete }: { 
  section: CourseSection
  onEdit: (section: CourseSection) => void
  onDelete: (sectionId: string) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: section.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
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

  const getSectionColor = (type: string) => {
    switch (type) {
      case 'theory': return 'bg-blue-50 border-blue-200'
      case 'practice': return 'bg-green-50 border-green-200'
      case 'reflection': return 'bg-purple-50 border-purple-200'
      case 'integration': return 'bg-orange-50 border-orange-200'
      default: return 'bg-gray-50 border-gray-200'
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`p-4 border rounded-lg ${getSectionColor(section.type)} cursor-move`}
      {...attributes}
      {...listeners}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <GripVertical className="h-4 w-4 text-gray-400" />
          {getSectionIcon(section.type)}
          <div>
            <h4 className="font-medium">{section.title}</h4>
            <p className="text-sm text-gray-600 capitalize">{section.type}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            <Clock className="h-3 w-3 mr-1" />
            {section.estimatedMinutes}m
          </Badge>
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation()
              onEdit(section)
            }}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => onDelete(section.id)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      {section.content && (
        <p className="text-sm text-gray-600 mt-2 line-clamp-2">
          {section.content.substring(0, 100)}...
        </p>
      )}
      {section.mediaAssets.length > 0 && (
        <div className="flex items-center gap-2 mt-2">
          <span className="text-xs text-gray-500">Media:</span>
          {section.mediaAssets.map((asset) => (
            <Badge key={asset.id} variant="secondary" className="text-xs">
              {asset.type === 'image' && <Image className="h-3 w-3 mr-1" />}
              {asset.type === 'video' && <Video className="h-3 w-3 mr-1" />}
              {asset.title}
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}

export function CourseContentBuilder({ archetypeId, archetypeName }: CourseContentBuilderProps) {
  const [courseWeeks, setCourseWeeks] = useState<CourseWeek[]>([])
  const [selectedWeek, setSelectedWeek] = useState<number>(1)
  const [isLoading, setIsLoading] = useState(false)
  const [editingSection, setEditingSection] = useState<CourseSection | null>(null)
  const [showSectionForm, setShowSectionForm] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Initialize course structure
  useEffect(() => {
    initializeCourseStructure()
  }, [archetypeId])

  const initializeCourseStructure = () => {
    const defaultWeeks: CourseWeek[] = Array.from({ length: 6 }, (_, index) => ({
      id: `week-${index + 1}`,
      weekNumber: index + 1,
      title: getDefaultWeekTitle(index + 1),
      description: getDefaultWeekDescription(index + 1),
      isUnlocked: index < 2, // First 2 weeks free
      isPremium: index >= 2,
      estimatedTime: '45-60 minutes',
      sections: []
    }))
    setCourseWeeks(defaultWeeks)
  }

  const getDefaultWeekTitle = (weekNumber: number) => {
    const titles = [
      'Understanding Your Archetype',
      'Shadow Work Foundations', 
      'Integration Practices',
      'Real-World Applications',
      'Advanced Techniques',
      'Mastery & Next Steps'
    ]
    return titles[weekNumber - 1] || `Week ${weekNumber}`
  }

  const getDefaultWeekDescription = (weekNumber: number) => {
    const descriptions = [
      'Discover the core essence and patterns of your archetype',
      'Explore shadow aspects and unconscious patterns',
      'Learn practical integration techniques for daily life',
      'Apply archetypal wisdom to relationships and work',
      'Master advanced practices and deeper understanding',
      'Integrate all learnings and plan your continued journey'
    ]
    return descriptions[weekNumber - 1] || `Week ${weekNumber} content`
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const currentWeek = courseWeeks.find(w => w.weekNumber === selectedWeek)
      if (!currentWeek) return

      const oldIndex = currentWeek.sections.findIndex(s => s.id === active.id)
      const newIndex = currentWeek.sections.findIndex(s => s.id === over.id)

      const newSections = arrayMove(currentWeek.sections, oldIndex, newIndex)
      
      setCourseWeeks(weeks => 
        weeks.map(week => 
          week.weekNumber === selectedWeek 
            ? { ...week, sections: newSections }
            : week
        )
      )
    }
  }

  const addNewSection = (type: CourseSection['type']) => {
    const newSection: CourseSection = {
      id: `section-${Date.now()}`,
      type,
      title: `New ${type.charAt(0).toUpperCase() + type.slice(1)} Section`,
      content: '',
      estimatedMinutes: 15,
      orderIndex: 0,
      mediaAssets: []
    }
    setEditingSection(newSection)
    setShowSectionForm(true)
  }

  const saveSection = (section: CourseSection) => {
    setCourseWeeks(weeks => 
      weeks.map(week => 
        week.weekNumber === selectedWeek 
          ? {
              ...week,
              sections: editingSection?.id.startsWith('section-') && !week.sections.find(s => s.id === section.id)
                ? [...week.sections, section]
                : week.sections.map(s => s.id === section.id ? section : s)
            }
          : week
      )
    )
    setEditingSection(null)
    setShowSectionForm(false)
  }

  const deleteSection = (sectionId: string) => {
    setCourseWeeks(weeks => 
      weeks.map(week => 
        week.weekNumber === selectedWeek 
          ? { ...week, sections: week.sections.filter(s => s.id !== sectionId) }
          : week
      )
    )
  }

  const currentWeek = courseWeeks.find(w => w.weekNumber === selectedWeek)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold mb-2">Course Content Builder</h2>
        <p className="text-gray-600">Create a 6-week integration course for {archetypeName}</p>
      </div>

      {/* Week Selector */}
      <div className="flex flex-wrap gap-2">
        {courseWeeks.map((week) => (
          <Button
            key={week.id}
            variant={selectedWeek === week.weekNumber ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedWeek(week.weekNumber)}
            className="flex items-center gap-2"
          >
            <span>Week {week.weekNumber}</span>
            {week.isPremium && <Star className="h-3 w-3" />}
          </Button>
        ))}
      </div>

      {currentWeek && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Week {currentWeek.weekNumber}: {currentWeek.title}
            </CardTitle>
            <p className="text-sm text-gray-600">{currentWeek.description}</p>
            <div className="flex items-center gap-4 text-sm">
              <Badge variant={currentWeek.isPremium ? 'default' : 'secondary'}>
                {currentWeek.isPremium ? 'Premium' : 'Free'}
              </Badge>
              <span className="text-gray-500">
                <Clock className="h-4 w-4 inline mr-1" />
                {currentWeek.estimatedTime}
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Add Section Buttons */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => addNewSection('theory')}
                className="flex items-center gap-2"
              >
                <Lightbulb className="h-4 w-4" />
                Add Theory
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => addNewSection('practice')}
                className="flex items-center gap-2"
              >
                <Target className="h-4 w-4" />
                Add Practice
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => addNewSection('reflection')}
                className="flex items-center gap-2"
              >
                <Heart className="h-4 w-4" />
                Add Reflection
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => addNewSection('integration')}
                className="flex items-center gap-2"
              >
                <Zap className="h-4 w-4" />
                Add Integration
              </Button>
            </div>

            {/* Drag and Drop Sections */}
            {currentWeek.sections.length > 0 ? (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={currentWeek.sections.map(s => s.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-3">
                    {currentWeek.sections.map((section) => (
                      <SortableSection
                        key={section.id}
                        section={section}
                        onEdit={(section) => {
                          setEditingSection(section)
                          setShowSectionForm(true)
                        }}
                        onDelete={deleteSection}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium mb-2">No content yet</h3>
                <p className="text-sm">Add your first section using the buttons above</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Section Editor Modal */}
      <SectionEditor
        section={editingSection}
        isOpen={showSectionForm}
        onSave={saveSection}
        onCancel={() => {
          setEditingSection(null)
          setShowSectionForm(false)
        }}
        archetypeName={archetypeName}
      />
    </div>
  )
}
