# Vercel Sandbox — $1M Hacker Challenge Participation Plan

> **What this is:** a plan for entering Vercel's public, time-boxed HackerOne bug-bounty
> challenge on **Vercel Sandbox** isolation. This is an *authorized, sanctioned* security
> research engagement — participation is legitimate and covered by Vercel's safe harbor.
>
> **What this is NOT:** part of the Mission Winning product, its threat model, or its own
> security posture (that lives in [`docs/security/`](security/INDEX.md), [PROTECTION.md](PROTECTION.md),
> [OWASP_AUDIT.md](OWASP_AUDIT.md)). This is an external side-engagement plan. It contains
> **research direction and methodology, no weaponized exploit code** — consistent with the repo's
> "findings only, no PoCs" norm.
>
> **Authoritative rules live only on the HackerOne program page + Vercel's announcement blog.**
> Everything below is a working summary compiled from public sources; read the H1 policy in full
> and re-verify every number before acting. Sources are listed at the end.

---

## TL;DR — the honest recommendation

- **The prize structure:** up to **$1,000,000 total pool**, **max $50,000 per report** (single root
  cause), **~2-week window (~Aug 18 → Sep 1 2026)**, closes early if the pool drains. Live PoC
  required — static analysis alone earns **$0**.
- **The field is elite and the payout is concentrated.** The prior Vercel challenge (React2Shell,
  Dec 2025) paid >$1M across only **20 unique techniques**; one automation-heavy team took **$170k**.
  Most of the obvious surface was mined within ~24 hours.
- **For a strong generalist, the microVM→host escape is a low-probability long shot** — it is elite
  VMM/hypervisor-specialist territory, and the public Firecracker CVEs are almost certainly already
  patched on Vercel's build.
- **The realistically winnable entry point is the network / egress-firewall tier (scope d)** — it is
  in scope, does **not** require crossing the microVM, and is **logic / parser-differential /
  config-abuse** work: exactly the skill set that made React2Shell lucrative. "Retrieve brokered
  credentials" is an in-scope, logic-shaped crown jewel a generalist can plausibly reach.
- **Decision rule: only enter if you can go effectively full-time for the window.** If you do,
  concentrate ~100% on the firewall/egress tier (secondarily cross-tenant DoS and the guest-agent
  control-plane), hunt a **novel** root cause rather than replaying public CVEs, and **file the
  instant you have a live boundary break** to claim the dedupe slot. Plan for a **modal outcome of
  $0**; treat any single payout as upside.

---

## 1. The program at a glance

| Item | Detail |
|------|--------|
| **Host / venue** | Public **HackerOne** program run by Vercel |
| **Target** | **Vercel Sandbox** — ephemeral Firecracker-microVM compute for untrusted / AI-generated code |
| **Window** | ~**Aug 18 → Sep 1 2026** (≈2 weeks), or earlier **if the ~$1M pool is exhausted** |
| **Pool** | Up to **$1,000,000 USD** total |
| **Per-report cap** | **$50,000 USD**, scoped to a **single root cause**; assigned by Vercel triage on **maximum *demonstrable* impact** |
| **Top payout** | Reading or modifying **another tenant's data** |
| **Reproduction** | Boot a real sandbox with the **`@vercel/sandbox` SDK** and show a **live PoC**. Default **Amazon Linux 2023** image is enough for most reports. |
| **Hard gate** | **Static-analysis-only findings are not rewarded** — triage must see the boundary actually break |
| **Dedupe** | Per unique root cause; the **first valid timestamp** on a root cause wins it |
| **Triage** | Professional + fast (Latacora IntrusionOps assisted on React2Shell); patches can ship within hours |
| **Disclosure** | Standard HackerOne **coordinated disclosure** — no public writeups until Vercel fixes and green-lights |

### In scope (the four impact classes)

- **(a)** Escape the **Firecracker microVM → the EC2 host**.
- **(b)** Reach **another tenant's sandbox** through the compute layer (read / modify / execute code in it).
- **(c)** **Crash another tenant's sandbox** from within yours (cross-tenant DoS).
- **(d)** **Defeat the sandbox egress firewall without crossing the microVM** — reach unauthorized
  destinations, exfiltrate data, or **retrieve brokered credentials**.

### Out of scope

- **Container / namespace escapes that only reach the Firecracker guest OS.** Namespaces are a
  developer-experience feature, **not** the security boundary. The boundary is the **microVM**.
- **Any static-analysis-only finding.** If the PoC doesn't make a live boundary break, it doesn't pay.
- **Self-DoS.** Crashing *your own* microVM/VMM is not in scope — cross-tenant or host impact is required.

