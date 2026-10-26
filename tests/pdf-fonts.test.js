import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {jsPDF} from 'jspdf';
import {setPDFFontNames} from '../export.js';

test('PDF font identities match the supplied Medium and Bold PostScript names',()=>{
 const pdf=new jsPDF({putOnlyUsedFonts:true});
 for(const [style,file] of [['normal','LibreFranklin-Medium.ttf'],['bold','LibreFranklin-Bold.ttf']]){
  pdf.addFileToVFS(file,readFileSync(new URL('../assets/'+file,import.meta.url)).toString('base64'));
  pdf.addFont(file,'LibreFranklin',style);pdf.setFont('LibreFranklin',style);pdf.text('BARCO 99',10,style==='normal'?10:20);
 }
 setPDFFontNames(pdf);
 const output=pdf.output();
 for(const name of ['LibreFranklin-Medium','LibreFranklin-Bold']){
  assert.ok(output.includes('/BaseFont /'+name+'\n'));
  assert.ok(output.includes('/FontName /'+name+'\n'));
 }
 assert.ok(!output.includes('/BaseFont /LibreFranklin\n'));
});
