const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Connect to DB
const connectDB = require('./config/db');
connectDB();

app.get('/', (req, res) => {
  res.send('API is working');
});

app.listen(process.env.PORT || 5000, () => {
  console.log('Server running...');
});



