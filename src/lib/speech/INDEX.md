# src/lib/speech/

On-device coach ear. Speech is presentation of words the rest of the app already has. Audio is never posted to us.

| File | Purpose |
|------|---------|
| `speak.ts` | `speechSynthesis` renderer — $0, offline, gesture-gated on iOS |
| `speakableLines.ts` | Debrief, chat-reply, and Train cue strings |
| `listen.ts` | Browser SpeechRecognition → transcript. No upload |
| `coachVoiceSession.ts` | Live talk access, phase machine, `#coach-live` href |

UI: `src/components/coach/CoachLiveVoice.tsx` (signed-in loop) · `src/components/speech/ActiveTrainCues.tsx` (Train Cue me, overflow).

Do not import this folder from `/active` logger files (`firstSetUngated.test.ts`).
