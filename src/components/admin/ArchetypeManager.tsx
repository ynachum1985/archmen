"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  Brain, 
  Plus, 
  Edit, 
  Trash2, 
  Save,
  Eye,
  Users,
  TrendingUp,
  BookOpen,
  Heart,
  Shield,
  Lightbulb,
  Crown,
  Compass,
  Sword,
  Globe
} from 'lucide-react'
import { useSupabase } from '@/lib/hooks/useSupabase'
import { EnhancedArchetypeRepository } from '@/lib/repositories/enhanced-archetype.repository'
import { AdvancedArchetypeDefinition } from '@/lib/types/archetype-system'

export function ArchetypeManager() {
  const { supabase } = useSupabase()
  const [archetypes, setArchetypes] = useState<AdvancedArchetypeDefinition[]>([])
  const [selectedArchetype, setSelectedArchetype] = useState<AdvancedArchetypeDefinition | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [isLoading, setIsLoading] = useState(true)

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

  const [editArchetype, setEditArchetype] = useState<Partial<AdvancedArchetypeDefinition>>({})

  useEffect(() => {
    loadArchetypes()
  }, [])

  const loadArchetypes = async () => {
    try {
      const repository = new EnhancedArchetypeRepository(supabase)
      const data = await repository.getArchetypeDefinitions(false)
      setArchetypes(data)
    } catch (error) {
      console.error('Error loading archetypes:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'primary': return <Crown className="h-4 w-4" />
      case 'shadow': return <Eye className="h-4 w-4" />
      case 'anima_animus': return <Heart className="h-4 w-4" />
      case 'collective': return <Globe className="h-4 w-4" />
      default: return <Brain className="h-4 w-4" />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'primary': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'shadow': return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'anima_animus': return 'bg-pink-100 text-pink-800 border-pink-200'
      case 'collective': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const handleCreateArchetype = async () => {
    if (!newArchetype.name || !newArchetype.description) {
      alert('Please fill in all required fields');
      return;
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
      setIsCreateDialogOpen(false)
      resetForm()
    } catch (error) {
      console.error('Error creating archetype:', error)
      alert('Failed to create archetype. Please try again.')
    }
  }

  const handleEditArchetype = async () => {
    if (!editArchetype.id || !editArchetype.name || !editArchetype.description) {
      alert('Please fill in all required fields');
      return;
    }
    
    try {
      const repository = new EnhancedArchetypeRepository(supabase)
      const updated = await repository.updateArchetypeDefinition(editArchetype.id, {
        name: editArchetype.name,
        category: editArchetype.category,
        description: editArchetype.description,
        traits: editArchetype.traits,
        psychologyProfile: editArchetype.psychologyProfile,
        isActive: editArchetype.isActive
      })
      
      await loadArchetypes()
      setIsEditDialogOpen(false)
      setEditArchetype({})
    } catch (error) {
      console.error('Error updating archetype:', error)
      alert('Failed to update archetype. Please try again.')
    }
  }

  const handleOpenEdit = (archetype: AdvancedArchetypeDefinition) => {
    setEditArchetype({
      id: archetype.id,
      name: archetype.name,
      category: archetype.category,
      description: archetype.description,
      traits: archetype.traits,
      psychologyProfile: archetype.psychologyProfile,
      isActive: archetype.isActive
    })
    setIsEditDialogOpen(true)
  }

  const resetForm = () => {
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

  const handleTraitsChange = (type: keyof AdvancedArchetypeDefinition['traits'], value: string, isEdit = false) => {
    const traits = value.split('\n').filter(t => t.trim())
    if (isEdit) {
      setEditArchetype({
        ...editArchetype,
        traits: {
          ...editArchetype.traits!,
          [type]: traits
        }
      })
    } else {
      setNewArchetype({
        ...newArchetype,
        traits: {
          ...newArchetype.traits!,
          [type]: traits
        }
      })
    }
  }

  const handlePsychologyChange = (type: keyof AdvancedArchetypeDefinition['psychologyProfile'], value: string, isEdit = false) => {
    const items = value.split('\n').filter(t => t.trim())
    if (isEdit) {
      setEditArchetype({
        ...editArchetype,
        psychologyProfile: {
          ...editArchetype.psychologyProfile!,
          [type]: items
        }
      })
    } else {
      setNewArchetype({
        ...newArchetype,
        psychologyProfile: {
          ...newArchetype.psychologyProfile!,
          [type]: items
        }
      })
    }
  }

  const ArchetypeForm = ({ archetype, isEdit, onTraitsChange, onPsychologyChange }: {
    archetype: Partial<AdvancedArchetypeDefinition>,
    isEdit: boolean,
    onTraitsChange: (type: keyof AdvancedArchetypeDefinition['traits'], value: string, isEdit?: boolean) => void,
    onPsychologyChange: (type: keyof AdvancedArchetypeDefinition['psychologyProfile'], value: string, isEdit?: boolean) => void
  }) => (
    <div className="grid gap-6 py-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-slate-300">Archetype Name</Label>
          <Input
            id="name"
            value={archetype.name || ''}
            onChange={(e) => isEdit 
              ? setEditArchetype({...editArchetype, name: e.target.value})
              : setNewArchetype({...newArchetype, name: e.target.value})
            }
            placeholder="e.g., The Explorer"
            className="bg-slate-900/50 border-slate-600 text-slate-200"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="category" className="text-slate-300">Category</Label>
          <Select 
            value={archetype.category || 'primary'} 
            onValueChange={(value) => isEdit
              ? setEditArchetype({...editArchetype, category: value as AdvancedArchetypeDefinition['category']})
              : setNewArchetype({...newArchetype, category: value as AdvancedArchetypeDefinition['category']})
            }
          >
            <SelectTrigger className="bg-slate-900/50 border-slate-600 text-slate-200">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              <SelectItem value="primary" className="text-slate-200 hover:bg-slate-700">Primary Archetype</SelectItem>
              <SelectItem value="shadow" className="text-slate-200 hover:bg-slate-700">Shadow Archetype</SelectItem>
              <SelectItem value="anima_animus" className="text-slate-200 hover:bg-slate-700">Anima/Animus</SelectItem>
              <SelectItem value="collective" className="text-slate-200 hover:bg-slate-700">Collective</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="description" className="text-slate-300">Description</Label>
        <Textarea
          id="description"
          value={archetype.description || ''}
          onChange={(e) => isEdit
            ? setEditArchetype({...editArchetype, description: e.target.value})
            : setNewArchetype({...newArchetype, description: e.target.value})
          }
          placeholder="Describe the core essence and purpose of this archetype..."
          className="min-h-[80px] bg-slate-900/50 border-slate-600 text-slate-200"
        />
      </div>

      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-slate-200">Core Traits</h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-slate-300">Core Characteristics</Label>
            <Textarea
              placeholder="Enter core traits (one per line)"
              className="min-h-[80px] bg-slate-900/50 border-slate-600 text-slate-200"
              value={archetype.traits?.core.join('\n') || ''}
              onChange={(e) => onTraitsChange('core', e.target.value, isEdit)}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-slate-300">Shadow Aspects</Label>
            <Textarea
              placeholder="Enter shadow traits (one per line)"
              className="min-h-[80px] bg-slate-900/50 border-slate-600 text-slate-200"
              value={archetype.traits?.shadow.join('\n') || ''}
              onChange={(e) => onTraitsChange('shadow', e.target.value, isEdit)}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-slate-300">Triggers</Label>
            <Textarea
              placeholder="Enter triggers (one per line)"
              className="min-h-[80px] bg-slate-900/50 border-slate-600 text-slate-200"
              value={archetype.traits?.triggers.join('\n') || ''}
              onChange={(e) => onTraitsChange('triggers', e.target.value, isEdit)}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-slate-300">Conflicts</Label>
            <Textarea
              placeholder="Enter conflicts (one per line)"
              className="min-h-[80px] bg-slate-900/50 border-slate-600 text-slate-200"
              value={archetype.traits?.conflicts.join('\n') || ''}
              onChange={(e) => onTraitsChange('conflicts', e.target.value, isEdit)}
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-slate-200">Psychology Profile</h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-slate-300">Motivations</Label>
            <Textarea
              placeholder="Enter motivations (one per line)"
              className="min-h-[80px] bg-slate-900/50 border-slate-600 text-slate-200"
              value={archetype.psychologyProfile?.motivations.join('\n') || ''}
              onChange={(e) => onPsychologyChange('motivations', e.target.value, isEdit)}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-slate-300">Fears</Label>
            <Textarea
              placeholder="Enter fears (one per line)"
              className="min-h-[80px] bg-slate-900/50 border-slate-600 text-slate-200"
              value={archetype.psychologyProfile?.fears.join('\n') || ''}
              onChange={(e) => onPsychologyChange('fears', e.target.value, isEdit)}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-slate-300">Desires</Label>
            <Textarea
              placeholder="Enter desires (one per line)"
              className="min-h-[80px] bg-slate-900/50 border-slate-600 text-slate-200"
              value={archetype.psychologyProfile?.desires.join('\n') || ''}
              onChange={(e) => onPsychologyChange('desires', e.target.value, isEdit)}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-slate-300">Behaviors</Label>
            <Textarea
              placeholder="Enter behaviors (one per line)"
              className="min-h-[80px] bg-slate-900/50 border-slate-600 text-slate-200"
              value={archetype.psychologyProfile?.behaviors.join('\n') || ''}
              onChange={(e) => onPsychologyChange('behaviors', e.target.value, isEdit)}
            />
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          checked={archetype.isActive ?? true}
          onChange={(e) => isEdit
            ? setEditArchetype({...editArchetype, isActive: e.target.checked})
            : setNewArchetype({...newArchetype, isActive: e.target.checked})
          }
          className="rounded border-gray-300"
        />
        <Label className="text-slate-300">Active (available for analysis)</Label>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Archetype Manager</h1>
          <p className="text-muted-foreground mt-1">
            Define and manage psychological archetypes for analysis
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-teal-600 hover:bg-teal-700 text-white">
              <Plus className="mr-2 h-4 w-4" />
              Create Archetype
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-800 border-slate-700">
            <DialogHeader>
              <DialogTitle className="text-slate-200">Create New Archetype</DialogTitle>
              <DialogDescription className="text-slate-400">
                Define a new psychological archetype for relationship analysis
              </DialogDescription>
            </DialogHeader>
            <ArchetypeForm 
              archetype={newArchetype}
              isEdit={false}
              onTraitsChange={handleTraitsChange}
              onPsychologyChange={handlePsychologyChange}
            />
            <div className="flex justify-end space-x-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsCreateDialogOpen(false)
                  resetForm()
                }}
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleCreateArchetype}
                className="bg-teal-600 hover:bg-teal-700 text-white"
              >
                <Save className="mr-2 h-4 w-4" />
                Create Archetype
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-800 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-slate-200">Edit Archetype</DialogTitle>
            <DialogDescription className="text-slate-400">
              Modify the archetype definition and properties
            </DialogDescription>
          </DialogHeader>
          <ArchetypeForm 
            archetype={editArchetype}
            isEdit={true}
            onTraitsChange={handleTraitsChange}
            onPsychologyChange={handlePsychologyChange}
          />
          <div className="flex justify-end space-x-2">
            <Button 
              variant="outline" 
              onClick={() => {
                setIsEditDialogOpen(false)
                setEditArchetype({})
              }}
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleEditArchetype}
              className="bg-teal-600 hover:bg-teal-700 text-white"
            >
              <Save className="mr-2 h-4 w-4" />
              Update Archetype
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Archetypes</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{archetypes.length}</div>
            <p className="text-xs text-muted-foreground">
              {archetypes.filter(a => a.isActive).length} active
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Usage</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {archetypes.length * 10}
            </div>
            <p className="text-xs text-muted-foreground">
              Analysis sessions
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Satisfaction</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              4.5
            </div>
            <p className="text-xs text-muted-foreground">
              Out of 5.0 stars
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4</div>
            <p className="text-xs text-muted-foreground">
              Archetype categories
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="primary">Primary</TabsTrigger>
          <TabsTrigger value="shadow">Shadow</TabsTrigger>
          <TabsTrigger value="research">Research</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {isLoading ? (
              <div className="col-span-full text-center py-12">
                <p className="text-muted-foreground">Loading archetypes...</p>
              </div>
            ) : archetypes.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <p className="text-muted-foreground">No archetypes created yet. Click "Create Archetype" to get started.</p>
              </div>
            ) : (
              archetypes.map((archetype) => (
                <Card key={archetype.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        {getCategoryIcon(archetype.category)}
                        {archetype.name}
                      </CardTitle>
                      <Badge className={getCategoryColor(archetype.category)}>
                        {archetype.category.replace('_', '/')}
                      </Badge>
                    </div>
                    <CardDescription className="line-clamp-2">
                      {archetype.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Usage:</span>
                        <span className="font-medium">0 sessions</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Rating:</span>
                        <span className="font-medium">0/5.0</span>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700"
                          onClick={() => handleOpenEdit(archetype)}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700"
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="primary">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Primary Archetypes</CardTitle>
                  <CardDescription>
                    Core personality patterns and motivational forces
                  </CardDescription>
                </div>
                <Button 
                  onClick={() => setIsCreateDialogOpen(true)}
                  className="bg-teal-600 hover:bg-teal-700 text-white"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Primary
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {archetypes.filter(a => a.category === 'primary').map((archetype) => (
                  <Card key={archetype.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <Crown className="h-5 w-5 text-blue-600" />
                            {archetype.name}
                          </CardTitle>
                          <CardDescription>{archetype.description}</CardDescription>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleOpenEdit(archetype)}
                          className="border-slate-600 text-slate-300 hover:bg-slate-700"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div>
                          <h4 className="text-sm font-semibold text-green-700">Core Traits</h4>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {archetype.traits.core.slice(0, 3).map((trait, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {trait}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-red-700">Shadow Aspects</h4>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {archetype.traits.shadow.slice(0, 3).map((trait, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {trait}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="shadow">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Shadow Work</CardTitle>
                  <CardDescription>
                    Explore the hidden and repressed aspects of personality
                  </CardDescription>
                </div>
                <Button 
                  onClick={() => setIsCreateDialogOpen(true)}
                  className="bg-teal-600 hover:bg-teal-700 text-white"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Shadow
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {archetypes.filter(a => a.category === 'shadow').map((archetype) => (
                  <Card key={archetype.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <Eye className="h-5 w-5 text-gray-600" />
                            {archetype.name}
                          </CardTitle>
                          <CardDescription>{archetype.description}</CardDescription>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleOpenEdit(archetype)}
                          className="border-slate-600 text-slate-300 hover:bg-slate-700"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div>
                          <h4 className="text-sm font-semibold text-green-700">Core Traits</h4>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {archetype.traits.core.slice(0, 3).map((trait, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {trait}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              {archetypes.filter(a => a.category === 'shadow').length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No shadow archetypes created yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="research">
          <Card>
            <CardHeader>
              <CardTitle>Research Hub</CardTitle>
              <CardDescription>
                Academic research and archetype development
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Research projects and insights coming soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 