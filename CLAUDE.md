# CLAUDE.md — Secure QR Code Management System (ICT302)

## Project Overview

A Secure QR Code Management System that detects and responds to **physical QR code tampering** in public spaces. Built for the ICT302 unit (clients: Peter Cole, Mike Groeneweg). Group: VAFPQR.

**Current status (20 July 2026):**

| Component | Status |
|---|---|
| Backend API (incl. auth, admin, metrics, activity, demo seed) | ✅ Complete & live on Render |
| Landing page (`landing-web`) | ✅ Integrated & deployed (`/landing`) |
| Admin dashboard (`admin-web`) — all 5 pages + auth pages on real API | ✅ Complete & deployed (SPA at `/`) |
| Render deployment | ✅ Live: `https://ict302-b77o.onrender.com` |
| Mobile app (`mobile-app`, Expo) | 🔄 In progress — Step 1 (auth) committed; Steps 2–3 delivered in session (verify committed); Steps 4–7 remaining |
| Sprint 5 system testing (Vanessa, 18–31 July) | 🔄 In progress |

**⏰ Hard deadline: client demo 22 July 2026. Final submission 1 August 2026.**

**Core design philosophy (non-negotiable):**
QR codes encode **plain HTTPS URLs only**. All security logic (JWT validation, expiry, blacklist, logging) lives **server-side**. This guarantees backward compatibility — any standard scanner (Apple/Google camera) must be able to scan our codes and open a real page.

**Access model (decided):** Reaching the destination URL **requires the mobile app**. Browser (regular scanner) users still get full server-side verification and a safe/tampered result display on the Landing Page, but there is **no "Continue to destination" path in the browser** — valid codes show an app-download CTA instead. Declining shows a pop-up explaining the app is required.

## Architecture

```
[QR Code] → encodes → https://ict302-b77o.onrender.com/api/qr/verify?token=<QR-JWT>
                                    │
                     verify sig → expiry → blacklist → log scan (ALWAYS)
                                    │
                        User-Agent detection branch
                       ┌────────────┴─────────────┐
              SecureQRApp/1.0                Regular browser
              (mobile app)                   (Apple/Google scanner)
                       │                           │
              JSON verify result           302 → /landing/?valid=&reason=&apk=
              → in-app result screen       → Landing Page reads query params
              → destination reachable      → verify result (green/red)
              → tamper report flow         → app download CTA · NO destination access
```

Express serves everything from one Render service: API under `/api`, Landing Page (static build) under `/landing`, and the admin SPA at `/` with an Express-5-compatible SPA fallback (middleware pattern, **not** `app.get('*')`) so react-router deep links survive refresh.

## Repository Structure (npm workspaces monorepo)

Repo: `RoyYoo716/ICT302` · Live: `https://ict302-b77o.onrender.com` · Supabase project ref: `tnxzfltaarebfgqpndbv`

