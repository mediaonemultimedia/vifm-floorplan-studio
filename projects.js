import {prepareEditorProject,validateEditorProject} from './editor-project.js';
import {applyBarcoReviewV2} from './barco-review-v2.js';
import {applyOdysseyReviewV2} from './odyssey-review-v2.js';
export const BOATS=[
 {id:'barco99',name:'BARCO 99',asset:'assets/revisions/barco99-v2.json',defaultRevision:'v2',revisions:[{id:'v2',label:'V2 · PDF review',asset:'assets/revisions/barco99-v2.json',readOnly:false},{id:'v1',label:'V1 · Before PDF review',asset:'assets/revisions/barco99-v1.json',readOnly:true}]},
 {id:'odyssey102',name:'ODYSSEY 102',asset:'assets/revisions/odyssey102-v2.json',defaultRevision:'v2',revisions:[{id:'v2',label:'V2 · PDF corrections',asset:'assets/revisions/odyssey102-v2.json',readOnly:false},{id:'v1',label:'V1 · Before PDF review',asset:'assets/revisions/odyssey102-v1.json',readOnly:true}]}
];
export const revisionFor=(id,revision)=>{const boat=BOATS.find(b=>b.id===id);return boat?.revisions.find(r=>r.id===revision)||boat?.revisions.find(r=>r.id===boat.defaultRevision);};
export const projectStorageKey=(id,revision='v1')=>`mediaone.floorplans.${id}.v2`+(revision==='v1'?'':`.revisions.${revision}`);
export function restoreProject(storage,id,seed,revision='v1',previousSeed=null){
 const key=projectStorageKey(id,revision),entry=revisionFor(id,revision),archive=key+'.archive';
 const saved=(entry?.readOnly?storage.getItem(archive):null)||storage.getItem(key)||(id==='barco99'&&revision==='v1'?storage.getItem('mediaone.floorplans.barco99.v1'):null);
 let p;
 if(saved)p=prepareEditorProject(JSON.parse(saved));
 else if(id==='barco99'&&revision==='v2'&&previousSeed)p=applyBarcoReviewV2(restoreProject(storage,id,previousSeed,'v1'));
 else if(id==='odyssey102'&&revision==='v2'&&previousSeed)p=applyOdysseyReviewV2(restoreProject(storage,id,previousSeed,'v1'),seed,previousSeed);
 else p=prepareEditorProject(seed);
 if(p.id!==id)throw Error('Saved boat identity does not match.');
 if(p.drawingRevision&&p.drawingRevision!==revision)throw Error('Saved drawing revision does not match.');
 p.drawingRevision=revision;p.revisionMeta??=structuredClone(seed.revisionMeta);
 if(entry?.readOnly&&!storage.getItem(archive))storage.setItem(archive,JSON.stringify(p));
 return validateEditorProject(p);
}
