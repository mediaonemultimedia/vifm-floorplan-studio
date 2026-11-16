# VIFM Floorplan Studio: agent guide

Static GitHub Pages app (`mediaonemultimedia/vifm-floorplan-studio`). Pushing `main` publishes the live Studio through `.github/workflows/pages.yml`, which runs `scripts/build-site.py` into the ignored `dist/` folder. Never edit `dist/` by hand.

## Read first

1. `LAYOUT-LOGIC.md`: how to decide placement from rough references. It sets the source priority, structure, doors, stairs and named spaces.
2. `DESIGN.md`: presentation rules and per-boat history.
3. `briefs/<boat>.json`: the written spec (counts, spaces, symbols) and owner-accepted exceptions.

## When the owner pastes "VIFM Floorplan Studio — requested changes"

That text comes from the Studio's **Copy feedback for chat** button. Each note gives:

- the boat, floor and drawing revision;
- the pin position in drawing units (`Within floor: x, y`; these are not feet);
- **Nearest geometry**: the ids of the walls, doors, details and labels closest to the pin. Edit these first;
- the requested change, in the owner's words;
- the layout checks as they stand on the drawing they reviewed.

Workflow:

1. Branch from `main`.
2. Add a revision builder in the existing pattern: a small module, `<boat>-*-vN.js`, that edits the previous revision's JSON by element id, plus `scripts/build-<boat>-*-vN.mjs`, which writes `assets/revisions/<boat>-vN.json` and sets `revisionMeta`. Example: `odyssey-layout-v6.js` and `scripts/build-odyssey-layout-v6.mjs`.
3. Map every note to a change or a flag. Owner wording beats the brief, and the brief beats the sketch (LAYOUT-LOGIC §1). If a note conflicts with a rule, follow the note and record an exception in the brief.
4. Run `node scripts/lint-plan.mjs assets/revisions/<boat>-vN.json briefs/<boat>.json`. Fix every error, or justify it as an accepted exception.
5. Look at the drawing. Render it with headless Chrome or open the Studio locally (`python3 -m http.server 4173`). Passing checks is not the same as looking right.
6. Register the revision in `projects.js`: make the new one the default and mark the previous one `readOnly`. Add tests next to `tests/odyssey-v6.test.js`, then run `npm test`.
7. Commit on the branch and show the owner. Push to `main` only when the owner says go, because that publishes live.

## Geometry quick reference (drawing-coordinate boats)

- `walls`: independent segments `{x1,y1,x2,y2}`.
- `doors`: hinge `{x,y}`. The opening runs from the hinge along `u` (length 24) and the leaf swings along `v`.
- `details`:
  - `rect` and `ellipse` use `x,y` as the top-left corner;
  - `symbol` uses a centre plus `scale` and `rotation`;
  - stairs are `*-stair-<letter>-*` lines plus a `stairArrow`.
- `labels`: `centerArea` is the box the label centres in.
- Scale is about 7.14 units per foot on Odyssey (46 ft = 328.55 units).
