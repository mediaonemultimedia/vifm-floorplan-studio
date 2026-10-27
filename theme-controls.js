import {TEXT_STYLES,LINE_STYLES,setTextSize,setLineStyle} from './theme.js';
const input=(id,label,value,min,max)=>`<label>${label}<input id="${id}" type="number" min="${min}" max="${max}" step=".01" value="${value}"></label>`;
export function bindThemeInput(el,project,role,setter,change,refresh,toast){
 let changed=false,invalid=false;el.onfocus=()=>{changed=false;invalid=false;};
 el.oninput=()=>{
  const size=Number(el.value),shadow={...project,theme:{text:{...project.theme.text},lines:{...project.theme.lines}}};
  try{if(String(el.value).trim()==='')throw Error('Enter a size.');setter(shadow,role,size);invalid=false;}catch{invalid=true;return;}
  change(()=>setter(project,role,size),{syncControls:false,record:!changed});changed=true;
 };
 el.onchange=()=>{if(!changed&&!invalid)el.oninput();if(invalid)toast('Enter a value within the shown limits.');refresh();};
}
export function themeControls(project,change,refresh,toast){
 document.querySelector('#text-styles').innerHTML=Object.entries(TEXT_STYLES).map(([role,label])=>input('type-'+role,label,project.theme.text[role],4,role==='marker'?120:60)).join('');
 document.querySelector('#line-styles').innerHTML=Object.entries(LINE_STYLES).map(([role,label])=>input('line-'+role,label,project.theme.lines[role],.2,12)).join('');
 for(const [group,roles,fn]of [['type',TEXT_STYLES,setTextSize],['line',LINE_STYLES,setLineStyle]])for(const role of Object.keys(roles))bindThemeInput(document.querySelector('#'+group+'-'+role),project,role,fn,change,refresh,toast);
}
