// SECURITY/POLISH FIX (P2): backend controllers had extensive
// console.log debugging left in (query filters, full request bodies,
// notification payloads) that runs on every request in production.
// Same pattern as frontend/src/utils/logger.js — gates debug/info behind
// NODE_ENV, keeps error logging always-on.
//
// MIGRATION NOTE: applied here to files touched in this session
// (BookController.js) as a demonstration; a full sweep of
// backend/controllers/*.js is recommended as a dedicated follow-up pass.

const isDev = process.env.NODE_ENV !== 'production';

const logger = {
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
    console.error(...args);
  },
};

module.exports = logger;
