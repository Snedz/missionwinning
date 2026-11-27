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

The suite also checks the landing's canonical/share tags and local image and payload budgets. The canonical points to the intended public homepage, `https://www.missionwinning.com/`; local builds don't change that site's routing. Budgets are 45 KiB HTML, 600 KiB JavaScript, and 38 KiB CSS, measured as initial decoded bytes in a clean browser, plus 80 KiB for the selected preview gallery and 75 KiB for the 1200×630 share image. The optional week demo has its own 220 KiB JavaScript budget and is loaded only when opened. These aren't field performance measurements.

### First saved set: local only

The landing quick start records a single browser-local `1` under `v2-landing-first-saved-set` only after a new guest with no workout history saves a set to durable storage in that Train visit. Missing means no qualifying save recorded. Clicking the CTA, viewing the sample, resuming a workout, signed-in logging, or saving only in memory does not count. Leaving or reloading Train before saving ends attribution. Additional sets cannot increment the count.

The marker stores no IDs, timestamps, reps, or load. It is not sent to a server or included in backups; there is no tracker, audience count, or cross-browser conversion rate. It can be inspected in the browser's site storage during a local rehearsal. Clearing site data or using **You → Delete app data from this device** as a guest removes it. No backend or environment settings are required.

Licensed under [AGPL-3.0-only](LICENSE). See the bundled notices for the exercise data and Archivo font.
