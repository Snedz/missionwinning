## Offline program shell (`.1116`)

Rebased onto master after a 2-day stall. The only failing gate was this repo's own
coverage ratchet and hard rule 5, both of which the PR had satisfied before the
rebase and neither of which the rebase had broken in the product.

The conflict here was a label race, not a code conflict: every open PR wanted a build
label master had already passed. This takes the next free one so two branches cannot
announce the same number — the exact failure `check-build-label.mjs` was written to
prevent.

Label `2026.07-unified.1116`.

Rotated LOG oldest → [docs/archive/log/LOG-rotate-1100-for-1116.md](docs/archive/log/LOG-rotate-1100-for-1116.md) (`.1100`).
