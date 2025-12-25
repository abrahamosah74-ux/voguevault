# Setup Cloudinary (Global Alternative to AWS)

**No AWS needed! Cloudinary works everywhere.**

---

## ✅ 5-MINUTE SETUP

### Step 1: Sign Up (1 minute)

Go to: **https://cloudinary.com/users/register/free**

Fill in:
- Email
- Password
- Click **Sign Up**

(No credit card needed!)

---

### Step 2: Get API Credentials (2 minutes)

1. Go to **Dashboard** (after login)
2. Look for **API Keys** section (right side)
3. You'll see:
   ```
   Cloud Name: dxxxxx
   API Key: 123456789
   API Secret: abcdefg...
   ```

Copy all three!

---

### Step 3: Add to Render (2 minutes)

Go to **Render Dashboard**:

1. Click **voguevault-api** service
2. Go to **Settings** → **Environment**
3. Remove these (if they exist):
   ```
   AWS_ACCESS_KEY_ID
   AWS_SECRET_ACCESS_KEY
   AWS_S3_BUCKET
   AWS_S3_REGION
   ```

4. Add these instead:
   ```
   STORAGE_TYPE=cloudinary
   CLOUDINARY_CLOUD_NAME=dxxxxx
   CLOUDINARY_API_KEY=123456789
   CLOUDINARY_API_SECRET=abcdefg
   ```

5. Click **Save**

---

### Step 4: Deploy

Render will auto-redeploy. Wait 1-2 minutes.

✅ Done!

---

## 🎯 YOUR CREDENTIALS

Replace with your actual values from Cloudinary Dashboard:

```
STORAGE_TYPE=cloudinary
CLOUDINARY_CLOUD_NAME=YOUR_CLOUD_NAME
CLOUDINARY_API_KEY=YOUR_API_KEY
CLOUDINARY_API_SECRET=YOUR_API_SECRET
```

---

## ✨ BENEFITS

- ✅ 25GB free per month
- ✅ Works in any country
- ✅ No credit card needed
- ✅ Perfect for 3D models
- ✅ Automatic optimization
- ✅ Global CDN

---

## 🚀 THAT'S IT!

Your backend now uses Cloudinary for file storage.

File uploads will automatically go to Cloudinary instead of AWS.

**Much simpler and works everywhere!** 🌍

---

## 💡 BONUS

Cloudinary automatically:
- Compresses files
- Creates thumbnails
- Serves from global CDN
- Stores backups

Way better than S3 for images & 3D models! 🎉
