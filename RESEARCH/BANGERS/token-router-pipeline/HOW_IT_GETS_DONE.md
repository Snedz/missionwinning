# HOW_IT_GETS_DONE — Token router (gas pipeline)

Track 03 · stage I/O, disk layout, commands, tests · paper 2026-09-19

This file is the implementation contract for a later M1. It is not permission to start that M1. Permission is a founder commission after [SELL_FIRST.md](SELL_FIRST.md) §4. Laws stay in [FRAMEWORK.md](FRAMEWORK.md). Shapes stay in [registry.schema.yaml](registry.schema.yaml). Tickets stay in [CURSOR_TODO.md](CURSOR_TODO.md).

---

## 1. Home on disk

Default root: `$TOKEN_ROUTER_HOME` or `~/.token-router/` (never a repo path inside Mission Winning unless a commission says so).

```
$TOKEN_ROUTER_HOME/
  registry.yaml          # providers + caps.version
  hatch.yaml             # allow_paid + reason
  secrets.env            # keys; 0600; never copied into receipts
  health/<provider_id>.json
  score/<request_id>.json
  claims/<claim_id>.json
  dispatch/<claim_id>.jsonl   # one line per attempt
  receipts/<claim_id>.json
  receipts/index.jsonl        # append-only pointer (id, closed_at, usd_cents, tokens)
  alarms.jsonl               # reconcile + breach
```

Atomic write rule: write `*.tmp` in the same directory, `fsync`, then `rename`. Windows later. M1 is POSIX.

Secrets: provider keys are referenced as `auth.env: OPENAI_API_KEY`, never inlined in `registry.yaml`. Receipts store `auth_ref`, not the secret.

Do not put this tree in the MW product repo, in `ops/`, or in a gist. Classification: LOCAL runtime, PUBLIC schema.

---

## 2. Process shape

M1 ships as a library + a CLI that calls the library. No daemon required.

```
router health [--provider id]
router score  --request request.json
router claim  --score score/<request_id>.json
router dispatch --claim claims/<claim_id>.json
router receipt --claim <id>          # normally called by dispatch
router reconcile                     # boot / cron
router hatch open --reason "…"
router hatch close
router status                        # caps remaining, open claims, hatch
```

Library entry (proposed):

```
run(request) → receipt
  health.ensure(ids)
  ranked = score(request)
  claim = claim.open(ranked, request)
  result = dispatch(claim, request)
  return receipt.close(claim, result)
```

`run()` is the only function an agent should call. Walking stages by hand is for tests and forensics.

A later HTTP façade (BUILD_LATER) is `POST /v1/chat/completions` → `run()`. It still writes the same files.

---

## 3. Stage contracts

### 3.1 Request (input to `run`)

```yaml
request_id: req_…          # or derived from hash
created_at: <iso>
capability: [chat]         # subset of: chat, tools, vision, json, long_context
messages: […]              # not persisted by default
persist_prompt: false
max_prompt_tokens: 4096
max_completion_tokens: 1024
max_reasoning_tokens: 0
accept_stale_health: false
# no provider_id here — score chooses
# no usd field here — claim computes from class + caps
```

Prompts stay in memory unless `persist_prompt: true`. Receipts store `request_hash` (sha256 of canonical JSON of messages + capability).

### 3.2 health

Probe table (M1, closed):

| class | Probe | Paid tokens allowed |
|-------|--------|---------------------|
| `local` | `GET {base}/api/tags` (Ollama) or `GET {base}/v1/models` | n/a |
| `free` | `GET {base}/v1/models` with operator key | no chat probe |
| `paid` / `credits_owned` | `GET {base}/v1/models` only | no |

If a well has no models endpoint, skip it in M1 rather than inventing a 1-token chat ping (that ping *is* spend).

Output: see schema `HealthRecord`. `expires_at = checked_at + caps.health_ttl_sec`.

Parallel probes, cap concurrency at 4 (`max_open_claims` is for claims, not probes; probes use a hard 4).

### 3.3 score

Inputs: registry, hatch, health dir, remaining caps, request capability.

