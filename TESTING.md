# Testing

## Catcher, audio and mouse flippers — 2026-11-02

156 tests across 13 files and the production build pass. Chromium verified independent mouse buttons, simultaneous holds, outside release, keyboard/touch coexistence and focus recovery in editor and standalone export. Browser audio output, mute and unmute passed for lights, rollovers and bumpers. Desktop/tablet-width screenshots were inspected. See [the focused report](docs/GAMEPLAY-FIXES.md) for modified files, evidence and physical-device limitations.

## Wall point editing — 2026-10-31

- `npm.cmd test -- --run`: 130 passing tests across 12 files. Twelve new wall regressions exercise insertion, fixed neighboring points, separate/overlapping joints, independent rectangular loops, rotated/scaled edits, legacy compatibility, save/undo history, hollow-box collisions and rebound at an edited joint.
- `npm.cmd run build`: passes type checking and production bundling. Existing large-bundle warning remains.
- `node .qa/wall-editing-check.cjs`: passes against the restored `the local test environment` preview using an isolated Chromium context. Mouse and emulated touch drags, live canvas updates, active-point highlight, detached box shaping, a three-point zigzag, outer boundary isolation, JSON and browser save/open, undo/redo, and exported ZIP playback all pass with no page errors.
- Rendered screenshots reviewed at desktop and 800-pixel tablet width: `docs/wall-editing-desktop.png`, `docs/wall-editing-tablet.png`; exported player: `docs/wall-editing-player.png`. Machine-readable result: `docs/wall-editing-check.json`. Physical-tablet verification remains outstanding for this repair.
- Header, headboard, tool/color column layout and all unrelated parts retain the approved design. Existing arrow and hand control slots now describe Stretch and Move; the reference Box fills its original palette position.

## Playfield proportion correction — 2026-10-27

118 unit/physics tests pass and the production build passes. Added regression checks for both coordinate spaces, imports, paint bounds, walls, wider-table ball positions and drain height. Browser touch placement put all 42 reference choices at their requested coordinates. Tools, undo, save/open, JSON and playable ZIP export pass with no runtime errors.

Actual rendered editor and player were compared with the supplied reference. Desktop (1280px), tablet-sized (800px) and narrow (390px) layouts preserve the 308:384 ratio without horizontal overflow. Exported-game checks cover both canvas dimensions and displayed aspect ratio, catching the previous CSS stretching. Legacy and reference projects round-trip unchanged; legacy projects retain their original canvas size.

Reference pictures, artwork placement near the expanded right edge, and Fit artwork to playfield were exercised in the browser. The final green/black region comparison agrees on 99.81% of sampled pixels after the stated corner exclusion; this is not an overall visual-fidelity score. Sixty local background-render samples averaged 9.28 ms (p95 12.5 ms). Background rendering runs during edits/startup, not during each gameplay frame.

Evidence: docs/proportions-comparison.png, docs/proportions-1280.png, docs/proportions-800.png, docs/proportions-390.png, docs/proportions-player.png and the proportions-check / proportions-tools-check / proportions-visual-check JSON reports. The comparison omits no board pixels visually; its numerical region check excludes the unidentified 32 × 24 top-left symbol and measures green/black membership rather than exact image equality.

Physical-device touch input is still unverified. Unidentified controls remain unassigned, and pixel editing remains deferred. Minor edge differences and the absent unidentified corner symbol prevent a claim of exact reproduction.

## Annotated parts and editor tools — 2026-10-27

114 unit/physics tests pass; production build passes. Tests cover all three trap captures and replacement lives, rotated traps, multiball gates from opposite directions, black-hole drains, spinner motion, rebound flash, combo mission points, barrier splitting, edge shaping, connected paint, gravity and data validation.

