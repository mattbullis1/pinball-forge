# Architecture

- `main.ts` loads `editor.ts`, which manages DOM controls, pointer interaction, painting, play/edit transitions, and persistence.
- `model.ts` defines serializable components, 20 working palette presets, three sample tables, and import validation. Valid older segment-based tables remain readable; exterior color is optional for compatibility.
- `geometry.ts` supplies transforms, mirrored shapes, hit detection, connected-boundary operations, validity checks, and triangle decomposition. Rendering and Matter bodies use the same polygon points.
- `draw.ts` draws original procedural components through a half-resolution buffer for vintage edges. Palette thumbnails use the same functions.
- `history.ts` stores up to 80 independent snapshots. A pointer gesture records only its completed transaction; cancellation restores its starting snapshot.
- `physics.ts` owns a 120 Hz accumulator with four fixed Matter.js substeps per tick. Concave obstacles become compound convex bodies; convex parts use one hull to avoid internal seams. Geometry decomposition does not replace Matter's physics. Flipper transforms and their contact velocities match the rendered pivot and angle. Decoration is excluded from collisions.
- `workbench.css` supplies the responsive two-column workbench, tool strip, property drawer, and scoreboard.

Outer walls are ordered segments with one intentional drain gap. The visible surface closes that gap for filling only; physics adds no wall across it. Neighboring boundary endpoints move together. Corner operations preserve ordering. Crossed, collapsed, and out-of-bounds polygon shapes are rejected.

The runtime clones its input table. Editing controls are disabled or hidden during play; no Matter bodies enter saved project data. `play-input.ts` tracks independent keyboard, button and pointer sources so releasing one finger cannot release another held input. Window blur and document hiding pause simulation; Resume is explicit. Simulation catch-up is capped at 100 ms after stalls.

The runtime owns serving/launch eligibility, three-ball drains, restart, pause, score and contact history. One launch is allowed per served ball; after it leaves the starting area, an unlaunched free ball also enters play. Contact sets deduplicate compound collisions and prevent occupied sensors from repeatedly scoring. A 100 ms award interval suppresses contact chatter. Bumper/slingshot impulses preserve tangential velocity. Ball speed is capped at 36 Matter velocity units. A read-only snapshot supplies player state and optional diagnostics; the runtime has no DOM, storage, audio or editor dependency.

## Persistence and deployment

Projects use IndexedDB for one browser save, with read-only fallback to the earlier localStorage save. JSON interchange embeds raster image bytes as data URLs. Vite emits static files with relative paths. Development access is through example.test on port 5173; web server and all existing sites remain unchanged.

The standalone player consumes the same model, geometry, renderer and rules through a separate bundled entry point. Community hosting and backend services remain outside this revision.

## Phase 2 modules

- art-model.ts: asset records, artwork roles, sprite timing/cropping and import validation. Assets only accept embedded PNG/JPEG/WebP/GIF; external URLs and SVG are excluded.
- artwork.ts: native image decoding, original generated sprite sheets, and reusable DOM artwork layers. A surface Canvas sits under the back artwork layer, the component/ball Canvas above it, then optional front overlays. Transparent artwork never determines physics implicitly.
- art-ui.ts: file/drop import, reusable artwork tiles, dimensions, opacity, role, layer and animation properties. Image bytes are shared by reference ID in project data, not repeated for each placed part.
- polished.ts: original Canvas materials, shadows, highlights, lights and a capped 80-particle hit pool. Classic keeps its original half-resolution drawing buffer.
- storage.ts: IndexedDB transaction completion before confirming Save, plus legacy-save reading. All project loading validates the model and decodes images before replacement.
- diagnostics.ts: opt-in local QA through ?diagnostics; render duration, frame intervals and available JavaScript heap readings are exposed on canvas data attributes. No telemetry.

Sprite updates only change image styles when the frame changes. Native GIF/WebP retain original disposal and timing through browser image rendering. Sprite sheets and sequences use one animation loop; hidden-document sprite work pauses. During play, artwork layout is stable and only hit feedback changes. The same transformed rectangle feeds artwork hit testing and Matter collisions. Compound contacts are deduplicated per collision event.

JSON/base64 and snapshot history are intentionally simple but can consume substantial memory with large artwork collections. Native GIF/WebP cannot be precisely synchronized or paused through this implementation. The standalone player reuses these layer and asset modules; see docs/PHASE4.md for exported-game evidence and browser limitations.

## Phase 4 modules

- export-game.ts: JSZip packages a cloned validated table, original image bytes, embedded player build, styles and notices. Filenames are generated independently of imported names. Script data and HTML titles are escaped.
- game-package.ts: versioned standalone manifest and strict generated relative image paths, validated through the existing table validator. Editable JSON keeps embedded data URLs; standalone files use relative assets.
- player.ts / player.css: title screen, Play, score/balls, controls, pause/restart, game-over screen and fullscreen. No editor or storage dependency.
- game-audio.ts: shared locally synthesized hit sounds, unlocked by user interaction. Audio failure leaves silent gameplay available.
- scripts/build-player.mjs: builds a single IIFE and stylesheet from current shared sources, injected through virtual:pinball-player. No stale copied runtime or runtime CDN fetch. The editor static build also includes installed dependency license notices.

ZIP creation retains all asset IDs and sequence links, including unused library assets. Export validation decodes all artwork before packaging. The last Blob download URL is retained for retry and revoked on replacement. A download request is described as ready, since browser confirmation can prevent finalization. Current ZIP export uses memory proportional to project assets; large-artwork stress testing remains outstanding.
