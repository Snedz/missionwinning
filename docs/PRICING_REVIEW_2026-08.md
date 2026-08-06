# Pricing review — 2026-08-05

**Status:** Review complete (R0–R2). **No live price or FREE_BETA changes.**  
**Tip:** web `2026.07-unified.543`  
**Plan:** [.hermes/plans/2026-08-05_233944-product-pricing-review.md](../.hermes/plans/2026-08-05_233944-product-pricing-review.md)  
**Related:** [STRATEGY.md](STRATEGY.md) · [FREE_BETA.md](FREE_BETA.md) · [STRIPE_PREMIUM_SETUP.md](STRIPE_PREMIUM_SETUP.md) · [bundleConfig.ts](../src/lib/bundleConfig.ts) · [payments.ts](../src/lib/payments.ts)

---

## 1. Executive recommendation

**Option A — Hold strategy prices** until FREE_BETA ends and there is real conversion data.

| SKU | Keep |
|-----|------|
| Monthly | **$11.99**/mo (anchor — do not discount) |
| 12-month founders | **$59**/yr (~$4.92/mo) — **default push** |
| Lifetime | **$149** one-time (cap new sales 100–200; USDC same amount) |

**Why hold:** FREE_BETA is still on (pay UI muted; depth unlocked). Super Bundle **depth just shipped** (Move/Mind/Fuel catalogs, continuity, rewards, form pack) — that strengthens the *story* for $59/yr without forcing a raise before anyone has paid. Wave 8 comps still put pure AI loggers at ~$16/mo with **no free logger**; MW’s free core is the wedge.

**Do now (no price change):** reconcile doc drift, refresh Bundle merchandising copy to **current contentInventory**, clarify free vs paid boundary, write FREE_BETA exit + grandfather steps. **Founder:** confirm Stripe Price amounts match when entity can take payment.

**Raise later (Option B)** only after FREE_BETA off + first paid cohorts + founders locked.

---

## 2. Inventory — every price surface

### 2.1 Super Bundle (consumer flagship)

| SKU | Display SoT | Strike | Per month | Badge | Code | Crypto |
|-----|-------------|--------|-----------|-------|------|--------|
| Monthly | $11.99 | $24 | $11.99 | — | `BUNDLE_PLANS.monthly` | — |
| 12-mo | $59 | $143.88 (= 12×11.99) | $4.92 | popular | `BUNDLE_PLANS['12mo']` | — |
| Lifetime | $149 | $299 | — | bestValue | `BUNDLE_PLANS.lifetime` | $149 USDC (`LIFETIME_USDC_AMOUNT`) |

| Constant | Value | File |
|----------|-------|------|
| `SUPER_BUNDLE_PRICE` | `11.99` | `payments.ts` (monthly anchor) |
| `DEFAULT_BUNDLE_PLAN` | `12mo` | `bundleConfig.ts` |
| `BUNDLE_DISCOUNT_NOTE` | Founders annual ~$4.92/mo ($59/yr) · monthly $11.99 · lifetime $149 | `payments.ts` |
| Stripe env keys | `STRIPE_PRICE_BUNDLE_MONTHLY` / `_12MO` / `_LIFETIME` | `stripeServer.ts` |
| Payment Link env | `NEXT_PUBLIC_STRIPE_LINK_BUNDLE_*` (+ legacy `_3MO` fallback) | `payments.ts` |

**Default merchandising plan:** annual (`12mo`) — correct per STRATEGY.

### 2.2 Pillar “standalone” comparison (illustrative only)

| Pillar | Display $/mo | Sum |
|--------|--------------|-----|
| Train | 15 | |
| Fuel | 10 | |
| Move | 9 | |
| Mind | 7 | |
| Track | 8 | |
| Learn | 12 | |
| **Total** | | **$61/mo** |

Bundle monthly $11.99 ≈ **80% off** that stack; annual ~$4.92/mo is stronger. STRATEGY’s external stack (Strong+MFP+Calm+Pliability ≈ $60/mo) still aligns.

**Honesty note:** These are **illustrative** standalones (not live SKUs). Bundle copy already says illustrative — keep that.

### 2.3 One-time “program” prices (secondary)

