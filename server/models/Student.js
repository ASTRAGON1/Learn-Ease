const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  pass: {
    type: String,
    required: function() {
      return !this.firebaseUID;
    },
    minlength: [6, 'Password must be at least 6 characters'],
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
  type: {
    type: String,
    enum: ['autism', 'downSyndrome', 'other'],
    default: 'other'
  },
  avatar: {
    type: String,
    default: 'default-avatar.png'
  },
  userStatus: {
    type: String,
    enum: {
      values: ['active','suspended'],
      message: 'Status must be either active or suspended'
    },
    default: 'active'
  },
  assignedPath: {
    type: String,
    trim: true
  },
  isOnline: {
    type: Boolean,
    default: false
  },
  lastActivity: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  diagnosticQuizCompleted: {
    type: Boolean,
    default: false
  },
  diagnosticQuizResults: {
    section1: [Number],
    section2: [Number],
    section3: [Number],
    autismScore: Number,
    downSyndromeScore: Number,
    accuracy: Number,
    completedAt: Date
  }
}, {
  timestamps: false,
  collection: 'Student'
});

const Student = mongoose.model('Student', studentSchema);

module.exports = Student;