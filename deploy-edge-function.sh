#!/bin/bash

# Deploy Supabase Edge Function for Archetype Embedding
# This script deploys the process-archetype-embedding function to Supabase

echo "🚀 Deploying Supabase Edge Function..."
echo ""

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Installing..."
    npm install -g supabase
fi

# Check if logged in
echo "📝 Checking Supabase login status..."
if ! supabase projects list &> /dev/null; then
    echo "🔐 Please login to Supabase..."
    supabase login
fi

# Link to project if not already linked
echo "🔗 Linking to Supabase project..."
supabase link --project-ref rkqujvonllmxjkkkeqsy

# Deploy the Edge Function
echo "📦 Deploying process-archetype-embedding function..."
supabase functions deploy process-archetype-embedding --no-verify-jwt

# Set environment variables
echo "🔧 Setting environment variables..."
echo ""
echo "Please set the following secrets:"
echo "1. OPENAI_API_KEY"
echo "2. SUPABASE_URL (should be: https://rkqujvonllmxjkkkeqsy.supabase.co)"
echo "3. SUPABASE_SERVICE_ROLE_KEY"
echo ""
echo "Run these commands:"
echo "  supabase secrets set OPENAI_API_KEY=your_key_here"
echo "  supabase secrets set SUPABASE_URL=https://rkqujvonllmxjkkkeqsy.supabase.co"
echo "  supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_key_here"
echo ""
echo "✅ Deployment complete!"
echo ""
echo "🔗 Your Edge Function URL:"
echo "   https://rkqujvonllmxjkkkeqsy.supabase.co/functions/v1/process-archetype-embedding"