Browser checks at the local test environment placed all 42 choices using touch input and verified undo/redo, identical editing data after Test, project import/export and an exported player opened from disk. Additional tool workflows verify scissors, edge dragging, hammer/undo, connected-wall paint, separate colors in enclosed surface regions, gravity persistence, toolbar Save/Open, and painted regions in the standalone player. No browser errors. A 60-sample local browser measurement of the painted background averaged 6.26 ms, with p95 8 ms; it is not redrawn during play. The split-point assertion allows browser coordinate rounding; production coordinates are not rounded by the cutter.

Header, headboard and color-control markup match the earlier approved checkpoint. The new annotation explicitly authorizes the tool function/icon changes; column CSS is unchanged. Actual desktop and 800px tablet-layout screenshots were inspected: docs/annotated-reference-editor.png, docs/annotated-reference-parts.png, docs/annotated-reference-player.png, docs/annotated-tools-editor.png and docs/annotated-tools-tablet.png. Reports: docs/annotated-reference-check.json and docs/annotated-tools-check.json.

Remaining limitations: no physical tablet/device test; unknown square and two toolbar symbols unassigned; pixel editor deferred; board proportions still narrower than the reference. These results do not claim a complete visual reproduction.

## Reference pieces and confirmed mechanics — 2026-10-27

93 tests and production build pass. New physics checks cover upward-only spring contact, both horizontal spring faces, a served ball resting on the plunger until launch, and all nine bottom rollovers awarding once per crossing without bouncing.

Fresh Chromium with touch enabled at 1280 × 900 placed all 33 choices, undid/redid placement, preserved identical project data through playtesting and import/export, and played the exported ZIP from disk. No browser errors. Header, right tools and headboard markup match the approved Git checkpoint. Actual rendered editor and player were inspected. Evidence: docs/reference-check.json, docs/reference-editor.png, docs/reference-parts.png, docs/reference-player.png.

Remaining gaps: unidentified reference controls/parts, narrower playfield proportions, and physical tablet access. The screenshot is the pixel-reference pass, not a claim of full fidelity to the glossy rendition.


## Palette cleanup — 2026-10-27

88 tests and production build pass. A fresh Chromium touch context placed all 19 visible choices, verified undo/redo, and exported identical project data before and after playtesting. No browser errors. Checked header, right tools, and headboard markup against the prior Git checkpoint: unchanged. Rendered evidence: docs/cleanup-editor.png; report: docs/cleanup-check.json. Physical tablet access and complete screenshot fidelity remain unverified.

## Tablet parts-box follow-up — 2026-10-26

The added eight presets are validated at an interior placement point; short and angled wall endpoints are checked relative to the drop location. Desktop Chrome at an 800 × 1000 tablet-sized viewport placed a cyan bumper by dragging and a short wall by tapping its icon then tapping the table. A dedicated touch-event path with visible drag preview and table drop highlight was added after the user reported finger dragging failed. **Physical finger dragging on the user's tablet still needs user verification.**

## Modern picture and scale pass — 2026-10-26

`npm.cmd test`: **86 tests passed** in nine files. `npm.cmd run build`: TypeScript and Vite passed. New checks validate two independent picture references and fit modes, reject broken references, verify their exact bytes in the ZIP, and verify the polished component atlas in standalone output. `scripts/modern-qa.mjs` generated an independent **9-file, 7,864,492-byte** ZIP with **28 parts and two uploaded picture assets**; its CRC/inventory check passed.

In the actual Chrome editor in the local test environment, uploaded the sample table and headboard PNGs through their visible native file inputs, observed each preview and enabled fit/remove controls, then selected Polished appearance. The resulting screenshot is `docs/modern-editor-actual.png`: headboard left, full table, five-column palette right, locked top and right tools intact. An independently served package in the local test environment loaded the same pictures and modern parts with the headboard right; screenshot `docs/modern-game-actual.png`.

