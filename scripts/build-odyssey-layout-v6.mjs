import fs from 'node:fs';
import {applyOdysseyLayoutV6} from '../odyssey-layout-v6.js';
import {validateEditorProject} from '../editor-project.js';
import {lintProject,lintReport} from '../plan-lint.js';
const read=f=>JSON.parse(fs.readFileSync(new URL('../'+f,import.meta.url)));
const p=applyOdysseyLayoutV6(read('assets/revisions/odyssey102-v5.json'));
p.drawingRevision='v6';
p.revisionMeta={label:'V6 · Layout logic pass',date:'2026-11-16',summary:'Apply the shared layout logic: upper walls stack on the lower walls, one stair footprint per pair, enclosed rooms with doors, and every space the client brief names.',changes:[
 {id:'stacked-walls',title:'Upper exterior walls stack on the lower walls',text:'The upper level now uses the 46 ft lower walls from the rear to the bow, and the pad edge lines up with them (review note 7, which V5 had undone). The office, pump room and first-aid room widen to the new walls, with their contents recentred.',status:'done'},
 {id:'stair-d',title:'Accommodation stair has one footprint',text:'The upper flight now sits directly over the lower flight. Its top lands in open lounge seating, with a door straight into the deeper weight room (review note 11) and an open path to the upper hallway. This replaces the walled walkway and the extra hallway door.',status:'done'},
 {id:'brief-spaces',title:'Spaces from the client brief',text:'Labelled DRY ROOM (the lower entry with benches), FIRST AID (desk, cabinets and sink), LOUNGE (seating at the top of the stair) and WASHROOM on both floors. The lounge and first-aid positions are inferred and flagged.',status:'done'},
 {id:'corridor',title:'Rear corridor closes cleanly',text:'The fuel-store wall now meets the rear wall, and the corridor end walls meet the stair entry, with no slivers. Tank-bay access is flagged.',status:'done'},
 {id:'doors',title:'Doors follow the rules',text:'The centre stair door opens out, away from its landing (review note 22). The utility room is enclosed with its own door, and the starboard exit moves down to clear it. The copied upper forward exit is closed because it opened onto a drop.',status:'done'},
 {id:'labels',title:'Labels inside the building',text:'PUMP moves inside beside the pump. Utility, exit and stair labels follow their rooms.',status:'done'}]};
p.sourceSummary='Twenty single rooms: ten on each floor. Upper walls stack on the lower 46 ft walls. The pad edge lines up with them. The client brief places the dry room downstairs and the lounge and first aid upstairs; their exact positions are inferred and flagged.';
p.notes='20 bedrooms, 10 per floor. One lower and two upper W/D sets. V6 applies LAYOUT-LOGIC.md; lounge, first aid, centre stair and upper exit are flagged.';
validateEditorProject(p);
fs.writeFileSync(new URL('../assets/revisions/odyssey102-v6.json',import.meta.url),JSON.stringify(p,null,2)+'\n');
const issues=lintProject(p,read('briefs/odyssey102.json'));
console.log('Built Odyssey V6.\n'+lintReport(issues));
