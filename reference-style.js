import {dryRoomDoorPoint,stairWallPaths} from './stairs.js';
import {COOK_HOUSE_PATHS,COOK_HOUSE_DOORS} from './cook-house.js';
import {textWidth} from './font-metrics.js';
import {stallEntries,bathroomPaths,fixtureLayout,fixtureBounds} from './fixtures.js';
import {accommodationRooms,ACCOMMODATION_PATHS,isAccommodationPath} from './accommodation.js';
import {planPoint,sourcePoint} from './model.js';
// The live-text reference has a 327-unit deck width. Scale its type and strokes together.
export const STYLE_REVISION=19;
export const REFERENCE_SCALE=264/327;
export const REFERENCE={room:30*REFERENCE_SCALE,label:11*REFERENCE_SCALE,caption:16*REFERENCE_SCALE,wall:3*REFERENCE_SCALE,detail:2*REFERENCE_SCALE,dash:4*REFERENCE_SCALE,inset:11.5*REFERENCE_SCALE};
const rooms={main:accommodationRooms('main'),upper:{...accommodationRooms('upper'),4:[320,278,37,75],3:[357,278,37,75],2:[458,278,38,75],1:[496,278,48,75]}};
const utilities={
 main:{'LAUNDRY / STORAGE':[320,278,39,75],'BATHROOM':[359,278,43,75],'OFFICE':[402,278,46,75],'FIRST AID':[448,278,54,75],'DRY ROOM ABOVE GENERATOR BELOW':[544,278,122,75],'WASHROOMS':[202,190,28,66],'LAUNDRY':[88,93,114,72]},
 upper:{'WASHROOMS':[152,185,26,55],'LAUNDRY':[88,215,114,23],'DRY ROOM':[544,278,122,75]}
};
function bounds(box,p){const [x,y,w,h]=box,a=planPoint(x+w,y,p),b=planPoint(x,y+h,p);return {left:a.x,top:a.y,right:b.x,bottom:b.y};}
function position(a,x,y,p,align){const q=sourcePoint(x,y,p);Object.assign(a,q,{align});}
export function needsReferenceStyle(p){
 // Recognize the two original pre-cut wall patterns even if an older updater
 // already copied the new revision stamp onto that incomplete wall set.
 return (p.styleRevision||0)<STYLE_REVISION||p.decks.some(d=>d.paths.some(path=>path.includes('M230 76V133H294')||path.includes('M61 37V101')));
}
export function applyReferenceStyle(p){
 if(!needsReferenceStyle(p))return p;
 p.wallWidth=REFERENCE.wall;
 for(const d of p.decks){
  // Replace the approved shared assemblies; preserve the other deck and exterior details.
  let outside=d.paths.filter(path=>!isAccommodationPath(path)&&!path.startsWith('M320 0V249')&&!COOK_HOUSE_PATHS.includes(path)&&!stairWallPaths(d).includes(path)).map(path=>path
   .replace('M320 278H411 M437 278H499 M525 278H544','M320 278H420 M436 278H466 M482 278H544')
   .replace('M359 241V253H410V140','M359 241V249H410V140')
   .replace('M404 0V84','M410 0V84').replace('M484 86H529V278','M484 86H520V278')
   .replace('M544 278H704','M544 278H666'));
  if(d.id==='upper'){
   outside=outside.filter(path=>!path.startsWith('M320 278H')&&!path.startsWith('M320 278V353'));
   outside.push('M320 278H544','M320 278V353 M357 278V353 M394 278V353 M458 278V353 M496 278V353 M544 278V353');
  }
  if(!outside.includes('M666 278V353'))outside.push('M666 278V353');
  d.paths=[...ACCOMMODATION_PATHS,...outside,...COOK_HOUSE_PATHS,...stairWallPaths(d),...bathroomPaths(d)];
  d.labels=d.labels.filter(a=>!(a.kind==='label'&&['LAUNDRY','W/D'].includes(a.text.trim())));
 }
 for(const d of p.decks)for(const a of d.labels){
  let key=a.text.replace(/\s+/g,' ').trim();if(key==='DRY ROOM UP GEN ROOM DOWN')key='DRY ROOM ABOVE GENERATOR BELOW';if(key==='WASH ROOMS')key='WASHROOMS';if(key==='W/D')key='LAUNDRY';if(key==='BATH ROOM')key='BATHROOM';
  if(a.kind==='room'&&rooms[d.id][key]){const box=rooms[d.id][key],b=bounds(box,p),left=box[1]+box[3]/2<176.5||key==='7'||key==='17';a.size=REFERENCE.room;const inset=Math.max(3,Math.min(REFERENCE.inset,(b.right-b.left-a.text.length*a.size*.66)/2));position(a,left?b.left+inset:b.right-inset,b.top+REFERENCE.inset+a.size*(key==='3'?.70:.76),p,left?'start':'end');}
  else if(key==='COOK HOUSE'){a.size=REFERENCE.label;const b=bounds([410,0,74,249],p);position(a,(b.left+b.right)/2,(b.top+b.bottom)/2,p,'middle');}
  else if(utilities[d.id][key]){const b=bounds(utilities[d.id][key],p);a.size=REFERENCE.label;
   const replacements={'LAUNDRY / STORAGE':'LAUNDRY /\nSTORAGE','DRY ROOM ABOVE GENERATOR BELOW':'DRY ROOM\nUP\nGEN ROOM\nDOWN','WASHROOMS':'WASH\nROOMS'};
   if(replacements[key])a.text=replacements[key];if(key==='BATHROOM')a.text='BATH\nROOM';if(key==='WASHROOMS')a.size=9*REFERENCE_SCALE;
   if(d.id==='upper'&&key==='LAUNDRY'){a.text='W/D';a.size=8.84*REFERENCE_SCALE;}
   const lines=a.text.split('\n');position(a,b.left+(d.id==='upper'&&key==='LAUNDRY'?1:key==='WASHROOMS'?3:REFERENCE.inset*.55),d.id==='upper'&&key==='LAUNDRY'?b.top+8:b.bottom-REFERENCE.inset*.65-(lines.length-1)*a.size,p,'start');
  }
 }
 clearDoorLabels(p);p.styleRevision=STYLE_REVISION;return p;
}
export function doorGeometry(start,end,swing){
 const dx=end.x-start.x,dy=end.y-start.y,r=Math.hypot(dx,dy),open={x:start.x-dy*swing,y:start.y+dx*swing};
 const n=x=>Number(x.toFixed(3));
 return {start,end,open,radius:r,threshold:`M${n(start.x)} ${n(start.y)}L${n(end.x)} ${n(end.y)}`,swing:`M${n(start.x)} ${n(start.y)}L${n(open.x)} ${n(open.y)} M${n(open.x)} ${n(open.y)}A${n(r)} ${n(r)} 0 0 ${swing===-1?1:0} ${n(end.x)} ${n(end.y)}`};
}
export const STANDARD_DOOR=24;
function oldDoorEntries(d){return d.id==='main'?[[420,278,436,278],[466,278,482,278]]:[];}
export function deckDoors(d,p){
 const dryEntry=dryRoomDoorPoint(p);
 const base=[[61,92,'right',1],[61,185,'right',1],[61,240,'right',1],[230,45,'right',-1],[230,141,'right',-1],[230,240,'right',-1],[88,268,'right',-1],[214,268,'right',1],[202,86,'right',1]];
 const extra=d.id==='main'?[[420,278,'up',1],[466,278,'up',1]]:[[326,278,'up',1],[363,278,'up',1],[463,278,'up',1],[501,278,'up',1],[399,278,'up',1]];
 return [...base,...extra,...COOK_HOUSE_DOORS,[210,37,'up',1],[67,312,'up',-1],[484,100,'right',-1],...stallEntries(d).map(e=>[e.x,e.y,'up',e.swing])].map(([x,y,direction,swing])=>{const start=planPoint(x,y,p),end={x:start.x+(direction==='right'?STANDARD_DOOR:0),y:start.y+(direction==='down'?STANDARD_DOOR:direction==='up'?-STANDARD_DOOR:0)};return doorGeometry(start,end,swing);}).concat(doorGeometry(dryEntry,{x:dryEntry.x,y:dryEntry.y-STANDARD_DOOR},1));
}
function doorBounds(door){return {left:Math.min(door.start.x,door.end.x,door.open.x),right:Math.max(door.start.x,door.end.x,door.open.x),top:Math.min(door.start.y,door.end.y,door.open.y),bottom:Math.max(door.start.y,door.end.y,door.open.y)};}
export function labelCollidesWithDoor(a,p,door){const q=planPoint(a.x,a.y,p),lines=a.text.split('\n'),w=Math.max(...lines.map(line=>textWidth(line,a.size))),left=q.x-(a.align==='end'?w:a.align==='middle'?w/2:0),box=doorBounds(door),gap=3;return left<box.right+gap&&left+w>box.left-gap&&q.y-a.size*.8<box.bottom+gap&&q.y+(lines.length-1)*a.size+a.size*.1>box.top-gap;}
function clearDoorLabels(p){for(const d of p.decks){
 const obstacles=[...deckDoors(d,p).map(doorBounds),...fixtureLayout(d,p).map(fixtureBounds)];
 const entries=d.labels.filter(a=>a.kind==='room'&&rooms[d.id][a.text]).map(a=>{
  const room=rooms[d.id][a.text],b=bounds(room,p),number=Number(a.text),base=number>=15?number-10:number;
  // Paired labels reserve the longer number's width on both floors.
  const width=base>=5&&base<=14?Math.max(textWidth(String(base),a.size),textWidth(String(base+10),a.size)):textWidth(a.text,a.size);
  const inset=Math.max(p.wallWidth/2+3,Math.min(REFERENCE.inset,(b.right-b.left-width)/2));
  return {a,b,width,inset,preferred:room[1]+room[3]/2<176.5||base===7?'start':'end'};
 });
 const choose=({a,b,width,inset,preferred},edges=['top','bottom'])=>{
  for(const edge of edges)for(const align of [preferred,preferred==='start'?'end':'start']){
   const x=align==='start'?b.left+inset:b.right-inset,y=edge==='top'?b.top+REFERENCE.inset+a.size*.76:b.bottom-REFERENCE.inset,left=align==='start'?x:x-width;
   if(left<b.left+p.wallWidth/2+2||left+width>b.right-p.wallWidth/2-2)continue;
   if(obstacles.some(o=>left<o.right+3&&left+width>o.left-3&&y-a.size*.8<o.bottom+3&&y+a.size*.1>o.top-3))continue;
   return {x,y,align,edge};
  }
  return null;
 };
 for(const entry of entries)entry.chosen=choose(entry);
 // Rooms with the same front and back form one visual row. Resolve its baseline
 // together, rather than leaving the middle bedroom stranded at the top.
 const rows=new Map();
 for(const entry of entries){const key=`${entry.b.top}:${entry.b.bottom}`;if(!rows.has(key))rows.set(key,[]);rows.get(key).push(entry);}
 for(const row of rows.values())if(row.length>1&&row.some(entry=>entry.chosen?.edge==='bottom')){
  const lower=row.map(entry=>choose(entry,['bottom']));
  if(lower.every(Boolean))row.forEach((entry,i)=>{entry.chosen=lower[i];entry.rowAligned=true;});
 }
 for(const {a,preferred,chosen,rowAligned}of entries)if(chosen){
  position(a,chosen.x,chosen.y,p,chosen.align);
  a.placementRule=chosen.edge==='top'&&chosen.align===preferred?'upper-exterior':`${chosen.edge}-${chosen.align==='start'?'left':'right'}-${rowAligned?'row':'clearance'}`;
 }
}}
// Repair the old hand-drawn openings, then cut every wall against the same door width.
// Final-page coordinates keep the openings and circular swings independent of envelope stretching.
export function builtWallPaths(d,p){
 const cuts=deckDoors(d,p).map(door=>[door.start,door.end]);
 const fromPath=path=>{let x=0,y=0,segments=[];path.replace(/([MHV])([^MHV]*)/g,(_,cmd,args)=>{const v=args.trim().split(/[ ,]+/).map(Number);if(cmd==='M'){x=v[0];y=v[1];}else for(const n of v){const next=cmd==='H'?{x:n,y}:{x,y:n};segments.push([planPoint(x,y,p),planPoint(next.x,next.y,p)]);x=next.x;y=next.y;}return '';});return segments;};
 const clip=segment=>{let pieces=[segment];for(const [c,e]of cuts){const vertical=Math.abs(c.x-e.x)<.001,axis=vertical?'y':'x',fixed=vertical?'x':'y',low=Math.min(c[axis],e[axis]),high=Math.max(c[axis],e[axis]);pieces=pieces.flatMap(([a,b])=>{
 if(Math.abs(a[fixed]-b[fixed])>.001||Math.abs(a[fixed]-c[fixed])>.001)return [[a,b]];
 const min=Math.min(a[axis],b[axis]),max=Math.max(a[axis],b[axis]);if(high<=min||low>=max)return [[a,b]];const out=[];if(low>min)out.push([{...a,[axis]:min},{...b,[axis]:low}]);if(high<max)out.push([{...a,[axis]:high},{...b,[axis]:max}]);return out;
 });}return pieces;};
 const encode=segments=>segments.flatMap(clip).map(([a,b])=>`M${a.x} ${a.y}L${b.x} ${b.y}`).join('');
 const walls=d.paths.map((path,index)=>({index,path:encode(fromPath(path))}));
 walls.push({index:null,path:encode(oldDoorEntries(d).map(([x,y,ex,ey])=>[planPoint(x,y,p),planPoint(ex,ey,p)]))});return walls;
}

