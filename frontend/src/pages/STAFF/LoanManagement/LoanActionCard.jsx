import { useState } from 'react';
import { FaSpinner, FaCheckCircle, FaTimesCircle, FaUndo, FaBook } from 'react-icons/fa';
import { toast } from 'react-toastify';
import loanService from '../../../services/loanService';
import { useTheme } from '../../../context/ThemeContext';
import ConfirmationModal from '../../../components/modals/ConfirmationModal';

/**
 * LoanActionCard - A reusable horizontal card for displaying loans with action buttons
 * Layout: Left (book cover) | Right (book & student info + action buttons)
 *
 * UX/CONSISTENCY FIX (P2): approve/reject/return previously used native
 * window.confirm()/window.prompt(). These are blocking, unstyled (breaks
 * dark mode), and poor on mobile. They've been replaced with the app's own
 * ConfirmationModal, already used elsewhere (e.g. removing a favorite).
 *
 * Props:
 * - loan: The loan object
 * - activeTab: Current tab ('pendings', 'active', 'history')
 * - onActionSuccess: Callback when action succeeds - receives (loanId, newStatus)
 */
const LoanActionCard = ({ loan, activeTab, onActionSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { isDarkMode } = useTheme(); // Get theme state

  // Which confirmation dialog is currently open: null | 'approve' | 'reject' | 'return'
  const [pendingAction, setPendingAction] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  // Get badge color based on status
  const getStatusBadge = () => {
    const statusMap = {
      pending: { 
        bg: 'bg-yellow-100 dark:bg-yellow-900', 
        text: 'text-yellow-800 dark:text-yellow-200', 
        label: 'En attente' 
      },
      approved: { 
        bg: 'bg-green-100 dark:bg-green-900', 
        text: 'text-green-800 dark:text-green-200', 
        label: 'Approuvé' 
      },
      active: { 
        bg: 'bg-green-100 dark:bg-green-900', 
        text: 'text-green-800 dark:text-green-200', 
        label: 'Actif' 
      },
      returned: { 
        bg: 'bg-blue-100 dark:bg-blue-900', 
        text: 'text-blue-800 dark:text-blue-200', 
        label: 'Retourné' 
      },
      rejected: { 
        bg: 'bg-red-100 dark:bg-red-900', 
        text: 'text-red-800 dark:text-red-200', 
        label: 'Rejeté' 
      },
      cancelled: { 
        bg: 'bg-red-100 dark:bg-red-900', 
        text: 'text-red-800 dark:text-red-200', 
        label: 'Annulé' 
      },
    };
    const status = loan.status || 'pending';
    const badge = statusMap[status] || statusMap.pending;
    return { ...badge, status };
  };

  const closeDialog = () => {
    if (isLoading) return;
    setPendingAction(null);
    setRejectReason('');
  };

  const confirmApprove = async () => {
    setIsLoading(true);
    try {
      await loanService.approveLoan(loan._id);
      toast.success('Prêt approuvé avec succès');
      onActionSuccess(loan._id, 'approved');
      setPendingAction(null);
    } catch (err) {
      console.error('Approve error:', err);
      toast.error('Erreur lors de l\'approbation');
    } finally {
      setIsLoading(false);
    }
  };

  const confirmReject = async () => {
    setIsLoading(true);
    try {
      await loanService.rejectLoan(loan._id, rejectReason || '');
      toast.success('Demande rejetée');
      onActionSuccess(loan._id, 'rejected');
      setPendingAction(null);
      setRejectReason('');
    } catch (err) {
      console.error('Reject error:', err);
      toast.error('Erreur lors du rejet');
    } finally {
      setIsLoading(false);
    }
  };

  const confirmReturn = async () => {
    setIsLoading(true);
    try {
      await loanService.returnLoan(loan._id);
      toast.success('Prêt marqué comme retourné');
      onActionSuccess(loan._id, 'returned');
      setPendingAction(null);
    } catch (err) {
      console.error('Return error:', err);
      toast.error('Erreur lors du retour du prêt');
    } finally {
      setIsLoading(false);
    }
  };

  const badge = getStatusBadge();

  return (
    <div className={`flex gap-4 p-5 rounded-lg border transition-colors ${
      isDarkMode 
        ? 'bg-slate-800 border-slate-700 hover:border-slate-600' 
        : 'bg-white border-gray-200 hover:border-gray-300 shadow-sm'
    }`}>
      {/* LEFT SIDE: Book Cover */}
      <div className="flex-shrink-0">
        <div className={`w-20 h-28 rounded-md overflow-hidden flex items-center justify-center border ${
          isDarkMode 
            ? 'bg-slate-700 border-slate-600' 
            : 'bg-gray-100 border-gray-200'
        }`}>
          {loan.book?.coverImage ? (
            <img
              src={loan.book.coverImage}
              alt={loan.book?.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <FaBook className={`text-xl ${
              isDarkMode ? 'text-slate-500' : 'text-gray-400'
            }`} />
          )}
        </div>
      </div>

      {/* CENTER: Book & Student Info */}
      <div className="flex-1 flex flex-col justify-between">
        {/* Book Info */}
        <div>
          <h3 className={`text-lg font-semibold ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            {loan.book?.title || 'Livre inconnu'}
          </h3>
          <p className={`text-sm ${
            isDarkMode ? 'text-slate-300' : 'text-gray-600'
          }`}>
            {Array.isArray(loan.book?.authors)
              ? loan.book.authors.join(', ')
              : loan.book?.authors || loan.book?.author || 'Auteur inconnu'}
          </p>

          {/* Student Info */}
          <div className={`mt-2 text-sm ${
            isDarkMode ? 'text-slate-400' : 'text-gray-500'
          }`}>
            <p>
              <span className={`font-medium ${
                isDarkMode ? 'text-slate-300' : 'text-gray-700'
              }`}>Étudiant:</span> {loan.user?.name || loan.user?.email || 'Inconnu'}
            </p>
            {loan.user?.studentId && (
              <p>
                <span className={`font-medium ${
                  isDarkMode ? 'text-slate-300' : 'text-gray-700'
                }`}>ID Étudiant:</span> {loan.user.studentId}
              </p>
            )}
          </div>

          {/* Dates Info */}
          <div className={`mt-2 text-sm ${
            isDarkMode ? 'text-slate-400' : 'text-gray-500'
          }`}>
            {loan.startDate && (
              <p>
                <span className={`font-medium ${
                  isDarkMode ? 'text-slate-300' : 'text-gray-700'
                }`}>Date de prêt:</span>{' '}
                {new Date(loan.startDate).toLocaleDateString('fr-FR')}
              </p>
            )}
            {loan.dueDate && (
              <p>
                <span className={`font-medium ${
                  isDarkMode ? 'text-slate-300' : 'text-gray-700'
                }`}>Date d'échéance:</span>{' '}
                {new Date(loan.dueDate).toLocaleDateString('fr-FR')}
              </p>
            )}
            {(loan.status === 'returned' || loan.status === 'rejected' || loan.status === 'cancelled') &&
              loan.lastActionDate && (
                <p>
                  <span className={`font-medium ${
                    isDarkMode ? 'text-slate-300' : 'text-gray-700'
                  }`}>Dernière action:</span>{' '}
                  {new Date(loan.lastActionDate).toLocaleDateString('fr-FR')}
                </p>
              )}
          </div>
        </div>

        {/* Status Badge */}
        <div className="mt-3">
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${badge.bg} ${badge.text}`}>
            {badge.label}
          </span>
        </div>
      </div>

      {/* RIGHT SIDE: Action Buttons */}
      <div className="flex flex-col gap-2 justify-center items-end min-w-max">
        {/* Pending Tab: Approve & Reject */}
        {activeTab === 'pendings' && (
          <>
            <button
              type="button"
              onClick={() => setPendingAction('approve')}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-500 text-white rounded-md transition font-medium text-sm"
            >
              <FaCheckCircle />
              Approuver
            </button>
            <button
              type="button"
              onClick={() => setPendingAction('reject')}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-500 text-white rounded-md transition font-medium text-sm"
            >
              <FaTimesCircle />
              Refuser
            </button>
          </>
        )}

        {/* Active Tab: Mark as Returned */}
        {activeTab === 'active' && (
          <button
            type="button"
            onClick={() => setPendingAction('return')}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-500 text-white rounded-md transition font-medium text-sm"
          >
            <FaUndo />
            Marquer Retourné
          </button>
        )}

        {/* History Tab: View Only */}
        {activeTab === 'history' && (
          <span className={`text-xs px-2 py-1 ${
            isDarkMode ? 'text-slate-500' : 'text-gray-500'
          }`}>
            {loan.status === 'rejected' && `Rejeté`}
            {loan.status === 'cancelled' && `Annulé`}
            {loan.status === 'returned' && `Retourné`}
          </span>
        )}
      </div>

      {/* Approve confirmation */}
      <ConfirmationModal
        isOpen={pendingAction === 'approve'}
        title="Approuver cette demande ?"
        message="Le livre sera marqué comme emprunté et l'étudiant sera notifié."
        itemName={loan.book?.title}
        onConfirm={confirmApprove}
        onCancel={closeDialog}
        isLoading={isLoading}
        confirmText="Approuver"
        cancelText="Annuler"
        isDangerous={false}
      />

      {/* Return confirmation */}
      <ConfirmationModal
        isOpen={pendingAction === 'return'}
        title="Marquer ce prêt comme retourné ?"
        message="L'exemplaire redeviendra disponible pour d'autres emprunts."
        itemName={loan.book?.title}
        onConfirm={confirmReturn}
        onCancel={closeDialog}
        isLoading={isLoading}
        confirmText="Confirmer le retour"
        cancelText="Annuler"
        isDangerous={false}
      />

      {/* Reject confirmation (with optional reason, replaces window.prompt) */}
      <ConfirmationModal
        isOpen={pendingAction === 'reject'}
        title="Refuser cette demande ?"
        message="L'étudiant sera notifié du refus. Vous pouvez préciser un motif (optionnel)."
        itemName={loan.book?.title}
        onConfirm={confirmReject}
        onCancel={closeDialog}
        isLoading={isLoading}
        confirmText="Refuser"
        cancelText="Annuler"
        isDangerous={true}
      >
        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
          Motif du refus (optionnel)
        </label>
        <textarea
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          disabled={isLoading}
          rows={3}
          maxLength={300}
          placeholder="Ex : livre déjà réservé pour un autre usage pédagogique..."
          className="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
        />
      </ConfirmationModal>
    </div>
  );
};

export default LoanActionCard;
