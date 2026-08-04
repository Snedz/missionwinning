## 2026-08-04 — ActiveSessionDock peel (`.440`)

Rest timer + compact LogConsole peels into `ActiveSessionDock`. Page mounts one dock; `resolveActiveDockMode` stays the mode SoT. Page ~686→660. Wiring guards: page mounts dock (no RestTimerBar/LogConsole inline); dock mounts both modes.

Mutants: re-inline ScreenDock+RestTimerBar/LogConsole on the page → wiring red; drop RestTimerBar from dock → wiring red.

