import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FaSpinner, FaSearch, FaTimes, FaFilter, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { toast } from 'react-toastify';
import loanService from '../../../services/loanService';
import LoanActionCard from './LoanActionCard';
import { useTheme } from '../../../context/ThemeContext';

// PERF FIX (P1): this dashboard previously fetched the ENTIRE loans
// collection via loanService.getAllLoans() with no filter, then filtered
// and "paginated" everything in the browser. That does not scale as loan
// history grows (unlike the book catalog, which was already paginated
// server-side). It now requests only the statuses relevant to the active
// tab, with real page/limit params, mirroring the pattern used by
// BookCatalog/useBooksNew.
//
// KNOWN LIMITATION: the search box now filters only within the currently
// loaded page (not the whole dataset), since full-text search across
// populated student/book fields would require a dedicated backend query.
// This is an accepted trade-off for this pass; a proper server-side search
// endpoint is tracked separately.
const STATUS_BY_TAB = {
  pendings: 'pending',
  active: 'approved,active',
  history: 'returned,rejected,cancelled',
};

const HISTORY_SUB_STATUS = {
  returned: 'returned',
  rejected: 'rejected',
  cancelled: 'cancelled',
};

const PAGE_SIZE = 20;

const StaffLoanDashboard = () => {
  const { isDarkMode } = useTheme();

  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pendings');
  const [searchQuery, setSearchQuery] = useState('');
  const [historyStatusFilter, setHistoryStatusFilter] = useState('all');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalForTab, setTotalForTab] = useState(0);

  // Lightweight counts for the tab badges (pending/active/history), fetched
  // with limit=1 so we only pay for the `total` field, not full payloads.
  const [tabCounts, setTabCounts] = useState({ pending: 0, active: 0, history: 0, total: 0 });

  const bookIdFilter = searchParams.get('bookId');

  const currentStatusFilter = activeTab === 'history' && historyStatusFilter !== 'all'
    ? HISTORY_SUB_STATUS[historyStatusFilter]
    : STATUS_BY_TAB[activeTab];

  const fetchLoans = useCallback(async () => {
    setLoading(true);
    try {
      const filters = {
        status: currentStatusFilter,
        page,
        limit: PAGE_SIZE,
        ...(bookIdFilter ? { bookId: bookIdFilter } : {}),
      };

      const response = await loanService.getAllLoans(filters);
      // Backend now returns { success, count, total, page, totalPages, data }
      const data = Array.isArray(response?.data) ? response.data : [];

      setLoans(data);
      setTotalPages(response?.totalPages || 1);
      setTotalForTab(response?.total || data.length);
    } catch (err) {
      console.error('❌ [StaffLoanDashboard] Fetch error:', err);
      toast.error('Erreur lors du chargement des prêts');
      setLoans([]);
      setTotalPages(1);
      setTotalForTab(0);
    } finally {
      setLoading(false);
    }
  }, [currentStatusFilter, page, bookIdFilter]);

  const fetchTabCounts = useCallback(async () => {
    try {
      const [pendingRes, activeRes, historyRes] = await Promise.all([
        loanService.getAllLoans({ status: STATUS_BY_TAB.pendings, page: 1, limit: 1 }),
        loanService.getAllLoans({ status: STATUS_BY_TAB.active, page: 1, limit: 1 }),
        loanService.getAllLoans({ status: STATUS_BY_TAB.history, page: 1, limit: 1 }),
      ]);
      const pending = pendingRes?.total || 0;
      const active = activeRes?.total || 0;
      const history = historyRes?.total || 0;
      setTabCounts({ pending, active, history, total: pending + active + history });
    } catch (err) {
      console.error('❌ [StaffLoanDashboard] Tab counts fetch error:', err);
    }
  }, []);

  // Reset to page 1 whenever the active filter changes (tab, sub-status, or
  // bookId query param) so we don't end up requesting an out-of-range page.
  useEffect(() => {
    setPage(1);
  }, [activeTab, historyStatusFilter, bookIdFilter]);

  useEffect(() => {
    fetchLoans();
  }, [fetchLoans]);

  useEffect(() => {
    fetchTabCounts();
  }, [fetchTabCounts]);

  // Client-side filter, scoped to the currently loaded page only (see
  // "KNOWN LIMITATION" note above).
  const filteredLoans = searchQuery.trim()
    ? loans.filter((loan) => {
        const query = searchQuery.toLowerCase();
        const studentName = (loan.user?.name || '').toLowerCase();
        const studentEmail = (loan.user?.email || '').toLowerCase();
        const bookTitle = (loan.book?.title || '').toLowerCase();
        return (
          studentName.includes(query) ||
          studentEmail.includes(query) ||
          bookTitle.includes(query)
        );
      })
    : loans;

  const handleActionSuccess = (loanId, newStatus) => {
    // The loan moved to a different status/tab: drop it from the current
    // view and refresh counts so badges stay accurate.
    setLoans((prev) => prev.filter((loan) => loan._id !== loanId));
    setTotalForTab((prev) => Math.max(0, prev - 1));
    fetchTabCounts();
  };

  const clearFilter = () => {
    setSearchParams({});
  };

  if (loading && loans.length === 0) {
    return (
      <div className={`min-h-screen p-4 sm:p-6 md:p-8 flex items-center justify-center ${
        isDarkMode ? 'bg-slate-900' : 'bg-gray-100'
      }`}>
        <div className="flex flex-col items-center gap-3">
          <FaSpinner className="animate-spin text-3xl sm:text-4xl text-blue-500" />
          <p className={`text-sm sm:text-base ${isDarkMode ? 'text-slate-300' : 'text-gray-600'}`}>
            Chargement des prêts...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen p-3 sm:p-4 md:p-5 lg:p-8 ${
      isDarkMode ? 'bg-slate-900 text-white' : 'bg-gray-50 text-gray-900'
    }`}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-4 sm:mb-6 md:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1 sm:mb-2 flex items-center gap-2">
            <span className="text-3xl sm:text-4xl md:text-5xl">📚</span>
            <span className="truncate">Gestion des Prêts</span>
          </h1>
          <p className={`text-xs sm:text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
            Gérez les demandes de prêt, les prêts actifs et l'historique
          </p>
        </div>

        {/* Stat Header */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6 md:mb-8">
          <StatCard label="En Attente" value={tabCounts.pending} color="yellow" isDarkMode={isDarkMode} />
          <StatCard label="Actifs" value={tabCounts.active} color="green" isDarkMode={isDarkMode} />
          <StatCard label="Historique" value={tabCounts.history} color="blue" isDarkMode={isDarkMode} />
          <StatCard label="Total" value={tabCounts.total} color="gray" isDarkMode={isDarkMode} />
        </div>

        {/* Alert if filter is active */}
        {bookIdFilter && (
          <div className={`mb-4 sm:mb-6 p-3 sm:p-4 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
            isDarkMode ? 'bg-blue-900 border border-blue-700' : 'bg-blue-50 border border-blue-200'
          }`}>
            <div className="flex-1">
              <p className={`text-xs sm:text-sm ${isDarkMode ? 'text-blue-200' : 'text-blue-800'}`}>
                <span className="font-semibold">Filtre actif:</span> Affichage des prêts pour
                <span className="block xs:inline xs:ml-1 break-all">ID: {bookIdFilter}</span>
              </p>
            </div>
            <button
              onClick={clearFilter}
              type="button"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-3 sm:px-4 py-2 rounded-md transition text-xs sm:text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white"
            >
              <FaTimes className="text-xs" /> Effacer le filtre
            </button>
          </div>
        )}

        {/* Search Bar (scoped to current page - see limitation note) */}
        <div className="mb-4 sm:mb-6">
          <div className="relative">
            <FaSearch className={`absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-sm sm:text-base ${
              isDarkMode ? 'text-slate-500' : 'text-gray-400'
            }`} />
            <input
              type="text"
              placeholder="Filtrer cette page par étudiant ou livre..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full border rounded-lg pl-9 sm:pl-12 pr-9 sm:pr-12 py-2.5 sm:py-3 text-sm sm:text-base focus:outline-none focus:border-blue-500 transition ${
                isDarkMode
                  ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                type="button"
                className={`absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 transition ${
                  isDarkMode ? 'text-slate-500 hover:text-slate-300' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <FaTimes className="text-sm sm:text-base" />
              </button>
            )}
          </div>
          {searchQuery && (
            <p className={`mt-1.5 sm:mt-2 text-xs sm:text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
              {filteredLoans.length} résultat(s) sur cette page ({PAGE_SIZE} prêts/page)
            </p>
          )}
        </div>

        {/* Mobile Filter Toggle */}
        <div className="sm:hidden mb-4">
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className={`w-full flex items-center justify-between p-3 rounded-lg border ${
              isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-white border-gray-200 text-gray-700'
            }`}
          >
            <span className="flex items-center gap-2">
              <FaFilter className={activeTab === 'history' ? 'text-blue-500' : 'text-gray-500'} />
              Filtres et navigation
            </span>
          </button>
        </div>

        {/* Desktop Tab Navigation */}
        <div className={`hidden sm:flex border-b mb-4 sm:mb-6 ${isDarkMode ? 'border-slate-700' : 'border-gray-200'}`}>
          <TabButton
            label="Demandes en Attente"
            count={tabCounts.pending}
            active={activeTab === 'pendings'}
            color="yellow"
            onClick={() => { setActiveTab('pendings'); setHistoryStatusFilter('all'); }}
            isDarkMode={isDarkMode}
          />
          <TabButton
            label="Prêts Actifs"
            count={tabCounts.active}
            active={activeTab === 'active'}
            color="green"
            onClick={() => { setActiveTab('active'); setHistoryStatusFilter('all'); }}
            isDarkMode={isDarkMode}
          />
          <TabButton
            label="Historique"
            count={tabCounts.history}
            active={activeTab === 'history'}
            color="blue"
            onClick={() => { setActiveTab('history'); setHistoryStatusFilter('all'); }}
            isDarkMode={isDarkMode}
          />
        </div>

        {/* Mobile Navigation */}
        {showMobileFilters && (
          <div className={`sm:hidden mb-4 p-3 rounded-lg border ${
            isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
          }`}>
            <p className={`text-xs font-medium mb-2 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>Navigation</p>
            <div className="flex flex-col gap-2">
              <MobileTabButton label="Demandes en Attente" count={tabCounts.pending} active={activeTab === 'pendings'} color="yellow"
                onClick={() => { setActiveTab('pendings'); setHistoryStatusFilter('all'); setShowMobileFilters(false); }} />
              <MobileTabButton label="Prêts Actifs" count={tabCounts.active} active={activeTab === 'active'} color="green"
                onClick={() => { setActiveTab('active'); setHistoryStatusFilter('all'); setShowMobileFilters(false); }} />
              <MobileTabButton label="Historique" count={tabCounts.history} active={activeTab === 'history'} color="blue"
                onClick={() => { setActiveTab('history'); setHistoryStatusFilter('all'); setShowMobileFilters(false); }} />
            </div>
          </div>
        )}

        {/* History Filter Chips */}
        {activeTab === 'history' && (
          <div className={`mb-4 sm:mb-6 p-3 sm:p-4 rounded-lg border ${
            isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200 shadow-sm'
          }`}>
            <p className={`text-xs sm:text-sm font-medium mb-2 sm:mb-3 ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>
              Filtrer par statut:
            </p>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {[
                { value: 'all', label: 'Tous' },
                { value: 'returned', label: '✓ Retournés' },
                { value: 'rejected', label: '✗ Refusés' },
                { value: 'cancelled', label: '⊘ Annulés' },
              ].map((chip) => (
                <button
                  key={chip.value}
                  onClick={() => setHistoryStatusFilter(chip.value)}
                  type="button"
                  className={`px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition ${
                    historyStatusFilter === chip.value
                      ? 'bg-blue-600 text-white border border-blue-500'
                      : isDarkMode
                        ? 'bg-slate-700 text-slate-300 border border-slate-600 hover:border-slate-500'
                        : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
                  }`}
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Content Area */}
        <div className="space-y-3 sm:space-y-4">
          {loading ? (
            <div className={`rounded-lg p-8 sm:p-10 md:p-12 text-center border ${
              isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200 shadow-sm'
            }`}>
              <FaSpinner className="animate-spin text-2xl text-blue-500 mx-auto" />
            </div>
          ) : filteredLoans.length === 0 ? (
            <div className={`rounded-lg p-8 sm:p-10 md:p-12 text-center border ${
              isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200 shadow-sm'
            }`}>
              <p className={`text-sm sm:text-base ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                {searchQuery
                  ? `Aucun résultat sur cette page pour "${searchQuery}"`
                  : activeTab === 'pendings'
                  ? 'Aucune demande en attente'
                  : activeTab === 'active'
                  ? 'Aucun prêt actif'
                  : 'Aucun historique'}
              </p>
            </div>
          ) : (
            filteredLoans.map((loan) => (
              <LoanActionCard
                key={loan._id}
                loan={loan}
                activeTab={activeTab}
                onActionSuccess={handleActionSuccess}
              />
            ))
          )}
        </div>

        {/* Server-side pagination controls */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <span className={`text-xs sm:text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
              Page {page} / {totalPages} ({totalForTab} prêts au total)
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className={`p-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed ${
                  isDarkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-gray-200 hover:bg-gray-300'
                }`}
              >
                <FaChevronLeft />
              </button>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className={`p-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed ${
                  isDarkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-gray-200 hover:bg-gray-300'
                }`}
              >
                <FaChevronRight />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const StatCard = ({ label, value, color, isDarkMode }) => {
  const colorClasses = {
    yellow: 'text-yellow-400',
    green: 'text-green-400',
    blue: 'text-blue-400',
    gray: isDarkMode ? 'text-slate-300' : 'text-gray-700',
  };

  return (
    <div className={`rounded-lg p-3 sm:p-4 md:p-5 lg:p-6 border ${
      isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200 shadow-sm'
    }`}>
      <div className={`text-xs sm:text-sm font-medium mb-1 sm:mb-2 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
        {label}
      </div>
      <div className={`text-xl sm:text-2xl md:text-3xl font-bold ${colorClasses[color]}`}>
        {value}
      </div>
    </div>
  );
};

const TabButton = ({ label, count, active, color, onClick, isDarkMode }) => {
  const colorClasses = {
    yellow: 'text-yellow-400 border-yellow-400',
    green: 'text-green-400 border-green-400',
    blue: 'text-blue-400 border-blue-400',
  };

  return (
    <button
      onClick={onClick}
      type="button"
      className={`px-4 sm:px-5 md:px-6 py-2.5 sm:py-3 font-semibold text-sm sm:text-base transition ${
        active
          ? `${colorClasses[color]} border-b-2`
          : isDarkMode ? 'text-slate-400 hover:text-slate-300' : 'text-gray-500 hover:text-gray-700'
      }`}
    >
      <span className="hidden md:inline">{label}</span>
      <span className="md:hidden">{label.split(' ')[0]}</span> ({count})
    </button>
  );
};

const MobileTabButton = ({ label, count, active, color, onClick }) => {
  const colorClasses = {
    yellow: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border-yellow-300',
    green: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-300',
    blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-300',
  };

  return (
    <button
      onClick={onClick}
      type="button"
      className={`w-full text-left px-3 py-2.5 rounded-lg border text-sm font-medium transition ${
        active ? colorClasses[color] : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600'
      }`}
    >
      {label} ({count})
    </button>
  );
};

export default StaffLoanDashboard;
