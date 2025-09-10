#!/bin/bash

# Deploy ArchMen Staging Branch to Vercel
# This script automates the deployment of the staging branch

echo "🚀 Deploying ArchMen Staging Branch to Vercel"
echo "=============================================="

# Check if we're on the staging branch
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "staging" ]; then
    echo "⚠️  Switching to staging branch..."
    git checkout staging
    git pull origin staging
fi

echo "✅ On staging branch"

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

echo "✅ Vercel CLI ready"

# Build the project to check for errors
echo "🔨 Building project..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful"
else
    echo "❌ Build failed. Please fix errors before deploying."
    exit 1
fi

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."
vercel --prod

echo ""
echo "🎉 Deployment complete!"
echo ""
echo "📋 Next steps:"
echo "1. Visit your Vercel dashboard to get the URL"
echo "2. Test the /admin page"
echo "3. Check the Builder tab for consolidated interface"
echo "4. Verify no duplicate settings or redundant titles"
echo ""
echo "🔧 If you need to add environment variables:"
echo "   - Go to Vercel dashboard > Settings > Environment Variables"
echo "   - Add the variables from STAGING-DEPLOYMENT.md"
echo ""
