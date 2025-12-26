# VogueVault 👗✨

Your personal AI fashion co-pilot. VogueVault uses advanced AI (Aurora) to analyze your wardrobe, understand your style, and create personalized outfit recommendations based on your mood, occasion, and weather.

## 🎯 Features

- **Smart Recommendations**: Get outfit suggestions tailored to weather, occasion, and personal style
- **Aurora AI**: Advanced AI-powered outfit generation and wardrobe analysis
- **Digital Wardrobe**: Organize and analyze your wardrobe with AI-powered compatibility scoring
- **Personalization**: Style evolution tracking and mood-based recommendations
- **User Authentication**: Secure login/signup with JWT tokens
- **Product Catalog**: Browse and search fashion items
- **Responsive Design**: Beautiful UI that works on all devices

## 🚀 Quick Start

**New to VogueVault?** Read [QUICK_START.md](./QUICK_START.md) for a 5-minute setup guide.

**Need detailed env setup?** Check [ENV_SETUP_GUIDE.md](./ENV_SETUP_GUIDE.md) for complete configuration instructions.

**Want to see what's been done?** View [COMPLETION_REPORT.md](./COMPLETION_REPORT.md) for a detailed project status.

## 🏗️ Architecture

### Frontend
- **Framework**: Next.js 16 with App Router
- **UI**: React 19 + Tailwind CSS
- **State**: React hooks + localStorage
- **Deployment**: Vercel (https://voguevault-cyan.vercel.app)

### Backend
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL
- **Auth**: JWT tokens
- **Deployment**: Render (https://voguevault-api.onrender.com)

## 📁 Project Structure

```
voguevault/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Landing page
│   │   ├── auth/page.tsx         # Login/signup
│   │   ├── dashboard/page.tsx    # User profile
│   │   ├── products/page.tsx     # Product listing
│   │   └── recommendations/      # Aurora AI
│   ├── components/
│   │   └── navbar.tsx            # Navigation
│   ├── hooks/
│   │   └── useAuth.ts            # Auth management
│   ├── lib/
│   │   └── api-client.ts         # API wrapper
│   └── globals.css
├── backend/                       # Express API (separate deployment)
├── package.json
├── next.config.ts
├── tsconfig.json
└── README.md
```

## 🔧 Local Development

### Prerequisites
- Node.js 20+
- npm or yarn
- PostgreSQL (for backend)

### Setup

1. **Clone the repo** (if not already cloned)
   ```bash
   git clone https://github.com/abrahamosah74-ux/voguevault.git
   cd voguevault
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create `.env.local`**
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3001
   NEXT_PUBLIC_ENABLE_DEMO=true
   NEXT_PUBLIC_ENABLE_RECOMMENDATIONS=true
   ```

4. **Run dev server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000)

5. **Run backend** (in separate terminal)
   ```bash
   cd backend/services/api-gateway
   npm install
   npm run dev
   ```
   Backend runs on [http://localhost:3001](http://localhost:3001)

## 📚 Pages & Routes

| Route | Description | Auth Required |
|-------|-------------|---------------|
| `/` | Landing page with features | ❌ |
| `/auth` | Login/signup | ❌ |
| `/dashboard` | User profile & settings | ✅ |
| `/products` | Browse products | ✅ |
| `/recommendations` | Aurora AI recommendations | ✅ |

## 🔑 Key Components

### useAuth Hook
```typescript
const { user, isAuthenticated, login, register, logout } = useAuth();
```

### API Client
```typescript
import { apiCall, authApi, productsApi, auroraApi } from '@/lib/api-client';

// Check health
const response = await apiCall<HealthStatus>('/health', { skipAuth: true });

// Login
const res = await authApi.login(email, password);

// Get products
const products = await productsApi.list();

// Generate outfit
const outfit = await auroraApi.generateOutfit({ occasion, mood, preferences });
```

## 🌐 Deployment

### Frontend (Vercel)
```bash
# Automatic on git push to main
# Or manually in Vercel dashboard
```

**URL**: https://voguevault-cyan.vercel.app

### Backend (Render)
```bash
# Automatic deployment
# Environment variables required (see ENV_SETUP_GUIDE.md)
```

**URL**: https://voguevault-api.onrender.com

## ⚙️ Environment Variables

### Frontend (NEXT_PUBLIC_*)
- `NEXT_PUBLIC_API_URL`: Backend API endpoint

### Backend (Render)
- Database: `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
- Auth: `JWT_SECRET`
- Services: `CLOUDINARY_API_KEY`, `RESEND_API_KEY`
- CORS: `CORS_ORIGIN`

See [ENV_SETUP_GUIDE.md](./ENV_SETUP_GUIDE.md) for complete list.

## 🧪 Testing

### Test Frontend
```bash
npm run dev
# Visit http://localhost:3000
# Sign up → Dashboard → Products → Recommendations
```

### Test Backend
```bash
curl https://voguevault-api.onrender.com/health
# Response: {"status":"ok",...}
```

### Test API Integration
1. Frontend loads and is responsive ✅
2. Sign up creates account ✅
3. Dashboard displays user info ✅
4. Products load from backend ✅
5. API health check works ✅

## 📊 Tech Stack

### Frontend
- Next.js 16.1.1
- React 19
- TypeScript
- Tailwind CSS
- Vercel

### Backend
- Express.js
- TypeScript
- PostgreSQL
- JWT
- Render

## 🐛 Troubleshooting

### "Cannot find module" error
- Check `.env.local` has `NEXT_PUBLIC_API_URL`
- Restart dev server after changing env vars

### Frontend shows 404
- Wait for Vercel deployment to complete
- Check Vercel dashboard for build errors
- Try redeploying in Vercel

### API calls fail
- Verify backend health: `curl https://voguevault-api.onrender.com/health`
- Check browser console for errors
- Ensure `NEXT_PUBLIC_API_URL` is correct

### Auth not working
- Clear localStorage: `localStorage.clear()`
- Check JWT_SECRET is set in backend
- Review browser Network tab for 401/403 errors

## 📖 Documentation

- **[QUICK_START.md](./QUICK_START.md)** - 5-minute setup
- **[ENV_SETUP_GUIDE.md](./ENV_SETUP_GUIDE.md)** - Environment variable guide
- **[COMPLETION_REPORT.md](./COMPLETION_REPORT.md)** - Project status & features
- **[Next.js Docs](https://nextjs.org/docs)** - Framework documentation
- **[React Docs](https://react.dev)** - Component development

## 🤝 Contributing

Contributions are welcome! Feel free to:
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is open source and available under the MIT License.

## 👥 Support

For questions or issues:
1. Check the [troubleshooting section](#-troubleshooting)
2. Review the [documentation files](#-documentation)
3. Open a GitHub issue with details

## 🎉 Status

🟢 **Production Ready**

- ✅ Frontend deployed to Vercel
- ✅ Backend deployed to Render
- ✅ All features implemented
- ✅ Full authentication system
- ✅ API integration complete
- ⏳ Awaiting environment variable setup

---

**Ready to get started?** Head over to [QUICK_START.md](./QUICK_START.md)! 🚀
