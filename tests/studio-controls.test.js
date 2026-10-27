import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createProject} from '../model.js';
import {prepareEditorProject,validateEditorProject} from '../editor-project.js';
import {textPresentation,setTextSize,setLineStyle} from '../theme.js';
import {moveWall,editWallEndpoint} from '../wall-lines.js';
import {projectStorageKey,restoreProject} from '../projects.js';
import {drawing} from '../render.js';
const barco=()=>prepareEditorProject(createProject());
const odyssey=()=>prepareEditorProject(JSON.parse(readFileSync(new URL('../assets/odyssey102.json',import.meta.url))));
test('room number and label sizes update their entire role across both floors',()=>{
 const p=barco();setTextSize(p,'room',17);setTextSize(p,'label',7);
 for(const d of p.decks)for(const a of d.labels){const t=textPresentation(a,p);assert.equal(t.size,a.kind==='room'?17:a.textStyle==='detail'?p.theme.text.detail:7);}
});
test('centred multiline labels stay at the area midpoint after changing shared type size',()=>{
 const p=barco(),a={kind:'label',text:'WASH\nROOMS',x:0,y:0,align:'middle',centerArea:{x:10,y:20,w:100,h:80}};
 const before=textPresentation(a,p);setTextSize(p,'label',12);const after=textPresentation(a,p);
 assert.equal(before.x,60);assert.equal(after.x,60);assert.equal(after.y+12/2-12*.371,60);assert.equal(after.align,'middle');
});
test('BARCO migration makes each built wall an independent editable segment and preserves labels',()=>{
 const input=createProject(),p=prepareEditorProject(input),d=p.decks[0];assert.ok(d.walls.length>input.decks[0].paths.length);
 const before=structuredClone(d.walls),wall=d.walls[5];moveWall(wall,7,-3);
 assert.equal(wall.x1,before[5].x1+7);assert.equal(wall.y2,before[5].y2-3);
 for(let i=0;i<d.walls.length;i++)if(i!==5)assert.deepEqual(d.walls[i],before[i]);
 editWallEndpoint(wall,'end',wall.x2+4,wall.y2);assert.equal(wall.x2,before[5].x2+11);
 assert.equal(p.decks[0].labels.length,17);assert.equal(input.editorRevision,undefined);
 assert.deepEqual(prepareEditorProject(p),p);
});
test('independent lines use square caps; changing detail and dotted widths does not change walls',()=>{
 const p=barco(),wall=p.theme.lines.wall;setLineStyle(p,'detail',.7);setLineStyle(p,'threshold',1.1);setLineStyle(p,'dash',3);
 const svg=drawing(p);assert.equal(p.theme.lines.wall,wall);assert.ok(svg.includes('stroke-linecap="square"'));
 assert.ok(svg.includes('stroke-dasharray="3 3"'));assert.ok(svg.includes('stroke-width="0.7"'));
});
test('Odyssey uses its own geometry and sources and does not acquire BARCO fixtures or dock',()=>{
 const p=odyssey(),svg=drawing(p);assert.equal(p.id,'odyssey102');assert.equal(p.decks[0].labels.filter(a=>a.kind==='room').length,10);
 assert.equal(p.decks[1].labels.filter(a=>a.kind==='room').length,0);assert.equal(p.reviewFlags.length,9);
 assert.ok(svg.includes('WEIGHT ROOM'));assert.ok(svg.includes('>H</tspan>'));assert.ok(!svg.includes('COOK HOUSE'));assert.ok(!svg.includes('data-dock-area'));
 assert.equal(validateEditorProject(JSON.parse(JSON.stringify(p))).id,'odyssey102');
});
test('boat storage isolates edits and feedback while upgrading the existing BARCO save',()=>{
 const values=new Map(),storage={getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,v)};
 const b=barco(),o=odyssey();b.name='MY BARCO';storage.setItem('mediaone.floorplans.barco99.v1',JSON.stringify(b));
 const restored=restoreProject(storage,'barco99',barco());assert.equal(restored.name,'MY BARCO');
 storage.setItem(projectStorageKey('barco99'),JSON.stringify(restored));storage.setItem(projectStorageKey('odyssey102'),JSON.stringify(o));
 assert.equal(restoreProject(storage,'odyssey102',o).name,'ODYSSEY 102');assert.notEqual(projectStorageKey('barco99'),projectStorageKey('odyssey102'));
});
test('new project validation rejects executable SVG, invalid themes and non-finite wall coordinates',()=>{
 const p=odyssey();p.decks[0].walls[0].x1=Infinity;assert.throws(()=>validateEditorProject(p));
 const q=odyssey();q.theme.lines.wall=-2;assert.throws(()=>validateEditorProject(q));
 const r=odyssey();r.decks[0].details.push({id:'bad',kind:'svg',body:'<script>alert(1)</script>'});assert.throws(()=>validateEditorProject(r));
});
test('valid theme input updates immediately and groups a typing session into one undo step',async()=>{
 const {bindThemeInput}=await import('../theme-controls.js');const p=barco(),input={value:'18'},records=[];
 bindThemeInput(input,p,'room',setTextSize,(fn,options)=>{records.push(options);fn();},()=>{},()=>{});
 input.onfocus();input.oninput();assert.equal(p.theme.text.room,18);
 input.value='16';input.oninput();assert.equal(p.theme.text.room,16);assert.equal(records.filter(r=>r.record).length,1);
 input.value='';input.oninput();assert.equal(p.theme.text.room,16);
});
test('caption baselines clear exterior exit labels and remain aligned between floors',()=>{
 const p=odyssey(),svg=drawing(p),exit=p.decks[0].labels.findLast(a=>a.text==='EXIT'),baseline=Number(svg.match(/<text x="[^"]+" y="([^"]+)"[^>]*>LOWER LEVEL<\/text>/)[1]);
 assert.ok(baseline>exit.y+15);assert.ok(svg.includes(`y="${baseline}" font-family="LibreFranklin" font-size="${p.theme.text.caption}"`));
});
test('import rejects unsafe text rotations and negative detail dimensions',()=>{
 const p=odyssey();p.decks[0].labels[0].rotation='0)" onload="alert(1)';assert.throws(()=>validateEditorProject(p));
 const q=odyssey();q.decks[0].details.find(a=>a.kind==='rect').w=-4;assert.throws(()=>validateEditorProject(q));
});
test('default shared BARCO label sizes still clear the independent walls',async()=>{
 const {textBounds}=await import('../theme.js');const {planPoint}=await import('../model.js');const p=barco();
 for(const d of p.decks)for(const a of d.labels){const b=textBounds(a,p,planPoint);for(const w of d.walls){const gap=p.theme.lines.wall/2+.5;assert.ok(b.x+b.w<=Math.min(w.x1,w.x2)-gap||b.x>=Math.max(w.x1,w.x2)+gap||b.y+b.h<=Math.min(w.y1,w.y2)-gap||b.y>=Math.max(w.y1,w.y2)+gap,`${d.id} ${a.text} intersects wall`);}}
});

test('far drags and nudges remain reloadable for both boat coordinate systems',async()=>{
 const {moveElement}=await import('../editor-project.js');
 for(const p of [barco(),odyssey()]){const d=p.decks[0];moveWall(d.walls[0],10000,-10000);for(const a of d.labels)moveElement(a,p,10000,-10000);assert.doesNotThrow(()=>validateEditorProject(p));}
});
