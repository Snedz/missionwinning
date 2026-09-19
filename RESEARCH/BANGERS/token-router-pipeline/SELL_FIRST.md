# SELL_FIRST — Token router (gas pipeline)

Track 03 · sell the meter before the pipe · paper 2026-09-19

This file owns the offer. It does not own the pipeline (that is [FRAMEWORK.md](FRAMEWORK.md)) and it does not own the deferral list (that is [BUILD_LATER.md](BUILD_LATER.md)). If a sentence is "we should also build X so it sells," it is in the wrong file.

---

## 1. The sale, in one breath

**You buy a padlock and a meter for token energy.** The padlock is `ALLOW_PAID` (default locked). The meter is claim-before-dispatch plus a receipt. The pipeline is how gas is allowed to move. You do not buy 300 models, a dashboard seat, or a credit balance.

If that sentence does not match what the buyer wanted, **do not sell this.** Point them at the landscape row that already exists.

---

## 2. Who pays (and who does not)

### 2.1 Buyer (M1)

| Buyer | Why they pay attention | What they already tried |
|-------|------------------------|-------------------------|
| Solo founder running agents on a laptop | One unbounded `fetch` to a frontier API can erase a week of margin. They want a default that cannot spend. | `.env` hope; a LiteLLM config they are afraid to run; a spreadsheet after the Stripe invoice |
| Small agent shop (2–8 people, one shared box) | Need a *visible* work order before a job burns tokens. Need crash-safe close. | LiteLLM proxy with virtual keys they do not fully understand; OpenRouter credits "for now" |
| Mission Winning founder (optional first dogfood, not a product feature) | Already fail-closes Coach at 15¢/identity/day. Wants the same honesty for *side* agent work (harness, research, codegen) that is not Coach. | `LLM_DAILY_USD_CENTS` on the app; nothing equivalent on the agent host |

The first check is: **do they have at least one local or honestly-free well they are willing to use as default?** If the answer is "no, we only use frontier APIs," they are not an M1 buyer. They are an OpenRouter / Portkey / Martian buyer who wants a hatch they will leave open. Sell them the landscape, not this.

### 2.2 Not a buyer

| Person | What they actually want | Send them to |
|--------|-------------------------|--------------|
| "One key, every model" | A catalog + unified bill | OpenRouter |
| "Govern 40 teams, SSO, guardrails" | A control plane | Portkey / Prisma AIRS |
| "Why did this prompt get worse?" | Observability | Helicone (maintenance-mode diligence) or Portkey logs |
| "Pick the cheapest good-enough model automatically" | A smart dispatcher | Martian, Not Diamond, Fireworks Nexus FireRouter |
| "Zero-infra cache at the edge" | CDN in front of providers | Cloudflare AI Gateway |
| "Route my dedicated replicas" | Provider-native traffic split | Together dedicated endpoints, Fireworks routers |
| "Free Claude/GPT in my own harness" | Someone else's ad-supported product, wrapped | **Refuse.** Freebuff ToS forbids this. |

Do not take their money to build the thing they named. That is how this track becomes a worse LiteLLM.

---

## 3. The offer (what is on the tin)

### Headline

**No silent paid spend.**

### Subhead

Disk-first token pipeline: health → score → claim → dispatch → receipt. Free-first. Paid is a hatch you open on purpose.

### What they walk away with (M1)

1. A directory on disk that *is* the control plane (`registry.yaml`, `hatch.yaml`, `health/`, `claims/`, `receipts/`).
2. A CLI that will not send a byte until a claim file exists.
3. A locked hatch that makes paid and credits-owned wells ineligible.
4. Caps that refuse a claim *before* HTTP, not after.
5. A reconcile on boot so a killed process cannot leave an unmetered tap open.
6. A schema they can read (`registry.schema.yaml`) without joining a Slack.

### What they do not walk away with

- A hosted account, a credit card form, or a 5.5% fee.
- A model marketplace.
- Semantic cache, prompt CMS, eval suite, session replay.
- An ad unit.
- A promise that local models are "as good as" frontier.

### Price (paper)

M1 is **software the operator runs**. Default: open schema + MIT-or-Apache implementation *when commissioned* (license pick is a later legal act; this paper does not mint a LICENSE).

Charge later, if ever, for:

- A supported binary / brew tap.
- A one-page setup that wires their existing wells (not a SaaS).
- Optional "hatch review" — a human reads their registry and receipts for a week and tells them where silent spend would have happened. That is a service, not a seat.

Do not charge per token. That puts us in OpenRouter's business and creates an incentive to *increase* burn.

Do not invent a dollar price in this paper. There is no traction and no EIN-tied SKU. The sale is the *shape*.

---

## 4. Why sell first

The category is crowded. The *word* "router" already means four different products (see [INDUSTRY_LANDSCAPE.md](INDUSTRY_LANDSCAPE.md) §2). If we build first, we will accidentally build the fourth LiteLLM adapter pack and then try to find a sentence.

Sell-first questions that must get a yes from a real operator before M1 code:

