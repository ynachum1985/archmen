'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Save, X, BarChart3, BookOpen } from 'lucide-react'
import { ArchetypeKnowledgeBase } from './admin/ArchetypeKnowledgeBase'

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
  // Separate content fields
  linguistic_patterns?: string
  theoretical_understanding?: string
  shadow_work?: string
  integration_practices?: string
  metrics?: {
    impact_level?: number
    complexity_score?: number
    integration_difficulty?: number
    shadow_intensity?: number
  }
}



interface ArchetypeEditorProps {
  archetype: Archetype
  onSave: (archetype: Archetype) => void
  onCancel: () => void
}

export default function ArchetypeEditor({ archetype, onSave, onCancel }: ArchetypeEditorProps) {
  const [editedArchetype, setEditedArchetype] = useState<Archetype>(archetype)

  const handleSave = () => {
    const updated = {
      ...editedArchetype
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
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="metrics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Metrics
            </TabsTrigger>
            <TabsTrigger value="knowledge" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Knowledge Base
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

              </div>
            </div>
          </TabsContent>

          <TabsContent value="knowledge" className="space-y-4">
            <ArchetypeKnowledgeBase
              archetypeId={editedArchetype.id}
              archetypeName={editedArchetype.name}
            />
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
