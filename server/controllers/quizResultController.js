const QuizResult = require('../models/QuizResult');

exports.submitResult = async (req, res) => {
  try {
    const result = new QuizResult(req.body);
    const saved = await result.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getResultsByStudent = async (req, res) => {
  try {
    const results = await QuizResult.find({ student_id: req.params.student_id });
    res.status(200).json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
