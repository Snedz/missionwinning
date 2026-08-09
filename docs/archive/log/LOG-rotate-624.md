## 2026-08-08 — The privacy policy could not be edited (`.609`)

**One constant did two jobs, and the collision was a lock on the document.**

`privacyConsent.ts` had `CURRENT_TERMS_VERSION` and `CURRENT_PRIVACY_VERSION`. The pages rendered them as "Last updated" (`PrivacyPage.tsx:110`, `CookiesPage.tsx:36`) and `hasValidPrivacyConsent()` compared them. The old comment presented that as a feature — *"One source: date shown === version consented to."*

In practice it means: fix a typo, clarify a sentence, or name one new field, and you either **re-prompt every device on earth for consent** or ship a policy whose stated date is a lie. Faced with that, nobody edits the policy. A stale privacy page is the exact failure the consent record exists to prevent, and the mechanism guaranteeing staleness was the record itself.

Split: `*_DISPLAY_DATE` moves on any edit and is what the page shows; `*_CONSENT_VERSION` moves only on a material change — new data, new purpose, new recipient — and is the only thing consent compares.

**Two guards, because the values are equal today and a value check cannot see the coupling return.** The behavioural one pins the invariant that keeps them honest: the consent version may lag the displayed date (prose edits since the last material change) but must never **lead** it — a user may not be asked to accept a version the page has not admitted to publishing. The structural one reads `hasValidPrivacyConsent`'s body and fails if a display date appears in it; reintroduce the coupling and prose edits start silently logging people out of their own consent again, with the whole suite green.

Prerequisite for any policy text change, which is why it ships first.

Mutants: 2 killed — compare the display date inside `hasValidPrivacyConsent` → structural guard red; set the consent version ahead of the displayed date → invariant red. Tests 2219 → 2221.
