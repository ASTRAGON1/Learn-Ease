# Firebase Setup Guide

This guide explains how to set up Firebase Admin SDK for user management (deletion).

## Why Firebase Admin SDK?

The Firebase Admin SDK allows the backend to:
- Delete users from Firebase Authentication when they're deleted from the admin panel
- Manage Firebase users programmatically

## Setup Instructions

### 1. Get Firebase Service Account Credentials

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click on the **gear icon** (⚙️) next to "Project Overview"
4. Go to **Project settings**
5. Navigate to the **Service accounts** tab
6. Click **Generate new private key**
7. A JSON file will be downloaded

### 2. Extract Credentials from JSON

The downloaded JSON file contains your service account credentials. You need three values:

```json
{
  "project_id": "your-project-id",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com"
}
```

### 3. Add to Environment Variables

Add these three values to your `.env` file:

```env
# Firebase Admin SDK Credentials
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour\nPrivate\nKey\nHere\n-----END PRIVATE KEY-----\n"
```

**Important Notes:**
- Keep the private key in **quotes**
- Preserve the `\n` characters in the private key
- Never commit these credentials to version control (`.env` should be in `.gitignore`)

### 4. Restart Your Server

After adding the credentials, restart your Node.js server:

```bash
cd server
npm run dev
```

You should see:
```
✅ Firebase Admin SDK initialized successfully
```

## Testing

To test if Firebase deletion is working:

1. Go to the Admin Panel → Users
2. Click **Delete** on a user
3. Check the server logs for:
   ```
   ✅ Successfully deleted Firebase user: [firebaseUID]
   ```
4. Verify the user is deleted from both:
   - Firebase Console → Authentication
   - MongoDB database

## Troubleshooting

### ⚠️ "Firebase credentials not found"

This means the environment variables are not set. Double-check:
- `.env` file exists in the `server` folder
- Variable names match exactly: `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`
- The server was restarted after adding the variables

### ⚠️ "Firebase not initialized, skipping deletion"

The app will still work, but users won't be deleted from Firebase Authentication. The user will only be deleted from MongoDB.

### ❌ "Error initializing Firebase Admin SDK"

Check that:
- The private key is properly formatted with `\n` characters
- The private key is wrapped in quotes in the `.env` file
- The credentials are valid (not expired or revoked)

## Optional: Without Firebase

If you don't need Firebase authentication deletion, you can skip this setup. The delete function will:
- Still work for MongoDB deletion
- Log warnings about Firebase being unavailable
- Skip Firebase deletion gracefully

The app is designed to work with or without Firebase configuration.

