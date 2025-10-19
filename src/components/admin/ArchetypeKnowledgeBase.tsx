'use client'

import { useState, useEffect, forwardRef, useImperativeHandle, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Upload, FileText, Link, TestTube, Loader2, CheckCircle, AlertCircle, Plus, Minus, File, Image, Palette, Wand2, BookOpen, Info as InfoIcon } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { EnhancedMediaCreationStudio } from './EnhancedMediaCreationStudio'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArchetypeContentDisplay, type ArchetypeContentDisplayRef } from './ArchetypeContentDisplay'
import { ArchetypeFileUploadService, UploadedFile } from '@/lib/services/archetype-file-upload.service'
import { LLM_PROVIDERS, type LLMProvider, multiLLMService } from '@/lib/services/multi-llm.service'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { createClient } from '@/lib/supabase/client'

interface ArchetypeKnowledgeBaseProps {
  archetypeId: string
  archetypeName: string
  showOnlyKnowledgeBase?: boolean
  showOnlyCourseContent?: boolean
}

export const ArchetypeKnowledgeBase = forwardRef<any, ArchetypeKnowledgeBaseProps>(({
  archetypeId,
  archetypeName,
  showOnlyKnowledgeBase = false,
  showOnlyCourseContent = false
}, ref) => {
  // Content state - multiple text contents and URLs
  const [textContents, setTextContents] = useState<string[]>([''])
  const [referenceUrls, setReferenceUrls] = useState<string[]>([''])
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingStatus, setProcessingStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle')
  const [statusMessage, setStatusMessage] = useState('')
  const [testQuery, setTestQuery] = useState('')
  const [testResults, setTestResults] = useState<any[]>([])
  const [isTesting, setIsTesting] = useState(false)

  // Embedding settings state - OPTIMIZED VALUES (see EMBEDDING_CONFIGURATION_ANALYSIS.md)
  const [chunkSize, setChunkSize] = useState(400)  // Optimal: 300-500 tokens
  const [chunkOverlap, setChunkOverlap] = useState(80)  // 20% overlap (industry standard)
  const [embeddingModel, setEmbeddingModel] = useState('openrouter/mistral-embed')  // Default to OpenRouter Mistral for cost-effectiveness
  const [topK, setTopK] = useState(10)  // Industry standard: 5-10 results
  const [similarityThreshold, setSimilarityThreshold] = useState(0.7)  // 70% minimum relevance
  const [maxContextTokens, setMaxContextTokens] = useState(4000)  // Max tokens to send to LLM
  const [enableMetadataFiltering, setEnableMetadataFiltering] = useState(false)  // Filter by category/tags

  // Media studio state
  const [showMediaStudio, setShowMediaStudio] = useState(false)

  // File upload state
  const [uploadedFiles, setUploadedFiles] = useState<File[][]>([[]])
  const [uploadingFiles, setUploadingFiles] = useState(false)
  const [existingFiles, setExistingFiles] = useState<UploadedFile[]>([])

  // Embedded content state
  const [embeddedChunks, setEmbeddedChunks] = useState<any[]>([])
  const [loadingChunks, setLoadingChunks] = useState(false)

  // Image generation state
  const [selectedProvider, setSelectedProvider] = useState<LLMProvider>('openrouter')
  const [selectedModel, setSelectedModel] = useState<string>('openai/dall-e-3')
  const [imagePrompt, setImagePrompt] = useState('')
  const [generatedImages, setGeneratedImages] = useState<string[]>([])
  const [isGeneratingImage, setIsGeneratingImage] = useState(false)
  const [availableProviders, setAvailableProviders] = useState<LLMProvider[]>([])

  const fileUploadService = new ArchetypeFileUploadService()

  // Ref for ArchetypeContentDisplay to trigger refresh
  const contentDisplayRef = useRef<ArchetypeContentDisplayRef>(null)

  // Expose handleProcessContent to parent component
  useImperativeHandle(ref, () => ({
    handleProcessContent
  }))

  // Fetch embedded content chunks
  const fetchEmbeddedContent = async (archetypeId: string) => {
    try {
      setLoadingChunks(true)
      const supabase = createClient()

      const { data, error } = await supabase
        .from('archetype_content_chunks')
        .select('*')
        .eq('archetype_id', archetypeId)
        .order('chunk_index', { ascending: true })

      if (error) {
        console.error('Error fetching embedded chunks:', error)
        return
      }

      setEmbeddedChunks(data || [])
    } catch (error) {
      console.error('Error fetching embedded content:', error)
    } finally {
      setLoadingChunks(false)
    }
  }

  // Load embedded content on mount
  useEffect(() => {
    if (archetypeId) {
      fetchEmbeddedContent(archetypeId)
    }
  }, [archetypeId])

  const handleProcessContent = async () => {
    // Check if we have either text content or uploaded files
    const hasTextContent = textContents.some(content => content.trim())
    const hasFiles = uploadedFiles.some(fileGroup => fileGroup.length > 0)

    if (!hasTextContent && !hasFiles) {
      setStatusMessage('Please enter some content or upload files to process')
      setProcessingStatus('error')
      return
    }

    try {
      setIsProcessing(true)
      setProcessingStatus('processing')
      setStatusMessage('Processing content and generating embeddings...')

      // Combine all text contents
      let combinedContent = textContents.filter(content => content.trim()).join('\n\n---\n\n')

      // Process uploaded files
      if (hasFiles) {
        setStatusMessage('Processing uploaded files...')
        const fileContents: string[] = []

        for (const fileGroup of uploadedFiles) {
          for (const file of fileGroup) {
            try {
              // Upload file to storage
              const uploadedFile = await fileUploadService.uploadFile(file, archetypeId)

              // Extract text content from file
              const fileContent = await fileUploadService.processFileContent(file)
              fileContents.push(`\n\n--- Content from ${file.name} ---\n${fileContent}`)

            } catch (error) {
              console.error(`Error processing file ${file.name}:`, error)
              fileContents.push(`\n\n--- Error processing ${file.name} ---\n${error instanceof Error ? error.message : 'Unknown error'}`)
            }
          }
        }

        combinedContent += fileContents.join('')
      }

      setStatusMessage('Generating embeddings...')

      // Use Vercel API (works with Pro plan 60-second timeout)
      console.log('Calling Vercel API:', '/api/process-archetype-content')

      const response = await fetch('/api/process-archetype-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          archetypeId,
          textContent: combinedContent,
          settings: {
            chunkSize,
            chunkOverlap,
            embeddingModel,
            contextWindow: 4000,
            semanticSearchEnabled: true
          }
        }),
      })

      console.log('Vercel API response status:', response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Vercel API error:', errorText)
        throw new Error(`Failed to process content (${response.status}): ${errorText}`)
      }

      const data = await response.json()
      console.log('Vercel API success:', data)

      setProcessingStatus('success')
      setStatusMessage(data.message || 'Content processed successfully!')

      // Clear input fields
      setTextContents([''])
      setReferenceUrls([''])
      setUploadedFiles([[]])

      // Fetch and display the embedded chunks
      await fetchEmbeddedContent(archetypeId)

      // Refresh the ArchetypeContentDisplay component
      if (contentDisplayRef.current) {
        await contentDisplayRef.current.refresh()
      }

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
        credentials: 'include', // Include cookies for authentication
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

  const handleGenerateImage = async () => {
    if (!imagePrompt.trim()) {
      alert('Please enter an image description')
      return
    }

    try {
      setIsGeneratingImage(true)

      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for authentication
        body: JSON.stringify({
          prompt: imagePrompt,
          provider: selectedProvider,
          model: selectedModel,
          size: '1024x1024',
          quality: 'standard',
          style: 'vivid'
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate image')
      }

      setGeneratedImages(prev => [...prev, data.imageUrl])

    } catch (error) {
      console.error('Error generating image:', error)
      alert(error instanceof Error ? error.message : 'Failed to generate image')
    } finally {
      setIsGeneratingImage(false)
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

  // File upload management functions
  const addFileUpload = () => {
    setUploadedFiles(prev => [...prev, []])
  }

  const removeFileUpload = (index: number) => {
    if (uploadedFiles.length > 1) {
      setUploadedFiles(prev => prev.filter((_, i) => i !== index))
    }
  }

  const removeFile = (groupIndex: number, fileIndex: number) => {
    setUploadedFiles(prev =>
      prev.map((fileGroup, i) =>
        i === groupIndex
          ? fileGroup.filter((_, j) => j !== fileIndex)
          : fileGroup
      )
    )
  }

  // Text content management functions
  const addTextContent = () => {
    setTextContents(prev => [...prev, ''])
  }

  const removeTextContent = (index: number) => {
    if (textContents.length > 1) {
      setTextContents(prev => prev.filter((_, i) => i !== index))
    }
  }

  const updateTextContent = (index: number, value: string) => {
    setTextContents(prev => prev.map((content, i) => i === index ? value : content))
  }

  // Reference URL management functions
  const addReferenceUrl = () => {
    setReferenceUrls(prev => [...prev, ''])
  }

  const removeReferenceUrl = (index: number) => {
    if (referenceUrls.length > 1) {
      setReferenceUrls(prev => prev.filter((_, i) => i !== index))
    }
  }

  const updateReferenceUrl = (index: number, value: string) => {
    setReferenceUrls(prev => prev.map((url, i) => i === index ? value : url))
  }

  // File upload handler
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const files = Array.from(event.target.files || [])
    if (files.length > 0) {
      setUploadedFiles(prev =>
        prev.map((fileGroup, i) =>
          i === index ? files : fileGroup
        )
      )
    }
  }

  // If we're showing only knowledge base content, render just that
  if (showOnlyKnowledgeBase) {
    return (
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Knowledge Base</h2>
          <p className="text-sm text-gray-600 mt-1">
            Add content that the AI can reference when discussing {archetypeName}
          </p>
        </div>

        {/* Content Input */}
        <div className="space-y-6">
          {/* File Upload Section */}
          <div className="space-y-3">
            {uploadedFiles.map((files, index) => (
              <div key={index} className="flex items-start gap-2">
                <div className="flex-1">
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.txt,.doc,.docx,.md,.json,.csv"
                    onChange={(e) => handleFileUpload(e, index)}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFileUpload(index)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <Minus className="h-4 w-4" />
                </Button>
              </div>
            ))}

            <Button
              variant="ghost"
              size="sm"
              onClick={addFileUpload}
              className="text-gray-600 hover:text-gray-800"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add File Upload
            </Button>
          </div>

          {/* Text Content Section */}
          <div className="space-y-3">
            {textContents.map((content, index) => (
              <div key={index} className="flex items-start gap-2">
                <Textarea
                  value={content}
                  onChange={(e) => updateTextContent(index, e.target.value)}
                  placeholder={`Enter content about ${archetypeName}...`}
                  rows={4}
                  className="resize-y border-gray-200 text-sm flex-1 overflow-auto max-h-48"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeTextContent(index)}
                  className="text-gray-400 hover:text-gray-600 mt-1"
                >
                  <Minus className="h-4 w-4" />
                </Button>
              </div>
            ))}

            <Button
              variant="ghost"
              size="sm"
              onClick={addTextContent}
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
                  onChange={(e) => updateReferenceUrl(index, e.target.value)}
                  placeholder="https://example.com/article-about-archetype"
                  className="flex-1"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeReferenceUrl(index)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <Minus className="h-4 w-4" />
                </Button>
              </div>
            ))}

            <Button
              variant="ghost"
              size="sm"
              onClick={addReferenceUrl}
              className="text-gray-600 hover:text-gray-800"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Reference URL
            </Button>
          </div>

          {/* Embedding Settings - Matches Assessment Style */}
          <TooltipProvider delayDuration={300} skipDelayDuration={100}>
            <div className="pt-4 border-t border-gray-100">
              <Label className="text-sm font-medium text-gray-700 mb-3 block">Embedding Settings</Label>

              {/* Row 1: Core Settings */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                <div>
                  <div className="flex items-center gap-1 mb-1">
                    <Label htmlFor="chunkSize" className="text-xs text-gray-600">Chunk Size</Label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <InfoIcon className="h-3 w-3 text-gray-400 cursor-help" />
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
                    className="h-9"
                  />
                </div>

                <div>
                  <div className="flex items-center gap-1 mb-1">
                    <Label htmlFor="chunkOverlap" className="text-xs text-gray-600">Chunk Overlap</Label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <InfoIcon className="h-3 w-3 text-gray-400 cursor-help" />
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
                    className="h-9"
                  />
                </div>

                <div>
                  <div className="flex items-center gap-1 mb-1">
                    <Label htmlFor="embeddingModel" className="text-xs text-gray-600">Embedding Model</Label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <InfoIcon className="h-3 w-3 text-gray-400 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p className="text-xs">AI model for converting text to vectors. text-embedding-3-small = best cost/performance.</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Select value={embeddingModel} onValueChange={setEmbeddingModel}>
                    <SelectTrigger id="embeddingModel" className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {/* OpenRouter Models - RECOMMENDED */}
                      <SelectItem value="openrouter/mistral-embed">🚀 OpenRouter: Mistral Embed (1024d) - Best cost/performance</SelectItem>
                      <SelectItem value="openrouter/voyage-3-lite">🚀 OpenRouter: Voyage 3-Lite (512d) - Fast & cheap</SelectItem>
                      <SelectItem value="openrouter/voyage-3-large">🚀 OpenRouter: Voyage 3-Large (1024d) - Premium quality</SelectItem>

                      {/* OpenAI Models */}
                      <SelectItem value="text-embedding-3-small">OpenAI: text-embedding-3-small (1536d)</SelectItem>
                      <SelectItem value="text-embedding-3-large">OpenAI: text-embedding-3-large (3072d)</SelectItem>
                      <SelectItem value="text-embedding-ada-002">OpenAI: text-embedding-ada-002 (1536d)</SelectItem>

                      {/* Mistral Models */}
                      <SelectItem value="mistral-embed">Mistral: mistral-embed (1024d)</SelectItem>

                      {/* Voyage AI Models */}
                      <SelectItem value="voyage-3-lite">Voyage AI: voyage-3-lite (512d)</SelectItem>
                      <SelectItem value="voyage-3-large">Voyage AI: voyage-3-large (1024d)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <div className="flex items-center gap-1 mb-1">
                    <Label htmlFor="topK" className="text-xs text-gray-600">Top K Results</Label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <InfoIcon className="h-3 w-3 text-gray-400 cursor-help" />
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
                    className="h-9"
                  />
                </div>
              </div>

              {/* Row 2: Advanced Settings */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 pt-3 border-t border-gray-200">
                <div>
                  <div className="flex items-center gap-1 mb-1">
                    <Label htmlFor="similarityThreshold" className="text-xs text-gray-600">Similarity Threshold</Label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <InfoIcon className="h-3 w-3 text-gray-400 cursor-help" />
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
                    className="h-9"
                  />
                </div>

                <div>
                  <div className="flex items-center gap-1 mb-1">
                    <Label htmlFor="maxContextTokens" className="text-xs text-gray-600">Max Context Tokens</Label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <InfoIcon className="h-3 w-3 text-gray-400 cursor-help" />
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
                    className="h-9"
                  />
                </div>

                <div className="flex items-center gap-2 pt-6">
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
                        <InfoIcon className="h-3 w-3 text-gray-400 cursor-help" />
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

          {/* Status Display */}
          {processingStatus !== 'idle' && (
            <div className="flex items-center gap-2 p-2 rounded bg-gray-50 text-sm">
              {getStatusIcon()}
              <span>{statusMessage}</span>
            </div>
          )}

          {/* Embedded Content Display */}
          <ArchetypeContentDisplay
            ref={contentDisplayRef}
            archetypeId={archetypeId}
            archetypeName={archetypeName}
          />

          {/* Test Embed Quality */}
          <div className="space-y-2 pt-4 border-t">
            <div className="flex items-center gap-2">
              <Label className="text-sm font-medium">Test Embed Quality</Label>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <InfoIcon className="h-4 w-4 text-gray-400" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>📚 How to Use Content Preprocessing & Testing</DialogTitle>
                    <DialogDescription>
                      Simple steps to optimize your archetype knowledge base
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-2">🧠 Content Preprocessing (Automatic)</h4>
                      <div className="text-sm text-blue-800 space-y-1">
                        <div>✅ Text cleaning & normalization</div>
                        <div>✅ Optimal chunking (1000 tokens)</div>
                        <div>✅ Metadata enhancement</div>
                        <div>✅ Model-specific optimization</div>
                      </div>
                    </div>

                    <div className="p-4 bg-green-50 rounded-lg">
                      <h4 className="font-medium text-green-900 mb-2">📝 How to Add Content</h4>
                      <div className="text-sm text-green-800 space-y-1">
                        <div>1. Paste text or upload files above</div>
                        <div>2. Choose embedding model (Mistral = cost-effective)</div>
                        <div>3. Click "Process Content" - preprocessing happens automatically</div>
                        <div>4. View processed chunks below</div>
                      </div>
                    </div>

                    <div className="p-4 bg-orange-50 rounded-lg">
                      <h4 className="font-medium text-orange-900 mb-2">🧪 How to Test Quality</h4>
                      <div className="text-sm text-orange-800 space-y-1">
                        <div>1. Enter test query: "What are the core traits of this archetype?"</div>
                        <div>2. Click "Test" button</div>
                        <div>3. Check similarity scores ({'>'}0.7 = good)</div>
                        <div>4. Verify relevant content is retrieved</div>
                      </div>
                    </div>

                    <div className="p-4 bg-purple-50 rounded-lg">
                      <h4 className="font-medium text-purple-900 mb-2">🎯 Optimization Tips</h4>
                      <div className="text-sm text-purple-800 space-y-1">
                        <div>• Start with Mistral Embed (default)</div>
                        <div>• Test with Voyage AI for better relevance</div>
                        <div>• Try different chunk sizes if needed</div>
                        <div>• Re-process content after model changes</div>
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <div className="flex gap-2">
              <Input
                value={testQuery}
                onChange={(e) => setTestQuery(e.target.value)}
                placeholder={`Ask something about ${archetypeName}...`}
                className="flex-1 text-sm"
              />
              <Button
                onClick={handleTestEmbedding}
                disabled={isTesting || !testQuery.trim()}
                size="sm"
                variant="outline"
              >
                {isTesting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    Testing...
                  </>
                ) : (
                  <>
                    <TestTube className="h-4 w-4 mr-1" />
                    Test
                  </>
                )}
              </Button>
            </div>

            {testResults.length > 0 && (
              <div className="space-y-2">
                <Label className="text-xs text-gray-500">Search Results:</Label>
                <div className="max-h-48 overflow-y-auto space-y-2">
                  {testResults.map((result, index) => (
                    <div key={index} className="border rounded p-2 text-sm">
                      <div className="flex items-center justify-between mb-1">
                        <Badge variant="outline" className="text-xs">
                          {(result.similarity * 100).toFixed(1)}% match
                        </Badge>
                      </div>
                      <p className="text-gray-700 text-xs line-clamp-2">
                        {result.content}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // If we're showing only course content, render message that it's been replaced
  if (showOnlyCourseContent) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6 text-center">
            <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium mb-2">Course Content Replaced</h3>
            <p className="text-gray-600">
              The mini-course system has been replaced with an integrated AI homework calendar.
              Users now receive personalized homework assignments directly from the AI chatbot.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">

      <Tabs defaultValue="metrics" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="metrics" className="flex items-center gap-2">
            <TestTube className="h-4 w-4" />
            Metrics
          </TabsTrigger>
          <TabsTrigger value="knowledge" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Knowledge Base
          </TabsTrigger>
          <TabsTrigger value="content" className="flex items-center gap-2">
            <Image className="h-4 w-4" />
            Content
          </TabsTrigger>
        </TabsList>

        {/* Metrics Tab */}
        <TabsContent value="metrics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TestTube className="h-5 w-5" />
                Archetype Metrics & Analytics
              </CardTitle>
              <CardDescription>
                Track engagement, assessment results, and course completion for {archetypeName}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center py-8 text-gray-500">
                <TestTube className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium mb-2">Metrics Dashboard Coming Soon</h3>
                <p className="text-sm">
                  This section will show analytics for:
                </p>
                <div className="mt-4 space-y-2 text-sm">
                  <div>• Assessment completion rates</div>
                  <div>• Course engagement metrics</div>
                  <div>• User archetype discovery patterns</div>
                  <div>• Content performance analytics</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Knowledge Base Tab */}
        <TabsContent value="knowledge" className="space-y-4">
          <div className="space-y-4">
            {/* Document Upload */}
            <div className="space-y-2">
              {uploadedFiles.map((files, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    type="file"
                    multiple
                    accept=".pdf,.txt,.doc,.docx,.md,.json,.csv"
                    onChange={(e) => {
                      const newFiles = Array.from(e.target.files || [])
                      if (newFiles.length > 0) {
                        const updatedFiles = [...uploadedFiles]
                        updatedFiles[index] = newFiles
                        setUploadedFiles(updatedFiles)
                      }
                    }}
                    className="flex-1 text-sm"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => {
                      const updatedFiles = uploadedFiles.filter((_, i) => i !== index)
                      setUploadedFiles(updatedFiles.length === 0 ? [[]] : updatedFiles)
                    }}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setUploadedFiles([...uploadedFiles, []])}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Upload
              </Button>
            </div>

            {/* Reference URLs */}
            <div className="space-y-2">
              {referenceUrls.map((url, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    value={url}
                    onChange={(e) => {
                      const updatedUrls = [...referenceUrls]
                      updatedUrls[index] = e.target.value
                      setReferenceUrls(updatedUrls)
                    }}
                    placeholder="https://example.com/resource"
                    className="flex-1 text-sm"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => {
                      const updatedUrls = referenceUrls.filter((_, i) => i !== index)
                      setReferenceUrls(updatedUrls.length === 0 ? [''] : updatedUrls)
                    }}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setReferenceUrls([...referenceUrls, ''])}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add URL
              </Button>
            </div>

            {/* Text Content */}
            <div className="space-y-2">
              {textContents.map((content, index) => (
                <div key={index} className="flex items-start gap-2">
                  <Textarea
                    value={content}
                    onChange={(e) => {
                      const updatedContents = [...textContents]
                      updatedContents[index] = e.target.value
                      setTextContents(updatedContents)
                    }}
                    placeholder={`Enter content about ${archetypeName}...`}
                    rows={4}
                    className="flex-1 text-sm resize-y overflow-auto max-h-48"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 mt-1"
                    onClick={() => {
                      const updatedContents = textContents.filter((_, i) => i !== index)
                      setTextContents(updatedContents.length === 0 ? [''] : updatedContents)
                    }}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setTextContents([...textContents, ''])}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Text
              </Button>
            </div>

            {/* Embedding Settings - Compact */}
            <div className="grid grid-cols-5 gap-2 pt-4 border-t">
              <div>
                <Label className="text-xs">Chunk Size</Label>
                <Input
                  type="number"
                  value={chunkSize}
                  onChange={(e) => setChunkSize(parseInt(e.target.value) || 1000)}
                  className="h-8 text-xs"
                />
              </div>
              <div>
                <Label className="text-xs">Overlap</Label>
                <Input
                  type="number"
                  value={chunkOverlap}
                  onChange={(e) => setChunkOverlap(parseInt(e.target.value) || 200)}
                  className="h-8 text-xs"
                />
              </div>
              <div>
                <Label className="text-xs">Model</Label>
                <select
                  value={embeddingModel}
                  onChange={(e) => setEmbeddingModel(e.target.value)}
                  className="h-8 text-xs border rounded px-1 w-full"
                >
                  <option value="text-embedding-3-small">OpenAI 3-small</option>
                  <option value="text-embedding-3-large">OpenAI 3-large</option>
                  <option value="text-embedding-ada-002">OpenAI ada-002</option>
                  <option value="mistral-embed">Mistral embed</option>
                  <option value="voyage-3-lite">Voyage 3-lite</option>
                  <option value="voyage-3-large">Voyage 3-large</option>
                  <option value="text-embedding-3-large">3-large</option>
                  <option value="text-embedding-ada-002">ada-002</option>
                </select>
              </div>
              <div>
                <Label className="text-xs">Top-K</Label>
                <Input
                  type="number"
                  value={topK}
                  onChange={(e) => setTopK(parseInt(e.target.value) || 10)}
                  className="h-8 text-xs"
                />
              </div>
              <div>
                <Label className="text-xs">Threshold</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={similarityThreshold}
                  onChange={(e) => setSimilarityThreshold(parseFloat(e.target.value) || 0.7)}
                  className="h-8 text-xs"
                />
              </div>
            </div>

            {processingStatus !== 'idle' && (
              <div className="flex items-center gap-2 p-2 rounded bg-gray-50 text-sm">
                {getStatusIcon()}
                <span>{statusMessage}</span>
              </div>
            )}

            <Button
              onClick={handleProcessContent}
              disabled={isProcessing || (!textContents.some(content => content.trim()) && !uploadedFiles.some(fileGroup => fileGroup.length > 0))}
              size="sm"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Embed Content
                </>
              )}
            </Button>

            {/* Embedded Content Display */}
            <ArchetypeContentDisplay
              ref={contentDisplayRef}
              archetypeId={archetypeId}
              archetypeName={archetypeName}
            />
          </div>
        </TabsContent>

        {/* View Content Tab */}
        <TabsContent value="content">
          <ArchetypeContentDisplay
            ref={contentDisplayRef}
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



        {/* Images & Graphics Tab */}
        <TabsContent value="images" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Image className="h-5 w-5" />
                Generate Archetype Images & Graphics
              </CardTitle>
              <CardDescription>
                Create visual content for {archetypeName} using AI image generation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Provider and Model Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>AI Provider</Label>
                  <Select value={selectedProvider} onValueChange={setSelectedProvider}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select provider" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="openrouter">OpenRouter</SelectItem>
                      <SelectItem value="openai">OpenAI</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Model</Label>
                  <Select value={selectedModel} onValueChange={setSelectedModel}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select model" />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedProvider === 'openrouter' && (
                        <>
                          <SelectItem value="openai/dall-e-3">DALL-E 3</SelectItem>
                          <SelectItem value="openai/dall-e-2">DALL-E 2</SelectItem>
                          <SelectItem value="stability-ai/stable-diffusion-xl">Stable Diffusion XL</SelectItem>
                          <SelectItem value="midjourney/midjourney">Midjourney</SelectItem>
                        </>
                      )}
                      {selectedProvider === 'openai' && (
                        <>
                          <SelectItem value="dall-e-3">DALL-E 3</SelectItem>
                          <SelectItem value="dall-e-2">DALL-E 2</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Image Prompt */}
              <div className="space-y-2">
                <Label htmlFor="imagePrompt">Image Description</Label>
                <Textarea
                  id="imagePrompt"
                  value={imagePrompt}
                  onChange={(e) => setImagePrompt(e.target.value)}
                  placeholder={`Describe the visual representation you want for ${archetypeName}...

Examples:
- A symbolic representation of ${archetypeName} as an archetype card
- An infographic showing the key traits of ${archetypeName}
- A character illustration embodying ${archetypeName}
- A mandala or geometric pattern representing ${archetypeName}`}
                  rows={6}
                  className="resize-vertical"
                />
              </div>

              {/* Generate Button */}
              <Button
                onClick={handleGenerateImage}
                disabled={isGeneratingImage || !imagePrompt.trim()}
                className="w-full"
              >
                {isGeneratingImage ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating Image...
                  </>
                ) : (
                  <>
                    <Wand2 className="h-4 w-4 mr-2" />
                    Generate Image
                  </>
                )}
              </Button>

              {/* Generated Images Display */}
              {generatedImages.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-medium">Generated Images:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {generatedImages.map((imageUrl, index) => (
                      <div key={index} className="border rounded-lg p-3">
                        <img
                          src={imageUrl}
                          alt={`Generated image ${index + 1}`}
                          className="w-full h-48 object-cover rounded"
                        />
                        <div className="flex gap-2 mt-2">
                          <Button size="sm" variant="outline" className="flex-1">
                            Download
                          </Button>
                          <Button size="sm" variant="outline" className="flex-1">
                            Save to Knowledge Base
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Content Tab */}
        <TabsContent value="content" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Image className="h-5 w-5" />
                Archetype Content & Media
              </CardTitle>
              <CardDescription>
                Create and manage images, videos, and animations for {archetypeName}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Content Creation Studio */}
                {!showMediaStudio ? (
                  <div className="border rounded-lg p-4">
                    <h3 className="font-medium mb-4">Create New Content</h3>
                    <div className="text-center py-8 text-gray-500">
                      <Image className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <h4 className="text-lg font-medium mb-2">Media Creation Studio</h4>
                      <p className="text-sm mb-4">
                        Create images, animations, and videos for {archetypeName} using AI models including:
                      </p>
                      <div className="flex flex-wrap gap-2 justify-center mb-4 text-xs">
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">OpenAI DALL-E</span>
                        <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded">Stable Video</span>
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded">Luma AI</span>
                        <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded">Runway ML</span>
                      </div>
                      <Button
                        onClick={() => setShowMediaStudio(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        <Wand2 className="h-4 w-4 mr-2" />
                        Open Media Studio
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">Media Creation Studio</h3>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowMediaStudio(false)}
                      >
                        Close Studio
                      </Button>
                    </div>
                    <EnhancedMediaCreationStudio
                      archetypeId={archetypeId}
                      archetypeName={archetypeName}
                      onMediaCreated={(asset) => {
                        console.log('New media created:', asset)
                        // Could add to gallery state here
                      }}
                    />
                  </div>
                )}

                {/* Existing Content Gallery */}
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium mb-4">Content Gallery</h3>
                  <div className="text-center py-8 text-gray-500">
                    <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <h4 className="text-lg font-medium mb-2">No Content Yet</h4>
                    <p className="text-sm">
                      Created images, videos, and animations will appear here
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
})
