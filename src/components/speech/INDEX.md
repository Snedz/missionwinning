# src/components/speech/

On-device coach ear. Isolated from Train first-paint (`@/lib/speech` stays off `/active` logger files).

| File | Purpose |
|------|---------|
| `ActiveTrainCues.tsx` | Cue me + rest-end / set-progress speak. Label stays visible at 390 |

Renderer: `src/lib/speech/speak.ts`. Cue strings: `src/lib/speech/speakableLines.ts`. Listen: `src/lib/speech/listen.ts`. Live loop: `src/lib/speech/coachVoiceSession.ts` + `CoachLiveVoice`.
