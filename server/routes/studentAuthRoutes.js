const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Student = require('../models/Student');
const router = express.Router();

// POST /api/students/auth/register
router.post('/auth/register', async (req, res) => {
  try {
    const { name, email, password, age, avatar } = req.body;
    const exists = await Student.findOne({ email });
    if (exists) return res.status(409).json({ error: 'Email already used' });

    const hash = await bcrypt.hash(password, 10);
    const doc = await Student.create({ name, email, password: hash, age, avatar, enrolledCourses: [] });

    res.status(201).json({ 
      data: { id: doc._id, name: doc.name, email: doc.email } 
    });
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/students/auth/login
router.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const stu = await Student.findOne({ email });
    if (!stu) return res.status(404).json({ error: 'Student not found' });

    const ok = await bcrypt.compare(password, stu.password);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ sub: stu._id, role: 'student' }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ 
      data: { token, student: { id: stu._id, name: stu.name, email: stu.email, avatar: stu.avatar } } 
    });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/students/auth/me
router.get('/auth/me', require('../middleware/auth')(['student']), async (req, res) => {
  const me = await Student.findById(req.user.sub).select('-password');
  if (!me) return res.status(404).json({ error: 'Not found' });
  res.json({ data: me });
});

module.exports = router;
