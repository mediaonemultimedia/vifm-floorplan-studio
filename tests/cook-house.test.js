import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createProject,planPoint} from '../model.js';
import {applyReferenceStyle,deckDoors,builtWallPaths} from '../reference-style.js';

const near=(a,b)=>Math.abs(a-b)<.001;
test('both cook-house assemblies include the side door, closet door and end exit',()=>{
 const p=applyReferenceStyle(createProject());
 for(const d of p.decks){
  const doors=deckDoors(d,p);
  for(const [x,y,opening] of [[359,169,'forward'],[353,249,'inward'],[442,249,'inward']]){
   const q=planPoint(x,y,p),door=doors.find(o=>near(o.start.x,q.x)&&near(o.start.y,q.y));
   assert.ok(door,`${d.id} missing entrance at ${x},${y}`);
   assert.ok(near(door.radius,24));
   if(opening==='forward')assert.ok(door.open.y<door.start.y);
   else assert.ok(door.open.x<door.start.x);
  }
 }
});
test('the closet has a closing partition and wall returns on both sides of its door',()=>{
 const p=applyReferenceStyle(createProject());
 for(const d of p.decks){
  const walls=builtWallPaths(d,p).flatMap(({path})=>[...path.matchAll(/M([\d.e+-]+) ([\d.e+-]+)L([\d.e+-]+) ([\d.e+-]+)/g)].map(m=>m.slice(1).map(Number)));
  const a=planPoint(359,208,p),b=planPoint(320,208,p);
  assert.ok(walls.some(([x,y,ex,ey])=>near(x,a.x)&&near(ex,b.x)&&near(Math.min(y,ey),a.y)&&near(Math.max(y,ey),b.y)),`${d.id} missing closet partition`);
  const hinge=planPoint(353,249,p),top=planPoint(359,249,p),bottom=planPoint(320,249,p);
  assert.ok(walls.some(([x,y,ex,ey])=>near(x,hinge.x)&&near(ex,hinge.x)&&Math.min(y,ey)<=top.y+.001&&Math.max(y,ey)>=hinge.y-.001),`${d.id} missing hinge return`);
  assert.ok(walls.some(([x,y,ex,ey])=>near(x,hinge.x)&&near(ex,hinge.x)&&near(Math.min(y,ey),hinge.y+24)&&near(Math.max(y,ey),bottom.y)),`${d.id} missing latch return`);
 }
});
