import {planPoint} from './model.js';
export function stairLayout(d,p){const specs=d.id==='main'?[
 {id:'sleeping-forward',x:242,y:0,w:14,h:37,axis:'x'},
 {id:'sleeping-aft',x:96,y:312,w:12,h:41,axis:'x'},
 {id:'connecting-flight',x:520,y:248,w:12,h:30,axis:'x'},
 {id:'dry-room-flight',x:584,y:259,w:56,h:19,axis:'x'}
]:[
 {id:'sleeping-forward',x:135,y:24,w:95,h:13,axis:'x'},
 {id:'sleeping-aft',x:61,y:312,w:95,h:17,axis:'x'},
 {id:'connecting-flight',x:484,y:205,w:18,h:51,axis:'y'},
 {id:'short-connector',x:520,y:248,w:12,h:30,axis:'x'},
 {id:'dry-room-flight',x:584,y:259,w:56,h:19,axis:'x'}
];return specs.map(s=>{const a=planPoint(s.x+s.w,s.y,p),b=planPoint(s.x,s.y+s.h,p);const run={id:s.id,left:a.x,top:a.y,width:b.x-a.x,height:b.y-a.y,vertical:s.axis==='x'};
 if(d.id==='upper'&&['sleeping-forward','sleeping-aft'].includes(s.id)){
  const forward=s.id==='sleeping-forward',doorY=planPoint(forward?210:67,0,p).y;
  run.width=24;run.left=forward?planPoint(0,37,p).x-run.width:planPoint(0,312,p).x;
  const bottom=forward?run.top+run.height:doorY+6;run.top=forward?doorY-30:run.top;run.height=bottom-run.top;
  run.landing={left:run.left,top:forward?run.top:bottom-36,width:run.width,height:36};
 }
 if(s.id==='dry-room-flight'){
  const doorY=planPoint(638,278,p).y,bottom=run.top+run.height;
  run.width=24;run.left=planPoint(0,278,p).x-run.width;run.top=doorY-30;run.height=bottom-run.top;
  run.landing={left:run.left,top:run.top,width:run.width,height:36};
 }
 return run;});}
export function stairTreads(s){
 const length=s.vertical?s.height:s.width,start=s.landing&&s.landing.top===s.top?s.landing.height:0,end=s.landing&&s.landing.top!==s.top?length-s.landing.height:length;
 const count=Math.max(3,Math.min(30,Math.round((end-start)/5)));
 return Array.from({length:count-1},(_,i)=>{const t=start+(end-start)*(i+1)/count;return s.vertical?{x:s.left,y:s.top+t,dx:s.width,dy:0}:{x:s.left+t,y:s.top,dx:0,dy:s.height};});
}
export function stairMarkup(d,p){return `<g fill="none" stroke="${p.ink}" stroke-width="${p.wallWidth*2/3}" stroke-linejoin="round">${stairLayout(d,p).map(s=>{
 const path=stairTreads(s).map(t=>`M${t.x} ${t.y}l${t.dx} ${t.dy}`).join('');
 const landing=s.landing?`<rect data-stair-landing="${s.id}" x="${s.landing.left}" y="${s.landing.top}" width="${s.landing.width}" height="${s.landing.height}"/>`:'';
 return `<g data-stair="${s.id}"><rect x="${s.left}" y="${s.top}" width="${s.width}" height="${s.height}"/>${landing}<path d="${path}"/></g>`;
 }).join('')}</g>`;}
