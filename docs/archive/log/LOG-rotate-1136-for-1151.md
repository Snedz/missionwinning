## 2026-10-15 — Weekly plan uses the desktop width (`.1136`)

`/coach` on a desktop was a narrow card beside a second room list. The icon rail is already the sidebar, so the second list repeated Start, This week, History, and Weekly plan, and the transferred canvas hid the page title. The plan column was `max-w-2xl`, and the one sheet card sat in a two-column grid, so the session filled about a third of the window.

Weekly plan no longer mounts that second bar. The canvas title is Mission Coach. Content sits in the centered pad, `min(1120px, 100% - 48px)`, which is the same cap the other desktop rooms use. The boss session is one column and fills that pad. Show all is two columns from 900px. The house week strip names each day — Rest, Lift, Condition, Mobility, Done, Missed — instead of a glyph or a bare dash. Swap is centered on its row. Fuel drops the extra `max-w-3xl` so it fills the same pad.

**Measured:** at 1280 the coach card is 1120px, the same width as the pad, with no second rail. The first lift name and the Swap button share a vertical center. Past empty days read Rest. Mobile 390 keeps the pad at the content width with no horizontal overflow on Today, Train, Coach, Library, or Fuel.

`[skip vercel]`. PRIVATE_MODE stays.
