require('dotenv').config();
const mongoose = require('mongoose');

async function testConnection() {
    console.log('🔍 Testing MongoDB Connection...\n');

    // Check if MONGO_URI exists
    if (!process.env.MONGO_URI) {
        console.error('❌ MONGO_URI not found in .env file');
        process.exit(1);
    }

    // Show sanitized URI
    const sanitizedUri = process.env.MONGO_URI.replace(/:([^@]+)@/, ':****@');
    console.log('📝 Connection String:', sanitizedUri);
    console.log('');

    try {
        console.log('⏳ Attempting to connect...');

        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 45000,
        });

        console.log('✅ Successfully connected to MongoDB!');
        console.log(`📊 Database: ${mongoose.connection.name}`);
        console.log(`🌐 Host: ${mongoose.connection.host}`);
        console.log('');

        // Test a simple query
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log(`📚 Collections found: ${collections.length}`);
        collections.forEach(col => console.log(`   - ${col.name}`));

        await mongoose.connection.close();
        console.log('\n✅ Connection test successful!');
        process.exit(0);

    } catch (error) {
        console.error('\n❌ Connection failed!');
        console.error('Error:', error.message);
        console.error('\n💡 Troubleshooting tips:');
        console.error('   1. Check your internet connection');
        console.error('   2. Verify your IP is whitelisted in MongoDB Atlas');
        console.error('   3. Check if your MongoDB URI is correct and not expired');
        console.error('   4. Try allowing access from anywhere (0.0.0.0/0) in MongoDB Atlas Network Access');
        process.exit(1);
    }
}

testConnection();
