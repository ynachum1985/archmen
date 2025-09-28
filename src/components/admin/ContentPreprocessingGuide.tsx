'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  FileText, 
  Settings, 
  TestTube, 
  Zap, 
  CheckCircle, 
  AlertTriangle,
  Info,
  Target,
  Brain,
  Database
} from 'lucide-react'

interface ContentPreprocessingGuideProps {
  contentType: 'archetype' | 'assessment'
}

export function ContentPreprocessingGuide({ contentType }: ContentPreprocessingGuideProps) {
  const [activeTab, setActiveTab] = useState('overview')

  const isArchetype = contentType === 'archetype'

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Brain className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h2 className="text-xl font-semibold">
            {isArchetype ? 'Archetype' : 'Assessment'} Content Preprocessing Guide
          </h2>
          <p className="text-gray-600 text-sm">
            Optimize your content for better embedding quality and retrieval performance
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="preprocessing">Preprocessing</TabsTrigger>
          <TabsTrigger value="testing">Testing</TabsTrigger>
          <TabsTrigger value="optimization">Optimization</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                Content Preprocessing Overview
              </CardTitle>
              <CardDescription>
                How content preprocessing improves embedding quality for {isArchetype ? 'archetype' : 'assessment'} knowledge bases
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Automatic Preprocessing:</strong> Your content is automatically cleaned and optimized during upload.
                  This includes whitespace normalization, special character removal, and text length optimization.
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="border-green-200 bg-green-50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm text-green-800">✅ What's Included</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="text-sm text-green-700">
                      • Whitespace normalization
                      • Special character cleaning
                      • Text length optimization (8000 chars max)
                      • Metadata extraction and tagging
                      • Chunk size optimization
                      • Overlap management
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-blue-200 bg-blue-50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm text-blue-800">🎯 Benefits</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="text-sm text-blue-700">
                      • Better semantic understanding
                      • Improved retrieval accuracy
                      • Consistent embedding quality
                      • Reduced noise in vectors
                      • Optimized chunk boundaries
                      • Enhanced search relevance
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preprocessing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Content Preprocessing Steps
              </CardTitle>
              <CardDescription>
                Detailed breakdown of how your content is processed
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 border rounded-lg">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-blue-600">1</span>
                  </div>
                  <div>
                    <h4 className="font-medium">Text Cleaning</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Removes unnecessary characters, normalizes whitespace, and ensures consistent formatting.
                    </p>
                    <Badge variant="outline" className="mt-2">Automatic</Badge>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 border rounded-lg">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-blue-600">2</span>
                  </div>
                  <div>
                    <h4 className="font-medium">Chunking Strategy</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Splits content into optimal chunks with configurable size and overlap for better context preservation.
                    </p>
                    <div className="flex gap-2 mt-2">
                      <Badge variant="outline">Configurable</Badge>
                      <Badge variant="secondary">Default: 1000 tokens</Badge>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 border rounded-lg">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-blue-600">3</span>
                  </div>
                  <div>
                    <h4 className="font-medium">Metadata Enhancement</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Adds contextual metadata including {isArchetype ? 'archetype name, category' : 'assessment type, theme'}, source information, and processing timestamps.
                    </p>
                    <Badge variant="outline" className="mt-2">Automatic</Badge>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 border rounded-lg">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-blue-600">4</span>
                  </div>
                  <div>
                    <h4 className="font-medium">Embedding Generation</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Generates high-quality vector embeddings using your selected model (Mistral, Voyage AI, or OpenAI).
                    </p>
                    <div className="flex gap-2 mt-2">
                      <Badge variant="outline">Model Selection</Badge>
                      <Badge variant="secondary">Default: Mistral Embed</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="testing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TestTube className="h-5 w-5" />
                Embed Quality Testing
              </CardTitle>
              <CardDescription>
                How to test and validate your embedding quality
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert>
                <Target className="h-4 w-4" />
                <AlertDescription>
                  <strong>Built-in Testing:</strong> Use the "Test Embed Quality" feature in your knowledge base to validate retrieval performance with real queries.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div className="p-4 border rounded-lg bg-gray-50">
                  <h4 className="font-medium mb-2">📍 Where to Find Testing</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    In your {isArchetype ? 'Archetype' : 'Assessment'} Knowledge Base, scroll down to find the "Test Embed Quality" section.
                  </p>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Enter test queries related to your content</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>View similarity scores and retrieved chunks</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Validate that relevant content is being found</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="border-green-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-green-800">Good Test Queries</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        {isArchetype ? (
                          <>
                            <div>• "What are the core traits of this archetype?"</div>
                            <div>• "How does this archetype behave in relationships?"</div>
                            <div>• "What are the shadow aspects?"</div>
                            <div>• "Integration practices for this archetype"</div>
                          </>
                        ) : (
                          <>
                            <div>• "What questions explore emotional patterns?"</div>
                            <div>• "How to assess relationship dynamics?"</div>
                            <div>• "Communication style indicators"</div>
                            <div>• "Conflict resolution approaches"</div>
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-orange-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-orange-800">Quality Indicators</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div>• Similarity scores {'>'}0.7 for relevant content</div>
                        <div>• Retrieved chunks match query intent</div>
                        <div>• No irrelevant content in top results</div>
                        <div>• Consistent performance across queries</div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="optimization" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Optimization Strategies
              </CardTitle>
              <CardDescription>
                How to improve embedding performance over time
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="border-blue-200 bg-blue-50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm text-blue-800">🔄 Model Optimization</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-sm text-blue-700">
                      <strong>Start:</strong> Mistral Embed (cost-effective)
                    </div>
                    <div className="text-sm text-blue-700">
                      <strong>Test:</strong> Voyage AI for better relevance
                    </div>
                    <div className="text-sm text-blue-700">
                      <strong>Premium:</strong> OpenAI 3-large for maximum quality
                    </div>
                    <Badge variant="outline" className="text-xs">A/B Test Different Models</Badge>
                  </CardContent>
                </Card>

                <Card className="border-purple-200 bg-purple-50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm text-purple-800">⚙️ Content Optimization</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-sm text-purple-700">
                      <strong>Quality:</strong> Remove noise, improve formatting
                    </div>
                    <div className="text-sm text-purple-700">
                      <strong>Structure:</strong> Add clear headings and sections
                    </div>
                    <div className="text-sm text-purple-700">
                      <strong>Context:</strong> Include relevant metadata
                    </div>
                    <Badge variant="outline" className="text-xs">Re-embed After Improvements</Badge>
                  </CardContent>
                </Card>
              </div>

              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Re-embedding Required:</strong> When you change models or significantly improve content quality, 
                  you'll need to re-process your content to generate new embeddings. The system will replace old embeddings automatically.
                </AlertDescription>
              </Alert>

              <div className="p-4 border rounded-lg bg-green-50">
                <h4 className="font-medium text-green-800 mb-2">🎯 Optimization Workflow</h4>
                <div className="space-y-2 text-sm text-green-700">
                  <div>1. <strong>Baseline:</strong> Start with Mistral Embed and test quality</div>
                  <div>2. <strong>Measure:</strong> Use test queries to establish performance metrics</div>
                  <div>3. <strong>Experiment:</strong> Try different models and chunk sizes</div>
                  <div>4. <strong>Compare:</strong> A/B test retrieval quality between configurations</div>
                  <div>5. <strong>Optimize:</strong> Switch to best-performing setup</div>
                  <div>6. <strong>Monitor:</strong> Continuously test with new content</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
