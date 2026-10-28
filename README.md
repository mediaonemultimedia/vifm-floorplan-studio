# VIFM Floorplan Studio

A motion-free editor for VIFM accommodation floorplans, hosted as a static GitHub Pages app. Includes BARCO 99, the sketch-based ODYSSEY 102 draft and a new-floorplan intake. Editing, source intake and portable chat briefs work without an account. Direct draft generation uses a separately deployed, authenticated Cloudflare Worker and the OpenAI API; production account setup is still pending.

## Run locally

From this folder, run:

```sh
python3 -m http.server 4173 --bind 127.0.0.1
```

Open http://127.0.0.1:4173. Use an HTTP server; opening index.html directly as a file will block the local font and logo requests.

## Edit and export

- Choose a boat in the sidebar. Each boat has its own saved drawing, colours, shared styles and feedback.
- Select text to edit its content, position and style role. Text hierarchy changes every matching role on both floors together. Drag to move; arrow keys nudge; Shift increases the nudge.
- Use Centre in an area for intentionally centred labels. Editable area bounds keep multiline text centred horizontally and vertically as its shared size changes. Edge and corner labels keep their established alignment.
- Choose an annotation tool and click a deck to place text, arrows, first-aid symbols, muster markers, a wall line or four independent walls. Duplicate or delete selected elements in Properties.
- Every structural wall is an independent line. Select one to drag it, drag either endpoint, edit endpoint coordinates or delete it. Square caps extend beyond endpoints for clean corners. Fixtures, doors and adjacent walls remain separate; review the whole room after moving a wall.
- Line styles separately control main walls, secondary lines, fixture/stair/door details, dotted thresholds and dot/gap length. Each setting applies throughout both floors.
- Interior coordinates are drawing units, **not measurements in feet**. BARCO envelope dimensions can adjust its width; Odyssey dimensions are metadata because its reviewed sketch geometry has its own proportions.
- Undo is available in the header and with Command/Ctrl+Z outside text fields. Text fields retain normal text undo.
- Both/Lower/Upper tabs control the preview. PDF and SVG exports include all populated floors; a new single-floor draft omits the empty upper floor from the artwork.
- Download PDF produces one portrait page with vector artwork and embedded Libre Franklin Medium/Bold text. Text is retained, not outlined. A PDF editor is required to edit the resulting PDF; use project JSON for ongoing edits in this app.
- Download editable SVG embeds the two fonts and retains text elements and vector geometry.
- Save project downloads JSON. Open saved project restores it. The browser also automatically saves to local storage; use JSON backups when changing browser, device or hosting address.

## Start a new floorplan

