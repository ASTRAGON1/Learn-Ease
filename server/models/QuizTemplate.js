const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  questionText: String,
  options: [String],
  correctAnswer: String
});

const quizTemplateSchema = new mongoose.Schema({
  title: String,
  course_id: String,
  createdBy: String, // teacher_id or "AI, even if this attributes isnt available in the er diagram, ze can add it to the quiz template"
  questions: [questionSchema],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('QuizTemplate', quizTemplateSchema);
