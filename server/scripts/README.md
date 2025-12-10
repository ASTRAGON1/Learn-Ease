# Admin Account Setup

This directory contains scripts to help you manage admin accounts for LearnEase.

## Creating an Admin Account

To create an admin account in your MongoDB database, follow these steps:

### 1. Make sure your MongoDB is running

Ensure your MongoDB server is running and accessible.

### 2. Run the create admin script

From the `server` directory, run:

```bash
npm run create-admin
```

Or directly:

```bash
node scripts/createAdmin.js
```

### 3. Default Credentials

The script will create an admin account with these default credentials:

- **Email**: `admin@learnease.com`
- **Password**: `admin123`

### 4. Customize the Credentials

To use different credentials, edit `scripts/createAdmin.js` and change these lines:

```javascript
const adminEmail = 'admin@learnease.com';
const adminPassword = 'admin123'; // Change this to your desired password
```

### 5. Login

After creating the admin account, you can log in to the admin panel at:
- Navigate to `/admin-panel` in your application
- Enter the email and password you created

## Important Notes

⚠️ **Security Warning**: 
- The current implementation stores passwords in plain text for simplicity
- For production, you should implement password hashing (e.g., using bcrypt)
- Change the default password immediately after first login

## Troubleshooting

### "Admin already exists" error
If you get this error, it means an admin account with that email already exists in the database. You can:
1. Use different credentials
2. Delete the existing admin from MongoDB and run the script again

### Connection error
Make sure:
1. MongoDB is running
2. Your `.env` file has the correct `MONGODB_URI`
3. The database name matches your application configuration

