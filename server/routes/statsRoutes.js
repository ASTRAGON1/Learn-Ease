const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');

/**
 * @route   GET /api/stats/snapshot
 * @desc    Get snapshot statistics for landing page (students and active teachers count)
 * @access  Public
 */
router.get('/snapshot', async (req, res) => {
  try {
    // Count total students
    const studentCount = await Student.countDocuments({});
    
    // Count only active teachers (not pending or suspended)
    const activeTeacherCount = await Teacher.countDocuments({ userStatus: 'active' });
    
    res.json({
      success: true,
      data: {
        students: studentCount,
        teachers: activeTeacherCount
      }
    });
  } catch (error) {
    console.error('Error fetching snapshot statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics',
      error: error.message
    });
  }
});

module.exports = router;

