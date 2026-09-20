 'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const base=path.resolve(__dirname,'..');
const context={window:{}};vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(base,'prices.js'),'utf8'),context);
const prices=context.window.BATHLINE_PRICES;
const baseline=JSON.parse(fs.readFileSync(path.join(base,'price-baseline.json'),'utf8'));
assert.equal(JSON.stringify(prices),JSON.stringify(baseline),'Price JS must match baseline JSON');
const E=require('../engine.js');
assert.equal(E.workOrder.length,17);

let r=E.calculate({
  floor:6,walls:28,installments:12,
  works:E.core,
  quantities:{plumbing:3,electric:2,showerSet:1}
},prices);

assert.ok(r.min>22000 && r.min<26000,`Typical competitive minimum unexpected: ${r.min}`);
assert.ok(r.max>24500 && r.max<29000,`Typical competitive maximum unexpected: ${r.max}`);
assert.ok((r.max-r.min)/r.min<0.18,'Typical range should be reasonably tight');

let p=E.calculate({floor:6,walls:28,installments:12,works:['plumbing'],quantities:{plumbing:4}},prices);
assert.equal(p.rows[0].quantity,4);
assert.equal(p.min,5800);
assert.equal(p.max,6200);

let e=E.calculate({floor:6,walls:28,installments:12,works:['electric'],quantities:{electric:3}},prices);
assert.equal(e.min,1440);
assert.equal(e.max,1620);

let tile=E.calculate({floor:7,walls:28,installments:12,works:['flooring','cladding']},prices);
assert.equal(tile.min,7*175+28*150);
assert.equal(tile.max,7*205+28*180);

assert.equal(E.calculate({floor:200,walls:800,installments:99,works:['flooring','cladding']},prices).floorSqm,20);
assert.equal(E.calculate({floor:200,walls:800,installments:99,works:['flooring','cladding']},prices).wallSqm,80);
assert.equal(E.calculate({floor:200,walls:800,installments:99,works:['flooring','cladding']},prices).installments,36);
assert.equal(E.calculate({floor:0,walls:0,installments:12,works:['flooring','cladding']},prices).missing.length,2);

vm.runInContext(fs.readFileSync(path.join(base,'content.js'),'utf8'),context);
const D=context.window.BATHLINE_CONTENT;
const keys=Object.keys(D.he).sort();
for(const lang of ['he','ar','en','ru']){
  assert.deepEqual(Object.keys(D[lang]).sort(),keys);
  for(const key of keys) assert.ok(typeof D[lang][key]==='string' && D[lang][key].length);
  for(const w of E.workOrder) assert.ok(D[lang][`work.${w}.title`]);
}
console.log(JSON.stringify({passed:true,languages:4,workOptions:17,typicalMin:Math.round(r.min),typicalMax:Math.round(r.max)},null,2));
