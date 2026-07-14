# Frontend Integration Plan — ICT302 (Claude Code working doc)

> Read `CLAUDE.md` first. This doc adds frontend-specific tasks on top of it.
> Work phase by phase. Commit at the end of each phase on branch `frontend-integration`.

## Context

- Backend: deployed and verified at `https://ict302-b77o.onrender.com` (all APIs live, DB connected, phone-scan E2E passed)
- Repo layout (supersedes CLAUDE.md's single-frontend assumption):
  - `backend/` — Express API (complete)
  - `admin-web/` — Figma Make export (Vite + React 18.3.1 + TS + Tailwind v4 + shadcn/ui + Recharts + react-router 7). Admin dashboard + auth pages. Currently running on mock data.
  - `landing-web/` — separate lightweight Vite app for regular-scanner users
  - `mobile-app/` — Expo (EAS) scaffold. **Out of scope for this plan** — do not touch.

---

## Phase 0 — Baseline & recon (no code changes)

1. `admin-web`: `npm install` → `npm run dev` — confirm it renders with mock data
2. `landing-web`: same check
3. Map the codebase and report before changing anything:
   - Page components and routing structure (which router setup the export uses)
   - Where mock data lives (inline constants? `mock/` folder? per-component?)
   - Existing auth pages and how navigation/guards are currently faked
4. Check `backend/src/app.js` for CORS config — Vite dev server (`http://localhost:5173`) must be allowed in development

**Checkpoint:** dev servers run; mock-data locations listed.

---

## Phase 1 — API client layer (`admin-web/src/lib/api.ts`)

Single shared module all pages will use. Requirements:

- Base URL from `import.meta.env.VITE_API_BASE_URL`; default `''` (relative — production serves same-origin from Express)
- `.env.development`: `VITE_API_BASE_URL=http://localhost:<backend-port>`
- Auth token stored in `localStorage`; automatically attach `Authorization: Bearer <token>` to every request
- Central response handling:
  - `401` → clear token → redirect to login
  - Non-2xx → throw a typed error with the server's `error` message so pages can display it
- Export small typed helpers: `apiGet`, `apiPost`, `apiPatch`, plus `apiUpload` (multipart, no JSON content-type) for future use

**Checkpoint:** can call `GET /api/admin/metrics` from a scratch component using a token obtained via Postman.

---

## Phase 2 — Auth pages + route guards

1. Wire existing auth page UIs to real endpoints:
   - `POST /api/auth/login` — store token + role from response
   - `POST /api/auth/register` — **no role field exists; do not add one**
   - `POST /api/auth/forgot-password` — demo mode: response contains the reset link → display it on screen
   - `POST /api/auth/reset-password`
2. `ProtectedRoute` wrapper: requires token present AND `role === 'admin'`; otherwise redirect to login. (Client-side gating is cosmetic — real enforcement is `requireAdmin` server-side; still implement it for UX.)
3. Logout: clear token → redirect to login
4. Gate ALL dashboard routes behind `ProtectedRoute`

**Checkpoint:** login with seeded admin → land on dashboard; direct URL access while logged out redirects to login; a `role: user` account cannot enter.

---

## Phase 3 — Replace mocks page by page (in this order)

For each page: delete/bypass mock data → fetch from API → loading state → error state → empty state.

### 3.1 Dashboard
- `GET /api/admin/metrics` → 6 stat cards **with period-over-period delta %**, Weekly Scan Volume bar chart (last 7 days, `{total, flagged}` per day, Recharts), status donut, sidebar badge counts
- `GET /api/admin/activity?page=` → Recent Activity table with pagination

### 3.2 QR Codes
- `GET /api/admin/qrcodes?search=&status=&page=` → summary cards + table (status badge, scan count, alert count, expiry, actions)
- Generate form → `POST /api/qr/generate` (destinationUrl, expiry, label) → show returned base64 PNG + details
- Details pop-up → `GET /api/admin/qrcodes/:id` (scan history, alerts, regenerated PNG, Download PNG, Print)
- Status actions → `PATCH /api/admin/qrcodes/:id`
- Export CSV → `GET /api/admin/qrcodes/export` (trigger browser download with the auth header — use fetch + blob, not a bare `<a href>`)

### 3.3 Alerts
- `GET /api/admin/alerts?page=` → photo (Supabase public URL), GPS, description, reporter details, linked QR destination/status
- Resolve → `PATCH /api/admin/alerts/:id`

### 3.4 Users
- `GET /api/admin/users?search=&page=`
- Role change → `PATCH /api/admin/users/:id`; surface the server's **last-admin guard** error message to the UI

### 3.5 Settings
- Password change → `PATCH /api/auth/password`
- Profile edit (name/phone): **⚠ verify the backend endpoint exists.** The implemented API list has no profile-update route. If missing, add `PATCH /api/auth/profile` (requireAuth, updates fullName/phoneNumber) to the backend first — small additive change, no schema impact.

**Checkpoint per page:** works against the deployed Render backend with demo seed data visible.

---

## Phase 4 — Landing page (`landing-web`)

**⚠ Decision point — resolve before coding.** Inspect how `GET /api/qr/verify` currently responds to browser user-agents (stage 7 implementation). The landing app must display the verify result WITHOUT calling verify a second time (a second call would double-log the scan in ScanLog).

Recommended pattern: browser branch of verify responds with a `302` redirect to the landing app route carrying the outcome in query params (e.g. `/scan?status=valid|expired|invalid|blacklisted`). Server keeps all logic; landing app only renders.

Landing app requirements (per CLAUDE.md access model):
- Green "safe" / red "warning" result ALWAYS displayed
- Valid code → APK download CTA (`APK_DOWNLOAD_URL` value passed via query param or a tiny public config endpoint)
- Decline → pop-up: dedicated app required
- **NO Continue-to-destination button** — never render the destination URL as a link
- Mobile responsive (primary audience is phone browsers)

---

## Phase 5 — Serve both apps from Express + redeploy

1. Vite config: `admin-web` gets `base: '/admin/'`; `landing-web` keeps `/`
2. Express (after all API routes):
   - `express.static` for `admin-web/dist` mounted at `/admin` + SPA fallback `/admin/*` → its `index.html`
   - `express.static` for `landing-web/dist` at `/` + catch-all GET fallback → its `index.html`
   - API routes must be registered BEFORE static/fallbacks
3. Render build command (runs in root dir `backend/`; sibling folders exist at `../`):
   ```
   npm install && npx prisma generate && npm --prefix ../landing-web install && npm --prefix ../landing-web run build && npm --prefix ../admin-web install && npm --prefix ../admin-web run build
   ```
   If runtime can't see `../*/dist`, fall back to copying dist folders into `backend/public/` as a build step.
4. Verify on the live domain: `/` → landing, `/admin` → dashboard login, deep-link refresh (e.g. `/admin/qrcodes`) works, phone-scan of a fresh QR shows the real landing page

---

## Rules for this work

- Do not modify backend API contracts (schema reconciliation with the DB teammate is pending — frontend adapts to the API as-is)
- Keep the Figma Make visual design; change data wiring, not styling
- shadcn/ui components stay as exported unless broken
- Never commit `.env*` files with real values
- Commit per phase with clear messages; push so Render deploys can be tested incrementally (Phase 5 only)
