# VIFM floorplan drawing rules

The four original plans establish the visual language; style reference.svg supplies editable type and measurements. BARCO source drawings determine topology, fixtures, numbering and connections. These are presentation schematics, not measured construction plans. Regularize rough source lines into aligned, plausible partitions without inventing rooms or equipment.

## Type and placement

Use supplied Libre Franklin fonts and original style sizes. Utility names use a consistent lower corner for their service strip: original references often use lower-left; the later owner-edited BARCO proof establishes lower-right for its service strip. Communal names centre within the logical room boundary, ignoring doorway gaps. Bedroom numbers normally occupy the upper exterior corner. Reserve clearance for the longer number in paired rooms on the two decks. Try the opposite upper corner, then lower corners when a door or fixture conflicts. Preserve type size. Lower-corner placement is an approved extension of the original system, whose examples predominantly use upper corners. Use the normal inset where possible; reduce it only while preserving visible wall clearance. Never put text on a wall or door swing. Matching bedrooms sharing a front and back boundary form a row: if one needs lower placement, align the whole row to the lower baseline, provided all labels clear their doors and fixtures. This includes 8/7/5 and 18/17/15.

## Doors, corridors and stairs

Every door opening and leaf is 24 drawing units. Draw a true circular quarter arc, a perpendicular solid leaf and dotted closed threshold. Clip walls at each opening. Align corridor faces across gaps. A stair flight has evenly spaced treads and a separate clear landing covering the doorway; no treads beneath a door swing. These dimensions are drawing conventions.

## Accommodation and sanitary fixtures

Rooms 5–14 and 15–24 share one structural footprint. Rooms 9/19 remain open extensions of circulation as shown; 10/20 receive inward doors at the source wall gaps and lower labels for clearance. The bathroom between upstairs rooms 3 and 2 is shared from the hallway.

Keep every shower symbol the same size; adjust stall dimensions and circulation before shrinking fixtures. Retain the source's toilet/shower relationships, including reversed compartments. Sink faucets face their backing wall. Extend the double-sink counter rectangle to make a bank with evenly spaced basins. Align appliance and counter backs. Upstairs urinals share the shower-block backing wall beside room 20, stacked vertically in portrait orientation and facing the washroom.

## Dock and page composition

Use the supplied secondary dock artwork proportions: dock width 90.22 and length 239.15 relative to the 327-unit reference hull width. At the default 264-unit hull width this gives a dock about 28% of hull width. Ramp width follows its outline, not the larger symbol viewBox containing text. Adapt the attachment positions to BARCO, keep labels upright and centre DOCK in the usable area. Muster artwork has equal side and bottom padding. Rebalance the combined dock/hull groups within the page; feedback coordinates remain attached to source drawing positions.

## Output

Only the original presentation elements belong in PDF/SVG artwork. Editor guidance and feedback pins stay outside exports. Text remains text, fonts are embedded, and geometry stays vector. Preserve user colours and label edits during published updates.

## Connected layout review and release checks

Treat rooms, backing walls, fixtures, doors and circulation as connected assemblies. A clear door arc alone is insufficient: its threshold must sit in the room boundary, its swing must enter that room, and the remaining wall must reach both jambs. Check that sink faucets have a real continuous backing wall, not merely the correct orientation. Check complete bedroom fronts with only the intended openings. Review the row of labels together, then both floors together.

Upgrade each whole saved snapshot before merging a published release. Do not merge its revision number separately from its geometry. Rendering and exporting legacy projects also upgrades a copy first. Keep the original saved project in the existing migration/update backup and preserve notes, text and colours. A layout migration replaces the accommodation structure with the approved common layout; it does not preserve incompatible older accommodation-wall edits. Verify a previously saved drawing as well as a new visitor's starting drawing, then review the actual exported PDF. Passing isolated geometry tests does not establish visual or spatial correctness.

The cook-house assembly is shared across both floors: a side door in the long partition, an inward-opening end exit, and the small enclosed end compartment with its own inward door. Retain its closing partition from the source, with solid wall returns at the door jambs. Keep that compartment unlabelled because the source gives no name.

## Alignment and explicit source exceptions

Adjoining walls, room boundaries and landing edges share an alignment by default. Derive a landing and its doorway from the room wall, rather than positioning them independently. Keep the complete doorway inside a clear landing with clearance beyond both jambs. Apply the dry-room landing alignment to both decks.

The upstairs horizontal connecting stair beside rooms 1 and 2 is an explicit source exception: it projects beyond the cook-house wall corner. Keep that overhang and extend the supporting wall to the stair's outer edge. Do not shorten the stair to enforce the default alignment, or generalize this exception to other joints.

## Shared typography and area centring

All boats use one editor and the same semantic roles: room numbers, room/area labels, equipment labels, floor captions, boat title, header subtitle, added text and helipad marker. A size adjustment applies to every item in that role across the drawing. Do not shrink an individual number to hide a layout conflict: move its placement, change the room, or reduce the shared role size.

