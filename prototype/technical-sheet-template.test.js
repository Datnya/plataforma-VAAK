const assert=require('node:assert/strict');
const fs=require('node:fs');
require('./technical-sheet-template.js');

const spec={
  id:'sp1',code:'RES-200',name:'Coffee Table',projectId:'p1',procurementTeam:'FFE',
  category:'Casegoods - Coffee Table (In Stock)',vendorSource:'RH Contract (Restoration Hardware)',
  area:'Living Room & Dining Room',specStatus:'In Stock Option - Issued for Review',
  productCode:'RH-KENZIE-114534',reference:'Kenzie Large Coffee Table 114534ABRS',size:'38 in diam., 15 in H',color:'Aged Brass / N/A',
  quantity:1,unit:'EACH',quantityOrdered:'12 EA',description:'Sculptural bowl-form coffee table in aged brass.\n'.repeat(120),
  image:'data:image/png;base64,AA=='
};
const project={id:'p1',code:'P171',name:'Four Seasons Cartagena Residences',legal:'San Francisco Investments SAS'};
const html=globalThis.VAAKTechnicalSheetTemplate.render(spec,{project,issueDate:'August 10, 2026'});

assert.match(html,/hpg-international-reference\.png/);
assert.match(html,/TECHNICAL SPECIFICATION SHEET/);
assert.match(html,/HPG International - FF&amp;E Procurement/);
assert.match(html,/P171/);
assert.match(html,/RES-200/);
assert.match(html,/PRODUCT CODE<\/th><td>RH-KENZIE-114534/);
assert.match(html,/RH Contract \(Restoration Hardware\)/);
assert.match(html,/data:image\/png;base64,AA==/);
assert.match(html,/QTY\. ORDERED<\/th><td>12 EA/);
assert.match(html,/Sculptural bowl-form coffee table/);
assert.doesNotMatch(html,/DESIGN &amp; FINISH/);
assert.doesNotMatch(html,/CONSTRUCTION &amp; CRAFTSMANSHIP/);
assert.doesNotMatch(html,/PROJECT NOTES/);
assert.ok(html.indexOf('DESCRIPTION')<html.indexOf('hpg-ts-item-table'));
assert.doesNotMatch(html,/Ficha técnica|Descripción|Proyecto|Cantidad/);

const noImage=globalThis.VAAKTechnicalSheetTemplate.render({...spec,image:''},{project,issueDate:'August 10, 2026'});
assert.doesNotMatch(noImage,/alt="Coffee Table"/);
assert.doesNotMatch(noImage,/>IMAGE</);

const css=fs.readFileSync('./prototype/technical-sheet-reference.css','utf8');
assert.match(css,/font-family:Aptos/);
assert.match(css,/border-top:10px solid #9b7a5b/);
assert.match(css,/background:#6a4d3b/);
assert.match(css,/background:#f7f3ec/);
console.log('technical-sheet-template: all assertions passed');
