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
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-medium text-gray-900">Linguistic Patterns</h3>
              <details className="relative">
                <summary className="cursor-pointer text-sm text-blue-600 hover:text-blue-800">
                  📋 Pattern Examples & LLM Prompt
                </summary>
                <div className="absolute right-0 top-6 w-96 p-4 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                  <div className="space-y-3">
                    <div className="text-sm">
                      <h4 className="font-medium mb-2">Copy this prompt for LLM assistance:</h4>
                      <div className="bg-gray-50 p-3 rounded text-xs font-mono">
                        <div className="mb-2 font-bold">Create comprehensive linguistic patterns for the [ARCHETYPE_NAME] archetype that help AI detect this pattern in user responses about relationships. Include:</div>
                        <div className="space-y-1 text-gray-700">
                          <div>• <strong>Keywords:</strong> Core terms they use</div>
                          <div>• <strong>Common Phrases:</strong> Typical expressions</div>
                          <div>• <strong>Emotional Indicators:</strong> Feeling words they use</div>
                          <div>• <strong>Behavioral Patterns:</strong> Actions they describe</div>
                          <div>• <strong>Sentence Structure:</strong> Short/long, commands/questions</div>
                          <div>• <strong>Pronoun Usage:</strong> I/you/we frequency patterns</div>
                          <div>• <strong>Temporal Language:</strong> Past/present/future focus</div>
                          <div>• <strong>Certainty Markers:</strong> Always/never vs maybe/sometimes</div>
                          <div>• <strong>Responsibility Language:</strong> Who they blame/credit</div>
                          <div>• <strong>Emotional Intensity:</strong> Mild vs extreme language</div>
                          <div>• <strong>Metaphors:</strong> War, nurturing, business, etc.</div>
                        </div>
                      </div>
                      <button
                        onClick={() => navigator.clipboard.writeText(`Create comprehensive linguistic patterns for the [ARCHETYPE_NAME] archetype that help AI detect this pattern in user responses about relationships. Include:

• Keywords: Core terms they use
• Common Phrases: Typical expressions
• Emotional Indicators: Feeling words they use
• Behavioral Patterns: Actions they describe
• Sentence Structure: Short/long, commands/questions
• Pronoun Usage: I/you/we frequency patterns
• Temporal Language: Past/present/future focus
• Certainty Markers: Always/never vs maybe/sometimes
• Responsibility Language: Who they blame/credit
• Emotional Intensity: Mild vs extreme language
• Metaphors: War, nurturing, business, etc.`)}
                        className="mt-2 text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
                      >
                        📋 Copy Prompt
                      </button>
                    </div>
                  </div>
                </div>
              </details>
            </div>

            <textarea
              value={linguisticPatterns}
              onChange={(e) => setLinguisticPatterns(e.target.value)}
              placeholder="Keywords: leadership, control, authority&#10;Phrases: I need to take charge, Let me handle this&#10;Emotional: frustrated when not in control, protective&#10;Behavioral: takes initiative, makes decisions quickly&#10;Sentence patterns: uses short commands&#10;Pronouns: high use of 'I' statements"
              className="w-full h-32 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical"
            />
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
