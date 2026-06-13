# Security Model — Prithvi

This document summarises how Prithvi protects user data and credentials. It maps
directly to common hackathon "security" rubric items.

## 1. Authentication
- **Firebase Authentication** (Email/Password + Google OAuth). Passwords are never
  stored or seen by the app — Firebase handles hashing, salting and session tokens.
- Sessions use Firebase's short-lived ID tokens with automatic refresh; no custom
  token handling in the client.
- In **demo mode** (no Firebase keys) the app uses local storage purely for offline
  exploration — production builds always ship with real Firebase config, so demo
  mode is disabled in the deployed app.

## 2. Authorization — Firestore rules
- **Default deny.** Nothing is publicly readable or writable.
- Each user can read/write **only** their own `users/{uid}` document tree
  (`request.auth.uid == uid`).
- Writes are **schema-validated** server-side (type + length + range checks on the
  profile object) to reject tampered or oversized payloads.
- See [`firestore.rules`](firestore.rules).

## 3. Secrets — no API keys in the browser
- The **Gemini API key is never shipped to the client.** AI insights/recommendations
  are served by a callable **Cloud Function** ([`functions/index.js`](functions/index.js))
  that reads the key from **Secret Manager** (`firebase functions:secrets:set GEMINI_API_KEY`).
- The deployed web app contains **no AI secret at all** — when the function isn't
  enabled it falls back to a deterministic, on-device recommendation engine.
- The Firebase Web config (`apiKey`, etc.) is **not a secret** — it is a public
  project identifier. Access is gated by Auth + Firestore rules + App Check.

## 4. Transport & browser hardening (Firebase Hosting headers)
Configured in [`firebase.json`](firebase.json):
- **HTTPS only** + `Strict-Transport-Security` (HSTS, preload).
- **Content-Security-Policy** locking script/style/connect/frame sources to self +
  Google/Firebase endpoints; `object-src 'none'`, `frame-ancestors 'none'`.
- `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY` (clickjacking),
  `Referrer-Policy`, `Permissions-Policy` (camera/mic/geo/payment disabled),
  `Cross-Origin-Opener-Policy: same-origin-allow-popups` (safe OAuth popups).

## 5. Abuse protection — App Check
- **Firebase App Check** (reCAPTCHA v3) scaffolding is wired in
  [`src/lib/firebase.ts`](src/lib/firebase.ts); set `VITE_RECAPTCHA_SITE_KEY` to
  activate, then flip `enforceAppCheck: true` in the Function. This blocks requests
  from anything other than your genuine app.

## 6. Input validation
- Client validates auth inputs (email format, password length ≥ 6) and numeric
  ranges on the tracking form (no negatives).
- The Cloud Function re-validates payloads and **requires an authenticated caller**
  before calling Gemini.

## 7. Dependency & build hygiene
- `.env` and all secrets are git-ignored; only `.env.example` is committed.
- Vendor code is split and content-hashed; `index.html` is served `no-cache` so
  clients always get the latest, while hashed assets are cached immutably.

## Reporting
Found an issue? Email the maintainer rather than opening a public issue.
