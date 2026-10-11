import axios from 'axios';
// P2 FIX: unguarded console.log/console.error calls replaced with the
// shared logger utility (frontend/src/utils/logger.js). This file sits at
// frontend/src/services/api.js (1 level under src), so the logger import
// path below is "../utils/logger".
import { logger } from '../utils/logger';
// COLD START: the warm-up module owns the API base URL and the "is the
// (sleeping) Render backend awake yet?" state. See services/serverWarmup.js.
import {
    API_BASE_URL,
    waitUntilServerReady,
    noteServerAlive,
    markServerAsleep,
    retryWarmup,
} from './serverWarmup';

/**
 * CONFIGURATION AXIOS - Instance personnalisée
 * 
 * Pourquoi créer une instance ?
 * - Centraliser la configuration de base (URL, timeout, headers)
 * - Réutiliser la même configuration dans toute l'application
 * - Ajouter des intercepteurs spécifiques
 */
const api = axios.create({
    // URL de base - Tous les chemins relatifs partiront de là
    // Exemple: api.get('/users') → http://localhost:5000/api/users
 baseURL: API_BASE_URL,
    
    // TIMEOUT : Durée maximale d'attente d'une réponse
    // 10000 ms = 10 secondes
    // Si le serveur ne répond pas dans ce délai → erreur ECONNABORTED
    // Évite que l'utilisateur attende indéfiniment
    timeout: 10000,
    
    // Headers par défaut pour toutes les requêtes
    headers: {
        'Content-Type': 'application/json', // On envoie du JSON
    },
});

// If a token already exists in localStorage (page reload), set default Authorization header
try {
    const existingToken = localStorage.getItem('token');
    if (existingToken) {
        api.defaults.headers.common['Authorization'] = 'Bearer ' + existingToken;
    }
} catch (e) {
    // ignore if localStorage isn't available
}

/**
 * INTERCEPTEUR REQUÊTE (REQUEST INTERCEPTOR)
 * S'exécute AVANT que la requête ne soit envoyée
 * 
 * Utilité :
 * - Ajouter automatiquement le token JWT à chaque requête
 * - Logger les requêtes (debug)
 * - Modifier la config avant envoi
 */
api.interceptors.request.use(
    // Fonction de succès - reçoit la config axios
    async (config) => {
        // COLD START: hold every request until the backend has answered a
        // health check. Resolves instantly once the server is known to be
        // up, so this costs nothing in normal use. The axios timeout only
        // starts counting after this await, so waiting for a cold start
        // does not cause spurious timeouts.
        await waitUntilServerReady();

        // Récupère le token depuis le localStorage
        // localStorage persiste même après fermeture du navigateur
        const token = localStorage.getItem('token'); // Clé 'token' à définir au login

        // If token exists ensure Authorization header is set in a consistent way
        if (token) {
            // Use bracket notation to avoid issues with minifiers and ensure header key casing
            config.headers['Authorization'] = 'Bearer ' + token;
        }
        
        // Important: TOUJOURS retourner la config modifiée
        return config;
    },
    
    // Fonction d'erreur - si la config elle-même échoue (rare)
    (error) => {
        // Propager l'erreur pour qu'elle soit attrapée plus tard
        return Promise.reject(error);
    }
);

/**
 * INTERCEPTEUR RÉPONSE (RESPONSE INTERCEPTOR)
 * S'exécute APRÈS avoir reçu la réponse
 * 
 * Utilité :
 * - Gestion centralisée des erreurs
 * - Transformation des données
 * - Déconnexion automatique si token invalide
 */
api.interceptors.response.use(
    // Fonction de succès - la requête a réussi
    (response) => {
        // Any successful answer proves the server is awake.
        noteServerAlive();
        // On retourne simplement la réponse sans modification
        // On pourrait ajouter un traitement ici (logging, transformation...)
        return response;
    },
    
    // Fonction d'erreur - la requête a échoué
    async (error) => {
        // COLD START: the server may have gone back to sleep mid-session
        // (free tier sleeps after ~15 min idle). Symptoms: no response at
        // all (timeout / network error) or a gateway error from the proxy.
        const config = error.config;
        const status = error.response?.status;
        const looksAsleep = error.response
            ? [502, 503, 504].includes(status)
            : error.code === 'ECONNABORTED' || error.code === 'ERR_NETWORK';

        if (looksAsleep && config) {
            markServerAsleep();
            const method = (config.method || 'get').toLowerCase();
            // Only GET/HEAD are replayed automatically. Replaying a POST/PUT/
            // DELETE after a timeout could run the action twice (the first
            // attempt may have succeeded). For those, we just re-wake the
            // server in the background so the user's manual retry works.
            if (['get', 'head'].includes(method) && !config.__wakeRetried) {
                config.__wakeRetried = true;
                const awake = await retryWarmup();
                if (awake) return api(config);
            } else {
                retryWarmup();
            }
        }

        // error.response existe seulement si le serveur a répondu
        // Si error.response est undefined → problème réseau ou timeout
        
        // Vérifie si c'est une erreur 401 (Non autorisé)
        // Optional chaining (?.) évite l'erreur si error.response est null
        if (error.response?.status === 401) {

            // 401 = Unauthorized - Token expiré, invalide ou absent
            // Only redirect to login if we're not already on the login page
            //
            // KNOWN GAP (flagged, not fixed in this pass — out of scope for
            // the console.log sweep): this auto-logout block is commented
            // out below, so a 401 currently does NOT clear the stale
            // token/user or redirect to /login. This was already noted as
            // a bug to revisit in a dedicated session, since re-enabling it
            // is a user-facing behavior change (auto-logout-on-401) that
            // deserves its own review rather than being silently turned
            // back on as a side effect of a logging cleanup.
            try {
                const pathname = window.location.pathname || '';
                if (pathname !== '/login') {
                    // Clear auth and redirect once
                    //localStorage.removeItem('token');
                    //localStorage.removeItem('user');
                  //  window.location.href = '/login';
                }
            } catch (e) {
                // If accessing location fails for any reason, still reject the error
                logger.error('Error while handling 401 redirect:', e);
            }
        }
        
        // 403 = Forbidden - Accès interdit même authentifié
        if (error.response?.status === 403) {
            logger.debug('Accès interdit - Permissions insuffisantes');
            // Option: rediriger vers une page "accès refusé"
            // window.location.href = '/acces-refuse';
        }
        
        // 500 = Erreur serveur interne
        if (error.response?.status === 500) {
            logger.debug('Erreur serveur - Réessayez plus tard');
            // Option: afficher notification à l'utilisateur
        }
        
        // Gestion du timeout
        if (error.code === 'ECONNABORTED') {
            logger.debug('Le serveur met trop de temps à répondre');
            // Option: proposer à l'utilisateur de réessayer
        }
        
        // Toujours rejeter la promesse pour que l'appelant puisse gérer l'erreur
        return Promise.reject(error);
    }
);
export default api;
