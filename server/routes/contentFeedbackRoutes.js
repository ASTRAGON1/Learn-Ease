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
    const { contentId, rating, comment, isLiked } = req.body;
    if (!contentId || !rating) {
      return res.status(400).json({ error: 'contentId and rating are required' });
    }

    // one feedback per (student, content). Use upsert.
    const doc = await ContentFeedback.findOneAndUpdate(
      { contentId, studentId: req.user.sub },
      { contentId, studentId: req.user.sub, rating, comment: comment || '', isLiked: !!isLiked, date: new Date() },
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
      ContentFeedback.find({ contentId }).sort({ date: -1 }).skip(skip).limit(limit),
      ContentFeedback.countDocuments({ contentId }),
      ContentFeedback.aggregate([
        { $match: { contentId } },
        { $group: { _id: '$contentId', avgRating: { $avg: '$rating' }, likes: { $sum: { $cond: ['$isLiked', 1, 0] } }, count: { $sum: 1 } } }
      ])
    ]);

    const summary = agg[0] || { avgRating: 0, likes: 0, count: 0 };

    res.json({
      data: items,
      summary: { average: Number(summary.avgRating?.toFixed?.(2) || 0), likes: summary.likes, count: summary.count },
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
  const rows = await ContentFeedback.find({ studentId: req.user.sub }).sort({ date: -1 });
  res.json({ data: rows });
});

/**
 * PATCH /api/content-feedback/:id
 * Edit my feedback (student only).
 */
router.patch('/:id', auth(['student']), async (req, res) => {
  try {
    const allowed = ['rating', 'comment', 'isLiked'];
    const update = Object.fromEntries(Object.entries(req.body).filter(([k]) => allowed.includes(k)));

    const out = await ContentFeedback.findOneAndUpdate(
      { _id: req.params.id, studentId: req.user.sub },
      { ...update, date: new Date() },
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
    const del = await ContentFeedback.findOneAndDelete({ _id: req.params.id, studentId: req.user.sub });
    if (!del) return res.status(404).json({ error: 'Feedback not found or not yours' });
    res.json({ msg: 'Feedback deleted' });
  } catch (e) {
    res.status(500).json({ error: 'Failed to delete feedback' });
  }
});

module.exports = router;
