(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.VAAKMoney=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';

  // Un importe escrito («1,450.50», «1450,5», 1450.5) se lleva a un solo texto numerico.
  const normalizado=value=>{
    let text=String(value??'').trim();
    if(!text)return '';
    let normalized=text.replace(/[^0-9,.-]/g,'');
    if(normalized.includes('.')&&normalized.includes(','))normalized=normalized.replace(/,/g,'');
    else if(normalized.includes(',')&&!normalized.includes('.')){
      let parts=normalized.split(',');
      normalized=parts.length===2&&parts[1].length<=2?`${parts[0]}.${parts[1]}`:parts.join('');
    }
    return normalized;
  };
  const parse=value=>{
    if(typeof value==='number')return Number.isFinite(value)?value:0;
    let result=Number(normalizado(value));
    return Number.isFinite(result)?result:0;
  };
  // Con cuantos decimales se escribio un importe (0 a 3). La OC lo usa para no inventar un tercer
  // decimal cuando todo el formulario se trabajo con dos (pedido de Datnya, 24-sep-2026).
  const decimalsOf=value=>{
    let text=typeof value==='number'?String(value):normalizado(value);
    let cut=text.indexOf('.');
    return cut<0?0:Math.min(text.slice(cut+1).replace(/[^0-9]/g,'').length,3);
  };
  const decimales=value=>Math.min(Math.max(Number(value)||0,0),3);
  const roundTo=(value,decimals=3)=>{
    let amount=parse(value),d=decimales(decimals);
    return Number(`${Math.round(Number(`${amount}e${d}`))}e-${d}`);
  };
  const fixedTo=(value,decimals=2)=>{let d=decimales(decimals);return roundTo(value,d).toFixed(d)};
  const formatTo=(value,decimals=2)=>{let d=decimales(decimals);return roundTo(value,d).toLocaleString('en-US',{minimumFractionDigits:d,maximumFractionDigits:d})};
  const round=value=>roundTo(value,3);
  const fixed=value=>{const text=round(value).toFixed(3);return text.endsWith('0')?text.slice(0,-1):text};
  const format=value=>round(value).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:3});
  // Una moneda tiene una sola forma canonica: el simbolo para sol, dolar y euro; el codigo ISO
  // para las demas. Antes "USD 680.00" devolvia "USD", que no coincide con el "$" de los selectores
  // y el formulario se quedaba en soles (22-sep-2026).
  const canonico=code=>code==="PEN"?"S/":code==="USD"?"$":code==="EUR"?"€":code;
  const currencyFrom=(value,fallback='S/')=>{
    let match=String(value??'').trim().match(/^(PEN|USD|EUR|COP|MXN|CLP|ARS|BRL|UYU|PYG|BOB|VES|CRC|GTQ|HNL|NIO|PAB|DOP|CUP|S\/|\$|€)/i);
    return match?canonico(match[1].toUpperCase()):canonico(String(fallback||"S/").toUpperCase());
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
  return Object.freeze({parse,round,fixed,format,roundTo,fixedTo,formatTo,decimalsOf,currencyFrom,currencyValue,storedCurrencyValue,CURRENCIES,codeOf,nameOf});
});
