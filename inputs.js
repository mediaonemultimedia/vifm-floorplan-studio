// A valid typing session is one undo action. Invalid intermediate input is not saved.
export function bindLiveValue(el,apply,change,refresh,toast,validate=()=>true){
 let changed=false,invalid=false;el.onfocus=()=>{changed=false;invalid=false;};
 el.oninput=()=>{const value=el.value;if(!validate(value)){invalid=true;return;}invalid=false;change(()=>apply(value),{syncControls:false,record:!changed});changed=true;};
 el.onchange=()=>{if(!changed&&!invalid)el.oninput();if(invalid)toast('Enter a value within the shown limits.');refresh();};
}
export const validCoordinate=value=>String(value).trim()!==''&&Number.isFinite(Number(value))&&Number(value)>=-300&&Number(value)<=1600;
