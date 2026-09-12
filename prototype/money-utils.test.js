const assert=require('node:assert/strict');
const money=require('./money-utils.js');

assert.equal(money.fixed(345.03),'345.00');
assert.equal(money.fixed(250.57),'250.60');
assert.equal(money.fixed('$ 1,450.04'),'1450.00');
assert.equal(money.fixed('S/ 1,450.06'),'1450.10');
assert.equal(money.storedCurrencyValue('$ 250.57'),'$ 250.60');
assert.equal(money.storedCurrencyValue('PEN 345.03'),'PEN 345.00');

console.log('money-utils: all assertions passed');
