import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {prepareEditorProject} from '../editor-project.js';
import {deckDoors,builtWallPaths} from '../reference-style.js';
import {planPoint} from '../model.js';
import {lineSegments} from '../wall-lines.js';
const input=()=>JSON.parse(readFileSync(new URL('../assets/barco99.json',import.meta.url)));
function oldEditor(){const p=prepareEditorProject(input());delete p.barcoCookHouseRevision;const d=p.decks[1];d.walls=builtWallPaths(d,p).flatMap(w=>lineSegments(w.path)).map((w,i)=>({id:`upper-wall-${i}`,role:'wall',...w}));return p;}
test('confirmed cook house is shown on main only; upstairs has no copied footprint or entrances',()=>{
 const raw=input(),p=prepareEditorProject(raw),d=p.decks[1];
 assert.equal(p.barcoCookHouseRevision,1);
 assert.ok(p.decks[0].labels.some(a=>a.text==='COOK HOUSE'));
 assert.ok(!d.labels.some(a=>a.text==='COOK HOUSE'));
 const boundary=planPoint(320,0,p).y,top=planPoint(484,0,p).y;
 assert.ok(!d.walls.some(w=>w.x1>1&&w.x2>1&&w.x1<200&&w.x2<200&&w.y1>=top&&w.y2>=top&&w.y1<=boundary&&w.y2<=boundary&&w.id!=='upper-wall-58'));
 for(const [x,y] of [[359,169],[353,249],[442,249],[484,100]]){const q=planPoint(x,y,p);assert.ok(!deckDoors(d,p).some(a=>Math.hypot(a.start.x-q.x,a.start.y-q.y)<.01));}
 assert.deepEqual(prepareEditorProject(p),p);
});
test('correction upgrades the previously saved editor while preserving unrelated edits and main geometry',()=>{
 const old=oldEditor(),upper=old.decks[1];upper.labels.push({id:'old-cook-label',kind:'label',text:'CUSTOM GALLEY',x:447,y:124.5,size:8,align:'middle'});
 upper.walls.push({id:'user-wall',role:'secondary',x1:12,y1:32,x2:44,y2:32});old.ink='#641a22';old.decks[0].labels[0].text='MY LABEL';const main=structuredClone(old.decks[0]);
 const next=prepareEditorProject(old);assert.deepEqual(next.decks[0],main);assert.equal(next.ink,'#641a22');assert.ok(next.decks[1].walls.some(w=>w.id==='user-wall'));assert.ok(!next.decks[1].labels.some(a=>a.id==='old-cook-label'));
});

test('omitting the cook house preserves the adjacent upstairs stair approach outside its footprint',()=>{
 const old=oldEditor(),a=planPoint(484,86,old),b=planPoint(520,86,old),next=prepareEditorProject(old);
 assert.ok(next.decks[1].walls.some(w=>Math.hypot(w.x1-a.x,w.y1-a.y)<.01&&Math.hypot(w.x2-b.x,w.y2-b.y)<.01));
});
