# CLAUDE.md - VAFPQR Secure QR Code Management System (ICT302)

Master specification for Claude sessions. Last full rewrite: 22 July 2026.
Every fact below was verified against the main branch or the baseline
documents on 21-22 July 2026. See "Design Change Register v2.2" in the
document folder context for the full PMP/Design/R&A deviation record.

## 1. Project Overview

- Detects and responds to physical QR code tampering in public spaces.
- Unit: ICT302. Clients: Peter Cole, Mike Groeneweg. Group: FT02 (VAFPQR).
- Final submission: 1 August 2026. Client demo: 22 July 2026.
- Sprint 5 system testing (Vanessa) runs 18-31 July.

Status as of 22 July 2026:

| Component | Status |
| --- | --- |
| Backend API | Complete, deployed on Render (main branch) |
| Admin dashboard (admin-web) | Complete, connected to real API, served by Express |
| Landing page (landing-web) | Complete, served at /landing |
| Mobile app (mobile-app) | Complete, all mocks removed, APK released |
| APK release | GitHub Releases tag mobile-v0.1.0, 20 July 2026 |
| Remaining | Docs (User Manual, Install Guide, Final Report), baseline amendments, Sprint 5 support |

## 2. Core Security Design (non-negotiable)

- QR codes encode plain HTTPS URLs only. All security logic (JWT
  validation, expiry, blacklist, logging) lives server-side. Any standard
  camera scanner can scan our codes and reach a real page.
- App-required access model: browsers NEVER receive the destination URL.
  A browser scan is redirected to /landing/?status=&reason=&apk= with the
  verdict only. Reaching the destination requires the mobile app.
  - PENDING ACTION: written client approval of this pivot must be located
    or obtained (Design 6.5 recorded a contrary client preference).
- Two verify endpoints (this replaced the old User-Agent branching):
  - GET /api/qr/verify?token= : public forever, serves standard camera
    scans, logs every attempt, redirects browsers to the landing page.
    Never put auth middleware on it.
  - POST /api/qr/verify/mobile : behind requireAuth, returns JSON to the
    app, attributes the scan to the signed-in user (ScanLog.userId).
- The User-Agent string is stored in ScanLog for telemetry only. It is
  never used for authorisation (a UA header can be forged by anyone).

## 3. Repository Structure

- GitHub: RoyYoo716/ICT302. Render deploys from main. Work happens on
  feature branches, merged to main for deployment.
- Folders at root: backend, admin-web, landing-web, landing-page-version-2,
  mobile-app, document, plus CLAUDE.md, FRONTEND_TASKS.md, README.md.
- KNOWN ISSUE (verified 22 July, still unfixed on main): the root
  package.json was overwritten with the mobile app's package.json. It has
  name "vafpqr-mobile-app", Expo dependencies at root, and a workspaces
  list containing "app" instead of "mobile-app". Fix before final
  submission: restore a proper monorepo root package.json.
- landing-page-version-2 still exists at root; decide keep or delete
  before submission.

## 4. Tech Stack (versions verified in package.json on main)

| Layer | Technology |
| --- | --- |
| Backend | Node.js, Express 5.2.1, Prisma 7 (prisma-client-js generator + @prisma/adapter-pg), jsonwebtoken, bcrypt, multer (memoryStorage only) |
| Database | Supabase PostgreSQL via Prisma 7 |
| File storage | Supabase Storage, public bucket "alert-photos", DB stores URL only |
| Admin web | Vite, React 19.2.7, plain JSX (NOT TypeScript), Tailwind CSS v4, shadcn/ui (Radix), Recharts, react-router 7 |
| Landing web | Vite, React 19.0 |
| Mobile | Expo SDK 57, React Native 0.86, expo-router, expo-camera, expo-location, expo-image-picker, expo-secure-store, expo-file-system, expo-dev-client |
| HTTP client | fetch everywhere. axios is NOT installed anywhere. |
| Hosting | Render free tier, single service serves API + /landing + admin SPA |

- helmet is NOT installed even though the Design Document lists it.
  Decision pending: install during Sprint 5 after the demo (verify CSP
  compatibility with the two static builds first) or amend the document.
- Express 5 note: the SPA fallback uses Express-5-compatible middleware,
  not app.get("*").