The original photos supplied by the user were used as proportion references, not pixel-perfect copying. Direct `file://`, a separate tablet device, and Firefox/Safari remain unverified. The editor production bundle is 3.23 MB of JavaScript (2.24 MB gzip) because it embeds the atlas for client-side ZIP export; reducing this cost is a remaining performance improvement.

## Phase 4 verification — 2026-10-26

**65 tests pass** across seven files; TypeScript and Vite production build pass. Added ZIP CRC/inventory checks, exact original-image preservation, generated-path validation, escaping, three sample runtime-equivalence checks, actual player build/no-network-API checks, real artwork fixtures and editor-license packaging.

The browser-generated Classic ZIP was finalized by the user, found in Downloads, CRC-checked and tested independently through static web server. Four table packages were tested, including all supported image/animation formats, scoring, drains, game over, restart, pause and fullscreen. Chrome viewport tests covered tablet and narrow layouts. See [Phase 4 acceptance evidence](docs/PHASE4.md) for exact counts, screenshots, performance readings and limits.

Direct file:// opening was blocked by browser tooling and was not bypassed. No physical network-disconnection or separate-device test was performed. Automated bundle/resource checks establish no external runtime dependencies; independent local HTTP playback was verified.


## Phase 3 verification — 2026-10-25

**51 automated tests pass** across four files; TypeScript and Vite production build pass. Added 22 physics/input checks to the previous 29. The test suite covers:

- Equivalent elapsed-time outcomes at 30/60/120/144 Hz, invalid deltas and bounded stall recovery.
- Maximum-speed ball contacts against 4-unit walls at 0°, 25°, 65° and 90°, plus a scaled thin drain sensor.
- Left/right flipper strikes, held flippers remaining passive, rotated/scaled flippers, release and velocity bounds.
- Launch eligibility, rotated launcher direction, missing ball marker, three-ball game-over and complete restart state.
- Sensor exit/re-entry scoring, a target resting contact without score farming, and outward bumper/slingshot reactions.
- Independent keyboard/touch sources and pause/resume state preservation.
- Three samples plus a table with a sculpted boundary, moved bumper and resized flippers: **four 30-second simulations**, finite bounded motion and unchanged source tables.

### Browser verification

On the actual local development preview in the in-app Chromium browser:

- Played Classic Builder and animated Star Workshop; observed 100-point scoring, draining and the next ball waiting to launch.
- Confirmed ShiftLeft, ShiftRight and Space key events reach the game. Pointer Launch worked; launch disables during active play.
- Paused a moving ball, compared its complete diagnostic snapshot later, and found it unchanged; resumed through the button.
- Opened the dedicated drain-check fixture, observed all three balls drain to GAME OVER, then clicked Restart and verified three balls, zero score and ready state.
- Returned from Star Workshop Test and downloaded the editable project. SHA-256 exactly matched the original example: 31c023a48bf7d46749bf66a49653f5d34e9b625dd7d71190674c6e7711d9fad0. Artwork and all table data survived unchanged.
- Inspected 768×1024 layout: document width 768, touch button heights 44 pixels, no horizontal overflow. Reset the viewport afterward.
- Captured docs/phase3-playtest.jpg and docs/phase3-gameover.jpg. No browser warnings/errors were returned in the final log check. Browser saves were not overwritten during Phase 3 testing.

### Performance and practical limits

Run node tests/measure-physics.mjs to repeat the simulation-only CPU measurement. Results are saved in docs/phase3-performance.json. Each sample ran 1,800 display-frame calls (30 simulated seconds); p95 simulation time was 0.148 ms Classic Builder, 0.098 ms Star Cadet, and 0.045 ms Electric Avenue. This excludes rendering, asset decoding, audio and browser scheduling.

One mixed-playtest browser diagnostic window, ending on Star Workshop, measured 1.90 ms p95 simulation work per rendered frame, 0.90 ms p95 rendering and approximately 9 MB JS heap. It also recorded 82 pauses longer than 500 ms under browser automation/occlusion, so it does **not** establish a stable interactive frame rate. Heap excludes native image/GPU allocations. Physical tablet input, another network device, Firefox/Safari and large custom tables remain unverified.