| Product id | `PROGRAM_PRICES` | Locale `programs.json` | Drift |
|------------|------------------|------------------------|-------|
| pt-nutrition | $497 | $497 | OK |
| bodybuilding | $297 | $297 | OK |
| corrective | $347 | $347 | OK |
| strength-business | $297 | **$397** (`progBizPrice`) | **DRIFT** |
| online-coaching | **$997** | **$297** (`progOnlinePrice`) | **DRIFT** |
| conditioning | $247 | $247 | OK |

**Recommendation:** Treat programs as **secondary / possibly parked** under Super Bundle GTM. Either reconcile locales to `PROGRAM_PRICES` or stop showing program prices until SKUs are real. Do **not** let program SKUs confuse Super Bundle message.

### 2.4 Live GTM / ops

| Fact | State |
|------|--------|
| `isFreeBeta()` default | **ON** unless env explicitly false |
| Bundle UI | Muted / `/bundle` → `/log` while FREE_BETA |
| Premium depth | Unlocked for everyone in FREE_BETA |
| Stripe live amounts | **Founder verify** in Dashboard (not in git) |
| Founders 500 | STRATEGY promise — **no code counter** yet |
| Lifetime cap 100–200 | STRATEGY — **not enforced in code** |

### 2.5 Doc / copy drift (fix without changing prices)

| Issue | Where | Fix |
|-------|--------|-----|
| STRATEGY still says bundleConfig has **3mo/$33, 12mo/$96** | STRATEGY.md L52 | Update to monthly/$11.99, 12mo/$59, lifetime/$149 (code already simplified) |
| `BUNDLE_PILLARS` free/premium blurbs outdated | `payments.ts` | Refresh to contentInventory (e.g. Fuel free **40** recipes not 20; Move free **24** not 10; Mind free **24** not 10) |
| Fuel free count in older docs | various | Prefer inventory / catalogMeta |
| Founders 500 / lifetime cap | STRATEGY only | Decide: implement counters or soften to “founders pricing while early” |

---

## 3. Value vs price (shipped product)

### What free must include forever

- Offline workout logger (no account)  
- Just Go / freestyle train  
- Basic Fuel log, free recipes (40), free Move/Mind floors  
- Honest progression without pay-to-win  

### What Super Bundle is selling

| Asset (tip `.543`) | Free | Premium / unlocked total (beta) |
|--------------------|------|----------------------------------|
| Move flows | 24 | 40 → 64 unlocked |
| Mind sessions | 24 | 48 → 72 unlocked |
| Recipes | 40 | 102 → 142 unlocked |
| Learn premium sections | — | 16 |
| Form pack stills | 18 | (+ video 15) |
| Mission Coach | adaptive plans from logs | depth / premium coach features as gated when beta ends |
| Continuity + rewards badges | free | — |

**Read:** At $59/yr the product is still cheap vs Fitbod (~$96/yr) **that charges to log**. Raising prices is optional **after** people pay once; not required to justify shipping depth.

---

## 4. Competitive position (Wave 8 + STRATEGY)

| Comp | Price signal | MW response |
|------|--------------|-------------|
| Fitbod | ~$15.99/mo · ~$96/yr; **pay to log** | Free logger forever; paid = Coach depth + pillars |
| Runna / Ladder | ~$18–30/mo; hard paywall | Softer ask; annual founders |
| Freeletics Super Bundle | Multi-app bundle narrative | **One app** Super Bundle (advantage) |
| Strong + MFP + Calm + mobility stack | ~$60/mo narrative | $11.99 or $4.92/mo annual |
| Boostcamp Pro | ~$60/yr programs | Bundle must feel wider than one program pack |
| Human coaching | $150–400+/mo | Ceiling story only — don’t price like humans |

**Positioning one-liner (recommended):**  
> Free forever offline logging. Super Bundle adds adaptive Mission Coach depth and every pillar — one price, one app, no multi-app unlock email.

