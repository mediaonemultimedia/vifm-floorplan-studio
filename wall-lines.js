// Walls are independent SVG line segments. Endpoint edits never move a neighbour.
export function lineSegments(path){
 let x=0,y=0,start=null,out=[];
 for(const match of path.matchAll(/([MLHVZ])([^MLHVZ]*)/gi)){
  const op=match[1].toUpperCase(),v=match[2].trim().split(/[\s,]+/).filter(Boolean).map(Number);
  if(v.some(n=>!Number.isFinite(n)))throw Error('Invalid wall coordinates.');
  const push=(nx,ny)=>{if(nx!==x||ny!==y)out.push({x1:x,y1:y,x2:nx,y2:ny});x=nx;y=ny;};
  if(op==='M'){x=v[0];y=v[1];start={x,y};for(let i=2;i<v.length;i+=2)push(v[i],v[i+1]);}
  if(op==='L')for(let i=0;i<v.length;i+=2)push(v[i],v[i+1]);
  if(op==='H')for(const n of v)push(n,y);
  if(op==='V')for(const n of v)push(x,n);
  if(op==='Z'&&start)push(start.x,start.y);
 }
 return out;
}
export function cutWall(w,doors){
 let parts=[w];
 for(const d of doors){const a=d.start,b=d.end,vertical=Math.abs(a.x-b.x)<.001,axis=vertical?'y':'x',fixed=vertical?'x':'y',lo=Math.min(a[axis],b[axis]),hi=Math.max(a[axis],b[axis]);
  parts=parts.flatMap(v=>{const p={x:v.x1,y:v.y1},q={x:v.x2,y:v.y2};if(Math.abs(p[fixed]-q[fixed])>.001||Math.abs(p[fixed]-a[fixed])>.001)return [v];const min=Math.min(p[axis],q[axis]),max=Math.max(p[axis],q[axis]);if(hi<=min||lo>=max)return [v];return [[min,Math.min(lo,max)],[Math.max(hi,min),max]].filter(([s,e])=>e>s).map(([s,e])=>vertical?{...v,x1:p.x,y1:s,x2:p.x,y2:e}:{...v,x1:s,y1:p.y,x2:e,y2:p.y});});
 }
 return parts;
}
export function moveWall(w,dx,dy){if(![dx,dy].every(Number.isFinite))throw Error('Enter finite offsets.');dx=Math.max(-300-Math.min(w.x1,w.x2),Math.min(1600-Math.max(w.x1,w.x2),dx));dy=Math.max(-300-Math.min(w.y1,w.y2),Math.min(1600-Math.max(w.y1,w.y2),dy));w.x1+=dx;w.x2+=dx;w.y1+=dy;w.y2+=dy;return w;}
export function editWallEndpoint(w,endpoint,x,y){if(!['start','end'].includes(endpoint)||![x,y].every(Number.isFinite))throw Error('Invalid wall endpoint.');const n=endpoint==='start'?1:2;w['x'+n]=x;w['y'+n]=y;return w;}
export function wallPath(w){return `M${w.x1} ${w.y1}L${w.x2} ${w.y2}`;}
