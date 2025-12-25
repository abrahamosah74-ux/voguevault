# How to Get All Environment Variables

## 1️⃣ JWT_ACCESS_SECRET & JWT_REFRESH_SECRET

These are **secret keys you generate yourself**. They just need to be long random strings.

### Generate on Windows PowerShell:

```powershell
# Generate a random secret
[Convert]::ToBase64String((1..32 | ForEach-Object { [byte](Get-Random -Maximum 256) }))
```

Run this command twice to get 2 different keys:

**Example output:**
```
ABC123DEF456GHI789JKL012MNO345PQR678STU901
XYZ789ABC456DEF123GHI012JKL345MNO678PQR901
```

**In Render environment, set:**
```
JWT_ACCESS_SECRET=ABC123DEF456GHI789JKL012MNO345PQR678STU901
JWT_REFRESH_SECRET=XYZ789ABC456DEF123GHI012JKL345MNO678PQR901
```

---

## 2️⃣ CORS_ORIGIN

This is **your Vercel frontend URL** (you already know this):

```
CORS_ORIGIN=https://voguevault.vercel.app
```

That's it! ✓

---

## 3️⃣ AWS_S3_BUCKET, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY

These require an **AWS account** and **S3 bucket setup**.

### Step 1: Create S3 Bucket

1. Go to **https://console.aws.amazon.com/s3**
2. Click **"Create bucket"**
3. Fill in:
   - **Bucket name**: `voguevault-models`
   - **Region**: Pick closest to you (e.g., `us-east-1`)
4. Leave other settings default
5. Click **Create bucket**

✅ **Set in Render:**
```
AWS_S3_BUCKET=voguevault-models
AWS_S3_REGION=us-east-1
```

---

### Step 2: Create IAM User for Access

1. Go to **https://console.aws.amazon.com/iam**
2. Click **"Users"** (left menu)
3. Click **"Create user"**
4. Fill in:
   - **User name**: `voguevault-app`
5. Click **"Create user"**

---

### Step 3: Give S3 Permission to User

1. Click the user you just created: **voguevault-app**
2. Click **"Add permissions"** → **"Attach policies directly"**
3. Search for: `AmazonS3FullAccess`
4. Check the box
5. Click **"Add permissions"**

---

### Step 4: Create Access Key

1. Click the user: **voguevault-app**
2. Go to **"Security credentials"** tab
3. Click **"Create access key"**
4. Select: **Application running outside AWS**
5. Click **"Next"**
6. Click **"Create access key"**

**Copy both:**
- **Access Key ID** (starts with AKIA)
- **Secret Access Key** (long random string)

⚠️ **SAVE THESE IMMEDIATELY** - you can only see the secret once!

---

### Step 5: Add to Render

In Render environment variables:

```
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
AWS_S3_BUCKET=voguevault-models
AWS_S3_REGION=us-east-1
```

---

## 📋 COMPLETE LIST

Once you have everything:

```
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://user:password@host:5432/voguevault
POSTGRES_HOST=host.render.com
POSTGRES_PORT=5432
POSTGRES_USER=voguevault
POSTGRES_DB=voguevault

JWT_ACCESS_SECRET=<your-random-secret-1>
JWT_REFRESH_SECRET=<your-random-secret-2>

CORS_ORIGIN=https://voguevault.vercel.app

AWS_S3_BUCKET=voguevault-models
AWS_S3_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
```

---

## ✅ QUICK SUMMARY

| Variable | Where to Get | How Long |
|----------|--------------|----------|
| JWT_ACCESS_SECRET | Generate random | 2 min |
| JWT_REFRESH_SECRET | Generate random | 2 min |
| CORS_ORIGIN | Your Vercel URL | Already have |
| AWS_S3_BUCKET | Create S3 bucket | 2 min |
| AWS_S3_REGION | S3 region (us-east-1) | Instant |
| AWS_ACCESS_KEY_ID | Create IAM user | 5 min |
| AWS_SECRET_ACCESS_KEY | Create IAM user | 5 min |

**Total time: ~15 minutes**

---

## 🔐 SECURITY NOTES

- ✅ JWT secrets: Can be anything long and random
- ✅ AWS keys: Store securely, never commit to GitHub
- ✅ Database URL: Render provides automatically
- ✅ CORS_ORIGIN: Should be your frontend URL only

---

## 🚀 NEXT: ADD TO RENDER

Once you have all values:

1. Go to Render dashboard
2. Click **voguevault-api** service
3. Go to **Settings** → **Environment**
4. Paste each variable
5. Save and deploy

**You're ready!** 🎉
