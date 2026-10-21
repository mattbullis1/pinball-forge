# Architecture

The Vite/TypeScript editor renders a 560 × 840 top-down Canvas playfield. `model.ts` stores serializable tables and component presets. `draw.ts` renders the same table data used by `physics.ts`, which uses Matter.js during Test. `main.ts` manages the visual editor, history, and local project persistence. The Vite build uses relative asset paths for static hosting.

Phase 1 uses localStorage for one device-local save. IndexedDB and asset storage are planned before imported artwork. A future standalone ZIP will bundle a separate game runtime and the current table data.
