// src/hooks/useProfile.js
import { useState, useEffect, useCallback } from 'react';
import { favoriteService } from '../services/favoriteService';
// P2 FIX: unguarded console.log/console.error/console.warn calls replaced
// with the shared logger utility (frontend/src/utils/logger.js).
import { logger } from '../utils/logger';

// Helper function to normalize user data
const normalizeUser = (userData) => {
  if (!userData) return null;
  
  logger.debug('Raw userData in normalizeUser:', userData); // Debug log
  
  return {
    id: userData.id || userData._id,
    name: userData.name || userData.username || 'Unknown',
    email: userData.email || 'Email not provided', // Better fallback
    role: userData.role || 'user',
    userCode: userData.userCode || 'Code not assigned', // Better fallback
    createdAt: userData.createdAt || null,
    token: userData.token,
  };
};

export const useProfile = () => {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [favoriteCount, setFavoriteCount] = useState(0);
  const [loadingFavorites, setLoadingFavorites] = useState(false);

  /**
   * Load favorite count using the correct favoriteService method
   */
  const loadFavoriteCount = useCallback(async () => {
    setLoadingFavorites(true);
    try {
      // Use the correct method: getFavoriteCount() not getUserFavorites()
      const response = await favoriteService.getFavoriteCount();
      
      logger.debug('Favorite count response:', response); // Debug log
      
      // Based on your favoriteService, getFavoriteCount() returns response.data
      // The response structure from your backend FavoriteController.getFavoriteCount:
      // { success: true, count: number }
      
      if (response && response.count !== undefined) {
        setFavoriteCount(response.count);
      } else if (response && response.data && response.data.count !== undefined) {
        setFavoriteCount(response.data.count);
      } else {
        // Fallback: try to get from getUserFavorites as array length
        try {
          const favoritesResponse = await favoriteService.getUserFavorites();
          // Check if it's an array or has data property
          if (Array.isArray(favoritesResponse)) {
            setFavoriteCount(favoritesResponse.length);
          } else if (favoritesResponse?.data && Array.isArray(favoritesResponse.data)) {
            setFavoriteCount(favoritesResponse.data.length);
          } else {
            setFavoriteCount(0);
          }
        } catch (fallbackError) {
          logger.warn('Fallback favorite fetch failed:', fallbackError);
          setFavoriteCount(0);
        }
      }
    } catch (error) {
      logger.error('Error loading favorite count:', error);
      // Fallback to localStorage
      try {
        const localFavorites = JSON.parse(
          localStorage.getItem('favoriteBooks') || '[]'
        );
        setFavoriteCount(localFavorites.length);
      } catch (localError) {
        setFavoriteCount(0);
      }
    } finally {
      setLoadingFavorites(false);
    }
  }, []);

  /**
   * Load user profile from localStorage
   */
  const loadProfile = useCallback(() => {
    setLoading(true);
    try {
      const savedUser = localStorage.getItem('user');
      logger.debug('Saved user from localStorage:', savedUser); // Debug log
      
      if (savedUser) {
        const userData = JSON.parse(savedUser);
        // Normalize the user data
        const normalizedUser = normalizeUser(userData);
        logger.debug('Normalized user:', normalizedUser); // Debug log
        
        setUser(normalizedUser);
        
        // Load favorites if student
        if (normalizedUser.role === 'student') {
          loadFavoriteCount();
        } else {
          setFavoriteCount(0); // Non-students have 0 favorites
        }
      } else {
        setUser(null);
      }
    } catch (error) {
      logger.error('Error loading profile:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [loadFavoriteCount]);

  /**
   * Refresh profile data
   */
  const refreshProfile = useCallback(() => {
    loadProfile();
  }, [loadProfile]);

  /**
   * Handle tab change
   */
  const changeTab = useCallback((tabName) => {
    const validTabs = ['overview', 'info', 'settings'];
    if (validTabs.includes(tabName)) {
      setActiveTab(tabName);
    }
  }, []);

  /**
   * Listen for favorite update events
   */
  useEffect(() => {
    const handleFavoriteUpdate = (event) => {
      logger.debug('Favorite update event received:', event.detail);
      
      // Refresh favorite count when favorites are updated
      if (user?.role === 'student') {
        loadFavoriteCount();
      }
    };

    window.addEventListener('favoriteUpdated', handleFavoriteUpdate);
    return () => window.removeEventListener('favoriteUpdated', handleFavoriteUpdate);
  }, [user, loadFavoriteCount]);

  // Load profile on mount
  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  return {
    // State
    user,
    activeTab,
    loading,
    favoriteCount,
    loadingFavorites,
    
    // Functions
    setActiveTab: changeTab,
    refreshProfile,
    
    // Utilities
    isStudent: user?.role === 'student',
    isStaff: user?.role === 'staff'
  };
};
