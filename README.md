# 🌿 Prithvi — Personal Carbon Intelligence (India)

Prithvi helps people in India **understand** carbon emissions, **measure** their personal
footprint, and **act** to reduce it — with personalised insights, India-vs-world context, and
gamified incentives.

Built with **React + Vite + TypeScript + Tailwind**, **Firebase** (Auth + Firestore), **Gemini**
for insights, and **Recharts**. Deployed on **Google Cloud / Firebase Hosting**
(project `supplypulse-c27c0`).

### 🔴 Live: **https://supplypulse-c27c0.web.app**

Sign up with email + password and explore the full flow (onboarding → tracking → dashboard →
insights). Auth, Firestore storage, and hardened security rules are live. See
[`SECURITY.md`](SECURITY.md) for the full security model.

## 🏆 Evaluation readiness

Mapped to the judging parameters, with verifiable evidence:

| Parameter | What we did | Evidence |
|-----------|-------------|----------|
| **Code Quality** | Strict TypeScript, modular feature folders, shared primitives, ESLint (typescript-eslint + react-hooks) — **0 problems** — and Prettier-enforced formatting. | `npm run lint`, `npm run format:check`, `npm run typecheck` |
| **Security** | Firebase Auth (no password handling), default-deny + validated Firestore rules, server-side Gemini proxy (no key in client), strict CSP + HSTS + clickjacking headers, **App Check enforced** (reCAPTCHA Enterprise). | [`SECURITY.md`](SECURITY.md), live response headers |
| **Efficiency** | Route-level code-splitting (initial JS **~46 kB** vs 105 kB), vendor chunking, immutable asset caching, lazy charts, installable PWA. | `npm run build` chunk report |
| **Testing** | **72 unit tests + 7 Playwright E2E**, all in CI (lint · format · typecheck · unit · build · e2e). | `npm test`, `npm run test:e2e` |
| **Accessibility** | Skip links, semantic landmarks, labelled inputs (id/htmlFor), accessible radio group, ≥36px tap targets, chart screen-reader summaries, reduced-motion, dark mode. | **Lighthouse Accessibility = 100** |
| **Problem Statement Alignment** | Education, footprint tracking (questionnaire, live estimate + **AI bill scan**), personalised insights & recommendations, gamification, community forum — all India-calibrated. | See Features below |

**Lighthouse (desktop, live):** Accessibility **100** · SEO **100** · Agentic Browsing **100** · Best
Practices **77**. The Best-Practices cap is two items inherent to the **Firebase Auth iframe**
(third-party cookies) — a platform behaviour, not application code.

---

## ✨ Features

| Area | What it does |
|------|--------------|
| **Public landing + education** | Explains carbon footprints, CO₂e, and compares per-capita emissions for India 🇮🇳, Japan 🇯🇵, USA 🇺🇸 (+ world & China) against the 1.5°C target. |
| **Auth** | Email/password + Google sign-in via Firebase. Falls back to a local **demo mode** if no keys are set. |
| **Personal details** | Onboarding profile: name, city, state, household, home type. |
| **Track footprint** | Lifestyle questionnaire (home energy, mobility, food, goods) with a **live estimate**. India-calibrated emission factors (CEA grid factor, LPG, transport, diet). |
| **Dashboard** | Annual footprint, category breakdown, benchmark vs countries, Gemini/engine insight, achievements. |
| **Insights & actions** | Impact-ranked, personalised recommendations. Pledge actions → earn points, streaks, badges, and track CO₂ saved. |

---

## 🚀 Quick start

```bash
npm install
cp .env.example .env     # (Windows: copy .env.example .env)
npm run dev
```

The app **runs immediately in demo mode** without any keys — accounts and data are stored in
your browser's `localStorage`. Add Firebase/Gemini keys to `.env` to enable the real backend.

---

## 🔑 Configure Firebase (project `supplypulse-c27c0`)

