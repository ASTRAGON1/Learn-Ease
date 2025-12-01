const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.warn('⚠️  MONGO_URI not found in environment variables');
      return;
    }
    
    const conn = await mongoose.connect(process.env.MONGO_URI);
    
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    console.error('⚠️  Server will continue running, but database operations will fail.');
    console.error('💡 Make sure your IP is whitelisted in MongoDB Atlas and MONGO_URI is correct.');
    // Don't exit - let the server continue running
    // process.exit(1);
  }
};

module.exports = connectDB;