# PINBALL FORGE

A browser construction set inspired by Bill Budge's Apple II workbench: table on the left, parts box on the right, and direct manipulation with a mouse or touch. This is the approved faithful-workbench preview, not a completed implementation of every roadmap phase.

## Run on development machine

From this directory run `npm install`, then `npm run dev`. The preview is served at `private-preview` while Vite is running. The explicit alternative is `node node_modules/vite/bin/vite.js --host 0.0.0.0 --port 5173 --strictPort`.

`npm run build` creates relative-path static files in `dist/`. `npm test` runs the construction and physics tests. web server and its existing sites remain unchanged; this update has not been deployed. Publishing requires separate approval.

## Build a table

1. Drag a component from the parts box, or click/tap it and then its destination.
2. **Hand** moves objects. **Adjust** opens color, position, rotation, supported sizing, and points.
3. **Move corner** selects a wall or obstacle and reveals square handles. Drag them to reshape it. Connected outer-wall edges follow.
4. **Add corner** inserts a corner on an edge and switches to Move corner. **Remove corner** connects its neighbors. The drain ends and the last three obstacle corners are protected.
5. Choose a color swatch and click a part, wall, empty playfield, or exterior. Painting changes appearance while retaining collision behavior. Lights are nonphysical decoration.
6. Snap provides a ten-unit grid and alignment to nearby component centers. Turn it off for free placement.
7. Undo/Redo operate on whole actions. A complete drag is one action. Invalid polygons show red feedback and retain the last valid position. Escape cancels a drag.
8. **Table** opens naming, surface/exterior colors, and three sample tables. New and sample loading can be undone.

Shortcuts: H Hand; V Move corner; A Add corner; X Remove corner; P Paint. Ctrl/Cmd+Z undo; Shift+Ctrl/Cmd+Z or Ctrl/Cmd+Y redo. Delete removes selected interior parts. Use Remove corner for the outer boundary.

## Playtest

**Test** replaces the parts box with the scoreboard. Left/Right Shift operate flippers; Space launches. Touch controls are provided. Scoring parts have default points, synthesized sound, and a brief hit flash. Test uses a cloned table, a fixed 120 Hz simulation, and shared renderer/physics geometry. **Back to Build** preserves editing data. Restart starts another three-ball game.

Physics is still a prototype awaiting Phase 3 refinement. Advanced components and multiball remain future work. Placing a ball currently relocates the single starting ball.

## Save and open

**Save** stores one project in this browser on this device. **Open** offers that save or a file picker. **Project ↓** downloads an editable `.pinball.json` file. Imported projects are validated before replacing the table. Use files for durable copies and transfer between devices; browser storage is origin/device-specific and may be cleared.

Project files are not standalone games. HTML5 ZIP export is planned for Phase 4. Custom artwork, GIF/WebP/sprite animation, IndexedDB asset storage, and exported-game publishing are not implemented yet.

## Review

See [the actual workbench](docs/faithful-workbench.jpg), [interaction decisions](docs/FAITHFUL-WORKBENCH.md), and [test evidence](TESTING.md).
