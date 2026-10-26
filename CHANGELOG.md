# Changelog

## 0.1.0 — Phase 1 preview

- Added isolated TypeScript/Vite project and Git repository.
- Added Canvas editor, component palette, wall endpoint editing, table themes, properties, Undo/Redo, local saving, three sample tables, and initial Matter.js Test mode.
- Reworked the editor around the original construction set's playfield-and-parts-tray arrangement and cyan, magenta, white, and black visual language.
- Rebuilt the construction screen as a two-panel workbench with original drawn part icons, quick paint swatches, and a hidden Paint / Tune drawer.
- Added a connected, mouse-adjustable playfield perimeter that changes the visible table shape and collision walls.

## 0.2.0 — Faithful workbench revision (2026-10-25)

- Implemented accepted table/parts-box/tool-strip design with original green/purple procedural graphics.
- Added Hand, Move corner, Add corner, Remove corner, and Paint tools.
- Added solid polygons, concave collisions, shared renderer/physics geometry, and invalid-shape feedback.
- Added 20 working presets, mirrored slingshots, supported resizing, alignment, pointer drag/drop, and tap placement.
- Made whole drags atomic in undo/redo; protected perimeter connectivity and drain endpoints.
- Added side scoreboard, Back to Build, restart, default hit sound/flash, and fixed 120 Hz stepping; all placed flippers respond.
- Added browser-save/file-open choices and stronger project validation.
- Verified 21 tests, production build, and browser workflows. Exported data stayed byte-identical across Test.
- Preserved web server/example.test configuration. No deployment performed.
- Later phases, including standalone ZIP and imported animation, remain pending.

## 0.3.0 — Artwork and animation (2026-10-25)

- Added PNG/JPG/WebP/GIF imports, file dropping, artwork placement, scaling, rotation, opacity, layers, and decoration/obstacle/target roles.
- Added native GIF/WebP animation, sprite grids and image sequences, with three original animated parts.
- Added optional polished materials, chrome pinballs, illuminated bumpers and capped hit particles; Classic remains the default.
- Migrated new browser saves to IndexedDB while retaining legacy-save reading. Project downloads embed image data.
- Added asset validation, decode-before-load checks, import totals/errors, and rectangle collision guides.
- Fixed compound-contact duplicate scoring and frame-sequence cropping; added regression tests.
- Added opt-in performance measurements and a self-contained Star Workshop editing example.
- Standalone ZIP, advanced rules and full physics refinement remain later phases.