> **Root-in-guest is the *starting position*, not the finding.** `sudo`/root inside the VM is expected
> and granted by design. The finding is always *what root-in-guest can reach across the boundary*.

---

## 2. Ethics, scope & safe harbor — read before touching anything

This is the part that keeps the engagement legitimate. Treat it as binding.

- **Stay strictly in the four in-scope classes.** Working out-of-scope burns the two-week clock and
  can void safe-harbor protection.
- **Safe harbor covers Vercel's systems only.** Vercel operates HackerOne's *Gold Standard Safe Harbor
  for Good Faith Security Research* and waives conflicting ToS/AUP terms for in-scope work. It does
  **not** authorize testing **third-party infrastructure** — do **not** attack AWS/EC2 internals or
  upstream allowlisted domains you reach *through* the sandbox. Those parties are not bound by Vercel's
  safe harbor and you lose legal cover.
- **Never touch real tenant data.** Prove cross-tenant read/modify/DoS using **two of your own
  sandboxes/accounts** as attacker and victim. Reading, modifying, or crashing a sandbox you don't
  own turns a bounty into an incident.
- **Keep DoS PoCs controlled and minimal.** Demonstrate a cross-tenant crash against your *own* second
  tenant, once, with evidence — then stop. No sustained resource-exhaustion against shared production.
- **Minimize blast radius.** Capture the least data needed to prove impact (a **canary string**, not a
  real secret dump). `stop()` sandboxes promptly. No persistence or lateral movement beyond the PoC.
- **Coordinated disclosure only.** No tweets, gists, or talks until Vercel remediates and agrees to
  disclose. Early disclosure can forfeit both bounty and safe harbor.
- **Don't degrade the platform.** Parallel sandbox fuzzing is fine within quota; runaway boot-storms
  that harm availability for others cross from research into abuse.
- **When in doubt, ask first.** If a technique might touch third-party infra or affect other tenants,
  contact Vercel/HackerOne *before* acting — the safe-harbor language itself instructs this.

---

## 3. Understand the target (architecture & threat model)

```
                         ┌───────────────────────── EC2 bare-metal host ──────────────────────────┐
                         │                                                                          │
  ┌── your tenant ───────┼──────────────┐   ┌── another tenant ──────────┐    Host-side (NOT in VM):│
  │  Firecracker microVM │              │   │  Firecracker microVM       │    • SNI egress firewall │
  │   (dedicated kernel) │              │   │   (dedicated kernel)        │    • credential broker    │
  │   ┌────────────────┐ │              │   │   ┌──────────────────────┐  │    • DNS resolver/proxy   │
  │   │ Linux container│ │  ← BOUNDARY  │   │   │ Linux container      │  │    • Hive controller      │
  │   │ your code(root)│ │    is here   │   │   │ neighbor code (root) │  │    • guest-agent peer     │
  │   └────────────────┘ │              │   │   └──────────────────────┘  │      (vsock CID 2)        │
  │   PID1 = Go agent    │              │   │                             │    • MMDS / metadata      │
  └──────────────────────┼──────────────┘   └─────────────────────────────┘    • snapshot store       │
                         └──────────────────────────────────────────────────────────────────────────┘
   guest → host over: virtio devices (MMIO default), vsock CID 2, tap NIC, KVM under Firecracker
```

Key facts that shape everything:

- **Three layers:** operator code runs in a **Linux container**, inside a **Firecracker microVM with a
  dedicated guest kernel**, on a **shared bare-metal EC2 host**. The **microVM is the boundary**.
- **Guest is maximally privileged inside the VM:** root/sudo, Amazon Linux 2023, up to 32 vCPU
  (2 GB/vCPU), kernel module loading, `/dev/mem`, ephemeral FS, FUSE mounts, up to 15 open ports.
  This is deliberate — it's why in-guest privilege isn't the finding.
- **The egress firewall runs on the *host*, outside the microVM.** It **SNI-peeks** the cleartext TLS
  ClientHello, checks a domain allow/deny policy plus a CIDR policy, and — per Vercel's docs —
  **retains each connection's original destination** (the guest chooses the upstream IP). Modes:
  **allow-all** (default), **deny-all** (blocks DNS too), **custom** (deny-by-default allowlist with
  exact / middle-wildcard / leading-wildcard matching + CIDR rules). Being root in the guest does
  **not** disable it → defeating it is a legitimate **scope-(d)** win, *not* a microVM escape.
