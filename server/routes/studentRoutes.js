const express = require('express');
const Student = require('../models/Student');
const Course = require('../models/Course'); // if you want to validate course IDs
const auth = require('../middleware/auth');
const router = express.Router();

// PATCH /api/students/me  — update allowed fields
router.patch('/me', auth(['student']), async (req, res) => {
  const allowed = ['name', 'avatar', 'type', 'assignedPath']; // Note: Student schema doesn't have 'age' field
  const update = Object.fromEntries(Object.entries(req.body).filter(([k]) => allowed.includes(k)));

  const out = await Student.findByIdAndUpdate(req.user.sub, update, { new: true }).select('-pass');
  res.json({ data: out });
});

// POST /api/students/enroll  — add a course
router.post('/enroll', auth(['student']), async (req, res) => {
  const { courseId } = req.body;
  if (!courseId) return res.status(400).json({ error: 'courseId required' });

  // Optional: validate the course exists
  // const exists = await Course.findById(courseId);
  // if (!exists) return res.status(404).json({ error: 'Course not found' });

  // Note: Student model doesn't have enrolledCourses field - you may need to add it to the schema
  // For now, this will fail. Consider adding enrolledCourses to Student schema or using a separate enrollment model
  const out = await Student.findByIdAndUpdate(
    req.user.sub,
    { $addToSet: { enrolledCourses: courseId } },
    { new: true }
  ).select('-pass');

  res.status(200).json({ data: out });
});

// GET /api/students/my-courses — list enrolled course IDs (or populate)
router.get('/my-courses', auth(['student']), async (req, res) => {
  const s = await Student.findById(req.user.sub).lean();
  if (!s) return res.status(404).json({ error: 'Not found' });
  // Note: Student model doesn't have enrolledCourses field
  // If you want course docs, you need to add enrolledCourses to Student schema first
  // const courses = await Course.find({ _id: { $in: s.enrolledCourses || [] } });
  // return res.json({ data: courses });
  res.json({ data: s.enrolledCourses || [] });
});

module.exports = router;
