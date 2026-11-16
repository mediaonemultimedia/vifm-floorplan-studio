import fs from 'node:fs';
import path from 'node:path';
import {drawing} from '../render.js';
const [sourceImage,outputDirectory]=process.argv.slice(2);
if(!sourceImage||!outputDirectory)throw Error('Usage: node scripts/build-odyssey-bedroom-sketch.mjs source-review.png output-directory');
fs.mkdirSync(outputDirectory,{recursive:true});
const p=JSON.parse(fs.readFileSync(new URL('../assets/revisions/odyssey102-v3.json',import.meta.url)));
p.ink=p.header='#343d40';p.paper='#ffffff';p.theme.lines={wall:1.1,secondary:.8,detail:.65,threshold:.9,dash:1.6};p.wallWidth=1.1;
p.decks[0].labels=p.decks[0].labels.filter(a=>a.id==='main-label-42');p.decks[0].annotations=[];p.decks[0].rects=[];
let block=drawing(p).replace('viewBox="0 0 792 1224" width="792" height="1224"','viewBox="51 798 310 292" width="930" height="876"');
for(const file of ['LibreFranklin-Medium.ttf','LibreFranklin-Bold.ttf'])block=block.replace(`url('assets/${file}')`,`url('data:font/ttf;base64,${fs.readFileSync(new URL('../assets/'+file,import.meta.url)).toString('base64')}')`);
const blockFile=path.join(outputDirectory,'ODYSSEY-102-eight-bedroom-detail-v3.svg');fs.writeFileSync(blockFile,block);
const source=fs.readFileSync(sourceImage).toString('base64'),bedrooms=Buffer.from(block).toString('base64');
const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="2500" height="3500" viewBox="0 0 2500 3500"><rect width="2500" height="3500" fill="white"/><image href="data:image/png;base64,${source}" width="2500" height="3500"/>
<rect x="0" y="0" width="2500" height="118" fill="white"/><text x="80" y="72" font-family="Arial,sans-serif" font-size="46" font-weight="bold" fill="#26332f">ODYSSEY 102 — EIGHT-ROOM CORRECTION</text><text x="80" y="111" font-family="Arial,sans-serif" font-size="25" fill="#26332f">Bedroom block corrected to four rooms per side. Other sketch regions retained.</text>
<rect x="80" y="2320" width="1080" height="1180" fill="white"/><image href="data:image/svg+xml;base64,${bedrooms}" x="182" y="2320" width="800" height="754"/>
<text x="80" y="3290" font-family="Arial,sans-serif" font-size="25" fill="#26332f">8 BEDROOMS · 4 LEFT / 4 RIGHT</text><text x="80" y="3330" font-family="Arial,sans-serif" font-size="24" fill="#26332f">Bed at doorway end; desk at the other end.</text><text x="80" y="3370" font-family="Arial,sans-serif" font-size="24" fill="#26332f">Closet opposite the doorway on the hallway wall.</text><text x="80" y="3440" font-family="Arial,sans-serif" font-size="23" fill="#26332f">Corrected bedroom geometry shared with Studio V3. Remaining sketch areas are reference only.</text></svg>`;
fs.writeFileSync(path.join(outputDirectory,'ODYSSEY-102-corrected-sketch-v3.svg'),svg);console.log('Wrote corrected sketch and eight-room detail to',outputDirectory);
