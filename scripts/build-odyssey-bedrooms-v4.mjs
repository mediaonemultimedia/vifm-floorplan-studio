import fs from 'node:fs';
import {applyBedroomLayout} from '../odyssey-bedrooms.js';
import {prepareOdysseyV4Hull,ODYSSEY_TEN_BEDROOM_BLOCK} from '../odyssey-hull-v4.js';
import {validateEditorProject} from '../editor-project.js';
const p=applyBedroomLayout(prepareOdysseyV4Hull(JSON.parse(fs.readFileSync(new URL('../assets/revisions/odyssey102-v3.json',import.meta.url)))),ODYSSEY_TEN_BEDROOM_BLOCK);
p.drawingRevision='v4';p.length=130;p.width=46;
p.revisionMeta={label:'V4 · Ten rooms / 46 × 130',date:'2026-11-16',summary:'The owner corrected the lower accommodation to ten bedrooms, five per side, and required the actual lower outline to follow the 46 ft beam by 130 ft length. This supersedes the earlier eight-room instruction while preserving V1–V3.',changes:[
 {id:'ten-bedrooms',title:'Ten lower bedrooms, five per side',text:'L1–L5 and R1–R5 form five paired rows. Each has a bed, pillow, desk, supplied chair, closet and inward-opening door. These identifiers remain provisional, not surveyed room numbers.',status:'done'},
 {id:'hull-ratio',title:'Lower outline matches 46 × 130',text:'The complete lower outline includes its rear platform: 928.5 units along by 928.5 × 46 / 130 units across. This fixes the actual geometry rather than only changing dimension fields. Individual room and fixture dimensions remain schematic.',status:'done'},
 {id:'consistent-rooms',title:'Common furniture and standard doors',text:'All ten bedrooms use the same furniture sizes and alternating bed/desk arrangement, mirrored across the hall. Bedroom door radii remain 24 drawing units, matching the existing standard doors. Furniture and doors keep their V3 sizes. The lower outline is widened around the existing arrangements; the upper floor is translated into the same reference frame without changing its shape.',status:'done'},
 {id:'preserved-v3',title:'Preserve the eight-room history',text:'V3 remains available as a read-only archive. The new working revision carries forward local colour, typography, custom label text, annotations and review notes using the shared revision workflow.',status:'done'}]};
p.reviewFlags=p.reviewFlags.filter(f=>f.id!=='odyssey-v2-room-count');
const dimensions=p.reviewFlags.find(f=>f.id==='odyssey-v2-dimensions');
dimensions.title='Hull ratio fixed; internal measurements unverified';dimensions.text='The lower hull follows the supplied 46 ft by 130 ft proportion and the helipad retains 43:35. Individual room sizes, stair elevations, hull form and physical door/fixture dimensions have not been surveyed.';
p.sourceSummary='Ten lower bedrooms are confirmed: five on each side of the central hall. The drawn lower outline now follows 46 ft wide by 130 ft long. This V4 instruction supersedes the eight-room V3; earlier drawings remain archived. Other sketch uncertainties remain in Feedback.';
p.notes='Ten lower bedrooms, five per side. Lower hull ratio 46:130. Rear platform included; upper shape retained; internal dimensions remain schematic.';
validateEditorProject(p);
fs.writeFileSync(new URL('../assets/revisions/odyssey102-v4.json',import.meta.url),JSON.stringify(p,null,2)+'\n');
console.log(`Built Odyssey V4: ${p.decks[0].labels.filter(a=>a.kind==='room').length} bedrooms, ${p.bounds.width} × ${p.bounds.height} drawing units.`);
