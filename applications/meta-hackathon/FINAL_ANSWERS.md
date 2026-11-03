# Meta Global AI Developer Hackathon: FINAL ANSWERS (not submitted)
Prepared 2026-10-21 ~6:30 PM ET. Form: https://cerebralvalley.ai/e/meta-ai-developer-hackathon → "Apply" (Cerebral Valley login).
Status: no confirmation email in snowdenzeng@gmail.com → NOT yet applied. Closes Oct 25 11:59 PM ET or earlier at 20,000 acceptances (rolling; earlier = better).
Questions below are the live form's own schema (15 questions, read from the page's data on Oct 21). No character limits are set in the form.

| # | Question (exact) | Req | Answer |
|---|---|---|---|
| 0 | What's your LinkedIn? | yes | https://www.linkedin.com/in/snowdenzeng/ (private field; Snowden confirm URL works) |
| 1 | What's your Twitter/X? | no | https://x.com/SnowdenZeng (or leave blank for low profile) |
| 2 | What's your Github? | no | https://github.com/Snedz |
| 3 | Where do you live (City, State, Country)? | yes | Niagara Falls, Ontario, Canada |
| 4 | Startup track or indie dev track? | yes | Startup Track |
| 6 | What country is your company incorporated in? | yes | United States (Texas): Mission Winning LLC |
| 7 | What round of funding are you? | yes | Bootstrapped |
| 8 | What do you want to build? | yes | see A |
| 9 | AI project you recently built (what + techniques) | yes | see B |
| 10 | Used Meta Model API before? | yes | No |
| 11 | How likely to build with Meta Model API? | yes | Very likely |
| 12 | Opinion of Meta Model API? | yes | Somewhat favorable (honest pick, Snowden's call) |
| 13 | How did you hear? | yes | Cerebral Valley newsletter and X |
| 14 | Marketing emails from Meta? | yes | Snowden's choice (No = fewer emails; not scored) |

## A. What do you want to build for this hackathon?
Theme: Build for Your World.

Mission Winning is an Android strength-training app that already logs workouts fully offline. Its AI coach is the one part that still needs the cloud, and that's where it lets you down: gyms are often basements with no signal, and training history is personal health data.

In ten days I'll make the coach run on the phone:
1. Run Muse Glimmer (Meta's Apache-2.0 open-weight model built for edge devices) on-device, quantized, so it answers "what should I lift next session?" from the user's own logged sets. The answers are grounded: every number it suggests has to trace back to a logged set or a rule, and it says "not enough data" when that's the honest answer.
2. When there's signal, Muse Spark is the optional hosted path for deeper weekly reviews, with on-device as the default.
3. Stretch goal: SAM 3.1 on a 10-second phone clip of a set, to segment the bar and body and estimate range of motion per rep.

Deliverables: a signed Android build where the coach works in airplane mode, plus a public benchmark of on-device vs. hosted answers (accuracy against logged history, made-up-number rate, latency, battery) on a fixed set of 50 real training scenarios.

## B. Tell us about an AI project you recently built
Mission Winning (missionwinning.com, github.com/Snedz), a strength-training app that I build and run solo.
- Android (Kotlin) app built offline-first. Room is the source of truth and writes go through an outbox, so logging never waits on the network and sync runs in the background.
- AI coach: an LLM layer with ordered fallback across Groq, OpenRouter and a custom OpenAI-compatible endpoint. Its prompts are built from the user's logged history (sets, load, recent strain), and it shows a clear "coach unavailable" state instead of making answers up when every provider fails.
- Coaching logic has its own tests (cold-start programming, high-strain weeks bring in recovery sessions), so the model fills in rules I can check rather than guessing.
- Web membership runs on Supabase + Stripe.
- Engineering system: I run several AI coding agents in parallel on a backlog. Nothing merges until a full verify gate passes (unit + end-to-end), and every change leaves a receipt, so one person can ship like a small team.

## Notes / gotchas
- Selection uses ONLY these form answers, with A and B weighted equally. Links help but aren't required.
- missionwinning.com currently returns 402 (Vercel account blocked). Fix it before submitting, or the "shipped product" link hurts more than it helps. If it's not fixed, drop the URL from B and keep the GitHub link.
- Snedz GitHub repos are mostly private, so reviewers may see little. Consider pinning one public repo.
- Removed from the old draft: the "<500 ms cold start / ~300 ms measured" and "test proves zero network requests" claims, because I couldn't find them in the current repo. Re-add only if Snowden can point to them. Never claim users, revenue or rep detection.
- Eligibility: Canada resident + Texas LLC = fine. Excluded: Meta/Cerebral Valley staff, government-affiliated people and their families. Duplicate applications or false identity = disqualified (apply once, real name in the CV profile).
- The Official Rules aren't published yet (due before Oct 26) and must be accepted after selection. Watch for IP and publicity clauses (winners' names may be public).
- Partner credits for selected participants: Baseten $100, Modal $100, Fireworks $25.
- Build Oct 26–Nov 4 (submit by 9 PM ET Nov 4). Finals Nov 9.

## Only Snowden can do
1. Sign in to Cerebral Valley (snowdenzeng@gmail.com) and fill in the profile name, email and phone. Real name is fine there, since it's private.
2. Confirm the LinkedIn URL. Decide on X (include it, or leave blank for low profile).
3. Pick Q12 and Q14.
4. Fix Vercel billing, or OK dropping the website link.
5. Read the Event Waiver (cerebralvalley.ai/e/meta-ai-developer-hackathon/waiver) and accept it.
6. Click Submit.
No video or ID is needed at the application stage.

## Submit steps
1. Open https://cerebralvalley.ai/e/meta-ai-developer-hackathon → Apply → sign in with Google (snowdenzeng@gmail.com).
2. Paste the table answers in order. Choosing "Startup Track" makes Q6/Q7 appear.
3. Paste A into Q8 and B into Q9.
4. Answer Q10–14, accept the waiver, and Submit. Expect a confirmation email, and a decision by Oct 26 9 AM ET.
