# Airwallex Agentic Banking Hackathon: FINAL ANSWERS (ready to paste, NOT submitted)
Form: https://www.hackerearth.com/community/challenges/hackathon/agentic-banking-hackathon/?register=true
Deadline: Registration & Idea Phase closes **Fri Oct 23, 2026, 6:29 PM UTC = 2:29 PM ET** (per the HackerEarth challenge page).

## Registration
- Name: Snowden Zeng
- Email: contact@missionwinning.com
- Country: United States
- Organization: Mission Winning LLC (Texas, USA)
- Role: Founder and engineer
- LinkedIn: (leave blank)
- Team: Solo (1 member)
- Demo Day attendance: Remote

## Project name
Ledger Steward

## Track(s)
Treasury & Ops (Adaptive Treasury Controller) + Payment Ops Incident Commander

## What will you build?
Ledger Steward is an agent that runs the back office of a small subscription business. It watches incoming subscription revenue landing in an Airwallex global account, reconciles each deposit against expected invoices, decides when to convert USD into other currencies based on a cash floor and live FX quotes, and pays contractors and vendors through Airwallex payouts. Every action sits inside explicit permissions: routine payouts under a limit run automatically; anything new, over limit, or below the cash floor goes to the founder for one-tap approval. When a transfer is delayed, it investigates status before retrying, so it never pays twice. Built and demoed entirely in the Airwallex sandbox for Mission Winning, a pre-launch fitness app.

## Who is the user and what problem?
Solo founders and very small teams who sell subscriptions in one currency and pay costs in others. They do reconciliation, FX timing and payouts by hand, late at night, and a single double-payment or missed cash floor hurts. Ledger Steward does the routine work and asks only when a decision is real.

## How does it use Airwallex?
Global accounts for incoming funds, FX quotes and conversions, payouts/transfers to beneficiaries, and balance and transaction data for reconciliation. Airwallex performs every money movement; the agent decides when and why.

## Agent controls
Per-action permission policy (auto under limit, approval above, block below cash floor); idempotency keys on every payout; a delayed-transfer runbook (check status, then wait or escalate, never blind retry); and a full decision log showing the financial context behind each action.

## Tech stack
TypeScript, Airwallex sandbox APIs, open models (MiniMax, GLM, DeepSeek) for decision steps with tool calls constrained by the policy layer, and a simple web dashboard for approvals.

## Team / background
Solo founder. I run Mission Winning LLC with a fleet of AI coding agents that build, test and merge work in rotation. I'll build Ledger Steward the same way during the build phase, and I'm its first user: I'm setting up my own company's finances now.

## Traction
Pre-launch; no revenue or users claimed. The demo uses sandbox data only.

## Why you?
I'm the user. I'm setting up the finances of my own company now and want to build the tool I'll actually run.

## Links
GitHub: https://github.com/Snedz (project repo created during the build window)

---
Self-check (do not paste): proprietary model and non-US country mentions removed, no LiftLog, no traction numbers, no live-money step (avoid Starter Kit 09).
