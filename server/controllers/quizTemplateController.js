const QuizTemplate = require('../models/QuizTemplate');

exports.createTemplate = async (req, res) => {
  try {
    const quiz = new QuizTemplate(req.body);
    const saved = await quiz.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAllTemplates = async (req, res) => {
  try {
    const quizzes = await QuizTemplate.find();
    res.status(200).json(quizzes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getTemplateById = async (req, res) => {
  try {
    const quiz = await QuizTemplate.findById(req.params.id);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
    res.status(200).json(quiz);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
