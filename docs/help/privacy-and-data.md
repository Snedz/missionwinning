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

## Backup and restore

Profile → **Export backup** downloads a JSON file. Restore on a new device by importing that file. Backups are yours — store them securely.

## Sign-in providers

Google, Apple, and magic-link email use standard OAuth — we receive your email and profile name for account linking, not your password.

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

**Full legal text:** [/privacy](/privacy) and [/terms](/terms) in the app.

## Security practices

- Premium content is server-gated — not hidden only in the client.
- Payment webhooks are verified; we never store full card numbers.
- Private beta uses a password gate — do not share gate passwords in public channels.

Technical detail for operators: [PROTECTION.md](../../PROTECTION.md) (developers).
