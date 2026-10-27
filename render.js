import {editorDrawing,editorDeckOrigins} from './editor-render.js';
import {stairMarkup} from './stairs.js';
import {fixtureLayout,fixtureMarkup,dockMarkup,dockLayout} from './fixtures.js';
import {COLORS,planPoint,planPath,doorPath,escapeXML as e} from './model.js';
import {applyReferenceStyle,needsReferenceStyle,REFERENCE,deckDoors,builtWallPaths,fitLabel} from './reference-style.js';
export const deckOrigins=p=>p.editorRevision===1?editorDeckOrigins(p):[206,582].map(center=>({x:center-dockLayout(p).left/2-450*p.width/p.length,y:222}));
let logo='';let logoViewBox='0 0 128.42 74.14';
export async function loadLogo(){const r=await fetch('./assets/logo.svg');if(!r.ok)throw Error('Logo could not be loaded');const doc=new DOMParser().parseFromString(await r.text(),'image/svg+xml');logo=doc.documentElement.innerHTML;logoViewBox=doc.documentElement.getAttribute('viewBox');}
function fixtures(d,p){return `${stairMarkup(d,p)}<g>${fixtureLayout(d,p).map(f=>fixtureMarkup(f,p.ink)).join('')}</g>`;}
function doors(d,p){return `<g fill="none" stroke="${p.ink}" stroke-linejoin="round" stroke-width="${p.wallWidth*2/3}">${deckDoors(d,p).map(door=>`<path class="door-swing" d="${door.swing}"/><path class="door-threshold" d="${door.threshold}" stroke-width="${p.wallWidth}" stroke-dasharray="${p.wallWidth*4/3} ${p.wallWidth*4/3}"/>`).join('')}</g>`;}
function element(a,p,selected,interactive){const q=planPoint(a.x,a.y,p);const attrs=`${interactive?`data-element="${e(a.id)}" tabindex="0" role="button" aria-label="Edit ${e(a.text||'wall rectangle')}"`:''}`;let s='';
 if(a.kind==='rect'){const h=q.y-planPoint(a.x+a.w,a.y,p).y,w=a.h*(900*p.width/p.length)/353;s=`<rect x="${q.x}" y="${q.y-h}" width="${w}" height="${h}" fill="none" stroke="${p.ink}" stroke-width="${p.wallWidth}"/>`;}
 else if(a.kind==='arrow')s=`<path d="M${q.x-24} ${q.y}h48m-8-5 8 5-8 5" fill="none" stroke="${COLORS.accent}" stroke-width="1.5"/>`;
 else if(a.kind==='firstaid')s=`<rect x="${q.x-10}" y="${q.y-10}" width="20" height="20" rx="2" fill="none" stroke="${p.ink}" stroke-width="1.5"/><path d="M${q.x-6} ${q.y}h12m-6-6v12" stroke="${p.ink}" stroke-width="3"/>`;
 else if(a.kind==='muster')s=fixtureMarkup({type:'muster',x:q.x,y:q.y,rotation:0,scale:.5},p.ink);
 else {const lines=a.text.split('\n');s=`<text x="${q.x}" y="${q.y}" text-anchor="${a.align||'middle'}" font-size="${a.size}" font-family="LibreFranklin" font-weight="bold" fill="${p.ink}">${lines.map((line,i)=>`<tspan x="${q.x}" dy="${i? a.size:0}">${e(line)}</tspan>`).join('')}</text>`;}
 const textWidth=Math.max(14,...a.text.split('\n').map(t=>t.length*a.size*.65)),textX=q.x-(a.align==='start'?0:a.align==='end'?textWidth:textWidth/2);
 let bounds=a.kind==='rect'?{x:q.x,y:planPoint(a.x+a.w,a.y,p).y,w:a.h*(900*p.width/p.length)/353,h:q.y-planPoint(a.x+a.w,a.y,p).y}:{x:textX,y:q.y-a.size,w:textWidth,h:Math.max(20,a.text.split('\n').length*a.size+3)};
 return `<g ${attrs}>${interactive?`<rect x="${bounds.x-3}" y="${bounds.y-3}" width="${bounds.w+6}" height="${bounds.h+6}" fill="transparent" stroke="${selected===a.id?'#f05024':'none'}" stroke-width="1"/>`:''}${s}</g>`;
}
export function drawing(p,{selected=null,interactive=false,visible='both',grid=false}={}){
 if(p.editorRevision===1)return editorDrawing(p,{selected,interactive,visible,grid},logo,logoViewBox);
 // Imported and older saved drawings must never mix old partitions with new fittings.
 if(needsReferenceStyle(p))p=applyReferenceStyle(structuredClone(p));
 const dw=900*p.width/p.length;
 const defs=`<defs><style>@font-face{font-family:LibreFranklin;src:url('assets/LibreFranklin-Medium.ttf')}@font-face{font-family:LibreFranklin;src:url('assets/LibreFranklin-Bold.ttf');font-weight:bold}</style><pattern id="grid" width="12" height="12" patternUnits="userSpaceOnUse"><path d="M12 0H0V12" fill="none" stroke="${p.ink}" stroke-opacity=".1" stroke-width=".5"/></pattern></defs>`;
 let s=`<svg xmlns="http://www.w3.org/2000/svg" id="drawing" viewBox="0 0 792 1224" width="792" height="1224" aria-label="${e(p.name)} editable floorplans">${defs}<rect width="792" height="1224" fill="${p.paper}"/><rect width="792" height="124.59" fill="${p.header}"/><text x="758" y="60" text-anchor="end" font-family="LibreFranklin" font-size="${Math.min(30.91,500/Math.max(1,p.name.length)*1.5)}" font-weight="bold" fill="${p.paper}">${e(p.name)}</text><text x="758" y="88" text-anchor="end" font-family="LibreFranklin" font-size="24" fill="${p.paper}">CAMP LAYOUT</text><svg x="31" y="25" width="128.42" height="74.14" viewBox="${logoViewBox}">${logo}</svg>`;
 if(grid&&interactive)s+=`<rect x="25" y="200" width="742" height="930" fill="url(#grid)"/>`;
 p.decks.forEach((d,i)=>{if(visible!=='both'&&visible!==d.id)return;const o=deckOrigins(p)[i];s+=`<g transform="translate(${o.x} ${o.y})" ${interactive?`data-deck="${d.id}"`:''}><g fill="none" stroke="${p.ink}" stroke-width="${p.wallWidth}" stroke-linejoin="round"><path d="${planPath('M0 0H704V353H0Z',p)}"/>${builtWallPaths(d,p).map(({path,index})=>`<path d="${path}" stroke="${selected===`wall-${d.id}-${index}`?'#f05024':p.ink}"/>${interactive&&index!==null?`<path d="${path}" data-wall="${index}" data-deck-id="${d.id}" stroke="transparent" stroke-width="8"/>`:''}`).join('')}</g>${fixtures(d,p)}${doors(d,p)}${dockMarkup(p)}${[...d.rects,...d.labels,...d.annotations].map(a=>element(fitLabel(a,d,p),p,selected,interactive)).join('')}<text x="${dw/2}" y="925" font-family="LibreFranklin" font-size="${REFERENCE.caption}" font-weight="bold" text-anchor="middle" fill="${COLORS.accent}">${e(d.name)}</text>`;
 s+='</g>';});
 s+='</svg>';
 return s;
}
