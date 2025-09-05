const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Teacher = require('../models/Teacher');
const router = express.Router();

// POST /api/teachers/auth/register
router.post('/auth/register', async (req, res) => {
  try {
    const { name, email, password, cv, age, avatar, bio } = req.body;
    const exists = await Teacher.findOne({ email });
    if (exists) return res.status(409).json({ error: 'Email already used' });

    const hash = await bcrypt.hash(password, 10);
    const doc = await Teacher.create({
      name, email, password: hash, cv: cv || '', uploadedContent: [],
      age, avatar, bio
    });

    res.status(201).json({ data: { id: doc._id, name: doc.name, email: doc.email } });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/teachers/auth/login
router.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const t = await Teacher.findOne({ email });
    if (!t) return res.status(404).json({ error: 'Teacher not found' });

    const ok = await bcrypt.compare(password, t.password);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ sub: t._id, role: 'teacher' }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ data: { token, teacher: { id: t._id, name: t.name, email: t.email, avatar: t.avatar } } });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/teachers/auth/me
router.get('/auth/me', require('../middleware/auth')(['teacher']), async (req, res) => {
  const me = await Teacher.findById(req.user.sub).select('-password');
  if (!me) return res.status(404).json({ error: 'Not found' });
  res.json({ data: me });
});

module.exports = router;

