import {prepareEditorProject,validateEditorProject} from './editor-project.js';
export const BOATS=[{id:'barco99',name:'BARCO 99',asset:'assets/barco99.json'},{id:'odyssey102',name:'ODYSSEY 102',asset:'assets/odyssey102.json'}];
export const projectStorageKey=id=>`mediaone.floorplans.${id}.v2`;
export function restoreProject(storage,id,seed){
 const saved=storage.getItem(projectStorageKey(id))||(id==='barco99'?storage.getItem('mediaone.floorplans.barco99.v1'):null);
 if(!saved)return prepareEditorProject(seed);
 const p=prepareEditorProject(JSON.parse(saved));if(p.id!==id)throw Error('Saved boat identity does not match.');return validateEditorProject(p);
}
