const { createQuiz, getAllQuizzes, getQuizById, submitQuiz } = require("../controllers/quizController");

const Quiz = require("../models/Quiz");

exports.createQuiz = async (req, res) => {
  try {
    const quiz = new Quiz(req.body);
    await quiz.save();
    res.status(201).json(quiz);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getAllQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find();
    res.json(quizzes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getQuizById = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });
    res.json(quiz);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
const Student = require("../models/Student");
const Quiz = require("../models/Quiz");

exports.submitQuiz = async (req, res) => {
  const { studentId, quizId, answers } = req.body;

  try {
    const quiz = await Quiz.findById(quizId);
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });

    let score = 0;
    for (let i = 0; i < quiz.questions.length; i++) {
      if (quiz.questions[i].correctAnswer === answers[i]) {
        score++;
      }
    }

    await Student.findByIdAndUpdate(
      studentId,
      {
        $push: { quizScores: { quizId, score } },
      },
      { new: true }
    );

    res.json({ message: "Quiz submitted", score });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
router.post("/submit", submitQuiz);
