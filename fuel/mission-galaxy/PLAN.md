# PLAN — mission-galaxy stub (Builder-B follow-up)

**Status:** FROZEN then implemented in the same sitting.  
**Seat:** Builder-B. Do not self-LGTM.  
**Collision:** do not edit `docs/help/**` (PR 981 Fuel FAQ). do not edit `fuel/kdp-color/config.js`.

## Goal

`mission-galaxy` is not on disk. Add an **honest stub** only: name the SKU, keep `paymentUrl` `""`, do not invent interiors, checkout, or traction.

## Files (closed)

| Path | Role |
|------|------|
| `PLAN.md` | This freeze |
| `README.md` | What this is not |
| `config.js` | `paymentUrl: ""` |
| `listing.md` | Unpublished placeholder — no ASIN |
| `gtm/ICP.md` | One buyer sentence; no audience count |
| `pages/index.html` | Hub with no buy control |
| `scripts/verify.mjs` | `paymentUrl === ""` + no buy control |

## Refuse

- No paymentUrl, no plates copied from Open Plate, no help-FAQ edits, no ClearShot, no fake sales.

## Done when

Files exist, `paymentUrl === ""`, hub has no buy control.
