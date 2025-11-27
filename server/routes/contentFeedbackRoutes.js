const express = require('express');
const ContentFeedback = require('../models/ContentFeedback');
const auth = require('../middleware/auth'); // uses JWT, sets req.user
const router = express.Router();

/**
 * POST /api/content-feedback
 * Create or replace your feedback for a content (student only).
 */
router.post('/', auth(['student']), async (req, res) => {
  try {
    const { content, comment, liked } = req.body;
    if (!content) {
      return res.status(400).json({ error: 'content (contentId) is required' });
    }

    // one feedback per (student, content). Use upsert.
    const doc = await ContentFeedback.findOneAndUpdate(
      { content, student: req.user.sub },
      { content, student: req.user.sub, comment: comment || '', liked: !!liked },
      { new: true, upsert: true }
    );

    res.status(201).json({ data: doc });
  } catch (e) {
    res.status(500).json({ error: 'Failed to save feedback' });
  }
});

/**
 * GET /api/content-feedback/content/:contentId
 * List feedback for a content (+ avg rating & count). Student or teacher.
 * Query: ?page=1&limit=20
 */
router.get('/content/:contentId', auth(['student', 'teacher']), async (req, res) => {
  try {
    const { contentId } = req.params;
    const page = Math.max(parseInt(req.query.page || '1'), 1);
    const limit = Math.max(parseInt(req.query.limit || '20'), 1);
    const skip = (page - 1) * limit;

    const [items, total, agg] = await Promise.all([
      ContentFeedback.find({ content: contentId }).sort({ createdAt: -1 }).skip(skip).limit(limit),
      ContentFeedback.countDocuments({ content: contentId }),
      ContentFeedback.aggregate([
        { $match: { content: contentId } },
        { $group: { _id: '$content', likes: { $sum: { $cond: ['$liked', 1, 0] } }, count: { $sum: 1 } } }
      ])
    ]);

    const summary = agg[0] || { likes: 0, count: 0 };

    res.json({
      data: items,
      summary: { likes: summary.likes, count: summary.count },
      pagination: { total, page, limit }
    });
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch feedback' });
  }
});

/**
 * GET /api/content-feedback/me
 * Get my feedbacks (student only).
 */
router.get('/me', auth(['student']), async (req, res) => {
  const rows = await ContentFeedback.find({ student: req.user.sub }).sort({ createdAt: -1 });
  res.json({ data: rows });
});

/**
 * PATCH /api/content-feedback/:id
 * Edit my feedback (student only).
 */
router.patch('/:id', auth(['student']), async (req, res) => {
  try {
    const allowed = ['comment', 'liked'];
    const update = Object.fromEntries(Object.entries(req.body).filter(([k]) => allowed.includes(k)));

    const out = await ContentFeedback.findOneAndUpdate(
      { _id: req.params.id, student: req.user.sub },
      update,
      { new: true }
    );
    if (!out) return res.status(404).json({ error: 'Feedback not found or not yours' });
    res.json({ data: out });
  } catch (e) {
    res.status(500).json({ error: 'Failed to update feedback' });
  }
});

/**
 * DELETE /api/content-feedback/:id
 * Delete my feedback (student only).
 */
router.delete('/:id', auth(['student']), async (req, res) => {
  try {
    const del = await ContentFeedback.findOneAndDelete({ _id: req.params.id, student: req.user.sub });
    if (!del) return res.status(404).json({ error: 'Feedback not found or not yours' });
    res.json({ msg: 'Feedback deleted' });
  } catch (e) {
    res.status(500).json({ error: 'Failed to delete feedback' });
  }
});

module.exports = router;
