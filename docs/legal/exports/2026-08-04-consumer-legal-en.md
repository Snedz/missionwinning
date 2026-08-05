# Consumer legal pack (English) — export 2026-08-04

**Not legal advice.** Frozen snapshot of live EN strings for counsel review.
**Source:** `src/i18n/infoLocales.ts` (`const en`) · pages Terms/Privacy/Refunds/Dmca.
**Build label at export:** see `src/lib/buildInfo.ts` on same commit.

---

# Terms of Use

*Last updated: July 2026*

## Agreement

By using Mission Winning, you agree to these terms. If you do not agree, do not use the app.

## Service

Mission Winning provides workout tracking, nutrition logging, education content, and optional premium programs. The free core is offered at our discretion; premium features may require purchase.

## Educational only — not medical advice

Content is for general educational purposes. We are not a medical provider or accredited certifying agency. Certificates indicate educational achievement only, not professional licensure. You assume risk for physical activity; consult a physician before starting new programs.

## Accounts & acceptable use

- Provide accurate information; keep your email access secure.
- Do not abuse the service, attempt unauthorized access, or scrape premium content.
- Do not use the app for unlawful purposes.

## Premium & refunds

Premium purchases (Super Bundle and related paid features) are subject to checkout terms and our Refunds & cancellation policy. Cancel subscriptions anytime via Profile → Manage billing. Contact support@missionwinning.com for billing issues.

## Acceptable use

No unlawful use, no unauthorized access, no scraping or redistributing premium content, and no abuse of APIs or youth/school features. We may suspend accounts that violate these rules. For billing or safety issues, email support@missionwinning.com.

## User content

You may upload or submit content such as meal photos, activity import files, backups, text, or other materials (“User Content”). You retain ownership of your User Content. You grant Mission Winning LLC a worldwide, non-exclusive, royalty-free license to host, process, and display User Content solely to operate and improve the service. You represent that you have all rights needed to submit User Content and that it does not infringe others’ rights or violate law. Do not upload illegal, harmful, or infringing material.

## Copyright (DMCA)

If you believe content on Mission Winning infringes your copyright, follow the notice process on our DMCA page. We respond to valid notices under the Digital Millennium Copyright Act. Repeat infringers may have accounts terminated.

## Limitation of liability

To the fullest extent permitted by law, Mission Winning LLC is not liable for injuries, health outcomes, or indirect damages arising from use of the app. The service is provided "as is."

## Dispute resolution

Except for (a) small-claims court actions and (b) claims for injunctive or other equitable relief to protect intellectual property, any dispute arising out of or relating to these terms or the service will be resolved by binding individual arbitration administered by the American Arbitration Association (AAA) under its Consumer Arbitration Rules. You and Mission Winning LLC waive any right to a jury trial and to participate in a class, collective, or representative action. This agreement is governed by the laws of the United States and the state of formation of Mission Winning LLC, without regard to conflict-of-law rules. If the class waiver is found unenforceable as to a particular claim, that claim must proceed in court and not arbitration.

## Changes

We may update these terms. Continued use after changes constitutes acceptance. Material changes will be noted in the app or via email where appropriate.

Mission Winning LLC · support@missionwinning.com · See also

---

# Privacy Policy

*Last updated: July 2026*

## Overview

Mission Winning ("we", "us") operates the Mission Winning app at missionwinning.com. Privacy is the default: workouts and logs stay on your device until you sign in to sync. Optional product analytics are off until you allow them. This policy explains what we collect, why, and your choices.

## Local-first by design

Training logs, nutrition, and journey progress are stored on your device first. Cloud sync is optional and requires sign-in. We do not sell personal health data. The app harness is open source so you can inspect how privacy works.

## What we collect

- Account: email address when you sign in (Apple, Google, Microsoft, Facebook, or magic link).
- Health & fitness data you enter: workouts, nutrition logs, assessments, journey progress, preferences (units, language, goals).
- Optional product analytics: typed product events (e.g. journey milestones, checkout) only if you allow analytics. No session recording, no autocapture of form fields.
- Local storage: the free core works offline; data stays on your device until you sign in to sync.
- Optional AI coach context: only when operators enable the coach LLM — a minimal summary (scores, streak, focus, session names), not full set-by-set workout history.
- Optional meal photos: when you use photo meal logging, the image is sent to our estimate API to suggest macros; we do not use meal photos for advertising and do not keep them as a long-term photo library.

## How we use data

- Provide and personalize your training journey (Today hub, recommendations).
- Sync across devices when signed in (Supabase cloud database).
- Process premium enrollments and support requests.
- Improve the product with aggregate funnel metrics — only when product analytics are allowed on your device.

