const Notification = require("../models/Notification");
const mongoose = require("mongoose");
const User = require('../models/User')
// P2 FIX: unguarded console.log/console.error calls replaced with the
// shared backend logger (backend/utils/logger.js). This file had by far
// the noisiest debug logging in the backend (getNotificationStats alone
// had ~14 console.log calls, one of which prints the full req.user object)
// — gating it behind NODE_ENV means none of that reaches production logs
// by default. ASSUMPTION TO VERIFY: same as LoanController.js, this
// assumes logger.debug/info/warn/error exist on the backend logger export;
// adjust if the real module differs.
const logger = require('../utils/logger');
// Helper function to validate ObjectId
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

/**
 * Get all notifications for a user (with pagination)
 * GET /api/notifications
 */
exports.getUserNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const status = req.query.status; // Optional: filter by status

    // Build query
    const query = {
      user: userId,
      expiresAt: { $gt: new Date() }, // Not expired
    };
    logger.debug("   - Base query:", JSON.stringify(query, null, 2));

    // Add status filter if provided
    if (status && ["unread", "read", "archived"].includes(status)) {
      query.status = status;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get notifications
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Get total count for pagination info
    const total = await Notification.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      data: notifications,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    logger.error("Get notifications error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching notifications",
    });
  }
};

/**
 * Get unread notifications count
 * GET /api/notifications/unread-count
 */
exports.getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;

    const count = await Notification.getUnreadCount(userId);

    res.status(200).json({
      success: true,
      count,
    });
  } catch (error) {
    logger.error("Get unread count error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching unread count",
    });
  }
};

/**
 * Mark a notification as read
 * PUT /api/notifications/:id/read
 */
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Validate notification ID
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid notification ID",
      });
    }

    // Find and update
    const notification = await Notification.findOneAndUpdate(
      {
        _id: id,
        user: userId, // Ensure user owns this notification
        status: "unread", // Only mark unread notifications
      },
      { status: "read" },
      { new: true },
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found or already read",
      });
    }

    res.status(200).json({
      success: true,
      data: notification,
      message: "Notification marked as read",
    });
  } catch (error) {
    logger.error("Mark as read error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while marking notification as read",
    });
  }
};

/**
 * Mark all notifications as read
 * PUT /api/notifications/read-all
 */
exports.markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await Notification.updateMany(
      {
        user: userId,
        status: "unread",
        expiresAt: { $gt: new Date() },
      },
      { status: "read" },
    );

    res.status(200).json({
      success: true,
      message: `${result.modifiedCount} notifications marked as read`,
    });
  } catch (error) {
    logger.error("Mark all as read error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while marking all notifications as read",
    });
  }
};

/**
 * Archive a notification
 * PUT /api/notifications/:id/archive
 */
exports.archiveNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid notification ID",
      });
    }

    const notification = await Notification.findOneAndUpdate(
      {
        _id: id,
        user: userId, // Security: user can only archive their own
        status: { $in: ["unread", "read"] }, // Can't archive already archived
      },
      { status: "archived" },
      { new: true },
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found or already archived",
      });
    }

    res.status(200).json({
      success: true,
      data: notification,
      message: "Notification archived",
    });
  } catch (error) {
    logger.error("Archive notification error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while archiving notification",
    });
  }
};

/**
 * Delete a notification
 * DELETE /api/notifications/:id
 */
exports.deleteNotification = async (req, res) => {
  try {
   
    const { id } = req.params;
    const userId = req.user.id;
    
    logger.debug('📌 Trying to delete notification with id:', id);
    
    if (!isValidObjectId(id)) {
      logger.debug('❌ Invalid notification ID:', id);
      return res.status(400).json({
        success: false,
        message: 'Invalid notification ID'
      });
    }
    
    const notification = await Notification.findOneAndDelete({
      _id: id,
      user: userId
    });
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    logger.error('Delete notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting notification'
    });
  }
};

/**
 * Clear all notifications (archive or delete all)
 * DELETE /api/notifications/clear-all
 */
exports.clearAllNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const action = req.query.action || 'archive'; // 'archive' or 'delete'
    
    logger.debug('📌 userId:', userId, 'action:', action);
    
    if (action === 'delete') {
      // Permanently delete all notifications
      const result = await Notification.deleteMany({ user: userId });
      
      res.status(200).json({
        success: true,
        message: `${result.deletedCount} notifications deleted permanently`
      });
    } else {
      // Archive ALL notifications - regardless of current status
      // This will affect unread, read, AND already archived ones
      const result = await Notification.updateMany(
        { user: userId }, // No status filter - target ALL user notifications
        { status: 'archived' }
      );
      
      logger.debug('✅ Archived count:', result.modifiedCount);
      
      res.status(200).json({
        success: true,
        message: `${result.modifiedCount} notifications archived`
      });
    }
  } catch (error) {
    logger.error('❌ Clear all notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while clearing notifications'
    });
  }
};
/**
 * Create a notification (usually called internally by other services)
 * This endpoint might be admin-only or internal use
 * POST /api/notifications
 */
