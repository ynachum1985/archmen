import { createClient } from '@/lib/supabase/client'

export interface UploadedFile {
  id: string
  name: string
  url: string
  size: number
  type: string
  assessment_id?: string
  uploaded_at: string
}

export class FileUploadService {
  private supabase = createClient()
  private bucketName = 'assessment-files'

  async uploadFile(file: File, assessmentId?: string): Promise<UploadedFile> {
    try {
      // Generate unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = assessmentId ? `${assessmentId}/${fileName}` : `general/${fileName}`

      // Upload file to Supabase Storage
      const { error: uploadError } = await this.supabase.storage
        .from(this.bucketName)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        throw uploadError
      }

      // Get public URL
      const { data: urlData } = this.supabase.storage
        .from(this.bucketName)
        .getPublicUrl(filePath)

      // For now, simulate file metadata storage until database is updated
      const fileRecord = {
        id: `file-${Date.now()}`,
        name: file.name,
        file_path: filePath,
        file_url: urlData.publicUrl,
        file_size: file.size,
        file_type: file.type,
        assessment_id: assessmentId,
        uploaded_at: new Date().toISOString()
      }

      return {
        id: fileRecord.id,
        name: fileRecord.name,
        url: fileRecord.file_url,
        size: fileRecord.file_size,
        type: fileRecord.file_type,
        assessment_id: fileRecord.assessment_id,
        uploaded_at: fileRecord.uploaded_at
      }
    } catch (error) {
      console.error('Error uploading file:', error)
      throw error
    }
  }

  async deleteFile(fileId: string): Promise<void> {
    try {
      // For now, simulate file deletion until database is updated
      console.log('File deleted:', fileId)
      // In a real implementation, we would delete from both storage and database
    } catch (error) {
      console.error('Error deleting file:', error)
      throw error
    }
  }

  async getFilesByAssessment(assessmentId: string): Promise<UploadedFile[]> {
    // For now, return empty array until database is updated
    console.log('Getting files for assessment:', assessmentId)
    return []
  }

  async ensureBucketExists(): Promise<void> {
    try {
      // Check if bucket exists
      const { data: buckets, error: listError } = await this.supabase.storage.listBuckets()
      
      if (listError) {
        throw listError
      }

      const bucketExists = buckets.some(bucket => bucket.name === this.bucketName)
      
      if (!bucketExists) {
        // Create bucket
        const { error: createError } = await this.supabase.storage.createBucket(this.bucketName, {
          public: true,
          allowedMimeTypes: [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'text/plain',
            'text/markdown',
            'application/json',
            'text/csv'
          ],
          fileSizeLimit: 10485760 // 10MB
        })

        if (createError) {
          throw createError
        }
      }
    } catch (error) {
      console.error('Error ensuring bucket exists:', error)
      throw error
    }
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  isValidFileType(file: File): boolean {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'text/markdown',
      'application/json',
      'text/csv'
    ]
    return allowedTypes.includes(file.type)
  }

  isValidFileSize(file: File): boolean {
    const maxSize = 10 * 1024 * 1024 // 10MB
    return file.size <= maxSize
  }
}
