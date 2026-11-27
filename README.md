# Mission Winning — Training notebook

A local-first comparison build of Mission Winning. The public landing at `/` opens the set form without an account; `/log` opens your Today view. Finish a workout to see Victory, then build a training week with Coach. Guest workouts stay in this browser unless you export a backup or opt into account sync.

```sh
npm ci
npx playwright install chromium
npm run verify
npm run start
```

Use Node 22 or newer. The production build enables offline mode; wait for **Offline ready** before disconnecting. `npm run dev` starts the development server without a service worker. No environment variables or account are required.

- [Architecture](ARCHITECTURE.md): packages, storage, and offline behavior.
- [Migration](MIGRATION.md): v1 backups, Supabase rows, Android, and rollout boundaries.

## Local landing rehearsal

Run just the landing suite against a fresh local production-mode server. Leave the Supabase settings unset for the guest-only rehearsal. Stop any previous test server on port 4300 first; `CI=1` prevents reuse.

```sh
npm run build
CI=1 V2_LANDING_SCREENSHOTS_DIR="$HOME/repos/mission-winning-review/new-landing" npm run e2e -- tests/landing.spec.ts
```

Omit `V2_LANDING_SCREENSHOTS_DIR` to run without writing images. Keep `npm run verify` as the full gate.

Evidence checklist:

- Cold browser: the hero CTA opens the set form directly; one entered set survives reload without duplication and can be finished.
- Returning guest: the footer CTA reopens the saved live workout. After warming the notebook online, the landing, logger, and a newly entered set survive an offline reload.
- Sample: Wednesday and Friday move to Thursday and Saturday; Sunday stays. The preview does not change the browser's stored notebook data.
- Accessibility: keyboard access, axe, and no horizontal overflow at 320, 390, and 1440 pixels. Inspect first-fold and full-page captures at 390×844 and 1440×900 separately.
- Observed human task (separate from automation, not yet run): on a cold browser, ask a first-time visitor to “Log the next set you did.” Then ask what changed in the sample week and where their workout lives. Record completion, elapsed time, and confusion, not workout contents. A scripted pass is not a usability result.

Licensed under [AGPL-3.0-only](LICENSE). See the bundled notices for the exercise data and Archivo font.
