const assert=require('node:assert/strict');
const fs=require('node:fs');
require('./technical-sheet-pdf.js');

const jpeg=Buffer.from('/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////2wBDAf//////////////////////////////////////////////////////////////////////////////////////wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAf/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIQAxAAAAF//8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABBQJ//8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAgBAwEBPwF//8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAgBAgEBPwF//8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQAGPwJ//8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPyF//9oADAMBAAIAAwAAAB//xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oACAEDAQE/EH//xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oACAECAQE/EH//xAAUEAEAAAAAAAAAAAAAAAAAAAAA/9oACAEBAAE/EH//2Q==','base64');
const pages=Array.from({length:3},()=>({bytes:new Uint8Array(jpeg),width:1,height:1}));
const pdf=globalThis.VAAKTechnicalSheetPDF.buildPdf(pages);
const text=Buffer.from(pdf).toString('latin1');
assert.ok(text.startsWith('%PDF-1.4'));
assert.match(text,/\/Type \/Catalog/);
assert.match(text,/\/Count 3/);
assert.match(text,/\/Subtype \/Image/);
assert.match(text,/startxref/);
assert.ok(pdf.length>jpeg.length);
assert.equal(globalThis.VAAKTechnicalSheetPDF.FOOTER_TEXT,'HPG International Latinoamericana SAC · Av. Alfredo Benavides 1180, Lima, Peru · hpgilatam.com');
assert.equal(globalThis.VAAKTechnicalSheetPDF.pageCountForHeight(2100,1122,42),2);
assert.equal(globalThis.VAAKTechnicalSheetPDF.pageCountForHeight(2161,1122,42),3);
if(process.env.VAAK_PDF_TEST_OUTPUT)fs.writeFileSync(process.env.VAAK_PDF_TEST_OUTPUT,pdf);
console.log('technical-sheet-pdf: all assertions passed');
