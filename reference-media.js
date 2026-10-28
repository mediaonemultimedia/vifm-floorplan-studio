import {referenceKind,INTAKE_LIMITS} from './intake.js';
const abortError=()=>new DOMException('Preparation cancelled','AbortError');
function abortable(promise,signal){if(signal?.aborted)return Promise.reject(abortError());return new Promise((resolve,reject)=>{const cancel=()=>{cleanup();reject(abortError());},cleanup=()=>signal?.removeEventListener('abort',cancel);signal?.addEventListener('abort',cancel,{once:true});promise.then(v=>{cleanup();resolve(v);},err=>{cleanup();reject(err);});});}
export const fileData=(file,signal)=>new Promise((resolve,reject)=>{if(signal?.aborted){reject(abortError());return;}const r=new FileReader(),cancel=()=>r.abort(),cleanup=()=>signal?.removeEventListener('abort',cancel);r.onload=()=>{cleanup();resolve(r.result);};r.onerror=()=>{cleanup();reject(Error('Could not read '+file.name));};r.onabort=()=>{cleanup();reject(abortError());};signal?.addEventListener('abort',cancel,{once:true});r.readAsDataURL(file);});
function wait(target,event,timeout=20000,signal){return new Promise((resolve,reject)=>{if(signal?.aborted){reject(abortError());return;}const timer=setTimeout(()=>finish(Error('This media could not be decoded. Try a JPEG/PNG image or an MP4 video.')),timeout);const done=()=>finish(),fail=()=>finish(Error('This media format is not supported by this browser. Convert it to JPEG/PNG or MP4.')),cancel=()=>finish(abortError());function finish(err){clearTimeout(timer);target.removeEventListener(event,done);target.removeEventListener('error',fail);signal?.removeEventListener('abort',cancel);err?reject(err):resolve();}target.addEventListener(event,done,{once:true});target.addEventListener('error',fail,{once:true});signal?.addEventListener('abort',cancel,{once:true});});}
function snapshot(source,width,height){const scale=Math.min(1,1600/Math.max(width,height)),canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(width*scale));canvas.height=Math.max(1,Math.round(height*scale));const ctx=canvas.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(source,0,0,canvas.width,canvas.height);return canvas.toDataURL('image/jpeg',.88);}
export async function imageData(file,signal){
 if(referenceKind(file)==='svg'){const text=await abortable(file.text(),signal);if(/<script|<foreignObject|\bon\w+\s*=|<!DOCTYPE|@import|(?:href\s*=\s*["'](?!#))|url\(\s*["']?(?!#)/i.test(text))throw Error('Export this SVG as a PDF or PNG first: it contains external or active content.');}
 const url=URL.createObjectURL(file),img=new Image();try{const loaded=wait(img,'load',20000,signal);img.src=url;await loaded;if(img.naturalWidth*img.naturalHeight>50000000)throw Error('This image is too large to prepare. Resize it below 50 megapixels.');return snapshot(img,img.naturalWidth,img.naturalHeight);}finally{img.src='';URL.revokeObjectURL(url);}
}
export async function videoFrames(file,count=8,onFrame=()=>{},signal){
 const url=URL.createObjectURL(file),video=document.createElement('video');video.muted=true;video.preload='auto';video.playsInline=true;
 try{const metadata=wait(video,'loadedmetadata',20000,signal);video.src=url;await metadata;if(!Number.isFinite(video.duration)||video.duration<=0)throw Error('Could not read the video duration.');const out=[];
  for(let i=0;i<count;i++){const seconds=Math.min(Math.max(0,video.duration-.05),video.duration*(i+.5)/count),seeked=wait(video,'seeked',20000,signal);video.currentTime=seconds;await seeked;const frame={seconds:Math.round(seconds*10)/10,data:snapshot(video,video.videoWidth,video.videoHeight)};out.push(frame);onFrame(frame,i+1);}
  return out;
 }finally{video.removeAttribute('src');video.load();URL.revokeObjectURL(url);}
}
export async function prepareMedia(refs,onProgress=()=>{},signal){
 if(signal?.aborted)throw abortError();const media=[];let bytes=0;
 for(const [i,r]of refs.entries()){
  if(signal?.aborted)throw abortError();
  onProgress(`Preparing reference ${i+1} of ${refs.length}: ${r.meta.name}`);
  const kind=referenceKind(r.file),add=(data,type,name,seconds)=>{bytes+=data.length;if(bytes>INTAKE_LIMITS.payloadBytes)throw Error('Prepared references exceed 18 MB. Use fewer video stills, smaller PDFs or fewer references.');media.push({referenceId:r.meta.id,name,type,data,...(seconds===undefined?{}:{seconds})});};
  if(kind==='video'){if(!r.frames?.length)throw Error('Choose stills for '+r.meta.name+' before generating.');for(const frame of r.frames)add(frame.data,'image/jpeg',`${r.meta.name} · ${frame.seconds}s`,frame.seconds);}
  else if(kind==='image'||kind==='svg')add(await imageData(r.file,signal),'image/jpeg',r.meta.name);
  else if(kind==='pdf'){if(r.file.size>10*1024*1024)throw Error('PDF references must be 10 MB or smaller. Split or compress '+r.meta.name+'.');add(await fileData(r.file,signal),'application/pdf',r.meta.name);}
  else if(kind==='text'){if(r.file.size>200000)throw Error('Text references must be 200 KB or smaller.');add(await abortable(r.file.text(),signal),'text/plain',r.meta.name);}
  else throw Error('Unsupported reference: '+r.meta.name);
 }
 if(media.filter(m=>m.type.startsWith('image/')).length>INTAKE_LIMITS.images)throw Error('Use up to 32 images and video stills per generation.');
 return media;
}
