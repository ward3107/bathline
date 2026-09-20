/* BATHLINE multilingual interface. No frameworks, tracking, or backend data collection. */
(function () {
  'use strict';
  const D = window.BATHLINE_CONTENT;
  const E = window.BATHLINE_ENGINE;
  const prices = window.BATHLINE_PRICES;
  if (!D || !E || !prices) return; // Static phone/WhatsApp links remain usable.
  const $ = id => document.getElementById(id);
  const langs = ['he','ar','en','ru'];
  const locales = {he:'he-IL',ar:'ar-IL-u-nu-latn',en:'en-IL',ru:'ru-IL'};
  let lang = window.BATHLINE_INIT?.language || 'he';
  let theme = window.BATHLINE_INIT?.theme || 'light';
  let numberFormat, currencyFormat, lastResult;
  const state = {floor:0,walls:0,installments:12,works:[],quantities:{plumbing:3,movePoints:1,electric:2,showerSet:1}};
  let errorVisible = false;
  let toastTimer;
  const workInputs = Array.from(document.querySelectorAll('.work-check-input'));
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const phone = '972534260632';
  function t(key, params={}) {
    const value = D[lang]?.[key] ?? D.en[key] ?? key;
    return value.replace(/\{(\w+)\}/g, (match,key) => Object.prototype.hasOwnProperty.call(params,key) ? String(params[key]) : match);
  }
  function save(key,value) { try { localStorage.setItem(key,value); } catch (_) {} }
  function number(value) { return numberFormat.format(value); }
  function money(value) { return currencyFormat.format(Math.round(value)); }
  function range(min,max) { return `${money(min)} – ${money(max)}`; }
  function waURL(text) { return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`; }
  function notify(message) {
    const toast=$('toast');toast.textContent=message;toast.classList.add('show');
    clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.classList.remove('show'),5600);
  }
  function setTheme(next,persist=true) {
    theme=next==='dark'?'dark':'light';
    document.documentElement.dataset.theme=theme;
    document.querySelector('meta[name="theme-color"]').content=theme==='dark'?'#102321':'#f6f5f1';
    const button=$('themeBtn');button.setAttribute('aria-pressed',String(theme==='dark'));
    const key=theme==='dark'?'theme.light':'theme.dark';
    button.setAttribute('aria-label',t(key));button.title=t(key);
    $('themeIcon').querySelector('use').setAttribute('href',theme==='dark'?'#i-sun':'#i-moon');
    if(persist)save('bathline-theme-v1',theme);
  }
  function generalMessage(){return `${t('wa.hello')}\n${t('wa.request')}`;}
  function updateStaticLinks(){document.querySelectorAll('[data-wa]').forEach(link=>link.href=waURL(generalMessage()));}
  function validationKey(result) {
    if(!result.works.length)return 'calc.chooseWork';
    if(result.missing.includes('flooring'))return 'calc.needFloor';
    if(result.missing.includes('cladding'))return 'calc.needWalls';
    return null;
  }
  function workLabel(key,result) {
    const label=t(`work.${key}.title`);
    if(key==='flooring')return `${label} (${number(result.floorSqm)} ${t('unit')})`;
    if(key==='cladding')return `${label} (${number(result.wallSqm)} ${t('unit')})`;
    const qty=result.quantities?.[key];
    if(qty && ['plumbing','movePoints','electric','showerSet'].includes(key)){
      const unit=key==='showerSet'?t('calc.units'):t('calc.points');
      return `${label} (${number(qty)} ${unit})`;
    }
    return label;
  }
  function estimateMessage(result) {
    const names=result.works.map(key=>`• ${workLabel(key,result)}`).join('\n');
    return `${t('wa.estIntro')}\n\n${t('floor')}: ${number(result.floorSqm)} ${t('unit')}\n${t('walls')}: ${number(result.wallSqm)} ${t('unit')}\n${t('calc.factor')}: ×${result.factor.toFixed(2)}\n\n${t('wa.works')}:\n${names}\n\n${t('wa.range')}: ${range(result.min,result.max)}\n${t('calc.payLabel')}: ${number(result.installments)}\n${t('calc.monthly',{count:number(result.installments)})}: ${range(result.monthlyMin,result.monthlyMax)}\n\n${t('wa.ack')}\n${t('wa.contactMe')}\n${t('wa.request')}`;
  }
  function updateConversionCtas(result) {
    const ready = result.hasAny && !validationKey(result);
    const href = ready ? waURL(estimateMessage(result)) : '#calculator';
    const label = t(ready ? 'calc.sendShort' : 'calc.startShort');
    for (const [linkId,textId,iconId] of [
      ['mobileEstimateBtn','mobileEstimateText','mobileEstimateIcon'],
      ['floatingEstimateBtn','floatingEstimateText','floatingEstimateIcon']
    ]) {
      const link=$(linkId); if(!link) continue;
      link.href=href;
      if(ready){link.target='_blank';link.rel='noopener noreferrer';}
      else{link.removeAttribute('target');link.removeAttribute('rel');}
      const text=$(textId); if(text) text.textContent=label;
      const icon=$(iconId); if(icon) icon.setAttribute('href',ready?'#i-wa':'#i-calc');
      link.classList.toggle('ready-to-send',ready);
    }
  }
  function renderEstimate() {
    state.works=workInputs.filter(input=>input.checked).map(input=>input.value);
    const result=E.calculate(state,prices);lastResult=result;
    $('installmentsValue').textContent=t('calc.payCount',{count:number(result.installments)});
    $('monthlyLabel').textContent=t('calc.monthly',{count:number(result.installments)});
    $('floorArea').setAttribute('aria-valuetext',`${number(result.floorSqm)} ${t('unit')}`);
    $('wallArea').setAttribute('aria-valuetext',`${number(result.wallSqm)} ${t('unit')}`);
    $('installmentsRange').setAttribute('aria-valuetext',t('calc.payCount',{count:number(result.installments)}));
    $('workCount').textContent=t('calc.selected',{count:number(result.works.length)});
    const total=$('estimateRange');total.classList.toggle('empty',!result.hasAny);
    total.textContent=result.hasAny?range(result.min,result.max):t('calc.empty');
    total.dir=result.hasAny?'ltr':document.documentElement.dir;
    $('monthlyRange').textContent=result.hasAny?range(result.monthlyMin,result.monthlyMax):'—';
    $('monthlyRange').dir='ltr';
    $('laborFactorValue').textContent=`×${result.factor.toFixed(2)}`;
    const warning=$('summaryWarning');warning.hidden=!result.missing.length;
    warning.textContent=result.missing.length?t('calc.incomplete'):'';
    const list=$('estimateBreakdown');const frag=document.createDocumentFragment();
    for(const row of result.rows){
      const li=document.createElement('li');const text=document.createElement('span');const amount=document.createElement('bdi');
      let title=t(`work.${row.key}.title`);
      if(row.unit==='area')title+=` · ${number(row.quantity)} ${t('unit')}`;
      else if(row.unit==='point')title+=` · ${number(row.quantity)} ${t('calc.points')}`;
      else if(row.unit==='unit')title+=` · ${number(row.quantity)} ${t('calc.units')}`;
      if(row.adjusted)title+=` · ${t('calc.adjusted')}`;
      text.textContent=title;amount.textContent=range(row.min,row.max);amount.dir='ltr';li.append(text,amount);frag.append(li);
    }
    list.replaceChildren(frag);
    $('breakdownDetails').hidden=!result.rows.length;
    document.querySelectorAll('[data-installments]').forEach(b=>{
      const n=Number(b.dataset.installments);b.setAttribute('aria-pressed',String(n===result.installments));
      b.setAttribute('aria-label',t('calc.payCount',{count:number(n)}));
    });
    $('sendEstimateBtn').href=waURL(estimateMessage(result));
    const vkey=validationKey(result);
    $('sendEstimateBtn').classList.toggle('ready-to-send',result.hasAny&&!vkey);
    updateConversionCtas(result);
    if(errorVisible && vkey){$('calcError').hidden=false;$('calcError').textContent=t(vkey);}
    else{$('calcError').hidden=true;$('calcError').textContent='';errorVisible=false;}
    $('floorArea').setAttribute('aria-invalid',String(errorVisible&&vkey==='calc.needFloor'));
    $('wallArea').setAttribute('aria-invalid',String(errorVisible&&vkey==='calc.needWalls'));
    return result;
  }
  function setLanguage(next,persist=true) {
    lang=langs.includes(next)?next:'he';
    clearTimeout(toastTimer);$('toast').classList.remove('show');
    document.documentElement.lang=lang;
    document.documentElement.dir=['he','ar'].includes(lang)?'rtl':'ltr';
    numberFormat=new Intl.NumberFormat(locales[lang],{maximumFractionDigits:2});
    currencyFormat=new Intl.NumberFormat(locales[lang],{style:'currency',currency:'ILS',minimumFractionDigits:0,maximumFractionDigits:0});
    document.querySelectorAll('[data-i18n]').forEach(el=>el.textContent=t(el.dataset.i18n));
    for(const [attr,dataKey] of [['aria-label','i18nAria'],['placeholder','i18nPlaceholder'],['alt','i18nAlt']]){
      document.querySelectorAll(`[data-${dataKey.replace(/[A-Z]/g,c=>'-'+c.toLowerCase())}]`).forEach(el=>el.setAttribute(attr,t(el.dataset[dataKey])));
    }
    $('languageSelect').value=lang;document.title=t('meta.title');
    document.querySelector('meta[name="description"]').content=t('meta.description');
    document.querySelector('meta[property="og:title"]').content=t('meta.title');
    document.querySelector('meta[property="og:description"]').content=t('meta.description');
    setTheme(theme,false);updateStaticLinks();renderEstimate();
    if(persist){
      save('bathline-language-v1',lang);
      try{const u=new URL(location.href);u.searchParams.set('lang',lang);history.replaceState(null,'',u);}catch(_){}
    }
  }
  function wireArea(sliderId,numberId,key,max) {
    const slider=$(sliderId),input=$(numberId);
    function sync(value,fromSlider=false){
      const clamped=E.clamp(value,0,max);
      const val=Math.round(clamped*2)/2;
      state[key]=val;slider.value=String(val);input.value=String(val);renderEstimate();
    }
    slider.addEventListener('input',()=>sync(slider.value,true));
    input.addEventListener('change',()=>sync(input.value));
    input.addEventListener('input',()=>{
      if(input.value===''||!Number.isFinite(input.valueAsNumber))return;
      const val=E.clamp(input.valueAsNumber,0,max);state[key]=val;slider.value=String(val);renderEstimate();
    });
  }
  wireArea('floorArea','floorAreaNumber','floor',20);
  wireArea('wallArea','wallAreaNumber','walls',80);
  const qtyConfig={
    plumbing:{id:'qtyPlumbing',min:1,max:8},
    movePoints:{id:'qtyMovePoints',min:1,max:6},
    electric:{id:'qtyElectric',min:1,max:8},
    showerSet:{id:'qtyShowerSet',min:1,max:2}
  };
  function setQty(key,value){
    const cfg=qtyConfig[key];if(!cfg)return;
    const next=Math.round(E.clamp(value,cfg.min,cfg.max));
    state.quantities[key]=next;
    const input=$(cfg.id);if(input)input.value=String(next);
    renderEstimate();
  }
  for(const [key,cfg] of Object.entries(qtyConfig)){
    const input=$(cfg.id);
    if(input){
      input.value=String(state.quantities[key]);
      input.addEventListener('input',()=>{if(input.value!=='')setQty(key,input.value);});
      input.addEventListener('change',()=>setQty(key,input.value));
    }
    document.querySelector(`[data-qty-dec="${key}"]`)?.addEventListener('click',()=>setQty(key,(state.quantities[key]||cfg.min)-1));
    document.querySelector(`[data-qty-inc="${key}"]`)?.addEventListener('click',()=>setQty(key,(state.quantities[key]||cfg.min)+1));
  }
  workInputs.forEach(input=>input.addEventListener('change',renderEstimate));
  $('installmentsRange').addEventListener('input',()=>{state.installments=Number($('installmentsRange').value);renderEstimate();});
  document.querySelectorAll('[data-installments]').forEach(button=>button.addEventListener('click',()=>{
    state.installments=Number(button.dataset.installments);$('installmentsRange').value=String(state.installments);renderEstimate();
  }));
  $('fullPackageBtn').addEventListener('click',()=>{
    // Additive: optional items selected by the visitor are never removed.
    workInputs.forEach(input=>{if(E.core.includes(input.value))input.checked=true;});
    state.quantities.plumbing=3;state.quantities.electric=2;state.quantities.showerSet=1;
    for(const [key,id] of [['plumbing','qtyPlumbing'],['electric','qtyElectric'],['showerSet','qtyShowerSet']]){if($(id))$(id).value=String(state.quantities[key]);}
    renderEstimate();notify(t('calc.packageDone'));
  });
  $('resetEstimateBtn').addEventListener('click',()=>{
    state.floor=0;state.walls=0;state.installments=12;state.quantities={plumbing:3,movePoints:1,electric:2,showerSet:1};errorVisible=false;
    for(const id of ['floorArea','wallArea','floorAreaNumber','wallAreaNumber'])$(id).value='0';
    $('installmentsRange').value='12';workInputs.forEach(i=>i.checked=false);renderEstimate();notify(t('calc.resetDone'));
  });
  $('sendEstimateBtn').addEventListener('click',event=>{
    const r=renderEstimate();const key=validationKey(r);
    if(key){event.preventDefault();errorVisible=true;renderEstimate();return;}
    // The normal link click opens a WhatsApp draft. Nothing is automatically sent.
    event.currentTarget.href=waURL(estimateMessage(r));
  });
  $('leadForm').addEventListener('submit',event=>{
    event.preventDefault();
    const name=$('name').value.trim().slice(0,100),city=$('city').value.trim().slice(0,100),details=$('details').value.trim().slice(0,800);
    const msg=`${t('wa.hello')}\n\n${t('contact.name')}: ${name||'—'}\n${t('contact.city')}: ${city||'—'}\n${t('contact.details')}: ${details||'—'}\n\n${t('wa.finance')}`;
    window.open(waURL(msg),'_blank','noopener,noreferrer');
  });
  $('languageSelect').addEventListener('change',event=>setLanguage(event.target.value));
  $('themeBtn').addEventListener('click',()=>setTheme(theme==='light'?'dark':'light'));
  function publicURL(){
    try{
      const u=new URL(location.href);
      if(!['http:','https:'].includes(u.protocol)||['localhost','127.0.0.1','[::1]'].includes(u.hostname)||u.hostname.endsWith('.local'))return null;
      u.search='';u.hash='';u.searchParams.set('lang',lang);return u.href;
    }catch(_){return null;}
  }
  function manualShare(url){
    $('shareUrl').value=url;$('shareError').textContent='';
    const d=$('shareDialog');if(typeof d.showModal==='function')d.showModal();else d.setAttribute('open','');
    $('shareUrl').focus();$('shareUrl').select();
  }
  async function copyURL(url){
    if(!navigator.clipboard?.writeText)throw new Error('Clipboard unavailable');
    await navigator.clipboard.writeText(url);notify(t('share.copied'));
  }
  async function sharePage(){
    const url=publicURL();if(!url){notify(t('share.local'));return;}
    if(typeof navigator.share==='function'){
      try{await navigator.share({title:t('meta.title'),text:t('meta.description'),url});return;}
      catch(error){if(error?.name==='AbortError')return;}
    }
    try{await copyURL(url);}catch(_){manualShare(url);}
  }
  document.querySelectorAll('[data-share]').forEach(button=>button.addEventListener('click',sharePage));
  $('closeShare').addEventListener('click',()=>{
    const d=$('shareDialog');if(typeof d.close==='function')d.close();else d.removeAttribute('open');
  });
  $('copyShare').addEventListener('click',async()=>{
    try{await copyURL($('shareUrl').value);$('closeShare').click();}
    catch(_){$('shareError').textContent=t('share.failed');$('shareUrl').focus();$('shareUrl').select();}
  });
  const back=$('backTop');let scrollFrame=0;
  function renderScroll(){scrollFrame=0;const visible=scrollY>500;back.classList.toggle('show',visible);back.tabIndex=visible?0:-1;}
  window.addEventListener('scroll',()=>{if(!scrollFrame)scrollFrame=requestAnimationFrame(renderScroll);},{passive:true});
  back.addEventListener('click',()=>{window.scrollTo({top:0,behavior:reduced.matches?'auto':'smooth'});$('top').focus({preventScroll:true});});
  renderScroll();
  // Images are the original remotely-hosted inspiration photography. No false project claims.
  document.querySelectorAll('img').forEach(img=>{
    img.addEventListener('error',()=>{img.hidden=true;});
    if(img.complete&&!img.naturalWidth)img.hidden=true;
  });
  const revealNodes=Array.from(document.querySelectorAll('.reveal'));
  let observer;
  function motion(){
    if(reduced.matches){document.documentElement.classList.remove('motion-ready');observer?.disconnect();revealNodes.forEach(el=>el.classList.add('is-in'));return;}
    if(!('IntersectionObserver'in window))return;
    // Never hide an entire long calculator; reveal only short content blocks.
    observer=new IntersectionObserver(entries=>{
      entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-in');observer.unobserve(entry.target);}});
    },{threshold:0.04,rootMargin:'0px 0px 28px 0px'});
    revealNodes.forEach(el=>observer.observe(el));document.documentElement.classList.add('motion-ready');
  }
  reduced.addEventListener?.('change',motion);
  $('calcControls').disabled=false;
  setLanguage(lang,false);motion();
  // Read-only diagnostics for automated verification, no personal data.
  window.BATHLINE_TEST=Object.freeze({
    snapshot:()=>({language:lang,theme,result:E.calculate({...state,works:workInputs.filter(i=>i.checked).map(i=>i.value)},prices)}),
    translationKeys:()=>Object.keys(D[lang]),
    publicURL
  });
})();
