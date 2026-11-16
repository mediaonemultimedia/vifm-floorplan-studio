// V6 applies LAYOUT-LOGIC.md to the V5 drawing: stacked exterior walls, one stair
// footprint per floor pair, enclosed rooms with doors, and the brief's named spaces.
const W=328.54615384615386,PAD_L=11.273076923076928,PAD_R=317.27307692307693;
const wall=(id,x1,y1,x2,y2)=>({id,role:'wall',x1,y1,x2,y2});
const label=(id,text,area,style='detail',size=4.675,rotation=0)=>({id,kind:'label',text,x:area.x+area.w/2,y:area.y+area.h/2+size*.35,size,align:'middle',rotation,textStyle:style,centerArea:area});
function edit(list,id,change){const a=list.find(x=>x.id===id);if(!a)throw Error(`V6 expects ${id} in V5.`);Object.assign(a,typeof change==='function'?change(a):change);return a;}
function drop(list,...ids){for(const id of ids){const i=list.findIndex(x=>x.id===id);if(i<0)throw Error(`V6 expects ${id} in V5.`);list.splice(i,1);}}
const shift=(a,dx=0,dy=0)=>{for(const k of ['x','x1','x2'])if(a[k]!==undefined)a[k]+=dx;for(const k of ['y','y1','y2'])if(a[k]!==undefined)a[k]+=dy;if(a.centerArea)a.centerArea={...a.centerArea,x:a.centerArea.x+dx,y:a.centerArea.y+dy};return a;};
export function applyOdysseyLayoutV6(input){
 const p=structuredClone(input),[lo,up]=p.decks,labelSize=p.theme.text.label;
 // Lower · the fuel-store wall (review note 27) now meets the rear wall; the corridor end closes on the stair entry.
 edit(lo.walls,'main-fuel-separation-0',{y1:36});
 edit(lo.walls,'main-central-upper-entry-wall-0',{x1:135.52307692307693});
 edit(lo.walls,'main-central-upper-entry-wall-1',{x2:180.42307692307693});
 // Review note 22: the short centre flight ends at a door that opens out, away from its landing.
 edit(lo.doors,'main-stair-a-entry',{v:[0,-24]});
 edit(lo.labels,'main-label-18',{y:300});
 // Utility room is enclosed: its 24-unit gap becomes a door, and the exit moves down so the room closes.
 edit(lo.walls,'main-utility-entry-lower',{y2:498});
 lo.walls.push(wall('main-utility-bottom',226.32307692307694,498,W,498));
 lo.doors.push({id:'main-utility-entry',x:226.32307692307694,y:454.75,u:[0,24],v:[24,0]});
 edit(lo.walls,'main-starboard-perimeter-0',{y2:498});
 edit(lo.walls,'main-starboard-perimeter-1',{y1:522});
 edit(lo.doors,'main-utility-exit',{y:498});
 edit(lo.labels,'main-label-26',a=>({y:a.y+11.5}));
 lo.labels.push(label('main-dry-room-label','DRY ROOM',{x:128.57307692307694,y:407.5,w:67.15,h:40},'label',labelSize));
 for(const d of [lo,up]){const prefix=d===lo?'main':'upper-accommodation';d.labels.push(label(`${prefix}-washroom-label`,'WASHROOM',{x:88,y:567,w:42.27,h:28}));}
 // Upper · walls stack on the 46 ft lower walls and the pad edge stays flush with them (review note 7).
 edit(up.walls,'upper-port-perimeter-0',{x1:0,x2:0,y2:542.6});
 edit(up.walls,'upper-starboard-perimeter-0',{x1:W,x2:W,y2:542.6});
 edit(up.walls,'upper-rear-perimeter-0',{x1:0,x2:W});
 edit(up.labels,'upper-label-0',a=>({x:W/2,centerArea:{...a.centerArea,x:0,w:W}}));
 drop(up.walls,'upper-foyer-port-step','upper-foyer-port-link','upper-foyer-starboard-step','upper-foyer-starboard-link');
 edit(up.walls,'upper-pad-left-front-0',{x1:0});
 edit(up.walls,'upper-pad-right-front-1',{x2:W});
 edit(up.walls,'upper-office-bottom-0',{x2:W});
 edit(up.walls,'upper-utility-bottom-0',{x1:0});
 edit(up.walls,'upper-desk-room-bottom-0',{x1:0});
 const officeDx=(W-PAD_R)/2;
 for(const id of ['upper-detail-1','upper-detail-2','upper-office-chair'])shift(edit(up.details,id,{}),officeDx);
 for(const id of ['upper-label-1','upper-label-2'])shift(edit(up.labels,id,{}),officeDx);
 edit(up.labels,'upper-label-3',a=>({x:(189.77307692307693+W)/2,centerArea:{...a.centerArea,w:W-189.77307692307693}}));
 // Pump sits against the outer wall it serves; its label moves inside the building.
 shift(edit(up.details,'upper-detail-28',{}),-PAD_L);
 edit(up.labels,'upper-label-6',{x:15.6+4.675*.35,y:296.15,centerArea:{x:11.6,y:288.5,w:8,h:15.3}});
 // First aid: the desk, cabinet and sink room.
 shift(edit(up.details,'upper-detail-30',{}),-PAD_L);shift(edit(up.labels,'upper-label-8',{}),-PAD_L);
 up.labels.push(label('upper-first-aid-label','FIRST AID',{x:22.1,y:375,w:89.5,h:71},'label',labelSize));
 drop(up.walls,'upper-stair-side-return-0','upper-stair-platform-bottom-0','upper-stair-platform-bottom-0-1','upper-weight-room-bottom-0','upper-weight-room-bottom-0-1');
 drop(up.doors,'upper-corridor-connection');
 // Review note 11: the weight room runs deeper than first aid, and the stair top leads straight into it.
 up.walls.push(wall('upper-weight-room-side-0',138.77307692307693,446,138.77307692307693,470),wall('upper-weight-room-side-1',138.77307692307693,494,138.77307692307693,510),
  wall('upper-weight-room-bottom-0',138.77307692307693,510,188.07307692307694,510),wall('upper-weight-room-step-0',188.07307692307694,510,188.07307692307694,542.6));
 up.doors.push({id:'upper-weight-room-entry',x:138.77307692307693,y:494,u:[0,-24],v:[24,0]});
 edit(up.labels,'upper-label-10',{centerArea:{x:138.77307692307693,y:351,w:W-138.77307692307693,h:191.6},x:(138.77307692307693+W)/2,y:446.8+labelSize*.35});
 // Lounge: open seating at the top of the stair, between first aid and the washrooms.
 up.details.push({id:'upper-lounge-couch',kind:'rect',role:'secondary',width:1,x:54.6,y:449.5,w:29.5,h:15});
 up.labels.push(label('upper-lounge-couch-label','COUCH',{x:54.6,y:449.5,w:29.5,h:15}));
 up.labels.push(label('upper-lounge-label','LOUNGE',{x:0,y:464.5,w:138.77307692307693,h:35},'label',labelSize));
 // Stair d keeps the lower footprint; its top lands in the open stair hall.
 for(const a of up.details.filter(a=>a.id.startsWith('upper-stair-d-'))){
  if(/landing-top|walkway/.test(a.id))continue;
  for(const k of ['y1','y2'])if(a[k]!==undefined)a[k]=a[k]===480?512:a[k]===510?542.6:a[k]===495?527.3:a[k];
 }
 drop(up.details,'upper-stair-d-landing-top','upper-stair-d-walkway-top','upper-stair-d-walkway-bottom');
 edit(up.labels,'upper-label-11',{y:506});
 // An upper door never opens onto a drop: the copied forward exit closes until a stair is confirmed.
 drop(up.doors,'upper-accommodation-forward-exit');drop(up.labels,'upper-accommodation-label-42');
 up.walls.push(wall('upper-forward-wall-closure',152.27307692307693,928.5,176.27307692307693,928.5));
 p.reviewFlags=p.reviewFlags.filter(f=>f.id!=='odyssey-v5-upper-connection').concat([
  {id:'odyssey-v6-lounge-first-aid',deckId:'upper',x:258,y:494,title:'Lounge and first aid placed by logic',text:'The brief puts a lounge and first aid upstairs; the sketch shows neither. First aid is the desk/cabinet/sink room. The lounge is open seating at the top of the accommodation stair, which keeps the weight room deeper than first aid (review note 11). Confirm or say where they really are.'},
  {id:'odyssey-v6-envelope',deckId:'upper',x:6,y:300,title:'Helipad drawn 46 ft wide',text:'Upper walls now sit on the 46 ft lower walls, and the pad edge lines up with them (review note 7). The sketch marks the pad 43 ft across. If the upper floor is really 43 ft wide, the whole upper level steps in 1.5 ft each side instead.'},
  {id:'odyssey-v6-fuel-access',deckId:'main',x:254,y:170,title:'Fuel tank bay has no door',text:'The tank bay is closed on all sides (review note 27 added its front wall). How is it reached: from the rear platform, from the MIXED/STRAIGHT GAS area, or is it open-top?'},
  {id:'odyssey-v6-upper-exit',deckId:'upper',x:164.3,y:920,title:'Upper forward exit removed',text:'The repeated block copied the lower forward exit, which opened onto a drop upstairs. It is closed until an external stair or deck is confirmed.'},
  {id:'odyssey-v6-central-stair',deckId:'upper',x:159.2,y:318,title:'Centre stair: one stair or two?',text:'Lower plan: a short flight up to a landing and an outward door (review note 22). Upper plan: a full flight down from the pad. One footprint cannot be both. Is the upper flight a separate stair, and where does it land?'}
 ]);
 return p;
}
