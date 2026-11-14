import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {validateEditorProject} from '../editor-project.js';
import {drawing} from '../render.js';
import {fixtureBounds} from '../fixtures.js';
import {BOATS,restoreProject,projectStorageKey} from '../projects.js';
import {textPresentation} from '../theme.js';
import {textWidth} from '../font-metrics.js';
const load=name=>JSON.parse(readFileSync(new URL('../assets/'+name,import.meta.url)));
const old=()=>load('odyssey102.json');
const reviewed=()=>load('revisions/odyssey102-v2.json');
const storage=()=>{const m=new Map();return {getItem:k=>m.get(k)??null,setItem:(k,v)=>m.set(k,v)};};

test('Odyssey V2 accounts for all written PDF comments and preserves the original revision',()=>{
 const p=reviewed();assert.equal(validateEditorProject(p).drawingRevision,'v2');
 assert.equal(p.revisionMeta.changes.filter(c=>c.sourceComment).length,41);
 assert.equal(p.revisionMeta.changes.filter(c=>!c.sourceComment).length,1);
 assert.equal(BOATS.find(b=>b.id==='odyssey102').defaultRevision,'v2');
 assert.equal(BOATS.find(b=>b.id==='odyssey102').revisions.find(r=>r.id==='v1').readOnly,true);
 assert.equal(createHash('sha256').update(JSON.stringify(load('revisions/odyssey102-v1.json').decks)).digest('hex'),createHash('sha256').update(JSON.stringify(old().decks)).digest('hex'));
});

test('Odyssey revision starts from reviewed geometry while retaining local styles, label edits and V1 history',()=>{
 const s=storage(),p=old();p.ink='#641a22';p.decks[0].labels.find(a=>a.text==='L1').text='MY ROOM';
 s.setItem(projectStorageKey(p.id),JSON.stringify(p));
 const next=restoreProject(s,p.id,reviewed(),'v2',load('revisions/odyssey102-v1.json'));
 assert.equal(next.ink,p.ink);assert.ok(next.decks[0].labels.some(a=>a.text==='MY ROOM'));
 assert.equal(next.drawingRevision,'v2');assert.notDeepEqual(next.decks[0].walls,p.decks[0].walls);
 assert.equal(restoreProject(s,p.id,load('revisions/odyssey102-v1.json'),'v1').decks[0].labels.find(a=>a.text==='MY ROOM').text,'MY ROOM');
});

test('all Odyssey doors share a circular 24-unit opening and no solid wall crosses a threshold',()=>{
 for(const d of reviewed().decks)for(const door of d.doors){
  assert.equal(Math.hypot(...door.u),24,door.id);assert.equal(Math.hypot(...door.v),24,door.id);
  const mid={x:door.x+door.u[0]/2,y:door.y+door.u[1]/2};
  assert.ok(!d.walls.some(w=>Math.abs(w.x1-w.x2)<.001?Math.abs(mid.x-w.x1)<.001&&mid.y>Math.min(w.y1,w.y2)+.01&&mid.y<Math.max(w.y1,w.y2)-.01:Math.abs(mid.y-w.y1)<.001&&mid.x>Math.min(w.x1,w.x2)+.01&&mid.x<Math.max(w.x1,w.x2)-.01),door.id);
 }
});

test('workshop bays have two outward double doors and the rear deck has usable door clearance',()=>{
 const d=reviewed().decks[0];
 for(const bay of ['left','right']){const doors=d.doors.filter(a=>a.id.startsWith('main-workshop-'+bay));assert.equal(doors.length,2);assert.ok(doors.every(a=>a.v[1]===24));}
 const rear=d.doors.find(a=>a.id==='main-rear-exit');assert.equal(rear.v[1],-24);
 assert.ok(d.details.some(a=>a.id==='main-rear-railing'&&a.y1<=-34));
 assert.ok(!d.details.some(a=>a.id==='main-detail-5'));
});

test('cabinets end before the separate upper sink and the upper stair route enters the weight room internally',()=>{
 const d=reviewed().decks[1],cab=d.details.find(a=>a.id==='upper-detail-31'),sink=d.details.find(a=>a.id==='upper-detail-32');
 assert.ok(cab.y+cab.h+3<=sink.y);
 assert.ok(!d.doors.some(a=>Math.abs(a.y-467.5)<.01&&a.u[1]===0&&a.v[1]>0));
 const wall=d.walls.find(a=>a.id.startsWith('upper-weight-room-bottom'));assert.equal(wall.x1,127.5);assert.equal(wall.x2,306);
 assert.ok(d.details.some(a=>a.id==='upper-stair-d-walkway-top'&&a.x1===0&&a.x2===127.5));
 const office=d.doors.find(a=>a.id==='upper-office-entry');assert.ok(office.x<190);
});

test('bench outlines are single L shapes and the new chair symbol is consistent and clear of walls',()=>{
 const p=reviewed(),main=p.decks[0],upper=p.decks[1];
 for(const id of ['main-left-l-bench','main-right-l-bench'])assert.equal(main.details.find(a=>a.id===id).kind,'polyline');
 assert.equal(main.details.filter(a=>a.type==='deskChair').length,10);assert.equal(upper.details.filter(a=>a.type==='deskChair').length,1);
 for(const d of p.decks)for(const c of d.details.filter(a=>a.type==='deskChair')){const b=fixtureBounds(c);for(const w of d.walls)assert.ok(b.right<=Math.min(w.x1,w.x2)||b.left>=Math.max(w.x1,w.x2)||b.bottom<=Math.min(w.y1,w.y2)||b.top>=Math.max(w.y1,w.y2),c.id);}
 assert.match(drawing(p),/data-stair-arrow=/);
});

