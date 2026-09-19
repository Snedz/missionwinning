# FRAMEWORK — Token router (gas pipeline)

Track 03 · `RESEARCH/BANGERS/token-router-pipeline/` · paper 2026-09-19 · not commissioned

One home for the metaphor, the laws, the five-stage machine, the hatch, and the M1 caps. Sell copy lives in [SELL_FIRST.md](SELL_FIRST.md). Deferrals live in [BUILD_LATER.md](BUILD_LATER.md). Stage I/O lives in [HOW_IT_GETS_DONE.md](HOW_IT_GETS_DONE.md). Industry names live in [INDUSTRY_LANDSCAPE.md](INDUSTRY_LANDSCAPE.md).

---

## 1. One-sentence claim

**Tokens are energy. A router is a pipeline. An indie operator owns the valves, meters every joule before it flows, and never opens a paid well unless a hatch on disk says so.**

That is the whole product. Everything else is a well, a trader, a substation, or a municipal subsidy — useful to know, fatal to clone.

---

## 2. Why this exists

Intelligence work now burns tokens the way a shop burns kilowatt-hours. The burn is real, metered by someone else, and easy to leave unmetered on your side.

Three failure modes keep repeating for solo operators and small agent shops:

1. **Silent paid spend.** A fallback, a retry, a "just this model," a default `api.openai.com` in a library, a reasoning-effort flag that is not capped by `max_tokens`. The invoice arrives after the work. Mission Winning already named this once: `COACH_LLM_ALLOW_HIGH_REASONING` is unset because high reasoning on Grok 4.6 is a silent bill ([docs/ENV.md](../../../docs/ENV.md)). The law generalizes.
2. **Cloud-shaped routers for laptop-shaped shops.** OpenRouter, Portkey, LiteLLM Cloud, Cloudflare AI Gateway, Martian — all assume a control plane, an account, a credit balance, or a YAML that still talks to paid upstreams by default. The indie default should be the opposite: **disk is the control plane; paid is a locked hatch.**
3. **Free mistaken for a well you own.** Freebuff / Codebuff sell ad-supported inference *inside their product*. Their terms forbid calling the underlying servers from wrappers, scripts, or custom clients. Municipal power is not a tap you can run a street from. A router that "just uses Freebuff" is a ToS violation, not a cost strategy.

This track proposes a **disk-first indie router**: a local pipeline that inspects wells, ranks them, **claims a budget envelope on disk**, dispatches only inside that claim, and writes a receipt. Free-first. `ALLOW_PAID` is an explicit hatch. M1 caps are pressure-relief valves. No silent paid spend.

It is a BANGERS side-bet, not a Mission Winning feature. Coach already has a dollar brake (`LLM_DAILY_USD_CENTS`, default 15¢/identity/day, fail-closed in `src/lib/llm/spendLimit.ts`). That brake is one well, one provider, one product. This router is a different machine that could later sit in front of several wells. Do not wire it into `/coach` from this paper.

---

## 3. Metaphor (closed)

Keep the mapping closed. If a new noun does not fit a row, it is not a new kind of thing — it is a well, a valve, or a bill.

| Energy | Tokens |
|--------|--------|
| Joule / kWh | Token (prompt + completion + reasoning + cache-write/read) |
| Well / generator | A *provider endpoint* that actually runs weights (Together, Fireworks, xAI, Groq, local Ollama/llama.cpp, a GPU box) |
| Commodity trader | Aggregator that resells many wells on credits (OpenRouter) |
| Substation | Proxy gateway that adds cache, keys, fallback, logs (LiteLLM, Portkey, Cloudflare AI Gateway, Helicone) |
| Dispatcher | Smart router that picks a well per prompt (Martian, Not Diamond, Fireworks Nexus FireRouter) |
| Municipal / subsidized power | Ad-supported free inference *inside someone else's product* (Freebuff). Not a well you may tap. |
| Pipeline | This router — the path gas is *allowed* to take |
| Wellhead inspection | **health** |
| Dispatch ranking | **score** |
| Work order / reserved capacity | **claim** (on disk, before the valve opens) |
| Open the valve | **dispatch** |
| Meter close / invoice | **receipt** |
| Padlock on the paid well | **`ALLOW_PAID` hatch** (default locked) |
| Pressure-relief valve | **M1 caps** |
| Unmetered tap | Silent paid spend — **forbidden** |

Rules the metaphor enforces:

- You cannot bill what you did not claim.
- You cannot dispatch what you did not score as eligible.
- You cannot score a paid well as eligible while the hatch is locked.
- You cannot treat municipal power as a well in the registry.
- A receipt that says `$0` on a paid well is a bug, not a feature.

