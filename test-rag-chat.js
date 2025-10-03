/**
 * Test Script for RAG-Enhanced Chat APIs
 * 
 * This script tests all three chat endpoints to ensure RAG functionality is working:
 * 1. /api/chat - Basic chat with RAG
 * 2. /api/conversation-chat - Assessment conversations with RAG
 * 3. /api/enhanced-chat - Enhanced chat with RAG + moderation
 * 
 * Run with: node test-rag-chat.js
 */

const BASE_URL = 'http://localhost:3000' // Change to your deployment URL

// Test messages that should trigger different types of content
const testMessages = [
  {
    message: "I think I might be an Alpha Male type. How do I know for sure?",
    expectedContext: "archetype",
    description: "Should find Alpha Male archetype content"
  },
  {
    message: "What are the differences between monogamy and polyamory?",
    expectedContext: "assessment", 
    description: "Should find Monogamy vs Polyamory assessment content"
  },
  {
    message: "I'm struggling with emotional vulnerability in my relationship",
    expectedContext: "both",
    description: "Should find both archetype and assessment content"
  },
  {
    message: "How do I set better boundaries with my partner?",
    expectedContext: "both",
    description: "Should find relevant relationship content"
  }
]

// Test data for different endpoints
const testData = {
  basicChat: {
    endpoint: '/api/chat',
    payload: (message) => ({
      messages: [
        { role: 'user', content: message }
      ]
    })
  },
  conversationChat: {
    endpoint: '/api/conversation-chat',
    payload: (message) => ({
      message: message,
      conversationId: '550e8400-e29b-41d4-a716-446655440000', // Mock ID
      assessmentId: '03b868b0-a914-4d33-9dd7-d9bc431d6dbb', // Monogamy vs Polyamory
      userId: '550e8400-e29b-41d4-a716-446655440001' // Mock user ID
    })
  },
  enhancedChat: {
    endpoint: '/api/enhanced-chat',
    payload: (message) => ({
      messages: [
        { role: 'user', content: message }
      ],
      personalityId: null,
      conversationId: '550e8400-e29b-41d4-a716-446655440000',
      assessmentId: '03b868b0-a914-4d33-9dd7-d9bc431d6dbb'
    })
  }
}

async function testEndpoint(endpointName, testMessage) {
  const config = testData[endpointName]
  const url = `${BASE_URL}${config.endpoint}`
  
  console.log(`\n🧪 Testing ${endpointName.toUpperCase()}: ${config.endpoint}`)
  console.log(`📝 Message: "${testMessage.message}"`)
  console.log(`🎯 Expected: ${testMessage.description}`)
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(config.payload(testMessage.message))
    })
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    const data = await response.json()
    
    // Check for RAG context in response
    const ragContext = data.metadata?.ragContext || data.ragContext
    
    if (ragContext) {
      console.log(`✅ RAG Context Found:`)
      console.log(`   📊 Total Chunks: ${ragContext.totalChunks}`)
      console.log(`   🎭 Archetype Chunks: ${ragContext.archetypeChunks}`)
      console.log(`   📋 Assessment Chunks: ${ragContext.assessmentChunks}`)
      
      if (ragContext.totalChunks > 0) {
        console.log(`   🔍 Search Query: "${ragContext.searchQuery}"`)
        
        // Validate expected context type
        if (testMessage.expectedContext === 'archetype' && ragContext.archetypeChunks > 0) {
          console.log(`   ✅ Expected archetype content found`)
        } else if (testMessage.expectedContext === 'assessment' && ragContext.assessmentChunks > 0) {
          console.log(`   ✅ Expected assessment content found`)
        } else if (testMessage.expectedContext === 'both' && ragContext.archetypeChunks > 0 && ragContext.assessmentChunks > 0) {
          console.log(`   ✅ Expected both content types found`)
        } else {
          console.log(`   ⚠️  Expected ${testMessage.expectedContext} content, but got different results`)
        }
      } else {
        console.log(`   ⚠️  No relevant content found - may need more embedded content`)
      }
    } else {
      console.log(`   ❌ No RAG context found in response`)
    }
    
    // Show response preview
    const responsePreview = data.content?.substring(0, 150) + (data.content?.length > 150 ? '...' : '')
    console.log(`   💬 Response Preview: "${responsePreview}"`)
    
    // Show usage info if available
    if (data.usage) {
      console.log(`   📈 Token Usage: ${data.usage.totalTokens} total (${data.usage.promptTokens} prompt + ${data.usage.completionTokens} completion)`)
    }
    
    return { success: true, data }
    
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`)
    return { success: false, error: error.message }
  }
}

async function runAllTests() {
  console.log('🚀 Starting RAG-Enhanced Chat API Tests')
  console.log('=' .repeat(60))
  
  const results = {
    basicChat: [],
    conversationChat: [],
    enhancedChat: []
  }
  
  // Test each endpoint with each test message
  for (const testMessage of testMessages) {
    console.log(`\n📨 Testing Message: "${testMessage.message}"`)
    console.log('-'.repeat(60))
    
    for (const endpointName of Object.keys(testData)) {
      const result = await testEndpoint(endpointName, testMessage)
      results[endpointName].push(result)
      
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }
  
  // Summary
  console.log('\n📊 TEST SUMMARY')
  console.log('=' .repeat(60))
  
  for (const [endpointName, endpointResults] of Object.entries(results)) {
    const successCount = endpointResults.filter(r => r.success).length
    const totalCount = endpointResults.length
    
    console.log(`${endpointName.toUpperCase()}: ${successCount}/${totalCount} tests passed`)
    
    const failures = endpointResults.filter(r => !r.success)
    if (failures.length > 0) {
      console.log(`  ❌ Failures:`)
      failures.forEach((failure, index) => {
        console.log(`     ${index + 1}. ${failure.error}`)
      })
    }
  }
  
  console.log('\n🎯 RECOMMENDATIONS:')
  console.log('1. If no RAG context is found, ensure you have embedded content in your knowledge base')
  console.log('2. Go to Admin → Setup → Knowledge Base and add content to archetypes')
  console.log('3. Test the embedding functionality first with the Test Embedding button')
  console.log('4. Check that your OpenAI API key is properly configured')
  console.log('5. Verify that the vector search functions are working in Supabase')
}

// Run the tests
runAllTests().catch(console.error)