| Folder | Purpose |
|---|---|
| `backend/` | Node.js + Express + Prisma 7 API (`src/routes`: auth, qr, alert, admin; `src/services`; `prisma/` with `seed-admin.js`, `seed-demo.js`) |
| `landing-web/` | Landing Page (Vite + React JSX, teammate's Figma Make export, rewired) |
| `admin-web/` | Admin dashboard (Vite + React JSX, Figma Make export, fully integrated) |
| `mobile-app/` | Expo / React Native app (expo-router, teammate's scaffold, integration in progress) |
| `landing-page-version-2/` | Teammate's alternate landing draft — **not wired into any build**; ignore unless adopted |
| `FRONTEND_TASKS.md` | Frontend task tracking |

Branches: `main` (Render deploy branch), `mobile-integration` (active mobile work), `frontend-integration` / `landing-integration` (merged into main), `royyoo`.

> ⚠️ **Known repo issue — fix before final submission:** the **root `package.json` was overwritten with the mobile app's package.json** (name `vafpqr-mobile-app`, Expo dependencies at root) while keeping a `workspaces` array that lists `"app"` — but the actual folder is `mobile-app`. Restore a clean root manifest: name it for the monorepo, remove the Expo deps (they belong in `mobile-app/package.json`, which already has them), and fix the workspaces list to `["backend", "landing-web", "admin-web", "mobile-app"]`.

## Tech Stack (do not deviate)

| Layer | Technology | Notes |
|---|---|---|
| Backend | Node.js, Express, Prisma ORM v7 (`prisma-client-js` generator + `@prisma/adapter-pg`), jsonwebtoken, bcrypt, multer | multer must use `memoryStorage` |
| Database | Supabase PostgreSQL | See **Supabase Connections** — identify connection type by **hostname, never by port** |
| File storage | Supabase Storage (bucket: `alert-photos`, public) | Alert photos only; DB stores the URL. Uploads require the `sb_secret_...` key |
| Web frontend | **Vite + React 18.3.1 — plain JSX (NOT TypeScript)**, Tailwind CSS v4, shadcn/ui (Radix UI), Recharts, react-router 7 | Figma Make export. The old "TypeScript" claim in earlier CLAUDE.md versions was **wrong** — all files are `.jsx`. Build output is `dist/` (Vite) |
| Mobile | **Expo (SDK 57) + expo-router**, React Native 0.86, expo-camera, expo-location, expo-secure-store, expo-image-picker | Android-first. Custom User-Agent `SecureQRApp/1.0` on ALL requests. APK via **EAS preview build → GitHub Releases** (no Play Store) |
| Hosting | Render (single service serves API + landing + admin SPA) | Free tier — ephemeral disk, cold starts (see Demo checklist) |

## Supabase Connections (verified — supersedes ALL older notes)

- `DATABASE_URL` → **Session pooler**: `aws-0-<region>.pooler.supabase.com`, port **5432** — app runtime
- `DIRECT_URL` → **Direct connection**: `db.<project-ref>.supabase.co`, port **5432** — Prisma migrations
- Transaction pooler uses port **6543** (Supavisor removed session mode from 6543 on 28 Feb 2025) — not used by this project
- **Distinguish connection types by hostname, not port.** The old "6543 = runtime pooler" rule is WRONG.
- The Direct connection is IPv6-only and unreachable from typical local networks — locally, point both runtime and Prisma CLI at the Session pooler
- Prisma 7: connection URLs live in `prisma.config.ts`, **not** `schema.prisma` (wrong placement → P1012)

## Auth Model — TWO separate JWT types (never share secrets)

|  | QR Token | Auth Token |
|---|---|---|
| Purpose | lives inside printed QR codes (public) | login sessions (app + web) |
| Secret | `QR_JWT_SECRET` | `AUTH_JWT_SECRET` |
| Payload | qrCodeId, destinationUrl, exp | userId, role, exp |

Rules (all implemented):
- **Registration is one single form**: fullName (required — the field is `fullName`, never `name`), email (required), phoneNumber (optional), password (required). **No role field — every new account is role `user`.** Email format is validated on both frontend and backend, and emails are **lowercase-normalized** before storage/lookup.
- **First admin** seeded from `ADMIN_EMAIL` / `ADMIN_PASSWORD` (`prisma/seed-admin.js`). Never hardcode credentials — hardcoded demo credentials were removed from the live login screen (security fix).
- Further admins promoted via Users page (`PATCH /api/admin/users/:id`). **Last-admin demotion guard** on the server. **Self-role-change is blocked** (backend 400 + frontend disabled button).
- One shared login endpoint for app and web. The **frontend `loginAdmin` rejects non-admin roles** for web access; the backend endpoint stays open for mobile users. Real enforcement = `requireAdmin` middleware.
- `User.lastLogin` is updated on every successful login (single `prisma.user.update` before `signAuthToken`).
- Forgot/Reset password: single-use expiring reset token on the User row; **demo mode returns the reset link in the API response** (no email service).
- Password change (`PATCH /api/auth/password`): wrong current password returns **HTTP 400, not 401** — a 401 would trigger the session-expiry redirect. Same-password reuse is rejected.
- Frontend 401 handler must check **`&& token`**: 401 with a stored token = session expired (redirect); 401 without = bad credentials (show error inline).
- `GET /api/qr/verify` stays **public forever**. Never put auth middleware on it.
- Custom auth (`public.User`, jsonwebtoken + bcrypt) — entirely separate from Supabase Auth. Do not migrate.

## Database Schema (5 tables — live in Supabase; see `schema-reconciliation.md`)

- **QrCode**: id, token, label, destinationUrl, status (`active`/`blacklisted`/`suspicious`/`expired`), expiresAt, **createdById? → User (optional, audit trail only)**, createdAt
- **User**: id, email, passwordHash, fullName, phoneNumber?, role (`user`/`admin`), resetToken?, resetTokenExpiresAt?, **lastLogin?**, createdAt
- **ScanLog**: id, **qrCodeId? (optional — tampered/unknown-token scans have no parent QR)**, scannedAt, ipAddress, userAgent, gpsLat, gpsLng, result
- **Alert**: id, qrCodeId, reporterName?, contactInfo?, gpsLat, gpsLng, photoUrl, description, status (`new`/`resolved`), createdAt
- **ActivityLog**: id, qrCodeId?, type, message, status?, createdAt — feeds Recent Activity. **Four event types: `status_changed`, `alert_created`, `alert_resolved`, `alert_reopened`.**

Schema decisions (documented with rationale — do not revisit):
- Rejected: `ScanLog.qrCodeId NOT NULL` (breaks tampered-scan logging), `photo bytea` (conflicts with Supabase Storage), `User.status` / suspend-restore (needs auth middleware changes — deferred to `future-work.md`), `User.organisationId` and `ActivityLog.ipAddress` (removed as unused).
- ScanLog = raw telemetry (every scan, always); ActivityLog = curated feed events. Never merge them.
- QR images are never stored — regenerate the PNG on demand from the stored token.
- **Never edit the schema in the Supabase Table Editor** — it drifts from `db push` and Prisma. All schema changes go through `schema.prisma`.

## API Endpoints (all implemented & live)

### Public (no auth)
- `GET /api/health` — liveness check; also used to **pre-warm Render before demos**
- `GET /api/qr/verify?token=` — validate signature → expiry → blacklist → **log every attempt to ScanLog** → UA branch: `SecureQRApp/1.0` gets JSON; browsers get `302 → /landing/?valid=…&reason=…&apk=…` (the Landing Page makes **no API call** of its own — avoids double ScanLog)
- `POST /api/alert/report` — multipart: photo (memoryStorage → Supabase Storage → URL), GPS, description, optional reporter fields → QR status → `suspicious` → ActivityLog `alert_created`

### Auth (shared by app and web)
- `POST /api/auth/register` · `POST /api/auth/login` (updates lastLogin) · `POST /api/auth/forgot-password` · `POST /api/auth/reset-password`
- `PATCH /api/auth/profile` (requireAuth — Settings: name/phone) · `PATCH /api/auth/password` (requireAuth; 400 on wrong current password)

### Admin (ALL behind requireAdmin)
- `POST /api/qr/generate` — sign QR-JWT → record with label, status `active`, `createdById = req.user.userId` → base64 PNG of the verify URL
- `GET /api/admin/qrcodes?search=&status=&page=` — server-side search/filter/pagination + summary counts
- `GET /api/admin/qrcodes/export` — CSV (frontend uses raw `fetch` blob download, bypassing the JSON helper)
- `GET /api/admin/qrcodes/:id` — detail pop-up: label, scan history, alerts, PNG regenerated on the fly
- `PATCH /api/admin/qrcodes/:id` — status update → ActivityLog `status_changed`
- `GET /api/admin/alerts?status=&page=` · `PATCH /api/admin/alerts/:id` — resolve **and reopen** → ActivityLog
- `GET /api/admin/users?search=&page=` · `POST /api/admin/users` (admin adds a user) · `PATCH /api/admin/users/:id` (role change, last-admin guard, no self-change) · `DELETE /api/admin/users/:id` — deletion uses a Prisma **`$transaction`** to null `QrCode.createdById` FKs first; **admins must be demoted to user before deletion** (implicitly protects the last admin)
- `GET /api/admin/metrics` — stat cards; **scanVolume in four ranges via rolling-window `buildBuckets`**: `1h` (12×5min), `24h` (12×2h), `1w` (7×1day), `1M` (10×3day); status donut; badge counts. Frontend adapter converts buckets to chart shapes with **browser-timezone labels**. Delta % intentionally omitted from MetricCards.
- `GET /api/admin/activity?page=` — Recent Activity feed

## Web Frontend (admin-web — integration COMPLETE)

- `src/services/api.js` was originally a **1,580-line localStorage simulator with zero real HTTP calls**; now a real API service (~790 lines incl. session helpers).
- Dev: Vite proxy `/api` → `http://localhost:3000`. Prod: same-origin (served by Express).
- Session storage contract: store `{ token, admin }`; backend login returns `{ token, user: { id, fullName, email, role } }` — **map `user` → `admin`**.
- Route guards: `RequireAuth` component gates all dashboard routes; auth pages include Sign in, Register, **Forgot Password, Reset Password**.
- Pages, all on real API: **Dashboard** (stat cards, 4-tab scan volume chart, status donut, Recent Activity), **QR Codes** (server-side search/filter/pagination, generate form with label, CSV export, detail pop-up with Label row; first table column widened to 220px), **Alerts** (photo evidence, GPS formatting, status filter, resolve/reopen; IDs displayed as `alert.id.slice(0, 8)` and `alert.qrLabel || alert.qrCodeId`), **Users** (search, add, role change, delete), **Settings** (profile edit + password change).
- Global alert badge count reflects real unresolved alerts.
- Dead mock code removed (`handleMarkReviewed`, `adminNotes`, `NotificationsCard`, `ResetPasswordModal`, `UserFormModal`-era leftovers, etc.).
- Landing Page (`landing-web`): reads `valid` / `reason` / `apk` query params only; three-state popup (`null` / `'coming-soon'` / `'app-required'`); design tokens: blue `#2563eb`, 14–18px radius, soft shadows.

## Mobile App (mobile-app — Expo, IN PROGRESS)

**7-step integration plan** (against the live Render backend — no LAN IP):

| Step | Scope | Status |
|---|---|---|
| 1 | Plumbing + Auth (login / register / secure-store session) | ✅ committed (`mobile login, register done`) |
| 2 | `verifyQRCode` real + result screens (5 statuses) | 🔄 code delivered 19 July — **verify it's applied & pushed** |
| 3 | Tamper report multipart submission | 🔄 code delivered 19 July — E2E verification pending |
| 4 | Scan history via AsyncStorage | ⬜ 20 July |
| 5 | Profile / password screens | ⬜ |
| 6 | Mass mock cleanup (demo-critical mock UI removal) | ⬜ 20 July |
| 7 | EAS preview APK build → GitHub Releases → set `APK_DOWNLOAD_URL` on Render → full E2E rehearsal | ⬜ 21 July |

Hard rules learned during Steps 1–3:
- `BASE_URL` comes from `EXPO_PUBLIC_API_BASE_URL`; all requests send User-Agent `SecureQRApp/1.0`.
- Extract the token from the scanned URL with a **regex** — `URL.searchParams` is unimplemented in React Native's JSC and throws.
- Map all five backend statuses (`valid` / `expired` / `invalid` / `blacklisted` / `suspicious`) to the safe/warning screens. No fabricated threat data (`sslValid`, fake report counts, `riskLevel`) — display only what the server returns.
- Multipart tamper report: use plain `fetch` and **do not set a `Content-Type` header** — multer needs the auto-generated boundary.
- The register flow **redirects to login with a success banner** (no auto-login). Field name is `fullName` everywhere (a `name` vs `fullName` mismatch caused silent failures — and never write `catch {}` without the error parameter).
- UI: `KeyboardAvoidingView` on form screens; bottom navigator padded with `useSafeAreaInsets()` (Android gesture bar overlap).
- **Do not delete `mock` data blocks in `api.js` until their consumer functions are replaced** (Step 6 does the mass cleanup).
- A lazy `expireStaleQrCodes()` sweep for admin read endpoints was designed in-session — **not yet in the repo; verify before relying on auto-expiry in the demo**.

## Render Deployment

- Root Directory = `backend`; Start = `npm start` (in a monorepo, `npm start` without `--workspace=` at repo root launches the wrong package — root dir setting avoids this).
- Build command chains: `npm install` → build `landing-web` (`--include=dev`, since Vite is a devDependency under `NODE_ENV=production`) → copy `dist` → `backend/landing-dist` → build `admin-web` → copy → `backend/admin-dist` → `npx prisma generate` (Method B: everything lives under `backend/` at runtime).
- **Deploy branch = `main`.** Feature branches (`landing-integration`, `frontend-integration`) are merged in; confirm the dashboard setting whenever a temporary branch deploy was used.
- **P2022 (`column does not exist`) after a schema change = stale Prisma Client on Render** → "Clear build cache & deploy". Run `npx prisma generate` explicitly even when `db push` says "already in sync".
- Env vars live in the Render dashboard, never in code.

**Demo-day checklist (22 July):** hit `GET /api/health` ~5 minutes beforehand to wake the free-tier instance (cold start); rescan flow rehearsed end-to-end (generate → print/screen → phone camera → landing, and app scan → result → tamper report → alert visible in dashboard).

## Environment Variables (never commit)

Backend (Render): `DATABASE_URL` (Session pooler), `DIRECT_URL` (Direct), `QR_JWT_SECRET`, `AUTH_JWT_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `SUPABASE_URL`, `SUPABASE_SERVICE_KEY` (**`sb_secret_...` only** — publishable key fails RLS on Storage uploads), `APK_DOWNLOAD_URL` (set after Step 7).
Mobile: `EXPO_PUBLIC_API_BASE_URL` = `https://ict302-b77o.onrender.com`.

## Remaining Work (in order, as of 20 July)

1. **Mobile Step 4 + Step 6** (today): AsyncStorage scan history; remove demo-critical mock UI. Confirm Steps 2–3 code is committed and Step 3 E2E passes.
2. **21 July**: EAS preview standalone APK → GitHub Releases → `APK_DOWNLOAD_URL` on Render → full E2E rehearsal.
3. **22 July**: client demo (pre-warm via `/api/health`).
4. **Repo hygiene**: restore the corrupted root `package.json` (see Repository Structure warning); decide fate of `landing-page-version-2`; commit/land `expireStaleQrCodes()` if adopted.
5. **Sprint 5 support (through 31 July)**: assist Vanessa's system testing; bug fixes.
6. **Docs**: User Manual, Installation/Deployment Guide, Final Project Report; amend PMP WBS 5.1.2 ("Continue to destination" button) to match the app-required decision.

## Security & Quality Requirements

- Passwords hashed with bcrypt — never stored or logged in plain text
- Alert photo uploads: image MIME types only, file size limit enforced (risk R14)
- Redirect latency ≤ 3 seconds (app path)
- Expired and blacklisted tokens blocked 100% of the time; every scan attempt logged, including failures
- Last-admin demotion guard; admins must be demoted before deletion; no self-role-change
- No hardcoded credentials anywhere (incl. login screen placeholders); never commit secrets

## Out of Scope — do not build

- ISO 18004 standard extension · time-based redirect service (optional extras)
- iOS App Store / Play Store distribution
- Physical protection of printed codes (detect-and-respond only)
- Browser path to the destination URL (app-required decision)
- Standalone Analytics / Security dashboard pages (old 8-item sidebar dropped)
- Scan-volume-spike anomaly detection
- Real email delivery for password reset (demo returns the link in the response)
- Migrating auth to Supabase Auth
- **Deferred to `future-work.md`** (documented, not built): account Suspend/Restore, email notification preferences (nodemailer), admin-initiated password reset, 2FA

## Known Limitations (document in final report, don't solve)

1. App cannot auto-receive the scanned token post-install — users must rescan after installing
2. iOS users cannot sideload the APK; they can see the verification result but can never reach the destination URL
3. Team PMP WBS 5.1.2 ("Continue to destination" button) must be amended to match the app-required decision so test cases stay consistent

## Hard-Won Lessons (violating these caused real failures)

1. **Never use multer `diskStorage` on Render** — ephemeral filesystem. `memoryStorage` + Supabase Storage from the start.
2. **Two DB connection strings, identified by hostname** — never by port (Feb 2025 Supavisor change broke the old port rule).
3. **Prisma 7 breaking changes**: URLs in `prisma.config.ts` (else P1012); generator explicitly `prisma-client-js`; `@prisma/adapter-pg` required; run `npx prisma generate` explicitly (also after every `rm -rf node_modules` — workspace deps are hoisted to the root `node_modules`).
4. **P2022 on Render = stale Prisma Client** → clear build cache & redeploy.
5. **Never edit the schema in the Supabase Table Editor** — causes drift from `db push`.
6. **Supabase Storage uploads need the `sb_secret_...` key**; store only the photo **URL** in Alert.
7. **401 handler needs `&& token`** — otherwise wrong-password 401s trigger the session-expiry redirect. Related: wrong-current-password on password change returns **400**, not 401.
8. **Git Bash heredoc corruption**: files of 150+ lines must be created via an editor, never `cat << EOF`.
9. Watch for nested `ICT302/ICT302` folders when cloning — verify the working directory first.
10. The frontend is the **Figma Make export (Vite + JSX)** — never reintroduce CRA/react-scripts, and never assume TypeScript.
11. **React Native**: `URL.searchParams` doesn't exist in JSC (use regex); multipart `fetch` must omit `Content-Type`; field contract is `fullName`.
12. The Landing Page must never call the verify API itself — the server already logged the scan; a second call double-counts ScanLog.

## Development Environment & Workflow

- OS: Windows; shell: **Git Bash** (not cmd/PowerShell). API testing: Postman.
- Repo: `RoyYoo716/ICT302`; run `git pull` at the start of every session.
- **Claude session pattern: clone the working branch at session start** (`git clone --depth 1 --branch <branch> …`) and read files directly from the repo — the repo is the source of truth. Search past conversations before asking Roy to re-paste anything Claude previously produced.
- Follow the **Remaining Work** order above.

## Communication Preferences

- Respond in Korean; code and comments in English.
- Explain concepts from first principles with an analogy before implementation steps; confirm understanding on major architectural decisions before executing.
- Give **exact file paths and line-level locations** — never "same pattern as before".
- **Code edit instructions must always show the complete before-code and complete after-code blocks verbatim** — never summaries like "keep the existing props".
- Prefer one decisive recommendation with reasoning over a menu of options; no hedging ("probably", "maybe") about code Claude itself designed.