---

## 4. The machine (five stages)

One request, five stages, in order. No stage may be skipped. No stage may call the next until its artifact is on disk (or an equivalent atomic store that *is* the disk for tests).

```
health → score → claim → dispatch → receipt
```

| Stage | Question | Artifact | Fail closed |
|-------|----------|----------|-------------|
| **health** | Which wells answer, how fast, since when? | `health/<provider_id>.json` | Unknown / expired health is not "up" |
| **score** | Of the *eligible* wells, which should take this job? | `score/<request_id>.json` | Paid wells score ineligible unless hatch open |
| **claim** | Can we reserve this envelope *before* gas flows? | `claims/<claim_id>.json` (`open`) | Over cap, hatch locked, no eligible well → no claim |
| **dispatch** | Send the bytes, only inside the claim. | `dispatch/<claim_id>.json` (attempt log) | No open claim → no HTTP |
| **receipt** | What actually burned? Close or refund the claim. | `receipts/<claim_id>.json` | Missing receipt after dispatch is an alarm, not a shrug |

### 4.1 health

A probe is a cheap, named check: TCP/HTTP to a `/models` or `/health` path, or a 1-token chat if that is the only honest ping. Result is `up | degraded | down | unknown`, plus `latency_ms`, `checked_at`, `expires_at`, and the last error class (`timeout`, `auth`, `rate_limit`, `5xx`, `dns`).

Health is not permission. A paid well can be `up` and still ineligible.

Stale health (`now > expires_at`) degrades to `unknown`. `unknown` is not `up`. Score may not treat it as eligible without a fresh probe *in this request* or an explicit `accept_stale_health: true` on the request (default false).

### 4.2 score

Score reads the registry + current health + request class + hatch + remaining M1 caps. It emits an ordered list of *eligible* provider ids and a reason per row.

Default ranking (M1, closed — do not invent a sixth key without amending this file):

1. **cost class** — `local` > `free` > `credits_owned` > `paid` (paid only if hatch open)
2. **health** — `up` > `degraded`; `down` / `unknown` out
3. **fit** — request `capability` ⊆ provider `capabilities` (chat, tools, vision, json, long_context)
4. **latency ewma** — lower better, missing treated as worse than measured
5. **recent error rate** — from receipts, not from marketing

`credits_owned` means *you already bought credits on that well* (a Together balance, a Fireworks account). It is still paid-class for the hatch: burning credits is paid spend. The hatch is about *money leaving*, not about whose logo is on the invoice.

Smart quality routing (Martian-style "which model will be best") is **out of M1**. See [BUILD_LATER.md](BUILD_LATER.md).

### 4.3 claim

The claim is the work order. It is the difference between this router and a `fetch()` wrapper.

A claim is an atomic create of a file (or a SQLite row with the same fields) that **reserves**:

- `provider_id` (the chosen well, or an ordered failover list *already scored*)
- `class` (`local` | `free` | `credits_owned` | `paid`)
- `max_prompt_tokens`, `max_completion_tokens`, `max_reasoning_tokens`
- `max_usd_cents` (must be `0` unless hatch open **and** class is `paid` or `credits_owned`)
- `deadline_at`
- `request_hash` (so retries of the *same* request reuse one claim)

If the reservation would breach an M1 cap, the claim is refused. Nothing is sent.

Failover: a claim may list `failover: [id…]` from the score list. Burning a failover attempt still counts against the same envelope. A new envelope requires a new claim. Silent "try the expensive one" is how silent paid spend happens.

### 4.4 dispatch

Dispatch is allowed only when `claims/<id>.status == open` and `now < deadline_at`.

It performs the HTTP (or local process) call. Retries are:

- only on `timeout` / `429` / `5xx` of the *same* provider, or the next `failover` id
- only while `attempts < claim.max_attempts` (M1 default 2)
- only while the envelope is not exhausted

A 401/403 is not retried onto a paid well. That is a key problem, not a routing problem.

The attempt log records provider, started_at, ended_at, http status, and token usage *as reported*. If the provider reports nothing, the receipt marks `usage: estimated` and uses the claim's max as the conservative burn (you over-count rather than under-count).

### 4.5 receipt

Every dispatch produces a receipt, including failures.

The receipt closes the claim (`closed` | `refunded` | `breached`).

| Close | Means |
|-------|--------|
| `closed` | Usage ≤ claim envelope. Caps decrement by *actual* (or conservative estimate). |
| `refunded` | No well accepted the call; reserved envelope returns. |
| `breached` | Provider burned more than claimed (or we lost the stream). Alarm. Caps decrement by **max(actual, claim)**. Hatch does not get a free pass. |

