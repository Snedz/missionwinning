## 2026-10-14 — Coach speaks through Groq, then any compatible host, then OpenRouter free (`.1134`)

The trainer, the session line, daily insight, chat, debrief, and plan voice called Gemini Flash whenever `GEMINI_API_KEY` was set. That free tier trains on prompts. Those prompts are workout and readiness text.

`providerClient` is one OpenAI-compatible chat client. Groq is the default (`GROQ_API_KEY`, `openai/gpt-oss-20b`). `COACH_LLM_API_URL` plus its key is any other compatible host. OpenRouter is the fallback and the model id is forced to end in `:free`. A Gemini host or a `gemini` model id is dropped before the request. Keys are read from the environment only.

Android Coach does not hold a key. Ask trainer posts the open exercise to `POST /api/coach/trainer`, which is the same chain. A direct seat list that includes Gemini is not called.

`[skip vercel]`. No tip-promote. Live www stays `.697`. PRIVATE_MODE stays. paymentUrl stays ''.

Label `2026.07-unified.1134`.

Rotated LOG oldest → [docs/archive/log/LOG-rotate-1111-for-1134.md](docs/archive/log/LOG-rotate-1111-for-1134.md) (`.1111`).
