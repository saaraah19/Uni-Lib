<div align="center">

# 📚 UniLib

**A full-stack library management system for the Faculty of Foreign Languages — Université Oran 2 Mohamed Ben Ahmed.**

Browse an ~11,000-title catalog, request and track loans, and let library staff approve, reject and manage everything from one dashboard.

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![Express](https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind-3-06B6D4?logo=tailwindcss&logoColor=white)
![Hosted on](https://img.shields.io/badge/Hosted%20on-Render-46E3B7?logo=render&logoColor=white)

[**Live demo**](#) · [**Case study**](#) · [Report a bug](../../issues)

<img src="docs/screenshots/01-landing-hero.png" alt="UniLib landing page" width="860">

</div>

---

## Table of contents

1. [About the project](#about-the-project)
2. [Features](#features)
3. [Screenshots](#screenshots)
4. [Tech stack](#tech-stack)
5. [Architecture](#architecture)
6. [API reference](#api-reference)
7. [Security & data integrity](#security--data-integrity)
8. [Performance](#performance)
9. [Cold start on Render](#cold-start-on-render)
10. [Getting started (local)](#getting-started-local)
11. [Deploying to Render](#deploying-to-render)
12. [Project structure](#project-structure)
13. [Roadmap](#roadmap)

---

## About the project

UniLib replaces paper-based lending with a web application built around two roles — **students** and **library staff** — and a real catalog of roughly **11,000 titles**.

A catalog is easy to build and hard to get *right* once several people use it at the same time. This project was therefore audited and hardened as if it were going into production: concurrent loan approvals can't over-lend the last copy, nobody can promote themselves to staff, large lists are paginated on the server, and every modal is keyboard accessible. The details are in [Security & data integrity](#security--data-integrity).

> The interface is in **French** (the faculty's working language); code comments and this documentation are in English.

---

## Features

### 🌐 Public

- **Landing page** — hero section with the faculty name and call-to-action buttons (university logo in the header), "why UniLib" highlights and an accordion FAQ.
- **Registration & login** — JWT authentication (72 h). Every self-registered account is a **student**; staff accounts can only be created by existing staff.

### 🎓 Students

| Area | What you can do |
|---|---|
| **Catalog** | Paginated, responsive grid (1–4 columns) with an adjustable page size. Each card shows the cover, title, call number (*cote*), authors, category, availability (`available/total`) and a borrow-rate bar. |
| **Search & filters** | Relevance-ranked full-text search over titles and descriptions (short queries fall back to title / call-number matching), plus dedicated filters by **author**, **call number**, **category**, **language** (multi-select: FR / EN / ES) and **publication-year range**. Sort by title, year, most recent, author or call number — ascending or descending. |
| **Book details** | Accessible modal (focus trap, `Esc` to close) with the full record and availability. |
| **Loans** | Request a loan and choose the duration (**15, 30 or 60 days**). Up to **5 concurrent loans**. A duplicate pending request for the same book is rejected. |
| **My Loans** | Tabs for *Current · Pending · Active · History · Rejected · Cancelled* with live counters. Cancel a pending request after a confirmation step. |
| **Favorites** | Heart any book; browse your list with search, category and language filters; remove with a confirmation. |
| **Notifications** | Bell dropdown with unread badge (filter all / unread / read, mark read, archive, delete, clear all, load more) **and** a full page with stats, archived view, bulk actions and pagination. Notifications expire automatically after 30 days. Daily **reminder** 3 days before a due date. |
| **Profile** | Overview, personal information, and settings (change password, light/dark theme). |

### 🛠️ Library staff

| Area | What you can do |
|---|---|
| **Dashboard** | Live counters — total books, users and active loans — and quick access to every tool. |
| **Books management** | Searchable, filterable, paginated catalog with **add / edit / delete**. Form covers title, original title, authors, original author, ISBN (locked after creation), language, category, year, pages, total & available copies, description, call number and cover URL. Statistics panel by availability and category. Deleting a book also cleans up favorites that pointed to it. |
| **Loan management** | Server-paginated tabs — **Pending**, **Active**, **History** (with returned / rejected / cancelled sub-filter) — with counters. **Approve** (copy count is decremented atomically), **Reject** (optional reason sent to the student) or mark **Returned** (automatic fine for overdue returns). Every decision notifies the student. |
| **Reports** | Catalog size, user count and active-loan count with occupancy rate. |
| **User promotion** | `PUT /api/users/:id/promote-to-staff` — only an existing staff member can create new staff. |

### ✨ Across the app

- 🌗 **Dark mode** — toggle in the navbar; remembers your choice and follows the system preference.
- 📱 **Responsive** — designed for phone, tablet and desktop.
- ♿ **Accessible modals** — focus trap, `Esc` to close, focus restored to the trigger.
- ⏳ **Cold-start aware** — splash screen, preloaded first-screen images and a "server is waking up" notice ([details](#cold-start-on-render)).

---

## Screenshots

> Captured on a local instance with sample data: fictional student and staff accounts, demo loans, favorites and notifications, on top of the real catalog.

### Public pages

| Landing page | Why UniLib & FAQ |
|:--:|:--:|
| ![Landing hero](docs/screenshots/01-landing-hero.png) | ![Landing FAQ](docs/screenshots/02-landing-faq.png) |

| Registration | Login |
|:--:|:--:|
| ![Register](docs/screenshots/03-register.png) | ![Login](docs/screenshots/04-login.png) |

### Student experience

**Dashboard**

![Student dashboard](docs/screenshots/05-student-dashboard.png)

**Catalog and advanced filters**

| Catalog grid | Filters |
|:--:|:--:|
| ![Catalog](docs/screenshots/06-catalog-grid.png) | ![Filters](docs/screenshots/07-catalog-filters.png) |

**Book details and loan request**

| Book details | Loan request |
|:--:|:--:|
| ![Book detail](docs/screenshots/08-book-detail.png) | ![Loan request](docs/screenshots/09-loan-request.png) |

**My loans and favorites**

| My loans | Favorites |
|:--:|:--:|
| ![My loans](docs/screenshots/10-my-loans.png) | ![Favorites](docs/screenshots/11-favorites.png) |

**Notifications**

| Dropdown | Full page |
|:--:|:--:|
| ![Notification dropdown](docs/screenshots/12-notifications-dropdown.png) | ![Notifications page](docs/screenshots/13-notifications-page.png) |

**Profile settings**

![Profile settings](docs/screenshots/14-profile-settings.png)

### Staff experience

**Dashboard and books management**

| Dashboard | Books management |
|:--:|:--:|
| ![Staff dashboard](docs/screenshots/17-staff-dashboard.png) | ![Books management](docs/screenshots/18-books-management.png) |

| Add / edit form | Delete confirmation |
|:--:|:--:|
| ![Book form](docs/screenshots/19-book-form.png) | ![Delete confirmation](docs/screenshots/20-delete-confirmation.png) |

**Loan management**

| Pending requests | Reject with a reason |
|:--:|:--:|
| ![Pending loans](docs/screenshots/21-loan-requests-pending.png) | ![Reject modal](docs/screenshots/22-loan-reject-modal.png) |

| History | Reports |
|:--:|:--:|
| ![Loan history](docs/screenshots/23-loan-history.png) | ![Reports](docs/screenshots/24-reports.png) |

### Dark mode, mobile and cold start

| Dark mode | Mobile | Cold-start notice |
|:--:|:--:|:--:|
| ![Dark mode](docs/screenshots/15-dark-mode.png) | ![Mobile](docs/screenshots/16-mobile-catalog.png) | ![Cold start](docs/screenshots/25-cold-start-banner.png) |

---

## Tech stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19 (Create React App), React Router 7, Tailwind CSS 3, Axios, React-Toastify, React Icons, react-error-boundary |
| **Backend** | Node.js, Express 5, Mongoose 9, JSON Web Tokens, bcryptjs, express-validator, express-rate-limit, Helmet, node-cron |
| **Database** | MongoDB Atlas |
| **Hosting** | Render (static site + web service) |

---

## Architecture

```mermaid
flowchart LR
    subgraph Browser
        UI["React SPA<br/>(student + staff views)"]
    end
    subgraph Render
        STATIC["Static site<br/>(CDN)"]
        API["Express 5 API<br/>auth · validation · rate limit"]
        CRON["node-cron<br/>daily due-date reminders"]
    end
    DB[("MongoDB Atlas<br/>books · users · loans<br/>favorites · notifications")]

    UI -- "loads bundle" --> STATIC
    UI -- "REST + JWT" --> API
    API --> DB
    CRON --> DB
```

### Loan lifecycle

```mermaid
stateDiagram-v2
    [*] --> pending: student requests
    pending --> cancelled: student cancels
    pending --> rejected: staff rejects (optional reason)
    pending --> active: staff approves<br/>(copy decremented atomically)
    active --> returned: staff marks returned<br/>(fine if overdue)
    returned --> [*]
    rejected --> [*]
    cancelled --> [*]
```

### Data model

```mermaid
erDiagram
    USER ||--o{ LOAN : requests
    BOOK ||--o{ LOAN : "is borrowed in"
    USER ||--o{ FAVORITE : saves
    BOOK ||--o{ FAVORITE : "is saved in"
    USER ||--o{ NOTIFICATION : receives

    USER { string name string email string role "student | staff" }
    BOOK { string title string cote "unique call number" string isbn int totalCopies int availableCopies }
    LOAN { ref user ref book string status date dueDate int loanPeriod number fineAmount }
    FAVORITE { ref user ref book date addedAt }
    NOTIFICATION { ref user string type string status date expiresAt "TTL index" }
```

---

## API reference

Base URL: `/api` · Auth: `Authorization: Bearer <jwt>` · 🛡️ = staff only.

<details>
<summary><b>Users</b></summary>

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/users/register` | public · rate-limited | Create a student account |
| POST | `/users/login` | public · rate-limited | Log in, returns a JWT |
| PUT | `/users/update-password` | authenticated | Change own password |
| PUT | `/users/:id/promote-to-staff` | 🛡️ | Promote a user to staff |

</details>

<details>
<summary><b>Books</b></summary>

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/books/search` | authenticated | Search + filters + sort + pagination |
| GET | `/books/get` | authenticated | Paginated list |
| GET | `/books/get/:id` · `/books/cote/:cote` | authenticated | One book by id / call number |
| GET | `/books/categories` · `/books/languages` · `/books/stats` | authenticated | Facets and statistics (cached) |
| GET | `/books/recent` · `/books/recent/:limit` | public | Latest additions |
| POST | `/books/create` | 🛡️ | Create a book (validated) |
| PUT | `/books/update/:id` | 🛡️ | Update a book (validated) |
| DELETE | `/books/delete/:id` | 🛡️ | Delete a book and its orphan favorites |

</details>

<details>
<summary><b>Loans</b></summary>

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/loans` | authenticated | Request a loan |
| GET | `/loans/my-loans` · `/loans/my-history` | authenticated | Own current loans / history |
| DELETE | `/loans/:loanId/cancel` | authenticated | Cancel own pending request |
| GET | `/loans/pending` · `/loans/overdue` | 🛡️ | Pending / overdue loans |
| GET | `/loans/all?status=a,b&page=&limit=` | 🛡️ | Paginated, filterable by status list |
| PUT | `/loans/:loanId/approve` · `/reject` · `/return` | 🛡️ | Process a loan |

</details>

<details>
<summary><b>Favorites</b></summary>

| Method | Endpoint | Description |
|---|---|---|
| POST | `/favorites` | Add a favorite |
| DELETE | `/favorites/:bookId` | Remove a favorite |
| GET | `/favorites` · `/favorites/count` | List / count |
| GET | `/favorites/check/:bookId` | Is this book a favorite? |

</details>

<details>
<summary><b>Notifications</b></summary>

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/notifications` | authenticated | Paginated, optional `status` filter |
| GET | `/notifications/unread-count` · `/notifications/stats` | authenticated | Counters |
| PUT | `/notifications/:id/read` · `/read-all` · `/:id/archive` | authenticated | State changes |
| DELETE | `/notifications/:id` · `/notifications/clear-all` | authenticated | Delete / clear |
| POST | `/notifications` · `/notifications/notify-new-book` | 🛡️ | Create / broadcast |

</details>

<details>
<summary><b>System</b></summary>

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/health` | public | Liveness + DB status (used for cold-start detection and Render health checks) |
| GET | `/stats/summary` | public (counts only) | Users / books / loans counters, cached 60 s |

</details>

---

## Security & data integrity

This codebase went through a structured audit; the highlights:

| Area | Measure |
|---|---|
| **Privilege escalation** | No automatic staff role by email domain or shared code. All sign-ups are students; only staff can promote. |
| **Authorization** | Role checks happen on the server; the middleware re-reads the user's **current role from the database on every request**, so a deleted or demoted account loses access immediately. |
| **Concurrency** | Approving a loan decrements `availableCopies` with a **single conditional atomic update**, so two simultaneous approvals can never over-lend the last copy. A **partial unique index** blocks duplicate pending requests at the database level. |
| **Injection** | Search input is regex-escaped; request bodies are validated with `express-validator`. |
| **Brute force** | Login/registration rate-limited (5 attempts / 15 min / IP); proxy-aware so limits apply per real client on Render. |
| **Hardening** | Helmet headers, single-origin CORS, bcrypt password hashes, JWT expiry, no stack traces in production. |
| **Data hygiene** | Notifications carry a **TTL index** and delete themselves after 30 days; orphan favorites are cleaned up on book deletion. |

---

## Performance

- **Server-side pagination** on the catalog and loan endpoints (the catalog holds ~11k documents) — the UI never downloads the whole collection.
- **Text index** for search instead of unindexed regex scans.
- **In-memory TTL cache** for expensive aggregates (statistics, categories, languages, dashboard counters), invalidated when books change.
- **Compound indexes** on the loan queries the dashboards actually run.
- **Single Tailwind build** (the CDN script was removed) — the production bundle is ~165 kB gzipped JS + ~13 kB CSS.
- **Environment-gated logging** — debug output only in development.

---

## Cold start on Render

Free Render web services **sleep after ~15 minutes without traffic**; the first request afterwards can take from ~30 seconds to over a minute. Instead of letting users stare at errors, UniLib handles it explicitly:

| Layer | What happens |
|---|---|
| **Boot splash** | `public/index.html` paints a branded splash instantly (before any JS), already matching the dark/light theme. |
| **Asset preloading** | The logo and — for logged-out visitors on `/` — the landing hero photo are preloaded; the splash fades once they are ready (capped by timeouts, so it can never trap the user). |
| **Early wake-up** | `index.js` starts pinging `GET /api/health` immediately, in parallel with React booting. |
| **Request gate** | `services/api.js` holds outgoing requests until the server answers, so screens simply load slowly **once** instead of failing on the 10 s timeout. No delay once the server is awake. |
| **Honest feedback** | After 1.2 s of waiting, a banner explains that the server is waking up (with a live counter), confirms when it's ready, and offers **Réessayer** if it never answers within 2 minutes. |
| **Mid-session sleep** | If the server falls asleep while the tab is open, failed `GET`s are re-woken and **replayed once**; `POST/PUT/DELETE` are **never replayed automatically** (a timed-out write may have succeeded) — the server is simply woken for the user's manual retry. Returning to a long-idle tab triggers a background check. |

> **Keeping the service awake (optional).** An external uptime monitor (e.g. UptimeRobot or cron-job.org) pinging `/api/health` every ~14 minutes prevents the idle spin-down. It's not an officially supported Render feature, and a paid instance type removes the behaviour entirely.

---

## Getting started (local)

**Prerequisites:** Node.js 18+ and a MongoDB database (a free [Atlas](https://www.mongodb.com/atlas) cluster works).

```bash
# 1. Clone
git clone https://github.com/<your-username>/Uni-Lib.git
cd Uni-Lib

# 2. Backend
cd backend
cp .env.example .env        # then fill in MONGODB_URI and SECRET_KEY
npm install
npm run dev                 # → http://localhost:5000  (health: /api/health)

# 3. Frontend (new terminal)
cd frontend
cp .env.example .env
npm install
npm start                   # → http://localhost:3000
```

### Create the first staff account

New accounts are always students, so bootstrap the first staff member once, by hand:

1. Register normally through the app.
2. In Atlas (**Browse Collections → `users`**) or `mongosh`, set the role:

```js
db.users.updateOne({ email: "you@university.dz" }, { $set: { role: "staff" } })
```

From then on, staff can promote other users through the API (`PUT /api/users/:id/promote-to-staff`).

### Load the catalog (optional)

If you have the catalog dump, restore the books collection with:

```bash
mongorestore --uri "<your MONGODB_URI>" --nsInclude "librairie_universitaire.books" sauvegarde_atlas/
```

---

## Deploying to Render

The repository contains a [`render.yaml`](render.yaml) blueprint describing both services.

1. **MongoDB Atlas** — create a cluster and a database user. Under *Network Access*, allow `0.0.0.0/0` (Render's free tier has no fixed outbound IP).
2. **Render** → *New + → Blueprint* → select this repository → *Apply*.
3. Set the secrets in the dashboard:

   | Service | Variable | Value |
   |---|---|---|
   | `unilib-api` | `MONGODB_URI` | your Atlas connection string |
   | `unilib-api` | `CLIENT_URL` | the frontend URL, **no trailing slash** |
   | `unilib-api` | `SECRET_KEY` | generated automatically |
   | `unilib-web` | `REACT_APP_API_URL` | `https://<api-service>.onrender.com/api` |

4. The two services need each other's URL, so after the first deploy: fill in the values above, then **manually redeploy the frontend** (`REACT_APP_*` values are baked in at build time).
5. The blueprint already declares the single-page-app rewrite (`/* → /index.html`), so deep links such as `/login` work on refresh.

---

## Project structure

```
Uni-Lib/
├── backend/
│   ├── controllers/        # Book, Loan, User, Favorite, Notification logic
│   ├── middlewares/        # auth (JWT + DB re-check), staff-only, rate limiter, validation
│   ├── models/             # Mongoose schemas + indexes
│   ├── routes/             # Express routers
│   ├── validation/         # express-validator rule sets
│   ├── utils/              # logger, in-memory TTL cache
│   ├── reminderService.js  # daily due-date reminders (node-cron)
│   └── server.js
├── frontend/
│   ├── public/             # index.html (boot splash), logo
│   └── src/
│       ├── components/     # Navbar, modals, notifications, profile, shared widgets
│       ├── context/        # theme (dark mode)
│       ├── hooks/          # useFavorites, useBookDetail, useModalA11y, …
│       ├── pages/          # LandingPage, auth, Students/, STAFF/, shared/
│       ├── services/       # api client, serverWarmup, domain services
│       └── utils/          # logger, normalizeBook, criticalAssets
├── docs/screenshots/       # images used by this README
└── render.yaml             # Render blueprint
```

---

## Roadmap

Identified during the audit and consciously left for a next iteration:

- [ ] Application-wide rate limiting (today: login and registration)
- [ ] Complete `aria-label` coverage on icon-only controls
- [ ] Persistent audit trail of staff actions (approvals, rejections, deletions, promotions)
- [ ] Integration tests on the critical flows — auth, concurrent loan approval, favorites, search

---

<div align="center">

Built for the Faculté des Langues Étrangères · Université Oran 2 Mohamed Ben Ahmed

</div>
