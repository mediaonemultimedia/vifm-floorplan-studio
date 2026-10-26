import {textWidth} from './font-metrics.js';
import {stallEntries,bathroomPaths} from './fixtures.js';
import {planPoint,sourcePoint} from './model.js';
// The live-text reference has a 327-unit deck width. Scale its type and strokes together.
export const STYLE_REVISION=13;
export const REFERENCE_SCALE=264/327;
export const REFERENCE={room:30*REFERENCE_SCALE,label:11*REFERENCE_SCALE,caption:16*REFERENCE_SCALE,wall:3*REFERENCE_SCALE,detail:2*REFERENCE_SCALE,dash:4*REFERENCE_SCALE,inset:11.5*REFERENCE_SCALE};
const rooms={
 main:{8:[0,37,61,95],9:[61,37,79,56],10:[140,37,62,56],11:[230,37,64,96],12:[230,133,64,96],13:[214,238,80,74],14:[154,238,60,74],6:[88,238,66,74],5:[0,230,61,82],7:[0,132,61,98]},
 upper:{18:[0,37,61,95],19:[61,37,79,88],20:[140,37,62,88],21:[230,37,64,96],22:[230,133,64,96],23:[214,238,80,74],24:[154,260,60,52],16:[88,260,66,52],15:[0,230,61,82],17:[0,132,61,98],4:[320,278,45,75],3:[365,278,45,75],2:[444,278,38,75],1:[482,278,47,75]}
};
const utilities={
 main:{'LAUNDRY / STORAGE':[320,278,39,75],'BATHROOM':[359,278,43,75],'OFFICE':[402,278,46,75],'FIRST AID':[448,278,54,75],'DRY ROOM ABOVE GENERATOR BELOW':[544,278,122,75],'WASHROOMS':[202,180,28,58],'LAUNDRY':[88,93,114,72]},
 upper:{'WASHROOMS':[152,185,26,55],'LAUNDRY':[88,215,114,23],'DRY ROOM':[544,278,122,75]}
};
function bounds(box,p){const [x,y,w,h]=box,a=planPoint(x+w,y,p),b=planPoint(x,y+h,p);return {left:a.x,top:a.y,right:b.x,bottom:b.y};}
function position(a,x,y,p,align){const q=sourcePoint(x,y,p);Object.assign(a,q,{align});}
export function applyReferenceStyle(p){
 if(p.styleRevision>=STYLE_REVISION)return p;
 p.wallWidth=REFERENCE.wall;
 for(const d of p.decks)d.paths=d.paths.map(path=>path.replace('M320 278H411 M437 278H499 M525 278H544','M320 278H420 M436 278H466 M482 278H544').replace('M320 278H365 M388 278H414 M437 278H466 M489 278H520','M320 278H335 M351 278H386 M402 278H437 M453 278H488 M504 278H520'));
 for(const d of p.decks){
  d.labels=d.labels.filter(a=>!(a.kind==='label'&&['LAUNDRY','W/D'].includes(a.text.trim())));
  if(d.id==='main'){
   d.paths=d.paths.filter(path=>!['M88 200V238H202V200','M88 180V238H202V180','M88 195H101 M126 195H136 M151 195H163 M180 195H189 M201 195H202','M112 195V238 M140 195V238 M164 195V238 M190 195V238'].includes(path)).map(path=>path.replace('M88 165V93H202V165','M88 145V93H202V145'));
  }else{
   d.paths=d.paths.filter(path=>!['M112 93V137H152V93 M88 137H152 M164 93V137H202'].includes(path)).map(path=>path.replace('M88 120V93H202V120','M88 137V93H202V137'));
  }
  if(d.id==='upper'){
   d.paths=d.paths.filter(path=>path!=='M88 93V137H152V93 M120 93V137').map(path=>path
    .replace('M140 37V93 M202 37V93','M140 37V125 M202 37V125')
    .replace('M88 137V93H202V137','M61 125H202V185 M88 169V125')
    .replace('M88 165V190 M88 215V238H202V215 M202 190V165','M88 169V180 M88 230V260 M202 260V217')
    .replace('M88 169V260 M202 260V217','M88 169V180 M88 230V260 M202 260V217')
    .replace('M88 238H202','M88 260H214')
    .replace('M88 252V312 M154 238V312 M214 252V312','M88 260V312 M154 260V312 M214 238V312')
    .replace('M320 278V353 M371 278V353 M422 278V353 M473 278V353 M520 278V353','M320 278V353 M365 278V353 M435 278V353 M473 278V353 M520 278V353'));
  }
  if(d.id==='upper')d.paths=d.paths.map(path=>path.replace('M365 278V353 M435 278V353 M473 278V353 M520 278V353','M365 278V353 M410 278V353 M444 278V353 M482 278V353 M529 278V353').replace('M504 278H520','M504 278H529').replace('M484 86H529V278','M484 86H520V278'));
  d.paths=d.paths.map(path=>path.replace('M404 0V84','M410 0V84').replace('M544 278H704','M544 278H666'));
  if(!d.paths.includes('M666 278V353'))d.paths.push('M666 278V353');
  for(const path of bathroomPaths(d))if(!d.paths.includes(path))d.paths.push(path);
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
function oldDoorEntries(d){const base=[[61,101,61,132],[61,211,61,230],[230,37,230,76],[230,133,230,169],[230,229,230,261],[88,238,88,252],[214,238,214,252],[359,204,359,241]];return [...base,...(d.id==='main'?[[420,278,436,278],[466,278,482,278]]:[[335,278,351,278],[376,278,402,278],[437,278,466,278],[488,278,517,278]])];}
export function deckDoors(d,p){
 const base=[[61,92,'right',1],[61,185,'right',1],[230,45,'right',-1],[230,141,'right',-1],[230,240,'right',-1],[88,248,'right',-1],[214,246,'right',1],[359,208,'right',-1]];
 if(d.id==='upper'){base[5]=[88,270,'right',-1];base[6]=[214,268,'right',1];}
 const extra=d.id==='main'?[[420,278,'up',1],[466,278,'up',1]]:[[335,278,'up',1],[376,278,'up',1],[449,278,'up',1],[497,278,'up',1],[413,278,'up',-1]];
 return [...base,...extra,[210,37,'up',1],[67,312,'up',-1],[484,100,'right',-1],[638,278,'up',1],...stallEntries(d).map(e=>[e.x,e.y,'up',e.swing])].map(([x,y,direction,swing])=>{const start=planPoint(x,y,p),end={x:start.x+(direction==='right'?STANDARD_DOOR:0),y:start.y-(direction==='up'?STANDARD_DOOR:0)};return doorGeometry(start,end,swing);});
}
function doorBounds(door){return {left:Math.min(door.start.x,door.end.x,door.open.x),right:Math.max(door.start.x,door.end.x,door.open.x),top:Math.min(door.start.y,door.end.y,door.open.y),bottom:Math.max(door.start.y,door.end.y,door.open.y)};}
export function labelCollidesWithDoor(a,p,door){const q=planPoint(a.x,a.y,p),w=a.text.length*a.size*.68,left=q.x-(a.align==='end'?w:a.align==='middle'?w/2:0),box=doorBounds(door),gap=3;return left<box.right+gap&&left+w>box.left-gap&&q.y-a.size*.85<box.bottom+gap&&q.y>box.top-gap;}
function clearDoorLabels(p){for(const d of p.decks){const doors=deckDoors(d,p);for(const a of d.labels.filter(a=>a.kind==='room')){
 const collisions=()=>doors.filter(door=>labelCollidesWithDoor(a,p,door));if(!collisions().length)continue;
 const box=rooms[d.id][a.text];if(!box)continue;const b=bounds(box,p),q=planPoint(a.x,a.y,p);const inset=Math.max(3,Math.min(REFERENCE.inset,(b.right-b.left-a.text.length*a.size*.66)/2));position(a,b.left+inset,q.y,p,'start');
 const remaining=collisions();if(remaining.length){const bottom=Math.max(...remaining.map(door=>doorBounds(door).bottom));position(a,b.left+inset,Math.min(b.bottom-REFERENCE.inset,bottom+REFERENCE.inset+a.size*.85),p,'start');}
}}}
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
