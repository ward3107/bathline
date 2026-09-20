'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const code=fs.readFileSync(path.resolve(__dirname,'../boot.js'),'utf8');
function boot(url,saved={},blocked=false){
 const html={dataset:{}};
 const c={window:{},document:{documentElement:html},location:{href:url},URL,localStorage:{getItem(key){if(blocked)throw new Error('Storage blocked');return saved[key]||null;}}};
 vm.createContext(c);vm.runInContext(code,c);return {html,init:c.window.BATHLINE_INIT};
}
assert.equal(boot('https://test.invalid/').init.language,'he');
for(const language of ['he','ar','en','ru']){
 const x=boot(`https://test.invalid/?lang=${language}`);
 assert.equal(x.init.language,language);assert.equal(x.html.dir,['he','ar'].includes(language)?'rtl':'ltr');
}
assert.equal(boot('https://test.invalid/?lang=ru',{'bathline-language-v1':'he'}).init.language,'ru');
assert.equal(boot('https://test.invalid/',{'bathline-language-v1':'ar'}).init.language,'ar');
assert.equal(boot('https://test.invalid/?lang=not-supported',{'bathline-language-v1':'en'}).init.language,'en');
assert.equal(boot('https://test.invalid/',{'bathline-theme-v1':'dark'}).html.dataset.theme,'dark');
assert.equal(boot('file:///preview.html',{},true).init.language,'he');
console.log('PASS: language URL precedence, stored preferences and unavailable-storage fallback');
