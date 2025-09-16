'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Save, X, BarChart3, Brain, Moon, BookOpen } from 'lucide-react'

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
  // New fields
  linguistic_patterns?: string
  theoretical_understanding?: string
  embodiment_practices?: string
  integration_practices?: string
  shadow_work?: string
  resources?: string
  metrics?: {
    impact_level?: number
    complexity_score?: number
    integration_difficulty?: number
    shadow_intensity?: number
  }
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
    archetype.linguisticPattern?.patterns || archetype.linguistic_patterns || ''
  )
  const [theoreticalUnderstanding, setTheoreticalUnderstanding] = useState(
    archetype.theoretical_understanding || ''
  )
  const [shadowWork, setShadowWork] = useState(
    archetype.shadow_work || ''
  )
  const [resources, setResources] = useState(
    archetype.resources || ''
  )

  const handleSave = () => {
    const updated = {
      ...editedArchetype,
      linguistic_patterns: linguisticPatterns,
      theoretical_understanding: theoreticalUnderstanding,
      shadow_work: shadowWork,
      resources: resources
    }

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

  return (
    <div className="p-6 bg-white border-t border-gray-200">
      <div className="space-y-6">
        {/* Basic Info */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <Input
              value={editedArchetype.name}
              onChange={(e) => setEditedArchetype({ ...editedArchetype, name: e.target.value })}
              placeholder="Archetype name"
            />
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
        </div>

        {/* Tabbed Content */}
        <Tabs defaultValue="metrics" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="metrics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Metrics
            </TabsTrigger>
            <TabsTrigger value="linguistic" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              Linguistic
            </TabsTrigger>
            <TabsTrigger value="understanding" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Understanding
            </TabsTrigger>
            <TabsTrigger value="shadow" className="flex items-center gap-2">
              <Moon className="h-4 w-4" />
              Shadow & Resources
            </TabsTrigger>
          </TabsList>

          <TabsContent value="metrics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Relationship Impact */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700">Relationship Impact</h4>
                <div className="flex items-center gap-3">
                  <Input
                    type="number"
                    min="1"
                    max="7"
                    value={editedArchetype.impact_score}
                    onChange={(e) => setEditedArchetype({ ...editedArchetype, impact_score: parseInt(e.target.value) || 1 })}
                    className="w-16"
                  />
                  <div className="flex-1">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-red-500 h-2 rounded-full transition-all"
                        style={{ width: `${(editedArchetype.impact_score / 7) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  How negatively this affects relationships (1=minimal, 7=severe)
                </p>
              </div>

              {/* Growth Potential */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700">Growth Potential</h4>
                <div className="flex items-center gap-3">
                  <Input
                    type="number"
                    min="1"
                    max="7"
                    value={editedArchetype.growth_potential_score || 1}
                    onChange={(e) => setEditedArchetype({ ...editedArchetype, growth_potential_score: parseInt(e.target.value) || 1 })}
                    className="w-16"
                  />
                  <div className="flex-1">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full transition-all"
                        style={{ width: `${((editedArchetype.growth_potential_score || 1) / 7) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  Potential for positive transformation (1=low, 7=high)
                </p>
              </div>

              {/* Awareness Difficulty */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700">Awareness Difficulty</h4>
                <div className="flex items-center gap-3">
                  <Input
                    type="number"
                    min="1"
                    max="7"
                    value={editedArchetype.awareness_difficulty_score || 1}
                    onChange={(e) => setEditedArchetype({ ...editedArchetype, awareness_difficulty_score: parseInt(e.target.value) || 1 })}
                    className="w-16"
                  />
                  <div className="flex-1">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-orange-500 h-2 rounded-full transition-all"
                        style={{ width: `${((editedArchetype.awareness_difficulty_score || 1) / 7) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  How hard to recognize this pattern (1=obvious, 7=hidden)
                </p>
              </div>

              {/* Trigger Intensity */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700">Trigger Intensity</h4>
                <div className="flex items-center gap-3">
                  <Input
                    type="number"
                    min="1"
                    max="7"
                    value={editedArchetype.trigger_intensity_score || 1}
                    onChange={(e) => setEditedArchetype({ ...editedArchetype, trigger_intensity_score: parseInt(e.target.value) || 1 })}
                    className="w-16"
                  />
                  <div className="flex-1">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-purple-500 h-2 rounded-full transition-all"
                        style={{ width: `${((editedArchetype.trigger_intensity_score || 1) / 7) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  How easily activated under stress (1=stable, 7=reactive)
                </p>
              </div>

              {/* Integration Complexity */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700">Integration Complexity</h4>
                <div className="flex items-center gap-3">
                  <Input
                    type="number"
                    min="1"
                    max="7"
                    value={editedArchetype.integration_complexity_score || 1}
                    onChange={(e) => setEditedArchetype({ ...editedArchetype, integration_complexity_score: parseInt(e.target.value) || 1 })}
                    className="w-16"
                  />
                  <div className="flex-1">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all"
                        style={{ width: `${((editedArchetype.integration_complexity_score || 1) / 7) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  How challenging to integrate healthily (1=easy, 7=complex)
                </p>
              </div>

              {/* Shadow Depth */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700">Shadow Depth</h4>
                <div className="flex items-center gap-3">
                  <Input
                    type="number"
                    min="1"
                    max="7"
                    value={editedArchetype.shadow_depth_score || 1}
                    onChange={(e) => setEditedArchetype({ ...editedArchetype, shadow_depth_score: parseInt(e.target.value) || 1 })}
                    className="w-16"
                  />
                  <div className="flex-1">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gray-700 h-2 rounded-full transition-all"
                        style={{ width: `${((editedArchetype.shadow_depth_score || 1) / 7) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  How deep/unconscious the shadow aspects (1=surface, 7=deep)
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="linguistic" className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Linguistic Patterns
              </label>
              <Textarea
                value={linguisticPatterns}
                onChange={(e) => setLinguisticPatterns(e.target.value)}
                placeholder="Keywords: leadership, control, authority&#10;Phrases: I need to take charge, Let me handle this&#10;Emotional: frustrated when not in control, protective&#10;Behavioral: takes initiative, makes decisions quickly"
                rows={8}
                className="resize-vertical"
              />
              <p className="text-xs text-gray-500 mt-2">
                Define language patterns that help identify this archetype in conversations
              </p>
            </div>
          </TabsContent>

          <TabsContent value="understanding" className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Theoretical Understanding
              </label>
              <Textarea
                value={theoreticalUnderstanding}
                onChange={(e) => setTheoreticalUnderstanding(e.target.value)}
                placeholder="Core concepts, psychological theory, and foundational understanding of this archetype..."
                rows={8}
                className="resize-vertical"
              />
              <p className="text-xs text-gray-500 mt-2">
                Explain the core concepts and theory behind this archetype
              </p>
            </div>
          </TabsContent>



          <TabsContent value="shadow" className="space-y-4">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Shadow Work
                </label>
                <Textarea
                  value={shadowWork}
                  onChange={(e) => setShadowWork(e.target.value)}
                  placeholder="Shadow aspects, potential pitfalls, and work to address them..."
                  rows={6}
                  className="resize-vertical"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Working with the shadow aspects and potential pitfalls
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Resources
                </label>
                <Textarea
                  value={resources}
                  onChange={(e) => setResources(e.target.value)}
                  placeholder="Books, articles, videos, exercises, and other resources..."
                  rows={6}
                  className="resize-vertical"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Additional materials and references for deeper exploration
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <Button variant="outline" onClick={onCancel}>
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button onClick={handleSave} className="bg-emerald-500 hover:bg-emerald-600">
            <Save className="w-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  )
}
