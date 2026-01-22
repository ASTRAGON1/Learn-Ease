const Quiz = require('../models/Quiz');
const QuizResult = require('../models/QuizResult');
const Track = require('../models/Track');
const Course = require('../models/Course');


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

    // Create notification for the teacher
    const { createNotification } = require('./notificationController');
    await createNotification({
      recipient: teacherId,
      recipientModel: 'Teacher',
      message: 'Your quiz got uploaded successfully',
      type: 'upload'
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

    const { createNotification } = require('./notificationController');

    // Create or update result record and update Track progress
    const percentage = (score.correct / score.total) * 100;

    await QuizResult.findOneAndUpdate(
      { student: studentId, quiz: quizId },
      {
        student: studentId,
        quiz: quizId,
        grade: percentage,
        answers: answers,
        status: 'completed'
      },
      { upsert: true, new: true }
    );

    // Update Track model for stats
    const Track = require('../models/Track');
    let track = await Track.findOne({ student: studentId });
    if (!track) {
      track = await Track.create({ student: studentId });
    }

    track.quizzesCompleted = (track.quizzesCompleted || 0) + 1;

    if (percentage >= 60) {
      track.quizzesPassed = (track.quizzesPassed || 0) + 1;
    }

    await track.save();

    // Create notification for student
    await createNotification({
      recipient: studentId,
      recipientModel: 'Student',
      message: `You completed the quiz "${quiz.title}" with a score of ${score.correct}/${score.total}.`,
      type: 'quiz_completed'
    });

    // === AI-POWERED ADAPTIVE DIFFICULTY ADJUSTMENT ===
    // Analyze recent quiz performance and adjust content difficulty
    setImmediate(async () => {
      try {
        console.log(`🎯 Starting adaptive difficulty analysis for student ${studentId}...`);

        // Get last 5 quiz results to analyze performance trend
        const recentResults = await QuizResult.find({ 
          student: studentId, 
          status: 'completed' 
        })
          .sort({ updatedAt: -1 })
          .limit(5)
          .select('grade');

        if (recentResults.length >= 3) { // Need at least 3 quizzes for meaningful analysis
          const averageScore = recentResults.reduce((sum, r) => sum + (r.grade || 0), 0) / recentResults.length;
          console.log(`📊 Student's average score over last ${recentResults.length} quizzes: ${averageScore.toFixed(1)}%`);

          // Get student's current path and info
          const Student = require('../models/Student');
          const StudentPath = require('../models/StudentPath');
          const Content = require('../models/Content');
          const PathModel = require('../models/Path');

          const student = await Student.findById(studentId).select('type');
          if (!student || !student.type) {
            console.log('⚠️ Student type not found, skipping difficulty adjustment');
            return;
          }

          const studentPath = await StudentPath.findOne({ student: studentId });
          if (!studentPath) {
            console.log('⚠️ Student path not found, skipping difficulty adjustment');
            return;
          }

          // Determine new difficulty level based on performance
          let newDifficulty = null;
          let adjustmentMessage = '';

          if (averageScore >= 85) {
            newDifficulty = 'Hard';
            adjustmentMessage = `🚀 Excellent performance! We're challenging you with harder content.`;
            console.log(`✨ High performance (${averageScore.toFixed(1)}%) - Recommending Hard content`);
          } else if (averageScore >= 70) {
            newDifficulty = 'Medium';
            adjustmentMessage = `📈 Great progress! We're adjusting content to match your level.`;
            console.log(`📚 Good performance (${averageScore.toFixed(1)}%) - Recommending Medium content`);
          } else if (averageScore < 60) {
            newDifficulty = 'Easy';
            adjustmentMessage = `💪 We're here to help! Let's build confidence with simpler content.`;
            console.log(`🎯 Struggling (${averageScore.toFixed(1)}%) - Recommending Easy content`);
          } else {
            console.log(`✓ Performance stable (${averageScore.toFixed(1)}%) - No adjustment needed`);
            return; // No adjustment needed for 60-70% range
          }

          // Update student's current difficulty level
          const currentDifficultyBefore = student.currentDifficulty;
          if (currentDifficultyBefore !== newDifficulty) {
            await Student.findByIdAndUpdate(studentId, { 
              $set: { currentDifficulty: newDifficulty } 
            });
            console.log(`🔄 Updated student difficulty: ${currentDifficultyBefore || 'Not Set'} → ${newDifficulty}`);
          }

          // Find curriculum path
          const curriculumPath = await PathModel.findOne({ type: student.type });
          if (!curriculumPath) {
            console.log('⚠️ Curriculum path not found');
            return;
          }

          // Query content at the new difficulty level
          const newContent = await Content.find({
            path: curriculumPath._id,
            status: 'published',
            difficulty: newDifficulty
          }).select('_id title difficulty contentType description').limit(50).lean();

          console.log(`📦 Found ${newContent.length} ${newDifficulty} content items`);

          if (newContent.length > 0 && process.env.OPENAI_API_KEY) {
            // Use AI to select best content for adjustment
            const OpenAI = require('openai');
            const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

            const prompt = `Student Performance Analysis:
- Student Type: ${student.type}
- Recent Quiz Average: ${averageScore.toFixed(1)}%
- Performance Trend: ${averageScore >= 85 ? 'Excelling' : averageScore >= 70 ? 'Progressing well' : 'Needs support'}
- New Recommended Difficulty: ${newDifficulty}

Available ${newDifficulty} Content (${newContent.length} items):
${newContent.slice(0, 30).map((c, i) => `${i + 1}. "${c.title}" [${c.contentType}] - ${c.difficulty}`).join('\n')}

Task: Select 3-5 content items that will:
1. Match the student's new difficulty level (${newDifficulty})
2. Build on their current knowledge
3. ${averageScore >= 85 ? 'Challenge them appropriately' : averageScore >= 70 ? 'Maintain their progress' : 'Rebuild their confidence'}
4. Provide variety in content types

Return ONLY a JSON array of indices (1-based). Example: [3, 7, 12, 5]`;

            const completion = await openai.chat.completions.create({
              model: "gpt-4o-mini",
              messages: [
                { 
                  role: "system", 
                  content: "You are an adaptive learning AI that adjusts content difficulty based on student performance. Analyze performance trends and select optimal content." 
                },
                { role: "user", content: prompt }
              ],
              temperature: 0.3
            });

            const responseText = completion.choices[0].message.content.trim();
            const indices = JSON.parse(responseText.match(/\[.*\]/s)?.[0] || "[]");

            if (indices.length > 0) {
              const recommendedIds = indices
                .map(idx => newContent[idx - 1]?._id)
                .filter(Boolean);

              // Add recommended content to student's path
              const newAssignedContent = recommendedIds.map(contentId => ({
                content: contentId,
                status: 'pending',
                addedDate: new Date(),
                priority: 'high',
                aiRecommended: true
              }));

              // Remove duplicates and add to beginning of path
              const existingIds = new Set(studentPath.assignedContent.map(c => c.content.toString()));
              const uniqueRecs = newAssignedContent.filter(rec => !existingIds.has(rec.content.toString()));

              if (uniqueRecs.length > 0) {
                studentPath.assignedContent = [...uniqueRecs, ...studentPath.assignedContent];
                await studentPath.save();

                console.log(`✅ Added ${uniqueRecs.length} AI-selected ${newDifficulty} content items to student's path`);

                // Send notification about difficulty adjustment
                await createNotification({
                  recipient: studentId,
                  recipientModel: 'Student',
                  message: adjustmentMessage,
                  type: 'achievement'
                });
              }
            }
          } else if (newContent.length > 0) {
            // Fallback: Add random content if AI not available
            const randomContent = newContent
              .sort(() => Math.random() - 0.5)
              .slice(0, 3)
              .map(c => ({
                content: c._id,
                status: 'pending',
                addedDate: new Date(),
                priority: 'high'
              }));

            const existingIds = new Set(studentPath.assignedContent.map(c => c.content.toString()));
            const uniqueRecs = randomContent.filter(rec => !existingIds.has(rec.content.toString()));

            if (uniqueRecs.length > 0) {
              studentPath.assignedContent = [...uniqueRecs, ...studentPath.assignedContent];
              await studentPath.save();
              console.log(`✅ Added ${uniqueRecs.length} ${newDifficulty} content items (no AI)`);
            }
          }
        } else {
          console.log(`⏳ Only ${recentResults.length} quizzes completed - need at least 3 for adaptive adjustment`);
        }
      } catch (adaptError) {
        console.error('❌ Error in adaptive difficulty adjustment:', adaptError);
        // Non-blocking error - quiz submission still succeeds
      }
    });

    return res.status(200).json({ success: true, message: 'Quiz submitted and notification sent' });
  } catch (e) {
    console.error('submitQuiz error', e);
    return res.status(500).json({ error: 'Server error', message: e.message });
  }
};

