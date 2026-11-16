# Layout logic

How to turn a bad reference into a plan that could actually be built. DESIGN.md says how a plan *looks*. This file says how to *decide what goes where*. `plan-lint.js` checks the rules marked **[checked]** automatically; run it after every change.

```sh
node scripts/lint-plan.mjs assets/revisions/<boat>-<rev>.json briefs/<boat>.json
```

## 1 · Who wins when sources disagree

Work down this list. A higher source overrides a lower one, and the lower one never quietly wins.

1. **Owner corrections**: PDF comments, chat notes and Studio feedback. These are the newest and most specific.
2. **The written brief** governs *what exists and how many*: room counts per floor, named spaces, equipment and quantities. Record it in `briefs/<boat>.json`.
3. **The sketch** governs *what is next to what*: adjacency, order along the hull, which side things are on, and where the doors and stairs connect. It never governs exact dimensions, alignment or wall thickness.
4. **Construction logic** (sections 2–6) fills everything the sources leave open.
5. **Anything still uncertain becomes a flag** (`reviewFlags`) with a plain question. Draw the most plausible version; don't leave a hole.

When the brief and the sketch disagree on a count, the brief wins and the sketch is treated as partial. When they disagree on a position, the sketch wins.

## 2 · Structure

- **One envelope per floor.** Exterior walls are straight, full-length lines at the hull's stated beam and length. **[checked]**
- **Floors stack.** Upper exterior walls sit on lower exterior walls. Only things that are not walls (pads, decks, railings, platforms) step in or out. **[checked]**
- **Snap to datums.** Walls that nearly line up (within about half a foot) are the same line. Pick one coordinate and use it for every segment. A rough sketch is never evidence of a jog. **[checked]**
- **Repeat modules exactly.** Rooms of the same type share one footprint, one furniture set and one door position, alternated or mirrored, never redrawn by hand.
- **Rooms close.** Every wall end meets another wall, a door jamb or a stair edge. A stub that stops in open floor is either a missing wall or a wall to delete. **[checked]**
- **Every room has a way in.** A 24-unit gap in a wall is a door, so draw the door. An enclosed space with no door needs one, or a flag.

## 3 · Doors

- Every door sits in a wall: both jambs touch wall, and no wall runs through the opening. **[checked]**
- The swing is clear of walls, fixtures, furniture, stair treads and other swings. **[checked]**
- Put doors near a corner, with a short wall return (about one foot) between the jamb and the corner.
- **Hinge side:** the leaf ends up against the nearest wall, out of the way of the room.
- **Swing direction:**
  - into bedrooms, washrooms and offices;
  - out of small stores and closets;
  - outward (in the direction of travel) for exits and shop double doors;
  - never into a corridor where it would block the path.
- **An upper-floor exterior door must land on something**: a deck, a landing or a stair. If the sources show nothing, remove the door and flag it. **[checked]**
- Double doors are two standard leaves meeting at the centre, with a clear approach to both.

## 4 · Stairs

- **One stair has one footprint on every plan it appears on.** The lower plan shows it going UP and the upper plan shows it going DOWN, in the same place and the same direction. **[checked]**
- Every flight has a direction arrow **[checked]** and an UP or DOWN label at its foot.
- **The top always has a landing**: clear floor at least as deep as the stair is wide, with no door swinging over the treads (the swing part is **[checked]**).
- The bottom needs no extra pad; the floor it lands on is the landing.
- Rail the open sides of a stairwell on the upper plan. Only the top end is open.
- Short flights between split levels (a few treads) can share one landing.

## 5 · Fixtures and furniture

- Fixtures back onto a real wall: toilets, sinks, washers, dryers, showers and counters. A sink's faucet faces its wall.
- Equivalent fixtures stay the same size. Change the room, not the symbol.
- Keep the source's relationships: which side the toilet is on, whether a stall is reversed, where a closet sits.
- Furniture never sits in a door swing or across a doorway.

## 6 · Labels and named spaces

- Every space the brief names has a label on the correct floor. **[checked]** If the sketch doesn't show it, put it in the most plausible space and flag it. For example:
  - a room with a desk, cabinets and a sink reads as first aid;
  - an entry with benches by an exit reads as a dry room.
- Labels sit inside the building, inside their room, and off walls and swings. **[checked]**
- Centre labels in the room's clear area, or in its object (bench, tank) for object labels.

## 7 · Exceptions

When the owner confirms something that breaks a rule, add it to `exceptions` in `briefs/<boat>.json`, with the rule code, a match pattern and the reason. The checker then reports it as *accepted* instead of an error. Exceptions are per boat and never become defaults.

## 8 · Working loop

1. Put the brief in `briefs/<boat>.json`: counts, spaces, symbols and dimensions.
2. Build the revision with a `scripts/build-<boat>-*.mjs` script that edits the previous revision by element id, so every change is reviewable.
3. Run the checker until only accepted exceptions remain. Then look at a rendered PNG. Passing checks is not the same as looking right.
4. Register the revision in `projects.js`, archive the previous one, and write the change log in `revisionMeta`.
5. The owner pins notes in the Studio, then uses **Copy feedback for chat**. The pasted report names the nearest wall, door and fixture ids and includes the current check results. Start the next revision from step 2.
