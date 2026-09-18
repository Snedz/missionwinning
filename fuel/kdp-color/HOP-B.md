# HOP-B — GTM leftovers (Builder-B continue)

**Status:** IMPLEMENTED 2026-09-18 (frozen list unchanged).  
**Seat:** Builder-B. No Judge self-cert.  
**Clock:** continue until ~19:31 ET, then stop.

Open Plate interiors already exist. Mission Galaxy stays a **stub** (no plates). This hop is GTM / export docs only.

## Goal

Add founder-review GTM pages and notes that still cannot send mail and still cannot check out.

## Files to add

### `fuel/kdp-color/`

| Path | Role |
|------|------|
| `HOP-B.md` | This freeze |
| `gtm/COVER_BRIEF.md` | Cover/spine brief — no cover file, no ISBN barcode |
| `gtm/KEYWORDS.md` | Backend-keyword notes — no invented volumes |
| `pages/outreach.html` | Three drafts on one page, **DO NOT SEND**, no form |

Update: `INDEX.md`, `pages/index.html` (links only), `scripts/verify.mjs` (new files + still `paymentUrl === ""`).

### `fuel/mission-galaxy/`

| Path | Role |
|------|------|
| `INDEX.md` | Folder map |
| `export/NOTES.md` | Honest: no plates, do not upload |
| `gtm/COVER_BRIEF.md` | Do not commission until plates exist |
| `gtm/OUTREACH_DRAFTS.md` | One channel, **DO NOT SEND**, say interiors are missing |
| `pages/listing.html` | Placeholder listing page |
| `pages/icp.html` | ICP page |
| `pages/outreach.html` | Drafts on a page, no send control |

Update: `pages/index.html` (links), `scripts/verify.mjs`, `PLAN.md` leftover row.

## Refuse

- `paymentUrl` stays `""` on both `config.js` files.
- Do not draw Mission Galaxy plates this hop (that would rewrite the stub into a fake finished book).
- Do not copy Open Plate SVGs into galaxy.
- Do not edit `docs/help/**` (PR 981).
- Do not add a second outreach channel.
- Do not invent ASIN, ISBN, rank, or sales.
- ClearShot PARKED.
- No `CONTEXT.md` / `LOG.md` / `APP_BUILD_LABEL`.

## Done when

- New files exist.
- Both verify scripts exit 0.
- Outreach HTML has no `<button>`, no `mailto:`, no submit.
- Stop at the hard clock.
