# Mister

Canada-wide, Uber-style marketplace for skilled trade contractors. Customers browse contractors, negotiate a price by chat, pay into escrow on acceptance, then track the contractor live on job day. Built mobile-first.

**Status: Phase 1 of 4** — project structure, database schema, and JWT + Google OAuth auth with role-based routing. Contractor profile creation (phase 2) is next.

## Folder structure

```
mister/
├── backend/                  Node.js + Express API (deploy: Railway)
│   └── src/
│       ├── config/           env.js, db.js (pg pool)
│       ├── controllers/      auth logic split from routes
│       ├── db/                schema.sql, seed.sql, migrate.js, seed.js
│       ├── middleware/        auth.js (JWT + role guard), errorHandler.js
│       ├── routes/            authRoutes.js, index.js
│       ├── services/          authService.js (password + Google OAuth)
│       ├── sockets/           Socket.io init — chat/GPS handlers land in a later phase
│       ├── utils/             jwt.js, password.js, AppError.js
│       ├── app.js             Express app (middleware, routes)
│       └── server.js          HTTP + Socket.io entrypoint
│
├── frontend/                 React + Vite SPA (deploy: Vercel)
│   └── src/
│       ├── components/        Button, TextField, RoleToggle, DashboardShell
│       ├── context/           AuthContext (JWT session state)
│       ├── pages/
│       │   ├── auth/          LoginPage, RegisterPage (role picker + Google)
│       │   ├── contractor/    ContractorDashboard, ContractorOnboarding (stub)
│       │   ├── customer/      CustomerDashboard (stub)
│       │   └── admin/         AdminDashboard (stub)
│       ├── routes/            ProtectedRoute (role-based guard)
│       ├── services/          api.js (axios + JWT interceptor), authApi.js, socket.js
│       └── App.jsx            Router + role-based redirects
│
└── README.md
```

## Database schema

`backend/src/db/schema.sql` creates all 11 tables from the spec: `users`, `contractor_profiles`, `customer_profiles`, `trades`, `jobs`, `offers`, `messages`, `reviews`, `disputes`, `payments`, `notifications` (plus a small `contractor_trades` join table for secondary skills).

Notes:
- Money is stored as **integer cents** (`_cad` columns) to avoid floating-point rounding — e.g. $150.00 CAD is stored as `15000`.
- `job_status`, `offer_status`, `payment_status`, `dispute_status`, `user_role` are Postgres enums matching the flows in the spec (pending → scheduled → en_route → arrived → in_progress → completed → confirmed, or → disputed / cancelled).
- `payments` is 1:1 with `jobs` and tracks the full Stripe Connect escrow lifecycle (`authorized` → `captured` → `released`, or `refunded`).
- `offers` supports counter-offers via `parent_offer_id`.
- `seed.sql` inserts 12 starter trade categories (Plumbing, Electrical, Carpentry, HVAC, etc.).

## Auth system

- **Password auth**: bcrypt-hashed passwords, JWT (7-day expiry by default) signed with `JWT_SECRET`.
- **Google OAuth**: frontend uses `@react-oauth/google` to get a Google ID token; backend verifies it with `google-auth-library`. First-time Google sign-ups must pick a role (customer/contractor) — the frontend handles this by bouncing to the role picker on `/register` if the backend returns `ROLE_REQUIRED`.
- **Roles**: `contractor`, `customer`, `admin`. Admin accounts are **not** self-serve (no public admin signup) — provision them directly in the database once the admin dashboard exists.
- **Role-based routing**: `ProtectedRoute` on the frontend redirects unauthenticated users to `/login` and redirects users to their own role's dashboard if they hit a route they don't own. `requireRole()` on the backend does the same for API routes.
- Registering as a `customer` auto-creates an empty `customer_profiles` row. Registering as a `contractor` does **not** — that's the dedicated onboarding flow, next phase.

## Local setup

### 1. Database
```bash
createdb mister
cd backend
cp .env.example .env        # fill in DATABASE_URL at minimum
npm install
npm run db:migrate          # applies schema.sql
npm run db:seed             # inserts starter trades
```

### 2. Backend
```bash
cd backend
npm run dev                 # http://localhost:4000
```

### 3. Frontend
```bash
cd frontend
cp .env.example .env
npm install
npm run dev                 # http://localhost:5173
```

## What you'll need to create before things fully work

This scaffold is code-complete for phase 1, but several pieces need **your own accounts and keys** — I don't have access to provision these for you:

| Service | Used for | Where to get it |
|---|---|---|
| PostgreSQL | All data | Local Postgres, or a hosted instance (Railway Postgres plugin is easiest since the API deploys there too) |
| Google Cloud OAuth Client | Google sign-in | console.cloud.google.com → APIs & Services → Credentials → OAuth Client ID (Web application) — add `http://localhost:5173` and your Vercel domain as authorized origins |
| Stripe | Escrow payments (phase 3) | dashboard.stripe.com → enable Connect |
| Cloudinary | Photo uploads (phase 2) | cloudinary.com dashboard |
| Mapbox | Live tracking map (phase 4) | account.mapbox.com → Tokens |
| Resend | Email notifications | resend.com → API Keys |
| Vercel | Frontend hosting | vercel.com, point at `frontend/` |
| Railway | Backend + Postgres hosting | railway.app, point at `backend/` |

Until you plug real keys in, `npm run dev` still works fully for register/login/Google-OAuth-once-configured against a local Postgres — payments, uploads, maps, and email simply aren't wired up yet (those come in later phases).

## Next phase

**Contractor profile creation flow**: trade selection, bio, certifications upload, service area (map-based radius picker), market rate, profile photo + portfolio photos via Cloudinary — replacing the `ContractorOnboarding` stub page.
