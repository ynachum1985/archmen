"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Plus, Minus, Upload, Search, Info } from 'lucide-react'
import { AssessmentContentDisplay } from './AssessmentContentDisplay'

interface AssessmentKnowledgeBaseProps {
  assessmentId: string
  assessmentName: string
}

export function AssessmentKnowledgeBase({
  assessmentId,
  assessmentName
}: AssessmentKnowledgeBaseProps) {
  // Content state
  const [textContents, setTextContents] = useState<string[]>([''])
  const [referenceUrls, setReferenceUrls] = useState<string[]>([''])
  const [uploadedFiles, setUploadedFiles] = useState<File[][]>([[]])

  // Embedding settings - OPTIMIZED VALUES (matching archetypes)
  const [chunkSize, setChunkSize] = useState(400)  // Optimal: 300-500 tokens
  const [chunkOverlap, setChunkOverlap] = useState(80)  // 20% overlap (industry standard)
  const [embeddingModel, setEmbeddingModel] = useState('text-embedding-3-small')  // Best performance/cost
  const [topK, setTopK] = useState(10)  // Industry standard: 5-10 results
  const [similarityThreshold, setSimilarityThreshold] = useState(0.7)  // 70% minimum relevance
  const [maxContextTokens, setMaxContextTokens] = useState(4000)  // Max tokens to send to LLM
  const [enableMetadataFiltering, setEnableMetadataFiltering] = useState(false)  // Filter by category/tags

  // Processing state
  const [isProcessingContent, setIsProcessingContent] = useState(false)
  const [testQuery, setTestQuery] = useState('')
  const [isTestingEmbedding, setIsTestingEmbedding] = useState(false)
  const [embeddingTestResults, setEmbeddingTestResults] = useState<Array<{content: string, similarity: number}> | null>(null)

  const handleProcessContent = async () => {
    if (!assessmentId || !assessmentName) {
      alert('Assessment ID and name are required')
      return
    }

    setIsProcessingContent(true)
    try {
      // Combine all content
      const combinedContent = textContents.filter(c => c.trim()).join('\n\n')
      
      if (!combinedContent && uploadedFiles.flat().length === 0) {
        alert('Please add some content or upload files')
        return
      }

      // Process content via API
      const response = await fetch('/api/process-assessment-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assessmentId,
          textContent: combinedContent,
          settings: {
            chunkSize,
            chunkOverlap,
            embeddingModel,
            contextWindow: 4000,
            semanticSearchEnabled: true
          }
        })
      })

      if (!response.ok) {
        throw new Error('Failed to process content')
      }

      const data = await response.json()
      alert(data.message || 'Content processed successfully!')

      // Clear inputs
      setTextContents([''])
      setReferenceUrls([''])
      setUploadedFiles([[]])
    } catch (error) {
      console.error('Error processing content:', error)
      alert('Failed to process content')
    } finally {
      setIsProcessingContent(false)
    }
  }

  const handleTestEmbedding = async () => {
    if (!testQuery.trim()) return

    setIsTestingEmbedding(true)
    try {
      const response = await fetch('/api/test-assessment-embedding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assessmentId,
          query: testQuery,
          topK,
          similarityThreshold
        })
      })

      if (!response.ok) throw new Error('Failed to test embedding')

      const data = await response.json()
      setEmbeddingTestResults(data.results || [])
    } catch (error) {
      console.error('Error testing embedding:', error)
      alert('Failed to test embedding')
    } finally {
      setIsTestingEmbedding(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Assessment Knowledge Base</h3>
        <p className="text-sm text-gray-600">Add content that the AI can reference when conducting this assessment</p>
      </div>

      {/* File Upload Section */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Upload Files</Label>
        {uploadedFiles.map((fileGroup, groupIndex) => (
          <div key={groupIndex} className="flex items-start gap-2">
            <div className="flex-1">
              <input
                type="file"
                multiple
                onChange={(e) => {
                  const files = Array.from(e.target.files || [])
                  const updatedFiles = [...uploadedFiles]
                  updatedFiles[groupIndex] = files
                  setUploadedFiles(updatedFiles)
                }}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                const updatedFiles = uploadedFiles.filter((_, i) => i !== groupIndex)
                setUploadedFiles(updatedFiles.length === 0 ? [[]] : updatedFiles)
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              <Minus className="h-4 w-4" />
            </Button>
          </div>
        ))}

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setUploadedFiles([...uploadedFiles, []])}
          className="text-gray-600 hover:text-gray-800"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add File Upload
        </Button>
      </div>

      {/* Text Content Section */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Text Content</Label>
        {textContents.map((content, index) => (
          <div key={index} className="flex items-start gap-2">
            <Textarea
              value={content}
              onChange={(e) => {
                const updatedContents = [...textContents]
                updatedContents[index] = e.target.value
                setTextContents(updatedContents)
              }}
              placeholder={`Enter content about ${assessmentName}...`}
              rows={4}
              className="resize-y border-gray-200 text-sm flex-1 overflow-auto max-h-48"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                const updatedContents = textContents.filter((_, i) => i !== index)
                setTextContents(updatedContents.length === 0 ? [''] : updatedContents)
              }}
              className="text-gray-400 hover:text-gray-600 mt-1"
            >
              <Minus className="h-4 w-4" />
            </Button>
          </div>
        ))}

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setTextContents([...textContents, ''])}
          className="text-gray-600 hover:text-gray-800"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Text Content
        </Button>
      </div>

      {/* Reference URLs Section */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Reference URLs</Label>
        {referenceUrls.map((url, index) => (
          <div key={index} className="flex items-center gap-2">
            <Input
              value={url}
              onChange={(e) => {
                const updatedUrls = [...referenceUrls]
                updatedUrls[index] = e.target.value
                setReferenceUrls(updatedUrls)
              }}
              placeholder="https://example.com/article-about-assessment"
              className="flex-1"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                const updatedUrls = referenceUrls.filter((_, i) => i !== index)
                setReferenceUrls(updatedUrls.length === 0 ? [''] : updatedUrls)
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              <Minus className="h-4 w-4" />
            </Button>
          </div>
        ))}

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setReferenceUrls([...referenceUrls, ''])}
          className="text-gray-600 hover:text-gray-800"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Reference URL
        </Button>
      </div>

      {/* Embedding Settings */}
      <TooltipProvider delayDuration={300} skipDelayDuration={100}>
        <div className="bg-gray-50 p-4 rounded-lg space-y-4">
          <h4 className="text-sm font-medium text-gray-900">Embedding Settings</h4>

          {/* Row 1: Core Settings */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="flex items-center gap-1 mb-1">
                <Label htmlFor="chunkSize" className="text-xs">Chunk Size</Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3 w-3 text-gray-400 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="text-xs">How much text per chunk (in tokens). 400 = ~300 words. Optimal: 300-500 for balanced context.</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <Input
                id="chunkSize"
                type="number"
                value={chunkSize}
                onChange={(e) => setChunkSize(parseInt(e.target.value) || 400)}
                className="h-8 text-xs"
              />
            </div>

            <div>
              <div className="flex items-center gap-1 mb-1">
                <Label htmlFor="chunkOverlap" className="text-xs">Chunk Overlap</Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3 w-3 text-gray-400 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="text-xs">Overlap between chunks (in tokens). 80 = 20% overlap. Prevents losing context at boundaries.</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <Input
                id="chunkOverlap"
                type="number"
                value={chunkOverlap}
                onChange={(e) => setChunkOverlap(parseInt(e.target.value) || 80)}
                className="h-8 text-xs"
              />
            </div>

            <div>
              <div className="flex items-center gap-1 mb-1">
                <Label htmlFor="embeddingModel" className="text-xs">Embedding Model</Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3 w-3 text-gray-400 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="text-xs">AI model for converting text to vectors. text-embedding-3-small = best cost/performance.</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <Select value={embeddingModel} onValueChange={setEmbeddingModel}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text-embedding-3-small">OpenAI: text-embedding-3-small</SelectItem>
                  <SelectItem value="mistral-embed">Mistral: mistral-embed</SelectItem>
                  <SelectItem value="voyage-large-2">Voyage: voyage-large-2</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <div className="flex items-center gap-1 mb-1">
                <Label htmlFor="topK" className="text-xs">Top K Results</Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3 w-3 text-gray-400 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="text-xs">How many relevant chunks to retrieve. 10 = industry standard. Higher = more context but slower.</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <Input
                id="topK"
                type="number"
                value={topK}
                onChange={(e) => setTopK(parseInt(e.target.value) || 10)}
                className="h-8 text-xs"
              />
            </div>
          </div>

          {/* Row 2: Advanced Settings */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-2 border-t border-gray-200">
            <div>
              <div className="flex items-center gap-1 mb-1">
                <Label htmlFor="similarityThreshold" className="text-xs">Similarity Threshold</Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3 w-3 text-gray-400 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="text-xs">Minimum relevance score (0-1). 0.7 = 70% match required. Filters out irrelevant results.</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <Input
                id="similarityThreshold"
                type="number"
                step="0.05"
                min="0"
                max="1"
                value={similarityThreshold}
                onChange={(e) => setSimilarityThreshold(parseFloat(e.target.value) || 0.7)}
                className="h-8 text-xs"
              />
            </div>

            <div>
              <div className="flex items-center gap-1 mb-1">
                <Label htmlFor="maxContextTokens" className="text-xs">Max Context Tokens</Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3 w-3 text-gray-400 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="text-xs">Maximum tokens to send to LLM. 4000 = balanced. Higher = more context but slower/costlier.</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <Input
                id="maxContextTokens"
                type="number"
                step="1000"
                min="1000"
                max="16000"
                value={maxContextTokens}
                onChange={(e) => setMaxContextTokens(parseInt(e.target.value) || 4000)}
                className="h-8 text-xs"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                id="enableMetadataFiltering"
                type="checkbox"
                checked={enableMetadataFiltering}
                onChange={(e) => setEnableMetadataFiltering(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300"
              />
              <div className="flex items-center gap-1">
                <Label htmlFor="enableMetadataFiltering" className="text-xs cursor-pointer">Metadata Filtering</Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3 w-3 text-gray-400 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="text-xs">Filter results by category, tags, or archetype. Improves precision for specific queries.</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          </div>
        </div>
      </TooltipProvider>

      {/* Process Content Button */}
      <div className="flex justify-between items-center">
        <Button
          onClick={handleProcessContent}
          disabled={isProcessingContent}
          className="bg-emerald-500 hover:bg-emerald-600"
        >
          {isProcessingContent ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Processing...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Process & Embed Content
            </>
          )}
        </Button>

        {/* Test Embedding Quality */}
        <div className="flex items-center gap-2">
          <Input
            value={testQuery}
            onChange={(e) => setTestQuery(e.target.value)}
            placeholder="Test search..."
            className="w-64"
          />
          <Button
            onClick={handleTestEmbedding}
            disabled={isTestingEmbedding || !testQuery.trim()}
            variant="outline"
            size="sm"
          >
            {isTestingEmbedding ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
            ) : (
              <>
                <Search className="h-4 w-4 mr-1" />
                Test
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Test Results */}
      {embeddingTestResults && (
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-blue-900 mb-2">Test Results</h4>
          {embeddingTestResults.length > 0 ? (
            <div className="space-y-2">
              {embeddingTestResults.map((result, index) => (
                <div key={index} className="bg-white p-3 rounded border">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-xs text-blue-600 font-medium">
                      Similarity: {(result.similarity * 100).toFixed(1)}%
                    </span>
                  </div>
                  <p className="text-sm text-gray-700">{result.content}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-blue-700">No relevant content found.</p>
          )}
        </div>
      )}

      {/* Existing Content Display */}
      <div className="mt-6">
        <AssessmentContentDisplay
          assessmentId={assessmentId}
          assessmentName={assessmentName}
        />
      </div>
    </div>
  )
}

