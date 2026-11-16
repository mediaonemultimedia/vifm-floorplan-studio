// A reviewed revision replaces a connected layout as a whole. Keep unrelated
// per-boat presentation and deliberate text/annotation edits from the prior save.
export function applyOdysseyReviewedRevision(previous,seed,oldSeed){
 const next=structuredClone(seed);
 for(const key of ['name','length','width','ink','header','paper','pageSize','wallWidth','theme','notes'])if(previous[key]!==undefined)next[key]=structuredClone(previous[key]);
 for(const d of next.decks){
  const saved=previous.decks.find(a=>a.id===d.id),baseline=oldSeed?.decks.find(a=>a.id===d.id);
  for(const label of d.labels){const old=saved?.labels.find(a=>a.id===label.id),base=baseline?.labels.find(a=>a.id===label.id);if(old&&base&&old.text!==base.text)label.text=old.text;}
  d.annotations=structuredClone(saved?.annotations||[]);
 }
 return next;
}
