# 🔥 Firebase Credentials Setup - Quick Guide

## What You Need

Add these 3 environment variables to your `server/.env` file to enable Firebase user deletion:

```env
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour\nPrivate\nKey\nHere\n-----END PRIVATE KEY-----\n"
```

## 📋 How to Get These Credentials

### Step 1: Go to Firebase Console
1. Visit: https://console.firebase.google.com/
2. Select your **LearnEase** project

### Step 2: Generate Service Account Key
1. Click the **⚙️ gear icon** next to "Project Overview"
2. Select **Project settings**
3. Go to **Service accounts** tab
4. Click **"Generate new private key"**
5. Click **"Generate key"** in the confirmation dialog
6. A JSON file will download automatically

### Step 3: Copy Values to .env
Open the downloaded JSON file and copy these values:

```json
{
  "project_id": "←── Copy this",
  "client_email": "←── Copy this",
  "private_key": "←── Copy this (keep the quotes and \n characters)"
}
```

Paste them into your `server/.env` file:

```env
FIREBASE_PROJECT_ID=learnease-xxxxx
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@learnease-xxxxx.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n"
```

### Step 4: Restart Server
```bash
cd server
npm run dev
```

## ✅ Verify It's Working

Look for this message in your server logs:
```
✅ Firebase Admin SDK initialized successfully
```

## 🧪 Test User Deletion

1. Open Admin Panel → Users
2. Click **Delete** on any user
3. Server logs should show:
   ```
   Attempting to delete Firebase teacher: [firebaseUID]
   ✅ Successfully deleted Firebase user: [firebaseUID]
   ```
4. Verify user is deleted from:
   - ✅ Firebase Console → Authentication
   - ✅ MongoDB database

## ⚠️ Important Notes

- **Keep your `.env` file secure** - never commit it to Git
- **The private key must stay in quotes** and preserve `\n` characters
- If you don't add Firebase credentials, the app will still work but only delete from MongoDB

## 🆘 Troubleshooting

| Issue | Solution |
|-------|----------|
| ⚠️ "Firebase credentials not found" | Check that all 3 variables are in `.env` and server is restarted |
| ❌ "Error initializing Firebase" | Verify the private key format, ensure it's in quotes with `\n` preserved |
| ℹ️ "Firebase not initialized, skipping deletion" | App works normally, but users only deleted from MongoDB |

## 📂 Files Modified

- ✅ `server/package.json` - Added `firebase-admin` dependency
- ✅ `server/config/firebase.js` - Firebase Admin SDK configuration
- ✅ `server/routes/adminRoutes.js` - Updated delete route to handle both Firebase and MongoDB
- 📄 `server/FIREBASE_SETUP.md` - Detailed setup guide
- 📄 `FIREBASE_CREDENTIALS_SETUP.md` - This quick reference

---

**Need more help?** See `server/FIREBASE_SETUP.md` for detailed instructions.

