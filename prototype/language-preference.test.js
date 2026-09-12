const assert=require('node:assert/strict');
const language=require('./language-preference.js');

assert.equal(language.DEFAULT_LANGUAGE,'en');
assert.equal(language.resolve(null,null,false),'en');
assert.equal(language.resolve('Admin',null,true),'en');
assert.equal(language.resolve('Worker','es',true),'es');
assert.equal(language.resolve('Worker','invalid',true),'en');
assert.equal(language.resolve('Client','es',true),'en');
const entries=new Map(),storage={setItem:(key,value)=>entries.set(key,value)};
assert.equal(language.save(storage,'worker','es'),'es');
assert.equal(entries.get('vaak-language-worker'),'es');

console.log('language-preference: all assertions passed');
