export const PALETTE=[
 {name:'AMIX · Teal',ink:'#25585b',header:'#24585a',original:true},
 {name:'HELI · Forest',ink:'#18331e',header:'#19331f',original:true},
 {name:'FOSS · Navy',ink:'#0e3e51',header:'#0e3e51',original:true},
 {name:'RAINIER · Burgundy',ink:'#641a22',header:'#641a22',original:true},
 {name:'Tidal blue',ink:'#28596b'}, {name:'Cedar',ink:'#3d4c34'},
 {name:'Slate',ink:'#465963'}, {name:'Charcoal',ink:'#343d40'},
 {name:'Ochre',ink:'#795e2e'}, {name:'Clay',ink:'#874a38'},
 {name:'Aubergine',ink:'#503b52'}, {name:'Moss',ink:'#52633e'},
 {name:'Harbour',ink:'#235360'}, {name:'Petrol',ink:'#1c4b46'}
];
export const COLORS={ink:'#25585b',header:'#24585a',paper:'#e9e3db',accent:'#f05024'};
const label=(text,x,y,kind='label',size=8)=>({id:crypto.randomUUID(),text,x,y,kind,size});
export function createProject(){
 const mainRooms=[['8',35,90],['9',100,65],['10',173,65],['11',268,95],['12',268,193],['13',268,280],['14',202,280],['6',130,280],['5',35,270],['7',35,170]];
 const upperRooms=[['18',35,90],['19',100,65],['20',173,65],['21',268,95],['22',268,193],['23',268,280],['24',202,280],['16',130,280],['15',35,270],['17',35,170],['4',350,310],['3',402,310],['2',452,310],['1',502,310]];
 const mainPaths=['M0 37H294V312H0 M0 132H61 M0 230H61','M61 37V101 M61 132V211 M61 230V312','M140 37V93 M202 37V93','M88 165V93H202V165','M88 200V238H202V200','M88 252V312 M154 238V312 M214 252V312','M230 76V133H294 M230 169V229H294 M230 261V312','M88 195H101 M126 195H136 M151 195H163 M180 195H189 M201 195H202','M112 195V238 M140 195V238 M164 195V238 M190 195V238','M320 0V249H353 M359 0V204 M359 241V253H410V140 M404 0V84 M484 0V249H429 M484 86H520V278','M320 312V353 M320 278H420 M436 278H466 M482 278H544 M359 293V353 M402 293V353 M448 293V353 M502 293V353','M544 278V353 M544 278H704','M0 312H72 M96 312H294','M88 312V353'];
 const upPaths=['M0 37H294V312H0 M0 132H61 M0 230H61','M61 37V101 M61 132V211 M61 230V312','M140 37V93 M202 37V93','M88 120V93H202V120','M88 165V190 M88 215V238H202V215 M202 190V165','M88 238H202','M112 93V137H152V93 M88 137H152 M164 93V137H202','M88 252V312 M154 238V312 M214 252V312','M230 76V133H294 M230 169V229H294 M230 261V312','M320 0V249H353 M359 0V204 M359 241V253H410V140 M404 0V84 M484 0V249H429 M484 86H520V278','M320 278H335 M351 278H386 M402 278H437 M453 278H488 M504 278H520','M320 278V353 M371 278V353 M422 278V353 M473 278V353 M520 278V353','M544 278V353 M544 278H704','M0 312H72 M96 312H294'];
 return {version:1,name:'BARCO 99',ink:COLORS.ink,header:COLORS.header,length:150,width:44,status:'Schematic · not to scale',specRooms:23,sourceOfTruth:'Supplied drawing plans',pageSize:'Original 11 × 17',paper:COLORS.paper,showLegend:true,showDimensions:true,wallWidth:1.6,notes:'Layout follows supplied drawing plans. Internal dimensions are unverified.',decks:[{id:'main',name:'MAIN DECK (LEVEL 1)',paths:mainPaths,labels:[...mainRooms.map(r=>label(...r,'room',19.53)),label('COOK HOUSE',435,48),label('LAUNDRY /\nSTORAGE',342,320,'label',6),label('BATHROOM',380,320,'label',6),label('OFFICE',424,320,'label',7),label('FIRST AID',475,320,'label',6),label('DRY ROOM ABOVE\nGENERATOR BELOW',615,316,'label',6),label('WASHROOMS',145,218,'label',6),label('LAUNDRY',145,104,'label',6)],annotations:[],rects:[]},{id:'upper',name:'SECOND FLOOR (LEVEL 2)',paths:upPaths,labels:[...upperRooms.map(r=>label(...r,'room',19.53)),label('COOK HOUSE',435,48),label('WASHROOMS',145,113,'label',6),label('LAUNDRY',145,230,'label',6),label('DRY ROOM',620,316,'label',8)],annotations:[],rects:[]}]};
}
export function planPoint(x,y,p){return {x:y*(900*p.width/p.length)/353,y:x<=294?900-x*520/294:(704-x)*380/410};}
export function sourcePoint(x,y,p){return {x:y>=380?(900-y)*294/520:704-y*410/380,y:x*353/(900*p.width/p.length)};}
export function resizeHull(p,length,width){if(!Number.isFinite(length)||!Number.isFinite(width)||length<50||length>300||width<15||width>70||width/length>.4)throw Error('Use a length of 50–300 ft, width of 15–70 ft, and width ≤ 40% of length.');return {...p,length,width};}
export const escapeXML=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
export function validateProject(p){
 const finite=(n,min,max)=>typeof n==='number'&&Number.isFinite(n)&&n>=min&&n<=max;
 if(!p||p.version!==1||typeof p.name!=='string'||p.name.length>100||!Array.isArray(p.decks)||p.decks.length!==2)throw Error('This is not a supported floorplan project.');
 resizeHull(p,p.length,p.width);
 p.ink??=COLORS.ink;p.header??=COLORS.header;
 if(!/^#[0-9a-f]{6}$/i.test(p.ink)||!/^#[0-9a-f]{6}$/i.test(p.header))throw Error('Invalid drawing colour.');
 if(!/^#[0-9a-f]{6}$/i.test(p.paper)||!finite(p.wallWidth,.5,5)||typeof p.notes!=='string'||p.notes.length>1000||p.status!=='Schematic · not to scale')throw Error('Invalid drawing settings.');
 if(!['Original 11 × 17','A3','Letter'].includes(p.pageSize))throw Error('Invalid page size.');
 const ids=new Set();
 for(const [i,d] of p.decks.entries()){
  if(d.id!==['main','upper'][i]||typeof d.name!=='string'||d.name.length>100||!Array.isArray(d.paths)||d.paths.length>300||d.paths.some(x=>typeof x!=='string'||x.length>5000||!/^[MHVZ0-9.,+\s-]+$/.test(x)))throw Error('Invalid walls.');
  for(const key of ['labels','annotations','rects'])if(!Array.isArray(d[key])||d[key].length>500)throw Error('Too many drawing elements.');
  for(const a of [...d.labels,...d.annotations,...d.rects]){
   if(a.align!==undefined&&!['start','middle','end'].includes(a.align))throw Error('Invalid label alignment.');
   if(typeof a.id!=='string'||ids.has(a.id)||!finite(a.x,-100,804)||!finite(a.y,-100,453))throw Error('Invalid drawing element.');ids.add(a.id);
   if(a.kind==='rect'){if(!finite(a.w,1,704)||!finite(a.h,1,353))throw Error('Invalid room size.');}
   else if(!['label','room','text','arrow','firstaid','muster'].includes(a.kind)||typeof a.text!=='string'||a.text.length>200||!finite(a.size,4,30))throw Error('Invalid label.');
  }
 }
 return p;
}
export function translateWall(path,dx,dy){
 if(!Number.isFinite(dx)||!Number.isFinite(dy)||/[^MHV0-9.,\s+-]/.test(path))throw Error('This wall cannot be moved.');
 return path.replace(/([MHV])([^MHV]*)/g,(_,command,args)=>{
  const values=args.trim().split(/[\s,]+/).map(Number);if(values.some(v=>!Number.isFinite(v)))throw Error('Invalid wall.');
  return command+values.map((v,i)=>Number((v+(command==='H'?dx:command==='V'?dy:i%2===0?dx:dy)).toFixed(3))).join(' ');
 });
}

export function doorPath(x,y,r,side){return `M${x} ${y}V${y-side*r} M${x} ${y-side*r}A${r} ${r} 0 0 ${side===1?1:0} ${x+r} ${y}`;}
export function planPath(path,p){let x=0,y=0;return path.replace(/([MHVZ])([^MHVZ]*)/g,(_,cmd,args)=>{
 if(cmd==='Z')return 'Z';const values=args.trim().split(/[\s,]+/).map(Number);let out='';
 const point=()=>{const q=planPoint(x,y,p);return `${Number(q.x.toFixed(3))} ${Number(q.y.toFixed(3))}`;};
 if(cmd==='M'){for(let i=0;i<values.length;i+=2){x=values[i];y=values[i+1];out+=(i?'L':'M')+point();}}
 else for(const v of values){if(cmd==='H')x=v;else y=v;out+='L'+point();}return out;
});}
