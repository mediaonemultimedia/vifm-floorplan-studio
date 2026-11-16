import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {BOATS,previousRevisionFor,restoreProject,projectStorageKey,feedbackForRevision} from '../projects.js';
import {validateEditorProject} from '../editor-project.js';
import {fixtureBounds} from '../fixtures.js';
const load=v=>JSON.parse(readFileSync(new URL(`../assets/revisions/odyssey102-${v}.json`,import.meta.url)));
const storage=()=>{const m=new Map();return {getItem:k=>m.get(k)??null,setItem:(k,v)=>m.set(k,v)};};
test('Odyssey retains the superseded eight-room V3 and both earlier drawings as archives',()=>{
 const boat=BOATS.find(b=>b.id==='odyssey102');assert.equal(boat.defaultRevision,'v4');assert.equal(previousRevisionFor(boat.id,'v3').id,'v2');assert.ok(boat.revisions.filter(r=>r.id!=='v4').every(r=>r.readOnly));
 const p=load('v3');validateEditorProject(p);assert.equal(p.decks[0].labels.filter(a=>a.kind==='room').length,8);assert.deepEqual(p.decks[1],load('v2').decks[1]);
 assert.ok(!p.decks[0].labels.some(a=>['L5','R5'].includes(a.text)));
});
test('each of four paired rooms has bed at the doorway end, desk at the opposite end and closet opposite the door on the hallway wall',()=>{
 const d=load('v3').decks[0],height=(829.6-578)/4;
 for(let row=0;row<4;row++)for(const side of ['L','R']){
  const key=side+(row+1),top=578+row*height,bottom=top+height,door=d.doors.find(a=>a.id==='main-bedroom-door-'+key);
  const item=role=>d.details.find(a=>a.id===`main-bedroom-${role}-${key}`),bed=item('bed'),desk=item('desk'),closet=item('closet'),isTop=row%2===0;
  assert.ok(door&&bed&&desk&&closet,key);assert.equal(Math.hypot(...door.u),24);assert.equal(Math.hypot(...door.v),24);
  assert.equal(door.x,side==='L'?119:187);assert.equal(door.u[1],isTop?24:-24);assert.equal(door.v[0],side==='L'?-24:24);
  assert.ok(isTop?door.y<(top+bottom)/2:door.y>(top+bottom)/2);
  assert.ok(isTop?bed.y+bed.h<desk.y:desk.y+desk.h<bed.y,key);
  assert.equal(closet.y,isTop?bottom-5.95-22.95:top+5.95);
  assert.equal(side==='L'?closet.x+closet.w:closet.x,door.x);
  for(const a of [bed,desk,closet])assert.ok(a.y>top&&a.y+a.h<bottom,key);
  const chair=d.details.find(a=>a.id==='main-chair-'+key),b=fixtureBounds(chair);assert.equal(chair.x,desk.x+desk.w/2);assert.ok(isTop?b.bottom<desk.y:b.top>desk.y+desk.h);
 }
});
test('V3 archives V2 edits and can migrate a V1-only browser without losing style or annotations',()=>{
 for(const prior of ['v1','v2']){const s=storage(),old=load(prior);old.ink='#641a22';old.decks[0].labels.find(a=>a.text==='L1').text='CUSTOM';s.setItem(projectStorageKey(old.id,prior),JSON.stringify(old));
 const next=restoreProject(s,old.id,load('v3'),'v3',load('v2'),{v1:load('v1'),v2:load('v2')});assert.equal(next.ink,old.ink);assert.ok(next.decks[0].labels.some(a=>a.text==='CUSTOM'));assert.equal(next.decks[0].labels.filter(a=>a.kind==='room').length,8);
 assert.equal(JSON.parse(s.getItem(projectStorageKey(old.id,'v2')+'.archive')).decks[0].labels.filter(a=>a.kind==='room').length,10);
 }
});
test('V3 carries feedback from the nearest prior revision rather than skipping V2 owner notes',()=>{
 const s=storage();s.setItem(projectStorageKey('odyssey102','v1')+'.feedback','["old"]');s.setItem(projectStorageKey('odyssey102','v2')+'.feedback','["recent"]');assert.equal(feedbackForRevision(s,'odyssey102','v3'),'["recent"]');s.setItem(projectStorageKey('odyssey102','v3')+'.feedback','[]');assert.equal(feedbackForRevision(s,'odyssey102','v3'),'[]');
});
test('corrected bedroom doors and furniture have clear swings, complete wall openings and no fifth row',()=>{
 const p=load('v3'),d=p.decks[0];assert.equal(p.bounds.height,829.6);assert.equal(d.details.filter(a=>a.type==='deskChair').length,8);
 for(const a of d.doors){const r=Math.hypot(...a.u),inside=q=>{const dx=q.x-a.x,dy=q.y-a.y,u=(dx*a.u[0]+dy*a.u[1])/r,v=(dx*a.v[0]+dy*a.v[1])/r;return u>1.4&&v>1.4&&Math.hypot(u,v)<r-1.4;};
 for(const w of d.walls)for(let i=0;i<=100;i++)assert.ok(!inside({x:w.x1+(w.x2-w.x1)*i/100,y:w.y1+(w.y2-w.y1)*i/100}),a.id+' crosses '+w.id);
 for(const f of d.details.filter(f=>['symbol','rect','ellipse'].includes(f.kind))){const b=f.kind==='symbol'?fixtureBounds(f):{left:f.x,right:f.x+f.w,top:f.y,bottom:f.y+f.h};for(let i=0;i<=10;i++)for(let j=0;j<=10;j++)assert.ok(!inside({x:b.left+(b.right-b.left)*i/10,y:b.top+(b.bottom-b.top)*j/10}),a.id+' crosses '+f.id);}
 const mid={x:a.x+a.u[0]/2,y:a.y+a.u[1]/2};for(const w of d.walls)assert.ok(!(w.x1===w.x2?Math.abs(w.x1-mid.x)<.001&&mid.y>Math.min(w.y1,w.y2)&&mid.y<Math.max(w.y1,w.y2):Math.abs(w.y1-mid.y)<.001&&mid.x>Math.min(w.x1,w.x2)&&mid.x<Math.max(w.x1,w.x2)),a.id+' has solid threshold');
 }
 assert.ok(d.walls.every(w=>w.y1<=829.6&&w.y2<=829.6));
});
test('desk chairs use the supplied rounded chair drawing and inherit shared colour and detail weight',async()=>{
 const {SYMBOLS}=await import('../symbols.js'),{drawing}=await import('../render.js');
 assert.ok(SYMBOLS.deskChair.body.includes('<path'));assert.ok(!SYMBOLS.deskChair.body.includes('<rect'));assert.ok(SYMBOLS.deskChair.body.includes('stroke="__INK__"'));assert.ok(!/#[a-f0-9]{6}/i.test(SYMBOLS.deskChair.body));
 const p=load('v3');p.ink='#641a22';p.theme.lines.detail=.7;const svg=drawing(p),chair=svg.slice(svg.indexOf('data-fixture="deskChair"'));assert.ok(chair.includes('stroke="#641a22"'));assert.ok(chair.includes('stroke-width="1.2727272727272725"'));
});
