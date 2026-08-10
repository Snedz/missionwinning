## 2026-08-10 — Today muscle readiness + journal label floors (`.646`)

Muscle readiness cards still used `defaultValue: r.statusKey` (raw `todayReadinessPrime` on hydrate) after header focus used `readinessStatusDefault` (`.637`). Exported the helper; Progress section uses it. Journal strip no longer defaults pillar labels to raw `entry.pillar` (`train` → `Train`).

Rotated LOG oldest → [docs/archive/log/LOG-rotate-646.md](docs/archive/log/LOG-rotate-646.md).

