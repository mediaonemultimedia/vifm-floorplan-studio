import fs from 'node:fs';
import {applyEightBedroomLayout} from '../odyssey-bedrooms.js';
import {validateEditorProject} from '../editor-project.js';
const p=applyEightBedroomLayout(JSON.parse(fs.readFileSync(new URL('../assets/revisions/odyssey102-v2.json',import.meta.url))));
p.drawingRevision='v3';
p.revisionMeta={label:'V3 · Eight-room correction',date:'2026-11-16',summary:'Owner-confirmed eight lower-level bedrooms: four per side, with a common alternating bed/desk layout and closets opposite doorways on the hallway wall. Other floor geometry remains as in V2.',changes:[
 {id:'bedroom-count',title:'Eight rooms, four per side',text:'Removed the extra paired row while retaining the common room size. The schematic lower outline and end exit now stop after the fourth pair. L1–L4 and R1–R4 remain provisional location identifiers.',status:'done'},
 {id:'bedroom-layout',title:'One repeated bedroom layout',text:'A top doorway has a top bed and a bottom desk; the alternate room reverses that arrangement. Left and right rooms mirror across the central hallway.',status:'done'},
 {id:'bedroom-closets',title:'Closets opposite doors on the hallway wall',text:'Retained the closet relationship confirmed by the owner, coordinated with each doorway and the common room proportions.',status:'done'},
 {id:'bedroom-review',title:'Shared geometry for sketch and Studio',text:'The corrected review sketch and editor project use the same four-row geometry. Other walls, stairs, shared facilities and upper floor are unchanged from their respective review versions.',status:'done'},
 {id:'supplied-chair',title:'Use the owner-supplied desk-chair icon',text:'The supplied chair.svg replaces the draft chair symbol. Its proportions are retained, its facing follows the desk, and the renderer applies the shared drawing colour and fixture line weight.',status:'done'}]};
const flag=p.reviewFlags.find(a=>a.id==='odyssey-v2-room-count');flag.title='Eight lower bedrooms confirmed; other accommodation unlocated';flag.text='The owner confirmed eight lower-level bedrooms, four on each side of the hall. The written specification lists twenty; additional accommodation remains unlocated and has not been invented.';
p.sourceSummary='The owner confirmed eight lower-level bedrooms on 16 November: four per side with the same alternating bed/desk arrangement. V3 corrects that block; earlier revisions remain archived. Other source uncertainties remain in Feedback.';
p.notes='Eight lower bedrooms confirmed by the owner. Other V2 geometry retained.';
validateEditorProject(p);fs.writeFileSync(new URL('../assets/revisions/odyssey102-v3.json',import.meta.url),JSON.stringify(p,null,2)+'\n');
console.log('Built Odyssey V3 with',p.decks[0].labels.filter(a=>a.kind==='room').length,'bedrooms.');
