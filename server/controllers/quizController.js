const Quiz = require('../models/Quiz');

exports.getQuizzes = async (req, res) => {
  try {
    const teacherId = req.user.sub;
    const { status } = req.query; // Optional filter by status

    const query = { teacher: teacherId };
    if (status) {
      query.status = status;
    }

    const quizzes = await Quiz.find(query)
      .populate('path', 'type') // Populate path to get the type (autism/downSyndrome)
      .sort({ createdAt: -1 }) // Newest first
      .select('title path status difficulty createdAt previousStatus');

    // Transform the data to include pathType for backward compatibility with frontend
    const transformedQuizzes = quizzes.map(quiz => ({
      _id: quiz._id,
      title: quiz.title,
      pathType: quiz.path?.type || null, // Extract type from populated path
      status: quiz.status,
      difficulty: quiz.difficulty,
      createdAt: quiz.createdAt,
      previousStatus: quiz.previousStatus
    }));

    return res.status(200).json({ data: transformedQuizzes });
  } catch (e) {
    console.error('getQuizzes error', e);
    return res.status(500).json({ error: 'Server error' });
  }
};

exports.createQuiz = async (req, res) => {
  try {
    const teacherId = req.user.sub;
    const {
      title, difficulty, questionsAndAnswers, status,
      pathId, courseId, topicId, lessonId
    } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Missing required field: title is required' });
    }

    // Validate that IDs are provided (required for new schema)
    if (!pathId || !courseId || !topicId || !lessonId) {
      return res.status(400).json({ error: 'Missing required IDs: pathId, courseId, topicId, and lessonId are required' });
    }

    if (!difficulty || !['Easy', 'Medium', 'Hard'].includes(difficulty)) {
      return res.status(400).json({ error: 'Difficulty is required and must be Easy, Medium, or Hard' });
    }

    if (!questionsAndAnswers || !Array.isArray(questionsAndAnswers)) {
      return res.status(400).json({ error: 'Questions are required' });
    }

    if (questionsAndAnswers.length < 3) {
      return res.status(400).json({ error: 'Minimum 3 questions required' });
    }

    if (questionsAndAnswers.length > 10) {
      return res.status(400).json({ error: 'Maximum 10 questions allowed' });
    }

    // Transform questions from {q, a} format to Quiz schema format
    // Include wrongAnswers if provided (from AI generation)
    const transformedQuestions = questionsAndAnswers.map((pair) => ({
      question: (pair.q || pair.question || '').trim(),
      correctAnswer: (pair.a || pair.answer || pair.correctAnswer || '').trim(),
      wrongAnswers: pair.wrongAnswers || []
    }));

    // Validate all questions have both question and answer
    const invalidQuestions = transformedQuestions.filter(q => !q.question || !q.correctAnswer);
    if (invalidQuestions.length > 0) {
      return res.status(400).json({ error: 'All questions must have both question text and correct answer' });
    }

    const doc = await Quiz.create({
      teacher: teacherId,
      title,
      path: pathId,
      course: courseId,
      topic: topicId,
      lesson: lessonId,
      difficulty: difficulty,
      questionsAndAnswers: transformedQuestions,
      status: status || 'draft'
    });

    return res.status(201).json({ data: doc });
  } catch (e) {
    console.error('createQuiz error', e);
    console.error('Error details:', {
      message: e.message,
      name: e.name,
      stack: e.stack,
      validationErrors: e.errors
    });
    return res.status(500).json({ error: 'Server error', message: e.message, details: e.errors || e.message });
  }
};



exports.submitQuiz = async (req, res) => {
  try {
    const studentId = req.user.sub;
    const { id: quizId } = req.params;
    const { answers, score } = req.body; // score: { correct: number, total: number }

    // Find the quiz
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    // Save result (using QuizResult model if available, or just log for now if you prefer but user asked for persistent notifications so we assume persistent results too)
    // Assuming QuizResult is imported locally or we use require
    const { QuizResult, Notification } = require('../models');
    // Using internal createNotification helper if available, else direct model create
    const { createNotification } = require('./notificationController');

    // Create result record
    if (QuizResult) {
      await QuizResult.create({
        student: studentId,
        quiz: quizId,
        score: (score.correct / score.total) * 100,
        answers: answers
      });
    }

    // Create notification for student
    await createNotification({
      recipient: studentId,
      recipientModel: 'Student',
      message: `You completed the quiz "${quiz.title}" with a score of ${score.correct}/${score.total}.`,
      type: 'quiz_completed'
    });

    return res.status(200).json({ success: true, message: 'Quiz submitted and notification sent' });
  } catch (e) {
    console.error('submitQuiz error', e);
    return res.status(500).json({ error: 'Server error', message: e.message });
  }
};
