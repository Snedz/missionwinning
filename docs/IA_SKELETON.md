# Product IA skeleton — three loops, existing rooms

**Audience:** Founder + agents  
**Baseline:** web `2026.07-unified.1053`  
**Status:** Locked product truth. Bones, not lipstick.  
**Related:** [FLOW_ARCHITECTURE.md](FLOW_ARCHITECTURE.md) (chip floorplan) · [MISSION_SERVER_MESSENGER_PLAN.md](MISSION_SERVER_MESSENGER_PLAN.md) · [IDENTITY_SOCIAL_PLAN.md](IDENTITY_SOCIAL_PLAN.md) · [JOURNEY.md](JOURNEY.md)

This is the **product information architecture** — which rooms exist, which loop each room serves, and what must never ship. It does not restyle chrome. Visual / costume PRs stay open for founder review.

Pitch **Train + Mission Coach**. Free-forever offline logger. Week from **own logs**, no wearable. Today is one Start, not a feed.

---

## 1. Three loops

### LOG

`/log` (Today, one Start) → `/active` (Train, dock only while live) → `/history` (private diary).

Chat, comments, DMs, feeds, and AI bubbles stay **off** this path. Chat is never a reason to withhold a set. Help is `/help`, not a bubble.

### WEEK

Own logs → `/coach` (Mission Coach) is the **only** week writer (`generateWeek` via `useCoachPlan`). Join later may set context or add-on sessions. Never a purchased Team calendar. Never human write/delete on logs as default.

### GARAGE

`/server` is a type-3 MSN window. Entry is **More → You → Messenger**. Rooms: `train` | `garage` | `off-topic`. One Garage. No 1:1 DMs. Never a dock tab. Never first paint on Today or Train.

Coach chat stays on `/coach`. It does **not** share a thread, store, or badge with Garage.

---

## 2. Room map (existing routes — do not mint empty rooms)

| Route | Room | Notes |
|-------|------|-------|
| `/log` | Today | Command. One Start. Dock label **Summary**. |
| `/active` | Train | Logger. Live only. |
| `/coach` | Mission Coach | AI week from own logs + coach chat. Not a Hevy Coach tab. Not Garage. |
| `/history` | Diary | Private. |
| `/library` + `/builder` | Wedge catalog | Super Bundle deepens pro templates; never gates `logSet`. |
| `/profile` | You | Later Studio door lives here **only** when a second PERSON exists. Do not build Studio now. |
| `/account` | Account | Reminders. |
| `/server` | Messenger | Quiet third place. More → You. |
| `/help` | Help | A route, not a bubble. |
| `/explore` | Places | Pin-board only (Decision 009). Do not name a program shop Explore. |
| `/programs` | Education | Outlines, not nSuns, not a store. |
| `/coaching` | Human 1:1 lead | ≠ Mission Coach. |
| `/bundle` | Super Bundle | One first-party SKU. No third card. |
| `/private` | Tight lock | **FROZEN.** Do not restyle. |
| `/join/class` · school / PFT | Parked | Never reuse for a program shop. |

Athlete-default chrome is **TIERING**, not a second product: cold dock = Summary + Search; live Train joins; Builder / Library / Server live in More. That **is** the YouTube door. Do not add a Message tab. Do not add a Coach-the-human tab. Do not mint an empty Studio.

---

## 3. Horizon 0 vs later

| Now (Horizon 0) | Later |
|-----------------|-------|
| Free logger + Mission Coach wedge | Postal, America / PFT as a channel |
| `/server` as one Garage, parkable | Multi-server, invites, roles, voice |
| Studio **unbuilt** | Studio door on You, only when a second person exists |
| Explore = places pin-board | Named monthly social hook (copy + Coach week) |
| Super Bundle one SKU, mute-pay | Live checkout after EIN |
| `/private` tight lock | Founder flips `PRIVATE_MODE` |

Agents never flip `PRIVATE_MODE`, never invent traction, never promote production. Live www stays `.696` until the founder says otherwise.

---

## 4. Refuse (do not ship)

- Any visual / costume / sidebar / theme change in an IA slice
- Restyle `/private` or `sites/www` marketing
- Patreon public creator URL, member Feed, Chats-on-home
- TrainHeroic Coach Home, Session Comments, Chat as athlete dock tab
- Hevy Home-as-feed, likes / comments on logs
- Intercom / Chat Heads / Fitbod overlay / any type-5 bubble on Today or Train
- Discord.com, DMs, workout auto-post, people rail / Top 8 / `/coaches`
- Empty Studio, Message tab, Explore-as-shop, shop on Today or `/bundle`
- Flip `PRIVATE_MODE`, invent traction, promote production
- Counsel-hold PT / pregnancy / field-test copy

---

## 5. Known leak (not a join mechanic)

Builder `saveAllProgramSessions` writes program days into `savedWorkouts`. Today's Start honors that notebook **before** a Coach peek (`pickHonoredStart` then `loadCoachTodayOptional`). That is a **dual-writer**. Do not bless it as Join. Do not change Start order unless a test demands a comment.

---

## 6. Guards (what can fail)

| Rule | Enforcer |
|------|----------|
| Planner / logger blind to standing | `domainBoundary.test.ts` C1–C2, C7 |
| `/server` never a primary tab | C3 + `mobileNavTabs.test.ts` |
| Today / Train / first-paint chrome never import messenger | `src/lib/social/isolation.test.ts` |
| Chat never withholds a set | same file (`logSet` / SetLogRow / firstSetUngated) |
| Coach never reads Garage | same file + C1 on `src/lib/coach/` |
| Log-path tabs = `/log` + `/active` only | `MOBILE_TAB_HREFS` + isolation |
| `generateWeek` is the only product week writer | `src/lib/coach/weekWriter.test.ts` |

Chip buses and dual-pad hazards stay in [FLOW_ARCHITECTURE.md](FLOW_ARCHITECTURE.md). This file wins when a costume PR disagrees with the room map.
