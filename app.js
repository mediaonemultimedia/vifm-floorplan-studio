import {BOATS,projectStorageKey,restoreProject,revisionFor} from './projects.js';
import {prepareEditorProject,validateEditorProject,moveElement} from './editor-project.js';
import {revisionControls,showRevisionLog} from './revision-controls.js';
import {themeControls} from './theme-controls.js';
import {showElementInspector,showWallInspector} from './selection-controls.js';
import {moveWall,editWallEndpoint} from './wall-lines.js';
import {dockLayout} from './fixtures.js';
import {createNote,feedbackReport,feedbackPins,validateNotes} from './feedback.js';
import {mergeProjectUpdate} from './project-updates.js';
import {PALETTE,createProject,resizeHull,sourcePoint,planPoint,escapeXML as e} from './model.js';
import {drawing,loadLogo,deckOrigins} from './render.js';
import {exportPDF,exportSVG,download,filename} from './export.js';
const $=s=>document.querySelector(s);
const seeds=new Map();
await Promise.all(BOATS.flatMap(boat=>boat.revisions.map(async revision=>{try{const r=await fetch('./'+revision.asset,{cache:'no-store'});if(!r.ok)throw Error('Source unavailable');seeds.set(boat.id+':'+revision.id,prepareEditorProject(await r.json()));}catch(err){if(boat.id==='barco99'&&revision.id==='v1')seeds.set('barco99:v1',prepareEditorProject(createProject()));console.warn('Could not load '+boat.name+' '+revision.id,err);}})));
function chooseRevision(id,requested){const boat=BOATS.find(b=>b.id===id),available=boat.revisions.filter(r=>seeds.has(id+':'+r.id));return available.find(r=>r.id===requested)?.id||available.find(r=>r.id===boat.defaultRevision)?.id||available[0]?.id;}
let activeId=new URL(location.href).searchParams.get('boat');
try{activeId??=localStorage.getItem('mediaone.floorplans.active');}catch{}
if(!BOATS.some(b=>b.id===activeId))activeId='barco99';
let activeRevision=chooseRevision(activeId,new URL(location.href).searchParams.get('revision'));
const readOnly=()=>!!revisionFor(activeId,activeRevision)?.readOnly;
let KEY=projectStorageKey(activeId,activeRevision),startingProject=seeds.get(activeId+':'+activeRevision);
let releaseVersion='local',pendingRelease=null,checkingUpdate=false;
try{const response=await fetch('./release.json',{cache:'no-store'});if(response.ok)releaseVersion=(await response.json()).version;}catch{}
let notes=[],activeNote=null,feedbackOpen=false;
let project=structuredClone(startingProject),selected=null,tool='select',view='both',zoom=.75,history=[],drag=null,toastTimer;
function restoreBoat(){
 project=structuredClone(startingProject);
 try{const local=restoreProject(localStorage,activeId,startingProject,activeRevision,seeds.get(activeId+':v1')),base=JSON.parse(localStorage.getItem(KEY+'.published-base')||'null');project=base&&!readOnly()?validateEditorProject(mergeProjectUpdate(base,local,startingProject)):local;}
 catch(err){try{localStorage.setItem(KEY+'.unreadable',localStorage.getItem(KEY)||'');}catch{}setTimeout(()=>toast('Saved drawing could not be read. A backup remains in browser storage; opening the supplied layout.'),200);}
 try{const saved=localStorage.getItem(KEY+'.feedback')||(activeRevision!=='v1'?(localStorage.getItem(projectStorageKey(activeId,'v1')+'.feedback')||(activeId==='barco99'?localStorage.getItem('mediaone.floorplans.barco99.v1.feedback'):null)):null)||(activeId==='barco99'&&activeRevision==='v1'?localStorage.getItem('mediaone.floorplans.barco99.v1.feedback'):null);notes=validateNotes(JSON.parse(saved||'[]'));if(!readOnly())localStorage.setItem(KEY+'.published-base',JSON.stringify(startingProject));}catch{notes=[];}
 for(const flag of project.reviewFlags)if(!notes.some(n=>n.seedFlag===flag.id)){
  const index=project.decks.findIndex(d=>d.id===flag.deckId),o=deckOrigins(project)[index],n=createNote(project,flag.deckId,{x:o.x+flag.x,y:o.y+flag.y},releaseVersion);Object.assign(n,{seedFlag:flag.id,text:`Flag ${flag.id} - ${flag.title}\n${flag.text}`});notes.push(n);
 }
}
restoreBoat();
persist();
function toast(message){$('#toast').textContent=message;$('#toast').hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').hidden=true,5500);}
function checkpoint(){history.push(JSON.stringify(project));if(history.length>60)history.shift();$('#undo').disabled=false;}
function persist(){if(readOnly())return;try{localStorage.setItem(KEY,JSON.stringify(project));$('#save-status').textContent='Saved on this device';}catch{$('#save-status').textContent='Save a project file to keep changes';}}
function render(){$('#sheet').innerHTML=drawing(project,{selected:selected?.id,interactive:!readOnly(),visible:view,grid:$('#grid').checked});if(feedbackOpen)$('#drawing').insertAdjacentHTML('beforeend',feedbackPins(notes,project,view));$('#sheet').classList.toggle('placing',tool!=='select');$('#sheet').style.width=792*zoom+'px';$('#sheet').style.height=1224*zoom+'px';$('#zoom-value').textContent=Math.round(zoom*100)+'%';$('#undo').disabled=readOnly()||!history.length;}
function sync(){
 syncPalette();
 for(const [id,key]of [['vessel-name','name'],['length','length'],['width','width'],['page-size','pageSize'],['paper','paper']])$('#'+id).value=project[key];
 $('h1').textContent=project.name;$('.toolbar-note').textContent=project.pageSize+' · portrait';$('#source-summary').textContent=project.sourceSummary;$('#source-status').textContent='Source: '+project.name+' drawings';
 $('#boat-select').innerHTML=BOATS.filter(b=>b.revisions.some(r=>seeds.has(b.id+':'+r.id))).map(b=>`<option value="${b.id}">${e(b.name)}</option>`).join('');$('#boat-select').value=activeId;
 $('#source-list').innerHTML=project.sources.map((s,i)=>`<button class="wide" data-source="${i}">${e(s.title)} ↗</button>`).join('');
 themeControls(project,change,()=>{sync();inspector();},toast);
 revisionControls(project,activeId,activeRevision,id=>seeds.has(activeId+':'+id));
 $('#view-label').textContent=view==='both'?'Complete drawing set':project.decks.find(d=>d.id===view)?.name;
}
function change(fn,{syncControls=true,record=true}={}){if(readOnly()){toast('This revision is archived. Switch to the working revision to make edits.');return;}if(record)checkpoint();fn();persist();if(syncControls)sync();render();}
function element(){if(!selected||selected.wall!==undefined)return null;const d=project.decks.find(d=>d.id===selected.deck);return [...d.labels,...d.annotations,...d.rects].find(a=>a.id===selected.id);}
function inspector(){
 if(feedbackOpen){feedbackInspector();return;}
 if(readOnly()){$('#selection').innerHTML='<h2>Archived revision</h2><p class="muted">This drawing is preserved for comparison and export. Choose the working revision to make changes.</p>';return;}
 const options={project,selected,change,refresh:()=>{sync();render();inspector();},remove:removeSelected,toast};
 if(selected?.wall!==undefined){showWallInspector(options);return;}
 const a=element();if(!a){$('#selection').innerHTML='<div class="empty-icon">↖</div><h2>Make it yours.</h2><p class="muted">Select text or a wall segment to edit it. Shared text and line styles apply across both floors.</p>';return;}
 showElementInspector({...options,element:a});
}
function removeSelected(){if(selected?.wall!==undefined){change(()=>{project.decks.find(d=>d.id===selected.deck).walls.splice(selected.wall,1);selected=null;});inspector();return;}const a=element();if(!a)return;change(()=>{const d=project.decks.find(d=>d.id===selected.deck);for(const key of ['labels','annotations','rects'])d[key]=d[key].filter(x=>x.id!==a.id);selected=null;});inspector();}
for(const [id,key]of [['vessel-name','name'],['page-size','pageSize'],['paper','paper']])$('#'+id).onchange=()=>change(()=>project[key]=key==='wallWidth'?Number($('#'+id).value):$('#'+id).value);
for(const id of ['length','width'])$('#'+id).onchange=()=>{try{const next=resizeHull(project,Number($('#length').value),Number($('#width').value));change(()=>{
 if(project.coordinates!=='drawing'){const width=900*next.width/next.length,factor=width/project.bounds.width;for(const d of next.decks){for(const w of d.walls){w.x1*=factor;w.x2*=factor;}for(const a of [...d.labels,...d.annotations])if(a.centerArea){a.centerArea.x*=factor;a.centerArea.w*=factor;}}next.bounds.width=width;}
 project=next;
 });}catch(err){toast(err.message);sync();}};
function activateBoat(id,revision=null){
 persist();saveNotes();activeId=id;activeRevision=chooseRevision(id,revision);KEY=projectStorageKey(activeId,activeRevision);startingProject=seeds.get(activeId+':'+activeRevision);restoreBoat();selected=null;activeNote=null;history=[];drag=null;persist();saveNotes();sync();setTool(feedbackOpen?'feedback':'select');inspector();
 try{localStorage.setItem('mediaone.floorplans.active',activeId);const url=new URL(location.href);url.searchParams.set('boat',activeId);url.searchParams.set('revision',activeRevision);window.history.replaceState(null,'',url);}catch{}
}
$('#boat-select').onchange=()=>activateBoat($('#boat-select').value);
$('#revision-select').onchange=()=>activateBoat(activeId,$('#revision-select').value);
$('#view-changes').onclick=()=>showRevisionLog(project,readOnly());
$('#close-revisions').onclick=()=>$('#revision-dialog').close();
$('#source-list').onclick=ev=>{const b=ev.target.closest('[data-source]');if(!b)return;const source=project.sources[Number(b.dataset.source)];$('#source-title').textContent=source.title;$('#source-image').src=source.src;$('#source-dialog').showModal();};
$('#deck-tabs').onclick=ev=>{const b=ev.target.closest('[data-view]');if(!b)return;view=b.dataset.view;document.querySelectorAll('[data-view]').forEach(x=>x.classList.toggle('active',x===b));$('#view-label').textContent=view==='both'?'Complete drawing set':project.decks.find(d=>d.id===view).name;selected=null;render();inspector();};
function setTool(next){tool=next;document.querySelectorAll('[data-tool]').forEach(b=>b.classList.toggle('active',b.dataset.tool===tool));$('#tool-status').textContent=tool==='select'?'Select an element to edit':tool==='feedback'?'Click a location on either floorplan to leave a note':'Click a deck to place '+tool;render();}
document.querySelectorAll('[data-tool]').forEach(b=>b.onclick=()=>setTool(b.dataset.tool));
function svgPoint(ev){return new DOMPoint(ev.clientX,ev.clientY).matrixTransform($('#drawing').getScreenCTM().inverse());}
function locate(q){return project.decks.map((d,i)=>({d,o:deckOrigins(project)[i]})).find(({d,o})=>(view==='both'||view===d.id)&&q.x>=o.x-5&&q.x<=o.x+project.bounds.width+5&&q.y>=o.y&&q.y<=o.y+project.bounds.height);}
$('#sheet').addEventListener('pointerdown',ev=>{if(ev.button!==0)return;
 const pin=ev.target.closest('[data-note]');if(pin){ev.preventDefault();openFeedback(pin.dataset.note);return;}
 if(tool==='feedback'){ev.preventDefault();const q=svgPoint(ev),hit=locateFeedback(q);if(!hit){toast('Click on a floorplan or its dock to place a note.');return;}const target=ev.target.closest('[data-element],[data-wall],[data-fixture],[data-stair]'),context=target?Object.fromEntries(Object.entries(target.dataset)):null;const note=createNote(project,hit.d.id,q,releaseVersion,context);notes.push(note);activeNote=note.id;saveNotes();render();feedbackInspector();$('#note-text').focus();return;}
 if(readOnly())return;
 const wall=ev.target.closest('[data-wall]');
 if(tool==='select'&&wall){selected={id:'wall-'+wall.dataset.deckId+'-'+wall.dataset.wall,deck:wall.dataset.deckId,wall:Number(wall.dataset.wall)};const w=project.decks.find(d=>d.id===selected.deck).walls[selected.wall];drag={type:wall.dataset.wallEnd?'endpoint':'wall',endpoint:wall.dataset.wallEnd,start:svgPoint(ev),original:structuredClone(w),wall:w,changed:false};ev.preventDefault();render();inspector();return;}
 const target=ev.target.closest('[data-element]');
 if(tool==='select'&&target){selected={id:target.dataset.element,deck:target.closest('[data-deck]').dataset.deck};const a=element();drag={type:'element',start:svgPoint(ev),original:structuredClone(a),element:a,changed:false};ev.preventDefault();render();inspector();return;}
 const q=svgPoint(ev),hit=locate(q);if(tool==='select'){selected=null;render();inspector();return;}if(!hit){toast('Click inside a floorplan to place an element.');return;}
 const local={x:q.x-hit.o.x,y:q.y-hit.o.y},pos=sourcePoint(local.x,local.y,project);
 change(()=>{
  if(tool==='line'||tool==='rect'){
   const w={id:crypto.randomUUID(),role:'wall',x1:local.x,y1:local.y,x2:local.x+24,y2:local.y};hit.d.walls.push(w);selected={id:`wall-${hit.d.id}-${hit.d.walls.length-1}`,deck:hit.d.id,wall:hit.d.walls.length-1};
   if(tool==='line')drag={type:'endpoint',endpoint:'end',start:q,original:structuredClone(w),wall:w,changed:true,adding:true};
   else {w.x2=w.x1+55;for(const line of [{x1:w.x2,y1:w.y1,x2:w.x2,y2:w.y1+45},{x1:w.x2,y1:w.y1+45,x2:w.x1,y2:w.y1+45},{x1:w.x1,y1:w.y1+45,x2:w.x1,y2:w.y1}])hit.d.walls.push({id:crypto.randomUUID(),role:'wall',...line});}
  }else {const a={id:crypto.randomUUID(),kind:tool,x:pos.x,y:pos.y,text:tool==='text'?'NEW LABEL':tool==='firstaid'?'FIRST AID':tool==='muster'?'MUSTER':'',size:8,textStyle:'annotation'};hit.d.annotations.push(a);selected={id:a.id,deck:hit.d.id};}
 });if(!drag)setTool('select');inspector();
});
document.addEventListener('pointermove',ev=>{
 if(!drag)return;const q=svgPoint(ev),dx=q.x-drag.start.x,dy=q.y-drag.start.y;if(!drag.changed&&Math.hypot(dx,dy)<.5)return;if(!drag.changed){checkpoint();drag.changed=true;}
 if(drag.type==='wall'){Object.assign(drag.wall,drag.original);const ox=Math.max(-300-Math.min(drag.wall.x1,drag.wall.x2),Math.min(1600-Math.max(drag.wall.x1,drag.wall.x2),dx)),oy=Math.max(-300-Math.min(drag.wall.y1,drag.wall.y2),Math.min(1600-Math.max(drag.wall.y1,drag.wall.y2),dy));moveWall(drag.wall,ox,oy);}
 else if(drag.type==='endpoint'){const n=drag.endpoint==='start'?1:2,x=(drag.adding?drag.original.x1:drag.original['x'+n])+dx,y=(drag.adding?drag.original.y1:drag.original['y'+n])+dy;editWallEndpoint(drag.wall,drag.endpoint,Math.max(-300,Math.min(1600,x)),Math.max(-300,Math.min(1600,y)));}
 else {Object.assign(drag.element,structuredClone(drag.original));moveElement(drag.element,project,dx,dy);}
 render();
});
document.addEventListener('pointerup',()=>{if(!drag)return;const changed=drag.changed,adding=drag.adding;drag=null;if(changed)persist();if(adding)setTool('select');inspector();});
$('#undo').onclick=()=>{if(!history.length)return;project=JSON.parse(history.pop());selected=null;persist();sync();render();inspector();};
document.addEventListener('keydown',ev=>{
 if(['INPUT','TEXTAREA','SELECT'].includes(document.activeElement.tagName))return;
 if((ev.metaKey||ev.ctrlKey)&&ev.key.toLowerCase()==='z'){ev.preventDefault();$('#undo').click();return;}
 if(ev.key==='Escape'){selected=null;if(feedbackOpen){feedbackOpen=false;$('#feedback-toggle').setAttribute('aria-pressed','false');$('#inspector-title').textContent='PROPERTIES';}setTool('select');inspector();}
 if(!readOnly()&&(ev.key==='Delete'||ev.key==='Backspace')){ev.preventDefault();removeSelected();return;}
 if(!readOnly()&&selected&&['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(ev.key)){
 ev.preventDefault();const step=ev.shiftKey?10:1,dx=ev.key==='ArrowLeft'?-step:ev.key==='ArrowRight'?step:0,dy=ev.key==='ArrowUp'?-step:ev.key==='ArrowDown'?step:0;
 change(()=>{if(selected.wall!==undefined)moveWall(project.decks.find(d=>d.id===selected.deck).walls[selected.wall],dx,dy);else moveElement(element(),project,dx,dy);});inspector();}
});
$('#grid').onchange=render;$('#zoom-in').onclick=()=>{zoom=Math.min(1.5,zoom+.1);render();};$('#zoom-out').onclick=()=>{zoom=Math.max(.25,zoom-.1);render();};$('#fit').onclick=()=>{zoom=Math.max(.25,Math.min(1,($('#stage').clientWidth-65)/792,($('#stage').clientHeight-65)/1224));render();};
$('#save-project').onclick=()=>download(JSON.stringify(project,null,2),filename(project,'json'),'application/json');$('#load-project').onclick=()=>$('#import-file').click();$('#import-file').onchange=async ev=>{const file=ev.target.files[0];if(!file)return;try{if(file.size>2000000)throw Error('Project file is too large (maximum 2 MB).');const next=prepareEditorProject(JSON.parse(await file.text()));const revision=next.drawingRevision||'v1';next.drawingRevision=revision;if(!seeds.has(next.id+':'+revision))throw Error('This boat or drawing revision is not in the Studio yet.');if(next.id!==activeId||revision!==activeRevision)activateBoat(next.id,revision);if(readOnly()){project=next;sync();render();}else change(()=>{project=next;selected=null;});saveNotes();inspector();toast('Project opened.');}catch(err){toast('Could not open project: '+err.message);}finally{ev.target.value='';}};
$('#reset').onclick=()=>{if(confirm('Reset '+project.name+' to its supplied layout? You can undo this.')){change(()=>{project=prepareEditorProject(startingProject);selected=null;});inspector();}};
$('#close-source').onclick=()=>$('#source-dialog').close();
async function exporting(button,fn){button.disabled=true;const text=button.textContent;button.textContent='Preparing…';try{await document.fonts.ready;await fn(project);toast('Export ready.');}catch(err){console.error(err);toast('Export failed: '+err.message);}finally{button.disabled=false;button.textContent=text;}}
$('#export-pdf').onclick=()=>exporting($('#export-pdf'),exportPDF);$('#export-svg').onclick=()=>exporting($('#export-svg'),exportSVG);
try{await loadLogo();sync();render();$('#fit').click();inspector();}catch(err){toast('Could not start the drawing: '+err.message);}

$('#sheet').addEventListener('keydown',ev=>{const pin=ev.target.closest('[data-note]');if(pin&&(ev.key==='Enter'||ev.key===' ')){ev.preventDefault();openFeedback(pin.dataset.note);return;}const wall=ev.target.closest('[data-wall]');if(wall&&(ev.key==='Enter'||ev.key===' ')){ev.preventDefault();selected={id:'wall-'+wall.dataset.deckId+'-'+wall.dataset.wall,deck:wall.dataset.deckId,wall:Number(wall.dataset.wall)};render();inspector();return;}const target=ev.target.closest('[data-element]');if(target&&(ev.key==='Enter'||ev.key===' ')){ev.preventDefault();selected={id:target.dataset.element,deck:target.closest('[data-deck]').dataset.deck};render();inspector();}});

function syncPalette(){
 $('#palette').innerHTML=PALETTE.map((c,i)=>`<button class="swatch ${project.ink===c.ink?'chosen':''} ${c.original?'original':''}" style="--swatch:${c.ink}" data-colour="${i}" title="${e(c.name)} · ${c.ink}" aria-label="${e(c.name)} ${c.ink}" aria-pressed="${project.ink===c.ink}"></button>`).join('');
 $('#ink').value=project.ink;$('#ink-hex').value=project.ink;$('#colour-name').textContent=PALETTE.find(c=>c.ink===project.ink)?.name||'Custom drawing colour';
}
$('#palette').onclick=ev=>{const b=ev.target.closest('[data-colour]');if(!b)return;const c=PALETTE[Number(b.dataset.colour)];change(()=>{project.ink=c.ink;project.header=c.header||c.ink;});};
function customColour(value){if(!/^#[0-9a-f]{6}$/i.test(value)){toast('Enter a six-digit hex colour, for example #25585b.');syncPalette();return;}change(()=>{project.ink=value.toLowerCase();project.header=project.ink;});}
$('#ink').onchange=()=>customColour($('#ink').value);$('#ink-hex').onchange=()=>customColour($('#ink-hex').value);

// Feedback is editor-only state: never part of drawing(), PDF, or SVG exports.
function saveNotes(){try{localStorage.setItem(KEY+'.feedback',JSON.stringify(notes));}catch{toast('Notes could not be saved on this device. Download feedback to keep a copy.');}$('#feedback-toggle').textContent=notes.filter(n=>!n.resolved).length?`Feedback (${notes.filter(n=>!n.resolved).length})`:'Feedback';}
function locateFeedback(q){return project.decks.map((d,i)=>({d,o:deckOrigins(project)[i]})).find(({d,o})=>(view==='both'||view===d.id)&&q.x>=o.x+(project.coordinates==='drawing'?-30:dockLayout(project).left)-8&&q.x<=o.x+project.bounds.width+25&&q.y>=o.y&&q.y<=o.y+project.bounds.height);}
function openFeedback(id=null){feedbackOpen=true;activeNote=id;selected=null;$('#feedback-toggle').setAttribute('aria-pressed','true');$('#inspector-title').textContent='FEEDBACK';setTool('feedback');feedbackInspector();}
$('#feedback-toggle').onclick=()=>{if(feedbackOpen){feedbackOpen=false;$('#feedback-toggle').setAttribute('aria-pressed','false');$('#inspector-title').textContent='PROPERTIES';setTool('select');inspector();}else openFeedback();};
function feedbackInspector(){
 const current=notes.find(n=>n.id===activeNote),openCount=notes.filter(n=>!n.resolved&&n.text.trim()).length;
 $('#selection').innerHTML=`<h2>Notes for changes</h2><p class="help">Click a location on either floorplan to pin a note. Pins stay out of your PDF.</p><button id="add-feedback-pin" class="wide">+ Pin another location</button>${current?`<div class="note-editor"><strong>Note ${notes.indexOf(current)+1} · ${e(project.decks.find(d=>d.id===current.deckId).name)}</strong><p class="help">${e(current.projectName)} · page ${current.page.x}, ${current.page.y}<br>Near ${e(current.nearby.map(a=>a.text).join(' / '))}</p><label>Requested change<textarea id="note-text" rows="5" maxlength="4000" placeholder="Describe what should change here…">${e(current.text)}</textarea></label><div class="note-actions"><button id="resolve-note">${current.resolved?'Reopen note':'Mark resolved'}</button><button id="delete-note" class="danger">Delete note</button></div></div>`:''}<div id="feedback-note-list">${notes.map((n,i)=>`<button class="wide note-list-item ${n.id===activeNote?'active':''}" data-open-note="${e(n.id)}"><strong>${i+1} · ${e(project.decks.find(d=>d.id===n.deckId).name)}${n.resolved?' · Resolved':''}</strong><span>${e(n.text.trim().slice(0,95)||'Write a change request')}</span></button>`).join('')||'<p class="help">No notes yet.</p>'}</div><button id="copy-feedback" class="wide primary" ${openCount?'':'disabled'}>Copy feedback for chat</button><button id="download-feedback" class="wide" ${notes.length?'':'disabled'}>Download feedback + drawing</button><p class="help">Copy the report and paste it into this Codex chat. For local drawing edits, attach the downloaded feedback file too. Notes save only in this browser until you share them.</p><div class="feedback-release"><strong>Published drawing</strong><p class="help">Revision ${e(String(releaseVersion).slice(0,8))}. Published fixes appear here automatically when you are not typing. Your notes and local edits are kept.</p><button id="check-updates" class="wide">Check for published changes</button></div>`;
 $('#add-feedback-pin').onclick=()=>{activeNote=null;setTool('feedback');feedbackInspector();toast('Click the location you want to comment on.');};
 $('#selection').querySelectorAll('[data-open-note]').forEach(b=>b.onclick=()=>openFeedback(b.dataset.openNote));
 if(current){$('#note-text').oninput=()=>{current.text=$('#note-text').value;saveNotes();$('#copy-feedback').disabled=!notes.some(n=>!n.resolved&&n.text.trim());const row=$('#selection').querySelector(`[data-open-note="${current.id}"] span`);if(row)row.textContent=current.text.trim().slice(0,95)||'Write a change request';};$('#note-text').onchange=()=>render();$('#resolve-note').onclick=()=>{current.resolved=!current.resolved;saveNotes();render();feedbackInspector();};$('#delete-note').onclick=()=>{notes=notes.filter(n=>n.id!==current.id);activeNote=null;saveNotes();render();feedbackInspector();};}
 $('#copy-feedback').onclick=async()=>{const text=feedbackReport(notes);try{await navigator.clipboard.writeText(text);toast('Feedback copied. Paste it into this Codex chat.');}catch{$('#feedback-copy-text').value=text;$('#feedback-copy-dialog').showModal();$('#feedback-copy-text').select();}};
 $('#download-feedback').onclick=()=>download(JSON.stringify({format:'vifm-floorplan-feedback-v1',release:releaseVersion,notes,project},null,2),`${project.name.replace(/[^a-z0-9_-]+/gi,'-')}-feedback.json`,'application/json');
 $('#check-updates').onclick=()=>checkPublishedUpdate(true);
}
$('#close-feedback-copy').onclick=()=>$('#feedback-copy-dialog').close();
function idleForUpdate(){return !drag&&!['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName)&&!document.querySelector('dialog[open]');}
async function checkPublishedUpdate(manual=false){
 if(checkingUpdate)return;checkingUpdate=true;
 try{const response=await fetch('./release.json',{cache:'no-store'});if(!response.ok)throw Error('Could not reach the published version.');const next=await response.json();if(next.version!==releaseVersion){pendingRelease=next;$('#published-update').hidden=false;if(idleForUpdate()&&!document.hidden)await applyPublishedUpdate();}else if(manual)toast('You are viewing the latest published version.');}catch(err){if(manual)toast(err.message);}finally{checkingUpdate=false;}
}
async function applyPublishedUpdate(){
 if(!pendingRelease)return;
 if(readOnly()){saveNotes();const url=new URL(location.href);url.searchParams.set('v',pendingRelease.version);location.replace(url.href);return;}
 try{const response=await fetch('./'+revisionFor(activeId,activeRevision).asset,{cache:'no-store'});if(!response.ok)throw Error('The updated drawing is not ready yet.');const remote=prepareEditorProject(await response.json()),merged=validateEditorProject(mergeProjectUpdate(startingProject,project,remote));localStorage.setItem(KEY+'.before-published-update',JSON.stringify(project));localStorage.setItem(KEY,JSON.stringify(merged));localStorage.setItem(KEY+'.published-base',JSON.stringify(remote));saveNotes();const url=new URL(location.href);url.searchParams.set('v',pendingRelease.version);location.replace(url.href);}catch(err){toast('Update could not be applied: '+err.message);}
}
$('#apply-update').onclick=applyPublishedUpdate;
saveNotes();setInterval(()=>checkPublishedUpdate(),45000);document.addEventListener('visibilitychange',()=>{if(!document.hidden)checkPublishedUpdate();});
