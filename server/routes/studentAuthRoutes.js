const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const Track = require('../models/Track'); // New tracking model
const Achievement = require('../models/Achievement');
const Course = require('../models/Course');
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

    // Determine valid search criteria
    const identifier = email.trim();
    const isEmail = identifier.includes('@');

    let student;
    if (isEmail) {
      // Find by email
      student = await Student.findOne({ email: identifier.toLowerCase() });
    } else {
      // Find by full name (case-insensitive exact match)
      student = await Student.findOne({
        name: { $regex: new RegExp(`^${identifier}$`, 'i') }
      });
    }

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
        profilePic: student.profilePic,
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
    const student = await Student.findById(req.user.sub).select('type achievements');

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Fetch or create Track record
    let track = await Track.findOne({ student: req.user.sub });

    if (!track) {
      track = await Track.create({
        student: req.user.sub,
        hoursStudied: 0,
        currentStreak: 0,
        longestStreak: 0,
        coursesCompleted: 0,
        coursesInProgress: 0,
        quizzesCompleted: 0,
        quizzesPassed: 0,
        totalQuizScore: 0,
        lessonsCompleted: 0,
        courses: []
      });
    }

    // Calculate total courses from learning path
    const Path = require('../models/Path');
    const studentType = student.type || 'autism';
    const normalizedType = studentType.toLowerCase() === 'down syndrome' ? 'downSyndrome' : studentType.toLowerCase();

    let totalCourses = 7; // Default
    let totalQuizzes = 70; // Default estimate

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
          return sum + (course.topics?.length || 0) * 2;
        }, 0);
      }
    } catch (err) {
      console.log('Error fetching learning path for progress:', err);
    }

    res.json({
      success: true,
      data: {
        hoursStudied: track.hoursStudied,
        currentStreak: track.currentStreak,
        longestStreak: track.longestStreak,
        coursesCompleted: track.coursesCompleted,
        coursesInProgress: track.coursesInProgress,
        totalCourses: totalCourses,
        quizzesCompleted: track.quizzesCompleted,
        quizzesPassed: track.quizzesPassed,
        totalQuizzes: totalQuizzes,
        lessonsCompleted: track.lessonsCompleted,
        courseProgress: track.courses,
        achievements: student.achievements || [],
        lastActivityDate: track.lastActivityDate
      }
    });
  } catch (error) {
    console.error('Get student progress error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/students/complete-course - Mark a course as completed and award achievements
router.post('/complete-course', require('../middleware/auth')(['student']), async (req, res) => {
  try {
    const { courseId } = req.body;
    const studentId = req.user.sub;

    if (!courseId) {
      return res.status(400).json({ error: 'Course ID is required' });
    }

    // 1. Get Course details
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    // 2. Update Track
    let track = await Track.findOne({ student: studentId });
    if (!track) {
      // Create if doesn't exist (safety fallback)
      track = await Track.create({ student: studentId });
    }

    // Check if course is already tracked
    const existingCourseIndex = track.courses.findIndex(c => c.course.toString() === courseId);

    if (existingCourseIndex > -1) {
      // Update existing
      if (track.courses[existingCourseIndex].status !== 'completed') {
        track.courses[existingCourseIndex].status = 'completed';
        track.courses[existingCourseIndex].completedAt = new Date();
        track.courses[existingCourseIndex].progressPercent = 100;
        track.coursesCompleted += 1;
        track.coursesInProgress = Math.max(0, track.coursesInProgress - 1);
      }
    } else {
      // Add new completed course
      track.courses.push({
        course: courseId,
        status: 'completed',
        progressPercent: 100,
        startedAt: new Date(), // Asumed started now?
        completedAt: new Date(),
        lastAccessedAt: new Date()
      });
      track.coursesCompleted += 1;
    }

    await track.save();

    // 3. Award Achievement
    // Find achievement linked to this course
    const achievement = await Achievement.findOne({ courseId: courseId });

    let achievementEarned = false;
    let newAchievement = null;

    if (achievement) {
      const student = await Student.findById(studentId);

      // Check if already earned
      const alreadyEarned = student.achievements.some(a => a.achievement.toString() === achievement._id.toString());

      if (!alreadyEarned) {
        student.achievements.push({
          achievement: achievement._id,
          earnedAt: new Date()
        });
        await student.save();
        achievementEarned = true;
        newAchievement = achievement;

        // Send Notification
        const { createNotification } = require('../controllers/notificationController'); // Helper function?
        // Actually best to use the model or a utility. 
        // For now, let's create it directly
        const Notification = require('../models/Notification');
        await Notification.create({
          recipient: studentId,
          recipientModel: 'Student',
          type: 'system', // or 'achievement' if we add that type
          message: `Congratulations! You've earned the "${achievement.title}" badge!`
        });
      }
    }

    res.json({
      success: true,
      data: {
        courseId,
        status: 'completed',
        achievementEarned,
        achievement: newAchievement
      }
    });

  } catch (error) {
    console.error('Complete course error:', error);
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

// PUT /api/students/profile-picture - Update student profile picture
router.put('/profile-picture', require('../middleware/auth')(['student']), async (req, res) => {
  try {
    const { profilePic } = req.body;

    if (!profilePic) {
      return res.status(400).json({ error: 'Profile picture URL is required' });
    }

    // Validate URL or base64 format
    if (!profilePic.startsWith('http') && !profilePic.startsWith('data:image/')) {
      return res.status(400).json({ error: 'Invalid profile picture format. Must be a URL or base64 data URI' });
    }

    const student = await Student.findByIdAndUpdate(
      req.user.sub,
      { profilePic },
      { new: true }
    ).select('-pass');

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    console.log(`✅ Profile picture updated for student: ${student._id}`);

    res.json({
      success: true,
      data: {
        profilePic: student.profilePic
      }
    });
  } catch (error) {
    console.error('Update profile picture error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/students/change-password - Change student password
router.put('/change-password', require('../middleware/auth')(['student']), async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters' });
    }

    const studentId = req.user.sub;
    const student = await Student.findById(studentId);

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Check if student has a password (not Firebase-only account)
    if (!student.pass) {
      // Student is Firebase-only, set new password
      const hashedNewPassword = await bcrypt.hash(newPassword, 10);
      await Student.findByIdAndUpdate(studentId, { pass: hashedNewPassword });
      return res.json({
        success: true,
        message: 'Password set successfully. You can now use both Firebase and email/password login.'
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, student.pass);
    if (!isCurrentPasswordValid) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Hash and update new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await Student.findByIdAndUpdate(studentId, { pass: hashedNewPassword });

    res.json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Server error while updating password' });
  }
});

// POST /api/students/complete-lesson - Mark a lesson as completed
router.post('/complete-lesson', require('../middleware/auth')(['student']), async (req, res) => {
  try {
    const { courseId, lessonIndex } = req.body;
    const studentId = req.user.sub;

    if (!courseId || lessonIndex === undefined) {
      return res.status(400).json({ error: 'Missing courseId or lessonIndex' });
    }

    // Find Track record
    let track = await Track.findOne({ student: studentId });
    if (!track) {
      // Should exist if progress was fetched, but if not create one
      track = new Track({ student: studentId, courses: [] });
    }

    // Find course progress
    // Note: We need to match course by ID.
    // If courseId passed is an index (from URL), we need to resolve it, but frontend should pass actual ID if available.
    // However, CoursePlayer might pass the Course Object ID if we update it to do so.
    // Let's assume frontend passes correct mongoose ObjectId for courseId OR we handle string if it's not.

    // For now, let's assume courseId is the Mongodb ID.
    let courseProgressIndex = track.courses.findIndex(c => c.course.toString() === courseId);

    if (courseProgressIndex === -1) {
      // Create new course entry
      track.courses.push({
        course: courseId,
        status: 'in_progress',
        completedLessonsCount: 0,
        progressPercent: 0,
        startedAt: new Date()
      });
      courseProgressIndex = track.courses.length - 1;
    }

    const courseProgress = track.courses[courseProgressIndex];

    // Check if we are completing the NEXT lesson (sequential enforcement)
    // or if we are just re-completing.

    // If lessonIndex matches completedLessonsCount, it means we are completing the next unlocked lesson.
    // E.g. completed = 0. We complete lesson index 0. New completed = 1.
    if (lessonIndex === courseProgress.completedLessonsCount) {
      courseProgress.completedLessonsCount += 1;

      // Update progress percent
      // We need total lessons count. If we don't have it, valid defaults?
      // Let's rely on frontend passing it or totalLessons in DB.
      if (req.body.totalLessons) {
        courseProgress.totalLessons = req.body.totalLessons;
      }

      if (courseProgress.totalLessons > 0) {
        courseProgress.progressPercent = Math.round((courseProgress.completedLessonsCount / courseProgress.totalLessons) * 100);
      }

      // Check if course completed
      if (courseProgress.completedLessonsCount >= courseProgress.totalLessons && courseProgress.totalLessons > 0) {
        courseProgress.status = 'completed';
        courseProgress.completedAt = new Date();
        // Could increment global stats here too
        track.coursesCompleted += 1;
        track.coursesInProgress = Math.max(0, track.coursesInProgress - 1);
      }

      courseProgress.lastAccessedAt = new Date();

      await track.save();

      // Award achievements for this course
      // First, get the course title to match achievements
      const Course = require('../models/Course');
      const course = await Course.findById(courseId);

      if (!course) {
        console.log(`⚠️  Course not found for courseId: ${courseId}`);
        return res.json({
          success: true,
          completedLessonsCount: courseProgress.completedLessonsCount,
          progressPercent: courseProgress.progressPercent,
          isCourseCompleted: courseProgress.status === 'completed',
          achievementsEarned: []
        });
      }

      console.log(`🔍 Checking achievements for course: "${course.title}"`);
      // Match achievements by course name (title)
      const achievements = await Achievement.find({ course: course.title });
      console.log(`📊 Found ${achievements.length} achievement(s) for this course`);

      const student = await Student.findById(studentId);
      const newAchievements = [];

      if (achievements.length > 0 && student) {
        console.log(`✅ Student found, processing ${achievements.length} achievement(s)`);
        for (const achievement of achievements) {
          // Check if student already has this achievement
          const alreadyHas = student.achievements.some(
            a => a.achievement.toString() === achievement._id.toString()
          );

          if (!alreadyHas) {
            console.log(`🎯 Awarding achievement: ${achievement.title}`);
            student.achievements.push({
              achievement: achievement._id,
              completedAt: new Date(),
              earnedAt: new Date()
            });
            newAchievements.push({
              id: achievement._id,
              title: achievement.title,
              description: achievement.description,
              badge: achievement.badge
            });

            // Send notification
            const Notification = require('../models/Notification');
            await Notification.create({
              recipient: studentId,
              recipientModel: 'Student',
              type: 'system',
              message: `🎉 Achievement Unlocked: "${achievement.title}"!`
            });
          } else {
            console.log(`⏭️  Student already has achievement: ${achievement.title}`);
          }
        }

        if (newAchievements.length > 0) {
          await student.save();
          console.log(`✅ Awarded ${newAchievements.length} achievement(s) to student ${studentId}`);
        } else {
          console.log(`ℹ️  No new achievements to award (student already has all)`);
        }
      } else {
        if (achievements.length === 0) {
          console.log(`⚠️  No achievements found for course: "${course.title}"`);
        }
        if (!student) {
          console.log(`❌ Student not found: ${studentId}`);
        }
      }

      return res.json({
        success: true,
        completedLessonsCount: courseProgress.completedLessonsCount,
        progressPercent: courseProgress.progressPercent,
        isCourseCompleted: courseProgress.status === 'completed',
        achievementsEarned: newAchievements
      });
    } else if (lessonIndex < courseProgress.completedLessonsCount) {
      // Already completed
      return res.json({ success: true, message: 'Lesson already completed' });
    } else {
      // Trying to skip ahead
      return res.status(403).json({ error: 'Cannot skip lessons. Please complete previous lessons first.' });
    }

  } catch (error) {
    console.error('Complete lesson error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;

