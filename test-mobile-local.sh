#!/bin/bash

# VogueVault Local Mobile Testing
# Run this script to build and test mobile features locally

echo "🚀 VogueVault Mobile Testing Setup"
echo "==================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: Not in VogueVault root directory${NC}"
    exit 1
fi

echo -e "${GREEN}✅ In correct directory${NC}"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js is installed (v$(node --version))${NC}"
echo ""

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Installing dependencies...${NC}"
    npm install
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Failed to install dependencies${NC}"
        exit 1
    fi
fi

echo ""
echo "🏗️  Building the project..."
npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Build failed${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}✅ Build successful!${NC}"
echo ""
echo "📱 Mobile Testing Options:"
echo ""
echo "Option 1: Run dev server for hot reload"
echo "  npm run dev"
echo ""
echo "Option 2: Test production build locally"
echo "  npm start"
echo ""
echo "Then:"
echo "  1. Open http://localhost:3000 on your phone or desktop"
echo "  2. Enable DevTools mobile emulation (F12)"
echo "  3. Select device (iPhone 14, Pixel 6, etc.)"
echo "  4. Test all features (auth, dashboard, products, etc.)"
echo "  5. Check offline mode: DevTools → Application → Offline"
echo ""
echo -e "${YELLOW}🧪 Testing Checklist:${NC}"
echo "  [ ] Responsive layout at different screen sizes"
echo "  [ ] Touch-friendly buttons (44x44px minimum)"
echo "  [ ] Navigation works on mobile"
echo "  [ ] Forms are easy to fill on mobile"
echo "  [ ] Images load quickly"
echo "  [ ] No horizontal scrolling"
echo "  [ ] Service Worker registered (DevTools → Application → Service Workers)"
echo "  [ ] Can install as PWA (should see install button/prompt)"
echo "  [ ] Works offline after caching (toggle offline in DevTools)"
echo ""
