import {cutWall} from './wall-lines.js';
const wall=(id,x1,y1,x2,y2)=>({id,role:'wall',x1,y1,x2,y2});
const rename=a=>({...structuredClone(a),id:'upper-accommodation-'+a.id.slice(5)});
export function applyOdysseyMiddleV5(input){
 const p=structuredClone(input),[d,u]=p.decks,W=p.bounds.width;
 const detail=id=>d.details.find(a=>a.id===id),label=id=>d.labels.find(a=>a.id===id);
 // Keep only the storage enclosure actually supported on the left. The extra
 // three service bays were an invented barrier across the central passage.
 d.walls=d.walls.filter(a=>!a.id.startsWith('main-service-'));
 const storage=d.doors.find(a=>a.id==='main-storage-entry'),storageRight=155.77307692307693;
 d.walls.push(wall('main-service-top-0',102.22307692307693,456.75,storageRight,456.75),
  wall('main-service-bottom-0',102.22307692307693,486.5,storage.x-24,486.5),
  wall('main-service-bottom-1',storage.x,486.5,storageRight,486.5),
  wall('main-service-storage-side',storageRight,456.75,storageRight,486.5));
 // Heavy line in the repaired sketch: bench to its left, furnace to its right.
 const furnace=detail('main-detail-79'),dividerX=furnace.x,alcoveLeft=226.32307692307694;
 d.walls.push(wall('main-utility-top',alcoveLeft,450.75,W,450.75),
  wall('main-utility-entry-upper',alcoveLeft,450.75,alcoveLeft,454.75),
  wall('main-utility-entry-lower',alcoveLeft,478.75,alcoveLeft,486.5),
  wall('main-utility-bench-divider',dividerX,450.75,dividerX,486.5));
 const bench=detail('main-detail-78');Object.assign(bench,{x:dividerX-12.75,w:12.75});
 Object.assign(label('main-label-23'),{text:'BENCH',x:bench.x+bench.w/2,y:bench.y+bench.h/2,centerArea:{x:bench.x,y:bench.y,w:bench.w,h:bench.h}});
 for(const [n,cx,cy] of [[80,294.7480769230769,469.25],[81,309.6230769230769,460.75],[82,309.6230769230769,477.75]])Object.assign(detail('main-detail-'+n),{x:cx-6,y:cy-6,w:12,h:12});
 // Match both shared-room top lines without moving the stair, bedrooms or hull.
 const dy=30.6,roomTop=542.6;
 d.walls.find(a=>a.id==='main-laundry-shower-top-0').y1=roomTop;
 d.walls.find(a=>a.id==='main-laundry-shower-top-0').y2=roomTop;
 for(const a of d.walls.filter(a=>a.id.startsWith('main-shower-divider-'))){a.y1+=dy;a.y2+=dy;}
 for(const a of d.walls.filter(a=>a.id.startsWith('main-shower-stall-fronts-'))){a.y1+=dy;a.y2+=dy;}
 const entry=d.doors.find(a=>a.id==='main-laundry-shower-entry');Object.assign(entry,{y:566.8,v:[-24,0]});
 const side=d.walls.find(a=>a.id==='main-laundry-shower-side-0');Object.assign(side,{y1:roomTop,y2:entry.y});
 d.walls.find(a=>a.id==='main-laundry-shower-side-1').y1=entry.y+24;
 for(const a of d.doors.filter(a=>a.id.startsWith('main-shower-entry-')))a.y+=dy;
 for(const n of [105,106,107,108])detail('main-detail-'+n).y+=dy;
 for(const a of d.details.filter(a=>['washer','dryer'].includes(a.type)))a.y+=dy;
 Object.assign(label('main-label-30'),{x:210.17307692307693,y:578.8,centerArea:{x:188.07307692307694,y:566.8,w:44.2,h:24}});
 Object.assign(label('main-label-31'),{x:280.4096153846154,y:603.8,align:'middle',centerArea:{x:232.27307692307693,y:593.6,w:W-232.27307692307693,h:20.4}});
 // The upper sketch is partial. Repeat the confirmed accommodation block, not
 // the machinery/service band. Keep the helipad, office, gym and existing stairs.
 const copyWalls=d.walls.flatMap(a=>{
  if(Math.max(a.y1,a.y2)<roomTop)return [];
  const b=rename(a);if(b.y1<roomTop||b.y2<roomTop){if(b.x1!==b.x2)return [];b.y1=Math.max(roomTop,b.y1);b.y2=Math.max(roomTop,b.y2);}return [b];
 });
 const copyDetails=d.details.filter(a=>!a.id.startsWith('main-stair-')&&(a.y??Math.min(a.y1??-Infinity,a.y2??-Infinity))>=roomTop).map(rename);
 const copyDoors=d.doors.filter(a=>a.y>=roomTop).map(rename);
 const copyLabels=d.labels.filter(a=>a.kind==='room'||['main-label-30','main-label-31','main-label-42'].includes(a.id)).map(rename);
 u.walls.push(...copyWalls);u.details.push(...copyDetails);u.doors.push(...copyDoors);u.labels.push(...copyLabels);
 // A second pair faces the first across a clear aisle; no extra room is invented.
 for(const type of ['washer','dryer']){
  const a=structuredClone(d.details.find(a=>a.type===type));a.id='upper-'+type+'-set-2';a.y=600.4;u.details.push(a);
 }
 // Connect the retained upper rooms and stair landing to the repeated corridor.
 const x=152.27307692307693;
 u.doors.push({id:'upper-corridor-connection',x,y:528,u:[24,0],v:[0,24]});
 const gaps=[{start:{x,y:528},end:{x:x+24,y:528}},{start:{x:103.27307692307693,y:510},end:{x:127.27307692307693,y:510}}];
 u.walls=u.walls.flatMap(a=>cutWall(a,gaps).map((b,i)=>({...b,id:i?a.id+'-'+i:a.id})));
 u.walls.push(wall('upper-foyer-port-step',0,510,11.273076923076928,510),
  wall('upper-foyer-port-link',0,510,0,roomTop),
  wall('upper-foyer-starboard-step',317.2730769230769,528,W,528),
  wall('upper-foyer-starboard-link',W,528,W,roomTop));
 u.name='UPPER LEVEL';
 return p;
}
