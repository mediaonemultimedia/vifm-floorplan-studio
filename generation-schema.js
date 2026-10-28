import {draftHorizontalExtent} from './draft-geometry.js';
import {DEFAULT_THEME} from './theme.js';
import {validateEditorProject} from './editor-project.js';
import {cutWall} from './wall-lines.js';
import {stairTreads} from './stairs.js';
import {validateIntake} from './intake.js';
const num={type:'number'},str={type:'string'},choice=values=>({type:'string',enum:values});
const obj=properties=>({type:'object',properties,required:Object.keys(properties),additionalProperties:false});
const array=(items,maxItems)=>({type:'array',items,maxItems});
const area=obj({x:num,y:num,w:num,h:num});
export const DRAFT_SCHEMA=obj({
 summary:str,bounds:obj({width:num,height:num}),
 decks:array(obj({id:choice(['main','upper']),name:str,
  walls:array(obj({x1:num,y1:num,x2:num,y2:num,role:choice(['wall','secondary'])}),600),
  doors:array(obj({x:num,y:num,ux:num,uy:num,vx:num,vy:num}),100),
  labels:array(obj({text:str,role:choice(['room','label','detail','marker']),x:num,y:num,align:choice(['start','middle','end']),area:{anyOf:[area,{type:'null'}]}}),200),
  fixtures:array(obj({type:choice(['toilet','shower','urinal','doubleSink','largeSink','smallSink','washer','dryer','washerDryer','sinkBank','muster']),x:num,y:num,rotation:{type:'integer',enum:[0,90,180,270]},basinCount:{type:'integer',minimum:0,maximum:20}}),150),
  stairs:array(obj({x:num,y:num,w:num,h:num,vertical:{type:'boolean'},landing:choice(['start','end','none'])}),30)
 }),2),
 uncertainties:array(obj({deckId:choice(['main','upper']),x:num,y:num,title:str,text:str,referenceIds:array(str,24)}),60)
});
function check(value,schema,path='draft'){
 if(schema.anyOf){if(!schema.anyOf.some(s=>{try{check(value,s,path);return true;}catch{return false;}}))throw Error(`Invalid ${path}.`);return;}
 const type=schema.type;if(type==='null'){if(value!==null)throw Error(`Invalid ${path}.`);return;}
 if(type==='object'){if(!value||typeof value!=='object'||Array.isArray(value))throw Error(`Invalid ${path}.`);for(const key of Object.keys(value))if(!Object.hasOwn(schema.properties,key))throw Error(`Unexpected ${path}.${key}.`);for(const key of schema.required){if(!Object.hasOwn(value,key))throw Error(`Missing ${path}.${key}.`);check(value[key],schema.properties[key],`${path}.${key}`);}return;}
 if(type==='array'){if(!Array.isArray(value)||value.length>schema.maxItems)throw Error(`Too many ${path}.`);value.forEach((v,i)=>check(v,schema.items,`${path}[${i}]`));return;}
 if(type==='number'||type==='integer'){if(!Number.isFinite(value)||(type==='integer'&&!Number.isInteger(value))||value<(schema.minimum??-300)||value>(schema.maximum??1600))throw Error(`Invalid ${path}.`);}
 else if(typeof value!==type||(type==='string'&&value.length>(path.endsWith('.summary')||path.endsWith('.text')?1800:180)))throw Error(`Invalid ${path}.`);
 if(schema.enum&&!schema.enum.includes(value))throw Error(`Invalid ${path}.`);
}
export function validateDraft(d){
 check(d,DRAFT_SCHEMA);
 if(d.bounds.width<80||d.bounds.width>320||d.bounds.height<100||d.bounds.height>900||d.decks.length!==2||d.decks[0].id!=='main'||d.decks[1].id!=='upper')throw Error('Use two floor slots and a drawing envelope up to 320 × 900 units.');
 const point=(x,y)=>{if(x< -80||x>d.bounds.width+80||y< -20||y>d.bounds.height+5)throw Error('Generated geometry falls outside the floor drawing area.');};
 for(const deck of d.decks){
  if(!deck.name.trim())throw Error('A floor caption is missing.');
  for(const w of deck.walls){point(w.x1,w.y1);point(w.x2,w.y2);if((w.x1!==w.x2&&w.y1!==w.y2)||(w.x1===w.x2&&w.y1===w.y2))throw Error('Walls must be independent horizontal or vertical lines.');}
  for(const a of deck.doors){point(a.x,a.y);point(a.x+a.ux,a.y+a.uy);point(a.x+a.vx,a.y+a.vy);if(Math.abs(Math.hypot(a.ux,a.uy)-24)>.001||Math.abs(Math.hypot(a.vx,a.vy)-24)>.001||Math.abs(a.ux*a.vx+a.uy*a.vy)>.001||a.ux*a.uy!==0||a.vx*a.vy!==0)throw Error('Door geometry must use perpendicular 24-unit vectors.');}
  for(const a of deck.labels){point(a.x,a.y);if(a.text.length>150)throw Error('A drawing label is too long.');if(a.area){point(a.area.x,a.area.y);point(a.area.x+a.area.w,a.area.y+a.area.h);if(a.area.w<=0||a.area.h<=0)throw Error('Invalid label centring area.');}}
  for(const a of deck.fixtures){point(a.x,a.y);if((a.type==='sinkBank'&&a.basinCount<1)||(a.type!=='sinkBank'&&a.basinCount!==0))throw Error('Invalid sink-bank count.');}
  for(const a of deck.stairs){point(a.x,a.y);point(a.x+a.w,a.y+a.h);if(a.w<=0||a.h<=0||(a.landing!=='none'&&(a.vertical?a.h:a.w)<48))throw Error('Stairs need a usable run and a separate landing.');}
 }
 for(const a of d.uncertainties)point(a.x,a.y);
 return d;
}
export function compileDraft(d,brief,id){
 validateDraft(d);validateIntake(brief);
 if(!/^user-[-a-z0-9]+$/.test(id))throw Error('Invalid new-project identity.');
 if(brief.floors===1&&['walls','doors','labels','fixtures','stairs'].some(k=>d.decks[1][k].length))throw Error('The generated draft adds an upper floor to a one-floor brief.');
 const theme=structuredClone(DEFAULT_THEME);theme.lines.detail=.95;theme.text.label=7.26;
 const p={version:1,editorRevision:1,coordinates:'drawing',id,name:brief.name.trim(),drawingRevision:'v1',length:brief.length??130,width:brief.beam??46,ink:'#343d40',header:'#343d40',paper:'#e9e3db',pageSize:'Original 11 × 17',wallWidth:theme.lines.wall,theme,bounds:d.bounds,reviewFlags:[],sources:[],sourceSummary:d.summary,notes:'Generated draft based on submitted evidence. Review flagged assumptions.',status:'Schematic · not to scale',generationInfo:{brief:structuredClone(brief),status:'draft'},revisionMeta:{label:'V1 · Generated draft',date:new Date().toISOString().slice(0,10),summary:'Generated from uploaded references and the shared VIFM drawing rules. Review uncertainty notes before client release.',changes:[]},decks:[]};
 for(const deck of d.decks){const prefix=deck.id,doors=deck.doors.map((a,i)=>({id:`${prefix}-door-${i}`,x:a.x,y:a.y,u:[a.ux,a.uy],v:[a.vx,a.vy]}));const clipping=doors.map(a=>({start:{x:a.x,y:a.y},end:{x:a.x+a.u[0],y:a.y+a.u[1]}}));
  const walls=deck.walls.flatMap(a=>cutWall(a,clipping)).map((a,i)=>({id:`${prefix}-wall-${i}`,role:a.role||'wall',...a}));
  const labels=deck.labels.map((a,i)=>({id:`${prefix}-label-${i}`,kind:a.role==='room'?'room':'label',textStyle:a.role,text:a.text,x:a.x,y:a.y,size:theme.text[a.role],align:a.align,...(a.area?{centerArea:a.area}:{})}));
  const details=deck.fixtures.map((a,i)=>({id:`${prefix}-fixture-${i}`,kind:'symbol',role:'detail',width:.95,type:a.type,x:a.x,y:a.y,rotation:a.rotation,scale:a.type==='muster'?.8:.6,...(a.type==='sinkBank'?{basinCount:a.basinCount}:{})}));
  for(const [i,a]of deck.stairs.entries()){const start=a.landing==='start',end=a.landing==='end',run={left:a.x,top:a.y,width:a.w,height:a.h,vertical:a.vertical};if(start||end)run.landing=a.vertical?{left:a.x,top:a.y+(end?a.h-36:0),width:a.w,height:36}:{left:a.x+(end?a.w-36:0),top:a.y,width:36,height:a.h};
   const edges=[{x1:a.x,y1:a.y,x2:a.x+a.w,y2:a.y},{x1:a.x+a.w,y1:a.y,x2:a.x+a.w,y2:a.y+a.h},{x1:a.x+a.w,y1:a.y+a.h,x2:a.x,y2:a.y+a.h},{x1:a.x,y1:a.y+a.h,x2:a.x,y2:a.y}];
   if(run.landing){const t=start?36:(a.vertical?a.h:a.w)-36;edges.push(a.vertical?{x1:a.x,y1:a.y+t,x2:a.x+a.w,y2:a.y+t}:{x1:a.x+t,y1:a.y,x2:a.x+t,y2:a.y+a.h});}
   const treads=stairTreads(run).map(t=>({x1:t.x,y1:t.y,x2:t.x+t.dx,y2:t.y+t.dy}));
   [...edges.flatMap(w=>cutWall(w,clipping)),...treads].forEach((w,j)=>details.push({id:`${prefix}-stair-${i}-${j}`,kind:'line',role:'detail',width:.95,...w}));
  }
  p.decks.push({id:prefix,name:deck.name,walls,doors,labels,details,annotations:[],rects:[],...(deck.id==='upper'&&!walls.length&&!doors.length&&!labels.length&&!details.length?{omitFromOutput:true}:{})});
 }
 p.reviewFlags=d.uncertainties.map((a,i)=>({id:`generated-${i+1}`,deckId:a.deckId,x:a.x,y:a.y,title:a.title,text:a.text+(a.referenceIds.length?'\nReferences: '+a.referenceIds.join(', '):'')}));
 const actual=p.decks.flatMap(d=>d.labels.filter(a=>a.kind==='room')).length;
 if(brief.rooms!==null&&actual!==brief.rooms)p.reviewFlags.push({id:'generated-room-count',deckId:'main',x:0,y:0,title:'Room count needs review',text:`The brief lists ${brief.rooms} rooms; the draft labels ${actual}. Resolve against the references rather than inventing rooms.`});
 if(brief.length===null||brief.beam===null)p.reviewFlags.push({id:'generated-dimensions',deckId:'main',x:0,y:35,title:'Dimensions not established',text:'Unknown vessel dimensions remain unknown. The working drawing envelope is schematic; its proportions are not measured dimensions.'});
 const maxWidth=p.decks.some(d=>d.omitFromOutput)?700:350;for(const deck of p.decks){const b=draftHorizontalExtent(deck,p);if(b.right-b.left>maxWidth)throw Error('The generated floor is too wide for the page. Ask for a narrower layout in the intake details, then generate again.');}
 return validateEditorProject(p);
}
