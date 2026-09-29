import React from 'react';
import { Link } from 'react-router-dom';

/**
 * OverviewTab Component
 * 
 * Displays user overview with:
 * - Welcome message
 * - Statistics cards (current loans, favorites, books read)
 * - Quick action buttons
 * 
 * @component
 * @param {Object} props - Component props
 * @param {Object} props.user - User object with name
 * @param {number} props.favoriteCount - Count of user's favorite books
 * @returns {React.ReactElement} Overview tab content
 * 
 * @example
 * <OverviewTab user={user} favoriteCount={5} />
 */
const OverviewTab = ({ user, favoriteCount = 0 }) => {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">
        Welcome, {user?.name?.split(' ')[0]}! 👋
      </h2>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Current Loans Card */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl p-6 text-center transition-colors duration-300">
          <div className="text-3xl mb-3">📚</div>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-2">0</div>
          <div className="text-gray-700 dark:text-gray-300 font-medium">Current Loans</div>
        </div>

        {/* Favorites Card */}
        <Link
          to={user?.role === 'student' ? '/favorites' : '#'}
          className="block transform transition-transform hover:scale-105"
        >
          <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800 rounded-xl p-6 text-center transition-colors duration-300 h-full cursor-pointer hover:shadow-lg">
            <div className="text-3xl mb-3">❤️</div>
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-2">
              {favoriteCount}
            </div>
            <div className="text-gray-700 dark:text-gray-300 font-medium">Favorites</div>
            {user?.role === 'student' && favoriteCount > 0 && (
              <div className="mt-2 text-sm text-purple-500 dark:text-purple-400">
                Click to view →
              </div>
            )}
          </div>
        </Link>

        {/* Books Read Card */}
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 rounded-xl p-6 text-center transition-colors duration-300">
          <div className="text-3xl mb-3">📖</div>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-2">0</div>
          <div className="text-gray-700 dark:text-gray-300 font-medium">Books Read</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
          Quick Actions
        </h3>
        <div className="space-y-4">
          {/* Browse Books */}
          <Link to="/books" className="block">
            <div className="w-full text-left p-4 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🔍</span>
                <div>
                  <div className="font-medium text-gray-800 dark:text-gray-200">
                    Browse Books
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Explore library catalog
                  </div>
                </div>
              </div>
            </div>
          </Link>

          {/* View Favorites - Students Only */}
          {user?.role === 'student' && favoriteCount > 0 && (
            <Link to="/favorites" className="block">
              <div className="w-full text-left p-4 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200">
                <div className="flex items-center gap-3">
                  <span className="text-2xl text-red-500">❤️</span>
                  <div>
                    <div className="font-medium text-gray-800 dark:text-gray-200">
                      View My Favorites
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      See your {favoriteCount} saved book{favoriteCount !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default OverviewTab;