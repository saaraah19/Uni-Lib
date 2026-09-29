
This document describes the frontend portion of the P2_Library project, explains each file's role and connections, and gives a short guide for adding or extending dark-mode support consistently.

1) Quick summary
- Purpose: React + Tailwind frontend for a university library app (student + staff views).
- Entry: [frontend/src/index.js](frontend/src/index.js)
- App shell: [frontend/src/App.js](frontend/src/App.js)
- Theme provider: [frontend/src/context/ThemeContext.js](frontend/src/context/ThemeContext.js)
- API client: [frontend/src/services/api.js](frontend/src/services/api.js)

2) Project structure (high level)
- frontend/
  - package.json
  - tailwind.config.js
  - src/
    - index.js  (app entry)
    - index.css (Tailwind imports)
    - App.js
    - context/
      - ThemeContext.js  (provides isDarkMode + toggleTheme and ensures `dark` class on <html>)
    - hooks/
      - useTheme.js  (convenience hook that returns ThemeContext)
      - useUser.js
    - services/
      - api.js  (axios instance used by hooks/pages to call backend)
    - components/
      - Navbar.js  (top navigation; uses useTheme)
      - Profile/* (ProfilePage, Sidebar, tabs)
    - pages/
      - UserAuth/ (Login.js, LoginCode.js, Register.js)
      - Students/
        - StudentDashboard.js
        - BookCatalog/
          - BookCatalog.js
          - BookCard.js
          - Books.js (simple page listing books via api)
      - STAFF/
        - StaffDashboard.js
        - BooksCrud/
          - index.js (list + filters + form + stats orchestration)
          - BookForm.js
          - BookFormFields.js
          - BookRow.js
          - hooks/useBooks.js
          - hooks/useBookForm.js
      - shared/
        - BookList.js
        - BookStats.js
        - BookFilters.js
        - BookDetail.js

3) How files communicate (data & control flow)
- UI/Pages call hooks or directly call `api` to fetch data.
  - Example: [BookCatalog.js](frontend/src/pages/Students/BookCatalog/BookCatalog.js) uses `useBooks` (from staff hooks) or `api` to fetch books.
- Hooks centralize API calls and state and expose data + actions to pages/components.
  - Example: `pages/STAFF/BooksCrud/hooks/useBooks.js` fetches books and provides `viewBook`, `setSelectedBook`, `loading`, `books`.
- Components receive data via props and render UI; they call callbacks to trigger actions (view, edit, delete).
  - Example: `BookCard` receives `book`, `onViewDetails`, `onReserve` props.
- Theme: `ThemeContext` toggles `dark` class on the document root and provides `isDarkMode` + `toggleTheme`. Components read `isDarkMode` via `useTheme` and call `toggleTheme` from `Navbar` or settings.

4) Key files and their roles (detailed)
- [frontend/src/index.js](frontend/src/index.js)
  - Responsibilities: initial theme check (localStorage or prefers-color-scheme) and sets `dark` class on `<html>` before React renders. Imports `index.css` and renders `<App />`.

- [frontend/src/App.js](frontend/src/App.js)
  - Responsibilities: App shell, routing (react-router), global `ThemeProvider` wrapper, global `Navbar`, and `ToastContainer` for notifications. Routes map path → page components.

- [frontend/src/context/ThemeContext.js](frontend/src/context/ThemeContext.js)
  - Responsibilities: React Context that tracks dark state and adds/removes `dark` class on `document.documentElement`. Exposes `isDarkMode` and `toggleTheme`.
  - Consumers: `useTheme` hook and components like `Navbar`, `ProfilePage`.

- [frontend/src/hooks/useTheme.js](frontend/src/hooks/useTheme.js)
  - Responsibilities: convenience hook that returns `ThemeContext`. Enforces usage inside `ThemeProvider`.

- [frontend/src/services/api.js](frontend/src/services/api.js)
  - Responsibilities: axios instance with base URL for backend; used across hooks/pages to call endpoints (users, books, loans).

- [frontend/src/components/Navbar.js](frontend/src/components/Navbar.js)
  - Responsibilities: top-level navigation, login/logout, theme toggle button (calls `toggleTheme`). Important because it’s visible across pages and often the user’s way to switch themes.

- Pages in `pages/` directory
  - UserAuth:
    - `Login.js`, `LoginCode.js`, `Register.js` — authentication forms and interactions with `api`.
  - Students:
    - `StudentDashboard.js` — compositions of BookCatalog, LoansHistory and Profile
    - `BookCatalog/*` — `BookCatalog.js` coordinates list, filters and detail modal; `BookCard.js` renders individual cards; `Books.js` is a simple list page used by other routes.
  - STAFF:
    - `StaffDashboard.js` — shows cards + links to BooksCrud and Reports
    - `BooksCrud/` — staff CRUD area with `BookList` (table), `BookForm` (form using BookFormFields), `BookRow` (rows), and hooks that call `api`.

5) Unused / suspicious files
- `frontend/src/pages/STAFF/BooksCrud/BooksCrud.backup.jsx.jsx` — looks like a backup copy; not imported anywhere. Consider removing or moving out of `src/`.
- Any top-level `.backup` or double-extension file should be verified manually; I found only the one above.

6) Why dark mode appears partially applied
- Tailwind applies `dark:` variants only when the `dark` class is present on a parent (commonly `<html>`). The project sets the `dark` class via `ThemeContext` + `index.js`.
- If some components lack `dark:` classes (e.g., use only `bg-white` or `text-gray-800`), they will keep light styling even when `dark` is active. That causes mixed UI.
- Also components that use hard-coded color classes like `text-white` inside a light background will cause poor contrast; prefer `dark:` variants (example below).

7) Minimal checklist for adding dark-mode to a component
Follow these steps whenever you add a new page/component:

- Step 1 — Ensure container has a background + text variants:
  - Give the top-level container both light + dark backgrounds:
    - Example: className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 transition-colors duration-300"

- Step 2 — Apply dark variants to cards/panels/inputs:
  - For every `bg-white` panel use `bg-white dark:bg-gray-800`.
  - For borders: `border-gray-200 dark:border-gray-700`.
  - For small text: `text-gray-600 dark:text-gray-400`.

- Step 3 — Buttons and badges:
  - If a badge uses `bg-blue-100`, also add `dark:bg-blue-900/30` and adjust text color: `text-blue-800 dark:text-blue-300`.

- Step 4 — Inputs and selects:
  - Use `bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400`.

- Step 5 — Icons and non-text elements:
  - Icons usually adapt, but ensure surrounding containers switch background if necessary. Avoid relying on icon color alone for contrast.

- Step 6 — Add transitions for smooth change:
  - Add `transition-colors duration-200` or `duration-300` on cards and containers to make theme toggles smooth.

- Step 7 — Test all states:
  - Normal, hover, focus, disabled states — add `dark:` variants for pseudo states where appropriate (e.g., `dark:hover:bg-gray-700`).

8) Small code examples (before → after)
- Example: a panel before:

  <div className="bg-white p-6 rounded-lg shadow">
    <h2 className="text-gray-800">Title</h2>
    <p className="text-gray-600">Description</p>
  </div>

- After adding dark-mode variants:

  <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow dark:shadow-lg transition-colors duration-300">
    <h2 className="text-gray-800 dark:text-gray-100">Title</h2>
    <p className="text-gray-600 dark:text-gray-400">Description</p>
  </div>

9) Recommended project utilities (optional)
- Centralize a `card` utility in `src/index.css` using Tailwind `@apply` to avoid repeating classes:

  /* in index.css */
  .card {
    @apply bg-white dark:bg-gray-800 rounded-xl shadow p-6 transition-colors;
  }

  Then use `<div className="card">...</div>` across the app.

10) Running and testing
- Start the frontend dev server in the `frontend` folder:

  npm install
  npm start

- Open the app (default `http://localhost:3000` or as printed by the dev server) and toggle theme using the Navbar button.

11) Next steps I can do for you
- Sweep the remaining components and automatically add dark variants throughout the whole frontend.
- Remove or archive the backup file noted earlier.

If you want me to proceed and apply dark-mode variants project-wide, tell me to continue and I will apply the changes in a batch and then verify the dev server.

— End of document
# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
