const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const ctrl = require('../controllers/storageController');
const Content = require('../models/Content');

router.get('/', auth(['teacher']), ctrl.getContent);
router.post('/', auth(['teacher']), ctrl.createContent);

// PATCH /api/content/:id - Update content (for archiving, restoring, etc.)
router.patch('/:id', auth(['teacher']), async (req, res) => {
  try {
    const allowed = ['title', 'type', 'fileURL', 'course', 'topic', 'lesson', 'category', 'description', 'status', 'previousStatus', 'deletedAt'];
    const update = Object.fromEntries(
      Object.entries(req.body).filter(([k]) => allowed.includes(k))
    );

    // If restoring from archived, clear previousStatus
    if (update.status && update.status !== 'archived' && req.body.previousStatus === null) {
      update.previousStatus = null;
    }

    // If restoring from deleted, restore previous status and clear deletedAt
    if (update.status && update.status !== 'deleted') {
      const content = await Content.findOne({ _id: req.params.id, teacher: req.user.sub });
      if (content && content.status === 'deleted') {
        // Restore to previous status if available, otherwise default to draft
        if (content.previousStatus) {
          update.status = content.previousStatus;
          update.previousStatus = null;
        } else {
          update.status = update.status || 'draft';
        }
        update.deletedAt = null;
      }
    }

    const updated = await Content.findOneAndUpdate(
      { _id: req.params.id, teacher: req.user.sub },
      { $set: update },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ error: 'Content not found or not yours' });
    }
    res.json({ data: updated });
  } catch (e) {
    console.error('Error updating content:', e);
    res.status(500).json({ error: 'Failed to update content', message: e.message });
  }
});

// DELETE /api/content/:id - Soft delete content (mark as deleted)
router.delete('/:id', auth(['teacher']), async (req, res) => {
  try {
    const content = await Content.findOne({ _id: req.params.id, teacher: req.user.sub });
    
    if (!content) {
      return res.status(404).json({ error: 'Content not found or not yours' });
    }

    // Check if already deleted
    if (content.status === 'deleted') {
      return res.status(400).json({ error: 'Content is already deleted' });
    }

    console.log('Marking content as deleted:', {
      id: content._id,
      title: content.title,
      previousStatus: content.status
    });

    // Store previous status and mark as deleted
    const previousStatus = content.status;
    const updated = await Content.findOneAndUpdate(
      { _id: req.params.id, teacher: req.user.sub },
      { 
        $set: { 
          status: 'deleted',
          previousStatus: previousStatus !== 'archived' ? previousStatus : content.previousStatus || 'published',
          deletedAt: new Date()
        }
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ error: 'Content not found or not yours' });
    }
    
    console.log('Content marked as deleted in MongoDB');
    
    res.json({ 
      message: 'Content deleted successfully',
      data: updated
    });
  } catch (e) {
    console.error('Error deleting content:', e);
    res.status(500).json({ error: 'Failed to delete content', message: e.message });
  }
});

module.exports = router;