# CLAUDE.md — Secure QR Code Management System (ICT302)

## Project Overview

A Secure QR Code Management System that detects and responds to **physical QR code tampering** in public spaces. Built for the ICT302 unit (clients: Peter Cole, Mike Groeneweg).

**Current status (13 July 2026):**

| Component | Status |
|---|---|
| Backend API (all 10 build stages, incl. demo data seed) | ✅ Complete |
| Web frontend (Figma Make export adopted as codebase) | 🔄 In progress |
| Render deployment | ⬜ Not started |
| React Native mobile app | ⬜ Not started |

**Core design philosophy (non-negotiable):**
QR codes encode **plain HTTPS URLs only**. All security logic (JWT validation, expiry, blacklist, logging) lives **server-side**. This guarantees backward compatibility — any standard scanner (Apple/Google camera) must be able to scan our codes and open a real page.

**Access model (decided):** Reaching the destination URL **requires the mobile app**. Browser (regular scanner) users still get full server-side verification and a safe/tampered result display on the Landing Page, but there is **no "Continue to destination" path in the browser** — valid codes show an app-download CTA instead. Declining shows a pop-up explaining the app is required.

## Architecture

```
[QR Code] → encodes → https://<render-domain>/api/qr/verify?token=<QR-JWT>
                                    │
                     verify sig → expiry → blacklist → log scan (ALWAYS)
                                    │
                        User-Agent detection branch
                       ┌────────────┴─────────────┐
              SecureQRApp/1.0                Regular browser
              (mobile app)                   (Apple/Google scanner)
                       │                           │
              JSON verify result           Landing Page (React)
              → in-app result screen       → verify result (green/red)
              → destination reachable      → app download CTA (APK)
              → tamper report flow         → NO destination access
```

Three deliverable components:
1. **Backend API** — Node.js + Express, serves the React build via `express.static` (✅ built)
2. **Web (React)** — Landing Page, QR Display Page, Admin Dashboard (QRGuard design, Figma Make export)
3. **Mobile app** — React Native, Android-first, distributed as direct APK download (GitHub Releases or Supabase Storage). No Play Store.

## Tech Stack (do not deviate)

| Layer | Technology | Notes |
|---|---|---|
| Backend | Node.js, Express, Prisma ORM v7 (`prisma-client-js` generator + `@prisma/adapter-pg`), jsonwebtoken, bcrypt, multer | multer must use `memoryStorage` |
| Database | Supabase PostgreSQL | See **Supabase Connections** section — identify connection type by **hostname, never by port** |
| File storage | Supabase Storage (bucket: `alert-photos`, public) | Alert photos only; DB stores the URL reference. Uploads require the `sb_secret_...` key |
| Frontend | **Vite + React 18.3.1 + TypeScript**, Tailwind CSS v4, shadcn/ui (Radix UI), Recharts, react-router 7 | Codebase = **Figma Make export**. Build output is `dist/` (Vite), not `build/` (CRA) |
| Mobile | React Native (Android-first) | Custom User-Agent `SecureQRApp/1.0` on ALL requests |
| Hosting | Render | Ephemeral disk — never write files locally |
| Design | Figma (UI designs complete) | **Figma Make export is the frontend foundation** — the old plan of hand-integrating designs via the Figma MCP server is superseded |

> **Why the old React pin is gone:** the previous "React 18.2.0 + react-scripts@5, never upgrade" rule was internal guidance only — the PMP mandates just "React", with no build tool or language. react-scripts is no longer in the project at all; do not reintroduce it.

## Supabase Connections (verified Feb 2025 — supersedes ALL older notes)

- `DATABASE_URL` → **Session pooler**: `aws-0-<region>.pooler.supabase.com`, port **5432** — app runtime
- `DIRECT_URL` → **Direct connection**: `db.<project-ref>.supabase.co`, port **5432** — Prisma migrations
- Transaction pooler uses port **6543** (Supavisor removed session mode from 6543 on 28 Feb 2025) — not used by this project
- **Distinguish connection types by hostname, not port.** The old "6543 = runtime pooler" rule is WRONG and must never be used.
- The Direct connection is IPv6-only and unreachable from typical local networks — locally, point both the app runtime and the Prisma CLI at the Session pooler
- Prisma 7: connection URLs live in `prisma.config.ts`, **not** in `schema.prisma` (putting them in the schema causes error P1012)

## Auth Model — TWO separate JWT types (never share secrets)

