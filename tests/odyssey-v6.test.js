import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {BOATS,restoreProject,projectStorageKey} from '../projects.js';
import {validateEditorProject} from '../editor-project.js';
import {lintProject} from '../plan-lint.js';
import {feedbackReport,nearbyGeometry} from '../feedback.js';
const load=v=>JSON.parse(readFileSync(new URL(`../assets/revisions/odyssey102-${v}.json`,import.meta.url)));
const brief=JSON.parse(readFileSync(new URL('../briefs/odyssey102.json',import.meta.url)));
const boat=()=>BOATS.find(b=>b.id==='odyssey102');
test('V6 is the working Odyssey and V5 is archived',()=>{
 assert.equal(boat().defaultRevision,'v6');assert.equal(boat().revisions.find(r=>r.id==='v5').readOnly,true);
 const p=load('v6');validateEditorProject(p);assert.equal(p.drawingRevision,'v6');
 for(const d of p.decks)assert.equal(d.labels.filter(a=>a.kind==='room').length,10);
});
test('V6 passes every layout check except the owner-accepted exceptions',()=>{
 const open=lintProject(load('v6'),brief).filter(i=>i.severity!=='accepted');
 assert.deepEqual(open.map(i=>i.message),[]);
});
test('the checker catches the V5 problems that V6 fixes',()=>{
 const codes=new Set(lintProject(load('v5'),brief).filter(i=>i.severity==='error').map(i=>i.code));
 for(const code of ['envelope','stair-stack','upper-exit-drop','inventory'])assert.ok(codes.has(code),code);
});
test('upper exterior walls stack on the lower walls below the helipad',()=>{
 const p=load('v6'),x=(d,y,side)=>{const v=d.walls.filter(w=>Math.abs(w.x1-w.x2)<.01&&y>=Math.min(w.y1,w.y2)&&y<=Math.max(w.y1,w.y2)).map(w=>w.x1);return side==='left'?Math.min(...v):Math.max(...v);};
 for(const y of [300,400,470,700,900])for(const side of ['left','right'])assert.equal(x(p.decks[1],y,side),x(p.decks[0],y,side));
});
test('brief spaces are labelled on the right floors',()=>{
 const p=load('v6'),text=d=>d.labels.map(a=>a.text);
 assert.ok(text(p.decks[0]).includes('DRY ROOM'));
 for(const name of ['LOUNGE','FIRST AID','WEIGHT ROOM'])assert.ok(text(p.decks[1]).includes(name),name);
});
test('V6 keeps owner colours and label edits from a saved V5',()=>{
 const old=load('v5');old.ink='#874a38';old.decks[0].labels.find(a=>a.text==='L1').text='OWNER ROOM';
 const m=new Map([[projectStorageKey(old.id,'v5'),JSON.stringify(old)]]),s={getItem:k=>m.get(k)??null,setItem:(k,v)=>m.set(k,v)};
 const p=restoreProject(s,old.id,load('v6'),'v6',load('v5'),{v1:load('v1'),v2:load('v2'),v3:load('v3'),v4:load('v4'),v5:load('v5')});
 assert.equal(p.ink,old.ink);assert.ok(p.decks[0].labels.some(a=>a.text==='OWNER ROOM'));assert.ok(p.decks[1].labels.some(a=>a.text==='LOUNGE'));
});
test('pasted feedback names the nearest geometry and includes the layout checks',()=>{
 const p=load('v6'),near=nearbyGeometry(p,'upper',{x:188,y:482});assert.ok(near.some(a=>a.id==='upper-lounge-entry'));
 const note={id:'n1',projectName:p.name,deckId:'upper',deckName:'UPPER LEVEL',page:{x:1,y:1},local:{x:188,y:482},source:{x:188,y:482},nearby:[],release:'x',drawingRevision:'v6',text:'Swap the lounge door side'};
 const text=feedbackReport([note],undefined,p,brief);
 assert.ok(text.includes('upper-lounge-entry'));assert.ok(text.includes('Layout checks'));assert.ok(text.includes('CLAUDE.md'));
});
