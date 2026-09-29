// ============================================================================
// COMPOSANT : BookCard (Avec Cote et Statut Enrichi)
// ============================================================================

import { useState, useEffect, useCallback } from "react";
import { FaHeart, FaRegHeart, FaHandshake } from "react-icons/fa";
import { toast } from "react-toastify";
import { favoriteService } from "../../../services/favoriteService";
import { normalizeBook } from "../../../utils/normalizeBook";

const BookCard = ({ 
  book, 
  onViewDetails, 
  onRequestLoan,
  userRole = "student" 
}) => {
  // ==========================================================================
  // ÉTATS
  // ==========================================================================
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRequestingLoan, setIsRequestingLoan] = useState(false);

  // ==========================================================================
  // DONNÉES NORMALISÉES (utilitaire partagé — voir utils/normalizeBook.js)
  // ==========================================================================
  // MAINTAINABILITY FIX (P2): previously reimplemented inline here with
  // slightly different defaults than BookDetail/useBookDetail/
  // FavoritesPage. Now uses the shared normalizeBook() so all four screens
  // agree on availability/authors/cote for the same book.
  const bookData = normalizeBook(book);

  // ==========================================================================
  // FONCTIONS UTILITAIRES
  // ==========================================================================
  
  const checkIfFavorite = useCallback(async () => {
    if (userRole !== "student") return;
    
    try {
      const response = await favoriteService.checkIsFavorite(bookData._id);
      setIsFavorite(response.isFavorite);
    } catch (error) {
      console.error("Erreur vérification favoris:", error);
      // Fallback localStorage avec données complètes
      const favorites = JSON.parse(localStorage.getItem("favoriteBooks") || "[]");
      const isBookFavorite = favorites.some(fav => fav._id === bookData._id);
      setIsFavorite(isBookFavorite);
    }
  }, [bookData._id, userRole]);

  const handleLoanRequest = async (e) => {
    e.stopPropagation();
    
    if (!bookData.isAvailable || bookData.availableCopies <= 0) {
      toast.error(`❌ Ce livre n'est pas disponible (${bookData.availabilityRatio} exemplaires)`);
      return;
    }

    if (userRole !== "student") {
      toast.info("Seuls les étudiants peuvent demander des prêts");
      return;
    }

    setIsRequestingLoan(true);
    
    try {
      if (onRequestLoan) {
        await onRequestLoan(bookData._id);
      } else {
        toast.info("Fonctionnalité de demande de prêt à venir !");
      }
    } catch (error) {
      console.error("Erreur demande prêt:", error);
      toast.error("❌ Erreur lors de la demande de prêt");
    } finally {
      setIsRequestingLoan(false);
    }
  };

  const handleFavoriteToggle = async (e) => {
    e.stopPropagation();
    
    if (userRole !== "student") {
      toast.info("Seuls les étudiants peuvent ajouter des favoris");
      return;
    }

    setIsLoading(true);
    
    try {
      if (isFavorite) {
        await favoriteService.removeFromFavorites(bookData._id);
        setIsFavorite(false);
        
        const favorites = JSON.parse(localStorage.getItem("favoriteBooks") || "[]");
        const updatedFavorites = favorites.filter(fav => fav._id !== bookData._id);
        localStorage.setItem("favoriteBooks", JSON.stringify(updatedFavorites));
        
        toast.success("Retiré des favoris");
      } else {
        await favoriteService.addToFavorites(bookData._id);
        setIsFavorite(true);
        
        // Stockage local basé sur les mêmes données normalisées affichées
        const favorites = JSON.parse(localStorage.getItem("favoriteBooks") || "[]");
        const updatedFavorites = [...favorites, { ...bookData, addedAt: new Date().toISOString() }];
        localStorage.setItem("favoriteBooks", JSON.stringify(updatedFavorites));
        
        toast.success("Ajouté aux favoris");
      }
    } catch (error) {
      console.error("Erreur modification favoris:", error);
      toast.error("Erreur lors de l'opération");
    } finally {
      setIsLoading(false);
    }
  };

  // ==========================================================================
  // EFFETS
  // ==========================================================================
  
  useEffect(() => {
    checkIfFavorite();
  }, [checkIfFavorite]);

  // ==========================================================================
  // RENDU
  // ==========================================================================
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-md sm:shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 dark:border-gray-700 relative group h-full flex flex-col">
      
      {/* Bouton Favori */}
      {userRole === "student" && (
        <button
          onClick={handleFavoriteToggle}
          disabled={isLoading}
          className={`absolute top-2 right-2 sm:top-3 sm:right-3 z-10 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full p-1.5 sm:p-2 shadow-md transition-all duration-300 ${
            isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110'
          }`}
          aria-label={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
          title={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
        >
          {isLoading ? (
            <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-gray-300 border-t-red-500 rounded-full animate-spin"></div>
          ) : isFavorite ? (
            <FaHeart className="text-red-500 text-base sm:text-xl" />
          ) : (
            <FaRegHeart className="text-gray-400 hover:text-red-400 text-base sm:text-xl" />
          )}
        </button>
      )}
      
      {/* SECTION 1 : IMAGE DE COUVERTURE */}
      <div 
        className="h-40 xs:h-48 sm:h-56 md:h-64 bg-gradient-to-br from-blue-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center overflow-hidden cursor-pointer relative"
        onClick={() => onViewDetails(bookData._id)}
      >
       
        
        {bookData.coverImage ? (
          <img 
            src={bookData.coverImage}
            alt={bookData.title}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="text-center p-4 sm:p-6">
            <span className="text-4xl sm:text-5xl md:text-6xl mb-2 sm:mb-4 block">📚</span>
            <p className="text-xs sm:text-sm text-gray-400 font-medium">Pas de couverture</p>
          </div>
        )}
      </div>
      
      {/* SECTION 2 : INFORMATIONS DU LIVRE */}
      <div className="p-3 sm:p-4 md:p-5 lg:p-6 flex-1 flex flex-col">
        
        {/* Titre et cote */}
        <div className="mb-1">
          <h3 
            className="font-bold text-base sm:text-lg md:text-xl text-gray-800 dark:text-gray-100 line-clamp-2 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            onClick={() => onViewDetails(bookData._id)}
          >
            {bookData.title}
          </h3>
          
          {/* ✅ Affichage de la cote */}
          {bookData.cote && (
            <div className="flex items-center gap-1 mt-1">
              <span className="text-xs font-mono bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded">
                🔖 {bookData.cote}
              </span>             
            </div>
          )}
        </div>
        
        {/* Auteur(s) */}
        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-1">
          {bookData.authors.join(', ')}
        </p>
        
        {/* Badges */}
        <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3">
          
          {/* Badge Catégorie */}
          <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-2 sm:px-3 py-1 rounded-full truncate max-w-[120px] sm:max-w-none">
            {bookData.category}
          </span>
          
          {/* ✅ Badge Disponibilité amélioré */}
          <span className={`text-xs px-2 sm:px-3 py-1 rounded-full whitespace-nowrap ${
            bookData.isAvailable
              ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
              : "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300"
          }`}>
            {bookData.isAvailable
              ? `${bookData.availabilityRatio} dispo`
              : "Indispo"}
          </span>

          {/* Badge Favori */}
          {isFavorite && userRole === "student" && (
            <span className="hidden sm:flex text-xs bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 px-2 sm:px-3 py-1 rounded-full items-center gap-1">
              <FaHeart className="text-xs" /> Favori
            </span>
          )}
        </div>

        {/* ✅ Barre de progression de disponibilité (optionnel) */}
        {bookData.totalCopies > 1 && (
          <div className="mb-3">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Disponibilité</span>
              <span>{bookData.borrowRate}% empruntés</span>
            </div>
            <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-green-500 rounded-full"
                style={{ width: `${100 - bookData.borrowRate}%` }}
              />
            </div>
          </div>
        )}
        
        {/* Boutons d'action */}
        <div className="flex gap-2 sm:gap-3 mt-auto">
          
          {/* Bouton Détails */}
          <button
            onClick={() => onViewDetails(bookData._id)}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 sm:py-2.5 md:py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm"
          >
            <span className="text-sm sm:text-base">👁️</span>
            <span className="hidden xs:inline">Détails</span>
            <span className="xs:hidden">Voir</span>
          </button>
          
          {/* Bouton Demander un Prêt */}
          {bookData.isAvailable && userRole === "student" && (
            <button
              onClick={handleLoanRequest}
              disabled={isRequestingLoan}
              className={`flex-1 text-white py-2 sm:py-2.5 md:py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm ${
                isRequestingLoan
                  ? 'bg-green-700 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {isRequestingLoan ? (
                <>
                  <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span className="hidden xs:inline">Envoi...</span>
                  <span className="xs:hidden">...</span>
                </>
              ) : (
                <>
                  <FaHandshake className="text-xs sm:text-sm" />
                  <span className="hidden xs:inline">Emprunter</span>
                  <span className="xs:hidden">Prêt</span>
                </>
              )}
            </button>
          )}
          
          {/* Message si non disponible */}
          {!bookData.isAvailable && userRole === "student" && (
            <button
              disabled
              className="flex-1 bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 py-2 sm:py-2.5 md:py-3 rounded-lg font-medium cursor-not-allowed flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm"
            >
              <span className="text-sm sm:text-base">⛔</span>
              <span className="hidden xs:inline">Indisponible</span>
              <span className="xs:hidden">Non</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookCard;
