const express = require('express');
const bcrypt = require('bcryptjs');
const Teacher = require('../models/Teacher');
const Content = require('../models/Content'); // optional: for "my uploads"
const auth = require('../middleware/auth');
const router = express.Router();

// PATCH /api/teachers/me  — update profile (whitelisted fields)
router.patch('/me', auth(['teacher']), async (req, res) => {
  try {
    const mongoose = require('mongoose');
    const userId = req.user.sub;
    console.log('PATCH /api/teachers/me - User ID:', userId, 'Type:', typeof userId);
    
    // Convert to ObjectId if it's a string
    let teacherId;
    try {
      teacherId = mongoose.Types.ObjectId.isValid(userId) ? new mongoose.Types.ObjectId(userId) : userId;
    } catch (e) {
      console.error('Invalid ObjectId format:', userId);
      return res.status(400).json({ error: 'Invalid user ID format' });
    }
    
    const allowed = ['fullName', 'cv', 'profilePic', 'bio', 'headline', 'country', 'website', 'areasOfExpertise', 'informationGatheringComplete'];
    const update = Object.fromEntries(Object.entries(req.body).filter(([k]) => allowed.includes(k)));
    
    // Validate areasOfExpertise if provided
    if (update.areasOfExpertise) {
      if (!Array.isArray(update.areasOfExpertise)) {
        return res.status(400).json({ error: 'areasOfExpertise must be an array' });
      }
      if (update.areasOfExpertise.length < 1 || update.areasOfExpertise.length > 4) {
        return res.status(400).json({ error: 'areasOfExpertise must contain between 1 and 4 items' });
      }
    }

    // Validate bio length if provided
    if (update.bio && update.bio.length > 1000) {
      return res.status(400).json({ error: 'Bio cannot exceed 1000 characters' });
    }

    // CV is now stored as filename, so no size validation needed
    // If you want to store actual files later, use cloud storage (S3, Firebase Storage, etc.)
    
    // Check if teacher exists first - try both as ObjectId and as string
    let teacherExists = await Teacher.findById(teacherId);
    if (!teacherExists) {
      // Try finding by string ID
      teacherExists = await Teacher.findById(userId);
    }
    if (!teacherExists) {
      console.error('Teacher not found with ID:', userId, 'or ObjectId:', teacherId);
      // Try to find by any field to debug
      const allTeachers = await Teacher.find({}).limit(5).select('_id email fullName');
      console.log('Sample teachers in DB:', allTeachers);
      return res.status(404).json({ error: 'Teacher not found. Please log out and log in again.' });
    }
    
    // Use updateOne to avoid full document validation issues
    const updateResult = await Teacher.updateOne({ _id: teacherId }, { $set: update });
    
    if (updateResult.matchedCount === 0) {
      // Try with string ID
      const updateResult2 = await Teacher.updateOne({ _id: userId }, { $set: update });
      if (updateResult2.matchedCount === 0) {
        console.error('Update matched 0 documents for ID:', userId);
        return res.status(404).json({ error: 'Teacher not found. Please log out and log in again.' });
      }
    }
    
    // Fetch updated document
    let out = await Teacher.findById(teacherId).select('-password');
    if (!out) {
      out = await Teacher.findById(userId).select('-password');
    }
    if (!out) {
      console.error('Could not fetch updated teacher with ID:', userId);
      return res.status(404).json({ error: 'Teacher not found. Please log out and log in again.' });
    }
    
    res.json({ data: out });
  } catch (error) {
    console.error('Error updating teacher profile:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid teacher ID format' });
    }
    res.status(500).json({ error: 'Server error while updating profile' });
  }
});

// GET /api/teachers/me/uploads — list my uploaded content
router.get('/me/uploads', auth(['teacher']), async (req, res) => {
  const items = await Content.find({ teacher: req.user.sub }).sort({ _id: -1 });
  res.json({ data: items });
});

