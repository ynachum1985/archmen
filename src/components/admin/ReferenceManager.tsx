'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Upload, 
  Link, 
  FileText, 
  Video, 
  Globe, 
  Download, 
  Trash2, 
  Plus,
  ExternalLink,
  BookOpen,

} from 'lucide-react'
import { FileUploadService, type UploadedFile } from '@/lib/services/file-upload.service'

export interface ReferenceLink {
  id: string
  title: string
  url: string
  description: string
  type: 'website' | 'video' | 'document' | 'research' | 'tool'
  category: string
  tags: string[]
  addedAt: string
}

interface ReferenceManagerProps {
  files: UploadedFile[]
  links: ReferenceLink[]
  onFilesChange: (files: UploadedFile[]) => void
  onLinksChange: (links: ReferenceLink[]) => void
}

const LINK_TYPES = [
  { value: 'website', label: 'Website', icon: Globe, description: 'General websites and articles' },
  { value: 'video', label: 'Video', icon: Video, description: 'YouTube, Vimeo, educational videos' },
  { value: 'document', label: 'Document', icon: FileText, description: 'Online documents and PDFs' },
  { value: 'research', label: 'Research', icon: BookOpen, description: 'Academic papers and studies' },
  { value: 'tool', label: 'Tool', icon: ExternalLink, description: 'Online tools and resources' }
]

const CATEGORIES = [
  'Psychology', 'Archetypes', 'Assessment', 'Research', 'Theory', 'Practice', 'Examples', 'Tools', 'Other'
]

