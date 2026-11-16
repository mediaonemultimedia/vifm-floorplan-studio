import fs from 'node:fs';
import {applyOdysseyLayoutV6} from '../odyssey-layout-v6.js';
import {validateEditorProject} from '../editor-project.js';
import {lintProject,lintReport} from '../plan-lint.js';
const read=f=>JSON.parse(fs.readFileSync(new URL('../'+f,import.meta.url)));
const p=applyOdysseyLayoutV6(read('assets/revisions/odyssey102-v5.json'));
p.drawingRevision='v6';
p.revisionMeta={label:'V6 · Layout logic pass',date:'2026-11-16',summary:'Apply the shared layout logic: upper walls stack on the lower walls, one stair footprint per pair, enclosed rooms with doors, and every space the client brief names.',changes:[
 {id:'stacked-walls',title:'Upper exterior walls stack on the lower walls',text:'The upper building now uses the 46 ft lower walls from the pad to the bow. The 43 ft helipad stays inset on the roof. The office, pump room and first-aid room widen to the new walls, with their contents recentred.',status:'done'},
 {id:'stair-d',title:'Accommodation stair has one footprint',text:'The upper flight now sits directly over the lower flight. Its top lands in an open stair hall with a clear path to the weight room, lounge and upper hallway, replacing the walled walkway and the extra hallway door.',status:'done'},
 {id:'brief-spaces',title:'Spaces from the client brief',text:'Labelled DRY ROOM (lower entry with benches), FIRST AID (desk, cabinets and sink), a new LOUNGE with couch, and WASHROOM on both floors. The lounge position is inferred and flagged.',status:'done'},
 {id:'fuel-bay',title:'Fuel bay opens onto its low deck',text:'The line under the JET tank was the top edge of the MIXED and STRAIGHT GAS boxes, not a wall. The bay now opens to the area reached by the short flight down. The corridor wall meets the rear wall and the stair entry.',status:'done'},
 {id:'doors',title:'Doors follow the rules',text:'The centre stair door opens out, away from its landing (review note 22). The utility room is enclosed with its own door, and the starboard exit moves down to clear it. The copied upper forward exit is closed because it opened onto a drop.',status:'done'},
 {id:'labels',title:'Labels inside the building',text:'PUMP moves inside beside the pump. Utility, exit and stair labels follow their rooms.',status:'done'}]};
p.sourceSummary='Twenty single rooms: ten on each floor. Upper walls stack on the lower 46 ft walls with the 43 ft helipad inset on the roof. The client brief places the dry room downstairs and the lounge and first aid upstairs; their exact positions are inferred and flagged.';
p.notes='20 bedrooms, 10 per floor. One lower and two upper W/D sets. V6 applies LAYOUT-LOGIC.md; lounge, first aid, centre stair and upper exit are flagged.';
validateEditorProject(p);
fs.writeFileSync(new URL('../assets/revisions/odyssey102-v6.json',import.meta.url),JSON.stringify(p,null,2)+'\n');
const issues=lintProject(p,read('briefs/odyssey102.json'));
console.log('Built Odyssey V6.\n'+lintReport(issues));
