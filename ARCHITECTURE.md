# Architecture

A short map of how Prithvi is structured and the conventions it follows. Pair this
with [`SECURITY.md`](SECURITY.md) for the security model.

## Stack

- **UI:** React 18 + TypeScript (strict), Vite, Tailwind, shadcn-style primitives
- **Data/auth:** Firebase Auth + Firestore (with a localStorage demo-mode fallback)
- **AI:** Google Gemini via a callable Cloud Function (App Check protected)
- **Charts/motion:** Recharts, Framer Motion
- **Tests:** Vitest + Testing Library (unit) and Playwright (E2E), run in CI

## Folder layout

```
src/
  lib/            Framework-free logic & integrations (pure where possible)
    constants.ts        App-wide config: storage keys, region, limits
    emissions.ts        India-calibrated emission factors + footprint engine
    recommendations.ts  Deterministic recommendation engine
    gamification.ts     Points, streaks, badges, pledges
    community.ts        Community feed data layer (Firestore + demo fallback)
    gemini.ts           Gemini client (function path) + bill scanning
    firebase.ts         Firebase init (auth, db, functions, App Check)
    theme.ts            Theme application
    utils.ts            cn(), formatters, timeAgo
  context/
    auth-context.ts     Context object + useAuth hook (consumer side)
    AuthContext.tsx     <AuthProvider> (the implementation)
  components/
    ui/             Reusable primitives (button, card, input, password-input…)
    layout/         AppShell, PublicNav, Footer, AuthLayout
    community/      Community feature components (Composer, PostCard, …)
    StatCard.tsx    Shared metric card (used across pages)
    …
  pages/          One file per route (Landing, Login, Dashboard, Track, …)
  routes/         ProtectedRoute + RequireOnboarded guards
functions/        Cloud Function (Gemini proxy: insights, recommendations, bill OCR)
e2e/              Playwright specs
```

## Conventions

- **Separation of concerns.** Pure domain logic lives in `lib/` with no React
  imports, so it is trivially unit-testable. Components stay presentational and
  read state through `useAuth()`.
- **Single source of truth.** Config values (storage keys, region, limits) live in
  `lib/constants.ts`; category colours/labels derive from `CATEGORY_META`.
- **DRY UI.** Shared pieces (`StatCard`, `PasswordInput`) have one definition.
- **Path alias.** `@/` maps to `src/` (see `tsconfig.json` / `vite.config.ts`).
- **Naming.** Components `PascalCase`, hooks `useX`, files match their default
  export; pure helpers are camelCase verbs.

## Data flow

1. `AuthProvider` resolves the session (Firebase or demo) and loads the user's
   document into context.
2. **Track** computes a footprint via `emissions.ts` and persists it through
   context mutations (which compose via refs so sequential writes don't clobber).
3. **Dashboard / Insights** read that footprint and ask `gemini.ts` for advice
   (Gemini function → falls back to the on-device engine).
4. **Community** streams a shared `posts` collection and aggregates it client-side.

## Quality gates (CI — `.github/workflows/ci.yml`)

`npm run lint` · `npm run format:check` · `npm run typecheck` · `npm test` ·
`npm run build` · `npm run test:e2e` — all run on every push.
