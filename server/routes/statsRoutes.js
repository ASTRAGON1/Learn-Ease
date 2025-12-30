const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');

/**
 * @route   GET /api/stats/snapshot
 * @desc    Get snapshot statistics for landing page (students and active teachers count)
 * @access  Public
 */
router.get('/snapshot', statsController.getSnapshot);

module.exports = router;

