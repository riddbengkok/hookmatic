#!/bin/bash
# deploy-api.sh — Deploy API to Google Cloud Run
# Usage: ./deploy-api.sh <your-gcp-project-id>

set -e

PROJECT_ID=${1:-"your-gcp-project-id"}
SERVICE_NAME="hookmatic-api"
REGION="asia-southeast1"
IMAGE="gcr.io/$PROJECT_ID/$SERVICE_NAME"

echo "🚀 Deploying Hookmatic API to Cloud Run..."
echo "   Project : $PROJECT_ID"
echo "   Region  : $REGION"
echo "   Image   : $IMAGE"
echo ""

# Build & push Docker image from monorepo root
echo "📦 Building Docker image..."
docker build -f apps/api/Dockerfile -t "$IMAGE" .

echo "📤 Pushing image to Container Registry..."
docker push "$IMAGE"

echo "☁️  Deploying to Cloud Run..."
gcloud run deploy "$SERVICE_NAME" \
  --image "$IMAGE" \
  --platform managed \
  --region "$REGION" \
  --allow-unauthenticated \
  --port 8080 \
  --memory 512Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 5 \
  --set-secrets "GEMINI_API_KEY=GEMINI_API_KEY:latest" \
  --project "$PROJECT_ID"

echo ""
echo "✅ API deployed! URL:"
gcloud run services describe "$SERVICE_NAME" \
  --region "$REGION" \
  --project "$PROJECT_ID" \
  --format "value(status.url)"
