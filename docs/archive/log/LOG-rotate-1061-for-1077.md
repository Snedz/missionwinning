Superseded live LOG section rotated 2026-09-15 for `.1077` ClearShot mini deeplink.

## 2026-09-13 — eslint-config-next + js-yaml harden (`.1061`)

Next paper already on `.1060` (#911, Next 16.3.3).
This hop aligns `eslint-config-next` to `^16.3.3` and pins
transitive `js-yaml` to `4.3.2` via `overrides`, with a
restored lockfile after a gutted tip (#912 closed).

Also types empty `STORIES` on www `/compare` so `astro check`
does not treat map callbacks as `never`.

Paper only. `[skip vercel]`. No `PRIVATE_MODE` flip.
No promote. Live www stays `.697` (`1c7b2c`).

Label `2026.07-unified.1061`.

Rotated LOG oldest → [docs/archive/log/LOG-rotate-1043-for-1061.md](LOG-rotate-1043-for-1061.md).
