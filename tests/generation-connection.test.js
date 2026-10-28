import {test} from 'node:test';
import assert from 'node:assert/strict';
import {connectionAccess,saveConnection,forgetRememberedAccess,disconnectConnection} from '../generation-connection.js';

const storage=()=>{const values=new Map();return {getItem:key=>values.get(key)??null,setItem:(key,value)=>values.set(key,String(value)),removeItem:key=>values.delete(key)};};
const endpoint='https://generator.example.workers.dev';
const access='fictional-access-code-for-unit-tests';

test('connection code is session-only unless remembering is explicitly selected',()=>{
 const local=storage(),session=storage();
 saveConnection(local,session,{endpoint,access,remember:false});
 assert.deepEqual(connectionAccess(local,session,endpoint),{access,remember:false});
 assert.deepEqual(connectionAccess(local,storage(),endpoint),{access:'',remember:false});
});

test('remembered connection survives a new tab and stays bound to its Worker address',()=>{
 const local=storage();
 saveConnection(local,storage(),{endpoint,access,remember:true});
 assert.deepEqual(connectionAccess(local,storage(),endpoint),{access,remember:true});
 assert.deepEqual(connectionAccess(local,storage(),'https://other.example.workers.dev'),{access:'',remember:false});
});

test('unchecking remember removes persistent access while keeping the current session usable',()=>{
 const local=storage(),session=storage();
 saveConnection(local,session,{endpoint,access,remember:true});
 forgetRememberedAccess(local);
 assert.deepEqual(connectionAccess(local,session,endpoint),{access,remember:false});
 assert.deepEqual(connectionAccess(local,storage(),endpoint),{access:'',remember:false});
});

test('a remembered code restored in a new tab remains session-only after unchecking remember',()=>{
 const local=storage(),returningSession=storage();
 saveConnection(local,storage(),{endpoint,access,remember:true});
 assert.equal(connectionAccess(local,returningSession,endpoint).remember,true);
 forgetRememberedAccess(local);
 assert.deepEqual(connectionAccess(local,returningSession,endpoint),{access,remember:false});
 assert.equal(connectionAccess(local,storage(),endpoint).access,'');
});

test('saving a replacement code removes the old remembered code and can return to session-only',()=>{
 const local=storage(),session=storage();
 saveConnection(local,session,{endpoint,access,remember:true});
 saveConnection(local,session,{endpoint,access:'replacement-test-code',remember:true});
 assert.equal(connectionAccess(local,storage(),endpoint).access,'replacement-test-code');
 saveConnection(local,session,{endpoint,access:'session-test-code',remember:false});
 assert.equal(connectionAccess(local,storage(),endpoint).access,'');
 assert.equal(connectionAccess(local,session,endpoint).access,'session-test-code');
});

test('disconnect forgets both persistent and session codes and the saved address',()=>{
 const local=storage(),session=storage();
 saveConnection(local,session,{endpoint,access,remember:true});
 disconnectConnection(local,session);
 assert.deepEqual(connectionAccess(local,session,endpoint),{access:'',remember:false});
 assert.equal(local.getItem('mediaone.floorplans.generation-endpoint'),null);
});

test('existing session codes remain usable only at their saved Worker address',()=>{
 const local=storage(),session=storage();
 local.setItem('mediaone.floorplans.generation-endpoint',endpoint);
 session.setItem('mediaone.floorplans.generation-access',access);
 assert.equal(connectionAccess(local,session,endpoint).access,access);
 assert.equal(connectionAccess(local,session,'https://other.example.workers.dev').access,'');
});

test('corrupt saved access is ignored and OpenAI API keys cannot be persisted',()=>{
 const local=storage();
 local.setItem('mediaone.floorplans.generation-remembered.v1','broken JSON');
 assert.deepEqual(connectionAccess(local,storage(),endpoint),{access:'',remember:false});
 assert.throws(()=>saveConnection(local,storage(),{endpoint,access:'sk-not-a-studio-code',remember:true}),/Studio access code/);
});
