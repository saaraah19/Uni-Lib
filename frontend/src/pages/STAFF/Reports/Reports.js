// ============================================================================
// COMPOSANT : Reports - Version Complète et Corrigée
// ============================================================================

import { useState, useEffect } from "react";
import api from "../../../services/api"; 
// P2 FIX: unguarded console.log/console.error calls replaced with the
// shared logger utility (frontend/src/utils/logger.js). This file's
// existing "../../../services/api" import confirms it sits 3 levels under
// src, so the logger path below is "../../../utils/logger" to match.
import { logger } from "../../../utils/logger";

const Reports = () => {
  // ==========================================================================
  // ÉTATS
  // ==========================================================================
  
  const [stats, setStats] = useState({
    users: 0,
    books: 0,
    loans: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ==========================================================================
  // CHARGEMENT DES STATISTIQUES
  // ==========================================================================
  
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // ✅ Appel à la bonne route : /api/stats/summary
        logger.debug("📡 Chargement des stats depuis /api/stats/summary...");
        const response = await api.get("/stats/summary");
        
        logger.debug("✅ Réponse reçue:", response.data);
        
        if (response.data.success) {
          setStats(response.data.data);
        } else {
          throw new Error("Erreur dans la réponse");
        }
      } catch (err) {
        logger.error("❌ Erreur détaillée:", {
          message: err.message,
          url: err.config?.url,
          baseURL: err.config?.baseURL,
          status: err.response?.status
        });
        
        setError(`Impossible de charger les statistiques: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // ==========================================================================
  // AFFICHAGE DES ÉTATS DE CHARGEMENT/ERREUR
  // ==========================================================================
  
  if (loading) {
    return (
      <div className="p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Chargement des statistiques...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
        <div className="max-w-6xl mx-auto">
          <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 p-6 rounded-xl">
            <h3 className="text-lg font-semibold mb-2">❌ Erreur</h3>
            <p>{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Réessayer
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================================================
  // RENDU PRINCIPAL
  // ==========================================================================
  
  return (
    <div className="p-8 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-300">
      <div className="max-w-6xl mx-auto">
        
        {/* En-tête */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <span className="text-4xl">📊</span>
            Rapports & Statistiques
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Aperçu en temps réel de la bibliothèque
          </p>
        </div>

        {/* Grille des compteurs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Carte Utilisateurs */}
          <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border-b-4 border-purple-500 transform hover:scale-105 transition-transform">
            <div className="flex items-center justify-between mb-4">
              <span className="text-4xl">👥</span>
              <span className="text-xs text-gray-400">Total</span>
            </div>
            <p className="text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider text-sm">
              Utilisateurs actifs
            </p>
            <p className="text-5xl font-black text-purple-600 dark:text-purple-400 mt-2">
              {stats.users.toLocaleString()}
            </p>
            <p className="text-xs text-gray-400 mt-2">
              Dernière mise à jour: {new Date().toLocaleTimeString()}
            </p>
          </div>

          {/* Carte Livres */}
          <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border-b-4 border-blue-500 transform hover:scale-105 transition-transform">
            <div className="flex items-center justify-between mb-4">
              <span className="text-4xl">📚</span>
              <span className="text-xs text-gray-400">Catalogue</span>
            </div>
            <p className="text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider text-sm">
              Livres au catalogue
            </p>
            <p className="text-5xl font-black text-blue-600 dark:text-blue-400 mt-2">
              {stats.books.toLocaleString()}
            </p>
            <p className="text-xs text-gray-400 mt-2">
              {Math.round((stats.books / 5000) * 100)}% de la capacité
            </p>
          </div>

          {/* Carte Prêts */}
          <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border-b-4 border-green-500 transform hover:scale-105 transition-transform">
            <div className="flex items-center justify-between mb-4">
              <span className="text-4xl">🔄</span>
              <span className="text-xs text-gray-400">Actifs</span>
            </div>
            <p className="text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider text-sm">
              Prêts approuvés
            </p>
            <p className="text-5xl font-black text-green-600 dark:text-green-400 mt-2">
              {stats.loans.toLocaleString()}
            </p>
            <p className="text-xs text-gray-400 mt-2">
              Taux d'occupation: {stats.books ? Math.round((stats.loans / stats.books) * 100) : 0}%
            </p>
          </div>
        </div>

        {/* Section des graphiques à venir */}
        <div className="mt-12">
          <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
            📈 Évolution dans le temps
          </h3>
          <div className="p-12 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl flex items-center justify-center bg-white dark:bg-gray-800/50">
            <p className="text-gray-400 italic text-center">
              📊 Graphiques de tendance à venir <br/> 
              (Prêts par mois, catégories populaires, utilisateurs actifs...)
            </p>
          </div>
        </div>

        {/* Pied de page avec timestamp */}
        <div className="mt-8 text-center text-xs text-gray-400">
          Données actualisées en temps réel • API Stats v1.0
        </div>
      </div>
    </div>
  );
};

export default Reports;
