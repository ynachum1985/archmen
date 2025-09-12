'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Save, X } from 'lucide-react'

interface Archetype {
  id: string
  name: string
  description: string
  impact_score: number
  growth_potential_score?: number | null
  awareness_difficulty_score?: number | null
  trigger_intensity_score?: number | null
  integration_complexity_score?: number | null
  shadow_depth_score?: number | null
  archetype_images?: string[] | null
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
  patterns: string | null // Simplified to single text field
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
  const [linguisticPatterns, setLinguisticPatterns] = useState(
    archetype.linguisticPattern?.patterns || ''
  )

  const handleSave = () => {
    const updated = { ...editedArchetype }
    if (!updated.linguisticPattern) {
      updated.linguisticPattern = {
        id: '',
        archetype_name: updated.name,
        patterns: linguisticPatterns,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    } else {
      updated.linguisticPattern.patterns = linguisticPatterns
      updated.linguisticPattern.updated_at = new Date().toISOString()
    }
    onSave(updated)
  }

  // Simplified linguistic patterns - all in one text area

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
          {/* Category removed - archetypes will be categorized by assessment type */}
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

        {/* Impact Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Relationship Impact (1-7)
            </label>
            <Input
              type="number"
              min="1"
              max="7"
              value={editedArchetype.impact_score}
              onChange={(e) => setEditedArchetype({ ...editedArchetype, impact_score: parseInt(e.target.value) || 1 })}
              className="w-24"
            />
            <p className="text-xs text-gray-500 mt-1">
              How negatively this affects relationships
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Growth Potential (1-7)
            </label>
            <Input
              type="number"
              min="1"
              max="7"
              value={editedArchetype.growth_potential_score || 1}
              onChange={(e) => setEditedArchetype({ ...editedArchetype, growth_potential_score: parseInt(e.target.value) || 1 })}
              className="w-24"
            />
            <p className="text-xs text-gray-500 mt-1">
              Potential for positive transformation
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Awareness Difficulty (1-7)
            </label>
            <Input
              type="number"
              min="1"
              max="7"
              value={editedArchetype.awareness_difficulty_score || 1}
              onChange={(e) => setEditedArchetype({ ...editedArchetype, awareness_difficulty_score: parseInt(e.target.value) || 1 })}
              className="w-24"
            />
            <p className="text-xs text-gray-500 mt-1">
              How hard to recognize this pattern
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Trigger Intensity (1-7)
            </label>
            <Input
              type="number"
              min="1"
              max="7"
              value={editedArchetype.trigger_intensity_score || 1}
              onChange={(e) => setEditedArchetype({ ...editedArchetype, trigger_intensity_score: parseInt(e.target.value) || 1 })}
              className="w-24"
            />
            <p className="text-xs text-gray-500 mt-1">
              How easily activated under stress
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Integration Complexity (1-7)
            </label>
            <Input
              type="number"
              min="1"
              max="7"
              value={editedArchetype.integration_complexity_score || 1}
              onChange={(e) => setEditedArchetype({ ...editedArchetype, integration_complexity_score: parseInt(e.target.value) || 1 })}
              className="w-24"
            />
            <p className="text-xs text-gray-500 mt-1">
              How challenging to integrate healthily
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Shadow Depth (1-7)
            </label>
            <Input
              type="number"
              min="1"
              max="7"
              value={editedArchetype.shadow_depth_score || 1}
              onChange={(e) => setEditedArchetype({ ...editedArchetype, shadow_depth_score: parseInt(e.target.value) || 1 })}
              className="w-24"
            />
            <p className="text-xs text-gray-500 mt-1">
              How deep/unconscious the shadow aspects
            </p>
          </div>
        </div>

        {/* Linguistic Patterns */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Linguistic Patterns
          </label>
          <textarea
            value={linguisticPatterns}
            onChange={(e) => setLinguisticPatterns(e.target.value)}
            placeholder="Keywords: leadership, control, authority&#10;Phrases: I need to take charge, Let me handle this&#10;Emotional: frustrated when not in control, protective&#10;Behavioral: takes initiative, makes decisions quickly"
            className="w-full h-24 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical"
          />
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
