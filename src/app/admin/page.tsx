"use client"

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AddArchetypeDialog } from "@/components/admin/AddArchetypeDialog"
import { AddPatternDialog } from "@/components/admin/AddPatternDialog"
import { CreateAssessmentDialog } from "@/components/admin/CreateAssessmentDialog"
import { archetypeService } from '@/lib/services/archetype.service'
import { assessmentService } from '@/lib/services/assessment.service'
import type { Database } from '@/lib/types/database'

type Archetype = Database['public']['Tables']['enhanced_archetypes']['Row']
type LinguisticPattern = Database['public']['Tables']['linguistic_patterns']['Row']
type AssessmentTemplate = Database['public']['Tables']['assessment_templates']['Row']

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Admin Console</h1>
          <p className="text-gray-400">Develop assessments, archetypes, and content</p>
        </div>

        <Tabs defaultValue="assessments" className="space-y-6">
          <TabsList className="bg-slate-800 border-slate-700">
            <TabsTrigger value="assessments" className="text-white data-[state=active]:bg-slate-700">Assessments</TabsTrigger>
            <TabsTrigger value="content" className="text-white data-[state=active]:bg-slate-700">Archetype Content</TabsTrigger>
            <TabsTrigger value="linguistics" className="text-white data-[state=active]:bg-slate-700">Archetype Linguistics</TabsTrigger>
            <TabsTrigger value="ai-assistant" className="text-white data-[state=active]:bg-slate-700">AI Assistant</TabsTrigger>
          </TabsList>

          <TabsContent value="assessments">
            <AssessmentDashboard />
          </TabsContent>

          <TabsContent value="content">
            <ArchetypeContent />
          </TabsContent>

          <TabsContent value="linguistics">
            <ArchetypeLinguistics />
          </TabsContent>

          <TabsContent value="ai-assistant">
            <AIAssistant />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

