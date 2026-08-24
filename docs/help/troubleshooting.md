# Troubleshooting

## App won't load / blank screen

1. Hard refresh (Ctrl+Shift+R or clear cache).
2. Try incognito — extensions sometimes block storage.
3. Update your browser to the latest version.
4. If you see the invite gate, unlock at `/private` first.

## Password gate / can't get past /private

1. Confirm you have the current gate password from your invite (passwords rotate).
2. Use the **password form** on `/private` — avoid sharing `?access=` links (deprecated in production).
3. After unlock, sign in from Profile if prompted.

## Workouts not saving

1. Check browser storage isn't full or blocked (Safari private mode limits persistence).
2. Complete the workout with **Finish** — draft state lives in memory until saved.
3. Export a backup from Profile before clearing site data.

## Sync not working across devices

1. Sign in with the **same provider/email** on both devices. An open Train session follows that account — there is no Force Sync button.
2. Wait for network — sync runs after login and on key actions.
3. Pull to refresh or revisit Today after a minute.

## Coach plan empty or stuck

1. Complete **I-Day** onboarding (`/welcome`).
2. Log at least one workout so history exists.
3. Set days per week and equipment in Profile.
4. Premium: confirm enrollment in Profile (not just localStorage).

## Premium not unlocking after payment

1. Same email as Stripe checkout.
2. Sign out and sign back in.
3. Check receipt email — payment must be `completed`.
4. Contact support with email + date if still blocked after 15 minutes.

## Fuel search / barcode fails

1. Check internet — search requires connectivity.
2. Barcode: enter at least 8 digits, numbers only.
3. Rate limits apply — wait a minute if you searched heavily.

## School class / teacher dashboard

1. **401 on standings** — teacher PIN required in dashboard (not just class code).
2. **Can't create class** — sign in first; code may be taken by another teacher.
3. **Student score missing** — student must be signed in when completing PFT.

## Offline mode

1. Install PWA to home screen for best offline support.
2. Some features (search, Coach LLM, sync) need network by design.
3. `/offline` page shows when the service worker can't reach the network.

## Performance / slow

1. Large workout history — History still works; charts may take a moment on old phones.
2. Disable unused browser tabs.
3. See [LIGHTHOUSE_BASELINE.md](../LIGHTHOUSE_BASELINE.md) for expected performance targets (developers).

## Still stuck?

Use **Feedback** in the app or your beta channel. Include: device, browser, signed-in email (if comfortable), and what you tried.