1. In the [Firebase Console](https://console.firebase.google.com/project/supplypulse-c27c0),
   add a **Web app** and copy its config into `.env`:
   ```env
   VITE_FIREBASE_API_KEY=...
   VITE_FIREBASE_AUTH_DOMAIN=supplypulse-c27c0.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=supplypulse-c27c0
   VITE_FIREBASE_STORAGE_BUCKET=supplypulse-c27c0.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=...
   VITE_FIREBASE_APP_ID=...
   ```
2. **Authentication** → enable **Email/Password** and **Google** providers.
3. **Firestore Database** → create a database. Security rules are in [`firestore.rules`](firestore.rules)
   (each user can only read/write their own `users/{uid}` tree).

## 🤖 Configure Gemini (optional)

AI insights/recommendations and bill scanning are served by a secure **Cloud Function** that keeps
the key in **Secret Manager** — no key ships to the browser. To enable it on your own project:
```bash
firebase functions:secrets:set GEMINI_API_KEY   # paste a key from aistudio.google.com/apikey
firebase deploy --only functions
```
then set `VITE_GEMINI_VIA_FUNCTIONS=true`. Without it, Prithvi uses its built-in **deterministic
recommendation engine**, so the app is fully functional offline. (A `VITE_GEMINI_API_KEY` client
path also exists for local dev, but it exposes the key and is not used in production.)

---

## ✅ What is already live on `supplypulse-c27c0`

- **Hosting** — production build at https://supplypulse-c27c0.web.app (installable PWA)
- **Auth** — Email/Password **and** Google sign-in, enabled and verified end-to-end
- **Firestore** — hardened rules (default-deny, per-user, schema-validated) deployed
- **Gemini** — `geminiAdvise` Cloud Function (insights, recommendations, bill OCR) with **App Check
  enforced** (reCAPTCHA Enterprise) and the on-device engine as a graceful fallback
- **AI bill scanning** — upload an electricity bill and Gemini Vision reads the kWh

## ☁️ Re-deploy

```bash
npm run build                                       # outputs to dist/ (uses .env.production)
firebase deploy --only hosting,firestore:rules --project supplypulse-c27c0
```

`firebase.json` is preconfigured for an SPA (rewrites all routes to `index.html`), serves
`index.html` as `no-cache`, content-hashes assets as `immutable`, and applies the security headers.

> The CLI authenticates via the gcloud **Application Default Credentials** already present on this
> machine. If deploying elsewhere, run `firebase login` first.

## 🧪 Testing

```bash
npm test          # Vitest — 72 unit tests
npm run test:e2e  # Playwright — 7 end-to-end tests (demo mode, no backend needed)
```

Unit tests cover the emission engine, India-specific recommendation ranking, gamification
(streaks, badges, pledges), formatting/utility helpers, the Gemini fallback path, community stats,
the `useDebounce` hook, the `ErrorBoundary`, and the auth context. E2E covers signup → track →
dashboard, auth validation, and community posting. CI runs lint, `format:check`, typecheck, unit,
build, and e2e on every push.

---

## 🗂️ Project structure

```
src/
  components/        UI primitives (shadcn-style), layout, community/, StatCard
  context/           auth-context (hook) + AuthContext (provider)
  lib/               constants · emissions · recommendations · gamification · gemini · firebase
  pages/             Landing · Login · Signup · Profile · Track · Dashboard · Insights · Community
  routes/            ProtectedRoute · RequireOnboarded
functions/           Gemini Cloud Function (insights, recommendations, bill OCR)
e2e/                 Playwright end-to-end specs
```

See [`ARCHITECTURE.md`](ARCHITECTURE.md) for the full layout, conventions, and data flow.

## 📐 Design system

- **Aesthetic:** editorial climate intelligence — evergreen primary, warm saffron accent, paper
  background, full dark mode.
- **Type:** Fraunces (display) + Hanken Grotesk (UI). Tokens live in [`src/index.css`](src/index.css).

## ⚠️ Methodology

Emission factors are India-calibrated approximations for **educational** use (CEA grid ~0.71 kg
CO₂/kWh, IPCC fuel factors, consumption-based estimates). They are indicative, not an audited
inventory.
