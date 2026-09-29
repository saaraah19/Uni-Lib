// SECURITY/POLISH FIX (P2): the app had dozens of raw console.log/
// console.error calls scattered across components (NotificationPage.jsx,
// NotificationCenter.jsx, BookDetail.js, useProfile.js, and many more),
// several of which print user/token/API response internals. In
// production, these are visible to anyone opening devtools and hurt the
// perceived professionalism of the product.
//
// This is a thin wrapper, not a full logging library — the goal is to gate
// noisy debug output behind NODE_ENV without ripping out genuinely useful
// error visibility. `logger.error` still logs in production (so real
// errors remain visible for support/debugging via browser devtools);
// `logger.debug`/`logger.info` are dev-only.
//
// MIGRATION NOTE: this file introduces the utility but does not sweep the
// entire codebase (that's a large, mechanical, low-risk-but-high-file-count
// change better done as its own dedicated pass — grep for `console.log`
// across `frontend/src` and replace with `logger.debug`). Applied here to
// the files touched in this session as a demonstration of the pattern.

const isDev = process.env.NODE_ENV !== 'production';

export const logger = {
  debug: (...args) => {
    if (isDev) console.log(...args);
  },
  info: (...args) => {
    if (isDev) console.info(...args);
  },
  warn: (...args) => {
    console.warn(...args);
  },
  error: (...args) => {
    // Always logged, even in production — genuine errors should remain
    // visible for debugging support tickets via devtools.
    console.error(...args);
  },
};

export default logger;