|  | QR Token | Auth Token |
|---|---|---|
| Purpose | lives inside printed QR codes (public) | login sessions (app + web) |
| Secret | `QR_JWT_SECRET` | `AUTH_JWT_SECRET` |
| Payload | qrCodeId, destinationUrl, exp | userId, role, exp |

Rules:
- **Registration is one single form for everyone**: fullName (required), email (required), phoneNumber (optional), password (required; confirm-password is client-side only). **There is NO role field — every new account is created as role `user`.**
- **First admin** is created by a seed script reading `ADMIN_EMAIL` / `ADMIN_PASSWORD` from `.env`. Never hardcode credentials.
- Further admins are promoted by an existing admin via the Users page (`PATCH /api/admin/users/:id`).
- **Server must refuse to demote the last remaining admin** (last-admin guard).
- One shared login endpoint for app and web. The web dashboard is gated by role `admin`; client-side role routing is cosmetic — the real enforcement is the `requireAdmin` middleware.
- Middleware: `requireAuth` (valid auth JWT) and `requireAdmin` (auth JWT + role === 'admin').
- Forgot password: generate a single-use reset token with an expiry, stored on the User row. **Demo mode returns the reset link directly in the API response** (no email service). Real email delivery (nodemailer) is optional/later.
- `GET /api/qr/verify` stays **public forever** — regular scanner users have no login. Never put auth middleware on it.
- Auth is a custom implementation (`public.User` table, jsonwebtoken + bcrypt) — entirely separate from Supabase Auth (`auth.users`). Switching to Supabase Auth is not viable: it cannot handle QR tokens, and auth is already complete.

## Database Schema (5 tables — implemented and live in Supabase)

- **QrCode**: id, token, label, destinationUrl, status (`active` / `blacklisted` / `suspicious` / `expired`), expiresAt, createdAt
- **User**: id, email, passwordHash, fullName, phoneNumber?, role (`user` / `admin`), organisationId?, resetToken?, resetTokenExpiresAt?, createdAt
- **ScanLog**: id, **qrCodeId? (optional — tampered/unknown-token scans have no parent QR code)**, scannedAt, ipAddress, userAgent, gpsLat, gpsLng, result
- **Alert**: id, qrCodeId, reporterName?, contactInfo?, gpsLat, gpsLng, photoUrl, description, status (`new` / `resolved`), createdAt
- **ActivityLog**: id, qrCodeId?, type, message, status?, ipAddress?, createdAt — the "ship's log"; feeds the Recent Activity feed. Written on: QR status change, alert created, alert resolved.

Design principles baked into the schema:
- **ScanLog vs ActivityLog**: ScanLog is raw telemetry for analytics (every scan attempt, always); ActivityLog is curated, meaningful events for the dashboard feed. Never merge them.
- **QrCode.status** is a single overwritten state value that drives system behavior; the logs are the append-only history.
- QR images are never stored — regenerate the PNG on demand from the stored token.

## API Endpoints (all implemented)

### Public (no auth)
- `GET /api/qr/verify?token=` — validate signature → check expiry → check blacklist → **log every scan attempt to ScanLog regardless of result** → branch on User-Agent (SecureQRApp/1.0: JSON; browser: Landing Page)
- `POST /api/alert/report` — multipart: photo (multer memoryStorage → Supabase Storage → store URL only), GPS, description, optional reporter name/contact → set QR status to `suspicious` → write ActivityLog entry

### Auth (shared by app and web)
- `POST /api/auth/register` — single format, always creates role `user`
- `POST /api/auth/login` — returns auth JWT (userId, role)
- `POST /api/auth/forgot-password` — creates expiring reset token; demo mode returns the link
- `POST /api/auth/reset-password` — verifies token, sets new password
- `PATCH /api/auth/password` — logged-in password change (Settings page); requireAuth

