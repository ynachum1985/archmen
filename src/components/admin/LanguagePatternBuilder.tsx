'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useSupabase } from '@/lib/hooks/useSupabase'
import { EnhancedArchetypeRepository } from '@/lib/repositories/enhanced-archetype.repository'
import { Edit, Plus, Save, Crown } from 'lucide-react'
import { AdvancedArchetypeDefinition } from '@/lib/types/archetype-system'

interface LinguisticPattern {
  id: string
  name: string
  archetype_id: string
  pattern_type: 'keywords' | 'phrases' | 'emotions' | 'behaviors'
  patterns: string[]
  accuracy: number
  is_active: boolean
  usage_count: number
  created_at: string
  updated_at: string
}

export function LanguagePatternBuilder() {
  const { supabase } = useSupabase()
  const [patterns, setPatterns] = useState<LinguisticPattern[]>([])
  const [archetypes, setArchetypes] = useState<any[]>([])
  const [testInput, setTestInput] = useState('')
  const [aiSuggestion, setAiSuggestion] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isAddPatternOpen, setIsAddPatternOpen] = useState(false)
  const [isEditPatternOpen, setIsEditPatternOpen] = useState(false)
  const [isAddArchetypeOpen, setIsAddArchetypeOpen] = useState(false)
  const [newPattern, setNewPattern] = useState({
    name: '',
    archetype_id: '',
    pattern_type: 'keywords' as const,
    patterns: [] as string[],
    patternsText: ''
  })
  const [editPattern, setEditPattern] = useState<Partial<LinguisticPattern & { patternsText: string }>>({})
  const [newArchetype, setNewArchetype] = useState<Partial<AdvancedArchetypeDefinition>>({
    name: '',
    category: 'primary' as const,
    description: '',
    traits: {
      core: [],
      shadow: [],
      triggers: [],
      conflicts: []
    },
    psychologyProfile: {
      motivations: [],
      fears: [],
      desires: [],
      behaviors: []
    },
    isActive: true
  })

  useEffect(() => {
    loadPatterns()
    loadArchetypes()
  }, [])

  const loadPatterns = async () => {
    const { data, error } = await supabase
      .from('linguistic_patterns')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (!error && data) {
      setPatterns(data)
    }
  }

  const loadArchetypes = async () => {
    const repository = new EnhancedArchetypeRepository(supabase)
    const data = await repository.getArchetypeDefinitions(true)
    setArchetypes(data)
  }

  const handleAddPattern = async () => {
    if (!newPattern.name || !newPattern.archetype_id || !newPattern.patternsText) {
      alert('Please fill in all required fields')
      return
    }

    const patterns = newPattern.patternsText
      .split('\n')
      .map(p => p.trim())
      .filter(p => p.length > 0)

    const { error } = await supabase
      .from('linguistic_patterns')
      .insert({
        name: newPattern.name,
        archetype_id: newPattern.archetype_id,
        pattern_type: newPattern.pattern_type,
        patterns: patterns,
        accuracy: 0,
        is_active: true,
        usage_count: 0
      })

    if (!error) {
      await loadPatterns()
      setIsAddPatternOpen(false)
      resetNewForm()
    }
  }

  const handleEditPattern = async () => {
    if (!editPattern.id || !editPattern.name || !editPattern.archetype_id || !editPattern.patternsText) {
      alert('Please fill in all required fields')
      return
    }

    const patterns = editPattern.patternsText
      .split('\n')
      .map(p => p.trim())
      .filter(p => p.length > 0)

    const { error } = await supabase
      .from('linguistic_patterns')
      .update({
        name: editPattern.name,
        archetype_id: editPattern.archetype_id,
        pattern_type: editPattern.pattern_type,
        patterns: patterns,
        is_active: editPattern.is_active
      })
      .eq('id', editPattern.id)

    if (!error) {
      await loadPatterns()
      setIsEditPatternOpen(false)
      setEditPattern({})
    }
  }

  const handleOpenEdit = (pattern: LinguisticPattern) => {
    setEditPattern({
      id: pattern.id,
      name: pattern.name,
      archetype_id: pattern.archetype_id,
      pattern_type: pattern.pattern_type,
      patterns: pattern.patterns,
      patternsText: pattern.patterns.join('\n'),
      accuracy: pattern.accuracy,
      is_active: pattern.is_active,
      usage_count: pattern.usage_count
    })
    setIsEditPatternOpen(true)
  }

  const handleAddArchetype = async () => {
    if (!newArchetype.name || !newArchetype.description) {
      alert('Please fill in all required fields')
      return
    }

    try {
      const repository = new EnhancedArchetypeRepository(supabase)
      const created = await repository.createArchetypeDefinition({
        name: newArchetype.name!,
        category: newArchetype.category!,
        description: newArchetype.description!,
        traits: newArchetype.traits!,
        psychologyProfile: newArchetype.psychologyProfile!,
        isActive: newArchetype.isActive!,
        interactionPatterns: {
          withOtherArchetypes: {},
          inRelationships: [],
          communicationStyle: ''
        },
        promptTemplates: {
          assessment: [],
          deepDive: [],
          therapeutic: []
        },
        scoringWeights: {
          importance: 0.5,
          complexity: 0.5,
          therapeuticValue: 0.5
        },
        version: '1.0'
      })

      await loadArchetypes()
      setIsAddArchetypeOpen(false)
      resetArchetypeForm()
    } catch (error) {
      console.error('Error creating archetype:', error)
      alert('Failed to create archetype. Please try again.')
    }
  }

  const resetNewForm = () => {
    setNewPattern({
      name: '',
      archetype_id: '',
      pattern_type: 'keywords',
      patterns: [],
      patternsText: ''
    })
  }

  const resetArchetypeForm = () => {
    setNewArchetype({
      name: '',
      category: 'primary' as const,
      description: '',
      traits: {
        core: [],
        shadow: [],
        triggers: [],
        conflicts: []
      },
      psychologyProfile: {
        motivations: [],
        fears: [],
        desires: [],
        behaviors: []
      },
      isActive: true
    })
  }

  const getArchetypeName = (archetypeId: string) => {
    const archetype = archetypes.find(a => a.id === archetypeId)
    return archetype?.name || 'Unknown'
  }

  const ArchetypeForm = ({ archetype }: { archetype: Partial<AdvancedArchetypeDefinition> }) => (
    <div className="space-y-4 py-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-slate-300">Archetype Name</Label>
          <Input
            value={archetype.name || ''}
            onChange={(e) => setNewArchetype({...newArchetype, name: e.target.value})}
            placeholder="e.g., The Warrior"
            className="bg-slate-900/50 border-slate-600 text-slate-200"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-slate-300">Category</Label>
          <Select
            value={archetype.category || 'primary'}
            onValueChange={(value: any) => setNewArchetype({...newArchetype, category: value})}
          >
            <SelectTrigger className="bg-slate-900/50 border-slate-600 text-slate-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              <SelectItem value="primary" className="text-slate-200 hover:bg-slate-700">Primary</SelectItem>
              <SelectItem value="shadow" className="text-slate-200 hover:bg-slate-700">Shadow</SelectItem>
              <SelectItem value="anima_animus" className="text-slate-200 hover:bg-slate-700">Anima/Animus</SelectItem>
              <SelectItem value="collective" className="text-slate-200 hover:bg-slate-700">Collective</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-slate-300">Description</Label>
        <Textarea
          value={archetype.description || ''}
          onChange={(e) => setNewArchetype({...newArchetype, description: e.target.value})}
          placeholder="Describe the archetype's core characteristics..."
          className="bg-slate-900/50 border-slate-600 text-slate-200 min-h-[100px]"
        />
      </div>
    </div>
  )

  const PatternForm = ({ pattern, isEdit }: { pattern: any, isEdit: boolean }) => (
    <div className="space-y-4 py-4">
      <div className="space-y-2">
        <Label className="text-slate-300">Pattern Name</Label>
        <Input
          value={pattern.name || ''}
          onChange={(e) => isEdit
            ? setEditPattern({...editPattern, name: e.target.value})
            : setNewPattern({...newPattern, name: e.target.value})
          }
          placeholder="e.g., Warrior Direct Language"
          className="bg-slate-900/50 border-slate-600 text-slate-200"
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-slate-300">Archetype</Label>
          <Select 
            value={pattern.archetype_id || ''} 
            onValueChange={(value) => isEdit
              ? setEditPattern({...editPattern, archetype_id: value})
              : setNewPattern({...newPattern, archetype_id: value})
            }
          >
            <SelectTrigger className="bg-slate-900/50 border-slate-600 text-slate-200">
              <SelectValue placeholder="Select archetype" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              {archetypes.map((archetype) => (
                <SelectItem 
                  key={archetype.id} 
                  value={archetype.id}
                  className="text-slate-200 hover:bg-slate-700"
                >
                  {archetype.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label className="text-slate-300">Pattern Type</Label>
          <Select 
            value={pattern.pattern_type || 'keywords'} 
            onValueChange={(value: any) => isEdit
              ? setEditPattern({...editPattern, pattern_type: value})
              : setNewPattern({...newPattern, pattern_type: value})
            }
          >
            <SelectTrigger className="bg-slate-900/50 border-slate-600 text-slate-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              <SelectItem value="keywords" className="text-slate-200 hover:bg-slate-700">Keywords</SelectItem>
              <SelectItem value="phrases" className="text-slate-200 hover:bg-slate-700">Phrases</SelectItem>
              <SelectItem value="emotions" className="text-slate-200 hover:bg-slate-700">Emotions</SelectItem>
              <SelectItem value="behaviors" className="text-slate-200 hover:bg-slate-700">Behaviors</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-slate-300">Patterns (one per line)</Label>
        <Textarea
          value={pattern.patternsText || ''}
          onChange={(e) => isEdit
            ? setEditPattern({...editPattern, patternsText: e.target.value})
            : setNewPattern({...newPattern, patternsText: e.target.value})
          }
          placeholder="Enter patterns, one per line..."
          className="bg-slate-900/50 border-slate-600 text-slate-200 min-h-[120px]"
        />
      </div>

      {isEdit && (
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={pattern.is_active ?? true}
            onChange={(e) => setEditPattern({...editPattern, is_active: e.target.checked})}
            className="rounded border-gray-300"
          />
          <Label className="text-slate-300">Active (available for detection)</Label>
        </div>
      )}
    </div>
  )

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-200 mb-2">Language Pattern Builder</h2>
        <p className="text-slate-400">
          Develop behavioral and linguistic patterns for archetype detection
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Pattern Library */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-teal-300">Current Patterns</CardTitle>
                <CardDescription className="text-slate-400">
                  {patterns.length} patterns defined
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => setIsAddArchetypeOpen(true)}
                  className="bg-teal-600 hover:bg-teal-700 text-white"
                >
                  <Crown className="mr-2 h-4 w-4" />
                  Add Archetype
                </Button>
                <Button
                  onClick={() => setIsAddPatternOpen(true)}
                  className="bg-teal-600 hover:bg-teal-700 text-white"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Pattern
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {patterns.map((pattern) => (
                <div key={pattern.id} className="p-4 bg-slate-900/50 rounded-lg border border-slate-600">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-slate-200 font-medium">{pattern.name}</h4>
                    <div className="flex items-center gap-2">
                      <span className="text-teal-300 text-sm">{(pattern.accuracy * 100).toFixed(0)}%</span>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleOpenEdit(pattern)}
                        className="border-slate-600 text-slate-300 hover:bg-slate-700"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-slate-400 text-sm mb-2">
                    Archetype: {getArchetypeName(pattern.archetype_id)} | Type: {pattern.pattern_type}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {pattern.patterns.slice(0, 5).map((keyword, idx) => (
                      <span key={idx} className="px-2 py-1 bg-slate-700 text-slate-300 rounded text-xs">
                        {keyword}
                      </span>
                    ))}
                    {pattern.patterns.length > 5 && (
                      <span className="px-2 py-1 bg-slate-700 text-slate-400 rounded text-xs">
                        +{pattern.patterns.length - 5} more
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* AI Assistant */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-orange-300">AI Pattern Assistant</CardTitle>
            <CardDescription className="text-slate-400">
              Test patterns and get AI suggestions for improvement
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-slate-300">Test Sample Text</Label>
              <Textarea
                placeholder="Enter text to analyze for archetype patterns..."
                value={testInput}
                onChange={(e) => setTestInput(e.target.value)}
                className="bg-slate-900/50 border-slate-600 text-slate-200 min-h-[120px]"
              />
            </div>
            
            <Button 
              onClick={() => setIsAnalyzing(true)}
              disabled={!testInput.trim() || isAnalyzing}
              className="w-full bg-teal-600 hover:bg-teal-700 text-white"
            >
              {isAnalyzing ? 'Analyzing...' : 'Analyze with AI'}
            </Button>

            {isAnalyzing && (
              <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                <h4 className="text-blue-300 font-medium mb-2">AI Analysis:</h4>
                <p className="text-slate-300 text-sm">
                  Analyzing language patterns... This would show detected archetypes, 
                  confidence levels, and suggestions for pattern improvement.
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Button 
                variant="outline" 
                className="w-full border-slate-600 text-slate-300 hover:bg-slate-700"
                onClick={() => setAiSuggestion('Generate new keywords for Warrior archetype')}
              >
                Generate Keywords
              </Button>
              <Button 
                variant="outline" 
                className="w-full border-slate-600 text-slate-300 hover:bg-slate-700"
                onClick={() => setAiSuggestion('Create example phrases for emotional patterns')}
              >
                Generate Phrases  
              </Button>
              <Button 
                variant="outline" 
                className="w-full border-slate-600 text-slate-300 hover:bg-slate-700"
                onClick={() => setAiSuggestion('Suggest behavioral indicators for detection')}
              >
                Generate Behaviors
              </Button>
            </div>

            {aiSuggestion && (
              <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
                <h4 className="text-green-300 font-medium mb-2">AI Suggestion:</h4>
                <p className="text-slate-300 text-sm">{aiSuggestion}</p>
                <Button size="sm" className="mt-2 bg-teal-600 hover:bg-teal-700 text-white">
                  Apply Suggestion
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add Archetype Dialog */}
      <Dialog open={isAddArchetypeOpen} onOpenChange={setIsAddArchetypeOpen}>
        <DialogContent className="max-w-2xl bg-slate-800 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-slate-200">Add New Archetype</DialogTitle>
            <DialogDescription className="text-slate-400">
              Define a new psychological archetype for pattern detection
            </DialogDescription>
          </DialogHeader>
          <ArchetypeForm archetype={newArchetype} />
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsAddArchetypeOpen(false)
                resetArchetypeForm()
              }}
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddArchetype}
              className="bg-teal-600 hover:bg-teal-700 text-white"
            >
              <Save className="mr-2 h-4 w-4" />
              Add Archetype
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Pattern Dialog */}
      <Dialog open={isAddPatternOpen} onOpenChange={setIsAddPatternOpen}>
        <DialogContent className="max-w-2xl bg-slate-800 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-slate-200">Add New Language Pattern</DialogTitle>
            <DialogDescription className="text-slate-400">
              Define linguistic patterns for archetype detection
            </DialogDescription>
          </DialogHeader>
          <PatternForm pattern={newPattern} isEdit={false} />
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsAddPatternOpen(false)
                resetNewForm()
              }}
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddPattern}
              className="bg-teal-600 hover:bg-teal-700 text-white"
            >
              <Save className="mr-2 h-4 w-4" />
              Add Pattern
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Pattern Dialog */}
      <Dialog open={isEditPatternOpen} onOpenChange={setIsEditPatternOpen}>
        <DialogContent className="max-w-2xl bg-slate-800 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-slate-200">Edit Language Pattern</DialogTitle>
            <DialogDescription className="text-slate-400">
              Modify the linguistic pattern definition
            </DialogDescription>
          </DialogHeader>
          <PatternForm pattern={editPattern} isEdit={true} />
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsEditPatternOpen(false)
                setEditPattern({})
              }}
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              Cancel
            </Button>
            <Button
              onClick={handleEditPattern}
              className="bg-teal-600 hover:bg-teal-700 text-white"
            >
              <Save className="mr-2 h-4 w-4" />
              Update Pattern
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Coming Soon Features */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-slate-200">Advanced Features (Coming Soon)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4 text-center">
            <div className="p-4">
              <div className="text-2xl mb-2">🧠</div>
              <h4 className="text-slate-300 font-medium">Pattern Testing</h4>
              <p className="text-slate-400 text-sm">Validate pattern accuracy with real data</p>
            </div>
            <div className="p-4">
              <div className="text-2xl mb-2">🔄</div>
              <h4 className="text-slate-300 font-medium">Context Adaptation</h4>
              <p className="text-slate-400 text-sm">Different patterns for different quiz contexts</p>
            </div>
            <div className="p-4">
              <div className="text-2xl mb-2">📊</div>
              <h4 className="text-slate-300 font-medium">Performance Analytics</h4>
              <p className="text-slate-400 text-sm">Track which patterns work best</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 