# Rotated from LOG.md when `.853` landed

## 2026-08-15 — Homepage JSON-LD is a graph, not an array (`.838`)

`/` stringified four schema objects as a JSON array. A parser then
called `r["@context"].toLowerCase` and threw.

**Ship:** `asJsonLdGraph`. One `@context` + `@graph`.

Label `.838` (onto master `.837`).

Excellence-Override: JSON-LD graph (surface; RESULT unscored)
