# HOW_IT_GETS_DONE — ClearShot iOS

Sequence and roles. If a step is founder-owned, agents do not check it off and do not “help” by inventing the artifact.

---

## 1. Phases

```
Paper (this pack)
  → Landing + PAYMENT_URL (founder)
  → 14-day clock (founder)
  → Score (founder)
      ├─ Kill → refund + mark killed
      ├─ Thin continue → one change, one more clock
      └─ Pass → spikes → v1 binary → StoreKit → submit
```

Do not skip left to right. Do not run spikes “in parallel to see.” PhotoKit curiosity is not a phase.

---

## 2. Roles

| Role | Owns | Does not own |
|------|------|----------------|
| **Founder** | Entity, checkout, refunds, traffic, kill/pass, Apple Developer, App Store Connect, bundle id, privacy policy host, counsel | Agent-written traction |
| **Agents** | This pack, later landing *copy* if asked, later Swift **after pass**, tests, listing drafts | `PAYMENT_URL` value, EIN, merge of this PR, `PRIVATE_MODE`, MW iOS lane |
| **Nobody** | Invented 5 preorders | — |

---

## 3. Phase A — Paper (now)

**Done when:** the seven files + indexes exist; `PAYMENT_URL` appears only as the placeholder token; no `apps/ios`; no live checkout in git.

**This PR.** Do not merge unless the founder wants the pack on `master`. The request for this pack is **do not merge**.

Exit: founder can run Phase B without re-deriving the wedge.

---

## 4. Phase B — Sell (founder)

1. Stand up a **single** public URL (Carrd, Astro page, Notion — irrelevant).
2. Replace `PAYMENT_URL` in the **live page** (not necessarily in git). If the token is committed, commit only after the URL is real **and** non-secret (a checkout link is not a secret key; still do not commit API keys).
3. Wire refunds (same rail).
4. Send the first 10 personal asks using [SELL_FIRST.md](SELL_FIRST.md) copy.
5. Log the tally daily for 14 days.

**Agent assist (only if asked):** HTML/markdown landing from SELL_FIRST §4. Still no secrets. Still no MW route.

Exit: a number at day 14.

---

## 5. Phase C — Score (founder)

Apply FRAMEWORK §7. Write the result in a follow-up PR to [INDEX.md](INDEX.md) (`killed` / `thin-continue` / `passed YYYY-MM-DD`).

Agents may draft that one-line status. Agents may not invent the count.

---

## 6. Phase D — Spikes (after pass only)

Follow [SPIKE_PLAN.md](SPIKE_PLAN.md) in order. One spike per PR. Each spike has a falsifier. No App Store chrome until S1–S4 are green.

Repo home: **founder picks** (this monorepo vs a sibling). Default recommendation: **sibling repo** so MW CI, excellence gate, and iOS-defer rules do not get a second product glued into `apps/`. If it stays here, path is **not** `apps/ios` (that name is the MW playbook). Suggested: `apps/clearshot-ios/` and an INDEX that says “BANGERS, not MW wedge.”

Do not implement that path in the paper PR.

---

## 7. Phase E — v1 (after spikes)

[BUILD_LATER.md](BUILD_LATER.md). StoreKit. Privacy policy. Connect listing. Review notes.

Founder submits. Agents prepare the binary and notes.

---

## 8. Agent operating rules

1. Read [FRAMEWORK.md](FRAMEWORK.md) before any ClearShot edit.
2. Horizon rule for **MW** still applies. This track does not unlock MW iOS.
3. Never flip `PRIVATE_MODE`. Never invent traction.
4. Never write fitness competitor names. Photo-cleaner names are OK in this folder.
5. Never replace `PAYMENT_URL` with a guessed checkout.
6. Never start Swift because the pack is “done.”
7. One concern per PR. This pack is research-only.
8. `[skip vercel]` on commits unless the founder asked for a Preview (MW site).
9. Do not merge this PR from the agent side.

---

## 9. Timebox (effort, not calendar promises)

| Phase | Shape |
|-------|--------|
| Paper | One research PR (this). |
| Landing | One static page. Hours, not a design system rewrite. |
| Clock | 14 days of founder asks. Agents idle on Swift. |
| Spikes | Four small PRs (fetch, Limited, delete, honest-copy). |
| v1 | Review list + IAP + listing. No kitchen sink. |

If a spike exceeds “one weekend of Swift,” the spike is too big — cut scope, do not add Gemini features.

---

## 10. Definition of done

| Phase | Done |
|-------|------|
| A | Seven files + indexes + root routing. Placeholder only. |
| B | Live page + live checkout + first asks sent. |
| C | Written score; refunds if kill. |
| D | Spike falsifiers green; notes in SPIKE_PLAN. |
| E | TestFlight or App Store; payers from B honored. |

---

## 11. Collision protocol (MW ClearShot)

If an agent is in `src/lib/mission-os/clearshot.ts` or `packages/mw-core` ClearShot stubs, they are on the **mini contract**, not this bet. Do not “finish the mini” as a shortcut to BANGERS v1.

If an agent is in this folder, they do not expand mini scopes (`billing.read`, `health.write`) to make an App Store app.
