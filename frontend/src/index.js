// frontend/src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';  // ⭐ C'EST ICI QUE ÇA SE PASSE ! ⭐
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