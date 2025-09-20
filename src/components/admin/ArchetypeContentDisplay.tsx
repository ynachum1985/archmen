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

interface ArchetypeContentDisplayProps {
  archetypeId: string
  archetypeName: string
}

export function ArchetypeContentDisplay({ archetypeId, archetypeName }: ArchetypeContentDisplayProps) {
  const [chunks, setChunks] = useState<ContentChunk[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(false)

  const fetchContentChunks = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch(`/api/archetype-content/${archetypeId}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch content')
      }

      setChunks(data.chunks || [])
    } catch (err) {
      console.error('Error fetching content chunks:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch content')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (archetypeId) {
      fetchContentChunks()
    }
  }, [archetypeId])

  const handleDeleteChunk = async (chunkId: string) => {
    try {
      const response = await fetch(`/api/archetype-content/${chunkId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete chunk')
      }

      // Remove the chunk from the local state
      setChunks(prev => prev.filter(chunk => chunk.id !== chunkId))
    } catch (err) {
      console.error('Error deleting chunk:', err)
      alert(err instanceof Error ? err.message : 'Failed to delete chunk')
    }
  }

  const getTopicColor = (topic: string) => {
    const colors = {
      'theoretical': 'bg-blue-100 text-blue-800',
      'embodiment': 'bg-green-100 text-green-800',
      'integration': 'bg-purple-100 text-purple-800',
      'shadow': 'bg-red-100 text-red-800',
      'resources': 'bg-yellow-100 text-yellow-800',
      'linguistic': 'bg-indigo-100 text-indigo-800'
    }
    return colors[topic as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Knowledge Base Content
          </CardTitle>
          <CardDescription>Loading content for {archetypeName}...</CardDescription>
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
          <CardDescription>Error loading content for {archetypeName}</CardDescription>
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
              Processed content chunks for {archetypeName} with embeddings for AI reference
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
                        {chunk.metadata.topic}
                      </Badge>
                    )}
                    <Badge variant="secondary" className="text-xs">
                      {chunk.chunk_size} chars
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    {chunk.source_url && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(chunk.source_url, '_blank')}
                      >
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteChunk(chunk.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                
                <div className="text-sm text-gray-600 mb-2">
                  <div className="flex items-center gap-4 text-xs">
                    <span className="flex items-center gap-1">
                      <Globe className="h-3 w-3" />
                      {chunk.content_type}
                    </span>
                    <span>
                      Created: {formatDate(chunk.created_at)}
                    </span>
                    {chunk.metadata.processedAt && (
                      <span>
                        Processed: {formatDate(chunk.metadata.processedAt)}
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-sm bg-gray-50 p-3 rounded border-l-4 border-blue-200">
                  <p className="line-clamp-4">
                    {chunk.chunk_text}
                  </p>
                </div>

                {chunk.metadata.source && (
                  <div className="mt-2 text-xs text-gray-500">
                    Source: {chunk.metadata.source}
                    {chunk.metadata.chapter && ` - ${chunk.metadata.chapter}`}
                  </div>
                )}
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
