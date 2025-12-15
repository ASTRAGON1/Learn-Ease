const Student = require('../models/Student');

// Generate diagnostic quiz questions
exports.generateDiagnosticQuiz = (req, res) => {
  const quiz = {
    section1: [
      {
        id: "s1q1",
        question: "Do you prefer learning with pictures or words?",
        options: [
          "Pictures only",
          "Words only",
          "Both pictures and words",
          "I am not sure"
        ]
      },
      {
        id: "s1q2",
        question: "Do you like step-by-step instructions or exploring on your own?",
        options: [
          "Step-by-step instructions",
          "Exploring on my own",
          "Both ways",
          "I am not sure"
        ]
      },
      {
        id: "s1q3",
        question: "Do you prefer short tasks or long tasks?",
        options: [
          "Short tasks only",
          "Long tasks only",
          "Both types",
          "I am not sure"
        ]
      },
      {
        id: "s1q4",
        question: "Do you feel overwhelmed when there is too much information?",
        options: [
          "Yes, often",
          "Sometimes",
          "Rarely",
          "Never"
        ]
      },
      {
        id: "s1q5",
        question: "Do you remember things better when you see them or hear them?",
        options: [
          "See them",
          "Hear them",
          "Both ways",
          "I am not sure"
        ]
      },
      {
        id: "s1q6",
        question: "Do you like to work alone or with others?",
        options: [
          "Alone only",
          "With others only",
          "Both ways",
          "I am not sure"
        ]
      },
      {
        id: "s1q7",
        question: "Do you prefer quiet places or noisy places to learn?",
        options: [
          "Quiet places",
          "Noisy places",
          "Both are fine",
          "I am not sure"
        ]
      },
      {
        id: "s1q8",
        question: "Do you like routines or do you prefer change?",
        options: [
          "Routines only",
          "Change only",
          "Both are fine",
          "I am not sure"
        ]
      }
    ],
    section2: [
      {
        id: "s2q1",
        question: "What does the word 'cat' mean?",
        options: [
          "A small animal",
          "A big animal",
          "A type of food",
          "A color"
        ],
        correctAnswer: 0
      },
      {
        id: "s2q2",
        question: "What is 2 plus 2?",
        options: [
          "3",
          "4",
          "5",
          "6"
        ],
        correctAnswer: 1
      },
      {
        id: "s2q3",
        question: "Which shape comes next: circle, square, circle, square, ?",
        options: [
          "Circle",
          "Square",
          "Triangle",
          "Rectangle"
        ],
        correctAnswer: 0
      },
      {
        id: "s2q4",
        question: "What does the word 'happy' mean?",
        options: [
          "Feeling sad",
          "Feeling good",
          "Feeling tired",
          "Feeling angry"
        ],
        correctAnswer: 1
      },
      {
        id: "s2q5",
        question: "What is 5 minus 2?",
        options: [
          "2",
          "3",
          "4",
          "5"
        ],
        correctAnswer: 1
      },
      {
        id: "s2q6",
        question: "Which number comes next: 1, 2, 3, 4, ?",
        options: [
          "4",
          "5",
          "6",
          "7"
        ],
        correctAnswer: 1
      },
      {
        id: "s2q7",
        question: "What does the word 'book' mean?",
        options: [
          "Something to read",
          "Something to eat",
          "Something to wear",
          "Something to play"
        ],
        correctAnswer: 0
      },
      {
        id: "s2q8",
        question: "What is 3 plus 1?",
        options: [
          "2",
          "3",
          "4",
          "5"
        ],
        correctAnswer: 2
      },
      {
        id: "s2q9",
        question: "Which color comes next: red, blue, red, blue, ?",
        options: [
          "Red",
          "Blue",
          "Green",
          "Yellow"
        ],
        correctAnswer: 0
      },
      {
        id: "s2q10",
        question: "What does the word 'friend' mean?",
        options: [
          "Someone you like",
          "Someone you do not know",
          "Something you eat",
          "A place you go"
        ],
        correctAnswer: 0
      },
      {
        id: "s2q11",
        question: "What is 4 plus 1?",
        options: [
          "3",
          "4",
          "5",
          "6"
        ],
        correctAnswer: 2
      },
      {
        id: "s2q12",
        question: "Which pattern comes next: A, B, A, B, ?",
        options: [
          "A",
          "B",
          "C",
          "D"
        ],
        correctAnswer: 0
      }
    ],
    section3: [
      {
        id: "s3q1",
        question: "How should the app tell you when you are right?",
        options: [
          "Soft and gentle",
          "Neutral and calm",
          "Direct and clear",
          "I am not sure"
        ]
      },
      {
        id: "s3q2",
        question: "How fast should lessons move?",
        options: [
          "Very slow",
          "Slow",
          "Medium speed",
          "Fast"
        ]
      },
      {
        id: "s3q3",
        question: "What should happen when you make a mistake?",
        options: [
          "Show a big error message",
          "Show a small hint",
          "Let me try again quietly",
          "I am not sure"
        ]
      },
      {
        id: "s3q4",
        question: "How should the app celebrate your success?",
        options: [
          "Big celebration",
          "Small celebration",
          "Just say good job",
          "No celebration"
        ]
      },
      {
        id: "s3q5",
        question: "Do you like challenges or easy tasks?",
        options: [
          "Easy tasks only",
          "Some challenges",
          "Many challenges",
          "I am not sure"
        ]
      },
      {
        id: "s3q6",
        question: "How should the app show your progress?",
        options: [
          "With many details",
          "With simple bars",
          "With numbers only",
          "I am not sure"
        ]
      },
      {
        id: "s3q7",
        question: "Do you like reminders or do you prefer to work at your own pace?",
        options: [
          "I like reminders",
          "I prefer my own pace",
          "Both are fine",
          "I am not sure"
        ]
      }
    ]
  };

  res.json({ success: true, data: quiz });
};

