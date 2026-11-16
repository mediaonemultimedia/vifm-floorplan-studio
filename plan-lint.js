import {fixtureBounds} from './fixtures.js';
// Boat-agnostic layout checks for drawing-coordinate projects. Each rule mirrors one
// line of LAYOUT-LOGIC.md so the written logic and the automated review stay in step.
const TOL=.6,DATUM=4,SWING=24;
const horizontal=w=>Math.abs(w.y1-w.y2)<.01,vertical=w=>Math.abs(w.x1-w.x2)<.01;
const r1=n=>Math.round(n*10)/10;
function distToSegment(p,a,b){const dx=b.x-a.x,dy=b.y-a.y,l=dx*dx+dy*dy,t=l?Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.y-a.y)*dy)/l)):0;return Math.hypot(p.x-a.x-t*dx,p.y-a.y-t*dy);}
const seg=w=>[{x:w.x1,y:w.y1},{x:w.x2,y:w.y2}];
const nearWall=(p,walls,tol=TOL)=>walls.some(w=>distToSegment(p,...seg(w))<=tol);
function detailBox(a){
 if(a.kind==='symbol'){try{const b=fixtureBounds({...a,rotation:a.rotation||0,scale:a.scale||1});return {x:b.left,y:b.top,w:b.right-b.left,h:b.bottom-b.top};}catch{return null;}}
 if(a.kind==='rect'||a.kind==='ellipse')return {x:a.x,y:a.y,w:a.w,h:a.h};
 if(a.kind==='polyline'){const xs=a.points.map(p=>p[0]),ys=a.points.map(p=>p[1]);return {x:Math.min(...xs),y:Math.min(...ys),w:Math.max(...xs)-Math.min(...xs),h:Math.max(...ys)-Math.min(...ys)};}
 return null;
}
const inBox=(p,b,inset=.5)=>p.x>b.x+inset&&p.x<b.x+b.w-inset&&p.y>b.y+inset&&p.y<b.y+b.h-inset;
export const doorJambs=d=>[{x:d.x,y:d.y},{x:d.x+d.u[0],y:d.y+d.u[1]}];
// Points inside the quarter circle swept by the leaf, kept clear of both straight edges.
export function swingSamples(d){
 const a0=Math.atan2(d.u[1],d.u[0]),a1=Math.atan2(d.v[1],d.v[0]);let span=a1-a0;while(span>Math.PI)span-=2*Math.PI;while(span<-Math.PI)span+=2*Math.PI;
 const out=[];for(let r=4;r<=SWING-1.5;r+=2.5)for(let k=1;k<8;k++){const a=a0+span*k/8;out.push({x:d.x+r*Math.cos(a),y:d.y+r*Math.sin(a)});}return out;
}
const envelope=deck=>{const xs=deck.walls.flatMap(w=>[w.x1,w.x2]),ys=deck.walls.flatMap(w=>[w.y1,w.y2]);return {left:Math.min(...xs),right:Math.max(...xs),top:Math.min(...ys),bottom:Math.max(...ys)};};
function stairs(deck){
 const groups={};for(const a of deck.details||[]){const m=/^(.*-stair-[a-z0-9]+)-/.exec(a.id);if(m)(groups[m[1]]??=[]).push(a);}
 return Object.entries(groups).map(([id,parts])=>{
  const treads=parts.filter(a=>/-tread-/.test(a.id)),arrow=parts.find(a=>a.kind==='stairArrow'),body=parts.filter(a=>a.kind==='line'&&!/landing|walkway/.test(a.id));
  const xs=body.flatMap(a=>[a.x1,a.x2]),ys=body.flatMap(a=>[a.y1,a.y2]);
  const box=xs.length?{left:Math.min(...xs),right:Math.max(...xs),top:Math.min(...ys),bottom:Math.max(...ys)}:null;
  return {id,letter:id.split('-stair-')[1],treads,arrow,box};
 });
}
// Returns [{code,severity,deckId,at:{x,y},message,ids}] — severity "error" breaks the logic, "check" needs a human look.
export function lintProject(p,brief=null){
 const issues=[],add=(code,severity,deckId,at,message,ids=[])=>issues.push({code,severity,deckId,at:at&&{x:r1(at.x),y:r1(at.y)},message,ids});
 if(p.coordinates!=='drawing'){add('unsupported','check',null,null,'Legacy path-based boat: automated layout checks need drawing-coordinate walls.');return issues;}
 for(const deck of p.decks){
  if(deck.omitFromOutput)continue;
  const walls=deck.walls||[],doors=deck.doors||[],env=envelope(deck),D=deck.id;
  // 1 · Datums: parallel walls that nearly line up should share one line.
  for(let i=0;i<walls.length;i++)for(let j=i+1;j<walls.length;j++){
   const a=walls[i],b=walls[j];
   for(const [is,fixed,run] of [[horizontal,'y1',['x1','x2']],[vertical,'x1',['y1','y2']]]){
    if(!is(a)||!is(b))continue;const off=Math.abs(a[fixed]-b[fixed]);if(off<.05||off>DATUM)continue;
    const [a0,a1]=[Math.min(a[run[0]],a[run[1]]),Math.max(a[run[0]],a[run[1]])],[b0,b1]=[Math.min(b[run[0]],b[run[1]]),Math.max(b[run[0]],b[run[1]])];
    const gap=Math.max(a0,b0)-Math.min(a1,b1);if(gap>30)continue;
    add('datum','error',D,{x:(a.x1+b.x2)/2,y:(a.y1+b.y2)/2},`${a.id} and ${b.id} are ${r1(off)} apart: snap them to one ${fixed[0]==='y'?'horizontal':'vertical'} datum.`,[a.id,b.id]);
   }
  }
  // 2 · Every wall end meets another wall or a door jamb.
  const jambs=doors.flatMap(doorJambs),stairEdges=(deck.details||[]).filter(a=>a.kind==='line'&&/-stair-/.test(a.id));
  for(const w of walls)for(const end of seg(w)){
   const others=walls.filter(o=>o!==w);
   if(nearWall(end,others)||nearWall(end,stairEdges)||jambs.some(j=>Math.hypot(j.x-end.x,j.y-end.y)<=TOL+.4))continue;
   add('open-end','check',D,end,`${w.id} stops in open floor. Close it to a wall, end it at a door jamb, or delete it.`,[w.id]);
  }
  for(const d of doors){
   const [h,e]=doorJambs(d),mid={x:(h.x+e.x)/2,y:(h.y+e.y)/2};
   // 3 · A door sits in a wall: both jambs touch wall, and no wall runs through the opening.
   // Double-door leaves meet each other at the centre jamb.
   for(const j of [h,e])if(!nearWall(j,walls,TOL+.4)&&!doors.some(o=>o!==d&&doorJambs(o).some(k=>Math.hypot(k.x-j.x,k.y-j.y)<=TOL)))add('door-floating','error',D,j,`${d.id} has a jamb that does not meet a wall.`,[d.id]);
   if(walls.some(w=>distToSegment(mid,...seg(w))<.3&&distToSegment(h,...seg(w))<.3&&distToSegment(e,...seg(w))<.3))add('wall-through-door','error',D,mid,`A wall is drawn straight across ${d.id}. Split the wall at the jambs.`,[d.id]);
   // 4 · The swing is clear of walls, fixtures, treads and other swings.
   const pts=swingSamples(d);
   const wallHit=walls.find(w=>pts.some(q=>distToSegment(q,...seg(w))<(p.theme?.lines?.wall??2.4)/2+.3));
   if(wallHit)add('swing-wall','error',D,mid,`${d.id} swings into ${wallHit.id}. Flip the hinge or the swing side.`,[d.id,wallHit.id]);
   for(const a of deck.details||[]){
    if(a.kind==='line'){if(/-stair-/.test(a.id)&&pts.some(q=>distToSegment(q,{x:a.x1,y:a.y1},{x:a.x2,y:a.y2})<.6))add('swing-stair','error',D,mid,`${d.id} swings over stair ${a.id.split('-stair-')[1].split('-')[0]}. Give the stair a clear landing at this door.`,[d.id,a.id]);continue;}
    const b=detailBox(a);if(b&&pts.some(q=>inBox(q,b)))add('swing-fixture','error',D,mid,`${d.id} swings into ${a.type||a.id}. Move the fixture or the door.`,[d.id,a.id]);
   }
   for(const o of doors){if(o===d||o.id<d.id)continue;const op=swingSamples(o);if(pts.some(q=>op.some(r=>Math.hypot(q.x-r.x,q.y-r.y)<2)))add('swing-swing','error',D,mid,`${d.id} and ${o.id} swing into each other.`,[d.id,o.id]);}
   // 5 · An exterior door opens onto a walkable surface.
   const out=pts.some(q=>q.x<env.left-.5||q.x>env.right+.5||q.y<env.top-.5||q.y>env.bottom+.5);
   if(out&&D!=='main'&&!(deck.details||[]).some(a=>/landing|walkway|deck|exterior-stair/.test(a.id)&&pts.some(q=>{const b=a.kind==='line'?{x:Math.min(a.x1,a.x2)-12,y:Math.min(a.y1,a.y2)-12,w:Math.abs(a.x2-a.x1)+24,h:Math.abs(a.y2-a.y1)+24}:detailBox(a);return b&&inBox(q,b,0);})))
    add('upper-exit-drop','error',D,mid,`${d.id} opens off an upper floor with no exterior landing or stair. Add the stair, or remove the door and flag it.`,[d.id]);
  }
  // 6 · Stairs read: direction arrow, and a stair never dead-ends into a closed wall at its top.
  for(const s of stairs(deck)){
   if(!s.arrow)add('stair-arrow','check',D,s.box&&{x:s.box.left,y:s.box.top},`${s.id} has no direction arrow.`,[s.id]);
   if(!s.box)continue;
  }
  // 7 · Labels sit inside the building, not on or outside its walls.
  for(const a of deck.labels||[]){
   if(a.kind==='room'||/RAILING|CHAINS|EXIT|DOWN|UP/.test(a.text))continue;
   if(a.x<env.left||a.x>env.right||a.y<env.top||a.y>env.bottom)add('label-outside','check',D,a,`"${a.text}" sits outside the building outline.`,[a.id]);
  }
 }
 // 8 · Floors stack: matching stairs share a footprint, and outer walls line up floor to floor.
 if(p.decks.length===2&&!p.decks.some(d=>d.omitFromOutput)){
  const [lo,up]=p.decks,ls=stairs(lo),us=stairs(up);
  for(const s of ls){const t=us.find(u=>u.letter===s.letter);if(!t||!s.box||!t.box)continue;
   const off=Math.max(...['left','right','top','bottom'].map(k=>Math.abs(s.box[k]-t.box[k])));
   if(off>.5)add('stair-stack','error','upper',{x:t.box.left,y:t.box.top},`Stair ${s.letter} is ${r1(off)} units out of line between floors. One stair has one footprint on both plans.`,[s.id,t.id]);}
  const outer=(deck,side)=>{const v=deck.walls.filter(vertical),pick=side==='left'?Math.min:Math.max;return y=>{const hits=v.filter(w=>y>=Math.min(w.y1,w.y2)-.01&&y<=Math.max(w.y1,w.y2)+.01).map(w=>w.x1);return hits.length?pick(...hits):null;};};
  for(const side of ['left','right']){
   const a=outer(lo,side),b=outer(up,side);let run=null;
   const flush=y=>{if(run){add('envelope','error','upper',{x:run.x,y:run.y0},`Upper ${side} outer wall is ${r1(run.off)} units off the lower one from y${r1(run.y0)} to y${r1(y)}. Stack exterior walls unless the source shows a step.`);run=null;}};
   for(let y=0;y<=Math.max(p.bounds?.height??0,1000);y+=2){const x0=a(y),x1=b(y);const off=x0!=null&&x1!=null?Math.abs(x0-x1):0;
    if(off>.5&&off<40){if(!run||Math.abs(run.off-off)>.5){flush(y);run={y0:y,off,x:x1};}}else flush(y);}
   flush(Math.max(p.bounds?.height??0,1000));
  }
 }
 // 9 · Inventory: the written spec governs counts and named spaces.
 if(brief)for(const deck of p.decks){const want=brief.decks?.[deck.id];if(!want)continue;
  const rooms=deck.labels.filter(a=>a.kind==='room').length;if(want.rooms!=null&&rooms!==want.rooms)add('inventory','error',deck.id,null,`${deck.name}: ${rooms} numbered rooms, brief says ${want.rooms}.`);
  for(const [type,n] of Object.entries(want.symbols||{})){const have=(deck.details||[]).filter(a=>a.type===type).length;if(have!==n)add('inventory','error',deck.id,null,`${deck.name}: ${have} ${type} symbols, brief says ${n}.`);}
  const text=deck.labels.map(a=>a.text.replace(/\s+/g,' ').toUpperCase());
  for(const name of want.spaces||[])if(!text.some(t=>t.includes(name.toUpperCase())))add('inventory','error',deck.id,null,`${deck.name}: brief lists "${name}" but no label shows it.`);
 }
 // Owner-confirmed exceptions are kept visible but do not count against the drawing.
 for(const i of issues){const e=(brief?.exceptions||[]).find(e=>e.code===i.code&&new RegExp(e.match).test(i.message));if(e){i.severity='accepted';i.reason=e.reason;}}
 return issues;
}
export function lintReport(issues){
 if(!issues.length)return 'Layout logic: no issues found.';
 const order={error:0,check:1,accepted:2};
 return issues.slice().sort((a,b)=>order[a.severity]-order[b.severity]||String(a.deckId).localeCompare(String(b.deckId))).map(i=>`[${i.severity}] ${i.code}${i.deckId?' · '+i.deckId:''}${i.at?` @ ${i.at.x},${i.at.y}`:''} — ${i.message}${i.reason?` (accepted: ${i.reason})`:''}`).join('\n');
}
