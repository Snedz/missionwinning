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
| Premium enrollment | — | Yes (server) |
| School class metadata | Partial | Yes (teacher-created classes) |
| PFT scores (class) | — | Yes when synced |
| Wearable sync (optional) | — | Only if you connect a provider (tokens + samples) |

## Wearables (optional)

Connecting Apple Health, Google Health Connect, Whoop, Strava, or similar is **optional** and off until the feature flag is enabled for your environment. When connected:

- We store OAuth tokens and normalized activity/recovery samples so we can sync.
- Mission / Win Score still comes from your workout and pillar logs — not heart-rate or recovery scores from a device.
- Disconnect in Profile removes the connection; you can request deletion of synced samples via support.

Manual JSON/CSV imports on Track stay on-device (same as other Track logs) until you sign in and sync.

## Backup and restore

Profile → **Export backup** downloads a JSON file. Restore on a new device by importing that file. Backups are yours — store them securely.

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

Anonymous usage analytics (e.g. PostHog) may run to improve the product — see `/privacy` for the full policy.

## Your rights

- Export your backup anytime.
- Delete local data by clearing site data in browser settings.
- Request account deletion via support (cloud rows removed per policy).

**Full legal text:** [/privacy](/privacy), [/terms](/terms), and [/dmca](/dmca) in the app. Operator inventory: [LEGAL_SAFETY.md](../LEGAL_SAFETY.md).

## Security practices

- Premium content is server-gated — not hidden only in the client.
- Payment webhooks are verified; we never store full card numbers.
- Private beta uses a password gate — do not share gate passwords in public channels.

Technical detail for operators: [PROTECTION.md](../PROTECTION.md) (developers).
