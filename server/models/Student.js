const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  studentName: {
    type: String,
    required: true,
    trim: true
  },
  studentEmail: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  studentPass: {
    type: String,
    required: true
  },
  studentType: {
    type: String,
    enum: ['regular', 'premium'],
    default: 'regular'
  },
  studentDifficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'easy'
  },
  studentLearningMode: {
    type: String,
    enum: ['visual', 'auditory', 'kinesthetic', 'mixed'],
    default: 'visual'
  },
  assignedPathType: {
    type: String,
    enum: ['autism', 'down syndrome', null],
    default: null
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Student', studentSchema);