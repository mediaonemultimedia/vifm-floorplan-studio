import {prepareEditorProject} from './editor-project.js';
import {mergePublishedProject} from './updates.js';

// Upgrade each complete snapshot before comparing it. Merging the revision field
// first could mark old local walls as current while new fixtures use new geometry.
export function mergeProjectUpdate(base,local,remote){
 const upgrade=p=>prepareEditorProject(p);
 const next=upgrade(remote);
 return mergePublishedProject(base?upgrade(base):next,upgrade(local),next);
}
