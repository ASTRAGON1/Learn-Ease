const DiagnosticQuestion = require('../models/DiagnosticQuestion');
const Student = require('../models/Student');
const Test = require('../models/Test');
const PathModel = require('../models/Path');
const Content = require('../models/Content');
const StudentPath = require('../models/StudentPath');
const fs = require('fs');
const path = require('path');
const OpenAI = require('openai');

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
    const questions = await DiagnosticQuestion.find()
      .sort({ section: 1, order: 1 });

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

    // --- Generate TRULY Personalized Path ---
    try {
      // 1. Find the curriculum Path (e.g., "Autism Learning Path")
      const curriculumPath = await PathModel.findOne({ type: studentType });

      if (curriculumPath) {
        console.log(`📚 Found path: ${curriculumPath.title}`);

        // 2. Determine difficulty filter based on accuracy score - MATCH skill level
        let difficultyFilter;
        const accuracyPercent = accuracy * 100;
        
        if (accuracyPercent < 50) {
          difficultyFilter = ['Easy'];
          console.log(`🎯 Low accuracy (${accuracyPercent.toFixed(0)}% < 50%) - Assigning ONLY Easy content`);
        } else if (accuracyPercent <= 80) {
          difficultyFilter = ['Medium'];
          console.log(`🎯 Medium accuracy (${accuracyPercent.toFixed(0)}% = 50-80%) - Assigning ONLY Medium content`);
        } else {
          difficultyFilter = ['Hard'];
          console.log(`🎯 High accuracy (${accuracyPercent.toFixed(0)}% > 80%) - Assigning ONLY Hard content`);
        }

        // 3. Analyze student preferences from section1 (Preferences)
        // Detect content type preference based on answer patterns
        let preferredContentType = null;
        
        // Section 1 typically contains learning preference questions
        // We'll prioritize video content if student shows visual learning preference
        const visualPreferenceIndicators = [0, 2]; // Example: if they chose options that indicate visual learning
        const hasVisualPreference = section1.some(answer => visualPreferenceIndicators.includes(answer));
        
        if (hasVisualPreference) {
          preferredContentType = 'video';
          console.log('👁️ Student shows visual learning preference - prioritizing video content');
        }

        // 4. Build smart content query with filters
        const contentQuery = {
          path: curriculumPath._id,
          status: 'published',
          difficulty: { $in: difficultyFilter }
        };

        // Fetch all matching content
        const allFilteredContent = await Content.find(contentQuery)
          .select('_id title difficulty contentType topic description')
          .lean();

        console.log(`📦 Found ${allFilteredContent.length} content items matching difficulty criteria`);

        // 5. Prioritize content based on preferences
        let prioritizedContent = [...allFilteredContent];
        
        if (preferredContentType) {
          // Sort: preferred type first, then others
          prioritizedContent.sort((a, b) => {
            if (a.contentType === preferredContentType && b.contentType !== preferredContentType) return -1;
            if (a.contentType !== preferredContentType && b.contentType === preferredContentType) return 1;
            return 0;
          });
        }

        // 6. Create base assigned content (first 70% of filtered content)
        const baseContentCount = Math.ceil(prioritizedContent.length * 0.7);
        const baseContent = prioritizedContent.slice(0, baseContentCount);
        
        const assignedContent = baseContent.map(c => ({
          content: c._id,
          status: 'pending',
          addedDate: new Date(),
          priority: 'normal'
        }));

        console.log(`✅ Selected ${assignedContent.length} base content items (${Math.round(assignedContent.length/prioritizedContent.length*100)}% of filtered content)`);

        // Check if a path already exists for this student to avoid duplicates
        const existingPath = await StudentPath.findOne({ student: studentId });

        if (existingPath) {
          console.log(`ℹ️ Student already has a path, skipping creation.`);
        } else {
          // We'll create the path but also add AI recommendations below
          await StudentPath.create({
            student: studentId,
            StudentId: studentId,
            path: curriculumPath._id,
            assignedContent: assignedContent,
            status: 'in-progress'
          });
          console.log(`✅ Created personalized StudentPath with ${assignedContent.length} items tailored to accuracy: ${accuracyPercent.toFixed(0)}%`);
        }

      } else {
        console.warn(`⚠️ No default Path found for type: ${studentType}. Please create a Path in the Admin Panel.`);
      }

      // --- Enhanced AI Personalization Step ---
      if (process.env.OPENAI_API_KEY) {
        try {
          console.log('🤖 Starting AI personalization analysis...');
          const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

          // Determine difficulty filter based on accuracy - MATCH skill level
          const accuracyPercent = accuracy * 100;
          let aiDifficultyFilter;
          
          if (accuracyPercent < 50) {
            aiDifficultyFilter = ['Easy'];
          } else if (accuracyPercent <= 80) {
            aiDifficultyFilter = ['Medium'];
          } else {
            aiDifficultyFilter = ['Hard'];
          }

          // 1. Fetch available content matching student's difficulty level
          const availableContent = await Content.find({
            status: 'published',
            difficulty: { $in: aiDifficultyFilter }
          }).select('_id title description duration difficulty topic contentType').limit(80).lean();

          if (availableContent.length > 0) {
            // 2. Build Enhanced Prompt with student profile
            const prompt = `Student Profile:
- Condition: ${studentType} (Autism Score: ${autismScore}, Down Syndrome Score: ${downSyndromeScore})
- Diagnostic Accuracy: ${(accuracy * 100).toFixed(0)}% - ${accuracyPercent < 50 ? 'Needs foundational support (Easy level)' : accuracyPercent <= 80 ? 'Building skills (Medium level)' : 'Ready for challenges (Hard level)'}
- Assigned Difficulty: ${aiDifficultyFilter[0]} ONLY - content must match their current skill level
- Section 1 (Learning Preferences): ${JSON.stringify(section1)}
- Section 3 (Behavioral Patterns): ${JSON.stringify(section3)}

Available ${aiDifficultyFilter[0]} Content (${availableContent.length} items):
${availableContent.map((c, i) => `${i + 1}. "${c.title}" [${c.contentType}] - ${c.difficulty} - Topic: ${c.topic || 'General'} - ${c.duration || 'N/A'}min`).join('\n')}

Task: As an expert special education AI, select 5-8 ${aiDifficultyFilter[0]} difficulty content items that will:
1. Match the student's ${aiDifficultyFilter[0]} skill level (${accuracyPercent.toFixed(0)}% accuracy)
2. Address their learning style preferences from Section 1
3. Support their behavioral needs from Section 3
4. Provide a balanced mix of content types (videos, images, documents)
5. Create an engaging learning experience at their level

Return ONLY a JSON array of indices (1-based). Example: [3, 7, 12, 5, 20, 15, 8]`;

            // 3. Call OpenAI
            const completion = await openai.chat.completions.create({
              model: "gpt-4o-mini",
              messages: [
                { 
                  role: "system", 
                  content: "You are an expert special education curriculum planner specializing in autism and Down syndrome education. Analyze student profiles deeply and return only a JSON array of content indices that best match their needs." 
                },
                { role: "user", content: prompt }
              ],
              temperature: 0.4
            });

            // 4. Parse Response
            const responseText = completion.choices[0].message.content.trim();
            const indices = JSON.parse(responseText.match(/\[.*\]/s)?.[0] || "[]");

            if (indices.length > 0) {
              // Get the AI-recommended content IDs
              const aiRecommendedIds = indices
                .map(idx => availableContent[idx - 1]?._id)
                .filter(Boolean);

              console.log(`🎯 AI selected ${aiRecommendedIds.length} priority content items`);

              // 5. Integrate AI recommendations into main curriculum with HIGH priority
              if (aiRecommendedIds.length > 0) {
                const studentPath = await StudentPath.findOne({ student: studentId });
                
                if (studentPath) {
                  // Add AI recommendations to the START of assignedContent with high priority
                  const aiRecommendations = aiRecommendedIds.map(contentId => ({
                    content: contentId,
                    status: 'pending',
                    addedDate: new Date(),
                    priority: 'high', // Mark as AI-recommended
                    aiRecommended: true
                  }));

                  // Remove duplicates if AI recommended something already in the list
                  const existingIds = new Set(studentPath.assignedContent.map(c => c.content.toString()));
                  const uniqueAiRecs = aiRecommendations.filter(rec => !existingIds.has(rec.content.toString()));

                  if (uniqueAiRecs.length > 0) {
                    // Add AI recommendations at the beginning
                    studentPath.assignedContent = [...uniqueAiRecs, ...studentPath.assignedContent];
                    await studentPath.save();
                    
                    console.log(`✅ Integrated ${uniqueAiRecs.length} AI-recommended items into main curriculum (marked as high priority)`);
                  }

                  // Also save to personalizedRecommendations for separate display if needed
                  const recommendedContent = indices.map(idx => {
                    const content = availableContent[idx - 1];
                    if (!content) return null;
                    return {
                      content: content._id,
                      reason: `AI-selected based on your ${studentType} profile and ${accuracyPercent.toFixed(0)}% accuracy score`,
                      generatedAt: new Date()
                    };
                  }).filter(Boolean);

                  await StudentPath.findOneAndUpdate(
                    { student: studentId },
                    { $set: { personalizedRecommendations: recommendedContent } }
                  );
                }
              }
            }
          } else {
            console.log('⚠️ No content available for AI recommendation at this difficulty level');
          }
        } catch (aiError) {
          console.error("❌ Error generating AI recommendations:", aiError);
          // Non-blocking error - student still gets base curriculum
        }
      } else {
        console.log('ℹ️ OpenAI API key not configured - skipping AI personalization');
      }

    } catch (pathError) {
      console.error("❌ Error generating StudentPath:", pathError);
      // We don't block the response, but log the error
    }
    // ----------------------------------

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

