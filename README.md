# PINBALL FORGE

A browser-based pinball construction set. Phase 1 is a playable editor preview inspired by the original's black playfield, bright parts tray, and immediate click-to-build feel. All current graphics are original Canvas drawings.

## Run locally

Install Node.js, run `npm install`, then `npm run dev`. To build static files for an existing web server, run `npm run build` and serve the `dist/` directory. No backend or database server is required.

## Create a table

Click or drag a component from the visual parts tray onto the playfield. Drag a wall endpoint to reshape the wall; drag the wall body to move it. The perimeter is made of connected wall segments, so moving its vertices changes the table silhouette and collision shape. Select a part and use Quick Paint to recolor it. Open Paint / Tune for exact color, position, rotation, or score controls, and for table surface and wall colors. Snap to grid can be turned off. New creates a starter table; Sample tables provides three examples. Test plays the current table without changing the editor data.

## Save and open

Save stores the current table in this browser's local storage. Open restores it. Export Project downloads a JSON project file that can also be opened through Open when no browser save exists. Standalone game ZIP export is planned for Phase 4 and is not represented by this Phase 1 project export.

## Artwork and publishing

Custom artwork and standalone game publishing are planned for later phases. Do not publish the current editor preview as a finished game.
