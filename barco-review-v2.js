import {prepareEditorProject} from './editor-project.js';
import {accommodationRooms} from './accommodation.js';
import {planPoint,sourcePoint} from './model.js';
import {REFERENCE} from './reference-style.js';
import {textWidth} from './font-metrics.js';
import {FONT_CAP_HEIGHT} from './theme.js';
const SOURCE_COMMENTS=[{"id":"57f4d27a-790d-ec43-95ae-4bb2402105a6","text":"this dotted line is a bit off","pagePin":{"x":307.595,"y":236.216},"replyTo":null},{"id":"6d28605e-d682-b946-a3ff-3cc7e4773eae","text":"align these numbers in the bottom right of their rooms","pagePin":{"x":723.876,"y":388.68100000000004},"replyTo":null},{"id":"ebffd61c-0fe3-8744-b173-55a0feb7fea3","text":"We're going to need some more information for this section, doesn't make sense with what they gave us","pagePin":{"x":216.23,"y":467.48299999999995},"replyTo":null},{"id":"8065561d-23c2-9e48-9ce9-6d2edb62dfd5","text":"the stroke widths of all interior elements should be thinner than the walls. Toilets, showers, sinks, etc","pagePin":{"x":267.623,"y":925.45},"replyTo":null},{"id":"6a1ba6f8-2d94-3c4a-bb07-86c75f1b2ea3","text":"keep these numbers consistent where possible, top left vs top right","pagePin":{"x":149.342,"y":616.585},"replyTo":null},{"id":"34cf6d52-779f-dc43-969a-dd8db95f1615","text":"even out padding for these numbers","pagePin":{"x":673.039,"y":832.79},"replyTo":null},{"id":"d7892ae2-548d-ce4c-967b-0506fc842a7e","text":"remove items from lower floor","pagePin":{"x":527.61,"y":444.09900000000005},"replyTo":null},{"id":"6b6725cd-d356-a740-91a4-c5c37658760e","text":"disconnect these from wall","pagePin":{"x":576.56,"y":897.802},"replyTo":null},{"id":"adf60330-8580-2443-9940-d04e3fc0e6f0","text":"keep numbers sligned the same where possible","pagePin":{"x":541.817,"y":1097.175},"replyTo":null},{"id":"ea38c749-0850-fc4c-957d-d20ce471ac80","text":"right allign","pagePin":{"x":314.363,"y":432.63199999999995},"replyTo":null},{"id":"5c59008b-8424-e441-b902-d77d2c89489e","text":"door is walled off here","pagePin":{"x":504.232,"y":725.649},"replyTo":null},{"id":"a19c3f6c-cb01-334e-be27-641caa56c2c3","text":"walled off door","pagePin":{"x":708.338,"y":981.562},"replyTo":"941c1348-3446-3d48-8b84-742f79fc5b8a"}];
export const BARCO_REVIEW_CHANGES=[
 ['01','done','Align generator-room dotted threshold with its opening','The landing outline is cut at the exact door endpoints, so it no longer competes with the threshold.'],
 ['02','done','Staff rooms 1–4: bottom-right numbers','Matching right padding and clear lower placement throughout the staff-room stack.'],
 ['03','waiting','Cook-house internal arrangement needs confirmation','The reviewer needs more information about this downstairs section. Its layout is retained pending clarification.'],
 ['04','done','Thinner interior fixture strokes','Fixture, stair and door-detail strokes are distinct from the heavier structural walls.'],
 ['05','done','Consistent forward bedroom numbers','11/12/13 and 21/22/23 share top-right placement and one baseline per row.'],
 ['06','done','Even padding around the 14/6 and 24/16 divider','Equal visible ink clearance on both sides of the separating wall.'],
 ['07','carried','Cook house exists downstairs only','Confirmed in V1: the upstairs footprint, interior walls, doors and label are omitted. The PDF note says lower floor, but is pinned upstairs; the owner’s explicit clarification takes precedence.'],
 ['08','done','Separate shower symbols from walls','All seven showers use one common size, reduced uniformly to 90%, with visible clearance.'],
 ['09','done','Consistent aft bedroom numbers','8/7/5 and 18/17/15 share bottom-right placement and a common baseline.'],
 ['10','done','Right-align the office label','Office text sits at the lower right with clear wall padding.'],
 ['11','done','Open the upper left stair landing doorway','Remove landing-edge strokes across the real threshold; retain the landing and treads.'],
 ['12','done','Open the upper right stair landing doorway','Use the same doorway clearance rule on the opposite stair.']
].map(([id,status,title,text],i)=>({id,status,title,text,sourceComment:SOURCE_COMMENTS[i].text,sourceNoteId:SOURCE_COMMENTS[i].id,pagePin:SOURCE_COMMENTS[i].pagePin}));
export function applyBarcoReviewV2(input){
 const p=prepareEditorProject(input);
 if(p.id!=='barco99')throw Error('This review applies to BARCO 99.');
 if(p.barcoReviewRevision===2)return p;
 p.drawingRevision='v2';p.barcoReviewRevision=2;p.clearStairEntries=true;p.showerScaleFactor=.9;
 p.theme.lines.detail=Math.max(.2,Math.min(p.theme.lines.detail,p.theme.lines.wall*.4,.95));
 p.revisionMeta={label:'V2 · PDF review',date:'2026-10-27',summary:'PDF comments actioned as a separate revision. Ten corrections, one earlier confirmation and one item awaiting source clarification.',changes:structuredClone(BARCO_REVIEW_CHANGES)};
 const staff={1:[496,278,48,75],2:[458,278,38,75],3:[357,278,37,75],4:[320,278,37,75]},size=p.theme.text.room,inset=REFERENCE.inset;
 for(const d of p.decks){
  const rooms={...accommodationRooms(d.id),...(d.id==='upper'?staff:{})};
  const top=d.id==='main'?['11','12','13','6']:['21','22','23','16'];
  const bottom=d.id==='main'?['8','7','5','14']:['18','17','15','24','1','2','3','4'];
  for(const a of d.labels){
   if(!top.includes(a.text)&&!bottom.includes(a.text))continue;
   const [x,y,w,h]=rooms[a.text],tl=planPoint(x+w,y,p),br=planPoint(x,y+h,p),lower=bottom.includes(a.text);
   const pair=['14','6','24','16'].includes(a.text),reserved=pair?textWidth('24',size):textWidth(a.text,size),horizontalInset=Math.min(inset,(br.x-tl.x-reserved)/2);
   Object.assign(a,sourcePoint(br.x-horizontalInset,lower?br.y-inset:tl.y+inset+size*FONT_CAP_HEIGHT,p),{align:'end',placementRule:lower?'bottom-right-review':'top-right-review'});delete a.centerArea;
  }
 }
 const office=p.decks[0].labels.find(a=>a.text==='OFFICE'||(a.kind==='label'&&a.x>402&&a.x<448&&a.y>278));
 if(office){const right=planPoint(402,353,p).x,q=planPoint(office.x,office.y,p);Object.assign(office,sourcePoint(right-REFERENCE.inset*.55,q.y,p),{align:'end'});delete office.centerArea;}
 p.reviewFlags=[...p.reviewFlags.filter(f=>f.id!=='barco-cook-house-info'),{id:'barco-cook-house-info',title:'Cook-house source clarification',text:BARCO_REVIEW_CHANGES[2].text,deckId:'main',x:100,y:245}];
 return p;
}