## 5. Supabase Connections (identify by hostname, never by port)

- DATABASE_URL: Session pooler, host pooler.supabase.com, port 5432.
  Used by the app at runtime.
- DIRECT_URL: Direct connection, host db.<project-ref>.supabase.co,
  port 5432. Used by Prisma migrations.
- Transaction pooler (port 6543) is not used by this project.
- Prisma 7: connection URLs live in prisma.config.ts, never in
  schema.prisma (wrong placement throws P1012).
- Never edit the Supabase schema through the Table Editor. All schema
  changes go through Prisma (drift caused real failures before).

## 6. Auth Model

Two separate JWT types. Secrets are never interchanged.

| | QR token | Auth token |
| --- | --- | --- |
| Lives in | printed QR codes (public) | login sessions (app + web) |
| Secret | QR_JWT_SECRET | AUTH_JWT_SECRET |
| Payload | qrCodeId, destinationUrl, exp | userId, role, exp |

Rules:

- Registration is one single form: fullName (required), email (required),
  phoneNumber (optional), password (required). There is NO role field.
  Every new account is created as role "user".
- The register endpoint returns the created user WITHOUT a session token.
  The mobile app redirects to the login screen with a success banner; the
  user signs in explicitly.
- First admin is seeded from ADMIN_EMAIL / ADMIN_PASSWORD env vars.
  Never hardcode credentials anywhere, including UI placeholder values.
- Further admins are promoted via PATCH /api/admin/users/:id.
- Server refuses to demote the last remaining admin (last-admin guard).
- Self-role-change is blocked (backend 400 + disabled button).
- Admins must be demoted to user before they can be deleted.
- Password reset: single-use expiring token stored on the User row.
  Channel-aware: admin accounts reset via web, regular users via the app.
  Demo mode returns the reset link in the API response (no email service).
- authVersion: a counter on the User row. Password change, password
  reset, and role change increment it, revoking all previously issued
  JWTs for that account.
- HTTP 400 (not 401) for "current password incorrect", so the client does
  not trigger a session-expiry redirect.
- Middleware: requireAuth (valid auth JWT), requireAdmin (auth JWT plus
  role admin). Client-side role routing is cosmetic; the middleware is
  the real enforcement.

## 7. Database Schema (5 tables, live in Supabase)

- QrCode: id, token, label (optional), destinationUrl, status, expiresAt,
  createdById (optional FK, cleared in a transaction on user deletion),
  createdAt. Status values: active, suspicious, blacklisted, expired.
- User: id, email (unique, the login ID), passwordHash, fullName,
  phoneNumber (optional), role (user or admin, lowercase), authVersion,
  resetToken, resetTokenExpiresAt, lastLogin, createdAt.
- ScanLog: id, qrCodeId (OPTIONAL - forged or tampered tokens have no
  parent QR, and the failed scan must still be logged as evidence),
  userId (optional - the signed-in app user; basis of scan history;
  indexed with scannedAt), scannedAt, ipAddress, userAgent, gpsLat,
  gpsLng, result. Result values: valid, invalid, expired, blacklisted,
  suspicious.
- Alert: id, qrCodeId, reportedById (optional, onDelete SetNull so
  reports survive account deletion, indexed with createdAt), reporterName
  (optional), contactInfo (optional, up to 200 chars), gpsLat/gpsLng
  (optional Float pair, validated as a pair), photoUrl (Supabase Storage
  URL, never binary), description, status (new or resolved), createdAt.
- ActivityLog: id, qrCodeId (optional), type, message, status, ipAddress,
  createdAt. Curated events only: status_changed, alert_created,
  alert_resolved. Feeds the Recent Activity panel.

Design principles:

- ScanLog is raw telemetry (every scan attempt, always). ActivityLog is
  the curated event feed. Never merge them.
- QR images are never stored. The PNG is regenerated on demand from the
  stored token.
- Every NOT NULL relaxation vs the Design Document serves auditability.
  The mapping is documented in schema-reconciliation.md.

## 8. API Endpoints (verified inventory)

Public (no auth):
- GET /api/qr/verify?token= : verify, log, redirect browser to landing.
- POST /api/alert/report : multipart. Photo max 5 MB, image MIME only.
- GET /api/health : used to pre-warm the Render service before demos.