### Admin (ALL behind requireAdmin)
- `POST /api/qr/generate` — **admin-only** (was public in the old design). Sign QR-JWT → create record (status `active`) with label → return base64 PNG encoding the full verify URL
- `GET /api/admin/qrcodes?search=&status=&page=` — paginated list + summary counts for the stat cards
- `GET /api/admin/qrcodes/:id` — full detail for the details pop-up: scan history, alerts, total scans, and the QR PNG **regenerated on the fly** (Download PNG / Print)
- `PATCH /api/admin/qrcodes/:id` — status update → write ActivityLog
- `GET /api/admin/qrcodes/export` — CSV of all codes
- `GET /api/admin/alerts?page=` — paginated alerts with QR destination/status
- `PATCH /api/admin/alerts/:id` — resolve → write ActivityLog
- `GET /api/admin/users?search=&page=` — user list
- `PATCH /api/admin/users/:id` — role change with last-admin guard
- `GET /api/admin/metrics` — stat cards **with period-over-period deltas** (↗8% style), weekly scan volume (last 7 days, daily {total, flagged}), status donut counts, sidebar badge counts
- `GET /api/admin/activity?page=` — Recent Activity feed from ActivityLog

## Web Pages (React — QRGuard design, Figma Make export)

Sidebar: **Dashboard / QR Codes / Alerts / Users / Settings** (count badges on QR Codes and Alerts). The old 8-item sidebar (Analytics, Security as separate pages) is dropped.

1. **Landing Page** (regular scanner users) — server-side token validation before render; **green "safe" or red "warning" result is ALWAYS displayed**; valid code → app download CTA (uses `APK_DOWNLOAD_URL`); if the user declines → pop-up: a dedicated app is required to use this QR code. **No Continue-to-destination button.** Must be mobile responsive.
2. **QR Display Page / Details pop-up** — QR image, ID, label, destination URL, created/expiry dates, status badge, total scans, Download PNG, Print. Also shown post-generation.
3. **Admin Dashboard** — Dashboard page: 6 stat cards with delta %, Weekly Scan Volume bar chart (Recharts), QR Code Status donut, Recent Activity table with pagination. QR Codes page: summary cards, search + status filter + pagination table, Export CSV, Generate QR Code form (URL + expiry + label), details pop-up. Alerts page: photo, GPS, description, reporter details, resolve action. Users page: list, search, role change. Settings page: profile edit (name/phone) + password change.
4. **Auth pages** — Sign in, Register (no role field), Forgot/Reset password. Gate all dashboard routes.

## Mobile App (React Native, Android-first)

- Login / Register screens (same auth endpoints as web; admins can also log in here)
- Camera QR scanner → extract token from URL → `GET /api/qr/verify` with User-Agent `SecureQRApp/1.0`
- Verification result screen (green safe / red warning); valid codes can reach the destination (app is the only path to destinations)
- Tamper report flow: auto-triggered when server returns suspicious/blacklisted + manual "Report Tampering" button. Captures GPS, in-app photo, description. **Reporter name/contact stay optional per the client brief ("if user wishes to share")** — may prefill from the logged-in profile but user can clear them.
- Permissions: camera, location, internet in Android manifest

## Environment Variables (.env — never commit)

- `DATABASE_URL` — Session pooler (`pooler.supabase.com`, port 5432)
- `DIRECT_URL` — Direct connection (`db.<ref>.supabase.co`, port 5432; migrations)
- `QR_JWT_SECRET` / `AUTH_JWT_SECRET` — two separate secrets, never interchanged
- `ADMIN_EMAIL` / `ADMIN_PASSWORD` — first-admin seed
- `SUPABASE_URL`
- `SUPABASE_SERVICE_KEY` — **must be the `sb_secret_...` key; the `sb_publishable_...` key is blocked by RLS on Storage uploads**
- `APK_DOWNLOAD_URL`

## Backend Build Order — ✅ ALL COMPLETE

0. CLAUDE.md updated ✅
1. Project skeleton + `.env` + `prisma db pull` ✅
2. Schema extension migration (User fields, QrCode.label, Alert.status, ActivityLog) ✅
3. Token service — separate qrToken and authToken sign/verify ✅
4. Auth endpoints (5) + requireAuth / requireAdmin middleware ✅
5. Seed script — first admin from env vars ✅
6. QR generate (admin-protected) ✅
7. QR verify (public) — UA branching + ScanLog on every attempt ✅
8. Alert report — memoryStorage + Supabase Storage upload + ActivityLog ✅
9. Admin endpoints — qrcodes (search/pagination/CSV), alerts + resolve, users (list/role change + last-admin guard), metrics, activity ✅
10. Demo data seed — bulk random ScanLog / Alert / ActivityLog rows ✅

## Remaining Work (in order)

