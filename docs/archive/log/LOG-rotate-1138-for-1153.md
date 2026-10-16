## 2026-10-15 — Meta tests match the Groq seat (`.1138`)

`build-and-test` was red on four meta checks that master already carried. The trainer surface test still required `gemini-2.5-flash` inside `sessionTrainerServer.ts`. That file calls `resolveCoachProviders`: Groq when `GROQ_API_KEY` is set, else `COACH_LLM_*`, else OpenRouter `:free`. Gemini free-tier hosts are never called. The test now locks that seat and still refuses a checkout, a bundle, and Muse. The card assertions are unchanged.

`LOG-rotate-1111-for-1131.md` through `1136` were the same bytes as `LOG-rotate-1111-for-1130.md`, so `.1111` had seven `##` headings and the index named only the 1130 file. The copies now point at that file. The heading stays once. The filenames stay in the index.

Meta tests were the first red step, so `i18n:coverage` and the hero e2e never ran. Once they passed, `dataSafety` and `contact` in `AppLegalFooter` had no English pack entry. Those two strings now sit next to About in the bootstrap pack. The cap stays 0. The homepage e2e still asked for Archivo and an in-page Log set demo. The cookie homepage is Geist, one link to `/welcome`, and the logger shot. SEO templates stay on Archivo.

`[skip vercel]`. PRIVATE_MODE stays.

Label `2026.07-unified.1138`.

Rotated LOG oldest → [docs/archive/log/LOG-rotate-1116-for-1138.md](docs/archive/log/LOG-rotate-1116-for-1138.md) (`.1116`). Live floor is `.1117`.
