'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Input } from '@/components/ui/input'
import { Zap, DollarSign, Clock, BarChart3, TestTube } from 'lucide-react'
import { LLMProvider, LLMConfig, multiLLMService, LLM_PROVIDERS } from '@/lib/services/multi-llm.service'

interface TestResult {
  provider: LLMProvider
  model: string
  response: string
  cost?: number
  responseTime: number
  usage?: {
    inputTokens: number
    outputTokens: number
    totalTokens: number
  }
}

export function LLMTestingInterface() {
  const [selectedProvider, setSelectedProvider] = useState<LLMProvider>('openai')
  const [selectedModel, setSelectedModel] = useState<string>('')
  const [temperature, setTemperature] = useState<number>(0.7)
  const [maxTokens, setMaxTokens] = useState<number>(2000)
  const [testPrompt, setTestPrompt] = useState<string>(`You are an expert in relationship psychology. A user says: "I feel like I'm always the one giving in relationships, but I never get the same energy back."

Please provide a thoughtful response that:
1. Acknowledges their feelings
2. Offers psychological insight
3. Suggests practical steps
4. Asks a follow-up question

Keep it under 200 words.`)
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [availableProviders, setAvailableProviders] = useState<LLMProvider[]>([])

  useEffect(() => {
    const service = multiLLMService.getInstance()
    const providers = service.getAvailableProviders()
    setAvailableProviders(providers)
    
    if (providers.length > 0 && !selectedProvider) {
      setSelectedProvider(providers[0])
    }
  }, [selectedProvider])

  useEffect(() => {
    if (selectedProvider) {
      const service = multiLLMService.getInstance()
      const models = service.getProviderModels(selectedProvider)
      if (models.length > 0 && !selectedModel) {
        setSelectedModel(models[0])
      }
    }
  }, [selectedProvider, selectedModel])

  const runSingleTest = async () => {
    if (!selectedProvider || !selectedModel || !testPrompt.trim()) return

    setIsLoading(true)
    try {
      const service = multiLLMService.getInstance()
      const startTime = Date.now()
      
      const config: LLMConfig = {
        provider: selectedProvider,
        model: selectedModel,
        temperature,
        maxTokens
      }

      const result = await service.generateChatCompletion([
        { role: 'user', content: testPrompt }
      ], config)

      const responseTime = Date.now() - startTime

      const testResult: TestResult = {
        provider: selectedProvider,
        model: selectedModel,
        response: result.content,
        cost: result.cost,
        responseTime,
        usage: result.usage
      }

      setTestResults(prev => [testResult, ...prev])
    } catch (error) {
      console.error('Test failed:', error)
      alert(`Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsLoading(false)
    }
  }

  const runComparativeTest = async () => {
    setIsLoading(true)
    const results: TestResult[] = []

    // Test configurations for comparison
    const testConfigs = [
      { provider: 'openai' as LLMProvider, model: 'gpt-4-turbo-preview' },
      { provider: 'openai' as LLMProvider, model: 'gpt-3.5-turbo' },
      { provider: 'anthropic' as LLMProvider, model: 'claude-3-5-sonnet-20241022' },
      { provider: 'anthropic' as LLMProvider, model: 'claude-3-haiku-20240307' },
      { provider: 'kimi' as LLMProvider, model: 'moonshot-v1-8k' }
    ]

    for (const config of testConfigs) {
      if (!availableProviders.includes(config.provider)) continue

      try {
        const service = multiLLMService.getInstance()
        const startTime = Date.now()
        
        const fullConfig: LLMConfig = {
          ...config,
          temperature,
          maxTokens
        }

        const result = await service.generateChatCompletion([
          { role: 'user', content: testPrompt }
        ], fullConfig)

        const responseTime = Date.now() - startTime

        results.push({
          provider: config.provider,
          model: config.model,
          response: result.content,
          cost: result.cost,
          responseTime,
          usage: result.usage
        })

        // Small delay between requests
        await new Promise(resolve => setTimeout(resolve, 500))
      } catch (error) {
        console.error(`Test failed for ${config.provider}/${config.model}:`, error)
      }
    }

    setTestResults(prev => [...results, ...prev])
    setIsLoading(false)
  }

  const clearResults = () => {
    setTestResults([])
  }

  const getProviderColor = (provider: LLMProvider) => {
    const colors = {
      openai: 'bg-green-100 text-green-800',
      anthropic: 'bg-orange-100 text-orange-800',
      kimi: 'bg-blue-100 text-blue-800',
      local: 'bg-purple-100 text-purple-800'
    }
    return colors[provider]
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">LLM Testing Interface</h2>
          <p className="text-gray-600 mt-1">Test and compare different language models for your assessments</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={runComparativeTest}
            disabled={isLoading || !testPrompt.trim()}
            className="flex items-center gap-2"
          >
            <BarChart3 className="h-4 w-4" />
            {isLoading ? 'Testing...' : 'Compare All'}
          </Button>
          <Button
            onClick={clearResults}
            variant="outline"
            disabled={testResults.length === 0}
          >
            Clear Results
          </Button>
        </div>
      </div>

      <Tabs defaultValue="single" className="space-y-4">
        <TabsList>
          <TabsTrigger value="single">Single Test</TabsTrigger>
          <TabsTrigger value="results">Results ({testResults.length})</TabsTrigger>
          <TabsTrigger value="pricing">Pricing Comparison</TabsTrigger>
        </TabsList>

        <TabsContent value="single" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Test Configuration</CardTitle>
                <CardDescription>Configure the LLM and parameters for testing</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Provider</Label>
                    <Select value={selectedProvider} onValueChange={(value) => setSelectedProvider(value as LLMProvider)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {availableProviders.map(provider => (
                          <SelectItem key={provider} value={provider}>
                            {LLM_PROVIDERS[provider].name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Model</Label>
                    <Select value={selectedModel} onValueChange={setSelectedModel}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {selectedProvider && multiLLMService.getInstance().getProviderModels(selectedProvider).map(model => (
                          <SelectItem key={model} value={model}>
                            {model}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Temperature: {temperature}</Label>
                  <Slider
                    value={[temperature]}
                    onValueChange={(value) => setTemperature(value[0])}
                    max={2}
                    min={0}
                    step={0.1}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Max Tokens</Label>
                  <Input
                    type="number"
                    value={maxTokens}
                    onChange={(e) => setMaxTokens(parseInt(e.target.value) || 2000)}
                    min={100}
                    max={4000}
                  />
                </div>

                <Button
                  onClick={runSingleTest}
                  disabled={isLoading || !testPrompt.trim()}
                  className="w-full flex items-center gap-2"
                >
                  <TestTube className="h-4 w-4" />
                  {isLoading ? 'Testing...' : 'Run Test'}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Test Prompt</CardTitle>
                <CardDescription>Enter the prompt you want to test across different models</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={testPrompt}
                  onChange={(e) => setTestPrompt(e.target.value)}
                  placeholder="Enter your test prompt here..."
                  className="min-h-[300px] resize-y"
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="results" className="space-y-4">
          {testResults.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-gray-500">No test results yet. Run a test to see results here.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {testResults.map((result, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge className={getProviderColor(result.provider)}>
                          {LLM_PROVIDERS[result.provider].name}
                        </Badge>
                        <span className="font-medium">{result.model}</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        {result.cost && (
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            ${result.cost.toFixed(4)}
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {result.responseTime}ms
                        </div>
                        {result.usage && (
                          <div className="flex items-center gap-1">
                            <Zap className="h-3 w-3" />
                            {result.usage.totalTokens} tokens
                          </div>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-sm max-w-none">
                      <p className="whitespace-pre-wrap">{result.response}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="pricing" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(LLM_PROVIDERS).map(([provider, config]) => (
              <Card key={provider}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Badge className={getProviderColor(provider as LLMProvider)}>
                      {config.name}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {Object.entries(config.models).map(([model, pricing]) => (
                    <div key={model} className="text-sm">
                      <div className="font-medium">{model}</div>
                      <div className="text-gray-500">
                        {'inputCost' in pricing && 'outputCost' in pricing ? (
                          <>Input: ${pricing.inputCost}/1K • Output: ${pricing.outputCost}/1K</>
                        ) : 'inputCost' in pricing ? (
                          <>Combined: ${pricing.inputCost}/1K tokens</>
                        ) : (
                          'Free (Local)'
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