// PATCH /api/teachers/me/password — change password
router.patch('/me/password', auth(['teacher']), async (req, res) => {
  try {
    const mongoose = require('mongoose');
    const userId = req.user.sub;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters' });
    }

    // Convert to ObjectId if it's a string
    let teacherId;
    try {
      teacherId = mongoose.Types.ObjectId.isValid(userId) ? new mongoose.Types.ObjectId(userId) : userId;
    } catch (e) {
      return res.status(400).json({ error: 'Invalid user ID format' });
    }

    // Find teacher with password field included (don't exclude it)
    let teacher = await Teacher.findById(teacherId);
    if (!teacher) {
      teacher = await Teacher.findById(userId);
    }
    if (!teacher) {
      return res.status(404).json({ error: 'Teacher not found' });
    }

    // Check if teacher has a password in MongoDB
    // If they have a password, verify it. If not, they might be Firebase-only, which is okay.
    let shouldUpdateMongoDB = false;
    
    if (teacher.password) {
      // Teacher has MongoDB password, verify current password
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, teacher.password);
      if (!isCurrentPasswordValid) {
        return res.status(401).json({ error: 'Current password is incorrect' });
      }
      shouldUpdateMongoDB = true;
    } else {
      // Teacher doesn't have MongoDB password (Firebase-only account)
      // Still update MongoDB with the new password so they can use both
      shouldUpdateMongoDB = true;
    }

    // Hash new password and update MongoDB
    if (shouldUpdateMongoDB) {
      const hashedNewPassword = await bcrypt.hash(newPassword, 10);
      
      // Update password in MongoDB
      const updateResult = await Teacher.updateOne({ _id: teacherId }, { $set: { password: hashedNewPassword } });
      
      if (updateResult.matchedCount === 0) {
        const updateResult2 = await Teacher.updateOne({ _id: userId }, { $set: { password: hashedNewPassword } });
        if (updateResult2.matchedCount === 0) {
          return res.status(404).json({ error: 'Teacher not found' });
        }
      }
    }

    res.json({ message: 'Password updated successfully in MongoDB' });
  } catch (error) {
    console.error('Error updating password:', error);
    res.status(500).json({ error: 'Server error while updating password' });
  }
});

// DELETE /api/teachers/me — delete account
router.delete('/me', auth(['teacher']), async (req, res) => {
  try {
    const mongoose = require('mongoose');
    const userId = req.user.sub;
    
    // Convert to ObjectId if it's a string
    let teacherId;
    try {
      teacherId = mongoose.Types.ObjectId.isValid(userId) ? new mongoose.Types.ObjectId(userId) : userId;
    } catch (e) {
      return res.status(400).json({ error: 'Invalid user ID format' });
    }
    
    // Find teacher to get firebaseUID before deletion
    let teacher = await Teacher.findById(teacherId);
    if (!teacher) {
      teacher = await Teacher.findById(userId);
    }
    if (!teacher) {
      return res.status(404).json({ error: 'Teacher not found' });
    }
    
    const firebaseUID = teacher.firebaseUID || null;
    
    // Delete teacher from MongoDB
    const deleteResult = await Teacher.deleteOne({ _id: teacherId });
    
    if (deleteResult.deletedCount === 0) {
      // Try with string ID
      const deleteResult2 = await Teacher.deleteOne({ _id: userId });
      if (deleteResult2.deletedCount === 0) {
        return res.status(404).json({ error: 'Teacher not found' });
      }
    }
    
    console.log('Teacher deleted from MongoDB:', userId);
    
    // Return firebaseUID so frontend can delete from Firebase Auth
    res.json({ 
      message: 'Account deleted successfully',
      firebaseUID: firebaseUID
    });
  } catch (error) {
    console.error('Error deleting teacher account:', error);
    res.status(500).json({ error: 'Server error while deleting account' });
  }
});

// GET /api/teachers/:id — public teacher profile (no password)
router.get('/:id', async (req, res) => {
  const t = await Teacher.findById(req.params.id).select('-password');
  if (!t) return res.status(404).json({ error: 'Teacher not found' });
  res.json({ data: t });
});

module.exports = router;
