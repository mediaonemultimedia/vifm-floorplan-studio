import {test} from 'node:test';
import assert from 'node:assert/strict';
import {MIN_ZOOM,MAX_ZOOM,clampZoom,selectionZoom,zoomScrollTarget} from '../zoom.js';
test('shared canvas zoom accepts 400 percent and clamps every entry route to the same limits',()=>{
 assert.equal(MAX_ZOOM,4);assert.equal(MIN_ZOOM,.25);assert.equal(clampZoom(4),4);assert.equal(clampZoom(6),4);assert.equal(clampZoom(.1),.25);
});
test('marquee zoom fits either drag direction and centres the same drawing area',()=>{
 const a=selectionZoom({x:100,y:200},{x:300,y:500},{width:700,height:500});
 const b=selectionZoom({x:300,y:500},{x:100,y:200},{width:700,height:500});assert.deepEqual(a,b);assert.deepEqual(a.point,{x:200,y:350});assert.ok(a.zoom*300<=500-48);assert.ok(a.zoom*200<=700-48);
});
test('small boxes stop at 400 percent and zero-area clicks are handled separately',()=>{
 assert.equal(selectionZoom({x:0,y:0},{x:10,y:10},{width:700,height:500}).zoom,4);
 assert.equal(selectionZoom({x:0,y:0},{x:0,y:0},{width:700,height:500}),null);
 assert.equal(selectionZoom({x:0,y:0},{x:0,y:20},{width:700,height:500}),null);
});
test('zoom scroll centres the selected point even when the sheet was auto-centred or already scrolled',()=>{
 const target=zoomScrollTarget({x:32,y:32},{x:400,y:700},4,{x:350,y:250});assert.deepEqual(target,{left:1282,top:2582});
 const centred=zoomScrollTarget({x:150,y:32},{x:100,y:100},1,{x:350,y:250});assert.deepEqual(centred,{left:0,top:0});
});