**Avoid:** countdown fake urgency; silent post-trial charge (Wave 8 complaint #5); paywall before first logged set.

---

## 5. Options (founder pick)

| Option | Monthly | Annual | Lifetime | When |
|--------|---------|--------|----------|------|
| **A — Hold (recommended now)** | $11.99 | $59 | $149 | Until FREE_BETA ends + first paid data |
| **B — Raise anchor** | $14.99 | $79–99 | $179–199 | After paid cohorts; **grandfather** early at A |
| **C — Simplify** | Drop or hide monthly | Annual-only default | Optional/capped | If choice overload hurts; test carefully |

### Pros/cons

| | Pros | Cons |
|--|------|------|
| **A** | Aligns code+STRATEGY; simple Stripe; fair vs comps | May leave money on table after depth ships |
| **B** | Captures value of Super Bundle depth | Needs trust + grandfather; harder message mid-beta |
| **C** | Hick’s law; cleaner shop | Loses “no subscription” lifetime buyers |

**Recommendation:** **A** + packaging hygiene (below). Revisit **B** 30–60 days after FREE_BETA off.

---

## 6. Free vs paid boundary (when FREE_BETA ends)

### Free forever (never charge)

- Workout logger, history, builder basics  
- Account optional  
- Free recipe / Move / Mind floors (honest inventory)  
- Re-entry, rewards XP on free actions (no pay-to-win)  

### Super Bundle (paid)

- Premium Move/Mind/Learn catalogs beyond free floors  
- Premium recipes / Fuel coach depth  
- Premium Mission Coach capabilities (as currently gated when not FREE_BETA)  
- Any GPS/premium Track depth if gated  

### Explicit non-goals at paid flip

- Gating free logger  
- Ads on free tier  
- Fake “credits” leftover from beta  

### Grandfather (recommended)

| Cohort | Treatment |
|--------|-----------|
| FREE_BETA actives with real training history | Optional **founders Price** or time-limited $59 lock; never punish logs already made |
| Waitlist non-users | Standard founders window (honest 72h optional, not dark pattern) |
| Lifetime buyers | Keep lifetime; stop new lifetime if COGS (LLM) hurts |

---

## 7. FREE_BETA exit checklist (founder)

1. LLC/EIN + business Stripe live ([LLC_AND_PAYMENTS](LLC_AND_PAYMENTS.md), [STRIPE_PREMIUM_SETUP](STRIPE_PREMIUM_SETUP.md)).  
2. Create/confirm Prices: monthly 1199¢, annual 5900¢, lifetime 14900¢ (or chosen option).  
3. Set Vercel: `STRIPE_PRICE_*`, webhook secret, `NEXT_PUBLIC_FREE_BETA=false`.  
4. Redeploy; verify `/bundle` shop; test checkout → enrollment → premium status.  
5. Logger still works logged-out.  
6. Announce: free core forever + Super Bundle prices (email/waitlist).  
7. Soften or implement Founders 500 / lifetime cap **honestly**.

Agents never flip FREE_BETA.

---

## 8. Recommended packaging fixes (no $ change)

Priority order for a follow-up **implement** Go:

| # | Fix | Files |
|---|-----|--------|
| 1 | Update STRATEGY L52 stale “3mo/$33, 12mo/$96” | `docs/STRATEGY.md` |
| 2 | Refresh `BUNDLE_PILLARS` free/premium counts from contentInventory | `src/lib/payments.ts` + tests if any |
| 3 | Reconcile program locale prices **or** hide program store | `programs.json` vs `PROGRAM_PRICES` |
| 4 | Document founders/lifetime caps as marketing-only until coded | STRATEGY or this doc |
| 5 | Bundle page copy pass — stack story + free forever | bundle locales |

**Do not** change `BUNDLE_PLANS` dollar amounts without founder Option B/C.

---

## 9. Risks

| Risk | Mitigation |
|------|------------|
| Underpricing after depth | Option B later; founders locked at A |
| Lifetime LLM COGS | Cap new lifetime sales |
| Strike $24 / $299 feel fake | Prefer “vs $60/mo app stack” prose; strikes are internal refs |
| Bait-and-switch out of FREE_BETA | Grandfather + clear free list |
| Program SKU confusion | Bundle-first; fix or hide program prices |
| Android Play parity | Same $ when billing ships |

---

## 10. Founder decisions needed

- [ ] **Confirm Option A** (or pick B/C)  
- [ ] Stripe Price amounts match table (when entity live)  
- [ ] Founders 500: real counter vs soft language  
- [ ] Lifetime: keep selling vs cap/retire  
- [ ] FREE_BETA end date / trigger (entity + payments live)  
- [ ] Approve packaging fixes 1–5 above  

---

## 11. Status

| Phase | Status |
|-------|--------|
| R0 Read | Done |
| R1 Inventory | Done (this doc §2) |
| R2 Competitive + options | Done (§4–5) |
| R3 Founder decision | **Waiting** |
| R4 Implement | Not started |
| R5 Pay smoke | Founder |

---

Changelog: `2026-08-05 — initial pricing review (hold Option A; packaging hygiene next).`
