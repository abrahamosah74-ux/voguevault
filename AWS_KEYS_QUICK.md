# 🚀 AWS KEYS - QUICK START

## 3 STEPS TO GET YOUR KEYS

### STEP 1: Create S3 Bucket (2 minutes)
```
https://console.aws.amazon.com/s3
  ↓
Click "Create bucket"
  ↓
Bucket name: voguevault-models
Region: us-east-1
  ↓
Click "Create bucket"
```

**You now have:**
```
AWS_S3_BUCKET=voguevault-models
AWS_S3_REGION=us-east-1
```

---

### STEP 2: Create IAM User (2 minutes)
```
https://console.aws.amazon.com/iam
  ↓
Users (left menu)
  ↓
Click "Create user"
  ↓
User name: voguevault-app
  ↓
Click "Create user"
```

---

### STEP 3: Get Access Keys (2 minutes)
```
Click user: voguevault-app
  ↓
"Add permissions" → Attach policies directly
  ↓
Search: S3
  ↓
Check: AmazonS3FullAccess
  ↓
"Add permissions"
  ↓
Go to "Security credentials" tab
  ↓
Click "Create access key"
  ↓
Choose: "Application running outside AWS"
  ↓
Click "Next"
  ↓
Click "Create access key"
  ↓
⚠️ COPY BOTH IMMEDIATELY! ⚠️
```

**You now have:**
```
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
```

---

## ✅ FINAL ENVIRONMENT VARIABLES

Add to **Render Dashboard** → **Settings** → **Environment**:

```
AWS_S3_BUCKET=voguevault-models
AWS_S3_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIA1234567890ABCDEF
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENGbPxRfiCYEXAMPLEKEY
```

---

## 🔐 REMEMBER
- ✅ Keep secrets safe
- ✅ Never share keys
- ✅ Never commit to GitHub
- ✅ Store only in Render environment

---

**Done! Add to Render and deploy.** 🚀

---

**Full guide: GET_AWS_KEYS.md**
