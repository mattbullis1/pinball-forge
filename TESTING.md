# Testing

## Phase 2 verification — 2026-10-25

`npm test`: **29 tests passed** in three files. `npm run build`: TypeScript and Vite production build passed. Added tests cover embedded image preservation, role validation, external/missing asset rejection, opacity/dimension/frame validation, frame timing, sequence-versus-sheet cropping, rotated artwork geometry, and decoration/obstacle/target physics. Existing construction and physics checks still pass.

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

`npm test`: **21 tests passed** across model.test.ts and construction.test.ts.

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

`npm run build`: TypeScript check and production build passed. These tests do not establish full pinball realism or universal high-speed collision stability.

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

Later gates: standalone ZIP generation, independent exported-game and offline tests, broad browser/device coverage, large-asset stress tests, and detailed physics tuning. Do not describe these as complete.
