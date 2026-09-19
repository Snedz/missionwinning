# RESEARCH/BANGERS/

**BANGERS** = sell-first consumer hits that are not the Mission Winning wedge. One track, one folder, one kill bar. No shared binary with the PWA or the Android Play product.

| Track | Folder | One-line | Gate |
|-------|--------|----------|------|
| **01** | [dual-capture-plus/](dual-capture-plus/) | Paid Dual Capture that Apple’s free Camera mode refuses to be | Kill if **&lt;5 cold pays / 14 days** after the lander has a working `PAYMENT_URL` |

## Shared rules (every track)

1. **Sell before build.** Lander + price + kill bar land first. No TestFlight, no App Store binary, no `apps/` folder until the track’s `SELL_FIRST.md` is PASS.
2. **Cold pays only.** Founder cards, household cards, and “please click so we can count five” DMs do not count. Definition is in each track’s `SELL_FIRST.md`.
3. **Spike ≤1 day after PASS.** The spike is a throwaway Xcode project on the founder’s Mac, not a commit in this repo. Plan: that track’s `SPIKE_PLAN.md`.
4. **No invented URLs.** Checkout is `PAYMENT_URL`. App Store / Apple doc links in `SOURCES.md` must be real pages, not guessed IDs.
5. **One concern per PR** if a track later needs a code spike in-repo — that is a later founder call. Track 01 forbids an app binary in this tree.

## Not a BANGERS track

Mission Winning Super Bundle, Lifetime USDC, Android Play, www landing, Mission Coach. Those stay in `ORCHESTRATION.md` + `docs/`.
