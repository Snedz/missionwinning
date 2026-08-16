# Rotated from LOG.md when `.856` landed

## 2026-08-15 — Guards match shipped code (`.841`)

Three guards on `master` asserted the opposite of shipped behaviour: 3454 pass, **3 fail**. Nothing could see it — Actions is billing-blocked, `tsx --test` printed `# fail 3` while still **exiting 0**.

**Ship:** `/log` leaves `MUST_STAY_GATED`. Quick-add CTAs pinned by i18n key. Arrows stay in the packs.

Label `.841` (onto `.840`).
