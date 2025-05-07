const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  questionText: String,
  options: [String],
  correctAnswer: String
});

const quizTemplateSchema = new mongoose.Schema({
  title: String,
  course_id: String,
  createdBy: String, // teacher_id or "AI"
  questions: [questionSchema],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('QuizTemplate', quizTemplateSchema);
