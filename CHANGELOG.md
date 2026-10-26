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

## 0.4.0 — Playable physics refinement (2026-10-25)

- Retained Matter.js and shared project geometry; added an internal 120 Hz accumulator with four fixed collision substeps per tick and bounded ball speed.
- Replaced scripted flipper kicks with contact response from the actual pivot motion. Convex components now avoid artificial triangle seams.
- Added outward bumper/slingshot reactions, per-contact scoring, and chatter suppression.
- Limited launching to a fresh ball; unified restart, pause, game-over and three-ball rules in the reusable runtime.
- Added Pause/Resume and automatic pause on focus loss, plus independent keyboard/touch input sources.
- Verified 51 automated checks, four 30-second simulation runs, real browser scoring/drain/restart/pause workflows and byte-identical animated-project preservation.
- Recorded simulation CPU measurements and browser diagnostics. Physical tablet, Firefox/Safari, arbitrary extreme layouts and standalone player verification remain future checks.
- No dependencies added, no deployment, and no web server or example.test configuration changes.

## 0.5.0 — Standalone HTML5 export (2026-10-26)

- Added DOWNLOAD MY PINBALL GAME with ZIP progress, artwork checking, failure feedback and a retry download link.
- Added standalone title/Play, score, balls, touch/keyboard controls, pause/restart, game-over and fullscreen screens.
- Bundled the same Matter.js physics, renderer, artwork layers, rules and synthesized sounds used by Test.
- Preserved original image bytes, GIF/WebP playback, sprite sheets and sequences with relative asset paths.
- Included runtime licenses and hosting instructions in each ZIP; editor builds include dependency notices.
- Verified 65 tests, build, four standalone packages, the user's finalized browser download, Chrome tablet/narrow layouts and animation evidence.
- Direct file:// was blocked by test tooling; physically disconnected Internet and physical tablet tests remain unverified.
- Added isolated local web server export QA files without changing server/network settings or existing sites. Phase 5 remains gated.


## 0.6.0 — Phase 5 optional workshop (2026-10-26)

- Added eight optional parts, multiball lifecycle, flat animated ramp boosts, moving obstacles, drop targets, magnets and spinners.
- Added contact rules, activation/deactivation, extra balls, timed bonuses, combos, missions, flashing lights and spark effects.
- Added local audio import, music loops and custom sound actions with shared pause/mute/restart behavior.
- Preserved audio bytes, optional rules and settings through projects and standalone ZIPs.
- Kept the Classic palette unchanged; new controls open through Advanced +.
- Added Workshop and Rule Circuit examples, 16 regression tests, and browser/export evidence. 81 tests and build pass.
