const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Teacher = require('../models/Teacher');
const router = express.Router();

// POST /api/teachers/auth/register
router.post('/auth/register', async (req, res) => {
  try {
    const { firstName, lastName, email, password, cv, profilePic, bio } = req.body;
    if (!firstName || !lastName) {
      return res.status(400).json({ error: 'firstName and lastName are required' });
    }
    const exists = await Teacher.findOne({ email });
    if (exists) return res.status(409).json({ error: 'Email already used' });

    const hash = await bcrypt.hash(password, 10);
    const doc = await Teacher.create({
      firstName,
      lastName,
      email,
      password: hash,
      cv: cv || '',
      profilePic: profilePic || '',
      bio: bio || ''
    });

    res.status(201).json({ 
      data: { 
        id: doc._id, 
        firstName: doc.firstName, 
        lastName: doc.lastName, 
        email: doc.email 
      } 
    });
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
    res.json({ 
      data: { 
        token, 
        teacher: { 
          id: t._id, 
          firstName: t.firstName, 
          lastName: t.lastName, 
          email: t.email, 
          profilePic: t.profilePic 
        } 
      } 
    });
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

