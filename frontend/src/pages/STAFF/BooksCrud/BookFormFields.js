import { useState, useEffect } from "react";
import bookService from "../../../services/bookService";

const BookFormFields = ({ 
  formData, 
  isEditMode = false, 
  onChange, 
  onAuthorsChange 
}) => {
  
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [languageOptions, setLanguageOptions] = useState([]);
  const [loadingLanguages, setLoadingLanguages] = useState(false);

  useEffect(() => {
    const fetchLanguages = async () => {
      setLoadingLanguages(true);
      try {
        const response = await bookService.getLanguages();
        // response.data = [{ code: 'fr', name: 'Français' }, ...]
        setLanguageOptions(response.data || []);
      } catch (error) {
        console.error('❌ Erreur chargement langues:', error);
      } finally {
        setLoadingLanguages(false);
      }
    };
    fetchLanguages();
  }, []);

  // ==========================================================================
  // CHARGEMENT DES CATÉGORIES
  // ==========================================================================
  useEffect(() => {
    const fetchCategories = async () => {
      setLoadingCategories(true);
      try {
        const response = await bookService.getCategories();
        setCategories(response.data || []);
      } catch (error) {
        console.error("Erreur chargement catégories:", error);
        // Fallback
        setCategories([
          "linguistique", "littérature américaine", "civilisation américaine",
          "fiction américaine", "littérature britannique", "civilisation britannique",
          "littérature africaine", "histoire africaine", "théâtre", "poésie",
          "sciences", "traduction", "général", "Non Categorized"
        ]);
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  // ==========================================================================
  // RENDU
  // ==========================================================================
  
  return (
    <div className="space-y-6">
      
      {/* Ligne 1 : Titre et Cote */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Titre */}
        <div>
          <label className="block text-gray-700 dark:text-gray-300 mb-2 font-medium">
            Titre du livre *
          </label>
          <input
            type="text"
            value={formData.title || ''}
            onChange={(e) => onChange("title", e.target.value)}
            className="w-full p-3 border rounded-lg"
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 dark:text-gray-300 mb-2 font-medium">
            Cote * <span className="text-xs text-gray-500">(Format: 04-01-1785)</span>
          </label>
          <input
            type="text"
            value={formData.cote || ''}
            onChange={(e) => {
              onChange("cote", e.target.value);
              // Parser automatiquement la cote
              const parts = e.target.value.split('-');
              if (parts.length === 3) {
                onChange("cote_info", {
                  section: parts[0],
                  category_code: parts[1],
                  id_number: parts[2]
                });
              }
            }}
            className="w-full p-3 border rounded-lg font-mono"
            placeholder="Ex: 04-01-1785"
            pattern="\d{2}-\d{2}-\d{4}"
            required
          />
        </div>
      </div>

      {/* Ligne 2 : Titre original et Auteur original */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-gray-700 dark:text-gray-300 mb-2 font-medium">
            Titre original
          </label>
          <input
            type="text"
            value={formData.title_original || ''}
            onChange={(e) => onChange("title_original", e.target.value)}
            className="w-full p-3 border rounded-lg"
            placeholder="Ex: The Little Prince"
          />
        </div>

        {/* ✅ Auteur original */}
        <div>
          <label className="block text-gray-700 dark:text-gray-300 mb-2 font-medium">
            Auteur original
          </label>
          <input
            type="text"
            value={formData.author_original || ''}
            onChange={(e) => onChange("author_original", e.target.value)}
            className="w-full p-3 border rounded-lg"
            placeholder="Ex: Antoine de Saint-Exupéry"
          />
        </div>
      </div>

      {/* Ligne 3 : ISBN et Auteurs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* ISBN */}
        <div>
          <label className="block text-gray-700 dark:text-gray-300 mb-2 font-medium">
            ISBN *
          </label>
          <input
            type="text"
            value={formData.isbn || ''}
            onChange={(e) => onChange("isbn", e.target.value)}
            className="w-full p-3 border rounded-lg"
            required
            disabled={isEditMode}
          />
          {isEditMode && (
            <p className="text-sm text-gray-500 mt-1">L'ISBN ne peut pas être modifié</p>
          )}
        </div>

        {/* Auteurs */}
        <div>
          <label className="block text-gray-700 dark:text-gray-300 mb-2 font-medium">
            Auteur(s) *
          </label>
          <input
            type="text"
            value={Array.isArray(formData.authors) ? formData.authors.join(", ") : formData.authors}
            onChange={(e) => onAuthorsChange(e.target.value)}
            className="w-full p-3 border rounded-lg"
            placeholder="Ex: J.K. Rowling, ou Auteur1, Auteur2"
            required
          />
        </div>
      </div>

      {/* Ligne 4 : Langue et Catégorie */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        <div>
          <label htmlFor="language" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Langue <span className="text-red-500">*</span>
          </label>
          <select
            id="language"
            name="language"
            value={formData.language || ''}
            onChange={(e) => onChange("language", e.target.value)}  // ✅ Correction ici
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="">Sélectionnez une langue</option>
            {languageOptions.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>
          {loadingLanguages && <p className="text-sm text-gray-500 mt-1">Chargement...</p>}
        </div>

        {/* Catégorie */}
        <div>
          <label className="block text-gray-700 dark:text-gray-300 mb-2 font-medium">
            Catégorie *
          </label>
          <select
            value={formData.category || ''}
            onChange={(e) => onChange("category", e.target.value)}
            className="w-full p-3 border rounded-lg"
            required
            disabled={loadingCategories}
          >
            <option value="">Sélectionnez une catégorie</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Ligne 5 : Éditeur et Année */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Éditeur */}
        <div>
          <label className="block text-gray-700 dark:text-gray-300 mb-2 font-medium">
            Éditeur
          </label>
          <input
            type="text"
            value={formData.publisher || ''}
            onChange={(e) => onChange("publisher", e.target.value)}
            className="w-full p-3 border rounded-lg"
          />
        </div>

        {/* Année */}
        <div>
          <label className="block text-gray-700 dark:text-gray-300 mb-2 font-medium">
            Année de publication
          </label>
          <input
            type="number"
            value={formData.publicationYear || new Date().getFullYear()}
            onChange={(e) => onChange("publicationYear", e.target.value)}
            className="w-full p-3 border rounded-lg"
            min="1000"
            max={new Date().getFullYear() + 1}
          />
        </div>
      </div>

      {/* Ligne 6 : Pages et Exemplaires */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Pages */}
        <div>
          <label className="block text-gray-700 dark:text-gray-300 mb-2 font-medium">
            Nombre de pages
          </label>
          <input
            type="number"
            value={formData.pages || 0}
            onChange={(e) => onChange("pages", e.target.value)}
            className="w-full p-3 border rounded-lg"
            min="1"
          />
        </div>

        {/* ✅ Total exemplaires */}
        <div>
          <label className="block text-gray-700 dark:text-gray-300 mb-2 font-medium">
            Total exemplaires *
          </label>
          <input
            type="number"
            value={formData.totalCopies || 1}
            onChange={(e) => {
              const total = parseInt(e.target.value) || 1;
              onChange("totalCopies", total);
              // S'assurer que availableCopies ≤ total
              if (formData.availableCopies > total) {
                onChange("availableCopies", total);
              }
            }}
            className="w-full p-3 border rounded-lg"
            min="1"
            required
          />
        </div>

        {/* Exemplaires disponibles */}
        <div>
          <label className="block text-gray-700 dark:text-gray-300 mb-2 font-medium">
            Exemplaires disponibles *
          </label>
          <input
            type="number"
            value={formData.availableCopies || 1}
            onChange={(e) => {
              const available = parseInt(e.target.value) || 0;
              onChange("availableCopies", available);
              onChange("isAvailable", available > 0);
            }}
            className="w-full p-3 border rounded-lg"
            min="0"
            max={formData.totalCopies || 1}
            required
          />
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-gray-700 dark:text-gray-300 mb-2 font-medium">
          Description
        </label>
        <textarea
          value={formData.description || ''}
          onChange={(e) => onChange("description", e.target.value)}
          className="w-full p-3 border rounded-lg resize-none"
          rows="4"
        />
      </div>

      {/* Image */}
      <div>
        <label className="block text-gray-700 dark:text-gray-300 mb-2 font-medium">
          Image de couverture (URL)
        </label>
        <input
          type="text"
          value={formData.coverImage || ''}
          onChange={(e) => onChange("coverImage", e.target.value)}
          className="w-full p-3 border rounded-lg"
          placeholder="https://..."
        />
      </div>
    </div>
  );
};

export default BookFormFields;