# media/inbox/

Drop **raw** Google Flow / Grok Imagine exports here. Do not commit large binaries.

## Grok Imagine first session

Paste-ready prompts + exact filenames: **[media/GROK_IMAGINE_PROMPTS.md](../GROK_IMAGINE_PROMPTS.md)**.  
Studio: [grok.com/imagine](https://grok.com/imagine).

## Naming

| Kind | Example |
|------|---------|
| Learn still/frame | `learn-human-performance-frame.png` |
| Social still/frame | `social-invite-square-frame.png` · `social-coach-story-frame.png` |
| Social video | `social-invite-raw.mp4` (optional; keep local — do not commit multi-MB) |
| Mascot (Kalligator) | `mascot-kalligator-idle-frame.png` · `mascot-kalligator-invite-frame.png` · `mascot-kalligator-celebrate-frame.png` |
| Form Index poster | `form-{exerciseId}-side-frame.png` → `public/form/{id}/side.webp` |
| Form Index front | `form-{exerciseId}-front-frame.png` → `public/form/{id}/front.webp` |

## Optimize

```bash
npm run media:optimize-inbox
```

Writes WebP to `public/learn/`, `public/social/`, or `public/brand/mascot/` per filename prefix.  
See [docs/MEDIA_SYSTEM.md](../docs/MEDIA_SYSTEM.md).
