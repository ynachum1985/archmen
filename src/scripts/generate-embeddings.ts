#!/usr/bin/env tsx

/**
 * Script to generate embeddings for existing data in the database
 * Run with: npx tsx src/scripts/generate-embeddings.ts
 */

import { enhancedAIService } from '../lib/services/enhanced-ai.service'

async function main() {
  console.log('🚀 Starting embedding generation for existing data...')
  
  try {
    await enhancedAIService.getInstance().generateEmbeddingsForExistingData()
    console.log('✅ Embedding generation completed successfully!')
  } catch (error) {
    console.error('❌ Error generating embeddings:', error)
    process.exit(1)
  }
}

// Run the script
if (require.main === module) {
  main()
}