- **Credential brokering is a host-side L7 MITM.** For "brokered" domains the firewall **terminates
  TLS with a per-sandbox just-in-time CA it plants in the guest trust store**, injects a secret into
  request headers, and overwrites headers the sandbox tries to set. The advertised guarantee is
  "*secrets never enter the sandbox — nothing to exfiltrate*." That promise is the target: it breaks
  the moment brokered traffic can be steered to an attacker sink or the domain matcher over-matches.
- **A custom Go guest-agent is PID 1** inside every microVM. It's the guest endpoint of Vercel's
  host-side **Hive "sandbox-controller"** — it runs commands (as root or `vercel-sandbox`), writes/
  reads files (tar.gz extraction), opens ports, sets network policy, snapshots the FS — almost
  certainly over **vsock (host CID 2)**. This custom agent + its transport is the **richest non-
  Firecracker attack surface**.
- **Snapshots power fast cold-start.** Vercel very likely restores sandboxes from Firecracker
  snapshots — relevant both to memory-reuse info-leak and as a named precondition that can upgrade a
  device-model bug from DoS to host RCE.
- **A per-sandbox OIDC identity exists host-side** (`vercel-sandbox-oidc-token`, signed by
  `oidc.vercel.com`, claims `team_id`/`project_id`/`sandbox_id`). Whether the guest can retrieve an
  over-scoped copy is an open, high-value question.

---

## 4. Where the money actually is — prioritization

Ranked by **expected value for a strong generalist** (reward ceiling × tractability-in-2-weeks ×
inverse-competition). This is the core strategic call.

| Rank | Track | In-scope tier | Ceiling | Tractability | Why this rank |
|------|-------|---------------|---------|--------------|---------------|
| **1** | **Egress-firewall / brokered-credential defeat** | (d) | $50k | **Medium** | Logic/parser-differential + config abuse, no microVM crossing. The React2Shell skill set. "Retrieve brokered credentials" is a logic-shaped crown jewel. **Primary track.** |
| **2** | **Guest-agent / control-plane (vsock, tar, port-router, OIDC, FUSE)** | (a)/(b)/(d) | $50k | Medium | The richest *custom* code (not hardened Firecracker). Confused-deputy / IDOR / traversal shapes a generalist can find. **Secondary track.** |
| **3** | **Cross-tenant DoS via shared-host exhaustion** | (c) | tier-priced | Medium | Far lower bar than escape — resource/scheduler starvation, noisy-neighbor crash. Needs co-residency proof on *your own* two tenants. **Hedge.** |
| 4 | **Cross-tenant reachability (east-west net, snapshot residue, IDOR)** | (b) | $50k | Low–Med | Depends on Vercel's tap/bridge isolation config; high payoff if east-west isn't isolated. |
| 5 | **Firecracker microVM → EC2 host escape (virtio/KVM)** | (a) | $50k | **Low** | Elite VMM-specialist territory; known CVEs likely patched; needs an *original* virtio-MMIO/KVM bug. **Long shot — don't lead here as a generalist.** |

**Strategic call:** commit to **Track 1 (firewall/egress + brokered creds)** as the primary, keep
**Track 2 (guest-agent recon)** running in parallel because its recon is cheap and its bug shapes are
generalist-reachable, and hold **Track 3 (cross-tenant DoS)** as a hedge. Treat Track 5 as
out-of-band unless you already are a Firecracker/KVM internals specialist.

**React2Shell lessons baked into this ranking:**
- The winning bug shape was **parser/grammar un-equivalence** (the WAF parsed a request one way, the
  backend another) — a **logic/differential** class, not memory corruption. The sandbox analog is the
  **SNI/TLS-handshake differential + allowlist-matching + credential-broker transform** surface.
- **Speed is decisive** — ~15 unique bypasses landed within 24 hours; the first valid timestamp per
  root cause wins the dedupe.
- **They patch under you** (~20 WAF updates in ~48h) — which is *why* static-only earns nothing and why
  you file the moment a live break works.
- **Depth beats breadth** — the original discoverer kept mining one surface and produced the most
  sophisticated bypasses. Pick one narrow surface and own it.

---

## 5. Attack-surface map (research directions, by tier)

> These are **research directions and hypotheses** — where to look and why a weakness *might* exist —
> at strategy altitude. Turning any of them into a working PoC is the researcher's job and **must be
> done in-scope, on your own tenants, coordinated with Vercel**. No operational exploit steps are
> recorded here, by design.

### 5.1 Network / egress firewall — **PRIMARY (tier d)**

The master observation: the firewall checks the **SNI string** (domain policy) and the **destination
IP** (CIDR policy) as **two independent checks**, and *retains the guest-chosen original destination*
rather than re-resolving the SNI and pinning the socket to it. SNI is a client-controlled string
**decoupled** from where the packets actually go. Research directions:

