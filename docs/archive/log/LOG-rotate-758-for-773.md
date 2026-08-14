# Rotated from LOG.md when `.773` landed

## 2026-08-13 — Bodyweight + load on the Train set row (`.758`)

On pull-ups, push-ups, and dips the load field is **extra weight** (belt/vest),
not a bar. The row reads `8 × BW` or `8 × BW + 20 kg`. Leave load at **0** to
log bodyweight only. Coach volume counts `reps × added load` on working sets;
a warmup belt still does not count.

**Ship:** `bodyweightLoad.ts` detect + format; compact `BW+` stepper; desktop
table prefix. No new set field. Free logger. Offline, no account.

Label `.758` (onto master `.757`). Originally reserved `.735`; landed as `.758` past master `.757`.
Excellence-Override below.

Excellence-Override: bodyweight+load on the set row

Rotated LOG oldest → [LOG-rotate-743-for-758.md](./LOG-rotate-743-for-758.md).
