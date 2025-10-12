#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://rkqujvonllmxjkkkeqsy.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJrcXVqdm9ubGxteGpra2tlcXN5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDk4NzkyMCwiZXhwIjoyMDY2NTYzOTIwfQ.HAC2EBgssb8ruwStzXs6wXjawEllsGqVnIeY5dSdRMw'

const supabase = createClient(supabaseUrl, supabaseKey)

async function addMockUserArchetypes() {
  console.log('🎭 Adding mock user archetypes...\n')

  try {
    // Get first user
    const { data: users, error: userError } = await supabase
      .from('profiles')
      .select('id')
      .limit(1)

    if (userError || !users || users.length === 0) {
      console.log('⚠️  No users found. Create a user account first.')
      return
    }

    const userId = users[0].id
    console.log(`Found user: ${userId}\n`)

    // Get some archetypes
    const { data: archetypes, error: archError } = await supabase
      .from('enhanced_archetypes')
      .select('id, name, impact_score')
      .in('name', ['The Narcissist', 'The Avoidant', 'The Alpha Male'])

    if (archError || !archetypes || archetypes.length === 0) {
      console.log('⚠️  Archetypes not found in database')
      return
    }

    console.log(`Found ${archetypes.length} archetypes\n`)

    // Add The Narcissist
    const narcissist = archetypes.find(a => a.name === 'The Narcissist')
    if (narcissist) {
      const { data, error } = await supabase.rpc('upsert_user_archetype', {
        p_user_id: userId,
        p_archetype_id: narcissist.id,
        p_conversation_id: null,
        p_assessment_id: null,
        p_confidence_score: 85,
        p_primary_alias: 'The Gaslighter',
        p_ranked_aliases: [
          { name: 'The Gaslighter', strength: 'strong', confidence: 92 },
          { name: 'The Manipulator', strength: 'strong', confidence: 88 },
          { name: 'The Control Freak', strength: 'moderate', confidence: 65 },
          { name: 'The Emotional Abuser', strength: 'moderate', confidence: 60 },
          { name: 'The Toxic Partner', strength: 'mild', confidence: 45 }
        ],
        p_discovery_summary: 'Detected through consistent patterns of control in relationship conflicts, need to be right, and dismissing partner\'s emotions.',
        p_evidence: [
          'I always need to be right in arguments',
          'I tell her she\'s overreacting when she\'s upset',
          'I need to control the relationship decisions',
          'She says I gaslight her but I\'m just being logical'
        ]
      })

      if (error) {
        console.error('Error adding The Narcissist:', error)
      } else {
        console.log('✅ Added: The Narcissist (85% confidence)')
      }
    }

    // Add The Avoidant
    const avoidant = archetypes.find(a => a.name === 'The Avoidant')
    if (avoidant) {
      const { data, error } = await supabase.rpc('upsert_user_archetype', {
        p_user_id: userId,
        p_archetype_id: avoidant.id,
        p_conversation_id: null,
        p_assessment_id: null,
        p_confidence_score: 72,
        p_primary_alias: 'The Stonewaller',
        p_ranked_aliases: [
          { name: 'The Stonewaller', strength: 'strong', confidence: 85 },
          { name: 'The Ghoster', strength: 'strong', confidence: 78 },
          { name: 'The Emotionally Unavailable', strength: 'moderate', confidence: 68 },
          { name: 'The Workaholic', strength: 'moderate', confidence: 55 },
          { name: 'The Escapist', strength: 'mild', confidence: 42 }
        ],
        p_discovery_summary: 'Detected through patterns of emotional withdrawal, conflict avoidance, and using work as an escape mechanism.',
        p_evidence: [
          'When things get emotional, I just need space',
          'I tend to bury myself in work when we have conflicts',
          'I don\'t like talking about feelings, it\'s uncomfortable',
          'I shut down when she wants to have "the talk"'
        ]
      })

      if (error) {
        console.error('Error adding The Avoidant:', error)
      } else {
        console.log('✅ Added: The Avoidant (72% confidence)')
      }
    }

    // Add The Alpha Male
    const alphaMale = archetypes.find(a => a.name === 'The Alpha Male')
    if (alphaMale) {
      const { data, error } = await supabase.rpc('upsert_user_archetype', {
        p_user_id: userId,
        p_archetype_id: alphaMale.id,
        p_conversation_id: null,
        p_assessment_id: null,
        p_confidence_score: 58,
        p_primary_alias: 'The Dominant',
        p_ranked_aliases: [
          { name: 'The Dominant', strength: 'moderate', confidence: 65 },
          { name: 'The Hyper Masculine', strength: 'moderate', confidence: 60 },
          { name: 'The Macho', strength: 'mild', confidence: 48 }
        ],
        p_discovery_summary: 'Detected through traditional masculine role expectations and need for authority in the relationship.',
        p_evidence: [
          'I\'m the man of the house, I make the final decisions',
          'She needs to respect my authority',
          'I provide for the family, so I should have the final say'
        ]
      })

      if (error) {
        console.error('Error adding The Alpha Male:', error)
      } else {
        console.log('✅ Added: The Alpha Male (58% confidence)')
      }
    }

    console.log('\n✅ Mock user archetypes added successfully!')
    console.log('\n🎯 Go to your dashboard and click the Sparkles icon to see your archetype collection!')

  } catch (error) {
    console.error('Error:', error)
  }
}

addMockUserArchetypes()

