require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
//  Debug: Check if .env is loaded
console.log('🔍 MONGO_URI:', process.env.MONGO_URI ?  '✅ Found' : '❌ Not found');
console.log('🔍 First 50 chars:', process.env.MONGO_URI?.substring(0, 50));
console.log('🔍 JWT_SECRET:', process.env.JWT_SECRET ?  '✅ Found' : '❌ Not found');

// Validate required environment variables
if (!process.env.JWT_SECRET) {
  console.error('❌ ERROR: JWT_SECRET is not set in .env file!');
  console.error('Please add JWT_SECRET=your-secret-key-here to your server/.env file');
  process.exit(1);
}
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB();

// Routes
const testRoutes = require('./routes/testRoutes');
const studentAuthRoutes = require('./routes/studentAuthRoutes');
const teacherAuthRoutes = require('./routes/teacherAuthRoutes');
const contentRoutes = require('./routes/contentRoutes');
const studentRoutes = require('./routes/studentRoutes');
const teacherRoutes = require('./routes/teacherRoutes');
const courseRoutes = require('./routes/courseRoutes');

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: '✅ Server is running!' });
});

// API routes
app.use('/api/test', testRoutes);
app.use('/api/students', studentAuthRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/teachers', teacherAuthRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/courses', courseRoutes);


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