- **SNI ↔ destination-IP decoupling** — present an *allowed* SNI on a connection whose TCP destination
  is an attacker-controlled public IP (not in the default deny-CIDR set). *Master exfil primitive; and
  against a brokered domain, the path to credential theft.* `[likelihood: medium · effort: low]`
- **Credential-broker desync** — if the broker keys secret injection on the SNI/Host string while
  forwarding to the guest-chosen destination, the injected secret can be steered to an attacker sink.
  Also probe open-redirect/SSRF on the brokered API, HTTP/1.1 smuggling, and HTTP/2 second-`:authority`
  to slip past the header-overwrite logic. *Top network-tier prize.* `[likelihood: medium · effort: medium]`
- **DNS-tunnel egress in deny-all/custom** — DNS carries no SNI, so the domain allowlist can't apply
  to it at L7. If the resolver still answers arbitrary attacker-zone queries, that's a bidirectional
  covert channel (the exact class BeyondTrust/Unit42 used to break AWS Bedrock AgentCore). `[likelihood: high · effort: low]`
- **No-SNI / non-TLS-on-443 fail-open** — ClientHello with the SNI extension omitted, a resumption
  ClientHello, or plain bytes on 443: does the peek fail *open* or *closed*? `[likelihood: medium · effort: low]`
- **ClientHello / TLS-record fragmentation** — split the ClientHello so the SNI extension straddles a
  TCP-segment or TLS-record boundary; a peek that doesn't fully reassemble misses the real hostname.
  `[likelihood: medium · effort: high]`
- **DoH / DoT through an allowlisted resolver** — if any allowed domain answers `/dns-query`, arbitrary
  resolution + exfil rides inside an allowed SNI. `[likelihood: medium · effort: low]`
- **ECH / domain fronting on a shared CDN** (especially any allowlisted `*.vercel.app`) — front to your
  own property co-located on the same frontend; with ECH the true SNI is encrypted. `[likelihood: medium · effort: medium]`
- **Allowlist matcher normalization** — trailing dot, case, embedded null, separators, IDN/punycode,
  suffix/substring bugs (`openai.com` also matching `openai.com.attacker.com`). `[likelihood: low · effort: medium]`
- **Connection-reuse Host/`:authority` swap** on an allowed shared frontend — SNI checked once at
  handshake, then keep-alive/HTTP-2 requests carry a different Host. `[likelihood: medium · effort: medium]`
- **IPv6 / IPv4-mapped / NAT64 gap to link-local metadata** — `169.254.0.0/16` is blocked in IPv4, but
  the "IPv6 equivalents" may be incomplete (`::ffff:169.254.169.254`, `64:ff9b::a9fe:a9fe`). Reaching
  MMDS → brokered creds; reaching the *host* IMDS → host IAM role = host/cross-tenant. `[likelihood: low · effort: medium]`
- **Internal-range reachability** — the documented deny list omits **`100.64.0.0/10`** (CGNAT, common
  for internal AWS/Firecracker meshes) and Vercel's own service subnets. Reaching the broker/Hive
  control plane escalates toward cross-tenant. `[likelihood: medium · effort: medium]`
- **OIDC/brokered-token harvest** — read `VERCEL_OIDC_TOKEN`-style material from env/metadata/proxy
  path; decode `aud`/`scope`; a token valid beyond this sandbox is the finding. `[likelihood: medium · effort: low]`

### 5.2 Guest-agent / control-plane — **SECONDARY (a/b/d)**

The PID-1 Go agent and its vsock transport are the softest *custom* code. Directions:

- **vsock peer-auth / loopback hijack** — if the agent authenticates the controller only implicitly
  ("only the host can reach this port"), and in-guest processes can reach the listener (loopback vsock,
  or via sudo), unprivileged code could drive privileged operations. `[likelihood: medium · effort: high]`
- **Guest→host vsock service enumeration** — brokers on CID 2 (credential/OIDC, log sink, port
  registrar, snapshot uploader). Any that identify the caller by a **request-embedded `sandbox_id`**
  rather than the connection origin are confused-deputy candidates → cross-tenant. `[likelihood: medium · effort: high]`
- **Agent tar-extraction path traversal** — `fs/write` uploads a tar.gz extracted guest-side; test
  `../`, absolute-path, and symlink-then-write entries. `[likelihood: low · effort: medium]`
