// services/bookService.js
import api from './api';

/**
 * Service pour gérer toutes les interactions avec les livres
 * Compatible avec le nouveau backend (pagination, filtres, recherche avancée)
 */
class BookService {
  /**
   * Recherche avancée de livres avec pagination et filtres
   * @param {Object} params - Paramètres de recherche
   * @returns {Promise} { data, total, page, totalPages }
   */
  async searchBooks(params = {}) {
    try {
      const response = await api.get('/books/search', { params });
      return response.data;
    } catch (error) {
      console.error('❌ Erreur recherche livres:', error);
      throw error;
    }
  }

  // BREAKING CHANGE (P1): GET /books/get now returns a paginated envelope
  // { success, count, total, page, totalPages, data: [...] } instead of the
  // full collection. Accepts optional { page, limit } params (defaults to
  // page=1, limit=50 server-side, capped at 100).
  async getAllBooks(params = {}) {
    try {
      const response = await api.get('/books/get', { params });
      const booksData = response.data?.data || [];
      return {
        data: booksData,
        total: response.data?.total,
        page: response.data?.page,
        totalPages: response.data?.totalPages,
      };
    } catch (error) {
      console.error('❌ Erreur récupération livres:', error);
      throw error;
    }
  }

  /**
   * Récupère un livre par son ID
   */
  async getBookById(id) {
    try {
      const response = await api.get(`/books/get/${id}`);
      // Adaptation pour les différents formats
      const bookData = response.data.message || response.data;
      return { data: bookData };
    } catch (error) {
      console.error('❌ Erreur récupération livre:', error);
      throw error;
    }
  }

  /**
   * Récupère un livre par sa cote
   */
  async getBookByCote(cote) {
    try {
      const response = await api.get(`/books/cote/${cote}`);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur récupération par cote:', error);
      throw error;
    }
  }

  // =======================================================================
  // FILTRES ET MÉTADONNÉES
  // =======================================================================
  
  async getCategories() {
    try {
      const response = await api.get('/books/categories');
      return response.data;
    } catch (error) {
      console.error('❌ Erreur récupération catégories:', error);
      throw error;
    }
  }

  async getLanguages() {
    try {
      const response = await api.get('/books/languages');
      return response.data;
    } catch (error) {
      console.error('❌ Erreur récupération langues:', error);
      throw error;
    }
  }

  async getStats() {
    try {
      const response = await api.get('/books/stats');
      return response.data;
    } catch (error) {
      console.error('❌ Erreur récupération stats:', error);
      throw error;
    }
  }

  async getRecentBooks(limit = 10) {
    try {
      const response = await api.get(`/books/recent/${limit}`);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur récupération livres récents:', error);
      throw error;
    }
  }

  // =======================================================================
  // OPÉRATIONS CRUD (STAFF)
  // =======================================================================
  
  async createBook(bookData) {
    try {
      const response = await api.post('/books/create', bookData);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur création livre:', error);
      throw error;
    }
  }

  async updateBook(id, updates) {
    try {
      const response = await api.put(`/books/update/${id}`, updates);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur mise à jour livre:', error);
      throw error;
    }
  }

  async deleteBook(id) {
    try {
      const response = await api.delete(`/books/delete/${id}`);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur suppression livre:', error);
      throw error;
    }
  }
}

const bookService = new BookService();
export default bookService;