// Regenerate personalized path for existing students
exports.regeneratePath = async (req, res) => {
  try {
    const studentId = req.user.sub;
    const OpenAI = require('openai');

    // 1. Get student and test data
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const testResults = await Test.findOne({ student: studentId });
    if (!testResults) {
      return res.status(400).json({ 
        error: 'No diagnostic test found. Please complete the diagnostic test first.' 
      });
    }

    const { section1, section2, section3, accuracy, autismScore, downSyndromeScore, determinedType } = testResults;
    const studentType = determinedType;

    console.log(`🔄 Regenerating path for student ${studentId} - Type: ${studentType}, Accuracy: ${(accuracy * 100).toFixed(0)}%`);

    // 2. Find the curriculum Path
    const curriculumPath = await PathModel.findOne({ type: studentType });

    if (!curriculumPath) {
      return res.status(404).json({ error: `No curriculum path found for type: ${studentType}` });
    }

    // 3. Determine difficulty filter based on accuracy score - MATCH skill level
    let difficultyFilter;
    const accuracyPercent = accuracy * 100;
    
    if (accuracyPercent < 50) {
      difficultyFilter = ['Easy'];
      console.log(`🎯 Low accuracy (${accuracyPercent.toFixed(0)}% < 50%) - Assigning ONLY Easy content`);
    } else if (accuracyPercent <= 80) {
      difficultyFilter = ['Medium'];
      console.log(`🎯 Medium accuracy (${accuracyPercent.toFixed(0)}% = 50-80%) - Assigning ONLY Medium content`);
    } else {
      difficultyFilter = ['Hard'];
      console.log(`🎯 High accuracy (${accuracyPercent.toFixed(0)}% > 80%) - Assigning ONLY Hard content`);
    }

    // 4. Analyze student preferences
    let preferredContentType = null;
    const visualPreferenceIndicators = [0, 2];
    const hasVisualPreference = section1.some(answer => visualPreferenceIndicators.includes(answer));
    
    if (hasVisualPreference) {
      preferredContentType = 'video';
      console.log('👁️ Student shows visual learning preference - prioritizing video content');
    }

    // 5. Build smart content query
    const contentQuery = {
      path: curriculumPath._id,
      status: 'published',
      difficulty: { $in: difficultyFilter }
    };

    const allFilteredContent = await Content.find(contentQuery)
      .select('_id title difficulty contentType topic description')
      .lean();

    console.log(`📦 Found ${allFilteredContent.length} content items matching difficulty criteria`);

    // 6. Prioritize content based on preferences
    let prioritizedContent = [...allFilteredContent];
    
    if (preferredContentType) {
      prioritizedContent.sort((a, b) => {
        if (a.contentType === preferredContentType && b.contentType !== preferredContentType) return -1;
        if (a.contentType !== preferredContentType && b.contentType === preferredContentType) return 1;
        return 0;
      });
    }

    // 7. Create base assigned content (70% of filtered content)
    const baseContentCount = Math.ceil(prioritizedContent.length * 0.7);
    const baseContent = prioritizedContent.slice(0, baseContentCount);
    
    const assignedContent = baseContent.map(c => ({
      content: c._id,
      status: 'pending',
      addedDate: new Date(),
      priority: 'normal'
    }));

    console.log(`✅ Selected ${assignedContent.length} base content items`);

    // 8. AI Personalization
    let aiRecommendedIds = [];
    if (process.env.OPENAI_API_KEY) {
      try {
        console.log('🤖 Starting AI personalization...');
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

        const availableContent = await Content.find({
          status: 'published',
          difficulty: { $in: difficultyFilter }
        }).select('_id title description duration difficulty topic contentType').limit(80).lean();

        if (availableContent.length > 0) {
          const prompt = `Student Profile:
- Condition: ${studentType} (Autism: ${autismScore}, Down Syndrome: ${downSyndromeScore})
- Accuracy: ${accuracyPercent.toFixed(0)}%
- Preferences: ${JSON.stringify(section1)}

Available Content (${availableContent.length}):
${availableContent.map((c, i) => `${i + 1}. "${c.title}" [${c.contentType}] - ${c.difficulty}`).join('\n')}

Select 5-8 most suitable items. Return JSON array of indices: [1, 5, 3, ...]`;

          const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
              { role: "system", content: "Expert special education AI. Return only JSON array of indices." },
              { role: "user", content: prompt }
            ],
            temperature: 0.4
          });

          const responseText = completion.choices[0].message.content.trim();
          const indices = JSON.parse(responseText.match(/\[.*\]/s)?.[0] || "[]");

          if (indices.length > 0) {
            aiRecommendedIds = indices.map(idx => availableContent[idx - 1]?._id).filter(Boolean);
            console.log(`🎯 AI selected ${aiRecommendedIds.length} priority items`);
          }
        }
      } catch (aiError) {
        console.error('AI error (non-blocking):', aiError.message);
      }
    }

    // 9. Update or create StudentPath
    let studentPath = await StudentPath.findOne({ student: studentId });

    if (studentPath) {
      // Update existing path
      studentPath.assignedContent = assignedContent;
      
      // Add AI recommendations with high priority
      if (aiRecommendedIds.length > 0) {
        const existingIds = new Set(assignedContent.map(c => c.content.toString()));
        const aiRecs = aiRecommendedIds
          .filter(id => !existingIds.has(id.toString()))
          .map(id => ({
            content: id,
            status: 'pending',
            addedDate: new Date(),
            priority: 'high',
            aiRecommended: true
          }));
        
        studentPath.assignedContent = [...aiRecs, ...studentPath.assignedContent];
      }

      await studentPath.save();
      console.log(`✅ Updated StudentPath with ${studentPath.assignedContent.length} items`);
    } else {
      // Create new path
      const newAssignedContent = [...assignedContent];
      
      if (aiRecommendedIds.length > 0) {
        const aiRecs = aiRecommendedIds.map(id => ({
          content: id,
          status: 'pending',
          addedDate: new Date(),
          priority: 'high',
          aiRecommended: true
        }));
        newAssignedContent.unshift(...aiRecs);
      }

      await StudentPath.create({
        student: studentId,
        StudentId: studentId,
        path: curriculumPath._id,
        assignedContent: newAssignedContent,
        status: 'in-progress'
      });
      console.log(`✅ Created new StudentPath with ${newAssignedContent.length} items`);
    }

    res.json({
      success: true,
      message: `Successfully regenerated your personalized learning path with ${assignedContent.length} items tailored to your ${accuracyPercent.toFixed(0)}% accuracy score!`,
      data: {
        totalItems: assignedContent.length + aiRecommendedIds.length,
        baseItems: assignedContent.length,
        aiRecommended: aiRecommendedIds.length,
        difficultyLevels: difficultyFilter,
        accuracyScore: accuracyPercent.toFixed(0)
      }
    });

  } catch (error) {
    console.error('Regenerate path error:', error);
    res.status(500).json({ error: 'Failed to regenerate path', details: error.message });
  }
};
