import { createClient } from '@/lib/supabase/client'

export interface UploadedFile {
  id: string
  name: string
  file_path: string
  file_url: string
  file_size: number
  file_type: string
  archetype_id?: string
  uploaded_at: string
}

export class ArchetypeFileUploadService {
  private supabase = createClient()
  private bucketName = 'archetype-files'

  async uploadFile(file: File, archetypeId?: string): Promise<UploadedFile> {
    try {
      // Generate unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = archetypeId ? `${archetypeId}/${fileName}` : `general/${fileName}`

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

      // Store file metadata in database
      const { data: fileRecord, error: dbError } = await this.supabase
        .from('archetype_files')
        .insert({
          name: file.name,
          file_path: filePath,
          file_url: urlData.publicUrl,
          file_size: file.size,
          file_type: file.type,
          archetype_id: archetypeId,
          uploaded_at: new Date().toISOString()
        })
        .select()
        .single()

      if (dbError) {
        // Clean up uploaded file if database insert fails
        await this.supabase.storage
          .from(this.bucketName)
          .remove([filePath])
        throw dbError
      }

      return fileRecord
    } catch (error) {
      console.error('Error uploading file:', error)
      throw error
    }
  }

  async deleteFile(fileId: string): Promise<void> {
    try {
      // Get file info first
      const { data: fileRecord, error: fetchError } = await this.supabase
        .from('archetype_files')
        .select('file_path')
        .eq('id', fileId)
        .single()

      if (fetchError) {
        throw fetchError
      }

      // Delete from storage
      const { error: storageError } = await this.supabase.storage
        .from(this.bucketName)
        .remove([fileRecord.file_path])

      if (storageError) {
        console.error('Error deleting from storage:', storageError)
        // Continue with database deletion even if storage deletion fails
      }

      // Delete from database
      const { error: dbError } = await this.supabase
        .from('archetype_files')
        .delete()
        .eq('id', fileId)

      if (dbError) {
        throw dbError
      }
    } catch (error) {
      console.error('Error deleting file:', error)
      throw error
    }
  }

  async getFilesByArchetypeId(archetypeId: string): Promise<UploadedFile[]> {
    try {
      const { data, error } = await this.supabase
        .from('archetype_files')
        .select('*')
        .eq('archetype_id', archetypeId)
        .order('uploaded_at', { ascending: false })

      if (error) {
        throw error
      }

      return data || []
    } catch (error) {
      console.error('Error fetching files:', error)
      throw error
    }
  }

  async processFileContent(file: File): Promise<string> {
    try {
      if (file.type === 'text/plain' || file.type === 'text/markdown') {
        return await file.text()
      } else if (file.type === 'application/pdf') {
        // For PDF files, we'll need to implement PDF text extraction
        // For now, return a placeholder
        return `[PDF Content from ${file.name} - PDF text extraction not yet implemented]`
      } else if (file.type.includes('word') || file.type.includes('document')) {
        // For Word documents, we'll need to implement document parsing
        return `[Document Content from ${file.name} - Document parsing not yet implemented]`
      } else {
        return `[File Content from ${file.name} - Content type ${file.type} not supported for text extraction]`
      }
    } catch (error) {
      console.error('Error processing file content:', error)
      return `[Error processing ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}]`
    }
  }
}
