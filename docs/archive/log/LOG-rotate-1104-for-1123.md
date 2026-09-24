## 2026-09-16 — Opaque Postgres errors in admin helpers (`.1104`)

The route scan never returned the
database its own words — and it only
opened `app/api/**/route.ts`. Helpers
that import `getSupabaseAdmin` could
return `error.message` and the route
would forward it, green the whole time.

School class upsert, youth consent
persist, and wearables oauth /
disconnect / samples did exactly that.
Parked surfaces; still a schema map
in source.

Fix: `console.error` the detail, return
opaque `db_error`. `not_configured`
stays distinct. Resend (`emailServer`)
is not Postgres and was left alone.

Guard: discover `src/lib/**/*.ts` that
import or define the service-role
client. Same matcher as the route
scan. Empty `LEAK_OK` with a written
reason. **Mutants killed:** live
school / youth / wearables leaks;
planted `return { error: error.message }`
in `schoolClassServer`; matcher
narrowed off the school helper
spelling.

Recipe 18 (nightly cleanup) + INDEX
routing. No GRAPH_LOOP letter. No UI.

`[skip vercel]`. No tip-promote. Live
www stays `.697`. PRIVATE_MODE stays.

Label `2026.07-unified.1104`.

Rotated LOG oldest → [docs/archive/log/LOG-rotate-1089-for-1104.md](docs/archive/log/LOG-rotate-1089-for-1104.md) (`.1089`).
