'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { 
  Image, 
  Video, 
  User, 
  Wand2, 
  Loader2, 
  Download, 
  Copy, 
  Check,
  Palette,
  Play,
  Camera
} from 'lucide-react'

interface MediaAsset {
  id: string
  type: 'image' | 'video' | 'audio' | 'document'
  url: string
  title: string
  description?: string
}

interface MediaCreationStudioProps {
  onMediaCreated: (asset: MediaAsset) => void
  archetypeName: string
  sectionType: 'theory' | 'practice' | 'reflection' | 'integration'
}

export function MediaCreationStudio({ onMediaCreated, archetypeName, sectionType }: MediaCreationStudioProps) {
  const [activeTab, setActiveTab] = useState('image')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedAssets, setGeneratedAssets] = useState<MediaAsset[]>([])
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null)

  // Image Generation State
  const [imagePrompt, setImagePrompt] = useState('')
  const [imageStyle, setImageStyle] = useState('mystical')
  const [imageSize, setImageSize] = useState('1024x1024')

  // Avatar Generation State
  const [avatarText, setAvatarText] = useState('')
  const [avatarVoice, setAvatarVoice] = useState('female-1')
  const [avatarStyle, setAvatarStyle] = useState('professional')

  // Video Generation State
  const [videoPrompt, setVideoPrompt] = useState('')
  const [videoDuration, setVideoDuration] = useState('5')
  const [videoStyle, setVideoStyle] = useState('cinematic')

  useEffect(() => {
    // Set default prompts based on archetype and section type
    const defaultImagePrompt = getDefaultImagePrompt(archetypeName, sectionType)
    const defaultAvatarText = getDefaultAvatarText(archetypeName, sectionType)
    const defaultVideoPrompt = getDefaultVideoPrompt(archetypeName, sectionType)
    
    setImagePrompt(defaultImagePrompt)
    setAvatarText(defaultAvatarText)
    setVideoPrompt(defaultVideoPrompt)
  }, [archetypeName, sectionType])

  const getDefaultImagePrompt = (archetype: string, section: string) => {
    const prompts = {
      theory: `A symbolic representation of ${archetype} archetype showing its core essence and wisdom`,
      practice: `An inspiring scene showing someone practicing ${archetype} archetype principles in daily life`,
      reflection: `A peaceful, contemplative scene representing inner reflection on ${archetype} archetype`,
      integration: `A dynamic scene showing ${archetype} archetype being integrated into real-world situations`
    }
    return prompts[section] || prompts.theory
  }

  const getDefaultAvatarText = (archetype: string, section: string) => {
    const texts = {
      theory: `Welcome to understanding the ${archetype} archetype. This powerful pattern represents deep wisdom and transformation.`,
      practice: `Let's explore practical exercises to embody the ${archetype} archetype in your daily life.`,
      reflection: `Take a moment to reflect on how the ${archetype} archetype shows up in your personal journey.`,
      integration: `Now we'll learn how to integrate the ${archetype} archetype into your relationships and work.`
    }
    return texts[section] || texts.theory
  }

  const getDefaultVideoPrompt = (archetype: string, section: string) => {
    const prompts = {
      theory: `A gentle, flowing animation representing the essence of ${archetype} archetype with symbolic imagery`,
      practice: `A motivational sequence showing transformation and growth related to ${archetype} archetype`,
      reflection: `A calm, meditative visual journey exploring the depths of ${archetype} archetype`,
      integration: `An uplifting montage showing ${archetype} archetype principles in action in various life scenarios`
    }
    return prompts[section] || prompts.theory
  }

  const generateImage = async () => {
    if (!imagePrompt.trim()) return

    setIsGenerating(true)
    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: imagePrompt,
          provider: 'openai',
          model: 'dall-e-3',
          size: imageSize,
          quality: 'standard',
          style: imageStyle === 'mystical' ? 'vivid' : 'natural'
        })
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error)

      const newAsset: MediaAsset = {
        id: `img-${Date.now()}`,
        type: 'image',
        url: data.imageUrl,
        title: `${archetypeName} ${sectionType} Image`,
        description: imagePrompt
      }

      setGeneratedAssets(prev => [...prev, newAsset])
    } catch (error) {
      console.error('Error generating image:', error)
      alert('Failed to generate image. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  const generateAvatar = async () => {
    if (!avatarText.trim()) return

    setIsGenerating(true)
    try {
      // Using D-ID API for avatar generation
      const response = await fetch('/api/generate-avatar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: avatarText,
          voice: avatarVoice,
          style: avatarStyle,
          archetype: archetypeName
        })
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error)

      const newAsset: MediaAsset = {
        id: `avatar-${Date.now()}`,
        type: 'video',
        url: data.videoUrl,
        title: `${archetypeName} ${sectionType} Avatar`,
        description: avatarText
      }

      setGeneratedAssets(prev => [...prev, newAsset])
    } catch (error) {
      console.error('Error generating avatar:', error)
      alert('Avatar generation coming soon! This feature is being implemented.')
    } finally {
      setIsGenerating(false)
    }
  }

  const generateVideo = async () => {
    if (!videoPrompt.trim()) return

    setIsGenerating(true)
    try {
      // Using Runway ML or similar API for video generation
      const response = await fetch('/api/generate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: videoPrompt,
          duration: parseInt(videoDuration),
          style: videoStyle,
          archetype: archetypeName
        })
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error)

      const newAsset: MediaAsset = {
        id: `video-${Date.now()}`,
        type: 'video',
        url: data.videoUrl,
        title: `${archetypeName} ${sectionType} Video`,
        description: videoPrompt
      }

      setGeneratedAssets(prev => [...prev, newAsset])
    } catch (error) {
      console.error('Error generating video:', error)
      alert('Video generation coming soon! This feature is being implemented.')
    } finally {
      setIsGenerating(false)
    }
  }

  const copyToClipboard = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url)
      setCopiedUrl(url)
      setTimeout(() => setCopiedUrl(null), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  const useAsset = (asset: MediaAsset) => {
    onMediaCreated(asset)
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Media Creation Studio</h3>
        <p className="text-sm text-gray-600">
          Create custom images, avatars, and videos for your {archetypeName} {sectionType} section
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="image" className="flex items-center gap-2">
            <Image className="h-4 w-4" />
            Images
          </TabsTrigger>
          <TabsTrigger value="avatar" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Avatars
          </TabsTrigger>
          <TabsTrigger value="video" className="flex items-center gap-2">
            <Video className="h-4 w-4" />
            Videos
          </TabsTrigger>
        </TabsList>

        {/* Image Generation */}
        <TabsContent value="image" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                AI Image Generation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Image Description</Label>
                <Textarea
                  value={imagePrompt}
                  onChange={(e) => setImagePrompt(e.target.value)}
                  placeholder="Describe the image you want to create..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Style</Label>
                  <Select value={imageStyle} onValueChange={setImageStyle}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mystical">Mystical</SelectItem>
                      <SelectItem value="modern">Modern</SelectItem>
                      <SelectItem value="artistic">Artistic</SelectItem>
                      <SelectItem value="nature">Nature</SelectItem>
                      <SelectItem value="geometric">Geometric</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Size</Label>
                  <Select value={imageSize} onValueChange={setImageSize}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1024x1024">Square (1024x1024)</SelectItem>
                      <SelectItem value="1792x1024">Landscape (1792x1024)</SelectItem>
                      <SelectItem value="1024x1792">Portrait (1024x1792)</SelectItem>
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
                    Generating Image...
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

        {/* Avatar Generation */}
        <TabsContent value="avatar" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5" />
                AI Avatar Generation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Avatar Script</Label>
                <Textarea
                  value={avatarText}
                  onChange={(e) => setAvatarText(e.target.value)}
                  placeholder="Enter the text for your avatar to speak..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Voice</Label>
                  <Select value={avatarVoice} onValueChange={setAvatarVoice}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="female-1">Female Voice 1</SelectItem>
                      <SelectItem value="female-2">Female Voice 2</SelectItem>
                      <SelectItem value="male-1">Male Voice 1</SelectItem>
                      <SelectItem value="male-2">Male Voice 2</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Style</Label>
                  <Select value={avatarStyle} onValueChange={setAvatarStyle}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="friendly">Friendly</SelectItem>
                      <SelectItem value="wise">Wise Teacher</SelectItem>
                      <SelectItem value="energetic">Energetic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button 
                onClick={generateAvatar} 
                disabled={isGenerating || !avatarText.trim()}
                className="w-full"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating Avatar...
                  </>
                ) : (
                  <>
                    <User className="h-4 w-4 mr-2" />
                    Generate Avatar
                  </>
                )}
              </Button>

              <div className="text-xs text-gray-500 p-3 bg-blue-50 rounded">
                <strong>Coming Soon:</strong> AI-powered avatar generation with D-ID integration for creating talking head videos from your text.
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Video Generation */}
        <TabsContent value="video" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Play className="h-5 w-5" />
                AI Video Generation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Video Description</Label>
                <Textarea
                  value={videoPrompt}
                  onChange={(e) => setVideoPrompt(e.target.value)}
                  placeholder="Describe the video you want to create..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Duration (seconds)</Label>
                  <Select value={videoDuration} onValueChange={setVideoDuration}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3 seconds</SelectItem>
                      <SelectItem value="5">5 seconds</SelectItem>
                      <SelectItem value="10">10 seconds</SelectItem>
                      <SelectItem value="15">15 seconds</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Style</Label>
                  <Select value={videoStyle} onValueChange={setVideoStyle}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cinematic">Cinematic</SelectItem>
                      <SelectItem value="animated">Animated</SelectItem>
                      <SelectItem value="abstract">Abstract</SelectItem>
                      <SelectItem value="realistic">Realistic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button 
                onClick={generateVideo} 
                disabled={isGenerating || !videoPrompt.trim()}
                className="w-full"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating Video...
                  </>
                ) : (
                  <>
                    <Video className="h-4 w-4 mr-2" />
                    Generate Video
                  </>
                )}
              </Button>

              <div className="text-xs text-gray-500 p-3 bg-purple-50 rounded">
                <strong>Coming Soon:</strong> AI video generation with Runway ML and Pika Labs integration for creating custom video content.
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Generated Assets */}
      {generatedAssets.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Generated Media</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {generatedAssets.map((asset) => (
                <div key={asset.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">{asset.type}</Badge>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(asset.url)}
                      >
                        {copiedUrl === asset.url ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => useAsset(asset)}
                      >
                        Use Asset
                      </Button>
                    </div>
                  </div>
                  
                  {asset.type === 'image' && (
                    <img 
                      src={asset.url} 
                      alt={asset.title}
                      className="w-full h-32 object-cover rounded"
                    />
                  )}
                  
                  <div>
                    <h4 className="font-medium text-sm">{asset.title}</h4>
                    <p className="text-xs text-gray-600 line-clamp-2">{asset.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