1. **Frontend** — adapt the Figma Make export: auth pages + route guards, connect Dashboard / QR Codes / Alerts / Users / Settings pages to the admin API, Landing Page verify flow, QR Display / details pop-up
2. **Serve frontend from Express** — `express.static` on the Vite `dist/` output + SPA fallback route so react-router deep links work on refresh
3. **Render deployment** — env vars on Render, verify the live domain end-to-end (a printed QR must resolve to the real verify URL)
4. **React Native app** — login/register → scanner → verify → result screen → tamper report flow; build APK → publish → set `APK_DOWNLOAD_URL`
5. **Testing & docs** — support Sprint 5 system testing (18–31 July); User Manual, Installation/Deployment Guide, Final Project Report; amend PMP WBS 5.1.2 (see Known Limitations)

## Security & Quality Requirements

- Passwords hashed with bcrypt — never stored or logged in plain text
- Alert photo uploads: image MIME types only, enforce file size limit (risk R14)
- Redirect latency ≤ 3 seconds (applies to the app path)
- Expired and blacklisted tokens blocked 100% of the time
- Every scan attempt logged, including failures
- Last-admin demotion guard on role changes
- Never commit secrets to the repo

## Out of Scope — do not build

- ISO 18004 standard extension (optional extra)
- Time-based redirect service (optional extra)
- iOS App Store / Play Store distribution
- Physical protection of printed codes (detect-and-respond only)
- **Browser path to the destination URL** (app-required decision — landing page verifies and prompts only)
- Standalone Analytics / Security dashboard pages (old 8-item sidebar dropped)
- User deletion (role change only)
- Scan-volume-spike anomaly detection (Recent Activity shows real recorded events only)
- Real email delivery for password reset (demo returns the link in the response)
- Migrating auth to Supabase Auth (custom JWT auth is complete and QR tokens can't use Supabase Auth anyway)

## Known Limitations (document in final report, don't solve)

1. App cannot auto-receive the scanned token post-install — users must rescan after installing
2. iOS users cannot sideload the APK; under the app-required model they can **see the verification result but can never reach the destination URL**
3. Team PMP WBS 5.1.2 ("Continue to destination" button) must be amended to match the app-required decision so test cases stay consistent

## Hard-Won Lessons (violating these caused real failures before)

1. **Never use multer `diskStorage` on Render** — the filesystem is ephemeral; files vanish on redeploy. Use `memoryStorage` + Supabase Storage upload from the start.
2. **Two separate DB connection strings, identified by hostname**: `DATABASE_URL` = Session pooler (`pooler.supabase.com:5432`) for runtime; `DIRECT_URL` = Direct (`db.<ref>.supabase.co:5432`) for `prisma migrate deploy`. **Never identify connections by port** — the old "6543 = runtime" rule caused real breakage after Supabase's Feb 2025 pooler change.
3. **Prisma 7 breaking changes** (each of these caused an actual failure during the backend build):
   - Connection URL belongs in `prisma.config.ts`, not `schema.prisma` — wrong placement throws P1012
   - The generator must be explicitly set to `prisma-client-js` — the new default emits a TypeScript client the project doesn't use
   - `PrismaClient` requires the `@prisma/adapter-pg` driver adapter
   - Run `npx prisma generate` explicitly even when `db push` reports "already in sync"
4. **Supabase Storage uploads need the `sb_secret_...` key** — the publishable key is rejected by RLS and uploads silently fail.
5. Store only the photo **URL** in the Alert table, never binary data.
6. **Git Bash heredoc corruption**: files of 150+ lines must be created via an editor (Notepad / VS Code), never `cat << EOF` — terminal buffering corrupts long heredocs.
7. Watch for nested `ICT302/ICT302` folders when cloning — verify the working directory before running commands.
8. The frontend is the **Figma Make export (Vite)** — the old "React 18.2.0 pinned + react-scripts@5" rule is obsolete because react-scripts is gone entirely. Do not reintroduce CRA/react-scripts.

## Development Environment & Workflow

- OS: Windows; shell: **Git Bash** (not cmd/PowerShell)
- Repo: `RoyYoo716/ICT302` on GitHub; auth via Git Credential Manager browser flow
- Run `git pull` at the start of every session before making changes
- API testing: Postman
- Follow the **Remaining Work** order above: frontend → static serving → Render deploy → mobile app → testing/docs

## Communication Preferences

- Explain concepts from first principles with an analogy before implementation steps
- The developer (Roy) is building skills from the ground up — prefer clear explanations over dense jargon; confirm understanding on major architectural decisions before executing
