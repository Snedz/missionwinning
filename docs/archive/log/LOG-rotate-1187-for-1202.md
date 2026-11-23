## 2026-10-21 — nutrition log: the retention window follows the day being merged (`.1187`)

The 90-day prune ran against `new Date()`, so `mergeTodayIntoNutritionLog`'s `today` argument
was a lie for any merge that was not today: a log merged for a day in the past lost rows
that were still inside its own window. The window is now anchored on the day being merged,
the same day the caller names, and the test no longer has to pin the clock to stop a July
fixture ageing out. Two regression tests lock it: the days before the merged day survive
however long ago they were, and rows older than the window before the merged day are still
pruned. Label `2026.07-unified.1186`. `[skip vercel]`. PRIVATE_MODE stays.