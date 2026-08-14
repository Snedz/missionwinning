# Rotated from LOG.md when `.801` landed

## 2026-08-14 — Preview homepage is the gate teaser (`.786`)

Preview short-circuits the private gate so Train is walkable. `/`
then rendered the cinematic post-flip landing (demo squat, Start
free). Production www still shows the teaser. Founder asked for
the old door back.

**Ship:** ungated `/` mounts `GateTeaser` (`mw-gate`). Ungated
`/private` no longer bounces to Today. Gated + cookie still gets
`LandingPage`. Logger `/active` stays public. No `PRIVATE_MODE` flip.

Mutants: ungated `/` still returns `LandingPage`; `/private` redirects
whenever `hasServerPrivateAccess` is true.

Label `.786` (onto master `.785`).

Excellence-Override: Preview homepage is the gate teaser
