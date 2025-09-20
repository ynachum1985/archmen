'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Upload, FileText, Link, TestTube, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { EmbeddingSettingsDialog } from './EmbeddingSettingsDialog'
import { ArchetypeContentDisplay } from './ArchetypeContentDisplay'

interface ArchetypeKnowledgeBaseProps {
  archetypeId: string
  archetypeName: string
}

export function ArchetypeKnowledgeBase({ archetypeId, archetypeName }: ArchetypeKnowledgeBaseProps) {
  const [textContent, setTextContent] = useState('')
  const [sourceUrl, setSourceUrl] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingStatus, setProcessingStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle')
  const [statusMessage, setStatusMessage] = useState('')
  const [testQuery, setTestQuery] = useState('')
  const [testResults, setTestResults] = useState<any[]>([])
  const [isTesting, setIsTesting] = useState(false)

  const handleProcessContent = async () => {
    if (!textContent.trim()) {
      setStatusMessage('Please enter some content to process')
      setProcessingStatus('error')
      return
    }

    try {
      setIsProcessing(true)
      setProcessingStatus('processing')
      setStatusMessage('Processing content and generating embeddings...')

      const response = await fetch('/api/process-archetype-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          archetypeId,
          textContent,
          sourceUrl: sourceUrl || undefined,
          contentType: 'text',
          settings: {
            chunkSize: 1000,
            chunkOverlap: 200,
            embeddingModel: 'text-embedding-3-small'
          }
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to process content')
      }

      setProcessingStatus('success')
      setStatusMessage(data.message || 'Content processed successfully!')
      setTextContent('')
      setSourceUrl('')

      // Refresh the content display
      window.location.reload()

    } catch (error) {
      console.error('Error processing content:', error)
      setProcessingStatus('error')
      setStatusMessage(error instanceof Error ? error.message : 'Failed to process content')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleTestEmbedding = async () => {
    if (!testQuery.trim()) {
      alert('Please enter a test query')
      return
    }

    try {
      setIsTesting(true)
      setTestResults([])

      const response = await fetch('/api/test-archetype-embedding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: testQuery,
          archetypeId
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to test embedding')
      }

      setTestResults(data.results || [])

    } catch (error) {
      console.error('Error testing embedding:', error)
      alert(error instanceof Error ? error.message : 'Failed to test embedding')
    } finally {
      setIsTesting(false)
    }
  }

  const getStatusIcon = () => {
    switch (processingStatus) {
      case 'processing':
        return <Loader2 className="h-4 w-4 animate-spin" />
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-600" />
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Embedding Settings */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Knowledge Base Configuration</h3>
        <EmbeddingSettingsDialog
          trigger={
            <Button variant="outline" size="sm">
              <span className="text-lg">✨</span>
              Embedding Settings
            </Button>
          }
          title={`Embedding Settings for ${archetypeName}`}
          description={`Configure how ${archetypeName} content is processed and embedded for AI reference`}
          itemId={archetypeId}
          itemType="archetype"
          onSave={async (settings) => {
            console.log('Archetype embedding settings saved:', settings)
            // Settings are saved automatically in the EmbeddingSettingsDialog
          }}
        />
      </div>

      <Tabs defaultValue="upload" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Upload Content
          </TabsTrigger>
          <TabsTrigger value="content" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            View Content
          </TabsTrigger>
          <TabsTrigger value="test" className="flex items-center gap-2">
            <TestTube className="h-4 w-4" />
            Test Search
          </TabsTrigger>
        </TabsList>

        {/* Upload Content Tab */}
        <TabsContent value="upload" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Add Knowledge Base Content
              </CardTitle>
              <CardDescription>
                Add content that the AI can reference when discussing {archetypeName}. 
                This content will be chunked and embedded for semantic search.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="sourceUrl">Source URL (optional)</Label>
                <Input
                  id="sourceUrl"
                  value={sourceUrl}
                  onChange={(e) => setSourceUrl(e.target.value)}
                  placeholder="https://example.com/archetype-resource"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="textContent">Content</Label>
                <Textarea
                  id="textContent"
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                  placeholder={`Enter comprehensive content about ${archetypeName}...

This could include:
- Theoretical understanding and psychological insights
- Embodiment practices and exercises
- Integration techniques and shadow work
- Real-world examples and case studies
- Resources and references`}
                  rows={12}
                  className="resize-vertical"
                />
              </div>

              {processingStatus !== 'idle' && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-gray-50">
                  {getStatusIcon()}
                  <span className="text-sm">{statusMessage}</span>
                </div>
              )}

              <Button 
                onClick={handleProcessContent}
                disabled={isProcessing || !textContent.trim()}
                className="w-full"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing Content...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Process & Embed Content
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* View Content Tab */}
        <TabsContent value="content">
          <ArchetypeContentDisplay 
            archetypeId={archetypeId}
            archetypeName={archetypeName}
          />
        </TabsContent>

        {/* Test Search Tab */}
        <TabsContent value="test" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TestTube className="h-5 w-5" />
                Test Knowledge Base Search
              </CardTitle>
              <CardDescription>
                Test how well the AI can find relevant content for different queries
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="testQuery">Test Query</Label>
                <Input
                  id="testQuery"
                  value={testQuery}
                  onChange={(e) => setTestQuery(e.target.value)}
                  placeholder={`Ask something about ${archetypeName}...`}
                />
              </div>

              <Button 
                onClick={handleTestEmbedding}
                disabled={isTesting || !testQuery.trim()}
                className="w-full"
              >
                {isTesting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <TestTube className="h-4 w-4 mr-2" />
                    Test Search
                  </>
                )}
              </Button>

              {testResults.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-medium">Search Results:</h4>
                  {testResults.map((result, index) => (
                    <div key={index} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline">
                          Similarity: {(result.similarity * 100).toFixed(1)}%
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-700 line-clamp-3">
                        {result.content}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
