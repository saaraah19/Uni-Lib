# Screenshot guide

The README references 25 images in `docs/screenshots/`. They were captured on a local
instance with sample data. To retake any of them (for example after a design change),
save the new capture with the **same filename** — the README needs no edit.

## Setup (5 minutes)

1. Run the app locally with a database that has the catalog loaded.
2. Create **two accounts**: one student and one staff (see the README, "Create the first staff account").
3. As the student, make some data worth showing: favorite 3–4 books, request 3–4 loans.
4. As staff, approve one, reject one (with a reason), and leave one pending. Return one so History isn't empty.
5. Browser window ≈ **1440 × 900** (DevTools → device toolbar → Responsive → 1440×900), zoom 100 %.
6. Capture with **Win + Shift + S** (Windows) / **Cmd + Shift + 4** (macOS). Save as **PNG**.

## Checklist

| # | File | What to show |
|---|---|---|
| 01 | `01-landing-hero.png` | Landing page, top of page, logged out |
| 02 | `02-landing-faq.png` | Scroll to “Why UniLib” + FAQ (first item open) |
| 03 | `03-register.png` | Register form |
| 04 | `04-login.png` | Login form |
| 05 | `05-student-dashboard.png` | Student dashboard cards |
| 06 | `06-catalog-grid.png` | Catalog with a full page of cards |
| 07 | `07-catalog-filters.png` | Filters panel open with a few filters set |
| 08 | `08-book-detail.png` | Book detail modal |
| 09 | `09-loan-request.png` | Loan modal showing the duration select |
| 10 | `10-my-loans.png` | My Loans with several tabs showing counters |
| 11 | `11-favorites.png` | Favorites page with several books |
| 12 | `12-notifications-dropdown.png` | Bell dropdown open, unread items visible |
| 13 | `13-notifications-page.png` | Full notifications page with stats cards |
| 14 | `14-profile-settings.png` | Profile → Settings (password + theme) |
| 15 | `15-dark-mode.png` | Any busy page in dark mode |
| 16 | `16-mobile-catalog.png` | Catalog at **390 × 844** (phone) |
| 17 | `17-staff-dashboard.png` | Staff dashboard with counters loaded |
| 18 | `18-books-management.png` | Books management list + statistics |
| 19 | `19-book-form.png` | Add/edit form |
| 20 | `20-delete-confirmation.png` | Delete confirmation modal |
| 21 | `21-loan-requests-pending.png` | Loan management, Pending tab |
| 22 | `22-loan-reject-modal.png` | Reject modal with the reason box |
| 23 | `23-loan-history.png` | History tab |
| 24 | `24-reports.png` | Reports page |
| 25 | `25-cold-start-banner.png` | See below |

## Capturing the cold-start banner (25)

Stop the backend, then reload the frontend: after ~1.2 s the “Le serveur se
réveille…” banner appears at the bottom. Screenshot it, then start the backend
again to watch it turn into “✓ Serveur prêt”.

## Tips

- Avoid real student names/emails in captures — use test accounts.
- If a PNG is large (>500 KB), compress it with <https://squoosh.app>.
- For a GIF of the loan flow, [ScreenToGif](https://www.screentogif.com) works well.
