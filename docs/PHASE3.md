# Phase 3 — playable physics

Approved by the user on 2026-10-25. Scope: refine the existing Matter.js runtime and play controls while preserving the faithful construction workbench.

## Core workflow and acceptance

Input: an existing editable table plus keyboard or touch controls. Processing: shared Matter.js geometry, fixed simulation, component reactions, scoring and three-ball lifecycle. Output: the playable table and scoreboard; Back to Build restores the identical editable project.

- Three built-in tables and a modified layout run with finite, contained ball motion.
- Thin-wall collision trials cover maximum supported speed and 0°, 25°, 65°, and 90° walls; thin drain sensors also detect passage.
- Left/right, rotated and scaled flippers strike through their movement. Holding a flipper up does not repeatedly add a scripted kick.
- Equal elapsed time produces equal simulation results at 30, 60, 120 and 144 Hz display cadence.
- Bumpers/slingshots react outward; sensors score once per entry. Compound contacts do not duplicate awards.
- Each served ball launches once; three drains reach game over; restart resets score, ball count, contact state and flipper pose.
- Pause preserves the exact state. Losing window focus or hiding the page pauses play. Resume is explicit.
- Keyboard and simultaneous touch sources release independently; cancellation clears held controls.
- Actual browser play, screenshot inspection, project preservation and performance measurement supplement automated tests.

## Approach retained

Matter.js 0.20 remains the collision and contact solver. The official [Body API](https://brm.io/matter-js/docs/classes/Body.html) documents inferred velocity when setting position/angle, used for moving flippers. The [Runner API](https://brm.io/matter-js/docs/classes/Runner.html) supports using Engine.update in an application-owned loop. Installed engine source was checked alongside those references.

The game owns a 120 Hz accumulator with four fixed Matter substeps per tick. Speed is bounded at 36 table units per Matter base frame (2,160 units/second). At that bound, each substep moves a ball at most about 4.5 units before gravity/collision response, less than its 10-unit radius. Flipper travel is also bounded. This reduces tunneling risk without replacing Matter with custom collision physics; it is not a claim of exact continuous collision detection.

Flippers are driven surfaces with fixed pivots and travel limits. Their linear/angular motion reaches Matter's contact solver. This models consistent arcade flippers, not electromechanical coil or cabinet simulation. Bumpers and slingshots apply outward rubber impulses after contacts resolve, preserving tangential motion. Contact awards require a new entry and a 100 ms separation from the previous award to suppress chatter.

The shared runtime includes restart, pause and launch rules; browser DOM and audio remain outside it. Phase 4 must import this same module into the independent player. Exported-game parity remains unverified until that player exists.

No added dependencies, infrastructure or network changes. Existing Phase 2 artwork and project formats remain supported.
