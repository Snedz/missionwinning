# Security Policy — Mission Winning

We take security and privacy seriously. Local-first design, private beta gates, and open source are part of that posture — but we still need responsible disclosure.

---

## Supported versions

| Channel | Supported |
|---------|-----------|
| `master` / production (missionwinning.com) | Yes |
| Latest public release tags | Yes |
| Unmaintained forks | No (report to the fork maintainer) |

---

## Reporting a vulnerability

**Do not** open a public GitHub issue for exploitable security bugs.

Email: **support@missionwinning.com** with subject `SECURITY`

Please include:

1. Description of the issue and impact
2. Steps to reproduce (PoC preferred; no mass scanning of production)
3. Affected URL, route, or component if known
4. Whether you plan to disclose publicly and preferred timeline

We aim to acknowledge within **72 hours** and to provide a status update within **7 days**. Complex issues may take longer; we will keep you informed.

For confirmed issues affecting users, we will coordinate a fix and disclosure window. Credit is available if you want it (hall of fame / release notes).

---

## Out of scope (unless chained to a real impact)

- Reports from automated scanners without a demonstrated vulnerability
- Missing security headers that do not lead to a practical exploit
- Self-XSS or attacks requiring full physical device control
- Denial of service via volume alone without a novel application bug
- Social engineering of Mission Winning staff

---

## Hardening already in place (high level)

See [PROTECTION.md](PROTECTION.md), [docs/OWASP_AUDIT.md](docs/OWASP_AUDIT.md), and [docs/SECURITY_AUDIT_TRIAGE.md](docs/SECURITY_AUDIT_TRIAGE.md):

- Private access gate (HMAC cookies, rate limits) while `PRIVATE_MODE` is on
- Stripe / PayPal webhook signature verification
- Server-side premium status (no production localStorage unlock)
- API rate limits and body size caps on sensitive routes
- Security headers via `vercel.json`
- School/class APIs with teacher PIN / creator checks

---

## Privacy-related issues

Product analytics are **off until the user allows them** (and respect Do Not Track). Workouts default to device storage. If you find a path that exfiltrates health data without consent, treat it as a **security** report (same email).

---

## Safe harbor

We will not pursue legal action against researchers who:

- Make a good-faith effort to avoid privacy violations and service disruption
- Do not exploit beyond what is needed to demonstrate the issue
- Do not access or retain other users’ data
- Report promptly and keep details private until we ship a fix

---

*Mission Winning LLC · July 2026*
