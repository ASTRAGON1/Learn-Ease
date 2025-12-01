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

    // Check if firebaseUID already exists (if provided)
    if (firebaseUID) {
      const firebaseExists = await Teacher.findOne({ firebaseUID });
      if (firebaseExists) return res.status(409).json({ error: 'Firebase account already linked' });
    }

    // Hash password only if provided (not for Google signups)
    let hashedPassword = '';
    if (password && password !== 'google-signup') {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    // Create teacher document
    const teacherData = {
      fullName: fullName.trim(),
      email,
      cv: cv || '',
      profilePic: profilePic || '',
      bio: bio || ''
    };

    // Add password only if provided
    if (hashedPassword) {
      teacherData.password = hashedPassword;
    }

    // Add firebaseUID if provided
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
      // Duplicate key error
      return res.status(409).json({ error: 'Email or Firebase UID already exists' });
    }
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/teachers/auth/check-auth-method - Check if user has Firebase or MongoDB auth
router.post('/auth/check-auth-method', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const t = await Teacher.findOne({ email });
    if (!t) return res.status(404).json({ error: 'Teacher not found' });

    res.json({ 
      hasFirebase: !!t.firebaseUID,
      hasPassword: !!t.password && t.password !== 'google-signup'
    });
  } catch (error) {
    console.error('Check auth method error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/teachers/auth/login
router.post('/auth/login', async (req, res) => {
  try {
    const { email, password, firebaseUID } = req.body;
    const t = await Teacher.findOne({ email });
    if (!t) return res.status(404).json({ error: 'Teacher not found' });

    // If firebaseUID is provided, verify it matches the stored one
    if (firebaseUID) {
      if (t.firebaseUID !== firebaseUID) {
        return res.status(401).json({ error: 'Firebase authentication failed' });
      }
      // Firebase authentication successful - generate token
    } else {
      // MongoDB password authentication
      if (!t.password || t.password === 'google-signup') {
        return res.status(401).json({ error: 'This account uses Firebase authentication. Please use email/password login.' });
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
          profilePic: t.profilePic 
        } 
      } 
    });
  } catch (error) {
    console.error('Login error:', error);
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

