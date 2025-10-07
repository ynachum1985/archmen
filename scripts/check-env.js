#!/usr/bin/env node

/**
 * Script to check if required environment variables are set
 * Run this during build to ensure all required env vars are available
 *
 * Note: In local development, Next.js automatically loads .env.local
 * In Vercel, environment variables come from the dashboard settings
 */

const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
]

const optionalEnvVars = [
  'SUPABASE_SERVICE_ROLE_KEY',
  'OPENAI_API_KEY',
  'ANTHROPIC_API_KEY',
  'GROQ_API_KEY',
  'KIMI_API_KEY',
  'OPENROUTER_API_KEY',
]

console.log('=== Environment Variables Check ===\n')

let hasErrors = false

console.log('Required Variables:')
requiredEnvVars.forEach(varName => {
  const value = process.env[varName]
  const status = value ? '✅ SET' : '❌ MISSING'
  console.log(`  ${status} ${varName}`)
  if (!value) {
    hasErrors = true
  }
})

console.log('\nOptional Variables:')
optionalEnvVars.forEach(varName => {
  const value = process.env[varName]
  const status = value ? '✅ SET' : '⚠️  NOT SET'
  console.log(`  ${status} ${varName}`)
})

console.log('\n=== End Check ===\n')

if (hasErrors) {
  console.error('ERROR: Required environment variables are missing!')
  console.error('\nIf running locally:')
  console.error('  - Make sure you have a .env.local file with the required variables')
  console.error('  - Next.js will automatically load it during build')
  console.error('\nIf deploying to Vercel:')
  console.error('  - Set environment variables in your Vercel project settings')
  console.error('  - https://vercel.com/ynachum1985s-projects/archmen/settings/environment-variables')
  console.error('  - Make sure to select all environments (Production, Preview, Development)')
  console.error('  - Redeploy after setting the variables')

  // Don't exit with error in local development (Next.js will load .env.local)
  // Only exit with error in CI/Vercel where env vars must be explicitly set
  if (process.env.VERCEL || process.env.CI) {
    process.exit(1)
  } else {
    console.warn('\n⚠️  Continuing build (assuming .env.local will be loaded by Next.js)...\n')
  }
} else {
  console.log('All required environment variables are set ✅')
}

