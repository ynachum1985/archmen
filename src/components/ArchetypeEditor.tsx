'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Save, X } from 'lucide-react'

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
        category: updated.category,
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
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Relationship Impact Score (1-7)
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
            How negatively this archetype can affect relationships and relating (1 = minimal impact, 7 = severe impact)
          </p>
          {/* TODO: Consider adding additional metrics:
              - Growth Potential Score (1-7): How much potential for positive transformation
              - Awareness Difficulty (1-7): How hard it is for someone to recognize this pattern
              - Trigger Intensity (1-7): How easily this archetype gets activated under stress
              - Integration Complexity (1-7): How challenging it is to integrate this archetype healthily
              - Shadow Depth (1-7): How deep/unconscious the shadow aspects tend to be
          */}
        </div>

        {/* Linguistic Patterns */}
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Linguistic Patterns</h3>
            <p className="text-sm text-gray-600 mb-4">
              Add linguistic patterns that help identify this archetype in text. Include keywords, common phrases, emotional indicators, and behavioral patterns.
            </p>

            {/* Examples */}
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Examples:</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <div><strong>Keywords:</strong> leadership, control, authority, responsibility, decision</div>
                <div><strong>Common Phrases:</strong> &quot;I need to take charge&quot;, &quot;Let me handle this&quot;, &quot;I&apos;m responsible for&quot;</div>
                <div><strong>Emotional Indicators:</strong> frustrated when not in control, confident in decisions, protective</div>
                <div><strong>Behavioral Patterns:</strong> takes initiative, makes decisions quickly, organizes others</div>
              </div>
            </div>

            <label className="block text-sm font-medium text-gray-700 mb-2">
              Linguistic Patterns
            </label>
            <textarea
              value={linguisticPatterns}
              onChange={(e) => setLinguisticPatterns(e.target.value)}
              placeholder="Enter all linguistic patterns here - keywords, phrases, emotional indicators, and behavioral patterns. You can organize them however works best for you, or paste in relevant documents/text."
              className="w-full h-32 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical"
            />
            <p className="text-xs text-gray-500 mt-1">
              Add any patterns that help identify this archetype - mix keywords, phrases, emotional indicators, and behavioral patterns as needed.
            </p>
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
