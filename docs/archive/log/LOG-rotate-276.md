# Rotated for .276

## 2026-08-02 — The workflow that failed on every push (`.261`)

A pass over the six free GitHub security settings. The repo scored well on file
presence — `SECURITY.md`, `dependabot.yml` and `codeql.yml` all exist and are
thorough — and the finding is that **four of the six became unavailable eight
minutes before the audit started.**

### The repo went private, and took four checks with it

`missionwinning` flipped public → private at **2026-08-02 00:49Z**, between one
reconnaissance pass and the next. Measured on both sides:

| Feature | While public | Now |
|---|---|---|
| Secret scanning + push protection | scanning **on** | `secret-scanning/alerts` → **404, disabled** |
| Code scanning | default setup readable | `code-scanning/default-setup` → **403** |
| Private vulnerability reporting | `{"enabled":true}` | → **404** |
| Dependency Review API | — | `dependency-graph/compare` → **403** |
| Dependabot alerts | — | **204, unaffected** (3 open, all high) |

All four are Advanced Security entitlements on a private repo. None is a config
error and none is fixable in this repo — they are platform state, which is why
they now live as a Status row in `CONTEXT.md` rather than as a doc that asserts
they are on. `gitleaks` is left as the only secret gate.

It also re-dates a premise several workflow headers argue from: Actions minutes
are free only on **public** repos, so the "lean CI" comments in `ci.yml` and
`gitleaks.yml` — which read as stale while the repo was public — are load-bearing
again.

### The workflow that had been failing on every push

`apply-migration.yml` declares `on: workflow_dispatch` and nothing else. It had
**five runs on `push`** since the flip — `master` and every open branch — each
reported as `.github/workflows/apply-migration.yml` rather than by its `name:`,
with *"This run likely failed because of a workflow file issue."*

A workflow cannot run on an event it does not declare. Both symptoms are the same
one: the file does not parse, so GitHub can read neither `on:` nor `name:`, and
surfaces the failure against the push instead. The cause is one line:

```yaml
if: ${{ secrets.SUPABASE_DB_URL == '' }}
```

`secrets` is not an available context in a step-level `if:`. It does not evaluate
false — it invalidates the file. `aikido.yml`'s header has documented this exact
trap since it was written (*"`if: secrets.X != ''` is unreliable on GitHub Actions
— use an env gate step instead"*), and uses the env-gate pattern this one now
copies.

### Underneath it, the preferred path had never worked

Fixing the parse error made a second defect reachable. The SQL step reads
`.env.production` unconditionally, but only the legacy Vercel step writes it — and
that step is skipped exactly when `SUPABASE_DB_URL` is set, which is the path the
header calls *preferred*. Every preferred-path run would have died on `ENOENT`
before a connection string was ever chosen.

That is the third distinct way this workflow has failed to apply a migration, and
its own header names the first two and the lesson: *"A migration path that has
never once succeeded … is worse than no migration path at all: it reads as
working."* **Not falsified by execution** — the workflow needs production
credentials — so it is reasoned from the code path and stated as such.

### CodeQL's cron now buys a guaranteed failure

`codeql.yml` last genuinely succeeded **2026-08-01** (run 30693504626), while
public. On a private repo the analyze step's upload 403s, and the job carries
`continue-on-error: true` — so the monthly cron would spend ~5 minutes of a
now-metered quota to produce a hidden failure. Cron commented out with a restore
note; `workflow_dispatch` kept, so the config survives a flip back.

### Not done, named

- **PR #120** (`chore/github-security-hardening`, open since 2026-07-28) is an
  earlier pass at this same checklist, written while public. **100 commits
  behind**, conflicts in three of its eleven files, and every doc change now
  asserts a false state: `SECRETS.md` ticks `[x]` for push protection and code
  scanning, `controls.yaml` records CodeQL default setup as compliance evidence,
  `VERCEL_DEPLOY_CHECKLIST.md` asserts Actions are free, and `SECURITY.md` makes a
  404ing advisory link the *preferred* reporting channel. It also adds a
  `dependency-review.yml` that cannot run here. **Recommend closing, not
  rebasing** — the compliance docs are its most stale part, not its most valuable.
- **Branch protection** on `master` — still none, no rulesets. Protected branches
  need GitHub Pro or higher on a private repo; the plan is not readable without
  the `user` scope.
- **Aikido is a green no-op.** `AIKIDO_SECRET_KEY` is unset, so the gate returns
  `configured=false` and every real step skips — runs pass in 7–9s having scanned
  nothing. `ci.yml`'s `npm audit --audit-level=high` is `continue-on-error: true`
  and cannot fail. Both are the shape `.224` was named for; neither is fixed here,
  because one needs a credential and the other is a policy call.
- **LOG.md is over its own rotation rule** — 25 entries / 108KB against ≤15 /
  ≤20KB. Pre-existing; not rotated here.

### Carried, not authored

`gitleaks.yml`'s `permissions:` block was already on `master` (`.224` carrying
`.235`). Reached independently here from the same 403 and **dropped as redundant**
— and `.224`'s diagnosis corrects mine: the failures predate the flip (#181, #182)
and hit the **first run of every PR**, so visibility was never the cause.

---
