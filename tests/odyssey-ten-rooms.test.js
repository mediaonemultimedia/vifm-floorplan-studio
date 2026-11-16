import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {BOATS,restoreProject,projectStorageKey} from '../projects.js';
import {validateEditorProject} from '../editor-project.js';
import {fixtureBounds} from '../fixtures.js';
import {drawing} from '../render.js';
const boat=()=>BOATS.find(b=>b.id==='odyssey102');
const current=()=>prior('v4');
const prior=v=>JSON.parse(readFileSync(new URL(`../assets/revisions/odyssey102-${v}.json`,import.meta.url)));
const storage=()=>{const m=new Map();return {getItem:k=>m.get(k)??null,setItem:(k,v)=>m.set(k,v)};};
test('archived V4 retains ten lower bedrooms while V3 retains eight',()=>{
 const p=current();validateEditorProject(p);
 assert.equal(p.decks[0].labels.filter(a=>a.kind==='room').length,10);
 assert.deepEqual(p.decks[0].labels.filter(a=>a.kind==='room').map(a=>a.text).sort(),['L1','L2','L3','L4','L5','R1','R2','R3','R4','R5']);
 assert.equal(boat().revisions.find(r=>r.id==='v4').readOnly,true);assert.equal(boat().revisions.find(r=>r.id==='v3').readOnly,true);
 assert.equal(prior('v3').decks[0].labels.filter(a=>a.kind==='room').length,8);
 const oldUpper=prior('v3').decks[1],upper=p.decks[1];assert.equal(upper.walls.length,oldUpper.walls.length);assert.equal(upper.details.length,oldUpper.details.length);
 for(let i=0;i<upper.walls.length;i++){const a=upper.walls[i],b=oldUpper.walls[i];assert.ok(Math.abs((a.x2-a.x1)-(b.x2-b.x1))<1e-9);assert.ok(Math.abs((a.y2-a.y1)-(b.y2-b.y1))<1e-9);}
 assert.deepEqual(upper.doors.map(a=>[a.u,a.v]),oldUpper.doors.map(a=>[a.u,a.v]));
});
test('the actual lower outline and exported SVG follow 46 feet across by 130 feet along',()=>{
 const p=current(),d=p.decks[0];assert.equal(p.width,46);assert.equal(p.length,130);
 assert.ok(Math.abs(p.bounds.height/p.bounds.width-130/46)<1e-10,'drawn hull ratio must match metadata');
 for(const side of ['port','starboard']){
  const walls=[...d.walls.filter(w=>w.id.startsWith(`main-${side}-perimeter-`)),...d.details.filter(w=>w.id===`main-rear-${side}-edge`)];
  assert.equal(Math.min(...walls.flatMap(w=>[w.y1,w.y2])),0);
  assert.equal(Math.max(...walls.flatMap(w=>[w.y1,w.y2])),p.bounds.height);
  assert.ok(walls.every(w=>w.x1===(side==='port'?0:p.bounds.width)&&w.x2===w.x1));
 }
 assert.equal(d.details.find(a=>a.id==='main-rear-railing').y1,0,'rear platform is part of the 130-foot envelope');
 const svg=drawing(p);assert.ok(svg.includes(`y2="${p.bounds.height}"`));assert.ok(!/scale\([^)]*,/.test(svg),'no unequal scaling of the drawing');
});
test('all five paired rows retain complete furnishings, alternating access and clear standard-size door swings',()=>{
 const p=current(),d=p.decks[0],top=614,h=(p.bounds.height-top)/5;
 assert.equal(d.details.filter(a=>a.type==='deskChair').length,10);
 for(let row=0;row<5;row++)for(const side of ['L','R']){
  const key=side+(row+1),a=top+row*h,b=a+h,atTop=row%2===0;
  const door=d.doors.find(f=>f.id==='main-bedroom-door-'+key);assert.ok(door,key);
  assert.equal(Math.hypot(...door.u),24);assert.equal(Math.hypot(...door.v),24);
  assert.equal(door.u[1],atTop?24:-24);assert.equal(door.v[0],side==='L'?-24:24);
  const item=role=>d.details.find(f=>f.id===`main-bedroom-${role}-${key}`),bed=item('bed'),desk=item('desk'),closet=item('closet');
  for(const f of [bed,desk,closet,item('pillow')])assert.ok(f&&f.y>a&&f.y+f.h<b,key+' has all furnishings inside its room');
  assert.ok(atTop?bed.y+bed.h<desk.y:desk.y+desk.h<bed.y,key+' follows door/bed orientation');
  assert.equal(side==='L'?closet.x+closet.w:closet.x,door.x);
  const chair=fixtureBounds(d.details.find(f=>f.id==='main-chair-'+key));assert.ok(chair.top>a&&chair.bottom<b);
  const inside=q=>{const dx=q.x-door.x,dy=q.y-door.y,u=(dx*door.u[0]+dy*door.u[1])/24,v=(dx*door.v[0]+dy*door.v[1])/24;return u>1.4&&v>1.4&&Math.hypot(u,v)<22.6;};
  for(const w of d.walls)for(let i=0;i<=50;i++)assert.ok(!inside({x:w.x1+(w.x2-w.x1)*i/50,y:w.y1+(w.y2-w.y1)*i/50}),key+' door intersects '+w.id);
  for(const f of [bed,desk,closet])for(let i=0;i<=10;i++)for(let j=0;j<=10;j++)assert.ok(!inside({x:f.x+f.w*i/10,y:f.y+f.h*j/10}),key+' door intersects furniture');
  const mid={x:door.x+door.u[0]/2,y:door.y+door.u[1]/2};assert.ok(!d.walls.some(w=>w.x1===w.x2&&Math.abs(w.x1-mid.x)<.001&&mid.y>Math.min(w.y1,w.y2)&&mid.y<Math.max(w.y1,w.y2)),key+' has an open threshold');
 }
});
test('V4 migration preserves local style and text, archives eight-room V3 and installs ten-room geometry',()=>{
 const saved=prior('v3');saved.ink='#641a22';saved.width=44;saved.length=150;saved.decks[0].labels.find(a=>a.text==='L1').text='CUSTOM';
 const s=storage();s.setItem(projectStorageKey(saved.id,'v3'),JSON.stringify(saved));
 const p=restoreProject(s,saved.id,current(),'v4',prior('v3'),{v1:prior('v1'),v2:prior('v2'),v3:prior('v3')});
 assert.equal(p.ink,saved.ink);assert.equal(p.width,46);assert.equal(p.length,130);assert.ok(p.decks[0].labels.some(a=>a.text==='CUSTOM'));assert.equal(p.decks[0].labels.filter(a=>a.kind==='room').length,10);
 assert.equal(JSON.parse(s.getItem(projectStorageKey(saved.id,'v3')+'.archive')).decks[0].labels.filter(a=>a.kind==='room').length,8);
 assert.ok(Math.abs(p.bounds.height/p.bounds.width-130/46)<1e-10);
});
test('widening the hull keeps existing shared-room doors clear of their fixtures',()=>{
 const d=current().decks[0];
 for(const a of d.doors.filter(a=>!a.id.startsWith('main-bedroom-'))){
  const r=Math.hypot(...a.u),inside=q=>{const dx=q.x-a.x,dy=q.y-a.y,u=(dx*a.u[0]+dy*a.u[1])/r,v=(dx*a.v[0]+dy*a.v[1])/r;return u>1.4&&v>1.4&&Math.hypot(u,v)<r-1.4;};
  for(const f of d.details.filter(f=>['symbol','rect','ellipse'].includes(f.kind))){const b=f.kind==='symbol'?fixtureBounds(f):{left:f.x,right:f.x+f.w,top:f.y,bottom:f.y+f.h};for(let i=0;i<=10;i++)for(let j=0;j<=10;j++)assert.ok(!inside({x:b.left+(b.right-b.left)*i/10,y:b.top+(b.bottom-b.top)*j/10}),a.id+' crosses '+f.id);}
 }
});
test('shared rectangular furnishings do not straddle structural wall segments',()=>{
 const d=current().decks[0];
 for(const f of d.details.filter(f=>f.kind==='rect'&&!f.id.startsWith('main-bedroom-'))){
  for(const w of d.walls)for(let i=0;i<=30;i++){
   const x=w.x1+(w.x2-w.x1)*i/30,y=w.y1+(w.y2-w.y1)*i/30;
   assert.ok(!(x>f.x+1.4&&x<f.x+f.w-1.4&&y>f.y+1.4&&y<f.y+f.h-1.4),f.id+' straddles '+w.id);
  }
 }
});
