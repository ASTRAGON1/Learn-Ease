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
app.use(express.json({ limit: '10mb' })); // Increase limit for base64 file uploads
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Connect to MongoDB
connectDB();

// Routes
const testRoutes = require('./routes/testRoutes');
const teacherAuthRoutes = require('./routes/teacherAuthRoutes');
const teacherRoutes = require('./routes/teacherRoutes');
const storageRoutes = require('./routes/storageRoutes');
const quizRoutes = require('./routes/quizRoutes');

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: '✅ Server is running!' });
});

// API routes
app.use('/api/test', testRoutes);
app.use('/api/teachers', teacherAuthRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/content', storageRoutes);
app.use('/api/quizzes', quizRoutes);


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