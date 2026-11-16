import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {BOATS,restoreProject,projectStorageKey} from '../projects.js';
import {fixtureBounds} from '../fixtures.js';
import {validateEditorProject} from '../editor-project.js';
const boat=()=>BOATS.find(b=>b.id==='odyssey102');
const load=v=>JSON.parse(readFileSync(new URL(`../assets/revisions/odyssey102-${v}.json`,import.meta.url)));
// V5 is archived under V6; these tests keep checking its own asset.
const current=()=>load('v5');
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-8,`${a} != ${b}`);
test('working Odyssey has twenty bedrooms: ten on each floor, with one and two washer/dryer sets',()=>{
 const p=current();validateEditorProject(p);assert.equal(boat().revisions.find(r=>r.id==='v5').readOnly,true);
 for(const [i,d] of p.decks.entries()){
  assert.equal(d.labels.filter(a=>a.kind==='room').length,10);
  assert.equal(d.details.filter(a=>a.type==='washer').length,i+1);assert.equal(d.details.filter(a=>a.type==='dryer').length,i+1);
  for(const role of ['bed','desk','closet'])assert.equal(d.details.filter(a=>a.id.includes('bedroom-'+role+'-')).length,10);
 }
 assert.equal(boat().revisions.find(r=>r.id==='v4').readOnly,true);
 near(p.bounds.width/p.bounds.height,46/130);
});
test('shared washroom and shower room tops and bottoms align on both floors',()=>{
 for(const d of current().decks){
  const prefix=d.id==='main'?'main-':'upper-accommodation-';
  const left=d.walls.find(a=>a.id===prefix+'shared-bathroom-front-0');
  const right=d.walls.find(a=>a.id===prefix+'laundry-shower-top-0');
  assert.ok(left&&right);near(left.y1,right.y1);near(left.y1,542.6);
  const side=d.walls.find(a=>a.id===prefix+'shared-bathroom-side-0');near(side.y2,614);
 }
});
test('three H.W. tanks are equal circles; the furnace remains and the former boiler is a bench left of its divider',()=>{
 const p=current(),d=p.decks[0],old=load('v4').decks[0];
 const tanks=[80,81,82].map(n=>d.details.find(a=>a.id==='main-detail-'+n));
 for(const t of tanks){assert.equal(t.kind,'ellipse');near(t.w,t.h);near(t.w,tanks[0].w);assert.ok(t.x+t.w<p.bounds.width);}
 assert.ok(!d.labels.some(a=>a.text==='BOILER'));
 assert.deepEqual(d.details.find(a=>a.id==='main-detail-79'),old.details.find(a=>a.id==='main-detail-79'));
 const bench=d.details.find(a=>a.id==='main-detail-78'),divider=d.walls.find(a=>a.id==='main-utility-bench-divider');
 assert.ok(bench&&divider);near(bench.x+bench.w,divider.x1);assert.ok(d.labels.some(a=>a.id==='main-label-23'&&a.text==='BENCH'));
 assert.ok(!d.walls.some(a=>a.id.startsWith('main-service-divider-1')||a.id.startsWith('main-service-divider-2')));
});
test('upper accommodation is copied from the same corrected lower block, including doors and fixtures',()=>{
 const p=current(),[lower,upper]=p.decks;
 for(const key of ['walls','doors','details','labels'])for(const a of upper[key].filter(a=>a.id.startsWith('upper-accommodation-'))){
  const id='main-'+a.id.slice('upper-accommodation-'.length);const b=lower[key].find(b=>b.id===id);assert.ok(b,id);
  const expected={...b};if(key==='walls'){expected.y1=Math.max(542.6,expected.y1);expected.y2=Math.max(542.6,expected.y2);}
  assert.deepEqual({...a,id},expected,id+' differs between floors');
 }
 const pad=upper.labels.find(a=>a.text==='H').centerArea;near(pad.w/pad.h,43/35);
});
test('all bedroom and shared-room door sweeps remain clear of walls and equipment on both floors',()=>{
 for(const d of current().decks)for(const a of d.doors){
  const r=Math.hypot(...a.u);near(r,24);near(Math.hypot(...a.v),24);
  const inside=q=>{const dx=q.x-a.x,dy=q.y-a.y,u=(dx*a.u[0]+dy*a.u[1])/r,v=(dx*a.v[0]+dy*a.v[1])/r;return u>1.4&&v>1.4&&Math.hypot(u,v)<r-1.4;};
  for(const w of d.walls)for(let i=0;i<=60;i++)assert.ok(!inside({x:w.x1+(w.x2-w.x1)*i/60,y:w.y1+(w.y2-w.y1)*i/60}),a.id+' intersects '+w.id);
  for(const f of d.details.filter(a=>['rect','ellipse','symbol'].includes(a.kind))){const b=f.kind==='symbol'?fixtureBounds(f):{left:f.x,right:f.x+f.w,top:f.y,bottom:f.y+f.h};for(let i=0;i<=10;i++)for(let j=0;j<=10;j++)assert.ok(!inside({x:b.left+(b.right-b.left)*i/10,y:b.top+(b.bottom-b.top)*j/10}),a.id+' intersects '+f.id);}
 }
});
test('two upstairs laundry pairs have a clear aisle and entrance between them',()=>{
 const d=current().decks[1],machines=d.details.filter(a=>['washer','dryer'].includes(a.type));assert.equal(machines.length,4);
 const rows=[...new Set(machines.map(a=>a.y))].sort((a,b)=>a-b);assert.equal(rows.length,2);
 const top=Math.max(...machines.filter(a=>a.y===rows[0]).map(a=>fixtureBounds(a).bottom));
 const bottom=Math.min(...machines.filter(a=>a.y===rows[1]).map(a=>fixtureBounds(a).top));
 const door=d.doors.find(a=>a.id==='upper-accommodation-laundry-shower-entry');assert.ok(door);
 assert.ok(door.y>top+1.4&&door.y+door.u[1]<bottom-1.4);
});
test('V5 keeps edited V4 presentation and text while installing twenty-room geometry and preserving the V4 archive',()=>{
 const old=load('v4');old.ink='#874a38';old.decks[0].labels.find(a=>a.text==='L1').text='OWNER ROOM';
 const m=new Map([[projectStorageKey(old.id,'v4'),JSON.stringify(old)]]),s={getItem:k=>m.get(k)??null,setItem:(k,v)=>m.set(k,v)};
 const p=restoreProject(s,old.id,current(),'v5',load('v4'),{v1:load('v1'),v2:load('v2'),v3:load('v3'),v4:load('v4')});
 assert.equal(p.ink,old.ink);assert.equal(p.notes,current().notes);assert.ok(p.decks[0].labels.some(a=>a.text==='OWNER ROOM'));assert.equal(p.decks[1].labels.filter(a=>a.kind==='room').length,10);
 assert.equal(JSON.parse(s.getItem(projectStorageKey(old.id,'v4')+'.archive')).decks[1].labels.filter(a=>a.kind==='room').length,0);
});
test('deliberately edited project notes survive the V5 transition',()=>{
 const old=load('v4');old.notes='Owner: retain this review comment.';
 const m=new Map([[projectStorageKey(old.id,'v4'),JSON.stringify(old)]]),s={getItem:k=>m.get(k)??null,setItem:(k,v)=>m.set(k,v)};
 const p=restoreProject(s,old.id,current(),'v5',load('v4'),{v1:load('v1'),v2:load('v2'),v3:load('v3'),v4:load('v4')});assert.equal(p.notes,old.notes);
});
