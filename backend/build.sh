#!/bin/bash
# Build script for Render - runs the API Gateway (main entry point)

echo "🔨 Installing dependencies..."
npm install

echo "📦 Building backend..."
npm run build

echo "✅ Backend ready for deployment!"
