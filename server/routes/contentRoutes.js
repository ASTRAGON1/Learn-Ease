// server/routes/contentRoutes.js
const express = require('express');
const Content = require('../models/Content');
const auth = require('../middleware/auth'); // the JWT middleware you already have
const router = express.Router();

/**
 * POST /api/content
 * Create a new content item (teacher-only)
 */
router.post('/', auth(['teacher']), async (req, res) => {
  try {
    const { title, type, fileURL, course, topic, lesson, category, description } = req.body;

    // minimal validation
    if (!title || !type || !fileURL || !course || !category) {
      return res.status(400).json({ error: 'title, type, fileURL, course, and category are required' });
    }

    // teacher comes from the token
    const doc = await Content.create({
      title,
      type,
      fileURL,
      course,
      topic: topic || '',
      lesson: lesson || '',
      category,
      description: description || '',
      teacher: req.user.sub,
    });

    res.status(201).json({ data: doc });
  } catch (e) {
    res.status(500).json({ error: 'Failed to create content' });
  }
});

/**
 * GET /api/content/course/:courseId
 * List all content for a course (student or teacher)
 * Supports ?type=video|pdf and pagination ?page=1&limit=20
 */
router.get('/course/:courseId', auth(['student', 'teacher']), async (req, res) => {
  try {
    const { courseId } = req.params;
    const { type, page = 1, limit = 20 } = req.query;

    const query = { course: courseId };
    if (type) query.type = type;

    const skip = (Math.max(parseInt(page), 1) - 1) * Math.max(parseInt(limit), 1);

    const [items, total] = await Promise.all([
      Content.find(query).sort({ _id: -1 }).skip(skip).limit(parseInt(limit)),
      Content.countDocuments(query),
    ]);

    res.json({
      data: items,
      pagination: { total, page: Number(page), limit: Number(limit) },
    });
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch content' });
  }
});

/**
 * GET /api/content/:id
 * Get a single content item (student or teacher)
 */
router.get('/:id', auth(['student', 'teacher']), async (req, res) => {
  try {
    const item = await Content.findById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Content not found' });
    res.json({ data: item });
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch content' });
  }
});

/**
 * GET /api/content/me
 * List all content uploaded by the current teacher
 */
router.get('/me/mine', auth(['teacher']), async (req, res) => {
  try {
    const items = await Content.find({ teacher: req.user.sub }).sort({ _id: -1 });
    res.json({ data: items });
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch your content' });
  }
});

/**
 * PATCH /api/content/:id
 * Update a content item (only the owner teacher can edit)
 */
router.patch('/:id', auth(['teacher']), async (req, res) => {
  try {
    // only allow safe fields to be edited
    const allowed = ['title', 'type', 'fileURL', 'course', 'topic', 'lesson', 'category', 'description', 'status'];
    const update = Object.fromEntries(
      Object.entries(req.body).filter(([k]) => allowed.includes(k))
    );

    const updated = await Content.findOneAndUpdate(
      { _id: req.params.id, teacher: req.user.sub },
      update,
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ error: 'Content not found or not yours' });
    }
    res.json({ data: updated });
  } catch (e) {
    res.status(500).json({ error: 'Failed to update content' });
  }
});

/**
 * DELETE /api/content/:id
 * Delete a content item (only the owner teacher can delete)
 */
router.delete('/:id', auth(['teacher']), async (req, res) => {
  try {
    const deleted = await Content.findOneAndDelete({
      _id: req.params.id,
      teacher: req.user.sub,
    });
    if (!deleted) {
      return res.status(404).json({ error: 'Content not found or not yours' });
    }
    res.json({ msg: 'Content deleted' });
  } catch (e) {
    res.status(500).json({ error: 'Failed to delete content' });
  }
});

module.exports = router;