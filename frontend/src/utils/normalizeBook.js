// MAINTAINABILITY FIX (P2): book normalization (filling in defaults for
// missing fields like authors/cote/availableCopies/isAvailable) was
// reimplemented independently in BookCard.js, BookDetail.js,
// useBookDetail.js and FavoritesPage.js — each with slightly different
// default values (e.g. availableCopies defaulted to 1 in one place, 0 in
// another). That divergence is a real source of subtle display bugs
// (a book could show as "available" in one screen and "unavailable" in
// another for the exact same underlying data). This is now the single
// source of truth; all four call sites should import and use it instead
// of hand-rolling their own defaults.

/**
 * Normalize a raw book object (as returned by the API) into a consistent
 * shape with sane defaults, used consistently across BookCard, BookDetail,
 * FavoritesPage, and useBookDetail.
 *
 * @param {Object} book - raw book object from the API (or localStorage cache)
 * @returns {Object} normalized book with defaults + derived fields
 */
export function normalizeBook(book = {}) {
  const authors = (() => {
    if (!book.authors) return ['Auteur inconnu'];
    if (Array.isArray(book.authors)) return book.authors.length > 0 ? book.authors : ['Auteur inconnu'];
    return [book.authors];
  })();

  const totalCopies = book.totalCopies ?? book.availableCopies ?? 1;
  const availableCopies = book.availableCopies ?? 0;
  const isAvailable = book.isAvailable ?? availableCopies > 0;

  return {
    _id: book._id || 'unknown-id',
    title: book.title || 'Titre inconnu',
    title_original: book.title_original || null,
    authors,
    author_original: book.author_original || null,

    isbn: book.isbn || 'ISBN non disponible',
    cote: book.cote || null,
    cote_info: book.cote_info || { section: '', category_code: '', id_number: '' },

    description: book.description || 'Aucune description disponible.',
    coverImage: book.coverImage && book.coverImage !== 'default-book-cover.jpg'
      ? book.coverImage
      : null,

    category: book.category || 'Non catégorisé',
    publisher: book.publisher || book.editeur || 'Éditeur inconnu',
    publicationYear: book.publicationYear || book.pubYear || book.annee || 'Non spécifiée',
    pages: book.pages || book.pageCount || 0,
    language: book.language || book.langue || 'Français',

    totalCopies,
    availableCopies,
    isAvailable,

    // Derived / display-ready fields, computed once here instead of ad hoc
    // in every component.
    availabilityRatio: totalCopies ? `${availableCopies}/${totalCopies}` : `${availableCopies}`,
    borrowRate: totalCopies > 0
      ? Math.round(((totalCopies - availableCopies) / totalCopies) * 100)
      : 0,
    coteDisplay: book.cote_info?.section && book.cote_info?.category_code && book.cote_info?.id_number
      ? `${book.cote_info.section}-${book.cote_info.category_code}-${book.cote_info.id_number}`
      : book.cote || null,

    createdAt: book.createdAt || null,
    updatedAt: book.updatedAt || null,
  };
}

export default normalizeBook;
