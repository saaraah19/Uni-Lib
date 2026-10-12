/*
 * Runs before the React bundle downloads (loaded from <head> of index.html).
 * It is an external file — not an inline <script> — so the production server's
 * Content-Security-Policy can keep script-src limited to same-origin files.
 *
 *  1. Applies the saved/system dark-mode preference immediately (no light flash,
 *     and the boot splash already matches the theme).
 *  2. For logged-out visitors on "/", starts downloading the landing hero photo in
 *     parallel with the JS bundle. Logged-in users are redirected to their
 *     dashboard, so they skip this download.
 *     KEEP IN SYNC: the URL must match HERO_IMAGE_URL in src/utils/criticalAssets.js.
 *  3. Safety net: if the app bundle never starts, don't leave the splash up forever.
 *
 * Read-only on localStorage; the React app remains the source of truth.
 */
(function () {
  try {
    var root = document.documentElement;
    var saved = localStorage.getItem('theme');
    if (
      saved === 'dark' ||
      (saved !== 'light' && window.matchMedia('(prefers-color-scheme: dark)').matches)
    ) {
      root.classList.add('dark');
    }
    if (location.pathname === '/' && !localStorage.getItem('token')) {
      var link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href =
        'https://images.unsplash.com/photo-1568667256549-094345857637?q=80&w=1920&auto=format&fit=crop';
      link.setAttribute('fetchpriority', 'high');
      document.head.appendChild(link);
    }
  } catch (e) {
    /* storage unavailable: nothing to do */
  }

  setTimeout(function () {
    var splash = document.getElementById('boot-splash');
    if (splash) splash.className += ' boot-splash--hide';
  }, 20000);
})();
