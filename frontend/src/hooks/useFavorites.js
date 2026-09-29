/**
 * @fileoverview Custom hook for managing user's favorite books
 * 
 * Handles:
 * - Fetching user's favorite books from API
 * - Filtering favorites by search, category, and language
 * - Adding/removing books from favorites
 * - Managing loading and error states
 * 
 * Props passed to component using this hook:
 * - favorites: Array of favorite book objects
 * - loading: Boolean indicating data is being fetched
 * - filteredFavorites: Array of filtered favorites based on search/filters
 * - removeFavorite: Function to remove book from favorites
 * - searchTerm, selectedCategory, selectedLanguage: Filter state
 * - filterFavorites: Function to apply filters
 * 
 * @example
 * const {
 *   favorites,
 *   loading,
 *   filteredFavorites,
 *   removeFavorite,
 *   filterFavorites
 * } = useFavorites();
 */

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { favoriteService } from '../services/favoriteService';

/**
 * Hook for managing user's favorite books
 * @returns {Object} Favorites data and functions
 * @returns {Array} data.favorites - User's complete favorites list
 * @returns {Array} data.filteredFavorites - Filtered favorites based on search/category/language
 * @returns {boolean} data.loading - Loading state
 * @returns {Function} data.removeFavorite - Function to remove book from favorites
 * @returns {Function} data.updateFilters - Function to update filter state
 * @returns {Object} data.filters - Current filter values (searchTerm, selectedCategory, selectedLanguage)
 */
export const useFavorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRemoving, setIsRemoving] = useState(false);
  
  // Filter state
  const [filters, setFilters] = useState({
    searchTerm: '',
    selectedCategory: 'all',
    selectedLanguage: ''
  });

  /**
   * Fetch user's favorites from API
   * Falls back to localStorage if API fails
   */
  const loadFavorites = useCallback(async () => {
    setLoading(true);
    try {
      const response = await favoriteService.getUserFavorites();
      setFavorites(response.data || []);
    } catch (error) {
      console.error('Error loading favorites:', error);
      toast.error('Erreur lors du chargement des favoris');

      // Fallback to localStorage
      const localFavorites = JSON.parse(
        localStorage.getItem('favoriteBooks') || '[]'
      );

      // Transform local favorites to match API response format
      const formattedFavorites = localFavorites.map((fav) => {
        return {
          favoriteId: `local_${fav._id}_${Date.now()}`,
          book: {
            _id: fav._id,
            title: fav.title,
            authors: fav.authors,
            coverImage: fav.coverImage,
            category: fav.category,
            isbn: fav.isbn,
            description: fav.description || 'Pas de description disponible.',
            isAvailable: fav.isAvailable !== undefined ? fav.isAvailable : true,
            availableCopies: fav.availableCopies || 1,
            publisher: fav.publisher || 'Éditeur inconnu',
            publicationYear: fav.publicationYear || '2023',
            pages: fav.pages || '250',
            language: fav.language || 'Français',
            createdAt: fav.createdAt || new Date().toISOString(),
          },
          addedAt: fav.addedAt || new Date().toISOString(),
        };
      });

      setFavorites(formattedFavorites);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Apply filters to favorites array
   * @returns {Array} Filtered favorites based on current filter state
   */
  const getFilteredFavorites = useCallback(() => {
    return favorites.filter((fav) => {
      if (!fav.book) return false;

      // Search filter
      const searchLower = filters.searchTerm.toLowerCase();
      const matchesSearch =
        fav.book.title?.toLowerCase().includes(searchLower) ||
        fav.book.authors?.some((author) =>
          author.toLowerCase().includes(searchLower)
        ) ||
        fav.book.isbn?.toLowerCase().includes(searchLower);

      // Category filter
      const matchesCategory =
        filters.selectedCategory === 'all' ||
        fav.book.category === filters.selectedCategory;

      // Language filter
      const matchesLanguage =
        !filters.selectedLanguage ||
        fav.book.language === filters.selectedLanguage;

      return matchesSearch && matchesCategory && matchesLanguage;
    });
  }, [favorites, filters]);

  /**
   * Remove book from favorites
   * @param {string} bookId - ID of book to remove
   * @param {string} bookTitle - Title of book (for notifications)
   */
  const removeFavorite = useCallback(async (bookId, bookTitle) => {
    setIsRemoving(true);
    try {
      await favoriteService.removeFromFavorites(bookId);

      // Update state
      setFavorites(favorites.filter((fav) => fav.book._id !== bookId));

      // Update localStorage
      const localFavorites = JSON.parse(
        localStorage.getItem('favoriteBooks') || '[]'
      );
      const updatedLocal = localFavorites.filter((fav) => fav._id !== bookId);
      localStorage.setItem('favoriteBooks', JSON.stringify(updatedLocal));

      toast.success('Retiré des favoris');
    } catch (error) {
      console.error('Error removing favorite:', error);
      toast.error('Erreur lors de la suppression');
      throw error;
    } finally {
      setIsRemoving(false);
    }
  }, [favorites]);

  /**
   * Update filter values and automatically refilter
   * @param {Object} newFilters - Object with filter values to update
   */
  const updateFilters = useCallback((newFilters) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      ...newFilters
    }));
  }, []);

  /**
   * Reset all filters to defaults
   */
  const resetFilters = useCallback(() => {
    setFilters({
      searchTerm: '',
      selectedCategory: 'all',
      selectedLanguage: ''
    });
  }, []);

  // Load favorites on component mount
  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  return {
    // Data
    favorites,
    filteredFavorites: getFilteredFavorites(),
    loading,
    isRemoving,
    
    // Filter state
    filters,
    
    // Functions
    loadFavorites,
    removeFavorite,
    updateFilters,
    resetFilters
  };
};
