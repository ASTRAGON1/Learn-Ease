const mongoose = require('mongoose');

const quizResultSchema = new mongoose.Schema({
  student_id: String,
  quiz_id: { type: mongoose.Schema.Types.ObjectId, ref: 'QuizTemplate' },
  score: Number,
  dateTaken: { type: Date, default: Date.now },
  answers: [String] // Can also be an array of objects if needed
});

module.exports = mongoose.model('QuizResult', quizResultSchema);
