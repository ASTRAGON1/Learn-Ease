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
  type: {
    type: String,
    enum: ['autism', 'downSyndrome'],
    default: null
  },
  profilePic: {
    type: String,
    default: 'default-avatar.png'
  },
  userStatus: {
    type: String,
    enum: {
      values: ['active', 'suspended'],
      message: 'Status must be either active or suspended'
    },
    default: 'active'
  },
  assignedPath: {
    type: String,
    trim: true
  },
  lastActivity: {
    type: Date,
    default: Date.now
  },
  isOnline: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  achievements: [{
    achievement: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Achievement',
      required: true
    },
    grade: {
      type: Number,
      min: 0,
      max: 100
    },
    completedAt: {
      type: Date,
      default: Date.now
    },
    earnedAt: {
      type: Date,
      default: Date.now
    }
  }],
}, {
  timestamps: false,
  collection: 'Student'
});

const Student = mongoose.model('Student', studentSchema);

module.exports = Student;