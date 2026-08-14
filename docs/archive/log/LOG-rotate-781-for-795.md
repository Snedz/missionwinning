# Rotated from LOG.md when `.795` landed

## 2026-08-14 — Form object kit + implement stills

Pose-first Form Index prompts invented toy DBs, missing pairs, and
machines that cannot exist (sealed box, slack cable, high pulley as a
seated row). Form Director is now object-first.

**Ship:** `IMPLEMENT` block + implement catalog; QA ticks 8–12; prop
sheets (DB pair/single, cable-row station, medball, landmine); still
sheets for implement-using wired ids. Regenerated `cable-row` (visible
pin-stack, horizontal line of pull), `lateral-raise`, `dumbbell-press`,
`lunges`, `dumbbell-row`. Floor stays 43. Still-only. No I2V. No
`PRIVATE_MODE` flip. Media-only — label stays `.781`.

Excellence-Override: form stills replace existing Form Index posters (object QA)

Rotated LOG oldest → [docs/archive/log/LOG-rotate-767-for-form-object-kit.md](docs/archive/log/LOG-rotate-767-for-form-object-kit.md).

## 2026-08-14 — Launch env splits Horizon 0 from paid Horizon 1 (`.781`)

`LAUNCH_STRICT` could not go green on the planned free-first public flip:
`--launch` demanded Stripe webhook + Checkout, and only warned on missing
`MAIL_POSTAL_ADDRESS` (the invite hard-exit). Saturated red until EIN.

**Ship:** `evaluateCheckEnv` — `--launch` is Horizon 0 while FREE_BETA is on
(Stripe not required; postal fails). `--paid` / `LAUNCH_PAID=true` / FREE_BETA
off is Horizon 1 (today’s Stripe hard-fails). `launch-verify` default stays H0.
No production env set. No `PRIVATE_MODE` flip.

Mutants killed: H0 still requiring `STRIPE_WEBHOOK_SECRET` while FREE_BETA on;
H0 still only warning on missing postal.

Label `.781` (onto this branch `.780`; master `.779`). Excellence-Override below.

Excellence-Override: H0-2 launch env profiles (founder skip-W 2026-08-14)

Rotated LOG oldest → [docs/archive/log/LOG-rotate-766-for-781.md](docs/archive/log/LOG-rotate-766-for-781.md).