// Submit diagnostic quiz results and analyze student type
exports.submitDiagnosticQuiz = async (req, res) => {
  try {
    const studentId = req.user.sub;
    const { section1, section2, section3 } = req.body;

    if (!section1 || !section2 || !section3) {
      return res.status(400).json({ error: 'All sections must be completed' });
    }

    // Analyze responses to determine student type
    let autismScore = 0;
    let downSyndromeScore = 0;

    // Section 1 Analysis (Cognitive & Learning Style)
    // Autism indicators: preference for routines, visual learning, step-by-step, quiet places, alone
    // Down Syndrome indicators: social preference, verbal learning, both ways flexibility
    
    section1.forEach((answer, index) => {
      const questionId = `s1q${index + 1}`;
      
      // Question 1: Visual vs Verbal
      if (questionId === 's1q1') {
        if (answer === 0) autismScore += 2; // Pictures only
        if (answer === 1) downSyndromeScore += 1; // Words only
      }
      
      // Question 2: Step-by-step vs Exploratory
      if (questionId === 's1q2') {
        if (answer === 0) autismScore += 2; // Step-by-step
        if (answer === 1) downSyndromeScore += 1; // Exploratory
      }
      
      // Question 3: Short vs Long tasks
      if (questionId === 's1q3') {
        if (answer === 0) autismScore += 1; // Short tasks
      }
      
      // Question 4: Information overload sensitivity
      if (questionId === 's1q4') {
        if (answer === 0) autismScore += 2; // Often overwhelmed
        if (answer === 1) autismScore += 1; // Sometimes
      }
      
      // Question 5: Visual vs Auditory memory
      if (questionId === 's1q5') {
        if (answer === 0) autismScore += 1; // Visual
        if (answer === 1) downSyndromeScore += 1; // Auditory
      }
      
      // Question 6: Alone vs With others
      if (questionId === 's1q6') {
        if (answer === 0) autismScore += 2; // Alone
        if (answer === 1) downSyndromeScore += 2; // With others
      }
      
      // Question 7: Quiet vs Noisy
      if (questionId === 's1q7') {
        if (answer === 0) autismScore += 2; // Quiet
        if (answer === 1) downSyndromeScore += 1; // Noisy
      }
      
      // Question 8: Routines vs Change
      if (questionId === 's1q8') {
        if (answer === 0) autismScore += 3; // Routines only
        if (answer === 1) downSyndromeScore += 1; // Change
      }
    });

    // Section 2 Analysis (Baseline Knowledge)
    // Calculate accuracy based on correct answers
    let correctAnswers = 0;
    const totalQuestions = section2.length;
    
    // Correct answers for section 2 questions (matching the quiz structure)
    const correctAnswersMap = {
      0: 0, // s2q1: "A small animal"
      1: 1, // s2q2: "4"
      2: 0, // s2q3: "Circle"
      3: 1, // s2q4: "Feeling good"
      4: 1, // s2q5: "3"
      5: 1, // s2q6: "5"
      6: 0, // s2q7: "Something to read"
      7: 2, // s2q8: "4"
      8: 0, // s2q9: "Red"
      9: 0, // s2q10: "Someone you like"
      10: 2, // s2q11: "5"
      11: 0  // s2q12: "A"
    };
    
    section2.forEach((answer, index) => {
      if (answer !== undefined && answer !== null) {
        if (answer === correctAnswersMap[index]) {
          correctAnswers++;
        }
      }
    });

    const accuracy = totalQuestions > 0 ? correctAnswers / totalQuestions : 0;
    
    // Lower accuracy might indicate need for more support
    if (accuracy < 0.5) {
      downSyndromeScore += 1; // May need more structured support
    }

    // Section 3 Analysis (Emotional & Interaction Preferences)
    section3.forEach((answer, index) => {
      const questionId = `s3q${index + 1}`;
      
      // Question 1: Feedback style
      if (questionId === 's3q1') {
        if (answer === 0) autismScore += 1; // Soft and gentle
        if (answer === 2) downSyndromeScore += 1; // Direct and clear
      }
      
      // Question 2: Pace preference
      if (questionId === 's3q2') {
        if (answer === 0 || answer === 1) autismScore += 1; // Very slow or slow
        if (answer === 3) downSyndromeScore += 1; // Fast
      }
      
      // Question 3: Error handling
      if (questionId === 's3q3') {
        if (answer === 0) autismScore += 2; // Big error message (sensitive)
        if (answer === 2) autismScore += 1; // Try again quietly
        if (answer === 1) downSyndromeScore += 1; // Small hint
      }
      
      // Question 4: Celebration style
      if (questionId === 's3q4') {
        if (answer === 0) downSyndromeScore += 1; // Big celebration
        if (answer === 3) autismScore += 1; // No celebration (may be overwhelming)
      }
      
      // Question 5: Challenge tolerance
      if (questionId === 's3q5') {
        if (answer === 0) autismScore += 1; // Easy tasks only
      }
      
      // Question 6: Progress display
      if (questionId === 's3q6') {
        if (answer === 0) autismScore += 1; // Many details (may be overwhelming)
        if (answer === 2) autismScore += 1; // Numbers only (precise)
      }
      
      // Question 7: Reminders vs own pace
      if (questionId === 's3q7') {
        if (answer === 1) autismScore += 1; // Own pace
        if (answer === 0) downSyndromeScore += 1; // Reminders
      }
    });

    // Determine student type based on scores
    let studentType = 'other';
    if (autismScore > downSyndromeScore && autismScore >= 8) {
      studentType = 'autism';
    } else if (downSyndromeScore > autismScore && downSyndromeScore >= 6) {
      studentType = 'downSyndrome';
    }

    // Update student record
    const student = await Student.findByIdAndUpdate(
      studentId,
      {
        type: studentType,
        diagnosticQuizCompleted: true,
        diagnosticQuizResults: {
          section1,
          section2,
          section3,
          autismScore,
          downSyndromeScore,
          accuracy,
          completedAt: new Date()
        }
      },
      { new: true }
    );

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

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
exports.checkDiagnosticQuizStatus = async (req, res) => {
  try {
    const studentId = req.user.sub;
    const student = await Student.findById(studentId).select('diagnosticQuizCompleted type');
    
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    res.json({
      success: true,
      data: {
        completed: student.diagnosticQuizCompleted || false,
        type: student.type || 'other'
      }
    });
  } catch (error) {
    console.error('Check diagnostic quiz status error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

