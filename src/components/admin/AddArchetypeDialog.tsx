"use client"

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { archetypeService } from '@/lib/services/archetype.service'

interface AddArchetypeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onArchetypeAdded: () => void
}

const categories = [
  'Counselor', 'Guardian', 'Avoidant', 'Renegade', 'Caretaker', 
  'Deceiver', 'Possessor', 'Conservative', 'Innovator', 'Seducer', 'Critic'
]

export function AddArchetypeDialog({ open, onOpenChange, onArchetypeAdded }: AddArchetypeDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    impact_score: 1,
    description: ''
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await archetypeService.createArchetype(formData)
      setFormData({ name: '', category: '', impact_score: 1, description: '' })
      onArchetypeAdded()
      onOpenChange(false)
    } catch (error) {
      console.error('Error creating archetype:', error)
      alert('Failed to create archetype. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-800 border-slate-700 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white">Add New Archetype</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name" className="text-white">Name</Label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., The Challenger"
              required
              className="bg-slate-700 border-slate-600 text-white"
            />
          </div>

          <div>
            <Label htmlFor="category" className="text-white">Category</Label>
            <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
              <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent className="bg-slate-700 border-slate-600">
                {categories.map(category => (
                  <SelectItem key={category} value={category} className="text-white hover:bg-slate-600">
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="impact_score" className="text-white">Impact Score (1-7)</Label>
            <Input
              id="impact_score"
              type="number"
              min="1"
              max="7"
              value={formData.impact_score}
              onChange={(e) => setFormData({ ...formData, impact_score: parseInt(e.target.value) })}
              required
              className="bg-slate-700 border-slate-600 text-white"
            />
          </div>

          <div>
            <Label htmlFor="description" className="text-white">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description of this archetype..."
              required
              className="bg-slate-700 border-slate-600 text-white"
              rows={3}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 border-slate-600 text-white hover:bg-slate-700"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-teal-600 hover:bg-teal-700 text-white"
            >
              {isLoading ? 'Adding...' : 'Add Archetype'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 