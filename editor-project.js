import {createProject,validateProject,planPoint,sourcePoint,planPath} from './model.js';
import {applyReferenceStyle,deckDoors,builtWallPaths,fitLabel,referenceLabelArea} from './reference-style.js';
import {lineSegments,cutWall} from './wall-lines.js';
import {DEFAULT_THEME,validateTheme} from './theme.js';
import {SYMBOLS} from './symbols.js';
export function prepareEditorProject(input){
 const p=structuredClone(input);
 if(p.editorRevision===1)return validateEditorProject(p);
 if(p.coordinates!=='drawing')applyReferenceStyle(p);
 p.id??='barco99';p.editorRevision=1;p.bounds??={width:900*p.width/p.length,height:900};
 p.theme??=structuredClone(DEFAULT_THEME);p.wallWidth=Math.round(p.wallWidth*100)/100;p.theme.lines.wall=p.wallWidth;
 if(p.coordinates!=='drawing'){
  // Keep all legacy text/feedback coordinates. Convert only built walls to page units.
  const labelSizes=p.decks.flatMap(d=>d.labels.filter(a=>a.kind==='label').map(a=>fitLabel(a,d,p).size));
  p.theme.text.label=Math.max(4,Math.floor(Math.min(...labelSizes)*100)/100);
  for(const d of p.decks){
   const doors=deckDoors(d,p),inside=builtWallPaths(d,p).flatMap(w=>lineSegments(w.path)),edge=lineSegments(planPath('M0 0H704V353H0Z',p)).flatMap(w=>cutWall(w,doors));
   d.walls=[...inside,...edge].map((w,i)=>({id:`${d.id}-wall-${i}`,role:'wall',...w}));
   for(const a of d.labels){const fitted=fitLabel({...a,size:p.theme.text[a.kind==='room'?'room':'label']},d,p);a.x=fitted.x;a.y=fitted.y;a.textStyle=a.kind==='room'?'room':'label';if(a.align==='middle'&&a.kind==='label')a.centerArea=referenceLabelArea(a,d,p);}
  }
 }
 p.reviewFlags??=[];
 p.sources??=[{id:'main',title:'Main deck source',src:'assets/main-source.png'},{id:'upper',title:'Upstairs source',src:'assets/upper-source.png'}];
 p.sourceSummary??='The drawings number spaces 1–24; the written specification lists 23 rooms. The drawing labels take precedence.';
 return validateEditorProject(p);
}
export function validateEditorProject(p){
 if(!p?.editorRevision)return validateProject(p);
 const finite=(n,min=-300,max=1600)=>typeof n==='number'&&Number.isFinite(n)&&n>=min&&n<=max;
 if(p.editorRevision!==1||p.version!==1||!/^[-a-z0-9]+$/.test(p.id)||p.id.length>80||typeof p.name!=='string'||p.name.length>100||!Array.isArray(p.decks)||p.decks.length!==2)throw Error('Unsupported drawing project.');
 if(!['main','upper'].every((id,i)=>p.decks[i].id===id)||!finite(p.length,50,300)||!finite(p.width,15,70))throw Error('Invalid vessel or floor dimensions.');
 for(const color of [p.ink,p.header,p.paper])if(!/^#[0-9a-f]{6}$/i.test(color))throw Error('Invalid drawing colour.');
 if(!['Original 11 × 17','A3','Letter'].includes(p.pageSize)||!finite(p.bounds?.width,50,600)||!finite(p.bounds?.height,100,1000))throw Error('Invalid drawing bounds.');
 validateTheme(p.theme);if(!finite(p.wallWidth,.2,12))throw Error('Invalid wall weight.');if(p.sourceSummary!==undefined&&(typeof p.sourceSummary!=='string'||p.sourceSummary.length>2000))throw Error('Invalid source summary.');const ids=new Set();
 const identify=a=>{if(typeof a.id!=='string'||a.id.length>120||ids.has(a.id))throw Error('Invalid or duplicate element identity.');ids.add(a.id);};
 for(const d of p.decks){
  if(typeof d.name!=='string'||d.name.length>100||!Array.isArray(d.walls)||d.walls.length>1500)throw Error('Invalid wall collection.');
  for(const w of d.walls){identify(w);if(!['wall','secondary','detail'].includes(w.role)||![w.x1,w.y1,w.x2,w.y2].every(n=>finite(n)))throw Error('Invalid wall line.');}
  for(const key of ['labels','annotations','rects']){
   if(!Array.isArray(d[key])||d[key].length>1000)throw Error('Invalid drawing element collection.');
   for(const a of d[key]){identify(a);if(!finite(a.x)||!finite(a.y)||typeof a.text!=='string'||a.text.length>200||!['room','label','text','arrow','rect','firstaid','muster'].includes(a.kind)||!finite(a.size,4,120))throw Error('Invalid drawing element.');
    if(a.align&&!['start','middle','end'].includes(a.align))throw Error('Invalid text alignment.');
    if(a.rotation!==undefined&&!finite(a.rotation,-360,360))throw Error('Invalid text rotation.');
    if(a.textStyle&&!Object.hasOwn(DEFAULT_THEME.text,a.textStyle))throw Error('Invalid text style.');
    if(a.centerArea&&(![a.centerArea.x,a.centerArea.y].every(n=>finite(n))||![a.centerArea.w,a.centerArea.h].every(n=>finite(n,1,1200))))throw Error('Invalid centred label area.');
    if(a.kind==='rect'&&![a.w,a.h].every(n=>finite(n,1,1200)))throw Error('Invalid rectangle.');
   }
  }
  if((d.details?.length||0)>2500||(d.doors?.length||0)>200)throw Error('Too many details.');
  for(const a of d.details||[]){identify(a);if(!['line','rect','ellipse','symbol'].includes(a.kind)||!['secondary','detail'].includes(a.role)||!finite(a.width,.1,8))throw Error('Unsupported drawing detail.');
   const nums=a.kind==='line'?[a.x1,a.y1,a.x2,a.y2]:a.kind==='symbol'?[a.x,a.y,a.scale,a.rotation]:[a.x,a.y,a.w,a.h];if(!nums.every(n=>finite(n,-360,1600)))throw Error('Invalid detail coordinates.');
   if(['rect','ellipse'].includes(a.kind)&&(!finite(a.w,.01,1200)||!finite(a.h,.01,1200)))throw Error('Invalid detail size.');
   if(a.kind==='symbol'&&(!Object.hasOwn(SYMBOLS,a.type)||!finite(a.scale,.01,5)))throw Error('Invalid fixture symbol.');
  }
  for(const a of d.doors||[]){identify(a);if(![a.x,a.y,...a.u,...a.v].every(n=>finite(n))||Math.abs(Math.hypot(...a.u)-Math.hypot(...a.v))>.001||Math.abs(a.u[0]*a.v[0]+a.u[1]*a.v[1])>.001)throw Error('Invalid circular door.');}
 }
 if(!Array.isArray(p.reviewFlags)||p.reviewFlags.length>100||p.reviewFlags.some(f=>typeof f.id!=='string'||typeof f.title!=='string'||typeof f.text!=='string'||f.text.length>4000||!['main','upper'].includes(f.deckId)||!finite(f.x)||!finite(f.y)))throw Error('Invalid layout review notes.');
 if(!Array.isArray(p.sources)||p.sources.length>20||p.sources.some(s=>typeof s.title!=='string'||!/^assets\/[a-z0-9_./-]+\.(png|jpg|jpeg)$/i.test(s.src)||s.src.includes('..')))throw Error('Invalid source reference.');
 return p;
}
export const fallbackProject=()=>prepareEditorProject(createProject());
export function labelArea(a,d,p){
 if(a.centerArea)return {...a.centerArea};
 const q=planPoint(a.x,a.y,p);let left=0,right=p.bounds.width,top=0,bottom=p.bounds.height;
 for(const w of d.walls){if(Math.abs(w.x1-w.x2)<.01&&q.y>=Math.min(w.y1,w.y2)&&q.y<=Math.max(w.y1,w.y2)){if(w.x1<q.x)left=Math.max(left,w.x1);else right=Math.min(right,w.x1);}
  if(Math.abs(w.y1-w.y2)<.01&&q.x>=Math.min(w.x1,w.x2)&&q.x<=Math.max(w.x1,w.x2)){if(w.y1<q.y)top=Math.max(top,w.y1);else bottom=Math.min(bottom,w.y1);}}
 return {x:left,y:top,w:right-left,h:bottom-top};
}

// Keep drag/nudge/duplicate edits inside the same range accepted by project import.
export function moveElement(a,p,dx,dy){
 const limit=n=>Math.max(-300,Math.min(1600,n));
 if(a.centerArea){a.centerArea.x=limit(a.centerArea.x+dx);a.centerArea.y=limit(a.centerArea.y+dy);}
 else {const q=planPoint(a.x,a.y,p),next=sourcePoint(q.x+dx,q.y+dy,p);a.x=limit(next.x);a.y=limit(next.y);}
 return a;
}
