// ============================================================================
// COMPOSANT : BookList (Staff - Avec Pagination)
// ============================================================================


import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import BookRow from "../STAFF/BooksCrud/BookRow";
const BookList = ({ 
  books, 
  loading, 
  pagination,
  onView, 
  onEdit, 
  onDelete,
  onPageChange,
  onLimitChange
}) => {
  
  // ==========================================================================
  // COMPOSANT DE PAGINATION
  // ==========================================================================
  
  const PaginationControls = () => {
    if (!pagination || pagination.totalPages <= 1) return null;

    return (
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Afficher
          </span>
          <select
            value={pagination.limit}
            onChange={(e) => onLimitChange(parseInt(e.target.value))}
            className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
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

        <div className="flex items-center gap-2">
          <button
            onClick={() => onPageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
            className="p-2 bg-gray-200 dark:bg-gray-600 rounded-lg disabled:opacity-50"
          >
            <FaChevronLeft />
          </button>
          
          <span className="px-4 py-2 bg-white dark:bg-gray-800 rounded-lg">
            Page {pagination.page} / {pagination.totalPages}
          </span>

          <button
            onClick={() => onPageChange(pagination.page + 1)}
            disabled={pagination.page === pagination.totalPages}
            className="p-2 bg-gray-200 dark:bg-gray-600 rounded-lg disabled:opacity-50"
          >
            <FaChevronRight />
          </button>
        </div>
      </div>
    );
  };

  // ==========================================================================
  // RENDU
  // ==========================================================================

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        <p className="mt-3 text-gray-600">Chargement des livres...</p>
      </div>
    );
  }

  if (books.length === 0) {
    return (
      <div className="p-8 text-center bg-white dark:bg-gray-800 rounded-xl shadow-md">
        <p className="text-lg text-gray-600">Aucun livre trouvé</p>
        <p className="text-sm text-gray-500 mt-2">
          Essayez de modifier vos critères de recherche
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
      
      {/* En-tête du tableau */}
      <div className="hidden md:grid md:grid-cols-12 gap-4 p-4 bg-gray-50 dark:bg-gray-700 border-b font-semibold text-sm">
        <div className="col-span-5">Livre</div>
        <div className="col-span-2">ISBN / Cote</div>
        <div className="col-span-2">Disponibilité</div>
        <div className="col-span-3 text-center">Actions</div>
      </div>

      {/* Liste des livres */}
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {books.map((book) => (
          <BookRow
            key={book._id}
            book={book}
            onView={onView}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>

      {/* Pied de page avec stats et pagination */}
      <div className="p-4 bg-gray-50 dark:bg-gray-700 border-t">
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-400">
            <span>
              <span className="font-semibold">{books.length}</span> livres affichés
              {pagination?.total > 0 && (
                <span className="ml-1">
                  sur <span className="font-semibold">{pagination.total}</span> total
                </span>
              )}
            </span>
            
            {/* Badges statistiques */}
            <div className="flex gap-2">
              <span className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-2 py-1 rounded-full text-xs">
                {books.filter(b => b.isAvailable).length} dispo
              </span>
           
            </div>
          </div>
          
          {/* Contrôles pagination */}
          <PaginationControls />
        </div>
      </div>
    </div>
  );
};

export default BookList;