# Rotated from LOG.md for `.1066`

## 2026-08-27 — Revert modernist Patreon door (`.1050`)

Founder chose revert. Squash
`dbf3bd340` (PR #875, `.1049`)
put unsigned Patreon structure
on the live door and www. That
is not the tight lock.

**Ship:** revert only. Restore
`/private`, `sites/www`,
marketing chrome
(`MarketingNav`,
`PublicPageShell`,
`MarketingFooter`, `gate.css`,
`GatePendingChrome`,
`AppHeader`) and docs
(`DESIGN.md` layout freeze,
CONTEXT / LOG / INDEX) to the
`.1048` tight lock.
`docs/DESIGN.md` did not exist
on `.1048` — it is gone. No
new door/www design remains.
Does not redesign Today,
AppLayout, Sidebar, or
signed-in home. Leftover PR
#876 stays open on
`cursor/modernist-patreon-layout-ef8c`.
Do not re-squash #875. Guest.
First set ungated. Today still
one Start. `/private` stays
the tight lock. No
`PRIVATE_MODE` flip. No
production promote. Live www
stays `.696`. `[skip vercel]`.

Label `2026.07-unified.1050` (from
master `.1049` / `dbf3bd340`). Stamp
stays `.1050`. Live www stays `.696`.

Rotated LOG oldest → [docs/archive/log/LOG-rotate-1034-for-1050.md](docs/archive/log/LOG-rotate-1034-for-1050.md).
`.1049` heading archived → [docs/archive/log/LOG-rotate-1049-for-1050.md](docs/archive/log/LOG-rotate-1049-for-1050.md).
