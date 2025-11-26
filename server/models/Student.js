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
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  type: {
    type: String,
    enum: ['autism', 'downSyndrome', 'other'],
    required: [true, 'Student type is required']
  },
  avatar: {
    type: String,
    default: 'default-avatar.png'
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  suspended: {
    type: Boolean,
    default: false
  },
  assignedPath: {
    type: String,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date. now
  }
}, {
  timestamps: false,
  collection: 'Student'
});

const Student = mongoose.model('Student', studentSchema);

module.exports = Student;