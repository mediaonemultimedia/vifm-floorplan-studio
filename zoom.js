// View-only controls shared by every boat and revision; no project data is edited.
export const MIN_ZOOM=.25,MAX_ZOOM=4;
export const clampZoom=n=>Math.max(MIN_ZOOM,Math.min(MAX_ZOOM,n));
export function selectionZoom(start,end,viewport){
 const width=Math.abs(end.x-start.x),height=Math.abs(end.y-start.y);
 if(!width||!height)return null;
 return {point:{x:(start.x+end.x)/2,y:(start.y+end.y)/2},zoom:clampZoom(Math.min(Math.max(1,viewport.width-48)/width,Math.max(1,viewport.height-48)/height))};
}
export function zoomScrollTarget(offset,point,zoom,anchor){return {left:Math.max(0,offset.x+point.x*zoom-anchor.x),top:Math.max(0,offset.y+point.y*zoom-anchor.y)};}
export function bindZoomControls({stage,sheet,input,inButton,outButton,fitButton,areaButton,getZoom,setZoom,getTool,setTool}){
 let marquee=null,returnTool='select';
 const viewport=()=>({width:stage.clientWidth,height:stage.clientHeight});
 const centre=()=>({x:stage.clientWidth/2,y:stage.clientHeight/2});
 const stageOrigin=()=>{const r=stage.getBoundingClientRect();return {x:r.left+stage.clientLeft,y:r.top+stage.clientTop};};
 function pointAt(clientX,clientY){const r=sheet.getBoundingClientRect(),z=getZoom();return {x:Math.max(0,Math.min(792,(clientX-r.left)/z)),y:Math.max(0,Math.min(1224,(clientY-r.top)/z))};}
 function applyZoom(next,point,anchor=centre()){
  setZoom(clampZoom(next));
  const r=sheet.getBoundingClientRect(),o=stageOrigin();
  const target=zoomScrollTarget({x:r.left-o.x+stage.scrollLeft,y:r.top-o.y+stage.scrollTop},point,getZoom(),anchor);
  stage.scrollTo({...target,behavior:'instant'});
  inButton.disabled=getZoom()>=MAX_ZOOM;outButton.disabled=getZoom()<=MIN_ZOOM;
 }
 function zoomFromCentre(next){const o=stageOrigin(),c=centre();applyZoom(next,pointAt(o.x+c.x,o.y+c.y),c);}
 function removeMarquee(){
  const pointer=marquee?.pointerId;marquee=null;sheet.querySelector('.zoom-marquee')?.remove();
  if(pointer!==undefined&&sheet.hasPointerCapture(pointer))sheet.releasePointerCapture(pointer);
 }
 function exitZoom(){removeMarquee();setTool(returnTool);}
 function enterZoom(){returnTool=getTool()==='feedback'?'feedback':'select';setTool('zoom');}
 function updateMarquee(end){
  marquee.end=end;let rect=sheet.querySelector('.zoom-marquee');
  if(!rect){rect=document.createElementNS('http://www.w3.org/2000/svg','rect');rect.setAttribute('class','zoom-marquee');rect.setAttribute('aria-hidden','true');sheet.querySelector('svg').append(rect);}
  for(const [name,value]of Object.entries({x:Math.min(marquee.start.x,end.x),y:Math.min(marquee.start.y,end.y),width:Math.abs(end.x-marquee.start.x),height:Math.abs(end.y-marquee.start.y)}))rect.setAttribute(name,value);
 }
 inButton.onclick=()=>zoomFromCentre(getZoom()+.1);
 outButton.onclick=()=>zoomFromCentre(getZoom()-.1);
 function commitInput(){const value=Number(input.value);if(input.value.trim()&&Number.isFinite(value))zoomFromCentre(value/100);else input.value=Math.round(getZoom()*100);}
 input.addEventListener('change',commitInput);
 input.addEventListener('blur',()=>{if(input.value!==String(Math.round(getZoom()*100)))commitInput();});
 input.addEventListener('keydown',ev=>{if(ev.key==='Enter'){ev.preventDefault();commitInput();input.blur();}});
 fitButton.onclick=()=>{if(getTool()==='zoom')exitZoom();removeMarquee();const v=viewport();applyZoom(Math.min(1,(v.width-65)/792,(v.height-65)/1224),{x:396,y:612});};
 areaButton.onclick=()=>getTool()==='zoom'?exitZoom():enterZoom();
 sheet.addEventListener('pointerdown',ev=>{
  if(getTool()!=='zoom'||ev.button!==0||ev.isPrimary===false)return;
  ev.preventDefault();ev.stopImmediatePropagation();
  const point=pointAt(ev.clientX,ev.clientY);marquee={pointerId:ev.pointerId,start:point,end:point,clientX:ev.clientX,clientY:ev.clientY};
  sheet.setPointerCapture(ev.pointerId);updateMarquee(point);
 },true);
 document.addEventListener('pointermove',ev=>{
  if(!marquee||ev.pointerId!==marquee.pointerId)return;
  ev.preventDefault();ev.stopImmediatePropagation();updateMarquee(pointAt(ev.clientX,ev.clientY));
 },true);
 document.addEventListener('pointerup',ev=>{
  if(!marquee||ev.pointerId!==marquee.pointerId)return;
  ev.preventDefault();ev.stopImmediatePropagation();
  const drag=marquee,end=pointAt(ev.clientX,ev.clientY),area=Math.hypot(ev.clientX-drag.clientX,ev.clientY-drag.clientY)>=6?selectionZoom(drag.start,end,viewport()):null;
  removeMarquee();setTool(returnTool);applyZoom(area?.zoom??getZoom()*1.5,area?.point??end);
 },true);
 document.addEventListener('pointercancel',ev=>{if(marquee&&ev.pointerId===marquee.pointerId)exitZoom();},true);
 sheet.addEventListener('lostpointercapture',()=>{if(marquee)removeMarquee();});
 window.addEventListener('blur',removeMarquee);
 document.addEventListener('keydown',ev=>{
  if(ev.target.closest?.('input,textarea,select,[contenteditable="true"],dialog[open]'))return;
  if(ev.key==='Escape'&&getTool()==='zoom'){ev.preventDefault();ev.stopImmediatePropagation();exitZoom();}
  else if(ev.key.toLowerCase()==='z'&&!ev.metaKey&&!ev.ctrlKey&&!ev.altKey){ev.preventDefault();getTool()==='zoom'?exitZoom():enterZoom();}
 },true);
 return {isDragging:()=>!!marquee};
}