This is an arcade model with fixed substeps and bounded speeds, not exact continuous collision detection or electromechanical pinball. The future standalone player must reuse physics.ts and its lifecycle rules; ZIP/export parity belongs to Phase 4. Network configuration and existing static web server sites are unchanged.

## Phase 2 verification — 2026-10-25

`npm.cmd test`: **29 tests passed** in three files. `npm.cmd run build`: TypeScript and Vite production build passed. Added tests cover embedded image preservation, role validation, external/missing asset rejection, opacity/dimension/frame validation, frame timing, sequence-versus-sheet cropping, rotated artwork geometry, and decoration/obstacle/target physics. Existing construction and physics checks still pass.

### Actual browser workflows

Executed through browser controls in the editor, in the in-app Chromium browser and Chrome:

- Imported 7 image files: 6 valid files processed and placed; 1 deliberately invalid GIF reported. Valid cases: transparent PNG, JPG, static WebP, animated GIF, animated WebP, and a PNG sprite sheet.
- Imported 4 more PNG files as one frame sequence: 4 processed, 1 animation placed.
- Placed 3 built-in animations. Combined result: **13 image assets, 10 artwork objects**, including 5 explicit sheet/sequence animations and 2 native animated images.
- Configured a four-frame sprite and changed its role to target; the default became 100 points.
- Verified width, rotation, front overlay, mouse dragging, whole-drag undo and redo. The spacecraft moved from (270,705) to (320,650); Undo restored its prior placement.
- Saved to IndexedDB, started New, reopened the browser save, and downloaded it again. Before/after SHA-256 matched: `af2a6af2f2168eeae892247f8c364d0b07dbe56e0850f449863c4a84744aa897`.
- Opened an independently arranged project file, `tests/fixtures/artwork-laboratory.pinball.json`, with all 13 assets decoding successfully. The previous legacy browser save was exported before testing and restored afterward; its localStorage copy was never deleted.
- Inspected real rendered output in both Classic and Polished. Checked 1024×768 and 768×1024 viewports, including the artwork drawer, with no horizontal document overflow. This does not substitute for physical tablet testing.
- Opened Star Workshop, entered Test, launched, returned to Build, and downloaded the project. Its SHA-256 matched the example exactly: `31c023a48bf7d46749bf66a49653f5d34e9b625dd7d71190674c6e7711d9fad0`. Final rendered screenshot: `docs/phase2-workbench.jpg`.

### Animation evidence and fixes

Two unmodified screenshots are saved as `docs/phase2-animation-a.jpg` and `docs/phase2-animation-b.jpg`. Image-region comparison found mean per-channel differences of 78.10 (GIF), 79.47 (animated WebP), 68.18 (sprite sheet), 57.45 (frame sequence), and 45.38 (energy effect), on the 0–255 scale. Visual inspection also confirmed the changing frames.

Browser inspection found that sequence images were incorrectly offset as if they were sheet cells. Corrected the cropping calculation and added a regression test. Collision scoring now deduplicates a part within a compound collision event.

### Measurements and limits

Chrome, artwork laboratory, polished appearance, 10 artwork objects: one 120-render sample measured **1.3 ms p95 render duration** and **27 MB JavaScript heap**. Active frame intervals measured 33 ms p95, excluding long automation/occlusion pauses. These figures are local observations, not a guaranteed frame rate. Diagnostics now report pauses over 500 ms separately; `?diagnostics` enables this local instrumentation. No runtime error was reported in that measured run. A later Chrome control connection timed out; subsequent example verification continued in the working in-app browser.