- **Public port-router cross-tenant collision** — exposed ports map to a public subdomain
  (`<name>-<port>.vercel.run` in the mock). Weak team/project disambiguation or a guessable random
  component = inbound traffic crossing tenants. `[likelihood: low · effort: medium]`
- **FUSE / Drives mount-broker credential exposure** — if a mount helper authenticates to object
  storage with in-guest-recoverable creds, or drive IDs are cross-tenant addressable. `[likelihood: low · effort: medium]`
- **Snapshot-restored stale config** — `/tmp/vercel/interactive/config.json`-style leftovers and tokens
  that outlive their session after stop/resume/fork. `[likelihood: low · effort: medium]`

### 5.3 Cross-tenant reachability & DoS — **HEDGE (b/c)**

- **Co-residency detection** (enabler, no direct payout) — cluster *your own* sandboxes onto one host
  via host fingerprints (DMI, host MAC/OUI, `boot_id`, TSC skew, socket topology) + an LLC covert
  channel. Required precondition for any targeted cross-tenant claim. `[likelihood: high · effort: medium]`
- **East-west network reach** — Firecracker leaves networking to the operator; if neighbor tap devices
  share an L2 bridge without per-tenant ebtables/iptables, ARP-scan + direct IP reaches a neighbor's
  open ports. The SNI egress firewall never sees this traffic. `[likelihood: medium · effort: medium]`
- **Shared-host resource exhaustion** (cross-tenant DoS) — memory-bandwidth/LLC saturation, host OOM
  under overcommit, NVMe IOPS, PID/fd tables, shared NIC. Demonstrate against your own second tenant.
  `[likelihood: medium · effort: medium]`
- **Snapshot / uninitialized-memory reuse** — a fresh sandbox observing residual bytes from a prior
  tenant in the same memory slot / snapshot lineage; shared entropy across snapshot-cloned VMs.
  `[likelihood: medium · effort: high]`
- **Predictable identifiers → control-plane IDOR** — guessable sandbox IDs / vsock CIDs / exec-build
  tokens not tenant-scoped server-side → attach/exec/read/stream another tenant's sandbox. `[likelihood: medium · effort: medium]`

### 5.4 Firecracker microVM → EC2 host — **SPECIALIST LONG SHOT (a)**

Honest framing: **the known CVEs are almost certainly dead against Vercel's build**, so the only real
path is an *original* bug. Directions (specialist-only):

- **Decisive first check:** `lspci` for virtio-PCI. **CVE-2026-5747** (virtio-PCI queue-config OOB
  write) needs the opt-in `--enable-pci` **and** an unpatched version (≤1.14.3 / 1.15.0). Firecracker's
  **default is virtio-MMIO**, which the fix era already hardened — so PCI is probably absent and the
  flagship CVE probably N/A. One command settles it.
- **Fuzz the default virtio-MMIO device model** for a *new* queue/descriptor bounds desync in the
  userspace Rust virtio path (net/block/vsock/balloon/rng). A memory-safety failure corrupts the VMM =
  host escape. `[likelihood: low–medium · effort: very-high]`
- **KVM emulator surface** (instruction/MMIO/PIO/MSR/CPUID) — a host-kernel panic reached from guest
  ring-0 = **cross-tenant DoS** (lower bar than RCE); a code-exec bug = full escape. `[likelihood: low–medium · effort: high]`
- **Host-side brokers in the guest netns** (firewall/DNS proxy, MMDS, credential broker) — softer host
  code that parses guest input; a parser bug there is a shorter path than the VMM device model, and
  cleanly maps to tier (d) or (a). `[likelihood: medium · effort: medium]`
- **Dead ends to rule out fast:** CVE-2026-1386 (jailer symlink) needs a pre-existing host foothold —
  not reachable from a guest. Januscape/Zapscape KVM shadow-MMU bugs only fire under **nested virt**,
  which Firecracker doesn't expose by default (check `/dev/kvm` + VMX/SVM CPUID and move on).

---

## 6. Methodology — the research loop

**Phase 0 — Setup (Day 0).** Accounts, SDK, first boot, the two-tenant scaffold, the iterate harness
(see §7). Confirm your starting position: `whoami` → `vercel-sandbox`, cwd `/vercel/sandbox`, sudo works.

**Phase 1 — Recon (Day 1, ~first hour then deeper).** Enumerate the live environment read-only (full
checklist in Appendix A). Goal: decide *which surfaces are even live* before spending effort —
transport (MMIO vs PCI), device inventory, the guest-agent binary + its sockets, the trust-store CA,
the effective network policy and deny-list gaps, what credentials the VM already holds, and whether
snapshots are in play.

