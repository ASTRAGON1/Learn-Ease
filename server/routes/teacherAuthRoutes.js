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

    // If firebaseUID is provided, verify it matches
    if (firebaseUID) {
      if (t.firebaseUID !== firebaseUID) {
        return res.status(401).json({ error: 'Invalid Firebase credentials' });
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
  res.json({ data: me });
});

// POST /api/teachers/auth/forgot-password
router.post('/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const teacher = await Teacher.findOne({ email: email.toLowerCase().trim() });
    
    // For security, don't reveal if email exists or not
    // But we still need to check if teacher exists to generate code
    if (!teacher) {
      // Return success even if email doesn't exist (security best practice)
      return res.json({ 
        data: { 
          message: 'If an account with that email exists, a verification code has been sent.' 
        } 
      });
    }

    // Check if teacher has a password (not Firebase-only account)
    if (!teacher.password) {
      return res.status(400).json({ 
        error: 'This account uses Firebase authentication. Please reset your password through Firebase.' 
      });
    }

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store code and expiry (15 minutes)
    teacher.resetPasswordCode = code;
    teacher.resetPasswordCodeExpiry = new Date(Date.now() + 15 * 60 * 1000);
    await teacher.save();

    // TODO: In production, send email with code here
    // For now, we'll return it in development (remove in production)
    console.log(`Password reset code for ${email}: ${code}`);

    res.json({ 
      data: { 
        message: 'If an account with that email exists, a verification code has been sent.',
        // Remove this in production - only for development
        code: process.env.NODE_ENV === 'development' ? code : undefined
      } 
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/teachers/auth/verify-reset-code
router.post('/auth/verify-reset-code', async (req, res) => {
  try {
    const { email, code } = req.body;
    
    if (!email || !code) {
      return res.status(400).json({ error: 'Email and code are required' });
    }

    const teacher = await Teacher.findOne({ email: email.toLowerCase().trim() });
    
    if (!teacher) {
      return res.status(404).json({ error: 'Invalid verification code' });
    }

    // Check if code matches and hasn't expired
    if (!teacher.resetPasswordCode || 
        teacher.resetPasswordCode !== code ||
        !teacher.resetPasswordCodeExpiry ||
        teacher.resetPasswordCodeExpiry < new Date()) {
      return res.status(400).json({ error: 'Invalid or expired verification code' });
    }

    res.json({ 
      data: { 
        message: 'Code verified successfully' 
      } 
    });
  } catch (error) {
    console.error('Verify code error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/teachers/auth/reset-password
router.post('/auth/reset-password', async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;
    
    if (!email || !code || !newPassword) {
      return res.status(400).json({ error: 'Email, code, and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const teacher = await Teacher.findOne({ email: email.toLowerCase().trim() });
    
    if (!teacher) {
      return res.status(404).json({ error: 'Invalid verification code' });
    }

    // Check if code matches and hasn't expired
    if (!teacher.resetPasswordCode || 
        teacher.resetPasswordCode !== code ||
        !teacher.resetPasswordCodeExpiry ||
        teacher.resetPasswordCodeExpiry < new Date()) {
      return res.status(400).json({ error: 'Invalid or expired verification code' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update password and clear reset code
    teacher.password = hashedPassword;
    teacher.resetPasswordCode = null;
    teacher.resetPasswordCodeExpiry = null;
    await teacher.save();

    res.json({ 
      data: { 
        message: 'Password reset successfully' 
      } 
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;

