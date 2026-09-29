// ============================================================================
// COMPOSANT : BookForm (AVEC VALIDATION)
// ============================================================================
// Formulaire d'ajout et modification de livre
// Utilise le hook useBookForm pour la logique
// ============================================================================

import { FaPlus, FaSave, FaTimes } from "react-icons/fa";
import { useBookForm } from "./hooks/useBookForm";
import BookFormFields from "./BookFormFields";
import { useState } from "react";

const BookForm = ({ 
  onSubmit, 
  onCancel, 
  initialData = null,
  mode = "add" // "add" ou "edit"
}) => {
  // ==========================================================================
  // ÉTATS
  // ==========================================================================
  
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  
  // ==========================================================================
  // HOOK DU FORMULAIRE
  // ==========================================================================
  
  const { 
    formData, 
    prepareBookData, 
    handleChange, 
    handleAuthorsChange,
    validateForm,
    resetForm 
  } = useBookForm(initialData);
  
  // ==========================================================================
  // CONFIGURATION
  // ==========================================================================
  
  const isEditMode = mode === "edit";
  const title = isEditMode ? "Modifier le Livre" : "Ajouter un Nouveau Livre";
  const buttonText = isEditMode ? "Modifier le Livre" : "Ajouter le Livre";
  const buttonIcon = isEditMode ? <FaSave /> : <FaPlus />;

  // ==========================================================================
  // HANDLERS
  // ==========================================================================

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    // Valider le formulaire
    if (!validateForm()) {
      return;
    }
    
    setSubmitting(true);
    
    try {
      const bookData = prepareBookData();
      console.log("📦 Données préparées pour envoi:", bookData);
      
      await onSubmit(bookData);
      
      // Réinitialiser si c'est un ajout réussi
      if (mode === "add") {
        resetForm();
      }
    } catch (err) {
      console.error("❌ Erreur soumission:", err);
      setError(err.response?.data?.message || "Erreur lors de l'enregistrement");
    } finally {
      setSubmitting(false);
    }
  };

  // ==========================================================================
  // RENDU
  // ==========================================================================
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 md:p-8 transition-colors duration-300">
      <div className="max-w-4xl mx-auto">
        
        {/* En-tête */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
            {isEditMode ? "✏️" : "📖"} {title}
          </h1>
          <button
            onClick={onCancel}
            className="flex items-center justify-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-semibold transition-colors px-4 py-2 border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20"
            disabled={submitting}
          >
            <FaTimes />
            Retour à la liste
          </button>
        </div>

        {/* Message d'erreur */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 rounded-lg">
            ❌ {error}
          </div>
        )}

        {/* Carte du formulaire */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 sm:p-6 md:p-8 transition-colors duration-300">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Champs du formulaire */}
            <BookFormFields 
              formData={formData}
              isEditMode={isEditMode}
              onChange={handleChange}
              onAuthorsChange={handleAuthorsChange}
            />

            {/* Boutons d'action */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
              
              {/* Bouton principal */}
              <button
                type="submit"
                disabled={submitting}
                className={`flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors ${
                  submitting ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {submitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Enregistrement...
                  </>
                ) : (
                  <>
                    {buttonIcon} {buttonText}
                  </>
                )}
              </button>
              
              {/* Bouton annuler */}
              <button
                type="button"
                onClick={onCancel}
                disabled={submitting}
                className="flex-1 bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 py-3 px-6 rounded-lg font-semibold transition-colors disabled:opacity-50"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BookForm;