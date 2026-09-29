/**
 * @fileoverview Reusable confirmation modal component
 * 
 * Generic confirmation dialog for any delete/remove action
 * Reduces code duplication across modals
 * 
 * @example
 * <ConfirmationModal
 *   isOpen={showConfirmation}
 *   title="Remove from Favorites?"
 *   message={`Are you sure you want to remove "${bookTitle}" from favorites?`}
 *   itemName={bookTitle}
 *   onConfirm={handleRemove}
 *   onCancel={handleCancel}
 *   isLoading={isRemoving}
 *   confirmText="Remove"
 *   cancelText="Cancel"
 *   isDangerous={true}
 * />
 */

import React, { useEffect } from 'react';
import { FaTimes, FaExclamationTriangle, FaCheckCircle } from 'react-icons/fa';
import { useModalA11y } from '../../hooks/useModalA11y';

export const ConfirmationModal = ({
  isOpen,
  title,
  message,
  itemName,
  onConfirm,
  onCancel,
  isLoading = false,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDangerous = false,
  children,
}) => {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // ACCESSIBILITY FIX (P2): focus trap + Escape-to-close + focus
  // restoration. Escape is disabled while an action is in flight so a
  // pending confirm/cancel request can't be silently dismissed mid-flight.
  const modalRef = useModalA11y({
    isOpen,
    onClose: isLoading ? undefined : onCancel,
  });

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50 transition-opacity duration-300"
      onClick={(e) => {
        // Close modal when clicking backdrop (but not when clicking modal content)
        if (e.target === e.currentTarget && !isLoading) onCancel();
      }}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirmation-modal-title"
        className="bg-white dark:bg-gray-800 rounded-t-xl sm:rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto transition-all duration-300 ease-in-out transform translate-y-0 sm:translate-y-0"
      >
        
        {/* Modal Container - Responsive padding */}
        <div className="p-4 sm:p-5 md:p-6">
          
          {/* Header with close button - Responsive */}
          <div className="flex items-start sm:items-center justify-between mb-4 sm:mb-5 md:mb-6">
            <div className="flex items-start sm:items-center gap-2 sm:gap-3">
              {/* Icon - Responsive sizing */}
              <div className={`p-2 sm:p-2.5 md:p-3 rounded-lg flex-shrink-0 ${
                isDangerous 
                  ? 'bg-red-100 dark:bg-red-900/30' 
                  : 'bg-blue-100 dark:bg-blue-900/30'
              }`}>
                {isDangerous ? (
                  <FaExclamationTriangle className="text-red-500 dark:text-red-400 text-base sm:text-lg md:text-xl" />
                ) : (
                  <FaCheckCircle className="text-blue-500 dark:text-blue-400 text-base sm:text-lg md:text-xl" />
                )}
              </div>
              
              {/* Title - Responsive */}
              <h3 id="confirmation-modal-title" className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-100 break-words pr-2">
                {title}
              </h3>
            </div>
            
            {/* Close button - Touch-friendly */}
            <button
              onClick={onCancel}
              className="p-2 sm:p-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex-shrink-0"
              aria-label="Close"
              disabled={isLoading}
            >
              <FaTimes className="text-base sm:text-lg" />
            </button>
          </div>

          {/* Message section - Responsive */}
          <div className="mb-5 sm:mb-6 md:mb-8">
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-3 sm:mb-4">
              {message}
            </p>
            
            {itemName && (
              <div className={`
                rounded-lg p-3 sm:p-4 border
                ${isDangerous 
                  ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' 
                  : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                }
              `}>
                {/* Item name - Responsive */}
                <p className={`font-medium text-sm sm:text-base break-words ${
                  isDangerous 
                    ? 'text-red-800 dark:text-red-300' 
                    : 'text-blue-800 dark:text-blue-300'
                }`}>
                  "{itemName}"
                </p>
                
                {/* Warning message - Only shown for dangerous actions */}
                {isDangerous && (
                  <p className="text-xs sm:text-sm text-red-600 dark:text-red-400 mt-2 flex items-center gap-1">
                    <FaExclamationTriangle className="text-xs sm:text-sm" />
                    <span>This action cannot be undone.</span>
                  </p>
                )}
              </div>
            )}

            {/* Optional extra content slot (e.g. a reason textarea for
                rejections) — allows callers to avoid window.prompt(). */}
            {children && (
              <div className="mt-3 sm:mt-4">
                {children}
              </div>
            )}
          </div>

          {/* Action buttons - Responsive layout */}
          <div className="flex flex-col-reverse xs:flex-row xs:justify-end gap-2 sm:gap-3">
            
            {/* Cancel button - Full width on mobile */}
            <button
              onClick={onCancel}
              disabled={isLoading}
              className="w-full xs:w-auto px-4 sm:px-5 md:px-6 py-2.5 sm:py-2.5 md:py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base order-1 xs:order-none"
            >
              {cancelText}
            </button>
            
            {/* Confirm button - Full width on mobile */}
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className={`
                w-full xs:w-auto px-4 sm:px-5 md:px-6 py-2.5 sm:py-2.5 md:py-3 
                rounded-lg font-medium flex items-center justify-center gap-2 
                transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                text-sm sm:text-base order-2 xs:order-none
                ${isDangerous
                  ? 'bg-red-600 text-white hover:bg-red-700 dark:hover:bg-red-700'
                  : 'bg-blue-600 text-white hover:bg-blue-700 dark:hover:bg-blue-700'
                }
              `}
            >
              {isLoading && (
                <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              )}
              <span className={isLoading ? 'ml-1' : ''}>{confirmText}</span>
            </button>
          </div>

          {/* Mobile hint text - For better UX */}
          <p className="text-2xs xs:text-xs text-center text-gray-500 dark:text-gray-400 mt-4 sm:hidden">
            Appuyez en dehors pour annuler
          </p>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
