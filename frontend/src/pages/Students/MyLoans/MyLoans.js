import { useState, useEffect } from "react";
import { 
  FaClock, FaCheckCircle, FaTimesCircle, 
  FaBook, FaCalendarAlt, FaSpinner, FaExclamationTriangle,
  FaEye, FaBan, FaHandshake, FaHistory, FaUser, FaTag,
  FaChevronDown, FaFilter
} from "react-icons/fa";
import { toast } from "react-toastify";
import loanService from "../../../services/loanService";
import BookDetail from '../../shared/BookDetail';
import { useUser } from '../../../hooks/useUser';
import ConfirmationModal from '../../../components/modals/ConfirmationModal';

const MyLoans = () => {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("current");
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    active: 0,
    returned: 0,
    rejected: 0,
    cancelled: 0
  });

  useEffect(() => {
    fetchMyLoans();
  }, []);

  // Listen for external loan creation events
  useEffect(() => {
    const handler = (e) => {
      fetchMyLoans();
    };
    window.addEventListener('loanCreated', handler);
    return () => window.removeEventListener('loanCreated', handler);
  }, []);

  const [selectedBook, setSelectedBook] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const { user } = useUser();

  // UX/CONSISTENCY FIX (P2): cancellation confirmation now goes through
  // ConfirmationModal instead of window.confirm().
  const [loanToCancel, setLoanToCancel] = useState(null); // loanId | null
  const [isCancelling, setIsCancelling] = useState(false);

  const fetchMyLoans = async () => {
    setLoading(true);
    try {
      const data = await loanService.getMyLoans();
      setLoans(data);
      
      const stats = {
        total: data.length,
        pending: data.filter(l => l.status === "pending" || l.status === "requested").length,
        active: data.filter(l => l.status === "approved" || l.status === "active").length,
        returned: data.filter(l => l.status === "returned").length,
        rejected: data.filter(l => l.status === "rejected").length,
        cancelled: data.filter(l => l.status === "cancelled").length
      };
      setStats(stats);
      
    } catch (error) {
      console.error("Erreur lors du chargement des prêts:", error);
      toast.error("❌ Impossible de charger vos prêts");
    } finally {
      setLoading(false);
    }
  };

  const handleRequestCancel = (loanId) => {
    setLoanToCancel(loanId);
  };

  const handleConfirmCancel = async () => {
    if (!loanToCancel) return;
    setIsCancelling(true);
    try {
      await loanService.cancelLoanRequest(loanToCancel);
      toast.success("✅ Demande annulée avec succès");
      setLoanToCancel(null);
      fetchMyLoans();
    } catch (error) {
      console.error("Erreur annulation:", error);
      toast.error(error.response?.data?.message || "❌ Erreur lors de l'annulation");
    } finally {
      setIsCancelling(false);
    }
  };

  const handleCancelDialogClose = () => {
    if (isCancelling) return;
    setLoanToCancel(null);
  };

  const handleViewDetails = (book) => {
    if (!book) return;
    setSelectedBook(book);
    setShowDetail(true);
  };

  const handleCloseDetail = () => {
    setSelectedBook(null);
    setShowDetail(false);
  };

  const getFilteredLoans = () => {
    switch(activeTab) {
      case "pending":
        return loans.filter(loan => loan.status === "pending" || loan.status === "requested");
      case "active":
        return loans.filter(loan => loan.status === "approved" || loan.status === "active");
      case "history":
        return loans.filter(loan => ["returned","cancelled","rejected"].includes(loan.status));
      case "returned":
        return loans.filter(loan => loan.status === "returned");
      case "rejected":
        return loans.filter(loan => loan.status === "rejected");
      case "cancelled":
        return loans.filter(loan => loan.status === "cancelled");
      default:
        return loans.filter(loan => ["pending","requested", "approved", "active"].includes(loan.status));
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatShortDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const calculateDaysRemaining = (dueDate) => {
    if (!dueDate) return null;
    const now = new Date();
    const due = new Date(dueDate);
    const diffTime = due - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getStatusConfig = (status, dueDate) => {
    const daysRemaining = dueDate ? calculateDaysRemaining(dueDate) : null;
    const isOverdue = daysRemaining !== null && daysRemaining < 0;
    
    const statusMap = {
      requested: { 
        color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
        icon: <FaClock className="mr-1 sm:mr-2" />,
        text: "En attente",
        shortText: "Attente",
        description: "En attente d'approbation"
      },
      approved: { 
        color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
        icon: <FaCheckCircle className="mr-1 sm:mr-2" />,
        text: "Approuvé",
        shortText: "OK",
        description: "Prêt à récupérer"
      },
      active: { 
        color: isOverdue 
          ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
          : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
        icon: isOverdue ? <FaExclamationTriangle className="mr-1 sm:mr-2" /> : <FaBook className="mr-1 sm:mr-2" />,
        text: isOverdue ? `En retard (${Math.abs(daysRemaining)}j)` : `Actif (${daysRemaining}j)`,
        shortText: isOverdue ? `Retard ${Math.abs(daysRemaining)}j` : `${daysRemaining}j`,
        description: isOverdue ? "Retour en retard" : "Prêt en cours"
      },
      returned: { 
        color: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300",
        icon: <FaHistory className="mr-1 sm:mr-2" />,
        text: "Retourné",
        shortText: "Retour",
        description: "Livre rendu"
      },
      rejected: { 
        color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
        icon: <FaTimesCircle className="mr-1 sm:mr-2" />,
        text: "Rejeté",
        shortText: "Rejet",
        description: "Demande refusée"
      },
      cancelled: { 
        color: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300",
        icon: <FaTimesCircle className="mr-1 sm:mr-2" />,
        text: "Annulé",
        shortText: "Annulé",
        description: "Demande annulée"
      }
    };

    return statusMap[status] || { 
      color: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300",
      icon: null,
      text: status,
      shortText: status,
      description: status
    };
  };

  const filteredLoans = getFilteredLoans();

  // Tab configuration
  const tabs = [
    { id: "current", label: "Prêts actuels", shortLabel: "Actuels", count: stats.pending + stats.active, icon: <FaHandshake /> },
    { id: "pending", label: "En attente", shortLabel: "Attente", count: stats.pending, icon: <FaClock /> },
    { id: "active", label: "Actifs", shortLabel: "Actifs", count: stats.active, icon: <FaCheckCircle /> },
    { id: "history", label: "Historique", shortLabel: "Hist.", count: stats.returned + stats.cancelled + stats.rejected, icon: <FaHistory /> },
    { id: "rejected", label: "Rejetés", shortLabel: "Rejet", count: stats.rejected, icon: <FaTimesCircle /> },
    { id: "cancelled", label: "Annulés", shortLabel: "Annulé", count: loans.filter(l => l.status === "cancelled").length, icon: <FaBan /> }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-3 sm:p-4 md:p-5 lg:p-6 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        
        {/* Header - Responsive */}
        <div className="mb-4 sm:mb-6 md:mb-8 lg:mb-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 dark:text-gray-100 mb-1 sm:mb-2 flex items-center gap-2">
                <span className="text-3xl sm:text-4xl">📋</span>
                <span>Gestion de Mes Prêts</span>
              </h1>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                Suivez l'état de vos demandes de prêt
              </p>
            </div>
            
            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="sm:hidden flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-xl shadow-md"
            >
              <span className="flex items-center gap-2">
                <FaFilter className="text-blue-500" />
                <span className="font-medium">Filtres</span>
              </span>
              <FaChevronDown className={`transform transition-transform ${showMobileMenu ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>

        {/* Stats Cards - Responsive Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6 md:mb-8 lg:mb-10">
          <StatsCard 
            label="Total"
            value={stats.total}
            icon={<FaBook />}
            color="blue"
          />
          <StatsCard 
            label="En attente"
            value={stats.pending}
            icon={<FaClock />}
            color="yellow"
          />
          <StatsCard 
            label="Actifs"
            value={stats.active}
            icon={<FaCheckCircle />}
            color="green"
          />
          <StatsCard 
            label="Retournés"
            value={stats.returned}
            icon={<FaHistory />}
            color="blue"
          />
          <StatsCard 
            label="Rejetés"
            value={stats.rejected}
            icon={<FaTimesCircle />}
            color="red"
          />
        </div>

        {/* Mobile Tabs Menu (when open) */}
        {showMobileMenu && (
          <div className="sm:hidden mb-4 p-3 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
            <div className="space-y-1">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setShowMobileMenu(false);
                  }}
                  className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? "bg-blue-600 text-white"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <span className={activeTab === tab.id ? "text-white" : "text-gray-500"}>
                      {tab.icon}
                    </span>
                    <span>{tab.label}</span>
                  </span>
                  {tab.count > 0 && (
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      activeTab === tab.id
                        ? "bg-white/20 text-white"
                        : "bg-gray-200 dark:bg-gray-700"
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Desktop Tabs Navigation - Hidden on mobile */}
        <div className="hidden sm:block mb-6 md:mb-8 lg:mb-10">
          <div className="flex flex-wrap gap-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 md:py-3 rounded-lg sm:rounded-xl font-medium transition-all duration-300 text-xs sm:text-sm ${
                  activeTab === tab.id
                    ? "bg-blue-600 text-white shadow-lg sm:transform sm:scale-105"
                    : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 shadow-sm"
                }`}
              >
                <span className="text-sm sm:text-base">{tab.icon}</span>
                <span className="hidden xs:inline">{tab.label}</span>
                <span className="xs:hidden">{tab.shortLabel}</span>
                {tab.count > 0 && (
                  <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs rounded-full ${
                    activeTab === tab.id
                      ? "bg-white/20 text-white"
                      : "bg-gray-200 dark:bg-gray-700"
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Loans List */}
        {loading ? (
          <LoadingState />
        ) : filteredLoans.length === 0 ? (
          <EmptyState activeTab={activeTab} />
        ) : (
          <div className="space-y-3 sm:space-y-4 md:space-y-5 lg:space-y-6">
            {filteredLoans.map(loan => {
              const statusConfig = getStatusConfig(loan.status, loan.dueDate);
              const daysRemaining = calculateDaysRemaining(loan.dueDate);
              
              return (
                <LoanCard
                  key={loan._id}
                  loan={loan}
                  statusConfig={statusConfig}
                  daysRemaining={daysRemaining}
                  formatDate={formatDate}
                  formatShortDate={formatShortDate}
                  handleViewDetails={handleViewDetails}
                  handleCancelRequest={handleRequestCancel}
                />
              );
            })}
          </div>
        )}

        {/* BookDetail modal */}
        {showDetail && selectedBook && (
          <BookDetail
            book={selectedBook}
            onClose={handleCloseDetail}
            onRequestLoan={() => {}}
            userRole={user?.role || 'student'}
          />
        )}

        {/* Cancel confirmation (replaces window.confirm) */}
        <ConfirmationModal
          isOpen={!!loanToCancel}
          title="Annuler cette demande de prêt ?"
          message="Cette action est définitive. Vous pourrez soumettre une nouvelle demande plus tard si le livre est encore disponible."
          onConfirm={handleConfirmCancel}
          onCancel={handleCancelDialogClose}
          isLoading={isCancelling}
          confirmText="Annuler la demande"
          cancelText="Retour"
          isDangerous={true}
        />

        {/* Information Box - Responsive */}
        <InfoBox />
      </div>
    </div>
  );
};

// ============================================================================
// Helper Components
// ============================================================================

const StatsCard = ({ label, value, icon, color }) => {
  const colorClasses = {
    blue: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
    yellow: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400",
    green: "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400",
    red: "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-5 shadow-md border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-all duration-300">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-0.5 sm:mb-1 truncate">
            {label}
          </p>
          <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-800 dark:text-gray-100">
            {value}
          </p>
        </div>
        <div className={`w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 ${colorClasses[color]} rounded-full flex items-center justify-center`}>
          <span className="text-sm sm:text-base md:text-lg lg:text-xl">{icon}</span>
        </div>
      </div>
    </div>
  );
};

const LoadingState = () => (
  <div className="flex flex-col items-center justify-center py-12 sm:py-16 md:py-20">
    <FaSpinner className="animate-spin text-3xl sm:text-4xl md:text-5xl text-blue-500 mb-3 sm:mb-4" />
    <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Chargement de vos prêts...</p>
  </div>
);

const EmptyState = ({ activeTab }) => {
  const config = {
    current: { icon: "📭", title: "Aucun prêt en cours", message: "Commencez par demander un prêt dans le catalogue de livres !" },
    pending: { icon: "⏳", title: "Aucune demande en attente", message: "Vous n'avez aucune demande en attente." },
    active: { icon: "📚", title: "Aucun prêt actif", message: "Vous n'avez aucun prêt actif pour le moment." },
    history: { icon: "📖", title: "Aucun historique", message: "Votre historique de prêts est vide." },
    returned: { icon: "📖", title: "Aucun retour", message: "Aucun livre retourné trouvé." },
    rejected: { icon: "📄", title: "Aucun rejet", message: "Aucune demande rejetée." },
    cancelled: { icon: "📄", title: "Aucune annulation", message: "Aucune demande annulée." }
  };

  const currentConfig = config[activeTab] || config.current;

  return (
    <div className="text-center py-12 sm:py-14 md:py-16 bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 px-4">
      <div className="text-5xl sm:text-6xl md:text-7xl mb-4 sm:mb-5 md:mb-6">
        {currentConfig.icon}
      </div>
      <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-2 sm:mb-3">
        {currentConfig.title}
      </h3>
      <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mb-6 sm:mb-8 max-w-md mx-auto">
        {currentConfig.message}
      </p>
      {activeTab === "current" && (
        <button
          onClick={() => window.location.href = '/books'}
          className="px-5 sm:px-6 md:px-8 py-2.5 sm:py-3 bg-blue-600 text-white rounded-lg sm:rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl flex items-center gap-2 mx-auto text-sm sm:text-base"
        >
          <FaBook />
          Parcourir le catalogue
        </button>
      )}
    </div>
  );
};

const LoanCard = ({ 
  loan, 
  statusConfig, 
  daysRemaining, 
  formatDate, 
  formatShortDate, 
  handleViewDetails, 
  handleCancelRequest 
}) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-all duration-300 overflow-hidden">
      
      {/* Mobile Layout (< md) */}
      <div className="md:hidden">
        {/* Compact Header */}
        <div className="p-4 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-start gap-3">
            {/* Mini Cover */}
            <div className="w-12 h-16 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
              {loan.book?.coverImage ? (
                <img 
                  src={loan.book.coverImage} 
                  alt={loan.book.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <FaBook className="text-gray-400 text-lg" />
                </div>
              )}
            </div>
            
            {/* Basic Info */}
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-gray-800 dark:text-gray-100 text-base truncate">
                {loan.book?.title || "Titre inconnu"}
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                {loan.book?.authors?.join(", ") || loan.book?.author || "Auteur inconnu"}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-xs px-2 py-0.5 rounded-full flex items-center ${statusConfig.color}`}>
                  {statusConfig.icon}
                  <span className="ml-0.5">{statusConfig.shortText}</span>
                </span>
                {loan.dueDate && (
                  <span className="text-xs text-gray-500">
                    {formatShortDate(loan.dueDate)}
                  </span>
                )}
              </div>
            </div>
            
            {/* Expand Toggle */}
            <button
              onClick={() => setExpanded(!expanded)}
              className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              <FaChevronDown className={`transform transition-transform ${expanded ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>
        
        {/* Expanded Details */}
        {expanded && (
          <div className="p-4 space-y-3 bg-gray-50 dark:bg-gray-700/50">
            {/* Dates Grid */}
            <div className="grid grid-cols-2 gap-2">
              <DateBox 
                label="Demandé"
                date={loan.requestDate}
                formatDate={formatShortDate}
                icon={<FaCalendarAlt className="text-blue-500" />}
              />
              {loan.approvedDate && (
                <DateBox 
                  label="Approuvé"
                  date={loan.approvedDate}
                  formatDate={formatShortDate}
                  icon={<FaCheckCircle className="text-green-500" />}
                />
              )}
              {loan.dueDate && (
                <DateBox 
                  label="Retour"
                  date={loan.dueDate}
                  formatDate={formatShortDate}
                  icon={<FaCalendarAlt className={daysRemaining < 0 ? 'text-red-500' : 'text-blue-500'} />}
                  extra={
                    daysRemaining !== null && (
                      <span className={`text-xs ${daysRemaining < 0 ? 'text-red-600' : 'text-gray-500'}`}>
                        {daysRemaining < 0 ? `${Math.abs(daysRemaining)}j retard` : `${daysRemaining}j`}
                      </span>
                    )
                  }
                />
              )}
            </div>
            
            {/* ISBN */}
            {loan.book?.isbn && (
              <div className="text-xs text-gray-500">
                <FaTag className="inline mr-1" />
                ISBN: {loan.book.isbn}
              </div>
            )}
            
            {/* Rejection Reason */}
            {loan.rejectionReason && (
              <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                <p className="text-xs text-red-700 dark:text-red-300">
                  <FaTimesCircle className="inline mr-1" />
                  {loan.rejectionReason}
                </p>
              </div>
            )}
            
            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => handleViewDetails(loan.book)}
                className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-1 text-xs"
              >
                <FaEye /> Détails
              </button>
              
              {loan.status === "requested" && (
                <button
                  onClick={() => handleCancelRequest(loan._id)}
                  className="flex-1 px-3 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center justify-center gap-1 text-xs"
                >
                  <FaBan /> Annuler
                </button>
              )}
              
              {loan.status === "active" && daysRemaining !== null && daysRemaining < 7 && (
                <button
                  onClick={() => toast.info("Fonctionnalité à venir")}
                  className="flex-1 px-3 py-2 bg-yellow-600 text-white rounded-lg font-medium hover:bg-yellow-700 transition-colors flex items-center justify-center gap-1 text-xs"
                >
                  <FaClock /> Prolonger
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Desktop Layout (md+) */}
      <div className="hidden md:block p-6 lg:p-8">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 lg:gap-8">
          
          {/* Left Column: Book Info */}
          <div className="flex-1">
            <div className="flex flex-col md:flex-row md:items-start gap-4 lg:gap-6">
              {/* Book Cover */}
              <div className="w-20 lg:w-24 h-28 lg:h-32 bg-gray-100 dark:bg-gray-700 rounded-xl overflow-hidden flex-shrink-0 shadow-md">
                {loan.book?.coverImage ? (
                  <img 
                    src={loan.book.coverImage} 
                    alt={loan.book.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <FaBook className="text-gray-400 dark:text-gray-500 text-2xl lg:text-3xl" />
                  </div>
                )}
              </div>
              
              {/* Book Details */}
              <div className="flex-1">
                <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                  <div>
                    <h3 className="text-xl lg:text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                      {loan.book?.title || "Titre inconnu"}
                    </h3>
                    <p className="text-sm lg:text-base text-gray-600 dark:text-gray-400 mb-2">
                      <FaUser className="inline mr-2 text-gray-400" />
                      {loan.book?.authors?.join(", ") || loan.book?.author || "Auteur inconnu"}
                    </p>
                    {loan.book?.isbn && (
                      <p className="text-xs lg:text-sm text-gray-500 dark:text-gray-500">
                        <FaTag className="inline mr-2" />
                        ISBN: {loan.book.isbn}
                      </p>
                    )}
                  </div>
                  
                  {/* Status Badge */}
                  <div className={`px-3 lg:px-4 py-1.5 lg:py-2 rounded-lg lg:rounded-xl flex items-center ${statusConfig.color} text-xs lg:text-sm`}>
                    {statusConfig.icon}
                    <span className="font-semibold">{statusConfig.text}</span>
                  </div>
                </div>
                
                {/* Loan Details Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4 mt-4 lg:mt-6">
                  <DetailBox 
                    icon={<FaCalendarAlt className="text-gray-500" />}
                    label="Demandé le"
                    value={formatDate(loan.requestDate)}
                  />
                  
                  {loan.approvedDate && (
                    <DetailBox 
                      icon={<FaCheckCircle className="text-green-500" />}
                      label="Approuvé le"
                      value={formatDate(loan.approvedDate)}
                    />
                  )}
                  
                  {loan.dueDate && (
                    <DetailBox 
                      icon={<FaCalendarAlt className={daysRemaining < 0 ? 'text-red-500' : 'text-blue-500'} />}
                      label="Retour avant"
                      value={formatDate(loan.dueDate)}
                      extra={
                        daysRemaining !== null && (
                          <span className={`ml-2 text-xs lg:text-sm ${
                            daysRemaining < 0 
                              ? 'text-red-600 dark:text-red-400' 
                              : daysRemaining < 7 
                              ? 'text-yellow-600 dark:text-yellow-400'
                              : 'text-green-600 dark:text-green-400'
                          }`}>
                            ({daysRemaining < 0 ? `${Math.abs(daysRemaining)}j retard` : `${daysRemaining}j restants`})
                          </span>
                        )
                      }
                    />
                  )}
                </div>
                
                {/* Rejection Reason */}
                {loan.rejectionReason && (
                  <div className="mt-4 p-3 lg:p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                    <p className="text-xs lg:text-sm text-red-700 dark:text-red-300 font-medium">
                      <FaTimesCircle className="inline mr-2" />
                      Motif de rejet : {loan.rejectionReason}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Right Column: Actions */}
          <div className="lg:w-64 flex flex-col gap-3">
            {loan.status === "requested" && (
              <button
                onClick={() => handleCancelRequest(loan._id)}
                className="w-full px-4 py-2.5 lg:py-3 bg-red-600 text-white rounded-lg lg:rounded-xl font-semibold hover:bg-red-700 transition-colors flex items-center justify-center gap-2 text-sm lg:text-base"
              >
                <FaBan />
                Annuler la demande
              </button>
            )}
            
            <button
              onClick={() => handleViewDetails(loan.book)}
              className="w-full px-4 py-2.5 lg:py-3 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg lg:rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-2 text-sm lg:text-base"
            >
              <FaEye />
              Voir détails
            </button>
            
            {loan.status === "active" && daysRemaining !== null && daysRemaining < 7 && (
              <button
                onClick={() => toast.info("Fonctionnalité de prolongation à venir")}
                className="w-full px-4 py-2.5 lg:py-3 bg-yellow-600 text-white rounded-lg lg:rounded-xl font-semibold hover:bg-yellow-700 transition-colors flex items-center justify-center gap-2 text-sm lg:text-base"
              >
                <FaClock />
                Prolonger
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const DateBox = ({ label, date, formatDate, icon, extra }) => (
  <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
    <span className="text-gray-500">{icon}</span>
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">
        {formatDate(date)}
        {extra}
      </p>
    </div>
  </div>
);

const DetailBox = ({ icon, label, value, extra }) => (
  <div className="flex items-center gap-2 p-2 lg:p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
    <span className="text-gray-500">{icon}</span>
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-xs lg:text-sm font-semibold text-gray-800 dark:text-gray-200">
        {value}
        {extra}
      </p>
    </div>
  </div>
);

const InfoBox = () => (
  <div className="mt-8 sm:mt-10 md:mt-12 p-4 sm:p-5 md:p-6 lg:p-8 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/20 rounded-xl sm:rounded-2xl border border-blue-200 dark:border-blue-800">
    <h4 className="text-lg sm:text-xl md:text-2xl font-bold text-blue-800 dark:text-blue-300 mb-4 sm:mb-5 md:mb-6 flex items-center gap-2 sm:gap-3">
      <span className="text-2xl sm:text-3xl">💡</span>
      <span className="hidden xs:inline">Comment fonctionnent les prêts ?</span>
      <span className="xs:hidden">Fonctionnement</span>
    </h4>
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
      <InfoStep 
        number="1" 
        title="Demande" 
        description="Votre demande est enregistrée et mise en attente d'approbation."
        shortDesc="En attente d'approbation"
      />
      <InfoStep 
        number="2" 
        title="Récupération" 
        description="Une fois approuvé, récupérez le livre avec votre carte étudiante."
        shortDesc="Récupérez le livre"
      />
      <InfoStep 
        number="3" 
        title="Retour" 
        description="Retournez le livre avant la date limite (1€/jour de retard)."
        shortDesc="Évitez les retards"
      />
    </div>
  </div>
);

const InfoStep = ({ number, title, description, shortDesc }) => (
  <div className="p-3 sm:p-4 bg-white/50 dark:bg-white/10 rounded-lg sm:rounded-xl">
    <h5 className="font-semibold text-blue-700 dark:text-blue-300 mb-1 sm:mb-2 text-sm sm:text-base">
      {number}. {title}
    </h5>
    <p className="text-xs sm:text-sm text-blue-600 dark:text-blue-400">
      <span className="hidden xs:inline">{description}</span>
      <span className="xs:hidden">{shortDesc}</span>
    </p>
  </div>
);

export default MyLoans;
