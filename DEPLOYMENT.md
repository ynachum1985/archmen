# ArchMen Deployment Guide

This guide will help you deploy ArchMen to Vercel with Supabase backend.

## Prerequisites

✅ **Already Set Up:**
- ✅ GitHub repository: [https://github.com/ynachum1985/archmen](https://github.com/ynachum1985/archmen)
- ✅ Supabase project: `https://rkqujvonllmxjkkkeqsy.supabase.co`
- ✅ Database schema created with all tables
- ✅ Environment variables template

## Quick Deploy to Vercel

### Option 1: One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/import/project?template=https://github.com/ynachum1985/archmen)

### Option 2: Manual Deployment

1. **Go to Vercel Dashboard**
   - Visit [vercel.com](https://vercel.com)
   - Sign in with your GitHub account

2. **Import the Repository**
   - Click "Add New Project"
   - Select "Import Git Repository"
   - Choose `ynachum1985/archmen`

3. **Configure the Project**
   - **Framework Preset:** Next.js
   - **Root Directory:** `./` (default)
   - **Build Command:** `npm run build` (auto-detected)
   - **Output Directory:** `.next` (auto-detected)
   - **Install Command:** `npm install` (auto-detected)

4. **Add Environment Variables**
   
   In the Environment Variables section, add these **essential** variables:

   ```env
   # Required for basic functionality
   NEXT_PUBLIC_SUPABASE_URL=https://rkqujvonllmxjkkkeqsy.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJrcXVqdm9ubGxteGpra2tlcXN5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA5ODc5MjAsImV4cCI6MjA2NjU2MzkyMH0.AklzjAaCIygXBCPrjo9VvTQ1uFysCEnvpx-aV6o0R1w
   NEXT_PUBLIC_APP_NAME=ArchMen
   ```

   **Optional variables** (add later when you have the keys):
   ```env
   # Get your service role key from Supabase Dashboard > Settings > API
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   
   # Add your OpenAI API key for the AI chatbot
   OPENAI_API_KEY=your_openai_api_key
   
   # Add your Stripe keys for payments
   STRIPE_SECRET_KEY=your_stripe_secret_key
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
   STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
   
   # Create these price IDs in Stripe Dashboard
   STRIPE_PRICE_ID_MONTHLY=price_monthly_subscription_id
   STRIPE_PRICE_ID_YEARLY=price_yearly_subscription_id
   STRIPE_PRICE_ID_LIFETIME=price_lifetime_subscription_id
   ```

5. **Deploy**
   - Click "Deploy"
   - Wait for deployment to complete (usually 2-3 minutes)

## What's Already Working

After deployment, your app will have:

- ✅ **Landing Page** - Beautiful homepage with pricing tiers
- ✅ **Navigation** - Header with links to key sections
- ✅ **Authentication Setup** - Supabase auth ready to use
- ✅ **Database** - All tables created with proper RLS policies
- ✅ **Responsive Design** - Mobile-friendly with dark theme
- ✅ **Type Safety** - Full TypeScript support

## Next Steps After Deployment

1. **Test the Landing Page**
   - Visit your Vercel URL
   - Verify the page loads correctly
   - Check that the design looks good

2. **Complete the Missing Services**
   - Get OpenAI API key for AI chat functionality
   - Set up Stripe for payment processing
   - Add the environment variables to Vercel

3. **Build Core Features**
   - Authentication pages (login/register)
   - AI-powered assessment chat
   - User dashboard
   - Course system

## Architecture Overview

```
┌─────────────┐    ┌──────────────┐    ┌─────────────┐
│   Vercel    │    │   Supabase   │    │   Stripe    │
│  (Frontend) │◄──►│ (Auth + DB)  │    │ (Payments)  │
│             │    │              │    │             │
└─────────────┘    └──────────────┘    └─────────────┘
       │                   │                   │
       │                   │                   │
       ▼                   ▼                   ▼
┌─────────────┐    ┌──────────────┐    ┌─────────────┐
│   OpenAI    │    │ Repository   │    │  Webhooks   │
│ (AI Chat)   │    │  Pattern     │    │  (Stripe)   │
└─────────────┘    └──────────────┘    └─────────────┘
```

## Database Schema

Your Supabase database includes:

- **profiles** - User profiles and subscription status
- **assessments** - User assessment data
- **archetype_results** - Analysis results from assessments
- **conversations** - Chat history with AI
- **courses** - Course content and structure
- **course_enrollments** - User progress in courses

## Support

If you encounter any issues:

1. Check the Vercel build logs
2. Verify all environment variables are set correctly
3. Check Supabase logs for database issues
4. Review the GitHub repository for updates

## URLs

- **Live App:** Will be provided after Vercel deployment
- **GitHub:** https://github.com/ynachum1985/archmen
- **Supabase:** https://rkqujvonllmxjkkkeqsy.supabase.co