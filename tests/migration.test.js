import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {drawing} from '../render.js';
import {applyReferenceStyle,STYLE_REVISION} from '../reference-style.js';
import {createProject} from '../model.js';

// A saved revision-13 drawing kept the original accommodation gaps and backing
// wall, while the new renderer used the corrected door and fixture positions.
function legacyProject(){const p=createProject();p.styleRevision=13;return p;}
test('rendering a legacy saved drawing upgrades walls and fittings together without mutating the saved copy',()=>{
 const legacy=legacyProject(),before=structuredClone(legacy),current=applyReferenceStyle(structuredClone(legacy));
 assert.equal(drawing(legacy),drawing(current));
 assert.deepEqual(legacy,before);
});
test('a bundled starting drawing always uses the current complete layout revision',()=>{
 const p=JSON.parse(readFileSync(new URL('../assets/barco99.json',import.meta.url)));
 assert.equal(p.styleRevision,STYLE_REVISION);
 const before=structuredClone(p);delete p.styleRevision;
 const updated=applyReferenceStyle(p);
 for(let i=0;i<2;i++)assert.deepEqual(updated.decks[i].paths,before.decks[i].paths);
});
test('a locally edited old wall cannot inherit a new revision stamp without its connected layout migration',async()=>{
 const {mergeProjectUpdate}=await import('../project-updates.js');
 const base=legacyProject(),local=structuredClone(base),remote=applyReferenceStyle(structuredClone(base));
 local.decks[0].paths[1]='M61 37V100 M61 132V211 M61 230V312';
 local.decks[0].labels.find(a=>a.text==='OFFICE').text='MY OFFICE';
 local.ink='#343d40';
 const result=mergeProjectUpdate(base,local,remote);
 assert.equal(result.styleRevision,STYLE_REVISION);
 assert.deepEqual(result.decks[0].paths,remote.decks[0].paths);
 assert.equal(result.decks[0].labels.find(a=>a.text==='MY OFFICE').text,'MY OFFICE');
 assert.equal(result.ink,'#343d40');
 assert.equal(local.styleRevision,13);
});
test('upgraded accommodation has complete room fronts, a continuous sink backing wall and an inward bedroom entrance',async()=>{
 const {builtWallPaths,deckDoors}=await import('../reference-style.js');
 const {planPoint}=await import('../model.js');
 const {fixtureLayout,fixtureBounds}=await import('../fixtures.js');
 const p=applyReferenceStyle(legacyProject());
 for(const d of p.decks){
  const walls=builtWallPaths(d,p).flatMap(({path})=>[...path.matchAll(/M([\d.e+-]+) ([\d.e+-]+)L([\d.e+-]+) ([\d.e+-]+)/g)].map(m=>m.slice(1).map(Number)));
  const doors=deckDoors(d,p),covered=q=>walls.some(([x,y,ex,ey])=>Math.abs(y-ey)<.001&&Math.abs(q.y-y)<.001&&q.x>=Math.min(x,ex)-.001&&q.x<=Math.max(x,ex)+.001);
  // Fronts of 11/12/13 (21/22/23) must be closed everywhere except real door thresholds.
  for(let across=37;across<=312;across+=.5){const q=planPoint(230,across,p);const opening=doors.some(o=>Math.abs(o.start.y-q.y)<.001&&q.x>Math.min(o.start.x,o.end.x)-.001&&q.x<Math.max(o.start.x,o.end.x)+.001);assert.ok(opening||covered(q),`${d.id} incomplete bedroom front at ${across}`);}
  const bank=fixtureBounds(fixtureLayout(d,p).find(f=>f.type==='sinkBank'));
  const backing=planPoint(0,d.id==='main'?125:256,p).x;
  assert.ok(walls.some(([x,y,ex,ey])=>Math.abs(x-backing)<.001&&Math.abs(ex-backing)<.001&&Math.min(y,ey)<=bank.top&&Math.max(y,ey)>=bank.bottom),`${d.id} sink lacks continuous backing wall`);
  const entry=doors.find(o=>Math.abs(o.start.x-planPoint(202,86,p).x)<.001&&Math.abs(o.start.y-planPoint(202,86,p).y)<.001);
  const left=planPoint(0,37,p).x,right=planPoint(0,125,p).x,top=planPoint(202,0,p).y,bottom=planPoint(140,0,p).y;
  for(const q of [entry.start,entry.end,entry.open])assert.ok(q.x>=left&&q.x<=right&&q.y>=top&&q.y<=bottom,`${d.id} entrance leaves room 10/20`);
 }
});
test('matching bedroom rows use one baseline when any door requires bottom placement',async()=>{
 const {planPoint}=await import('../model.js');
 const p=applyReferenceStyle(createProject());
 for(const [i,numbers] of [[0,['8','7','5']],[1,['18','17','15']]]){
  const labels=numbers.map(n=>p.decks[i].labels.find(a=>a.text===n));
  assert.ok(labels.every(a=>a.placementRule.startsWith('bottom')),numbers.join('/'));
  assert.equal(new Set(labels.map(a=>planPoint(a.x,a.y,p).y.toFixed(6))).size,1);
 }
});
test('an older updater cannot make legacy wall gaps current by merging the revision number first',()=>{
 const mixed=legacyProject();mixed.styleRevision=STYLE_REVISION;
 const expected=structuredClone(mixed);delete expected.styleRevision;applyReferenceStyle(expected);
 assert.deepEqual(applyReferenceStyle(mixed).decks.map(d=>d.paths),expected.decks.map(d=>d.paths));
});
