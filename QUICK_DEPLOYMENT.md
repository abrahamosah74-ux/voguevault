# VogueVault Deployment Quick Start

## 🎯 Choose Your Stack (Pick One Per Layer)

### Frontend (Pick One)
- **Vercel** ⭐ (Easiest, free tier, auto-deploys)
- Netlify (Good, but limited for Next.js SSR)
- AWS S3 + CloudFront (Complex but scalable)
- Self-hosted VPS (Full control)

### Backend (Pick One)
- **Heroku** ⭐ (Easiest, auto-deploys, has free tier)
- **Railway** ✅ (Modern, similar to Heroku)
- AWS EC2 + RDS (Most control, more setup)
- DigitalOcean (Great pricing, simple)
- Render (User-friendly)

### Database (Pick One)
- **Neon** ⭐ (Free PostgreSQL, serverless)
- AWS RDS (Managed, reliable)
- DigitalOcean Managed (Simple, affordable)
- Supabase (Postgres + Auth)
- Self-hosted (Full control, manual work)

### Cloud Storage (Pick One)
- **AWS S3** ⭐ (Standard, reliable)
- Cloudinary (Easy image handling)
- Azure Blob Storage
- Google Cloud Storage

---

## 📋 Step-by-Step: Frontend + Backend (Easiest Path)

### Total Time: ~1.5 hours

### Part 1: Frontend to Vercel (20 minutes)

```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Deploy
cd voguevault
vercel --prod

# 3. Follow prompts:
# - Link to existing account? Yes
# - Import existing project? Yes
# - Set project name to: voguevault

# ✓ Done! Your app is live at: https://voguevault.vercel.app
```

**Add Environment Variables:**
1. Go to Vercel Dashboard
2. Project → Settings → Environment Variables
3. Add these for Production:

```
NEXT_PUBLIC_API_BASE_URL=https://api.yourdomain.com
NEXT_PUBLIC_3D_MODELS_URL=https://cdn.yourdomain.com/models
NEXT_PUBLIC_AURORA_AI_ENABLED=true
NEXT_PUBLIC_AR_ENABLED=true
```

4. Redeploy: `vercel --prod`

---

### Part 2: Database on Neon (10 minutes)

**Step 1: Create Database**
1. Go to https://neon.tech
2. Sign up (free)
3. Create new project
4. Click "SQL Editor"
5. Copy your connection string: `postgresql://user:pass@host/dbname`

**Step 2: Run Migrations**
```bash
# Save your connection string to .env
DATABASE_URL=postgresql://user:pass@host/dbname

# Install psql (if you don't have it)
# macOS: brew install postgresql
# Windows: https://www.postgresql.org/download/windows/

# Run migrations
psql $DATABASE_URL < database/migrations/001_initial_schema.sql
psql $DATABASE_URL < database/migrations/002_auth_system.sql
psql $DATABASE_URL < database/migrations/003_add_3d_and_aurora_tables.sql

# ✓ Done! Database is ready
```

---

### Part 3: Backend to Heroku (30 minutes)

**Step 1: Prepare Backend**
```bash
# Create Procfile
echo "web: npm start" > backend/Procfile

# Create .env.example
cat > backend/.env.example << 'EOF'
NODE_ENV=production
PORT=8080
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-here
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
AWS_S3_BUCKET=voguevault-models
CORS_ORIGIN=https://app.yourdomain.com
EOF

cd backend
```

**Step 2: Deploy to Heroku**
```bash
# Install Heroku CLI
# https://devcenter.heroku.com/articles/heroku-cli

# Login
heroku login

# Create app
heroku create voguevault-api

# Add PostgreSQL
heroku addons:create heroku-postgresql:standard-0

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your-secret-key
heroku config:set AWS_ACCESS_KEY_ID=your-aws-key
heroku config:set AWS_SECRET_ACCESS_KEY=your-aws-secret
heroku config:set AWS_S3_BUCKET=voguevault-models
heroku config:set CORS_ORIGIN=https://app.yourdomain.com

# Deploy
git push heroku main

# Run migrations
heroku run "node scripts/migrate.js"

# Check logs
heroku logs --tail

# ✓ Done! API is live at: https://voguevault-api.herokuapp.com
```

---

### Part 4: Connect Frontend to Backend (10 minutes)

**Step 1: Update Environment Variables**

