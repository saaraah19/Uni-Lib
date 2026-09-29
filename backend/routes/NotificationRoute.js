// routes/notificationRoutes.js
const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/NotificationController');
const authMiddleware = require('../middlewares/authMiddleware'); // Your auth middleware
const onlyStaffAllow = require('../middlewares/OnlyStaffMiddleware')
// Get notifications
router.get('/',authMiddleware, notificationController.getUserNotifications);
router.get('/unread-count',authMiddleware, notificationController.getUnreadCount);
router.get('/stats',authMiddleware, notificationController.getNotificationStats);

router.delete('/clear-all',authMiddleware, notificationController.clearAllNotifications);

// Mark notifications
router.put('/:id/read', authMiddleware,notificationController.markAsRead);
router.put('/read-all',authMiddleware, notificationController.markAllAsRead);
router.put('/:id/archive',authMiddleware, notificationController.archiveNotification);

// Delete notifications
router.delete('/:id',authMiddleware, notificationController.deleteNotification);

// Create notification (admin/internal use - add admin middleware if needed)
router.post('/', authMiddleware,onlyStaffAllow,notificationController.createNotification);
router.post('/notify-new-book', authMiddleware, onlyStaffAllow, notificationController.notifyNewBook);

module.exports = router;