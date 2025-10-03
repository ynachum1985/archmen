import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  try {
    console.log('=== SIMPLE SUPABASE TEST ===')
    
    // Check environment variables
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    console.log('URL exists:', !!url)
    console.log('Anon key exists:', !!anonKey)
    console.log('Service key exists:', !!serviceKey)
    console.log('URL length:', url?.length || 0)
    console.log('Anon key length:', anonKey?.length || 0)
    console.log('Service key length:', serviceKey?.length || 0)
    
    if (!url || !anonKey) {
      return NextResponse.json({
        error: 'Missing environment variables',
        hasUrl: !!url,
        hasAnonKey: !!anonKey,
        hasServiceKey: !!serviceKey
      }, { status: 500 })
    }
    
    // Try to create a simple Supabase client
    console.log('Creating Supabase client...')
    const supabase = createClient(url, anonKey)
    console.log('Supabase client created successfully')
    
    // Try a simple query
    console.log('Testing simple query...')
    const { data, error } = await supabase.from('enhanced_archetypes').select('id').limit(1)
    
    if (error) {
      console.error('Query error:', error)
      return NextResponse.json({
        error: 'Query failed',
        details: error.message,
        hasUrl: !!url,
        hasAnonKey: !!anonKey,
        hasServiceKey: !!serviceKey
      }, { status: 500 })
    }
    
    console.log('Query successful, found', data?.length || 0, 'records')
    
    return NextResponse.json({
      success: true,
      hasUrl: !!url,
      hasAnonKey: !!anonKey,
      hasServiceKey: !!serviceKey,
      urlLength: url?.length || 0,
      anonKeyLength: anonKey?.length || 0,
      serviceKeyLength: serviceKey?.length || 0,
      queryResult: data?.length || 0,
      timestamp: new Date().toISOString()
    })
    
  } catch (error: any) {
    console.error('Simple Supabase test error:', error)
    return NextResponse.json({
      error: 'Test failed',
      details: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
