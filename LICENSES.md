# Licenses and assets

PINBALL FORGE application code is original project work under the MIT license in `LICENSE`.

## Current artwork

- The classic component atlas in `src/assets/construction-reference.gif` comes from the user-supplied Pinball Construction Set reference. It is embedded in classic rendering, including exported games. This third-party reference artwork is **not** covered by this repository's MIT license; its original rights remain with its respective owner. No license to that artwork is granted by this project.
- The polished chrome atlas, nebula table and headboard examples were generated for this project. Original generated/procedural project artwork is distributed under the repository's MIT license.
- User-imported pictures and audio retain their original ownership and licenses. Exporting packages their bytes; it does not grant redistribution rights.
- Default pinball sounds are synthesized locally. No proprietary sound recordings or game ROMs are included.

The earlier phase notes described procedural art only. The current classic renderer does include the reference image above. `public/ASSET-NOTICE.txt` accompanies the live build and is included in editor and standalone-player notices.

## Dependencies

- Matter.js: MIT. Its license is included with the editor and standalone runtime.
- JSZip 3.10.2: dual MIT/GPLv3; this project selects MIT. Used by the editor for ZIP export.
- The editor's `LICENSES.txt` contains the installed runtime dependency-tree notices, including pako.
- Vite, TypeScript, Vitest and other development dependencies retain their package licenses.