**Phase 2 — Hypothesis (Day 1–2).** From recon, pick the **single narrowest surface** with the best
EV (per §4 this is almost certainly the firewall/egress path). Write down the specific invariant you
believe the boundary relies on and the exact way it might not hold.

**Phase 3 — Controlled PoC (Day 2 onward).** Build the smallest script that makes the boundary
*actually break* on a live sandbox — a real connection to a denied host, a canary exfil, a printed
brokered credential, or a neighbor crash. **Attacker and victim are always your own tenants.** Capture
`sandboxId`s, UTC timestamps, and terminal recordings *as you go* so a hit is report-ready instantly.

**Phase 4 — Report + iterate (the moment a live break works).** File a minimal-but-valid report to
claim the root-cause dedupe slot (§8), then add escalation as comments. Stay reachable for the whole
triage window — a class can be patched within hours.

---

## 7. Environment & tooling setup

**Accounts & payment.** Vercel account + HackerOne account in good standing. On H1, open the Vercel
Sandbox challenge page, **read the policy/scope/bounty table in full, accept the terms**, and confirm
your profile can receive payment (tax/KYC) *before* you find anything.

**Plan.** Hobby is enough to start (Sandbox is free within quota — ~5 hrs active CPU/month, up to
4 vCPU). **Pro** ($20/mo credit, then ~$0.128/hr active CPU, up to 8 vCPU) buys iteration headroom and
concurrency for parallel fuzzing/repro. Enterprise (32 vCPU) isn't needed for PoC work.

**Install.** `npm i -g vercel`, then in a fresh project `npm init -y && npm i @vercel/sandbox`
(Node 22+ locally to match the runtime images). Authenticate for local SDK use: `vercel link` then
`vercel env pull` (or set the OIDC/token env the SDK expects).

**Smoke test the loop:**

```ts
import { Sandbox } from '@vercel/sandbox';
const s = await Sandbox.create({ runtime: 'node24', timeout: 60_000 });
const r = await s.runCommand('whoami');
console.log(await r.stdout());   // → vercel-sandbox
await s.stop();
```

**Firewall/egress test rig (primary target).** Create sandboxes with a restrictive `networkPolicy` /
allowed-domain set (CLI: `sandbox create --allowed-domain <domain>`; SDK: pass `networkPolicy`).
Verify deny-by-default, then probe the boundary systematically per §5.1.

**Two-tenant scaffold (cross-tenant/DoS).** Two of *your own* Vercel accounts/orgs, each booting a
sandbox, so "attacker" and "victim" are provably distinct tenants you own. Never point a PoC at a
sandbox you don't own.

**Iterate-a-PoC harness.** A Node/TS script that (1) boots N sandboxes in parallel, (2) `writeFiles`
the candidate probe, (3) `runCommand` and captures stdout/stderr/exitCode, (4) logs `sandboxId` + UTC
timestamp + pass/fail, (5) **always `stop()`s in a `finally`** to cap spend. Parameterize the payload
to sweep variants (SNI strings, domains, ports, mounts) unattended and grep for the one that crosses
the boundary. *This same script becomes the reproduction harness in the report.*

**Spend & scope hygiene.** Watch active-CPU quota (kill idle sandboxes), and keep every probe pointed
at your own sandboxes and Vercel's boundary — not AWS internals or third-party allowlisted domains.

---

## 8. Report-writing playbook — how to actually get paid

- **One report, one root cause.** Bundling makes triage pick the lowest impact and dupe the rest;
  fragmenting a single root cause across reports still pays once. Isolate the true root cause, file
  once.
- **Lead with impact, mapped to their tier.** Title = impact + boundary crossed (e.g. *"Egress SNI
  allowlist bypass → reach arbitrary denied destination + exfiltrate canary from restricted
  sandbox"*). First paragraph names which of the four in-scope classes you hit and the maximum
  data/authority you *demonstrated*. Triage assigns the bounty off this.
- **Structure predictably:** (1) Summary, (2) Impact & affected tier, (3) Preconditions (fewer =
  higher severity; state them honestly), (4) Step-by-step repro with the exact `@vercel/sandbox`
  script, (5) Live PoC evidence, (6) Root-cause analysis, (7) Suggested remediation, (8) CVSS
  rationale.
- **Demonstrate, don't assert.** Impact is the maximum you *show working*, not what you argue is
  possible. Complete the connection, exfil the canary, print the credential, crash your own neighbor.
- **Ship a runnable harness** the triager can paste and run in one shot, with expected vs actual
  output. First-try reproducibility is same-day validation vs a back-and-forth a competitor can win.
- **Attach unambiguous evidence:** short screen recording, terminal logs, `sandboxId`(s), UTC
  timestamps, and (for cross-tenant) **the two distinct tenant identifiers proving separate tenants
  you own**. Note success rate if probabilistic.
- **Nail the root cause, not the symptom** — the exact code path / config-logic flaw and why the
  boundary breaks. That earns the top of the range and can't be dismissed as a fluke.
- **Submit fast, then iterate.** The dedupe anchor is your first valid timestamp. File a minimal valid
  PoC early to claim the root cause; add escalation as comments. Don't polish prose while someone else
  files the same root cause.
- **Right-size CVSS and stay responsive.** Don't inflate (erodes trust) or lowball (anchors payout
  low). Answer clarifications immediately for the whole triage window.
