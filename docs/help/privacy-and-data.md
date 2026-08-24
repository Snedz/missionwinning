# Privacy and your data

Mission Winning stores most workout and preference data **on your device** first. Cloud sync is optional via sign-in.

## Where data lives

| Data | Device (localStorage) | Cloud (Supabase) |
|------|----------------------|------------------|
| Workout history | Yes | When signed in + sync enabled |
| Coach plan | Yes | When signed in |
| Journey / I-Day | Yes | When signed in |
| Nutrition log | Yes | Primarily local |
| Account email | — | Yes (auth) |
| Mission ID | — | Yes when signed in (sequential `#N`) |
| Premium enrollment | — | Yes (server) |
| School class metadata | Partial | Yes (teacher-created classes) |
| PFT scores (class) | — | Yes when synced |
| Wearable sync (optional) | — | Only if you connect a provider (tokens + samples) |

## Wearables (optional)

Connecting Apple Health, Google Health Connect, Whoop, Strava, or similar is **optional** and off until the feature flag is enabled for your environment. When connected:

- We store OAuth tokens and normalized activity/recovery samples so we can sync.
- Mission Score still comes from your workout and pillar logs — not heart-rate or recovery scores from a device.
- Disconnect in Profile removes the connection; you can request deletion of synced samples via support.

Manual JSON/CSV imports on Track stay on-device (same as other Track logs) until you sign in and sync.

## Visibility and Under the Hood

Account → **Visibility** lists whether anything is limited and the exact reason: the logger stays free and offline, whether this deploy is invite-gated, region policy if hosted signup is blocked, whether Coach was skipped, that Mission Score stays on your device, and Super Bundle notify-only until Stripe. Download the same report as JSON or text.

Account → **Under the Hood** publishes scoring weights. **Boosts** are Mission Points this device awards (session finish, coach-adjacent live events, and the planned Club ledger: session, coach-plan, and the rest). **Penalties** (report, mute, block, hide) are visibility filters — they do not debit points.

How to post well in Mission Server: replies from people you trained with beat likes. Likes are weak.

## Backup and restore

Account → **Export backup** downloads a JSON file. Restore on a new device by importing that file. Backups are yours — store them securely.

Account → **Import workout CSV** reads a workout export into local history (Title Case session file or snake_case set file). A Hevy measurements export uses the same path and merges into body metrics on this device — existing numbers stay. You see a preview and confirm before anything is written. Failed rows are skipped and counted. You can import more than one file. **Export session CSV** downloads that history (empty history is a header-only file). You can export more than once. No account required.

## Sign-in providers

Google, Apple, Microsoft, Facebook, and magic-link email use standard OAuth — we receive your email and profile name for account linking, not your password.

## Youth consent (COPPA)

For users under the configured age threshold:

1. Parent provides email and receives a verification code.
2. Parent enters the code to consent.
3. Until consent, some sync features may be limited.

Parents: you can request deletion by contacting support with the parent email used.

## School classes

Teachers see **class aggregates and standings**, not students' full workout journals. Leaderboards use redacted athlete labels.

## Analytics

Product analytics (PostHog) stay **off** until you allow them in the first-visit banner or Profile → Privacy. Browsers that send Do Not Track never show the banner and never capture. We do not use session recording, Meta Pixel, or Google advertising tags. Full policy: `/privacy`.

## Your rights

- Export your backup anytime.
- Delete local data by clearing site data in browser settings.
- Request account deletion via support (cloud rows removed per policy).

**Full legal text:** [/privacy](/privacy), [/terms](/terms), and [/dmca](/dmca) in the app. Operator inventory: [LEGAL_SAFETY.md](../LEGAL_SAFETY.md).

## Security practices

- Premium content is server-gated — not hidden only in the client.
- Payment webhooks are verified; we never store full card numbers.
- The invite gate uses a password — do not share gate passwords in public channels.

Technical detail for operators: [PROTECTION.md](../PROTECTION.md) (developers).
