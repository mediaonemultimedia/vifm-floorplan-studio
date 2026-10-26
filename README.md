# VIFM Floorplan Studio

A static, motion-free editor for VIFM accommodation floorplans. The initial drawing set is BARCO 99. There is no server-side data processing or account requirement.

## Run locally

From this folder, run:

```sh
python3 -m http.server 4173 --bind 127.0.0.1
```

Open http://127.0.0.1:4173. Use an HTTP server; opening index.html directly as a file will block the local font and logo requests.

## Edit and export

- Select a room number or label to edit its text, size and position in Properties. Drag to move; arrow keys nudge; Shift increases the nudge. Enter selects a focused label.
- Choose an annotation tool and click a deck to place text, arrows, first-aid symbols, muster markers or room/wall rectangles. Duplicate or delete selected elements in Properties.
- Click a partition to adjust its offset or delete it. Existing partition groups may contain several connected segments. Fixtures and doors remain separate from partition movement.
- Edit vessel dimensions to adjust the overall drawing envelope. Interior coordinates are drawing units, **not measurements in feet**.
- Undo is available in the header and with Command/Ctrl+Z outside text fields. Text fields retain normal text undo.
- Both/Main/Upstairs tabs control the preview. PDF and SVG exports always include the complete two-deck drawing set.
- Download PDF produces one portrait page with vector artwork and embedded Libre Franklin Medium/Bold text. Text is retained, not outlined. A PDF editor is required to edit the resulting PDF; use project JSON for ongoing edits in this app.
- Download editable SVG embeds the two fonts and retains text elements and vector geometry.
- Save project downloads JSON. Open saved project restores it. The browser also automatically saves to local storage; use JSON backups when changing browser, device or hosting address.

## Source of truth and drafting notes

The supplied BARCO 99 main/upstairs drawing PDFs take precedence over the written boat specification. Their labels 1–24 are preserved, despite the written count of 23 rooms. Source previews are available in the sidebar. The accommodation areas were manually reconstructed from those drawings and require visual review before client release. Fixtures and door swings are simplified; partition edits do not automatically adjust adjoining fixtures or doors. This is a schematic presentation drawing, not a measured survey or an evacuation plan.

150 ft × 44 ft are the supplied overall vessel dimensions. They establish the displayed envelope ratio only. Interior dimensions were not established by the supplied drawing plans. The editor identifies the layout as schematic / not to scale. The artwork itself uses only the approved floorplan design elements; no extra scale notes, dimension notes, keys or footnotes are added.

The approved AMIX, HELI, FOSS and RAINIER artwork establishes the print style: stone #e9e3db, orange #f05024, Libre Franklin typography and the VIFM Camps vector logo. Four extracted drawing colour schemes are available: AMIX teal #25585b, HELI forest #18331e, FOSS navy #0e3e51 and RAINIER burgundy #641a22. Ten complementary colours and a custom hex/native picker change the header, linework and labels together. Door swings are circular quarter arcs in final drawing coordinates; envelope adjustments never stretch them into ellipses. Safety routes from the source evacuation sheets were not carried into the accommodation presentation.

## GitHub Pages

Live app: https://mediaonemultimedia.github.io/vifm-floorplan-studio/


Commit the contents of this folder to the intended MediaOne repository (or a subfolder of it). The browser app is static: index.html, all root JavaScript files, style.css, .nojekyll, assets/ and vendor/ are all that hosting needs. GitHub Pages uses the Publish Studio workflow to package and deploy the site. All URLs are relative, so repository subpaths work. No credentials, CDN or external service is required at runtime. The app is hosted on GitHub Pages from mediaonemultimedia/vifm-floorplan-studio. Pushes to main run the checks and publish a versioned static package. Edits save in each visitor’s browser; Save project transfers them between browsers or devices. Sharing the app link opens the bundled starting drawing, not another visitor’s unsaved changes.

## Development

`npm test` runs the geometry/import/escaping checks. Runtime libraries are vendored for offline hosting. `npm ci` restores the exact export-library versions from the lockfile. The production bundle contains jsPDF 4.2.1 and svg2pdf.js 2.7.0; their license files are in vendor/.

The supplied VIFM Camps Logo.svg is used as vector paths. Font files were supplied by the project owner.

## Applied live-text style reference

The supplied style reference.svg controls the print type hierarchy and stroke relationships: bedroom numbers 30, room labels 11, deck captions 16, main strokes 3 and detail strokes 2 in its 327-unit deck width. They are scaled together to the 264-unit BARCO deck width. Utility labels use left alignment at the lower left, large communal labels are centred and bedroom labels align to the upper exterior-side corner. Narrow washroom labels use the reference’s compact 9-unit label size. Door thresholds are dashed at the original 4-unit proportion, with solid leaves and circular quarter swings. No extra notes or keys are printed.

