"use client"

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { archetypeService } from '@/lib/services/archetype.service'
import type { Database } from '@/lib/types/database'

type Archetype = Database['public']['Tables']['enhanced_archetypes']['Row']

interface AddPatternDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onPatternAdded: () => void
}

export function AddPatternDialog({ open, onOpenChange, onPatternAdded }: AddPatternDialogProps) {
  const [archetypes, setArchetypes] = useState<Archetype[]>([])
  const [formData, setFormData] = useState({
    archetype_name: '',
    category: '',
    patterns: ''
  })
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    loadArchetypes()
  }, [])

  const loadArchetypes = async () => {
    try {
      const data = await archetypeService.getAllArchetypes()
      setArchetypes(data)
    } catch (error) {
      console.error('Error loading archetypes:', error)
    }
  }

  const handleArchetypeChange = (archetypeName: string) => {
    const archetype = archetypes.find(a => a.name === archetypeName)
    setFormData({
      ...formData,
      archetype_name: archetypeName,
      category: archetype?.category || ''
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const pattern = {
        archetype_name: formData.archetype_name,
        category: formData.category,
        patterns: formData.patterns
      }

      await archetypeService.createLinguisticPattern(pattern)
      setFormData({
        archetype_name: '',
        category: '',
        patterns: ''
      })
      onPatternAdded()
      onOpenChange(false)
    } catch (error) {
      console.error('Error creating pattern:', error)
      alert('Failed to create pattern. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-800 border-slate-700 max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-white">Add Linguistic Pattern</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="archetype" className="text-white">Archetype</Label>
            <Select value={formData.archetype_name} onValueChange={handleArchetypeChange}>
              <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                <SelectValue placeholder="Select archetype" />
              </SelectTrigger>
              <SelectContent className="bg-slate-700 border-slate-600">
                {archetypes.map(archetype => (
                  <SelectItem key={archetype.name} value={archetype.name} className="text-white hover:bg-slate-600">
                    {archetype.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="patterns" className="text-white">Linguistic Patterns</Label>
            <p className="text-sm text-gray-400 mb-2">
              Include keywords, common phrases, emotional indicators, and behavioral patterns
            </p>
            <textarea
              id="patterns"
              value={formData.patterns}
              onChange={(e) => setFormData({ ...formData, patterns: e.target.value })}
              placeholder="Enter all linguistic patterns here - keywords, phrases, emotional indicators, and behavioral patterns. You can organize them however works best for you."
              className="w-full h-32 p-3 bg-slate-700 border-slate-600 text-white rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical"
            />
            <p className="text-xs text-gray-400 mt-1">
              Mix keywords, phrases, emotional indicators, and behavioral patterns as needed
            </p>
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
              disabled={isLoading || !formData.archetype_name}
              className="flex-1 bg-teal-600 hover:bg-teal-700 text-white"
            >
              {isLoading ? 'Adding...' : 'Add Pattern'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 