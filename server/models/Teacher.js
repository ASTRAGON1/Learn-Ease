const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  bio: {
    type: String,
    maxlength: [1000, 'Bio cannot exceed 1000 characters']
  },
  headline: {
    type: String,
    maxlength: [200, 'Headline cannot exceed 200 characters']
  },
  cv: {
    type: String,
    default: ''
  },
  profilePic: {
    type: String,
    default: ''
  },
  country: {
    type: String,
    trim: true
  },
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true
  },
  password: {
    type: String,
    required: false, // Made optional - will validate with custom validator
    validate: {
      validator: function(value) {
        // If firebaseUID exists, password is optional
        if (this.firebaseUID) {
          return true;
        }
        // If no firebaseUID, password is required and must be at least 6 characters
        return value && value.length >= 6;
      },
      message: 'Password is required (minimum 6 characters) when not using Firebase authentication'
    }
  },
  firebaseUID: {
    type: String,
    unique: true,
    sparse: true, // Allows multiple null values
    trim: true
  },
  ranking: {
    type: Number,
    default: 0,
    min: [0, 'Ranking cannot be negative']
  },
  dateStarted: {
    type: Date,
    default: Date.now
  },
  userStatus: {
    type: String,
    enum: {
      values: ['active', 'inactive'],
      message: 'Status must be either active or inactive'
    },
    default: 'active'
  },
  suspended: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  collection: 'Teacher'
});

// Indexes for faster queries
teacherSchema.index({ ranking: -1 });

const Teacher = mongoose.model('Teacher', teacherSchema);

module.exports = Teacher;