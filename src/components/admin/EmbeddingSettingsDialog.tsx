"use client"

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Sparkles, Settings, TestTube, Save } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface EmbeddingSettings {
  chunkSize: number
  chunkOverlap: number
  embeddingModel: string
  temperature: number
  maxTokens: number
  enableSemanticSearch: boolean
  customInstructions: string
  contextWindow: number
}

interface EmbeddingSettingsDialogProps {
  trigger: React.ReactNode
  title: string
  description: string
  itemId: string
  itemType: 'archetype' | 'ai-personality'
  onSave?: (settings: EmbeddingSettings) => void
}

export function EmbeddingSettingsDialog({ 
  trigger, 
  title, 
  description, 
  itemId, 
  itemType, 
  onSave 
}: EmbeddingSettingsDialogProps) {
  const [open, setOpen] = useState(false)
  const [settings, setSettings] = useState<EmbeddingSettings>({
    chunkSize: 1000,
    chunkOverlap: 200,
    embeddingModel: 'text-embedding-3-small',
    temperature: 0.7,
    maxTokens: 2000,
    enableSemanticSearch: true,
    customInstructions: '',
    contextWindow: 4000
  })
  const [isGenerating, setIsGenerating] = useState(false)
  const [isTesting, setIsTesting] = useState(false)

  const handleSave = () => {
    onSave?.(settings)
    setOpen(false)
  }

  const handleGenerateEmbeddings = async () => {
    setIsGenerating(true)
    try {
      // TODO: Implement embedding generation for specific item
      console.log(`Generating embeddings for ${itemType} ${itemId} with settings:`, settings)
      await new Promise(resolve => setTimeout(resolve, 2000)) // Simulate API call
    } catch (error) {
      console.error('Error generating embeddings:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleTestEmbeddings = async () => {
    setIsTesting(true)
    try {
      // TODO: Implement embedding testing
      console.log(`Testing embeddings for ${itemType} ${itemId}`)
      await new Promise(resolve => setTimeout(resolve, 1500)) // Simulate API call
    } catch (error) {
      console.error('Error testing embeddings:', error)
    } finally {
      setIsTesting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-white border border-gray-200 shadow-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-emerald-500" />
            {title} - Embedding Settings
          </DialogTitle>
          <DialogDescription>
            {description}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="config" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="config" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Configuration
            </TabsTrigger>
            <TabsTrigger value="testing" className="flex items-center gap-2">
              <TestTube className="h-4 w-4" />
              Testing
            </TabsTrigger>
          </TabsList>

          <TabsContent value="config" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Chunking Strategy</CardTitle>
                <CardDescription>Configure how content is split for embedding</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Chunk Size: {settings.chunkSize} characters</Label>
                  <div className="flex items-center space-x-2">
                    <Slider
                      value={[settings.chunkSize]}
                      onValueChange={([value]) => setSettings(prev => ({ ...prev, chunkSize: value }))}
                      max={2000}
                      min={200}
                      step={100}
                      className="flex-1"
                    />
                    <Input
                      type="number"
                      value={settings.chunkSize}
                      onChange={(e) => setSettings(prev => ({ ...prev, chunkSize: parseInt(e.target.value) || 1000 }))}
                      min={200}
                      max={2000}
                      className="w-20"
                    />
                  </div>
                  <p className="text-xs text-gray-500">Recommended: 800-1200 characters for category content</p>
                </div>
                <div className="space-y-2">
                  <Label>Chunk Overlap: {settings.chunkOverlap} characters</Label>
                  <div className="flex items-center space-x-2">
                    <Slider
                      value={[settings.chunkOverlap]}
                      onValueChange={([value]) => setSettings(prev => ({ ...prev, chunkOverlap: value }))}
                      max={500}
                      min={0}
                      step={50}
                      className="flex-1"
                    />
                    <Input
                      type="number"
                      value={settings.chunkOverlap}
                      onChange={(e) => setSettings(prev => ({ ...prev, chunkOverlap: parseInt(e.target.value) || 200 }))}
                      min={0}
                      max={500}
                      className="w-20"
                    />
                  </div>
                  <p className="text-xs text-gray-500">Overlap helps maintain context between chunks</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Model Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Embedding Model</Label>
                  <Select value={settings.embeddingModel} onValueChange={(value) => setSettings(prev => ({ ...prev, embeddingModel: value }))}>
                    <SelectTrigger>
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
                  <Label>Context Window: {settings.contextWindow} tokens</Label>
                  <div className="flex items-center space-x-2">
                    <Slider
                      value={[settings.contextWindow]}
                      onValueChange={([value]) => setSettings(prev => ({ ...prev, contextWindow: value }))}
                      max={8000}
                      min={1000}
                      step={500}
                      className="flex-1"
                    />
                    <Input
                      type="number"
                      value={settings.contextWindow}
                      onChange={(e) => setSettings(prev => ({ ...prev, contextWindow: parseInt(e.target.value) || 4000 }))}
                      min={1000}
                      max={8000}
                      className="w-20"
                    />
                  </div>
                  <p className="text-xs text-gray-500">Maximum tokens for AI context processing</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={settings.enableSemanticSearch}
                      onCheckedChange={(checked) => setSettings(prev => ({ ...prev, enableSemanticSearch: checked }))}
                      className="data-[state=checked]:bg-blue-600"
                    />
                    <Label className="font-medium">Enable Semantic Search</Label>
                  </div>
                  <p className="text-xs text-gray-600 ml-6">
                    Uses vector embeddings to find semantically similar content rather than just keyword matching.
                    This provides more contextually relevant results but requires more processing power.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Custom Instructions</CardTitle>
                <CardDescription>Additional context for this specific {itemType}</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={settings.customInstructions}
                  onChange={(e) => setSettings(prev => ({ ...prev, customInstructions: e.target.value }))}
                  placeholder={`Enter custom instructions for ${itemType} embeddings...`}
                  rows={4}
                />
              </CardContent>
            </Card>
          </TabsContent>


          <TabsContent value="testing" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Test Embeddings</CardTitle>
                <CardDescription>Test the quality of generated embeddings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Test Query</Label>
                  <Input placeholder="Enter a test query to search..." />
                </div>
                <Button 
                  onClick={handleTestEmbeddings}
                  disabled={isTesting}
                  variant="outline"
                  className="w-full"
                >
                  <TestTube className="h-4 w-4 mr-2" />
                  {isTesting ? 'Testing...' : 'Test Search'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} className="bg-emerald-500 hover:bg-emerald-600">
            <Save className="h-4 w-4 mr-2" />
            Save Settings
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
