import { useEffect, useState } from "react";
import { 
  FaSpinner, 
  FaBook, 
  FaCalendarAlt, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaClock,
  FaHistory,
  FaTag
} from "react-icons/fa";
import { toast } from "react-toastify";
import loanService from "../../../services/loanService";

// LoansHistory: shows the student's past loans with responsive design
const LoansHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, returned, rejected, cancelled
  const [expandedId, setExpandedId] = useState(null); // For mobile expand/collapse

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const data = await loanService.getMyLoanHistory();
        setHistory(data);
      } catch (err) {
        console.error("Get loan history error:", err);
        toast.error("Impossible de charger l'historique des prêts");
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  // Filter history based on status
  const filteredHistory = filter === "all" 
    ? history 
    : history.filter(item => item.status === filter);

  // Get status color and icon
  const getStatusConfig = (status) => {
    const config = {
      returned: {
        color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
        icon: <FaCheckCircle className="mr-1" />,
        label: "Retourné"
      },
      rejected: {
        color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
        icon: <FaTimesCircle className="mr-1" />,
        label: "Rejeté"
      },
      cancelled: {
        color: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300",
        icon: <FaTimesCircle className="mr-1" />,
        label: "Annulé"
      },
      approved: {
        color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
        icon: <FaCheckCircle className="mr-1" />,
        label: "Approuvé"
      },
      pending: {
        color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
        icon: <FaClock className="mr-1" />,
        label: "En attente"
      }
    };
    return config[status] || {
      color: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300",
      icon: null,
      label: status
    };
  };

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col items-center justify-center py-8 sm:py-12">
          <FaSpinner className="animate-spin text-3xl sm:text-4xl text-blue-500 mb-3" />
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            Chargement de l'historique...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-sm transition-colors duration-300 overflow-hidden">
      
      {/* Header with filter */}
      <div className="p-4 sm:p-5 md:p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
            <FaHistory className="text-blue-500" />
            Historique des prêts
          </h3>
          
          {/* Filter buttons - Responsive */}
          <div className="flex flex-wrap gap-2">
            {[
              { value: "all", label: "Tous", count: history.length },
              { value: "returned", label: "Retournés", count: history.filter(h => h.status === "returned").length },
              { value: "rejected", label: "Rejetés", count: history.filter(h => h.status === "rejected").length },
              { value: "cancelled", label: "Annulés", count: history.filter(h => h.status === "cancelled").length }
            ].map(f => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                  filter === f.value
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
              >
                <span className="hidden xs:inline">{f.label}</span>
                <span className="xs:hidden">{f.label.slice(0, 3)}</span>
                {f.count > 0 && (
                  <span className={`ml-1 px-1.5 py-0.5 text-xs rounded-full ${
                    filter === f.value
                      ? "bg-white/20"
                      : "bg-gray-200 dark:bg-gray-600"
                  }`}>
                    {f.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
        
        {/* Summary */}
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-2">
          {filteredHistory.length} prêt{filteredHistory.length !== 1 ? 's' : ''} trouvé{filteredHistory.length !== 1 ? 's' : ''}
          {filter !== "all" && ` dans la catégorie ${filter}`}
        </p>
      </div>

      {/* Content */}
      {filteredHistory.length === 0 ? (
        <div className="text-center py-12 sm:py-16 px-4">
          <div className="text-5xl sm:text-6xl mb-4 text-gray-300 dark:text-gray-600">📭</div>
          <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">
            Aucun prêt trouvé dans l'historique
          </p>
          {filter !== "all" && (
            <button
              onClick={() => setFilter("all")}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
            >
              Voir tous les prêts
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Mobile Layout (< sm) - Cards */}
          <div className="sm:hidden divide-y divide-gray-200 dark:divide-gray-700">
            {filteredHistory.map(item => {
              const statusConfig = getStatusConfig(item.status);
              const isExpanded = expandedId === item._id;
              
              return (
                <div key={item._id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                  {/* Compact Header */}
                  <div className="flex items-start gap-3">
                    {/* Book Icon */}
                    <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FaBook className="text-gray-500 dark:text-gray-400 text-lg" />
                    </div>
                    
                    {/* Basic Info */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-800 dark:text-gray-100 text-sm truncate">
                        {item.book?.title || 'Titre inconnu'}
                      </h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                        {item.book?.authors?.join(', ') || 'Auteur inconnu'}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full flex items-center ${statusConfig.color}`}>
                          {statusConfig.icon}
                          {statusConfig.label}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatDate(item.requestDate)}
                        </span>
                      </div>
                    </div>
                    
                    {/* Expand/Collapse Button */}
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : item._id)}
                      className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                    >
                      <svg 
                        className={`w-4 h-4 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>
                  
                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="mt-3 pl-13 ml-13 space-y-2">
                      {/* ISBN */}
                      {item.book?.isbn && (
                        <div className="text-xs text-gray-500 flex items-center gap-1">
                          <FaTag className="text-gray-400" />
                          ISBN: {item.book.isbn}
                        </div>
                      )}
                      
                      {/* Dates Grid */}
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        <CompactDateBox 
                          icon={<FaCalendarAlt className="text-blue-500" />}
                          label="Demandé"
                          date={formatDate(item.requestDate)}
                        />
                        {item.approvedDate && (
                          <CompactDateBox 
                            icon={<FaCheckCircle className="text-green-500" />}
                            label="Approuvé"
                            date={formatDate(item.approvedDate)}
                          />
                        )}
                        {item.dueDate && (
                          <CompactDateBox 
                            icon={<FaCalendarAlt className="text-purple-500" />}
                            label="Retour"
                            date={formatDate(item.dueDate)}
                          />
                        )}
                      </div>
                      
                      {/* Rejection Reason */}
                      {item.rejectionReason && (
                        <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-lg text-xs text-red-700 dark:text-red-300">
                          <FaTimesCircle className="inline mr-1" />
                          {item.rejectionReason}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Desktop Layout (sm+) - Table */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 sm:px-5 md:px-6 py-3 sm:py-4 text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-300">
                    Livre
                  </th>
                  <th className="px-4 sm:px-5 md:px-6 py-3 sm:py-4 text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-300">
                    Auteur
                  </th>
                  <th className="px-4 sm:px-5 md:px-6 py-3 sm:py-4 text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-300">
                    Demandé le
                  </th>
                  <th className="px-4 sm:px-5 md:px-6 py-3 sm:py-4 text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-300">
                    Approuvé le
                  </th>
                  <th className="px-4 sm:px-5 md:px-6 py-3 sm:py-4 text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-300">
                    Retour le
                  </th>
                  <th className="px-4 sm:px-5 md:px-6 py-3 sm:py-4 text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-300">
                    Statut
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredHistory.map(item => {
                  const statusConfig = getStatusConfig(item.status);
                  
                  return (
                    <tr key={item._id} className="hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                      <td className="px-4 sm:px-5 md:px-6 py-3 sm:py-4">
                        <div className="flex items-center gap-2">
                          <FaBook className="text-gray-400 flex-shrink-0" />
                          <span className="text-sm sm:text-base text-gray-800 dark:text-gray-200 font-medium">
                            {item.book?.title || '—'}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 sm:px-5 md:px-6 py-3 sm:py-4 text-sm text-gray-600 dark:text-gray-400">
                        {item.book?.authors?.join(', ') || '—'}
                      </td>
                      <td className="px-4 sm:px-5 md:px-6 py-3 sm:py-4 text-sm text-gray-600 dark:text-gray-400">
                        {formatDate(item.requestDate)}
                      </td>
                      <td className="px-4 sm:px-5 md:px-6 py-3 sm:py-4 text-sm text-gray-600 dark:text-gray-400">
                        {formatDate(item.approvedDate)}
                      </td>
                      <td className="px-4 sm:px-5 md:px-6 py-3 sm:py-4 text-sm text-gray-600 dark:text-gray-400">
                        {formatDate(item.dueDate)}
                      </td>
                      <td className="px-4 sm:px-5 md:px-6 py-3 sm:py-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}>
                          {statusConfig.icon}
                          {statusConfig.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Footer Stats */}
      {filteredHistory.length > 0 && (
        <div className="px-4 sm:px-5 md:px-6 py-3 sm:py-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            <span>
              Total: <span className="font-semibold">{filteredHistory.length}</span> prêt{filteredHistory.length !== 1 ? 's' : ''}
            </span>
            <span className="flex items-center gap-2">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Retournés: {history.filter(h => h.status === "returned").length}
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                Rejetés: {history.filter(h => h.status === "rejected").length}
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-gray-500 rounded-full"></span>
                Annulés: {history.filter(h => h.status === "cancelled").length}
              </span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper component for mobile date display
const CompactDateBox = ({ icon, label, date }) => (
  <div className="flex items-center gap-1.5 p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
    <span className="text-gray-500">{icon}</span>
    <div>
      <p className="text-2xs text-gray-500">{label}</p>
      <p className="text-xs font-medium text-gray-800 dark:text-gray-200">{date}</p>
    </div>
  </div>
);

export default LoansHistory;