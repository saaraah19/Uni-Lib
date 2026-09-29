// hooks/useBooksNew.js - VERSION CORRIGÉE AVEC FILTRE LANGUES

import { useState, useCallback, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import bookService from '../../../../services/bookService';
import { useDebounce } from '../../../../hooks/useDebounce';

export const useBooks = (initialFilters = {}) => {
  // =======================================================================
  // ÉTATS
  // =======================================================================
  
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Pagination
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });
  
  // Filtres
  const [filters, setFilters] = useState({
    searchTerm: '',
    author: '',
    category: 'all',
    cote: '',
    yearFrom: '',
    yearTo: '',
    isAvailable: '',
    languages: [], // ✅ Initialisé comme tableau vide
    sortBy: 'title',
    order: 'asc',
    ...initialFilters
  });

  // ✅ REF pour éviter les appels multiples
  const isFirstRender = useRef(true);
  const previousFilters = useRef(filters);

  // Debounce pour éviter trop d'appels
  const debouncedSearchTerm = useDebounce(filters.searchTerm, 500);
  const debouncedAuthor = useDebounce(filters.author, 500);
  const debouncedCote = useDebounce(filters.cote, 500);

  // =======================================================================
  // FONCTION PRINCIPALE DE RECHERCHE
  // =======================================================================
  
  const searchBooks = useCallback(async (pageToFetch) => {
    // Éviter les appels inutiles
    if (pageToFetch < 1) return;
    
    setLoading(true);
    setError(null);

    try {
      // Construire les paramètres
      const params = {
        page: pageToFetch,
        limit: pagination.limit,
        sortBy: filters.sortBy,
        order: filters.order
      };

      // Ajouter les filtres non-vides
      if (debouncedSearchTerm) params.q = debouncedSearchTerm;
      if (debouncedAuthor) params.author = debouncedAuthor;
      if (filters.category && filters.category !== 'all') {
        params.category = filters.category;
      }
      if (debouncedCote) params.cote = debouncedCote;
      if (filters.yearFrom) params.yearFrom = filters.yearFrom;
      if (filters.yearTo) params.yearTo = filters.yearTo;
      if (filters.isAvailable) params.isAvailable = filters.isAvailable;

      // ✅ GESTION DES LANGUES : convertir le tableau en chaîne CSV
      if (Array.isArray(filters.languages) && filters.languages.length > 0) {
        params.languages = filters.languages.join(',');
      }

      const response = await bookService.searchBooks(params);

      setBooks(response.data || []);
      setPagination(prev => ({
        page: response.page || 1,
        limit: response.limit || prev.limit,
        total: response.total || 0,
        totalPages: response.totalPages || 0
      }));

    } catch (err) {
      console.error('❌ Erreur recherche:', err);
      setError('Erreur lors de la recherche');
      setBooks([]);
    } finally {
      setLoading(false);
    }
  }, [
    pagination.limit,
    filters.sortBy,
    filters.order,
    filters.category,
    filters.yearFrom,
    filters.yearTo,
    filters.isAvailable,
    filters.languages,
    debouncedSearchTerm,
    debouncedAuthor,
    debouncedCote
  ]);

  // =======================================================================
  // EFFET PRINCIPAL : réagit aux changements de filtres ou de page
  // =======================================================================
  
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      searchBooks(1);
      return;
    }

    const filtersChanged = 
      previousFilters.current.searchTerm !== filters.searchTerm ||
      previousFilters.current.author !== filters.author ||
      previousFilters.current.category !== filters.category ||
      previousFilters.current.cote !== filters.cote ||
      previousFilters.current.yearFrom !== filters.yearFrom ||
      previousFilters.current.yearTo !== filters.yearTo ||
      previousFilters.current.isAvailable !== filters.isAvailable ||
      JSON.stringify(previousFilters.current.languages) !== JSON.stringify(filters.languages) ||
      previousFilters.current.sortBy !== filters.sortBy ||
      previousFilters.current.order !== filters.order;

    if (filtersChanged) {
      setPagination(prev => ({ ...prev, page: 1 }));
      previousFilters.current = filters;
      searchBooks(1);
    } else {
      searchBooks(pagination.page);
    }
  }, [
    filters,
    pagination.page,
    pagination.limit,
    searchBooks
  ]);

  // =======================================================================
  // FONCTIONS DE PAGINATION
  // =======================================================================
  
  const goToPage = useCallback((newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination(prev => ({ ...prev, page: newPage }));
    }
  }, [pagination.totalPages]);

  const setLimit = useCallback((newLimit) => {
    setPagination(prev => ({ ...prev, limit: newLimit, page: 1 }));
  }, []);

  // =======================================================================
  // FONCTIONS DE FILTRES
  // =======================================================================
  
  const updateFilter = useCallback((key, valueOrFn) => {
    setFilters(prev => {
      const newValue = typeof valueOrFn === 'function' ? valueOrFn(prev[key]) : valueOrFn;
      
      if (key === 'languages' && !Array.isArray(newValue)) {
        console.warn('⚠️ languages n\'est pas un tableau, correction');
        return { ...prev, [key]: [] };
      }
      
      return { ...prev, [key]: newValue };
    });
  }, []);

  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({
      searchTerm: '',
      author: '',
      category: 'all',
      cote: '',
      yearFrom: '',
      yearTo: '',
      isAvailable: '',
      languages: [],
      sortBy: 'title',
      order: 'asc'
    });
  }, []);

  // =======================================================================
  // OPÉRATIONS CRUD
  // =======================================================================
  
  const getBookById = useCallback(async (id) => {
    try {
      setLoading(true);
      const response = await bookService.getBookById(id);
      return response.data;
    } catch (err) {
      console.error('❌ Erreur récupération livre:', err);
      toast.error('Impossible de charger le livre');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createBook = useCallback(async (bookData) => {
    try {
      const response = await bookService.createBook(bookData);
      toast.success('✅ Livre ajouté avec succès');
      searchBooks(1);
      return response;
    } catch (err) {
      console.error('❌ Erreur création:', err);
      if (err.response?.data?.message === 'ISBN ALREADY EXISTS') {
        toast.error('❌ Cet ISBN existe déjà');
      } else {
        toast.error('❌ Erreur lors de la création');
      }
      throw err;
    }
  }, [searchBooks]);

  const updateBook = useCallback(async (id, updates) => {
    try {
      const response = await bookService.updateBook(id, updates);
      toast.success('✅ Livre modifié avec succès');
      searchBooks(pagination.page);
      return response;
    } catch (err) {
      console.error('❌ Erreur modification:', err);
      toast.error('❌ Erreur lors de la modification');
      throw err;
    }
  }, [searchBooks, pagination.page]);

  // UX/CONSISTENCY FIX (P2): window.confirm() removed from here. A hook
  // cannot render the app's own ConfirmationModal (no JSX to return), so
  // the confirmation step now lives in the calling component
  // (BooksCrud/index.js), which shows ConfirmationModal *before* invoking
  // this function. deleteBook() now assumes confirmation already happened
  // and just performs the deletion + list refresh.
  const deleteBook = useCallback(async (id) => {
    try {
      await bookService.deleteBook(id);
      toast.success('✅ Livre supprimé');
      searchBooks(pagination.page);
    } catch (err) {
      console.error('❌ Erreur suppression:', err);
      toast.error('❌ Erreur lors de la suppression');
      throw err;
    }
  }, [searchBooks, pagination.page]);

  // =======================================================================
  // RETOUR
  // =======================================================================
  
  return {
    books,
    loading,
    error,
    pagination,
    filters,
    
    goToPage,
    setLimit,
    updateFilter,
    updateFilters,
    resetFilters,
    setFilters,
    
    getBookById,
    createBook,
    updateBook,
    deleteBook,
    
    refresh: () => searchBooks(pagination.page),
    
    hasActiveFilters: Object.values(filters).some(v => 
      v && v !== 'all' && v !== '' && (Array.isArray(v) ? v.length > 0 : true)
    )
  };
};
