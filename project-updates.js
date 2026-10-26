import {applyReferenceStyle} from './reference-style.js';
import {mergePublishedProject} from './updates.js';

// Upgrade each complete snapshot before comparing it. Merging the revision field
// first could mark old local walls as current while new fixtures use new geometry.
export function mergeProjectUpdate(base,local,remote){
 const upgrade=p=>applyReferenceStyle(structuredClone(p));
 const next=upgrade(remote);
 return mergePublishedProject(base?upgrade(base):next,upgrade(local),next);
}
