// components/LoanModal.js
import { useState } from "react";
import { FaTimes, FaCalendarAlt, FaBook, FaChevronLeft } from "react-icons/fa";
import { useModalA11y } from "../hooks/useModalA11y";

const LoanModal = ({ 
  book, 
  onClose, 
  onConfirm, 
  isLoading = false 
}) => {
  const [loanPeriod, setLoanPeriod] = useState(30); // Default 30 days

  // ACCESSIBILITY FIX (P2): focus trap + Escape-to-close + focus
  // restoration, disabled while a request is in flight.
  const modalRef = useModalA11y({
    isOpen: true,
    onClose: isLoading ? undefined : onClose,
  });

  const calculateDueDate = () => {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + loanPeriod);
    return dueDate.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50 transition-opacity duration-300"
      onClick={(e) => {
        // Close modal when clicking backdrop
        if (e.target === e.currentTarget && !isLoading) onClose();
      }}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="loan-modal-title"
        className="bg-white dark:bg-gray-800 rounded-t-2xl sm:rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto transition-all duration-300 ease-in-out transform translate-y-0"
      >
        
        {/* Header - Mobile Optimized */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 z-10 border-b dark:border-gray-700">
          {/* Mobile Header (< sm) */}
          <div className="sm:hidden p-4">
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                disabled={isLoading}
                aria-label="Retour"
              >
                <FaChevronLeft className="text-lg" />
              </button>
              <h2 id="loan-modal-title" className="text-lg font-bold text-gray-800 dark:text-gray-100 flex-1">
                Demande de Prêt
              </h2>
              <div className="w-8 h-8"></div> {/* Spacer for alignment */}
            </div>
          </div>

          {/* Desktop Header (sm+) */}
          <div className="hidden sm:flex justify-between items-center p-4 md:p-6">
            <h2 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-100">
              📋 Demande de Prêt
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 text-xl p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              disabled={isLoading}
              aria-label="Fermer"
            >
              <FaTimes />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6">
          {/* Book Info - Mobile Optimized */}
          <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6 p-3 sm:p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
            {/* Cover Image - Responsive sizing */}
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
              {book.coverImage && book.coverImage !== "default-book-cover.jpg" ? (
                <img 
                  src={book.coverImage} 
                  alt={book.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://via.placeholder.com/64?text=📚';
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-xl sm:text-2xl">📚</span>
                </div>
              )}
            </div>
            
            {/* Book Details - With truncation for mobile */}
            <div className="flex-1 min-w-0"> {/* min-w-0 prevents flex overflow */}
              <h3 className="font-bold text-base sm:text-lg text-gray-800 dark:text-gray-100 truncate">
                {book.title}
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">
                {book.authors?.join(", ")}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-0.5 sm:mt-1 truncate">
                ISBN: {book.isbn}
              </p>
            </div>
          </div>

          {/* Loan Details */}
          <div className="space-y-3 sm:space-y-4">
            {/* Loan Duration Selector */}
            <div className="flex items-start gap-2 sm:gap-3">
              <FaCalendarAlt className="text-blue-500 mt-1 flex-shrink-0 text-sm sm:text-base" />
              <div className="flex-1">
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-1">
                  Durée du prêt
                </p>
                <div className="flex flex-col xs:flex-row items-start xs:items-center gap-2">
                  <select
                    value={loanPeriod}
                    onChange={(e) => setLoanPeriod(Number(e.target.value))}
                    className="w-full xs:w-auto bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={isLoading}
                  >
                    <option value={15}>15 jours (standard)</option>
                    <option value={30}>30 jours (étudiant)</option>
                    <option value={60}>60 jours (thèse)</option>
                  </select>
                  <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                    jours
                  </span>
                </div>
              </div>
            </div>

            {/* Due Date Display */}
            <div className="flex items-start gap-2 sm:gap-3">
              <FaBook className="text-green-500 mt-1 flex-shrink-0 text-sm sm:text-base" />
              <div>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-1">
                  Date de retour
                </p>
                <p className="text-sm sm:text-base font-semibold text-gray-800 dark:text-gray-200 break-words">
                  {calculateDueDate()}
                </p>
              </div>
            </div>

            {/* Warning Message - Responsive */}
            <div className="p-3 sm:p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <p className="text-xs sm:text-sm text-yellow-800 dark:text-yellow-300">
                ⚠️ <strong className="font-semibold">Important :</strong> Votre demande doit être approuvée par le personnel de la bibliothèque. 
                Vous recevrez une notification une fois traitée.
              </p>
            </div>
          </div>
        </div>

        {/* Footer with buttons - Mobile Optimized */}
        <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 rounded-b-2xl">
          <div className="p-3 sm:p-4 md:p-6">
            {/* Mobile buttons (< sm) - Stacked */}
            <div className="sm:hidden space-y-2">
              <button
                onClick={() => onConfirm(loanPeriod)}
                disabled={isLoading}
                className="w-full px-4 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Traitement...
                  </>
                ) : (
                  <>
                    <span className="text-base">📨</span>
                    Envoyer la demande
                  </>
                )}
              </button>
              <button
                onClick={onClose}
                disabled={isLoading}
                className="w-full px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 text-sm"
              >
                Annuler
              </button>
            </div>

            {/* Desktop buttons (sm+) - Side by side */}
            <div className="hidden sm:flex gap-3">
              <button
                onClick={onClose}
                disabled={isLoading}
                className="flex-1 px-4 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 text-sm"
              >
                Annuler
              </button>
              <button
                onClick={() => onConfirm(loanPeriod)}
                disabled={isLoading}
                className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Traitement...
                  </>
                ) : (
                  <>
                    <span>📨</span>
                    Envoyer la demande
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoanModal;
