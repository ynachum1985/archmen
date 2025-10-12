#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js'
import { readFileSync, readdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const supabaseUrl = 'https://rkqujvonllmxjkkkeqsy.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJrcXVqdm9ubGxteGpra2tlcXN5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDk4NzkyMCwiZXhwIjoyMDY2NTYzOTIwfQ.HAC2EBgssb8ruwStzXs6wXjawEllsGqVnIeY5dSdRMw'

const supabase = createClient(supabaseUrl, supabaseKey)

// Mapping of file names to archetype names in database
const archetypeMapping = {
  'the-narcissist-linguistic-patterns.md': 'The Narcissist',
  'the-avoidant-linguistic-patterns.md': 'The Avoidant',
  'the-people-pleaser-linguistic-patterns.md': 'The People Pleaser',
  'the-victim-linguistic-patterns.md': 'The Victim'
}

console.log('📊 Database Status:')
console.log('   Total Archetypes: 60')
console.log('   Active Archetypes: 60')
console.log('   Linguistic Patterns Created: 4')
console.log('   Remaining to Create: 56\n')

async function uploadLinguisticPatterns() {
  console.log('🎭 Uploading Linguistic Patterns to Knowledge Base...\n')

  const patternsDir = join(__dirname, '..', 'knowledge-base-content', 'archetypes')
  
  try {
    const files = readdirSync(patternsDir).filter(f => f.endsWith('.md'))
    
    console.log(`Found ${files.length} linguistic pattern files\n`)

    for (const file of files) {
      const archetypeName = archetypeMapping[file]
      
      if (!archetypeName) {
        console.log(`⚠️  Skipping ${file} - no archetype mapping found`)
        continue
      }

      console.log(`📄 Processing: ${archetypeName}`)

      // Get archetype ID
      const { data: archetype, error: archetypeError } = await supabase
        .from('enhanced_archetypes')
        .select('id')
        .eq('name', archetypeName)
        .single()

      if (archetypeError || !archetype) {
        console.log(`   ❌ Archetype not found: ${archetypeName}`)
        continue
      }

      // Read file content
      const filePath = join(patternsDir, file)
      const content = readFileSync(filePath, 'utf-8')

      // Upload to knowledge base
      const { data, error } = await supabase
        .from('archetype_knowledge_base')
        .insert({
          archetype_id: archetype.id,
          content: content,
          content_type: 'text/markdown',
          source_type: 'linguistic_patterns',
          metadata: {
            title: `${archetypeName} - Linguistic & Behavioral Patterns`,
            description: 'Comprehensive linguistic patterns, keywords, phrases, and behavioral indicators for archetype detection',
            category: 'detection_patterns',
            auto_generated: false
          }
        })
        .select()

      if (error) {
        console.log(`   ❌ Error uploading: ${error.message}`)
        continue
      }

      console.log(`   ✅ Uploaded successfully (ID: ${data[0].id})`)

      // Trigger embedding process
      console.log(`   🔄 Triggering embedding process...`)
      
      const { data: embedData, error: embedError } = await supabase
        .rpc('process_archetype_content', {
          p_archetype_id: archetype.id
        })

      if (embedError) {
        console.log(`   ⚠️  Embedding error: ${embedError.message}`)
      } else {
        console.log(`   ✅ Embedded successfully`)
      }

      console.log('')
    }

    console.log('\n✅ All linguistic patterns uploaded!')
    console.log('\n📊 Summary:')
    console.log(`   - Files processed: ${files.length}`)
    console.log(`   - Archetypes updated: ${Object.keys(archetypeMapping).length}`)
    console.log('\n🎯 Next Steps:')
    console.log('   1. Go to Admin Panel → Archetypes')
    console.log('   2. Click on any archetype (e.g., The Narcissist)')
    console.log('   3. Go to "Knowledge Base" tab')
    console.log('   4. You should see the linguistic patterns document')
    console.log('   5. Click dropdown to see all embedded chunks')
    console.log('   6. Check the archetype_content_chunks table for embeddings')

  } catch (error) {
    console.error('❌ Error:', error)
  }
}

uploadLinguisticPatterns()

