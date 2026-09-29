import React, { useCallback } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useProfile } from '../../hooks/useProfile';
import { OverviewTab, InfoTab, SettingsTab } from './tabs';
import ProfileSidebar from './ProfileSidebar';

/**
 * ProfilePage Component
 * 
 * Main user profile page showing overview, information, and settings tabs.
 * Manages user data loading, tab navigation, and theme preferences.
 * 
 * Data Flow:
 * 1. useProfile hook loads user from localStorage and fetches favorite count
 * 2. User can navigate between tabs in ProfileSidebar
 * 3. Active tab renders corresponding content (OverviewTab, InfoTab, or SettingsTab)
 * 4. useTheme hook provides theme toggle functionality
 * 
 * Features:
 * - Responsive layout: sidebar + main content
 * - Three tab views: Overview, Information, Settings
 * - Theme toggling (light/dark mode)
 * - Favorite books display for students
 * - Member since date tracking
 * 
 * Structure:
 * <div> // Main container
 *   <ProfileSidebar> // User avatar, name, tab navigation, theme toggle
 *   <content-area>  // Active tab content
 * </div>
 */
const ProfilePage = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const {
    user,
    activeTab,
    loading,
    favoriteCount,
    loadingFavorites,
    setActiveTab,
  } = useProfile();

  /**
   * Handle theme toggle
   * Updates both localStorage and DOM, triggers theme context update
   */
  const handleThemeToggle = useCallback(() => {
    const newTheme = isDarkMode ? 'light' : 'dark';
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', newTheme);
    toggleTheme();
  }, [isDarkMode, toggleTheme]);

  // =========================================================================
  // NO USER
  // =========================================================================

  if (!loading && !user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 md:p-8 flex items-center justify-center transition-colors duration-300">
        <div className="text-center">
          <div className="text-5xl sm:text-6xl mb-4 sm:mb-6 text-gray-400 dark:text-gray-300">👤</div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2 sm:mb-4">
            Welcome!
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-4 sm:mb-6">Login to see your profile</p>
          <a
            href="/login"
            className="inline-block px-6 sm:px-8 py-2 sm:py-3 text-sm sm:text-base bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
          >
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  // =========================================================================
  // LOADING
  // =========================================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 md:p-8 flex items-center justify-center transition-colors duration-300">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 sm:h-12 w-10 sm:w-12 border-b-2 border-blue-500 mx-auto mb-3 sm:mb-4"></div>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Loading your profile...</p>
        </div>
      </div>
    );
  }

  // =========================================================================
  // MAIN RENDER
  // =========================================================================

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 md:p-8 transition-colors duration-300">
      <div className="max-w-6xl mx-auto">
        {/* Page Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 dark:text-gray-100">
            Your Profile
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1 sm:mt-2">
            Welcome to your library account
          </p>
        </div>

        {/* Main Content: Sidebar + Tabs */}
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 md:gap-8">
          {/* Sidebar Navigation */}
          <ProfileSidebar
            user={user}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            favoriteCount={favoriteCount}
            loadingFavorites={loadingFavorites}
            isDarkMode={isDarkMode}
            onThemeToggle={handleThemeToggle}
          />

          {/* Tab Content */}
          <div className="w-full lg:w-2/3">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 sm:p-6 md:p-8 transition-colors duration-300">
              {/* Overview Tab */}
              {activeTab === 'overview' && <OverviewTab user={user} favoriteCount={favoriteCount} />}

              {/* Info Tab */}
              {activeTab === 'info' && (
                <InfoTab
                  user={user}
                  favoriteCount={favoriteCount}
                  loadingFavorites={loadingFavorites}
                />
              )}

              {/* Settings Tab */}
              {activeTab === 'settings' && (
                <SettingsTab isDarkMode={isDarkMode} onThemeToggle={handleThemeToggle} />
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 sm:mt-8 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
          <p>University Library Hub • Student Profile • Version 2.0</p>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
