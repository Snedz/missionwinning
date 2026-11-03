# P67 / mission-ops progress — Oct 24 (as of ~4:50 PM ET)
Merged today (session tail): mission-ops #252 (327), #253 (329 behaviour test, fixes HOLLOW 324), #255 (327b1), #256 (327b2); program-67 #4945 (listing evals), #4946 (326 regex).
Cards DONE: 327, 327b, 327b1, 327b2, 329, 326, 291b.
In flight: burn-down bd1642 claimed 331a (stop-slop copy gate split).
Held for Snowden: program-67 #4944 (OS/APPLICATIONS; merge #4901 first).

## Evening update (keep1736, ~18:45 ET)
Merged after 5:36 PM ET:
- program-67 #4951 (291a1c: cleared ruff ratchet drift, AST-checked, 6a3c69ca) and #4952 (291a1b: ruff_ratchet gate in verify_all, fd8c92de). CI log shows ruff_ratchet GREEN.
- mission-ops #259 (333a anti-slop builder-rules module) and #260 (333b: wired into the free-build prompt, 8e265f10).
- Cards DONE: 331 parent, 291a1b, 291a1a (by another route: ruff 0.17.2 installed for the box CI runner), 333a, 333b.
Reviewer: MiniMax-M3.1-Flash. GLM-4.5-flash and Groq gpt-oss returned REJECTs that cited lines not in the diff, so they're not counted.
Free models: MiniMax, Z.ai and Groq are live. OpenRouter free tier hit its daily limit, and most NVIDIA models are dead. Free-build attempts on XS cards stalled for 25+ min, so the XS cards were hand-shipped with a review.
Held: program-67 #4944 (Snowden). #4915 conflicting. 3 known main CI fails (dependency-review, osv-scanner, factory-chain).

## Late evening (keep1839, 6:39–7:55 PM ET)
- program-67 #4953 MERGED (50334f4f): main verify_all reds fixed — brain_check no longer flags 19-digit X bookmark snowflake ids (#4913; a 16-digit PAN is still caught, tested); new scripts/test_bookmark_flag_to_card.py clears harness_ratchet (#4909); 10-24 bookmarks receipt got its Artifacts table (loop_judge UNSHAPED → PASS). verify_all on CI: GREEN.
- program-67 #4954: bookmark card ids capped at the 40-char seat job bound; overlong JOB-bm-nextlevelbuilder card renamed (fixed test_seat_handoff red in full discovery). Local verify_all GREEN 18/18. Status at stop: see below.
- Reviewer: Groq gpt-oss-120b (review3.py), APPROVE on both, summaries matched the diffs.
- No free-build: CLAIM held (android-factory listing-claim-check card).
- Still known CI fails: dependency-review + osv-scanner (1–2 s, billing), factory-chain full discovery (~49 pre-existing test failures).
- Untouched per instructions: #4944, #4941, mission-ops #254.

## Late evening — Sat Oct 24, 2026 (~7:36 PM ET)
- Qatar START: still PARKED (no apps submitted).
- MERGED program-67 #4954 (bookmark card ids capped at 40-char seat bound), squash 4d23dd8. gate GREEN; reds were only billing (dependency-review/osv-scanner) + pre-existing factory-chain discovery (ruff_ratchet, verify_local_gates, artifact-bytes drift) — none seat/bookmark related.
- #4956 (must-touch-test Kaizen docs): already MERGED (not by me).
- #4944 (OS/APPLICATIONS): held for Snowden.
- No second ship started: factory-chain CI takes ~16 min, wouldn't land before 7:55 PM stop.
- Next: pre-existing factory-chain reds (test_ruff_ratchet 2!=0, test_verify_local_gates producer) are the top shipping blocker to fix.

## 2026-10-24 ~7:40 PM ET — final keep-shipping pass
- Opened [#4957](https://github.com/Snedz/program-67/pull/4957): fix factory-chain `test_ruff_ratchet` `2 != 0` (order-dependent: ruff resolved at import but PATH narrowed by an earlier test → main returns 2). RepoTests now pin `rr.ruff_bin`; `ruff_bin` falls back to ruff beside `sys.executable`; new `RuffBinTests`. Test touched: `scripts/test_ruff_ratchet.py` (9/9 PASS local, ruff clean).
- factory-chain still has other pre-existing reds (booking_craft_engine, verify_local_gates producer, harnessrouter_vs_freerouter, agent_reach, gitleaks missing, client_kit, minihost, agent_spec_regression) — next targets.
- 7:45 PM ET: #4957 CI pending (factory-chain/gate ~15 min, finishes after 7:55 stop); dependency-review/osv-scanner fail in 1-2s (same pre-existing infra reds). NOT merged — next pass: merge if gate ok and ruff_ratchet drops out of factory-chain failures.
- 2026-10-24 7:58 PM ET: #4957 (fix/ruff-ratchet-path-pin) still OPEN — gate pass, factory-chain pending at cutoff; dependency-review/osv-scanner fail (known billing). Not merged.
