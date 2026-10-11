// frontend/src/components/ServerStatusBanner.js
//
// Floating notice shown while the (free-tier) backend is waking up.
// - Hidden for the first 1.2 s, so a server that is already awake never
//   flashes a banner.
// - Explains what is happening and why, with a live elapsed-seconds counter.
// - If the server never answers, offers a "Réessayer" button.
// - Briefly confirms "Serveur prêt" once it is back, so the user knows they
//   can go on.

import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import {
  subscribeWarmup,
  getWarmupSnapshot,
  retryWarmup,
} from '../services/serverWarmup';

const SHOW_AFTER_MS = 1200;
const READY_FLASH_MS = 1800;

const ServerStatusBanner = () => {
  const { state, startedAt } = useSyncExternalStore(
    subscribeWarmup,
    getWarmupSnapshot
  );
  const [visibleWhileWaking, setVisibleWhileWaking] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [showReady, setShowReady] = useState(false);
  const wasVisible = useRef(false);

  // Only reveal the "waking" banner if the wait is actually noticeable.
  useEffect(() => {
    if (state !== 'waking') {
      setVisibleWhileWaking(false);
      return undefined;
    }
    const timer = setTimeout(() => setVisibleWhileWaking(true), SHOW_AFTER_MS);
    return () => clearTimeout(timer);
  }, [state, startedAt]);

  // Live counter while waking.
  useEffect(() => {
    if (state !== 'waking' || !startedAt) return undefined;
    const tick = () => setElapsed(Math.floor((Date.now() - startedAt) / 1000));
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [state, startedAt]);

  // Flash a short confirmation if the user actually saw the waking banner.
  useEffect(() => {
    if (state === 'waking' && visibleWhileWaking) wasVisible.current = true;
    if (state === 'ready' && wasVisible.current) {
      wasVisible.current = false;
      setShowReady(true);
      const timer = setTimeout(() => setShowReady(false), READY_FLASH_MS);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [state, visibleWhileWaking]);

  const waking = state === 'waking' && visibleWhileWaking;
  const failed = state === 'failed';
  if (!waking && !failed && !showReady) return null;

  const tone = failed
    ? 'border-red-300 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200'
    : showReady
    ? 'border-green-300 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200'
    : 'border-blue-200 bg-white text-gray-800 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100';

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed bottom-4 left-4 right-4 sm:left-1/2 sm:right-auto sm:w-full sm:max-w-md sm:-translate-x-1/2 z-50 rounded-xl border px-4 py-3 shadow-xl ${tone}`}
    >
      {failed && (
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm">
            Impossible de joindre le serveur. Vérifiez votre connexion puis
            réessayez.
          </p>
          <button
            type="button"
            onClick={retryWarmup}
            className="shrink-0 rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700"
          >
            Réessayer
          </button>
        </div>
      )}

      {waking && (
        <>
          <div className="flex items-start gap-3">
            <div
              className="mt-0.5 h-5 w-5 shrink-0 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"
              aria-hidden="true"
            />
            <div className="text-sm">
              <p className="font-semibold">Le serveur se réveille…</p>
              <p className="text-gray-600 dark:text-gray-300">
                L’hébergement gratuit met le serveur en veille après
                quelques minutes d’inactivité. Le premier chargement peut
                prendre jusqu’à une minute — la suite sera rapide.
              </p>
            </div>
            <span className="ml-auto shrink-0 text-xs tabular-nums text-gray-500 dark:text-gray-400">
              {elapsed} s
            </span>
          </div>
          <div className="mt-3 h-1 overflow-hidden rounded bg-blue-100 dark:bg-gray-700">
            <div className="h-full w-1/3 animate-pulse rounded bg-blue-500" />
          </div>
        </>
      )}

      {showReady && !waking && !failed && (
        <p className="text-sm font-medium">✓ Serveur prêt</p>
      )}
    </div>
  );
};

export default ServerStatusBanner;
