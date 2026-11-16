# Odyssey 102 · eight-room correction and supplied desk chair

Confirmed by the owner on 16 November 2026. This supersedes the earlier ten-bedroom interpretation in the V1/V2 studies and November PDF review. The owner’s annotated bedroom reference establishes **eight lower-level bedrooms: four left and four right**, with one hallway entrance per room. The written twenty-room accommodation specification remains unresolved; it is not a reason to add rooms.

Each bedroom is one repeated module. If its doorway is at the top, its bed is at the top and its desk at the bottom. The alternate room reverses that arrangement. Left and right rooms mirror across the hall. The closet stays opposite the doorway on the same hallway wall, at the other end of the room. A bed and a desk within one enclosure are furniture, not separate rooms. Count enclosed rooms and entrances before interpreting repeated furniture marks.

V3 removes the extra paired row and retains the established common room size. The schematic lower outline and end exit stop after the fourth pair. Vessel dimensions remain recorded metadata, not a surveyed scale. Earlier V1/V2 layouts remain archived. No upper geometry, shared-facility arrangement, stair geometry or workshop layout is reconstructed by this correction.

The corrected sketch bedroom detail and Studio asset use the same definition in `odyssey-bedrooms.js`. The sketch retains the rest of the earlier source montage; it is not a replacement of that evidence with V2’s interpreted structure. The bedroom module is a clear vector correction. Reproduction commands:

```sh
node scripts/build-odyssey-bedrooms-v3.mjs
node scripts/build-odyssey-bedroom-sketch.mjs path/to/source-review.png output-directory
```

The supplied `chair.svg` replaces the invented office-chair symbol wherever desk chairs are shown. Its square shape and backrest line are preserved with uniform normalization, and its native facing is normalized upward. The existing fixture transform turns it toward each desk. A small padded footprint retains existing placement and clearance. The symbol has no hard-coded drawing colour and no nested scaling that would weaken the stroke; the renderer supplies the selected ink and common detail weight. The original SVG is retained in `assets/symbols/chair.svg`. This shared symbol styling also applies when viewing earlier layouts; their room arrangements remain unchanged.

Shared revision handling now follows the nearest earlier revision when preserving local settings, archived drawings and feedback. It does not skip V2 owner notes when opening V3. Only untouched seeded questions receive updated confirmed wording; manually edited questions remain intact. This avoids carrying the obsolete ten-room wording into the current eight-room review.

Verification covers eight rooms and eight entrances, common room bounds, bed/desk order in every room, closet backing-wall position, chair direction and clearance, complete threshold openings, unobstructed door sweeps, unchanged upper geometry, archive migration from both V1 and V2, nearest-revision feedback, and inherited chair colour/detail weight. Visual review includes the corrected sketch, actual Studio drawing and exported PDF.
