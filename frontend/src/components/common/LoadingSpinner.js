/**
 * @fileoverview Reusable loading spinner component
 * 
 * Displays consistent loading spinner across the app
 * Reduces code duplication for various loading states
 * 
 * @example
 * <LoadingSpinner 
 *   message="Chargement des livres..."
 *   size="lg"
 *   fullScreen={false}
 * />
 */

import React from 'react';

/**
 * Reusable loading spinner component
 * @component
 * @param {Object} props - Component props
 * @param {string} [props.message] - Optional loading message
 * @param {'sm' | 'md' | 'lg'} [props.size='md'] - Spinner size
 * @param {boolean} [props.fullScreen] - If true, takes full screen
 * @param {string} [props.className] - Additional CSS classes
 * @returns {React.ReactElement} Loading spinner
 */
export const LoadingSpinner = ({
  message = 'Chargement...',
  size = 'md',
  fullScreen = false,
  className = ''
}) => {
  // Size variants
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-12 w-12',
    lg: 'h-16 w-16'
  };

  const containerClasses = fullScreen
    ? 'min-h-screen bg-gray-50 dark:bg-gray-900 p-8 transition-colors'
    : 'p-12';

  return (
    <div className={`${containerClasses} ${className}`}>
      <div className="flex flex-col items-center justify-center">
        {/* Spinner */}
        <div className={`${sizeClasses[size]} border-4 border-gray-200 dark:border-gray-700 border-t-blue-500 dark:border-t-blue-400 rounded-full animate-spin transition-colors`}></div>
        
        {/* Message */}
        {message && (
          <p className="mt-4 text-gray-600 dark:text-gray-400 text-center transition-colors">
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

export default LoadingSpinner;