Auth:
- POST /api/auth/register, POST /api/auth/login
- POST /api/auth/forgot-password, POST /api/auth/reset-password
- PATCH /api/auth/password, PATCH /api/auth/profile (requireAuth)

Mobile (requireAuth):
- POST /api/qr/verify/mobile
- GET /api/scans/history

Admin (all behind requireAdmin):
- POST /api/qr/generate : expiry accepted 1 to 8760 hours (UI dropdown
  offers 24/48/72/168), optional label max 120 chars.
- GET /api/admin/qrcodes (search over label + destinationUrl, pagination
  default 20 max 100), GET /api/admin/qrcodes/:id,
  GET /api/admin/qrcodes/export (CSV), PATCH /api/admin/qrcodes/:id
- GET /api/admin/users, POST /api/admin/users (admin-created accounts),
  PATCH /api/admin/users/:id, DELETE /api/admin/users/:id
- GET /api/admin/alerts, PATCH /api/admin/alerts/:id (resolve only;
  reopening is rejected)
- GET /api/admin/metrics (6 stat cards incl. Total Alerts, 4 scan-volume
  ranges 1h/24h/1w/1M, status donut; deltas computed but not displayed)
- GET /api/admin/activity

## 9. QR Lifecycle Rules (enforced, tested)

- Lazy expiry sweep: expireStaleQrCodes() runs at the start of the admin
  read endpoints (list, detail, export, metrics) and flips time-expired
  "active" codes to "expired". Time passing never executes code by
  itself; the sweep is what keeps displayed state honest.
- Expired is terminal. The UI shows no Activate/Blacklist buttons for
  expired codes, and the server rejects any status change on a
  time-expired code (judged by the expiresAt timestamp, not the status
  column). The expiry lives inside the printed JWT; no database value
  can revive the signature. The only recovery is generating a new QR.
- A tamper report promotes a code to "suspicious" only when its current
  status is "active". A report never downgrades an admin-confirmed
  "blacklisted" verdict and never resurrects an expired code.
  Users detect; administrators confirm.
- Status changes take effect on the very next scan.

## 10. Mobile App (mobile-app workspace)

- Expo dev build ("VAFPQR" dev client) for development:
  npx expo start --dev-client -c, connect from the app's development
  launcher. Expo Go does not work (SDK mismatch was the original reason
  for the dev build).
- Release: EAS build, published to GitHub Releases (tag mobile-v0.1.0).
- Base URL comes from EXPO_PUBLIC_API_BASE_URL in mobile-app/.env
  (points at the live Render backend). Changing .env requires a Metro
  restart.
- Auth: session in expo-secure-store. 401 with a token present means
  session expired; 401 without a token means bad credentials.
- Flows: login / register (register redirects to login with a success
  banner), scan (expo-camera), verify via POST /api/qr/verify/mobile,
  safe/warning result screens mapped from the five statuses, tamper
  report (GPS + in-app photo + description + optional prefilled
  name/contact), scan history from GET /api/scans/history, profile and
  password screens.
- Report buttons: warning screen shows Report only when qrId exists
  (expired/invalid responses carry no qr object). The safe screen also
  has a Report Tampering button (manual reporting after a green result).
- All mock code was removed (mockData.js, wait, socialSignIn, security
  and notification settings screens/functions).

## 11. Environment Variables (never commit)

Backend (Render):
- DATABASE_URL, DIRECT_URL (see section 5)
- QR_JWT_SECRET, AUTH_JWT_SECRET (two separate secrets)
- ADMIN_EMAIL, ADMIN_PASSWORD (first-admin seed)
- SUPABASE_URL
- SUPABASE_SERVICE_KEY : must be the sb_secret_... key. The
  sb_publishable_... key is silently rejected by Storage RLS.
- APK_DOWNLOAD_URL : landing page download button target.

Mobile (mobile-app/.env):
- EXPO_PUBLIC_API_BASE_URL

## 12. Remaining Work (as of 22 July)

1. Client demo (22 July): pre-warm GET /api/health first (Render cold
   start is about 30 seconds). Obtain client approval of the
   app-required model on the record.
