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
      .select('title category status difficulty createdAt');
    
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

    if (!questionsAndAnswers || !Array.isArray(questionsAndAnswers)) {
      return res.status(400).json({ error: 'Questions are required' });
    }

    if (questionsAndAnswers.length < 5) {
      return res.status(400).json({ error: 'Minimum 5 questions required' });
    }

    if (questionsAndAnswers.length > 15) {
      return res.status(400).json({ error: 'Maximum 15 questions allowed' });
    }

    // Use provided difficulty (for AI-generated quizzes) or auto-set based on number of questions (for normal quizzes)
    let finalDifficulty;
    if (difficulty && ['Easy', 'Medium', 'Hard'].includes(difficulty)) {
      // Use provided difficulty (AI quiz)
      finalDifficulty = difficulty;
    } else {
      // Auto-set difficulty based on number of questions (normal quiz)
      const questionCount = questionsAndAnswers.length;
      if (questionCount === 5) {
        finalDifficulty = 'Easy';
      } else if (questionCount <= 10) {
        finalDifficulty = 'Medium';
      } else {
        finalDifficulty = 'Hard';
      }
    }

    // Normalize category
    const categoryMap = { 'Autism': 'autism', 'Down Syndrome': 'downSyndrome' };
    const normalizedCategory = categoryMap[category] || category.toLowerCase();

    // Transform questions from {q, a} format to Quiz schema format
    // Only store question and correctAnswer (AI will generate wrong options later)
    const transformedQuestions = questionsAndAnswers.map((pair) => ({
      question: (pair.q || pair.question || '').trim(),
      correctAnswer: (pair.a || pair.answer || '').trim()
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
      difficulty: finalDifficulty,
      questionsAndAnswers: transformedQuestions,
      status: status || 'draft'
    });

    return res.status(201).json({ data: doc });
  } catch (e) {
    console.error('createQuiz error', e);
    return res.status(500).json({ error: 'Server error', message: e.message });
  }
};