export function ReferenceManager({ files, links, onFilesChange, onLinksChange }: ReferenceManagerProps) {
  const [uploadingFile, setUploadingFile] = useState(false)
  const [newLink, setNewLink] = useState<Partial<ReferenceLink>>({
    title: '',
    url: '',
    description: '',
    type: 'website',
    category: 'Psychology',
    tags: []
  })
  const [newTag, setNewTag] = useState('')

  const fileUploadService = new FileUploadService()

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files
    if (!selectedFiles) return

    setUploadingFile(true)
    try {
      const uploadPromises = Array.from(selectedFiles).map(file =>
        fileUploadService.uploadFile(file, 'assessment-temp')
      )
      
      const uploadedFiles = await Promise.all(uploadPromises)
      onFilesChange([...files, ...uploadedFiles])
    } catch (error) {
      console.error('Error uploading files:', error)
      alert('Error uploading files. Please try again.')
    } finally {
      setUploadingFile(false)
    }
  }

  const handleRemoveFile = async (fileId: string) => {
    try {
      await fileUploadService.deleteFile(fileId)
      onFilesChange(files.filter(f => f.id !== fileId))
    } catch (error) {
      console.error('Error removing file:', error)
    }
  }

  const addLink = () => {
    if (!newLink.title || !newLink.url) return

    const link: ReferenceLink = {
      id: `link-${Date.now()}`,
      title: newLink.title,
      url: newLink.url,
      description: newLink.description || '',
      type: (newLink.type as ReferenceLink['type']) || 'website',
      category: newLink.category || 'Psychology',
      tags: newLink.tags || [],
      addedAt: new Date().toISOString()
    }

    onLinksChange([...links, link])
    setNewLink({
      title: '',
      url: '',
      description: '',
      type: 'website',
      category: 'Psychology',
      tags: []
    })
  }

  const removeLink = (linkId: string) => {
    onLinksChange(links.filter(l => l.id !== linkId))
  }

  const addTag = () => {
    if (newTag.trim() && newLink.tags && !newLink.tags.includes(newTag.trim())) {
      setNewLink(prev => ({
        ...prev,
        tags: [...(prev.tags || []), newTag.trim()]
      }))
      setNewTag('')
    }
  }

  const removeTag = (tag: string) => {
    setNewLink(prev => ({
      ...prev,
      tags: (prev.tags || []).filter(t => t !== tag)
    }))
  }

  const getLinkIcon = (type: string) => {
    const linkType = LINK_TYPES.find(t => t.value === type)
    return linkType?.icon || Globe
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="files" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="files">Document Files</TabsTrigger>
          <TabsTrigger value="links">Reference Links</TabsTrigger>
        </TabsList>

        {/* Files Tab */}
        <TabsContent value="files" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Upload Documents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-600 mb-2">
                  Upload PDF, Word, Text, or Markdown files for AI reference
                </p>
                <p className="text-xs text-gray-500 mb-4">
                  Maximum file size: 10MB. Supported formats: PDF, DOC, DOCX, TXT, MD, JSON, CSV
                </p>
                <input
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.txt,.md,.json,.csv"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <Button
                  onClick={() => document.getElementById('file-upload')?.click()}
                  disabled={uploadingFile}
                  className="flex items-center gap-2"
                >
                  <Upload className="h-4 w-4" />
                  {uploadingFile ? 'Uploading...' : 'Choose Files'}
                </Button>
              </div>

              {/* Uploaded Files List */}
              {files.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-4">Uploaded Files ({files.length})</h3>
                  <div className="space-y-2">
                    {files.map((file) => (
                      <div key={file.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-gray-500" />
                          <div>
                            <p className="font-medium">{file.name}</p>
                            <p className="text-sm text-gray-500">
                              {fileUploadService.formatFileSize(file.size)} • {file.type}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(file.url, '_blank')}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRemoveFile(file.id)}
                          >
                            <Trash2 className="h-4 w-4" />
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

        {/* Links Tab */}
        <TabsContent value="links" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Link className="h-5 w-5" />
                Add Reference Link
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="link-title">Title</Label>
                  <Input
                    id="link-title"
                    value={newLink.title || ''}
                    onChange={(e) => setNewLink(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., Jung's Theory of Archetypes"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="link-url">URL</Label>
                  <Input
                    id="link-url"
                    value={newLink.url || ''}
                    onChange={(e) => setNewLink(prev => ({ ...prev, url: e.target.value }))}
                    placeholder="https://..."
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="link-description">Description</Label>
                <Textarea
                  id="link-description"
                  value={newLink.description || ''}
                  onChange={(e) => setNewLink(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of this resource..."
                  className="mt-1"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="link-type">Type</Label>
                  <Select 
                    value={newLink.type || 'website'} 
                    onValueChange={(value) => setNewLink(prev => ({ ...prev, type: value as ReferenceLink['type'] }))}
                  >
                    <SelectTrigger className="mt-1 bg-white border-gray-300 shadow-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-gray-200 shadow-lg z-50">
                      {LINK_TYPES.map(type => (
                        <SelectItem key={type.value} value={type.value} className="hover:bg-gray-50">
                          <div className="flex items-center gap-2">
                            <type.icon className="h-4 w-4" />
                            <div>
                              <div className="font-medium">{type.label}</div>
                              <div className="text-xs text-gray-500">{type.description}</div>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="link-category">Category</Label>
                  <Select 
                    value={newLink.category || 'Psychology'} 
                    onValueChange={(value) => setNewLink(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger className="mt-1 bg-white border-gray-300 shadow-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-gray-200 shadow-lg z-50">
                      {CATEGORIES.map(category => (
                        <SelectItem key={category} value={category} className="hover:bg-gray-50">
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Tags</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Add tag..."
                    className="flex-1"
                    onKeyPress={(e) => e.key === 'Enter' && addTag()}
                  />
                  <Button onClick={addTag} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {newLink.tags && newLink.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {newLink.tags.map(tag => (
                      <Badge 
                        key={tag} 
                        variant="outline" 
                        className="cursor-pointer"
                        onClick={() => removeTag(tag)}
                      >
                        {tag} ×
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <Button onClick={addLink} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Reference Link
              </Button>
            </CardContent>
          </Card>

          {/* Reference Links List */}
          {links.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Reference Links ({links.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {links.map((link) => {
                    const IconComponent = getLinkIcon(link.type)
                    return (
                      <div key={link.id} className="flex items-start justify-between p-4 border rounded-lg">
                        <div className="flex items-start gap-3 flex-1">
                          <IconComponent className="h-5 w-5 text-gray-500 mt-1" />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-medium">{link.title}</h3>
                              <Badge variant="outline" className="text-xs">
                                {link.type}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {link.category}
                              </Badge>
                            </div>
                            {link.description && (
                              <p className="text-sm text-gray-600 mb-2">{link.description}</p>
                            )}
                            <div className="flex items-center gap-2">
                              <a 
                                href={link.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                              >
                                {link.url.length > 50 ? `${link.url.substring(0, 50)}...` : link.url}
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            </div>
                            {link.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {link.tags.map(tag => (
                                  <Badge key={tag} variant="outline" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeLink(link.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
