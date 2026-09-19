# CURSOR_TODO — Token router (gas pipeline)

Track 03 · agent tickets · paper 2026-09-19

One concern per ticket. Do not start M1+ without a founder commission and a written §4 yes from [SELL_FIRST.md](SELL_FIRST.md). M0 is this folder.

Status: `open` | `blocked` | `done`

---

## M0 — Paper (this PR)

| ID | Ticket | Status | Notes |
|----|--------|--------|-------|
| T03-M0-01 | Create `RESEARCH/BANGERS/token-router-pipeline/` file contract | done (this PR) | FRAMEWORK, SELL_FIRST, BUILD_LATER, HOW_IT_GETS_DONE, CURSOR_TODO, SOURCES, INDUSTRY_LANDSCAPE, registry.schema.yaml, INDEX |
| T03-M0-02 | Route the tree from `RESEARCH/INDEX.md`, `RESEARCH/BANGERS/INDEX.md`, root `INDEX.md` | done (this PR) | Do not restamp CONTEXT `## Now` or mint a build label |
| T03-M0-03 | Parse-check `registry.schema.yaml` (YAML loads; required keys present) | done (this PR) | PyYAML load; `$defs` Hatch/Caps/Claim/Receipt present |
| T03-M0-04 | Draft PR titled `research(bangers): token-router-pipeline framework` | done (this PR) | Draft. Do not merge |

Agents on M0 do not edit `app/`, `src/`, `packages/`, `apps/`, `supabase/`.

---

## M1 — Disk router (blocked on founder)

Unlock: SELL_FIRST §4 four yeses in writing + "commission M1" line.

| ID | Ticket | Status | Depends |
|----|--------|--------|---------|
| T03-M1-01 | Add `tools/token-router/` (or sibling repo — ask) with README pointing here | blocked | commission |
| T03-M1-02 | Write law tests L1–L9 first (HOW_IT_GETS_DONE §7). Confirm each mutant dies. | blocked | T03-M1-01 |
| T03-M1-03 | Implement hatch reader (disk ∧ env; disagreement → locked). No env-only open. | blocked | T03-M1-02 |
| T03-M1-04 | Implement health probes (models GET only; no 1-token paid ping). | blocked | T03-M1-02 |
| T03-M1-05 | Implement score (five keys; paid ineligible if locked). | blocked | T03-M1-03, T03-M1-04 |
| T03-M1-06 | Implement claim (atomic file + reservation counters + idempotent request_hash). | blocked | T03-M1-05 |
| T03-M1-07 | Implement dispatch (openai_compat + ollama; attempt JSONL; no HTTP without open claim). | blocked | T03-M1-06 |
| T03-M1-08 | Implement receipt + conservative usage + append-only index. | blocked | T03-M1-07 |
| T03-M1-09 | Implement reconcile (starting+TTL → breached; no dispatch+TTL → refunded). | blocked | T03-M1-08 |
| T03-M1-10 | CLI: `run`, `hatch open/close`, `status`, `reconcile`. | blocked | T03-M1-09 |
| T03-M1-11 | Example registry: local only; paid row commented; hatch locked. | blocked | T03-M1-03 |
| T03-M1-12 | Record SELL_FIRST §7 demo as `tools/token-router/M1_PROOF.md` (commands + expected files). | blocked | T03-M1-10 |
| T03-M1-13 | Discover-based guards: no municipal ids; no `ALLOW_PAID` env read without disk. | blocked | T03-M1-03 |

M1 is one concern *per PR*, not one mega-PR. Suggested cuts: tests+hatch → health+score → claim → dispatch+receipt+reconcile → CLI+proof.

---

## M2 — Later (do not file until M1 proof)

See [BUILD_LATER.md](BUILD_LATER.md) §3. Do not pre-create tickets that name semantic cache, HTTP façade, OpenRouter well, or Coach composition. When M1_PROOF is real, open *one* later ticket with its unlock quoted.

---

## Standing refusals (close as `refuse`, do not implement)

| ID | Ask | Why |
|----|-----|-----|
| T03-R-01 | Add Freebuff as a provider | Law L7; their ToS forbids wrappers |
| T03-R-02 | Default OpenRouter key for demos | Silent paid / leaked key |
| T03-R-03 | `FORCE_PAID` / emergency override | Unmetered tap |
| T03-R-04 | Edit `src/lib/coach/` or `spendLimit.ts` from this track | Law L10 |
| T03-R-05 | Merge this paper PR as a product ship | Founder merge; agents do not merge |

---

## Agent notes

- Horizon: this is RESEARCH, not a wedge ticket. Empty harness queue is not permission to start M1.
- Classification: no fitness-competitor names; no live keys in examples (`sk-…` fixtures must be obviously fake).
- Title format if M1 ever ships in this repo: keep `research(bangers):` until code lives under `tools/`; then `feat(token-router):` in a *different* PR.
- Do not bump `APP_BUILD_LABEL` or rewrite CONTEXT `## Now` for paper.