Algorithm (normative):

1. Drop providers whose `capabilities` do not cover the request.
2. Drop `down` and `unknown` unless `accept_stale_health` and health is only stale (not failed).
3. Drop `paid` and `credits_owned` if hatch locked **or** remaining `max_paid_usd_cents_per_day == 0`.
4. Drop any class whose daily token cap remaining is less than `max_prompt_tokens + max_completion_tokens + max_reasoning_tokens`.
5. Sort by the five keys in FRAMEWORK §4.2.
6. Write `ScoreRecord` with `eligible: [id…]` and `rejected: [{id, reason}]`.

If `eligible` is empty, `run()` returns a receipt-shaped denial (`denied: no_eligible_provider`) **without** a claim. That denial still appends to `alarms.jsonl` so empty-score is visible.

### 3.4 claim

`claim_id = clm_` + ulid.

Reservation math:

```
need_tokens = max_prompt + max_completion + max_reasoning
need_cents  = 0 if class in {local, free}
            = min(caps.max_paid_usd_cents_per_claim, remaining_paid_day) otherwise
```

Create the claim only if:

- `need_tokens` fits the class daily token remaining
- `need_cents` fits (and is 0 when hatch locked)
- `open_claims < max_open_claims`
- `deadline_at = now + claim_ttl_sec`

Increment in-memory + disk *reservation counters* (`reserved_tokens_*`, `reserved_cents_paid`) atomically with the claim file. Receipt settles: `reserved -= claimed; burned += actual` (or conservative).

Idempotency: if `request_hash` already has an `open` or `closed` claim younger than `claim_ttl_sec`, return that claim. Do not double-reserve.

### 3.5 dispatch

Allowed transports in M1:

| well kind | How |
|-----------|-----|
| `openai_compat` | `POST {base}/v1/chat/completions` |
| `ollama` | `POST {base}/api/chat` mapped to the same message list |

No other transports. Anthropic-native, Gemini-native, Bedrock: later.

Timeout: `min(claim.deadline_at - now, 60s)`.

Attempts: write one JSONL line before the socket opens (`state: starting`) and one after (`state: done | error`). A process killed after `starting` and before `done` is what reconcile treats as in-flight.

Failover: only to ids listed on the claim. Same envelope.

### 3.6 receipt

Fields: schema `Receipt`. Status mapping:

| Situation | status |
|-----------|--------|
| HTTP 2xx, usage ≤ envelope | `closed` |
| HTTP 4xx/5xx, no usage, no successful attempt | `refunded` |
| HTTP 2xx, usage missing | `closed` + `usage: estimated` at envelope max |
| HTTP 2xx, usage > envelope | `breached` |
| Deadline / kill after `starting` | `breached` at envelope max (reconcile) |
| Score empty | no claim; alarm only (`denied: no_eligible_provider`) |
| Hatch blocked a paid-only request | no claim; alarm (`denied: paid_hatch_closed`) |

Append `receipts/index.jsonl`. Never rewrite a receipt. A correction is a new receipt with `supersedes: rec_…`.

---

## 4. Hatch commands

```
router hatch open --reason "dogfood week, cap 25¢"
```

Writes `hatch.yaml`:

```yaml
allow_paid: true
opened_at: 2026-09-19T12:00:00Z
opened_by: $USER
reason: "dogfood week, cap 25¢"
```

`reason` min length 8. Empty / `--reason yes` is rejected.

Env:

| Env | Effect |
|-----|--------|
| `ALLOW_PAID=false` or unset | Force locked (even if file is open) |
| `ALLOW_PAID=true` | *Permit* open if file is already open; does **not** open |
| `TOKEN_ROUTER_HOME` | Root |

Disagreement (env true, file false): locked + alarm `hatch_disagree`.
Disagreement (env false, file true): locked + alarm `hatch_env_closed`.

---

## 5. Reconcile

Run on CLI start and on `router reconcile`.

For each `claims/*.json` with `status: open`:

