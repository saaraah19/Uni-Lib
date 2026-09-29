/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      animation: {
        slideDown: 'slideDown 0.2s ease-out',
        spin: 'spin 1s linear infinite',
      },
      keyframes: {
        slideDown: {
          from: { opacity: 0, transform: 'translateY(-10px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
      },
      borderWidth: {
        '3': '3px',
      },
    },
  },
  plugins: [
    // require('@tailwindcss/line-clamp'), // ← supprimé (inclus par défaut)
    require('tailwind-scrollbar')({ nocompatible: true }),
  ],
}