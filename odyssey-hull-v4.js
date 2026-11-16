// Include the 36-unit rear platform in the full lower-level length. Widen the
// outline around the unchanged room modules instead of stretching door arcs,
// fixtures or the measured helipad. All dimensions below are drawing units.
export const ODYSSEY_V4_HULL={height:36+578+5*(829.6-578)/4,width:(36+578+5*(829.6-578)/4)*46/130};
export const ODYSSEY_TEN_BEDROOM_BLOCK={top:614,bottom:ODYSSEY_V4_HULL.height,leftHall:119+(ODYSSEY_V4_HULL.width-306)/2,rightHall:187+(ODYSSEY_V4_HULL.width-306)/2,width:ODYSSEY_V4_HULL.width,rows:5};
export function prepareOdysseyV4Hull(input){
 const p=structuredClone(input),extra=ODYSSEY_V4_HULL.width-306,dx=extra/2;
 const edgeX=x=>x===0?0:x===306?ODYSSEY_V4_HULL.width:x+dx;
 for(const d of p.decks){
  const main=d.id==='main',shiftX=x=>main?edgeX(x):x+dx;
  for(const w of d.walls){w.x1=shiftX(w.x1);w.x2=shiftX(w.x2);w.y1+=36;w.y2+=36;}
  for(const a of d.doors){a.x=shiftX(a.x);a.y+=36;}
  for(const a of d.details){
   if(a.points)a.points=a.points.map(([x,y])=>[shiftX(x),y+36]);
   else if(a.x1!==undefined){a.x1=shiftX(a.x1);a.x2=shiftX(a.x2);a.y1+=36;a.y2+=36;}
   else {a.x+=dx;a.y+=36;}
  }
  for(const a of [...d.labels,...d.annotations,...d.rects]){
   a.x+=dx;a.y+=36;if(a.centerArea){a.centerArea.x+=dx;a.centerArea.y+=36;}
  }
 }
 for(const f of p.reviewFlags){f.x=f.deckId==='main'?edgeX(f.x):f.x+dx;f.y+=36;}
 p.bounds.width=ODYSSEY_V4_HULL.width;p.bounds.height+=36;
 return p;
}