function AssessmentDashboard() {
  const router = useRouter()
  const [assessments, setAssessments] = useState<AssessmentTemplate[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadAssessments()
  }, [])

  const loadAssessments = async () => {
    try {
      setIsLoading(true)
      const data = await assessmentService.getAllTemplates()
      setAssessments(data)
    } catch (error) {
      console.error('Error loading assessments:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAssessmentCreated = () => {
    loadAssessments()
  }

  const handleEditAssessment = (assessmentId: string) => {
    router.push(`/admin/assessment/${assessmentId}`)
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-white">Assessments</h2>
        </div>
        <div className="text-center text-gray-400 py-8">Loading assessments...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-white">Assessments</h2>
        <CreateAssessmentDialog onAssessmentCreated={handleAssessmentCreated} />
      </div>

      {assessments.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">No assessments created yet</div>
          <CreateAssessmentDialog 
            onAssessmentCreated={handleAssessmentCreated}
            trigger={
              <Button variant="outline" className="border-slate-600 text-white hover:bg-slate-700">
                Create Your First Assessment
              </Button>
            }
          />
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {assessments.map((assessment) => (
            <AssessmentCard 
              key={assessment.id} 
              assessment={assessment} 
              onEdit={() => handleEditAssessment(assessment.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function AssessmentCard({ assessment, onEdit }: { assessment: AssessmentTemplate; onEdit: () => void }) {
  const [stats, setStats] = useState<{
    questionCount: number
    responseCount: number
    sessionCount: number
    completionRate: number
  } | null>(null)

  const loadStats = useCallback(async () => {
    try {
      const data = await assessmentService.getTemplateStats(assessment.id)
      setStats(data)
    } catch (error) {
      console.error('Error loading assessment stats:', error)
    }
  }, [assessment.id])

  useEffect(() => {
    loadStats()
  }, [loadStats])

  return (
    <Card className="bg-slate-800 border-slate-700 hover:border-slate-600 cursor-pointer">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg text-white">{assessment.name}</CardTitle>
          <span className={`px-2 py-1 text-xs rounded ${
            assessment.is_active ? 'bg-teal-600 text-white' : 'bg-slate-600 text-gray-300'
          }`}>
            {assessment.is_active ? 'Active' : 'Draft'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 text-xs rounded ${
            assessment.is_free ? 'bg-green-600 text-white' : 'bg-blue-600 text-white'
          }`}>
            {assessment.is_free ? 'Free' : 'Paid'}
          </span>
          <span className="text-xs text-gray-400">{assessment.category}</span>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-400 mb-3">
          {stats ? `${stats.questionCount} questions` : 'Loading...'}
        </p>
        {assessment.description && (
          <p className="text-xs text-gray-500 mb-3 line-clamp-2">{assessment.description}</p>
        )}
        <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
          <div className="text-gray-400">
            Sessions: <span className="text-white">{stats?.sessionCount || 0}</span>
          </div>
          <div className="text-gray-400">
            Completion: <span className="text-white">{stats?.completionRate || 0}%</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            size="sm" 
            variant="outline" 
            className="text-xs border-slate-600 text-white hover:bg-slate-700"
            onClick={onEdit}
          >
            Edit Questions
          </Button>
          <Button size="sm" variant="outline" className="text-xs border-slate-600 text-white hover:bg-slate-700">
            Test AI
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function ArchetypeContent() {
  const [archetypes, setArchetypes] = useState<Archetype[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [sortBy, setSortBy] = useState('name')
  const [filterBy, setFilterBy] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [showAddDialog, setShowAddDialog] = useState(false)

  useEffect(() => {
    loadArchetypes()
    loadCategories()
  }, [])

  const loadArchetypes = async () => {
    try {
      setIsLoading(true)
      const data = await archetypeService.getAllArchetypes()
      setArchetypes(data)
    } catch (error) {
      console.error('Error loading archetypes:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadCategories = async () => {
    try {
      const data = await archetypeService.getArchetypeCategories()
      setCategories(data)
    } catch (error) {
      console.error('Error loading categories:', error)
    }
  }

  const filteredArchetypes = archetypes
    .filter(archetype => {
      if (filterBy === 'all') return true
      return archetype.category === filterBy
    })
    .filter(archetype =>
      archetype.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      archetype.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name)
      if (sortBy === 'category') return a.category.localeCompare(b.category)
      if (sortBy === 'impact') return a.impact_score - b.impact_score
      return 0
    })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-white">Archetype Content</h2>
        <Button 
          onClick={() => setShowAddDialog(true)}
          className="bg-teal-600 hover:bg-teal-700 text-white"
        >
          Add Archetype
        </Button>
      </div>

      <div className="flex gap-4 items-center">
        <Input
          type="text"
          placeholder="Search archetypes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-slate-800 border-slate-600 text-white placeholder-gray-400"
        />
        <Select value={filterBy} onValueChange={setFilterBy}>
          <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-600">
            <SelectItem value="all" className="text-white hover:bg-slate-700">All Categories</SelectItem>
            {categories.map(cat => (
              <SelectItem key={cat} value={cat} className="text-white hover:bg-slate-700">{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-600">
            <SelectItem value="name" className="text-white hover:bg-slate-700">Sort by Name</SelectItem>
            <SelectItem value="category" className="text-white hover:bg-slate-700">Sort by Category</SelectItem>
            <SelectItem value="impact" className="text-white hover:bg-slate-700">Sort by Impact</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="text-center text-gray-400 py-8">Loading archetypes...</div>
      ) : (
        <>
          <div className="space-y-1">
            {filteredArchetypes.map((archetype) => (
              <div key={archetype.id} className="flex items-center justify-between p-3 border-b border-slate-700 hover:bg-slate-800 cursor-pointer">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-medium text-white">{archetype.name}</h3>
                    <span className="px-2 py-1 text-xs bg-slate-700 text-gray-300 rounded">
                      {archetype.category}
                    </span>
                    <span className="px-2 py-1 text-xs bg-slate-700 text-gray-300 rounded">
                      {archetype.impact_score}/7
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 mt-1">{archetype.description}</p>
                </div>
              </div>
            ))}
          </div>

          <p className="text-sm text-gray-500">{filteredArchetypes.length} of {archetypes.length} archetypes</p>
        </>
      )}

      <AddArchetypeDialog 
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onArchetypeAdded={loadArchetypes}
      />
    </div>
  )
}

function ArchetypeLinguistics() {
  const [patterns, setPatterns] = useState<LinguisticPattern[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [sortBy, setSortBy] = useState('name')
  const [filterBy, setFilterBy] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [showAddDialog, setShowAddDialog] = useState(false)

  useEffect(() => {
    loadPatterns()
    loadCategories()
  }, [])

  const loadPatterns = async () => {
    try {
      setIsLoading(true)
      const data = await archetypeService.getAllLinguisticPatterns()
      setPatterns(data)
    } catch (error) {
      console.error('Error loading patterns:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadCategories = async () => {
    try {
      const data = await archetypeService.getArchetypeCategories()
      setCategories(data)
    } catch (error) {
      console.error('Error loading categories:', error)
    }
  }

  const filteredPatterns = patterns
    .filter(pattern => {
      if (filterBy === 'all') return true
      return pattern.category === filterBy
    })
    .filter(pattern =>
      pattern.archetype_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (pattern.keywords && pattern.keywords.some((keyword: string) => keyword.toLowerCase().includes(searchTerm.toLowerCase())))
    )
    .sort((a, b) => {
      if (sortBy === 'name') return a.archetype_name.localeCompare(b.archetype_name)
      if (sortBy === 'category') return a.category.localeCompare(b.category)
      return 0
    })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-white">Archetype Linguistics</h2>
        <Button 
          onClick={() => setShowAddDialog(true)}
          className="bg-teal-600 hover:bg-teal-700 text-white"
        >
          Add Pattern
        </Button>
      </div>

      <div className="flex gap-4 items-center">
        <Input
          type="text"
          placeholder="Search patterns..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-slate-800 border-slate-600 text-white placeholder-gray-400"
        />
        <Select value={filterBy} onValueChange={setFilterBy}>
          <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-600">
            <SelectItem value="all" className="text-white hover:bg-slate-700">All Categories</SelectItem>
            {categories.map(cat => (
              <SelectItem key={cat} value={cat} className="text-white hover:bg-slate-700">{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-600">
            <SelectItem value="name" className="text-white hover:bg-slate-700">Sort by Name</SelectItem>
            <SelectItem value="category" className="text-white hover:bg-slate-700">Sort by Category</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="text-center text-gray-400 py-8">Loading patterns...</div>
      ) : (
        <>
          <div className="space-y-1">
            {filteredPatterns.map((pattern) => (
              <div key={pattern.id} className="p-3 border-b border-slate-700 hover:bg-slate-800 cursor-pointer">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-medium text-white">{pattern.archetype_name}</h3>
                  <span className="px-2 py-1 text-xs bg-slate-700 text-gray-300 rounded">
                    {pattern.category}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-sm">
                  <div>
                    <span className="font-medium text-gray-400">Keywords:</span>
                    <p className="text-gray-300">{pattern.keywords?.slice(0, 3).join(', ') || 'None'}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-400">Phrases:</span>
                    <p className="text-gray-300">{pattern.phrases?.slice(0, 2).join(', ') || 'None'}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-400">Emotions:</span>
                    <p className="text-gray-300">{pattern.emotional_indicators?.join(', ') || 'None'}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-400">Behaviors:</span>
                    <p className="text-gray-300">{pattern.behavioral_patterns?.slice(0, 2).join(', ') || 'None'}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <p className="text-sm text-gray-500">{filteredPatterns.length} of {patterns.length} patterns</p>
        </>
      )}

      <AddPatternDialog 
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onPatternAdded={loadPatterns}
      />
    </div>
  )
}

function AIAssistant() {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-white">AI Development Assistant</h2>

      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-lg text-white">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-4">
          <Button variant="outline" className="h-16 flex flex-col border-slate-600 text-white hover:bg-slate-700">
            <span className="font-medium">Generate Questions</span>
            <span className="text-xs text-gray-400">Create assessment scenarios</span>
          </Button>
          <Button variant="outline" className="h-16 flex flex-col border-slate-600 text-white hover:bg-slate-700">
            <span className="font-medium">Test Language Analysis</span>
            <span className="text-xs text-gray-400">Check archetype detection</span>
          </Button>
          <Button variant="outline" className="h-16 flex flex-col border-slate-600 text-white hover:bg-slate-700">
            <span className="font-medium">Expand Archetypes</span>
            <span className="text-xs text-gray-400">Add new archetype definitions</span>
          </Button>
          <Button variant="outline" className="h-16 flex flex-col border-slate-600 text-white hover:bg-slate-700">
            <span className="font-medium">Improve Detection</span>
            <span className="text-xs text-gray-400">Refine language patterns</span>
          </Button>
        </CardContent>
      </Card>

      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-lg text-white">How It Works</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-2xl mb-2">1️⃣</div>
              <h4 className="font-medium text-white mb-1">Create Assessment</h4>
              <p className="text-sm text-gray-400">Theme-based question sets</p>
            </div>
            <div>
              <div className="text-2xl mb-2">2️⃣</div>
              <h4 className="font-medium text-white mb-1">Define Archetypes</h4>
              <p className="text-sm text-gray-400">Language patterns for detection</p>
            </div>
            <div>
              <div className="text-2xl mb-2">3️⃣</div>
              <h4 className="font-medium text-white mb-1">AI Analysis</h4>
              <p className="text-sm text-gray-400">Automatic pattern matching</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-lg text-white">About &quot;Prompt Library&quot;</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-300 mb-3">
            The &quot;Prompt Library&quot; contains instructions that tell the AI how to analyze user responses.
            It&apos;s separate from assessment questions.
          </p>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <h5 className="font-medium text-white mb-1">Assessment Questions</h5>
              <p className="text-gray-400">What users see: &quot;Your partner&apos;s ex wants to meet for coffee...&quot;</p>
            </div>
            <div>
              <h5 className="font-medium text-white mb-1">AI Prompts</h5>
              <p className="text-gray-400">Instructions to AI: &quot;Analyze response for Warrior patterns...&quot;</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 