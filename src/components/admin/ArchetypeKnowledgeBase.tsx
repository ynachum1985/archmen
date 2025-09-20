'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Upload, FileText, Link, TestTube, Loader2, CheckCircle, AlertCircle, Plus, Minus, File, Image, Palette, Wand2 } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { EmbeddingSettingsDialog } from './EmbeddingSettingsDialog'
import { ArchetypeContentDisplay } from './ArchetypeContentDisplay'
import { ArchetypeFileUploadService, UploadedFile } from '@/lib/services/archetype-file-upload.service'
import { LLM_PROVIDERS, type LLMProvider, multiLLMService } from '@/lib/services/multi-llm.service'

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
    const hasTextContent = textContent.trim()
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

      let combinedContent = textContent

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
        <TabsList className="grid w-full grid-cols-4">
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
          <TabsTrigger value="images" className="flex items-center gap-2">
            <File className="h-4 w-4" />
            Images & Graphics
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
                  rows={8}
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
                disabled={isProcessing || (!textContent.trim() && !uploadedFiles.some(fileGroup => fileGroup.length > 0))}
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
