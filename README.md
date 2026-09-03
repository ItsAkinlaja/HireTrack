# HireTrack — Candidate Hiring Tracker

A focused, production-quality MVP that helps a company collect, evaluate, and move job applicants through a structured hiring pipeline.

Built as a technical assessment submission for ProVA.

---

## What It Does

HireTrack gives a recruiter a single place to:

- Add and manage candidates with full profile details
- Move candidates through six hiring stages on a drag-and-drop Kanban board
- Rate candidates (1–5 stars) and add timestamped notes
- Search by name, email, or position; filter by stage or rating; sort by date or rating
- See a live dashboard with pipeline statistics, recent candidates, and activity history
- Track every meaningful event (stage changes, notes, edits) on a per-candidate timeline

---

## Tech Stack & Why

| Layer | Choice | Reason |
|---|---|---|
| **Backend** | Laravel 12 (PHP 8.2) | Clean REST API conventions, Eloquent ORM, Form Requests for validation, API Resources for consistent JSON — production patterns without boilerplate |
| **Frontend** | React 19 + TypeScript | Component model, strong typing, and the ecosystem (React Query, React Hook Form, Zod) maps directly to the problem |
| **Styling** | Tailwind CSS v4 | Utility-first, consistent spacing/colour system, no context switching between CSS files |
| **UI Primitives** | Radix UI | Accessible, unstyled components — dialog, select, tooltip — without a full component library |
| **Data Fetching** | TanStack Query | Caching, background refetch, loading/error states out of the box |
| **Forms** | React Hook Form + Zod | Performant forms with schema-driven client validation that mirrors server validation |
| **Drag & Drop** | dnd-kit | Modern, accessible DnD with pointer sensor — no legacy dependencies |
| **Charts** | Recharts | Lightweight, composable — used for the pipeline donut chart |
| **Auth** | Laravel Sanctum | Token-based SPA authentication — simple and secure without the overhead of OAuth |
| **Database** | MySQL | Relational, well-suited to the candidate/note/activity relationships |

---

## Architecture

```
Browser (React SPA)
  └── TanStack Query → Axios (/api/*)
                            └── Laravel API Routes (auth:sanctum middleware)
                                    └── Controllers
                                           └── Eloquent Models
                                                  └── MySQL
```

The React app lives inside Laravel's `resources/js/` directory and is compiled by Vite. `php artisan serve` runs the entire application — no separate frontend server needed in production.

In development, `npm run dev` runs Vite with HMR alongside `php artisan serve`.

---

## Extra Features (Beyond the Brief)

Two focused extras were added — both add genuine value to a recruiter without bloating the codebase:

### 1. Activity Timeline
Every meaningful event on a candidate is logged automatically:
- Profile created
- Stage changed (with from/to metadata)
- Note added / deleted
- Profile updated

Stored in the `activities` table. Displayed as a chronological timeline on the candidate detail panel. Implemented via a simple `ActivityLogger` service class — no event sourcing, no queues.

### 2. Dashboard Statistics
A dedicated dashboard with:
- Candidate counts per stage (live from the database)
- Pipeline breakdown donut chart
- Recent candidates list
- Paginated activity feed

Powered by `GET /api/dashboard/stats` and `GET /api/dashboard/recent-activity` — two lightweight aggregation queries.

---

## Setup

### Prerequisites
- PHP 8.2+
- Composer 2.x
- Node.js 18+
- MySQL (XAMPP, Laragon, or native)

### 1. Clone and enter the project

```bash
git clone https://github.com/ItsAkinlaja/HireTrack.git
cd HireTrack
```

### 2. Install PHP dependencies

```bash
composer install
```

### 3. Configure environment

```bash
cp .env.example .env
php artisan key:generate
```

