#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js'

// Hardcode from .env.local
const supabaseUrl = 'https://rkqujvonllmxjkkkeqsy.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJrcXVqdm9ubGxteGpra2tlcXN5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDk4NzkyMCwiZXhwIjoyMDY2NTYzOTIwfQ.HAC2EBgssb8ruwStzXs6wXjawEllsGqVnIeY5dSdRMw'

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function listArchetypes() {
  const { data, error } = await supabase
    .from('enhanced_archetypes')
    .select('id, name, description, is_active')
    .order('name')

  if (error) {
    console.error('Error fetching archetypes:', error)
    process.exit(1)
  }

  console.log('\n=== CURRENT ARCHETYPES IN DATABASE ===\n')
  
  const active = data.filter(a => a.is_active !== false)
  const inactive = data.filter(a => a.is_active === false)
  
  console.log(`Active Archetypes (${active.length}):`)
  active.forEach((a, i) => {
    console.log(`${i + 1}. ${a.name}`)
    if (a.description) {
      console.log(`   ${a.description}`)
    }
    console.log()
  })
  
  if (inactive.length > 0) {
    console.log(`\nInactive Archetypes (${inactive.length}):`)
    inactive.forEach((a, i) => {
      console.log(`${i + 1}. ${a.name}`)
    })
  }
  
  console.log(`\nTotal: ${data.length} archetypes (${active.length} active, ${inactive.length} inactive)`)
}

listArchetypes()

