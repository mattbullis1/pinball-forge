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

Current projects use localStorage for one browser save and validated JSON interchange. IndexedDB is reserved for later asset storage. Vite emits static files with relative paths. Development access is through example.test on port 5173; web server and all existing sites remain unchanged.

The future standalone player should consume the same model, geometry, renderer, and rules using a separate entry point with bundled assets/licenses. This revision does not implement ZIP generation, imported animation, community hosting, or backend services.
