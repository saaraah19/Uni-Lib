// pages/NotificationsPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { notificationService } from '../../services/notificationService';
import { FaBell, FaCheckCircle, FaArchive, FaTrash, FaFilter, FaArrowLeft, FaArrowRight, FaEllipsisV } from 'react-icons/fa';
import { Link } from 'react-router-dom';
// P2 FIX: window.confirm() replaced with the shared ConfirmationModal so
// this matches the rest of the app (MyLoans.js, LoanActionCard.jsx, etc.)
// and gets focus trap / Escape / focus restoration for free via
// useModalA11y (used internally by ConfirmationModal).
// Confirmed path: frontend/src/components/modals/ConfirmationModal.js
import { ConfirmationModal } from '../modals/ConfirmationModal';
// P2 FIX: all console.log/console.error calls below replaced with the
// shared logger utility (frontend/src/utils/logger.js) so debug noise is
// gated behind NODE_ENV in production while genuine errors (logger.error)
// remain visible for support/debugging.
import { logger } from '../../utils/logger';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [selectedIds, setSelectedIds] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [error, setError] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(null); // Track which notification's menu is open
  // P2 FIX: replaces the three window.confirm() call sites (single delete,
  // bulk delete, clear all). `type` distinguishes which confirmation is in
  // flight so one modal instance can serve all three instead of duplicating
  // markup per action.
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    type: null, // 'delete' | 'bulkDelete' | 'clearAll'
    targetId: null,
  });
  const [isConfirmLoading, setIsConfirmLoading] = useState(false);
  const pageSize = 10;

  logger.debug('🔄 NotificationsPage rendered', {
    notificationsCount: notifications.length,
    loading,
    filter,
    page,
    hasStats: !!stats,
    selectedCount: selectedIds.length
  });

  // Load notifications
  const loadNotifications = useCallback(async (pageNum = 1) => {
    logger.debug('📥 Loading notifications...', { pageNum, filter, pageSize });

    try {
      setLoading(true);
      setError(null);

      const status = filter === 'all' ? null : filter;
      logger.debug('🔍 Fetching with params:', { page: pageNum, limit: pageSize, status });

      const response = await notificationService.getUserNotifications(pageNum, pageSize, status);

      logger.debug('✅ Notifications API response received:', {
        success: response.success,
        dataLength: response.data?.length,
        pagination: response.pagination,
        firstNotification: response.data?.[0] ? {
          id: response.data[0]._id,
          title: response.data[0].title,
          status: response.data[0].status
        } : null
      });

      if (response && response.data) {
        logger.debug('📦 Setting notifications state with', response.data.length, 'items');
        setNotifications(response.data);
        setPagination(response.pagination || {});

        if (response.data.length === 0) {
          logger.debug('⚠️ No notifications returned from API');
        }
      } else {
        logger.warn('⚠️ Response missing data property:', response);
        setNotifications([]);
      }
    } catch (error) {
      logger.error('❌ Failed to load notifications:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        stack: error.stack
      });
      setError(error.message || 'Failed to load notifications');
      setNotifications([]);
    } finally {
      logger.debug('🏁 Finished loading notifications, setting loading to false');
      setLoading(false);
    }
  }, [filter]);

  // Load statistics
  const loadStats = useCallback(async () => {
    logger.debug('📊 Loading notification statistics...');

    try {
      const response = await notificationService.getNotificationStats();

      logger.debug('✅ Stats API response received:', {
        success: response.success,
        data: response.data
      });

      if (response && response.data) {
        logger.debug('📊 Setting stats state:', response.data);
        setStats(response.data);
      } else {
        logger.warn('⚠️ Stats response missing data:', response);
      }
    } catch (error) {
      logger.error('❌ Failed to load stats:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
    }
  }, []);

  // Initial load
  useEffect(() => {
    logger.debug('🎯 Initial useEffect triggered', { filter, page });

    loadNotifications(1);
    loadStats();

    // Don't add loadNotifications and loadStats to deps array to avoid infinite loops
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]); // Only re-run when filter changes

  // Handle page changes
  useEffect(() => {
    if (page !== 1) { // Skip initial page load since loadNotifications already called with page 1
      logger.debug('📄 Page changed to', page, 'loading new page');
      loadNotifications(page);
    }
  }, [page, loadNotifications]);

  // Listen for real-time updates
  useEffect(() => {
    logger.debug('🔌 Setting up notification update listener');

    const handleNotificationUpdate = (event) => {
      logger.debug('📢 Notification update event received:', event.detail);
      loadNotifications(page);
      loadStats();
    };

    window.addEventListener('notificationUpdated', handleNotificationUpdate);

    return () => {
      logger.debug('🔌 Cleaning up notification update listener');
      window.removeEventListener('notificationUpdated', handleNotificationUpdate);
    };
  }, [page, loadNotifications, loadStats]);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (mobileMenuOpen) {
        setMobileMenuOpen(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [mobileMenuOpen]);

  // Debug state changes
  useEffect(() => {
    logger.debug('📝 notifications state updated:', {
      count: notifications.length,
      items: notifications.map(n => ({ id: n._id, title: n.title, status: n.status }))
    });
  }, [notifications]);

  useEffect(() => {
    logger.debug('📝 stats state updated:', stats);
  }, [stats]);

  // Mark as read
  const handleMarkAsRead = async (id) => {
    logger.debug('✉️ Marking notification as read:', id);

    try {
      await notificationService.markAsRead(id);
      logger.debug('✅ Marked as read successfully:', id);

      setNotifications(prev => {
        const updated = prev.map(n => n._id === id ? { ...n, status: 'read' } : n);
        logger.debug('📝 Updated notifications after mark as read:', {
          previous: prev.map(n => ({ id: n._id, status: n.status })),
          updated: updated.map(n => ({ id: n._id, status: n.status }))
        });
        return updated;
      });

      loadStats();
      setMobileMenuOpen(null); // Close mobile menu if open
    } catch (error) {
      logger.error('❌ Failed to mark as read:', {
        id,
        error: error.message,
        response: error.response?.data
      });
    }
  };

  // Mark all as read
  const handleMarkAllAsRead = async () => {
    logger.debug('✉️ Marking all notifications as read');

    try {
      await notificationService.markAllAsRead();
      logger.debug('✅ Marked all as read successfully');

      setNotifications(prev => {
        const updated = prev.map(n => ({ ...n, status: 'read' }));
        logger.debug('📝 Updated all notifications to read');
        return updated;
      });

      setSelectedIds([]);
      loadStats();
    } catch (error) {
      logger.error('❌ Failed to mark all as read:', {
        error: error.message,
        response: error.response?.data
      });
    }
  };

  // Archive notification
  const handleArchive = async (id) => {
    logger.debug('📦 Archiving notification:', id);

    try {
      await notificationService.archiveNotification(id);
      logger.debug('✅ Archived successfully:', id);

      setNotifications(prev => {
        const filtered = prev.filter(n => n._id !== id);
        logger.debug('📝 Removed notification from list:', {
          previousCount: prev.length,
          newCount: filtered.length
        });
        return filtered;
      });

      setSelectedIds(prev => {
        const filtered = prev.filter(selectedId => selectedId !== id);
        logger.debug('📝 Updated selected IDs after archive:', {
          previous: prev,
          new: filtered
        });
        return filtered;
      });

      loadStats();
      setMobileMenuOpen(null); // Close mobile menu if open
    } catch (error) {
      logger.error('❌ Failed to archive:', {
        id,
        error: error.message,
        response: error.response?.data
      });
    }
  };

  // P2 FIX: previously `if (window.confirm('Delete this notification?'))`
  // followed by the delete logic inline. Now split into a "click" handler
  // that just opens the shared ConfirmationModal, and a "perform" handler
  // that does the actual delete once the user confirms in the modal.
  const handleDeleteClick = (id) => {
    logger.debug('🗑️ Delete requested for notification:', id);
    setConfirmModal({ isOpen: true, type: 'delete', targetId: id });
  };

  const performDelete = async (id) => {
    setIsConfirmLoading(true);
    try {
      await notificationService.deleteNotification(id);
      logger.debug('✅ Deleted successfully:', id);

      setNotifications(prev => {
        const filtered = prev.filter(n => n._id !== id);
        logger.debug('📝 Removed notification from list:', {
          previousCount: prev.length,
          newCount: filtered.length
        });
        return filtered;
      });

      setSelectedIds(prev => {
        const filtered = prev.filter(selectedId => selectedId !== id);
        logger.debug('📝 Updated selected IDs after delete:', {
          previous: prev,
          new: filtered
        });
        return filtered;
      });

      loadStats();
      setMobileMenuOpen(null); // Close mobile menu if open
    } catch (error) {
      logger.error('❌ Failed to delete:', {
        id,
        error: error.message,
        response: error.response?.data
      });
    } finally {
      setIsConfirmLoading(false);
      setConfirmModal({ isOpen: false, type: null, targetId: null });
    }
  };

  // Bulk actions
  const handleBulkMarkAsRead = async () => {
    logger.debug('✉️ Bulk marking as read:', selectedIds);

    try {
      await Promise.all(selectedIds.map(id => notificationService.markAsRead(id)));
      logger.debug('✅ Bulk mark as read completed');

      setNotifications(prev => {
        const updated = prev.map(n => selectedIds.includes(n._id) ? { ...n, status: 'read' } : n);
        logger.debug('📝 Updated notifications after bulk mark as read');
        return updated;
      });

      setSelectedIds([]);
      loadStats();
    } catch (error) {
      logger.error('❌ Failed to bulk mark as read:', {
        selectedIds,
        error: error.message
      });
    }
  };

  const handleBulkArchive = async () => {
    logger.debug('📦 Bulk archiving:', selectedIds);

    try {
      await Promise.all(selectedIds.map(id => notificationService.archiveNotification(id)));
      logger.debug('✅ Bulk archive completed');

      setNotifications(prev => {
        const filtered = prev.filter(n => !selectedIds.includes(n._id));
        logger.debug('📝 Removed archived notifications:', {
          previousCount: prev.length,
          newCount: filtered.length
        });
        return filtered;
      });

      setSelectedIds([]);
      loadStats();
    } catch (error) {
      logger.error('❌ Failed to bulk archive:', {
        selectedIds,
        error: error.message
      });
    }
  };

  // P2 FIX: same pattern as handleDeleteClick/performDelete above, applied
  // to bulk delete (previously `window.confirm(`Delete ${n} notifications?`)`).
  const handleBulkDeleteClick = () => {
    logger.debug('🗑️ Bulk delete requested:', selectedIds);
    setConfirmModal({ isOpen: true, type: 'bulkDelete', targetId: null });
  };

  const performBulkDelete = async () => {
    setIsConfirmLoading(true);
    try {
      await Promise.all(selectedIds.map(id => notificationService.deleteNotification(id)));
      logger.debug('✅ Bulk delete completed');

      setNotifications(prev => {
        const filtered = prev.filter(n => !selectedIds.includes(n._id));
        logger.debug('📝 Removed deleted notifications:', {
          previousCount: prev.length,
          newCount: filtered.length
        });
        return filtered;
      });

      setSelectedIds([]);
      loadStats();
    } catch (error) {
      logger.error('❌ Failed to bulk delete:', {
        selectedIds,
        error: error.message
      });
    } finally {
      setIsConfirmLoading(false);
      setConfirmModal({ isOpen: false, type: null, targetId: null });
    }
  };

  // P2 FIX: same pattern again, applied to "clear all" (previously
  // `window.confirm('Clear all notifications?')`).
  const handleClearAllClick = () => {
    logger.debug('🧹 Clear all requested');
    setConfirmModal({ isOpen: true, type: 'clearAll', targetId: null });
  };

  const performClearAll = async () => {
    setIsConfirmLoading(true);
    try {
      await notificationService.clearAllNotifications('archive');
      logger.debug('✅ Clear all completed');

      setNotifications([]);
      setSelectedIds([]);
      loadStats();
    } catch (error) {
      logger.error('❌ Failed to clear all:', error);
    } finally {
      setIsConfirmLoading(false);
      setConfirmModal({ isOpen: false, type: null, targetId: null });
    }
  };

  // Single confirm/cancel pair for the shared modal — dispatches to the
  // right "perform" function based on which action opened it.
  const handleConfirmModalConfirm = () => {
    if (confirmModal.type === 'delete') {
      performDelete(confirmModal.targetId);
    } else if (confirmModal.type === 'bulkDelete') {
      performBulkDelete();
    } else if (confirmModal.type === 'clearAll') {
      performClearAll();
    }
  };

  const handleConfirmModalCancel = () => {
    if (isConfirmLoading) return; // don't allow dismissing mid-request
    logger.debug('❌ Confirmation cancelled by user', confirmModal.type);
    setConfirmModal({ isOpen: false, type: null, targetId: null });
  };

  const toggleSelectAll = () => {
    logger.debug('🔄 Toggling select all', {
      currentSelected: selectedIds.length,
      totalNotifications: notifications.length
    });

    if (selectedIds.length === notifications.length) {
      setSelectedIds([]);
      logger.debug('📝 Cleared all selections');
    } else {
      const allIds = notifications.map(n => n._id);
      setSelectedIds(allIds);
      logger.debug('📝 Selected all notifications:', allIds);
    }
  };

  const toggleSelect = (id) => {
    logger.debug('🔄 Toggling selection for:', id);

    setSelectedIds(prev => {
      const updated = prev.includes(id)
        ? prev.filter(selectedId => selectedId !== id)
        : [...prev, id];

      logger.debug('📝 Updated selections:', {
        previous: prev,
        new: updated
      });

      return updated;
    });
  };

  const getIcon = (type) => {
    const icons = {
      info: '🔵',
      success: '🟢',
      warning: '🟠',
      alert: '🔴',
      system: '⚙️'
    };
    return icons[type] || '🔔';
  };

  const getTypeColor = (type) => {
    const colors = {
      info: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      success: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      alert: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      system: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
    };
    return colors[type] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
  };

  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    const weeks = Math.floor(days / 7);
    if (weeks < 4) return `${weeks}w ago`;
    const months = Math.floor(days / 30);
    return `${months}mo ago`;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-4 sm:py-6 md:py-8 px-3 sm:px-4 lg:px-6">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="mb-4 sm:mb-6 md:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1 sm:mb-2">
            Notifications
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            Manage all your notifications in one place
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm sm:text-base">
            <p className="font-bold">Error loading notifications:</p>
            <p className="mt-1">{error}</p>
            <button
              onClick={() => loadNotifications(page)}
              className="mt-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm sm:text-base"
            >
              Retry
            </button>
          </div>
        )}

        {/* Stats Cards - Responsive Grid */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6 md:mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-sm p-3 sm:p-4 md:p-6 border-l-4 border-blue-500">
              <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Total</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-sm p-3 sm:p-4 md:p-6 border-l-4 border-yellow-500">
              <p className="text-xl sm:text-2xl md:text-3xl font-bold text-yellow-600 dark:text-yellow-400">{stats.stats?.unread || 0}</p>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Unread</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-sm p-3 sm:p-4 md:p-6 border-l-4 border-green-500">
              <p className="text-xl sm:text-2xl md:text-3xl font-bold text-green-600 dark:text-green-400">{stats.stats?.read || 0}</p>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Read</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-sm p-3 sm:p-4 md:p-6 border-l-4 border-purple-500">
              <p className="text-xl sm:text-2xl md:text-3xl font-bold text-purple-600 dark:text-purple-400">{stats.stats?.archived || 0}</p>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Archived</p>
            </div>
          </div>
        )}

        {/* Actions Bar - Mobile Optimized */}
        <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-sm mb-4 sm:mb-6">
          <div className="p-3 sm:p-4">
            {/* Top Row - Always visible */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-4">
              {/* Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm sm:text-base text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <FaFilter className={`text-xs sm:text-sm transform transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                <span className="hidden xs:inline">Filters</span>
              </button>

              {/* Bulk Actions - Mobile friendly */}
              {selectedIds.length > 0 && (
                <>
                  {/* Desktop bulk actions */}
                  <div className="hidden sm:flex items-center gap-2 ml-auto">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {selectedIds.length} selected
                    </span>
                    <button
                      onClick={handleBulkMarkAsRead}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                    >
                      <FaCheckCircle className="text-xs" /> Mark read
                    </button>
                    <button
                      onClick={handleBulkArchive}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-sm"
                    >
                      <FaArchive className="text-xs" /> Archive
                    </button>
                    <button
                      onClick={handleBulkDeleteClick}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
                    >
                      <FaTrash className="text-xs" /> Delete
                    </button>
                  </div>

                  {/* Mobile bulk indicator */}
                  <div className="sm:hidden flex items-center gap-2 ml-auto">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {selectedIds.length}
                    </span>
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setMobileMenuOpen('bulk');
                        }}
                        className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                      >
                        <FaEllipsisV />
                      </button>
                      
                      {/* Mobile bulk menu */}
                      {mobileMenuOpen === 'bulk' && (
                        <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                          <button
                            onClick={handleBulkMarkAsRead}
                            className="w-full text-left px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                          >
                            <FaCheckCircle className="text-blue-500" /> Mark read
                          </button>
                          <button
                            onClick={handleBulkArchive}
                            className="w-full text-left px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                          >
                            <FaArchive className="text-purple-500" /> Archive
                          </button>
                          <button
                            onClick={handleBulkDeleteClick}
                            className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                          >
                            <FaTrash className="text-red-500" /> Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* Global Actions - Hidden on mobile, shown in menu */}
              <div className="hidden sm:flex items-center gap-2 ml-auto">
                <button
                  onClick={handleMarkAllAsRead}
                  className="px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Mark all as read
                </button>
                <button
                  onClick={handleClearAllClick}
                  className="px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Clear all
                </button>
              </div>
            </div>

            {/* Filter Options - Collapsible */}
            {showFilters && (
              <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex flex-wrap gap-2 sm:gap-3">
                  {['all', 'unread', 'read', 'archived'].map((f) => (
                    <button
                      key={f}
                      onClick={() => {
                        logger.debug('🔍 Filter changed to:', f);
                        setFilter(f);
                        setPage(1); // Reset to first page when filter changes
                        setShowFilters(false); // Auto-close on mobile after selection
                      }}
                      className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                        filter === f
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      {f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Notifications List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="text-center py-8 sm:py-12 md:py-16">
              <div className="inline-block w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 border-4 border-gray-200 dark:border-gray-700 border-t-blue-500 rounded-full animate-spin"></div>
              <p className="mt-3 sm:mt-4 text-sm sm:text-base text-gray-600 dark:text-gray-400">Loading notifications...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-8 sm:py-12 md:py-16 px-4">
              <FaBell className="mx-auto text-4xl sm:text-5xl md:text-6xl text-gray-300 dark:text-gray-600 mb-3 sm:mb-4" />
              <h3 className="text-lg sm:text-xl font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                No notifications
              </h3>
              <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">
                You're all caught up! Check back later for updates.
              </p>
            </div>
          ) : (
            <>
              {/* Desktop Table Header - Hidden on mobile */}
              <div className="hidden md:grid grid-cols-12 gap-4 px-4 sm:px-6 py-3 sm:py-4 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600 text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300">
                <div className="col-span-1">
                  <input
                    type="checkbox"
                    checked={selectedIds.length === notifications.length && notifications.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded border-gray-300 dark:border-gray-600 text-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div className="col-span-6">Notification</div>
                <div className="col-span-2">Type</div>
                <div className="col-span-2">Date</div>
                <div className="col-span-1">Actions</div>
              </div>

              {/* Notifications - Mobile Optimized Cards */}
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {notifications.map((notification) => (
                  <div
                    key={notification._id}
                    className={`p-3 sm:p-4 md:p-6 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors ${
                      notification.status === 'unread' ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                    }`}
                  >
                    {/* Mobile Layout (< md) */}
                    <div className="md:hidden">
                      {/* Top Row - Checkbox and Title */}
                      <div className="flex items-start gap-3 mb-2">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(notification._id)}
                          onChange={() => toggleSelect(notification._id)}
                          className="mt-1 rounded border-gray-300 dark:border-gray-600 text-blue-500 focus:ring-blue-500"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start gap-2">
                            <span className="text-xl flex-shrink-0">{getIcon(notification.type)}</span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 mb-0.5">
                                <h3 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white truncate">
                                  {notification.title}
                                </h3>
                                {notification.status === 'unread' && (
                                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0"></span>
                                )}
                              </div>
                              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                                {notification.message}
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        {/* Mobile Menu Button */}
                        <div className="relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setMobileMenuOpen(mobileMenuOpen === notification._id ? null : notification._id);
                            }}
                            className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                          >
                            <FaEllipsisV className="text-sm" />
                          </button>
                          
                          {/* Mobile Action Menu */}
                          {mobileMenuOpen === notification._id && (
                            <div className="absolute right-0 mt-1 w-36 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                              {notification.status === 'unread' && (
                                <button
                                  onClick={() => handleMarkAsRead(notification._id)}
                                  className="w-full text-left px-3 py-2.5 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                                >
                                  <FaCheckCircle className="text-blue-500" /> Mark read
                                </button>
                              )}
                              <button
                                onClick={() => handleArchive(notification._id)}
                                className="w-full text-left px-3 py-2.5 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                              >
                                <FaArchive className="text-purple-500" /> Archive
                              </button>
                              <button
                                onClick={() => handleDeleteClick(notification._id)}
                                className="w-full text-left px-3 py-2.5 text-xs text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                              >
                                <FaTrash className="text-red-500" /> Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Bottom Row - Meta Info */}
                      <div className="flex items-center gap-2 ml-9">
                        <span className={`inline-block px-2 py-0.5 text-xs rounded-full ${getTypeColor(notification.type)}`}>
                          {notification.type}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400" title={formatDate(notification.createdAt)}>
                          {getTimeAgo(notification.createdAt)}
                        </span>
                      </div>

                      {/* Action Link */}
                      {notification.actionUrl && (
                        <div className="mt-2 ml-9">
                          <Link
                            to={notification.actionUrl}
                            className="text-xs text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 inline-flex items-center gap-1"
                            onClick={() => {
                              if (notification.status === 'unread') {
                                handleMarkAsRead(notification._id);
                              }
                            }}
                          >
                            View details →
                          </Link>
                        </div>
                      )}
                    </div>

                    {/* Desktop Layout (md+) */}
                    <div className="hidden md:grid md:grid-cols-12 gap-4 items-start">
                      {/* Checkbox */}
                      <div className="col-span-1">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(notification._id)}
                          onChange={() => toggleSelect(notification._id)}
                          className="rounded border-gray-300 dark:border-gray-600 text-blue-500 focus:ring-blue-500"
                        />
                      </div>

                      {/* Content */}
                      <div className="col-span-6">
                        <div className="flex items-start gap-3">
                          <span className="text-2xl flex-shrink-0">{getIcon(notification.type)}</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-gray-900 dark:text-white">
                                {notification.title}
                              </h3>
                              {notification.status === 'unread' && (
                                <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></span>
                              )}
                            </div>
                            <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                              {notification.message}
                            </p>

                            {notification.actionUrl && (
                              <Link
                                to={notification.actionUrl}
                                className="text-sm text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 inline-flex items-center gap-1"
                                onClick={() => {
                                  if (notification.status === 'unread') {
                                    handleMarkAsRead(notification._id);
                                  }
                                }}
                              >
                                View details →
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Type */}
                      <div className="col-span-2">
                        <span className={`inline-block px-3 py-1 text-xs rounded-full ${getTypeColor(notification.type)}`}>
                          {notification.type}
                        </span>
                      </div>

                      {/* Date */}
                      <div className="col-span-2 text-sm text-gray-500 dark:text-gray-400">
                        <div title={formatDate(notification.createdAt)}>
                          {getTimeAgo(notification.createdAt)}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="col-span-1 flex gap-1">
                        {notification.status === 'unread' && (
                          <button
                            onClick={() => handleMarkAsRead(notification._id)}
                            className="p-1.5 text-gray-500 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            title="Mark as read"
                          >
                            <FaCheckCircle className="text-sm" />
                          </button>
                        )}
                        <button
                          onClick={() => handleArchive(notification._id)}
                          className="p-1.5 text-gray-500 hover:text-purple-500 hover:bg-purple-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                          title="Archive"
                        >
                          <FaArchive className="text-sm" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(notification._id)}
                          className="p-1.5 text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <FaTrash className="text-sm" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination - Mobile Optimized */}
              {pagination.totalPages > 1 && (
                <div className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
                  {/* Mobile Pagination (< sm) */}
                  <div className="sm:hidden">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Page {pagination.page} of {pagination.totalPages}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {((pagination.page - 1) * pageSize) + 1}-{Math.min(pagination.page * pageSize, pagination.total)} of {pagination.total}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={!pagination.hasPrevPage}
                        className="flex-1 px-3 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm flex items-center justify-center gap-1"
                      >
                        <FaArrowLeft className="text-xs" /> Prev
                      </button>
                      <button
                        onClick={() => setPage(p => p + 1)}
                        disabled={!pagination.hasNextPage}
                        className="flex-1 px-3 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm flex items-center justify-center gap-1"
                      >
                        Next <FaArrowRight className="text-xs" />
                      </button>
                    </div>
                  </div>

                  {/* Desktop Pagination (sm+) */}
                  <div className="hidden sm:flex items-center justify-between">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Showing {((pagination.page - 1) * pageSize) + 1} to {Math.min(pagination.page * pageSize, pagination.total)} of {pagination.total} notifications
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={!pagination.hasPrevPage}
                        className="px-3 sm:px-4 py-1.5 sm:py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm flex items-center gap-1"
                      >
                        <FaArrowLeft className="text-xs" /> Previous
                      </button>
                      <span className="px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-500 text-white rounded-lg text-sm">
                        Page {pagination.page} of {pagination.totalPages}
                      </span>
                      <button
                        onClick={() => setPage(p => p + 1)}
                        disabled={!pagination.hasNextPage}
                        className="px-3 sm:px-4 py-1.5 sm:py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm flex items-center gap-1"
                      >
                        Next <FaArrowRight className="text-xs" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* P2 FIX: shared confirmation modal, replaces the three window.confirm()
          call sites (single delete, bulk delete, clear all). */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        title={
          confirmModal.type === 'clearAll'
            ? 'Clear all notifications?'
            : confirmModal.type === 'bulkDelete'
            ? `Delete ${selectedIds.length} notification${selectedIds.length === 1 ? '' : 's'}?`
            : 'Delete this notification?'
        }
        message={
          confirmModal.type === 'clearAll'
            ? 'All your notifications will be archived and this list will be cleared.'
            : confirmModal.type === 'bulkDelete'
            ? 'The selected notifications will be permanently deleted.'
            : 'This notification will be permanently deleted.'
        }
        onConfirm={handleConfirmModalConfirm}
        onCancel={handleConfirmModalCancel}
        isLoading={isConfirmLoading}
        confirmText={
          confirmModal.type === 'clearAll'
            ? 'Clear all'
            : confirmModal.type === 'bulkDelete'
            ? 'Delete'
            : 'Delete'
        }
        cancelText="Cancel"
        isDangerous={true}
      />
    </div>
  );
};

export default NotificationsPage;