- **Disclosure-clean:** no public writeups until Vercel fixes and green-lights. Bank the bounty + CVE
  credit first.

---

## 9. Two-week timeline

| When | Focus |
|------|-------|
| **Day 0** | Accounts + KYC, SDK install, smoke test, two-tenant scaffold, iterate harness. Read the full H1 policy. |
| **Day 1** | Full read-only recon (Appendix A) across a few fresh sandboxes + all three network modes. Decide live surfaces. Lock the primary surface (firewall/egress). |
| **Day 2–4** | Mine the firewall/egress + credential-broker surface hard (§5.1). **File the instant** any live boundary break works — claim the dedupe slot. |
| **Day 5–7** | Second surface in parallel: guest-agent / control-plane recon (§5.2) — vsock endpoints, trust-store CA, OIDC/metadata, tar path, port router. |
| **Day 8–10** | Hedge: cross-tenant DoS via own two tenants (§5.3) if co-residency is demonstrable. Escalate/deepen any filed report. |
| **Day 11–13** | Harden reports (repro harness, evidence), respond to triage same-day, add escalations as comments. |
| **Day 14** | Final sweep; ensure everything filed is reproducible on Vercel's current build; stay reachable through the post-close triage window (~1 month). |

> The pool can drain before Day 14. **Front-load** the primary surface and file early.

---

## 10. Honest ROI & go / no-go

- **Modal outcome for a generalist is $0.** Plan against that baseline; treat any single paid report as
  upside, not expected income.
- **Payout is concentrated.** React2Shell: 116 researchers, only 20 unique paid techniques, one team
  took $170k of the $1M, and most obvious surface was gone in a day. Expect well-funded, tooling-
  augmented specialists to blanket the surface within days.
- **Who wins the crown jewels:** the $50k microVM-escape / cross-tenant-compute bounties go to genuine
  VMM/hypervisor specialists. A generalist swinging at VM escape has a **low** probability of payout.
- **Where a generalist has edge:** the **egress-firewall tier (d)** — in scope, no microVM crossing,
  logic/parser-differential/config-abuse, and "retrieve brokered credentials" is a logic-shaped crown
  jewel. Cross-tenant DoS (c) is the next most tractable.
- **Time cost:** to be competitive you're committing roughly the **full two weeks**; a few evenings
  will be dominated.

**Go / no-go decision:**

- **Go** only if you can go effectively **full-time** for the window **and** you'll concentrate ~100%
  on the firewall/egress tier (+ guest-agent recon), hunting a **novel** root cause, filing the instant
  a live break works.
- **No-go** if you can only spare evenings, or you'd spread across all four tiers shallowly, or your
  plan is to replay public Firecracker CVEs.

---

## Appendix A — First-hour recon checklist (safe, read-only)

Standard read-only environment enumeration — reconnaissance only, no boundary crossing. Run across a
few fresh sandboxes (and in each network mode) to separate live surfaces from dead ones.

**OS / image / kernel**
- `cat /etc/os-release` · `uname -a` · `cat /proc/version` · `cat /proc/cmdline`

**Guest-agent (PID 1)**
- `readlink /proc/1/exe` · `tr '\0' '\n' </proc/1/cmdline` · `tr '\0' '\n' </proc/1/environ`
- `ls -la /proc/1/{cwd,root,fd}` · `file`/`strings` on the agent binary

**Processes / sockets / devices**
- `ps auxww` · `pstree -ap` · `ss -tulpanx` · `ss --vsock -a` · `cat /proc/net/vsock`
- `ls -la /dev` (note `/dev/vsock`, `/dev/vhost-*`, `/dev/mem`, `/dev/vd*`, `/dev/hvc*`, `/dev/vport*`)
- `ls -la /sys/bus/virtio/devices` · `lspci -nnvvv` (virtio-PCI present? → transport decision)