A crashed process after dispatch and before receipt is recovered on next boot by a **reconcile**: open claims past `deadline_at` with a dispatch log become `breached` at the claim max; open claims with no dispatch become `refunded`. Reconcile is part of M1, not later.

---

## 5. Free-first

Default registry after `init`:

- `local` wells only (Ollama, llama.cpp, a configured `localhost` OpenAI-compatible).
- Optionally `free` wells that are *honestly free for API use* (a provider's documented free tier you may call with your own key, with their rate limit). Each such row must cite a `tos_url` and a `free_tier_notes` string. If you cannot cite it, it is not `free`.
- **Zero** `paid` or `credits_owned` rows until the operator adds them *and* opens the hatch.

"Free-first" is not "we will find you free tokens." It is "the machine does useful work on local/free wells, and paid is a deliberate later act."

Forbidden free-first lies:

- Shipping a default OpenRouter key, even "for demos."
- Scoring OpenRouter / Martian / Portkey as `free` because the gateway itself has a $0 plan. The *tokens* are still paid.
- Wrapping Freebuff, Gemini web, ChatGPT web, or any product ToS that forbids non-official clients.
- Calling a "free model" on OpenRouter without documenting that OpenRouter free models have daily limits and are still *their* product, not your well.

---

## 6. `ALLOW_PAID` hatch

The hatch is a bit on disk (and optionally mirrored in env). Default: **locked**.

```yaml
hatch:
  allow_paid: false          # ALLOW_PAID
  opened_at: null
  opened_by: null            # operator id, never an agent default
  reason: null               # required non-empty when opening
```

Laws:

1. Env `ALLOW_PAID=true` **cannot** open the hatch by itself. Env may *request* open; the disk file must already be open, or a `router hatch open --reason …` command must write it. A stray env in CI must not spend.
2. Env `ALLOW_PAID=false` or unset **forces locked**, even if the disk file says open. Fail closed on disagreement. The operator must fix the disagreement; the router must not guess.
3. Opening the hatch does not add providers. Adding a paid provider does not open the hatch. Both are required to burn money.
4. A locked hatch makes every `paid` and `credits_owned` provider ineligible at score. Health may still probe them (probes must be `max_usd_cents: 0` or a documented free ping).
5. There is no "emergency override" flag in M1. If you need one, you are asking to reintroduce silent spend. Open the hatch with a reason instead.
6. Closing the hatch does not delete receipts. It refuses new paid claims.

The name `ALLOW_PAID` is the public switch. Internally the bit is `hatch.allow_paid`. Do not grow a second spelling.

---

## 7. M1 caps (pressure relief)

M1 is the first *runnable* milestone after this paper. Caps are closed. Changing a number is a schema bump (`caps.version`), not a silent edit.

| Cap | Default | Unit | Notes |
|-----|---------|------|-------|
| `max_open_claims` | 4 | count | In-flight work orders |
| `max_providers` | 16 | count | Registry size |
| `max_local_tokens_per_day` | 2_000_000 | tokens | Prompt+completion+reasoning, local wells |
| `max_free_tokens_per_day` | 200_000 | tokens | Documented free-tier API |
| `max_paid_usd_cents_per_day` | 0 | cents | Stays 0 until hatch open **and** operator sets a positive cap |
| `max_paid_usd_cents_per_claim` | 5 | cents | Even with a daily cap, one claim cannot be a blank check |
| `max_attempts_per_claim` | 2 | count | Retry + one failover |
| `health_ttl_sec` | 60 | seconds | Then `unknown` |
| `claim_ttl_sec` | 120 | seconds | Then reconcile |
| `receipt_retain_days` | 30 | days | Disk; rotate, do not grow forever |
| `max_body_bytes` | 1_048_576 | bytes | Request payload cap |

When hatch is locked, `max_paid_usd_cents_per_day` is treated as **0** regardless of the stored number. The stored number is the *intended* cap for when the hatch is open; it is not a leak.

`0` on a paid cap means "paid claims refuse," not "unlimited." Unlimited is not a legal value in M1. Schema rejects negative and rejects a sentinel like `-1`.

Org vs identity: M1 is single-operator. No multi-tenant, no per-athlete identity. Mission Winning's per-identity 15¢ brake stays in `src/lib/llm/` if this router is ever pointed at Coach — that is a later composition, not a replacement.

---

## 8. Laws (this track's constitution)

Numbered so a test can cite them.

| # | Law | Falsifier |
|---|-----|-----------|
| L1 | No dispatch without an `open` claim on disk. | HTTP client called in a test with claims dir empty or claim `closed`. |
| L2 | No paid/credits claim while hatch locked. | Claim created for class `paid` with `allow_paid: false`. |
| L3 | Hatch env/disk disagreement → locked. | Env true + disk false still claims paid. |
| L4 | Caps decrement *before* dispatch (reservation) and settle on receipt. | Dispatch occurs when reserved+this envelope would exceed a daily cap. |
| L5 | Conservative usage when provider is silent. | Receipt `usage: estimated` with burn `<` claim max. |
| L6 | Reconcile on boot. | Open claim past TTL with dispatch and no receipt remains `open`. |
| L7 | Municipal / ToS-forbidden products are not registry rows. | A `freebuff` or `chatgpt-web` provider id in the default registry. |
| L8 | No second home for a cap or the hatch. | A code path reads `process.env.ALLOW_PAID` without the disk file. |
| L9 | Receipts are append-only. | A receipt file overwritten in place without a successor id. |
| L10 | This paper does not ship Coach, Stripe, or a hosted SaaS. | A PR from this track edits `app/` or `src/lib/coach/`. |

L10 is a horizon fence. A later founder commission can repeal it in a new paper. This paper cannot.

---

## 9. What this is not

| Not | Because |
|-----|---------|
| OpenRouter | We do not resell 300 models or take a 5.5% credit fee. We do not hold users' money. |
| LiteLLM | We do not aim at 100+ provider adapters in M1. We aim at *honest empty* + a handful of wells. |
| Portkey / Prisma AIRS | We do not sell enterprise guardrails, SSO, or a PAN bundle. |
| Helicone | We are not an observability company. Receipts are a meter, not a session debugger. |
| Martian | We do not pick "the best model" with a routing model. Score is cheap and boring. |
| Cloudflare AI Gateway | We do not run at the edge. Disk on the operator's machine *is* the edge. |
| Together / Fireworks gateway | Those route across *their* deployments. We route across *yours*, including local. |
| Freebuff | We do not sell ads. We do not wrap their inference. |
| Mission Winning Coach | Different product. Different spend brake already shipped. |

The gap we occupy: **disk-first, claim-before-dispatch, free-first, hatch-locked paid, M1-capped, single-operator.** Nobody in the 2026 landscape sells that as the *product*. They sell catalogs, governance, or observability, and paid-by-default is the water they swim in.

---

## 10. Composition with Mission Winning (later, optional)

If — and only if — a founder commission says so:

- The router becomes a process or library that Coach's LLM caller asks for a claim.
- `LLM_DAILY_USD_CENTS` remains the *product* brake (athlete identity, org breaker).
- Router M1 caps remain the *machine* brake (operator laptop / agent host).
- Two brakes, two homes. A request must pass both. Do not collapse them.

Until that commission, the only legal MW touch from this track is **citation** (ENV.md, spendLimit, this folder).

---

## 11. Success and kill

**Paper success (this PR):** the file contract exists, the schema is proposed, the industry map is sourced, the laws are testable in prose.

**M1 success (later code):** a local CLI can `health`, `score`, `claim`, `dispatch`, `receipt` against Ollama; a locked hatch refuses a paid OpenAI row; a crash after dispatch reconciles to `breached`; tests kill mutants of L1–L9.

**Kill the track if:**

- The first customer is "we need 300 models behind one key" — that customer wants OpenRouter.
- The first customer is "pick the best model per prompt" — that customer wants Martian / Nexus.
- The first customer is "wrap Freebuff so our agents are free" — refuse. That is a ToS attack.
- Implementing M1 requires a hosted control plane to be useful. Then the bet is wrong; the world already has LiteLLM.

---

## 12. File map

| File | Owns (one fact) |
|------|-----------------|
| This file | Metaphor, laws, stages, hatch, caps, kill |
| [SELL_FIRST.md](SELL_FIRST.md) | Offer and buyer |
| [BUILD_LATER.md](BUILD_LATER.md) | What M1 will not contain |
| [HOW_IT_GETS_DONE.md](HOW_IT_GETS_DONE.md) | Disk paths, command shape, test plan |
| [CURSOR_TODO.md](CURSOR_TODO.md) | Tickets |
| [INDUSTRY_LANDSCAPE.md](INDUSTRY_LANDSCAPE.md) | Named competitors |
| [SOURCES.md](SOURCES.md) | URLs |
| [registry.schema.yaml](registry.schema.yaml) | On-disk shapes |
