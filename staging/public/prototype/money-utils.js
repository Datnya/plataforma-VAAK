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
    let match=String(value??'').trim().match(/^(PEN|USD|EUR|COP|MXN|CLP|ARS|BRL|UYU|PYG|BOB|VES|CRC|GTQ|HNL|NIO|PAB|DOP|CUP|S\/|\$|€)/i);
    return match?match[1].toUpperCase():fallback;
  };
  const currencyValue=(currency,value)=>`${currency||'S/'} ${fixed(value)}`;
  const storedCurrencyValue=(value,fallback='S/')=>currencyValue(currencyFrom(value,fallback),value);

  // Sol y dolar se guardan con su simbolo, igual que los datos ya existentes;
  // el resto de monedas se guarda con su codigo ISO.
  const CURRENCIES=Object.freeze([
    {value:"$",name:"Dólar estadounidense",english:"US Dollar"},
    {value:"S/",name:"Sol peruano",english:"Peruvian Sol"},
    {value:"€",name:"Euro",english:"Euro"},
    {value:"MXN",name:"Peso mexicano",english:"Mexican Peso"},
    {value:"COP",name:"Peso colombiano",english:"Colombian Peso"},
    {value:"CLP",name:"Peso chileno",english:"Chilean Peso"},
    {value:"ARS",name:"Peso argentino",english:"Argentine Peso"},
    {value:"BRL",name:"Real brasileño",english:"Brazilian Real"},
    {value:"UYU",name:"Peso uruguayo",english:"Uruguayan Peso"},
    {value:"PYG",name:"Guaraní paraguayo",english:"Paraguayan Guarani"},
    {value:"BOB",name:"Boliviano",english:"Bolivian Boliviano"},
    {value:"VES",name:"Bolívar venezolano",english:"Venezuelan Bolivar"},
    {value:"CRC",name:"Colón costarricense",english:"Costa Rican Colon"},
    {value:"GTQ",name:"Quetzal guatemalteco",english:"Guatemalan Quetzal"},
    {value:"HNL",name:"Lempira hondureño",english:"Honduran Lempira"},
    {value:"NIO",name:"Córdoba nicaragüense",english:"Nicaraguan Cordoba"},
    {value:"PAB",name:"Balboa panameño",english:"Panamanian Balboa"},
    {value:"DOP",name:"Peso dominicano",english:"Dominican Peso"},
    {value:"CUP",name:"Peso cubano",english:"Cuban Peso"}
  ]);
  const codeOf=value=>value==="$"?"USD":value==="S/"?"PEN":value==="€"?"EUR":String(value||"").toUpperCase();
  const nameOf=(value,spanish=true)=>{let found=CURRENCIES.find(item=>item.value===value||codeOf(item.value)===codeOf(value));return found?(spanish?found.name:found.english):String(value||"")};
  return Object.freeze({parse,round,fixed,currencyFrom,currencyValue,storedCurrencyValue,CURRENCIES,codeOf,nameOf});
});
