# Capability world

WIT-style **allowlists**. No ambient authority.

This folder does not invent a second capability bus. Existing Mission OS doors stay where they are ([`src/lib/mission-os/`](../src/lib/mission-os/INDEX.md), [`docs/contracts/MODULE.md`](../docs/contracts/MODULE.md)). GALAXY tickets only **name grants**. They do not mount minis and they do not unpark ClearShot.

---

## Rule

A grant the ticket did not list is denied. An empty `capabilityAllowlist` is the default. Unknown grant name = deny. Leftover extras on a document do not grow the list.

There is no host-wide `*` and no implied `paymentUrl` / `checkout`.

## Closed grant names (this slice)

GALAXY tickets may list **only** these strings. Anything else is refuse in `validate.mjs`.

| Grant | Points at | This slice |
|-------|-----------|------------|
| `identity.read` | Mission OS `identity` door, method `read` | Allowed to name |
| `storage.read` | Mission OS `storage` door, method `get` | Allowed to name |
| `storage.write` | Mission OS `storage` door, method `set` / `remove` | Allowed to name |

Not in this slice (do not name, do not invent a URL for):

- `billing.read` / `checkout` / `portal` / `paymentUrl`
- `photos.read` / `photos.write`
- ClearShot / `utility.clearshot` / `mission://minis/clearshot`

Billing and photos already have host-lifecycle envelopes in Mission OS. This paper does not reopen them and does not add a ninth deny code.

## Stores vs doors

| Store | May hold grants | May call host doors |
|-------|-----------------|---------------------|
| `directory` | Yes, from the closed list | Paper only — no runtime in this ship |
| `quarantine` | Must be `[]` | No |
| `archive` | Must be `[]` — no poison restore of grants | No |

Unknown submitter ⇒ `store: quarantine` ⇒ empty allowlist. Presume breach.

## Rebuild (anti-Samson)

1. Quarantine the actor’s live tickets.
2. Set `capabilityAllowlist` to `[]`.
3. Re-issue only closed grants, one by one, after a Judge distinct from the Builder.
4. Archive a Blue Book case. `UNKNOWN` is allowed.
5. Leave the host up (`infiniteLife`).

Do not Samson-rebuild. Do not unpark ClearShot to “get capability back.”

## Refuse

- No ambient `host.*`
- No `paymentUrl` / `checkout`
- No ClearShot unpark
- No grant invented because a fixture needed it
