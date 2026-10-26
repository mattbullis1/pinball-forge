# Faithful workbench — accepted direction

The owner accepted an Apple II-inspired static proposal, then authorized implementation. This records that scope, not compatibility with original game files.

## References

## Latest owner review — 2026-10-26

The header/top menu, right-side tool/color column and pop-in menus are approved and locked. Changes to those areas require explicit owner permission. See the project AGENTS.md.

The owner says the game works similarly but its graphics are off. The current procedural component artwork has not met the requested faithful-recreation standard. Next design work should compare a single chosen original presentation with the actual component silhouettes, proportions, pixel treatment, colors, table surface and scoreboard. Review a visual proposal before implementing changes. Phase 6 is not automatically authorized by this feedback.

### Reference sources

- [Bill Budge demonstration, 2:35 onward](https://www.youtube.com/watch?v=EOayMrdTax4&t=155s): parts box, joystick hand, immediate play and return to editing.
- [Apple II construction session](https://www.youtube.com/watch?v=i9-VSDrz3GQ): green/purple presentation and assembly.
- [ADG walkthrough, 9:40 onward](https://www.youtube.com/watch?v=R46Cj21c_Bc&t=580s): polygon tools and painting in the PC port.
- [Flume gameplay](https://www.youtube.com/watch?v=ENugxl0YnYs): PC table and side scoreboard.

## Accepted interactions

| Tool | Interaction |
| --- | --- |
| Hand | Move/select objects; open adjustments, duplication, or deletion. |
| Move corner | Select a wall/obstacle and drag a square; connected outer edges follow. |
| Add corner | Click an edge, then drag the new corner. |
| Remove corner | Connect neighboring corners while preserving the drain and valid geometry. |
| Paint | Choose a swatch, then paint an object, surface, or exterior. |
| Test | Replace the parts area with scores; return to unchanged editing data. |

The visual language is flat and compact. Components are original procedural drawings. The tray shows implemented presets only. Modern conveniences include mouse/touch placement, undo/redo, optional snapping, accessible labels, a selection list, and tucked-away adjustments.

Magnets, spinners, multiball troughs, drop-target banks, and rules wiring remain later-phase features. The acceptance exercise is to reshape the perimeter, add a solid obstacle, reshape/recolor it, place a bumper, play, and return to building. See TESTING.md for executed checks and limits.
