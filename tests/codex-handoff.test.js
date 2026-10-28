import {test} from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {chatBrief} from '../intake.js';
import {handoffPackage,HANDOFF_CONTEXT_FILES} from '../handoff-package.js';
import {zipFiles} from '../handoff-zip.js';

const brief=()=>({name:'NEW BOAT',length:null,beam:46,rooms:10,floors:null,details:'Use the sketch; stairs may join the two areas.',references:[{id:'ref-a',name:'../sketch.JPG',kind:'plan',floor:'unknown',note:'Rough sketch only',type:'image/jpeg',size:6}]});
const contents=async zip=>JSON.parse(execFileSync('python3',['-c','import io,zipfile,json,sys,base64; z=zipfile.ZipFile(io.BytesIO(sys.stdin.buffer.read())); assert z.testzip() is None; print(json.dumps({n:base64.b64encode(z.read(n)).decode() for n in z.namelist()}))'],{input:Buffer.from(await zip.arrayBuffer()),encoding:'utf8'}));
const decoded=(files,name)=>Buffer.from(files[name],'base64').toString();

test('Codex prompt carries design thinking, shared-repo integration, revision preservation and release checks',()=>{
 const prompt=chatBrief(brief());
 for(const text of ['mediaonemultimedia/vifm-floorplan-studio','DESIGN.md','drawing-instructions.js','compileDraft','projects.js','npm test','scripts/build-site.py','commit','push','PDF','reference IDs','independent','landing','baseline'])assert.ok(prompt.includes(text),text);
 assert.match(prompt,/existing boats and revisions/i);
 assert.match(prompt,/shared.*editor/i);
 assert.match(prompt,/attach.*files/i);
 assert.match(prompt,/Unknown/);
});

test('ZIP preserves bytes and Unicode names and refuses duplicate or escaping paths',async()=>{
 const zip=await zipFiles([{name:'references/café.txt',blob:new Blob(['some evidence\n'])},{name:'intake.json',blob:new Blob(['{}'])}]);
 const files=await contents(zip);
 assert.equal(decoded(files,'references/café.txt'),'some evidence\n');
 await assert.rejects(zipFiles([{name:'../escape',blob:new Blob()}]),/path/);
 await assert.rejects(zipFiles([{name:'same',blob:new Blob()},{name:'same',blob:new Blob()}]),/duplicate/i);
});

test('handoff contains originals, selected stills, current rules and schema, with safe mapped filenames',async()=>{
 const b=brief(),file=new File(['ABCDEF'],'../sketch.JPG',{type:'image/jpeg'});
 const refs=[{meta:b.references[0],file,frames:[{seconds:1.5,data:'data:image/jpeg;base64,YWJj'}]}];
 const context=Object.fromEntries(HANDOFF_CONTEXT_FILES.map(name=>[name,'Current context '+name]));
 const files=await contents(await handoffPackage(b,refs,context));
 assert.ok(files['START-HERE.txt']);assert.ok(files['CODEX-PROMPT.txt']);assert.ok(files['draft-schema.json']);
 const manifest=JSON.parse(decoded(files,'reference-manifest.json'));
 assert.equal(manifest[0].id,'ref-a');assert.equal(manifest[0].originalName,'../sketch.JPG');
 assert.equal(decoded(files,manifest[0].path),'ABCDEF');
 assert.equal(decoded(files,manifest[0].stills[0].path),'abc');
 assert.equal(manifest[0].stills[0].seconds,1.5);
 assert.ok(Object.keys(files).every(name=>!name.split('/').includes('..')));
 for(const name of HANDOFF_CONTEXT_FILES)assert.equal(decoded(files,'studio-context/'+name),context[name]);
 assert.match(decoded(files,'CODEX-PROMPT.txt'),/reference-manifest.json/);
 assert.equal(JSON.parse(decoded(files,'intake.json')).length,null);
});

test('handoff fails before download if source files or current context are missing and supports cancellation',async()=>{
 const b=brief();
 await assert.rejects(handoffPackage(b,[],{}),/reference/i);
 const refs=[{meta:b.references[0],file:new File(['ABCDEF'],'sketch.JPG')}];
 await assert.rejects(handoffPackage(b,refs,{}),/context/i);
 const controller=new AbortController();controller.abort();
 await assert.rejects(zipFiles([{name:'file',blob:new Blob(['data'])}],{signal:controller.signal}),err=>err.name==='AbortError');
});

test('large handoff preparation yields so Stop preparing can interrupt it',async()=>{
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),0);
 try{await assert.rejects(zipFiles([{name:'walkthrough.bin',blob:new Blob([new Uint8Array(10*1024*1024)])}],{signal:controller.signal}),err=>err.name==='AbortError');}finally{clearTimeout(timer);}
});
