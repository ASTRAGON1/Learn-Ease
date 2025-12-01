const express = require('express');
const Course = require('../models/Course');
const auth = require('../middleware/auth');          // JWT: sets req.user = { sub, role }
const router = express.Router();

/**
 * POST /api/courses
 * Create a course (teacher only)
 */
router.post('/', auth(['teacher']), async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title) return res.status(400).json({ error: 'title is required' });

    // Course schema has 'teacher' field (ObjectId ref to Teacher)
    const doc = await Course.create({
      title,
      description: description || '',
      teacher: req.user.sub,
    });

    res.status(201).json({ data: doc });
  } catch {
    res.status(500).json({ error: 'Failed to create course' });
  }
});

/**
 * GET /api/courses
 * Public list with simple filters + pagination
 * ?q=math&category=Science&page=1&limit=20
 */
router.get('/', async (req, res) => {
  try {
    const { q, difficulty, page = 1, limit = 20 } = req.query;
    const query = {};
    if (q) query.title = { $regex: q, $options: 'i' };
    if (difficulty) query.difficulty = difficulty;

    const skip = (Math.max(parseInt(page), 1) - 1) * Math.max(parseInt(limit), 1);

    const [items, total] = await Promise.all([
      Course.find(query).sort({ _id: -1 }).skip(skip).limit(parseInt(limit)),
      Course.countDocuments(query),
    ]);

    res.json({ data: items, pagination: { total, page: Number(page), limit: Number(limit) } });
  } catch {
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
});

/**
 * GET /api/courses/:id
 * Public: get single course
 */
router.get('/:id', async (req, res) => {
  try {
    const c = await Course.findById(req.params.id);
    if (!c) return res.status(404).json({ error: 'Course not found' });
    res.json({ data: c });
  } catch {
    res.status(500).json({ error: 'Failed to fetch course' });
  }
});

/**
 * PATCH /api/courses/:id
 * Update course (only owner teacher)
 */
router.patch('/:id', auth(['teacher']), async (req, res) => {
  try {
    const allowed = ['title', 'description', 'difficulty', 'isPublished'];
    const update = Object.fromEntries(Object.entries(req.body).filter(([k]) => allowed.includes(k)));

    const out = await Course.findOneAndUpdate(
      { _id: req.params.id, teacher: req.user.sub },
      update,
      { new: true }
    );
    if (!out) return res.status(404).json({ error: 'Course not found or not yours' });
    res.json({ data: out });
  } catch {
    res.status(500).json({ error: 'Failed to update course' });
  }
});

/**
 * POST /api/courses/:id/content
 * Attach a contentId to the course (owner teacher)
 * body: { contentId: "..." }
 */
// Note: Course schema doesn't have contentIds field - it has topics array
// If you need to link content to courses, consider adding contentIds to Course schema
// or use the topic/lesson/content relationship structure
router.post('/:id/content', auth(['teacher']), async (req, res) => {
  try {
    return res.status(400).json({ error: 'Course schema does not support direct content linking. Use topics/lessons structure instead.' });
  } catch {
    res.status(500).json({ error: 'Failed to attach content' });
  }
});

/**
 * DELETE /api/courses/:id/content/:contentId
 * Remove a contentId from the course (owner teacher)
 */
// Note: Course schema doesn't have contentIds field
router.delete('/:id/content/:contentId', auth(['teacher']), async (req, res) => {
  try {
    return res.status(400).json({ error: 'Course schema does not support direct content linking. Use topics/lessons structure instead.' });
  } catch {
    res.status(500).json({ error: 'Failed to remove content' });
  }
});

/**
 * DELETE /api/courses/:id
 * Delete course (owner teacher)
 */
router.delete('/:id', auth(['teacher']), async (req, res) => {
  try {
    const del = await Course.findOneAndDelete({ _id: req.params.id, teacher: req.user.sub });
    if (!del) return res.status(404).json({ error: 'Course not found or not yours' });
    res.json({ msg: 'Course deleted' });
  } catch {
    res.status(500).json({ error: 'Failed to delete course' });
  }
});

module.exports = router;