1. Choose **New floorplan**. Enter the boat name and explain the layout, connections, facilities, reliable references and unresolved details. Length, beam, room count and floor count may remain unknown. The editor supports up to two floor drawings.
2. Add plans, sketches, photos, walkthrough videos or written information: PDF, SVG, browser-supported images/video, TXT, MD, CSV or JSON. Set each reference's type, floor/coverage and explanatory note. Source limits are 24 files, 100 MB each and 300 MB total; PDFs submitted for generation must be 10 MB or smaller.
3. For a video, extract 4, 8 or 12 timestamped stills, review them and remove unhelpful frames. Only retained stills are sent for generation; audio is not transcribed. Browser media support varies, so convert unsupported files to JPEG/PNG or MP4.
4. Use **Save intake** to return later in the same browser. **Copy brief for chat** or **Download brief** provides the explanation, reference manifest and shared drawing rules. Paste it into this conversation and attach the listed original files separately; the brief does not include upload bytes or post to chat automatically.
5. After [one-time Worker activation](server/README.md#one-time-activation), open **Generation connection**, enter the Worker address and Studio access code, and choose **Check and save connection**. Then choose **Generate draft in Studio**. Keep the OpenAI API key on the Worker.
6. A validated result opens as a separate editable boat under **Boat**, with its own V1 draft and feedback. Review the evidence, flagged uncertainties and actual PDF before client release. Unsupported or failed geometry leaves existing drawings intact. BARCO V1/V2 and Odyssey remain separate.

The intake, original uploads and selected video stills persist in this browser's IndexedDB. Generated drawings and their Boat entries use local storage. Save project JSON for a portable editable drawing; it contains the reference manifest, **not original source files**. Keep separate backups of those files. There is no shared cloud project library or cross-device source sync.

Direct generation is implemented but is **not live yet**: no Cloudflare/OpenAI credentials or production Worker were provisioned during the build. Local end-to-end verification used a synthetic response to test the upload-to-editor contract; it does not establish real model drawing quality. See [the backend setup and verification boundary](server/README.md).

## Source of truth and drafting notes

The supplied BARCO 99 main/upstairs drawing PDFs take precedence over the written boat specification. Their labels 1–24 are preserved, despite the written count of 23 rooms. Source previews are available in the sidebar. The accommodation areas were manually reconstructed from those drawings and require visual review before client release. Fixtures and door swings are simplified; partition edits do not automatically adjust adjoining fixtures or doors. This is a schematic presentation drawing, not a measured survey or an evacuation plan.

150 ft × 44 ft are the supplied overall vessel dimensions. They establish the displayed envelope ratio only. Interior dimensions were not established by the supplied drawing plans. The editor identifies the layout as schematic / not to scale. The artwork itself uses only the approved floorplan design elements; no extra scale notes, dimension notes, keys or footnotes are added.

The approved AMIX, HELI, FOSS and RAINIER artwork establishes the print style: stone #e9e3db, orange #f05024, Libre Franklin typography and the VIFM Camps vector logo. Four extracted drawing colour schemes are available: AMIX teal #25585b, HELI forest #18331e, FOSS navy #0e3e51 and RAINIER burgundy #641a22. Ten complementary colours and a custom hex/native picker change the header, linework and labels together. Door swings are circular quarter arcs in final drawing coordinates; envelope adjustments never stretch them into ellipses. Safety routes from the source evacuation sheets were not carried into the accommodation presentation.

## GitHub Pages

Live app: https://mediaonemultimedia.github.io/vifm-floorplan-studio/


Commit the contents of this folder to the intended MediaOne repository (or a subfolder of it). The browser app is static: index.html, all root JavaScript files, style.css, generation-config.json, .nojekyll, assets/ and vendor/ are all that hosting needs. GitHub Pages uses the Publish Studio workflow to package and deploy the site. All URLs are relative, so repository subpaths work. Editing, export and intake require no credentials, CDN or external service. Direct generation calls the separately activated Worker; its secrets never belong in the public site. The app is hosted on GitHub Pages from mediaonemultimedia/vifm-floorplan-studio. Pushes to main run the checks and publish a versioned static package. Edits save in each visitor’s browser; Save project transfers them between browsers or devices. Sharing the app link opens the bundled starting drawing, not another visitor’s unsaved changes.

## Development

`npm test` runs the geometry/import/escaping checks. Runtime libraries are vendored for offline hosting. `npm ci` restores the exact export-library versions from the lockfile. The production bundle contains jsPDF 4.2.1 and svg2pdf.js 2.7.0; their license files are in vendor/.

The supplied VIFM Camps Logo.svg is used as vector paths. Font files were supplied by the project owner.

## Applied live-text style reference

The supplied style reference.svg controls the print type hierarchy and stroke relationships: bedroom numbers 30, room labels 11, deck captions 16, main strokes 3 and detail strokes 2 in its 327-unit deck width. They are scaled together to the 264-unit BARCO deck width. The original utility labels use lower-left alignment; the later owner-edited BARCO proof establishes lower-right alignment for its service strips. Large communal labels are centred and bedroom labels align to the upper exterior-side corner unless the documented door-clearance rules apply. Narrow washroom labels use the reference’s compact 9-unit label size. Door thresholds are dashed at the original 4-unit proportion, with solid leaves and circular quarter swings. No extra notes or keys are printed.

### Door and partition cleanup

All doors share one fixed drawing size, independent of the vessel envelope ratio. The previous inconsistent openings are closed and the partitions are cut to the standardized openings, so solid walls stop at the jambs. Room labels are checked against swing clearance: a conflicting number moves to the left, then lower if both top corners are obstructed. Layout relationships follow the supplied plans; their imperfect drafting is corrected rather than copied literally. Door size is a schematic drawing convention, not a verified site measurement.

### Supplied sanitary and laundry symbols

The provided SVG reference items are retained in assets/symbols/ and rendered as vector artwork via symbols.js and fixtures.js. Uniform scaling preserves their proportions, stroke relationships and Libre Franklin washer/dryer lettering. Main-deck washrooms retain four stalls with three toilets and four showers, five hand basins, one washer and one dryer. Upstairs retains two shared toilet/shower compartments plus the separate staff sanitary bay (three toilets and three showers total), two urinals, five hand basins, one combined W/D and a laundry sink. Compartments and entries were cleaned up to accommodate the symbols; fixture counts follow the original supplied plans. Double-basin and door reference assets are retained for reuse.

The lower accommodation region is expanded relative to the upper open deck to give stalls and fixtures workable clearances. Within-stall toilet/shower relationships follow the supplied original plans, including the reversed second compartments. Each sink bank is one extended double-sink reference counter with five evenly spaced basins. The supplied WD combo is used upstairs. Dock/ramp and muster symbols use the supplied reference artwork; the cook-house boundary is aligned and its label is centred over the upper room’s full logical extent, ignoring the doorway gap for centring.

The secondary dock reference is adapted into page-space geometry: the ramp hugs the correct hull side, its length follows BARCO's landing positions, DOCK is centred in the usable landing and the muster symbol sits inside that landing. Labels remain upright. The stair audit includes four main-deck runs and five upstairs runs, with lengths and tread orientations taken from the respective source plan. The separate sanitary bay between upstairs rooms 3 and 2 is included, with its shower and toilet against the outside wall, a deeper compartment and a clear entrance. Both decks share the accommodation footprint; the upstairs urinals stack along the shower-block backing wall. Common washroom entries remain open so their swing paths do not obstruct fixtures. Washer/dryer lettering stays upright when the appliance outlines rotate.

### Completed source audit

Both supplied drawing PDFs were reviewed at enlarged resolution. Corrected items include the two missing upstairs stair runs, separate staff sanitary bay, toilet cistern directions and lateral offsets, upstairs laundry sequence, exterior accommodation doors, cook-house side doors and dry-room end-deck clearance. All doors retain the same circular 24-unit swing and dotted threshold. Open passages in the source remain passages; safety routes and equipment from the evacuation sheet are intentionally excluded from the approved presentation style. The aligned cook-house wall, narrower shower-only stall with a full-size shower, and adapted dock layout are retained. Real Libre Franklin advance widths fit labels away from walls.

The bundled assets/barco99.json preserves the reviewed Charcoal drawing and user-edited labels as the starting project for new visitors. It contains no server state.

## Pinned feedback and published updates

Choose Feedback, then click either floorplan or dock to drop a numbered pin. Write the requested change in the right panel. Every note records its vessel, deck, page coordinates, source drawing coordinates, nearby labels, optional target element and published revision. Pins are editor overlays and never enter PDF or SVG exports. Notes save on that browser/device; they are not sent anywhere automatically.

Copy feedback for chat produces a report to paste into the Codex conversation. Download feedback + drawing includes the note data and current editable project, useful when the local drawing has also been edited. Notes can be reopened, resolved or deleted. The static site has no chat credentials or automatic link into a Codex conversation.

The Studio checks for published changes every 45 seconds and on returning to the tab. When not typing or dragging it reloads an available release automatically. Saved snapshots are upgraded as complete layouts before a three-way merge applies published changes. Independent text, colour and annotation edits remain local; layout migrations replace incompatible older accommodation walls together with their connected geometry. Within the same layout revision, local edits win field conflicts. A backup is kept under the local storage key ending in `.before-published-update`. Notes are stored separately and survive updates. The Feedback panel also provides a manual update check. New releases are packaged by the Publish Studio workflow, which versions all module and stylesheet URLs so stale cached code cannot override an updated drawing.

The shower-only main stall is narrower than the adjoining toilet/shower stalls; its shower is the same size as all other showers. Dividers provide equal clearance at both ends.

The staff bathroom entry opens into a clear landing; its full-size shower is beyond the doorway at the outside corner. The two cook-house side-wall sections share one alignment and the staff cabin/bathroom front wall is continuous between standardized openings.

The two long upstairs exterior stair runs use a consistent 24-unit width and a 36-unit clear landing at the doorway. Treads stop before each landing, with the landing extending beyond both door jambs. These are drawing conventions rather than measured site dimensions.

Fixture orientation follows the backing wall: the main sink bank’s faucets face left, while the upstairs sink bank and laundry sink faucets face right. Counter and appliance backs share an alignment. Both dry-room stairs have the same clear top-landing treatment as the long exterior stairs, covering the doorway without treads beneath it.

The approved drawing conventions and layout exceptions are recorded in [DESIGN.md](DESIGN.md). Dock proportions now match the supplied dock artwork and AMIX precedent, with equal muster padding and balanced page margins.

Matching bedroom rows share one baseline when any member needs lower placement. Legacy rendering and export normalize the complete layout so current fixtures cannot be combined with older partitions.

## Odyssey working draft and shared editing system

Odyssey uses the reviewed hand-sketch interpretation. The first two photos join at the bench area to form the lower level; the shorter upper level contains the helipad, office and weight room. The 43 × 35 ft pad anchors its proportions. Only the ten bedrooms visible in the sketches are drawn, with provisional L1–L5/R1–R5 identifiers. The written twenty-room count, floor naming and other uncertain connections remain unresolved. Nine pinned review notes appear in Feedback and stay outside exports. All four original sketch photos are available in Source drawings.

Boat navigation, typography roles, line controls, wall editing, area centring, feedback and export use the same editor for the bundled boats and new generated drafts. Values are saved per boat, so changing one drawing does not silently restyle another. The existing BARCO save is migrated to independent lines while preserving its text, colour and feedback coordinates; the original v1 browser save remains as a backup. Save project downloads the complete editable drawing state. New-floorplan media intake and the separately activated generation service are described above.

Release validation includes geometry/import/storage tests, browser checks of both boats, live shared-size and endpoint edits, responsive layout, and real PDF-button exports. Both exported faces retain their supplied Libre Franklin identities, embedded fonts, live text, vectors and square caps.

The owner subsequently confirmed BARCO's cook house is downstairs only (27 October 2026). The upstairs copy's footprint, partitions, doors and label are omitted, including when opening a previously saved editor project. The barge perimeter and other upstairs spaces remain. This confirmation supersedes the duplicated cook-house representation in the source sheets.

## Drawing revisions and BARCO V2

Use Drawing revision beneath the boat picker to switch versions. BARCO defaults to V2, with V1 retained as an archived, read-only drawing. Both versions can export PDF/SVG/project files, with V1/V2 in their filenames. Revision controls are shared across boats; Odyssey currently has its editable V1 draft. Revision labels and review notes remain outside the printed artwork.

Before creating a visitor's first V2, the Studio freezes a copy of that browser's existing V1, including local edits. V2 begins from that copy with the review corrections applied. V2 drawings, notes and published bases use separate browser keys. V1 is never replaced by V2 edits or automatic updates. New visitors use the frozen published V1 baseline in assets/revisions/barco99-v1.json. Its rendered SVG is regression-checked against commit ab870fa. The original unversioned browser keys remain available as backups.

View change log records all twelve PDF comments with their original wording and a disposition: ten corrections, one confirmation already carried out in V1, and one downstairs cook-house arrangement awaiting more source information. That pending item is also pinned in Feedback. V2 aligns matching bedroom labels, balances 14/6 and 24/16 padding, right-aligns OFFICE, uses lighter fixture strokes, gives every shower the same 90% size with visible clearance, and clips stair/landing outlines at actual door thresholds. Flight and landing positions remain intact.


## Owner-edited V2 evidence review

The owner subsequently supplied a manually revised V2 proof. [The comparison record](docs/reviews/2026-10-27-barco-manual-v2.md) distinguishes the changed layout, unchanged typography and unresolved staff-area details. Its reusable rules are incorporated into DESIGN.md. This evidence review does not replace either published drawing revision.
