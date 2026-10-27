import {SYMBOLS} from './symbols.js';
import {ACCOMMODATION} from './accommodation.js';
import {planPoint} from './model.js';
export const FIXTURE_SCALE=.6;
export const SHOWER_SCALE=FIXTURE_SCALE;
const SHOWER_SIZE=41.77*SHOWER_SCALE;
const BASIN_PITCH=33.55;
export const MAIN_STALLS=[[88,116.5],[116.5,151],[151,167.5],[167.5,202]];
const item=(type,x,y,rotation=0)=>({type,x,y,rotation,scale:type==='shower'?SHOWER_SCALE:FIXTURE_SCALE});
export function sinkBankMarkup(count,ink){
 const height=count*BASIN_PITCH+2;
 let body=`<rect x="1" y="1" width="22.24" height="${height-2}"/>`;
 for(let i=0;i<count;i++){const y=1+BASIN_PITCH*(i+.5);body+=`<ellipse cx="12.12" cy="${y}" rx="5.84" ry="8.78"/><line x1="12.81" y1="${y}" x2="6.28" y2="${y}"/>`;}
 return `<g fill="none" stroke="${ink}" stroke-width="2" stroke-linejoin="round">${body}</g>`;
}
export function fixtureSize(f){return f.type==='sinkBank'?{width:24.24,height:f.basinCount*BASIN_PITCH+2}:SYMBOLS[f.type];}
export function fixtureBounds(f){const s=fixtureSize(f),turned=Math.abs(f.rotation)%180===90,w=(turned?s.height:s.width)*f.scale,h=(turned?s.width:s.height)*f.scale;return {left:f.x-w/2,right:f.x+w/2,top:f.y-h/2,bottom:f.y+h/2};}
export function fixtureLayout(d,p){
 const out=[],point=(x,y)=>planPoint(x,y,p),bankHeight=(5*BASIN_PITCH+2)*FIXTURE_SCALE;
 // Both banks share basin spacing and the same top and bottom datums.
 const bankBottom=point(88,0).y-10,bankTop=bankBottom-bankHeight;
 const bankX=d.id==='main'?point(0,ACCOMMODATION.leftBacking).x+p.wallWidth/2+24.24*FIXTURE_SCALE/2+1:point(0,ACCOMMODATION.rightBacking).x-p.wallWidth/2-24.24*FIXTURE_SCALE/2-1;
 out.push({...item('sinkBank',bankX,(bankTop+bankBottom)/2,d.id==='main'?0:180),basinCount:5});
 const types=d.id==='main'?['dryer','washer']:['largeSink','washerDryer'];
 let bottom=bankTop-2;
 for(const type of [...types].reverse()){const symbol=SYMBOLS[type],height=symbol.width*FIXTURE_SCALE,x=bankX+(d.id==='main'?-1:1)*(24.24-symbol.height)*FIXTURE_SCALE/2;out.push(item(type,x,bottom-height/2,type==='largeSink'?270:90));bottom-=height+2;}
 if(d.id==='main'){
  const front=point(0,190).x,back=point(0,256).x;
  for(let i=0;i<4;i++){
   const [start,end]=MAIN_STALLS[i],top=point(end,0).y,bottom=point(start,0).y;
   const showerX=back-2.1-SHOWER_SIZE/2;
   const showerY=i===0?top+2.1+SHOWER_SIZE/2:i===2?(top+bottom)/2:bottom-2.1-SHOWER_SIZE/2;
   out.push({...item('shower',showerX,showerY),stallIndex:i});
   if(i!==2){const toiletX=i===1?front+2.1+23.66*FIXTURE_SCALE/2:back-2.1-27.89*FIXTURE_SCALE/2;
    const toiletY=i===0?bottom-2.1-23.66*FIXTURE_SCALE/2:top+2.1+(i===1?27.89:23.66)*FIXTURE_SCALE/2;
    out.push({...item('toilet',toiletX,toiletY,i===1?0:90),stallIndex:i});}
  }
 }else{
  const back=point(0,125).x,front=point(0,169).x,cx=back+2.1+SHOWER_SIZE/2;
  for(let i=0;i<2;i++){const top=point(120+i*32,0).y,bottom=point(88+i*32,0).y;
   out.push({...item('shower',cx,i===0?top+2.1+SHOWER_SIZE/2:bottom-2.1-SHOWER_SIZE/2),stallIndex:i});
   out.push({...item('toilet',i===0?back+2.1+27.89*FIXTURE_SCALE/2:front-2.1-23.66*FIXTURE_SCALE/2,i===0?bottom-2.1-23.66*FIXTURE_SCALE/2:top+2.1+27.89*FIXTURE_SCALE/2,i===0?270:0),stallIndex:i});
  }
  const urinalX=point(0,125).x+p.wallWidth/2+1+SYMBOLS.urinal.height*FIXTURE_SCALE/2;
  for(const x of [174,190])out.push(item('urinal',urinalX,point(x,0).y,270));
  // Separate sanitary bay between staff rooms 3 and 2, as shown in the source.
  const bayTop=point(458,0).y,bayBottom=point(394,0).y,right=point(0,353).x;
  out.push({...item('shower',right-2.1-SHOWER_SIZE/2,bayTop+2.1+SHOWER_SIZE/2),area:'staff-bathroom'});
  out.push({...item('toilet',right-2.1-27.89*FIXTURE_SCALE/2,bayBottom-2.1-23.66*FIXTURE_SCALE/2,90),area:'staff-bathroom'});

 }
 return out.map(f=>f.type==='shower'&&p.showerScaleFactor?{...f,scale:f.scale*p.showerScaleFactor}:f);
}
export function fixtureMarkup(f,ink){const s=fixtureSize(f);let body=f.type==='sinkBank'?sinkBankMarkup(f.basinCount,ink):s.body.replaceAll('__INK__',ink);if(['washer','dryer','washerDryer'].includes(f.type)&&f.rotation)body=body.replace(/<text\b[\s\S]*?<\/text>/g,text=>`<g transform="rotate(${-f.rotation} ${s.width/2} ${s.height/2})">${text}</g>`);return `<g data-fixture="${f.type}" transform="translate(${f.x} ${f.y}) rotate(${f.rotation}) scale(${f.scale}) translate(${-s.width/2} ${-s.height/2})">${body}</g>`;}
export function stallEntries(d){return d.id==='main'?MAIN_STALLS.map(([start,end])=>({x:start+(end-start-24*294/520)/2,y:190,swing:-1})):Array.from({length:2},(_,i)=>({x:88+i*32+(32-24*294/520)/2,y:169,swing:1}));}
export function bathroomPaths(d){if(d.id==='main')return ['M88 190V256H202V190','M88 190H202','M116.5 190V256 M151 190V256 M167.5 190V256'];return ['M88 125V169H152V125 M120 125V169'];}
export function dockLayout(p){
 const scale=264/327,width=90.22*scale,top=planPoint(430,0,p).y,bottom=top+239.15*scale,rampTop=planPoint(568,0,p).y,rampBottom=top+81.78*scale,musterWidth=70.06*scale;
 const muster={x:-width/2,y:bottom-width/2,scale:musterWidth/SYMBOLS.muster.width};
 return {left:-width,right:0,top,bottom,rampLeft:-32.02*scale,rampTop,rampBottom,label:{x:-width/2,y:(rampBottom+muster.y-musterWidth/2)/2+3.1},muster};
}
export function dockMarkup(p){const g=dockLayout(p),s=p.wallWidth,arrow=g.rampLeft/2;return `<g data-dock-area="true" fill="none" stroke="${p.ink}" stroke-width="${s}" stroke-linejoin="round"><path d="M${g.rampLeft} ${g.rampTop}H0V${g.rampBottom}H${g.rampLeft}Z"/><path d="M${g.left} ${g.top}H${g.rampLeft}V${g.rampBottom}H0V${g.bottom}H${g.left}Z"/><path d="M${arrow} ${g.rampTop+9}V${g.rampTop+35}m-4-4 4 4 4-4" stroke-width="2"/><text x="${-s/2-3}" y="${g.rampTop-8}" font-family="LibreFranklin" font-weight="bold" font-size="7.3" text-anchor="end" fill="${p.ink}" stroke="none">DOWN</text><text x="${g.label.x}" y="${g.label.y}" font-family="LibreFranklin" font-weight="bold" font-size="8.88" text-anchor="middle" fill="${p.ink}" stroke="none">DOCK</text></g>${fixtureMarkup({type:'muster',...g.muster,rotation:0},p.ink)}`;}

// Faucet vectors in native symbol space: the counter faucet starts at its left
// edge; the laundry sink faucet starts at its bottom edge. Rotate with the symbol.
export function faucetDirection(f){const native=f.type==='sinkBank'?{x:-1,y:0}:{x:0,y:1},angle=f.rotation*Math.PI/180;return {x:native.x*Math.cos(angle)-native.y*Math.sin(angle),y:native.x*Math.sin(angle)+native.y*Math.cos(angle)};}
