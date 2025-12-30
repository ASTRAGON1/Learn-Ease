const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const ctrl = require('../controllers/storageController');

router.get('/', auth(['teacher']), ctrl.getContent);
router.post('/', auth(['teacher']), ctrl.createContent);
router.get('/published', auth(['student', 'teacher', 'admin']), ctrl.getPublishedContent);

// PATCH /api/content/:id - Update content (for archiving, restoring, etc.)
router.patch('/:id', auth(['teacher']), ctrl.updateContent);

// DELETE /api/content/:id - Soft delete content (mark as deleted)
router.delete('/:id', auth(['teacher']), ctrl.deleteContent);

module.exports = router;