1. Will you accept **local or documented-free** as the default well, knowing output quality will drop vs frontier?
2. Will you accept that **paid is two acts** (add the row *and* open the hatch with a written reason)?
3. Will you accept **claim files on disk** as the source of truth, including after a crash?
4. Will you accept that we **will not** wrap Freebuff / web ChatGPT / "free unlimited Claude"?

If any answer is no, stop. The landscape already serves them.

A written "yes" from one operator is enough to commission M1. Ten hypothetical buyers are not.

---

## 5. Positioning against the field (sell language, not a feature matrix)

The matrix lives in the landscape file. This is the *sentence* you say out loud.

| They say | You say |
|----------|---------|
| "We use OpenRouter, it's fine." | "OpenRouter is a trader. You still need a meter on *your* side so a retry cannot open a second tap. We are the meter. You can keep the trader as a *hatched* well." |
| "LiteLLM already does budgets." | "LiteLLM is a substation for many wells. Default gravity is paid upstreams and a proxy process. We are a padlock that starts with no paid wells and will not HTTP without a claim file." |
| "Portkey has guardrails." | "Buy Portkey if you need SSO and a policy org. We will not grow a governance suite to win that deal." |
| "Helicone will show me the spend." | "Logs after the fact are a coroner. A claim is a work order. We refuse the shift before it happens." |
| "Martian saves 30%." | "Then you want a dispatcher. We rank by cost class and health, not by a routing model. Different machine." |
| "Cloudflare is free on our plan." | "Good substation. It still forwards to paid providers unless you stop it. The hatch is not a CF rule; it is a file you own." |
| "Together/Fireworks already route." | "They route across *their* replicas. We route across *your* wells, including the one in the basement." |
| "Freebuff is free." | "For humans, in *their* app, with ads. Not a well. We will not add it." |

---

## 6. Objections (and the honest answer)

**"This is just LiteLLM with extra steps."**  
LiteLLM's extra steps are adapters, virtual keys, and a proxy UI. Ours are claim-before-dispatch and a locked hatch. If those two are "extra steps you don't need," you are not the buyer. If you have ever been surprised by an invoice, they are the product.

**"Claim files will slow us down."**  
A rename-atomic JSON write is cheaper than a 200 ms model hop. If claim I/O is your bottleneck you are not doing LLM work.

**"We'll forget to open the hatch and the agent will stall."**  
Good. Stall is the feature. The receipt says `denied: paid_hatch_closed`. An agent that "helpfully" falls back to paid is how silent spend happens.

**"Local models are not good enough for our users."**  
Then your *product* may need a hatched paid well. Your *agent host* and your *dev loops* still should not. Sell the hatch for production; keep M1 for the host. Do not collapse the two.

**"Just set a Stripe spend limit."**  
Provider and card limits are *their* meter. They close after the call, or at a delay, or per-key in a way a retry can race. L4 says we reserve first.

**"Open source this and nobody pays."**  
Correct for M1. We are not selling M1 as a company. We are selling the *discipline* so the first implementation is not a cloud clone. A company, if any, is a later paper.

**"Mission Winning should just use this for Coach."**  
Not from this track (law L10). Coach already has a fail-closed dollar cap. Composing the two is a founder commission, two brakes, two homes.

---

## 7. Demo that sells (no code yet)

A 90-second story, told with files, that an M1 build must be able to replay:

1. Show `hatch.yaml` with `allow_paid: false`.
2. Show a registry with `ollama/local` and a commented `openai/paid` row.
3. Run a prompt. A `claims/*.json` appears, then a receipt with `class: local`, `usd_cents: 0`.
4. Uncomment the OpenAI row. Run again. Score marks it ineligible. Claim refused. **No HTTP to api.openai.com** (prove with a network log or a fake).
5. `router hatch open --reason "dogfood week"`. Set `max_paid_usd_cents_per_day: 25`. Run again. Claim shows `class: paid`, `max_usd_cents: 5`. Receipt shows actual cents. A second run that would exceed 25¢ is refused *before* HTTP.
6. Kill the process mid-dispatch. Restart. Reconcile writes `breached` at claim max. The daily cap reflects the conservative burn.

If a build cannot tell that story, it is not M1, and it is not sellable as this offer.

---

## 8. Landing copy (do not expand)

```
Tokens are energy. This is the pipeline.

Health. Score. Claim. Dispatch. Receipt.

Paid wells stay locked until you open ALLOW_PAID.
No claim, no gas. No silent invoice.
```

Four lines. No feature grid. No "vs OpenRouter." The landscape file is for operators who already know the nouns.

---

## 9. Founder tasks (not agent tasks)

Agents do not mark these done.

- Pick one operator (maybe yourself) and get the four yes/no answers in §4 in writing.
- Decide whether M1 dogfood is the MW *agent host* only (allowed to discuss) or Coach composition (needs a separate commission).
- Do not file a Stripe SKU. Do not announce a launch. Do not invent a user count.

---

## 10. Kill the sale

Stop selling this track if the only interested sentence is "make inference free." That sentence is either a Freebuff wrap (refuse) or a datacenter business (not an indie router). The sale is **honesty about energy**, not cheap energy.
