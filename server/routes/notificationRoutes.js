const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
    getUserNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification
} = require('../controllers/notificationController');

// All routes are protected
router.use(auth());

router.get('/', getUserNotifications);
router.post('/mark-all-read', markAllAsRead);
router.put('/:id/read', markAsRead);
router.delete('/:id', deleteNotification);

module.exports = router;
