## 2026-08-13 — Dependabot security batch, Cursor-local (`.744`)

Open Dependabot PRs each burn Actions minutes (and can hit Vercel). This ship
applies the safe bumps on one branch and leaves those PRs unmerged.

**Taken:** `js-yaml` 4.3.0 → 4.3.1 in `/apps/mobile` (security, `#419`);
`actions/setup-java` v4 → v5 in `ci-extended` Android (`#449`);
`playwright` + `@playwright/test` 1.61.1 → 1.62.1 (`#448`);
`@radix-ui/react-toast` 1.2.15 → 1.2.23 (`#447`);
`react-i18next` 17.0.8 → 17.0.11 (`#446`);
`@radix-ui/react-label` 2.1.8 → 2.1.15 (`#444`).

**Skipped:** `tailwindcss` 3.4.19 → 4.3.3 (`#445`) — major CSS engine rewrite.
That Dependabot PR stays closed-not-merged.

Local `npm test` / lint / typecheck. Frozen plan:
[docs/DEPENDABOT_BATCH_744.md](docs/DEPENDABOT_BATCH_744.md).

Label `.744` (onto master `.743`). Excellence-Override below.

Excellence-Override: dependabot security batch

Rotated LOG oldest → [docs/archive/log/LOG-rotate-679-for-744.md](docs/archive/log/LOG-rotate-679-for-744.md). · [`.743` for `.758`](docs/archive/log/LOG-rotate-743-for-758.md).
