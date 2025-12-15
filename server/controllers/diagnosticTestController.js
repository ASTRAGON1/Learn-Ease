const DiagnosticQuestion = require('../models/DiagnosticQuestion');
const Student = require('../models/Student');
const Test = require('../models/Test');
const fs = require('fs');
const path = require('path');

// Helper function to get questions (from DB or JSON file)
function getQuestionsData() {
  try {
    // Try to load from JSON file first (more reliable if DB is empty)
    const jsonPath = path.join(__dirname, '../data/diagnosticQuestions.json');
    if (fs.existsSync(jsonPath)) {
      const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
      return {
        section1: jsonData.section1 || [],
        section2: jsonData.section2 || [],
        section3: jsonData.section3 || []
      };
    }
  } catch (error) {
    console.error('Error loading questions from JSON:', error);
  }
  return { section1: [], section2: [], section3: [] };
}

// Get all diagnostic questions (organized by section)
exports.getQuestions = async (req, res) => {
  try {
    // Try database first, fallback to JSON file
    let questions = [];
    try {
      questions = await DiagnosticQuestion.find({ isActive: true })
      .sort({ section: 1, order: 1 })
      .lean();
    } catch (dbError) {
      console.log('Database query failed, using JSON file');
    }

    // If no questions from DB, use JSON file
    if (questions.length === 0) {
      const jsonData = getQuestionsData();
      res.json({
        success: true,
        data: jsonData
      });
      return;
    }

    // Organize by sections
    const section1 = questions.filter(q => q.section === 1);
    const section2 = questions.filter(q => q.section === 2);
    const section3 = questions.filter(q => q.section === 3);

    res.json({
      success: true,
      data: {
        section1,
        section2,
        section3
      }
    });
  } catch (error) {
    console.error('Get diagnostic questions error:', error);
    res.status(500).json({ error: 'Failed to fetch questions' });
  }
};

// Get all questions for admin (including inactive)
exports.getAllQuestionsForAdmin = async (req, res) => {
  try {
    console.log('🔍 Fetching all questions for admin from MongoDB...');
    const questions = await DiagnosticQuestion.find()
      .sort({ section: 1, order: 1 });

    console.log(`📊 Found ${questions.length} questions in MongoDB`);
    res.json({ ok: true, data: questions });
  } catch (error) {
    console.error('❌ Get all questions error:', error);
    res.status(500).json({ ok: false, error: 'Failed to fetch questions' });
  }
};

// Create a new question
exports.createQuestion = async (req, res) => {
  try {
    const { questionId, section, order, question, options, scoring, correctAnswer } = req.body;

    // Validation
    if (!questionId || !section || order === undefined || !question || !options || options.length < 2) {
      return res.status(400).json({ ok: false, error: 'Missing required fields' });
    }

    // Check if questionId already exists
    const existing = await DiagnosticQuestion.findOne({ questionId });
    if (existing) {
      return res.status(400).json({ ok: false, error: 'Question ID already exists' });
    }

    const newQuestion = new DiagnosticQuestion({
      questionId,
      section,
      order,
      question,
      options,
      scoring: scoring || {},
      correctAnswer: correctAnswer !== undefined ? correctAnswer : null,
      createdBy: req.user?.name || 'admin'
    });

    await newQuestion.save();
    res.json({ ok: true, data: newQuestion });
  } catch (error) {
    console.error('Create question error:', error);
    res.status(500).json({ ok: false, error: 'Failed to create question' });
  }
};

// Update a question
exports.updateQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const question = await DiagnosticQuestion.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!question) {
      return res.status(404).json({ ok: false, error: 'Question not found' });
    }

    res.json({ ok: true, data: question });
  } catch (error) {
    console.error('Update question error:', error);
    res.status(500).json({ ok: false, error: 'Failed to update question' });
  }
};

// Delete a question
exports.deleteQuestion = async (req, res) => {
  try {
    const { id } = req.params;

    const question = await DiagnosticQuestion.findByIdAndDelete(id);

    if (!question) {
      return res.status(404).json({ ok: false, error: 'Question not found' });
    }

    res.json({ ok: true, message: 'Question deleted successfully' });
  } catch (error) {
    console.error('Delete question error:', error);
    res.status(500).json({ ok: false, error: 'Failed to delete question' });
  }
};

// Toggle question active status
exports.toggleQuestionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const question = await DiagnosticQuestion.findByIdAndUpdate(
      id,
      { isActive },
      { new: true }
    );

    if (!question) {
      return res.status(404).json({ ok: false, error: 'Question not found' });
    }

    res.json({ ok: true, data: question });
  } catch (error) {
    console.error('Toggle question status error:', error);
    res.status(500).json({ ok: false, error: 'Failed to toggle question status' });
  }
};

// Bulk import questions from JSON
exports.bulkImportQuestions = async (req, res) => {
  try {
    const { questions } = req.body;
    console.log('📥 Bulk import request received');
    console.log('📊 Number of questions to import:', questions?.length);

    if (!Array.isArray(questions) || questions.length === 0) {
      console.error('❌ Invalid questions data');
      return res.status(400).json({ ok: false, error: 'Invalid questions data' });
    }

    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    console.log('🔄 Starting import process...');

    // Import questions one by one to handle duplicates
    for (const questionData of questions) {
      try {
        // Check if question already exists
        const existing = await DiagnosticQuestion.findOne({ questionId: questionData.questionId });
        
        if (existing) {
          // Update existing question
          await DiagnosticQuestion.findByIdAndUpdate(existing._id, questionData);
          console.log(`✅ Updated question: ${questionData.questionId}`);
          successCount++;
        } else {
          // Create new question
          const created = await DiagnosticQuestion.create(questionData);
          console.log(`✅ Created question: ${questionData.questionId} (ID: ${created._id})`);
          successCount++;
        }
      } catch (error) {
        console.error(`❌ Failed to import question ${questionData.questionId}:`, error.message);
        errorCount++;
        errors.push({
          questionId: questionData.questionId,
          error: error.message
        });
      }
    }

    const message = `Successfully imported ${successCount} questions to MongoDB${errorCount > 0 ? `, ${errorCount} failed` : ''}`;
    console.log('✅ Bulk import completed:', message);
    console.log('📊 Total questions in DB:', await DiagnosticQuestion.countDocuments());

    res.json({ 
      ok: true, 
      count: successCount,
      message,
      errors: errorCount > 0 ? errors : undefined
    });
  } catch (error) {
    console.error('❌ Bulk import error:', error);
    res.status(500).json({ ok: false, error: 'Failed to bulk import questions: ' + error.message });
  }
};

