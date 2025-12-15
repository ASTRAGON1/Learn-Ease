const Test = require('../models/Test');

/**
 * Middleware to require diagnostic quiz completion for students
 * Must be used after auth middleware
 */
const requireDiagnosticQuiz = async (req, res, next) => {
  try {
    // Only apply to students
    if (req.user.role !== 'student') {
      return next();
    }

    // Check if student has completed the diagnostic quiz
    const test = await Test.findOne({ student: req.user.sub });

    if (!test) {
      return res.status(403).json({ 
        error: 'Diagnostic quiz required',
        message: 'You must complete the diagnostic quiz before accessing the platform.',
        quizRequired: true
      });
    }

    // Quiz completed, allow access
    next();
  } catch (error) {
    console.error('Require diagnostic quiz error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = requireDiagnosticQuiz;
