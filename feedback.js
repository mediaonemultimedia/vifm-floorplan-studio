import {planPoint,sourcePoint,escapeXML as escape} from './model.js';
import {deckOrigins} from './render.js';
const round=n=>Math.round(n*10)/10;
export function createNote(project,deckId,page,release,target=null){
 const index=project.decks.findIndex(d=>d.id===deckId);if(index<0)throw Error('Choose a floorplan.');
 const deck=project.decks[index],origin=deckOrigins(project)[index],local={x:page.x-origin.x,y:page.y-origin.y},source=sourcePoint(local.x,local.y,project);
 const nearby=deck.labels.map(a=>{const q=planPoint(a.x,a.y,project);return {id:a.id,text:a.text.replace(/\s+/g,' ').trim(),distance:Math.hypot(q.x-local.x,q.y-local.y)};}).sort((a,b)=>a.distance-b.distance).slice(0,3).map(({id,text})=>({id,text}));
 return {id:crypto.randomUUID(),projectName:project.name,deckId,deckName:deck.name,page:{x:round(page.x),y:round(page.y)},local:{x:round(local.x),y:round(local.y)},source:{x:round(source.x),y:round(source.y)},nearby,target,release,drawingRevision:project.drawingRevision||'v1',createdAt:new Date().toISOString(),text:'',resolved:false};
}
export function validateNotes(value){return Array.isArray(value)?value.filter(n=>n&&typeof n.id==='string'&&n.id.length<100&&/^[a-z0-9_-]+$/i.test(n.id)&&['main','upper'].includes(n.deckId)&&typeof n.text==='string'&&n.text.length<=4000&&(n.drawingRevision===undefined||(typeof n.drawingRevision==='string'&&/^v[1-9][0-9]{0,3}$/.test(n.drawingRevision)))&&n.page&&Number.isFinite(n.page.x)&&Number.isFinite(n.page.y)&&n.page.x>=0&&n.page.x<=792&&n.page.y>=0&&n.page.y<=1224&&n.source&&Number.isFinite(n.source.x)&&Number.isFinite(n.source.y)&&n.local&&Number.isFinite(n.local.x)&&Number.isFinite(n.local.y)&&Array.isArray(n.nearby)&&typeof n.deckName==='string'&&typeof n.projectName==='string').slice(0,300):[];}
export function feedbackReport(notes,url='https://mediaonemultimedia.github.io/vifm-floorplan-studio/'){
 const open=notes.filter(n=>!n.resolved&&n.text.trim());
 return `VIFM Floorplan Studio — requested changes\nStudio: ${url}\nPage: 792 × 1224 drawing units; origin at top left. Coordinates are not feet.\n\n`+open.map((n,i)=>`${i+1}. ${n.projectName} / ${n.deckName}\nNote ID: ${n.id}\nDrawing revision: ${(n.drawingRevision||'v1').toUpperCase()}\nPublished build: ${n.release}\nPage pin: x ${n.page.x}, y ${n.page.y}\nWithin floor: x ${n.local.x}, y ${n.local.y}\nSource drawing: along ${n.source.x}, across ${n.source.y}\nNearby: ${n.nearby.map(a=>a.text).join(' / ')}${n.target?`\nTarget: ${JSON.stringify(n.target)}`:''}\nChange: ${n.text.trim()}`).join('\n\n');
}
export function feedbackPins(notes,project,visible){return notes.map((n,i)=>{
 if(n.resolved||(visible!=='both'&&visible!==n.deckId))return '';
 const index=project.decks.findIndex(d=>d.id===n.deckId);if(index<0)return '';const origin=deckOrigins(project)[index],q=planPoint(n.source.x,n.source.y,project);
 return `<g data-note="${escape(n.id)}" role="button" tabindex="0" aria-label="Feedback note ${i+1}, ${escape(n.deckName)}" transform="translate(${origin.x+q.x} ${origin.y+q.y})"><title>${escape(n.text||'Write a change request')}</title><circle r="12" fill="#f05024" stroke="white" stroke-width="2"/><text text-anchor="middle" dominant-baseline="central" font-family="LibreFranklin" font-weight="bold" font-size="10" fill="white">${i+1}</text></g>`;
 }).join('');}