// Fit the actual font advances inside the surrounding built walls. Prefer moving
// toward the padded side; reduce type only if the room itself is too narrow.
export function fitLabel(a,d,p){
 if(!['room','label','text'].includes(a.kind))return a;
 const q=planPoint(a.x,a.y,p),lines=a.text.split('\n'),gap=p.wallWidth/2+3;
 const width=Math.max(...lines.map(line=>textWidth(line,a.size)));
 let x=q.x,size=a.size,left=0,right=900*p.width/p.length;
 const probe=q.y-a.size*.35;
 for(const {path} of builtWallPaths(d,p))for(const m of path.matchAll(/M([\d.e+-]+) ([\d.e+-]+)L([\d.e+-]+) ([\d.e+-]+)/g)){
  const [ax,ay,bx,by]=m.slice(1).map(Number);
  if(Math.abs(ax-bx)>.001||probe<Math.min(ay,by)||probe>Math.max(ay,by))continue;
  if(ax<q.x-.01)left=Math.max(left,ax);else if(ax>q.x+.01)right=Math.min(right,ax);
 }
 const available=right-left-2*gap;if(available<=0)return a;
 if(width>available)size*=available/width;
 const w=width*size/a.size,offset=a.align==='end'?w:a.align==='middle'?w/2:0;
 x=Math.max(left+gap+offset,Math.min(right-gap-w+offset,x));
 return {...a,...sourcePoint(x,q.y,p),size};
}
