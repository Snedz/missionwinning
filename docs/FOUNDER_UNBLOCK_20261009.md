# FOUNDER_UNBLOCK — Mission Winning (relocated)

<!-- RELOCATED_TO_MISSION_OPS -->

**Class: INTERNAL** — full text was kept out of the public product tree so open source does not publish the founder's operational runbook. No secret **values** are involved: this is an ordered checklist of environment variables that are still unset and where each one is set.

**Why it mattered enough to write down.** The repo carried ~96 live `track()` call sites behind one commented-out environment variable, and four cron routes answered `503` for want of another. Setting them activates more shipped capability than the last 78 changes built — and the measurement system that would say whether any of it works has never been switched on, so it has never been able to disagree with anyone.

| | |
|--|--|
| **Private home** | [github.com/Snedz/mission-ops](https://github.com/Snedz/mission-ops) → `ops/FOUNDER_UNBLOCK_20261009.md` |
| **Local staging** | `ops/strategy/FOUNDER_UNBLOCK_20261009.md` (gitignored in this repo) |
| **Public facts kept here** | [CONTEXT.md](../CONTEXT.md) `## Now` status table names which variables are unset and what each one unblocks, without the runbook |
| **Policy** | [CLASSIFICATION.md](CLASSIFICATION.md) · [DUAL_REPO.md](DUAL_REPO.md) · [OPEN_SOURCE.md](OPEN_SOURCE.md) |

Agents: the ordered founder checklist is founder-owned work and stays in private ops. Do not recreate it here. What agents may do is keep the public status table honest about what is still unset — `CONTEXT.md` is the public half of this file.

One coupling worth keeping public, because it is a design consequence rather than a secret: under the retention design introduced in `.1130`, push consent **is** what allows an accountless athlete's weeks to be recorded at all. Without VAPID keys no device can opt in, so the north-star metric stays empty even after the migration is applied. Those two items are not independently optional.