## 2026-08-10 — Today rewards badge count interpolation (`.650`)

CX walk Today after first Victory: Mission progress showed `0/8 weekly challenges met{{n}} badges earned` — locale `rewardBadgeCount` uses `{{n}}` but TodayRewardsCard passed `count`. Pass `n` (and `count`) so pack + floor both resolve.

Rotated LOG oldest → [docs/archive/log/LOG-rotate-650.md](docs/archive/log/LOG-rotate-650.md).

