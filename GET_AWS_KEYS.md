# Get AWS Access Keys - Step by Step

**These keys allow your backend to upload files to S3.**

---

## 📍 Step 1: Go to AWS Console

Go to: **https://console.aws.amazon.com**

(Sign up for free account if you don't have one - includes 12 months free tier)

---

## 📍 Step 2: Create S3 Bucket

1. Go to **S3** service (search "S3" in top search)
2. Click **"Create bucket"**
3. Fill in:
   ```
   Bucket name: voguevault-models
   Region: us-east-1 (or your region)
   ```
4. Keep everything else default
5. Click **"Create bucket"**

✅ **Copy this value:**
```
AWS_S3_BUCKET=voguevault-models
AWS_S3_REGION=us-east-1
```

---

## 👤 Step 3: Create IAM User

This is the account that will upload files to S3.

1. Go to **IAM** service (search "IAM" in top search)
2. Left menu → Click **"Users"**
3. Click **"Create user"** button
4. Fill in:
   ```
   User name: voguevault-app
   ```
5. Click **"Create user"**

---

## 🔑 Step 4: Give User S3 Permission

1. Click the user you just created: **voguevault-app**
2. Click **"Add permissions"** button
3. Select **"Attach policies directly"**
4. In the search box, type: `S3`
5. Find and check: **AmazonS3FullAccess**
6. Click **"Add permissions"** button

✅ User now has permission to use S3

---

## 🗝️ Step 5: Create Access Key (THE IMPORTANT PART!)

1. Click the user: **voguevault-app**
2. Go to **"Security credentials"** tab
3. Scroll down to **"Access keys"**
4. Click **"Create access key"** button
5. Choose: **"Application running outside AWS"**
6. Click **"Next"**
7. Click **"Create access key"**

⚠️ **IMPORTANT**: You'll see a screen with:
- **Access Key ID** (starts with `AKIA`)
- **Secret Access Key** (long string)

**COPY BOTH NOW!** You can only see the secret once!

---

## 📋 Copy to Render

In **Render Dashboard** → **voguevault-api** → **Settings** → **Environment**:

```
AWS_S3_BUCKET=voguevault-models
AWS_S3_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
```

---

## 🔐 SECURITY WARNING

⚠️ **NEVER:**
- Share these keys with anyone
- Commit them to GitHub
- Post them online
- Use in frontend code (they should ONLY be in backend)

✅ **DO:**
- Keep them secret
- Store in Render environment variables only
- Rotate them every 90 days (optional but recommended)

---

## 📸 VISUAL REFERENCE

```
AWS Console
    ↓
IAM Service (left menu: "Users")
    ↓
Create user "voguevault-app"
    ↓
Add AmazonS3FullAccess permission
    ↓
Create access key
    ↓
Copy Access Key ID + Secret Access Key
    ↓
Paste into Render environment
```

---

## ✅ WHEN DONE

You should have:
```
AWS_ACCESS_KEY_ID=AKIA1234567890ABCDEF
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
AWS_S3_BUCKET=voguevault-models
AWS_S3_REGION=us-east-1
```

Then add to Render and deploy! 🚀

---

## 🆘 LOST THE SECRET KEY?

If you forgot to copy the secret key before closing the popup:

1. Go back to IAM → Users → voguevault-app
2. In "Access keys", find the key you created
3. Click the 3 dots (**...**) → **Delete**
4. Create a new access key
5. Copy the secret this time!

---

**All set? Add them to Render now!** 🎉
