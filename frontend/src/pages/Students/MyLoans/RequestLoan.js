import { useState } from "react";
import { toast } from "react-toastify";
import loanService from "../../../services/loanService";
import { FaCalendarAlt, FaTimes, FaPaperPlane } from "react-icons/fa";

// RequestLoan component - Fully Responsive
// Props:
// - bookId: id of the book to request
// - onSuccess: optional callback called after a successful request (used to refresh lists)
// - onClose: optional callback to close a modal containing this form
const RequestLoan = ({ bookId, onSuccess = () => {}, onClose = () => {} }) => {
	const [loanPeriod, setLoanPeriod] = useState(30);
	const [loading, setLoading] = useState(false);

	// Calculate due date for display
	const calculateDueDate = () => {
		const dueDate = new Date();
		dueDate.setDate(dueDate.getDate() + Number(loanPeriod));
		return dueDate.toLocaleDateString('fr-FR', {
			day: 'numeric',
			month: 'short',
			year: 'numeric'
		});
	};

	// When the form is submitted we call the loanService.requestLoan API.
	// On success we notify the parent via onSuccess so it can refresh local state.
	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!bookId) return toast.error("Identifiant du livre manquant");

		setLoading(true);
		try {
			await loanService.requestLoan(bookId, Number(loanPeriod));
			toast.success("✅ Demande de prêt envoyée");
			onSuccess();
			onClose();
		} catch (err) {
			console.error("Request loan error:", err);
			toast.error(err.response?.data?.message || "Erreur lors de la demande de prêt");
		} finally {
			setLoading(false);
		}
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 md:space-y-6">
			{/* Loan Period Selection - Responsive */}
			<div className="space-y-2 sm:space-y-3">
				<label className="block text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300">
					Durée du prêt
				</label>
				
				{/* Mobile Layout (< sm) */}
				<div className="sm:hidden space-y-3">
					<div className="flex items-center gap-3">
						<FaCalendarAlt className="text-blue-500 text-lg flex-shrink-0" />
						<select
							value={loanPeriod}
							onChange={(e) => setLoanPeriod(e.target.value)}
							className="flex-1 p-3 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
							disabled={loading}
						>
							<option value="7">7 jours (express)</option>
							<option value="15">15 jours (standard)</option>
							<option value="30">30 jours (étudiant)</option>
							<option value="60">60 jours (thèse/recherche)</option>
						</select>
					</div>
					
					{/* Due date preview - Mobile */}
					<div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
						<p className="text-xs text-gray-500 dark:text-gray-400">Date de retour estimée</p>
						<p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
							{calculateDueDate()}
						</p>
					</div>
				</div>

				{/* Desktop Layout (sm+) */}
				<div className="hidden sm:flex sm:items-center sm:gap-4">
					<div className="flex-1">
						<div className="flex items-center gap-3">
							<FaCalendarAlt className="text-blue-500 text-lg flex-shrink-0" />
							<select
								value={loanPeriod}
								onChange={(e) => setLoanPeriod(e.target.value)}
								className="w-40 p-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
								disabled={loading}
							>
								<option value="7">7 jours</option>
								<option value="15">15 jours</option>
								<option value="30">30 jours</option>
								<option value="60">60 jours</option>
							</select>
							<span className="text-sm text-gray-500 dark:text-gray-400">jours</span>
						</div>
					</div>
					
					{/* Due date preview - Desktop */}
					<div className="text-right">
						<p className="text-xs text-gray-500 dark:text-gray-400">Retour estimé</p>
						<p className="text-sm font-medium text-gray-800 dark:text-gray-200">
							{calculateDueDate()}
						</p>
					</div>
				</div>
			</div>

			{/* Additional Information - Responsive */}
			<div className="p-3 sm:p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
				<p className="text-xs sm:text-sm text-yellow-800 dark:text-yellow-300">
					<strong className="font-semibold">ℹ️ Important :</strong> Votre demande sera examinée par le personnel. 
					<span className="hidden xs:inline"> Vous recevrez une notification une fois traitée.</span>
				</p>
			</div>

			{/* Action Buttons - Responsive */}
			<div className="flex flex-col-reverse xs:flex-row xs:justify-end gap-2 xs:gap-3 pt-2 sm:pt-3">
				{/* Cancel Button */}
				<button
					type="button"
					onClick={onClose}
					disabled={loading}
					className="w-full xs:w-auto px-4 sm:px-5 py-2.5 sm:py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm sm:text-base font-medium disabled:opacity-50 flex items-center justify-center gap-2"
				>
					<FaTimes className="text-xs sm:text-sm" />
					<span>Annuler</span>
				</button>
				
				{/* Submit Button */}
				<button
					type="submit"
					disabled={loading}
					className="w-full xs:w-auto px-4 sm:px-6 py-2.5 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base font-medium disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
				>
					{loading ? (
						<>
							<div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
							<span>Envoi en cours...</span>
						</>
					) : (
						<>
							<FaPaperPlane className="text-xs sm:text-sm" />
							<span>Demander le prêt</span>
						</>
					)}
				</button>
			</div>

			{/* Mobile Helper Text */}
			<p className="text-2xs xs:text-xs text-center text-gray-500 dark:text-gray-400 sm:hidden">
				Vous recevrez une confirmation par notification
			</p>
		</form>
	);
};

export default RequestLoan;