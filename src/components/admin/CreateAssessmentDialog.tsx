"use client"

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import { assessmentService } from '@/lib/services/assessment.service'
import { Plus } from 'lucide-react'

interface CreateAssessmentDialogProps {
  onAssessmentCreated: () => void
  trigger?: React.ReactNode
}

export function CreateAssessmentDialog({ onAssessmentCreated, trigger }: CreateAssessmentDialogProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'relationship',
    is_free: true,
    is_active: false,
    estimated_duration_minutes: 5,
    intro_text: '',
    completion_text: '',
    archetype_focus: [] as string[],
  })

  const archetypeOptions = [
    'The Innocent', 'The Sage', 'The Explorer', 'The Outlaw',
    'The Magician', 'The Hero', 'The Lover', 'The Jester',
    'The Everyman', 'The Caregiver', 'The Ruler', 'The Creator'
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) return

    setIsLoading(true)
    try {
      await assessmentService.createTemplate({
        name: formData.name,
        description: formData.description || null,
        category: formData.category,
        is_free: formData.is_free,
        is_active: formData.is_active,
        estimated_duration_minutes: formData.estimated_duration_minutes,
        intro_text: formData.intro_text || null,
        completion_text: formData.completion_text || null,
        archetype_focus: formData.archetype_focus.length > 0 ? formData.archetype_focus : null,
      })

      setOpen(false)
      setFormData({
        name: '',
        description: '',
        category: 'relationship',
        is_free: true,
        is_active: false,
        estimated_duration_minutes: 5,
        intro_text: '',
        completion_text: '',
        archetype_focus: [],
      })
      onAssessmentCreated()
    } catch (error) {
      console.error('Error creating assessment:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleArchetypeFocusChange = (archetype: string, checked: boolean) => {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        archetype_focus: [...prev.archetype_focus, archetype]
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        archetype_focus: prev.archetype_focus.filter(a => a !== archetype)
      }))
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="bg-teal-600 hover:bg-teal-700 text-white">
            <Plus className="h-4 w-4 mr-2" />
            Create Assessment
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] bg-slate-800 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-white">Create New Assessment</DialogTitle>
          <DialogDescription className="text-gray-400">
            Create a new assessment template for users to take.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-white">Assessment Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Relationship Patterns Assessment"
                className="bg-slate-700 border-slate-600 text-white"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category" className="text-white">Category</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  <SelectItem value="relationship" className="text-white">Relationship</SelectItem>
                  <SelectItem value="shadow_work" className="text-white">Shadow Work</SelectItem>
                  <SelectItem value="archetype_discovery" className="text-white">Archetype Discovery</SelectItem>
                  <SelectItem value="personal_growth" className="text-white">Personal Growth</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-white">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Brief description of what this assessment measures..."
              className="bg-slate-700 border-slate-600 text-white"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration" className="text-white">Estimated Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                value={formData.estimated_duration_minutes}
                onChange={(e) => setFormData(prev => ({ ...prev, estimated_duration_minutes: parseInt(e.target.value) }))}
                min="1"
                max="60"
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>
            <div className="space-y-4 pt-6">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_free"
                  checked={formData.is_free}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_free: e.target.checked }))}
                  className="rounded"
                />
                <Label htmlFor="is_free" className="text-white">Free Assessment</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                  className="rounded"
                />
                <Label htmlFor="is_active" className="text-white">Active</Label>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="intro_text" className="text-white">Introduction Text</Label>
            <Textarea
              id="intro_text"
              value={formData.intro_text}
              onChange={(e) => setFormData(prev => ({ ...prev, intro_text: e.target.value }))}
              placeholder="Text shown to users before starting the assessment..."
              className="bg-slate-700 border-slate-600 text-white"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="completion_text" className="text-white">Completion Text</Label>
            <Textarea
              id="completion_text"
              value={formData.completion_text}
              onChange={(e) => setFormData(prev => ({ ...prev, completion_text: e.target.value }))}
              placeholder="Text shown to users after completing the assessment..."
              className="bg-slate-700 border-slate-600 text-white"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-white">Archetype Focus (Optional)</Label>
            <div className="grid grid-cols-3 gap-2 max-h-32 overflow-y-auto">
              {archetypeOptions.map((archetype) => (
                <div key={archetype} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`archetype-${archetype}`}
                    checked={formData.archetype_focus.includes(archetype)}
                    onChange={(e) => handleArchetypeFocusChange(archetype, e.target.checked)}
                    className="rounded"
                  />
                  <Label htmlFor={`archetype-${archetype}`} className="text-sm text-gray-300">
                    {archetype}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="border-slate-600 text-white hover:bg-slate-700"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !formData.name.trim()}
              className="bg-teal-600 hover:bg-teal-700 text-white"
            >
              {isLoading ? 'Creating...' : 'Create Assessment'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 