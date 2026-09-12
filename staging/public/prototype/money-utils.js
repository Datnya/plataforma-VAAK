(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.VAAKMoney=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';

  const parse=value=>{
    if(typeof value==='number')return Number.isFinite(value)?value:0;
    let text=String(value??'').trim();
    if(!text)return 0;
    let normalized=text.replace(/[^0-9,.-]/g,'');
    if(normalized.includes('.')&&normalized.includes(','))normalized=normalized.replace(/,/g,'');
    else if(normalized.includes(',')&&!normalized.includes('.')){
      let parts=normalized.split(',');
      normalized=parts.length===2&&parts[1].length<=2?`${parts[0]}.${parts[1]}`:parts.join('');
    }
    let result=Number(normalized);
    return Number.isFinite(result)?result:0;
  };
  const round=value=>{
    let amount=parse(value);
    return Number(`${Math.round(Number(`${amount}e1`))}e-1`);
  };
  const fixed=value=>round(value).toFixed(2);
  const currencyFrom=(value,fallback='S/')=>{
    let match=String(value??'').trim().match(/^(PEN|USD|EUR|COP|S\/|\$|€)/i);
    return match?match[1].toUpperCase():fallback;
  };
  const currencyValue=(currency,value)=>`${currency||'S/'} ${fixed(value)}`;
  const storedCurrencyValue=(value,fallback='S/')=>currencyValue(currencyFrom(value,fallback),value);

  return Object.freeze({parse,round,fixed,currencyFrom,currencyValue,storedCurrencyValue});
});
