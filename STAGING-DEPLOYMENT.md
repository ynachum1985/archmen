# Staging Branch Deployment Guide

## 🎯 Current Status
✅ **Staging branch is ready for deployment**
- All builder consolidation changes merged into staging
- Build passes successfully  
- TypeScript errors resolved
- Environment variables configured

## 🚀 Quick Deploy to Vercel

### Option 1: Vercel CLI (Fastest)
```bash
# Install Vercel CLI (if not already installed)
npm install -g vercel

# Login to Vercel
vercel login

# Make sure you're on staging branch
git checkout staging

# Deploy staging branch
vercel --prod

# Follow prompts to:
# - Link to existing project or create new one
# - Set project name (e.g., "archmen-staging")
```

### Option 2: Vercel Dashboard (Recommended)
1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click "Add New..." → "Project"  
3. Import your GitHub repository `ynachum1985/archmen`
4. **Important**: Set branch to `staging` (not main)
5. Configure:
   - **Framework**: Next.js
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install`

## 🔧 Environment Variables

Add these to your Vercel project:

```env
# Essential for deployment
NEXT_PUBLIC_APP_URL=https://your-staging-url.vercel.app
NEXT_PUBLIC_APP_NAME=ArchMen Staging
NEXT_PUBLIC_SUPABASE_URL=https://rkqujvonllmxjkkkeqsy.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJrcXVqdm9ubGxteGpra2tlcXN5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA5ODc5MjAsImV4cCI6MjA2NjU2MzkyMH0.AklzjAaCIygXBCPrjo9VvTQ1uFysCEnvpx-aV6o0R1w

# Optional (add when you have them)
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
OPENAI_API_KEY=your_openai_key
```

## ✨ What's New in Staging

### 🎨 Consolidated Assessment Builder
- **2 tabs instead of 4**: Cleaner, more focused interface
- **"Overview & AI Configuration"**: Basic info + AI setup combined
- **"Questioning Strategy & Flow"**: Strategy + advanced flow combined
- **Removed redundant titles**: No more "Assessment Builder" → "Create Assessment" → "Enhance Builder"

### 🔧 Technical Improvements  
- **Removed duplicate settings**: No more conflicting `adaptiveLogic` vs `globalSettings`
- **Added Response Requirements**: Min/max sentences, follow-up prompts in questioning tab
- **Fixed TypeScript errors**: Clean, type-safe code
- **Better organization**: Logical grouping of related features

## 🧪 Testing Your Deployment

Once deployed, test these key areas:

1. **Navigate to `/admin`**
2. **Click "Builder" tab**
3. **Verify new tab structure**:
   - ✅ "Overview & AI Configuration" 
   - ✅ "Questioning Strategy & Flow"
   - ✅ "Report & Answers"
   - ✅ "Reference Files"
4. **Check for clean interface**: No redundant titles or duplicate controls
5. **Test Response Requirements**: Should be in questioning tab

## 📋 Branch Structure
- `main` → Production (stable)
- `staging` → Testing (current target) 
- `builder` → Feature branch (merged into staging)

## 🎯 Expected URL Structure
After deployment, you'll have:
- **Staging URL**: `https://archmen-staging-xyz.vercel.app`
- **Admin Panel**: `https://archmen-staging-xyz.vercel.app/admin`
- **Builder**: `https://archmen-staging-xyz.vercel.app/admin` → Builder tab

## 🚨 If Deployment Fails
1. Check environment variables are set
2. Verify branch is set to `staging`
3. Check build logs in Vercel dashboard
4. Ensure all dependencies are in package.json

The staging branch is ready to go live! 🎉
