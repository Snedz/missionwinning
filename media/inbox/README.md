# media/inbox/

Drop **raw** Google Flow / Grok Imagine exports here. Do not commit large binaries.

## Naming

| Kind | Example |
|------|---------|
| Learn still/frame | `learn-human-performance-frame.png` |
| Social still/frame | `social-invite-frame.png` |
| Social video | `social-invite-raw.mp4` (optional; keep local) |
| Mascot (Scout) | `mascot-scout-idle-frame.png` · `mascot-scout-invite-frame.png` · `mascot-scout-celebrate-frame.png` |

## Optimize

```bash
npm run media:optimize-inbox
```

Writes WebP to `public/learn/` or `public/social/` per filename prefix. See [docs/MEDIA_SYSTEM.md](../docs/MEDIA_SYSTEM.md).
