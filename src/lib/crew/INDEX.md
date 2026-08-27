# src/lib/crew/

> Signed-in crew board + founder gate. Product/ops only. Not Today. Not `/server`.

| File | Purpose |
|------|---------|
| `seats.ts` | Six seats and seed holds. Owns/stops are Mission Winning work. |
| `machine.ts` | Charter flow, vote lock, gate hold/sign, case notes. |
| `persist.ts` | `safeStorage` via `STORAGE_KEYS.crewBoard`. |
| `machine.test.ts` | 0/6 → 6/6, vote lock, no-undo gate. |
| `isolation.test.ts` | More only. No rail. No clinic/lab chrome. `logSet` untouched. |

Vote on a seat stays locked until that charter is signed. Irreversible kinds are send, delete, publish, promote — signing them does not perform the action.
