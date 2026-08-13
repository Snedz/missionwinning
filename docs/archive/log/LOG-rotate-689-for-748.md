## 2026-08-12 — Today loading skeleton md width parity (`.689`)

Desktop `/log` Today path already lifts phone measure at md+ (`HomeTodayLean` /
`HomeTodayDashboard`: `max-w-lg md:max-w-none`). `TodayDashboardLoading` still used
`max-w-lg mx-auto` without `md:max-w-none`, so desktop could flash a phone-narrow
skeleton before hydrate. Skeleton wrapper now matches the today-shell pattern; no
AppLayout ladder or Today composition change. Label `.689` — Wedge reserved
`.686`–`.688` for #453 / #462 / #470; master tip `.685` landed (#455).

Excellence-Override: Today loading skeleton md width parity; no shell redesign

Rotated LOG oldest → [docs/archive/log/LOG-rotate-660-for-689.md](docs/archive/log/LOG-rotate-660-for-689.md). · [`.685` for `.747`](docs/archive/log/LOG-rotate-685-for-747.md).
