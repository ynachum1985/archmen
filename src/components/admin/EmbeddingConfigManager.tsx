'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'

import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Settings, TestTube, BarChart3, Play, Download } from 'lucide-react'

interface ChunkingConfig {
  chunk_size: number
  chunk_overlap: number
  split_by: 'paragraph' | 'sentence' | 'token' | 'semantic'
  metadata: {
    include: string[]
  }
  update_strategy: 're-embed-all' | 're-embed-updated' | 'incremental'
  store_text: boolean
  min_chunk_size: number
  max_chunk_size: number
}

interface TestConfig {
  name: string
  chunk_size: number
  chunk_overlap: number
  split_by: string
  test_queries: string[]
  sample_content: string
}

interface TestResult {
  config_name: string
  score: number
  avg_relevance?: number
  avg_time?: number
  queries?: Array<{
    query: string
    relevance_score: number
    retrieval_time: number
    top_chunks: Array<{
      content: string
      score: number
    }>
  }>
}

export function EmbeddingConfigManager() {
  const [config, setConfig] = useState<ChunkingConfig>({
    chunk_size: 400,
    chunk_overlap: 50,
    split_by: 'paragraph',
    metadata: {
      include: ['source', 'section', 'page_number', 'created_at']
    },
    update_strategy: 're-embed-updated',
    store_text: true,
    min_chunk_size: 100,
    max_chunk_size: 1000
  })

  const testConfigs: TestConfig[] = [
    {
      name: 'Small Chunks',
      chunk_size: 200,
      chunk_overlap: 25,
      split_by: 'sentence',
      test_queries: ['What is attachment theory?', 'How do archetypes affect relationships?'],
      sample_content: ''
    },
    {
      name: 'Medium Chunks',
      chunk_size: 400,
      chunk_overlap: 50,
      split_by: 'paragraph',
      test_queries: ['What is attachment theory?', 'How do archetypes affect relationships?'],
      sample_content: ''
    },
    {
      name: 'Large Chunks',
      chunk_size: 800,
      chunk_overlap: 100,
      split_by: 'semantic',
      test_queries: ['What is attachment theory?', 'How do archetypes affect relationships?'],
      sample_content: ''
    }
  ]

  // Removed isGenerating state - no longer needed for bulk generation
  const [isTesting, setIsTesting] = useState(false)
  const [testResults, setTestResults] = useState<TestResult[]>([])

  const availableMetadata = [
    'source', 'section', 'page_number', 'created_at', 'updated_at', 
    'author', 'category', 'archetype_name', 'content_type', 'language'
  ]

  const handleMetadataToggle = (field: string) => {
    setConfig(prev => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        include: prev.metadata.include.includes(field)
          ? prev.metadata.include.filter(f => f !== field)
          : [...prev.metadata.include, field]
      }
    }))
  }

  // Removed bulk embedding generation - now handled individually per archetype/personality

  const runChunkingTest = async () => {
    setIsTesting(true)
    try {
      const response = await fetch('/api/test-chunking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testConfigs })
      })

      if (!response.ok) throw new Error('Failed to run chunking test')
      
      const results = await response.json()
      setTestResults(results)
      console.log('Chunking test results:', results)
    } catch (error) {
      console.error('Error running chunking test:', error)
      alert('Error running chunking test. Please try again.')
    } finally {
      setIsTesting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Embedding Configuration</h2>
          <p className="text-gray-600 mt-1">Configure chunking strategy and test retrieval quality</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={runChunkingTest}
            disabled={isTesting}
            variant="outline"
            className="flex items-center gap-2"
          >
            <TestTube className="h-4 w-4" />
            {isTesting ? 'Testing...' : 'A/B Test Chunks'}
          </Button>
          {/* Generate Embeddings button removed - now handled individually per archetype/personality */}
        </div>
      </div>

      <Tabs defaultValue="config" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="config" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Configuration
          </TabsTrigger>
          <TabsTrigger value="testing" className="flex items-center gap-2">
            <TestTube className="h-4 w-4" />
            A/B Testing
          </TabsTrigger>
          <TabsTrigger value="results" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Results
          </TabsTrigger>
        </TabsList>

        <TabsContent value="config" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Chunking Strategy</CardTitle>
              <CardDescription>
                Configure how content is split into chunks for embedding generation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="chunk_size">Chunk Size (tokens)</Label>
                  <Input
                    id="chunk_size"
                    type="number"
                    value={config.chunk_size}
                    onChange={(e) => setConfig(prev => ({ ...prev, chunk_size: parseInt(e.target.value) || 400 }))}
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">Recommended: 300-500 tokens</p>
                </div>
                <div>
                  <Label htmlFor="chunk_overlap">Chunk Overlap (tokens)</Label>
                  <Input
                    id="chunk_overlap"
                    type="number"
                    value={config.chunk_overlap}
                    onChange={(e) => setConfig(prev => ({ ...prev, chunk_overlap: parseInt(e.target.value) || 50 }))}
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">Prevents context loss at boundaries</p>
                </div>
                <div>
                  <Label htmlFor="split_by">Split Strategy</Label>
                  <Select
                    value={config.split_by}
                    onValueChange={(value) => setConfig(prev => ({ ...prev, split_by: value as 'paragraph' | 'sentence' | 'token' | 'semantic' }))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="paragraph">Paragraph</SelectItem>
                      <SelectItem value="sentence">Sentence</SelectItem>
                      <SelectItem value="token">Token Count</SelectItem>
                      <SelectItem value="semantic">Semantic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="min_chunk_size">Min Chunk Size</Label>
                  <Input
                    id="min_chunk_size"
                    type="number"
                    value={config.min_chunk_size}
                    onChange={(e) => setConfig(prev => ({ ...prev, min_chunk_size: parseInt(e.target.value) || 100 }))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="max_chunk_size">Max Chunk Size</Label>
                  <Input
                    id="max_chunk_size"
                    type="number"
                    value={config.max_chunk_size}
                    onChange={(e) => setConfig(prev => ({ ...prev, max_chunk_size: parseInt(e.target.value) || 1000 }))}
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label>Update Strategy</Label>
                <Select
                  value={config.update_strategy}
                  onValueChange={(value) => setConfig(prev => ({ ...prev, update_strategy: value as 're-embed-all' | 're-embed-updated' | 'incremental' }))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="re-embed-updated">Re-embed Updated Only</SelectItem>
                    <SelectItem value="re-embed-all">Re-embed All</SelectItem>
                    <SelectItem value="incremental">Incremental</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="store_text"
                  checked={config.store_text}
                  onCheckedChange={(checked) => setConfig(prev => ({ ...prev, store_text: checked }))}
                />
                <Label htmlFor="store_text">Store original text alongside embeddings</Label>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Metadata Configuration</CardTitle>
              <CardDescription>
                Select which metadata fields to include with each chunk
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {availableMetadata.map(field => (
                  <div key={field} className="flex items-center space-x-2">
                    <Switch
                      id={field}
                      checked={config.metadata.include.includes(field)}
                      onCheckedChange={() => handleMetadataToggle(field)}
                    />
                    <Label htmlFor={field} className="text-sm">{field}</Label>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <Label>Selected Metadata:</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {config.metadata.include.map(field => (
                    <Badge key={field} variant="secondary">{field}</Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="testing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>A/B Test Chunking Strategies</CardTitle>
              <CardDescription>
                Compare different chunking configurations to find the optimal setup for your content
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {testConfigs.map((testConfig, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium">{testConfig.name}</h4>
                    <Badge variant="outline">
                      {testConfig.chunk_size} tokens, {testConfig.chunk_overlap} overlap
                    </Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Split:</span> {testConfig.split_by}
                    </div>
                    <div>
                      <span className="font-medium">Size:</span> {testConfig.chunk_size}
                    </div>
                    <div>
                      <span className="font-medium">Overlap:</span> {testConfig.chunk_overlap}
                    </div>
                  </div>
                </div>
              ))}
              
              <div className="pt-4">
                <Button
                  onClick={runChunkingTest}
                  disabled={isTesting}
                  className="w-full flex items-center gap-2"
                >
                  <Play className="h-4 w-4" />
                  {isTesting ? 'Running A/B Test...' : 'Run A/B Test'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Test Results</CardTitle>
              <CardDescription>
                Retrieval quality comparison across different chunking strategies
              </CardDescription>
            </CardHeader>
            <CardContent>
              {testResults.length > 0 ? (
                <div className="space-y-4">
                  {testResults.map((result, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{result.config_name}</h4>
                        <Badge variant={result.score > 0.8 ? "default" : result.score > 0.6 ? "secondary" : "destructive"}>
                          Score: {(result.score * 100).toFixed(1)}%
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                        <div>Avg Relevance: {result.avg_relevance?.toFixed(3)}</div>
                        <div>Retrieval Time: {result.avg_time?.toFixed(0)}ms</div>
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" className="w-full flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    Export Results
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No test results yet. Run an A/B test to see chunking performance comparison.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