exports.getPublishedQuizzes = async (req, res) => {
  try {
    const { courseId, lessonId } = req.query;
    const query = { status: 'published' };

    if (courseId) query.course = courseId;
    if (lessonId) query.lesson = lessonId;

    // **DIFFICULTY FILTERING** - If user is a student, filter by their current difficulty level
    if (req.user && req.user.role === 'student') {
      const Student = require('../models/Student');
      const student = await Student.findById(req.user.sub).select('currentDifficulty');
      
      if (student && student.currentDifficulty) {
        query.difficulty = student.currentDifficulty;
        console.log(`🎯 Filtering quizzes for student ${req.user.sub}: ${student.currentDifficulty} difficulty only`);
      } else {
        console.log(`⚠️ Student ${req.user.sub} has no difficulty set - showing all quizzes`);
      }
    }

    const quizzes = await Quiz.find(query)
      .select('title difficulty questionsAndAnswers lesson topic course status releaseDate')
      .sort({ createdAt: -1 });

    const transformed = quizzes.map(q => ({
      _id: q._id,
      title: q.title,
      difficulty: q.difficulty,
      questionsCount: q.questionsAndAnswers?.length || 0,
      lesson: q.lesson,
      topic: q.topic,
      course: q.course,
      time: `${(q.questionsAndAnswers?.length || 0) * 2} min` // Estimated time
    }));

    console.log(`✅ Returning ${transformed.length} published quizzes${query.difficulty ? ` (${query.difficulty} difficulty)` : ''}`);
    return res.status(200).json({ data: transformed });
  } catch (e) {
    console.error('getPublishedQuizzes error', e);
    return res.status(500).json({ error: 'Server error' });
  }
};

