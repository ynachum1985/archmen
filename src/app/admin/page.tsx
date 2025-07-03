"use client"

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Console</h1>
          <p className="text-gray-600">Develop assessments, archetypes, and content</p>
        </div>

        <Tabs defaultValue="assessments" className="space-y-6">
          <TabsList className="bg-gray-100">
            <TabsTrigger value="assessments">Assessments</TabsTrigger>
            <TabsTrigger value="content">Archetype Content</TabsTrigger>
            <TabsTrigger value="linguistics">Archetype Linguistics</TabsTrigger>
            <TabsTrigger value="ai-assistant">AI Assistant</TabsTrigger>
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
  const assessments = [
    { id: 1, name: 'Dating Patterns', questions: 12, active: true },
    { id: 2, name: 'Marriage Dynamics', questions: 18, active: true },
    { id: 3, name: 'Conflict Resolution', questions: 15, active: false },
    { id: 4, name: 'Shadow Work', questions: 8, active: true }
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Assessments</h2>
        <Button className="bg-blue-600 hover:bg-blue-700">
          Create Assessment
        </Button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {assessments.map((assessment) => (
          <Card key={assessment.id} className="border border-gray-200 hover:border-gray-300 cursor-pointer">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg text-gray-900">{assessment.name}</CardTitle>
                <span className={`px-2 py-1 text-xs rounded ${
                  assessment.active ? 'bg-gray-100 text-gray-700' : 'bg-gray-100 text-gray-500'
                }`}>
                  {assessment.active ? 'Active' : 'Draft'}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-3">{assessment.questions} questions</p>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="text-xs">
                  Edit Questions
                </Button>
                <Button size="sm" variant="outline" className="text-xs">
                  Test AI
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

function ArchetypeContent() {
  const [sortBy, setSortBy] = useState('name')
  const [filterBy, setFilterBy] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  const allArchetypes = [
    { name: 'The Advice Giver', category: 'Counselor', impact: 3, description: 'Offers guidance and solutions, sometimes unsolicited' },
    { name: 'The Advocate', category: 'Guardian', impact: 2, description: 'Protective, stands up for others and causes' },
    { name: 'The Alpha Male', category: 'Guardian', impact: 4, description: 'Dominant, leadership-focused, territorial' },
    { name: 'The Avoidant', category: 'Avoidant', impact: 5, description: 'Emotionally distant, avoids intimacy and conflict' },
    { name: 'The Bad Boy', category: 'Renegade', impact: 5, description: 'Rebellious, exciting, unpredictable, often unreliable' },
    // ... I'll add just a few examples for brevity, but in the real implementation all 52+ archetypes would be here
  ]

  const filteredArchetypes = allArchetypes
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
      if (sortBy === 'impact') return a.impact - b.impact
      return 0
    })

  const categories = [...new Set(allArchetypes.map(a => a.category))].sort()

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Archetype Content</h2>
        <Button className="bg-teal-600 hover:bg-teal-700">
          Add Archetype
        </Button>
      </div>

      <div className="flex gap-4 items-center">
        <input
          type="text"
          placeholder="Search archetypes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm"
        />
        <select
          value={filterBy}
          onChange={(e) => setFilterBy(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm"
        >
          <option value="all">All Categories</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm"
        >
          <option value="name">Sort by Name</option>
          <option value="category">Sort by Category</option>
          <option value="impact">Sort by Impact</option>
        </select>
      </div>

      <div className="space-y-1">
        {filteredArchetypes.map((archetype, index) => (
          <div key={index} className="flex items-center justify-between p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer">
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h3 className="font-medium text-gray-900">{archetype.name}</h3>
                <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                  {archetype.category}
                </span>
                <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                  {archetype.impact}/7
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-1">{archetype.description}</p>
            </div>
          </div>
        ))}
      </div>

      <p className="text-sm text-gray-500">{filteredArchetypes.length} of {allArchetypes.length} archetypes</p>
    </div>
  )
}

function ArchetypeLinguistics() {
  const [sortBy, setSortBy] = useState('name')
  const [filterBy, setFilterBy] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  const allPatterns = [
    { 
      name: 'The Advice Giver', 
      category: 'Counselor', 
      keywords: ['advice', 'should', 'suggest', 'recommend'], 
      phrases: ['you should', 'I recommend', 'let me suggest'], 
      emotional: ['helpful', 'guidance'], 
      behavioral: ['offers solutions', 'gives direction'] 
    },
    // ... more patterns would be here
  ]

  const filteredPatterns = allPatterns
    .filter(pattern => {
      if (filterBy === 'all') return true
      return pattern.category === filterBy
    })
    .filter(pattern =>
      pattern.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pattern.keywords.some(keyword => keyword.toLowerCase().includes(searchTerm.toLowerCase()))
    )

  const categories = [...new Set(allPatterns.map(p => p.category))].sort()

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Archetype Linguistics</h2>
        <Button className="bg-teal-600 hover:bg-teal-700">
          Add Pattern
        </Button>
      </div>

      <div className="flex gap-4 items-center">
        <input
          type="text"
          placeholder="Search patterns..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm"
        />
        <select
          value={filterBy}
          onChange={(e) => setFilterBy(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm"
        >
          <option value="all">All Categories</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      <div className="space-y-1">
        {filteredPatterns.map((pattern, index) => (
          <div key={index} className="p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="font-medium text-gray-900">{pattern.name}</h3>
              <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                {pattern.category}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-sm">
              <div>
                <span className="font-medium text-gray-600">Keywords:</span>
                <p className="text-gray-600">{pattern.keywords.slice(0, 3).join(', ')}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Phrases:</span>
                <p className="text-gray-600">{pattern.phrases.slice(0, 2).join(', ')}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Emotions:</span>
                <p className="text-gray-600">{pattern.emotional.join(', ')}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Behaviors:</span>
                <p className="text-gray-600">{pattern.behavioral.slice(0, 2).join(', ')}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <p className="text-sm text-gray-500">{filteredPatterns.length} of {allPatterns.length} patterns</p>
    </div>
  )
}

function AIAssistant() {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">AI Development Assistant</h2>

      <Card className="border border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg text-gray-900">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-4">
          <Button variant="outline" className="h-16 flex flex-col">
            <span className="font-medium">Generate Questions</span>
            <span className="text-xs text-gray-500">Create assessment scenarios</span>
          </Button>
          <Button variant="outline" className="h-16 flex flex-col">
            <span className="font-medium">Test Language Analysis</span>
            <span className="text-xs text-gray-500">Check archetype detection</span>
          </Button>
          <Button variant="outline" className="h-16 flex flex-col">
            <span className="font-medium">Expand Archetypes</span>
            <span className="text-xs text-gray-500">Add new archetype definitions</span>
          </Button>
          <Button variant="outline" className="h-16 flex flex-col">
            <span className="font-medium">Improve Detection</span>
            <span className="text-xs text-gray-500">Refine language patterns</span>
          </Button>
        </CardContent>
      </Card>

      <Card className="border border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg text-gray-900">How It Works</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-2xl mb-2">1️⃣</div>
              <h4 className="font-medium text-gray-900 mb-1">Create Assessment</h4>
              <p className="text-sm text-gray-600">Theme-based question sets</p>
            </div>
            <div>
              <div className="text-2xl mb-2">2️⃣</div>
              <h4 className="font-medium text-gray-900 mb-1">Define Archetypes</h4>
              <p className="text-sm text-gray-600">Language patterns for detection</p>
            </div>
            <div>
              <div className="text-2xl mb-2">3️⃣</div>
              <h4 className="font-medium text-gray-900 mb-1">AI Analysis</h4>
              <p className="text-sm text-gray-600">Automatic pattern matching</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 