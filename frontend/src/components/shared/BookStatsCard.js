import React from 'react';
import {
  FaBuilding,
  FaCalendar,
  FaBookOpen,
  FaLanguage,
  FaHashtag,
  FaTag,
  FaCopy
} from 'react-icons/fa';

/**
 * BookStatsCard Component - UPDATED with cote, ISBN, and enriched status
 */
const BookStatsCard = ({ book = {} }) => {
  
  // ✅ Normalisation des données avec nouveaux champs
  const bookData = {
    publisher: book.publisher || 'Non spécifié',
    publicationYear: book.publicationYear || 'N/A',
    pages: book.pages || 'N/A',
    language: book.language || 'Français',
    isbn: book.isbn || 'Non spécifié',
    cote: book.cote,
    cote_info: book.cote_info,
    enriched: book.enriched || false,
    totalCopies: book.totalCopies || book.availableCopies || 1,
    availableCopies: book.availableCopies || 0,
  };

  // Stats de base (existantes)
  const baseStats = [
    { icon: FaBuilding, label: 'Éditeur', value: bookData.publisher },
    { icon: FaCalendar, label: 'Année', value: bookData.publicationYear },
    { icon: FaBookOpen, label: 'Pages', value: bookData.pages },
    { icon: FaLanguage, label: 'Langue', value: bookData.language },
  ];

  // ✅ Nouvelles stats
  const newStats = [
    { icon: FaHashtag, label: 'ISBN', value: bookData.isbn, highlight: true },
    { icon: FaTag, label: 'Cote', value: bookData.cote || 'Non assignée', font: 'font-mono' },
    { icon: FaCopy, label: 'Exemplaires', value: `${bookData.availableCopies}/${bookData.totalCopies}` },
  ];

  return (
    <div className="pt-3 sm:pt-4 border-t border-gray-200 dark:border-gray-700">
      
      {/* En-tête avec statut enrichi */}
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h3 className="text-base sm:text-lg font-semibold text-gray-700 dark:text-gray-300">
          📊 Informations supplémentaires
        </h3>
        
      </div>
      
      {/* ✅ Stats de base - Grille responsive */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 md:gap-4 mb-4">
        {baseStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="flex flex-col items-center text-center p-2 sm:p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <Icon className="text-gray-500 dark:text-gray-400 mb-1 sm:mb-2 text-sm sm:text-base" />
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate w-full">
                {stat.label}
              </p>
              <p className="font-medium text-gray-800 dark:text-gray-200 text-sm sm:text-base truncate w-full">
                {stat.value}
              </p>
            </div>
          );
        })}
      </div>

      {/* ✅ Nouvelles stats - Grille séparée pour mettre en valeur */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {newStats.map((stat, index) => {
          const Icon = stat.icon;
          const textClass = stat.font || '';
          
          return (
            <div
              key={index}
              className={`flex items-center gap-3 p-3 rounded-lg ${
                stat.highlight 
                  ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                  : 'bg-gray-50 dark:bg-gray-700/50'
              }`}
            >
              <Icon className={`text-lg ${
                stat.highlight 
                  ? 'text-blue-600 dark:text-blue-400' 
                  : 'text-gray-500 dark:text-gray-400'
              }`} />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {stat.label}
                </p>
                <p className={`font-medium text-gray-800 dark:text-gray-200 truncate ${textClass}`}>
                  {stat.value}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* ✅ Affichage des informations détaillées de la cote si disponibles */}
      {bookData.cote_info?.section && (
        <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <h4 className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2 flex items-center gap-1">
            <FaTag className="text-xs" /> Détail de la cote
          </h4>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-xs text-gray-500">Section</p>
              <p className="font-mono font-medium">{bookData.cote_info.section}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Code cat.</p>
              <p className="font-mono font-medium">{bookData.cote_info.category_code}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">N° ID</p>
              <p className="font-mono font-medium">{bookData.cote_info.id_number}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookStatsCard;