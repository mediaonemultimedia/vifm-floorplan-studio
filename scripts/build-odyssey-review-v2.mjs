import fs from 'node:fs';
import {cutWall} from '../wall-lines.js';
import {validateEditorProject} from '../editor-project.js';

const original=JSON.parse(fs.readFileSync(new URL('../assets/odyssey102.json',import.meta.url)));
const comments=JSON.parse(fs.readFileSync(new URL('../docs/reviews/2026-11-13-odyssey-v2-comments.json',import.meta.url)));
const archived=structuredClone(original);archived.drawingRevision='v1';archived.revisionMeta={label:'V1 · Before PDF review',date:'2026-10-27',summary:'Original sketch-led Odyssey draft, retained before the November PDF corrections.',changes:[]};
const p=structuredClone(original);p.drawingRevision='v2';
const [main,upper]=p.decks;
const wall=(d,id,x1,y1,x2,y2,role='wall')=>d.walls.push({id,role,x1,y1,x2,y2});
const line=(d,id,x1,y1,x2,y2,role='detail')=>d.details.push({id,kind:'line',role,width:1,x1,y1,x2,y2});
const door=(d,id,x,y,ux,uy,vx,vy)=>d.doors.push({id,x,y,u:[ux,uy],v:[vx,vy]});
const detail=(d,id,kind,values)=>d.details.push({id,kind,role:'secondary',width:1,...values});
const label=(d,id,text,area,rotation=0)=>d.labels.push({id,kind:'label',text,x:area.x+area.w/2,y:area.y+area.h/2,size:4.8,align:'middle',rotation,textStyle:'detail',centerArea:area});
const area=(d,id,values)=>Object.assign(d.labels.find(a=>a.id===id),{align:'middle',centerArea:values});
const setDetail=(d,id,values)=>Object.assign(d.details.find(a=>a.id===id),values);
const setLabel=(d,id,values)=>Object.assign(d.labels.find(a=>a.id===id),values);
const arrow=(d,id,x1,y1,x2,y2)=>d.details.push({id,kind:'stairArrow',role:'detail',width:1,x1,y1,x2,y2});
function doubleDoors(d,id,x,y){door(d,id+'-left',x,y,24,0,0,24);door(d,id+'-right',x+48,y,-24,0,0,24);}
function stairFlight(d,id,x,y,w,h,vertical,count){
 line(d,id+'-top',x,y,x+w,y,'secondary');line(d,id+'-bottom',x,y+h,x+w,y+h,'secondary');
 line(d,id+'-left',x,y,x,y+h,'secondary');line(d,id+'-right',x+w,y,x+w,y+h,'secondary');
 for(let i=1;i<count;i++)if(vertical)line(d,id+'-tread-'+i,x,y+h*i/count,x+w,y+h*i/count);else line(d,id+'-tread-'+i,x+w*i/count,y,x+w*i/count,y+h);
}

// Rebuild complete boundaries before clipping the common 24-unit openings.
main.walls=[];main.doors=original.decks[0].doors.filter(a=>/^main-door-(9|1[0-8])$/.test(a.id)).map(a=>({...a,u:a.u.map(n=>Math.sign(n)*24),v:a.v.map(n=>Math.sign(n)*24)}));
wall(main,'main-port-perimeter',0,0,0,892.5);wall(main,'main-starboard-perimeter',306,0,306,892.5);
wall(main,'main-rear-building-wall',0,0,306,0);
door(main,'main-rear-exit',165,0,-24,0,0,-24);
door(main,'main-generator-rear-entry',96.25,0,-24,0,0,-24);
wall(main,'main-generator-side-wall',124.25,0,124.25,269.45);
wall(main,'main-generator-workshop-divider',0,149.6,124.25,149.6);
wall(main,'main-workshop-divider',62.9,149.6,62.9,269.45);
wall(main,'main-workshop-left-front',0,269.45,62.9,269.45);
wall(main,'main-workshop-right-front',62.9,269.45,124.25,269.45);
doubleDoors(main,'main-workshop-left',7.45,269.45);doubleDoors(main,'main-workshop-right',69.575,269.45);
wall(main,'main-fuel-separation',169.15,7.65,169.15,261.95);
wall(main,'main-fuel-front-wall',169.15,261.95,306,261.95);
wall(main,'main-central-upper-entry-wall',130.9,242,164.9,242);
door(main,'main-stair-a-entry',135.9,242,24,0,0,24);
wall(main,'main-central-exit-wall',0,351.9,306,351.9);
door(main,'main-central-exit',159.9,351.9,-24,0,0,24);
wall(main,'main-bench-return',117.3,385.9,117.3,392.25);
wall(main,'main-bathroom-rear-wall',0,392.25,117.3,392.25);
wall(main,'main-bathroom-side-wall',90.95,392.25,90.95,463.25);
wall(main,'main-bathroom-front-wall',0,463.25,90.95,463.25);
door(main,'main-bathroom-entry',90.95,419.25,0,-24,-24,0);
wall(main,'main-service-top',90.95,420.75,233.75,420.75);
wall(main,'main-service-bottom',90.95,450.5,233.75,450.5);
for(const [i,x]of [144.5,191.25,233.75].entries())wall(main,'main-service-divider-'+i,x,420.75,x,450.5);
door(main,'main-storage-entry',129.725,450.5,-24,0,0,-24);
door(main,'main-utility-exit',306,450.5,0,24,24,0);
door(main,'main-stair-d-side-access',0,479.3,0,24,-24,0);
wall(main,'main-shared-bathroom-front',0,506.6,119,506.6);
wall(main,'main-shared-bathroom-side',119,506.6,119,578);
door(main,'main-shared-bathroom-entry',92,506.6,24,0,0,24);
wall(main,'main-toilet-stall-fronts',0,527,74.8,527);
for(const [i,x]of [37.4,74.8].entries())wall(main,'main-toilet-divider-'+i,x,527,x,578);
door(main,'main-toilet-entry-1',8.5,527,24,0,0,24);door(main,'main-toilet-entry-2',45.9,527,24,0,0,24);
wall(main,'main-laundry-shower-top',176.8,476,306,476);
wall(main,'main-laundry-shower-side',176.8,476,176.8,578);
wall(main,'main-laundry-shower-bottom',176.8,578,306,578);
door(main,'main-laundry-shower-entry',176.8,538,0,24,24,0);
for(const [i,x]of [221,263.5].entries())wall(main,'main-shower-divider-'+i,x,476,x,527);
wall(main,'main-shower-stall-fronts',221,527,306,527);
door(main,'main-shower-entry-1',225.25,527,24,0,0,-24);door(main,'main-shower-entry-2',267.75,527,24,0,0,-24);
for(const x of [119,187])wall(main,'main-bedroom-corridor-'+x,x,578,x,892.5);
for(const [i,y]of [578,640.9,703.8,766.7,829.6].entries()){
 wall(main,'main-bedroom-left-divider-'+i,0,y,119,y);wall(main,'main-bedroom-right-divider-'+i,187,y,306,y);
}
wall(main,'main-forward-perimeter',0,892.5,306,892.5);door(main,'main-forward-exit',165,892.5,-24,0,0,24);

const removeMain=new Set([1,2,3,4,5,6,7,8,...Array.from({length:41},(_,i)=>28+i),69,70,71,72,73,...Array.from({length:20},(_,i)=>83+i),103,104]);
main.details=main.details.filter(a=>!removeMain.has(Number(a.id.split('-').at(-1))));
line(main,'main-rear-railing',0,-36,306,-36,'secondary');line(main,'main-rear-rail-inner',0,-31.75,306,-31.75,'secondary');
line(main,'main-rear-port-edge',0,-36,0,0,'secondary');line(main,'main-rear-starboard-edge',306,-36,306,0,'secondary');
detail(main,'main-chain-link-1','ellipse',{x:-8,y:-27,w:5,h:10});detail(main,'main-chain-link-2','ellipse',{x:-8,y:-20,w:5,h:10});
label(main,'main-chain-label','CHAINS',{x:-27,y:-30,w:12,h:29},-90);
setLabel(main,'main-label-0',{x:153,y:-43});
setDetail(main,'main-detail-12',{y:64,w:9,h:42});
area(main,'main-label-4',{x:107.95,y:64,w:9,h:42});
setDetail(main,'main-detail-14',{x:99.45});setLabel(main,'main-label-5',{x:108.8,y:143.5});
setDetail(main,'main-detail-18',{x:49.3,w:10.9});setDetail(main,'main-detail-20',{x:65.6});
label(main,'main-middle-bench-label','BENCH / SHELVES',{x:49.3,y:183.6,w:10.9,h:85.85},-90);
label(main,'main-short-bench-label','BENCH',{x:65.6,y:232.05,w:20.4,h:37.4},-90);
setDetail(main,'main-detail-21',{x:189.975,w:96.9});area(main,'main-label-10',{x:189.975,y:20.4,w:96.9,h:39.95});
area(main,'main-label-14',{x:179.35,y:268.6,w:29.75,h:23.8});area(main,'main-label-15',{x:212.5,y:268.6,w:62.05,h:23.8});
detail(main,'main-left-l-bench','polyline',{closed:true,points:[[5.95,358.7],[117.3,358.7],[117.3,385.9],[104.55,385.9],[104.55,371.45],[5.95,371.45]]});
detail(main,'main-right-l-bench','polyline',{closed:true,points:[[184.45,358.7],[300.05,358.7],[300.05,412.25],[289,412.25],[289,371.45],[184.45,371.45]]});
detail(main,'main-lower-bench','rect',{x:5.95,y:378.65,w:80,h:10.2});
label(main,'main-left-l-bench-label','BENCH',{x:5.95,y:358.7,w:98.6,h:12.75});label(main,'main-right-l-bench-label','BENCH',{x:184.45,y:358.7,w:104.55,h:12.75});label(main,'main-lower-bench-label','BENCH',{x:5.95,y:378.65,w:80,h:10.2});
setDetail(main,'main-detail-76',{x1:8.5,y1:430.1,x2:3.4,y2:430.1});
setLabel(main,'main-label-22',{x:95,y:426.5,align:'start',rotation:0});delete main.labels.find(a=>a.id==='main-label-22').centerArea;
main.labels=main.labels.filter(a=>!['main-label-28','main-label-29'].includes(a.id));
detail(main,'main-washer','symbol',{role:'detail',type:'washer',x:189.3,y:489.6,rotation:0,scale:.65});detail(main,'main-dryer','symbol',{role:'detail',type:'dryer',x:210,y:489.6,rotation:0,scale:.65});
const laundry=main.labels.find(a=>a.text==='LAUNDRY');if(laundry)area(main,laundry.id,{x:176.8,y:502.5,w:44.2,h:21});

// Three short changes in height share the same clear lower landing.
line(main,'main-stair-a-left',130.9,242,130.9,306,'secondary');line(main,'main-stair-a-right',164.9,242,164.9,306,'secondary');
line(main,'main-stair-a-landing-end',130.9,272,164.9,272,'secondary');
for(let i=1;i<=3;i++)line(main,'main-stair-a-tread-'+i,130.9,272+i*8,164.9,272+i*8);
stairFlight(main,'main-stair-b',98.9,306,32,24,false,4);stairFlight(main,'main-stair-c',164.9,306,32,24,false,4);
line(main,'main-shared-landing-left',130.9,330,130.9,351.9,'secondary');line(main,'main-shared-landing-right',164.9,330,164.9,351.9,'secondary');
arrow(main,'main-stair-a-arrow',147.9,294,147.9,278);arrow(main,'main-stair-b-arrow',126.9,318,103.9,318);arrow(main,'main-stair-c-arrow',168.9,318,191.9,318);
setLabel(main,'main-label-18',{x:147.9,y:236});setLabel(main,'main-label-19',{x:114.9,y:300});setLabel(main,'main-label-20',{x:180.9,y:300});setLabel(main,'main-label-21',{x:147.9,y:345});
// The accommodation stair has a larger clear top landing and meets the washroom wall.
stairFlight(main,'main-stair-d',34,476,56,30.6,false,8);
line(main,'main-stair-d-landing-top',0,476,34,476,'secondary');line(main,'main-stair-d-landing-bottom',0,506.6,34,506.6,'secondary');
arrow(main,'main-stair-d-arrow',86,491.3,38,491.3);setLabel(main,'main-label-27',{x:62,y:470});

// Replace the ten ambiguous ellipse marks with the same chair, facing each desk.
const chairIndices=new Set([119,124,129,134,139,144,149,154,159,164]);main.details=main.details.filter(a=>!chairIndices.has(Number(a.id.split('-').at(-1))));
for(let row=0;row<5;row++)for(const side of ['L','R']){
 const desk=main.details.find(a=>a.id===`main-detail-${118+row*10+(side==='R'?5:0)}`),below=row%2===0;
 detail(main,`main-chair-${side}${row+1}`,'symbol',{role:'detail',type:'deskChair',x:desk.x+desk.w/2,y:below?desk.y-8.05:desk.y+desk.h+8.05,rotation:below?180:0,scale:.55});
}

// Align the upper outline while retaining the marked 43:35 helipad proportion.
const padHeight=306*35/43;
upper.walls=[];upper.doors=[];upper.details=upper.details.filter(a=>![...Array.from({length:18},(_,i)=>3+i),...Array.from({length:19},(_,i)=>35+i)].includes(Number(a.id.split('-').at(-1))));
wall(upper,'upper-port-perimeter',0,0,0,474);wall(upper,'upper-starboard-perimeter',306,0,306,492);wall(upper,'upper-rear-perimeter',0,0,306,0);
wall(upper,'upper-pad-left-front',0,padHeight,130.9,padHeight);wall(upper,'upper-pad-right-front',164.9,padHeight,306,padHeight);
door(upper,'upper-near-stair-entry',100,padHeight,24,0,0,24);door(upper,'upper-office-entry',182.5,padHeight,24,0,0,24);
wall(upper,'upper-office-left',178.5,padHeight,178.5,315);wall(upper,'upper-office-bottom',178.5,315,306,315);
wall(upper,'upper-utility-bottom',0,315,178.5,315);door(upper,'upper-utility-entry',68,315,24,0,0,24);
wall(upper,'upper-desk-weight-divider',127.5,315,127.5,410);door(upper,'upper-desk-weight-entry',127.5,403,0,-24,24,0);
wall(upper,'upper-desk-room-bottom',0,410,127.5,410);
wall(upper,'upper-stair-side-return',127.5,444,127.5,492);
wall(upper,'upper-stair-platform-bottom',0,474,127.5,474);
wall(upper,'upper-weight-room-bottom',127.5,492,306,492);
area(upper,'upper-label-0',{x:0,y:0,w:306,h:padHeight});
setDetail(upper,'upper-detail-1',{y:padHeight+4.25});area(upper,'upper-label-1',{x:243.1,y:padHeight+4.25,w:55.25,h:13.6});
setDetail(upper,'upper-detail-2',{y:297.1});area(upper,'upper-label-2',{x:184.45,y:297.1,w:115.6,h:11.9});
// Centre the room label in the clear aisle below the desk/chair, above the bench.
area(upper,'upper-label-3',{x:178.5,y:282,w:127.5,h:15.1});
setDetail(upper,'upper-detail-27',{y:306.5});area(upper,'upper-label-5',{x:5.1,y:306.5,w:56.1,h:8.5});
setDetail(upper,'upper-detail-28',{x:2.55,y:252.5});area(upper,'upper-label-6',{x:-13,y:250,w:10,h:24});setLabel(upper,'upper-label-6',{rotation:-90});
setDetail(upper,'upper-detail-29',{y:279.5,h:29.5});area(upper,'upper-label-7',{x:97.75,y:279.5,w:17,h:29.5});
setDetail(upper,'upper-detail-30',{y:331});area(upper,'upper-label-8',{x:6.8,y:331,w:15.3,h:61.2});
setDetail(upper,'upper-detail-31',{y:319.25,h:34.25});area(upper,'upper-label-9',{x:100.3,y:319.25,w:25.5,h:34.25});
setDetail(upper,'upper-detail-32',{y:358.5});setDetail(upper,'upper-detail-33',{y:362.019});setDetail(upper,'upper-detail-34',{y1:366.15,y2:366.15});
area(upper,'upper-label-10',{x:127.5,y:315,w:178.5,h:177});
detail(upper,'upper-office-chair','symbol',{role:'detail',type:'deskChair',x:270.725,y:275,rotation:0,scale:.55});
stairFlight(upper,'upper-stair-a',130.9,padHeight,34,315-padHeight,true,6);
// The open top is the helipad entry, not an extra outlined pad above its wall.
upper.details=upper.details.filter(a=>a.id!=='upper-stair-a-top');
arrow(upper,'upper-stair-a-arrow',147.9,padHeight+6,147.9,309);setLabel(upper,'upper-label-4',{x:147.9,y:padHeight-7});
stairFlight(upper,'upper-stair-d',34,444,56,30,false,8);
line(upper,'upper-stair-d-landing-top',0,444,34,444,'secondary');
line(upper,'upper-stair-d-walkway-top',0,410,127.5,410,'secondary');
line(upper,'upper-stair-d-walkway-bottom',34,444,127.5,444,'secondary');
arrow(upper,'upper-stair-d-arrow',38,459,86,459);setLabel(upper,'upper-label-11',{x:62,y:438});

// Clip structural and secondary stair boundaries at the exact same jambs.
for(const d of p.decks){
 const openings=d.doors.map(a=>({start:{x:a.x,y:a.y},end:{x:a.x+a.u[0],y:a.y+a.u[1]}}));
 d.walls=d.walls.flatMap(a=>cutWall(a,openings).map((part,i)=>({...a,...part,id:a.id+'-'+i})));
 d.details=d.details.flatMap(a=>a.kind==='line'?cutWall(a,openings).map((part,i)=>({...a,...part,id:a.id+(i?'-'+i:'')})):[a]);
}
const outcomes=[
 'Moved the pad-to-utility entrance beside the stair, with its swing and couch kept clear.',
 'Closed the lower stair/utility boundary with a continuous wall, retaining its separate room doorway.',
 'Applied the shared solid stair-arrow geometry with a light paper-colour outline to every stair direction.',
 'Removed the extra pad projecting above the helipad stair; the flight begins at the aligned wall.',
 'Moved the office entrance to the near corner and rebuilt its wall returns.',
 'Added the approved desk chair using the shared furniture symbol and kept desk/label clearances.',
 'Aligned both sides of the helipad and upper building; retained the marked 43:35 pad proportion.',
 'Shortened the cabinet run and placed the separate sink beyond it, with a clear real backing wall.',
 'Reversed the internal door handing to match the source bottom hinge, retaining entry into the weight room.',
 'Left a seven-unit wall return beyond the internal doorway.',
 'Shortened the room above the relocated stair and provided a clear path into the longer weight room.',
 'Removed the unsupported exterior drop-door and closed its wall; the stair-top route now enters internally.',
 'Re-read the rear note as chains; removed the false stair flight and retained a small chain mark.',
 'Expanded the rear walking strip to 36 units, clearing the outward rear doors.',
 'Added the outward rear exit at the reviewed opening, plus the generator access shown on the sketch.',
 'Added the missing generator/workshop separation and coordinated the connected side wall.',
 'Completed the side wall and reduced the shelf to a short wall-backed run.',
 'Reduced the gas-tank width while keeping the two diesel tanks and jet tank larger.',
 'Completed the partition, moved its bench/shelving to the left and kept a shorter bench on the right.',
 'Added the right workshop pair of outward-opening doors with complete jamb returns.',
 'Added the left workshop front wall and outward-opening double doors.',
 'Rebuilt the central up flight as a few steps and a clear landing serving an outward-opening door.',
 'Rebuilt the left short down flight so it meets the central shared landing.',
 'Rebuilt the right short down flight so it meets the same central landing.',
 'Centred MIXED in its explicit tank area using the shared text-placement system.',
 'Centred STRAIGHT GAS in its explicit tank area using the same system.',
 'Completed the fuel-store front wall and joined it to the long separation.',
 'Re-read the source and retained INSTRUMENT BENCH, confirmed by the owner in chat.',
 'Labelled the remaining bench outlines consistently.',
 'Replaced the two abutting rectangles with one continuous left L-bench outline.',
 'Added the missing wall return at the bench/bathroom transition.',
 'Replaced the right bench pieces with one continuous L-shaped outline.',
 'Closed the missing bathroom rear boundary as part of its enlarged footprint.',
 'Moved the misplaced storage-facing door to the bathroom side wall, swinging left into the bathroom.',
 'Enlarged the bathroom into the upper area, with storage and adjacent partitions coordinated around it.',
 'Removed the accommodation flight’s redundant lower-end pad outlines.',
 'Inspected the faint side-wall mark and interpreted it as outward side access beside the landing; flagged for confirmation.',
 'Aligned the accommodation stair bottom with the adjoining washroom wall.',
 'Widened its clear left landing to 34 units and kept its side access unobstructed.',
 'Added the laundry/shower enclosure wall with a conventional hallway entry and clear swing.',
 'Replaced all ten bedroom ellipse marks with the shared chair symbol, consistently facing each desk.',
 'The final pin has no written content; no independent design change can be inferred from it.'
];
p.revisionMeta={label:'V2 · PDF corrections',date:'2026-11-13',summary:'Applied the 41 written PDF review notes as connected layout changes. V1 remains archived; faint side access and unverified vessel details remain flagged.',changes:comments.notes.map((a,i)=>({id:a.id,title:`${String(a.number).padStart(2,'0')} · ${outcomes[i].split(';')[0].slice(0,145)}`,text:outcomes[i],status:i===41?'carried':'done',...(i===41?{}:{sourceComment:a.text})}))};
p.reviewFlags=[
 {id:'odyssey-v2-side-access',deckId:'main',x:0,y:491.3,title:'Faint side access needs confirmation',text:'PDF note 37 points to the faint mark beside the accommodation stair landing. It is drawn as an outward-opening side door with clear wall returns; the original sketch does not establish this entrance conclusively.'},
 {id:'odyssey-v2-height-connections',deckId:'main',x:147.9,y:318,title:'Changes in height remain schematic',text:'The short workshop/fuel flights now share a landing as reviewed. Their exact elevations and which levels each flight serves are not measured by the sketches.'},
 {id:'odyssey-v2-room-count',deckId:'main',x:153,y:720,title:'Written accommodation count remains unresolved',text:'The sketch establishes ten bedrooms. The written specification describes twenty plus additional upper amenities; those unlocated spaces have not been invented.'},
 {id:'odyssey-v2-service-identities',deckId:'main',x:260,y:435,title:'Service identities and storage access',text:'Boiler/furnace and tank labels follow the sketch. The storage entrance is conventionally placed from the adjoining passage; exact service partitions and tank identities remain unverified.'},
 {id:'odyssey-v2-dimensions',deckId:'upper',x:153,y:124,title:'Dimensions remain schematic',text:'The helipad retains the marked 43:35 proportion. Other room lengths, stair elevations, hull form and physical door/fixture sizes have not been surveyed.'}
];
p.sourceSummary='The original sketches and November PDF review govern this V2. All 41 written notes are recorded in the change log; the empty pin has no design instruction. Ten bedrooms are shown, and five unresolved source issues remain in Feedback.';
p.notes='PDF corrections applied in V2; original V1 geometry and per-browser working states remain archived.';
validateEditorProject(p);validateEditorProject(archived);
fs.writeFileSync(new URL('../assets/revisions/odyssey102-v1.json',import.meta.url),JSON.stringify(archived,null,2)+'\n');
fs.writeFileSync(new URL('../assets/revisions/odyssey102-v2.json',import.meta.url),JSON.stringify(p,null,2)+'\n');
console.log('Built Odyssey V2:',p.decks.map(d=>({floor:d.id,walls:d.walls.length,doors:d.doors.length,details:d.details.length})),p.revisionMeta.changes.length,'review pins');