exports.getQuizById = async (req, res) => {
  try {
    const { id } = req.params;

    const quiz = await Quiz.findById(id)
      .select('title difficulty questionsAndAnswers lesson topic course status');

    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    // Only return published quizzes to students
    if (req.user.role === 'student' && quiz.status !== 'published') {
      return res.status(403).json({ error: 'Quiz not available' });
    }

    return res.status(200).json({ data: quiz });
  } catch (e) {
    console.error('getQuizById error', e);
    return res.status(500).json({ error: 'Server error' });
  }
};

exports.saveQuizProgress = async (req, res) => {
  try {
    const QuizResult = require('../models/QuizResult');
    const studentId = req.user.sub;
    const { quizId, status, answers, currentQuestionIndex, grade } = req.body;

    if (!quizId) {
      return res.status(400).json({ error: 'Quiz ID is required' });
    }

    // Find existing quiz result or create new one
    let quizResult = await QuizResult.findOne({
      quiz: quizId,
      student: studentId
    });

    if (quizResult) {
      // Update existing result
      quizResult.status = status || quizResult.status;
      quizResult.answers = answers || quizResult.answers;
      quizResult.currentQuestionIndex = currentQuestionIndex !== undefined ? currentQuestionIndex : quizResult.currentQuestionIndex;
      if (grade !== undefined) {
        quizResult.grade = grade;
      }
      await quizResult.save();
    } else {
      // Create new result
      quizResult = await QuizResult.create({
        quiz: quizId,
        student: studentId,
        status: status || 'in-progress',
        answers: answers || {},
        currentQuestionIndex: currentQuestionIndex || 0,
        grade: grade || null
      });
    }

    return res.status(200).json({ data: quizResult });
  } catch (e) {
    console.error('saveQuizProgress error', e);
    return res.status(500).json({ error: 'Server error' });
  }
};

