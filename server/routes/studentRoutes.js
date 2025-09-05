const express = require('express');
const Student = require('../models/Student');
const Course = require('../models/Course'); // if you want to validate course IDs
const auth = require('../middleware/auth');
const router = express.Router();

// PATCH /api/students/me  — update allowed fields
router.patch('/me', auth(['student']), async (req, res) => {
  const allowed = ['name', 'age', 'avatar']; // extend if needed
  const update = Object.fromEntries(Object.entries(req.body).filter(([k]) => allowed.includes(k)));

  const out = await Student.findByIdAndUpdate(req.user.sub, update, { new: true }).select('-password');
  res.json({ data: out });
});

// POST /api/students/enroll  — add a course
router.post('/enroll', auth(['student']), async (req, res) => {
  const { courseId } = req.body;
  if (!courseId) return res.status(400).json({ error: 'courseId required' });

  // Optional: validate the course exists
  // const exists = await Course.findById(courseId);
  // if (!exists) return res.status(404).json({ error: 'Course not found' });

  const out = await Student.findByIdAndUpdate(
    req.user.sub,
    { $addToSet: { enrolledCourses: courseId } },
    { new: true }
  ).select('-password');

  res.status(200).json({ data: out });
});

// GET /api/students/my-courses — list enrolled course IDs (or populate)
router.get('/my-courses', auth(['student']), async (req, res) => {
  const s = await Student.findById(req.user.sub).lean();
  if (!s) return res.status(404).json({ error: 'Not found' });
  // If you want course docs:
  // const courses = await Course.find({ _id: { $in: s.enrolledCourses } });
  // return res.json({ data: courses });
  res.json({ data: s.enrolledCourses });
});

module.exports = router;