### Door and partition cleanup

All doors share one fixed drawing size, independent of the vessel envelope ratio. The previous inconsistent openings are closed and the partitions are cut to the standardized openings, so solid walls stop at the jambs. Room labels are checked against swing clearance: a conflicting number moves to the left, then lower if both top corners are obstructed. Layout relationships follow the supplied plans; their imperfect drafting is corrected rather than copied literally. Door size is a schematic drawing convention, not a verified site measurement.

### Supplied sanitary and laundry symbols

The provided SVG reference items are retained in assets/symbols/ and rendered as vector artwork via symbols.js and fixtures.js. Uniform scaling preserves their proportions, stroke relationships and Libre Franklin washer/dryer lettering. Main-deck washrooms retain four stalls with three toilets and four showers, five hand basins, one washer and one dryer. Upstairs retains two shared toilet/shower compartments plus the separate staff sanitary bay (three toilets and three showers total), two urinals, five hand basins, one combined W/D and a laundry sink. Compartments and entries were cleaned up to accommodate the symbols; fixture counts follow the original supplied plans. Double-basin and door reference assets are retained for reuse.

The lower accommodation region is expanded relative to the upper open deck to give stalls and fixtures workable clearances. Within-stall toilet/shower relationships follow the supplied original plans, including the reversed second compartments. Each sink bank is one extended double-sink reference counter with five evenly spaced basins. The supplied WD combo is used upstairs. Dock/ramp and muster symbols use the supplied reference artwork; the cook-house boundary is aligned and its label is centred over the upper room’s full logical extent, ignoring the doorway gap for centring.

The secondary dock reference is adapted into page-space geometry: the ramp hugs the correct hull side, its length follows BARCO's landing positions, DOCK is centred in the usable landing and the muster symbol sits inside that landing. Labels remain upright. The stair audit includes four main-deck runs and five upstairs runs, with lengths and tread orientations taken from the respective source plan. The separate sanitary bay between upstairs rooms 3 and 2 is included, with its shower and toilet against the outside wall, a deeper compartment and a clear entrance. Rooms 19/20 gain width at the washroom boundary, with space taken from 24/16; two urinals sit side by side on an aligned backing wall within the washroom. Common washroom entries remain open so their swing paths do not obstruct fixtures. Washer/dryer lettering stays upright when the appliance outlines rotate.

### Completed source audit

Both supplied drawing PDFs were reviewed at enlarged resolution. Corrected items include the two missing upstairs stair runs, separate staff sanitary bay, toilet cistern directions and lateral offsets, upstairs laundry sequence, exterior accommodation doors, cook-house side doors and dry-room end-deck clearance. All doors retain the same circular 24-unit swing and dotted threshold. Open passages in the source remain passages; safety routes and equipment from the evacuation sheet are intentionally excluded from the approved presentation style. The room-20/washroom width adjustment, aligned cook-house wall, slim main-deck shower and adapted dock layout are retained. Real Libre Franklin advance widths fit labels away from walls.

The bundled assets/barco99.json preserves the reviewed Charcoal drawing and user-edited labels as the starting project for new visitors. It contains no server state.

## Pinned feedback and published updates

Choose Feedback, then click either floorplan or dock to drop a numbered pin. Write the requested change in the right panel. Every note records its vessel, deck, page coordinates, source drawing coordinates, nearby labels, optional target element and published revision. Pins are editor overlays and never enter PDF or SVG exports. Notes save on that browser/device; they are not sent anywhere automatically.

Copy feedback for chat produces a report to paste into the Codex conversation. Download feedback + drawing includes the note data and current editable project, useful when the local drawing has also been edited. Notes can be reopened, resolved or deleted. The static site has no chat credentials or automatic link into a Codex conversation.

The Studio checks for published changes every 45 seconds and on returning to the tab. When not typing or dragging it reloads an available release automatically. A three-way merge applies published changes while keeping independent local edits; local edits win if both changed the same field. A backup is kept under the local storage key ending in `.before-published-update`. Notes are stored separately and survive updates. The Feedback panel also provides a manual update check. New releases are packaged by the Publish Studio workflow, which versions all module and stylesheet URLs so stale cached code cannot override an updated drawing.

The shower-only main stall is narrower than the adjoining toilet/shower stalls; its shower is the same size as all other showers. Dividers provide equal clearance at both ends.

The staff bathroom entry opens into a clear landing; its full-size shower is beyond the doorway at the outside corner. The two cook-house side-wall sections share one alignment and the staff cabin/bathroom front wall is continuous between standardized openings.
