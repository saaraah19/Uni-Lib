// ============================================================================
// COMPOSANT : BookStats (Avec données API)
// ============================================================================

import { useState, useEffect } from "react";
import bookService from "../../services/bookService";

const BookStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await bookService.getStats();
        setStats(response.data);
      } catch (error) {
        console.error("Erreur chargement stats:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-4">
        <div className="inline-block animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!stats) return null;

  const statsCards = [
    {
      title: "Livres total",
      value: stats.totalBooks,
      color: "blue",
      icon: "📚",
      description: "Nombre total de livres",
    },
    {
      title: "Disponibles",
      value: stats.availableBooks,
      color: "green",
      icon: "✅",
      description: "Livres disponibles",
    },
    {
      title: "Enrichis",
      value: stats.enrichedBooks,
      color: "purple",
      icon: "✨",
      description: `Taux: ${stats.enrichmentRate}`,
    },
    {
      title: "Catégories",
      value: stats.categories?.length || 0,
      color: "orange",
      icon: "🏷️",
      description: "Catégories différentes",
    },
  ];

  return (
    <div className="mt-4 sm:mt-6 md:mt-8">
      <h3 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-gray-100 mb-3 sm:mb-4">
        📊 Statistiques de la bibliothèque
      </h3>
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {statsCards.map((stat, index) => (
          <div
            key={index}
            className={`bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-xl shadow border-l-4 ${
              stat.color === "blue" ? "border-l-blue-500" :
              stat.color === "green" ? "border-l-green-500" :
              stat.color === "purple" ? "border-l-purple-500" :
              "border-l-orange-500"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">{stat.icon}</span>
              <p className="text-xl font-bold text-gray-800 dark:text-gray-100">
                {stat.value}
              </p>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
              {stat.title}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {stat.description}
            </p>
          </div>
        ))}
      </div>

      {/* Top catégories */}
      {stats.categories && stats.categories.length > 0 && (
        <div className="mt-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <h4 className="font-semibold mb-3">Répartition par catégorie</h4>
          <div className="space-y-2">
            {stats.categories.slice(0, 5).map((cat) => (
              <div key={cat._id} className="flex items-center gap-2">
                <span className="text-sm flex-1">{cat._id || "Non catégorisé"}</span>
                <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${(cat.count / stats.totalBooks) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-gray-600">{cat.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BookStats;