1. If no `dispatch/<id>.jsonl` and `now > deadline_at` → `refunded`, release reservation.
2. If last dispatch line is `starting` and `now > deadline_at` → `breached` at envelope max, alarm.
3. If last line is `done` and no receipt → write receipt from that line (normal close path).
4. If `now <= deadline_at` → leave open (still in flight).

Never delete claim files in reconcile. Status changes in place *only* on the claim (the work order); the receipt is the append-only fact. Claim in-place status is the one allowed mutation; receipts are not.

---

## 6. Where code would live (when commissioned)

Proposed, not created:

```
tools/token-router/          # or a sibling repo — founder picks
  README.md                  # points at this RESEARCH folder
  src/
    run.ts
    health.ts
    score.ts
    claim.ts
    dispatch.ts
    receipt.ts
    hatch.ts
    reconcile.ts
    schema.ts                # generated or hand-kept from registry.schema.yaml
  src/*.test.ts
  bin/router
```

Not under `src/lib/coach/`. Not under `app/api/`. Not imported by the Next.js app in M1.

If the founder wants it in this monorepo, `tools/token-router/` is the only suggested path. Adding it is a later PR.

---

## 7. Test plan (write tests first when commissioned)

Recipe 16 still applies: tests before product code. Falsify the laws.

| Law | Test name (proposed) | Mutant that must die |
|-----|----------------------|----------------------|
| L1 | `dispatch_without_claim_throws` | Delete the open-claim check |
| L2 | `locked_hatch_refuses_paid_claim` | Score treats paid as local |
| L3 | `env_true_disk_false_stays_locked` | Read env only |
| L4 | `over_cap_does_not_http` | HTTP mock called when tokens remaining < need |
| L5 | `silent_usage_burns_claim_max` | Receipt tokens = 0 when usage omitted |
| L6 | `reconcile_starting_past_ttl_breached` | Leave claim open |
| L7 | `default_registry_has_no_municipal_ids` | Discover filenames + ids; fail on `freebuff`, `chatgpt-web` |
| L8 | `hatch_reader_always_joins_disk` | Grep: `process.env.ALLOW_PAID` without `hatch.yaml` read |
| L9 | `receipt_overwrite_fails` | `writeFile` on an existing receipt id |

Also:

- Idempotent claim on same `request_hash`.
- Failover does not create a second envelope.
- Local happy path against a fake Ollama.
- `max_providers` + 1 refuse.
- Caps `0` means refuse, not unlimited.
- No date literals in fixtures (repo testing model).

Discover rather than enumerate for L7/L8 (repo rule: a named list that claims "all readers" must fail on an unreviewed file).

---

## 8. Manual proof (operator)

Same as SELL_FIRST §7. Network proof for the locked-hatch case: point the paid well at `http://127.0.0.1:9` (discard port) or a recording proxy. If the proxy sees a POST while hatch is locked, M1 is red.

---

## 9. Relation to existing MW spend code

When *reading* for composition ideas, these are the files — do not edit them from this track:

| File | Fact it owns |
|------|----------------|
| `src/lib/llm/spendLimit.ts` | Fail-closed daily dollar brake |
| `src/lib/llm/spend.ts` | `LLM_DAILY_USD_CENTS` / org cents parse |
| `src/lib/llm/quota.ts` | Per-feature request caps |
| `docs/ENV.md` | `COACH_LLM_*`, high-reasoning silent bill |

The router copies the *idea* (fail closed, 0 means kill, no silent high reasoning) and does not copy the module. Two homes if composed.

---

## 10. Definition of done (M1 code PR, later)

- CLI `run` against local fake + real Ollama optional.
- All law tests green; at least one mutant per law killed and recorded in that PR's LOG-equivalent note (or the track's own `M1_PROOF.md`).
- SELL_FIRST §7 demo reproducible from a README in `tools/token-router/`.
- No `app/` / `src/lib/coach/` / Android touch.
- Hatch default locked in the committed example registry.
- Schema file in RESEARCH remains the source; code either generates from it or a test diffs the hand types.

This paper PR is done when the file contract exists and the schema parses. That is M0.
