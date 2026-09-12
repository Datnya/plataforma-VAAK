const assert=require('node:assert/strict');
const defaults=require('./form-defaults.js');

assert.equal(defaults.localDateValue(new Date('2026-09-12T15:30:00Z')).length,10);
const inForm={value:'',defaultValue:'',dataset:{},closest:selector=>selector==='form'?{}:null};
const preserved={value:'2026-10-20',defaultValue:'',dataset:{},closest:selector=>selector==='form'?{}:null};
const outsideForm={value:'',defaultValue:'',dataset:{},closest:()=>null};
const optedOut={value:'',defaultValue:'',dataset:{noDefaultDate:''},closest:selector=>selector==='form'?{}:null};
const root={matches:()=>false,querySelectorAll:()=>[inForm,preserved,outsideForm,optedOut]};

assert.equal(defaults.applyDateDefaults(root,'2026-09-12'),1);
assert.equal(inForm.value,'2026-09-12');
assert.equal(inForm.defaultValue,'2026-09-12');
assert.equal(preserved.value,'2026-10-20');
assert.equal(outsideForm.value,'');
assert.equal(optedOut.value,'');

console.log('form-defaults: all assertions passed');
