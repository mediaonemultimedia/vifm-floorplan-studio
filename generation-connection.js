import {validateConnection} from './intake.js';

const ENDPOINT='mediaone.floorplans.generation-endpoint';
const ACCESS='mediaone.floorplans.generation-access';
const SESSION_ENDPOINT='mediaone.floorplans.generation-session-endpoint';
const REMEMBERED='mediaone.floorplans.generation-remembered.v1';
const empty=()=>({access:'',remember:false});
const usable=value=>typeof value==='string'&&value.trim().length>0&&!/^sk-/.test(value.trim());

export function connectionAccess(local,session,endpoint){
 let saved;
 try{saved=JSON.parse(local.getItem(REMEMBERED)||'null');}catch{}
 if(saved?.endpoint===endpoint&&usable(saved.access)){
  // Restoring a remembered code also starts this tab's session, so forgetting
  // the persistent copy does not unexpectedly disconnect the current tab.
  session.setItem(SESSION_ENDPOINT,endpoint);
  session.setItem(ACCESS,saved.access);
  return {access:saved.access,remember:true};
 }
 const sessionEndpoint=session.getItem(SESSION_ENDPOINT)||local.getItem(ENDPOINT);
 const access=session.getItem(ACCESS);
 return sessionEndpoint===endpoint&&usable(access)?{access,remember:false}:empty();
}

export function forgetRememberedAccess(local){local.removeItem(REMEMBERED);}

export function saveConnection(local,session,{endpoint,access,remember}){
 endpoint=validateConnection(endpoint).endpoint;
 if(!usable(access))throw Error('Use the Studio access code, not your OpenAI API key.');
 access=access.trim();
 forgetRememberedAccess(local);
 local.setItem(ENDPOINT,endpoint);
 session.setItem(SESSION_ENDPOINT,endpoint);
 session.setItem(ACCESS,access);
 if(remember===true)local.setItem(REMEMBERED,JSON.stringify({endpoint,access}));
}

export function disconnectConnection(local,session){
 let failed=false;
 for(const [storage,key] of [[local,REMEMBERED],[local,ENDPOINT],[session,ACCESS],[session,SESSION_ENDPOINT]]){
  try{storage.removeItem(key);}catch{failed=true;}
 }
 if(failed)throw Error('The browser could not clear all saved connection settings. Clear site data to forget this device.');
}
