// frontend/src/utils/criticalAssets.js
//
// ASSET LOADING AT START-UP
// -------------------------
// The first screen a visitor sees is the landing page, whose look depends on
// two images: the university logo and the large hero photo. Previously the
// page rendered immediately and those images popped in late (the hero is a
// ~1920 px photo), which looked broken on a slow connection — especially on
// a freshly woken free-tier host.
//
// This module is the single source of truth for those URLs (LandingPage
// imports them from here) and provides the helpers index.js uses to:
//   - preload the images that matter for the first screen,
//   - keep the inline boot splash (see public/index.html) on screen until
//     they are ready — or until a safety timeout, so a slow/blocked image
//     can never keep the user on the splash forever.

export const UNIVERSITY_LOGO_URL = `${process.env.PUBLIC_URL || ''}/logo-oran2.jpg`;

// TODO: ideally self-host a compressed copy (WebP, ~150 KB) in /public and
// point this to it — a hero served from your own origin loads faster and
// doesn't depend on a third-party host.
export const HERO_IMAGE_URL =
  'https://images.unsplash.com/photo-1568667256549-094345857637?q=80&w=1920&auto=format&fit=crop';

const LOGO_TIMEOUT_MS = 2000;
const HERO_TIMEOUT_MS = 4000;

/** Resolves when the image loaded, failed, or the timeout elapsed — never rejects. */
export const preloadImage = (src, timeoutMs) =>
  new Promise((resolve) => {
    const img = new Image();
    const timer = setTimeout(resolve, timeoutMs);
    const done = () => {
      clearTimeout(timer);
      resolve();
    };
    img.onload = done;
    img.onerror = done;
    img.src = src;
  });

/**
 * Preload what the first screen needs.
 * @param {{ includeHero: boolean }} options - the hero is only needed on the
 *   public landing page (logged-in users are redirected straight to their
 *   dashboard, so downloading it for them would be wasted bandwidth).
 */
export const preloadCriticalAssets = ({ includeHero }) =>
  Promise.all([
    preloadImage(UNIVERSITY_LOGO_URL, LOGO_TIMEOUT_MS),
    includeHero ? preloadImage(HERO_IMAGE_URL, HERO_TIMEOUT_MS) : null,
  ]);

/** Fade out and remove the inline splash screen declared in public/index.html. */
export const hideBootSplash = () => {
  const splash = document.getElementById('boot-splash');
  if (!splash) return;
  splash.classList.add('boot-splash--hide');
  setTimeout(() => splash.remove(), 400);
};
