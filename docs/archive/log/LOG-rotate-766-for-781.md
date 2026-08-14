# Rotated from LOG.md when `.781` landed

## 2026-08-14 — Merge all open PRs on a Cursor landing branch (`.766`)

GitHub showed 47 open PRs and ~45 Security/quality/Dependabot items “not ready”.
Actions minutes are exhausted; Hobby Previews are capped. Founder asked to merge
all locally in Cursor — one landing branch, not 47 GitHub merges.

**Ship:** fetched every open PR head and merged oldest-first onto
`cursor/merge-all-open-prs-0254`. Conflict policy: CONTEXT / LOG / `buildInfo.ts`
stayed the landing branch; other files took incoming. That clobbered master’s
Train logger (`.754`–`.764`); restored those files from `origin/master` and
re-added PR storage keys, redirect aliases, and schema. Duplicate LOG-rotate
files from overlapping PRs were collapsed to one `##` heading per label.

**Not this ship:** 0 open Dependabot PRs — the 45 Security items are alerts, not
mergeable PRs. `PRIVATE_MODE` unchanged. No Vercel Preview. Production Deploy
Hook is unmetered and only fires on `master`. Train empty Start stays
repeat-last / empty (no Just Go). Free logger ungated.

Landed: #428 #452 #456–459 #466–467 #477–479 #485 #487–492 #494–502 #504–505
#518–519 #521–522 #524 #531–532 #534 #536–537 #539–543, plus stacked #481–483.

**Compose:** after the oldest-first merge, re-wired PR surfaces onto master's
Train logger — Victory vs-last receipt, Coach garage swap, hard-session warning,
About/Account cards, cinematic landing + notify, consent banner, shop copy.
CONTEXT still mutes `/bundle` → `/log`. Empty Start stays repeat-last.

Label `.766` (onto master `.764`; `.765` Preview walk is already in this tree
from #542). Excellence-Override below.

Excellence-Override: merge-all Cursor landing (Actions minutes / no Vercel preview)

Rotated LOG oldest → [LOG-rotate-751-for-766.md](./LOG-rotate-751-for-766.md).