Production bundle at this checkpoint: approximately 142 kB JavaScript (47.4 kB gzip), 10.6 kB CSS (3.0 kB gzip), excluding imported project artwork. No new dependencies were installed. Heap readings exclude native decoded-image/GPU allocations. Large-asset stress testing, Firefox/Safari, physical tablets and a separate network device remain unverified. Native GIF/WebP playback is browser-controlled. Pixel-perfect collision tracing is not implemented; artwork uses its visible rectangular guide.

Standalone HTML5 ZIP and offline exported-game animation checks remain Phase 4. Phase 2 verifies portable **editing projects**, not standalone games.

## Automated checks — 2026-10-25

`npm.cmd test`: **21 tests passed** across model.test.ts and construction.test.ts.

- Independent samples and sensible defaults.
- Save/load round trips; rejection of malformed coordinates, radii, IDs, and polygons.
- Connected wall dragging, corner addition/movement/removal, drain-gap preservation.
- Whole-wall movement, rotated obstacle editing, crossed-shape rejection.
- Whole-drag undo transactions, redo, and independent history branches.
- Concave decomposition preserves area.
- Matter collisions at visible obstacle coordinates and edited wall endpoints.
- Configured scoring including zero, and hit feedback.
- Decorative lights remain nonphysical; three-ball drain/game-over lifecycle.
- Every placed flipper moves without mutating editor data.
- Each sample launch clears the shooter lane into the playfield.
- All three samples simulate 1,200 fixed steps with finite positions.

`npm.cmd run build`: TypeScript check and production build passed. These tests do not establish full pinball realism or universal high-speed collision stability.

## Browser checks — 2026-10-25

Executed in the editor using browser automation:

- Add an outer-wall corner, drag it, undo, redo, and remove it.
- Drag a solid obstacle from the palette, paint it orange, reshape a corner, change rotation and size.
- Click/tap a bumper and its destination.
- Enter Test, launch, inspect the scoreboard, and return to editing.
- Export before and after Test: identical SHA-256 hashes, `8B57CCA4929CA543B59A805CB25B5471C2E2992BE147DC0F560C3F0438A549F4`.
- Start New, import the downloaded file, Save, start New again, and Open the browser save. The edited table was restored.
- Desktop, 1024×768, and 768×1024 layout checks. No browser warnings/errors observed during this pass.
- Actual screenshot: docs/faithful-workbench.jpg.

These browser checks used the browser-control tool, not a committed Playwright regression suite. Physical tablet input and access from a separate network device remain unverified.

## Remaining gates


Remaining gates: broad browser/device coverage, physically disconnected-network and direct-file verification, large-asset stress tests, and device-specific physics tuning. Phase 4 ZIP and independent local HTTP evidence are recorded above.


## Phase 5 — 2026-10-26

81 tests / 9 files and production build pass. See [Phase 5 acceptance report](docs/PHASE5.md) for the automated coverage, actual browser workflows, matching Test/export results, measured performance, screenshots and limits. Two QA packages include two WAV files each. The 768px tablet-width preview had no horizontal overflow. Physical-device input, audible output quality and a committed UI regression suite remain outstanding.


## Bumper/slingshot bounce regression — 2026-10-26

84 tests / 9 files and production build pass. A zero-gravity two-bumper fixture previously stayed on the exact center line for an eight-second run (45 awards). With contact scatter it left a 40-unit corridor after 717 ms (4 awards). The fixture isolates symmetry; it does not claim to reproduce every possible user-built trap. Before/after measurements: `docs/bounce-scatter-check.json`.

New tests verify escape, identical outcomes at 30/60/120/144 Hz, a maximum two-degree powered-impulse deviation, preserved impulse magnitude, and restart/pause repeatability for bumpers and slingshots. Existing high-speed wall/flipper tests remain green. Passive resting pockets in table geometry are unaffected by this change; it is not a universal unstuck mechanism.

The user confirmed the sound is good on their device. Both local Phase 5 exported-game folders and their ZIPs were rebuilt using the same updated runtime; existing downloaded ZIPs require re-export to receive this fix.
