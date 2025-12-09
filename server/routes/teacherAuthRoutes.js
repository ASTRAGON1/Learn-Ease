const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Teacher = require('../models/Teacher');
const router = express.Router();

// POST /api/teachers/auth/register
router.post('/auth/register', async (req, res) => {
  try {
    const { fullName, email, password, cv, profilePic, bio, firebaseUID } = req.body;
    if (!fullName || !fullName.trim()) {
      return res.status(400).json({ error: 'fullName is required' });
    }
    if (!email) {
      return res.status(400).json({ error: 'email is required' });
    }

    // Check if email already exists
    const exists = await Teacher.findOne({ email });
    if (exists) return res.status(409).json({ error: 'Email already used' });

    // If firebaseUID is provided, check if it's already linked
    if (firebaseUID) {
      const firebaseExists = await Teacher.findOne({ firebaseUID });
      if (firebaseExists) return res.status(409).json({ error: 'Firebase account already linked' });
    }

    let hashedPassword = '';
    if (password && password !== 'google-signup') {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    const teacherData = {
      fullName: fullName.trim(),
      email,
      cv: cv || '',
      profilePic: profilePic || '',
      bio: bio || ''
    };

    if (hashedPassword) {
      teacherData.password = hashedPassword;
    }

    if (firebaseUID) {
      teacherData.firebaseUID = firebaseUID;
    }

    const doc = await Teacher.create(teacherData);

    res.status(201).json({ 
      data: { 
        id: doc._id, 
        fullName: doc.fullName, 
        email: doc.email,
        firebaseUID: doc.firebaseUID || null
      } 
    });
  } catch (error) {
    console.error('Registration error:', error);
    if (error.code === 11000) {
      return res.status(409).json({ error: 'Email or Firebase UID already exists' });
    }
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/teachers/auth/login
router.post('/auth/login', async (req, res) => {
  try {
    const { email, password, firebaseUID } = req.body;
    const t = await Teacher.findOne({ email });
    if (!t) return res.status(404).json({ error: 'Teacher not found' });

    // If firebaseUID is provided, verify it matches or update it
    if (firebaseUID) {
      if (t.firebaseUID && t.firebaseUID !== firebaseUID) {
        return res.status(401).json({ error: 'Invalid Firebase credentials' });
      }
      // If firebaseUID is not set in MongoDB, update it
      if (!t.firebaseUID) {
        t.firebaseUID = firebaseUID;
        await t.save();
      }
    } else {
      // Traditional password login
      if (!t.password) {
        return res.status(401).json({ error: 'This account uses Firebase authentication. Please sign in with Firebase.' });
      }
      const ok = await bcrypt.compare(password, t.password);
      if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ sub: t._id, role: 'teacher' }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ 
      data: { 
        token, 
        teacher: { 
          id: t._id, 
          fullName: t.fullName, 
          email: t.email, 
          profilePic: t.profilePic,
          areasOfExpertise: t.areasOfExpertise || [],
          cv: t.cv || '',
          informationGatheringComplete: t.informationGatheringComplete || false
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
  
  // Check if teacher has a password set (not Firebase-only)
  const teacherWithPassword = await Teacher.findById(req.user.sub);
  const hasPassword = !!(teacherWithPassword && teacherWithPassword.password);
  
  const response = me.toObject();
  response.hasPassword = hasPassword;
  
  res.json({ data: response });
});

module.exports = router;

