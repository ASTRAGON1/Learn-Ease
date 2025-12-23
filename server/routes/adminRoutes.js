const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const Admin = require('../models/Admin');
const Path = require('../models/Path');
const Course = require('../models/Course');
const Topic = require('../models/Topic');
const Lesson = require('../models/Lesson');
const { deleteFirebaseUser } = require('../config/firebase');
const achievementController = require('../controllers/achievementController');

/**
 * @route   POST /api/admin/login
 * @desc    Admin login - checks credentials against Admin collection
 * @access  Public
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }

    // Find admin by email
    const admin = await Admin.findOne({ email: email.toLowerCase().trim() });

    if (!admin) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Check password (plain text comparison - in production, use bcrypt)
    if (admin.password !== password) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Login successful
    res.json({
      success: true,
      message: 'Login successful',
      adminName: 'Admin',
      token: 'admin_token_' + Date.now() // Simple token for demo
    });
  } catch (error) {
    console.error('Error during admin login:', error);
    res.status(500).json({
      success: false,
      error: 'Server error during login'
    });
  }
});

/**
 * @route   GET /api/admin/users
 * @desc    Get all users (students and teachers combined)
 * @access  Admin
 */
router.get('/users', async (req, res) => {
  try {
    // Fetch all students
    const students = await Student.find({}).select('name email type status suspended createdAt profilePic lastActivity');

    // Fetch all teachers
    const teachers = await Teacher.find({}).select('fullName email userStatus ranking profilePic headline bio createdAt isOnline lastActivity');

    // Auto-mark users as offline if inactive for more than 30 minutes
    const INACTIVITY_THRESHOLD = 30 * 60 * 1000; // 30 minutes in milliseconds
    const now = new Date();

    // Transform students to unified format
    const studentUsers = students.map(student => {
      // Students don't have isOnline field, so set online to false
      return {
        id: student._id.toString(),
        name: student.name,
        email: student.email,
        role: 'student',
        status: student.userStatus || 'active',
        online: false, // Students don't have isOnline field
        category: student.type === 'autism' ? 'Autism' : student.type === 'downSyndrome' ? 'Down Syndrome' : 'Not Assigned',
        avatar: student.profilePic,
        createdAt: student.createdAt,
        lastActivity: student.lastActivity
      };
    });

    // Transform teachers to unified format
    const teacherUsers = teachers.map(teacher => {
      const isActive = teacher.isOnline && teacher.lastActivity &&
        (now - new Date(teacher.lastActivity)) < INACTIVITY_THRESHOLD;

      // Auto-update if marked online but inactive
      if (teacher.isOnline && !isActive) {
        Teacher.findByIdAndUpdate(teacher._id, { isOnline: false }).catch(err =>
          console.error('Error auto-updating teacher online status:', err)
        );
      }

      return {
        id: teacher._id.toString(),
        name: teacher.fullName,
        email: teacher.email,
        role: 'instructor',
        status: teacher.userStatus === 'suspended' ? 'suspended' : teacher.userStatus === 'pending' ? 'pending' : 'active',
        online: isActive,
        category: 'N/A',
        avatar: teacher.profilePic,
        headline: teacher.headline,
        bio: teacher.bio,
        description: teacher.bio, // Alias for backward compatibility
        ranking: teacher.ranking || 0,
        createdAt: teacher.createdAt,
        joinedAt: teacher.createdAt,
        lastActivity: teacher.lastActivity
      };
    });

    // Combine both arrays
    const allUsers = [...studentUsers, ...teacherUsers];

    // Sort by creation date (newest first)
    allUsers.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({
      success: true,
      count: allUsers.length,
      data: allUsers
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   GET /api/admin/student-profiles
 * @desc    Get student performance profiles with real stats
 * @access  Admin
 */
router.get('/student-profiles', async (req, res) => {
  try {
    const Track = require('../models/Track');
    const Quiz = require('../models/Quiz');
    const QuizResult = require('../models/QuizResult');

    // Fetch all students
    const students = await Student.find({}).select('_id name type');

    const studentProfiles = await Promise.all(
      students.map(async (student) => {
        try {
          // Get Track data for this student
          const track = await Track.findOne({ student: student._id });

          // Calculate minutes studied (convert hours to minutes)
          const minutesStudied = track ? Math.round((track.hoursStudied || 0) * 60) : 0;

          // Get student's path type
          const studentType = student.type || 'autism';
          const normalizedType = studentType.toLowerCase() === 'down syndrome' ? 'downSyndrome' : studentType.toLowerCase();

          // Find the learning path
          const path = await Path.findOne({
            $or: [
              { type: normalizedType },
              { title: new RegExp(normalizedType, 'i') }
            ]
          });

          let avgScore = 0;
          let completionRate = 0;

          if (path && path.courses) {
            // Get all published quizzes for this path
            const pathQuizzes = await Quiz.find({
              status: 'published',
              course: { $in: path.courses }
            }).select('_id');

            const pathQuizIds = pathQuizzes.map(q => q._id);

            // Get all quiz results for this student in this path
            const quizResults = await QuizResult.find({
              student: student._id,
              quiz: { $in: pathQuizIds },
              status: 'completed'
            }).select('grade');

            // Calculate average score
            if (quizResults.length > 0) {
              const totalScore = quizResults.reduce((sum, result) => sum + (result.grade || 0), 0);
              avgScore = Math.round(totalScore / quizResults.length);
            }


            // Calculate completion rate (completed courses / total courses in path)
            const totalCourses = path.courses.length;
            const completedCourses = track ? (track.coursesCompleted || 0) : 0;
            completionRate = totalCourses > 0 ? Math.round((completedCourses / totalCourses) * 100) : 0;
          }

          return {
            userId: student._id.toString(),
            hours: minutesStudied, // Now in minutes
            performance: {
              avgScore: avgScore,
              completionRate: completionRate
            }
          };
        } catch (err) {
          console.error(`Error calculating stats for student ${student._id}:`, err);
          return {
            userId: student._id.toString(),
            hours: 0,
            performance: { avgScore: 0, completionRate: 0 }
          };
        }
      })
    );

    res.json({
      success: true,
      data: studentProfiles
    });
  } catch (error) {
    console.error('Error fetching student profiles:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   GET /api/admin/instructor-profiles
 * @desc    Get instructor profiles with real latest upload data
 * @access  Admin
 */
router.get('/instructor-profiles', async (req, res) => {
  try {
    const Content = require('../models/Content');

    // Fetch all teachers
    const teachers = await Teacher.find({}).select('_id fullName');

    const instructorProfiles = await Promise.all(
      teachers.map(async (teacher) => {
        try {
          // Get the latest content uploaded by this teacher
          const latestContent = await Content.findOne({
            teacher: teacher._id,
            status: { $ne: 'deleted' }
          })
            .sort({ createdAt: -1 })
            .select('title')
            .limit(1);

          return {
            userId: teacher._id.toString(),
            latestUpload: latestContent ? latestContent.title : null
          };
        } catch (err) {
          console.error(`Error fetching content for teacher ${teacher._id}:`, err);
          return {
            userId: teacher._id.toString(),
            latestUpload: null
          };
        }
      })
    );

    res.json({
      success: true,
      data: instructorProfiles
    });
  } catch (error) {
    console.error('Error fetching instructor profiles:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   PATCH /api/admin/users/:id/suspend
 * @desc    Suspend a user (student or teacher)
 * @access  Admin
 */
router.patch('/users/:id/suspend', async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body; // 'student' or 'instructor'

    if (!role) {
      return res.status(400).json({
        success: false,
        error: 'Role is required'
      });
    }

    if (role === 'student') {
      const student = await Student.findById(id);

      if (!student) {
        return res.status(404).json({
          success: false,
          error: 'Student not found'
        });
      }



      // Don't allow suspending pending students
      if (student.status === 'pending') {
        return res.status(400).json({
          success: false,
          error: 'Cannot suspend a pending student. Please accept or decline their application first.'
        });
      }

      // Update to suspended
      student.suspended = true;
      student.status = 'inactive';
      await student.save();

      // Notify student
      const { createNotification } = require('../controllers/notificationController');
      await createNotification({
        recipient: student._id,
        recipientModel: 'Student',
        message: 'Your account has been suspended. Please contact support.',
        type: 'suspended'
      });

      return res.json({
        success: true,
        data: { id, role: 'student', status: 'suspended' }
      });
    } else if (role === 'instructor') {
      const teacher = await Teacher.findById(id);

      if (!teacher) {
        return res.status(404).json({
          success: false,
          error: 'Teacher not found'
        });
      }



      // Don't allow suspending pending teachers
      if (teacher.userStatus === 'pending') {
        return res.status(400).json({
          success: false,
          error: 'Cannot suspend a pending instructor. Please accept or decline their application first.'
        });
      }

      // Update to suspended
      teacher.userStatus = 'suspended';
      await teacher.save();

      // Notify teacher
      const { createNotification } = require('../controllers/notificationController');
      await createNotification({
        recipient: teacher._id,
        recipientModel: 'Teacher',
        message: 'Your account has been suspended. Please contact support.',
        type: 'suspended'
      });

      return res.json({
        success: true,
        data: { id, role: 'instructor', status: 'suspended' }
      });
    }

    return res.status(400).json({
      success: false,
      error: 'Invalid role'
    });
  } catch (error) {
    console.error('Error suspending user:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   PATCH /api/admin/users/:id/reinstate
 * @desc    Reinstate a suspended user
 * @access  Admin
 */
router.patch('/users/:id/reinstate', async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!role) {
      return res.status(400).json({
        success: false,
        error: 'Role is required'
      });
    }

    if (role === 'student') {
      const student = await Student.findByIdAndUpdate(
        id,
        { suspended: false, status: 'active' },
        { new: true }
      );

      if (!student) {
        return res.status(404).json({
          success: false,
          error: 'Student not found'
        });
      }

      // Notify student
      const { createNotification } = require('../controllers/notificationController');
      await createNotification({
        recipient: student._id,
        recipientModel: 'Student',
        message: 'Your account has been reinstated. Welcome back!',
        type: 'system'
      });

      return res.json({
        success: true,
        data: { id, role: 'student', status: 'active' }
      });
    } else if (role === 'instructor') {
      const teacher = await Teacher.findByIdAndUpdate(
        id,
        { userStatus: 'active' },
        { new: true }
      );

      if (!teacher) {
        return res.status(404).json({
          success: false,
          error: 'Teacher not found'
        });
      }

      // Notify teacher
      const { createNotification } = require('../controllers/notificationController');
      await createNotification({
        recipient: teacher._id,
        recipientModel: 'Teacher',
        message: 'Your account has been reinstated. Welcome back!',
        type: 'system'
      });

      return res.json({
        success: true,
        data: { id, role: 'instructor', status: 'active' }
      });
    }

    return res.status(400).json({
      success: false,
      error: 'Invalid role'
    });
  } catch (error) {
    console.error('Error reinstating user:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   DELETE /api/admin/users/:id
 * @desc    Delete a user from both Firebase and MongoDB
 * @access  Admin
 */
router.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!role) {
      return res.status(400).json({
        success: false,
        error: 'Role is required'
      });
    }

    if (role === 'student') {
      // First, get the student to check for Firebase UID
      const student = await Student.findById(id);

      if (!student) {
        return res.status(404).json({
          success: false,
          error: 'Student not found'
        });
      }

      // Delete from Firebase if they have a Firebase UID
      if (student.firebaseUID) {
        console.log(`Attempting to delete Firebase student: ${student.firebaseUID}`);
        await deleteFirebaseUser(student.firebaseUID);
      }

      // Delete from MongoDB
      await Student.findByIdAndDelete(id);

      return res.json({
        success: true,
        message: 'Student deleted successfully from both Firebase and MongoDB'
      });
    } else if (role === 'instructor') {
      // First, get the teacher to check for Firebase UID
      const teacher = await Teacher.findById(id);

      if (!teacher) {
        return res.status(404).json({
          success: false,
          error: 'Teacher not found'
        });
      }

      // Delete from Firebase if they have a Firebase UID
      if (teacher.firebaseUID) {
        console.log(`Attempting to delete Firebase teacher: ${teacher.firebaseUID}`);
        await deleteFirebaseUser(teacher.firebaseUID);
      }

      // Delete from MongoDB
      await Teacher.findByIdAndDelete(id);

      return res.json({
        success: true,
        message: 'Teacher deleted successfully from both Firebase and MongoDB'
      });
    }

    return res.status(400).json({
      success: false,
      error: 'Invalid role'
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   POST /api/admin/users/cleanup-inactive
 * @desc    Mark inactive users as offline (called periodically)
 * @access  Admin
 */
router.post('/users/cleanup-inactive', async (req, res) => {
  try {
    const INACTIVITY_THRESHOLD = 30 * 60 * 1000; // 30 minutes
    const cutoffTime = new Date(Date.now() - INACTIVITY_THRESHOLD);

    // Update teachers
    const teachersResult = await Teacher.updateMany(
      {
        isOnline: true,
        lastActivity: { $lt: cutoffTime }
      },
      { isOnline: false }
    );

    res.json({
      success: true,
      message: 'Inactive users marked as offline',
      studentsUpdated: studentsResult.modifiedCount,
      teachersUpdated: teachersResult.modifiedCount
    });
  } catch (error) {
    console.error('Error cleaning up inactive users:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   GET /api/admin/teacher/:email/content
 * @desc    Get all content for a specific teacher by email (Admin only)
 * @access  Admin
 */
router.get('/teacher/:email/content', async (req, res) => {
  try {
    const { email } = req.params;

    // First, find the teacher to get their ID
    const teacher = await Teacher.findOne({ email });
    if (!teacher) {
      return res.status(404).json({
        success: false,
        error: 'Teacher not found'
      });
    }

    // Fetch content for this teacher
    const Content = require('../models/Content');
    const content = await Content.find({
      teacher: teacher._id,
      status: { $ne: 'deleted' } // Exclude deleted content
    })
      .select('title pathType contentType topic lesson course description difficulty status createdAt views likes')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: content
    });
  } catch (error) {
    console.error('Error fetching teacher content:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   GET /api/admin/teacher/:email/quizzes
 * @desc    Get all quizzes for a specific teacher by email (Admin only)
 * @access  Admin
 */
router.get('/teacher/:email/quizzes', async (req, res) => {
  try {
    const { email } = req.params;

    // First, find the teacher to get their ID
    const teacher = await Teacher.findOne({ email });
    if (!teacher) {
      return res.status(404).json({
        success: false,
        error: 'Teacher not found'
      });
    }

    // Fetch quizzes for this teacher
    const Quiz = require('../models/Quiz');
    const quizzes = await Quiz.find({
      teacher: teacher._id
    })
      .select('title pathType topic lesson course difficulty status createdAt questionsAndAnswers views likes')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: quizzes
    });
  } catch (error) {
    console.error('Error fetching teacher quizzes:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   GET /api/admin/teacher/:email/quiz-results
 * @desc    Get all quiz results for an instructor's quizzes
 * @access  Admin
 */
router.get('/teacher/:email/quiz-results', async (req, res) => {
  try {
    const { email } = req.params;

    const teacher = await Teacher.findOne({ email });
    if (!teacher) {
      return res.status(404).json({ success: false, error: 'Teacher not found' });
    }

    const Quiz = require('../models/Quiz');
    const quizzes = await Quiz.find({ teacher: teacher._id }).select('_id');
    const quizIds = quizzes.map(q => q._id);

    const QuizResult = require('../models/QuizResult');
    const results = await QuizResult.find({ quiz: { $in: quizIds } })
      .populate('student', 'fullName profilePic')
      .sort({ updatedAt: -1 })
      .limit(50);

    const formattedResults = results.map(result => ({
      student: result.student?.fullName || 'Student',
      profilePic: result.student?.profilePic || '',
      date: new Date(result.updatedAt).toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric'
      }),
      grade: result.status === 'completed' && result.grade != null ? `${Math.round(result.grade)}%` : '--%',
      status: result.status === 'completed' ? 'Complete' : 'Paused'
    }));

    res.json({ success: true, data: formattedResults });
  } catch (error) {
    console.error('Error fetching quiz results:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route   GET /api/admin/teacher/:email/weekly-metrics
 * @desc    Get daily metrics for the current week (Mon-Sun) for a teacher
 * @access  Admin
 */
router.get('/teacher/:email/weekly-metrics', async (req, res) => {
  try {
    const { email } = req.params;

    // Find the teacher
    const teacher = await Teacher.findOne({ email });
    if (!teacher) {
      return res.status(404).json({ success: false, error: 'Teacher not found' });
    }

    // Initialize weekly data structure
    const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const weeklyData = daysOfWeek.map(day => ({ day, views: 0, likes: 0 }));

    // Fetch content and quizzes for this teacher
    const Content = require('../models/Content');
    const Quiz = require('../models/Quiz');

    // Get all content and quizzes with their views/likes (ALL TIME)
    const content = await Content.find({
      teacher: teacher._id,
      status: { $ne: 'deleted' }
    }).select('views likes lastViewedAt lastLikedAt createdAt updatedAt');

    const quizzes = await Quiz.find({
      teacher: teacher._id,
    }).select('views likes lastViewedAt lastLikedAt createdAt updatedAt');

    console.log(`[Weekly Metrics] Found ${content.length} content items and ${quizzes.length} quizzes`);

    // Debug: Log first content item to see actual data
    if (content.length > 0) {
      console.log('[Weekly Metrics] Sample content item:', JSON.stringify(content[0], null, 2));
    }
    if (quizzes.length > 0) {
      console.log('[Weekly Metrics] Sample quiz item:', JSON.stringify(quizzes[0], null, 2));
    }

    const allItems = [...content, ...quizzes];

    let totalViews = 0;
    let totalLikes = 0;
    let viewsDistributed = 0;
    let likesDistributed = 0;

    // First pass: distribute items with timestamps
    allItems.forEach(item => {
      totalViews += item.views || 0;
      totalLikes += item.likes || 0;

      // Use lastViewedAt if available, otherwise use updatedAt as fallback
      const viewTimestamp = item.lastViewedAt || item.updatedAt || item.createdAt;
      if (viewTimestamp && item.views > 0) {
        const viewDay = new Date(viewTimestamp).getDay();
        const dayIndex = viewDay === 0 ? 6 : viewDay - 1;
        weeklyData[dayIndex].views += item.views;
        viewsDistributed += item.views;
      }

      // Use lastLikedAt if available, otherwise use updatedAt as fallback
      const likeTimestamp = item.lastLikedAt || item.updatedAt || item.createdAt;
      if (likeTimestamp && item.likes > 0) {
        const likeDay = new Date(likeTimestamp).getDay();
        const dayIndex = likeDay === 0 ? 6 : likeDay - 1;
        weeklyData[dayIndex].likes += item.likes;
        likesDistributed += item.likes;
      }
    });

    // Second pass: distribute remaining views/likes evenly if they weren't attributed to any day
    const remainingViews = totalViews - viewsDistributed;
    const remainingLikes = totalLikes - likesDistributed;

    if (remainingViews > 0) {
      // Distribute evenly across the week
      const viewsPerDay = Math.floor(remainingViews / 7);
      const extraViews = remainingViews % 7;

      weeklyData.forEach((day, index) => {
        day.views += viewsPerDay;
        if (index < extraViews) day.views += 1; // Distribute remainder
      });
    }

    if (remainingLikes > 0) {
      // Distribute evenly across the week
      const likesPerDay = Math.floor(remainingLikes / 7);
      const extraLikes = remainingLikes % 7;

      weeklyData.forEach((day, index) => {
        day.likes += likesPerDay;
        if (index < extraLikes) day.likes += 1; // Distribute remainder
      });
    }

    console.log(`[Weekly Metrics] Total views: ${totalViews}, Total likes: ${totalLikes}`);
    console.log(`[Weekly Metrics] Distributed: ${viewsDistributed} views, ${likesDistributed} likes`);
    console.log(`[Weekly Metrics] Remaining (distributed evenly): ${remainingViews} views, ${remainingLikes} likes`);
    console.log(`[Weekly Metrics] Final weekly data:`, weeklyData);

    res.json({ success: true, data: weeklyData });
  } catch (error) {
    console.error('Error fetching weekly metrics:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});


/**
 * @route   GET /api/admin/teacher/:email/deleted-content
 * @desc    Get all deleted content for a specific teacher by email (Admin only)
 * @access  Admin
 */
router.get('/teacher/:email/deleted-content', async (req, res) => {
  try {
    const { email } = req.params;

    // First, find the teacher to get their ID
    const teacher = await Teacher.findOne({ email });
    if (!teacher) {
      return res.status(404).json({
        success: false,
        error: 'Teacher not found'
      });
    }

    // Fetch deleted content for this teacher
    const Content = require('../models/Content');
    const deletedContent = await Content.find({
      teacher: teacher._id,
      status: 'deleted'
    })
      .select('title pathType contentType topic lesson course description difficulty status previousStatus deletedAt createdAt')
      .sort({ deletedAt: -1 });

    res.json({
      success: true,
      data: deletedContent
    });
  } catch (error) {
    console.error('Error fetching deleted teacher content:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   GET /api/admin/teacher/:email/deleted-quizzes
 * @desc    Get all archived/deleted quizzes for a specific teacher by email (Admin only)
 * @access  Admin
 */
router.get('/teacher/:email/deleted-quizzes', async (req, res) => {
  try {
    const { email } = req.params;

    // First, find the teacher to get their ID
    const teacher = await Teacher.findOne({ email });
    if (!teacher) {
      return res.status(404).json({
        success: false,
        error: 'Teacher not found'
      });
    }

    // Fetch archived quizzes for this teacher
    const Quiz = require('../models/Quiz');
    const deletedQuizzes = await Quiz.find({
      teacher: teacher._id,
      status: 'archived'
    })
      .select('title pathType topic lesson course difficulty status previousStatus createdAt updatedAt')
      .sort({ updatedAt: -1 });

    res.json({
      success: true,
      data: deletedQuizzes
    });
  } catch (error) {
    console.error('Error fetching deleted teacher quizzes:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ==================== LEARNING PATHS API ====================

/**
 * @route   GET /api/admin/learning-paths
 * @desc    Get all learning paths with nested courses, topics, and lessons
 * @access  Admin
 */
router.get('/learning-paths', async (req, res) => {
  try {
    const paths = await Path.find({ isPublished: true }).sort({ createdAt: 1 });

    const pathsWithData = await Promise.all(
      paths.map(async (path) => {
        const courses = await Course.find({ pathId: path._id }).sort({ order: 1 });

        const coursesWithData = await Promise.all(
          courses.map(async (course) => {
            const topics = await Topic.find({ courseId: course._id, pathId: path._id }).sort({ order: 1 });

            const topicsWithData = await Promise.all(
              topics.map(async (topic) => {
                const lessons = await Lesson.find({
                  topicId: topic._id,
                  courseId: course._id,
                  pathId: path._id
                }).sort({ order: 1 });

                return {
                  id: topic._id,
                  name: topic.title,
                  lessons: lessons.map(l => ({
                    id: l._id,
                    name: l.title
                  }))
                };
              })
            );

            return {
              id: course._id,
              name: course.title,
              topics: topicsWithData
            };
          })
        );

        return {
          id: path._id,
          name: path.title,
          type: path.type,
          courses: coursesWithData
        };
      })
    );

    res.json({
      success: true,
      data: pathsWithData
    });
  } catch (error) {
    console.error('Error fetching learning paths:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   POST /api/admin/learning-paths
 * @desc    Create a new learning path
 * @access  Admin
 */
router.post('/learning-paths', async (req, res) => {
  try {
    const { name, type } = req.body;

    if (!name || !type) {
      return res.status(400).json({
        success: false,
        error: 'Name and type are required'
      });
    }

    if (!['autism', 'downSyndrome'].includes(type)) {
      return res.status(400).json({
        success: false,
        error: 'Type must be either "autism" or "downSyndrome"'
      });
    }

    const path = new Path({
      type,
      title: name,
      courses: [],
      isPublished: true
    });

    await path.save();

    res.json({
      success: true,
      data: {
        id: path._id,
        name: path.title,
        courses: []
      }
    });
  } catch (error) {
    console.error('Error creating learning path:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   POST /api/admin/learning-paths/:pathId/courses
 * @desc    Create a new course in a path
 * @access  Admin
 */
router.post('/learning-paths/:pathId/courses', async (req, res) => {
  try {
    const { pathId } = req.params;
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'Course name is required'
      });
    }

    const path = await Path.findById(pathId);
    if (!path) {
      return res.status(404).json({
        success: false,
        error: 'Path not found'
      });
    }

    const course = new Course({
      title: name,
      pathId: pathId,
      topics: [],
      order: path.courses.length
    });

    await course.save();

    path.courses.push(course._id);
    await path.save();

    res.json({
      success: true,
      data: {
        id: course._id,
        name: course.title,
        topics: []
      }
    });
  } catch (error) {
    console.error('Error creating course:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   POST /api/admin/learning-paths/:pathId/courses/:courseId/topics
 * @desc    Create a new topic in a course
 * @access  Admin
 */
router.post('/learning-paths/:pathId/courses/:courseId/topics', async (req, res) => {
  try {
    const { pathId, courseId } = req.params;
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'Topic name is required'
      });
    }

    const course = await Course.findById(courseId);
    if (!course || course.pathId.toString() !== pathId) {
      return res.status(404).json({
        success: false,
        error: 'Course not found'
      });
    }

    const topic = new Topic({
      title: name,
      courseId: courseId,
      pathId: pathId,
      lessons: [],
      order: course.topics.length
    });

    await topic.save();

    course.topics.push(topic._id);
    await course.save();

    res.json({
      success: true,
      data: {
        id: topic._id,
        name: topic.title,
        lessons: []
      }
    });
  } catch (error) {
    console.error('Error creating topic:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   POST /api/admin/learning-paths/:pathId/courses/:courseId/topics/:topicId/lessons
 * @desc    Create a new lesson in a topic
 * @access  Admin
 */
router.post('/learning-paths/:pathId/courses/:courseId/topics/:topicId/lessons', async (req, res) => {
  try {
    const { pathId, courseId, topicId } = req.params;
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'Lesson name is required'
      });
    }

    const topic = await Topic.findById(topicId);
    if (!topic || topic.courseId.toString() !== courseId || topic.pathId.toString() !== pathId) {
      return res.status(404).json({
        success: false,
        error: 'Topic not found'
      });
    }

    const lesson = new Lesson({
      title: name,
      topicId: topicId,
      courseId: courseId,
      pathId: pathId,
      order: topic.lessons.length
    });

    await lesson.save();

    topic.lessons.push(lesson._id);
    await topic.save();

    res.json({
      success: true,
      data: {
        id: lesson._id,
        name: lesson.title
      }
    });
  } catch (error) {
    console.error('Error creating lesson:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   PUT /api/admin/learning-paths/:pathId/courses/:courseId
 * @desc    Rename a course
 * @access  Admin
 */
router.put('/learning-paths/:pathId/courses/:courseId', async (req, res) => {
  try {
    const { pathId, courseId } = req.params;
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'Course name is required'
      });
    }

    const course = await Course.findByIdAndUpdate(
      courseId,
      { title: name },
      { new: true }
    );

    if (!course || course.pathId !== pathId) {
      return res.status(404).json({
        success: false,
        error: 'Course not found'
      });
    }

    res.json({
      success: true,
      data: { id: course._id, name: course.title }
    });
  } catch (error) {
    console.error('Error renaming course:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   PUT /api/admin/learning-paths/:pathId/courses/:courseId/topics/:topicId
 * @desc    Rename a topic
 * @access  Admin
 */
router.put('/learning-paths/:pathId/courses/:courseId/topics/:topicId', async (req, res) => {
  try {
    const { pathId, courseId, topicId } = req.params;
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'Topic name is required'
      });
    }

    const topic = await Topic.findByIdAndUpdate(
      topicId,
      { title: name },
      { new: true }
    );

    if (!topic || topic.courseId !== courseId || topic.pathId !== pathId) {
      return res.status(404).json({
        success: false,
        error: 'Topic not found'
      });
    }

    res.json({
      success: true,
      data: { id: topic._id, name: topic.title }
    });
  } catch (error) {
    console.error('Error renaming topic:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   PUT /api/admin/learning-paths/:pathId/courses/:courseId/topics/:topicId/lessons/:lessonId
 * @desc    Rename a lesson
 * @access  Admin
 */
router.put('/learning-paths/:pathId/courses/:courseId/topics/:topicId/lessons/:lessonId', async (req, res) => {
  try {
    const { pathId, courseId, topicId, lessonId } = req.params;
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'Lesson name is required'
      });
    }

    const lesson = await Lesson.findByIdAndUpdate(
      lessonId,
      { title: name },
      { new: true }
    );

    if (!lesson || lesson.topicId !== topicId || lesson.courseId !== courseId || lesson.pathId !== pathId) {
      return res.status(404).json({
        success: false,
        error: 'Lesson not found'
      });
    }

    res.json({
      success: true,
      data: { id: lesson._id, name: lesson.title }
    });
  } catch (error) {
    console.error('Error renaming lesson:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   POST /api/admin/learning-paths/bulk-import
 * @desc    Bulk import learning paths, courses, topics, and lessons from JSON
 * @access  Admin
 */
router.post('/learning-paths/bulk-import', async (req, res) => {
  try {
    const { data } = req.body;

    if (!data || !Array.isArray(data)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid data format. Expected an array of paths.'
      });
    }

    let totalPaths = 0;
    let totalCourses = 0;
    let totalTopics = 0;
    let totalLessons = 0;
    const errors = [];

    // Process each path in the data
    for (const pathData of data) {
      try {
        // Determine path type
        let pathType = 'autism';
        if (pathData.GeneralPath) {
          const generalPath = pathData.GeneralPath.toLowerCase();
          if (generalPath.includes('down')) {
            pathType = 'downSyndrome';
          } else if (generalPath.includes('autism')) {
            pathType = 'autism';
          }
        }

        // Create Path
        const path = new Path({
          type: pathType,
          title: pathData.pathTitle || pathData.name || `Path ${totalPaths + 1}`,
          courses: [],
          isPublished: true
        });

        await path.save();
        totalPaths++;

        // Process each course
        const courses = pathData.Courses || pathData.courses || [];
        for (let courseIndex = 0; courseIndex < courses.length; courseIndex++) {
          try {
            const courseData = courses[courseIndex];

            // Create Course
            const course = new Course({
              title: courseData.CoursesTitle || courseData.name || courseData.title || `Course ${courseIndex + 1}`,
              pathId: path._id,
              topics: [],
              order: courseIndex + 1,
              isPublished: true
            });

            await course.save();
            totalCourses++;
            path.courses.push(course._id);

            // Process each topic
            const topics = courseData.Topics || courseData.topics || [];
            for (let topicIndex = 0; topicIndex < topics.length; topicIndex++) {
              try {
                const topicData = topics[topicIndex];

                // Create Topic
                const topic = new Topic({
                  title: topicData.TopicsTitle || topicData.name || topicData.title || `Topic ${topicIndex + 1}`,
                  courseId: course._id,
                  pathId: path._id,
                  lessons: [],
                  order: topicIndex + 1
                });

                await topic.save();
                totalTopics++;
                course.topics.push(topic._id);

                // Process each lesson
                const lessons = topicData.lessons || topicData.lessons || [];
                for (let lessonIndex = 0; lessonIndex < lessons.length; lessonIndex++) {
                  try {
                    const lessonName = typeof lessons[lessonIndex] === 'string'
                      ? lessons[lessonIndex]
                      : (lessons[lessonIndex].name || lessons[lessonIndex].title || `Lesson ${lessonIndex + 1}`);

                    // Create Lesson
                    const lesson = new Lesson({
                      title: lessonName,
                      topicId: topic._id,
                      courseId: course._id,
                      pathId: path._id,
                      order: lessonIndex + 1
                    });

                    await lesson.save();
                    totalLessons++;
                    topic.lessons.push(lesson._id);
                  } catch (lessonError) {
                    errors.push(`Error creating lesson ${lessonIndex + 1} in topic "${topic.title}": ${lessonError.message}`);
                  }
                }

                await topic.save();
              } catch (topicError) {
                errors.push(`Error creating topic ${topicIndex + 1} in course "${course.title}": ${topicError.message}`);
              }
            }

            await course.save();
          } catch (courseError) {
            errors.push(`Error creating course ${courseIndex + 1} in path "${path.title}": ${courseError.message}`);
          }
        }

        await path.save();
      } catch (pathError) {
        errors.push(`Error creating path "${pathData.pathTitle || pathData.name}": ${pathError.message}`);
      }
    }

    res.json({
      success: true,
      message: 'Bulk import completed',
      summary: {
        paths: totalPaths,
        courses: totalCourses,
        topics: totalTopics,
        lessons: totalLessons
      },
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    console.error('Error during bulk import:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   DELETE /api/admin/learning-paths/:pathId
 * @desc    Delete a learning path and all its content
 * @access  Admin
 */
router.delete('/learning-paths/:pathId', async (req, res) => {
  try {
    const { pathId } = req.params;

    const path = await Path.findById(pathId);
    if (!path) {
      return res.status(404).json({
        success: false,
        error: 'Path not found'
      });
    }

    // Delete all courses and their nested content
    const courses = await Course.find({ pathId });
    for (const course of courses) {
      const topics = await Topic.find({ courseId: course._id });
      for (const topic of topics) {
        await Lesson.deleteMany({ topicId: topic._id });
        await Topic.findByIdAndDelete(topic._id);
      }
      await Course.findByIdAndDelete(course._id);
    }

    await Path.findByIdAndDelete(pathId);

    res.json({
      success: true,
      message: 'Path and all its content deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting path:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   DELETE /api/admin/learning-paths/:pathId/courses/:courseId
 * @desc    Delete a course and all its topics and lessons
 * @access  Admin
 */
router.delete('/learning-paths/:pathId/courses/:courseId', async (req, res) => {
  try {
    const { pathId, courseId } = req.params;

    const course = await Course.findById(courseId);
    if (!course || course.pathId !== pathId) {
      return res.status(404).json({
        success: false,
        error: 'Course not found'
      });
    }

    // Delete all topics and their lessons
    const topics = await Topic.find({ courseId });
    for (const topic of topics) {
      await Lesson.deleteMany({ topicId: topic._id });
      await Topic.findByIdAndDelete(topic._id);
    }

    // Remove course from path
    const path = await Path.findById(pathId);
    if (path) {
      path.courses = path.courses.filter(id => id !== courseId);
      await path.save();
    }

    await Course.findByIdAndDelete(courseId);

    res.json({
      success: true,
      message: 'Course and all its content deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting course:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   DELETE /api/admin/learning-paths/:pathId/courses/:courseId/topics/:topicId
 * @desc    Delete a topic and all its lessons
 * @access  Admin
 */
router.delete('/learning-paths/:pathId/courses/:courseId/topics/:topicId', async (req, res) => {
  try {
    const { pathId, courseId, topicId } = req.params;

    const topic = await Topic.findById(topicId);
    if (!topic || topic.courseId !== courseId || topic.pathId !== pathId) {
      return res.status(404).json({
        success: false,
        error: 'Topic not found'
      });
    }

    // Delete all lessons
    await Lesson.deleteMany({ topicId });

    // Remove topic from course
    const course = await Course.findById(courseId);
    if (course) {
      course.topics = course.topics.filter(id => id !== topicId);
      await course.save();
    }

    await Topic.findByIdAndDelete(topicId);

    res.json({
      success: true,
      message: 'Topic and all its lessons deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting topic:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   DELETE /api/admin/learning-paths/:pathId/courses/:courseId/topics/:topicId/lessons/:lessonId
 * @desc    Delete a lesson
 * @access  Admin
 */
router.delete('/learning-paths/:pathId/courses/:courseId/topics/:topicId/lessons/:lessonId', async (req, res) => {
  try {
    const { pathId, courseId, topicId, lessonId } = req.params;

    const lesson = await Lesson.findById(lessonId);
    if (!lesson || lesson.topicId !== topicId || lesson.courseId !== courseId || lesson.pathId !== pathId) {
      return res.status(404).json({
        success: false,
        error: 'Lesson not found'
      });
    }

    // Remove lesson from topic
    const topic = await Topic.findById(topicId);
    if (topic) {
      topic.lessons = topic.lessons.filter(id => id !== lessonId);
      await topic.save();
    }

    await Lesson.findByIdAndDelete(lessonId);

    res.json({
      success: true,
      message: 'Lesson deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting lesson:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ==================== ACHIEVEMENTS API ====================

/**
 * @route   GET /api/admin/achievements
 * @desc    Get all achievements
 * @access  Admin
 */
router.get('/achievements', achievementController.getAchievements);

/**
 * @route   POST /api/admin/achievements
 * @desc    Create a new achievement
 * @access  Admin
 */
router.post('/achievements', achievementController.createAchievement);

/**
 * @route   PUT /api/admin/achievements/:id
 * @desc    Update an achievement
 * @access  Admin
 */
router.put('/achievements/:id', achievementController.updateAchievement);

/**
 * @route   DELETE /api/admin/achievements/:id
 * @desc    Delete an achievement
 * @access  Admin
 */
router.delete('/achievements/:id', achievementController.deleteAchievement);

/**
 * @route   POST /api/admin/achievements/bulk-import
 * @desc    Bulk import achievements
 * @access  Admin
 */
router.post('/achievements/bulk-import', achievementController.bulkImportAchievements);

// ==================== DIAGNOSTIC TEST QUESTIONS API ====================

const diagnosticTestController = require('../controllers/diagnosticTestController');

/**
 * @route   GET /api/admin/diagnostic-questions
 * @desc    Get all diagnostic questions (for admin)
 * @access  Admin
 */
router.get('/diagnostic-questions', diagnosticTestController.getAllQuestionsForAdmin);

/**
 * @route   POST /api/admin/diagnostic-questions
 * @desc    Create a new diagnostic question
 * @access  Admin
 */
router.post('/diagnostic-questions', diagnosticTestController.createQuestion);

/**
 * @route   PUT /api/admin/diagnostic-questions/:id
 * @desc    Update a diagnostic question
 * @access  Admin
 */
router.put('/diagnostic-questions/:id', diagnosticTestController.updateQuestion);

/**
 * @route   DELETE /api/admin/diagnostic-questions/:id
 * @desc    Delete a diagnostic question
 * @access  Admin
 */
router.delete('/diagnostic-questions/:id', diagnosticTestController.deleteQuestion);

/**
 * @route   PATCH /api/admin/diagnostic-questions/:id/toggle-status
 * @desc    Toggle diagnostic question active status
 * @access  Admin
 */
router.patch('/diagnostic-questions/:id/toggle-status', diagnosticTestController.toggleQuestionStatus);

/**
 * @route   POST /api/admin/diagnostic-questions/bulk-import
 * @desc    Bulk import diagnostic questions
 * @access  Admin
 */
router.post('/diagnostic-questions/bulk-import', diagnosticTestController.bulkImportQuestions);

module.exports = router;

