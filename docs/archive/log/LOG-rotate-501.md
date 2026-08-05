## 2026-08-05 — Rest final Skip fill + hide presets (`.486`)

Extends outdoor rest final-seconds craft: in the last 10s Skip becomes a **filled accent** control (label stays "Skip" for `/^skip$/i` e2e), and phone preset chips hide so one bright thumb target remains. Pure `shouldShowRestPresets` gates the strip.

Mutants: show presets at 5s remaining → chrome fights Skip; Skip stays outline at 5s → outdoor miss.
