/* Apply saved display preferences early; never store personal lead data. */
(function(){'use strict';
 const allowed=['he','ar','en','ru'];
 const get=k=>{try{return localStorage.getItem(k);}catch(_){return null;}};
 let query=null;try{query=new URL(location.href).searchParams.get('lang');}catch(_){}
 const saved=get('bathline-language-v1');
 const language=allowed.includes(query)?query:(allowed.includes(saved)?saved:'he');
 const savedTheme=get('bathline-theme-v1');
 const theme=['dark','light'].includes(savedTheme)?savedTheme:'light';
 document.documentElement.lang=language;
 document.documentElement.dir=['he','ar'].includes(language)?'rtl':'ltr';
 document.documentElement.dataset.theme=theme;
 window.BATHLINE_INIT={language,theme};
})();
