import {textWidth} from './font-metrics.js';
export const TEXT_STYLES={room:'Room numbers',label:'Room / area labels',detail:'Equipment / small labels',caption:'Floor captions',title:'Boat title',subtitle:'Header subtitle',annotation:'Added text',marker:'Helipad marker'};
export const LINE_STYLES={wall:'Main walls',secondary:'Secondary lines',detail:'Fixtures / stairs / door arcs',threshold:'Dotted thresholds',dash:'Dot / gap length'};
export const DEFAULT_THEME={text:{room:24.22,label:8.88,detail:6,caption:12.92,title:30.91,subtitle:24,annotation:8.88,marker:70},lines:{wall:2.42,secondary:1.6,detail:1.6,threshold:2.42,dash:3.23}};
// Metrics from the supplied Libre Franklin Bold/Medium fonts (units per em: 1000).
export const FONT_CAP_HEIGHT=.742,FONT_DESCENDER=.246;
export const styleRole=a=>a.textStyle||(a.kind==='room'?'room':a.kind==='text'?'annotation':'label');
export function textPresentation(a,p){
 const size=p.theme?.text[styleRole(a)]??a.size,lines=a.text.split('\n');
 if(a.centerArea){const b=a.centerArea,delta=size*(FONT_CAP_HEIGHT-(/[gjpqy]/.test(a.text)?FONT_DESCENDER:0))/2-size*(lines.length-1)/2,angle=(a.rotation||0)*Math.PI/180;return {...a,x:b.x+b.w/2-Math.sin(angle)*delta,y:b.y+b.h/2+Math.cos(angle)*delta,size,align:'middle',drawingPosition:true};}
 return {...a,size};
}
export function setTextSize(p,role,size){if(!Object.hasOwn(TEXT_STYLES,role)||!Number.isFinite(size)||size<4||size>(role==='marker'?120:60))throw Error('Use a text size between 4 and 60.');p.theme.text[role]=size;}
export function setLineStyle(p,role,size){if(!Object.hasOwn(LINE_STYLES,role)||!Number.isFinite(size)||size<.2||size>12)throw Error('Use a line setting between 0.2 and 12.');p.theme.lines[role]=size;if(role==='wall')p.wallWidth=size;}
export function validateTheme(t){for(const [group,roles,min,max]of [['text',TEXT_STYLES,4,120],['lines',LINE_STYLES,.2,12]])for(const role of Object.keys(roles))if(!Number.isFinite(t?.[group]?.[role])||t[group][role]<min||t[group][role]>max)throw Error('Invalid shared drawing style.');}
export function textBounds(a,p,point){const t=textPresentation(a,p),q=t.drawingPosition?{x:t.x,y:t.y}:point(t.x,t.y,p),width=Math.max(...t.text.split('\n').map(s=>textWidth(s,t.size)));return {x:q.x-(t.align==='end'?width:t.align==='start'?0:width/2),y:q.y-t.size*.8,w:width,h:t.size*t.text.split('\n').length};}
