# Gameplay fixes — November 2, 2026

The local preview returned HTTP 200 during verification.

## Changes

- `src/physics.ts`: catcher releases three balls below its base with zero initial velocity; light sensors trigger audio without blocking balls or changing their scores; contact callbacks identify the part kind.
- `src/game-audio.ts`: damped bell sounds for lights and rollovers; solenoid thump and metallic ring for bumpers, slingshots, rebound walls and springs. Synthesized voices are stopped on mute, pause and exit. No audio downloads or new dependencies.
- `src/play-input.ts`: shared left/right mouse-button binding, independent holds, window-level release, lost-release recovery and playfield context-menu suppression.
- `src/editor.ts` and `src/player.ts`: use the shared mouse controls; retry browser audio from gameplay gestures and the Sound toggle; update play instructions.
- `src/reference-behavior.test.ts`, `src/game-audio.test.ts`, `src/play-input.test.ts`: regression coverage.
- `README.md`, `CHANGELOG.md`, `TESTING.md` and this report: controls and verification notes.

## Verification

- **156 automated tests in 13 files passed.** Includes independent three-ball drops, rotated/scaled catchers without launch impulses, replacement lives, all 12 reference lights/rollovers, six bumper/slingshot/rebound choices, sound lifecycle and mouse-source independence. Existing wall editing, collision, save/load and undo/redo tests remain green.
- **TypeScript and production build passed.** Existing large-bundle warning remains.
- **Real Chromium editor and exported ZIP passed:** left button, right button, both held together, independent release, release outside the board, keyboard/mouse overlap, touch button hold, focus loss/resume, right-click menu suppression, mute and unmute.
- **Real browser audio signals measured:** both versions used a running AudioContext, produced separate rollover/light/bumper frequency families and nonzero output around 0.14–0.16 peak amplitude. This verifies signal generation, not the user's speakers or listening preference.
- **Desktop and 800px tablet-width renders inspected**, no horizontal overflow or runtime errors. Header, headboard and tool/color-column styling were not modified.
- Browser evidence: `docs/gameplay-fixes-check.json`, `docs/gameplay-fixes-desktop.png`, `docs/gameplay-fixes-tablet.png`. Reproduction script: `.qa/gameplay-fixes-check.cjs`; isolated browser storage and exported fixture under `.qa/gameplay-fixed-game`.

Physical tablet input and audible speaker playback were not available for verification. Previously downloaded games need a fresh export to receive these fixes. The current preview uses its existing port and network settings; no network configuration or browser-saved user tables were changed.
