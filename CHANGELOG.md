# Changelog

## Catcher, pinball sounds and mouse flippers — 2026-11-02

- The three-ball catcher releases all three balls below its base with no ejection impulse. Gravity makes them fall. Replacement balls after the first two captures still cost no lives.
- Added pass-through contact sensing for green and legacy lights; rollover and bumper contacts now select distinct synthesized bell or solenoid sounds. Existing scoring and imported audio remain intact. Sound honors pause, mute and exit, and gameplay gestures can resume browser audio.
- Left/right mouse buttons operate the corresponding flippers on the playfield, including simultaneous holds and releases outside the board. Keyboard and touch remain independent. The same controls and sounds work in exported games.
- Verification: 156 tests across 13 files, production build, actual Chromium mouse/touch/keyboard controls and audio output in editor and standalone ZIP. See `docs/GAMEPLAY-FIXES.md`.

## Wall point editing — 2026-10-31

- Corrected the existing Move and Stretch (arrow) controls: point handles take precedence over whole-part motion, and Stretch projects new points onto the selected segment without shifting its outline. Connected endpoints follow the selected joint; all other joints stay fixed.
- Added explicit optional joint identifiers for stretched interior walls, including coincident but separate points. Legacy tables remain valid without migration. Duplicated segments keep independent connections.
- Restored the reference Box choice using the existing polygon/point architecture as a detached hollow wall loop. Its four corners and inserted points reshape independently, with matching solid edge collisions and an open interior.
- Active points have a visible highlight; geometry and picture clipping update during dragging. Existing undo/redo, saves and standalone export retain the edits.
- 130 tests and build passed. Browser checks cover mouse/touch dragging, zigzags, independent boxes, boundary isolation, save/open, undo/redo and exported gameplay. See `docs/wall-editing-check.json` and `docs/wall-editing-tablet.png`.

## Reference playfield proportions — 2026-10-27

- New tables now use 616 × 768 world units, matching the reference's 308 × 384 playfield and the existing component sprite scale. Refined the stepped outline, bottom border and open drain.
- Editor drawing, touch coordinates, collisions, drains, area paint, imported pictures/artwork and exported games share the table's dimensions. Corrected the standalone player's fixed CSS aspect ratio.
- Older saved projects and sample tables retain their 560 × 840 geometry. No forced conversion or rearrangement of existing parts.
- Preserved the header, tool/color column and headboard design. No dependencies, servers or network settings changed.

## Annotated pieces and tools — 2026-10-27

- Added the nine newly identified reference choices: two flashing rebound walls, three-ball trap, black hole, spinner and four one-way gates. The palette now contains 42 identified pieces.
- The trap serves replacements without losing lives after captures one and two; capture three releases all three balls. Black holes drain a ball. The spinner turns top-to-bottom and scores crossings. Gate directions work independently for each ball.
- Applied the user's annotated tool instructions: arrow reshapes edges/corners; scissors split barriers; hammer removes pieces; brush paints attached walls and bounded surface areas. Mouse cursors show the selected tool. Undo restores edits.
- Added Gravity and Save controls using the existing table dialog and browser storage. Gravity and area colors persist in editable projects and standalone games. Existing projects keep the original gravity.
- Header, headboard, color controls and column styling remain intact. Tool functions/icons were changed only as specified by the latest annotation. No server, network or dependency changes.
- Unidentified square/controls remain unassigned; pixel editing is deferred as requested. Reference board proportions are still narrower than the original, and physical-tablet verification remains outstanding.

## Reference artwork and confirmed behaviors — 2026-10-27

- Replaced the remaining substitute icons with 33 identified pieces using the supplied GIF's artwork and arrangement. Shared outlines keep flippers, targets, slingshots and bumpers aligned with collision geometry.
- Added the user-confirmed upward spring, two-way sideways spring, starting plunger, and nine bottom-row rollover lights. Rollovers award the adjustable score on entry without blocking the ball.
- Removed the generic drain/diamond palette choices and unrelated animated spacecraft, energy field and beacon generators. User artwork imports and older saved-table rendering remain available.
- Corrected new guide rails to white, their reference orientations, and placement near the table edge. Refined the empty green perimeter.
- Preserved the header, right tools/color column and headboard. No server/network changes or dependency installations.
- Outstanding: functions of square/rails/U/ring/equals/arrows, playfield aspect ratio, and physical-tablet confirmation. This is not a complete visual reproduction.

## Reference palette cleanup — 2026-10-27

- Reduced the main palette from 31 to 19 choices: removed generic blocks/wedges/posts, duplicate color variants, the scoring-zone token, and placeholder drop-target/spinner buttons.
- Removed the Advanced parts tray, its sample injection button, and unused drag handlers/styles. Rules, missions, audio, and saved-table compatibility remain.
- No physics, server, network, header, tool/color-column, or headboard changes in this cleanup.

## Tablet parts-box follow-up (2026-10-26)

- Added eight compact wall, post, wedge, bumper, and light choices to the construction palette; the tablet palette now has five columns.
- Made a piece follow the pointer during placement and highlighted the table when it is a valid drop destination. A tap on a part followed by a tap on the table remains available.
- Kept the established header, pop-in menus, and far-right tool/color column in place.

## Modern graphics and two-picture layout (2026-10-26)

- Moved the editor headboard preview to the left and expanded the right parts box to five columns, while preserving the locked header, colors and pop-in menus.
- Added separate native file controls for a playfield background and a headboard sign, with fit/remove options; pictures save in projects and ship in standalone ZIPs.
- Added original nebula and headboard examples plus a transparent chrome component atlas. Polished walls, obstacles, launcher and drain use matching metallic rendering.
- Reduced new bumper presets while preserving the dimensions of previously saved tables. The table scales to fit the editor's screen height; the standalone game keeps its headboard on the right.
- Checked actual editor imports and an independent exported game through example.test. No web server or network configuration changed.

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


## Phase 5 follow-up — bumper bounce variation (2026-10-26)

- User confirmed the sound is good and reported repeating bounces between the lower slingshots.
- Added up to two degrees of scatter to powered bumper/slingshot impulses, retaining impulse magnitude and incoming tangential motion. Passive walls and flipper behavior are unchanged.
- Scatter advances only on powered contacts and resets with Restart, preserving fixed-timestep replay and editor/export consistency.
- 84 tests and production build pass. Updated the two local Phase 5 QA ZIPs and standalone player folders from the existing editable examples.
