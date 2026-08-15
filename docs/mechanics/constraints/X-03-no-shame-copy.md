---
id: X-03
type: constraint
title: Re-entry copy carries no shame and no standing
rule: Athlete-facing copy after an absence may not name the length of the absence in a loss frame, may not mention streaks, and may not carry XP, rank, tier, leaderboard, badge or squad language. Applies to in-app lines and outbound nudges alike.
enforcer: src/lib/reentryCopyGuard.test.ts
enforcer_anchor: TodayReentryCard defaults stay shame-free
authority: docs/EXCELLENCE_RESULT.md criterion 4
---

The defect this was written for was not a missing feature, it was tone plus
size: someone away a week opens Today, sees a broken streak and a full plan they
have already failed, and closes the app. The channel split made it worse — the
in-app surface was deliberately shame-free while email led with *"Your 5-day
streak ends tonight"*, which is the same athlete being told opposite things at
the moment they are most likely to quit.

This is the constraint most likely to kill a *high-scoring* candidate, because
loss-framed streak mechanics genuinely do move short-horizon engagement. That is
the point of having it in the graph rather than in someone's judgement: the
mechanics with the best-documented daily-active lift are the same ones with the
best-documented evidence of obligation, distress and churn.
