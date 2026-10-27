# Testing

## Modern picture and scale pass — 2026-10-26

`npm.cmd test`: **86 tests passed** in nine files. `npm.cmd run build`: TypeScript and Vite passed. New checks validate two independent picture references and fit modes, reject broken references, verify their exact bytes in the ZIP, and verify the polished component atlas in standalone output. `scripts/modern-qa.mjs` generated an independent **9-file, 7,864,492-byte** ZIP with **28 parts and two uploaded picture assets**; its CRC/inventory check passed.

In the actual Chrome editor at `private-preview`, uploaded the sample table and headboard PNGs through their visible native file inputs, observed each preview and enabled fit/remove controls, then selected Polished appearance. The resulting screenshot is `docs/modern-editor-actual.png`: headboard left, full table, five-column palette right, locked top and right tools intact. An independently served package at `private-preview` loaded the same pictures and modern parts with the headboard right; screenshot `docs/modern-game-actual.png`.

The original photos supplied by the user were used as proportion references, not pixel-perfect copying. Direct `file://`, a separate tablet device, and Firefox/Safari remain unverified. The editor production bundle is 3.23 MB of JavaScript (2.24 MB gzip) because it embeds the atlas for client-side ZIP export; reducing this cost is a remaining performance improvement.

## Phase 4 verification — 2026-10-26

**65 tests pass** across seven files; TypeScript and Vite production build pass. Added ZIP CRC/inventory checks, exact original-image preservation, generated-path validation, escaping, three sample runtime-equivalence checks, actual player build/no-network-API checks, real artwork fixtures and editor-license packaging.

The browser-generated Classic ZIP was finalized by the user, found in Downloads, CRC-checked and tested independently through web server. Four table packages were tested, including all supported image/animation formats, scoring, drains, game over, restart, pause and fullscreen. Chrome viewport tests covered tablet and narrow layouts. See [Phase 4 acceptance evidence](docs/PHASE4.md) for exact counts, screenshots, performance readings and limits.

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

On the actual example.test preview in the in-app Chromium browser:

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

This is an arcade model with fixed substeps and bounded speeds, not exact continuous collision detection or electromechanical pinball. The future standalone player must reuse physics.ts and its lifecycle rules; ZIP/export parity belongs to Phase 4. Network configuration and existing web server sites are unchanged.

## Phase 2 verification — 2026-10-25

`npm.cmd test`: **29 tests passed** in three files. `npm.cmd run build`: TypeScript and Vite production build passed. Added tests cover embedded image preservation, role validation, external/missing asset rejection, opacity/dimension/frame validation, frame timing, sequence-versus-sheet cropping, rotated artwork geometry, and decoration/obstacle/target physics. Existing construction and physics checks still pass.

### Actual browser workflows

Executed through browser controls on example.test, in the in-app Chromium browser and Chrome:

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

Executed on the actual example.test:5173 page using browser automation:

- Add an outer-wall corner, drag it, undo, redo, and remove it.
- Drag a solid obstacle from the palette, paint it orange, reshape a corner, change rotation and size.
- Click/tap a bumper and its destination.
- Enter Test, launch, inspect the scoreboard, and return to editing.
- Export before and after Test: identical SHA-256 hashes, `8B57CCA4929CA543B59A805CB25B5471C2E2992BE147DC0F560C3F0438A549F4`.
- Start New, import the downloaded file, Save, start New again, and Open the browser save. The edited table was restored.
- Desktop, 1024×768, and 768×1024 layout checks. No browser warnings/errors observed during this pass.
- Actual screenshot: docs/faithful-workbench.jpg.

These browser checks used the browser-control tool, not a committed Playwright regression suite. Physical tablet input and access from a separate network device remain unverified.

## Environment and remaining gates

Verified example.test resolved to development machine's private address. Existing web server AOV returned HTTP 200. No DNS, hosts, firewall, Apache, authentication, or network settings changed.

Remaining gates: broad browser/device coverage, physically disconnected-network and direct-file verification, large-asset stress tests, and device-specific physics tuning. Phase 4 ZIP and independent local HTTP evidence are recorded above.


## Phase 5 — 2026-10-26

81 tests / 9 files and production build pass. See [Phase 5 acceptance report](docs/PHASE5.md) for the automated coverage, actual browser workflows, matching Test/export results, measured performance, screenshots and limits. Two QA packages include two WAV files each. The 768px tablet-width preview had no horizontal overflow. Physical-device input, audible output quality and a committed UI regression suite remain outstanding.


## Bumper/slingshot bounce regression — 2026-10-26

84 tests / 9 files and production build pass. A zero-gravity two-bumper fixture previously stayed on the exact center line for an eight-second run (45 awards). With contact scatter it left a 40-unit corridor after 717 ms (4 awards). The fixture isolates symmetry; it does not claim to reproduce every possible user-built trap. Before/after measurements: `docs/bounce-scatter-check.json`.

New tests verify escape, identical outcomes at 30/60/120/144 Hz, a maximum two-degree powered-impulse deviation, preserved impulse magnitude, and restart/pause repeatability for bumpers and slingshots. Existing high-speed wall/flipper tests remain green. Passive resting pockets in table geometry are unaffected by this change; it is not a universal unstuck mechanism.

The user confirmed the sound is good on their device. Both local Phase 5 exported-game folders and their ZIPs were rebuilt using the same updated runtime; existing downloaded ZIPs require re-export to receive this fix.
