# Phase 4 — Standalone HTML5 ZIP export

Implemented for review on 2026-10-26. Phase 5 remains a separate approval gate.

## User workflow

Input: the current editable table, its component settings and embedded artwork.
Processing: validate the table and decode artwork, clone it, bundle the shared player and original asset bytes, and compress everything locally.
Output: one named ZIP from **DOWNLOAD MY PINBALL GAME**. Extract the whole archive and open its index.html through ordinary static hosting. No editor website, CDN, API, account, Node runtime, PHP, database or paid service is required by the exported game.

The button initiates a browser download; browser confirmation policies still apply. A visible **Save ZIP again** link remains available. Keep the separate .pinball.json project for future editing.

## Package contract

- index.html: title and relative classic script/style references.
- runtime.js: shared renderer, artwork layers, input, Web Audio sounds, Matter.js and game rules in one IIFE.
- player.css: responsive player presentation and controls.
- table.js: validated table data with generated relative image filenames.
- assets/: every original PNG/JPG/WebP/GIF file, including sequence frames and unused library images.
- LICENSES.txt: application and Matter.js MIT notices.
- README.txt: extraction, play and static-hosting instructions.

Sounds are synthesized locally, so no separate audio files are necessary. Exporting pauses a running Test session and does not mutate the editing table. Imported artwork retains its original redistribution requirements.

## Acceptance evidence

- 65 automated tests across seven files pass; TypeScript and production build pass.
- Three sample tables produce identical simulation snapshots before and after ZIP packaging for 1,200 fixed ticks each.
- Four independent packages generated: Classic Builder (6 files, no images), Star Workshop (9 files, 3 images), Artwork Laboratory (19 files, 13 images), Drain and Restart Check (6 files, no images).
- All 16 images across Star Workshop and the laboratory compare byte-for-byte with their source assets. CRC validation passes. See phase4-packages.json.
- Browser download initially remained unconfirmed. The user completed the browser handoff and confirmed success. [private-path] was found, CRC-checked, extracted and opened independently. Its five non-table files exactly match the tested package; table settings match apart from generated object IDs. See phase4-browser-download.json.
- Local HTTP playback verified through existing web server in an isolated pinball-forge-export-qa/20261026 directory. Title/Play, launch, 100-point scoring, drains, pause/resume, restart, three-ball game-over and fullscreen transitions were observed.
- Original GIF and animated WebP, sheet frames and frame sequences loaded in the exported laboratory. Two screenshots show different animation frames. No image URLs point back to the editor.
- Chrome tablet viewport: width 768 without horizontal overflow. Narrow viewport: content width 375 without horizontal overflow, touch buttons 44 pixels tall. This is viewport emulation, not a physical tablet test.
- Browser logs checked on the standalone Chrome player returned no errors or warnings.
- Chrome sample diagnostics: render P95 1.7 ms, simulation P95 0.90 ms, measured active frame-interval P95 67.4 ms, no recorded stalls over 500 ms, approximately 25.9 MB JS heap. These automation measurements do not establish sustained 60 FPS or mobile performance. See phase4-performance.json.

## Offline boundary and remaining limitations

The tested package has only local relative resources. Automated checks reject external asset paths and verify that the actual player bundle has no fetch, XMLHttpRequest, WebSocket, EventSource, dynamic imports or CSS resource imports. Local HTTP gameplay requires no Internet service.

A physically disconnected-network run was not performed. Direct file:// navigation was attempted but blocked by the browser automation URL policy; no bypass was attempted. Universal direct-file compatibility is not claimed. Local HTTP is the verified route.

The browser may hold ZIP downloads for review; the application cannot override that decision. Firefox, Safari, physical tablet input and access from another network device remain unverified. Audio is the shared synthesized implementation; audible output was not independently captured. Native animated-image timing and fullscreen availability depend on the browser.

No web server, DNS, hosts, firewall, mDNS, example.test or existing site configuration changed. AOV continued to return HTTP 200. No public deployment took place.

## Review links on development machine

- Editor: private-preview
- Exact downloaded game: private-preview
- Animated example: private-preview

## Evidence files

- phase4-standalone.jpg
- phase4-tablet.jpg
- phase4-gameover.jpg
- phase4-animation-a.jpg / phase4-animation-b.jpg
- phase4-browser-download.json
- phase4-packages.json
- phase4-performance.json

## Updated local toolchain guidance

Read the gamedev-tools skill, permanent memory, framework selection, installed inventory and command guide during final verification. This existing approved Canvas/Matter.js project retains its pinned toolchain; no starter replacement or framework reinstall was needed. Commands use npm.cmd on Windows. The dedicated development machine MCP server was not exposed; available terminal and browser controls were used. Browser checks used the permitted CUA browser surface; the separate installed Playwright smoke harness was not run.
