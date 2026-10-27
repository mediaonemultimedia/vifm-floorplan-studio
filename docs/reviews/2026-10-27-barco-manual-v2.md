# BARCO 99 · owner's manual V2 corrections

Compared 27 October 2026. This is an evidence record and drafting guidance, not a claim that the Studio has already reproduced the owner's changes.

## Comparison sources

- Before: Studio's actual published V2 PDF export, SHA-256 `b3ea17ecca323c774a6c822ff7d4319171ae778afbbf9306681df510bf83ba3b`.
- After: owner's `3-Proofs/BARCO-99-floorplans-V2.pdf`, SHA-256 `0c6d284f4fa224853b60da1f9f4c8ef6486f7a4f0f45903f019f6c952983a463`.

Both are one 792 × 1224 page. Compare geometry relative to each hull before interpreting a shift as a room change. The owner's page moves the main hull about 9 units right and the upper hull about 27 units left. Measurements below are drawing units, not site dimensions.

## What actually changed

1. **Wider service-room strips on both floors.** Their long front walls move about 27 units left relative to their hulls. The room strip grows from about 56 to 83 units wide. The generator/dry-room front walls, entry doors, landings and stair flights move together. This is a coordinated change to an assembly, not an isolated wall nudge.
2. **Generator and dry-room ends align.** Both rear boundaries now finish at about 140 units below the hull's top, rather than 148. A clear strip separates them from the next room block. The landings still align with the top room wall. The stair approach remains beside the doorway.
3. **Downstairs service spaces are redistributed.** The redundant divider above FIRST AID is removed. FIRST AID, OFFICE and BATH ROOM boundaries and door positions change; the LAUNDRY / STORAGE front closes to its end wall. Their labels move with the available areas. The corridor-facing wall is continuous between its openings.
4. **Cook-house assembly is narrowed and its adjoining stair is shown.** The long right partition, end compartment, lower exit and connecting wall returns move left together. The top return also moves left, while the broken transverse partition retains its gap. A horizontal stair now appears at the upper-right cook-house edge, corresponding with the connection upstairs. The small end compartment and its closing wall remain. This evidence does not resolve the internal use of the unlabelled spaces.
5. **The upstairs approach is simplified.** The residual L-shaped copy of the downstairs cook-house approach and the short connector beside room 1 disappear. The horizontal stair moves left and connects to a distinct landing return at the staff-block entrance. The source-specific stair projection remains an exception to normal edge alignment.
6. **The staff-room frontage is reorganized.** Four individual bedroom doors plus the separate bathroom door become two hall-side entrances, beside the 1–2 and 3–4 groups. Short internal partition returns establish a recessed passage behind the outer front wall. Bathroom fixtures move into a smaller horizontal bay, with the toilet on the outside wall and the other fixture to its left. This is a connectivity change; do not restore the old five doors merely because four bedroom numbers remain.
7. **Only the main deck has a dock/ramp/muster assembly.** The entire upstairs copy is removed, including DOWN and DOCK labels. The floor groups move closer together on the page. A ground/water-level attachment must not be duplicated simply because the floor renderer is shared.
8. **Utility labels share a right-hand datum.** GEN ROOM, FIRST AID, OFFICE, BATH ROOM, LAUNDRY / STORAGE and DRY ROOM use a common lower-right treatment in their respective strips. Each line of multiline text is right-aligned. The old blanket lower-left utility rule is insufficient. COOK HOUSE remains centred in its area. Upstairs WASH ROOMS moves up and left into the free washroom area, away from the appliance bank.
9. **Numbering is refined without reducing the type hierarchy.** Matching forward rows retain top-right placement; aft rows retain bottom-right placement and common baselines. Staff 2/3 positions respond to revised partitions. Small individual inset differences in a manual proof do not establish unrelated per-number font sizes.
10. **Muster lettering is repaired.** The export's tiny, separated “MU STER” lettering becomes readable MUSTER / STATION. Its effective type grows from about 4.78 to 7.81. This exposes a renderer/export problem: replacing a symbol's font size while retaining its original absolute tspan offsets changes word spacing. Rebuild a text run coherently; do not retain offsets belonging to another size.

## What did not change

- Both hulls remain about 264 × 900. The accommodation block below the service areas retains its geometry, fixture counts, sink/urinal orientation, doors and stair arrangement, apart from small label adjustments and overall page translation.
- Room numbers remain 24.22; area labels 7.26; captions 12.92. Supplied Libre Franklin Bold and Medium remain in use. PDF subset prefixes are packaging, not another font.
- The six square showers in the accommodation washrooms across both floors retain their dimensions. The staff-bathroom fixture is the exception below.
- Structural strokes remain 2.42, door/fixture detail strokes about 0.95 in final page coordinates. Raw PDF widths cannot be compared without the active transform: the old shower's 1.759259 width under a 0.54 scale is already 0.95. Do not misreport flattening as a new line-weight decision.

## Clarifications before reconstructing this topology

- Are the two entrances and recessed passage serving rooms 1–2 / 3–4 intentional? Best reading: preserve the edited arrangement and keep the bathroom accessible from the shared passage. Confirm before inventing private-room door connections.
- **Confirmed by the owner, 27 October 2026:** the rectangular staff-bathroom fixture is intentional. Preserve the edited footprint of about 20.94 × 13.73. The other six shower outlines stay square at their existing common size. This is a confirmed fixture-specific exception, not permission to distort equivalent symbols to fit.

The cook-house internal-use question from the preceding review remains open.

## Reusable drafting rules

### Change the connected assembly, then review its neighbours

Before shifting a room boundary, enumerate dependent doors, jamb returns, landings, fixtures and label areas. Move/rebuild them deliberately and check adjacent circulation. Independent editable walls are an editing requirement; they do not justify disconnected design decisions or silently moving neighbours.

### Establish level ownership before drawing attachments

Every dock, ramp, landing and stair belongs to a specific level or inter-level connection. Decide where it appears. A shared renderer must consume per-floor contents rather than imply duplicated attachments. Rebalance the complete page after removing an assembly.

### Use strip-wide label alignment

Choose the lower corner consistent with the strip's free side, door approach and composition. Apply one datum and consistent wall clearance to that strip, including every line of multiline labels. Centre labels whose intent is central. Keep shared font sizes; adjust the layout before making the hierarchy smaller.

### Treat stairs as connected circulation

Review the run, clear landing, doorway and corresponding flight on the other floor together. Normal alignment applies unless the evidence shows an overhang. Keep a landing return where shown; a bare flight touching a wall does not establish a usable connection.

### Separate intentional topology from editing noise

The proof contains small endpoint discrepancies and leaf/threshold offsets of roughly 1–2 units. Learn aligned walls and coherent openings, not every decimal. Normalize jambs and shared datums deliberately. An apparent fixture exception needs a question before normalization. Here the owner confirmed that the staff-bathroom rectangle is intentional; preserve it.

### Inspect the exported artwork

Check readability, font identity and effective line weights in the PDF. SVG values alone do not reveal inherited scaling or stale text offsets. Review symbol labels at normal output size, including MUSTER / STATION and W/D.

## Next implementation boundary

Preserve published V1 and V2. Use the owner's proof as the next geometric reference after the remaining staff-access question is resolved. A reconstructed revision needs a separate save key, an explicit change log, preservation of unrelated edits and visual comparison against this PDF before publication. The drawing rules apply to all boats; these particular BARCO room changes do not imply equivalent changes on Odyssey.
