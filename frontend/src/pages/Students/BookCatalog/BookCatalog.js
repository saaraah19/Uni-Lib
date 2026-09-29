// ============================================================================
// IMPORT DES DÉPENDANCES
// ============================================================================
import { useState } from "react";
import { useBooks } from "../../STAFF/BooksCrud/hooks/useBooksNew";
import BookCard from "./BookCard";
import BookFilters from "../../shared/BookFilters";
import BookDetail from "../../shared/BookDetail";
import LoanModal from "../../../components/LoanModal";
import { toast } from "react-toastify";
import loanService from "../../../services/loanService";
import { FaFilter, FaChevronLeft, FaChevronRight } from "react-icons/fa";
// P2 FIX: the one unguarded console.error call below replaced with the
// shared logger utility (frontend/src/utils/logger.js). This file's
// existing "../../../services/loanService" import confirms it sits 3
// levels under src, so the logger path below is "../../../utils/logger".
import { logger } from "../../../utils/logger";

// ============================================================================
// COMPOSANT PRINCIPAL : BookCatalog (Avec Nouveaux Filtres)
// ============================================================================
const BookCatalog = () => {
  // ==========================================================================
  // 1. HOOK : NOUVEAU HOOK AVEC PAGINATION
  // ==========================================================================
  const { 
    // Données
    books, 
    loading, 
    pagination,
    filters,
    
    // Actions pagination
    goToPage,
    setLimit,
    
    // Actions filtres
    updateFilter,
    resetFilters,
    
    // Actions CRUD
    getBookById,
    refresh
  } = useBooks();

  // ==========================================================================
  // 2. ÉTATS LOCAUX
  // ==========================================================================
  const [showDetail, setShowDetail] = useState(false);
  const [showLoanModal, setShowLoanModal] = useState(false);
  const [selectedBookForLoan, setSelectedBookForLoan] = useState(null);
  const [isRequestingLoan, setIsRequestingLoan] = useState(false);
  const [showMobileStats, setShowMobileStats] = useState(false);

  // ==========================================================================
  // 3. FONCTIONS DE GESTION
  // ==========================================================================
  
  const handleViewDetails = async (bookId) => {
    try {
      const book = await getBookById(bookId);
      setSelectedBookForLoan(book);
      setShowDetail(true);
    } catch (error) {
      toast.error("Impossible de charger les détails du livre");
    }
  };

  const handleRequestLoan = (bookId) => {
    const book = books.find((b) => b._id === bookId);
    
    if (!book) {
      toast.error("Livre non trouvé");
      return;
    }

    if (!book.isAvailable || book.availableCopies <= 0) {
      toast.error(`❌ Ce livre n'est pas disponible (${book.availableCopies}/${book.totalCopies || '?'} exemplaires)`);
      return;
    }

    setSelectedBookForLoan(book);
    setShowLoanModal(true);
  };

  const handleConfirmLoan = async (loanPeriod) => {
    if (!selectedBookForLoan) return;

    setIsRequestingLoan(true);

    try {
       await loanService.requestLoan(
        selectedBookForLoan._id,
        loanPeriod,
      );

      toast.success("✅ Demande de prêt envoyée avec succès !");
      refresh(); // Rafraîchir la liste
      setShowLoanModal(false);
      setSelectedBookForLoan(null);

    } catch (error) {
      logger.error("❌ Erreur prêt:", error);
      
      let errorMessage = "Erreur lors de la demande de prêt";
      if (error.response?.status === 400) {
        if (error.response.data?.message?.includes("not available")) {
          errorMessage = "Ce livre n'est plus disponible";
        } else if (error.response.data?.message?.includes("already requested")) {
          errorMessage = "Vous avez déjà demandé ce livre";
        } else if (error.response.data?.message?.includes("maximum")) {
          errorMessage = "Vous avez atteint le nombre maximum de prêts (5)";
        }
      } else if (error.response?.status === 401) {
        errorMessage = "Veuillez vous reconnecter";
        localStorage.removeItem("token");
        window.location.href = "/login";
      } else if (error.request) {
        errorMessage = "Problème de connexion au serveur";
      }
      
      toast.error(`❌ ${errorMessage}`);
    } finally {
      setIsRequestingLoan(false);
    }
  };

  const handleCloseDetail = () => {
    setSelectedBookForLoan(null);
    setShowDetail(false);
  };

  // ==========================================================================
  // 4. COMPOSANT DE PAGINATION
  // ==========================================================================
  
  const PaginationControls = () => {
    if (pagination.totalPages <= 1) return null;

    const getPageNumbers = () => {
      const delta = 2;
      const range = [];
      const rangeWithDots = [];
      let l;

      for (let i = 1; i <= pagination.totalPages; i++) {
        if (i === 1 || i === pagination.totalPages || (i >= pagination.page - delta && i <= pagination.page + delta)) {
          range.push(i);
        }
      }

      range.forEach((i) => {
        if (l) {
          if (i - l === 2) {
            rangeWithDots.push(l + 1);
          } else if (i - l !== 1) {
            rangeWithDots.push('...');
          }
        }
        rangeWithDots.push(i);
        l = i;
      });

      return rangeWithDots;
    };

    return (
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-8">
        {/* Sélecteur de limite */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Afficher
          </span>
          <select
            value={pagination.limit}
            onChange={(e) => setLimit(parseInt(e.target.value))}
            className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            par page
          </span>
        </div>

        {/* Navigation */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => goToPage(pagination.page - 1)}
            disabled={pagination.page === 1}
            className="p-2 bg-gray-200 dark:bg-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            aria-label="Page précédente"
          >
            <FaChevronLeft />
          </button>
          
          <div className="flex items-center gap-1">
            {getPageNumbers().map((pageNum, index) => (
              pageNum === '...' ? (
                <span key={`dots-${index}`} className="px-2 text-gray-500">...</span>
              ) : (
                <button
                  key={pageNum}
                  onClick={() => goToPage(pageNum)}
                  className={`w-10 h-10 rounded-lg ${
                    pagination.page === pageNum
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  {pageNum}
                </button>
              )
            ))}
          </div>

          <button
            onClick={() => goToPage(pagination.page + 1)}
            disabled={pagination.page === pagination.totalPages}
            className="p-2 bg-gray-200 dark:bg-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            aria-label="Page suivante"
          >
            <FaChevronRight />
          </button>
        </div>
      </div>
    );
  };

  // ==========================================================================
  // 5. RENDU
  // ==========================================================================
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-3 sm:p-4 md:p-5 lg:p-6 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        
        {/* ================================================== */}
        {/* EN-TÊTE */}
        {/* ================================================== */}
        <div className="mb-4 sm:mb-5 md:mb-6 lg:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                <span className="text-3xl sm:text-4xl">📚</span>
                <span>Catalogue des Livres</span>
              </h1>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
                {pagination.total > 0 ? (
                  <>
                    <span className="font-semibold">{pagination.total}</span> livres au total
                    {pagination.totalPages > 1 && (
                      <span className="ml-1">
                        (page {pagination.page}/{pagination.totalPages})
                      </span>
                    )}
                  </>
                ) : (
                  "Chargement..."
                )}
              </p>
            </div>
            
            {/* Mobile Stats Toggle */}
            <button
              onClick={() => setShowMobileStats(!showMobileStats)}
              className="sm:hidden flex items-center justify-center gap-2 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-md"
            >
              <FaFilter className="text-blue-500" />
              <span className="text-sm font-medium">Filtres actifs</span>
            </button>
          </div>
        </div>

        {/* ================================================== */}
        {/* FILTRES - AVEC TOUS LES NOUVEAUX PROPS */}
        {/* ================================================== */}
        <div className="mb-4 sm:mb-5 md:mb-6 lg:mb-8">
          <BookFilters
            // Recherche texte
            searchTerm={filters.searchTerm}
            setSearchTerm={(value) => updateFilter('searchTerm', value)}
            
            // Catégorie
            selectedCategory={filters.category}
            setSelectedCategory={(value) => updateFilter('category', value)}
            
            // ✅ NOUVEAUX FILTRES
            author={filters.author}
            setAuthor={(value) => updateFilter('author', value)}
            
            cote={filters.cote}
            setCote={(value) => updateFilter('cote', value)}
            
            yearFrom={filters.yearFrom}
            setYearFrom={(value) => updateFilter('yearFrom', value)}
            
            yearTo={filters.yearTo}
            setYearTo={(value) => updateFilter('yearTo', value)}
            
            isAvailable={filters.isAvailable}
            setIsAvailable={(value) => updateFilter('isAvailable', value)}
            
            // ✅ FILTRE LANGUE
            selectedLanguages={filters.languages}
            setSelectedLanguages={(value) => updateFilter('languages', value)}
            
         //   enriched={filters.enriched}
           // setEnriched={(value) => updateFilter('enriched', value)}
            
            // Tri
            sortBy={filters.sortBy}
            setSortBy={(value) => updateFilter('sortBy', value)}
            
            order={filters.order}
            setOrder={(value) => updateFilter('order', value)}
            
            // Reset
            onReset={resetFilters}
          />
        </div>

        {/* ================================================== */}
        {/* STATISTIQUES DE PAGINATION */}
        {/* ================================================== */}
        
        {/* Mobile Stats Panel */}
        {showMobileStats && (
          <div className="sm:hidden mb-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-3">
              <div>
                <p className="text-gray-700 dark:text-gray-300 font-medium">
                  <span className="text-xl font-bold text-blue-600">{books.length}</span> livres affichés
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  sur {pagination.total} au total • page {pagination.page}/{pagination.totalPages}
                </p>
              </div>
              <button
                onClick={() => setShowMobileStats(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            {/* Résumé des filtres actifs */}
            <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              {filters.searchTerm && (
                <p>🔍 "{filters.searchTerm}"</p>
              )}
              {filters.author && (
                <p>✍️ {filters.author}</p>
              )}
              {filters.cote && (
                <p>🔖 {filters.cote}</p>
              )}
              {filters.category !== 'all' && (
                <p>📑 {filters.category}</p>
              )}
              {(filters.yearFrom || filters.yearTo) && (
                <p>📅 {filters.yearFrom || '...'} - {filters.yearTo || '...'}</p>
              )}
            </div>
          </div>
        )}

        {/* Desktop Stats */}
        <div className="hidden sm:flex justify-between items-center mb-4">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            <span className="font-semibold text-lg text-blue-600">
              {books.length}
            </span> livres affichés
            {pagination.total > 0 && (
              <span className="text-gray-500 ml-1">
                (page {pagination.page}/{pagination.totalPages} • {pagination.total} total)
              </span>
            )}
          </p>

          {/* Légende */}
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span>Disponible</span>
            </span>
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-red-500"></div>
              <span>Indisponible</span>
            </span>
            
          </div>
        </div>

        {/* ================================================== */}
        {/* GRILLE DES LIVRES */}
        {/* ================================================== */}
        
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            <p className="mt-3 text-sm text-gray-600">Chargement des livres...</p>
          </div>
        ) : books.length > 0 ? (
          <>
            <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
              {books.map((book) => (
                <BookCard
                  key={book._id}
                  book={book}
                  onViewDetails={handleViewDetails}
                  onRequestLoan={handleRequestLoan}
                  userRole="student"
                />
              ))}
            </div>

            {/* Pagination */}
            <PaginationControls />
          </>
        ) : (
          /* Aucun résultat */
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
            <div className="text-4xl mb-3">🔍</div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              Aucun livre trouvé
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Essayez de modifier vos critères de recherche
            </p>
            <button
              onClick={resetFilters}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Réinitialiser les filtres
            </button>
          </div>
        )}

        {/* ================================================== */}
        {/* MODALS */}
        {/* ================================================== */}
        
        {showDetail && selectedBookForLoan && (
          <BookDetail
            book={selectedBookForLoan}
            onClose={handleCloseDetail}
            onRequestLoan={() => handleRequestLoan(selectedBookForLoan._id)}
            userRole="student"
          />
        )}
        
        {showLoanModal && selectedBookForLoan && (
          <LoanModal
            book={selectedBookForLoan}
            onClose={() => {
              setShowLoanModal(false);
              setSelectedBookForLoan(null);
            }}
            onConfirm={handleConfirmLoan}
            isLoading={isRequestingLoan}
          />
        )}
      </div>
    </div>
  );
};

export default BookCatalog;