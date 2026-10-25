# Testing

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

Later gates: imported image/animation tests, standalone ZIP generation, independent exported-game and offline tests, broad browser/device coverage, and detailed physics tuning. Do not describe these as complete.
