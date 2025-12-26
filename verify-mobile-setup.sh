#!/bin/bash

# VogueVault Mobile Deployment Verification
# This script verifies all mobile-related files are in place

echo "🔍 VogueVault Mobile Setup Verification"
echo "========================================"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Not in VogueVault root directory"
    exit 1
fi

echo "✅ In correct directory"
echo ""

# Array of required files
required_files=(
    "public/manifest.json"
    "public/service-worker.js"
    "public/offline.html"
    "public/icon-192x192.svg"
    "src/components/ServiceWorkerRegistry.tsx"
    "src/hooks/useMobileOptimization.ts"
    "MOBILE_GUIDE.md"
    "MOBILE_TESTING_GUIDE.md"
)

echo "📋 Checking required files:"
all_files_exist=true

for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        echo "  ✅ $file"
    else
        echo "  ❌ $file (MISSING)"
        all_files_exist=false
    fi
done

echo ""
echo "🔧 Checking file contents:"
echo ""

# Check manifest.json is valid JSON
if [ -f "public/manifest.json" ]; then
    if jq empty public/manifest.json 2>/dev/null; then
        echo "  ✅ manifest.json is valid JSON"
    else
        echo "  ❌ manifest.json has invalid JSON"
    fi
fi

# Check service-worker.js has required handlers
if [ -f "public/service-worker.js" ]; then
    if grep -q "addEventListener('install'" public/service-worker.js; then
        echo "  ✅ service-worker.js has install handler"
    else
        echo "  ❌ service-worker.js missing install handler"
    fi
    
    if grep -q "addEventListener('fetch'" public/service-worker.js; then
        echo "  ✅ service-worker.js has fetch handler"
    else
        echo "  ❌ service-worker.js missing fetch handler"
    fi
fi

# Check layout.tsx has ServiceWorkerRegistry
if [ -f "src/app/layout.tsx" ]; then
    if grep -q "ServiceWorkerRegistry" src/app/layout.tsx; then
        echo "  ✅ layout.tsx imports ServiceWorkerRegistry"
    else
        echo "  ❌ layout.tsx doesn't import ServiceWorkerRegistry"
    fi
fi

# Check manifest.json is referenced in layout.tsx
if [ -f "src/app/layout.tsx" ]; then
    if grep -q 'manifest: "/manifest.json"' src/app/layout.tsx; then
        echo "  ✅ layout.tsx references manifest.json"
    else
        echo "  ❌ layout.tsx doesn't reference manifest.json"
    fi
fi

echo ""
echo "📊 File Sizes:"
if [ -f "public/service-worker.js" ]; then
    size=$(wc -c < "public/service-worker.js")
    echo "  service-worker.js: $size bytes"
fi

if [ -f "public/manifest.json" ]; then
    size=$(wc -c < "public/manifest.json")
    echo "  manifest.json: $size bytes"
fi

if [ -f "public/offline.html" ]; then
    size=$(wc -c < "public/offline.html")
    echo "  offline.html: $size bytes"
fi

echo ""
if [ "$all_files_exist" = true ]; then
    echo "✅ All required mobile files are present!"
    echo ""
    echo "📱 Next steps:"
    echo "1. Build the app: npm run build"
    echo "2. Deploy to Vercel: git push origin main"
    echo "3. Test on mobile: https://voguevault-cyan.vercel.app"
    echo "4. Install as PWA: Add to Home Screen (iOS) or Install (Android)"
    echo "5. Test offline: Turn off WiFi and refresh the page"
    echo ""
else
    echo "❌ Some required files are missing!"
    echo "Please create the missing files before deploying."
    exit 1
fi
