# Architecture

- `main.ts` loads `editor.ts`, which manages DOM controls, pointer interaction, painting, play/edit transitions, and persistence.
- `model.ts` defines serializable components, 20 working palette presets, three sample tables, and import validation. Valid older segment-based tables remain readable; exterior color is optional for compatibility.
- `geometry.ts` supplies transforms, mirrored shapes, hit detection, connected-boundary operations, validity checks, and triangle decomposition. Rendering and Matter bodies use the same polygon points.
- `draw.ts` draws original procedural components through a half-resolution buffer for vintage edges. Palette thumbnails use the same functions.
- `history.ts` stores up to 80 independent snapshots. A pointer gesture records only its completed transaction; cancellation restores its starting snapshot.
- `physics.ts` uses Matter.js at 120 Hz. Concave obstacles become compound convex bodies; geometry decomposition does not replace Matter's physics. Flipper transforms are shared with rendering. Decoration is excluded from collisions.
- `workbench.css` supplies the responsive two-column workbench, tool strip, property drawer, and scoreboard.

Outer walls are ordered segments with one intentional drain gap. The visible surface closes that gap for filling only; physics adds no wall across it. Neighboring boundary endpoints move together. Corner operations preserve ordering. Crossed, collapsed, and out-of-bounds polygon shapes are rejected.

Test receives a cloned table. Editing controls are disabled or hidden during play; no Matter bodies enter saved project data. Pointer cancellation and window blur release controls. Simulation catch-up work is capped after browser stalls.

## Persistence and deployment

Projects use IndexedDB for one browser save, with read-only fallback to the earlier localStorage save. JSON interchange embeds raster image bytes as data URLs. Vite emits static files with relative paths. Development access is through example.test on port 5173; web server and all existing sites remain unchanged.

The future standalone player should consume the same model, geometry, renderer, and rules using a separate entry point with bundled assets/licenses. This revision does not implement ZIP generation, community hosting, or backend services.

## Phase 2 modules

- art-model.ts: asset records, artwork roles, sprite timing/cropping and import validation. Assets only accept embedded PNG/JPEG/WebP/GIF; external URLs and SVG are excluded.
- artwork.ts: native image decoding, original generated sprite sheets, and reusable DOM artwork layers. A surface Canvas sits under the back artwork layer, the component/ball Canvas above it, then optional front overlays. Transparent artwork never determines physics implicitly.
- art-ui.ts: file/drop import, reusable artwork tiles, dimensions, opacity, role, layer and animation properties. Image bytes are shared by reference ID in project data, not repeated for each placed part.
- polished.ts: original Canvas materials, shadows, highlights, lights and a capped 80-particle hit pool. Classic keeps its original half-resolution drawing buffer.
- storage.ts: IndexedDB transaction completion before confirming Save, plus legacy-save reading. All project loading validates the model and decodes images before replacement.
- diagnostics.ts: opt-in local QA through ?diagnostics; render duration, frame intervals and available JavaScript heap readings are exposed on canvas data attributes. No telemetry.

Sprite updates only change image styles when the frame changes. Native GIF/WebP retain original disposal and timing through browser image rendering. Sprite sheets and sequences use one animation loop; hidden-document sprite work pauses. During play, artwork layout is stable and only hit feedback changes. The same transformed rectangle feeds artwork hit testing and Matter collisions. Compound contacts are deduplicated per collision event.

JSON/base64 and snapshot history are intentionally simple but can consume substantial memory with large artwork collections. Native GIF/WebP cannot be precisely synchronized or paused through this implementation. The separate player must reuse the layer and asset modules; exported-game compatibility is still a Phase 4 test gate.
