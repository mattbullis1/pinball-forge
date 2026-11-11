# PINBALL FORGE

**Alpha v0.7.0-alpha.1** — [open the live construction set](https://pinball.mattbullis.com/).

Build a table, choose **Test**, then use the left/right mouse buttons or Shift keys for the flippers and Space to launch. Touch controls are included. **Save** stores a project in this browser; **Project ↓** downloads an editable backup; **DOWNLOAD MY PINBALL GAME** creates a standalone playable ZIP.

This is an early release. Keep a project-file backup while experimenting. Browser saves belong to the device and website address where they were created; opening the public site does not transfer a table saved at another address. Import the downloaded project file to move it.

Latest fixes include independent wall points, Stretch insertion, editable Box walls, the three-ball catcher drop, and pinball sounds. See [alpha release notes](docs/ALPHA-RELEASE.md) and [asset/license information](LICENSES.md).

## Modern picture layout

The editor shows the headboard picture to the **left** of the playfield, leaving a wider five-column parts box on the right. The whole playfield scales to the available screen height. In Test and in the standalone game, the headboard is **right** of the playfield. The header/menu, far-right color tools, and pop-in menus retain their established layout.

Choose **Table picture** for a playfield background and **Headboard picture** for the sign. Each accepts a local PNG, JPG, WebP or GIF, has Crop to fill / Show whole picture and Remove controls, and saves with the editable project. No upload service is used. The picture goes in the standalone ZIP alongside the shared game runtime. The sample pictures are in [examples/artwork](examples/artwork); the complete editable sample is [Modern Space](examples/modern-space.pinball.json). Choose Table → Appearance → Polished for the original chrome and illuminated component set. Newly placed bumpers are smaller to leave space for customizing the table. Existing saved bumpers retain their dimensions.

See the [actual editor](docs/modern-editor-actual.png) and [standalone game](docs/modern-game-actual.png). The [layout proposal](docs/modern-graphics-proposal-v3.png) is a visual target; the actual screenshots show the implemented result.

A browser construction set inspired by Bill Budge's Apple II workbench: table on the left, parts box on the right, and direct manipulation with a mouse or touch. The faithful workbench includes artwork, animation, refined playtesting and standalone HTML5 ZIP export. Later roadmap phases remain separate approval gates.

## Development

Install the dependencies with `npm install`, then run `npm run dev`. On Windows PowerShell use `npm.cmd` instead of `npm`. Open the preview address printed by the development server.

For a custom development hostname, copy `.env.example` to the ignored `.env.local` file and set `PINBALL_DEV_ALLOWED_HOSTS`. Keep machine-specific settings out of version control.

`npm run build` creates static files in `dist/`; `npm test` runs the automated tests. The public alpha is at https://pinball.mattbullis.com/.

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

**Test** replaces the parts box with the scoreboard. Hold the left/right mouse buttons over the playfield, or Left/Right Shift, to operate the corresponding flippers; Space launches. Touch controls are provided. Bumpers make a solenoid thump and metallic ring; lights chime when crossed. Scoring parts retain their configured points. Test uses a cloned table, a fixed 120 Hz simulation, and shared renderer/physics geometry. **Back to Build** preserves editing data. Restart starts another three-ball game. After the third capture, the three-ball catcher releases the balls below it to fall under gravity.

Phase 3 uses motion-driven flipper contacts, fixed simulation substeps, outward bumper/slingshot impulses, and contact-based scoring. Each fresh ball launches once; pressing Space during play does not kick it again. Pause/Resume preserves the ball; switching away from the window or hiding the page pauses automatically. Restart clears the score and restores three balls. Touch flipper buttons support independent held inputs. Placing a ball relocates the single starting ball; optional multiball gates add two active balls during a turn.

This is an arcade pinball model, with bounded ball speed for collision stability. It does not simulate cabinet tilt, coil forces or full electromechanical pinball. See [Phase 3 design and acceptance](docs/PHASE3.md). The standalone player reuses this exact runtime.

## Save and open

**Save** stores one project in this browser on this device. **Open** offers that save or a file picker. **Project ↓** downloads an editable `.pinball.json` file. Imported projects are validated before replacing the table. Use files for durable copies and transfer between devices; browser storage is origin/device-specific and may be cleared.

Project files include their image, animation and audio bytes. Browser saves use IndexedDB; older localStorage saves remain readable and are not deleted. Project files are editable documents. Use DOWNLOAD MY PINBALL GAME to package a standalone player.

## Artwork and animation

1. Choose **Artwork +**. Import PNG, JPG, WebP, or GIF files; alternatively drop files onto the playfield.
2. Drag an artwork tile onto the table, or click it to place it and then move it with Hand. Three original animated parts are included: warning beacon, energy field, and spacecraft.
3. Select the artwork and choose **Adjust**. Set width, height, rotation, opacity, and layer. **Fit artwork to playfield** makes a background. Front overlays can cover the ball; the default layer keeps components and the ball visible above artwork.
4. Artwork starts as **Decoration only**. Choose **Physical obstacle** or **Interactive target** for collision; targets default to 100 points. The dashed rectangle shows the collision boundary, including transparent pixels. Image outlines are not traced automatically.
5. GIF and animated WebP play natively where the browser supports them. For sprite sheets, expand **Sprite sheet / animation**, enter columns, rows, frame count and speed, then apply. Frames run left to right, top to bottom. **Import frame sequence** combines several images in file-picker order.
6. **Table → Appearance** switches between Classic (default) and Polished. Polished adds metallic flippers, chrome balls, lit bumpers, surface shading and hit particles. The construction layout stays familiar.
7. Save, reopen, and use **Project ↓** to transfer the complete editable table with its artwork. Try [Star Workshop](examples/star-workshop.pinball.json) through Open → Choose project file.

Native GIF/WebP timing is controlled by the browser; frame-specific gameplay synchronization uses sprite sheets or frame sequences. Large assets can exhaust browser memory/storage. No image files are uploaded to a service. Imported images retain their original bytes; storage errors are reported without discarding the editing table.

## Export and publish a game

1. Choose **DOWNLOAD MY PINBALL GAME**. The editor checks artwork and builds the ZIP in your browser. No files are uploaded.
2. Finish the browser download. If it is held for review, inspect your browser Downloads panel. **Save ZIP again** retries the completed archive without rebuilding it.
3. Extract the entire ZIP into its own folder. Keep all files and the assets directory together.
4. Serve that folder through any ordinary static web server and open index.html. All paths are relative; no editor, CDN or API is needed. Direct file opening may work, but file:// was blocked by our test tooling and is not verified.
5. Choose Play. Use Shift keys or the touch buttons, Space/Launch, Pause, Restart and Fullscreen.
6. To publish on hosting you control, upload all extracted contents into one directory, preserving filenames. Keep LICENSES.txt and any notices required by imported artwork. The construction set itself is available at the public alpha link above.

The ZIP includes images, animation settings, the physics engine, shared game rules, locally synthesized sounds and imported audio. Keep **Project ↓** backups to continue editing. See [Phase 4 verification and limits](docs/PHASE4.md).

## Review

See [the Phase 3 playtest](docs/phase3-playtest.jpg), [the Phase 2 workbench](docs/phase2-workbench.jpg), [the Classic workbench](docs/faithful-workbench.jpg), [interaction decisions](docs/FAITHFUL-WORKBENCH.md), and [test evidence](TESTING.md).


## Optional Advanced workshop

Choose **Advanced +** for multiball gates, flat animated boost ramps, moving obstacles, drop targets, magnets, spinners, timed bonuses and extra balls. Drag a part onto the table, or choose it then click a destination. Classic opens with this panel hidden.

Choose a trigger and an action under **When a part is hit**, then **Add rule**. Several rules can share a trigger. Add optional combo scoring or a mission with target checkboxes. Import local WAV/MP3/Ogg/WebM files for looping music and custom hit sounds. Everything saves with the project and travels in the standalone ZIP.

Use **Load Workshop sample** for a complete example, or open [Forge Workshop](examples/forge-workshop.pinball.json). Loading the example can be undone. See [Phase 5 behavior and verification](docs/PHASE5.md) for exact defaults and limits.
