'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Upload, FileText, Link, TestTube, Loader2, CheckCircle, AlertCircle, Plus, Minus, File, Image, Palette, Wand2, BookOpen } from 'lucide-react'
import { CourseContentBuilder } from './CourseContentBuilder'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { EmbeddingSettingsDialog } from './EmbeddingSettingsDialog'
import { ArchetypeContentDisplay } from './ArchetypeContentDisplay'
import { ArchetypeFileUploadService, UploadedFile } from '@/lib/services/archetype-file-upload.service'
import { LLM_PROVIDERS, type LLMProvider, multiLLMService } from '@/lib/services/multi-llm.service'

interface ArchetypeKnowledgeBaseProps {
  archetypeId: string
  archetypeName: string
  showOnlyKnowledgeBase?: boolean
  showOnlyCourseContent?: boolean
}

export function ArchetypeKnowledgeBase({
  archetypeId,
  archetypeName,
  showOnlyKnowledgeBase = false,
  showOnlyCourseContent = false
}: ArchetypeKnowledgeBaseProps) {
  // Content state - multiple text contents and URLs
  const [textContents, setTextContents] = useState<string[]>([''])
  const [referenceUrls, setReferenceUrls] = useState<string[]>([''])
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingStatus, setProcessingStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle')
  const [statusMessage, setStatusMessage] = useState('')
  const [testQuery, setTestQuery] = useState('')
  const [testResults, setTestResults] = useState<any[]>([])
  const [isTesting, setIsTesting] = useState(false)

  // Embedding settings state
  const [chunkSize, setChunkSize] = useState(1000)
  const [chunkOverlap, setChunkOverlap] = useState(200)
  const [embeddingModel, setEmbeddingModel] = useState('text-embedding-3-small')
  const [topK, setTopK] = useState(10)
  const [similarityThreshold, setSimilarityThreshold] = useState(0.7)

  // File upload state
  const [uploadedFiles, setUploadedFiles] = useState<File[][]>([[]])
  const [uploadingFiles, setUploadingFiles] = useState(false)
  const [existingFiles, setExistingFiles] = useState<UploadedFile[]>([])

  // Image generation state
  const [selectedProvider, setSelectedProvider] = useState<LLMProvider>('openrouter')
  const [selectedModel, setSelectedModel] = useState<string>('openai/dall-e-3')
  const [imagePrompt, setImagePrompt] = useState('')
  const [generatedImages, setGeneratedImages] = useState<string[]>([])
  const [isGeneratingImage, setIsGeneratingImage] = useState(false)
  const [availableProviders, setAvailableProviders] = useState<LLMProvider[]>([])

  const fileUploadService = new ArchetypeFileUploadService()

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

      const response = await fetch('/api/process-archetype-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          archetypeId,
          textContent: combinedContent,
          sourceUrl: referenceUrls.filter(url => url.trim()).join(', ') || undefined,
          contentType: 'text',
          settings: {
            chunkSize,
            chunkOverlap,
            embeddingModel,
            topK,
            similarityThreshold
          }
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to process content')
      }

      setProcessingStatus('success')
      setStatusMessage(data.message || 'Content processed successfully!')
      setTextContents([''])
      setReferenceUrls([''])
      setUploadedFiles([[]])

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
          {/* Document Upload Section */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-700">Upload Documents</Label>
            {uploadedFiles.map((files, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  type="file"
                  multiple
                  accept=".pdf,.txt,.doc,.docx,.md,.json,.csv"
                  onChange={(e) => handleFileUpload(e, index)}
                  className="cursor-pointer border-gray-200"
                />
                {uploadedFiles.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFileUpload(index)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}

            <Button
              variant="ghost"
              size="sm"
              onClick={addFileUpload}
              className="text-gray-600 hover:text-gray-800"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Another File Upload
            </Button>

            {/* Display uploaded files */}
            {uploadedFiles.some(fileGroup => fileGroup.length > 0) && (
              <div className="space-y-2 mt-3">
                <Label className="text-xs text-gray-500">Uploaded Files</Label>
                <div className="space-y-1">
                  {uploadedFiles.map((fileGroup, groupIndex) =>
                    fileGroup.map((file, fileIndex) => (
                      <div key={`${groupIndex}-${fileIndex}`} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                        <div className="flex items-center gap-2">
                          <File className="h-3 w-3 text-gray-400" />
                          <span className="text-gray-700">{file.name}</span>
                          <span className="text-xs text-gray-400">
                            {(file.size / 1024).toFixed(1)} KB
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(groupIndex, fileIndex)}
                          className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Text Content Section */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-700">Text Content</Label>
            {textContents.map((content, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs text-gray-500">Content Block {index + 1}</Label>
                  {textContents.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeTextContent(index)}
                      className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                  )}
                </div>
                <Textarea
                  value={content}
                  onChange={(e) => updateTextContent(index, e.target.value)}
                  placeholder={`Enter content about ${archetypeName}...`}
                  rows={4}
                  className="resize-none border-gray-200 text-sm"
                />
              </div>
            ))}

            <Button
              variant="ghost"
              size="sm"
              onClick={addTextContent}
              className="text-gray-600 hover:text-gray-800"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Another Text Block
            </Button>
          </div>

          {/* Reference URLs Section */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-700">Reference URLs</Label>
            {referenceUrls.map((url, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  value={url}
                  onChange={(e) => updateReferenceUrl(index, e.target.value)}
                  placeholder="https://example.com/article-about-archetype"
                  className="flex-1 border-gray-200 text-sm"
                />
                {referenceUrls.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeReferenceUrl(index)}
                    className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600"
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                )}
              </div>
            ))}

            <Button
              variant="ghost"
              size="sm"
              onClick={addReferenceUrl}
              className="text-gray-600 hover:text-gray-800"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Another URL
            </Button>
          </div>

          {/* Embedding Settings */}
          <div className="space-y-4 pt-4 border-t border-gray-100">
            <Label className="text-sm font-medium text-gray-700">Embedding Settings</Label>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs text-gray-600">Chunk Size</Label>
                <Input
                  type="number"
                  value={chunkSize}
                  onChange={(e) => setChunkSize(parseInt(e.target.value) || 1000)}
                  className="border-gray-200 text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-gray-600">Chunk Overlap</Label>
                <Input
                  type="number"
                  value={chunkOverlap}
                  onChange={(e) => setChunkOverlap(parseInt(e.target.value) || 200)}
                  className="border-gray-200 text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-gray-600">Embedding Model</Label>
                <Select value={embeddingModel} onValueChange={setEmbeddingModel}>
                  <SelectTrigger className="border-gray-200 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text-embedding-3-small">text-embedding-3-small</SelectItem>
                    <SelectItem value="text-embedding-3-large">text-embedding-3-large</SelectItem>
                    <SelectItem value="text-embedding-ada-002">text-embedding-ada-002</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-gray-600">Top K Results</Label>
                <Input
                  type="number"
                  value={topK}
                  onChange={(e) => setTopK(parseInt(e.target.value) || 10)}
                  className="border-gray-200 text-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-gray-600">Similarity Threshold</Label>
              <Input
                type="number"
                step="0.1"
                min="0"
                max="1"
                value={similarityThreshold}
                onChange={(e) => setSimilarityThreshold(parseFloat(e.target.value) || 0.7)}
                className="border-gray-200 text-sm"
              />
            </div>
          </div>

          {/* Status and Process Button */}
          {processingStatus !== 'idle' && (
            <div className="flex items-center gap-2 p-3 rounded bg-gray-50 text-sm">
              {getStatusIcon()}
              <span className="text-gray-700">{statusMessage}</span>
            </div>
          )}

          <Button
            onClick={handleProcessContent}
            disabled={isProcessing || (!textContents.some(content => content.trim()) && !uploadedFiles.some(fileGroup => fileGroup.length > 0))}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
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
        </div>
      </div>
    )
  }

  // If we're showing only course content, render just that
  if (showOnlyCourseContent) {
    return (
      <div className="space-y-6">
        <CourseContentBuilder
          archetypeId={archetypeId}
          archetypeName={archetypeName}
        />
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
          <TabsTrigger value="course" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Course Content
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
            <CardContent className="space-y-6">
              {/* Document Upload Section */}
              <div className="space-y-4">
                <Label className="text-sm font-medium">Upload Documents</Label>
                {uploadedFiles.map((files, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <div className="flex-1">
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
                        className="file:mr-4 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100"
                      />
                      {files.length > 0 && (
                        <div className="text-xs text-gray-600 mt-1">
                          {files.map(file => file.name).join(', ')}
                        </div>
                      )}
                    </div>
                    {uploadedFiles.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-800"
                        onClick={() => {
                          const updatedFiles = uploadedFiles.filter((_, i) => i !== index)
                          setUploadedFiles(updatedFiles.length === 0 ? [[]] : updatedFiles)
                        }}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-xs"
                  onClick={() => setUploadedFiles([...uploadedFiles, []])}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Document Upload
                </Button>
              </div>

              {/* Reference URLs */}
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
                      placeholder={url ? "" : "https://example.com/archetype-resource"}
                      className="flex-1"
                    />
                    {referenceUrls.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-800"
                        onClick={() => {
                          const updatedUrls = referenceUrls.filter((_, i) => i !== index)
                          setReferenceUrls(updatedUrls.length === 0 ? [''] : updatedUrls)
                        }}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-xs"
                  onClick={() => setReferenceUrls([...referenceUrls, ''])}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Reference URL
                </Button>
              </div>

              {/* Text Content Sections */}
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
                      placeholder={content ? "" : `Enter comprehensive content about ${archetypeName}...

This could include:
- Theoretical understanding and psychological insights
- Embodiment practices and exercises
- Integration techniques and shadow work
- Real-world examples and case studies
- Resources and references`}
                      rows={8}
                      className="flex-1 resize-vertical"
                    />
                    {textContents.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-800 mt-1"
                        onClick={() => {
                          const updatedContents = textContents.filter((_, i) => i !== index)
                          setTextContents(updatedContents.length === 0 ? [''] : updatedContents)
                        }}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-xs"
                  onClick={() => setTextContents([...textContents, ''])}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Text Content
                </Button>
              </div>

              {/* Embedding Settings */}
              <div className="pt-6 mt-6 border-t border-gray-100 space-y-4">
                <div className="grid grid-cols-5 gap-3">
                  <div>
                    <Label className="text-xs text-gray-500">Chunk Size</Label>
                    <Input
                      type="number"
                      value={chunkSize}
                      onChange={(e) => setChunkSize(parseInt(e.target.value) || 1000)}
                      className="h-8 text-sm"
                      min="100"
                      max="2000"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Overlap</Label>
                    <Input
                      type="number"
                      value={chunkOverlap}
                      onChange={(e) => setChunkOverlap(parseInt(e.target.value) || 200)}
                      className="h-8 text-sm"
                      min="0"
                      max="500"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Model</Label>
                    <select
                      value={embeddingModel}
                      onChange={(e) => setEmbeddingModel(e.target.value)}
                      className="h-8 text-sm border border-gray-300 rounded-md px-2 w-full"
                    >
                      <option value="text-embedding-3-small">3-small</option>
                      <option value="text-embedding-3-large">3-large</option>
                      <option value="text-embedding-ada-002">ada-002</option>
                    </select>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Top-K</Label>
                    <Input
                      type="number"
                      value={topK}
                      onChange={(e) => setTopK(parseInt(e.target.value) || 10)}
                      className="h-8 text-sm"
                      min="1"
                      max="50"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Threshold</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={similarityThreshold}
                      onChange={(e) => setSimilarityThreshold(parseFloat(e.target.value) || 0.7)}
                      className="h-8 text-sm"
                      min="0.1"
                      max="1.0"
                    />
                  </div>
                </div>
              </div>

              {processingStatus !== 'idle' && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-gray-50">
                  {getStatusIcon()}
                  <span className="text-sm">{statusMessage}</span>
                </div>
              )}

              <Button
                onClick={handleProcessContent}
                disabled={isProcessing || (!textContents.some(content => content.trim()) && !uploadedFiles.some(fileGroup => fileGroup.length > 0))}
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

        {/* Course Content Tab */}
        <TabsContent value="course" className="space-y-4">
          <CourseContentBuilder
            archetypeId={archetypeId}
            archetypeName={archetypeName}
          />
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
      </Tabs>
    </div>
  )
}
