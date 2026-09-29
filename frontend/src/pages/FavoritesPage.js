import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import loanService from '../services/loanService';
import {
  FaHeart,
  FaArrowLeft,
  FaBookOpen,
  FaTrash,
} from 'react-icons/fa';
import BookDetail from './shared/BookDetail';
import BookFilters from './shared/BookFilters';
import { useUser } from '../hooks/useUser';
import { useFavorites } from '../hooks/useFavorites';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import ConfirmationModal from '../components/modals/ConfirmationModal';
import api from '../services/api';
import { normalizeBook } from '../utils/normalizeBook';


/**
 * FavoritesPage Component
 * 
 * Displays and manages user's favorite books with filtering by search term, category, and language.
 * Allows removing books from favorites and viewing detailed book information.
 * 
 * Features:
 * - Filters: Search, Category, Language
 * - Actions: View details, Remove from favorites
 * - State: Uses useFavorites hook for all data management
 * - UI: Loading spinner, empty state, confirmation modal for dangerous actions
 * 
 * Data Flow:
 * 1. useFavorites hook loads favorites and filters from API with localStorage fallback
 * 2. Component displays filtered favorites in responsive grid
 * 3. Click to view details opens BookDetail modal
 * 4. Click remove button opens ConfirmationModal
 * 5. Confirmation triggers removeFavorite from hook
 */
