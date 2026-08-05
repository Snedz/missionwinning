## 2026-08-04 — Form Index full loops + pattern stills (`.466`)

All 16 hero packs now have silent `side.mp4` loops. Seven pattern stills under `/form/pattern-{squat|hinge|push|pull|core|loco|isolation}/side.webp` become the long-tail Form Index default (beats stick SVG). `formPatternPath` prefers raster; legacy pattern SVG kept on disk.

Mutants: formPatternPath without raster set → svg; remove deadlift from VIDEO_IDS → still-only path.

