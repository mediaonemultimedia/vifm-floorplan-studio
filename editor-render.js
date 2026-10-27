import {planPoint,escapeXML as e} from './model.js';
import {deckDoors} from './reference-style.js';
import {stairMarkup} from './stairs.js';
import {fixtureLayout,fixtureMarkup,dockMarkup,dockLayout} from './fixtures.js';
import {textPresentation,textBounds} from './theme.js';
export function editorDeckOrigins(p){const left=p.coordinates==='drawing'?0:dockLayout(p).left;return [206,582].map(center=>({x:center-left/2-p.bounds.width/2,y:222}));}
function fixture(f,p){return fixtureMarkup(f,p.ink).replace(/stroke-width="[^\"]+"/g,`stroke-width="${p.theme.lines.detail/f.scale}"`).replace(/font-size="[^\"]+"/g,`font-size="${p.theme.text.detail/f.scale}"`);}
function details(d,p){
 if(p.coordinates!=='drawing')return stairMarkup(d,p,deckDoors(d,p)).replace(/stroke-width="[^\"]+"/g,`stroke-width="${p.theme.lines.detail}"`)+fixtureLayout(d,p).map(f=>fixture(f,p)).join('')+dockMarkup(p).replace(/font-size="[^\"]+"/g,`font-size="${p.theme.text.detail}"`);
 return (d.details||[]).map(a=>{if(a.kind==='symbol')return fixture(a,p);const attrs=`fill="none" stroke="${p.ink}" stroke-width="${p.theme.lines[a.role]}" stroke-linecap="square"`;if(a.kind==='line')return `<line x1="${a.x1}" y1="${a.y1}" x2="${a.x2}" y2="${a.y2}" ${attrs}/>`;if(a.kind==='ellipse')return `<ellipse cx="${a.x+a.w/2}" cy="${a.y+a.h/2}" rx="${a.w/2}" ry="${a.h/2}" ${attrs}/>`;return `<rect x="${a.x}" y="${a.y}" width="${a.w}" height="${a.h}" ${attrs}/>`;}).join('');
}
function doorPaths(d,p){
 if(p.coordinates!=='drawing')return deckDoors(d,p);
 return (d.doors||[]).map(a=>{const end={x:a.x+a.u[0],y:a.y+a.u[1]},open={x:a.x+a.v[0],y:a.y+a.v[1]},r=Math.hypot(...a.u),cross=a.v[0]*a.u[1]-a.v[1]*a.u[0];return {swing:`M${a.x} ${a.y}L${open.x} ${open.y} M${open.x} ${open.y}A${r} ${r} 0 0 ${cross>0?1:0} ${end.x} ${end.y}`,threshold:`M${a.x} ${a.y}L${end.x} ${end.y}`};});
}
function element(raw,d,p,selected,interactive){
 let a=textPresentation(raw,p),q=a.drawingPosition?{x:a.x,y:a.y}:planPoint(a.x,a.y,p);
 const attr=interactive?`data-element="${e(a.id)}" tabindex="0" role="button" aria-label="Edit ${e(a.text||'rectangle')}"`:'';
 let body='';
 if(a.kind==='rect'){const h=p.coordinates==='drawing'?a.h:q.y-planPoint(a.x+a.w,a.y,p).y,w=p.coordinates==='drawing'?a.w:a.h*(900*p.width/p.length)/353;body=`<rect x="${q.x}" y="${p.coordinates==='drawing'?q.y:q.y-h}" width="${w}" height="${h}" fill="none" stroke="${p.ink}" stroke-width="${p.theme.lines.secondary}"/>`;}
 else if(a.kind==='arrow')body=`<path d="M${q.x-24} ${q.y}h48m-8-5 8 5-8 5" fill="none" stroke="${p.ink}" stroke-width="${p.theme.lines.detail}"/>`;
 else if(a.kind==='firstaid')body=`<rect x="${q.x-10}" y="${q.y-10}" width="20" height="20" fill="none" stroke="${p.ink}" stroke-width="${p.theme.lines.secondary}"/><path d="M${q.x-6} ${q.y}h12m-6-6v12" stroke="${p.ink}" stroke-width="${p.theme.lines.detail*2}"/>`;
 else if(a.kind==='muster')body=fixture({type:'muster',x:q.x,y:q.y,rotation:0,scale:.5},p);
 else body=`<text x="${q.x}" y="${q.y}" ${a.rotation?`transform="rotate(${a.rotation} ${q.x} ${q.y})"`:''} text-anchor="${a.align||'middle'}" font-size="${a.size}" font-family="LibreFranklin" font-weight="bold" fill="${p.ink}" data-text-style="${a.textStyle||a.kind}">${a.text.split('\n').map((t,i)=>`<tspan x="${q.x}" dy="${i?a.size:0}">${e(t)}</tspan>`).join('')}</text>`;
 const b=textBounds({...a,x:q.x,y:q.y,drawingPosition:true,centerArea:undefined},p,()=>q),hit=interactive?`<rect x="${b.x-3}" y="${b.y-3}" width="${Math.max(16,b.w+6)}" height="${Math.max(18,b.h+6)}" fill="transparent" stroke="${selected===a.id?'#f05024':'none'}" stroke-width="1"/>`:'';
 const area=interactive&&selected===a.id&&a.centerArea?`<rect x="${a.centerArea.x}" y="${a.centerArea.y}" width="${a.centerArea.w}" height="${a.centerArea.h}" fill="none" stroke="#f05024" stroke-width=".7" stroke-dasharray="4 3" pointer-events="none"/>`:'';
 return `<g ${attr}>${area}${hit}${body}</g>`;
}
export function editorDrawing(p,{selected=null,interactive=false,visible='both',grid=false}={},logo='',logoViewBox='0 0 128.42 74.14'){
 const t=p.theme.text,l=p.theme.lines;
 const contentBottom=Math.max(p.bounds.height,...p.decks.flatMap(d=>[...d.labels,...d.annotations].map(a=>{const t=textPresentation(a,p),q=t.drawingPosition?{y:t.y}:planPoint(t.x,t.y,p);return q.y+t.size*.25+(t.text.split('\n').length-1)*t.size;})));
 const captionY=Math.max(p.bounds.height+25,contentBottom+20);
 let s=`<svg xmlns="http://www.w3.org/2000/svg" id="drawing" viewBox="0 0 792 1224" width="792" height="1224" aria-label="${e(p.name)} editable floorplans"><defs><style>@font-face{font-family:LibreFranklin;src:url('assets/LibreFranklin-Medium.ttf')}@font-face{font-family:LibreFranklin;src:url('assets/LibreFranklin-Bold.ttf');font-weight:bold}</style><pattern id="grid" width="12" height="12" patternUnits="userSpaceOnUse"><path d="M12 0H0V12" fill="none" stroke="${p.ink}" stroke-opacity=".1" stroke-width=".5"/></pattern></defs><rect width="792" height="1224" fill="${p.paper}"/><rect width="792" height="124.59" fill="${p.header}"/><svg x="31" y="25" width="128.42" height="74.14" viewBox="${logoViewBox}">${logo}</svg><text x="758" y="60" text-anchor="end" font-family="LibreFranklin" font-size="${t.title}" font-weight="bold" fill="${p.paper}">${e(p.name)}</text><text x="758" y="88" text-anchor="end" font-family="LibreFranklin" font-size="${t.subtitle}" fill="${p.paper}">CAMP LAYOUT</text>`;
 if(grid&&interactive)s+=`<rect x="25" y="200" width="742" height="930" fill="url(#grid)"/>`;
 p.decks.forEach((d,i)=>{if(visible!=='both'&&visible!==d.id)return;const o=editorDeckOrigins(p)[i];s+=`<g transform="translate(${o.x} ${o.y})" ${interactive?`data-deck="${d.id}"`:''}>`;
 for(const [j,w]of d.walls.entries()){
  s+=`<line x1="${w.x1}" y1="${w.y1}" x2="${w.x2}" y2="${w.y2}" stroke="${selected===`wall-${d.id}-${j}`?'#f05024':p.ink}" stroke-width="${l[w.role]}" stroke-linecap="square"/>`;
  if(interactive)s+=`<line x1="${w.x1}" y1="${w.y1}" x2="${w.x2}" y2="${w.y2}" stroke="transparent" stroke-width="8" data-wall="${j}" data-deck-id="${d.id}" tabindex="0" role="button" aria-label="Edit wall segment ${j+1}"/>`;
 }
 s+=details(d,p);
 for(const a of doorPaths(d,p))s+=`<path class="door-swing" d="${a.swing}" fill="none" stroke="${p.ink}" stroke-width="${l.detail}" stroke-linecap="square"/><path class="door-threshold" d="${a.threshold}" fill="none" stroke="${p.ink}" stroke-width="${l.threshold}" stroke-dasharray="${l.dash} ${l.dash}" stroke-linecap="butt"/>`;
 s+=[...d.rects,...d.labels,...d.annotations].map(a=>element(a,d,p,selected,interactive)).join('');
 if(interactive&&selected?.startsWith(`wall-${d.id}-`)){const w=d.walls[Number(selected.split('-').at(-1))];if(w)for(const [end,x,y]of [['start',w.x1,w.y1],['end',w.x2,w.y2]])s+=`<circle cx="${x}" cy="${y}" r="4" fill="white" stroke="#f05024" stroke-width="1.5" data-wall-end="${end}" data-wall="${d.walls.indexOf(w)}" data-deck-id="${d.id}"/>`;}
 s+=`<text x="${p.bounds.width/2}" y="${captionY}" font-family="LibreFranklin" font-size="${t.caption}" font-weight="bold" text-anchor="middle" fill="#f05024">${e(d.name)}</text></g>`;
 });
 return s+'</svg>';
}
