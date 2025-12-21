const express = require('express');
const router = express.Router();

// Import all models from index
const {
  Course,
  Lesson,
  Topic,
  Student,
  Teacher,
  Admin,
  Content,
  Quiz,
  Path,
  QuizResult,
  Feedback,
  Report
} = require('../models');

// Test: Get all courses
router.get('/courses', async (req, res) => {
  try {
    const courses = await Course.find();
    res.json({
      success: true,
      count: courses.length,
      data: courses
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Test: Get all lessons
router.get('/lessons', async (req, res) => {
  try {
    const lessons = await Lesson.find();
    res.json({
      success: true,
      count: lessons.length,
      data: lessons
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Test: Get all topics
router.get('/topics', async (req, res) => {
  try {
    const topics = await Topic.find();
    res.json({
      success: true,
      count: topics.length,
      data: topics
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Test: Get all Paths
router.get('/paths', async (req, res) => {
  try {
    const paths = await Path.find();
    res.json({
      success: true,
      count: paths.length,
      data: paths
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Test: Get all students
router.get('/students', async (req, res) => {
  try {
    const students = await Student.find();
    res.json({
      success: true,
      count: students.length,
      data: students
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Test: Get all teachers
router.get('/teachers', async (req, res) => {
  try {
    const teachers = await Teacher.find();
    res.json({
      success: true,
      count: teachers.length,
      data: teachers
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Test: Get all admins
router.get('/admins', async (req, res) => {
  try {
    const admins = await Admin.find();
    res.json({
      success: true,
      count: admins.length,
      data: admins
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Test: Get all content
router.get('/content', async (req, res) => {
  try {
    const content = await Content.find();
    res.json({
      success: true,
      count: content.length,
      data: content
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Test: Get all quizzes
router.get('/quizzes', async (req, res) => {
  try {
    const quizzes = await Quiz.find();
    res.json({
      success: true,
      count: quizzes.length,
      data: quizzes
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Test: Get all quiz results
router.get('/quizresults', async (req, res) => {
  try {
    const quizResults = await QuizResult.find();
    res.json({
      success: true,
      count: quizResults.length,
      data: quizResults
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Test: Get all feedback
router.get('/feedback', async (req, res) => {
  try {
    const feedback = await Feedback.find();
    res.json({
      success: true,
      count: feedback.length,
      data: feedback
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Test: Get all reports
router.get('/reports', async (req, res) => {
  try {
    const reports = await Report.find();
    res.json({
      success: true,
      count: reports.length,
      data: reports
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Test: Create sample feedback
router.post('/feedback/sample', async (req, res) => {
  try {
    const sampleFeedback = [
      {
        userName: 'John Doe',
        topic: 'Content',
        description: 'Loving the new dashboard! Great work on the interface.'
      },
      {
        userName: 'Jane Smith',
        topic: 'Navigation',
        description: 'The interface is very user-friendly. Great work!'
      },
      {
        userName: 'Mike Johnson',
        topic: 'Stats or analytics',
        description: 'The analytics dashboard is very helpful for tracking progress.'
      }
    ];

    const createdFeedback = await Feedback.insertMany(sampleFeedback);
    res.json({
      success: true,
      count: createdFeedback.length,
      data: createdFeedback,
      message: 'Sample feedback created successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Test: Create sample reports
router.post('/reports/sample', async (req, res) => {
  try {
    const sampleReports = [
      {
        userName: 'Sarah Williams',
        topic: 'Login or account issues',
        description: 'Cannot reset password. The reset link is not working.'
      },
      {
        userName: 'David Brown',
        topic: 'Uploading',
        description: 'Video encoding issue when uploading large files.'
      },
      {
        userName: 'Emily Davis',
        topic: 'Content',
        description: 'Inappropriate message in chat section.'
      },
      {
        userName: 'Chris Wilson',
        topic: 'Navigation',
        description: 'Menu items not loading correctly on mobile devices.'
      }
    ];

    const createdReports = await Report.insertMany(sampleReports);
    res.json({
      success: true,
      count: createdReports.length,
      data: createdReports,
      message: 'Sample reports created successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;