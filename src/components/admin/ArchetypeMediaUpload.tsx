'use client'

import { useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { 
  Upload, 
  X, 
  Image, 
  Video, 
  FileText, 
  Loader2,
  Check,
  AlertCircle
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface MediaFile {
  id: string
  name: string
  type: 'image' | 'video' | 'audio' | 'document'
  url: string
  size: number
  uploadedAt: Date
  description?: string
}

interface ArchetypeMediaUploadProps {
  archetypeName: string
  archetypeId: string
}

export function ArchetypeMediaUpload({ archetypeName, archetypeId }: ArchetypeMediaUploadProps) {
  const [uploadedFiles, setUploadedFiles] = useState<MediaFile[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({})

  // Load existing media files for this archetype
  const loadExistingMedia = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('archetype_media')
        .select('*')
        .eq('archetype_id', archetypeId)
        .order('created_at', { ascending: false })

      if (error) throw error

      const mediaFiles: MediaFile[] = (data || []).map(item => ({
        id: item.id,
        name: item.file_name,
        type: item.media_type,
        url: item.file_url,
        size: item.file_size || 0,
        uploadedAt: new Date(item.created_at),
        description: item.description
      }))

      setUploadedFiles(mediaFiles)
    } catch (error) {
      console.error('Error loading existing media:', error)
    }
  }

  // Handle file upload
  const handleFileUpload = async (files: FileList) => {
    if (!files.length) return

    setIsUploading(true)
    const supabase = createClient()

    for (const file of Array.from(files)) {
      try {
        // Validate file type
        const allowedTypes = ['image/', 'video/', 'audio/', 'application/pdf', 'text/']
        if (!allowedTypes.some(type => file.type.startsWith(type))) {
          alert(`File type ${file.type} not supported`)
          continue
        }

        // Validate file size (50MB max)
        if (file.size > 50 * 1024 * 1024) {
          alert(`File ${file.name} is too large. Maximum size is 50MB.`)
          continue
        }

        const fileId = `${Date.now()}-${file.name}`
        setUploadProgress(prev => ({ ...prev, [fileId]: 0 }))

        // Upload to Supabase Storage
        const filePath = `archetypes/${archetypeId}/${fileId}`
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('archetype-media')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          })

        if (uploadError) throw uploadError

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('archetype-media')
          .getPublicUrl(filePath)

        // Determine media type
        let mediaType: 'image' | 'video' | 'audio' | 'document' = 'document'
        if (file.type.startsWith('image/')) mediaType = 'image'
        else if (file.type.startsWith('video/')) mediaType = 'video'
        else if (file.type.startsWith('audio/')) mediaType = 'audio'

        // Save metadata to database
        const { data: dbData, error: dbError } = await supabase
          .from('archetype_media')
          .insert({
            archetype_id: archetypeId,
            file_name: file.name,
            file_path: filePath,
            file_url: urlData.publicUrl,
            file_size: file.size,
            media_type: mediaType,
            mime_type: file.type,
            description: `${mediaType} content for ${archetypeName} archetype`
          })
          .select()
          .single()

        if (dbError) throw dbError

        // Add to uploaded files list
        const newFile: MediaFile = {
          id: dbData.id,
          name: file.name,
          type: mediaType,
          url: urlData.publicUrl,
          size: file.size,
          uploadedAt: new Date(),
          description: `${mediaType} content for ${archetypeName} archetype`
        }

        setUploadedFiles(prev => [...prev, newFile])
        setUploadProgress(prev => ({ ...prev, [fileId]: 100 }))

        // Remove progress after delay
        setTimeout(() => {
          setUploadProgress(prev => {
            const newProgress = { ...prev }
            delete newProgress[fileId]
            return newProgress
          })
        }, 2000)

      } catch (error) {
        console.error('Error uploading file:', error)
        alert(`Failed to upload ${file.name}. Please try again.`)
      }
    }

    setIsUploading(false)
  }

  // Handle drag and drop
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files)
    }
  }, [])

  // Delete file
  const deleteFile = async (fileId: string, filePath: string) => {
    try {
      const supabase = createClient()
      
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('archetype-media')
        .remove([filePath])

      if (storageError) throw storageError

      // Delete from database
      const { error: dbError } = await supabase
        .from('archetype_media')
        .delete()
        .eq('id', fileId)

      if (dbError) throw dbError

      // Remove from local state
      setUploadedFiles(prev => prev.filter(file => file.id !== fileId))
    } catch (error) {
      console.error('Error deleting file:', error)
      alert('Failed to delete file. Please try again.')
    }
  }

  // Get file icon
  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image': return <Image className="h-4 w-4" />
      case 'video': return <Video className="h-4 w-4" />
      case 'audio': return <FileText className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Media Upload</h3>
        <p className="text-sm text-gray-600">
          Upload images, videos, and documents for the {archetypeName} archetype
        </p>
      </div>

      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Media Files
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h4 className="text-lg font-medium mb-2">Drop files here or click to upload</h4>
            <p className="text-sm text-gray-600 mb-4">
              Supports images, videos, audio files, and documents (PDF, TXT)
            </p>
            <p className="text-xs text-gray-500 mb-4">
              Maximum file size: 50MB
            </p>
            
            <Input
              type="file"
              multiple
              accept="image/*,video/*,audio/*,.pdf,.txt"
              onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
              className="hidden"
              id="file-upload"
            />
            <Label htmlFor="file-upload">
              <Button variant="outline" className="cursor-pointer" disabled={isUploading}>
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Choose Files
                  </>
                )}
              </Button>
            </Label>
          </div>

          {/* Upload Progress */}
          {Object.keys(uploadProgress).length > 0 && (
            <div className="mt-4 space-y-2">
              {Object.entries(uploadProgress).map(([fileId, progress]) => (
                <div key={fileId} className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  {progress === 100 && <Check className="h-4 w-4 text-green-500" />}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Uploaded Media ({uploadedFiles.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {uploadedFiles.map((file) => (
                <div key={file.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {getFileIcon(file.type)}
                      <Badge variant="secondary" className="text-xs">
                        {file.type}
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteFile(file.id, file.url.split('/').pop() || '')}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-sm truncate">{file.name}</h4>
                    <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                    <p className="text-xs text-gray-400">
                      {file.uploadedAt.toLocaleDateString()}
                    </p>
                  </div>

                  {file.type === 'image' && (
                    <img 
                      src={file.url} 
                      alt={file.name}
                      className="w-full h-24 object-cover rounded"
                    />
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => window.open(file.url, '_blank')}
                  >
                    View File
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