Edit `.env`:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=hiretrack
DB_USERNAME=root
DB_PASSWORD=
```

### 4. Create the database

Create a MySQL database named `hiretrack`.

### 5. Run migrations and seed demo data

```bash
php artisan migrate:fresh --seed
```

This creates all tables and seeds 13 realistic demo candidates across all 6 stages, plus a demo user account.

**Demo login:**
```
Email:    akinlajatimileyin@gmail.com
Password: Timi@2020
```

### 6. Install frontend dependencies

```bash
npm install
```

### 7. Start the application

**Terminal 1 — Laravel API + SPA server:**
```bash
php artisan serve
```

**Terminal 2 — Vite (development HMR):**
```bash
npm run dev
```

Open [http://localhost:8000](http://localhost:8000).

For production (no Vite process needed):
```bash
npm run build
php artisan serve
```

---

## API Reference

All endpoints except `POST /api/auth/login` require a `Authorization: Bearer <token>` header.

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/login` | Authenticate, receive token |
| `POST` | `/api/auth/logout` | Revoke token |
| `GET` | `/api/auth/me` | Current user |
| `GET` | `/api/candidates` | List candidates (`search`, `stage`, `rating`, `sort_by`, `sort_dir`) |
| `POST` | `/api/candidates` | Create candidate |
| `GET` | `/api/candidates/{id}` | Get candidate with notes and activities |
| `PUT` | `/api/candidates/{id}` | Update candidate |
| `DELETE` | `/api/candidates/{id}` | Delete candidate |
| `PATCH` | `/api/candidates/{candidate}/stage` | Update stage only |
| `GET` | `/api/candidates/{id}/notes` | List notes |
| `POST` | `/api/candidates/{id}/notes` | Add note |
| `DELETE` | `/api/notes/{id}` | Delete note |
| `GET` | `/api/candidates/{id}/activities` | Candidate activity timeline |
| `GET` | `/api/dashboard/stats` | Counts per stage |
| `GET` | `/api/dashboard/recent-activity` | Latest 15 activity records |

---

## Database Schema

```
users                    — authentication
candidates               — core candidate records (stage, rating, etc.)
notes                    — timestamped notes per candidate
activities               — event log per candidate
personal_access_tokens   — Sanctum tokens
```

Foreign keys with cascade delete ensure notes and activities are removed when a candidate is deleted.

---

## Deploying to Railway (Live Demo)

Railway supports PHP + MySQL and deploys directly from GitHub.

### Steps

1. Go to [railway.app](https://railway.app) and sign in with GitHub
2. Click **New Project → Deploy from GitHub repo** → select `ItsAkinlaja/HireTrack`
3. Add a **MySQL** service to the same project (Railway wires the credentials automatically)
4. Set these environment variables in the Railway dashboard:

```
APP_NAME=HireTrack
APP_ENV=production
APP_DEBUG=false
APP_KEY=           ← generate with: php artisan key:generate --show
APP_URL=           ← Railway will give you this URL after first deploy

DB_CONNECTION=mysql
DB_HOST=           ← from Railway MySQL service (Variables tab)
DB_PORT=3306
DB_DATABASE=railway
DB_USERNAME=root
DB_PASSWORD=       ← from Railway MySQL service

SESSION_DRIVER=file
CACHE_STORE=file
```

5. Click **Deploy** — Railway installs dependencies, builds the frontend, runs migrations and seeds automatically.

The `nixpacks.toml` in the repo configures the exact build steps. No additional server configuration needed.

---


- **No multi-user roles** — authentication is included to demonstrate session-aware API design, but role-based access was not part of the brief
- **Resume links are URLs** — no file upload infrastructure needed
- **No email notifications** — out of scope per the brief
- **Single-tenant** — all authenticated users see the same data; scoping to users would be a natural next step

---

## Project Structure

```
├── app/
│   ├── Http/Controllers/Api/    # AuthController, CandidateController, NoteController, DashboardController
│   ├── Http/Requests/           # Form Request validators (StoreCandidateRequest, etc.)
│   ├── Http/Resources/          # API Resources (CandidateResource, NoteResource, ActivityResource)
│   ├── Models/                  # Candidate, Note, Activity, User
│   └── Services/ActivityLogger  # Centralised activity logging
├── database/
│   ├── migrations/              # All table migrations
│   └── seeders/                 # UserSeeder, CandidateSeeder
├── routes/api.php               # All API routes
└── resources/js/                # React application
    ├── api/                     # Axios client + typed API functions
    ├── components/              # React components
    │   ├── ui/                  # Primitives (Button, Input, Dialog, Select, etc.)
    │   ├── AuthPage.tsx         # Login screen
    │   ├── DashboardPage.tsx    # Dashboard with stats + charts
    │   ├── CandidateDetail.tsx  # Candidate drawer (notes, activity, stage)
    │   ├── KanbanBoard.tsx      # Drag-and-drop pipeline
    │   ├── CandidateCard.tsx    # Pipeline card
    │   ├── FilterBar.tsx        # Search, filter, sort controls
    │   └── Sidebar.tsx          # Navigation
    ├── types/index.ts           # TypeScript interfaces
    ├── lib/utils.ts             # Helpers, stage config, formatters
    └── main.tsx                 # App entry point
```
