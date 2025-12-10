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
      .sort({ createdAt: -1 }) // Newest first
      .select('title category status difficulty createdAt previousStatus');
    
    return res.status(200).json({ data: quizzes });
  } catch (e) {
    console.error('getQuizzes error', e);
    return res.status(500).json({ error: 'Server error' });
  }
};

exports.createQuiz = async (req, res) => {
  try {
    const teacherId = req.user.sub;
    const { 
      title, category, topic, lesson, course, difficulty, questionsAndAnswers, status 
    } = req.body;
    
    if (!title || !category || !topic || !lesson || !course) {
      return res.status(400).json({ error: 'Missing required fields' });
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

    // Normalize category - handle both original and already-normalized formats
    const categoryMap = { 
      'Autism': 'autism', 
      'Down Syndrome': 'downSyndrome',
      'autism': 'autism',
      'downSyndrome': 'downSyndrome'
    };
    const normalizedCategory = categoryMap[category] || category.toLowerCase();
    
    // Ensure it's one of the valid enum values
    if (!['autism', 'downSyndrome'].includes(normalizedCategory)) {
      return res.status(400).json({ error: 'Invalid category. Must be "Autism" or "Down Syndrome"' });
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
      category: normalizedCategory,
      topic,
      lesson,
      course,
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

