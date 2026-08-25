# Rotated from LOG.md for `.967`

## 2026-08-24 — One identity: guest sets survive sign-in (`.949`)

Guest log already survived `SIGNED_OUT` (`.941`).
Sign-in into an account that already had a cloud
journey called `replace-from-cloud` and wiped the
workout store. `syncCurrentHistoryToCloud` had no
callers, so guest outbox ACKs never re-queued.

**Ship:** unbound guest always adopts (keeps the
local log, still strips restricted health). Foreign
owner still replaces. `SIGNED_IN` re-queues history
without a Force Sync tap. First set still ungated.

Label `.949` (past master `.947`; `.948` is plate math). No `PRIVATE_MODE` flip.

Rotated LOG oldest → [LOG-rotate-928-for-949.md](./LOG-rotate-928-for-949.md).
