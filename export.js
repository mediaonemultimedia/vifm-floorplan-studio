import {drawing} from './render.js';
const FONTS={normal:'LibreFranklin-Medium.ttf',bold:'LibreFranklin-Bold.ttf'};
async function base64File(path){const r=await fetch(path);if(!r.ok)throw Error(`Could not load ${path}`);const bytes=new Uint8Array(await r.arrayBuffer());let s='';for(let i=0;i<bytes.length;i+=8192)s+=String.fromCharCode(...bytes.subarray(i,i+8192));return btoa(s);}
export function download(data,name,type){const url=URL.createObjectURL(new Blob([data],{type}));const a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),10000);}
export function filename(p,ext){return `${p.name.replace(/[^a-z0-9_-]+/gi,'-')}-floorplans.${ext}`;}
export async function exportSVG(p){let svg=drawing(p);const [normal,bold]=await Promise.all(Object.values(FONTS).map(f=>base64File('./assets/'+f)));svg=svg.replace(/url\('assets\/LibreFranklin-Medium.ttf'\)/g,`url('data:font/ttf;base64,${normal}')`).replace(/url\('assets\/LibreFranklin-Bold.ttf'\)/g,`url('data:font/ttf;base64,${bold}')`);download(svg,filename(p,'svg'),'image/svg+xml');}
export async function createPDF(p){
 if(!window.jspdf?.jsPDF)throw Error('PDF library is missing. Reload the page and try again.');
 const format=p.pageSize==='A3'?[841.89,1190.55]:p.pageSize==='Letter'?[612,792]:[792,1224];
 const pdf=new window.jspdf.jsPDF({unit:'pt',format,orientation:'portrait',compress:true,putOnlyUsedFonts:true});
 for(const [style,file]of Object.entries(FONTS)){pdf.addFileToVFS(file,await base64File('./assets/'+file));pdf.addFont(file,'LibreFranklin',style);}
 pdf.setProperties({title:p.name+' floorplans',subject:'Schematic accommodation layout based on supplied plans. Not to scale.',creator:'MediaOne Floorplan Studio'});
 const holder=document.createElement('div');holder.style.cssText='position:fixed;left:-10000px;top:0;';holder.innerHTML=drawing(p);document.body.append(holder);
 try{const svg=holder.querySelector('svg');svg.querySelectorAll('style').forEach(s=>{if(s.textContent.includes('@font-face'))s.remove();});const scale=Math.min(format[0]/792,format[1]/1224);await pdf.svg(svg,{x:(format[0]-792*scale)/2,y:(format[1]-1224*scale)/2,width:792*scale,height:1224*scale});return pdf;}finally{holder.remove();}
}
export async function exportPDF(p){const pdf=await createPDF(p);pdf.save(filename(p,'pdf'));}
