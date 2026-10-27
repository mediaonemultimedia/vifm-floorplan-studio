import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createProject,planPoint} from '../model.js';
import {applyReferenceStyle,builtWallPaths,deckDoors} from '../reference-style.js';
import {stairLayout} from '../stairs.js';
const near=(a,b)=>Math.abs(a-b)<.001;

test('both top landings align with the room wall and surround the complete doorway',()=>{
 const p=applyReferenceStyle(createProject());
 for(const d of p.decks){
  const stair=stairLayout(d,p).find(s=>s.id==='dry-room-flight'),wall=planPoint(666,278,p);
  assert.ok(near(stair.landing.top,wall.y),`${d.id}: landing and wall tops differ`);
  const door=deckDoors(d,p).find(o=>near(o.start.x,wall.x)&&o.start.y>wall.y&&o.start.y<wall.y+40);
  assert.ok(door);
  assert.ok(Math.min(door.start.y,door.end.y)>=stair.landing.top+5);
  assert.ok(Math.max(door.start.y,door.end.y)<=stair.landing.top+stair.landing.height-5);
 }
});
test('the upstairs connecting stair keeps its source overhang with a wall reaching its outer edge',()=>{
 const p=applyReferenceStyle(createProject()),d=p.decks[1],stair=stairLayout(d,p).find(s=>s.id==='connecting-flight'),corner=planPoint(484,249,p);
 assert.ok(stair.left+stair.width>corner.x+4);
 const edge=stair.left+stair.width,y=stair.top+stair.height;
 const walls=builtWallPaths(d,p).flatMap(({path})=>[...path.matchAll(/M([\d.e+-]+) ([\d.e+-]+)L([\d.e+-]+) ([\d.e+-]+)/g)].map(m=>m.slice(1).map(Number)));
 assert.ok(walls.some(([x,sy,ex,ey])=>near(sy,y)&&near(ey,y)&&Math.min(x,ex)<=corner.x+.001&&Math.max(x,ex)>=edge-.001));
});
