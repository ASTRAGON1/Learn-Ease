const express = require('express');
const Teacher = require('../models/Teacher');
const Content = require('../models/Content'); // optional: for "my uploads"
const auth = require('../middleware/auth');
const router = express.Router();

// PATCH /api/teachers/me  — update profile (whitelisted fields)
router.patch('/me', auth(['teacher']), async (req, res) => {
  const allowed = ['firstName', 'lastName', 'cv', 'profilePic', 'bio', 'headline', 'country'];
  const update = Object.fromEntries(Object.entries(req.body).filter(([k]) => allowed.includes(k)));
  const out = await Teacher.findByIdAndUpdate(req.user.sub, update, { new: true }).select('-password');
  res.json({ data: out });
});

// GET /api/teachers/me/uploads — list my uploaded content
router.get('/me/uploads', auth(['teacher']), async (req, res) => {
  const items = await Content.find({ teacher: req.user.sub }).sort({ _id: -1 });
  res.json({ data: items });
});

// GET /api/teachers/:id — public teacher profile (no password)
router.get('/:id', async (req, res) => {
  const t = await Teacher.findById(req.params.id).select('-password');
  if (!t) return res.status(404).json({ error: 'Teacher not found' });
  res.json({ data: t });
});

module.exports = router;