**Transport / VMM fingerprint** *(decides which escape CVEs even apply)*
- `lspci -nn` vs `/proc/cmdline` for `virtio_mmio.device=` · `dmesg | grep -iE 'firecracker|virtio'`
- `cat /proc/iomem` · `cat /proc/ioports` · `cat /sys/class/dmi/id/*`
- CPUID leaf `0x40000000` (expect `KVMKVMKVM`) · `grep -E 'vmx|svm' /proc/cpuinfo` · `ls -l /dev/kvm`

**Mounts / platform tree**
- `cat /proc/mounts` · `findmnt` · `ls -laR /vercel /tmp/vercel /opt/vercel 2>/dev/null` (FUSE/9p/virtiofs?)

**Trust store / MITM CA** *(confirms credential-brokering TLS termination)*
- `ls -la /etc/ssl/certs /usr/local/share/ca-certificates /etc/pki/ca-trust/source/anchors 2>/dev/null`
- `openssl x509 -text` on any Vercel/sandbox CA

**Secrets / identity the VM already holds**
- `env | grep -Ei 'VERCEL|OIDC|TOKEN|AWS|SECRET'` · decode any JWT `aud`/`scope`
- `/run/secrets`, `/run/credentials`, `~/.vercel` · `AWS_CONTAINER_CREDENTIALS_*`

**Network posture / firewall enforcement point**
- `ip -o addr` · `ip route` · `ip neigh` · `cat /etc/resolv.conf`
- `iptables -S` / `nft list ruleset 2>/dev/null` (confirm *no* in-guest rules → enforcement is host-side)
- Compare an allowed vs denied domain with `curl -v` (RST vs timeout vs TLS-alert = fail-open/closed & where)
- Map deny-list gaps read-only: `100.64.0.0/10`, `::ffff:169.254.169.254`, `64:ff9b::a9fe:a9fe`
- Metadata surface: `curl http://169.254.169.254/` (IMDSv1/IMDSv2), the default-gateway IP

**Privilege / feasibility**
- `find / -perm -4000 -o -perm -2000 2>/dev/null` · `getcap -r / 2>/dev/null` · `sudo -l`
- `cat /proc/self/status` (`CapEff`) · `capsh --print`
- `cat /proc/sys/kernel/modules_disabled` · `cat /sys/kernel/security/lockdown`

**Snapshot / co-residency signals**
- Compare `boot_id`, early entropy, RTC-vs-uptime skew, warm caches across several fresh sandboxes
- Host fingerprint per sandbox (`dmidecode`, host MAC/OUI, TSC skew) to cluster onto one host

---

## Appendix B — Sources

- [$1 million hacker challenge for Vercel Sandbox — Vercel](https://vercel.com/blog/one-million-dollar-hacker-challenge-for-vercel-sandbox)
- [Our $1 million hacker challenge for React2Shell — Vercel](https://vercel.com/blog/our-million-dollar-hacker-challenge-for-react2shell)
- [A sandbox without a network boundary is only half a sandbox — Vercel](https://vercel.com/blog/a-sandbox-without-a-network-boundary-is-only-half-a-sandbox)
- [Vercel Sandbox docs](https://vercel.com/docs/sandbox) · [Concepts](https://vercel.com/docs/sandbox/concepts) · [Firewall](https://vercel.com/docs/sandbox/concepts/firewall) · [System specifications](https://vercel.com/docs/sandbox/system-specifications) · [JS SDK reference](https://vercel.com/docs/sandbox/sdk-reference)
- [`@vercel/sandbox` on npm](https://www.npmjs.com/package/@vercel/sandbox) · [`vercel/sandbox` on GitHub](https://github.com/vercel/sandbox)
- [Vercel Platform Protection — HackerOne](https://hackerone.com/vercel_platform_protection)
- Firecracker security advisories: [GHSA-776c-mpj7-jm3r (CVE-2026-5747)](https://github.com/firecracker-microvm/firecracker/security/advisories/GHSA-776c-mpj7-jm3r) · [AWS bulletin CVE-2026-1386](https://aws.amazon.com/security/security-bulletins/2026-003-AWS)
- Prior art on sandbox egress bypass: BeyondTrust / Unit 42 AWS Bedrock AgentCore DNS-egress research (Mar 2026); Phoenix DDR5 Rowhammer (ETH Zürich, 2025) — *background context only; do not test third-party infrastructure.*

> Re-verify all program specifics (window, pool, per-report cap, exact scope wording) against the live
> HackerOne policy and Vercel blog before acting — those pages are authoritative; this document is a
> compiled summary.