exports.getQuizProgress = async (req, res) => {
  try {
    const QuizResult = require('../models/QuizResult');
    const studentId = req.user.sub;
    const { id: quizId } = req.params;

    const result = await QuizResult.findOne({
      student: studentId,
      quiz: quizId
    });

    return res.status(200).json({ data: result });
  } catch (e) {
    console.error('getQuizProgress error', e);
    return res.status(500).json({ error: 'Server error' });
  }
};

exports.getStudentQuizzes = async (req, res) => {
  try {
    const studentId = req.user.sub;

    // 1. Get Student Track to determine reached courses
    const track = await Track.findOne({ student: studentId }).populate('courses.course');

    let maxOrderReached = -1;
    // Assume if no track, they are at start (maybe 0? or -1 means nothing visible). 
    // Usually valid students have a track.
    if (track && track.courses) {
      track.courses.forEach(c => {
        // Check if course is started/completed
        // "in_progress" or "completed". seemingly "not_started" is default.
        if (c.course && (c.status === 'in_progress' || c.status === 'completed')) {
          if (c.course.order > maxOrderReached) {
            maxOrderReached = c.course.order;
          }
        }
      });
    }

    // 2. Fetch all published quizzes with course info
    const quizzes = await Quiz.find({ status: 'published' })
      .populate('course', 'title order')
      .populate('lesson', 'title')
      .lean();

    // 3. Fetch existing results
    const results = await QuizResult.find({ student: studentId }).lean();
    const resultMap = new Map();
    results.forEach(r => resultMap.set(r.quiz.toString(), r));

    // 4. Categorize
    const categorized = quizzes.map(q => {
      const result = resultMap.get(q._id.toString());
      const courseOrder = q.course ? q.course.order : 9999;

      // Default category
      let status = 'upcoming';

      // Logic
      if (result) {
        status = 'graded'; // Represents "Graded / Paused" tab
      } else if (courseOrder <= maxOrderReached) {
        status = 'your_course';
      } else {
        status = 'upcoming';
      }

      // Prepare return object
      return {
        id: q._id,
        quizTitle: q.title,
        courseTitle: q.course ? q.course.title : 'Unknown Course',
        lessonTitle: q.lesson ? q.lesson.title : 'General',
        // fields for UI
        status: status,
        resultStatus: result ? result.status : null, // 'completed', 'in-progress'
        score: result && result.grade !== null ? Math.round(result.grade) : null,
        maxScore: 100, // Hardcoded max for now, or fetch from quiz if exists

        // extra metadata
        difficulty: q.difficulty,
        questions: q.questionsAndAnswers ? q.questionsAndAnswers.length : 0,
        date: q.createdAt, // or release date
        instructor: 'Instructor' // Placeholder or populate teacher
      };
    });

    return res.status(200).json({ quizzes: categorized });

  } catch (e) {
    console.error('getStudentQuizzes error', e);
    return res.status(500).json({ error: 'Server error', message: e.message });
  }
};

exports.updateQuiz = async (req, res) => {
  try {
    const allowed = ['title', 'status', 'category', 'topic', 'lesson', 'course', 'difficulty', 'previousStatus'];
    const update = Object.fromEntries(
      Object.entries(req.body).filter(([k]) => allowed.includes(k))
    );

    const updated = await Quiz.findOneAndUpdate(
      { _id: req.params.id, teacher: req.user.sub },
      update,
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ error: 'Quiz not found or not yours' });
    }
    res.json({ data: updated });
  } catch (e) {
    res.status(500).json({ error: 'Failed to update quiz' });
  }
};

exports.deleteQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findOne({ _id: req.params.id, teacher: req.user.sub });

    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found or not yours' });
    }

    // Delete from MongoDB
    await Quiz.deleteOne({ _id: req.params.id, teacher: req.user.sub });

    res.json({ message: 'Quiz deleted successfully' });
  } catch (e) {
    console.error('Error deleting quiz:', e);
    res.status(500).json({ error: 'Failed to delete quiz', message: e.message });
  }
};