## AI features (disclosure)

Mission Winning discloses that some features may use artificial intelligence. The free core coach (rules-based weekly plan and offline adjustments) does not require an AI API key and does not send your data to a model. When operators enable optional AI features — such as LLM coach chat/voice, daily insight, or photo meal macro estimates — we process limited inputs with a configured provider (recommended: SpaceXAI/xAI). We do not sell that content or use it for ads. When the provider is xAI with team Zero Data Retention (ZDR), xAI does not retain API prompts or outputs at rest (see xAI security FAQ). Cloud sync, payments, email, and product analytics remain separate third parties — ZDR does not replace those policies.

## Third parties

We use the subprocessors listed below. We do not use Meta Pixel or Google Analytics advertising tags in the app. Each vendor has its own privacy terms. Session recording is disabled in our PostHog config. Payment refunds are described on /refunds.

## Subprocessors

Supabase (auth/database/hosting); Vercel (app hosting); Stripe and/or PayPal (payments when enabled); Resend (transactional email when enabled); PostHog EU (product analytics only if you allow it); optional OpenAI-compatible LLM provider when operators enable AI coach features (preferred: SpaceXAI/xAI with team Zero Data Retention). We remain the controller for consumer accounts; business customers who need a DPA should request docs/legal/DPA.md via support.

## Your choices

- Use the free core without an account (local-only).
- Export or restore device data from Profile → Back up your data.
- Request access or deletion of your account and cloud data: support@missionwinning.com — we aim to respond within 30 days.
- Control product analytics anytime: first-visit banner, or Profile → Privacy & analytics. Browsers with Do Not Track keep analytics off.

## California privacy (CCPA)

We do not sell or share personal information for cross-context behavioral advertising as those terms are defined under the California Consumer Privacy Act (CCPA/CPRA). California residents may request access or deletion of personal information we hold by emailing support@missionwinning.com. We will verify and respond as required by law.

## Not medical advice

Mission Winning provides educational fitness tools only. Consult a qualified professional before starting new exercise or nutrition programs.

Questions: support@missionwinning.com

---

# Refunds & cancellation

*Last updated: July 2026*

This policy applies to paid Mission Winning purchases (Super Bundle and related premium). Free core use needs no refund. Educational fitness software only — not a medical device.

## Subscriptions

Monthly and 12-month Super Bundle: request a full refund within 14 days of your first paid charge by emailing support@missionwinning.com. After that window, we do not offer mid-cycle prorated refunds. Cancel anytime in Profile → Manage billing (Stripe Customer Portal) to stop future charges; access continues through the paid period already billed.

## Lifetime / USDC

Lifetime (card or Phantom USDC): request a refund within 14 days of purchase if you have not meaningfully used premium features, by emailing support@missionwinning.com. After 14 days, lifetime purchases are non-refundable. Phantom/USDC refunds are processed manually by support — there is no automated on-chain reverse transfer yet.

## How to request

Email support@missionwinning.com with the subject “Refund request”, the email used at checkout, plan type (monthly / 12-mo / lifetime), approximate purchase date, and payment method (Stripe or Phantom). We aim to respond within a few business days.

## Abuse & chargebacks

We may refuse repeat refund requests that appear abusive. Opening a chargeback without contacting support first may delay resolution. Fraudulent payments may result in account termination.

See also

---

# DMCA / Copyright

*Last updated: July 2026*

Mission Winning respects intellectual property. If you believe material on our service infringes your copyright, send a notice that complies with 17 U.S.C. §512 to our designated agent.

## Designated agent

Agent (interim until copyright.gov listing is published): Mission Winning LLC, Attn: DMCA Agent, support@missionwinning.com. Postal address: to be published on this page after the Copyright Office designation is filed. Subject line: DMCA Notice.

## What your notice must include

- A physical or electronic signature of the copyright owner or authorized agent.
- Identification of the copyrighted work claimed to be infringed.
- Identification of the material that is claimed to be infringing, with enough detail for us to locate it (URL or description).
- Your mailing address, telephone number, and email address.
- A statement that you have a good-faith belief that use of the material is not authorized by the copyright owner, its agent, or the law.
- A statement that the information in the notice is accurate, and under penalty of perjury, that you are authorized to act on behalf of the owner.

## Counter-notice

If your material was removed and you believe it was a mistake or misidentification, you may send a counter-notice to the same agent with the elements required by 17 U.S.C. §512(g). We may restore material consistent with the statute.

This page is an operational notice channel, not legal advice. Registering a designated agent with the U.S. Copyright Office is required for safe-harbor protection.

