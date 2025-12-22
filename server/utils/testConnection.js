const mongoose = require('mongoose');
require('dotenv').config();

const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

async function testMongoConnection() {
    console.log(`\n${colors.cyan}${colors.bright}=== MongoDB Connection Test ===${colors.reset}\n`);

    let error = null;

    // Check if MONGO_URI exists
    if (!process.env.MONGO_URI) {
        console.log(`${colors.red}❌ MONGO_URI not found in environment variables${colors.reset}`);
        console.log(`${colors.yellow}💡 Make sure you have a .env file with MONGO_URI defined${colors.reset}\n`);
        process.exit(1);
    }

    // Display sanitized URI (hide password)
    const sanitizedUri = process.env.MONGO_URI.replace(/:([^@]+)@/, ':****@');
    console.log(`${colors.blue}📡 Attempting to connect to:${colors.reset}`);
    console.log(`   ${sanitizedUri}\n`);

    // Set connection timeout
    const connectionTimeout = 15000; // 15 seconds

    try {
        console.log(`${colors.yellow}⏳ Connecting... (timeout: ${connectionTimeout / 1000}s)${colors.reset}`);

        const startTime = Date.now();

        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: connectionTimeout,
            socketTimeoutMS: connectionTimeout,
        });

        const duration = ((Date.now() - startTime) / 1000).toFixed(2);

        console.log(`${colors.green}${colors.bright}✅ Successfully connected to MongoDB!${colors.reset}`);
        console.log(`${colors.green}   Connection time: ${duration}s${colors.reset}\n`);

        // Get connection details
        const db = mongoose.connection.db;
        const admin = db.admin();

        console.log(`${colors.cyan}📊 Connection Details:${colors.reset}`);
        console.log(`   Database: ${db.databaseName}`);
        console.log(`   Host: ${mongoose.connection.host}`);
        console.log(`   Port: ${mongoose.connection.port || 'default'}`);
        console.log(`   Ready State: ${mongoose.connection.readyState} (1 = connected)\n`);

        // Test database operations
        console.log(`${colors.yellow}🔍 Testing database operations...${colors.reset}`);

        try {
            const collections = await db.listCollections().toArray();
            console.log(`${colors.green}✅ Can list collections (${collections.length} found)${colors.reset}`);

            if (collections.length > 0) {
                console.log(`${colors.blue}   Collections:${colors.reset}`);
                collections.forEach(col => {
                    console.log(`   - ${col.name}`);
                });
            }
        } catch (err) {
            console.log(`${colors.red}❌ Failed to list collections: ${err.message}${colors.reset}`);
        }

        // Test a simple query
        try {
            const testCollection = db.collection('students');
            const count = await testCollection.countDocuments();
            console.log(`${colors.green}✅ Can query collections (students: ${count} documents)${colors.reset}\n`);
        } catch (err) {
            console.log(`${colors.red}❌ Failed to query collection: ${err.message}${colors.reset}\n`);
        }

        console.log(`${colors.green}${colors.bright}🎉 All tests passed! MongoDB connection is working.${colors.reset}\n`);

    } catch (err) {
        error = err;
        console.log(`${colors.red}${colors.bright}❌ Connection failed!${colors.reset}\n`);

        console.log(`${colors.red}Error Type: ${error.name}${colors.reset}`);
        console.log(`${colors.red}Error Message: ${error.message}${colors.reset}\n`);

        // Provide specific troubleshooting based on error
        console.log(`${colors.yellow}${colors.bright}🔧 Troubleshooting Steps:${colors.reset}\n`);

        if (error.message.includes('timed out')) {
            console.log(`${colors.yellow}1. IP Whitelist Issue:${colors.reset}`);
            console.log(`   - Go to MongoDB Atlas → Network Access`);
            console.log(`   - Add your current IP address or use 0.0.0.0/0 (dev only)`);
            console.log(`   - Wait 1-2 minutes for changes to propagate\n`);

            console.log(`${colors.yellow}2. Check your internet connection${colors.reset}`);
            console.log(`   - Make sure you can access the internet`);
            console.log(`   - Try pinging mongodb.net\n`);

            console.log(`${colors.yellow}3. Firewall/VPN:${colors.reset}`);
            console.log(`   - Disable VPN temporarily`);
            console.log(`   - Check firewall settings\n`);
        } else if (error.message.includes('authentication failed')) {
            console.log(`${colors.yellow}1. Check credentials in MONGO_URI:${colors.reset}`);
            console.log(`   - Verify username and password are correct`);
            console.log(`   - Special characters in password must be URL-encoded`);
            console.log(`   - Example: p@ssw0rd → p%40ssw0rd\n`);
        } else if (error.message.includes('Invalid connection string')) {
            console.log(`${colors.yellow}1. Check MONGO_URI format:${colors.reset}`);
            console.log(`   - Should be: mongodb+srv://user:pass@cluster.xxxxx.mongodb.net/dbname`);
            console.log(`   - Make sure there are no extra spaces or line breaks\n`);
        } else {
            console.log(`${colors.yellow}1. Verify your MONGO_URI in .env file${colors.reset}`);
            console.log(`${colors.yellow}2. Check MongoDB Atlas cluster status${colors.reset}`);
            console.log(`${colors.yellow}3. Review MongoDB Atlas logs for issues${colors.reset}\n`);
        }

        console.log(`${colors.cyan}📚 Additional Resources:${colors.reset}`);
        console.log(`   - MongoDB Atlas Docs: https://docs.atlas.mongodb.com/`);
        console.log(`   - Connection Troubleshooting: https://docs.atlas.mongodb.com/troubleshoot-connection/\n`);

    } finally {
        // Close connection
        if (mongoose.connection.readyState === 1) {
            await mongoose.connection.close();
            console.log(`${colors.blue}🔌 Connection closed${colors.reset}\n`);
        }
        process.exit(error ? 1 : 0);
    }
}

// Run the test
testMongoConnection();
