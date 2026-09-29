// ============================================================================
// HOOK PERSONNALISÉ : useBookForm (AVEC NOUVEAUX CHAMPS) - CORRIGÉ
// ============================================================================
// Gère l'état et la logique du formulaire de livre
// Réutilisable pour l'ajout ET la modification
// ============================================================================

import { useState, useEffect } from "react";

export const useBookForm = (initialData = null) => {
  // ==========================================================================
  // ÉTAT DU FORMULAIRE - AVEC TOUS LES NOUVEAUX CHAMPS
  // ==========================================================================
  
  const [formData, setFormData] = useState({
    // Champs existants
    title: initialData?.title || "",
    isbn: initialData?.isbn || "",
    // CORRECTION : langue par défaut = code 'fr' au lieu du libellé 'Français'
    language: initialData?.language || "fr",
    description: initialData?.description || "",
    coverImage: initialData?.coverImage || "",
    authors: initialData?.authors || [],
    category: initialData?.category || "",
    publisher: initialData?.publisher || "",
    publicationYear: initialData?.publicationYear || new Date().getFullYear(),
    pages: initialData?.pages || 0,
    availableCopies: initialData?.availableCopies || 1,
    isAvailable: initialData?.isAvailable ?? true,
    
    // ✅ NOUVEAUX CHAMPS
    cote: initialData?.cote || "",
    cote_info: initialData?.cote_info || {
      section: "",
      category_code: "",
      id_number: ""
    },
    title_original: initialData?.title_original || "",
    author_original: initialData?.author_original || "",
    totalCopies: initialData?.totalCopies || initialData?.availableCopies || 1,
    enriched: initialData?.enriched || false,
    enrichedAt: initialData?.enrichedAt || null,
  });

  // ==========================================================================
  // EFFET : Générer cote_info automatiquement quand la cote change
  // ==========================================================================
  
  useEffect(() => {
    if (formData.cote) {
      const parts = formData.cote.split('-');
      if (parts.length === 3) {
        setFormData(prev => ({
          ...prev,
          cote_info: {
            section: parts[0],
            category_code: parts[1],
            id_number: parts[2]
          }
        }));
      }
    }
  }, [formData.cote]);

  // ==========================================================================
  // EFFET : Mettre à jour isAvailable quand availableCopies change
  // ==========================================================================
  
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      isAvailable: prev.availableCopies > 0
    }));
  }, [formData.availableCopies]);

  // ==========================================================================
  // EFFET : S'assurer que availableCopies ≤ totalCopies
  // ==========================================================================
  
  useEffect(() => {
    if (formData.availableCopies > formData.totalCopies) {
      setFormData(prev => ({
        ...prev,
        availableCopies: prev.totalCopies
      }));
    }
  }, [formData.totalCopies, formData.availableCopies]);

  // ==========================================================================
  // FONCTIONS DE GESTION DU FORMULAIRE
  // ==========================================================================

  /**
   * Met à jour un champ spécifique du formulaire
   * @param {string} field - Nom du champ
   * @param {any} value - Nouvelle valeur
   */
  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  /**
   * Traite les auteurs (conversion string → tableau)
   * @param {string} authorsString - Chaîne d'auteurs séparés par des virgules
   */
  const handleAuthorsChange = (authorsString) => {
    const authorsArray = authorsString
      .split(",")
      .map(author => author.trim())
      .filter(author => author.length > 0);
    
    setFormData(prev => ({
      ...prev,
      authors: authorsArray
    }));
  };

  /**
   * Prépare les données pour l'envoi à l'API
   * @returns {Object} - Données formatées avec tous les champs
   */
  const prepareBookData = () => {
    // S'assurer que cote_info est à jour
    let cote_info = formData.cote_info;
    if (formData.cote && !formData.cote_info.section) {
      const parts = formData.cote.split('-');
      if (parts.length === 3) {
        cote_info = {
          section: parts[0],
          category_code: parts[1],
          id_number: parts[2]
        };
      }
    }

    return {
      // Champs existants
      title: formData.title.trim(),
      isbn: formData.isbn.trim(),
      language: formData.language,  // c'est maintenant un code (ex: 'fr')
      description: formData.description.trim(),
      coverImage: formData.coverImage || "default-book-cover.jpg",
      authors: Array.isArray(formData.authors) ? formData.authors : [formData.authors],
      category: formData.category,
      publisher: formData.publisher.trim(),
      publicationYear: parseInt(formData.publicationYear) || new Date().getFullYear(),
      pages: parseInt(formData.pages) || 0,
      availableCopies: parseInt(formData.availableCopies) || 1,
      isAvailable: formData.availableCopies > 0,
      // Nouveaux champs
      cote: formData.cote.trim(),
      cote_info: cote_info,
      title_original: formData.title_original?.trim() || "",
      author_original: formData.author_original?.trim() || "",
      totalCopies: parseInt(formData.totalCopies) || parseInt(formData.availableCopies) || 1,
      enriched: formData.enriched,
      enrichedAt: formData.enriched ? (formData.enrichedAt || new Date().toISOString()) : null,
    };
  };

  /**
   * Réinitialise le formulaire
   */
  const resetForm = () => {
    setFormData({
      // Champs existants
      title: "",
      isbn: "",
      language: "fr", // valeur par défaut en code
      description: "",
      coverImage: "",
      authors: [],
      category: "",
      publisher: "",
      publicationYear: new Date().getFullYear(),
      pages: 0,
      availableCopies: 1,
      isAvailable: true,
      
      // ✅ NOUVEAUX CHAMPS
      cote: "",
      cote_info: { section: "", category_code: "", id_number: "" },
      title_original: "",
      author_original: "",
      totalCopies: 1,
      enriched: false,
      enrichedAt: null,
    });
  };

  /**
   * Valide le formulaire avant soumission
   * @returns {boolean} - True si valide, false sinon
   */
  const validateForm = () => {
    // Vérifier les champs obligatoires
    if (!formData.title.trim()) {
      alert("Le titre est obligatoire");
      return false;
    }
    
    if (!formData.isbn.trim()) {
      alert("L'ISBN est obligatoire");
      return false;
    }
    
    if (!formData.cote.trim()) {
      alert("La cote est obligatoire");
      return false;
    }
    
    // Valider le format de la cote (XX-YY-ZZZZ)
    const coteRegex = /^\d{2}-\d{2}-\d{4}$/;
    if (!coteRegex.test(formData.cote)) {
      alert("La cote doit être au format: 04-01-1785 (2 chiffres - 2 chiffres - 4 chiffres)");
      return false;
    }
    
    if (!formData.category) {
      alert("La catégorie est obligatoire");
      return false;
    }
    
    if (formData.authors.length === 0) {
      alert("Au moins un auteur est requis");
      return false;
    }
    
    return true;
  };

  // ==========================================================================
  // RETOUR
  // ==========================================================================

  return {
    // Données
    formData,
    
    // Actions
    handleChange,
    handleAuthorsChange,
    prepareBookData,
    resetForm,
    setFormData,
    validateForm,
  };
};