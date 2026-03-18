const express = require("express");
const router = express.Router();
const { protect, admin } = require("../middleware/authMiddleware");
const notificationController = require("../controllers/notificationController");

// Create a notification (admins or systems can use)
router.post("/", protect, notificationController.createNotification);

// Get notifications for current user
router.get("/", protect, notificationController.getNotificationsForUser);

// Mark a single notification as read
router.put("/:id/read", protect, notificationController.markAsRead);

// Mark all as read for current user
router.put("/read-all", protect, notificationController.markAllAsRead);

// Get unread count
router.get("/unread-count", protect, notificationController.getUnreadCount);

// Delete a notification
router.delete("/:id", protect, notificationController.deleteNotification);

// Admin: list all notifications
router.get("/admin/all", protect, admin, notificationController.adminListAll);

// Dev-only: quick broadcast for testing
if (process.env.NODE_ENV !== 'production') {
	router.post('/dev-send', notificationController.createDevNotification);
}

module.exports = router;
