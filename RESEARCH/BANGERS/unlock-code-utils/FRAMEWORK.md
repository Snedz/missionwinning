# unlock-code-utils — framework

**Claim:** People will pay a few dollars to **pull codes off a screenshot** (Wi-Fi, gift, backup) and format them. Impulse yes; App Store / security **kill risk**.

**Status:** paper. **Pays:** 0. **Checkout:** none.

**Not a jailbreak tool.** Not “unlock any phone.” Codes the buyer **already owns**.

## Problem

Codes arrive as screenshots: router cards, App Store gift tiles, 2FA backup PDFs, game unlocks. Re-typing is slow and error-prone.

## Buyer

| Field | Value |
|-------|--------|
| Who | Anyone drowning in Camera Roll codes |
| Who is not | People looking to bypass a lock screen or steal an account |
| Job | Share-sheet → detect code-shaped strings → copy / QR / Notes dump |
| Volume | **UNKNOWN.** |

## Wedge

Share-sheet → detect code-shaped strings → copy / QR / Notes dump. Not a password manager. Not iCloud Keychain.

**Redact sibling:** [clearshot-ios](../clearshot-ios/) hides names / emails / card digits. This slug **copies** Wi-Fi / gift / backup codes. Keep two offers; prefer a **mode inside ClearShot** over a second brand if that 14-day test is already live. See complementary rule in [OVERNIGHT_GLM53.md](../OVERNIGHT_GLM53.md).

## MW relationship

None. Do not mount `utility.clearshot`. Do not open `billing.read`. If this ever becomes a ClearShot *mode*, that is a founder commission after **both** bars (or a written merge), not a reason to build now.

## 14-day test

See [SELL_FIRST.md](SELL_FIRST.md). Bar: **5 cold pays / 14 days**. Rank 4. Counsel / 5.1.1 skim **before** a public ask. Do not run the same 14 days as ClearShot if the ask would confuse “redact vs copy.”

## Incumbents

| Product | Official | Kind | Money | Wedge vs us |
|---------|----------|------|-------|-------------|
| **iOS Live Text** | https://support.apple.com/en-us/120004 | Built-in copy-from-photo | Free | Copies text. No code-shaped detect / format / batch. |
| **iOS Camera QR** | https://support.apple.com/guide/iphone/scan-a-qr-code-iphe8bda8762/ios | Built-in QR | Free | Live camera QR (incl. Wi-Fi). Not “this screenshot of a router card.” |
| **ClearShot (sibling)** | [../clearshot-ios/](../clearshot-ios/) | Redact / blur | Paper; category already paid (see their table) | They **hide** secrets. We **extract** codes you own. |
| **iCloud Keychain / password managers** | Apple Passwords; 1Password et al. | Vaults | Various | They store logins. Not “read this screenshot.” |
| **Named paid “code from screenshot” leader** | — | — | — | **UNKNOWN** this pass. Do not invent one. |

App Store privacy: https://developer.apple.com/app-store/review/guidelines/#privacy (Guideline **5.1.1**). Re-read before any public ask.

## Risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| App Store 5.1.1 / phishing-shaped UX | High — may reject | On-device only; purpose string names “codes you already photographed.” Counsel skim first. |
| Looks like unlock / jailbreak / stolen-account tool | **Kill** | Forbidden copy list in SELL_FIRST. If a sentence implies bypass, delete it. |
| Storing secrets | High | Clipboard by default. No cloud. No account. Or don’t ship. |
| Overlap with clearshot-ios | Process | Mode, not a second app, if 02 is live. |
| Live Text is free | Medium | Offer is detect + format (Wi-Fi QR, grouped backup codes), not “OCR exists.” |

## Price hypothesis (not a fact)

$4.99 one-time. **HYPOTHESIS.** Do not print a Stripe or App Store SKU URL.
