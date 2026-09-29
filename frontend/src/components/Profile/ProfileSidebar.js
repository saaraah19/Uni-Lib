import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext'

const ProfileSidebar = ({
  user,
  activeTab,
  setActiveTab,
  favoriteCount = 0,
  loadingFavorites = false,
  // REMOVE isDarkMode and onThemeToggle from props completely
}) => {
  // Get theme directly from context - this is the ONLY source of truth
  const { isDarkMode, toggleTheme } = useTheme();
  
  // DEBUG: Add console log to verify theme is being read
  console.log('🎨 ProfileSidebar - Theme from context:', { 
    isDarkMode, 
    toggleThemeExists: !!toggleTheme 
  });

  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';

  const navItems = [
    { id: 'overview', icon: '📊', label: 'Overview' },
    { id: 'info', icon: '👤', label: 'My Info' },
    { id: 'settings', icon: '⚙️', label: 'Settings' },
  ];

  return (
    <div className="w-full lg:w-1/3">
     

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 sm:p-6 transition-colors duration-300">
        {/* User Avatar & Info */}
        <div className="text-center mb-4 sm:mb-6">
          <div className="flex justify-center mb-3 sm:mb-4">
            <div
              className="
                w-24 sm:w-28 md:w-32 h-24 sm:h-28 md:h-32 rounded-full
                bg-gradient-to-r from-blue-500 to-purple-500
                flex items-center justify-center
                text-white text-3xl sm:text-4xl font-bold
                shadow-lg
                dark:shadow-2xl dark:shadow-purple-900/20
              "
            >
              {userInitial}
            </div>
          </div>

          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-100">
            {user?.name || 'User'}
          </h2>

          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-2 sm:mb-3">
            {user?.userCode || user?.email || 'No code'}
          </p>

          <div
            className={`
              inline-block px-3 sm:px-4 py-1 rounded-full text-xs sm:text-sm font-semibold
              ${
                user?.role === 'staff'
                  ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-300'
                  : 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300'
              }
            `}
          >
            {user?.role === 'staff' ? 'STAFF' : 'STUDENT'}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="space-y-2 sm:space-y-3 mb-6 sm:mb-8">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`
                w-full text-left px-3 sm:px-4 py-2 sm:py-3 rounded-lg flex items-center gap-2 sm:gap-3 text-sm sm:text-base
                transition-all duration-200
                ${
                  activeTab === item.id
                    ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-500 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-400'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:translate-x-1'
                }
              `}
            >
              <span className="text-lg sm:text-xl">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </button>
          ))}

          {/* Favorites Shortcut for Students */}
          {user?.role === 'student' && (
            <Link
              to="/favorites"
              className="
                w-full text-left px-3 sm:px-4 py-2 sm:py-3 rounded-lg flex items-center gap-2 sm:gap-3 text-sm sm:text-base
                transition-all duration-200
                text-gray-700 dark:text-gray-300 
                hover:bg-gray-50 dark:hover:bg-gray-700/50 
                hover:translate-x-1
                group
              "
            >
              <span className="text-lg sm:text-xl group-hover:scale-110 transition-transform">❤️</span>
              <span className="font-medium">My Favorites</span>
              {favoriteCount > 0 && !loadingFavorites && (
                <span className="ml-auto bg-red-500 text-white text-xs font-bold rounded-full h-5 sm:h-6 w-5 sm:w-6 flex items-center justify-center sm:text-sm">
                  {favoriteCount}
                </span>
              )}
              {loadingFavorites && (
                <span className="ml-auto w-5 sm:w-6 h-5 sm:h-6 border-2 border-gray-300 dark:border-gray-600 border-t-blue-500 rounded-full animate-spin"></span>
              )}
            </Link>
          )}
        </div>

        {/* Theme Toggle - USING TOGGLE THEME DIRECTLY FROM HOOK */}
        <div className="pt-4 sm:pt-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={toggleTheme}  // Directly using the hook's toggle function
            className="
              w-full px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm
              bg-gray-100 dark:bg-gray-700
              rounded-lg
              flex items-center justify-center gap-2 sm:gap-3
              hover:bg-gray-200 dark:hover:bg-gray-600
              transform hover:scale-105
              transition-all duration-200
              font-medium text-gray-800 dark:text-gray-200
              focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400
            "
          >
            <span className="text-lg sm:text-xl transition-transform duration-500 hover:rotate-12">
              {isDarkMode ? '☀️' : '🌙'}
            </span>
            <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileSidebar;