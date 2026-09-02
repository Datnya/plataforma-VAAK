(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.VAAKFixtures=api})(typeof globalThis!=='undefined'?globalThis:this,function(){
  const copy=value=>JSON.parse(JSON.stringify(value));
  const access=ids=>({version:2,grants:Object.fromEntries(ids.map(id=>[id,'enabled']))});
  const seed={schemaVersions:{access:2,relations:2,resources:2},meta:{storeRevision:0},users:[
    {id:'admin',name:'Morgan Lee',email:'morgan.lee@vaak.pe',username:'admin.vaak',password:'VAAKdemo!26',role:'Admin',active:true},
    {id:'worker',name:'Jordan Park',email:'jordan.park@vaak.pe',username:'worker.vaak',password:'VAAKdemo!26',role:'Worker',active:true,access:access(['section.dashboard','section.tools','section.team','section.suppliers','section.specs'])},
    {id:'client-a',name:'Avery Stone',email:'avery@cliente.test',username:'client.vaak',password:'VAAKdemo!26',role:'Client',active:true,access:access(['section.dashboard','section.orders'])},
    {id:'client-b',name:'Sofía Rivera',email:'sofia@cliente.test',username:'client2.vaak',password:'VAAKdemo!26',role:'Client',active:true,access:access(['section.dashboard','section.orders'])}
  ],projects:[
    {id:'p1',code:'PRJ-041',name:'Hotel Costa Azul',legal:'Hotel Costa Azul S.A.C.',fiscal:'Av. del Sol 245, Lima',warehouse:'Jr. Los Cedros 180, Lima',city:'Lima',country:'Perú',rooms:'120',residences:'18',areas:'9',cover:'assets/projects/harbor-view-residence.png',gallery:[],team:[]},
    {id:'p2',code:'PRJ-042',name:'Logistics Center',legal:'Logistics Development S.A.C.',fiscal:'Av. Industrial 500, Lima',warehouse:'Almacén Central',city:'Lima',country:'Perú',rooms:'—',residences:'—',areas:'6',cover:'assets/projects/logistics-center.png',gallery:[],team:[]}
  ],orders:[
    {id:'o1',number:'PO-2026-001',projectId:'p1',supplier:'Proveedor Andino',issuer:'Morgan Lee',date:'04/08/2026',amount:'S/ 18,450.00',items:[]},
    {id:'o2',number:'PO-2026-002',projectId:'p2',supplier:'Soluciones Técnicas SAC',issuer:'Jordan Park',date:'05/08/2026',amount:'$ 8,900.00',items:[]}
  ],suppliers:[{id:'s-own',name:'Proveedor P1',ruc:'20123456789',email:'p1@example.test',active:true},{id:'s-foreign',name:'Proveedor P2',ruc:'20123456780',email:'p2@example.test',active:true},{id:'s-mixed',name:'Proveedor Mixto',ruc:'20123456781',email:'mixed@example.test',active:true}],
  specs:[{id:'sp-own',projectId:'p1',name:'Lámpara decorativa',category:'Iluminación',color:'Dorado',cost:'$ 380.00'},{id:'sp-foreign',projectId:'p2',name:'Sillón lounge',category:'Mobiliario',color:'Arena',cost:'$ 920.00'}],
  tasks:[{id:'t-own',title:'Completar cotizaciones pendientes',assignee:'worker',status:'In Progress',progress:60,due:'2026-09-10'},{id:'t-foreign',title:'Validar presupuesto',assignee:'admin',status:'Pending',progress:15,due:'2026-09-18'}],
  projectMemberships:[{userId:'worker',projectId:'p1'}],projectCompanies:[{projectId:'p1',companyId:'co1'},{projectId:'p2',companyId:'co2'}],
  supplierProjectLinks:[{supplierId:'s-own',projectId:'p1'},{supplierId:'s-foreign',projectId:'p2'},{supplierId:'s-mixed',projectId:'p1'},{supplierId:'s-mixed',projectId:'p2'}],
  clientProjectLinks:[{clientId:'client-a',companyId:'co1',projectId:'p1'},{clientId:'client-b',companyId:'co2',projectId:'p2'}],
  clientOrderAuthorizations:[{clientId:'client-a',orderId:'o1',companyId:'co1',projectId:'p1'},{clientId:'client-b',orderId:'o2',companyId:'co2',projectId:'p2'}],quarantine:[]};
  return Object.freeze({seed:()=>copy(seed),variant:(mutator)=>{let value=copy(seed);mutator(value);return value}});
});