test('chairs face the centre of their desks, including the heli office',()=>{
 const [main,upper]=reviewed().decks;
 for(let row=0;row<5;row++)for(const side of ['L','R']){
  const desk=main.details.find(a=>a.id===`main-detail-${118+row*10+(side==='R'?5:0)}`),chair=main.details.find(a=>a.id===`main-chair-${side}${row+1}`);
  assert.equal(chair.x,desk.x+desk.w/2);assert.equal(chair.rotation,row%2===0?180:0);
 }
 const desk=upper.details.find(a=>a.id==='upper-detail-1'),chair=upper.details.find(a=>a.id==='upper-office-chair');assert.equal(chair.x,desk.x+desk.w/2);
});

// Test the usable swept area, not just whether a wall gap exists. This catches
// the disconnected doors and fixtures placed inside swings seen in earlier proofs.
const inSwing=(q,a)=>{const r=Math.hypot(...a.u),dx=q.x-a.x,dy=q.y-a.y,u=(dx*a.u[0]+dy*a.u[1])/r,v=(dx*a.v[0]+dy*a.v[1])/r;return u>1.4&&v>1.4&&Math.hypot(u,v)<r-1.4;};
test('door swept areas stay clear of structural walls, furniture and fixtures on both floors',()=>{
 for(const d of reviewed().decks)for(const door of d.doors){
  for(const w of d.walls)for(let i=0;i<=100;i++)assert.ok(!inSwing({x:w.x1+(w.x2-w.x1)*i/100,y:w.y1+(w.y2-w.y1)*i/100},door),`${door.id} crosses ${w.id}`);
  for(const a of d.details.filter(a=>['rect','ellipse','symbol'].includes(a.kind))){
   const b=a.kind==='symbol'?fixtureBounds(a):{left:a.x,right:a.x+a.w,top:a.y,bottom:a.y+a.h};
   for(let i=0;i<=12;i++)for(let j=0;j<=12;j++)assert.ok(!inSwing({x:b.left+(b.right-b.left)*i/12,y:b.top+(b.bottom-b.top)*j/12},door),`${door.id} obstructed by ${a.id}`);
  }
 }
});

test('shared text hierarchy clears walls, including rotated equipment labels',()=>{
 const p=reviewed(),gap=p.theme.lines.wall/2+.3;
 for(const d of p.decks)for(const a of d.labels){
  const t=textPresentation(a,p),width=Math.max(...t.text.split('\n').map(s=>textWidth(s,t.size))),x=t.x-(t.align==='start'?0:t.align==='end'?width:width/2),y=t.y-t.size*.742,h=t.size*(t.text.split('\n').length-1)+t.size*.742;
  const angle=(t.rotation||0)*Math.PI/180,c=Math.cos(angle),s=Math.sin(angle),points=[[x,y],[x+width,y],[x,y+h],[x+width,y+h]].map(([px,py])=>[t.x+c*(px-t.x)-s*(py-t.y),t.y+s*(px-t.x)+c*(py-t.y)]);
  const left=Math.min(...points.map(q=>q[0])),right=Math.max(...points.map(q=>q[0])),top=Math.min(...points.map(q=>q[1])),bottom=Math.max(...points.map(q=>q[1]));
  for(const w of d.walls)assert.ok(right<=Math.min(w.x1,w.x2)-gap||left>=Math.max(w.x1,w.x2)+gap||bottom<=Math.min(w.y1,w.y2)-gap||top>=Math.max(w.y1,w.y2)+gap,`${a.text} touches ${w.id}`);
 }
});

test('upper stair landing connects internally and lower entry swings finish before the first tread',()=>{
 const [main,upper]=reviewed().decks;
 assert.ok(!upper.walls.some(w=>w.x1===127.5&&w.x2===127.5&&Math.min(w.y1,w.y2)<444&&Math.max(w.y1,w.y2)>410));
 const entry=main.doors.find(a=>a.id==='main-stair-a-entry'),landing=main.details.find(a=>a.id==='main-stair-a-landing-end');assert.ok(entry.y+24<landing.y1);
 const tread=main.details.find(a=>a.id==='main-stair-d-tread-1');assert.ok(tread.x1>=34);
 assert.ok(!upper.doors.some(a=>a.y===492));
});

test('import rejects malformed new detail primitives and escapes their identities',()=>{
 for(const detail of [
  {kind:'polyline',points:[[0,0]],closed:true},
  {kind:'polyline',points:[[0,0],[10,'onload']],closed:false},
  {kind:'polyline',points:[[0,0],[10,10]],closed:'true'},
  {kind:'stairArrow',x1:0,y1:0,x2:0,y2:0},
  {kind:'stairArrow',x1:0,y1:0,x2:10,y2:10}
 ]){const p=reviewed();p.decks[0].details.push({id:'invalid',role:'detail',width:1,...detail});assert.throws(()=>validateEditorProject(p));}
 const p=reviewed();p.decks[0].details.push({id:'x" onload="bad',kind:'stairArrow',role:'detail',width:1,x1:0,y1:0,x2:20,y2:0});validateEditorProject(p);
 assert.ok(!drawing(p).includes('data-stair-arrow="x" onload='));assert.ok(drawing(p).includes('x&quot; onload=&quot;bad'));
});
