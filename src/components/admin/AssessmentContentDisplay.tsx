'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Trash2, ExternalLink, FileText, Globe, ChevronDown, ChevronRight } from 'lucide-react'

interface ContentChunk {
  id: string
  chunk_text: string
  chunk_index: number
  chunk_size: number
  content_type: string
  source_url?: string
  metadata: {
    source?: string
    chapter?: string
    topic?: string
    processedAt?: string
  }
  created_at: string
}

interface AssessmentContentDisplayProps {
  assessmentId: string
  assessmentName: string
}

export function AssessmentContentDisplay({ assessmentId, assessmentName }: AssessmentContentDisplayProps) {
  const [chunks, setChunks] = useState<ContentChunk[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    fetchContentChunks()
  }, [assessmentId])

  const fetchContentChunks = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Encode the assessment ID for the URL
      const encodedId = encodeURIComponent(assessmentId)
      const response = await fetch(`/api/assessment-content/${encodedId}`)

      if (response.ok) {
        const data = await response.json()
        setChunks(data.chunks || [])
      } else {
        const errorData = await response.json().catch(() => ({}))
        setError(errorData.error || `Failed to load content chunks (${response.status})`)
      }
    } catch (error) {
      console.error('Error fetching content chunks:', error)
      setError(`Error loading content: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteChunk = async (chunkId: string) => {
    if (!confirm('Are you sure you want to delete this content chunk?')) return

    try {
      const response = await fetch(`/api/assessment-content/${chunkId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setChunks(prev => prev.filter(chunk => chunk.id !== chunkId))
      } else {
        alert('Failed to delete chunk')
      }
    } catch (error) {
      console.error('Error deleting chunk:', error)
      alert('Error deleting chunk')
    }
  }

  const getTopicColor = (topic: string) => {
    const colors: Record<string, string> = {
      'jealousy_management': 'bg-red-100 text-red-800',
      'relationship_orientation': 'bg-blue-100 text-blue-800',
      'communication': 'bg-green-100 text-green-800',
      'boundaries': 'bg-purple-100 text-purple-800',
      'time_management': 'bg-yellow-100 text-yellow-800',
      'default': 'bg-gray-100 text-gray-800'
    }
    return colors[topic] || colors.default
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Knowledge Base Content
          </CardTitle>
          <CardDescription>Loading content for {assessmentName}...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <FileText className="h-5 w-5" />
            Knowledge Base Content
          </CardTitle>
          <CardDescription>Error loading content for {assessmentName}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-red-600">{error}</p>
          <Button onClick={fetchContentChunks} className="mt-2">
            Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Knowledge Base Content
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {chunks.length} chunks
                </Badge>
                {isOpen ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </div>
            </CardTitle>
            <CardDescription>
              {chunks.length} content chunks uploaded for {assessmentName}
              {chunks.length > 0 && (
                <span className="text-xs text-gray-500 ml-2">
                  ({chunks.reduce((sum, chunk) => sum + chunk.chunk_size, 0).toLocaleString()} characters total)
                </span>
              )}
            </CardDescription>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent>
        {chunks.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No content uploaded yet</p>
            <p className="text-sm">Use the knowledge base section above to add content</p>
          </div>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {chunks.map((chunk, index) => (
              <div key={chunk.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Chunk {chunk.chunk_index + 1}</Badge>
                    {chunk.metadata.topic && (
                      <Badge className={getTopicColor(chunk.metadata.topic)}>
                        {chunk.metadata.topic.replace('_', ' ')}
                      </Badge>
                    )}
                    <span className="text-sm text-gray-500">
                      {chunk.chunk_size} characters
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {chunk.source_url && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(chunk.source_url, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteChunk(chunk.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                {chunk.metadata.source && (
                  <div className="flex items-center gap-2 mb-2">
                    <Globe className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-medium">{chunk.metadata.source}</span>
                    {chunk.metadata.chapter && (
                      <span className="text-sm text-gray-500">- {chunk.metadata.chapter}</span>
                    )}
                  </div>
                )}
                
                <p className="text-sm text-gray-700 leading-relaxed">
                  {chunk.chunk_text.length > 300 
                    ? `${chunk.chunk_text.substring(0, 300)}...` 
                    : chunk.chunk_text
                  }
                </p>
                
                <div className="mt-2 text-xs text-gray-400">
                  Uploaded: {new Date(chunk.created_at).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  )
}
