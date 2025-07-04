"use client"

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
    keywords: '',
    phrases: '',
    emotional_indicators: '',
    behavioral_patterns: ''
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
        keywords: formData.keywords.split(',').map(k => k.trim()).filter(k => k),
        phrases: formData.phrases.split(',').map(p => p.trim()).filter(p => p),
        emotional_indicators: formData.emotional_indicators.split(',').map(e => e.trim()).filter(e => e),
        behavioral_patterns: formData.behavioral_patterns.split(',').map(b => b.trim()).filter(b => b)
      }

      await archetypeService.createLinguisticPattern(pattern)
      setFormData({
        archetype_name: '',
        category: '',
        keywords: '',
        phrases: '',
        emotional_indicators: '',
        behavioral_patterns: ''
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
            <Label htmlFor="keywords" className="text-white">Keywords</Label>
            <Input
              id="keywords"
              type="text"
              value={formData.keywords}
              onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
              placeholder="keyword1, keyword2, keyword3"
              className="bg-slate-700 border-slate-600 text-white"
            />
            <p className="text-sm text-gray-400 mt-1">Separate with commas</p>
          </div>

          <div>
            <Label htmlFor="phrases" className="text-white">Common Phrases</Label>
            <Input
              id="phrases"
              type="text"
              value={formData.phrases}
              onChange={(e) => setFormData({ ...formData, phrases: e.target.value })}
              placeholder="I always, you should, let me"
              className="bg-slate-700 border-slate-600 text-white"
            />
            <p className="text-sm text-gray-400 mt-1">Separate with commas</p>
          </div>

          <div>
            <Label htmlFor="emotional_indicators" className="text-white">Emotional Indicators</Label>
            <Input
              id="emotional_indicators"
              type="text"
              value={formData.emotional_indicators}
              onChange={(e) => setFormData({ ...formData, emotional_indicators: e.target.value })}
              placeholder="confident, assertive, dominant"
              className="bg-slate-700 border-slate-600 text-white"
            />
            <p className="text-sm text-gray-400 mt-1">Separate with commas</p>
          </div>

          <div>
            <Label htmlFor="behavioral_patterns" className="text-white">Behavioral Patterns</Label>
            <Input
              id="behavioral_patterns"
              type="text"
              value={formData.behavioral_patterns}
              onChange={(e) => setFormData({ ...formData, behavioral_patterns: e.target.value })}
              placeholder="takes control, dominates, leads"
              className="bg-slate-700 border-slate-600 text-white"
            />
            <p className="text-sm text-gray-400 mt-1">Separate with commas</p>
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