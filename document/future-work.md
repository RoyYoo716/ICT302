# Future Work — Secure QR Code Management System

Deferred items, recorded 17 July 2026. These were consciously postponed (not forgotten) to protect the critical path: Sprint 5 system testing (18–31 July), Render deployment, and the React Native mobile app, ahead of the 1 August deadline. Deferral aligns with risk R01 (scope creep) mitigation: prioritise essential deliverables.

**Trigger to start this list:** mobile app complete and deployed, before the 27 July buffer period. If the buffer is reached first, these items move to the Final Report's "Future Enhancements" section as-is.

---

## Tier 1 — Backend endpoint additions (≈30–60 min each, no schema change)

### 1.1 Add User (admin creates an account directly)
- **What:** `POST /api/admin/users` behind `requireAdmin`; restore the UserFormModal (create mode) and "Add User" button in admin-web.
- **How:** Reuse the register logic (bcrypt hash, email-uniqueness check). Admin may set the role at creation.
- **Why deferred:** No backend endpoint existed; current access model (accounts self-register, admins only assign roles) covers the brief.

### 1.2 Edit user details (name / email by admin)
- **What:** Extend `PATCH /api/admin/users/:id` to also accept `fullName` and `email` (currently role-only).
- **How:** Add validation + email duplicate check; restore UserFormModal (edit mode) or extend the profile drawer.
- **Why deferred:** Users can already edit their own profile via Settings; admin-side editing is a convenience, not a requirement.

### 1.3 Admin-initiated password reset
- **What:** `POST /api/admin/users/:id/reset-password`; restore ResetPasswordModal.
- **How:** Reuse the existing resetToken infrastructure (single-use token + expiry). In demo mode, return the reset link in the response, same as forgot-password.
- **Why deferred:** Self-service forgot-password already exists; no endpoint for the admin-initiated variant.

### 1.4 QR Managed count per user *(optional, cheap)*
- **What:** Show how many QR codes each user created (column existed in the Figma export).
- **How:** `QrCode.createdById` already exists — add a `_count` aggregation to the users list endpoint.
- **Why deferred:** Cosmetic; column was removed with the other placeholder columns.

## Tier 2 — Schema + auth-path changes (≈2h+, previously rejected in schema reconciliation)

### 2.1 Suspend / Restore accounts
- **What:** `User.status` (`active` / `suspended`) with real enforcement.
- **How:** Prisma migration; block suspended users at **login** and in **requireAuth**; restore the Suspend/Restore button and status badge/filter.
- **Warning:** the field alone is a security hole — a "suspended" user who can still log in is worse than no feature. Enforcement in both auth paths is mandatory, plus tests.
- **Why deferred:** Explicitly rejected during schema reconciliation because it touches the auth middleware; revisit only with time to test properly.

### 2.2 Notification preferences (email alerts on tamper reports)
- **What:** The Figma export's Settings "Notifications" card (Email Alerts / New Alert Reports toggles), removed because it only pretended to work — toggles saved to localStorage and no email was ever sent.
- **How:** Requires real infrastructure, not just the card: (1) an email service (nodemailer + SMTP credentials), (2) a place to store preferences (e.g. `User.notifyOnAlert` boolean — schema migration), (3) a send hook in `alertService.js` when an alert is created, (4) restore the NotificationsCard wired to a real `PATCH /api/auth/notifications` endpoint.
- **Why deferred:** No email delivery exists anywhere in the system by design (forgot-password deliberately returns the link instead of emailing). The brief has no notification requirement, so priority is low; shipping the card without the sending infrastructure would be a fake feature.

## Tier 3 — Recorded only, not planned

- **2FA:** real TOTP enrolment/verification is multi-day work; a boolean-only version is a fake feature and must not ship.
- **Alerts Reviewed count:** requires schema change to record the resolving admin (e.g. `Alert.resolvedById`); disproportionate for a decorative number.

## Small UI improvements

### 4.1 Show Label on the QR detail page
- **What:** The QR Code Detail page (View Details) currently does not display the QR's label; show it alongside ID, destination URL, and dates.
- **How:** `getQRCodeById` already returns `label` via the adapter — add one display row in `QRCodeDetailPage.jsx`. Frontend-only, ~5 minutes.

### 4.2 Sidebar badge accuracy on the Alerts page *(carried over)*
- **What:** `currentNewAlerts` counts only the currently loaded page; use `sidebarBadges` from `/api/admin/metrics` instead for a global count.
