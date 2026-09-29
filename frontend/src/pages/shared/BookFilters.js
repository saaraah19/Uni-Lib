// ============================================================================
// COMPOSANT : BookFilters (Avec Nouveaux Filtres)
// ============================================================================

import { FaSearch, FaFilter, FaTimes } from "react-icons/fa";
import { useState, useEffect } from "react";
import bookService from "../../services/bookService";

const BookFilters = ({
  // Recherche texte
  searchTerm,
  setSearchTerm,

  // Filtres existants
  selectedCategory,
  setSelectedCategory,

  // NOUVEAUX FILTRES
  author,
  setAuthor,
  cote,
  setCote,
  yearFrom,
  setYearFrom,
  yearTo,
  setYearTo,
  isAvailable,
  setIsAvailable,

  // FILTRE LANGUE
  selectedLanguages,
  setSelectedLanguages,
  //enriched,
  // setEnriched,

  // Tri
  sortBy,
  setSortBy,
  order,
  setOrder,

  // Reset
  onReset,
}) => {
  // ==========================================================================
  // ÉTATS
  // ==========================================================================

  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  // langues fixes au lieu d'appeler l'API
  const languages = [
    { code: "fr", name: "Français" },
    { code: "en", name: "English" },
    { code: "es", name: "Español" },
  ];

  // ==========================================================================
  // CHARGEMENT DES CATÉGORIES DEPUIS L'API
  // ==========================================================================

  useEffect(() => {
    const fetchCategories = async () => {
      setLoadingCategories(true);
      try {
        const response = await bookService.getCategories();
        // response.data contient le tableau des catégories
        const categoriesList = response.data || [];
        setCategories(categoriesList);
      } catch (error) {
        console.error("❌ Erreur chargement catégories:", error);
        // Fallback: utiliser les catégories par défaut
        setCategories([
          "linguistique",
          "littérature américaine",
          "civilisation américaine",
          "fiction américaine",
          "littérature britannique",
          "civilisation britannique",
          "littérature africaine",
          "histoire africaine",
          "théâtre",
          "poésie",
          "sciences",
          "traduction",
          "général",
          "Non Categorized",
        ]);
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  // ==========================================================================
  // OPTIONS DE TRI
  // ==========================================================================

  const sortOptions = [
    { value: "title", label: "Titre" },
    { value: "year", label: "Année" },
    { value: "recent", label: "Plus récent" },
    { value: "author", label: "Auteur" },
    { value: "cote", label: "Cote" },
  ];

  // ==========================================================================
  // FONCTION POUR GÉRER LA SÉLECTION MULTIPLE DE LANGUES
  // ==========================================================================

  const toggleLanguage = (languageCode) => {
    console.log(
      "🎯 toggleLanguage appelé avec",
      languageCode,
      "current selectedLanguages:",
      selectedLanguages,
    );
    setSelectedLanguages((prev) => {
      console.log("📦 prev reçu:", prev);
      // S'assurer que prev est un tableau
      const currentLanguages = Array.isArray(prev) ? prev : [];
      console.log("✅ currentLanguages après sécurisation:", currentLanguages);

      if (currentLanguages.includes(languageCode)) {
        return currentLanguages.filter((lang) => lang !== languageCode);
      } else {
        return [...currentLanguages, languageCode];
      }
    });
  };

  // ==========================================================================
  // RENDU
  // ==========================================================================

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md dark:shadow-lg p-4 sm:p-6 mb-4 sm:mb-6 md:mb-8 transition-colors duration-300">
      {/* ================================================== */}
      {/* MOBILE LAYOUT (< md) */}
      {/* ================================================== */}
      <div className="md:hidden space-y-3">
        {/* Barre de recherche principale */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaSearch className="text-gray-400 dark:text-gray-500 text-sm" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-8 p-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Rechercher par titre, auteur..."
            aria-label="Rechercher un livre"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              aria-label="Effacer la recherche"
            >
              <FaTimes className="text-gray-400 dark:text-gray-500 hover:text-gray-600 text-sm" />
            </button>
          )}
        </div>

        {/* Bouton d'ouverture des filtres */}
        <button
          onClick={() => setShowMobileFilters(!showMobileFilters)}
          className="w-full flex items-center justify-between p-2.5 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-700 dark:text-gray-300 text-sm"
        >
          <span className="flex items-center gap-2">
            <FaFilter className="text-blue-500" />
            Filtres avancés
          </span>
          <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded-full">
            {[
              selectedCategory !== "all" ? 1 : 0,
              author ? 1 : 0,
              cote ? 1 : 0,
              yearFrom || yearTo ? 1 : 0,
              isAvailable ? 1 : 0,
              Array.isArray(selectedLanguages) && selectedLanguages.length > 0
                ? 1
                : 0,
            ].reduce((a, b) => a + b, 0)}{" "}
            actifs
          </span>
        </button>

        {/* Panneau des filtres mobile */}
        {showMobileFilters && (
          <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            {/* Filtre par auteur */}
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                Auteur
              </label>
              <input
                type="text"
                value={author || ""}
                onChange={(e) => setAuthor(e.target.value)}
                className="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                placeholder="Nom de l'auteur..."
              />
            </div>

            {/* Filtre par cote */}
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                Cote
              </label>
              <input
                type="text"
                value={cote || ""}
                onChange={(e) => setCote(e.target.value)}
                className="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 font-mono"
                placeholder="04-01-1785"
              />
            </div>

            {/* Filtre par catégorie */}
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                Catégorie
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                disabled={loadingCategories}
              >
                <option value="all">Toutes les catégories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Filtre par langue */}
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-2">
                Langue
              </label>
              <div className="space-y-2">
                {languages.map((lang) => (
                  <label
                    key={lang.code}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={
                        Array.isArray(selectedLanguages) &&
                        selectedLanguages.includes(lang.code)
                      }
                      onChange={() => toggleLanguage(lang.code)}
                      className="w-4 h-4 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {lang.name}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Filtre par année */}
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                Année de publication
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={yearFrom || ""}
                  onChange={(e) => setYearFrom(e.target.value)}
                  className="w-1/2 p-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                  placeholder="De"
                  min="1000"
                  max={new Date().getFullYear()}
                />
                <input
                  type="number"
                  value={yearTo || ""}
                  onChange={(e) => setYearTo(e.target.value)}
                  className="w-1/2 p-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                  placeholder="À"
                  min="1000"
                  max={new Date().getFullYear()}
                />
              </div>
            </div>

            {/* Options de tri */}
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                Trier par
              </label>
              <div className="flex gap-2">
                <select
                  value={sortBy || "title"}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="flex-1 p-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                >
                  {sortOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <select
                  value={order || "asc"}
                  onChange={(e) => setOrder(e.target.value)}
                  className="w-24 p-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                >
                  <option value="asc">Croissant</option>
                  <option value="desc">Décroissant</option>
                </select>
              </div>
            </div>

            {/* Bouton reset */}
            <button
              onClick={() => {
                onReset();
                setShowMobileFilters(false);
              }}
              className="w-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 py-2.5 px-4 rounded-lg font-medium text-sm hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
            >
              <FaTimes className="text-xs" />
              Réinitialiser tous les filtres
            </button>
          </div>
        )}
      </div>

      {/* ================================================== */}
      {/* DESKTOP LAYOUT (md+) */}
      {/* ================================================== */}
      <div className="hidden md:block space-y-4">
        {/* Première ligne : Recherche principale */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaSearch className="text-gray-400 dark:text-gray-500" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Rechercher par titre, auteur, ISBN..."
            aria-label="Rechercher un livre"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              aria-label="Effacer la recherche"
            >
              <FaTimes className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 transition-colors" />
            </button>
          )}
        </div>

        {/* Deuxième ligne : Grille de filtres */}
        <div className="grid grid-cols-5 gap-4">
          {/* Filtre par auteur */}
          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
              Auteur
            </label>
            <input
              type="text"
              value={author || ""}
              onChange={(e) => setAuthor(e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
              placeholder="Nom de l'auteur..."
            />
          </div>

          {/* Filtre par cote */}
          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
              Cote
            </label>
            <input
              type="text"
              value={cote || ""}
              onChange={(e) => setCote(e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 font-mono"
              placeholder="04-01-1785"
            />
          </div>

          {/* Filtre par catégorie */}
          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
              Catégorie
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
              disabled={loadingCategories}
            >
              <option value="all">Toutes les catégories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Filtre par langue - Dropdown avec checkboxes */}
          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
              Langue
            </label>
            <div className="relative">
              <details className="w-full">
                <summary className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">
                      {!Array.isArray(selectedLanguages) ||
                      selectedLanguages.length === 0
                        ? "Toutes les langues"
                        : `${selectedLanguages.length} sélectionnée(s)`}
                    </span>
                    <span className="text-xs">▼</span>
                  </div>
                </summary>
                <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-10 p-2">
                  {languages.map((lang) => (
                    <label
                      key={lang.code}
                      className="flex items-center gap-2 p-1.5 hover:bg-gray-100 dark:hover:bg-gray-600 rounded cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={
                          Array.isArray(selectedLanguages) &&
                          selectedLanguages.includes(lang.code)
                        }
                        onChange={() => toggleLanguage(lang.code)}
                        className="w-3.5 h-3.5 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {lang.name}
                      </span>
                    </label>
                  ))}
                </div>
              </details>
            </div>
          </div>

          {/* Filtre par année */}
          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
              Année
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                value={yearFrom || ""}
                onChange={(e) => setYearFrom(e.target.value)}
                className="w-1/2 p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                placeholder="De"
              />
              <input
                type="number"
                value={yearTo || ""}
                onChange={(e) => setYearTo(e.target.value)}
                className="w-1/2 p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                placeholder="À"
              />
            </div>
          </div>
        </div>

        {/* Troisième ligne : Filtres checkbox et tri */}
        <div className="flex justify-between items-center">
          {/* Tri */}
          <div className="flex gap-2">
            <select
              value={sortBy || "title"}
              onChange={(e) => setSortBy(e.target.value)}
              className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
            >
              {sortOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  Trier par: {opt.label}
                </option>
              ))}
            </select>
            <select
              value={order || "asc"}
              onChange={(e) => setOrder(e.target.value)}
              className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
            >
              <option value="asc">↑ Croissant</option>
              <option value="desc">↓ Décroissant</option>
            </select>
          </div>
        </div>

        {/* Bouton reset global */}
        <div className="flex justify-end pt-2">
          <button
            onClick={onReset}
            className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 py-2 px-4 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center gap-2 text-sm"
          >
            <FaTimes />
            Réinitialiser tous les filtres
          </button>
        </div>
      </div>

      {/* ================================================== */}
      {/* FILTRES ACTIFS - Badges */}
      {/* ================================================== */}
      {(searchTerm ||
        author ||
        cote ||
        selectedCategory !== "all" ||
        yearFrom ||
        yearTo ||
        isAvailable ||
        (Array.isArray(selectedLanguages) && selectedLanguages.length > 0)) && (
        <div className="mt-3 sm:mt-4 flex flex-wrap gap-1.5 sm:gap-2">
          {searchTerm && (
            <span className="inline-flex items-center bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm">
              Recherche: "
              {searchTerm.length > 20
                ? searchTerm.substring(0, 20) + "..."
                : searchTerm}
              "
              <button
                onClick={() => setSearchTerm("")}
                className="ml-1 hover:text-blue-600"
              >
                <FaTimes className="text-xs" />
              </button>
            </span>
          )}

          {author && (
            <span className="inline-flex items-center bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm">
              Auteur: {author}
              <button
                onClick={() => setAuthor("")}
                className="ml-1 hover:text-purple-600"
              >
                <FaTimes className="text-xs" />
              </button>
            </span>
          )}

          {cote && (
            <span className="inline-flex items-center bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-mono">
              Cote: {cote}
              <button
                onClick={() => setCote("")}
                className="ml-1 hover:text-green-600"
              >
                <FaTimes className="text-xs" />
              </button>
            </span>
          )}

          {selectedCategory !== "all" && (
            <span className="inline-flex items-center bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm">
              Catégorie: {selectedCategory}
              <button
                onClick={() => setSelectedCategory("all")}
                className="ml-1 hover:text-orange-600"
              >
                <FaTimes className="text-xs" />
              </button>
            </span>
          )}

          {(yearFrom || yearTo) && (
            <span className="inline-flex items-center bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm">
              Année: {yearFrom || "..."} - {yearTo || "..."}
              <button
                onClick={() => {
                  setYearFrom("");
                  setYearTo("");
                }}
                className="ml-1 hover:text-yellow-600"
              >
                <FaTimes className="text-xs" />
              </button>
            </span>
          )}

          {isAvailable && (
            <span className="inline-flex items-center bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm">
              Disponible uniquement
              <button
                onClick={() => setIsAvailable("")}
                className="ml-1 hover:text-green-600"
              >
                <FaTimes className="text-xs" />
              </button>
            </span>
          )}

          {Array.isArray(selectedLanguages) && selectedLanguages.length > 0 && (
            <span className="inline-flex items-center bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm">
              Langue:{" "}
              {(Array.isArray(selectedLanguages)
                ? selectedLanguages
                : selectedLanguages
                  ? [selectedLanguages]
                  : []
              )
                .map((code) => {
                  const lang = languages.find((l) => l.code === code);
                  return lang ? lang.name : code;
                })
                .join(", ")}
              <button
                onClick={() => setSelectedLanguages([])}
                className="ml-1 hover:text-indigo-600"
              >
                <FaTimes className="text-xs" />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default BookFilters;
