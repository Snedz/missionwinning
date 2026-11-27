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

Licensed under [AGPL-3.0-only](LICENSE). See the bundled notices for the exercise data and Archivo font.
