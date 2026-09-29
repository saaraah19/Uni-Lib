// ============================================================================
// COMPOSANT PRINCIPAL : BooksCrud (AVEC PAGINATION)
// ============================================================================
// Point d'entrée de l'application de gestion des livres
// Coordonne tous les sous-composants et gère l'état global
// ============================================================================

import { useState } from "react";
import { FaPlus } from "react-icons/fa";

// Hooks personnalisés
import { useBooks } from "./hooks/useBooksNew";

// Composants UI
import BookList from "../../shared/BookList";
import BookForm from "./BookForm";
import BookDetail from "../../shared/BookDetail";
import BookFilters from "../../shared/BookFilters";
import BookStats from "../../shared/BookStats";
import ConfirmationModal from "../../../components/modals/ConfirmationModal";

const BooksCrud = () => {
  // ==========================================================================
  // ÉTATS GLOBAUX
  // ==========================================================================
  
  const [mode, setMode] = useState("list"); // "list", "add", "edit", "view"
  const [bookToEdit, setBookToEdit] = useState(null);

  // UX/CONSISTENCY FIX (P2): deletion confirmation now goes through
  // ConfirmationModal (replaces the window.confirm() previously called
  // inside useBooksNew.deleteBook, which has been removed from the hook).
  const [bookToDelete, setBookToDelete] = useState(null); // { id, title } | null
  const [isDeleting, setIsDeleting] = useState(false);

  // ==========================================================================
  // HOOKS PERSONNALISÉS
  // ==========================================================================
  
  const { 
    books, 
    loading, 
    pagination,
    filters,
    goToPage,
    setLimit,
    updateFilter,
    resetFilters,
    getBookById,
    createBook,
    updateBook,
    deleteBook,
  } = useBooks({
    isAvailable: '',
    enriched: ''
  });

  // ==========================================================================
  // HANDLERS PRINCIPAUX
  // ==========================================================================

  const handleAddBook = async (bookData) => {
    try {
      await createBook(bookData);
      setMode("list");
    } catch (error) {
      console.error("Erreur ajout:", error);
    }
  };

  const handleEditBook = async (bookData) => {
    try {
      await updateBook(bookToEdit._id, bookData);
      setMode("list");
      setBookToEdit(null);
    } catch (error) {
      console.error("Erreur modification:", error);
    }
  };

  const handleStartEdit = (book) => {
    setBookToEdit(book);
    setMode("edit");
  };

  const handleViewBook = async (bookId) => {
    try {
      const book = await getBookById(bookId);
      setBookToEdit(book);
      setMode("view");
    } catch (error) {
      console.error("Erreur vue détail:", error);
    }
  };

  /**
   * Ouvre la confirmation de suppression (ne supprime rien encore).
   */
  const handleRequestDeleteBook = (bookId) => {
    const book = books.find((b) => b._id === bookId);
    setBookToDelete({ id: bookId, title: book?.title || "ce livre" });
  };

  /**
   * Confirme et exécute la suppression.
   */
  const handleConfirmDeleteBook = async () => {
    if (!bookToDelete) return;
    setIsDeleting(true);
    try {
      await deleteBook(bookToDelete.id);
      setBookToDelete(null);
    } catch (error) {
      // toast d'erreur déjà géré dans le hook
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDeleteBook = () => {
    if (isDeleting) return;
    setBookToDelete(null);
  };

  const handleCloseDetail = () => {
    setBookToEdit(null);
    setMode("list");
  };

  // ==========================================================================
  // FILTRES PERSONNALISÉS POUR LE STAFF
  // ==========================================================================
  
  const handleFilterChange = (key, value) => {
    updateFilter(key, value);
  };

  const handleResetFilters = () => {
    resetFilters();
  };

  // ==========================================================================
  // RENDU CONDITIONNEL
  // ==========================================================================

  if (mode === "add" || mode === "edit") {
    return (
      <BookForm
        onSubmit={mode === "add" ? handleAddBook : handleEditBook}
        onCancel={() => {
          setMode("list");
          setBookToEdit(null);
        }}
        initialData={bookToEdit}
        mode={mode}
      />
    );
  }

  // ==========================================================================
  // RENDU PRINCIPAL (mode liste)
  // ==========================================================================
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-6 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        
        {/* En-tête avec titre et bouton ajouter */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
              <span>📚</span> Gestion des Livres
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              {pagination?.total > 0 ? (
                <>
                  <span className="font-semibold">{pagination.total}</span> livres au total
                  {pagination.totalPages > 1 && (
                    <span className="ml-1">
                      • page {pagination.page}/{pagination.totalPages}
                    </span>
                  )}
                </>
              ) : (
                "Chargement..."
              )}
            </p>
          </div>

          <button
            onClick={() => {
              setBookToEdit(null);
              setMode("add");
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-semibold flex items-center gap-2 shadow-lg hover:shadow-xl transition-all"
            aria-label="Ajouter un livre"
          >
            <FaPlus /> Ajouter un Livre
          </button>
        </div>

        {/* Barre de recherche et filtres - VERSION STAFF */}
        <div className="mb-6">
          <BookFilters
            searchTerm={filters.searchTerm}
            setSearchTerm={(value) => handleFilterChange('searchTerm', value)}
            selectedCategory={filters.category}
            setSelectedCategory={(value) => handleFilterChange('category', value)}
            author={filters.author}
            setAuthor={(value) => handleFilterChange('author', value)}
            cote={filters.cote}
            setCote={(value) => handleFilterChange('cote', value)}
            yearFrom={filters.yearFrom}
            setYearFrom={(value) => handleFilterChange('yearFrom', value)}
            yearTo={filters.yearTo}
            setYearTo={(value) => handleFilterChange('yearTo', value)}
            isAvailable={filters.isAvailable}
            setIsAvailable={(value) => handleFilterChange('isAvailable', value)}
            enriched={filters.enriched}
            setEnriched={(value) => handleFilterChange('enriched', value)}
            sortBy={filters.sortBy}
            setSortBy={(value) => handleFilterChange('sortBy', value)}
            order={filters.order}
            setOrder={(value) => handleFilterChange('order', value)}
            onReset={handleResetFilters}
          />
        </div>

        {/* Résumé des filtres actifs pour staff */}
        {(filters.searchTerm || filters.author || filters.cote || filters.category !== 'all' || 
          filters.yearFrom || filters.yearTo || filters.isAvailable || filters.enriched) && (
          <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-sm">
            <p className="text-blue-800 dark:text-blue-300 flex items-center gap-2">
              <span>🔍</span>
              <span>Filtres actifs:</span>
              {filters.searchTerm && <span className="bg-white dark:bg-gray-800 px-2 py-1 rounded">"{filters.searchTerm}"</span>}
              {filters.author && <span className="bg-white dark:bg-gray-800 px-2 py-1 rounded">Auteur: {filters.author}</span>}
              {filters.cote && <span className="bg-white dark:bg-gray-800 px-2 py-1 rounded font-mono">Cote: {filters.cote}</span>}
              {filters.category !== 'all' && <span className="bg-white dark:bg-gray-800 px-2 py-1 rounded">Cat: {filters.category}</span>}
              {filters.isAvailable && <span className="bg-white dark:bg-gray-800 px-2 py-1 rounded">Disponible</span>}
              {filters.enriched && <span className="bg-white dark:bg-gray-800 px-2 py-1 rounded">Enrichi</span>}
            </p>
          </div>
        )}

        {/* Liste des livres avec pagination */}
        <BookList
          books={books}
          loading={loading}
          pagination={pagination}
          onView={handleViewBook}
          onEdit={handleStartEdit}
          onDelete={handleRequestDeleteBook}
          onPageChange={goToPage}
          onLimitChange={setLimit}
        />

        {/* Statistiques */}
        <BookStats />

      </div>

      {/* Modal de détail du livre */}
      {mode === "view" && bookToEdit && (
        <BookDetail
          book={bookToEdit}
          userRole="staff" 
          onClose={handleCloseDetail}
        />
      )}

      {/* Confirmation de suppression (remplace window.confirm) */}
      <ConfirmationModal
        isOpen={!!bookToDelete}
        title="Supprimer ce livre ?"
        message="Le livre sera définitivement supprimé du catalogue, ainsi que les favoris associés."
        itemName={bookToDelete?.title}
        onConfirm={handleConfirmDeleteBook}
        onCancel={handleCancelDeleteBook}
        isLoading={isDeleting}
        confirmText="Supprimer"
        cancelText="Annuler"
        isDangerous={true}
      />
    </div>
  );
};

export default BooksCrud;
