/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    // FIX: the codebase uses an `xs:` breakpoint in ~40 places (e.g. `hidden xs:inline`,
    // `flex-col xs:flex-row`) and a `text-2xs` size, but neither was ever defined, so
    // Tailwind silently dropped those classes (stacked buttons on desktop, "Voir"/"Prêt"
    // labels instead of "Détails"/"Emprunter", ...). They are defined here.
    // `screens` is declared in full (not under `extend`) so the breakpoints are ordered
    // by width and `xs:` can never override `sm:`/`md:` rules by CSS source order.
    screens: {
      xs: '475px',
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
    },
    extend: {
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.875rem' }],
      },
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