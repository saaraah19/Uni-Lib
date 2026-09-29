# 📚 Uni-Lib

**The digital library and catalogue of the University of Oran 2.**

Browse the catalogue, request books and track your loans online, without having to go to the library first.

---

## 🎯 The Problem

At the University of Oran 2, the library catalogue only existed as a **Word document**, and only the library's administrative staff could use it: they had to search through that file by hand every time someone asked for a book.

For students, this meant:

- **No access to the catalogue.** They couldn't browse the books or know what the library actually had.
- **Research done blindly.** To find a book, they had to ask their teachers and professors for recommendations, or search elsewhere, and write down titles and names.
- **Wasted trips.** With a title in hand, they had to go to the library, **within working hours only**, and ask the staff whether it was available.
- **Slow service for staff too.** Every request meant scrolling through a long document, with no search, no availability status and no loan tracking.

The whole process was slow, tiring and discouraged students from using the library at all.

## 💡 The Solution

**Uni-Lib** replaces the Word catalogue with a searchable web application, available to students anytime, from anywhere, and not only during opening hours.

**For students**
- 🔍 Search the full catalogue by title, author, category or language, and see whether a book is available
- 📖 Open a detailed page for each book (call number / *cote*, authors, category, availability)
- 📥 Request a loan online and follow its status (pending, approved, active, returned)
- ⭐ Save books to a favorites list
- 🔔 Get notifications, including an automatic reminder **3 days before** a book is due
- 🌙 Dark mode

**For library staff**
- 🗂️ Full book management (add, edit, delete)
- ✅ Approve, reject and close loan requests
- ⏰ See overdue loans at a glance
- 📊 Dashboard with statistics and reports

**Security**
- JWT authentication with role-based access (`student` / `staff`)
- Password hashing with bcrypt
- Input validation, rate limiting and secure HTTP headers (Helmet)

---

## 🛠️ Tech Stack

| Layer | Technologies |
|-------|--------------|
| **Frontend** | React 19, React Router 7, Tailwind CSS, Axios, React Toastify, React Icons |
| **Backend** | Node.js, Express 5, Mongoose |
| **Database** | MongoDB (Atlas) |
| **Auth & Security** | JSON Web Tokens, bcryptjs, Helmet, CORS, express-rate-limit, express-validator |
| **Automation** | node-cron (daily due-date reminders at 8 AM) |

---

## 📸 Screenshots

> Add your screenshots to a `docs/screenshots/` folder and update the paths below.

| Landing page | Book catalogue |
|:---:|:---:|
| ![Landing](docs/screenshots/landing.png) | ![Catalogue](docs/screenshots/catalogue.png) |

| Book details | My loans |
|:---:|:---:|
| ![Book details](docs/screenshots/book-detail.png) | ![My loans](docs/screenshots/my-loans.png) |

| Staff dashboard | Loan management |
|:---:|:---:|
| ![Staff dashboard](docs/screenshots/staff-dashboard.png) | ![Loan management](docs/screenshots/loan-management.png) |

---

## 📁 Project Structure

```
Uni-Lib/
├── backend/
│   ├── controllers/      # Books, loans, favorites, notifications, users
│   ├── middlewares/      # Auth, staff-only access, rate limiter, validation
│   ├── models/           # Book, User, Loan, Favorite, Notification
│   ├── routes/           # REST API routes
│   ├── validation/       # Request validators
│   ├── reminderService.js  # Daily cron job for due-date reminders
│   └── server.js
├── frontend/
│   └── src/
│       ├── components/   # Navbar, notifications, profile, shared UI
│       ├── pages/        # Student, Staff, Auth and shared pages
│       ├── hooks/        # Reusable data hooks
│       ├── services/     # API clients
│       └── context/      # Theme (dark mode)
└── sauvegarde_atlas/     # MongoDB backup (BSON) of the library database
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local instance or a MongoDB Atlas cluster)

### 1. Clone the repository
```bash
git clone https://github.com/<your-username>/Uni-Lib.git
cd Uni-Lib
```

### 2. Set up the backend
```bash
cd backend
npm install
```

Create a `.env` file in `backend/`:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
SECRET_KEY=your_jwt_secret
CLIENT_URL=http://localhost:3000
```

Start the server:
```bash
npm run dev
```

### 3. (Optional) Restore the catalogue data
A backup of the database is included in `sauvegarde_atlas/`. To load it into your MongoDB:
```bash
mongorestore --uri "your_mongodb_connection_string" --nsFrom "librairie_universitaire.*" --nsTo "librairie_universitaire.*" sauvegarde_atlas/librairie_universitaire
```
(Adjust the command to your database name if needed.)

### 4. Set up the frontend
```bash
cd ../frontend
npm install
npm start
```

The app runs at **http://localhost:3000** and the API at **http://localhost:5000**.

---

## 🔌 API Overview

| Resource | Base route | Highlights |
|----------|------------|------------|
| Users | `/api/users` | Register, login, profile |
| Books | `/api/books` | Search, filters, categories, stats, CRUD (staff) |
| Loans | `/api/loans` | Request, cancel, history; approve / reject / return (staff) |
| Favorites | `/api/favorites` | Manage saved books |
| Notifications | `/api/notifications` | Read and manage notifications |
| Stats | `/api/stats` | Library statistics for staff |

---

## 👥 Team

Built by students of the University of Oran 2.

- **Name** – role ([GitHub](https://github.com/))
- **Name** – role ([GitHub](https://github.com/))

---

## 📄 License

This project is licensed under the ISC License.