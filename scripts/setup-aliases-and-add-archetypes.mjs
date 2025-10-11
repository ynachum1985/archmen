#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const supabaseUrl = 'https://rkqujvonllmxjkkkeqsy.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJrcXVqdm9ubGxteGpra2tlcXN5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDk4NzkyMCwiZXhwIjoyMDY2NTYzOTIwfQ.HAC2EBgssb8ruwStzXs6wXjawEllsGqVnIeY5dSdRMw'

const supabase = createClient(supabaseUrl, supabaseKey)

async function runMigration() {
  console.log('\n🔧 Step 1: Running migration to add alias columns...\n')
  
  const migrationPath = join(__dirname, '../supabase/migrations/20250111_add_archetype_aliases_final.sql')
  const migrationSQL = readFileSync(migrationPath, 'utf8')
  
  // Split by semicolon and run each statement
  const statements = migrationSQL
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'))
  
  for (const statement of statements) {
    const { error } = await supabase.rpc('exec', { sql: statement + ';' })
    if (error && !error.message.includes('already exists')) {
      console.error('Migration error:', error)
    }
  }
  
  console.log('✅ Migration complete!\n')
}

async function addMissingArchetypes() {
  console.log('🎭 Step 2: Adding 3 missing archetypes...\n')
  
  const newArchetypes = [
    {
      name: 'The Workaholic',
      description: 'Career-obsessed, neglects relationships for work, measures worth through productivity',
      impact_score: 75,
      traits: JSON.stringify([
        'career-focused',
        'driven',
        'neglectful of relationships',
        'productivity-obsessed',
        'emotionally unavailable'
      ]),
      psychology_profile: JSON.stringify({
        core_motivation: 'Achievement and success through work',
        core_fear: 'Being seen as unsuccessful or lazy',
        shadow: 'Neglects loved ones, burnout, inability to relax'
      }),
      alternative_names: ['The Career Addict', 'The Overachiever', 'The Absent Partner'],
      tags: ['work', 'career', 'neglect', 'burnout', 'unavailable']
    },
    {
      name: 'The Gaslighter',
      description: 'Manipulates reality, makes partner doubt their perceptions and sanity',
      impact_score: 95,
      traits: JSON.stringify([
        'manipulative',
        'reality-distorting',
        'psychologically abusive',
        'denies truth',
        'undermines confidence'
      ]),
      psychology_profile: JSON.stringify({
        core_motivation: 'Control through psychological manipulation',
        core_fear: 'Being exposed or losing control',
        shadow: 'Psychological abuse, destroys partner\'s sense of reality'
      }),
      alternative_names: ['The Reality Manipulator', 'The Mind Bender', 'The Psychological Abuser'],
      tags: ['manipulation', 'abuse', 'gaslighting', 'psychological', 'toxic', 'control']
    },
    {
      name: 'The Codependent',
      description: 'Loses self in relationship, needs to be needed, enables unhealthy patterns',
      impact_score: 80,
      traits: JSON.stringify([
        'self-sacrificing',
        'needs to be needed',
        'loses boundaries',
        'enables dysfunction',
        'fears abandonment'
      ]),
      psychology_profile: JSON.stringify({
        core_motivation: 'To be needed and avoid abandonment',
        core_fear: 'Being alone or rejected',
        shadow: 'Enables addiction/dysfunction, loses sense of self'
      }),
      alternative_names: ['The Enabler', 'The Self-Sacrificer', 'The Boundary-less'],
      tags: ['codependency', 'enabling', 'boundaries', 'self-sacrifice', 'abandonment']
    }
  ]
  
  for (const archetype of newArchetypes) {
    // Check if already exists
    const { data: existing } = await supabase
      .from('enhanced_archetypes')
      .select('id, name')
      .eq('name', archetype.name)
      .single()
    
    if (existing) {
      console.log(`⏭️  ${archetype.name} already exists, skipping...`)
      continue
    }
    
    const { data, error } = await supabase
      .from('enhanced_archetypes')
      .insert([archetype])
      .select()
    
    if (error) {
      console.error(`❌ Error adding ${archetype.name}:`, error)
    } else {
      console.log(`✅ Added: ${archetype.name}`)
      console.log(`   Aliases: ${archetype.alternative_names.join(', ')}`)
    }
  }
  
  console.log('\n✅ All missing archetypes added!\n')
}

async function showSummary() {
  console.log('📊 Step 3: Summary...\n')
  
  const { data, error } = await supabase
    .from('enhanced_archetypes')
    .select('id, name, alternative_names')
    .order('name')
  
  if (error) {
    console.error('Error fetching summary:', error)
    return
  }
  
  const withAliases = data.filter(a => a.alternative_names && a.alternative_names.length > 0)
  
  console.log(`Total archetypes: ${data.length}`)
  console.log(`Archetypes with aliases: ${withAliases.length}`)
  
  if (withAliases.length > 0) {
    console.log('\nArchetypes with aliases:')
    withAliases.forEach(a => {
      console.log(`  • ${a.name}: ${a.alternative_names.join(', ')}`)
    })
  }
}

async function main() {
  console.log('🚀 Setting up Archetype Alias System\n')
  console.log('=' .repeat(50))
  
  try {
    await runMigration()
    await addMissingArchetypes()
    await showSummary()
    
    console.log('\n' + '='.repeat(50))
    console.log('✨ Setup complete!\n')
    console.log('Next steps:')
    console.log('1. Review the 3 new archetypes in admin panel')
    console.log('2. I will provide suggested aliases for your existing 55 archetypes')
    console.log('3. You can approve/modify the aliases')
    console.log('4. We\'ll update them in bulk\n')
    
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

main()

