## 2026-10-12 — Plate loader nearest weight (`.1127`)

The plate loader was already on Train, buried in the session menu, and it only ever loaded downward with an unlimited rack. A target the plates cannot make now shows the nearest loadable weight. `nearestBarLoad` takes the target, the bar, and pairs per side. Ten cases cover an exact 100 kg and 225 lb, a 101 kg miss, a load that is closer over the target, a target under the bar, an empty rack, a 35 lb bar, a one-pair ceiling, and an equal-distance tie that stays lighter.

The bar stays the saved 20 kg / 45 lb preference. The rack starts as a normal set (several large plates, one pair of each change plate) and can be edited on this device (`mw_plate_inventory`). **Plates** sits next to the live set weight and opens the same loader. The sheet loads when it opens so the rack editor is not on Train’s first paint. Log set is not gated. No account.

Label `2026.07-unified.1127`.

`[skip vercel]`. No tip-promote. Live www stays `.697`. PRIVATE_MODE stays.

Rotated LOG oldest → [docs/archive/log/LOG-rotate-1108-for-1127.md](docs/archive/log/LOG-rotate-1108-for-1127.md) (`.1108`).
