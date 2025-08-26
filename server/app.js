// Connections
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();
const app = express();
app.use(cors());
app.use(express.json());
const connectDB = require('./config/db');
const router = require('./routes/contentRoutes');
connectDB();

app.get('/', (req, res) => {
  res.send('Our learning ecosystem is under development');
});

app.use('/api', router)

app.listen(process.env.PORT || 5000, () => {
  console.log('Server running...');
});








































// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});