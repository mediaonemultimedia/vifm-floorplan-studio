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
];return specs.map(s=>{const a=planPoint(s.x+s.w,s.y,p),b=planPoint(s.x,s.y+s.h,p);return {id:s.id,left:a.x,top:a.y,width:b.x-a.x,height:b.y-a.y,vertical:s.axis==='x'};});}
export function stairMarkup(d,p){return `<g fill="none" stroke="${p.ink}" stroke-width="${p.wallWidth*2/3}" stroke-linejoin="round">${stairLayout(d,p).map(s=>{const length=s.vertical?s.height:s.width,count=Math.max(3,Math.min(30,Math.round(length/5)));let path='';for(let i=1;i<count;i++){const t=length*i/count;path+=s.vertical?`M${s.left} ${s.top+t}h${s.width}`:`M${s.left+t} ${s.top}v${s.height}`;}return `<g data-stair="${s.id}"><rect x="${s.left}" y="${s.top}" width="${s.width}" height="${s.height}"/><path d="${path}"/></g>`;}).join('')}</g>`;}
