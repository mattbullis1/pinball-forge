# Licenses

PINBALL FORGE application code is original work in this repository and is licensed under the MIT license in `LICENSE`.

- Matter.js: MIT license. The dependency's license text is in `node_modules/matter-js/LICENSE` after installation.
- Vite, TypeScript, Vitest, and other development dependencies: see their package license files and package metadata.
- Current component art is drawn procedurally by this project. No historical Pinball Construction Set images are bundled.

Standalone exports include application and Matter.js MIT license notices.

This revision uses original procedural pixel-style drawings and locally synthesized Web Audio tones. No historical code, ROMs, video frames, or proprietary sound effects are bundled. Design reference links are research sources. The standalone export includes its applicable runtime license notices.

## Phase 2 artwork

The metallic/light materials, spacecraft, energy field, warning beacon, Star Workshop table, and small test fixtures are original procedural work under the repository MIT license. No historical screenshots, commercial pinball artwork, or downloaded stock assets are bundled. No new runtime or development dependencies were added for Phase 2. User-imported files retain their own licensing; importing them does not grant redistribution rights. Native browser image playback and IndexedDB require no paid APIs or services.

## Phase 3 runtime

Physics continues to use the existing MIT-licensed Matter.js dependency. The control, lifecycle, fixed-step integration, test fixtures and measurement script are original project code under this repository's MIT license. No additional dependencies or third-party assets were introduced.

## Phase 4 packaging

JSZip 3.10.2 is dual-licensed MIT or GPLv3; this project selects MIT. It runs in the editor to create ZIP files and is not included in the standalone player. The editor production build emits LICENSES.txt with application, Matter.js, JSZip and its installed dependency-tree notices, including pako. The game runtime includes only application code and Matter.js notices. No additional third-party graphics or sounds were added.
