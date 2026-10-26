# Roadmap

- Phase 0: research and architecture recommendation — previously reviewed.
- Phase 1: faithful construction revision — implemented for user review. Wall sculpting, solid obstacles, painting, three samples, browser/file saving, undo/redo, and Test. Physical tablet testing and a committed UI regression suite remain outstanding.
- Phase 2: artwork and animation implemented for review — raster import, native GIF/WebP, sprite sheets/sequences, roles/layers, IndexedDB, original animated parts, and optional polished rendering. Physical tablet and Firefox/Safari coverage remain unverified; standalone animation verification belongs to Phase 4.
- Phase 3: implemented for review — fixed substeps, moving flipper contacts, launch eligibility, contact scoring, three-ball lifecycle, restart, pause/resume and independent touch/keyboard inputs. Verified 51 tests, four 30-second table simulations, browser workflows and CPU measurements. Physical device and broader browser coverage remain unverified; this is an arcade model, not electromechanical simulation.
- Phase 4: implemented and demonstrated for review — standalone ZIP, shared player, bundled assets/licenses, title/game-over/fullscreen UI. 65 automated tests pass. User confirmed browser download; actual downloaded archive CRC-checked and opened independently. Local HTTP playback verified; direct file://, physically disconnected networking and physical device coverage remain unverified. See docs/PHASE4.md.
- Phase 5: optional components and visual rules — later approval gate.
- Phase 6: expanded mobile/accessibility support, recovery, polish — later approval gate.
- Phase 7: community arcade — planning only until authorized.
