/**
 * @fileoverview Reusable empty state component
 * 
 * Displays consistent "no results" UI across the app
 * Reduces code duplication for empty states
 * 
 * @example
 * <EmptyState
 *   icon="❤️"
 *   title="No favorites yet"
 *   message="Start adding books to your favorites"
 *   actionText="Browse books"
 *   onAction={handleAction}
 * />
 */

import React from 'react';

/**
 * Reusable empty state component
 * @component
 * @param {Object} props - Component props
 * @param {string} props.icon - Emoji or icon to display
 * @param {string} props.title - Title for empty state
 * @param {string} props.message - Description message
 * @param {string} [props.actionText] - Optional action button text
 * @param {Function} [props.onAction] - Callback for action button
 * @param {string} [props.className] - Additional CSS classes
 * @returns {React.ReactElement} Empty state component
 */
export const EmptyState = ({
  icon = '📭',
  title = 'No items found',
  message = 'Try adjusting your search or filters',
  actionText,
  onAction,
  className = ''
}) => {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-12 text-center transition-colors ${className}`}>
      {/* Icon */}
      <div className="text-6xl mb-6">
        {icon}
      </div>
      
      {/* Title */}
      <h3 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-4">
        {title}
      </h3>
      
      {/* Message */}
      <p className="text-gray-500 dark:text-gray-500 mb-6 max-w-md mx-auto">
        {message}
      </p>
      
      {/* Action button (optional) */}
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
