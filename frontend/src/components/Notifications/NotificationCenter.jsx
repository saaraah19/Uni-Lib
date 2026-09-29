import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  FaBell, 
  FaCheck, 
  FaArchive, 
  FaTrash, 
  FaEllipsisV,
  FaChevronDown,
  FaTimes,

  FaInfoCircle,
  FaCheckCircle,
  FaExclamationTriangle,
  FaCog
} from 'react-icons/fa';
import { notificationService } from '../../services/notificationService';
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

const NotificationCenter = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  // P2 FIX: replaces the two window.confirm() call sites (single delete +
  // clear all). `type` distinguishes which confirmation is in flight so a
  // single modal instance + a single confirm/cancel handler pair can serve
  // both actions instead of duplicating the modal markup.
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    type: null, // 'delete' | 'clearAll'
    targetId: null,
  });
  const [isConfirmLoading, setIsConfirmLoading] = useState(false);
  const dropdownRef = useRef(null);
  const pageSize = 10;

  logger.debug("🔄 NotificationCenter rendered");
  logger.debug("📊 Current state:", { isOpen, notificationsCount: notifications.length, unreadCount, loading, page, hasMore, filter });

  // Prevent body scroll when modal is open on mobile
  useEffect(() => {
    if (isOpen && window.innerWidth < 640) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Wrap loadNotifications in useCallback to prevent infinite loops
  const loadNotifications = useCallback(async (pageNum = 1, reset = false) => {
    logger.debug("🔍 ===== LOAD NOTIFICATIONS CALLED =====");
    logger.debug("📌 Parameters:", { pageNum, reset, filter, pageSize });
    
    try {
      setLoading(true);
      /// IMPORTANT: When filter is 'all', we want to show ONLY unread and read
      // NOT archived notifications      
      let status;
      if (filter === 'all') {
        status = null; // Send null to backend, which will return unread + read
      } else {
        status = filter; // Send 'unread', 'read', or 'archived'
      }
      
      logger.debug("🔎 Fetching with status:", status, "page:", pageNum);
      
      logger.debug("📡 Calling API: notificationService.getUserNotifications(", pageNum, ",", pageSize, ",", status, ")");
      const response = await notificationService.getUserNotifications(
        pageNum, 
        pageSize, 
        status
      );
      
      logger.debug("📦 RAW API RESPONSE:", response);
      
      if (response) {
        logger.debug("✅ Response received successfully");
        
        if (response.data) {
          logger.debug("📋 Notifications data array:", response.data);
          logger.debug("📋 Data length:", response.data.length);
          
          if (response.data.length === 0) {
            logger.debug("⚠️ No notifications in this page");
          } else {
            logger.debug("✅ Found", response.data.length, "notifications");
          }
          
          if (reset) {
            logger.debug("🔄 Resetting notifications (page 1)");
            setNotifications(response.data);
          } else {
            logger.debug("➕ Appending", response.data.length, "notifications to existing", notifications.length);
            setNotifications(prev => {
              const newList = [...prev, ...response.data];
              return newList;
            });
          }
          
          if (response.pagination) {
            logger.debug("📄 Pagination info:", response.pagination);
            setHasMore(response.pagination.hasNextPage || false);
          } else {
            logger.debug("⚠️ No pagination in response");
            setHasMore(false);
          }
          
          setPage(pageNum);
          logger.debug("✅ Page set to:", pageNum);
        } else {
          logger.error("❌ Response has no 'data' property!", response);
          
          if (Array.isArray(response)) {
            logger.debug("📋 Response is an array directly:", response);
            if (reset) {
              setNotifications(response);
            } else {
              setNotifications(prev => [...prev, ...response]);
            }
            setHasMore(false);
            setPage(pageNum);
          } else {
            logger.debug("⚠️ Unexpected response format");
          }
        }
      } else {
        logger.error("❌ Response is null or undefined");
      }
      
    } catch (error) {
      logger.error('❌ Failed to load notifications:', error);
    } finally {
      setLoading(false);
      logger.debug("🔚 Loading finished, loading state:", false);
    }
  }, [filter, pageSize, notifications.length]);

  const getUnreadCount = useCallback(async () => {
    logger.debug("🔢 Getting unread count...");
    try {
      const response = await notificationService.getUnreadCount();
      logger.debug("📊 Unread count response:", response);
      
      if (response && response.count !== undefined) {
        setUnreadCount(response.count);
        logger.debug("✅ Unread count set to:", response.count);
      }
    } catch (error) {
      logger.error('❌ Failed to get unread count:', error);
    }
  }, []);

  // First useEffect - load when dropdown opens or filter changes
  useEffect(() => {
    logger.debug("🎯 useEffect triggered: isOpen or filter changed");
    logger.debug("isOpen:", isOpen, "filter:", filter);
    
    if (isOpen) {
      logger.debug("🟢 Dropdown is open, loading notifications...");
      loadNotifications(1, true);
      getUnreadCount();
    } else {
      logger.debug("🔴 Dropdown is closed");
      setShowMobileMenu(false);
      setSelectedNotification(null);
    }
  }, [isOpen, filter, loadNotifications, getUnreadCount]);

  // Click outside handler
  useEffect(() => {
    logger.debug("🖱️ Setting up click outside handler");
    
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        logger.debug("👆 Click outside detected, closing dropdown");
        setIsOpen(false);
        setShowMobileMenu(false);
        setSelectedNotification(null);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      logger.debug("🧹 Cleaning up click outside handler");
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Real-time updates
  useEffect(() => {
    logger.debug("📡 Setting up real-time update listener");
    
    const handleNotificationUpdate = () => {
      logger.debug("🔔 Notification update event received!");
      if (isOpen) {
        logger.debug("🔄 Reloading notifications due to update");
        loadNotifications(1, true);
      }
      getUnreadCount();
    };

    window.addEventListener('notificationUpdated', handleNotificationUpdate);
    return () => {
      logger.debug("🧹 Cleaning up real-time update listener");
      window.removeEventListener('notificationUpdated', handleNotificationUpdate);
    };
  }, [isOpen, loadNotifications, getUnreadCount]);

  // Log when notifications state changes
  useEffect(() => {
    logger.debug("📋 NOTIFICATIONS STATE UPDATED:", notifications);
  }, [notifications]);

  const handleMarkAsRead = async (id, event) => {
    if (event) {
      event.stopPropagation();
    }
    logger.debug("✅ Mark as read clicked for notification:", id);
    
    try {
      await notificationService.markAsRead(id);
      logger.debug("✅ Mark as read successful for:", id);
      
      setNotifications(prev =>
        prev.map(notif =>
          notif._id === id ? { ...notif, status: 'read' } : notif
        )
      );
      
      getUnreadCount();
      setSelectedNotification(null);
    } catch (error) {
      logger.error('❌ Failed to mark as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    logger.debug("✅ Mark all as read clicked");
    
    try {
      await notificationService.markAllAsRead();
      logger.debug("✅ Mark all as read successful");
      
      setNotifications(prev =>
        prev.map(notif => ({ ...notif, status: 'read' }))
      );
      
      setUnreadCount(0);
      logger.debug("✅ Unread count set to 0");
      setShowMobileMenu(false);
    } catch (error) {
      logger.error('❌ Failed to mark all as read:', error);
    }
  };

  const handleArchive = async (id, event) => {
    if (event) {
      event.stopPropagation();
    }
    logger.debug("📦 Archive clicked for notification:", id);
    
    try {
      await notificationService.archiveNotification(id);
      logger.debug("✅ Archive successful for:", id);
      
      setNotifications(prev => {
        const filtered = prev.filter(notif => notif._id !== id);
        logger.debug("📋 Notifications after archive:", filtered.length);
        return filtered;
      });
      
      getUnreadCount();
      setSelectedNotification(null);
    } catch (error) {
      logger.error('❌ Failed to archive:', error);
    }
  };

  // P2 FIX: previously `if (window.confirm('Delete this notification?'))`
  // followed by the delete logic inline. Now split into a "click" handler
  // that just opens the shared ConfirmationModal, and a "perform" handler
  // that actually does the delete once the user confirms in the modal.
  const handleDeleteClick = (id, event) => {
    if (event) {
      event.stopPropagation();
    }
    logger.debug("🗑️ Delete requested for notification:", id);
    setConfirmModal({ isOpen: true, type: 'delete', targetId: id });
  };

  const performDelete = async (id) => {
    setIsConfirmLoading(true);
    try {
      await notificationService.deleteNotification(id);
      logger.debug("✅ Delete successful for:", id);

      setNotifications(prev => {
        const filtered = prev.filter(notif => notif._id !== id);
        logger.debug("📋 Notifications after delete:", filtered.length);
        return filtered;
      });

      getUnreadCount();
      setSelectedNotification(null);
    } catch (error) {
      logger.error('❌ Failed to delete:', error);
    } finally {
      setIsConfirmLoading(false);
      setConfirmModal({ isOpen: false, type: null, targetId: null });
    }
  };

  // P2 FIX: same pattern as handleDeleteClick/performDelete above, applied
  // to the "clear all" action (previously `window.confirm('Clear all
  // notifications?')`).
  const handleClearAllClick = () => {
    logger.debug("🧹 Clear all requested");
    setConfirmModal({ isOpen: true, type: 'clearAll', targetId: null });
  };

  const performClearAll = async () => {
    setIsConfirmLoading(true);
    try {
      await notificationService.clearAllNotifications('archive');
      logger.debug("✅ Clear all successful");
      
      setNotifications([]);
      logger.debug("📋 Notifications cleared");
      
      setUnreadCount(0);
      logger.debug("✅ Unread count set to 0");
      setShowMobileMenu(false);
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
    } else if (confirmModal.type === 'clearAll') {
      performClearAll();
    }
  };

  const handleConfirmModalCancel = () => {
    if (isConfirmLoading) return; // don't allow dismissing mid-request
    logger.debug("❌ Confirmation cancelled by user", confirmModal.type);
    setConfirmModal({ isOpen: false, type: null, targetId: null });
  };

  const loadMore = () => {
    logger.debug("📥 Load more clicked - current page:", page, "hasMore:", hasMore, "loading:", loading);
    
    if (!loading && hasMore) {
      logger.debug("📥 Loading more notifications, next page:", page + 1);
      loadNotifications(page + 1);
    }
  };

  const getIcon = (type) => {
    switch(type) {
      case 'info':
        return <FaInfoCircle className="text-blue-500" />;
      case 'success':
        return <FaCheckCircle className="text-green-500" />;
      case 'warning':
        return <FaExclamationTriangle className="text-yellow-500" />;
      case 'alert':
        return <FaExclamationTriangle className="text-red-500" />;
      case 'system':
        return <FaCog className="text-purple-500" />;
      default:
        return <FaBell className="text-gray-500" />;
    }
  };

  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const getShortTime = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return 'now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    return `${days}d`;
  };

  const getTypeColor = (type) => {
    const colors = {
      info: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      success: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      alert: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      system: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
    };
    return colors[type] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon with Badge - Responsive */}
      <button 
        className="relative p-1.5 sm:p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
        onClick={() => {
          logger.debug("🔔 Bell icon clicked, current isOpen:", isOpen);
          setIsOpen(!isOpen);
        }}
        aria-label="Notifications"
      >
        <FaBell className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700 dark:text-gray-300" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 bg-red-500 text-white text-xs font-bold px-1 sm:px-1.5 py-0.5 rounded-full min-w-[18px] sm:min-w-[20px] text-center border-2 border-white dark:border-gray-800">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel - Responsive */}
      {isOpen && (
        <div 
          className={`
            fixed sm:absolute 
            top-0 sm:top-full 
            left-0 sm:left-auto 
            right-0 sm:right-0 
            bottom-0 sm:bottom-auto
            w-full sm:w-96 
            h-full sm:h-auto
            sm:max-h-[600px]
            bg-white dark:bg-gray-800 
            sm:rounded-xl 
            shadow-2xl 
            sm:mt-2 
            z-50 
            overflow-hidden 
            animate-slideDown
            flex flex-col
          `}
          onClick={(e) => e.stopPropagation()}
        >
          
          {/* Header - Responsive */}
          <div className="flex justify-between items-center px-4 sm:px-5 py-3 sm:py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-800 dark:text-gray-100 text-base sm:text-lg">
                Notifications
              </h3>
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {unreadCount}
                </span>
              )}
            </div>
            
            <div className="flex gap-2">
              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="sm:hidden p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg"
                aria-label="Menu"
              >
                <FaEllipsisV className="w-4 h-4" />
              </button>
              
              {/* Desktop Actions */}
              <div className="hidden sm:flex gap-2">
                {unreadCount > 0 && (
                  <button 
                    className="px-2.5 py-1 text-xs border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-full text-gray-600 dark:text-gray-300 hover:bg-blue-500 hover:text-white hover:border-blue-500 transition-colors flex items-center gap-1"
                    onClick={handleMarkAllAsRead}
                  >
                    <FaCheck className="text-xs" />
                    Mark all read
                  </button>
                )}
                <button 
                  className="px-2.5 py-1 text-xs border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-full text-gray-600 dark:text-gray-300 hover:bg-red-500 hover:text-white hover:border-red-500 transition-colors flex items-center gap-1"
                  onClick={handleClearAllClick}
                >
                  <FaTrash className="text-xs" />
                  Clear all
                </button>
              </div>
              
              {/* Close button for mobile */}
              <button
                onClick={() => setIsOpen(false)}
                className="sm:hidden p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg"
                aria-label="Close"
              >
                <FaTimes className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Mobile Action Menu */}
          {showMobileMenu && (
            <div className="sm:hidden p-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <div className="flex flex-col gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="w-full px-4 py-3 bg-blue-500 text-white rounded-lg font-medium text-sm flex items-center justify-center gap-2"
                  >
                    <FaCheck /> Marquer tout comme lu
                  </button>
                )}
                <button
                  onClick={handleClearAllClick}
                  className="w-full px-4 py-3 bg-red-500 text-white rounded-lg font-medium text-sm flex items-center justify-center gap-2"
                >
                  <FaTrash /> Tout effacer
                </button>
              </div>
            </div>
          )}

          {/* Filter Tabs - Responsive */}
          <div className="flex gap-1 sm:gap-2 px-4 sm:px-5 py-2 sm:py-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-x-auto scrollbar-hide">
            {['all', 'unread', 'read'].map((tab) => (
              <button
                key={tab}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-full transition-colors whitespace-nowrap flex-shrink-0 ${
                  filter === tab 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
                onClick={() => {
                  logger.debug("🎯 Filter changed to:", tab);
                  setFilter(tab);
                  setSelectedNotification(null);
                }}
              >
                {tab === 'all' && 'Toutes'}
                {tab === 'unread' && 'Non lues'}
                {tab === 'read' && 'Lues'}
              </button>
            ))}
          </div>

          {/* Notifications List - Responsive */}
          <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
            {loading && notifications.length === 0 ? (
              <div className="py-10 sm:py-12 text-center">
                <div className="inline-block w-8 h-8 sm:w-10 sm:h-10 border-4 border-gray-200 dark:border-gray-700 border-t-blue-500 rounded-full animate-spin"></div>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Chargement...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-12 sm:py-16 text-center px-4">
                <span className="text-4xl sm:text-5xl opacity-30 block mb-3">🔔</span>
                <p className="text-gray-500 dark:text-gray-400 font-medium text-sm sm:text-base">
                  Aucune notification
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  Vous êtes à jour !
                </p>
              </div>
            ) : (
              <>
                {notifications.map((notification, index) => {
                  const isSelected = selectedNotification === notification._id;
                  
                  return (
                    <div
                      key={notification._id || index}
                      className={`
                        relative px-4 sm:px-5 py-3 sm:py-4 
                        border-b border-gray-100 dark:border-gray-700 
                        hover:bg-gray-50 dark:hover:bg-gray-750 
                        cursor-pointer transition-colors
                        ${notification.status === 'unread' ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}
                        ${isSelected ? 'bg-gray-100 dark:bg-gray-700' : ''}
                      `}
                      onClick={() => {
                        logger.debug("👆 Notification clicked:", notification._id);
                        if (window.innerWidth < 640) {
                          // On mobile, toggle selection
                          setSelectedNotification(isSelected ? null : notification._id);
                        } else {
                          // On desktop, mark as read on click
                          if (notification.status === 'unread') {
                            handleMarkAsRead(notification._id);
                          }
                        }
                      }}
                    >
                      <div className="flex gap-3">
                        {/* Icon */}
                        <div className="flex-shrink-0 text-xl sm:text-2xl">
                          {getIcon(notification.type)}
                        </div>
                        
                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start gap-2">
                            <h4 className="text-sm sm:text-base font-semibold text-gray-800 dark:text-gray-100 truncate">
                              {notification.title}
                            </h4>
                            <span className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">
                              {/* Show short time on mobile, full on desktop */}
                              <span className="sm:hidden">{getShortTime(notification.createdAt)}</span>
                              <span className="hidden sm:inline">{getTimeAgo(notification.createdAt)}</span>
                            </span>
                          </div>
                          
                          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                            {notification.message}
                          </p>
                          
                          <div className="flex flex-wrap items-center gap-2">
                            {/* Type badge */}
                            <span className={`inline-block px-2 py-0.5 text-xs rounded-full ${getTypeColor(notification.type)}`}>
                              {notification.type}
                            </span>
                            
                            {/* Unread indicator - mobile */}
                            {notification.status === 'unread' && (
                              <span className="sm:hidden w-2 h-2 bg-blue-500 rounded-full"></span>
                            )}
                          </div>
                          
                          {notification.actionUrl && (
                            <a 
                              href={notification.actionUrl}
                              className="text-xs text-blue-500 hover:text-blue-700 inline-flex items-center gap-1 mt-2"
                              onClick={(e) => e.stopPropagation()}
                            >
                              Voir détails →
                            </a>
                          )}
                        </div>

                        {/* Desktop Action Buttons */}
                        <div className="hidden sm:flex gap-1 ml-2">
                          {notification.status === 'unread' && (
                            <button
                              className="w-7 h-7 flex items-center justify-center bg-white dark:bg-gray-700 rounded-md text-gray-500 dark:text-gray-400 hover:bg-blue-500 hover:text-white shadow-sm transition-all"
                              onClick={(e) => handleMarkAsRead(notification._id, e)}
                              title="Mark as read"
                            >
                              <FaCheck className="text-xs" />
                            </button>
                          )}
                          <button
                            className="w-7 h-7 flex items-center justify-center bg-white dark:bg-gray-700 rounded-md text-gray-500 dark:text-gray-400 hover:bg-purple-500 hover:text-white shadow-sm transition-all"
                            onClick={(e) => handleArchive(notification._id, e)}
                            title="Archive"
                          >
                            <FaArchive className="text-xs" />
                          </button>
                          <button
                            className="w-7 h-7 flex items-center justify-center bg-white dark:bg-gray-700 rounded-md text-gray-500 dark:text-gray-400 hover:bg-red-500 hover:text-white shadow-sm transition-all"
                            onClick={(e) => handleDeleteClick(notification._id, e)}
                            title="Delete"
                          >
                            <FaTrash className="text-xs" />
                          </button>
                        </div>
                      </div>

                      {/* Mobile Action Menu (when selected) */}
                      {isSelected && (
                        <div className="sm:hidden mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                          <div className="flex gap-2">
                            {notification.status === 'unread' && (
                              <button
                                className="flex-1 px-3 py-2.5 bg-blue-500 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2"
                                onClick={(e) => handleMarkAsRead(notification._id, e)}
                              >
                                <FaCheck /> Marquer lu
                              </button>
                            )}
                            <button
                              className="flex-1 px-3 py-2.5 bg-purple-500 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2"
                              onClick={(e) => handleArchive(notification._id, e)}
                            >
                              <FaArchive /> Archiver
                            </button>
                            <button
                              className="flex-1 px-3 py-2.5 bg-red-500 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2"
                              onClick={(e) => handleDeleteClick(notification._id, e)}
                            >
                              <FaTrash /> Supprimer
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Load More - Responsive */}
                {hasMore && (
                  <button 
                    className="w-full py-3 sm:py-4 text-sm text-blue-500 font-medium hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    onClick={loadMore}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="inline-block w-4 h-4 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin"></span>
                        Chargement...
                      </>
                    ) : (
                      <>
                        <FaChevronDown className="text-xs" />
                        Voir plus
                      </>
                    )}
                  </button>
                )}
              </>
            )}
          </div>

          {/* Mobile hint text */}
          <div className="sm:hidden p-2 text-center border-t border-gray-200 dark:border-gray-700">
            <p className="text-2xs text-gray-500 dark:text-gray-400">
              Appuyez sur une notification pour voir les actions
            </p>
          </div>
        </div>
      )}

      {/* P2 FIX: shared confirmation modal, replaces the two window.confirm()
          call sites (single delete + clear all). Rendered inside the
          dropdownRef container so the outside-click handler above doesn't
          treat a click on the modal/backdrop as a click "outside" and yank
          the whole panel closed mid-confirmation. */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.type === 'clearAll' ? 'Tout effacer ?' : 'Supprimer la notification ?'}
        message={
          confirmModal.type === 'clearAll'
            ? 'Toutes vos notifications seront archivées et cette liste sera vidée.'
            : 'Cette notification sera définitivement supprimée.'
        }
        onConfirm={handleConfirmModalConfirm}
        onCancel={handleConfirmModalCancel}
        isLoading={isConfirmLoading}
        confirmText={confirmModal.type === 'clearAll' ? 'Tout effacer' : 'Supprimer'}
        cancelText="Annuler"
        isDangerous={true}
      />
    </div>
  );
};

export default NotificationCenter;
