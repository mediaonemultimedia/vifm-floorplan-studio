// Uncompressed ZIPs preserve already-compressed photos, PDFs and videos. CRCs
// are read a chunk at a time; the final Blob reuses the original File objects.
const encoder=new TextEncoder();
const crcTable=Uint32Array.from({length:256},(_,value)=>{for(let i=0;i<8;i++)value=value&1?0xedb88320^(value>>>1):value>>>1;return value>>>0;});
const abort=signal=>{if(signal?.aborted)throw new DOMException('Aborted','AbortError');};
async function checksum(blob,signal){
 let crc=0xffffffff,processed=0;const reader=blob.stream().getReader();
 try{while(true){abort(signal);const {value,done}=await reader.read();if(done)break;for(const byte of value)crc=crcTable[(crc^byte)&255]^(crc>>>8);processed+=value.length;if(processed>=8*1024*1024){processed=0;await new Promise(resolve=>setTimeout(resolve,0));}}}finally{if(signal?.aborted)await reader.cancel();reader.releaseLock();}
 return (crc^0xffffffff)>>>0;
}
function header(size,signature){const bytes=new Uint8Array(size);const view=new DataView(bytes.buffer);view.setUint32(0,signature,true);return {bytes,view};}
export async function zipFiles(entries,{signal,onProgress=()=>{}}={}){
 if(entries.length>65535)throw Error('Too many files in the handoff.');
 const names=new Set();
 for(const {name,blob}of entries){if(typeof name!=='string'||!name||/[\\:\u0000-\u001f]/.test(name)||name.startsWith('/')||name.split('/').some(p=>!p||p==='.'||p==='..'))throw Error('Invalid archive path.');if(names.has(name))throw Error('Duplicate archive path.');names.add(name);if(!(blob instanceof Blob)||blob.size>0xffffffff||encoder.encode(name).length>65535)throw Error('A handoff file is too large or invalid.');}
 const parts=[],directory=[];let offset=0;
 for(const [i,{name,blob}]of entries.entries()){
  abort(signal);onProgress(i+1,entries.length,name);
  const filename=encoder.encode(name),crc=await checksum(blob,signal),local=header(30,0x04034b50),central=header(46,0x02014b50);
  local.view.setUint16(4,20,true);local.view.setUint16(6,0x800,true);local.view.setUint16(12,0x21,true);local.view.setUint32(14,crc,true);local.view.setUint32(18,blob.size,true);local.view.setUint32(22,blob.size,true);local.view.setUint16(26,filename.length,true);
  central.view.setUint16(4,20,true);central.view.setUint16(6,20,true);central.view.setUint16(8,0x800,true);central.view.setUint16(14,0x21,true);central.view.setUint32(16,crc,true);central.view.setUint32(20,blob.size,true);central.view.setUint32(24,blob.size,true);central.view.setUint16(28,filename.length,true);central.view.setUint32(42,offset,true);
  parts.push(local.bytes,filename,blob);directory.push(central.bytes,filename);offset+=30+filename.length+blob.size;
  if(offset>0xffffffff)throw Error('The handoff is too large for a ZIP archive.');
 }
 abort(signal);const size=directory.reduce((sum,part)=>sum+part.length,0),end=header(22,0x06054b50);
 end.view.setUint16(8,entries.length,true);end.view.setUint16(10,entries.length,true);end.view.setUint32(12,size,true);end.view.setUint32(16,offset,true);
 return new Blob([...parts,...directory,end.bytes],{type:'application/zip'});
}