In Vercel Dashboard:
```
NEXT_PUBLIC_API_BASE_URL=https://voguevault-api.herokuapp.com
```

**Step 2: Redeploy**
```bash
vercel --prod
```

**Step 3: Test Connection**
```bash
# Your app should now connect to the API
# Check browser console for errors
# Test API calls from demo page
```

---

## 🚀 Summary of Services

| Service | Purpose | Cost | Setup Time |
|---------|---------|------|-----------|
| **Vercel** | Frontend hosting | Free | 5 min |
| **Neon** | Database | Free (5GB) | 5 min |
| **Heroku** | Backend hosting | $7-25/month | 15 min |
| **AWS S3** | 3D model storage | $0.023/GB | 10 min |
| **Total** | Complete stack | ~$30-50/month | **1.5 hours** |

---

## ✅ Verification Checklist

After deployment, verify everything works:

### Frontend
- [ ] Visit https://voguevault.vercel.app
- [ ] Page loads without errors
- [ ] 3D viewer demo loads
- [ ] Click "Demo" button
- [ ] Admin panel opens

### Backend
- [ ] Visit https://voguevault-api.herokuapp.com/api/health
- [ ] Returns: `{"status":"ok"}`

### Database
- [ ] Migrations ran successfully
- [ ] Tables created (check Neon dashboard)
- [ ] Can query materials table

### Connection
- [ ] Frontend can call backend API
- [ ] No CORS errors
- [ ] 3D models load from S3

---

## 🔐 Security Checklist

Before going to production:

- [ ] All secrets in environment variables (NOT in code)
- [ ] Different secrets for staging vs production
- [ ] HTTPS enabled on all domains
- [ ] CORS properly configured
- [ ] Database backups enabled
- [ ] Error logging configured
- [ ] Rate limiting enabled

---

## 📞 Common Issues & Fixes

### "CORS Error: Origin not allowed"
**Fix:** Update `CORS_ORIGIN` in backend .env
```bash
heroku config:set CORS_ORIGIN=https://voguevault.vercel.app
heroku releases:output
```

### "Database connection refused"
**Fix:** Verify connection string is correct
```bash
heroku config | grep DATABASE_URL
psql <connection-string>
```

### "Models not loading from S3"
**Fix:** Check AWS credentials
```bash
heroku config | grep AWS
# Verify bucket name and region
```

### "Heroku app crashes"
**Fix:** Check logs
```bash
heroku logs --tail
# Look for error messages
```

---

## 📊 Monitoring After Deployment

**Daily:**
- Check Vercel analytics dashboard
- Check Heroku logs
- Monitor error reports

**Weekly:**
- Review performance metrics
- Check error logs
- Update dependencies

**Monthly:**
- Database optimization
- Cost analysis
- Security updates

---

## 🎯 Next Steps

1. ✅ Setup custom domain
   ```bash
   # Vercel: Settings → Domains → Add voguevault.com
   # Heroku: Settings → Domains → Add api.voguevault.com
   ```

2. ✅ Configure email service
   - Setup Sendgrid or Mailgun
   - Add API keys to environment

3. ✅ Setup payment processing
   - Add Stripe keys
   - Configure webhooks

4. ✅ Enable monitoring
   - Setup Sentry for error tracking
   - Configure alerts

5. ✅ Train team
   - Share deployment docs
   - Document processes
   - Create runbooks

---

## 📚 Additional Resources

- **Vercel Docs**: https://vercel.com/docs
- **Heroku Docs**: https://devcenter.heroku.com
- **PostgreSQL Docs**: https://www.postgresql.org/docs
- **AWS S3 Docs**: https://docs.aws.amazon.com/s3/
- **Express Docs**: https://expressjs.com/docs

---

## 💬 Need Help?

If deployment fails:

1. **Check the logs**
   ```bash
   vercel logs                    # Frontend logs
   heroku logs --tail             # Backend logs
   ```

2. **Verify environment variables**
   ```bash
   heroku config                  # See all backend env vars
   # Vercel dashboard → Settings → Environment Variables
   ```

3. **Test each component separately**
   ```bash
   curl https://voguevault-api.herokuapp.com/api/health
   curl https://voguevault.vercel.app
   ```

4. **Check database connection**
   ```bash
   psql <your-neon-connection-string>
   \dt  # List tables
   ```

---

**You've got this! 🎉 Deploy your 3D + Aurora AI system in 1.5 hours.**
