const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');

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
    const teachers = await Teacher.find({}).select('fullName email userStatus ranking profilePic createdAt isOnline lastActivity');
    
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
        status: teacher.userStatus === 'suspended' ? 'suspended' : 'active',
        online: isActive,
        category: 'N/A',
        avatar: teacher.profilePic,
        ranking: teacher.ranking || 0,
        createdAt: teacher.createdAt,
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
      const student = await Student.findByIdAndUpdate(
        id,
        { suspended: true, status: 'inactive' },
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
        data: { id, role: 'student', status: 'suspended' }
      });
    } else if (role === 'instructor') {
      const teacher = await Teacher.findByIdAndUpdate(
        id,
        { userStatus: 'suspended' },
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
 * @desc    Delete a user
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
      const student = await Student.findByIdAndDelete(id);
      
      if (!student) {
        return res.status(404).json({
          success: false,
          error: 'Student not found'
        });
      }
      
      return res.json({
        success: true,
        message: 'Student deleted successfully'
      });
    } else if (role === 'instructor') {
      const teacher = await Teacher.findByIdAndDelete(id);
      
      if (!teacher) {
        return res.status(404).json({
          success: false,
          error: 'Teacher not found'
        });
      }
      
      return res.json({
        success: true,
        message: 'Teacher deleted successfully'
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

module.exports = router;

