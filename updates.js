const equal=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
// Three-way merge: upstream geometry updates arrive, independently edited fields
// remain local, and local edits win when the same field changed on both sides.
export function mergePublishedProject(base,local,remote){
 if(equal(local,base))return structuredClone(remote);
 if(equal(remote,base)||equal(local,remote))return structuredClone(local);
 if(Array.isArray(base)&&Array.isArray(local)&&Array.isArray(remote)){
  if([...base,...local,...remote].every(a=>a&&typeof a==='object'&&typeof a.id==='string')){
   const b=new Map(base.map(a=>[a.id,a])),l=new Map(local.map(a=>[a.id,a])),r=new Map(remote.map(a=>[a.id,a]));
   return [...new Set([...remote.map(a=>a.id),...local.map(a=>a.id)])].flatMap(id=>{
    if(!l.has(id)&&b.has(id))return [];
    if(!r.has(id)&&b.has(id))return equal(l.get(id),b.get(id))?[]:[structuredClone(l.get(id))];
    if(!l.has(id))return [structuredClone(r.get(id))];if(!r.has(id))return [structuredClone(l.get(id))];
    return [mergePublishedProject(b.get(id),l.get(id),r.get(id))];
   });
  }
  return structuredClone(local);
 }
 if(base&&local&&remote&&typeof base==='object'&&typeof local==='object'&&typeof remote==='object'&&!Array.isArray(local)&&!Array.isArray(remote)){
  return Object.fromEntries([...new Set([...Object.keys(remote),...Object.keys(local)])].flatMap(key=>{
   if(!(key in local)&&key in base)return [];
   if(!(key in remote)&&key in base)return equal(local[key],base[key])?[]:[[key,structuredClone(local[key])]];
   return [[key,mergePublishedProject(base[key],local[key],remote[key])]];
  }));
 }
 return structuredClone(local===undefined?remote:local);
}
