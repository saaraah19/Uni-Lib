/**
 * @fileoverview Custom hook for managing book detail modal interactions
 * Uses the shared normalizeBook() utility (see utils/normalizeBook.js) so
 * favorites persisted to localStorage from here match the shape used by
 * BookCard, BookDetail and FavoritesPage.
 */

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { favoriteService } from '../services/favoriteService';
import bookService from '../services/bookService';
import { normalizeBook } from '../utils/normalizeBook';

export const useBookDetail = (bookId, userRole = 'student') => {
  // ==========================================================================
  // ÉTATS
  // ==========================================================================
  
  const [book, setBook] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRequestingLoan, setIsRequestingLoan] = useState(false);
  const [error, setError] = useState(null);

  // ==========================================================================
  // CHARGEMENT DES DONNÉES COMPLÈTES DU LIVRE
  // ==========================================================================
  
  const fetchBookDetails = useCallback(async () => {
    if (!bookId) return;
    
    try {
      setIsLoading(true);
      const response = await bookService.getBookById(bookId);
      const bookData = response.data || response;
      setBook(bookData);
      setError(null);
    } catch (error) {
      console.error('❌ Error fetching book details:', error);
      setError('Impossible de charger les détails du livre');
      toast.error('Erreur lors du chargement du livre');
    } finally {
      setIsLoading(false);
    }
  }, [bookId]);

  // ==========================================================================
  // VÉRIFICATION DES FAVORIS
  // ==========================================================================

  const checkIfFavorite = useCallback(async () => {
    if (userRole !== 'student') return;

    try {
      const response = await favoriteService.checkIsFavorite(bookId);
      setIsFavorite(response.isFavorite);
    } catch (error) {
      console.error('Error checking favorite status:', error);
      
      // Fallback to localStorage with complete data check
      const favorites = JSON.parse(localStorage.getItem('favoriteBooks') || '[]');
      const isBookFavorite = favorites.some((fav) => fav._id === bookId);
      setIsFavorite(isBookFavorite);
    }
  }, [bookId, userRole]);

  // ==========================================================================
  // GESTION DES FAVORIS AVEC DONNÉES COMPLÈTES
  // ==========================================================================

  const toggleFavorite = useCallback(async () => {
    if (userRole !== 'student') {
      toast.info('Seuls les étudiants peuvent ajouter des favoris');
      return;
    }

    if (!book) {
      toast.error('Informations du livre non disponibles');
      return;
    }

    setIsLoading(true);

    try {
      if (isFavorite) {
        // Retirer des favoris
        await favoriteService.removeFromFavorites(bookId);
        setIsFavorite(false);

        // Mise à jour localStorage
        const favorites = JSON.parse(localStorage.getItem('favoriteBooks') || '[]');
        const updatedFavorites = favorites.filter((fav) => fav._id !== bookId);
        localStorage.setItem('favoriteBooks', JSON.stringify(updatedFavorites));

        toast.success('Retiré des favoris');
      } else {
        // Ajouter aux favoris avec TOUTES les données, normalisées de la
        // même façon que partout ailleurs dans l'app (MAINTAINABILITY FIX P2).
        await favoriteService.addToFavorites(bookId);
        setIsFavorite(true);

        const favorites = JSON.parse(localStorage.getItem('favoriteBooks') || '[]');
        const bookToAdd = {
          ...normalizeBook(book),
          addedToFavoritesAt: new Date().toISOString(),
        };

        const updatedFavorites = [...favorites, bookToAdd];
        localStorage.setItem('favoriteBooks', JSON.stringify(updatedFavorites));

        toast.success('Ajouté aux favoris');
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error('Erreur lors de l\'opération');
    } finally {
      setIsLoading(false);
    }
  }, [bookId, book, isFavorite, userRole]);

  // ==========================================================================
  // GESTION DES PRÊTS
  // ==========================================================================

  const requestLoan = useCallback(async () => {
    if (!book) {
      toast.error('Informations du livre non disponibles');
      return;
    }

    // ✅ Vérification complète de disponibilité
    if (!book.isAvailable || book.availableCopies <= 0) {
      toast.error(
        `❌ Ce livre n'est pas disponible (${book.availableCopies}/${book.totalCopies || '?'} exemplaires)`
      );
      return;
    }

    if (userRole !== 'student') {
      toast.info('Seuls les étudiants peuvent demander des prêts');
      return;
    }

    setIsRequestingLoan(true);

    try {
      // Importer dynamiquement pour éviter les dépendances circulaires
      const loanService = (await import('../services/loanService')).default;
      
      await loanService.requestLoan(bookId, 30); // 30 jours par défaut
      
      toast.success('✅ Demande de prêt envoyée avec succès');
      
      // Mise à jour locale du nombre d'exemplaires
      setBook(prev => ({
        ...prev,
        availableCopies: prev.availableCopies - 1,
        isAvailable: (prev.availableCopies - 1) > 0
      }));
      
    } catch (error) {
      console.error('Error requesting loan:', error);
      
      let errorMessage = 'Erreur lors de la demande de prêt';
      if (error.response?.status === 400) {
        if (error.response.data?.message?.includes('not available')) {
          errorMessage = 'Ce livre n\'est plus disponible';
        } else if (error.response.data?.message?.includes('already requested')) {
          errorMessage = 'Vous avez déjà demandé ce livre';
        } else if (error.response.data?.message?.includes('maximum')) {
          errorMessage = 'Vous avez atteint le nombre maximum de prêts (5)';
        }
      } else if (error.response?.status === 401) {
        errorMessage = 'Veuillez vous reconnecter';
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
      
      toast.error(`❌ ${errorMessage}`);
    } finally {
      setIsRequestingLoan(false);
    }
  }, [book, bookId, userRole]);

  // ==========================================================================
  // EFFETS
  // ==========================================================================

  // Charger les détails du livre au montage
  useEffect(() => {
    fetchBookDetails();
  }, [fetchBookDetails]);

  // Vérifier le statut favori
  useEffect(() => {
    checkIfFavorite();
  }, [checkIfFavorite]);

  // ==========================================================================
  // RETOUR
  // ==========================================================================

  return {
    // Données
    book,
    isFavorite,
    isLoading,
    isRequestingLoan,
    error,
    
    // Propriétés calculées utiles
    hasAvailableCopies: book?.availableCopies > 0,
    coteDisplay: book?.cote,
    availabilityRatio: book?.totalCopies 
      ? `${book.availableCopies}/${book.totalCopies}`
      : `${book?.availableCopies || 0}`,
    
    // Fonctions
    toggleFavorite,
    requestLoan,
    checkIfFavorite,
    refreshBook: fetchBookDetails,
    setIsRequestingLoan,
  };
};
