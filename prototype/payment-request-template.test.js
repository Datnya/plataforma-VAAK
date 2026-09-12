const assert=require('node:assert/strict');
const template=require('./payment-request-template.js');

const project={code:'B224',name:'Four Seasons Cartagena'};
const invoice={number:'PR-B224-0932',poNumber:'B224-0244',requestDate:'2026-07-20',currency:'COP',requestDetail:'Payment request for the awarded purchase order.',totalRequest:'5604900',sourceManufacturer:'CI Distrihogar SAS / CI Distrihogar SAS',payableTo:'CI Distrihogar SAS',payableAddress:'Calle 79 Sur 3 52A -145 Int. 101 La Estrella Medellin - Antioquia, Colombia',payableContact:'Juan Valencia',invoiceNumber:'EII12686',poReferenceArea:'B224-0244-R02',invoiceDate:'2026-07-17',dueDate:'',paymentTerms:'',invoiceTotal:'5604900',goods:'4710000',freight:'894900',packing:'',additionalCharges:'',overage:'',customs:'',salesTax:'',paymentPayableTo:'CI Distrihogar SAS',paymentAmount:'5604900'};
const html=template.render(project,invoice);

assert.equal(template.displayDate('2026-07-20'),'07/20/26');
assert.equal(template.amount('250.57'),'250.60');
assert.equal(template.currencyCode({currency:'$'}),'USD');
assert.equal(template.projectLine(project),'B224 · Four Seasons Cartagena');
for(const expected of ['PAYMENT REQUEST','B224 · FOUR SEASONS CARTAGENA','PR-B224-0932','REQUEST DETAIL','SOURCE / MANUFACTURER','INVOICE ENTRY DETAILS','PAYMENT REQUEST TOTALS','APPROVED BY / CLIENT','COP 5,604,900.00','4,710,000.00','894,900.00','Page 1 · 07/20/26'])assert.ok(html.includes(expected),expected);
assert.ok(html.includes('lang="en"'));
assert.ok(!html.includes('Solicitud de pago'));

console.log('payment-request-template: all assertions passed');
