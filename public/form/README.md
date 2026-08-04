# Form Index media

Clinical movement demos for Train / library / public exercises.

| Path | Role |
|------|------|
| `{exerciseId}/side.webp` | Primary poster (library card + LCP) |
| `{exerciseId}/side.mp4` | Silent ~6s loop (480p); poster used as `poster` |
| `{exerciseId}/front.webp` | Optional second angle |
| `pattern-*/` | Shared pattern fallback (later) |

**Pipeline:** Imagine → `media/inbox/form-{id}-side-frame.png` → `npm run media:optimize-inbox` → wire id in `src/lib/formMedia.ts`.

**Playbook:** [docs/MEDIA_SYSTEM.md](../../docs/MEDIA_SYSTEM.md) · [media/GROK_IMAGINE_PROMPTS.md](../../media/GROK_IMAGINE_PROMPTS.md)

Do not embed third-party CrossFit or YouTube demos here. MW-owned assets only.
