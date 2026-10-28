import {fixtureBounds} from './fixtures.js';
import {textBounds} from './theme.js';
import {planPoint} from './model.js';
export function draftHorizontalExtent(d,p){
 const xs=[0,p.bounds.width];
 for(const w of d.walls)xs.push(w.x1,w.x2);
 for(const a of d.doors||[])xs.push(a.x,a.x+a.u[0],a.x+a.v[0]);
 for(const a of d.details||[]){if(a.kind==='symbol'){const b=fixtureBounds(a);xs.push(b.left,b.right);}else if(a.kind==='line')xs.push(a.x1,a.x2);else xs.push(a.x,a.x+a.w);}
 for(const a of [...d.labels,...d.annotations]){const b=textBounds(a,p,planPoint);xs.push(b.x,b.x+b.w);}
 return {left:Math.min(...xs),right:Math.max(...xs)};
}