2. Sprint 5 support through 31 July: assist Vanessa, fix bugs.
3. Repo hygiene: fix the root package.json (section 3), decide the fate
   of landing-page-version-2, decide helmet (section 4).
4. Baseline document amendments (full detail in Design Change Register
   v2.2, section 10): PMP WBS 5.1.2 + Design 5.2.2 + Design 6.5 (access
   model), Design 4.3 data dictionary + ERD, R&A 4.1 actors + FR-03
   allowlist + FR-07 GPS fallback, Design 3.3/6.3 stack tables.
5. Documents: User Manual, Installation and Deployment Guide, Final
   Project Report (include the deviations and limitations below).

## 13. Known Limitations (document, do not solve)

1. Post-install token handoff: users must rescan after installing the app.
2. iOS: cannot sideload the APK; sees the browser verdict but can never
   reach the destination.
3. Baseline amendments outstanding for the access model (see 12.4).
4. Logical vs physical schema types (uuid/varchar/CHECK vs text with
   application-level validation) - see schema-reconciliation.md.
5. Render free-tier cold start (about 30 s) can violate the 3-second
   redirect target on the first request only.
6. helmet documented but not installed (decision pending).
7. Not implemented from R&A: FR-03 destination allowlist (any http/https
   URL accepted at generation; low risk because generation is admin-only)
   and FR-07 manual GPS entry fallback (GPS is simply optional).
8. No downtime monitoring (Design 6.4.6 promised a 3-minute alert).
   Backups are delegated to managed Supabase.

## 14. Out of Scope (agreed, do not build)

- ISO/IEC 18004 extension, time-based redirect service (optional extras)
- iOS App Store / Play Store distribution
- Physical protection of printed codes (detect and respond only)
- Browser path to the destination URL (app-required decision)
- Real email delivery for password reset
- Migrating auth to Supabase Auth (QR tokens cannot use it; custom auth
  is complete)
- Deferred to future-work: account suspend/restore, email notification
  preferences, admin-initiated password reset, 2FA

## 15. Hard-Won Lessons (violating these caused real failures)

1. Never use multer diskStorage on Render (ephemeral disk). Always
   memoryStorage plus Supabase Storage upload. Store only the URL.
2. Identify Supabase connections by hostname, never by port.
3. Prisma 7: URLs in prisma.config.ts (P1012 otherwise); generator must
   be prisma-client-js explicitly; @prisma/adapter-pg is mandatory;
   run npx prisma generate explicitly even when db push says "already
   in sync" and after any node_modules wipe.
4. P2022 on Render means a stale Prisma Client: redeploy with Clear
   build cache.
5. Storage uploads need the sb_secret key; the publishable key fails
   silently under RLS.
6. React Native: URL.searchParams is unimplemented in JSC - extract
   tokens with a regex. SDK 57 fetch rejects the { uri, name, type }
   FormData shorthand - wrap files with new File(uri) from
   expo-file-system. Never set Content-Type manually on multipart
   (fetch must generate the boundary).
7. Bottom navigation needs useSafeAreaInsets() padding or it collides
   with the Android gesture bar. Keyboard avoidance lives in the shared
   AppScreen component (KeyboardAvoidingView), not per screen.
8. Files over about 150 lines must be created in an editor (Notepad /
   VS Code), never with a Git Bash heredoc (buffer corruption).
9. npm start without --workspace= launches the wrong workspace.
10. Watch for nested ICT302/ICT302 folders when cloning; check pwd.
11. Do not reintroduce CRA/react-scripts. Do not run npm audit fix
    --force (it breaks Expo version alignment).
12. Errors must never be swallowed: catch (err), console.error, and
    surface err.message to the user instead of a generic string.

## 16. Development Workflow and Communication

- OS: Windows. Shell: Git Bash. API testing: Postman.
- Run git pull at the start of every session.
- Claude clones the live repo branch at session start and reads files
  directly; the repo is the authoritative source over conversation
  memory.
- Code edit instructions always show the complete before-code and the
  complete after-code verbatim. No summaries like "keep the existing
  props".
- Explain concepts from first principles with an analogy before
  implementation steps. Confirm before major architectural decisions.
- Conversation in Korean; code and comments in English.