// Submit diagnostic quiz answers
exports.submitQuiz = async (req, res) => {
  try {
    const studentId = req.user.sub;
    const { section1, section2, section3 } = req.body;

    if (!section1 || !section2 || !section3) {
      return res.status(400).json({ error: 'All sections are required' });
    }

    // Check if student has already completed the quiz (prevent retaking)
    const existingTest = await Test.findOne({ student: studentId });
    if (existingTest) {
      return res.status(400).json({ 
        error: 'You have already completed the diagnostic quiz. It can only be taken once.',
        success: false 
      });
    }

    // Fetch questions from database or JSON file
    let questions = [];
    try {
      questions = await DiagnosticQuestion.find({ isActive: true })
      .sort({ section: 1, order: 1 })
      .lean();
    } catch (dbError) {
      console.log('Database query failed, using JSON file');
    }

    // If no questions from DB, use JSON file
    let quizData;
    if (questions.length === 0) {
      quizData = getQuestionsData();
    } else {
      quizData = {
      section1: questions.filter(q => q.section === 1),
      section2: questions.filter(q => q.section === 2),
      section3: questions.filter(q => q.section === 3)
    };
    }

    // Calculate scores
    let autismScore = 0;
    let downSyndromeScore = 0;

    // Section 1 Analysis
    section1.forEach((answer, index) => {
      const question = quizData.section1[index];
      if (question && question.scoring) {
        if (question.scoring.autism && question.scoring.autism[answer] !== undefined) {
          autismScore += question.scoring.autism[answer];
        }
        if (question.scoring.downSyndrome && question.scoring.downSyndrome[answer] !== undefined) {
          downSyndromeScore += question.scoring.downSyndrome[answer];
        }
      }
    });

    // Section 2 Analysis (Accuracy)
    let correctAnswers = 0;
    const totalQuestions = section2.length;
    
    section2.forEach((answer, index) => {
      const question = quizData.section2[index];
      if (question && answer !== undefined && answer !== null) {
        if (answer === question.correctAnswer) {
          correctAnswers++;
        }
      }
    });

    const accuracy = totalQuestions > 0 ? correctAnswers / totalQuestions : 0;
    
    if (accuracy < 0.5) {
      downSyndromeScore += 1;
    }

    // Section 3 Analysis
    section3.forEach((answer, index) => {
      const question = quizData.section3[index];
      if (question && question.scoring) {
        if (question.scoring.autism && question.scoring.autism[answer] !== undefined) {
          autismScore += question.scoring.autism[answer];
        }
        if (question.scoring.downSyndrome && question.scoring.downSyndrome[answer] !== undefined) {
          downSyndromeScore += question.scoring.downSyndrome[answer];
        }
      }
    });

    // Determine student type - always assign either autism or downSyndrome
    let studentType;
    if (autismScore > downSyndromeScore && autismScore >= 8) {
      studentType = 'autism';
    } else if (downSyndromeScore > autismScore && downSyndromeScore >= 6) {
      studentType = 'downSyndrome';
    } else {
      // Fallback: assign based on higher score, or default to autism if equal
      studentType = autismScore >= downSyndromeScore ? 'autism' : 'downSyndrome';
    }

    // Create Test record
    await Test.create({
      student: studentId,
      section1,
      section2,
      section3,
      autismScore,
      downSyndromeScore,
      accuracy,
      determinedType: studentType,
      completedAt: new Date()
    });

    // Update student record - only set the type, test data is stored in Test model
    const student = await Student.findByIdAndUpdate(
      studentId,
      {
        $set: { type: studentType }
      },
      { new: true, runValidators: true }
    );

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Verify the type was saved correctly
    if (student.type !== studentType) {
      console.error(`⚠️ Type mismatch: Expected ${studentType}, but got ${student.type}`);
      // Force update again to ensure consistency
      await Student.findByIdAndUpdate(studentId, { $set: { type: studentType } });
    }

    console.log(`✅ Student ${studentId} type set to: ${studentType} (autismScore: ${autismScore}, downSyndromeScore: ${downSyndromeScore})`);

    res.json({
      success: true,
      data: {
        studentType,
        autismScore,
        downSyndromeScore,
        accuracy: Math.round(accuracy * 100),
        message: `Based on your responses, we've identified your learning profile. Your personalized learning path has been set up!`
      }
    });
  } catch (error) {
    console.error('Submit diagnostic quiz error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Check if student has completed diagnostic quiz
exports.checkQuizStatus = async (req, res) => {
  try {
    const studentId = req.user.sub;
    const student = await Student.findById(studentId).select('type');
    const test = await Test.findOne({ student: studentId });
    
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    res.json({
      success: true,
      data: {
        completed: !!test,
        type: student.type || null
      }
    });
  } catch (error) {
    console.error('Check diagnostic quiz status error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
