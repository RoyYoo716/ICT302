# VAFPQR Secure QR Code System

VAFPQR is an ICT302 secure QR code platform for issuing signed QR codes,
verifying their status, recording scans, and reporting suspected physical
tampering.

## Applications

- `backend/` - Express, Prisma, Supabase PostgreSQL, and Supabase Storage API.
- `admin-web/` - React administrator dashboard.
- `landing-web/` - Public QR verification result and Android download page.
- `mobile-app/` - Expo/React Native Android scanner and tamper-reporting app.
- `document/` - Project, design, and operating documentation.

## Live system

- Admin and API: <https://ict302-b77o.onrender.com>
- Public verification page: <https://ict302-b77o.onrender.com/landing/>
- Android APK: <https://github.com/RoyYoo716/ICT302/releases/tag/mobile-v0.1.0>

## Prerequisites

- Node.js 20.19 or later
- npm
- Android device for the mobile E2E flow
- A development-client APK when testing through Metro

## Install dependencies

From the repository root:

```bash
npm install
```

The root package uses npm workspaces for `backend`, `landing-web`, `admin-web`,
and `mobile-app`.

## Common commands

```bash
npm run start:backend
npm run dev:admin
npm run dev:landing
npm run build:web
```

For a mobile development-client session:

```bash
cd mobile-app
npx expo start --dev-client -c
```

The public release APK is standalone and does not connect to Metro.

## Environment configuration

Environment values are never committed. The backend requires its database,
JWT, administrator seed, Supabase, and APK-download variables. The mobile app
uses `EXPO_PUBLIC_API_BASE_URL` to reach the API.

See `document/LOCAL-DEVELOPMENT-RESTART-GUIDE.md` for the full local restart
procedure after dependencies, build folders, or Expo caches have been removed.
