## 2026-10-12 — Safety flags withhold train-now guidance (`.1128`)

Pregnancy, a high assessment, and a pain or injury flag used to change almost nothing an athlete could see. The pregnancy flag swapped one sentence on the hard-session sheet. `getCoachInsight` said “you’re primed to train” and pointed at `/active`. Today’s Just Go hero, Coach “Start this session”, the adapt banner’s “Just Go — log one set”, assessment “tap to start”, and a comeback nudge’s “Start now” never read the flag. A pain-history yes was not even in the PAR-Q count, so it stayed low risk and still offered a starter.

`safetyTrainGuidance` is the one decision. Pregnancy, assessment high, and pain withhold the recommendation and reuse the existing stop line or the high-risk sentence, with the action on Move. Today shows that sentence once, then Try recovery flow. The client hook has a render test so the coverage file count stays on the floor. A moderate screen or a hard-session name softens: the path stays, the label is no longer “Start” / “Just Go”, and the note is the existing caveat. Log set still starts. The week planner still does not read the pregnancy flag. Nudges withhold only when the caller already has the flag — it is not synced.

**Mutants killed:** primed insight under `pregnancyFlag: 'pregnant'`; moderate risk still `coachActionStartWorkout`; pain still `/active`; hard session still “Start workout”; Just Go hero still “Ready to train”; “Just go train” kept on a knee-pain reply; comeback body still “Start now”; withhold CTA `startsWorkout: true` on a recommendation; logger CTA `startsWorkout: false`.

`[skip vercel]`. No tip-promote. Live www stays `.697`. PRIVATE_MODE stays.

Label `2026.07-unified.1128`. Master already shipped `.1127` for the plate loader, so this ship is `.1128`.

Rotated LOG oldest → [docs/archive/log/LOG-rotate-1109-for-1128.md](docs/archive/log/LOG-rotate-1109-for-1128.md) (`.1109`).
