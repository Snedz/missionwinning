# Rotated from LOG.md for `.1067`

## 2026-08-27 — Revert Patreon costume, restore wireframe (`.1052`)

Founder rejected `.1051` in
person. The costume is not
good. Go back to the original
wireframe — that alone is
better. The sidebar makes no
sense. The design makes no
sense. Do not apply these
changes.

**Ship:** revert only.
`git revert` of squash
`49dfe6de` (PR #878, `.1051`)
restores public www
(`sites/www`) and signed-in
chrome (Today / AppLayout /
account / Sidebar) to the
`.1050` modernist wireframe.
Paper / ink / Archivo /
radius 0. No Patreon sidebar.
No `.ptn` costume tokens on
www or the signed-in app.
`/private` unchanged vs
`.1050`. Leftover PR #876
stays open on
`cursor/modernist-patreon-layout-ef8c`.
Do not re-squash #878. Guest.
First set ungated. Today still
one Start. `/private` stays
the tight lock. No
`PRIVATE_MODE` flip. No
production promote. Live www
stays `.696`. `[skip vercel]`.

Label `2026.07-unified.1052` (from
master `.1051` / `49dfe6de`). Stamp
stays `.1052`. Live www stays `.696`.

Rotated LOG oldest → [docs/archive/log/LOG-rotate-1035-for-1052.md](docs/archive/log/LOG-rotate-1035-for-1052.md).
`.1051` heading archived → [docs/archive/log/LOG-rotate-1051-for-1052.md](docs/archive/log/LOG-rotate-1051-for-1052.md).
