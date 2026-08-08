# Contributing to Mission Winning

Thank you for helping build a healthier world. This guide is for developers and agents working in the repo.

**License:** contributions are accepted under the [GNU Affero General Public License v3.0](LICENSE). By opening a PR you agree your contribution is licensed under AGPL-3.0.

**Code of conduct:** [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md). Open-source overview: [docs/OPEN_SOURCE.md](docs/OPEN_SOURCE.md).

**Acceptable use:** do not contribute features whose primary purpose violates [docs/legal/ACCEPTABLE_USE.md](docs/legal/ACCEPTABLE_USE.md) (illegal deepfakes, CSAM, fraud, etc.). Security issues → [SECURITY.md](SECURITY.md). Secrets / keys → [docs/SECRETS.md](docs/SECRETS.md) (`npm run secrets:scan` before PRs that touch env docs).

---

## Prerequisites

- **Node.js 22** (matches CI)
- npm
- Optional: Supabase project, Stripe test keys (see [docs/ENV.md](docs/ENV.md))

```bash
git clone <repo>
cd missionwinning
cp .env.example .env.local   # if present; else see docs/ENV.md
npm install
npm run dev
```

Open http://localhost:3000 — unlock `/private` if `PRIVATE_MODE=true`.

---

## Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Local dev server |
| `npm run typecheck` | TypeScript check (`tsc --noEmit`, includes tests) |
| `npm test` | Unit tests (`src/**/*.test.ts` + `packages/mw-core`) |
| `npm run build` | Production build + typecheck |
| `npm run lint` | ESLint |
| `npm run e2e` | Playwright (needs `SMOKE_BASE_URL`) |
| `npm run gate-smoke` | Deploy perimeter curls |
| `npm run check-env` | Verify `.env.local` |

---

## Branch and PR workflow

1. Branch from `master` with a descriptive name (`feat/coach-deload`, `fix/school-pin`).
2. Keep diffs focused — one concern per PR when possible.
3. Run `npm test` and `npm run build` before push.
4. **Never** force-push `master`.
5. **Never** commit secrets (`.env.local`, keys, tokens).
6. Update relevant `INDEX.md` and [docs/API.md](docs/API.md) when adding routes or domains.

---

## Where to put code

```
app/(app)/foo/page.tsx     → thin route + metadata
src/page-components/FooPage.tsx   → full page UI
src/components/foo/        → reusable UI pieces
src/hooks/useFoo.ts        → client orchestration
src/lib/foo.ts or foo/     → pure business logic
src/data/                  → static catalogs only
src/i18n/*Locales.ts       → user-visible strings
app/api/foo/route.ts       → HTTP handler (thin)
```

**Decision tree**

- UI only → `components/` + `page-components/`
- Shared logic → `lib/` (+ tests)
- 5+ related lib files → `lib/domain/` + `INDEX.md`
- New nav tab → `app/(app)/`, `navConfig.ts`, `app/INDEX.md`, i18n keys

Full architecture: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

---

## Adding a page route

1. Create `app/(app)/your-path/page.tsx`:

```tsx
import { YourPage } from '@/page-components/YourPage';

export default function Page() {
  return <YourPage />;
}
```

2. Create `src/page-components/YourPage.tsx`.
3. Add row to [app/INDEX.md](app/INDEX.md).
4. Add nav entry in `src/lib/navConfig.ts` if needed.
5. Add i18n keys in appropriate `*Locales.ts`.

---

## Adding an API route

1. Create `app/api/your-path/route.ts`.
2. Implement logic in `src/lib/yourServer.ts` (not in the route file).
3. Add Zod schema to `src/lib/apiSchemas.ts` for POST/GET params.
4. Apply `rateLimitAsync` + auth (`getUserFromRequest`, `hasAppAccess`, etc.).
5. Document in [app/api/INDEX.md](app/api/INDEX.md) and [docs/API.md](docs/API.md).
6. Add smoke curl to `scripts/gate-smoke.ts` if security-sensitive.

---

## i18n

- Add strings to `src/i18n/*Locales.ts` — **not** `src/locales/`.
- Use `useTranslation()` in components; `t('key', { defaultValue: '...' })` for new keys.
- Critical namespaces must stay in parity across `EXPORT_LANGS` (see `exportLocales.test.ts`).

---

## Tests

- Colocate unit tests: `src/lib/foo.test.ts` next to `foo.ts`.
- Test real behavior — scoring, auth rules, parsing — not trivial getters.
- Run `npm test` after lib changes.

---

## Security

- Read [docs/PROTECTION.md](docs/PROTECTION.md) before touching auth, premium, or school APIs.
- Server-only secrets: never `NEXT_PUBLIC_`.
- Premium checks via `premiumServer.ts` + admin client.
- School stats/leaderboard require teacher PIN or creator — see `schoolClassAccess.ts`.

---

## Documentation

- Agents read [AGENTS.md](AGENTS.md) → [INDEX.md](INDEX.md) → folder `INDEX.md`.
- Customer copy: [docs/help/](docs/help/INDEX.md) — plain language, no file paths.
- When editing a folder, update its `INDEX.md` if file list or concerns change.

---

## Agent-specific

- Do not use `~/.cursor/plans/` as source of truth — use `docs/PLAN.md` / `LOG.md`.
- Recipes: [docs/AGENT_RECIPES.md](docs/AGENT_RECIPES.md).
- Cursor rule: `.cursor/rules/documentation.mdc`.

---

## Questions

See [docs/README.md](docs/README.md) for the full doc hub. Product direction: [vision.md](vision.md), [docs/PLAN.md](docs/PLAN.md).
