# 📚 BookVerse

> A modern digital library web app — browse, borrow, and manage books with a beautiful, fully responsive interface.

![BookVerse](https://img.shields.io/badge/BookVerse-Library%20App-8B4513?style=for-the-badge&logo=bookstack&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-336791?style=for-the-badge&logo=postgresql&logoColor=white)

---

## Overview

BookVerse is a full-stack book management web application that lets users explore a curated library, borrow books, and track their reading history. It features a warm, editorial design inspired by independent bookstores, with a custom-built authentication system powered by Clerk.

---

## Features

### For Visitors
- **Home Page** — Cinematic hero section, animated marquee strip, featured books carousel, genre category grid, and testimonials
- **All Books** — Browse the full catalogue with live search and category filtering
- **Book Details** — Full book info, author, genre tags, and a one-click borrow button

### For Registered Members
- **Borrow Books** — Borrow any available title; inventory tracked in real time
- **My Profile** — View currently borrowed books and full borrowing history
- **Reading Preferences** — Set favourite genres during sign-up for personalised recommendations

### Authentication
- **Custom Sign In** — Split-panel design with Google OAuth, email/password, show/hide toggle, "Remember me", and a complete forgot-password flow (email → OTP → reset)
- **3-Step Sign Up** — Personal details → Genre preferences (8 tiles) → Email OTP verification

---

## Pages

| Route | Description |
|-------|-------------|
| `/` | Home — hero, featured books, genres, testimonials |
| `/all-books` | Full catalogue with search + filter |
| `/books/:id` | Book detail with borrow action |
| `/profile` | Member dashboard — borrowed & history |
| `/sign-in` | Custom Clerk sign-in page |
| `/sign-up` | 3-step registration wizard |

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, Vite 7, TypeScript |
| Styling | Tailwind CSS v4, Framer Motion |
| Routing | Wouter |
| Data Fetching | TanStack Query v5 + Orval codegen |
| Backend | Express 5, Node.js, pino logging |
| Database | PostgreSQL 14+ with Drizzle ORM |
| Auth | Clerk (`useSignIn` / `useSignUp` hooks) |
| API Contract | OpenAPI 3.0 + Zod validation |
| Monorepo | pnpm workspaces |

---

## Project Structure

```
bookverse/
├── artifacts/
│   ├── api-server/              # Express REST API  →  :8080/api
│   │   └── src/
│   │       ├── routes/          # /books  /borrows  /users
│   │       ├── middlewares/     # Clerk auth middleware
│   │       └── index.ts
│   └── bookverse/               # React + Vite frontend  →  :5173
│       └── src/
│           ├── pages/           # home  all-books  book-details  profile  auth
│           ├── components/
│           │   ├── layout/      # Navbar, Footer
│           │   └── ui/          # shadcn/ui primitives
│           └── App.tsx
├── lib/
│   ├── db/                      # Drizzle schema + seed data
│   │   └── src/schema/          # books  borrows
│   └── api-spec/                # OpenAPI spec + generated hooks
├── .vscode/
│   ├── tasks.json               # One-click "Start All" task
│   └── extensions.json          # Recommended extensions
└── README.md
```

---

## Getting Started

### Prerequisites

- Node.js v20+
- pnpm v9+ — `npm install -g pnpm`
- PostgreSQL v14+

### 1. Install dependencies

> **macOS / Windows only:** Before running `pnpm install`, open `pnpm-workspace.yaml` and delete the `overrides:` block at the bottom. Those entries pin Linux-only native binaries for the Replit environment.

```bash
pnpm install
```

### 2. Configure environment variables

```bash
cp artifacts/api-server/.env.example  artifacts/api-server/.env
cp artifacts/bookverse/.env.example   artifacts/bookverse/.env
```

**`artifacts/api-server/.env`**

```env
PORT=8080
NODE_ENV=development
DATABASE_URL=postgresql://postgres:password@localhost:5432/bookverse
CLERK_SECRET_KEY=sk_test_...
CLERK_PUBLISHABLE_KEY=pk_test_...
SESSION_SECRET=any_long_random_string
```

**`artifacts/bookverse/.env`**

```env
PORT=5173
BASE_PATH=/
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
VITE_CLERK_PROXY_URL=
```

> Get your Clerk keys from [dashboard.clerk.com](https://dashboard.clerk.com) → **API Keys**.
> Enable **Email + Password** and optionally **Google** under User & Authentication → Email, Phone, Username.

### 3. Set up the database

```bash
# Create the database
psql -U postgres -c "CREATE DATABASE bookverse;"

# Push schema (creates tables)
pnpm --filter @workspace/db run push

# Seed 12 books
pnpm --filter @workspace/db run seed
```

### 4. Run the app

**Option A — VS Code (recommended)**

Press `Ctrl+Shift+B` (or `Cmd+Shift+B`) and choose **BookVerse: Start All**.
Both servers start automatically in dedicated terminal panels.

**Option B — Manual**

```bash
# Terminal 1 — API server
pnpm --filter @workspace/api-server run dev:local

# Terminal 2 — Frontend
pnpm --filter @workspace/bookverse run dev:local
```

Open **http://localhost:5173** in your browser.

---

## Database Schema

### `books`
| Column | Type | Description |
|--------|------|-------------|
| id | serial PK | Auto-increment ID |
| title | text | Book title |
| author | text | Author name |
| genre | text | Genre tag |
| description | text | Synopsis |
| coverUrl | text | Cover image URL |
| totalCopies | int | Total inventory |
| availableCopies | int | Currently available |
| createdAt | timestamp | Record created |

### `borrows`
| Column | Type | Description |
|--------|------|-------------|
| id | serial PK | Auto-increment ID |
| userId | text | Clerk user ID |
| bookId | int FK | References books.id |
| borrowedAt | timestamp | Borrow date |
| returnedAt | timestamp | Return date (null if active) |

---

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/books` | — | List all books |
| GET | `/api/books/:id` | — | Get book by ID |
| POST | `/api/borrows` | ✓ | Borrow a book |
| GET | `/api/borrows/my` | ✓ | My active borrows |
| GET | `/api/borrows/history` | ✓ | My borrow history |
| POST | `/api/borrows/:id/return` | ✓ | Return a book |
| GET | `/api/users/me` | ✓ | Get current user profile |

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| `pnpm install` fails on macOS/Windows | Delete the `overrides:` block from `pnpm-workspace.yaml` |
| `DATABASE_URL must be set` | Ensure `artifacts/api-server/.env` exists with a valid connection string |
| `PORT environment variable is required` | Use `dev:local` scripts, not the plain `dev` script |
| Clerk "Invalid publishable key" | Make sure `VITE_CLERK_PUBLISHABLE_KEY` is the `pk_test_...` key, not the secret |
| Google sign-in button does nothing | Enable Google social connection in your Clerk dashboard |
| Books not showing | Run `pnpm --filter @workspace/db run seed` to load the 12 seed books |

---

## License

MIT — free to use, modify, and distribute.
