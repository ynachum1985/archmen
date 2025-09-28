'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Image, 
  Video, 
  Wand2, 
  Upload, 
  Download, 
  Copy, 
  Loader2,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react'

interface MediaAsset {
  id: string
  type: 'image' | 'video' | 'animation'
  url: string
  title: string
  description: string
  provider?: string
  model?: string
  createdAt: Date
}

interface EnhancedMediaCreationStudioProps {
  archetypeId: string
  archetypeName: string
  onMediaCreated?: (asset: MediaAsset) => void
}

export function EnhancedMediaCreationStudio({ 
  archetypeId, 
  archetypeName, 
  onMediaCreated 
}: EnhancedMediaCreationStudioProps) {
  const [activeTab, setActiveTab] = useState('image')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedAssets, setGeneratedAssets] = useState<MediaAsset[]>([])
  
  // Image Generation State
  const [imagePrompt, setImagePrompt] = useState('')
  const [imageProvider, setImageProvider] = useState('openai')
  const [imageModel, setImageModel] = useState('dall-e-3')
  
  // Image-to-Video State
  const [selectedImage, setSelectedImage] = useState<string>('')
  const [videoProvider, setVideoProvider] = useState('stable-video')
  const [animationStyle, setAnimationStyle] = useState('subtle')
  const [videoDuration, setVideoDuration] = useState('3')

  const imageProviders = [
    { id: 'openai', name: 'OpenAI DALL-E', models: ['dall-e-3', 'dall-e-2'] },
    { id: 'stability', name: 'Stability AI', models: ['stable-diffusion-xl', 'stable-diffusion-3'] },
    { id: 'midjourney', name: 'Midjourney', models: ['v6', 'v5.2'] },
    { id: 'gemini', name: 'Google Gemini', models: ['imagen-3', 'imagen-2'] }
  ]

  const videoProviders = [
    { id: 'stable-video', name: 'Stable Video Diffusion', cost: '$0.03-0.08' },
    { id: 'luma', name: 'Luma AI Dream Machine', cost: '$0.08-0.15' },
    { id: 'runway', name: 'Runway ML Gen-3', cost: '$0.15-0.30' },
    { id: 'pika', name: 'Pika Labs', cost: '$0.05-0.12' }
  ]

  const animationStyles = [
    { id: 'subtle', name: 'Subtle Movement', description: 'Gentle breathing, eye movement' },
    { id: 'mystical', name: 'Mystical Aura', description: 'Glowing effects, energy flow' },
    { id: 'dynamic', name: 'Dynamic Motion', description: 'More pronounced movement' },
    { id: 'ethereal', name: 'Ethereal Flow', description: 'Floating, dreamlike motion' }
  ]

  const generateImage = async () => {
    if (!imagePrompt.trim()) return

    setIsGenerating(true)
    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `${imagePrompt} - ${archetypeName} archetype style`,
          provider: imageProvider,
          model: imageModel,
          archetype: archetypeName
        })
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error)

      const newAsset: MediaAsset = {
        id: `img-${Date.now()}`,
        type: 'image',
        url: data.imageUrl,
        title: `${archetypeName} Image`,
        description: imagePrompt,
        provider: imageProvider,
        model: imageModel,
        createdAt: new Date()
      }

      setGeneratedAssets(prev => [newAsset, ...prev])
      onMediaCreated?.(newAsset)
    } catch (error) {
      console.error('Error generating image:', error)
      alert('Error generating image. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  const generateAnimation = async () => {
    if (!selectedImage) return

    setIsGenerating(true)
    try {
      const response = await fetch('/api/generate-animation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: selectedImage,
          provider: videoProvider,
          style: animationStyle,
          duration: parseInt(videoDuration),
          archetype: archetypeName
        })
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error)

      const newAsset: MediaAsset = {
        id: `anim-${Date.now()}`,
        type: 'animation',
        url: data.videoUrl,
        title: `${archetypeName} Animation`,
        description: `Animated version with ${animationStyle} style`,
        provider: videoProvider,
        createdAt: new Date()
      }

      setGeneratedAssets(prev => [newAsset, ...prev])
      onMediaCreated?.(newAsset)
    } catch (error) {
      console.error('Error generating animation:', error)
      alert('Error generating animation. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url)
    // Could add toast notification here
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="image" className="flex items-center gap-2">
            <Image className="h-4 w-4" />
            Generate Images
          </TabsTrigger>
          <TabsTrigger value="animate" className="flex items-center gap-2">
            <Video className="h-4 w-4" />
            Animate Images
          </TabsTrigger>
          <TabsTrigger value="gallery" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Gallery
          </TabsTrigger>
        </TabsList>

        {/* Image Generation Tab */}
        <TabsContent value="image" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Generate Archetype Images</CardTitle>
              <CardDescription>
                Create visual representations of {archetypeName} using AI image generation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Image Description</Label>
                <Textarea
                  value={imagePrompt}
                  onChange={(e) => setImagePrompt(e.target.value)}
                  placeholder={`Describe the visual representation of ${archetypeName}...`}
                  rows={3}
                  className="resize-y overflow-auto max-h-32"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>AI Provider</Label>
                  <Select value={imageProvider} onValueChange={setImageProvider}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {imageProviders.map(provider => (
                        <SelectItem key={provider.id} value={provider.id}>
                          {provider.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Model</Label>
                  <Select value={imageModel} onValueChange={setImageModel}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {imageProviders
                        .find(p => p.id === imageProvider)
                        ?.models.map(model => (
                          <SelectItem key={model} value={model}>
                            {model}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button 
                onClick={generateImage}
                disabled={isGenerating || !imagePrompt.trim()}
                className="w-full"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Wand2 className="h-4 w-4 mr-2" />
                    Generate Image
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Animation Tab */}
        <TabsContent value="animate" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Animate Images</CardTitle>
              <CardDescription>
                Transform static images into living, breathing animations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Select Image to Animate</Label>
                <Select value={selectedImage} onValueChange={setSelectedImage}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose an image to animate" />
                  </SelectTrigger>
                  <SelectContent>
                    {generatedAssets
                      .filter(asset => asset.type === 'image')
                      .map(asset => (
                        <SelectItem key={asset.id} value={asset.url}>
                          {asset.title}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Animation Provider</Label>
                  <Select value={videoProvider} onValueChange={setVideoProvider}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {videoProviders.map(provider => (
                        <SelectItem key={provider.id} value={provider.id}>
                          <div className="flex justify-between items-center w-full">
                            <span>{provider.name}</span>
                            <span className="text-xs text-gray-500">{provider.cost}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Animation Style</Label>
                  <Select value={animationStyle} onValueChange={setAnimationStyle}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {animationStyles.map(style => (
                        <SelectItem key={style.id} value={style.id}>
                          <div>
                            <div className="font-medium">{style.name}</div>
                            <div className="text-xs text-gray-500">{style.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Duration (seconds)</Label>
                <Select value={videoDuration} onValueChange={setVideoDuration}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3 seconds</SelectItem>
                    <SelectItem value="5">5 seconds</SelectItem>
                    <SelectItem value="8">8 seconds</SelectItem>
                    <SelectItem value="10">10 seconds</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                onClick={generateAnimation}
                disabled={isGenerating || !selectedImage}
                className="w-full"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating Animation...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Animate Image
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Gallery Tab */}
        <TabsContent value="gallery" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Content Gallery</CardTitle>
              <CardDescription>
                All generated content for {archetypeName}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {generatedAssets.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Image className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>No content generated yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {generatedAssets.map(asset => (
                    <div key={asset.id} className="border rounded-lg p-4 space-y-3">
                      <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                        {asset.type === 'image' ? (
                          <img 
                            src={asset.url} 
                            alt={asset.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <video 
                            src={asset.url} 
                            className="w-full h-full object-cover"
                            controls
                            muted
                            loop
                          />
                        )}
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-sm">{asset.title}</h4>
                        <p className="text-xs text-gray-500 truncate">{asset.description}</p>
                        {asset.provider && (
                          <p className="text-xs text-blue-600">{asset.provider}</p>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => copyToClipboard(asset.url)}
                          className="flex-1"
                        >
                          <Copy className="h-3 w-3 mr-1" />
                          Copy URL
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="flex-1"
                        >
                          <Download className="h-3 w-3 mr-1" />
                          Download
                        </Button>
                      </div>
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
