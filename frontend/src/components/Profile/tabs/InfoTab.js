// src/components/Profile/tabs/InfoTab.js
import React from 'react';
import { Link } from 'react-router-dom';

const InfoTab = ({ user, favoriteCount = 0, loadingFavorites = false }) => {
  // Debug: log what we receive
  console.log('🔍 InfoTab received user:', user);
  console.log('🔍 Favorite count:', favoriteCount);

  // Safe defaults
  const displayName = user?.name || user?.username || 'Not set';
  const displayEmail = user?.email || 'Not set';
  const displayRole = user?.role || 'user';
  const displayUserCode = user?.userCode || 'Not assigned';
  
  const getMemberSinceDate = () => {
    if (user?.createdAt) {
      return new Date(user.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    }
    
    // Try localStorage as fallback
    const regDate = localStorage.getItem('registrationDate');
    if (regDate) {
      return new Date(regDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    }
    
    return 'Recently';
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">
        My Information
      </h2>

      <div className="space-y-6">
        <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-6 transition-colors duration-300">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Full Name */}
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Full Name</p>
              <p className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                {displayName}
              </p>
            </div>

            {/* User/Student Code */}
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                {displayRole === 'staff' ? 'Staff Code' : 'Student Code'}
              </p>
              <p className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                {displayUserCode}
              </p>
            </div>

            {/* Email */}
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Email Address</p>
              <p className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                {displayEmail}
              </p>
            </div>

            {/* Role */}
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Role</p>
              <p className="text-lg font-semibold text-gray-800 dark:text-gray-200 capitalize">
                {displayRole}
              </p>
            </div>
          </div>

          {/* Favorites Section */}
          {displayRole === 'student' && (
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Favorite Books</p>
                  <p className="font-medium text-gray-800 dark:text-gray-200">
                    {loadingFavorites ? (
                      <span className="flex items-center gap-2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-purple-500 border-t-transparent"></div>
                        Loading...
                      </span>
                    ) : (
                      `${favoriteCount} book${favoriteCount !== 1 ? 's' : ''}`
                    )}
                  </p>
                </div>
                {favoriteCount > 0 && (
                  <Link
                    to="/favorites"
                    className="text-sm text-purple-600 dark:text-purple-400 hover:underline font-medium"
                  >
                    View all →
                  </Link>
                )}
              </div>
            </div>
          )}

          {/* Member Since */}
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Library Member Since
            </p>
            <p className="font-medium text-gray-800 dark:text-gray-200">
              {getMemberSinceDate()}
            </p>
          </div>
        </div>

        {/* Coming Soon Alert */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-100 dark:border-yellow-800 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <span className="text-2xl flex-shrink-0">🚧</span>
            <div>
              <h4 className="font-semibold text-gray-800 dark:text-gray-200">
                More Features Coming Soon!
              </h4>
              <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                We're working on adding loan history, reading progress, and more.
              </p>
              <div className="mt-3 text-sm">
                <span className="font-medium text-green-600 dark:text-green-400">
                  ✓ Favorites feature is now live!
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InfoTab;