const FavoritesPage = () => {
  const navigate = useNavigate();
  const { user } = useUser();

  // Use custom hook for all favorites logic
  const {
    favorites,
    filteredFavorites,
    loading,
    filters,
    updateFilters,
    resetFilters,
    removeFavorite,
    isRemoving,
  } = useFavorites();

  // Local UI state
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [bookToRemove, setBookToRemove] = useState(null);

  /**
   * Handle viewing book details
   * Finds book in favorites and opens BookDetail modal with all required fields.
   *
   * MAINTAINABILITY FIX (P2): now delegates default-filling to the shared
   * normalizeBook() utility instead of hand-rolling its own defaults here
   * (which previously diverged slightly from BookCard/BookDetail).
   */
  const handleViewDetails = useCallback(async (bookId) => {
    try {
      const response = await api.get(`/books/get/${bookId}`);

      // Handle response format (in case backend still wraps in message)
      let bookData;
      if (response.data.message && typeof response.data.message === 'object') {
        bookData = response.data.message;
      } else {
        bookData = response.data;
      }

      setSelectedBook(normalizeBook(bookData));
      setIsDetailModalOpen(true);
    } catch (error) {
      console.error("❌ Error fetching book details:", error);

      // Fallback to favorites data if API fails
      const foundBook = favorites.find((fav) => fav.book._id === bookId);
      if (foundBook) {
        setSelectedBook(normalizeBook(foundBook.book));
        setIsDetailModalOpen(true);
      } else {
        toast.error('Livre non trouvé dans les favoris');
      }
    }
  }, [favorites]);

  /**
   * Handle loan request from BookDetail modal
   */
  const handleRequestLoan = useCallback(async (bookId) => {
    if (!bookId) return;
    try {
      // Call the shared loan service to create the loan
      await loanService.requestLoan(bookId);
      // Notify user and close modal
      toast.success('✅ Demande de prêt envoyée !');
      toast.info('📬 Votre demande sera traitée par le personnel de la bibliothèque.');
      setIsDetailModalOpen(false);
      setSelectedBook(null);
      // Broadcast an event so other parts of the app (MyLoans) can refresh
      window.dispatchEvent(new CustomEvent('loanCreated', { detail: { bookId } }));
    } catch (err) {
      console.error('Favorites loan request error:', err);
      toast.error(err.response?.data?.message || 'Erreur lors de la demande de prêt');
    }
  }, []);

  /**
   * Show removal confirmation modal
   */
  const handleShowRemoveConfirmation = useCallback((bookId, bookTitle) => {
    setBookToRemove({ id: bookId, title: bookTitle });
    setShowRemoveModal(true);
  }, []);

  /**
   * Confirm removal and call hook to remove from favorites
   */
  const handleConfirmRemove = useCallback(async () => {
    if (!bookToRemove) return;
    await removeFavorite(bookToRemove.id);
    setShowRemoveModal(false);
    setBookToRemove(null);
  }, [bookToRemove, removeFavorite]);

  /**
   * Close detail modal
   */
  const handleCloseDetailModal = useCallback(() => {
    setIsDetailModalOpen(false);
    setSelectedBook(null);
  }, []);

  /**
   * Cancel removal
   */
  const handleCancelRemove = useCallback(() => {
    setShowRemoveModal(false);
    setBookToRemove(null);
  }, []);

  // =========================================================================
  // ROLE CHECK
  // =========================================================================

  if (user && user.role !== 'student') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 md:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 sm:p-8 text-center">
            <div className="text-5xl sm:text-6xl mb-4 sm:mb-6 text-gray-400 dark:text-gray-300">📚</div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100 mb-3 sm:mb-4">
              Favorites Feature
            </h2>
            <p className="text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-400 mb-4 sm:mb-6">
              The favorites feature is only available for students.
            </p>
            <button
              onClick={() => navigate('/books')}
              className="inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              <FaArrowLeft /> Browse Books
            </button>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // LOADING STATE
  // =========================================================================

  if (loading) {
    return <LoadingSpinner message="Chargement des favoris..." fullScreen />;
  }

  // =========================================================================
  // MAIN RENDER
  // =========================================================================

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 md:p-8 transition-colors duration-300">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="mb-6 sm:mb-8">
          {/* Title & Navigation */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2 sm:gap-3">
                <FaHeart className="text-red-500" />
                My Favorites
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1 sm:mt-2">
                All your saved books in one place
              </p>
            </div>

            <button
              onClick={() => navigate('/books')}
              className="flex items-center justify-center sm:justify-start gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              <FaArrowLeft /> Back to Books
            </button>
          </div>

          {/* Quick Stats */}
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 mb-6">
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="text-lg sm:text-2xl text-red-500">❤️</span>
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Total Favorites
                </div>
                <div className="text-lg sm:text-2xl font-bold text-gray-800 dark:text-gray-100">
                  {favorites.length}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <span className="text-lg sm:text-2xl text-blue-500">📚</span>
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Currently Showing
                </div>
                <div className="text-lg sm:text-2xl font-bold text-gray-800 dark:text-gray-100">
                  {filteredFavorites.length}
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <BookFilters
            searchTerm={filters.searchTerm}
            setSearchTerm={(term) => updateFilters({ searchTerm: term })}
            selectedCategory={filters.selectedCategory}
            setSelectedCategory={(cat) => updateFilters({ selectedCategory: cat })}
            selectedLanguage={filters.selectedLanguage}
            setSelectedLanguage={(lang) => updateFilters({ selectedLanguage: lang })}
            onReset={resetFilters}
          />
        </div>

        {/* Content Section */}
        {filteredFavorites.length === 0 ? (
          <EmptyState
            icon={filters.searchTerm ? '🔍' : '❤️'}
            title={filters.searchTerm ? 'No matching favorites found' : 'Your favorites list is empty'}
            message={
              filters.searchTerm
                ? `No favorites match your search for "${filters.searchTerm}"`
                : 'Start adding books to your favorites by clicking the heart icon on any book'
            }
            actionText="Browse Books"
            onAction={() => navigate('/books')}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredFavorites.map((item) => (
              <div
                key={item.favoriteId || item.book._id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 group"
              >
                {/* Book Cover */}
                <div className="relative h-40 sm:h-48 bg-gray-100 dark:bg-gray-700">
                  {item.book.coverImage && item.book.coverImage !== 'default-book-cover.jpg' ? (
                    <img
                      src={item.book.coverImage}
                      alt={item.book.title}
                      className="w-full h-full object-cover cursor-pointer group-hover:scale-105 transition-transform duration-300"
                      onClick={() => handleViewDetails(item.book._id)}
                    />
                  ) : (
                    <div
                      className="flex items-center justify-center h-full cursor-pointer"
                      onClick={() => handleViewDetails(item.book._id)}
                    >
                      <FaBookOpen className="text-3xl sm:text-4xl text-gray-400" />
                    </div>
                  )}

                  {/* Remove Button */}
                  <button
                    onClick={() => handleShowRemoveConfirmation(item.book._id, item.book.title)}
                    className="absolute top-2 sm:top-3 right-2 sm:right-3 bg-white/90 dark:bg-gray-800/90 rounded-full p-1.5 sm:p-2 shadow-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors group-hover:opacity-100 opacity-90"
                    title="Remove from favorites"
                  >
                    <FaTrash className="text-red-500 hover:text-red-600 text-xs sm:text-sm" />
                  </button>

                  {/* Favorite Badge */}
                  <div className="absolute top-2 sm:top-3 left-2 sm:left-3">
                    <span className="bg-red-500 text-white text-xs font-bold px-2 sm:px-3 py-1 rounded-full flex items-center gap-1">
                      <FaHeart className="text-xs" /> Favori
                    </span>
                  </div>
                </div>

                {/* Book Info */}
                <div className="p-3 sm:p-5">
                  <h3
                    className="font-bold text-sm sm:text-lg text-gray-800 dark:text-gray-100 mb-1 sm:mb-2 line-clamp-2 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    onClick={() => handleViewDetails(item.book._id)}
                  >
                    {item.book.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-2 sm:mb-3 line-clamp-1">
                    {Array.isArray(item.book.authors)
                      ? item.book.authors.join(', ')
                      : item.book.authors || 'Auteur inconnu'}
                  </p>

                  <div className="flex flex-wrap gap-1 sm:gap-2 mb-3 sm:mb-4">
                    <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full">
                      {item.book.category || 'Non catégorisé'}
                    </span>
                    <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full">
                      {item.book.language || 'Français'}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 line-clamp-3 mb-3 sm:mb-4">
                    {item.book.description || 'Pas de description disponible.'}
                  </p>

                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-500">
                    <span className="truncate">
                      Added {item.addedAt ? new Date(item.addedAt).toLocaleDateString() : 'recently'}
                    </span>
                    <button
                      onClick={() => handleViewDetails(item.book._id)}
                      className="text-xs text-blue-600 dark:text-blue-400 hover:underline hover:text-blue-700 dark:hover:text-blue-300 transition-colors font-medium whitespace-nowrap ml-2"
                    >
                      View →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* BookDetail Modal */}
      {isDetailModalOpen && selectedBook && (
        <BookDetail
          book={selectedBook}
          onClose={handleCloseDetailModal}
          onRequestLoan={handleRequestLoan}
          userRole={user?.role || 'student'}
        />
      )}

      {/* Remove Confirmation Modal */}
      <ConfirmationModal
        isOpen={showRemoveModal}
        title="Remove from Favorites?"
        message="Are you sure you want to remove this book from your favorites?"
        itemName={bookToRemove?.title}
        onConfirm={handleConfirmRemove}
        onCancel={handleCancelRemove}
        isLoading={isRemoving}
        confirmText="Remove"
        cancelText="Cancel"
        isDangerous={true}
      />
    </div>
  );
};

export default FavoritesPage;
