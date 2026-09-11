const http=require('http');const https=require('https');

// Token gratuito de apis.net.pe — regístrate en https://apis.net.pe para obtener uno
const TOKEN=process.env.SUNAT_TOKEN||'';

function fetchJSON(url,headers={}){
  return new Promise((resolve,reject)=>{
    const mod=url.startsWith('https')?https:http;
    const opts={headers:{'User-Agent':'Mozilla/5.0','Accept':'application/json',...headers}};
    mod.get(url,opts,r=>{
      let body='';r.on('data',c=>body+=c);
      r.on('end',()=>{try{resolve({status:r.statusCode,data:JSON.parse(body)})}catch(e){reject(e)}});
    }).on('error',reject);
  });
}

async function queryRUC(ruc){
  // API 1: apis.net.pe (requiere token gratuito)
  if(TOKEN){
    try{
      let r=await fetchJSON(`https://api.apis.net.pe/v2/sunat/ruc?numero=${ruc}`,{Authorization:`Bearer ${TOKEN}`});
      if(r.status===200&&(r.data.nombre||r.data.razonSocial)){
        return{nombre:r.data.nombre||r.data.razonSocial,direccion:r.data.direccion||''};
      }
    }catch(e){console.log('apis.net.pe error:',e.message)}
  }
  // API 2: dniruc.apisperu.com (requiere token)
  if(TOKEN){
    try{
      let r=await fetchJSON(`https://dniruc.apisperu.com/api/v1/ruc/${ruc}?token=${TOKEN}`);
      if(r.status===200&&(r.data.razonSocial||r.data.nombre)){
        return{nombre:r.data.razonSocial||r.data.nombre,direccion:r.data.direccion||''};
      }
    }catch(e){console.log('apisperu error:',e.message)}
  }
  return null;
}

const server=http.createServer(async(req,res)=>{
  res.setHeader('Access-Control-Allow-Origin','*');
  res.setHeader('Access-Control-Allow-Methods','GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers','*');
  res.setHeader('Content-Type','application/json; charset=utf-8');
  if(req.method==='OPTIONS'){res.end();return}
  const url=new URL(req.url,`http://${req.headers.host}`);
  const ruc=url.searchParams.get('ruc');
  if(!ruc||!/^\d{11}$/.test(ruc)){res.end(JSON.stringify({error:'RUC inválido'}));return}
  if(!TOKEN){res.end(JSON.stringify({error:'NO_TOKEN','message':'Configure SUNAT_TOKEN para habilitar consultas en vivo'}));return}
  try{
    const result=await queryRUC(ruc);
    if(result&&result.nombre){
      res.end(JSON.stringify({nombre:result.nombre,direccion:result.direccion}));
    }else{
      res.end(JSON.stringify({error:'RUC no encontrado en SUNAT'}));
    }
  }catch(e){
    res.end(JSON.stringify({error:'Error consultando SUNAT'}));
  }
});
server.listen(4174,()=>{
  console.log('SUNAT proxy en http://localhost:4174');
  if(!TOKEN)console.log('⚠ Sin token. Ejecuta: SUNAT_TOKEN=tu_token node sunat-proxy.js');
  else console.log('✓ Token configurado. Consultas en vivo habilitadas.');
});
