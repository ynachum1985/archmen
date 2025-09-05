'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Save, X, Plus } from 'lucide-react'

interface Archetype {
  id: string
  name: string
  category: string
  description: string
  impact_score: number
  traits: unknown
  psychology_profile: unknown
  is_active: boolean | null
  created_at: string
  updated_at: string
  linguisticPattern?: LinguisticPattern
}

interface LinguisticPattern {
  id: string
  archetype_name: string
  category: string
  keywords: string[] | null
  phrases: string[] | null
  emotional_indicators: string[] | null
  behavioral_patterns: string[] | null
  created_at: string
  updated_at: string
}

interface ArchetypeEditorProps {
  archetype: Archetype
  onSave: (archetype: Archetype) => void
  onCancel: () => void
}

export default function ArchetypeEditor({ archetype, onSave, onCancel }: ArchetypeEditorProps) {
  const [editedArchetype, setEditedArchetype] = useState<Archetype>(archetype)
  const [newKeyword, setNewKeyword] = useState('')
  const [newPhrase, setNewPhrase] = useState('')
  const [newEmotionalIndicator, setNewEmotionalIndicator] = useState('')
  const [newBehavioralPattern, setNewBehavioralPattern] = useState('')

  const handleSave = () => {
    onSave(editedArchetype)
  }

  const addKeyword = () => {
    if (newKeyword.trim()) {
      const updated = { ...editedArchetype }
      if (!updated.linguisticPattern) {
        updated.linguisticPattern = {
          id: '',
          archetype_name: updated.name,
          category: updated.category,
          keywords: [],
          phrases: [],
          emotional_indicators: [],
          behavioral_patterns: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      }
      updated.linguisticPattern.keywords = [...(updated.linguisticPattern.keywords || []), newKeyword.trim()]
      setEditedArchetype(updated)
      setNewKeyword('')
    }
  }

  const removeKeyword = (index: number) => {
    const updated = { ...editedArchetype }
    if (updated.linguisticPattern?.keywords) {
      updated.linguisticPattern.keywords = updated.linguisticPattern.keywords.filter((_, i) => i !== index)
      setEditedArchetype(updated)
    }
  }

  const addPhrase = () => {
    if (newPhrase.trim()) {
      const updated = { ...editedArchetype }
      if (!updated.linguisticPattern) {
        updated.linguisticPattern = {
          id: '',
          archetype_name: updated.name,
          category: updated.category,
          keywords: [],
          phrases: [],
          emotional_indicators: [],
          behavioral_patterns: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      }
      updated.linguisticPattern.phrases = [...(updated.linguisticPattern.phrases || []), newPhrase.trim()]
      setEditedArchetype(updated)
      setNewPhrase('')
    }
  }

  const removePhrase = (index: number) => {
    const updated = { ...editedArchetype }
    if (updated.linguisticPattern?.phrases) {
      updated.linguisticPattern.phrases = updated.linguisticPattern.phrases.filter((_, i) => i !== index)
      setEditedArchetype(updated)
    }
  }

  const addEmotionalIndicator = () => {
    if (newEmotionalIndicator.trim()) {
      const updated = { ...editedArchetype }
      if (!updated.linguisticPattern) {
        updated.linguisticPattern = {
          id: '',
          archetype_name: updated.name,
          category: updated.category,
          keywords: [],
          phrases: [],
          emotional_indicators: [],
          behavioral_patterns: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      }
      updated.linguisticPattern.emotional_indicators = [...(updated.linguisticPattern.emotional_indicators || []), newEmotionalIndicator.trim()]
      setEditedArchetype(updated)
      setNewEmotionalIndicator('')
    }
  }

  const removeEmotionalIndicator = (index: number) => {
    const updated = { ...editedArchetype }
    if (updated.linguisticPattern?.emotional_indicators) {
      updated.linguisticPattern.emotional_indicators = updated.linguisticPattern.emotional_indicators.filter((_, i) => i !== index)
      setEditedArchetype(updated)
    }
  }

  const addBehavioralPattern = () => {
    if (newBehavioralPattern.trim()) {
      const updated = { ...editedArchetype }
      if (!updated.linguisticPattern) {
        updated.linguisticPattern = {
          id: '',
          archetype_name: updated.name,
          category: updated.category,
          keywords: [],
          phrases: [],
          emotional_indicators: [],
          behavioral_patterns: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      }
      updated.linguisticPattern.behavioral_patterns = [...(updated.linguisticPattern.behavioral_patterns || []), newBehavioralPattern.trim()]
      setEditedArchetype(updated)
      setNewBehavioralPattern('')
    }
  }

  const removeBehavioralPattern = (index: number) => {
    const updated = { ...editedArchetype }
    if (updated.linguisticPattern?.behavioral_patterns) {
      updated.linguisticPattern.behavioral_patterns = updated.linguisticPattern.behavioral_patterns.filter((_, i) => i !== index)
      setEditedArchetype(updated)
    }
  }

  return (
    <div className="p-6 bg-white border-t border-gray-200">
      <div className="space-y-6">
        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <Input
              value={editedArchetype.name}
              onChange={(e) => setEditedArchetype({ ...editedArchetype, name: e.target.value })}
              placeholder="Archetype name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <Input
              value={editedArchetype.category}
              onChange={(e) => setEditedArchetype({ ...editedArchetype, category: e.target.value })}
              placeholder="Category"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <Textarea
            value={editedArchetype.description}
            onChange={(e) => setEditedArchetype({ ...editedArchetype, description: e.target.value })}
            placeholder="Archetype description"
            rows={3}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Impact Score (1-7)</label>
          <Input
            type="number"
            min="1"
            max="7"
            value={editedArchetype.impact_score}
            onChange={(e) => setEditedArchetype({ ...editedArchetype, impact_score: parseInt(e.target.value) || 1 })}
            className="w-24"
          />
        </div>

        {/* Linguistic Patterns */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Linguistic Patterns</h3>
          
          {/* Keywords */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Keywords</label>
            <div className="flex gap-2 mb-2">
              <Input
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                placeholder="Add keyword"
                onKeyPress={(e) => e.key === 'Enter' && addKeyword()}
              />
              <Button onClick={addKeyword} size="sm">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {editedArchetype.linguisticPattern?.keywords?.map((keyword, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {keyword}
                  <button onClick={() => removeKeyword(index)} className="ml-1 hover:text-red-600">
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          {/* Phrases */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Common Phrases</label>
            <div className="flex gap-2 mb-2">
              <Input
                value={newPhrase}
                onChange={(e) => setNewPhrase(e.target.value)}
                placeholder="Add phrase"
                onKeyPress={(e) => e.key === 'Enter' && addPhrase()}
              />
              <Button onClick={addPhrase} size="sm">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {editedArchetype.linguisticPattern?.phrases?.map((phrase, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {phrase}
                  <button onClick={() => removePhrase(index)} className="ml-1 hover:text-red-600">
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          {/* Emotional Indicators */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Emotional Indicators</label>
            <div className="flex gap-2 mb-2">
              <Input
                value={newEmotionalIndicator}
                onChange={(e) => setNewEmotionalIndicator(e.target.value)}
                placeholder="Add emotional indicator"
                onKeyPress={(e) => e.key === 'Enter' && addEmotionalIndicator()}
              />
              <Button onClick={addEmotionalIndicator} size="sm">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {editedArchetype.linguisticPattern?.emotional_indicators?.map((indicator, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {indicator}
                  <button onClick={() => removeEmotionalIndicator(index)} className="ml-1 hover:text-red-600">
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          {/* Behavioral Patterns */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Behavioral Patterns</label>
            <div className="flex gap-2 mb-2">
              <Input
                value={newBehavioralPattern}
                onChange={(e) => setNewBehavioralPattern(e.target.value)}
                placeholder="Add behavioral pattern"
                onKeyPress={(e) => e.key === 'Enter' && addBehavioralPattern()}
              />
              <Button onClick={addBehavioralPattern} size="sm">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {editedArchetype.linguisticPattern?.behavioral_patterns?.map((pattern, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {pattern}
                  <button onClick={() => removeBehavioralPattern(index)} className="ml-1 hover:text-red-600">
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <Button variant="outline" onClick={onCancel}>
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  )
}
