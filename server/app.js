require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
//  Debug: Check if .env is loaded
console.log('🔍 MONGO_URI:', process.env.MONGO_URI ?  '✅ Found' : '❌ Not found');
console.log('🔍 First 50 chars:', process.env.MONGO_URI?.substring(0, 50));
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB();

// Routes
const testRoutes = require('./routes/testRoutes');

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: '✅ Server is running!' });
});

// API routes
app.use('/api/test', testRoutes);


// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});




































// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});