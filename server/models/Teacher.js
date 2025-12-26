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
  website: {
    type: String,
    trim: true,
    default: ''
  },
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true
  },
  password: {
    type: String,
    required: function () {
      return !this.firebaseUID;
    },
    minlength: [6, 'Password must be at least 6 characters'],
    validate: {
      validator: function (value) {
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
  userStatus: {
    type: String,
    enum: {
      values: ['active', 'pending', 'suspended'],
      message: 'Status must be either active, pending, or suspended'
    },
    default: 'active'
  },
  areasOfExpertise: {
    type: [String],
    validate: {
      validator: function (value) {
        // Allow empty array (for initial creation)
        // But if array has items, it must have 1-4 items
        return value.length === 0 || (value.length >= 1 && value.length <= 4);
      },
      message: 'Areas of expertise must be between 1 and 4 items'
    },
    default: []
  },
  informationGatheringComplete: {
    type: Boolean,
    default: false
  },
  isOnline: {
    type: Boolean,
    default: false
  },
  lastActivity: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  collection: 'Teacher'
});

// Indexes for faster queries
teacherSchema.index({ ranking: -1 });

const Teacher = mongoose.model('Teacher', teacherSchema);

module.exports = Teacher;