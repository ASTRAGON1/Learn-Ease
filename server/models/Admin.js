const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  dateCreated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  collection: 'Admin'
});

const Admin = mongoose.model('Admin', adminSchema);

module.exports = Admin;