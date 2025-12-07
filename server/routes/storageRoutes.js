const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const ctrl = require('../controllers/storageController');
const Content = require('../models/Content');

router.get('/', auth(['teacher']), ctrl.getContent);
router.post('/', auth(['teacher']), ctrl.createContent);

// PATCH /api/content/:id - Update content (for archiving)
router.patch('/:id', auth(['teacher']), async (req, res) => {
  try {
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
    console.error('Error updating content:', e);
    res.status(500).json({ error: 'Failed to update content', message: e.message });
  }
});

// DELETE /api/content/:id - Delete content
router.delete('/:id', auth(['teacher']), async (req, res) => {
  try {
    const content = await Content.findOne({ _id: req.params.id, teacher: req.user.sub });
    
    if (!content) {
      return res.status(404).json({ error: 'Content not found or not yours' });
    }

    console.log('Deleting content:', {
      id: content._id,
      title: content.title,
      storagePath: content.storagePath,
      fileURL: content.fileURL
    });

    // Store storagePath before deletion
    const storagePath = content.storagePath || null;

    // Delete from MongoDB
    await Content.deleteOne({ _id: req.params.id, teacher: req.user.sub });
    
    console.log('Content deleted from MongoDB. StoragePath to delete:', storagePath);
    
    // Return storagePath so frontend can delete from Firebase
    res.json({ 
      message: 'Content deleted successfully',
      storagePath: storagePath
    });
  } catch (e) {
    console.error('Error deleting content:', e);
    res.status(500).json({ error: 'Failed to delete content', message: e.message });
  }
});

module.exports = router;