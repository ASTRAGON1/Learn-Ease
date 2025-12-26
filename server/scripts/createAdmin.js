const mongoose = require('mongoose');
require('dotenv').config();

// Import Admin model
const Admin = require('../models/Admin');

// MongoDB connection string from environment variables
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/learnease';

async function createAdmin() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✓ Connected to MongoDB');

    // Admin credentials
    const adminEmail = 'admin@learnease.com';
    const adminPassword = 'admin123'; // Change this to your desired password

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: adminEmail });

    if (existingAdmin) {
      console.log(`\n⚠️  Admin with email "${adminEmail}" already exists!`);
      console.log('If you want to update the password, delete the existing admin first.');
      process.exit(0);
    }

    // Create new admin
    const newAdmin = new Admin({
      email: adminEmail,
      password: adminPassword
    });

    await newAdmin.save();

    console.log('\n✓ Admin account created successfully!');
    console.log('\n📧 Email:', adminEmail);
    console.log('🔑 Password:', adminPassword);
    console.log('\n⚠️  Please change the password after first login!');
    console.log('\nYou can now log in to the admin panel using these credentials.');

  } catch (error) {
    console.error('❌ Error creating admin:', error.message);
    process.exit(1);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('\n✓ Database connection closed');
    process.exit(0);
  }
}

// Run the script
createAdmin();

