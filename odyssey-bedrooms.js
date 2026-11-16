import {cutWall} from './wall-lines.js';
// One confirmed layout supplies both the review sketch and the editable project.
export const ODYSSEY_BEDROOM_BLOCK={top:578,bottom:829.6,leftHall:119,rightHall:187,width:306,rows:4};
export function odysseyBedrooms(){
 const b=ODYSSEY_BEDROOM_BLOCK,height=(b.bottom-b.top)/b.rows;
 return Array.from({length:b.rows},(_,row)=>['L','R'].map(side=>{
  const top=b.top+row*height,bottom=top+height,atTop=row%2===0,left=side==='L',outerX=left?6.8:255;
  const bed={x:outerX,y:atTop?top+7.65:bottom-7.65-20.4,w:44.2,h:20.4};
  const desk={x:left?6.8:265.2,y:atTop?bottom-5.95-10.2:top+5.95,w:34,h:10.2};
  return {id:side+(row+1),row,side,top,bottom,door:{x:left?119:187,y:atTop?top+5.95:bottom-5.95,u:[0,atTop?24:-24],v:[left?-24:24,0]},bed,
   pillow:{x:left?9.35:288.15,y:bed.y+2.55,w:8.5,h:15.3},desk,
   closet:{x:left?103.7:187,y:atTop?bottom-5.95-22.95:top+5.95,w:15.3,h:22.95},
   chair:{x:desk.x+desk.w/2,y:atTop?desk.y-8.05:desk.y+desk.h+8.05,rotation:atTop?180:0},
   labelArea:{x:left?51:204,y:top,w:51,h:height}};
 })).flat();
}
export function applyEightBedroomLayout(input){
 const p=structuredClone(input),d=p.decks[0],b=ODYSSEY_BEDROOM_BLOCK,rooms=odysseyBedrooms();
 const previousBottom=p.bounds.height;p.bounds.height=b.bottom;
 for(const w of d.walls)for(const key of ['y1','y2'])if(w[key]===previousBottom)w[key]=b.bottom;
 for(const a of d.doors)if(a.id==='main-forward-exit')a.y=b.bottom;
 const exit=d.labels.find(a=>a.id==='main-label-42');if(exit)exit.y-=previousBottom-b.bottom;
 d.walls=d.walls.filter(a=>!a.id.startsWith('main-bedroom-'));
 d.doors=d.doors.filter(a=>!/^main-door-(9|1[0-8])$/.test(a.id)&&!a.id.startsWith('main-bedroom-door-'));
 d.details=d.details.filter(a=>!/^main-detail-(11[6-9]|1[2-5][0-9]|16[0-5])$/.test(a.id)&&!a.id.startsWith('main-chair-')&&!a.id.startsWith('main-bedroom-'));
 const oldLabels=d.labels.filter(a=>a.kind==='room');d.labels=d.labels.filter(a=>a.kind!=='room');
 const walls=[];
 for(const [side,x] of [['L',b.leftHall],['R',b.rightHall]])walls.push({id:`main-bedroom-corridor-${side}`,role:'wall',x1:x,y1:b.top,x2:x,y2:b.bottom});
 for(let i=0;i<b.rows;i++)for(const side of ['L','R'])walls.push({id:`main-bedroom-divider-${side}${i}`,role:'wall',x1:side==='L'?0:b.rightHall,y1:b.top+i*(b.bottom-b.top)/b.rows,x2:side==='L'?b.leftHall:b.width,y2:b.top+i*(b.bottom-b.top)/b.rows});
 for(const r of rooms){
  d.doors.push({id:'main-bedroom-door-'+r.id,...r.door});
  for(const role of ['bed','pillow','desk','closet'])d.details.push({id:`main-bedroom-${role}-${r.id}`,kind:'rect',role:'secondary',width:1,...r[role]});
  d.details.push({id:'main-chair-'+r.id,kind:'symbol',role:'detail',width:1,type:'deskChair',scale:.55,...r.chair});
  const old=oldLabels[r.row*2+(r.side==='R'?1:0)];
  d.labels.push({...old,text:r.id,x:r.labelArea.x+r.labelArea.w/2,y:(r.top+r.bottom)/2,align:'middle',centerArea:r.labelArea});
 }
 const gaps=rooms.map(r=>({start:{x:r.door.x,y:r.door.y},end:{x:r.door.x+r.door.u[0],y:r.door.y+r.door.u[1]}}));
 d.walls.push(...walls.flatMap(a=>cutWall(a,gaps).map((w,i)=>({...w,id:a.id+'-'+i}))));
 return p;
}
