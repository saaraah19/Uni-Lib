const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  // Reference to the user who receives this notification
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  
  message: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  
  status: {
    type: String,
    enum: ['unread', 'read', 'archived'],
    default: 'unread',
    index: true
  },
  
  // Auto-generated timestamp
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  
  // Auto-delete after X days (see TTL index below)
  expiresAt: {
    type: Date,
    default: function() {
      // Auto-delete after 30 days
      return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    }
  },
  
  // Optional: Where to go when user clicks the notification
  actionUrl: {
    type: String,
    default: null
  },
  
  // Optional: Visual indicator
  icon: {
    type: String,
    default: 'bell'
  },
  
  // Optional: For categorizing notifications
  type: {
    type: String,
    enum: ['info', 'alert', 'success', 'warning', 'system'],
    default: 'info'
  }
}, {
  timestamps: false,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound index for common queries
notificationSchema.index({ user: 1, status: 1, expiresAt: 1 });

// FIX: TTL index was previously declared only in a comment, so expiresAt
// had zero effect in MongoDB and the collection grew unbounded.
// MongoDB's TTL monitor will physically delete documents once expiresAt
// is in the past (runs roughly every 60s, so deletion isn't instantaneous).
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Virtual property: Check if notification is expired
notificationSchema.virtual('isExpired').get(function() {
  return this.expiresAt && this.expiresAt < new Date();
});

// Instance method: Mark as read
notificationSchema.methods.markAsRead = function() {
  this.status = 'read';
  return this.save();
};

// Static method: Get user's unread count
notificationSchema.statics.getUnreadCount = function(userId) {
  return this.countDocuments({ 
    user: userId, 
    status: 'unread',
    expiresAt: { $gt: new Date() }
  });
};

const Notification = mongoose.model('Notification', notificationSchema);
module.exports = Notification;
