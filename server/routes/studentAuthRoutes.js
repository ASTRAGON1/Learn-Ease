const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const requireDiagnosticQuiz = require('../middleware/requireDiagnosticQuiz');
const router = express.Router();

// GET /api/students/auth/check-email/:email - Check if email exists in both databases
router.get('/auth/check-email/:email', async (req, res) => {
  try {
    const email = req.params.email.toLowerCase().trim();
    
    const studentExists = await Student.findOne({ email });
    const teacherExists = await Teacher.findOne({ email });
    
    res.json({
      exists: !!(studentExists || teacherExists),
      inStudent: !!studentExists,
      inTeacher: !!teacherExists
    });
  } catch (error) {
    console.error('Check email error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/students/auth/register
router.post('/auth/register', async (req, res) => {
  try {
    const { fullName, email, password, username, firebaseUID } = req.body;
    
    if (!fullName || !fullName.trim()) {
      return res.status(400).json({ error: 'fullName is required' });
    }
    if (!email) {
      return res.status(400).json({ error: 'email is required' });
    }
    if (!password) {
      return res.status(400).json({ error: 'password is required' });
    }

    // Check if email already exists in student database
    const studentExists = await Student.findOne({ email: email.toLowerCase().trim() });
    if (studentExists) {
      return res.status(409).json({ error: 'Email already used' });
    }

    // Check if email already exists in teacher database
    const teacherExists = await Teacher.findOne({ email: email.toLowerCase().trim() });
    if (teacherExists) {
      return res.status(409).json({ error: 'Email already used in teacher database' });
    }

    // If firebaseUID is provided, check if it's already linked
    if (firebaseUID) {
      const firebaseExists = await Student.findOne({ firebaseUID });
      if (firebaseExists) {
        return res.status(409).json({ error: 'Firebase account already linked' });
      }
    }

    // Hash password (only if password is provided and not a placeholder)
    let hashedPassword = '';
    if (password && password !== 'google-signup') {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    // Create student
    const studentData = {
      name: fullName.trim(),
      email: email.toLowerCase().trim()
      // type will be assigned after diagnostic test completion
    };

    if (hashedPassword) {
      studentData.pass = hashedPassword;
    }

    if (firebaseUID) {
      studentData.firebaseUID = firebaseUID;
    }

    const doc = await Student.create(studentData);

    // Generate token
    const token = jwt.sign({ sub: doc._id, role: 'student' }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      data: {
        token,
        student: {
          id: doc._id,
          fullName: doc.name,
          name: doc.name,
          email: doc.email
        }
      }
    });
  } catch (error) {
    console.error('Student registration error:', error);
    if (error.code === 11000) {
      return res.status(409).json({ error: 'Email already exists' });
    }
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/students/auth/login
router.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find student by email
    const student = await Student.findOne({ email: email.toLowerCase().trim() });
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, student.pass);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update last activity
    student.lastActivity = new Date();
    await student.save();

    // Generate token
    const token = jwt.sign({ sub: student._id, role: 'student' }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({
      data: {
        token,
        student: {
          id: student._id,
          fullName: student.name,
          name: student.name,
          email: student.email
        }
      }
    });
  } catch (error) {
    console.error('Student login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/students/auth/me - Get current student info (requires diagnostic quiz)
router.get('/auth/me', require('../middleware/auth')(['student']), requireDiagnosticQuiz, async (req, res) => {
  try {
    const student = await Student.findById(req.user.sub).select('-pass');
    
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    
    res.json({
      data: {
        id: student._id,
        name: student.name,
        fullName: student.name,
        email: student.email,
        avatar: student.avatar,
        type: student.type,
        userStatus: student.userStatus,
        assignedPath: student.assignedPath,
        lastActivity: student.lastActivity
      }
    });
  } catch (error) {
    console.error('Get student info error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/students/auth/logout - Update last activity
router.post('/auth/logout', require('../middleware/auth')(['student']), async (req, res) => {
  try {
    await Student.findByIdAndUpdate(req.user.sub, {
      lastActivity: new Date()
    });
    
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    console.error('Student logout error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/students/auth/activity - Update last activity timestamp
router.post('/auth/activity', require('../middleware/auth')(['student']), async (req, res) => {
  try {
    await Student.findByIdAndUpdate(req.user.sub, {
      lastActivity: new Date()
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Student activity update error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/students/progress - Get student learning progress
router.get('/progress', require('../middleware/auth')(['student']), requireDiagnosticQuiz, async (req, res) => {
  try {
    const student = await Student.findById(req.user.sub).select('progress type achievements');
    
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Initialize progress if it doesn't exist
    if (!student.progress) {
      student.progress = {
        hoursStudied: 0,
        currentStreak: 0,
        longestStreak: 0,
        coursesCompleted: 0,
        coursesInProgress: 0,
        quizzesCompleted: 0,
        quizzesPassed: 0,
        lessonsCompleted: 0,
        courseProgress: []
      };
      await student.save();
    }

    // Calculate total courses from learning path
    const Path = require('../models/Path');
    const studentType = student.type || 'autism';
    const normalizedType = studentType.toLowerCase() === 'down syndrome' ? 'downSyndrome' : studentType.toLowerCase();
    
    let totalCourses = 7; // Default
    let totalQuizzes = 70; // Default estimate (10 per course)
    
    try {
      const path = await Path.findOne({
        $or: [
          { id: new RegExp(normalizedType, 'i') },
          { name: new RegExp(normalizedType, 'i') }
        ]
      });
      
      if (path && path.courses) {
        totalCourses = path.courses.length;
        totalQuizzes = path.courses.reduce((sum, course) => {
          return sum + (course.topics?.length || 0) * 2; // Estimate 2 quizzes per topic
        }, 0);
      }
    } catch (err) {
      console.log('Error fetching learning path for progress:', err);
    }

    res.json({
      success: true,
      data: {
        hoursStudied: student.progress.hoursStudied || 0,
        currentStreak: student.progress.currentStreak || 0,
        longestStreak: student.progress.longestStreak || 0,
        coursesCompleted: student.progress.coursesCompleted || 0,
        coursesInProgress: student.progress.coursesInProgress || 0,
        totalCourses: totalCourses,
        quizzesCompleted: student.progress.quizzesCompleted || 0,
        quizzesPassed: student.progress.quizzesPassed || 0,
        totalQuizzes: totalQuizzes,
        lessonsCompleted: student.progress.lessonsCompleted || 0,
        courseProgress: student.progress.courseProgress || [],
        achievements: student.achievements || [],
        lastActivityDate: student.progress.lastActivityDate
      }
    });
  } catch (error) {
    console.error('Get student progress error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/students/achievements - Get student achievements with populated Achievement data
router.get('/achievements', require('../middleware/auth')(['student']), requireDiagnosticQuiz, async (req, res) => {
  try {
    const student = await Student.findById(req.user.sub)
      .select('achievements')
      .populate({
        path: 'achievements.achievement',
        model: 'Achievement'
      });
    
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Transform achievements to match UI expectations
    const transformedAchievements = student.achievements
      .filter(ach => ach.achievement) // Filter out any null achievements
      .map(ach => ({
        id: ach.achievement._id.toString(),
        type: ach.achievement.type,
        title: ach.achievement.title,
        course: ach.achievement.course,
        grade: ach.grade || null,
        badge: ach.achievement.badge,
        completedAt: ach.completedAt ? new Date(ach.completedAt).toISOString().split('T')[0] : null,
        earnedAt: ach.earnedAt ? new Date(ach.earnedAt).toISOString().split('T')[0] : null,
        description: ach.achievement.description,
        category: ach.achievement.category
      }))
      .sort((a, b) => {
        // Sort by earnedAt date (most recent first)
        const dateA = a.earnedAt ? new Date(a.earnedAt) : new Date(0);
        const dateB = b.earnedAt ? new Date(b.earnedAt) : new Date(0);
        return dateB - dateA;
      });

    res.json({
      success: true,
      data: {
        achievements: transformedAchievements,
        total: transformedAchievements.length
      }
    });
  } catch (error) {
    console.error('Get student achievements error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;

