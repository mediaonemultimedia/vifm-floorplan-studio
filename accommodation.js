// One shared accommodation structure for rooms 5–14 / 15–24.
// Coordinates retain the source drawing's orientation; they are not measurements.
export const ACCOMMODATION={leftBacking:125,rightBacking:256,mainStallFront:190};
const BASE_ROOMS={5:[0,230,61,82],6:[88,256,66,56],7:[0,132,61,98],8:[0,37,61,95],9:[61,37,79,88],10:[140,37,62,88],11:[230,37,64,96],12:[230,133,64,96],13:[230,229,64,83],14:[154,256,60,56]};
export function accommodationRooms(deckId){return Object.fromEntries(Object.entries(BASE_ROOMS).map(([number,box])=>[Number(number)+(deckId==='upper'?10:0),box]));}
export const ACCOMMODATION_PATHS=[
 'M0 37H294V312H0 M0 132H61 M0 230H61',
 'M61 37V312',
 'M140 37V125 M202 37V125',
 'M88 125H202 M88 125V155 M202 125V155',
 'M88 256H214 M88 256V312 M154 256V312 M214 256V312',
 'M230 37V312 M230 133H294 M230 229H294'
];
export function isAccommodationPath(path){let x=0,y=0,inside=true;path.replace(/([MHV])([^MHV]*)/g,(_,command,args)=>{const values=args.trim().split(/[ ,]+/).map(Number);if(command==='M'){x=values[0];y=values[1];inside&&=x<=294&&y<=312;}else for(const n of values){if(command==='H')x=n;else y=n;inside&&=x<=294&&y<=312;}return '';});return inside;}
