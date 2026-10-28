# VIFM Floorplan Studio

## Purpose

Create and revise editable VIFM accommodation presentation floorplans from supplied evidence. The public Studio includes reviewed BARCO revisions and an Odyssey sketch draft, and accepts new boat references through **New floorplan**. The output is a schematic presentation drawing, not a measured survey, construction plan or evacuation plan.

## Confirmed workflow

- Enter a boat name, explanation, known vessel dimensions, room count and one/two-floor coverage. Unverified dimensions and counts may remain blank. Supply at least one reference or a written layout explanation.
- Upload plans, images, SVGs, PDFs, walkthrough videos and text files. Each reference retains its identity, role, floor/coverage and note. Browser-supported media can be prepared for generation; unsupported formats require conversion.
- Optionally extract 4, 8 or 12 timestamped stills from a walkthrough and review/remove frames. Codex handoffs include original videos and any selected stills. Direct API generation sends only selected stills; the Studio does not transcribe audio.
- **Create with Codex** is the default. Save the intake locally, copy/download the prompt, or download one ZIP containing original references, retained video stills, intake facts, the reference manifest, current design/product learning, schema and repository instructions. Unzip it and give the extracted folder to Codex. Text-only prompt copies require separate source attachments. No Studio access code or separate API key is needed for this route; the Studio does not post into an existing chat or inherit its context.
- The prompt directs Codex to study connected spaces, question uncertainty, reuse the universal editor, preserve boat/revision history, validate geometry and PDF artwork, then commit/push and verify publication in the shared MediaOne repository. A published boat is registered in the shared Boat menu. General design improvements are recorded in shared code and documentation; confirmed vessel exceptions remain local to that boat. Private sources require approval before publication. A handoff download itself makes no repository changes.
- Optional **Generate here** uses an authenticated Cloudflare Worker backed by the OpenAI Responses API. The Worker receives prepared evidence and requests strict structured geometry; the browser validates and compiles it into the existing editable project format. This route produces a local draft and does not publish a new shared boat.
- Open an accepted draft as a separate local boat with an editable V1 drawing, evidence summary and uncertainty feedback. Resolve conflicts against the references and review the exported PDF before client release. Existing BARCO V1/V2 and Odyssey drawings remain separate.

## Product constraints

The existing editor supports main and upper floor slots. Single-floor output omits its empty upper slot. Unknown rooms, floors and connections remain unresolved; a stated room count does not authorize invented rooms. Explicit owner corrections take precedence, and source plans establish topology ahead of conflicting prose. [DESIGN.md](DESIGN.md) records the shared artwork rules and the BARCO/Odyssey learning history.

Generated drawings use the same typography roles, symbols, independent square-capped wall lines, editing controls, feedback and PDF/SVG export system as the bundled boats. The model returns geometry, not executable markup or raw SVG. Review notes, missing dimensions and uncertainty stay outside printed artwork. A generated draft is not automatically verified.

The source intake accepts up to 24 files, 100 MB each and 300 MB total. Generation has narrower prepared-media limits: 18 MiB total payload, 32 images/video stills, PDFs of at most 10 MiB and text references of at most 200 KB. Images are normalized in the browser. Reference contents are evidence rather than instructions that can override the drawing contract.

Intake details, original uploads and selected stills persist in IndexedDB in the current browser. Generated project state and Boat navigation entries use local storage. Exported project JSON carries the reference manifest, not original source bytes. Portable drawings and original reference backups are separate responsibilities. Shared cloud project storage and cross-device source sync are outside this feature.

The public editor, intake and brief handoff remain usable without an account. Direct generation requires a separately configured Worker address and shared Studio access code; other users do not need Cloudflare or OpenAI accounts. The OpenAI API key stays on the Worker. The address is stored locally and the access code in tab-session storage by default. **Remember this device** opts into retaining the code in this browser across visits, bound to its Worker address, after successful verification. Unchecking the option removes the persistent copy; Disconnect forgets both copies. The Worker is stateless and does not save references or projects.

## Optional direct generation: verification remains open

The Worker was deployed on October 28, 2026 and its application secrets were entered privately. The owner did not retain the Studio access code; it needs replacement if that optional route is used. The default Codex handoff does not need that code. The [backend activation guide](server/README.md#one-time-activation) provides setup and optional GitHub Actions deployment details.

Local verification covers the intake-to-editor contract with a synthetic generation response. It does not demonstrate real model quality or production service readiness. After activation, complete a real generation and evidence/PDF review before treating the service as ready for client work.
