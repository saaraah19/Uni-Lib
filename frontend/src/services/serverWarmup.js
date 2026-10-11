// frontend/src/services/serverWarmup.js
//
// COLD-START MANAGEMENT (Render free tier)
// ----------------------------------------
// A free Render web service goes to sleep after ~15 minutes without
// traffic. The first request after that wakes it up, which can take from
// ~30 s to well over a minute. Without any handling, the app would show
// empty screens and the API client's 10 s timeout would turn the wake-up
// into a wall of errors.
//
// This module:
//   1. pings GET /api/health (no auth, no heavy DB work) until the server
//      answers, retrying every few seconds for up to ~2 minutes;
//   2. exposes the current state ("idle" | "waking" | "ready" | "failed")
//      so the UI (ServerStatusBanner) can tell the user what is happening;
//   3. lets api.js hold every outgoing request until the server is awake,
//      so screens simply "load slowly once" instead of failing.
//
// It deliberately uses a RAW axios call (not the shared `api` instance) so
// the health check is never gated by itself and never carries a token.

import axios from 'axios';
import { logger } from '../utils/logger';

// Single source of truth for the API base URL (api.js imports it from here).
export const API_BASE_URL =
  process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const HEALTH_URL = `${API_BASE_URL}/health`;
const ATTEMPT_TIMEOUT_MS = 8000; // one ping may hang while the box boots
const RETRY_DELAY_MS = 2500;
const GIVE_UP_AFTER_MS = 120000; // cold starts of 60-90 s have been observed
const STALE_AFTER_MS = 10 * 60 * 1000; // Render sleeps after ~15 min idle

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Immutable snapshot, replaced on every change (required by
// useSyncExternalStore: the same reference must be returned between changes).
let snapshot = { state: 'idle', startedAt: null, attempts: 0 };
let inFlight = null;
let lastAliveAt = 0;
const listeners = new Set();

const update = (patch) => {
  snapshot = { ...snapshot, ...patch };
  listeners.forEach((listener) => listener());
};

export const subscribeWarmup = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const getWarmupSnapshot = () => snapshot;

/**
 * Start (or join) the wake-up routine. Resolves true once the server
 * answered, false if it never did within GIVE_UP_AFTER_MS. Idempotent: many
 * callers share the same in-flight promise.
 */
export const ensureServerAwake = () => {
  if (snapshot.state === 'ready') return Promise.resolve(true);
  if (inFlight) return inFlight;

  const startedAt = Date.now();
  update({ state: 'waking', startedAt, attempts: 0 });

  inFlight = (async () => {
    let attempts = 0;
    while (Date.now() - startedAt < GIVE_UP_AFTER_MS) {
      attempts += 1;
      update({ attempts });
      try {
        await axios.get(HEALTH_URL, { timeout: ATTEMPT_TIMEOUT_MS });
        lastAliveAt = Date.now();
        logger.debug(`✅ Serveur prêt après ${attempts} tentative(s)`);
        update({ state: 'ready' });
        return true;
      } catch (error) {
        logger.debug(`⏳ Serveur pas encore prêt (tentative ${attempts})`);
        await sleep(RETRY_DELAY_MS);
      }
    }
    logger.warn('Serveur injoignable après le délai maximum de réveil');
    update({ state: 'failed' });
    return false;
  })().finally(() => {
    inFlight = null;
  });

  return inFlight;
};

/** Manual retry (banner button): forget a failed attempt and start over. */
export const retryWarmup = () => {
  if (snapshot.state === 'failed' || snapshot.state === 'idle') {
    update({ state: 'idle' });
  }
  return ensureServerAwake();
};

/** Called by api.js when a request shows symptoms of a sleeping server. */
export const markServerAsleep = () => {
  if (snapshot.state === 'ready') update({ state: 'idle' });
};

/** Called by api.js on every successful response: the server is clearly up. */
export const noteServerAlive = () => {
  lastAliveAt = Date.now();
  if (snapshot.state !== 'ready' && !inFlight) update({ state: 'ready' });
};

/** api.js awaits this before sending any request. */
export const waitUntilServerReady = async () => {
  if (snapshot.state === 'ready') return true;
  return ensureServerAwake();
};

// When the user comes back to a tab that has been idle for a while, the
// server has probably gone back to sleep. Re-check in the background so the
// wake-up banner appears right away instead of on the first failed click.
if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (
      document.visibilityState === 'visible' &&
      snapshot.state === 'ready' &&
      Date.now() - lastAliveAt > STALE_AFTER_MS
    ) {
      update({ state: 'idle' });
      ensureServerAwake();
    }
  });
}
