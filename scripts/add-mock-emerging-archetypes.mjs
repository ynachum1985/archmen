#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://rkqujvonllmxjkkkeqsy.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJrcXVqdm9ubGxteGpra2tlcXN5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDk4NzkyMCwiZXhwIjoyMDY2NTYzOTIwfQ.HAC2EBgssb8ruwStzXs6wXjawEllsGqVnIeY5dSdRMw'

const supabase = createClient(supabaseUrl, supabaseKey)

// Mock emerging archetypes data
const mockEmergingArchetypes = [
  {
    archetype_id: '11111111-1111-1111-1111-111111111111',
    archetype_name: 'The Narcissist',
    confidence_score: 85,
    impact_score: 7,
    ranked_aliases: [
      { name: 'The Gaslighter', strength: 'strong', confidence: 92 },
      { name: 'The Manipulator', strength: 'strong', confidence: 88 },
      { name: 'The Control Freak', strength: 'moderate', confidence: 65 },
      { name: 'The Emotional Abuser', strength: 'moderate', confidence: 60 },
      { name: 'The Toxic Partner', strength: 'mild', confidence: 45 }
    ],
    evidence: [
      "I always know what's best for her, she just doesn't see it yet",
      "When she gets upset, I just tell her she's being too sensitive",
      "I need to be in control of the relationship decisions"
    ],
    detected_at: new Date().toISOString()
  },
  {
    archetype_id: '22222222-2222-2222-2222-222222222222',
    archetype_name: 'The Avoidant',
    confidence_score: 72,
    impact_score: 6,
    ranked_aliases: [
      { name: 'The Stonewaller', strength: 'strong', confidence: 85 },
      { name: 'The Ghoster', strength: 'strong', confidence: 78 },
      { name: 'The Emotionally Unavailable', strength: 'moderate', confidence: 68 },
      { name: 'The Workaholic', strength: 'moderate', confidence: 55 },
      { name: 'The Escapist', strength: 'mild', confidence: 42 }
    ],
    evidence: [
      "When things get emotional, I just need space",
      "I tend to bury myself in work when we have conflicts",
      "I don't like talking about feelings, it's uncomfortable"
    ],
    detected_at: new Date().toISOString()
  },
  {
    archetype_id: '33333333-3333-3333-3333-333333333333',
    archetype_name: 'The Alpha Male',
    confidence_score: 58,
    impact_score: 7,
    ranked_aliases: [
      { name: 'The Dominant', strength: 'moderate', confidence: 65 },
      { name: 'The Hyper Masculine', strength: 'moderate', confidence: 60 },
      { name: 'The Macho', strength: 'mild', confidence: 48 }
    ],
    evidence: [
      "I'm the man of the house, I make the final decisions",
      "She needs to respect my authority"
    ],
    detected_at: new Date().toISOString()
  }
]

async function addMockData() {
  console.log('🎭 Adding mock emerging archetypes to conversations...\n')

  try {
    // Get the first active conversation
    const { data: conversations, error: fetchError } = await supabase
      .from('conversations')
      .select('id, user_id, metadata')
      .limit(5)
      .order('updated_at', { ascending: false })

    if (fetchError) {
      console.error('Error fetching conversations:', fetchError)
      return
    }

    if (!conversations || conversations.length === 0) {
      console.log('⚠️  No conversations found. Create a conversation first.')
      return
    }

    console.log(`Found ${conversations.length} conversations\n`)

    // Update the first conversation with mock data
    const conversation = conversations[0]
    
    const { error: updateError } = await supabase
      .from('conversations')
      .update({
        emerging_archetypes: mockEmergingArchetypes
      })
      .eq('id', conversation.id)

    if (updateError) {
      console.error('Error updating conversation:', updateError)
      return
    }

    console.log('✅ Successfully added mock emerging archetypes!')
    console.log(`\nConversation ID: ${conversation.id}`)
    console.log(`User ID: ${conversation.user_id}`)
    console.log(`\nAdded ${mockEmergingArchetypes.length} archetypes:`)
    mockEmergingArchetypes.forEach(arch => {
      console.log(`  - ${arch.archetype_name} (${arch.confidence_score}% confidence)`)
      console.log(`    └─ ${arch.ranked_aliases.length} aliases`)
    })
    console.log('\n🎯 Go to your dashboard and click the Sparkles icon to see them!')

  } catch (error) {
    console.error('Error:', error)
  }
}

addMockData()

