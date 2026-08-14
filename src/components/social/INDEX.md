# src/components/social/

> One concern: Mission Server messenger chrome — buddy list, chat window, presence. Not a feed, not DMs, not Discord.com.

## Files

| File | Role |
|------|------|
| `BuddyList.tsx` | Rooms + last-line preview + self presence |
| `ChatWindow.tsx` | Ink title bar, messages, compose, quiet nudge |
| `MessageList.tsx` | Display name · Mission ID · body · local clock |
| `MessageComposer.tsx` | Text + Send (one red field) |
| `PresenceControl.tsx` | available / away / offline |

Page: `src/page-components/ServerPage.tsx` (`/server`). Logic: `src/lib/social/`. Freeze: [docs/MISSION_SERVER_MESSENGER_PLAN.md](../../../docs/MISSION_SERVER_MESSENGER_PLAN.md).
