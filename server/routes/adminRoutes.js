const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const Admin = require('../models/Admin');
const { deleteFirebaseUser } = require('../config/firebase');

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
    const students = await Student.find({}).select('name email type status suspended createdAt avatar isOnline lastActivity');
    
    // Fetch all teachers
    const teachers = await Teacher.find({}).select('fullName email userStatus ranking profilePic headline bio createdAt isOnline lastActivity');
    
    // Auto-mark users as offline if inactive for more than 30 minutes
    const INACTIVITY_THRESHOLD = 30 * 60 * 1000; // 30 minutes in milliseconds
    const now = new Date();
    
    // Transform students to unified format
    const studentUsers = students.map(student => {
      const isActive = student.isOnline && student.lastActivity && 
                       (now - new Date(student.lastActivity)) < INACTIVITY_THRESHOLD;
      
      // Auto-update if marked online but inactive
      if (student.isOnline && !isActive) {
        Student.findByIdAndUpdate(student._id, { isOnline: false }).catch(err => 
          console.error('Error auto-updating student online status:', err)
        );
      }
      
      return {
        id: student._id.toString(),
        name: student.name,
        email: student.email,
        role: 'student',
        status: student.suspended ? 'suspended' : student.status || 'active',
        online: isActive,
        category: student.type === 'autism' ? 'Autism' : student.type === 'downSyndrome' ? 'Down Syndrome' : 'Other',
        avatar: student.avatar,
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
    
    // Update students
    const studentsResult = await Student.updateMany(
      {
        isOnline: true,
        lastActivity: { $lt: cutoffTime }
      },
      { isOnline: false }
    );
    
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
      .select('title category type topic lesson course description difficulty status createdAt')
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
      .select('title category topic lesson course difficulty status createdAt questionsAndAnswers')
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
      .select('title category type topic lesson course description difficulty status previousStatus deletedAt createdAt')
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
      .select('title category topic lesson course difficulty status previousStatus createdAt updatedAt')
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

module.exports = router;

