// ============================================================================
// IMPORT DES DÉPENDANCES
// ============================================================================
import { useState, useEffect } from "react";
import { useLocation } from 'react-router-dom';
import { FaArrowLeft} from 'react-icons/fa';
import BooksCrud from "./BooksCrud";
import StaffLoanDashboard from './LoanManagement/StaffLoanDashboard';
import Reports from './Reports/Reports';
import api from "../../services/api";
// P2 FIX: unguarded console.log/console.error calls replaced with the
// shared logger utility (frontend/src/utils/logger.js). This file's
// existing "../../services/api" import confirms it sits 2 levels under
// src, so the logger path below is "../../utils/logger" to match.
import { logger } from "../../utils/logger";
// ============================================================================
// COMPOSANT PRINCIPAL : StaffDashboard
// ============================================================================
const StaffDashboard = () => {
  // ==========================================================================
  // 1. ÉTATS
  // ==========================================================================
  
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [stats, setStats] = useState({
    users: 0,
    books: 0,
    loans: 0
  });
  const [loadingStats, setLoadingStats] = useState(true);
  const [error, setError] = useState(null);
  
  const location = useLocation();

  // ==========================================================================
  // 2. CHARGEMENT DES STATISTIQUES
  // ==========================================================================
  
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoadingStats(true);
        setError(null);
        
        logger.debug("📡 Chargement des stats dashboard...");
        
        // Appel à la route /api/stats/summary
        const response = await api.get("/stats/summary");
        
        logger.debug("✅ Stats reçues:", response.data);
        
        if (response.data.success) {
          setStats(response.data.data);
        }
        
      } catch (err) {
        logger.error("❌ Erreur chargement stats:", err);
        setError("Impossible de charger les statistiques");
      } finally {
        setLoadingStats(false);
      }
    };
    
    fetchStats();
  }, []);

  // ==========================================================================
  // 3. GESTION DES PARAMÈTRES D'URL
  // ==========================================================================
  
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const view = params.get('view');
    
    if (view) {
      logger.debug('🟠 Vue demandée:', view);
      if (view === 'LoanRequests') {
        setCurrentPage('LoanRequests');
      } else if (view === 'BooksCrud' || view === 'Rapports') {
        setCurrentPage(view);
      }
    }
  }, [location.search]);

  // ==========================================================================
  // 4. RENDU CONDITIONNEL
  // ==========================================================================
  
  let contenuAAfficher;

  if (currentPage === 'dashboard') {
    contenuAAfficher = (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-3 sm:p-4 md:p-5 lg:p-8 transition-colors duration-300">
        <div className="max-w-6xl mx-auto">
          
          {/* ================================================== */}
          {/* EN-TÊTE */}
          {/* ================================================== */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 md:mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 dark:text-gray-100 mb-1 sm:mb-2 flex items-center gap-2">
                <span className="text-3xl sm:text-4xl">🎯</span>
                <span>Dashboard Staff</span>
              </h1>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                Gestion complète de la bibliothèque universitaire
              </p>
            </div>
            
            {/* Bouton menu mobile */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="sm:hidden mt-3 flex items-center justify-center gap-2 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-md"
            >
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Menu Rapide</span>
              <span className={`transform transition-transform ${isMobileMenuOpen ? 'rotate-180' : ''}`}>▼</span>
            </button>
          </div>
          
          {/* ================================================== */}
          {/* CARTES DE NAVIGATION */}
          {/* ================================================== */}
          <div className={`
            grid grid-cols-1 gap-4 sm:gap-6 md:gap-8
            ${isMobileMenuOpen ? 'block' : 'hidden sm:grid'}
            sm:grid-cols-2 lg:grid-cols-3
          `}>
            
            {/* Carte Gestion des Livres */}
            <div 
              onClick={() => setCurrentPage('BooksCrud')}
              className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-md sm:shadow-xl p-4 sm:p-5 md:p-6 lg:p-8 cursor-pointer transform hover:-translate-y-1 sm:hover:-translate-y-2 transition-all duration-300 ease-in-out border-l-8 border-blue-500 hover:shadow-xl"
            >
              <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-18 md:h-18 lg:w-20 lg:h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-3 sm:mb-4 md:mb-5 lg:mb-6 mx-auto">
                <span className="text-2xl sm:text-3xl md:text-4xl">📚</span>
              </div>
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2 sm:mb-3 text-center">
                Gestion des Livres
              </h3>
              <p className="hidden xs:block text-xs sm:text-sm text-gray-600 dark:text-gray-300 text-center mb-3 sm:mb-4 md:mb-5 lg:mb-6">
                Ajouter, modifier, supprimer des livres. Gérer le catalogue complet.
              </p>
              <div className="text-center">
                <span className="inline-block text-xs sm:text-sm md:text-base bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3 rounded-lg font-semibold transition-colors">
                  Accéder →
                </span>
              </div>
            </div>
            
            {/* Carte Demandes de Prêt */}
            <div 
              onClick={() => setCurrentPage('LoanRequests')}
              className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-md sm:shadow-xl p-4 sm:p-5 md:p-6 lg:p-8 cursor-pointer transform hover:-translate-y-1 sm:hover:-translate-y-2 transition-all duration-300 ease-in-out border-l-8 border-green-500 hover:shadow-xl"
            >
              <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-18 md:h-18 lg:w-20 lg:h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-3 sm:mb-4 md:mb-5 lg:mb-6 mx-auto">
                <span className="text-2xl sm:text-3xl md:text-4xl">🔄</span>
              </div>
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2 sm:mb-3 text-center">
                Demandes de Prêt
              </h3>
              <p className="hidden xs:block text-xs sm:text-sm text-gray-600 dark:text-gray-300 text-center mb-3 sm:mb-4 md:mb-5 lg:mb-6">
                Approuver, rejeter, suivre les emprunts. Gestion des retours.
              </p>
              <div className="text-center">
                <span className="inline-block text-xs sm:text-sm md:text-base bg-green-600 hover:bg-green-700 text-white px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3 rounded-lg font-semibold transition-colors">
                  Accéder →
                </span>
              </div>
            </div>
            
            {/* Carte Rapports */}
            <div 
              onClick={() => setCurrentPage('Rapports')}
              className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-md sm:shadow-xl p-4 sm:p-5 md:p-6 lg:p-8 cursor-pointer transform hover:-translate-y-1 sm:hover:-translate-y-2 transition-all duration-300 ease-in-out border-l-8 border-purple-500 hover:shadow-xl"
            >
              <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-18 md:h-18 lg:w-20 lg:h-20 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mb-3 sm:mb-4 md:mb-5 lg:mb-6 mx-auto">
                <span className="text-2xl sm:text-3xl md:text-4xl">📊</span>
              </div>
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2 sm:mb-3 text-center">
                Rapports & Statistiques
              </h3>
              <p className="hidden xs:block text-xs sm:text-sm text-gray-600 dark:text-gray-300 text-center mb-3 sm:mb-4 md:mb-5 lg:mb-6">
                Statistiques d'usage, rapports mensuels, analyses complètes.
              </p>
              <div className="text-center">
                <span className="inline-block text-xs sm:text-sm md:text-base bg-purple-600 hover:bg-purple-700 text-white px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3 rounded-lg font-semibold transition-colors">
                  Accéder →
                </span>
              </div>
            </div>
          </div>
          
          {/* ================================================== */}
          {/* STATISTIQUES EN TEMPS RÉEL */}
          {/* ================================================== */}
          <div className="mt-8 sm:mt-12 md:mt-16">
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4 sm:mb-6">
              📈 Vue d'ensemble en temps réel
            </h3>
            
            {error ? (
              <div className="bg-red-100 dark:bg-red-900/30 p-4 rounded-lg text-red-700 dark:text-red-300">
                {error}
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
                
                {/* Carte Livres */}
                <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-5 lg:p-6 shadow-md transition-colors duration-300 relative overflow-hidden">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-1 truncate">
                        Livres totaux
                      </p>
                      <p className="text-xl sm:text-2xl md:text-3xl font-bold text-blue-600 dark:text-blue-400">
                        {loadingStats ? (
                          <span className="inline-block w-12 h-6 bg-gray-200 dark:bg-gray-700 animate-pulse rounded"></span>
                        ) : (
                          stats.books.toLocaleString()
                        )}
                      </p>
                    </div>
                    <span className="text-2xl sm:text-3xl opacity-20">📚</span>
                  </div>
                </div>

                {/* Carte Utilisateurs */}
                <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-5 lg:p-6 shadow-md transition-colors duration-300 relative overflow-hidden">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-1 truncate">
                        Utilisateurs
                      </p>
                      <p className="text-xl sm:text-2xl md:text-3xl font-bold text-purple-600 dark:text-purple-400">
                        {loadingStats ? (
                          <span className="inline-block w-12 h-6 bg-gray-200 dark:bg-gray-700 animate-pulse rounded"></span>
                        ) : (
                          stats.users.toLocaleString()
                        )}
                      </p>
                    </div>
                    <span className="text-2xl sm:text-3xl opacity-20">👥</span>
                  </div>
                </div>

                {/* Carte Prêts actifs */}
                <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-5 lg:p-6 shadow-md transition-colors duration-300 relative overflow-hidden">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-1 truncate">
                        Prêts actifs
                      </p>
                      <p className="text-xl sm:text-2xl md:text-3xl font-bold text-green-600 dark:text-green-400">
                        {loadingStats ? (
                          <span className="inline-block w-12 h-6 bg-gray-200 dark:bg-gray-700 animate-pulse rounded"></span>
                        ) : (
                          stats.loans.toLocaleString()
                        )}
                      </p>
                    </div>
                    <span className="text-2xl sm:text-3xl opacity-20">🔄</span>
                  </div>
                </div>

                {/* Carte En attente */}
                <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-5 lg:p-6 shadow-md transition-colors duration-300 relative overflow-hidden">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-1 truncate">
                        En attente
                      </p>
                      <p className="text-xl sm:text-2xl md:text-3xl font-bold text-orange-600 dark:text-orange-400">
                        {loadingStats ? (
                          <span className="inline-block w-12 h-6 bg-gray-200 dark:bg-gray-700 animate-pulse rounded"></span>
                        ) : (
                          "0" // À remplacer par vraie donnée plus tard
                        )}
                      </p>
                    </div>
                    <span className="text-2xl sm:text-3xl opacity-20">⏳</span>
                  </div>
                </div>
              </div>
            )}

            {/* Horodatage */}
            {!loadingStats && !error && (
              <p className="text-xs text-gray-400 mt-4 text-right">
                Dernière mise à jour: {new Date().toLocaleTimeString()}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  } 
  else if (currentPage === 'BooksCrud') {
    contenuAAfficher = <BooksCrud />;
  } 
  else if (currentPage === 'LoanRequests') {
    contenuAAfficher = <StaffLoanDashboard />;
  } 
  else if (currentPage === 'Rapports') {
    contenuAAfficher = <Reports />;
  }

  // ==========================================================================
  // 5. RENDU PRINCIPAL
  // ==========================================================================
  
  return (
    <div className="min-h-screen flex flex-col">
      
      {/* Barre de retour (visible seulement quand on est dans une sous-page) */}
      {currentPage !== 'dashboard' && (
        <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700 transition-colors duration-300">
          <div className="max-w-6xl mx-auto px-3 sm:px-4 md:px-5 lg:px-8 py-2 sm:py-3 md:py-4">
            <div className="flex items-center justify-between">
              <button 
                onClick={() => setCurrentPage('dashboard')}
                className="flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-semibold group text-sm sm:text-base"
              >
                <FaArrowLeft className="mr-1.5 sm:mr-2 text-xs sm:text-sm group-hover:-translate-x-1 transition-transform" />
                <span className="hidden xs:inline">Retour au Dashboard Staff</span>
                <span className="xs:hidden">Retour</span>
              </button>
              
              <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                {currentPage === 'BooksCrud' && '📚 Gestion des Livres'}
                {currentPage === 'LoanRequests' && '🔄 Gestion des Prêts'}
                {currentPage === 'Rapports' && '📊 Rapports & Statistiques'}
              </span>
            </div>
          </div>
        </div>
      )}
      
      {/* Contenu principal */}
      <main className="flex-1">
        {contenuAAfficher}
      </main>
      
      {/* Pied de page */}
      <footer className="mt-8 sm:mt-10 md:mt-12 py-4 sm:py-5 md:py-6 text-center text-gray-500 dark:text-gray-400 text-xs sm:text-sm transition-colors duration-300 border-t dark:border-gray-700">
        <div className="max-w-6xl mx-auto px-3 sm:px-4">
          <p>Dashboard Staff • Librairie Universitaire • {new Date().getFullYear()}</p>
        </div>
      </footer>
    </div>
  );
};

export default StaffDashboard;