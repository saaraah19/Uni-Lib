// ============================================================================
// COMPOSANT : BookDetail (Avec Cote et Statistiques)
// ============================================================================

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  FaTimes,
  FaHeart,
  FaRegHeart,
  FaBook,
  FaUser,
  FaCalendar,
  FaLanguage,
  FaFileAlt,
  FaBuilding,
  FaHashtag,
  FaChevronLeft,
  FaTag,
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import { favoriteService } from '../../services/favoriteService';
//import BookStatsCard from '../../components/shared/BookStatsCard';
import BookActionButtons from '../../components/shared/BookActionButtons';
import { useModalA11y } from '../../hooks/useModalA11y';
import { normalizeBook } from '../../utils/normalizeBook';

const BookDetail = ({ book, onClose, onRequestLoan, userRole = 'student' }) => {
  // ==========================================================================
  // ÉTATS
  // ==========================================================================
  
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRequestingLoan, setIsRequestingLoan] = useState(false);
  const [isCheckingFavorite, setIsCheckingFavorite] = useState(true);

  // ACCESSIBILITY FIX (P2): focus trap + Escape-to-close + focus
  // restoration. BookDetail was previously closable only via mouse
  // (backdrop click or the X button), with no keyboard escape hatch and no
  // focus containment.
  const modalRef = useModalA11y({ isOpen: true, onClose });

  // ==========================================================================
  // NORMALISATION DES DONNÉES (utilitaire partagé — voir utils/normalizeBook.js)
  // ==========================================================================
  // MAINTAINABILITY FIX (P2): this used to be ~50 lines of inline useMemo
  // duplicating normalization logic that also existed (slightly differently)
  // in BookCard, useBookDetail and FavoritesPage. Now delegates to the
  // single shared normalizeBook() utility so all four screens agree on
  // what "available", "authors", "cote", etc. actually mean for the same
  // underlying book.
  const bookWithDefaults = useMemo(() => normalizeBook(book), [book]);

  // ==========================================================================
  // FONCTIONS
  // ==========================================================================

  const checkIfFavorite = useCallback(async () => {
    if (userRole !== 'student') {
      setIsCheckingFavorite(false);
      return;
    }

    setIsCheckingFavorite(true);
    try {
      const response = await favoriteService.checkIsFavorite(bookWithDefaults._id);
      setIsFavorite(response.isFavorite);
    } catch (error) {
      console.error('❌ Erreur vérification favori:', error);
      // Fallback localStorage
      const favorites = JSON.parse(localStorage.getItem('favoriteBooks') || '[]');
      const isBookFavorite = favorites.some((fav) => fav._id === bookWithDefaults._id);
      setIsFavorite(isBookFavorite);
    } finally {
      setIsCheckingFavorite(false);
    }
  }, [bookWithDefaults._id, userRole]);

  const handleFavoriteToggle = async () => {
    if (userRole !== 'student') {
      toast.info('Seuls les étudiants peuvent ajouter des favoris');
      return;
    }

    setIsLoading(true);
    const previousState = isFavorite;

    try {
      if (isFavorite) {
        await favoriteService.removeFromFavorites(bookWithDefaults._id);
        setIsFavorite(false);

        // Mettre à jour localStorage
        const favorites = JSON.parse(localStorage.getItem('favoriteBooks') || '[]');
        const updatedFavorites = favorites.filter((fav) => fav._id !== bookWithDefaults._id);
        localStorage.setItem('favoriteBooks', JSON.stringify(updatedFavorites));
        toast.success('❌ Retiré des favoris');
      } else {
        await favoriteService.addToFavorites(bookWithDefaults._id);
        setIsFavorite(true);

        // Stocker TOUTES les données
        const favorites = JSON.parse(localStorage.getItem('favoriteBooks') || '[]');
        const updatedFavorites = [...favorites, bookWithDefaults];
        localStorage.setItem('favoriteBooks', JSON.stringify(updatedFavorites));
        toast.success('❤️ Ajouté aux favoris');
      }
    } catch (error) {
      console.error('❌ Erreur:', error);
      setIsFavorite(previousState);
      toast.error('Erreur lors de l\'opération');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoanRequest = async () => {
    if (!bookWithDefaults.isAvailable || bookWithDefaults.availableCopies <= 0) {
      toast.error(`❌ Ce livre n'est pas disponible (${bookWithDefaults.availabilityRatio})`);
      return;
    }

    setIsRequestingLoan(true);
    try {
      if (onRequestLoan) {
        await onRequestLoan(bookWithDefaults._id);
      }
    } catch (error) {
      console.error('❌ Erreur:', error);
      toast.error('Erreur lors de la demande de prêt');
    } finally {
      setIsRequestingLoan(false);
    }
  };

  // ==========================================================================
  // EFFETS
  // ==========================================================================

  useEffect(() => {
    checkIfFavorite();
  }, [checkIfFavorite]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  // ==========================================================================
  // RENDU
  // ==========================================================================

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50 transition-opacity duration-300"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="book-detail-title"
        className="bg-white dark:bg-gray-800 rounded-t-xl sm:rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto transition-all duration-300"
      >
        
        {/* ================================================== */}
        {/* EN-TÊTE */}
        {/* ================================================== */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 z-10 border-b border-gray-200 dark:border-gray-700">
          
          {/* Mobile Header */}
          <div className="sm:hidden p-4">
            <div className="flex items-center gap-3 mb-2">
              <button
                onClick={onClose}
                className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
              >
                <FaChevronLeft className="text-lg" />
              </button>
              <h2 id="book-detail-title" className="text-lg font-bold text-gray-800 dark:text-gray-100 flex-1 line-clamp-1">
                {bookWithDefaults.title}
              </h2>
              {userRole === 'student' && (
                <button
                  onClick={handleFavoriteToggle}
                  disabled={isLoading || isCheckingFavorite}
                  className={`p-2 rounded-full ${
                    (isLoading || isCheckingFavorite) ? 'opacity-50' : ''
                  }`}
                >
                  {isLoading || isCheckingFavorite ? (
                    <div className="w-5 h-5 border-2 border-gray-300 border-t-red-500 rounded-full animate-spin"></div>
                  ) : isFavorite ? (
                    <FaHeart className="text-red-500 text-xl" />
                  ) : (
                    <FaRegHeart className="text-gray-400 text-xl" />
                  )}
                </button>
              )}
            </div>

            {/* Badges mobiles */}
            <div className="flex flex-wrap items-center gap-2">
              {!isCheckingFavorite && isFavorite && (
                <span className="text-xs bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 px-2 py-1 rounded-full flex items-center gap-1">
                  <FaHeart className="text-xs" /> Favori
                </span>
              )}
              <span
                className={`text-xs px-2 py-1 rounded-full ${
                  bookWithDefaults.isAvailable
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                    : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                }`}
              >
                {bookWithDefaults.isAvailable
                  ? `${bookWithDefaults.availabilityRatio} dispo`
                  : 'Indisponible'}
              </span>
            </div>
          </div>

          {/* Desktop Header */}
          <div className="hidden sm:flex justify-between items-center p-4 md:p-6">
            <h2 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
              <span className="text-2xl md:text-3xl">📖</span>
              <span className="line-clamp-1 max-w-md">{bookWithDefaults.title}</span>

              {/* Badges desktop */}
              
              {!isCheckingFavorite && isFavorite && (
                <span className="text-xs bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 px-2 py-1 rounded-full flex items-center gap-1 ml-2">
                  <FaHeart className="text-xs" /> Favori
                </span>
              )}
              <span
                className={`text-xs px-2 py-1 rounded-full ml-2 ${
                  bookWithDefaults.isAvailable
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                    : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                }`}
              >
                {bookWithDefaults.isAvailable
                  ? `${bookWithDefaults.availabilityRatio} dispo`
                  : 'Indisponible'}
              </span>
            </h2>

            <div className="flex items-center gap-2">
              {userRole === 'student' && (
                <button
                  onClick={handleFavoriteToggle}
                  disabled={isLoading || isCheckingFavorite}
                  className={`p-2 rounded-full hover:bg-gray-100 ${
                    (isLoading || isCheckingFavorite) ? 'opacity-50' : ''
                  }`}
                >
                  {isLoading || isCheckingFavorite ? (
                    <div className="w-5 h-5 border-2 border-gray-300 border-t-red-500 rounded-full animate-spin"></div>
                  ) : isFavorite ? (
                    <FaHeart className="text-red-500 text-xl" />
                  ) : (
                    <FaRegHeart className="text-gray-400 hover:text-red-400 text-xl" />
                  )}
                </button>
              )}
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 text-xl p-2 hover:bg-gray-100 rounded-full"
                aria-label="Fermer"
              >
                <FaTimes />
              </button>
            </div>
          </div>
        </div>

        {/* ================================================== */}
        {/* CONTENU PRINCIPAL */}
        {/* ================================================== */}
        <div className="p-4 sm:p-6">
          
          {/* Mobile Layout */}
          <div className="md:hidden space-y-4">
            
            {/* Image */}
            <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
              {bookWithDefaults.coverImage ? (
                <img
                  src={bookWithDefaults.coverImage}
                  alt={bookWithDefaults.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/300x400?text=Couverture+Manquante';
                  }}
                />
              ) : (
                <div className="text-center text-gray-400">
                  <span className="text-4xl mb-1 block">📚</span>
                  <p className="text-xs">Pas de couverture</p>
                </div>
              )}
            </div>

            {/* ✅ SECTION COTE - Mobile */}
            {bookWithDefaults.cote && (
              <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 flex items-center gap-1 mb-2">
                  <FaTag className="text-blue-500" /> Cote
                </h3>
                <div className="font-mono text-sm bg-white dark:bg-gray-800 p-2 rounded border">
                  <div className="text-lg font-bold text-gray-800 dark:text-gray-200">
                    {bookWithDefaults.coteDisplay}
                  </div>
                  {bookWithDefaults.cote_info?.section && (
                    <div className="text-xs text-gray-500 mt-1">
                      Section: {bookWithDefaults.cote_info.section} | 
                      Code: {bookWithDefaults.cote_info.category_code} | 
                      N°: {bookWithDefaults.cote_info.id_number}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Auteur */}
            <div>
              <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 flex items-center gap-1 mb-1">
                <FaUser className="text-blue-500" /> Auteur(s)
              </h3>
              <p className="text-gray-900 dark:text-gray-100 text-base">
                {bookWithDefaults.authors.join(', ')}
              </p>
              {bookWithDefaults.author_original && (
                <p className="text-xs text-gray-500 mt-1">
                  Original: {bookWithDefaults.author_original}
                </p>
              )}
            </div>

            {/* Grille d'informations rapides */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 dark:bg-gray-700/50 p-2 rounded-lg">
                <span className="text-xs text-gray-500 block">Éditeur</span>
                <span className="text-sm font-medium text-gray-900 line-clamp-1">
                  {bookWithDefaults.publisher}
                </span>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 p-2 rounded-lg">
                <span className="text-xs text-gray-500 block">Année</span>
                <span className="text-sm font-medium text-gray-900">
                  {bookWithDefaults.publicationYear}
                </span>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 p-2 rounded-lg">
                <span className="text-xs text-gray-500 block">Pages</span>
                <span className="text-sm font-medium text-gray-900">
                  {bookWithDefaults.pages}
                </span>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 p-2 rounded-lg">
                <span className="text-xs text-gray-500 block">Langue</span>
                <span className="text-sm font-medium text-gray-900">
                  {bookWithDefaults.language}
                </span>
              </div>
            </div>

            {/* Statut détaillé */}
            <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
              <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
                Disponibilité
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Exemplaires:</span>
                  <span className="font-medium">
                    {bookWithDefaults.availableCopies} / {bookWithDefaults.totalCopies}
                  </span>
                </div>
                
                {/* Barre de progression */}
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-green-500 rounded-full"
                    style={{ width: `${(bookWithDefaults.availableCopies / bookWithDefaults.totalCopies) * 100}%` }}
                  />
                </div>
                
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Disponibles</span>
                  <span>{bookWithDefaults.borrowRate}% empruntés</span>
                </div>
              </div>
            </div>

            {/* Catégorie */}
            <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
              <span className="text-xs text-gray-500 block mb-1">Catégorie</span>
              <span className="text-sm font-medium text-gray-900">
                {bookWithDefaults.category}
              </span>
            </div>

            {/* Titre original si présent */}
            {bookWithDefaults.title_original && (
              <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                <span className="text-xs text-gray-500 block mb-1">Titre original</span>
                <span className="text-sm font-medium text-gray-900">
                  {bookWithDefaults.title_original}
                </span>
              </div>
            )}

            {/* ISBN */}
            <div>
              <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 flex items-center gap-1 mb-2">
                <FaHashtag className="text-blue-500" /> ISBN
              </h3>
              <code className="block bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-3 py-2 rounded text-xs font-mono break-all">
                {bookWithDefaults.isbn}
              </code>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 flex items-center gap-1 mb-2">
                <span className="text-blue-500">📝</span> Description
              </h3>
              <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border">
                <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">
                  {bookWithDefaults.description}
                </p>
              </div>
            </div>
          </div>

          {/* Desktop Layout */}
          <div className="hidden md:flex gap-6">
            
            {/* Colonne gauche - Image et stats */}
            <div className="w-1/3">
              
              {/* Image */}
              <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                {bookWithDefaults.coverImage ? (
                  <img
                    src={bookWithDefaults.coverImage}
                    alt={bookWithDefaults.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center text-gray-400">
                    <span className="text-5xl mb-2 block">📚</span>
                    <p className="text-sm">Pas de couverture</p>
                  </div>
                )}
              </div>

              {/* ✅ SECTION COTE - Desktop */}
              {bookWithDefaults.cote && (
                <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                    <FaTag className="text-blue-500" /> Cote
                  </h4>
                  <div className="font-mono bg-white dark:bg-gray-800 p-3 rounded border">
                    <div className="text-xl font-bold text-center">
                      {bookWithDefaults.coteDisplay}
                    </div>
                    {bookWithDefaults.cote_info?.section && (
                      <div className="text-xs text-gray-500 text-center mt-2">
                        Section {bookWithDefaults.cote_info.section} • 
                        Code {bookWithDefaults.cote_info.category_code} • 
                        N° {bookWithDefaults.cote_info.id_number}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Statut détaillé */}
              <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                  <FaBook className="text-blue-500" /> Disponibilité
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Exemplaires:</span>
                    <span className="font-medium">
                      {bookWithDefaults.availableCopies} / {bookWithDefaults.totalCopies}
                    </span>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Taux de disponibilité</span>
                      <span>{100 - bookWithDefaults.borrowRate}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-green-500 rounded-full"
                        style={{ width: `${(bookWithDefaults.availableCopies / bookWithDefaults.totalCopies) * 100}%` }}
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Catégorie:</span>
                    <span className="font-medium">{bookWithDefaults.category}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Colonne droite - Informations détaillées */}
            <div className="w-2/3 space-y-6">
              
              {/* Auteurs */}
              <div>
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2 mb-2">
                  <FaUser className="text-blue-600" /> Auteur(s)
                </h3>
                <p className="text-gray-900 dark:text-gray-100 text-lg">
                  {bookWithDefaults.authors.join(', ')}
                </p>
                {bookWithDefaults.author_original && (
                  <p className="text-sm text-gray-500 mt-1">
                    Nom original: {bookWithDefaults.author_original}
                  </p>
                )}
              </div>

              {/* Informations d'édition */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 flex items-center gap-1 mb-1">
                    <FaBuilding /> Éditeur
                  </h3>
                  <p className="text-gray-900 dark:text-gray-100">
                    {bookWithDefaults.publisher}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 flex items-center gap-1 mb-1">
                    <FaCalendar /> Année
                  </h3>
                  <p className="text-gray-900 dark:text-gray-100">
                    {bookWithDefaults.publicationYear}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 flex items-center gap-1 mb-1">
                    <FaFileAlt /> Pages
                  </h3>
                  <p className="text-gray-900 dark:text-gray-100">
                    {bookWithDefaults.pages}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 flex items-center gap-1 mb-1">
                    <FaLanguage /> Langue
                  </h3>
                  <p className="text-gray-900 dark:text-gray-100">
                    {bookWithDefaults.language}
                  </p>
                </div>
              </div>

              {/* Titre original si présent */}
              {bookWithDefaults.title_original && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2 mb-2">
                    <span className="text-blue-600">📄</span> Titre original
                  </h3>
                  <p className="text-gray-900 dark:text-gray-100">
                    {bookWithDefaults.title_original}
                  </p>
                </div>
              )}

              {/* ISBN */}
              <div>
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2 mb-2">
                  <FaHashtag className="text-blue-600" /> ISBN
                </h3>
                <code className="bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-3 py-2 rounded text-sm font-mono">
                  {bookWithDefaults.isbn}
                </code>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2 mb-2">
                  <span className="text-blue-600">📝</span> Description
                </h3>
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border">
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                    {bookWithDefaults.description}
                  </p>
                </div>
              </div>

              {/* Métadonnées */}
              {(bookWithDefaults.createdAt || bookWithDefaults.enrichedAt) && (
                <div className="text-xs text-gray-400 space-y-1 border-t pt-4">
                  {bookWithDefaults.createdAt && (
                    <p>Ajouté le: {new Date(bookWithDefaults.createdAt).toLocaleDateString()}</p>
                  )}
                  
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ================================================== */}
        {/* PIED DE PAGE */}
        {/* ================================================== */}
        <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-3 sm:p-4">
          <BookActionButtons
            isFavorite={isFavorite}
            isLoading={isLoading || isCheckingFavorite}
            isRequestingLoan={isRequestingLoan}
            book={bookWithDefaults}
            userRole={userRole}
            onFavoriteToggle={handleFavoriteToggle}
            onLoanRequest={handleLoanRequest}
            onClose={onClose}
          />
        </div>
      </div>
    </div>
  );
};

export default BookDetail;
