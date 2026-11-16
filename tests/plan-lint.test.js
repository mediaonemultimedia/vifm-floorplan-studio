import {test} from 'node:test';
import assert from 'node:assert/strict';
import {lintProject} from '../plan-lint.js';
// A deliberately broken two-floor box: each block below plants one mistake per rule.
const w=(id,x1,y1,x2,y2)=>({id,role:'wall',x1,y1,x2,y2});
function broken(){
 const box=p=>[w(p+'top',0,0,100,0),w(p+'left',0,0,0,200),w(p+'right',100,0,100,200),w(p+'bottom-0',0,200,40,200),w(p+'bottom-1',64,200,100,200)];
 const lower={id:'main',name:'LOWER',walls:[...box('l-'),w('l-part-0',0,100,50,100),w('l-part-1',50,101.5,100,101.5),w('l-stub',30,150,30,170)],
  doors:[{id:'l-door',x:40,y:200,u:[24,0],v:[0,24]},{id:'l-floating',x:60,y:50,u:[24,0],v:[0,24]}],
  details:[{id:'main-stair-a-left',kind:'line',x1:10,y1:20,x2:10,y2:60},{id:'main-stair-a-right',kind:'line',x1:30,y1:20,x2:30,y2:60},{id:'main-stair-a-arrow',kind:'stairArrow',x1:20,y1:55,x2:20,y2:25}],
  labels:[{id:'l-out',kind:'label',text:'PUMP',x:-10,y:50}],annotations:[],rects:[]};
 const upper={id:'upper',name:'UPPER',walls:[w('u-top',8,0,92,0),w('u-left',8,0,8,200),w('u-right',92,0,92,200),w('u-bottom-0',8,200,40,200),w('u-bottom-1',64,200,92,200)],
  doors:[{id:'u-exit',x:40,y:200,u:[24,0],v:[0,24]}],
  details:[{id:'upper-stair-a-left',kind:'line',x1:10,y1:40,x2:10,y2:80},{id:'upper-stair-a-right',kind:'line',x1:30,y1:40,x2:30,y2:80}],labels:[],annotations:[],rects:[]};
 return {coordinates:'drawing',bounds:{width:100,height:200},theme:{lines:{wall:2}},decks:[lower,upper]};
}
test('each rule fires on its planted mistake',()=>{
 const codes=new Set(lintProject(broken(),{decks:{upper:{rooms:1,spaces:['LOUNGE']}}}).map(i=>i.code));
 for(const code of ['datum','open-end','door-floating','upper-exit-drop','stair-arrow','stair-stack','envelope','label-outside','inventory'])assert.ok(codes.has(code),code);
});
test('a door swinging into a wall is caught',()=>{
 const p=broken();p.decks[0].walls.push(w('l-blocker',52,205,52,230));
 assert.ok(lintProject(p).some(i=>i.code==='swing-wall'));
});
test('accepted exceptions are reported but marked accepted',()=>{
 const issues=lintProject(broken(),{exceptions:[{code:'envelope',match:'.',reason:'pad'}]});
 assert.ok(issues.filter(i=>i.code==='envelope').every(i=>i.severity==='accepted'));
});