exports.createNotification = async (req, res) => {
  try {
    const { userId, title, message, actionUrl } = req.body;

    // For admin use, you might allow specifying userId
    // For user-facing, use req.user._id
    const targetUserId = userId || req.user.id;

    // Validation
    if (!targetUserId || !title || !message) {
      return res.status(400).json({
        success: false,
        message: "userId, title, and message are required",
      });
    }

    if (!isValidObjectId(targetUserId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    // Create notification
    const notification = await Notification.create({
      user: targetUserId,
      title: title.trim(),
      message: message.trim(),
      actionUrl: actionUrl || null,
    });

    // If you have real-time setup, emit event here
    // io.to(targetUserId).emit('new-notification', notification);

    res.status(201).json({
      success: true,
      data: notification,
      message: "Notification created successfully",
    });
  } catch (error) {
    logger.error("Create notification error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while creating notification",
    });
  }
};

/**
 * Get notification statistics (optional, for dashboard)
 * GET /api/notifications/stats
 */
exports.getNotificationStats = async (req, res) => {
  try {
    logger.debug("📊 STATS ENDPOINT CALLED");
    logger.debug("   - req.user:", req.user);

    const userId = req.user.id;
    logger.debug("   - userId from token:", userId);

    if (!userId) {
      logger.error("❌ No userId found in request!");
      return res.status(400).json({
        success: false,
        message: "User ID not found",
      });
    }

    // Check if userId is a valid ObjectId
    if (!isValidObjectId(userId)) {
      logger.error("❌ Invalid userId format:", userId);
      return res.status(400).json({
        success: false,
        message: "Invalid user ID format",
      });
    }

    logger.debug("   - Counting total notifications...");
    const total = await Notification.countDocuments({
      user: userId,
      expiresAt: { $gt: new Date() },
    });
    logger.debug("   - Total count:", total);

    logger.debug("   - Counting unread...");
    const unread = await Notification.countDocuments({
      user: userId,
      status: "unread",
      expiresAt: { $gt: new Date() },
    });
    logger.debug("   - Unread count:", unread);

    logger.debug("   - Counting read...");
    const read = await Notification.countDocuments({
      user: userId,
      status: "read",
      expiresAt: { $gt: new Date() },
    });
    logger.debug("   - Read count:", read);

    logger.debug("   - Counting archived...");
    const archived = await Notification.countDocuments({
      user: userId,
      status: "archived",
      expiresAt: { $gt: new Date() },
    });
    logger.debug("   - Archived count:", archived);

    const response = {
      success: true,
      data: {
        total,
        stats: {
          unread,
          read,
          archived,
        },
      },
    };

    logger.debug("📊 STATS RESPONSE:", JSON.stringify(response, null, 2));

    res.status(200).json(response);
  } catch (error) {
    logger.error("❌ Get stats error DETAILS:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });
    res.status(500).json({
      success: false,
      message: "Server error while fetching notification statistics",
      error: error.message, // Only for debugging, remove in production
    });
  }
};
/**
 * Send new book notification to all users
 * POST /api/notifications/notify-new-book
 */
exports.notifyNewBook = async (req, res) => {
  try {
    const { bookId, bookTitle, bookAuthor } = req.body;
    
    logger.debug(`📢 Sending new book notification for: ${bookTitle}`);
    logger.debug("📢 Received notification request:", { bookId, bookTitle, bookAuthor });

    // Get all users from database (exclude staff if you want)
    const users = await User.find({}, '_id'); // Get all users
    // OR only students: const users = await User.find({ role: 'student' }, '_id');
    
    logger.debug(`📢 Found ${users.length} users to notify`);
    
    if (users.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No users to notify'
      });
    }
    
    // Create notification for each user
    const notifications = users.map(user => ({
      user: user._id,
      title: '📚 Nouveau livre disponible',
      message: `Le livre "${bookTitle}" ${bookAuthor ? `par ${bookAuthor}` : ''} a été ajouté à la bibliothèque.`,
      type: 'info',
      status: 'unread',
      actionUrl: `/books/${bookId}`,
      icon: 'book',
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    }));
    
    // Insert all notifications at once
    const Notification = require('../models/Notification');
    await Notification.insertMany(notifications);
    
    res.status(200).json({
      success: true,
      message: `Notifications sent to ${users.length} users`
    });
    
  } catch (error) {
    logger.error('Error sending new book notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending notifications',
      error: error.message
    });
  }
};
