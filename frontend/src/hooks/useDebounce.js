// hooks/useDebounce.js
import { useState, useEffect } from 'react';

/**
 * Hook personnalisé pour "debouncer" une valeur
 * Utile pour éviter trop d'appels API pendant la frappe
 * 
 * @param {any} value - La valeur à debouncer
 * @param {number} delay - Délai en ms (défaut: 500)
 * @returns {any} La valeur après le délai
 * 
 * @example
 * const debouncedSearch = useDebounce(searchTerm, 500);
 * useEffect(() => {
 *   if (debouncedSearch) {
 *     // Appel API seulement après 500ms sans frappe
 *   }
 * }, [debouncedSearch]);
 */
export const useDebounce = (value, delay = 500) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Créer un timer qui met à jour la valeur après le délai
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Nettoyer le timer si la valeur change avant la fin du délai
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};