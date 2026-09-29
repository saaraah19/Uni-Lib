import api from "./api";

export const notificationService = {
  /// Get user notifications with pagination
  getUserNotifications: async (page = 1, limit = 20, status = null) => {
    try {
      let url = `/notifications?page=${page}&limit=${limit}`;
      if (status) {
        url += `&status=${status}`;
      }
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error(
        "Get notifications error:",
        error.response?.data || error.message
      );
      throw error;
    }
  },

  // Get unread count
  getUnreadCount: async () => {
    try {
      const response = await api.get('/notifications/unread-count');
      return response.data;
    } catch (error) {
      console.error(
        "Get unread count error:",
        error.response?.data || error.message
      );
      throw error;
    }
  },

  // Get notification statistics
  getNotificationStats: async () => {
    try {
      const response = await api.get('/notifications/stats');
      return response.data;
    } catch (error) {
      console.error(
        "Get stats error:",
        error.response?.data || error.message
      );
      throw error;
    }
  },

  // Mark a single notification as read
  markAsRead: async (notificationId) => {
    try {
      const response = await api.put(`/notifications/${notificationId}/read`);
      
      // Dispatch event for real-time UI updates
      window.dispatchEvent(
        new CustomEvent("notificationUpdated", {
          detail: { action: "read", notificationId }
        })
      );
      
      return response.data;
    } catch (error) {
      console.error(
        "Mark as read error:",
        error.response?.data || error.message
      );
      throw error;
    }
  },

  // Mark all notifications as read
  markAllAsRead: async () => {
    try {
      const response = await api.put('/notifications/read-all');
      
      window.dispatchEvent(
        new CustomEvent("notificationUpdated", {
          detail: { action: "readAll" }
        })
      );
      
      return response.data;
    } catch (error) {
      console.error(
        "Mark all as read error:",
        error.response?.data || error.message
      );
      throw error;
    }
  },

  // Archive a notification
  archiveNotification: async (notificationId) => {
    try {
      const response = await api.put(`/notifications/${notificationId}/archive`);
      
      window.dispatchEvent(
        new CustomEvent("notificationUpdated", {
          detail: { action: "archive", notificationId }
        })
      );
      
      return response.data;
    } catch (error) {
      console.error(
        "Archive notification error:",
        error.response?.data || error.message
      );
      throw error;
    }
  },

  // Delete a notification
  deleteNotification: async (notificationId) => {
    try {
      const response = await api.delete(`/notifications/${notificationId}`);
      
      window.dispatchEvent(
        new CustomEvent("notificationUpdated", {
          detail: { action: "delete", notificationId }
        })
      );
      
      return response.data;
    } catch (error) {
      console.error(
        "Delete notification error:",
        error.response?.data || error.message
      );
      throw error;
    }
  },

  // Clear all notifications (archive or delete)
  clearAllNotifications: async (action = 'archive') => {
    try {
      console.log('🔵 Calling clearAllNotifications with action:', action);
      const url = `/notifications/clear-all?action=${action}`;
      console.log('🔵 Full URL:', url);    
      const response = await api.delete(url);
      window.dispatchEvent(
        new CustomEvent("notificationUpdated", {
          detail: { action: "clearAll" }
        })
      );
      
      return response.data;
    } catch (error) {
      console.error("❌ Clear all notifications error:", error.response?.data || error.message);
      throw error;
    }
  },

  // Create a notification (admin/internal use)
  createNotification: async (notificationData) => {
    try {
      const response = await api.post('/notifications', notificationData);
      
      window.dispatchEvent(
        new CustomEvent("notificationCreated", {
          detail: { notification: response.data.data }
        })
      );
      
      return response.data;
    } catch (error) {
      console.error(
        "Create notification error:",
        error.response?.data || error.message
      );
      throw error;
    }
  },

  // 📢 NEW: Send notification about new book to all users
  sendNewBookNotification: async (bookData) => {
    try {
      const response = await api.post('/notify-new-book', {
        bookId: bookData._id,
        bookTitle: bookData.title,
        bookAuthor: bookData.author || 'Auteur inconnu'
      });
      return response.data;
    } catch (error) {
      console.error("Send new book notification error:", error.response?.data || error.message);
      throw error;
    }
  }
};