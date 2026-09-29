import React from 'react';
import { FaHeart, FaRegHeart, FaTimes, FaHandshake, FaTag } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

/**
 * BookActionButtons Component - UPDATED with cote and enriched status
 */
const BookActionButtons = ({
  isFavorite = false,
  isLoading = false,
  isRequestingLoan = false,
  book = {},
  userRole = 'student',
  onFavoriteToggle = () => {},
  onLoanRequest = () => {},
  onClose = () => {},
}) => {
  // ✅ Normalisation des données avec nouveaux champs
  const bookData = {
    _id: book._id,
    title: book.title,
    authors: book.authors,
    cote: book.cote,
    cote_info: book.cote_info,
    isbn: book.isbn,
    publisher: book.publisher,
    publicationYear: book.publicationYear,
    pages: book.pages,
    language: book.language,
    createdAt: book.createdAt,
    availableCopies: book.availableCopies || 0,
    totalCopies: book.totalCopies || book.availableCopies || 1,
    isAvailable: book.isAvailable ?? (book.availableCopies > 0),
    enriched: book.enriched || false,
  };

  const isBookAvailable = bookData.isAvailable && bookData.availableCopies > 0;
  const availabilityText = isBookAvailable 
    ? `${bookData.availableCopies}/${bookData.totalCopies} disponible${bookData.availableCopies > 1 ? 's' : ''}`
    : 'Indisponible';

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 transition-colors duration-300">
      <div className="p-4 sm:p-5 md:p-6">
        
        {/* ✅ SECTION INFO LIVRE AMÉLIORÉE */}
        <div className="mb-4 p-3 bg-white dark:bg-gray-700 rounded-lg text-xs sm:text-sm">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="font-medium text-gray-700 dark:text-gray-300">ID:</span>
            <code className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 px-2 py-1 rounded text-xs break-all flex-1">
              {bookData._id}
            </code>
          </div>
          
          {/* ✅ Affichage de la cote */}
          {bookData.cote && (
            <div className="flex items-center gap-2 mb-2">
              <span className="font-medium text-gray-700 dark:text-gray-300">Cote:</span>
              <span className="font-mono bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 px-2 py-1 rounded text-xs">
                <FaTag className="inline mr-1 text-xs" />
                {bookData.cote}
              </span>
            
            </div>
          )}
          
          {/* ✅ Disponibilité détaillée */}
          <div className="flex items-center gap-2 mb-2">
            <span className="font-medium text-gray-700 dark:text-gray-300">Dispo:</span>
            <span className={`px-2 py-1 rounded text-xs ${
              isBookAvailable
                ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
            }`}>
              {availabilityText}
            </span>
          </div>
          
          {/* Barre de progression si plusieurs exemplaires */}
          {bookData.totalCopies > 1 && (
            <div className="mt-2">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Taux de disponibilité</span>
                <span>{Math.round((bookData.availableCopies / bookData.totalCopies) * 100)}%</span>
              </div>
              <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-green-500 rounded-full"
                  style={{ width: `${(bookData.availableCopies / bookData.totalCopies) * 100}%` }}
                />
              </div>
            </div>
          )}
          
          {bookData.createdAt && (
            <p className="text-gray-500 dark:text-gray-400 mt-2 text-xs">
              Ajouté le: {new Date(bookData.createdAt).toLocaleDateString('fr-FR')}
            </p>
          )}
        </div>

        {/* Mobile Layout (< sm) */}
        <div className="sm:hidden space-y-2">
          
          {/* Favorite Toggle - Students Only */}
          {userRole === 'student' && (
            <button
              onClick={onFavoriteToggle}
              disabled={isLoading}
              className={`w-full px-4 py-3 rounded-lg font-medium flex items-center justify-center gap-2 text-sm transition-colors ${
                isLoading
                  ? 'opacity-50 cursor-not-allowed bg-gray-100 dark:bg-gray-700'
                  : isFavorite
                    ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-800/50'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-gray-300 border-t-red-500 rounded-full animate-spin"></div>
                  <span>Chargement...</span>
                </>
              ) : isFavorite ? (
                <>
                  <FaHeart className="text-red-500 text-lg" />
                  <span>Retirer des favoris</span>
                </>
              ) : (
                <>
                  <FaRegHeart className="text-lg" />
                  <span>Ajouter aux favoris</span>
                </>
              )}
            </button>
          )}

          {/* Request Loan - Students Only */}
          {userRole === 'student' && (
            <button
              onClick={onLoanRequest}
              className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm transition-colors"
              disabled={!isBookAvailable || isLoading || isRequestingLoan}
            >
              {isRequestingLoan ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Envoi en cours...</span>
                </>
              ) : (
                <>
                  <FaHandshake className="text-lg" />
                  <span>Demander un Prêt</span>
                </>
              )}
            </button>
          )}

          {/* Manage Loans - Staff Only */}
          {userRole === 'staff' && (
            <ManageLoansButton bookId={bookData?._id} isMobile={true} />
          )}

          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-full px-4 py-3 bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-600 font-medium flex items-center justify-center gap-2 text-sm transition-colors"
            disabled={isLoading || isRequestingLoan}
          >
            <FaTimes className="text-lg" />
            Fermer
          </button>
        </div>

        {/* Desktop Layout (sm+) */}
        <div className="hidden sm:flex sm:flex-row justify-end gap-3">
          
          {/* Favorite Toggle - Students Only */}
          {userRole === 'student' && (
            <button
              onClick={onFavoriteToggle}
              disabled={isLoading}
              className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 text-sm transition-colors ${
                isLoading
                  ? 'opacity-50 cursor-not-allowed bg-gray-100 dark:bg-gray-700'
                  : isFavorite
                    ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-800/50'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-gray-300 border-t-red-500 rounded-full animate-spin"></div>
                  <span>Chargement...</span>
                </>
              ) : isFavorite ? (
                <>
                  <FaHeart className="text-red-500" />
                  <span>Retirer</span>
                </>
              ) : (
                <>
                  <FaRegHeart />
                  <span>Ajouter</span>
                </>
              )}
            </button>
          )}

          {/* Request Loan - Students Only */}
          {userRole === 'student' && (
            <button
              onClick={onLoanRequest}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm transition-colors"
              disabled={!isBookAvailable || isLoading || isRequestingLoan}
            >
              {isRequestingLoan ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Envoi...</span>
                </>
              ) : (
                <>
                  <FaHandshake />
                  <span>Demander</span>
                </>
              )}
            </button>
          )}

          {/* Manage Loans - Staff Only */}
          {userRole === 'staff' && (
            <ManageLoansButton bookId={bookData?._id} isMobile={false} />
          )}

          {/* Close Button */}
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-600 font-medium flex items-center gap-2 text-sm transition-colors"
            disabled={isLoading || isRequestingLoan}
          >
            <FaTimes />
            <span>Fermer</span>
          </button>
        </div>

        {/* Loan Info Message */}
        {userRole === 'student' && isBookAvailable && (
          <div className="mt-4 p-3 sm:p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-xs sm:text-sm text-blue-800 dark:text-blue-300">
              💡 <strong className="font-semibold">Comment ça marche :</strong> Votre demande sera examinée par le personnel
              de la bibliothèque. Durée standard du prêt : <span className="font-medium">30 jours</span>.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// ManageLoansButton component (unchanged but with better logging)
const ManageLoansButton = ({ bookId = null, isMobile = false }) => {
  const navigate = useNavigate();

  const handleManageLoans = () => {
    console.log('📋 Navigation vers gestion des prêts', { bookId });
    const base = '/staff-dashboard?view=LoanRequests';
    const url = bookId ? `${base}&bookId=${bookId}` : base;
    navigate(url, { replace: true });
  };

  return (
    <button
      onClick={handleManageLoans}
      title="Gérer les prêts et les demandes"
      className={`${
        isMobile 
          ? 'w-full px-4 py-3 text-sm' 
          : 'px-4 py-2 text-sm'
      } bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium flex items-center justify-center gap-2 transition-colors`}
    >
      <span className="text-base">📋</span>
      <span>Gérer les Prêts</span>
    </button>
  );
};

export default BookActionButtons;