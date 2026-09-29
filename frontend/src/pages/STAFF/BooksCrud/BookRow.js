// ============================================================================
// COMPOSANT : BookRow (Avec Cote)
// ============================================================================

import { FaEye, FaEdit, FaTrash } from "react-icons/fa";

const BookRow = ({ book, onView, onEdit, onDelete }) => {
  
  // Normalisation des données
  const bookData = {
    _id: book._id,
    title: book.title,
    authors: Array.isArray(book.authors) ? book.authors.join(', ') : book.authors,
    coverImage: book.coverImage,
    category: book.category,
    isbn: book.isbn,
    cote: book.cote,
    pages: book.pages,
    publicationYear: book.publicationYear,
    isAvailable: book.isAvailable,
    availableCopies: book.availableCopies || 0,
    totalCopies: book.totalCopies || book.availableCopies || 1,
    enriched: book.enriched || false
  };

  return (
    <div className="grid grid-cols-12 gap-4 p-4 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
      
      {/* Colonne 1-5 : Informations du livre */}
      <div className="col-span-12 md:col-span-5 flex items-center gap-4">
        {/* Image */}
        <div className="w-12 h-16 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center overflow-hidden flex-shrink-0">
          {bookData.coverImage && bookData.coverImage !== "default-book-cover.jpg" ? (
            <img
              src={bookData.coverImage}
              alt={bookData.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-gray-400 text-xl">📖</span>
          )}
        </div>

        {/* Détails */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-800 dark:text-gray-100 truncate">
              {bookData.title}
            </h3>
           
          </div>
          
          <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
            {bookData.authors}
          </p>
          
          {/* ✅ Affichage de la cote */}
          <div className="flex items-center gap-2 mt-1 text-xs">
            {bookData.cote && (
              <span className="font-mono bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded">
                🔖 {bookData.cote}
              </span>
            )}
            <span className="text-gray-500">
              {bookData.category}
            </span>
          </div>
        </div>
      </div>

      {/* Colonne 6-7 : ISBN / Cote (Desktop only) */}
      <div className="hidden md:flex md:col-span-2 items-center">
        <div className="flex flex-col">
          <code className="bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-2 py-1 rounded text-xs font-mono">
            {bookData.isbn}
          </code>
          {bookData.cote && (
            <span className="text-xs text-gray-500 mt-1 font-mono">
              {bookData.cote}
            </span>
          )}
        </div>
      </div>

      {/* Colonne 8-9 : Disponibilité */}
      <div className="col-span-6 md:col-span-2 flex items-center">
        <div>
          <span
            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              bookData.isAvailable && bookData.availableCopies > 0
                ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
                : "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300"
            }`}
          >
            {bookData.isAvailable && bookData.availableCopies > 0
              ? `${bookData.availableCopies}/${bookData.totalCopies} dispo`
              : "Indisponible"}
          </span>
          
          {/* Mini barre de progression */}
          {bookData.totalCopies > 1 && (
            <div className="w-16 h-1 bg-gray-200 rounded-full mt-1">
              <div 
                className="h-1 bg-green-500 rounded-full"
                style={{ width: `${(bookData.availableCopies / bookData.totalCopies) * 100}%` }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Colonne 10-12 : Actions */}
      <div className="col-span-6 md:col-span-3 flex items-center justify-end gap-2">
        <button
          onClick={() => onView(bookData._id)}
          className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
          title="Voir détails"
        >
          <FaEye size={18} />
        </button>

        <button
          onClick={() => onEdit(book)}
          className="p-2 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/30 rounded-lg transition-colors"
          title="Modifier"
        >
          <FaEdit size={18} />
        </button>

        <button
          onClick={() => onDelete(bookData._id)}
          className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
          title="Supprimer"
        >
          <FaTrash size={18} />
        </button>
      </div>
    </div>
  );
};

export default BookRow;