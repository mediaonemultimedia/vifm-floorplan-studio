import {chatBrief,validateIntake} from './intake.js';
import {DRAWING_RULES} from './drawing-instructions.js';
import {DRAFT_SCHEMA} from './generation-schema.js';
import {zipFiles} from './handoff-zip.js';

export const HANDOFF_CONTEXT_FILES=['DESIGN.md','PRODUCT.md','docs/reviews/2026-10-27-barco-manual-v2.md'];
const safeName=name=>name.replace(/[^a-z0-9._-]+/gi,'-').replace(/^\.+/,'').slice(0,160)||'reference';
const text=(name,value)=>({name,blob:new Blob([value],{type:'text/plain;charset=utf-8'})});
export async function loadHandoffContext(signal){
 const entries=await Promise.all(HANDOFF_CONTEXT_FILES.map(async name=>{const response=await fetch('./'+name,{signal});if(!response.ok)throw Error('Could not load current design context. Reload the Studio before downloading the handoff.');return [name,await response.text()];}));
 return Object.fromEntries(entries);
}
export async function handoffPackage(brief,refs,context,{signal,onProgress}={}){
 validateIntake(brief);
 if(refs.length!==brief.references.length||brief.references.some(meta=>!refs.some(r=>r.meta.id===meta.id&&r.file instanceof Blob&&r.file.size===meta.size)))throw Error('A source reference is missing or changed. Add the original file again.');
 for(const name of HANDOFF_CONTEXT_FILES)if(typeof context[name]!=='string'||!context[name].trim())throw Error('The handoff is missing current design context.');
 const data=Object.fromEntries(['name','length','beam','rooms','floors','details'].map(key=>[key,brief[key]]));
 data.references=brief.references.map(r=>Object.fromEntries(['id','name','type','kind','floor','note','size'].map(key=>[key,r[key]])));
 const files=[],manifest=[];
 for(const [i,meta]of brief.references.entries()){
  const source=refs.find(r=>r.meta.id===meta.id),path=`references/${String(i+1).padStart(2,'0')}-${safeName(meta.name)}`;
  files.push({name:path,blob:source.file});const item={id:meta.id,originalName:meta.name,path,kind:meta.kind,floor:meta.floor,note:meta.note,stills:[]};
  for(const [j,frame]of (source.frames||[]).entries()){
   if(!Number.isFinite(frame.seconds)||frame.seconds<0||!/^data:image\/jpeg;base64,[a-z0-9+/=]+$/i.test(frame.data))throw Error('A selected video still is invalid. Extract the stills again.');
   const bytes=Uint8Array.from(atob(frame.data.split(',')[1]),char=>char.charCodeAt(0));const stillPath=`video-stills/${String(i+1).padStart(2,'0')}-${String(j+1).padStart(2,'0')}-${frame.seconds}s.jpg`;
   files.push({name:stillPath,blob:new Blob([bytes],{type:'image/jpeg'})});item.stills.push({path:stillPath,seconds:frame.seconds});
  }
  manifest.push(item);
 }
 const readme=`VIFM Floorplan Studio — Codex handoff\n\n1. Unzip this folder on the computer running Codex.\n2. Open the shared floorplan-studio repository in Codex, or ask Codex to clone it.\n3. Paste CODEX-PROMPT.txt into the chat and attach this extracted folder, or give Codex access to its local path. A ZIP attachment alone may not expose image contents; unpack it first.\n4. Codex studies the references and uses the shared editor and drawing rules. It should ask about unresolved connectivity and review the actual PDF before release.\n5. Codex commits and pushes the new boat and reusable improvements to the shared MediaOne repository, verifies Pages deployment, and gives you a Studio link. A local project file alone is not a shared publication.\n\nFiles: intake.json (facts), reference-manifest.json (IDs, paths and timestamps), references/ (unchanged original uploads), video-stills/ (any selected stills), studio-context/ (current design/product learning), draft-schema.json (geometry contract). No Studio access code or API key is needed for this handoff. Private original references must not be published without the owner's approval.\n`;
 files.unshift(text('START-HERE.txt',readme),text('CODEX-PROMPT.txt',chatBrief(data)),text('intake.json',JSON.stringify(data,null,2)),text('reference-manifest.json',JSON.stringify(manifest,null,2)),text('draft-schema.json',JSON.stringify(DRAFT_SCHEMA,null,2)),text('studio-context/drawing-instructions.txt',DRAWING_RULES),...HANDOFF_CONTEXT_FILES.map(name=>text('studio-context/'+name,context[name])));
 return zipFiles(files,{signal,onProgress});
}
