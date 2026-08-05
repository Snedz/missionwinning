## 2026-08-05 — Log console set ordinal interpolation (`.483`)

`activeSetOf` locale is `Set {{current}} of {{total}}`, but LogConsole passed `n: setNumber`. Once the pack loaded, the ordinal showed the literal `{{current}}` (defaultValue only applies when the key is missing). Pure `activeSetOfParams` + source guard so the keys cannot drift again.

Mutants: pass `n:` again → guard red; change en template to `{{n}}` without console → guard red.

