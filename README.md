# PINBALL FORGE

A browser construction set inspired by Bill Budge's Apple II workbench: table on the left, parts box on the right, and direct manipulation with a mouse or touch. The faithful workbench now includes Phase 2 artwork and animation. Later roadmap phases remain separate approval gates.

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

Phase 3 uses motion-driven flipper contacts, fixed simulation substeps, outward bumper/slingshot impulses, and contact-based scoring. Each fresh ball launches once; pressing Space during play does not kick it again. Pause/Resume preserves the ball; switching away from the window or hiding the page pauses automatically. Restart clears the score and restores three balls. Touch flipper buttons support independent held inputs. Placing a ball relocates the single starting ball; advanced components and multiball remain future work.

This is an arcade pinball model, with bounded ball speed for collision stability. It does not simulate cabinet tilt, coil forces or full electromechanical pinball. See [Phase 3 design and acceptance](docs/PHASE3.md). The standalone player will reuse this runtime in Phase 4.

## Save and open

**Save** stores one project in this browser on this device. **Open** offers that save or a file picker. **Project ↓** downloads an editable `.pinball.json` file. Imported projects are validated before replacing the table. Use files for durable copies and transfer between devices; browser storage is origin/device-specific and may be cleared.

Project files include their image and animation bytes. Browser saves use IndexedDB; older localStorage saves remain readable and are not deleted. Project files are not standalone games. HTML5 ZIP export and independent/offline player verification remain Phase 4.

## Artwork and animation

1. Choose **Artwork +**. Import PNG, JPG, WebP, or GIF files; alternatively drop files onto the playfield.
2. Drag an artwork tile onto the table, or click it to place it and then move it with Hand. Three original animated parts are included: warning beacon, energy field, and spacecraft.
3. Select the artwork and choose **Adjust**. Set width, height, rotation, opacity, and layer. **Fit artwork to playfield** makes a background. Front overlays can cover the ball; the default layer keeps components and the ball visible above artwork.
4. Artwork starts as **Decoration only**. Choose **Physical obstacle** or **Interactive target** for collision; targets default to 100 points. The dashed rectangle shows the collision boundary, including transparent pixels. Image outlines are not traced automatically.
5. GIF and animated WebP play natively where the browser supports them. For sprite sheets, expand **Sprite sheet / animation**, enter columns, rows, frame count and speed, then apply. Frames run left to right, top to bottom. **Import frame sequence** combines several images in file-picker order.
6. **Table → Appearance** switches between Classic (default) and Polished. Polished adds metallic flippers, chrome balls, lit bumpers, surface shading and hit particles. The construction layout stays familiar.
7. Save, reopen, and use **Project ↓** to transfer the complete editable table with its artwork. Try [Star Workshop](examples/star-workshop.pinball.json) through Open → Choose project file.

Native GIF/WebP timing is controlled by the browser; frame-specific gameplay synchronization uses sprite sheets or frame sequences. Large assets can exhaust browser memory/storage. No image files are uploaded to a service. Imported images retain their original bytes; storage errors are reported without discarding the editing table.

## Review

See [the Phase 3 playtest](docs/phase3-playtest.jpg), [the Phase 2 workbench](docs/phase2-workbench.jpg), [the Classic workbench](docs/faithful-workbench.jpg), [interaction decisions](docs/FAITHFUL-WORKBENCH.md), and [test evidence](TESTING.md).
