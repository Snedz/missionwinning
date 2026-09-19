# ai-edit-auditor — framework

**Claim:** Agencies will pay to **prove** an AI edit matched a written brief (diff + checklist). Category is **unproven**.

**Status:** paper. **Pays:** 0. **Checkout:** none.

## Problem

A client says “make it shorter and keep the legal names.” A model rewrites the piece. Someone still has to check. The job is an **audit artifact**, not another chat box.

## Buyer

| Field | Value |
|-------|--------|
| Who | Freelance editors, small agencies, maybe compliance-adjacent writers |
| Who is not | People who want another writer / “make it better” chatbot |
| Job | Brief + before + after → pass/fail artifact (diff + checklist) |
| Demand | **UNKNOWN.** |

## Wedge

Upload brief + before + after. Get: unified diff, “names preserved?” checklist, leftover-TODO scan. Human clicks pass/fail. Not an AI writer.

## MW relationship

None. Do not change MW coach chat. Do not hang this on Mission Coach or `/api/coach`. Separate experiment.

## 14-day test

See [SELL_FIRST.md](SELL_FIRST.md). Bar: **5 cold pays / 14 days**. Rank 8 — hard on purpose. Category unproven. Expect FAIL unless five strangers will pay $19 for a **diff + checklist**, not a rewriter.

## Incumbents (generic diffs — no invented category leader)

No sourced **“AI edit auditor”** product was found this pass (2026-09-19). Do not invent one. These are the **adjacent** tools a buyer already has:

| Product | Official | Kind | Listed money (2026-09-19) | Wedge vs us |
|---------|----------|------|---------------------------|-------------|
| **Git / GitHub diffs** | https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/reviewing-changes-in-pull-requests/about-comparing-branches-in-pull-requests | Code/text diff | Free for public; GitHub paid plans are for the host, not this job | No brief checklist. Not “did the model keep the names.” |
| **Draftable** | https://www.draftable.com/compare · https://www.draftable.com/pricing | Document redline | Official: Business **$129 USD / user / year**; Legal **$261 USD / user / year**. Free online compare exists. | Word/PDF redline. Not brief-vs-rewrite audit. |
| **Google Docs Compare** | https://workspaceupdates.googleblog.com/2019/06/compare-docs.html · version history help: https://support.google.com/docs/answer/190843 | Docs → suggested-edits diff | Included in Docs. Compare is **Tools > Compare documents** (first-party launch post). Help 190843 is *version history*, not the compare dialog. | Two Docs. No brief checklist. |
| **Microsoft Word Compare** | https://support.microsoft.com/en-US/Word/compare-and-merge-two-versions-of-a-document | Review → Compare | Bundled with Word (desktop). | Revision marks. Not “bullet 3 of the brief.” |
| **Gemini in Docs** | https://support.google.com/docs/answer/13447609 | AI **writer** | Workspace / Gemini SKUs — **not** an auditor | Opposite job: it rewrites. We check a rewrite. |

**Named “AI edit auditor” SaaS:** **UNKNOWN** this pass. Do not fill the cell with a made-up leader.

## Risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| Category unproven | Kill | 14-day cash test. No binary until 5 pays. |
| “Just use git / Draftable” | High | Offer is brief + checklist + leftover-prompt scan, not a redline. |
| Legal / court-ready claims | Legal | Never. Human still decides. |
| Overbuild an LLM | Product | Default: deterministic diffs. LLM only if the lander sold it. |
| MW coach-chat creep | Process | Forbidden. |

## Price hypothesis (not a fact)

$19 one-time desktop or $9/mo. **HYPOTHESIS.** Do not print a Stripe URL.
