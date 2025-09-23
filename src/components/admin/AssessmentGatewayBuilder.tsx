'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Shield, 
  Plus, 
  Trash2, 
  Settings, 
  CheckCircle, 
  XCircle,
  AlertTriangle,
  Brain,
  Clock,
  Heart,
  Lock,
  Unlock,
  ArrowUp,
  ArrowDown
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface GatewayTemplate {
  id: string
  name: string
  description: string
  gateway_type: 'content_integration' | 'emotional_readiness' | 'prerequisite_completion' | 'time_based' | 'ai_verification' | 'custom'
  is_general: boolean
  level_restriction?: number
  configuration: Record<string, any>
  verification_prompt?: string
  success_criteria: Record<string, any>
  failure_actions: Record<string, any>
  is_active: boolean
}

interface GatewayAssignment {
  id: string
  assessment_id: string
  gateway_template_id: string
  is_enabled: boolean
  custom_configuration: Record<string, any>
  order_index: number
  gateway_template: GatewayTemplate
}

interface AssessmentGatewayBuilderProps {
  assessmentId: string
  assessmentLevel: number
  onGatewaysChange?: (gateways: GatewayAssignment[]) => void
}

export function AssessmentGatewayBuilder({ 
  assessmentId, 
  assessmentLevel, 
  onGatewaysChange 
}: AssessmentGatewayBuilderProps) {
  const [gateways, setGateways] = useState<GatewayAssignment[]>([])
  const [availableTemplates, setAvailableTemplates] = useState<GatewayTemplate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAddGateway, setShowAddGateway] = useState(false)
  const [editingGateway, setEditingGateway] = useState<GatewayAssignment | null>(null)

  const supabase = createClient()

  useEffect(() => {
    loadGateways()
    loadAvailableTemplates()
  }, [assessmentId])

  const loadGateways = async () => {
    try {
      const { data, error } = await supabase
        .from('assessment_gateway_assignments')
        .select(`
          *,
          gateway_template:assessment_gateway_templates(*)
        `)
        .eq('assessment_id', assessmentId)
        .order('order_index')

      if (error) throw error
      setGateways(data || [])
      onGatewaysChange?.(data || [])
    } catch (error) {
      console.error('Error loading gateways:', error)
    }
  }

  const loadAvailableTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('assessment_gateway_templates')
        .select('*')
        .eq('is_active', true)
        .or(`level_restriction.is.null,level_restriction.eq.${assessmentLevel}`)
        .order('name')

      if (error) throw error
      setAvailableTemplates(data || [])
    } catch (error) {
      console.error('Error loading templates:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const addGateway = async (templateId: string) => {
    try {
      const maxOrder = Math.max(...gateways.map(g => g.order_index), -1)
      
      const { data, error } = await supabase
        .from('assessment_gateway_assignments')
        .insert({
          assessment_id: assessmentId,
          gateway_template_id: templateId,
          order_index: maxOrder + 1,
          is_enabled: true,
          custom_configuration: {}
        })
        .select(`
          *,
          gateway_template:assessment_gateway_templates(*)
        `)
        .single()

      if (error) throw error
      
      const newGateways = [...gateways, data]
      setGateways(newGateways)
      onGatewaysChange?.(newGateways)
      setShowAddGateway(false)
    } catch (error) {
      console.error('Error adding gateway:', error)
      alert('Failed to add gateway')
    }
  }

  const removeGateway = async (gatewayId: string) => {
    try {
      const { error } = await supabase
        .from('assessment_gateway_assignments')
        .delete()
        .eq('id', gatewayId)

      if (error) throw error
      
      const newGateways = gateways.filter(g => g.id !== gatewayId)
      setGateways(newGateways)
      onGatewaysChange?.(newGateways)
    } catch (error) {
      console.error('Error removing gateway:', error)
      alert('Failed to remove gateway')
    }
  }

  const updateGateway = async (gatewayId: string, updates: Partial<GatewayAssignment>) => {
    try {
      const { error } = await supabase
        .from('assessment_gateway_assignments')
        .update(updates)
        .eq('id', gatewayId)

      if (error) throw error
      
      const newGateways = gateways.map(g => 
        g.id === gatewayId ? { ...g, ...updates } : g
      )
      setGateways(newGateways)
      onGatewaysChange?.(newGateways)
    } catch (error) {
      console.error('Error updating gateway:', error)
      alert('Failed to update gateway')
    }
  }

  const moveGateway = async (gatewayId: string, direction: 'up' | 'down') => {
    const currentIndex = gateways.findIndex(g => g.id === gatewayId)
    if (currentIndex === -1) return

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
    if (newIndex < 0 || newIndex >= gateways.length) return

    const newGateways = [...gateways]
    const [movedGateway] = newGateways.splice(currentIndex, 1)
    newGateways.splice(newIndex, 0, movedGateway)

    // Update order_index for all affected gateways
    const updates = newGateways.map((gateway, index) => ({
      id: gateway.id,
      order_index: index
    }))

    try {
      for (const update of updates) {
        await supabase
          .from('assessment_gateway_assignments')
          .update({ order_index: update.order_index })
          .eq('id', update.id)
      }

      // Update local state
      const updatedGateways = newGateways.map((gateway, index) => ({
        ...gateway,
        order_index: index
      }))
      
      setGateways(updatedGateways)
      onGatewaysChange?.(updatedGateways)
    } catch (error) {
      console.error('Error reordering gateways:', error)
      alert('Failed to reorder gateways')
    }
  }

  const getGatewayIcon = (type: string) => {
    switch (type) {
      case 'emotional_readiness': return <Heart className="h-4 w-4" />
      case 'ai_verification': return <Brain className="h-4 w-4" />
      case 'time_based': return <Clock className="h-4 w-4" />
      case 'prerequisite_completion': return <CheckCircle className="h-4 w-4" />
      case 'content_integration': return <Shield className="h-4 w-4" />
      default: return <Settings className="h-4 w-4" />
    }
  }

  const getGatewayTypeColor = (type: string) => {
    switch (type) {
      case 'emotional_readiness': return 'bg-red-100 text-red-800'
      case 'ai_verification': return 'bg-purple-100 text-purple-800'
      case 'time_based': return 'bg-blue-100 text-blue-800'
      case 'prerequisite_completion': return 'bg-green-100 text-green-800'
      case 'content_integration': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Shield className="h-8 w-8 animate-pulse mx-auto mb-2" />
          <p>Loading assessment gateways...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Assessment Gateways</h3>
          <p className="text-sm text-gray-600">
            Configure requirements users must meet before accessing this assessment
          </p>
        </div>
        <Button 
          onClick={() => setShowAddGateway(true)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Gateway
        </Button>
      </div>

      {/* Current Gateways */}
      <div className="space-y-3">
        {gateways.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex items-center justify-center p-8">
              <div className="text-center">
                <Shield className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">No gateways configured</p>
                <p className="text-sm text-gray-400">Add gateways to control access to this assessment</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          gateways.map((gateway, index) => (
            <Card key={gateway.id} className="border-l-4 border-l-blue-500">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      {getGatewayIcon(gateway.gateway_template.gateway_type)}
                      <span className="font-medium">{gateway.gateway_template.name}</span>
                    </div>
                    <Badge className={getGatewayTypeColor(gateway.gateway_template.gateway_type)}>
                      {gateway.gateway_template.gateway_type.replace('_', ' ')}
                    </Badge>
                    {gateway.gateway_template.is_general && (
                      <Badge variant="outline">General</Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={gateway.is_enabled}
                      onCheckedChange={(enabled) => 
                        updateGateway(gateway.id, { is_enabled: enabled })
                      }
                    />
                    
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => moveGateway(gateway.id, 'up')}
                        disabled={index === 0}
                      >
                        <ArrowUp className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => moveGateway(gateway.id, 'down')}
                        disabled={index === gateways.length - 1}
                      >
                        <ArrowDown className="h-3 w-3" />
                      </Button>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingGateway(gateway)}
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeGateway(gateway.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <p className="text-sm text-gray-600 mb-3">
                  {gateway.gateway_template.description}
                </p>
                
                {gateway.gateway_template.verification_prompt && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <Label className="text-xs font-medium text-gray-700">AI Verification Prompt:</Label>
                    <p className="text-xs text-gray-600 mt-1">
                      {gateway.gateway_template.verification_prompt}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Add Gateway Dialog */}
      {showAddGateway && (
        <Card className="border-2 border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Add Assessment Gateway
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {availableTemplates
                .filter(template => !gateways.some(g => g.gateway_template_id === template.id))
                .map(template => (
                  <div 
                    key={template.id}
                    className="flex items-center justify-between p-3 bg-white rounded-lg border cursor-pointer hover:border-blue-300"
                    onClick={() => addGateway(template.id)}
                  >
                    <div className="flex items-center gap-3">
                      {getGatewayIcon(template.gateway_type)}
                      <div>
                        <p className="font-medium">{template.name}</p>
                        <p className="text-sm text-gray-600">{template.description}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge className={getGatewayTypeColor(template.gateway_type)}>
                        {template.gateway_type.replace('_', ' ')}
                      </Badge>
                      {template.is_general && (
                        <Badge variant="outline">General</Badge>
                      )}
                      {template.level_restriction && (
                        <Badge variant="secondary">Level {template.level_restriction}</Badge>
                      )}
                    </div>
                  </div>
                ))}
              
              {availableTemplates.filter(template => 
                !gateways.some(g => g.gateway_template_id === template.id)
              ).length === 0 && (
                <p className="text-center text-gray-500 py-4">
                  All available gateways have been added
                </p>
              )}
            </div>
            
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setShowAddGateway(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