A centred label has an explicit logical area. Place its visual text block at that area's horizontal and vertical midpoint, using the supplied font's cap-height/descender metrics and multiline height. Ignore a doorway gap when establishing a room's full extent. Rotated centred labels use the same rule. Keep established edge/corner label rules for labels whose intent is not central. Editing walls does not infer or silently change a label's bounds; update the explicit area when its room changes.

## Shared line system and independent walls

Structural walls are separate line segments with independent endpoints. Use SVG square caps, extending half the stroke width beyond the anchor, to close corners cleanly. Moving a segment never moves neighbouring walls, fixtures or doors implicitly. Main walls, secondary outlines, fixture/stair/door details, threshold stroke and dot/gap spacing have separate universal controls. Door leaves and arc radii retain the same geometric relationship as weights change.

## Odyssey evidence and unresolved assumptions

The supplied sketches establish Odyssey geometry ahead of the prose. Treat the repeated bench area in the first two photos as their shared join, rather than drawing it twice. Place the shorter upper level by matching stair connections; retain the helipad's 43 × 35 proportion. Draw the ten sketched bedrooms only, with provisional location identifiers. Do not invent an upper accommodation block, first-aid location, extra laundry or additional bedrooms to reconcile the prose. Carry all nine draft uncertainties as editor feedback, never printed artwork. Subsequent source clarification can revise these assumptions without changing the universal editing controls.

## BARCO cook-house level confirmation · 27 October 2026

The owner confirmed that the cook house exists downstairs only and explicitly selected omission of its footprint upstairs. This overrides its duplication in the supplied upstairs evacuation sheet. Remove the upstairs copy's partitions, external footprint lines, doors and label together. Keep the barge perimeter, staff cabins and separately documented stair connections. Do not draw or label a roof in its place. Existing editor saves receive this correction once, preserving the main floor and unrelated edits. The earlier shared cook-house assembly rules describe the original source interpretation; they now apply to the main floor only.

## Revision history and PDF review · BARCO V2

V1 means the published drawing after the downstairs-only cook-house confirmation and before the twelve PDF comments. Preserve its geometry, styles and local working state as an archived snapshot. Apply the PDF review in V2, with separate drawing/feedback storage and versioned download names. Shared revision navigation applies to every boat. Change logs and revision badges belong in the editor; do not add them to the original print composition.

Matching forward bedroom rows use top-right numbers; matching aft rows use bottom-right numbers. Staff rooms 1–4 use bottom-right numbers. For 14/6 and 24/16, reserve the longest paired number, use matching right insets, and keep equal visible ink gaps above/below the divider. Reduce the padded-side inset before changing the common number size. OFFICE uses the requested lower-right alignment.

Fixtures, stairs and door details use thinner strokes than main walls. All seven BARCO showers are scaled uniformly to 90% to leave visible ink clearance without changing their relative placements or faucet orientations. Stair outlines and landing borders must stop at exact door jambs, just as structural walls do. Do not draw a solid rectangle edge across a dotted doorway. Keep a clear landing and retain the flight/tread geometry.

The reviewer’s downstairs cook-house information request remains unresolved; do not invent an arrangement to mark the note complete. Record the upper cook-house removal as a V1 confirmation carried into V2, since the original PDF note's floor wording conflicts with its pin and the owner separately clarified the instruction.


## Owner-edited BARCO V2 proof · 27 October 2026

The detailed evidence comparison is in [the manual V2 review](docs/reviews/2026-10-27-barco-manual-v2.md). The owner’s later corrections supersede earlier schematic assumptions where the intent is clear; they do not establish measured site dimensions. Keep observed changes separate from unresolved interpretations.

Widening a service strip is an assembly change: reconsider the room partitions, wall returns, openings, stairs, landings and label areas together. Review the matching strip on the other floor. Independent editable wall lines must still describe a connected, plausible layout. Select one lower-corner alignment for a service strip and apply it consistently, including every line of multiline labels. The manual proof uses lower-right labels throughout BARCO’s service strips, superseding the earlier blanket lower-left rule there.

Assign each dock, ramp and stair to its actual level or connection. The later BARCO proof shows one dock/ramp/muster assembly on the main deck only; a shared renderer must not create an upstairs duplicate. Rebalance the page around the actual visible extents of both floor groups. Compare geometry relative to its hull before mistaking page translation for a room-layout change.

Read the two ends of a stair connection together, including clear landings and wall returns. A stair touching a wall does not prove a usable entrance. Retain evidence-based overhang exceptions. Normalize minor manual endpoint drift into aligned datums and exact circular door openings rather than preserving accidental offsets.

Keep symbol typography coherent when its size changes: original absolute tspan offsets cannot be retained with a replacement font size. Verify MUSTER / STATION and W/D in the actual PDF. Compare effective PDF line widths after transforms; flattening alone is not a style change.

The new staff passage/door arrangement and the compressed rectangular staff-bathroom fixture need owner clarification before reconstruction. The rectangle conflicts with the previously explicit equal-square-shower convention. Do not silently resolve that conflict or invent room connectivity. This review records learning; it has not changed the published V1/V2 artwork.
