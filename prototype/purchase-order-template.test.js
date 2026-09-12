const assert=require('node:assert/strict');
globalThis.VAAKMoney=require('./money-utils.js');
require('./purchase-order-template.js');

const state={
  projects:[{id:'p1',code:'PRJ-041',name:'Hotel Costa Azul',legal:'Hotel Costa Azul SAC',fiscal:'Av. Principal 100',warehouse:'Almacén 2',city:'Lima',country:'Peru'}],
  suppliers:[{name:'Vendor One',address:'Supplier Street',contact:'Alex Smith',phone:'+51 999 999 999',email:'alex@vendor.test'},{name:'Factory Source',address:'Factory Road',contact:'Morgan Reed',phone:'+1 555 0100',email:'factory@source.test'}],
  specs:[{id:'sp1',code:'FF-01',productCode:'VND-ARM-778',name:'Armchair',size:'80 x 80 cm',unit:'ea',material:'Solid wood',description:'Contract upholstery',image:'data:image/png;base64,AA=='}]
};
const html=globalThis.VAAKPurchaseOrderTemplate.render({projectId:'p1',number:'PRJ-041-0001',supplier:'Vendor One',manufacturer:'Legacy manufacturer value',source:'Factory Source',supplierAddress:'Supplier Street',supplierContact:'Alex Smith',supplierPhone:'+51 999 999 999',supplierEmail:'alex@vendor.test',sourceAddress:'Factory Road',sourceContact:'Morgan Reed',sourcePhone:'+1 555 0100',sourceEmail:'factory@source.test',shipTo:'Distribution Warehouse 45',ocRubro:'Guestrooms',amountCurrency:'$',date:'2026-09-04',deliveryDate:'2026-10-18',items:[{specId:'sp1',description:'Armchair',quantity:2,currency:'$',unitCost:100}],taxType:'IGV',taxAmount:'36.00',paymentTerms:'Net 30',incoterm:'CIF Cartagena',specifiedBy:'Design Studio',productionTime:'45 days',warranty:'3 years'},{state,dateFormatter:()=> '04 Sept. 2026',area:'Guestrooms (GR)'});
assert.match(html,/hpg-international-reference\.png/);
assert.match(html,/PRJ-041-0001/);
assert.match(html,/PAYMENT TERMS/);
assert.match(html,/TERMS AND CONDITIONS/);
assert.match(html,/04 Sept\. 2026/);
assert.match(html,/2 ea/);
assert.match(html,/Solid wood/);
assert.match(html,/PRODUCT CODE<\/span><span>VND-ARM-778/);
assert.match(html,/MANUFACTURER<\/span><strong>Vendor One/);
assert.match(html,/SOURCE<\/span><strong>Factory Source/);
assert.doesNotMatch(html,/MANUFACTURER<\/span><strong>Legacy manufacturer value/);
assert.match(html,/SHIP TO<\/span><strong>Hotel Costa Azul SAC<\/strong><p>Distribution Warehouse 45/);
assert.match(html,/BILL TO<\/span><strong>Hotel Costa Azul SAC<\/strong><p>Av\. Principal 100/);
assert.match(html,/INCOTERM<\/span><strong>CIF Cartagena/);
assert.equal((html.match(/<span>INCOTERM<\/span>/g)||[]).length,1);
assert.match(html,/DELIVERY DATE<\/span><strong>10\/18\/26/);
assert.match(html,/SPECIFIED BY<\/span><strong>Design Studio/);
assert.match(html,/hpg-ref-tax"><span>IGV<\/span><strong>\$36\.00/);
assert.match(html,/PO TOTAL<\/span><strong>\$236\.00/);
assert.doesNotMatch(html,/BORRADOR|Borrador/);
const customConditions=Array.from({length:50},(_,index)=>`Custom condition ${index+1}`);
const customHtml=globalThis.VAAKPurchaseOrderTemplate.render({projectId:'p1',number:'PRJ-041-0002',conditionsJson:JSON.stringify(customConditions),items:[]},{state});
assert.match(customHtml,/<strong>50<\/strong><span>Custom condition 50<\/span>/);
assert.doesNotMatch(customHtml,/By signing this document/);
const shortHtml=globalThis.VAAKPurchaseOrderTemplate.render({projectId:'p1',number:'PRJ-041-0003',conditions:['First','Second','Third'],items:[]},{state});
assert.match(shortHtml,/<strong>03<\/strong><span>Third<\/span>/);
const roundedHtml=globalThis.VAAKPurchaseOrderTemplate.render({projectId:'p1',number:'PRJ-041-0004',amountCurrency:'$',items:[{description:'Rounded down',quantity:1,currency:'$',unitCost:345.03},{description:'Rounded up',quantity:1,currency:'$',unitCost:250.57}],taxType:'VAT',taxAmount:10.04,cifValue:5.06},{state});
assert.match(roundedHtml,/Rounded down[\s\S]*?\$345\.00[\s\S]*?Rounded up[\s\S]*?\$250\.60/);
assert.match(roundedHtml,/Subtotal<\/span><strong>\$595\.60/);
assert.match(roundedHtml,/VAT<\/span><strong>\$10\.00/);
assert.match(roundedHtml,/CIF Value<\/span><strong>\$5\.10/);
assert.match(roundedHtml,/PO TOTAL<\/span><strong>\$610\.70/);
console.log('purchase-order-template: all assertions passed');
