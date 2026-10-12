// frontend/src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';  // ⭐ C'EST ICI QUE ÇA SE PASSE ! ⭐
import { ensureServerAwake } from './services/serverWarmup';
import { preloadCriticalAssets, hideBootSplash } from './utils/criticalAssets';

// COLD START: begin waking the (possibly sleeping) Render backend right now,
// in parallel with React booting, instead of waiting for the first API call.
ensureServerAwake();
// Check theme on initial load
const savedTheme = localStorage.getItem('theme');
const html = document.documentElement;

if (savedTheme === 'dark') {
  html.classList.add('dark');
} else if (savedTheme === 'light') {
  html.classList.remove('dark');
} else {
  // Check system preference
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  if (prefersDark) {
    html.classList.add('dark');
    localStorage.setItem('theme', 'dark');
  }
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// ASSET LOADING: keep the inline splash (public/index.html) up until the
// images the first screen depends on are ready (capped by timeouts inside
// preloadCriticalAssets, so a slow image can never trap the user).
// The hero photo is only needed for logged-out visitors on the landing page.
const isLandingVisit =
  window.location.pathname === '/' && !localStorage.getItem('token');
preloadCriticalAssets({ includeHero: isLandingVisit }).then(hideBootSplash);