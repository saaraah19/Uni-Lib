// PERF FIX (P2): getBookStats, getCategories, getLanguages and
// /stats/summary were recomputed from scratch (countDocuments +
// aggregations) on every single request, even though these values change
// slowly relative to how often they're requested (every dashboard render,
// every BooksCrud page load). Introducing Redis for this would be
// over-engineering at the current scale (~11k books, single Node process);
// a small in-memory TTL cache is the simplest thing that actually solves
// the problem.
//
// NOTE: this cache is per-process. If the app is ever scaled horizontally
// (multiple Node instances behind a load balancer), each instance will
// have its own cache copy — acceptable for this data (eventually
// consistent within the TTL window), but worth knowing before scaling out.

const store = new Map();

/**
 * Get a cached value, or compute + cache it if missing/expired.
 * @param {string} key - cache key
 * @param {number} ttlMs - time-to-live in milliseconds
 * @param {Function} computeFn - async function producing the value
 */
async function getOrSet(key, ttlMs, computeFn) {
  const now = Date.now();
  const cached = store.get(key);

  if (cached && cached.expiresAt > now) {
    return cached.value;
  }

  const value = await computeFn();
  store.set(key, { value, expiresAt: now + ttlMs });
  return value;
}

/**
 * Manually invalidate a cache key (e.g. after a book is created/updated/
 * deleted, so stats/categories/languages don't serve stale data for the
 * full TTL window).
 */
function invalidate(key) {
  store.delete(key);
}

function invalidatePrefix(prefix) {
  for (const key of store.keys()) {
    if (key.startsWith(prefix)) store.delete(key);
  }
}

module.exports = { getOrSet, invalidate, invalidatePrefix };
