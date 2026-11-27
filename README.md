# Mission Winning — Training notebook

A local-first comparison build of Mission Winning. Open Today, log a set without an account, finish to see Victory, and build a training week with Coach. Workouts stay on this device unless you export them.

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
