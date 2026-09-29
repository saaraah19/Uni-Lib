import { useState } from "react";
import BookCatalog from './BookCatalog/BookCatalog';
import MyLoans from "./MyLoans/MyLoans";
import ProfilePage from "../../components/Profile/ProfilePage";
import FavoritesPage from "../FavoritesPage"
const StudentDashboard = () => {
  const [currentPage, setCurrentPage] = useState("dashboard");

  let contenuAAfficher;

  if (currentPage === 'dashboard') {
    contenuAAfficher = (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 sm:p-6 md:p-8 transition-colors duration-300">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 dark:text-gray-100 mb-2">
            🎯 Dashboard Étudiant
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-8 sm:mb-10">
            Gérez vos prêts, explorez le catalogue et personnalisez votre profil
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {/* CARTE 1 : Book Catalog */}
            <div 
              onClick={() => setCurrentPage('BookCatalog')}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 sm:p-6 md:p-8 cursor-pointer transform hover:-translate-y-1 sm:hover:-translate-y-2 transition-all duration-300 border-l-4 sm:border-l-8 border-blue-500 hover:shadow-2xl group"
            >
              <div className="w-16 h-16 sm:w-18 sm:h-18 md:w-20 md:h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4 sm:mb-6 mx-auto group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl sm:text-3xl">📚</span>
              </div>
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2 sm:mb-3 text-center">Catalogue des Livres</h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 text-center mb-4 sm:mb-6">
                Explorez notre collection complète, demandez des prêts et ajoutez à vos favoris
              </p>
              <div className="text-center">
                <span className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base rounded-lg font-semibold transition-colors group-hover:shadow-lg">
                  Explorer le catalogue →
                </span>
              </div>
            </div>
            
            {/* CARTE 2 : My Loans */}
            <div 
              onClick={() => setCurrentPage('MyLoans')}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 sm:p-6 md:p-8 cursor-pointer transform hover:-translate-y-1 sm:hover:-translate-y-2 transition-all duration-300 border-l-4 sm:border-l-8 border-green-500 hover:shadow-2xl group"
            >
              <div className="w-16 h-16 sm:w-18 sm:h-18 md:w-20 md:h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4 sm:mb-6 mx-auto group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl sm:text-3xl">📋</span>
              </div>
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2 sm:mb-3 text-center">Mes Prêts</h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 text-center mb-4 sm:mb-6">
                Gérez vos prêts en cours, suivez les demandes et consultez votre historique
              </p>
              <div className="text-center">
                <span className="inline-block bg-green-600 hover:bg-green-700 text-white px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base rounded-lg font-semibold transition-colors group-hover:shadow-lg">
                  Voir mes prêts →
                </span>
              </div>          
            </div>

            {/* CARTE 3 : PROFILE */}
            <div 
              onClick={() => setCurrentPage('Profile')}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 sm:p-6 md:p-8 cursor-pointer transform hover:-translate-y-1 sm:hover:-translate-y-2 transition-all duration-300 border-l-4 sm:border-l-8 border-purple-500 hover:shadow-2xl group"
            >
              <div className="w-16 h-16 sm:w-18 sm:h-18 md:w-20 md:h-20 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mb-4 sm:mb-6 mx-auto group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl sm:text-3xl">👤</span>
              </div>
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2 sm:mb-3 text-center">Mon Profil</h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 text-center mb-4 sm:mb-6">
                Gérez vos informations personnelles, favoris et paramètres de compte
              </p>
              <div className="text-center">
                <span className="inline-block bg-purple-600 hover:bg-purple-700 text-white px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base rounded-lg font-semibold transition-colors group-hover:shadow-lg">
                  Voir mon profil →
                </span>
              </div>
            </div>

            {/* CARTE 4 : Quick Stats */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 sm:p-6 md:p-8 border border-gray-100 dark:border-gray-700">
              <div className="w-16 h-16 sm:w-18 sm:h-18 md:w-20 md:h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4 sm:mb-6 mx-auto">
                <span className="text-2xl sm:text-3xl">📊</span>
              </div>
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2 sm:mb-3 text-center">Info Rapide</h3>
              <div className="space-y-2 sm:space-y-4 text-center">
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-semibold text-blue-600 dark:text-blue-400">5</span> prêts maximum simultanés
                </p>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  Durée standard : <span className="font-semibold">30 jours</span>
                </p>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  Prolongation possible : <span className="font-semibold">1 fois</span>
                </p>
              </div>
            </div>

            {/* CARTE 5 : Favorites */}
            <div 
              onClick={() => setCurrentPage('Favorites')}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 sm:p-6 md:p-8 cursor-pointer transform hover:-translate-y-1 sm:hover:-translate-y-2 transition-all duration-300 border-l-4 sm:border-l-8 border-red-500 hover:shadow-2xl group"
            >
              <div className="w-16 h-16 sm:w-18 sm:h-18 md:w-20 md:h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4 sm:mb-6 mx-auto group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl sm:text-3xl">❤️</span>
              </div>
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2 sm:mb-3 text-center">Mes Favoris</h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 text-center mb-4 sm:mb-6">
                Accédez rapidement à vos livres préférés et listes de souhaits
              </p>
              <div className="text-center">
                <span className="inline-block bg-red-600 hover:bg-red-700 text-white px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base rounded-lg font-semibold transition-colors group-hover:shadow-lg">
                  Voir mes favoris →
                </span>
              </div>
            </div>

            {/* CARTE 6 : Help & Support */}
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-2xl shadow-xl p-4 sm:p-6 md:p-8">
              <div className="w-16 h-16 sm:w-18 sm:h-18 md:w-20 md:h-20 bg-white/20 rounded-full flex items-center justify-center mb-4 sm:mb-6 mx-auto">
                <span className="text-2xl sm:text-3xl">❓</span>
              </div>
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-2 sm:mb-3 text-center">Aide & Support</h3>
              <p className="text-white/90 text-xs sm:text-sm text-center mb-4 sm:mb-6">
                Besoin d'aide avec vos prêts ou le catalogue ?
              </p>
              <div className="text-center space-y-2 sm:space-y-3">
                <button className="w-full py-2 text-xs sm:text-sm bg-white/20 hover:bg-white/30 rounded-lg font-medium transition-colors">
                  📞 Contacter le support
                </button>
                <button className="w-full py-2 text-xs sm:text-sm bg-white/20 hover:bg-white/30 rounded-lg font-medium transition-colors">
                  📖 Guide d'utilisation
                </button>
              </div>
            </div>
          </div>

          {/* Quick Actions Bar */}
          <div className="mt-8 sm:mt-10 md:mt-12 p-4 sm:p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Actions Rapides</h3>
            <div className="flex flex-wrap gap-2 sm:gap-3 md:gap-4">
              <button 
                onClick={() => setCurrentPage('BookCatalog')}
                className="px-3 py-2 text-xs sm:text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors flex items-center gap-1 sm:gap-2"
              >
                <span>🔍</span> Rechercher un livre
              </button>
              <button 
                onClick={() => setCurrentPage('MyLoans')}
                className="px-3 py-2 text-xs sm:text-sm bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-200 dark:hover:bg-green-800 transition-colors flex items-center gap-1 sm:gap-2"
              >
                <span>📋</span> Voir mes prêts
              </button>
              <button 
                onClick={() => setCurrentPage('Profile')}
                className="px-3 py-2 text-xs sm:text-sm bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-800 transition-colors flex items-center gap-1 sm:gap-2"
              >
                <span>⚙️</span> Paramètres
              </button>
              <button
              onClick={()=> setCurrentPage('Favorites')}
               className="px-3 py-2 text-xs sm:text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center gap-1 sm:gap-2">
                <span>📬</span> Notifications
              </button>
            </div>
          </div>
        </div>
      </div>
    ); 
  } 
  else if (currentPage === 'BookCatalog') {
    contenuAAfficher = <BookCatalog />;
  } 
  else if (currentPage === 'MyLoans') {
    contenuAAfficher = <MyLoans />;
  } 
  else if (currentPage === 'Profile') {
    contenuAAfficher = <ProfilePage />;
  }
  else if (currentPage === 'Favorites') {
    contenuAAfficher = <FavoritesPage />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {currentPage !== 'dashboard' && (
        <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10 transition-colors duration-300">
          <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4">
            <div className="flex items-center justify-between gap-2 sm:gap-4">
              <button 
                onClick={() => setCurrentPage('dashboard')}
                className="flex items-center text-xs sm:text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-semibold group transition-colors"
              >
                <span className="mr-2 group-hover:-translate-x-1 transition-transform text-xl">←</span>
                Retour au Tableau de bord
              </button>
              
              <div className="flex items-center gap-2 sm:gap-4">
                <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 hidden md:block">
                  {currentPage === 'BookCatalog' && '📚 Catalogue'}
                  {currentPage === 'MyLoans' && '📋 Mes Prêts'}
                  {currentPage === 'Profile' && '👤 Mon Profil'}
                  {currentPage === 'Favorites' && '❤️ Mes Favoris'}
                </span>
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                  <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">E</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className={currentPage === 'dashboard' ? '' : 'py-6 sm:py-8'}>
        {contenuAAfficher}
      </div>
      
      <footer className="mt-8 sm:mt-12 py-4 sm:py-6 text-center text-gray-500 dark:text-gray-400 text-xs sm:text-sm border-t border-gray-100 dark:border-gray-800">
        <div className="max-w-6xl mx-auto px-4">
          <p>Bibliothèque Universitaire • Dashboard Étudiant • {new Date().getFullYear()}</p>
          <div className="mt-2 flex justify-center gap-4 sm:gap-6 text-xs">
            <a href="/terms" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              Conditions d'utilisation
            </a>
            <a href="/privacy" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              Politique de confidentialité
            </a>
            <a href="/contact" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default StudentDashboard;