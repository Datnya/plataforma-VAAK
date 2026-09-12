(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.VAAKFormDefaults=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';

  function localDateValue(input=new Date()){
    const date=new Date(input);
    date.setMinutes(date.getMinutes()-date.getTimezoneOffset());
    return date.toISOString().slice(0,10);
  }

  function applyDateDefaults(root,today=localDateValue()){
    const inputs=[];
    if(root?.matches?.('input[type="date"]'))inputs.push(root);
    if(root?.querySelectorAll)inputs.push(...root.querySelectorAll('input[type="date"]'));
    let changed=0;
    for(const input of new Set(inputs)){
      if(!input.closest?.('form')||input.dataset?.noDefaultDate!==undefined||input.value)continue;
      input.value=today;
      input.defaultValue=today;
      changed++;
    }
    return changed;
  }

  function start(root=document){
    applyDateDefaults(root);
    const target=root.body||root.documentElement||root;
    if(!target||typeof MutationObserver==='undefined')return null;
    const observer=new MutationObserver(records=>records.forEach(record=>record.addedNodes.forEach(node=>applyDateDefaults(node))));
    observer.observe(target,{childList:true,subtree:true});
    return observer;
  }

  return Object.freeze({localDateValue,applyDateDefaults,start});
});
