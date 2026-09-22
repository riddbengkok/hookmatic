#!/bin/bash
# deploy-web.sh — Build and deploy frontend to Firebase Hosting
# Usage: ./deploy-web.sh <your-cloud-run-api-url>

set -e

API_URL=${1:-"https://hookmatic-api-xxxx-as.a.run.app"}

echo "🌐 Deploying Hookmatic Web to Firebase Hosting..."
echo "   API URL: $API_URL"
echo ""

# Build frontend with the production API URL
echo "📦 Building frontend..."
VITE_API_URL="$API_URL" pnpm --filter web run build

# Deploy to Firebase Hosting
echo "🔥 Deploying to Firebase Hosting..."
pnpm exec firebase deploy --only hosting

echo ""
echo "✅ Frontend deployed!"
