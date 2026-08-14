# Rotated from LOG.md when `.793` landed

## 2026-08-14 — Privacy land typecheck after PAR-Q persist home (`.779`)

`.778` merged with a typecheck hole (`walkTs` annotated as `string[]` while
`readdirSync(..., { withFileTypes: true })` returns `Dirent[]`) and a
P2-2 test still asserting `AssessmentsPage` writes `lastAssessment`
itself. `.777` already moved persist to `persistParqScreen`.

**Ship:** drop the annotation; discover `parqIntake` + `ParqIntakeCard`.
No product change. Not a cert.

Label `.779` (onto master `.778`). Not a `PRIVATE_MODE` flip.

Excellence-Override: privacy land typecheck (no visual surface)

Rotated LOG oldest → [docs/archive/log/LOG-rotate-764-for-779.md](docs/archive/log/LOG-rotate-764-for-779.md).
