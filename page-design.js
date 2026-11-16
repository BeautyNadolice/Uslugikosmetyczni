/* ============================================================================
   INDEX PAGE DESIGN V2 — DEV VISUAL EDITOR BRIDGE
   V21.72 / 2026-10-06
   - wyłącznie warstwa wizualna TEST/DEV; booking/API/portfolio logic bez zmian
   - NOWOŚĆ V21.33: baza konfiguracji wczytywana teraz z fizycznego pliku
     page-design-config.js (window.DariaPageDesignConfigV1), jeśli obecny.
     localStorage pozostaje jako warstwa "szkicu" nad plikiem fizycznym —
     pozwala kontynuować edycję po odświeżeniu bez utraty niezapisanych zmian,
     ale zapis FIZYCZNY (do pliku) wykonuje teraz index-editor.js.
   ============================================================================ */
(() => {
  'use strict';

  const STORAGE_KEY = 'daria-index-design-v1';
  const CHANNEL = 'DARIA_INDEX_DESIGN_V1';
  const IS_EDITOR_PREVIEW = new URLSearchParams(location.search).has('designPreview');
  let editorModeOverride = null;

  const baseMode = {
    cardX:0, cardY:0, cardPaddingX:10.8, cardPaddingTop:5.9, cardPaddingBottom:4.6,
    cardBgZoom:100, cardBgX:50, cardBgY:50, contentWidth:66,
    logoWidth:88, logoZoom:100, logoCropHeight:78, logoBoxX:0, logoBoxY:0, logoX:0, logoY:0, logoImageScaleY:1.24,
    taglineWidth:105, taglineX:0, taglineY:0, taglineFont:30, taglineLine:.98, taglineWeight:500,
    ctaWidth:67, ctaHeight:58, ctaX:0, ctaY:0, ctaFont:16, ctaRadius:999,
    ctaPaddingLeft:22, ctaPaddingRight:45, ctaTextX:0, ctaTextY:0, ctaArrowSize:34, ctaArrowRight:18, ctaArrowY:0,
    galleryWidth:66, galleryHeight:0, galleryX:0, galleryY:0, galleryGap:9, categoryFont:18, previewRadius:12,
    footerWidth:66, footerX:0, footerY:0, footerFont:11,
    sceneZoom:100, sceneX:50, sceneY:50, sceneOffsetX:0, sceneOffsetY:0,
    sceneBrightness:100, sceneContrast:100, sceneSaturation:100
  };

  const DEFAULTS = {
    version: 3,
    mode: {
      desktop: {...baseMode, cardVh:63},
      mobile: {...baseMode, cardVw:98, cardPaddingTop:5.7, cardPaddingBottom:4.2, contentWidth:67, logoWidth:90, taglineWidth:107, taglineFont:27, ctaWidth:69, ctaHeight:54, ctaFont:15, galleryWidth:67, galleryGap:7, categoryFont:17, previewRadius:10, footerWidth:67, footerFont:10.5}
    },
    text: {
      tagline: 'Piękno zaczyna się\nod detali',
      cta: 'ZAREZERWUJ\nWIZYTĘ',
      ctaArrow: '›',
      footer: '© SD Usługi Kosmetyczne'
    },
    appearance: {
      taglineColor:'#3c2a23', ctaTextColor:'#ffffff', ctaTop:'#dca071', ctaBottom:'#b96e43',
      categoryColor:'#4a3026', footerColor:'#664939', previewFit:'cover', previewMode:'auto'
    },
    visible: { logo:true, tagline:true, cta:true, ctaArrow:true, gallery:true, footer:true, scene:true },
    editor: { showGuides:false, phonePreview:'card' }
  };

  function deepClone(value){ return JSON.parse(JSON.stringify(value)); }
  function merge(base,patch){
    if(!patch||typeof patch!=='object'||Array.isArray(patch))return base;
    Object.keys(patch).forEach(key=>{
      const incoming=patch[key];
      if(incoming&&typeof incoming==='object'&&!Array.isArray(incoming)){
        if(!base[key]||typeof base[key]!=='object'||Array.isArray(base[key]))base[key]={};
        merge(base[key],incoming);
      }else if(incoming!==undefined)base[key]=incoming;
    });
    return base;
  }
  function migrate(config){
    if(!config||typeof config!=='object')return config;
    const out=deepClone(config);
    if(Number(out.version||1)<2){
      out.version=2;
      if(out.text?.cta==='ZAREZERWUJ WIZYTĘ')out.text.cta='ZAREZERWUJ\nWIZYTĘ';
      if(out.text?.tagline==='Piękno zaczyna się od detali')out.text.tagline='Piękno zaczyna się\nod detali';
      out.text=out.text||{}; if(out.text.ctaArrow==null)out.text.ctaArrow='›';
      out.visible=out.visible||{}; if(out.visible.ctaArrow==null)out.visible.ctaArrow=true;
    }
    if(Number(out.version||1)<3){
      out.version=3;
      ['desktop','mobile'].forEach(k=>{
        out.mode=out.mode||{}; out.mode[k]=out.mode[k]||{};
        if(out.mode[k].ctaTextX==null)out.mode[k].ctaTextX=0;
        if(out.mode[k].ctaTextY==null)out.mode[k].ctaTextY=0;
        if(out.mode[k].ctaArrowY==null)out.mode[k].ctaArrowY=0;
      });
      out.editor=out.editor||{}; if(!out.editor.phonePreview)out.editor.phonePreview='card';
    }
    return out;
  }

  /* V21.33: fizyczny plik page-design-config.js (jeśli załadowany w HTML) jest
     teraz BAZĄ zamiast wbudowanych DEFAULTS. localStorage pozostaje wyłącznie
     jako warstwa szkicu roboczego nad tą bazą (przetrwa odświeżenie edytora
     przed fizycznym zapisem). */
  function physicalFileConfig(){
    try {
      if (window.DariaPageDesignConfigV1 && typeof window.DariaPageDesignConfigV1 === 'object') {
        return deepClone(window.DariaPageDesignConfigV1);
      }
    } catch(_) {}
    return null;
  }

  function loadStored(){
    /* V21.72: localStorage is a DEV-editor draft only.
       The normal client INDEX must render deterministically from the physical
       page-design-config.js, regardless of which localhost port opened it. */
    if(!IS_EDITOR_PREVIEW) return null;
    try{const raw=localStorage.getItem(STORAGE_KEY);if(!raw)return null;const value=JSON.parse(raw);if(!value||Number(value.version||3)!==3||value.__pxGeometryMigrated===true){localStorage.removeItem(STORAGE_KEY);return null;}return value;}catch(_){try{localStorage.removeItem(STORAGE_KEY);}catch(_){}return null;}
  }
  function saveStored(config){try{localStorage.setItem(STORAGE_KEY,JSON.stringify(config));}catch(_){}}
  function num(value,fallback){const n=Number(value);return Number.isFinite(n)?n:fallback;}
  function setVar(root,key,value){root.style.setProperty(key,String(value));}
  function setUnit(root,key,value,fallback,unit){setVar(root,key,`${num(value,fallback)}${unit||''}`);}
  function activeMode(){return window.matchMedia('(max-width: 760px), (max-width: 900px) and (hover: none) and (pointer: coarse)').matches?'mobile':'desktop';}
  function effectiveMode(){return IS_EDITOR_PREVIEW && (editorModeOverride==='desktop'||editorModeOverride==='mobile') ? editorModeOverride : activeMode();}

  /* Kolejność scalania: DEFAULTS (wbudowane, awaryjne) <- plik fizyczny (jeśli jest)
     <- szkic z localStorage (jeśli jest, np. niezapisane zmiany w edytorze). */
  function normalize(draft){
    let out = deepClone(DEFAULTS);
    const fileCfg = physicalFileConfig();
    if (fileCfg) out = merge(out, migrate(fileCfg));
    if (draft) out = merge(out, migrate(draft));
    return out;
  }

  const initialFileConfig = physicalFileConfig();
  const initialDraft = loadStored();
  let current=normalize(initialDraft);

  function applyText(config){
    const tagline=document.querySelector('.landing-tagline-v2111 p');
    if(tagline&&config.text?.tagline!=null)tagline.textContent=String(config.text.tagline);
    const ctaLabel=document.querySelector('.landing-cta-label-v2127')||document.querySelector('.landing-cta-v217 span:not([aria-hidden])');
    if(ctaLabel&&config.text?.cta!=null)ctaLabel.textContent=String(config.text.cta);
    const arrow=document.querySelector('.landing-cta-arrow-v2127');
    if(arrow&&config.text?.ctaArrow!=null)arrow.textContent=String(config.text.ctaArrow);
    const footer=document.querySelector('.landing-footer-v2111 span');
    if(footer&&config.text?.footer!=null)footer.textContent=String(config.text.footer);
  }

  function applyPreviewMode(config){
    const container=document.getElementById('portfolio-container'); if(!container)return;
    const desired=String(config.appearance?.previewMode||'auto');
    container.querySelectorAll('.portfolio-category-grid-v2111').forEach(grid=>{
      const buttons=Array.from(grid.querySelectorAll('.portfolio-preview-button-v2124'));if(!buttons.length)return;
      if(desired==='one'){buttons.forEach((b,i)=>{b.hidden=i>0;});grid.classList.add('is-single');}
      else if(desired==='two'){buttons.forEach((b,i)=>{b.hidden=i>1;});grid.classList.toggle('is-single',buttons.length<=1);}
      else{buttons.forEach(b=>{b.hidden=false;});grid.classList.toggle('is-single',buttons.length<=1);}
    });
    if(desired==='auto'&&typeof window.schedulePortfolioLayoutV2124==='function')requestAnimationFrame(()=>window.schedulePortfolioLayoutV2124());
  }

  function applyVisibility(config){
    const map={logo:'.brand-logo-main-v217',tagline:'.landing-tagline-v2111',cta:'.landing-cta-v217',ctaArrow:'.landing-cta-arrow-v2127',gallery:'.portfolio-showcase-v2111',footer:'.landing-footer-v2111',scene:'.salon-photo-stage-v2118'};
    Object.entries(map).forEach(([key,selector])=>{const node=document.querySelector(selector);if(node)node.classList.toggle('pd-hidden-v1',config.visible?.[key]===false);});
  }

  function px(v, fallback=0){ const n=Number(v); return Number.isFinite(n)?`${n}px`:`${fallback}px`; }
  function pct(v, fallback=0){ const n=Number(v); return Number.isFinite(n)?`${n}%`:`${fallback}%`; }

  function applyLiveDom(m,desktop,changed){
    /* V21.72: mode-specific geometry is owned by index-desktop.css / index-mobile.css.
       JS only selects the authoritative mode. This prevents stale inline styles from
       one viewport from leaking into the other. */
    const root=document.documentElement;
    if(!root) return;
    root.dataset.pdMode=desktop?'desktop':'mobile';
  }
  function applyModeVars(root,prefix,m,desktop){
    if(desktop)setUnit(root,`--pd-${prefix}-card-vh`,m.cardVh,63,'vh');
    else setUnit(root,`--pd-${prefix}-card-vw`,m.cardVw,98,'vw');
    setUnit(root,`--pd-${prefix}-card-x`,m.cardX,0,'px'); setUnit(root,`--pd-${prefix}-card-y`,m.cardY,0,'px');
    const cx=num(m.cardX,0), cy=num(m.cardY,0);
    setVar(root,`--pd-${prefix}-card-transform`,(cx||cy)?`perspective(1800px) rotateX(.12deg) rotateY(-.34deg) translate(${cx}px,${cy}px) translateZ(0)`:'none');
    const lbx=num(m.logoBoxX,0), lby=num(m.logoBoxY,0);
    setVar(root,`--pd-${prefix}-logo-transform`,(lbx||lby)?`translate(${lbx}px,${lby}px)`:'none');
    const tx=num(m.taglineX,0), ty=num(m.taglineY,0);
    setVar(root,`--pd-${prefix}-tagline-transform`,(tx||ty)?`translate(${tx}px,${ty}px)`:'none');
    const qx=num(m.ctaX,0), qy=num(m.ctaY,0);
    setVar(root,`--pd-${prefix}-cta-transform`,(qx||qy)?`translate(${qx}px,${qy}px)`:'none');
    const qtx=num(m.ctaTextX,0), qty=num(m.ctaTextY,0);
    setVar(root,`--pd-${prefix}-cta-text-transform`,(qtx||qty)?`translate(${qtx}px,${qty}px)`:'none');
    const gx=num(m.galleryX,0), gy=num(m.galleryY,0);
    setVar(root,`--pd-${prefix}-gallery-transform`,(gx||gy)?`translate(${gx}px,${gy}px)`:'none');
    const fx=num(m.footerX,0), fy=num(m.footerY,0);
    setVar(root,`--pd-${prefix}-footer-transform`,(fx||fy)?`translate(${fx}px,${fy}px)`:'none');
    setUnit(root,`--pd-${prefix}-pad-x`,m.cardPaddingX,10.8,'%'); setUnit(root,`--pd-${prefix}-pad-top`,m.cardPaddingTop,desktop?5.9:5.7,'%'); setUnit(root,`--pd-${prefix}-pad-bottom`,m.cardPaddingBottom,desktop?4.6:4.2,'%');
    setUnit(root,`--pd-${prefix}-card-bg-zoom`,m.cardBgZoom,100,'%'); setUnit(root,`--pd-${prefix}-card-bg-x`,m.cardBgX,50,'%'); setUnit(root,`--pd-${prefix}-card-bg-y`,m.cardBgY,50,'%');
    setUnit(root,`--pd-${prefix}-content-width`,m.contentWidth,desktop?66:67,'%');
    setUnit(root,`--pd-${prefix}-logo-width`,m.logoWidth,desktop?88:90,'%'); setUnit(root,`--pd-${prefix}-logo-zoom`,m.logoZoom,100,'%'); setUnit(root,`--pd-${prefix}-logo-crop-height`,m.logoCropHeight,70,'%'); setVar(root,`--pd-${prefix}-logo-crop-ratio`,num(m.logoCropHeight,70)/100); setUnit(root,`--pd-${prefix}-logo-box-x`,m.logoBoxX,0,'px'); setUnit(root,`--pd-${prefix}-logo-box-y`,m.logoBoxY,0,'px'); setUnit(root,`--pd-${prefix}-logo-x`,m.logoX,0,'px'); setUnit(root,`--pd-${prefix}-logo-y`,m.logoY,0,'px'); setVar(root,`--pd-${prefix}-logo-sy`,num(m.logoImageScaleY,1.24));
    setUnit(root,`--pd-${prefix}-tagline-width`,m.taglineWidth,desktop?105:107,'%'); setUnit(root,`--pd-${prefix}-tagline-x`,m.taglineX,0,'px'); setUnit(root,`--pd-${prefix}-tagline-y`,m.taglineY,0,'px'); setUnit(root,`--pd-${prefix}-tagline-font`,m.taglineFont,desktop?30:27,'px'); setVar(root,`--pd-${prefix}-tagline-line`,num(m.taglineLine,.98)); setVar(root,`--pd-${prefix}-tagline-weight`,num(m.taglineWeight,500));
    setUnit(root,`--pd-${prefix}-cta-width`,m.ctaWidth,desktop?67:69,'%'); setUnit(root,`--pd-${prefix}-cta-height`,m.ctaHeight,desktop?58:54,'px'); setUnit(root,`--pd-${prefix}-cta-x`,m.ctaX,0,'px'); setUnit(root,`--pd-${prefix}-cta-y`,m.ctaY,0,'px'); setUnit(root,`--pd-${prefix}-cta-font`,m.ctaFont,desktop?16:15,'px'); setUnit(root,`--pd-${prefix}-cta-radius`,m.ctaRadius,999,'px'); setUnit(root,`--pd-${prefix}-cta-pad-left`,m.ctaPaddingLeft,22,'px'); setUnit(root,`--pd-${prefix}-cta-pad-right`,m.ctaPaddingRight,45,'px'); setUnit(root,`--pd-${prefix}-cta-text-x`,m.ctaTextX,0,'px'); setUnit(root,`--pd-${prefix}-cta-text-y`,m.ctaTextY,0,'px'); setUnit(root,`--pd-${prefix}-cta-arrow-size`,m.ctaArrowSize,34,'px'); setUnit(root,`--pd-${prefix}-cta-arrow-right`,m.ctaArrowRight,18,'px'); setUnit(root,`--pd-${prefix}-cta-arrow-y`,m.ctaArrowY,0,'px'); setVar(root,`--pd-${prefix}-cta-arrow-transform`,`translateY(calc(-50% + ${num(m.ctaArrowY,0)}px))`); setVar(root,`--pd-${prefix}-cta-arrow-display`,current?.visible?.ctaArrow===false?'none':'inline');
    setUnit(root,`--pd-${prefix}-gallery-width`,m.galleryWidth,desktop?66:67,'%'); setUnit(root,`--pd-${prefix}-gallery-x`,m.galleryX,0,'px'); setUnit(root,`--pd-${prefix}-gallery-y`,m.galleryY,0,'px'); setUnit(root,`--pd-${prefix}-gallery-gap`,m.galleryGap,desktop?9:7,'px'); setUnit(root,`--pd-${prefix}-category-font`,m.categoryFont,desktop?18:17,'px'); setUnit(root,`--pd-${prefix}-preview-radius`,m.previewRadius,desktop?12:10,'px');
    const gh=num(m.galleryHeight,0); setVar(root,`--pd-${prefix}-gallery-height`,gh>0?`${gh}%`:'auto'); setVar(root,`--pd-${prefix}-gallery-flex`,gh>0?`0 0 ${gh}%`:'1 1 auto');
    setUnit(root,`--pd-${prefix}-footer-width`,m.footerWidth,desktop?66:67,'%'); setUnit(root,`--pd-${prefix}-footer-x`,m.footerX,0,'px'); setUnit(root,`--pd-${prefix}-footer-y`,m.footerY,0,'px'); setUnit(root,`--pd-${prefix}-footer-font`,m.footerFont,desktop?11:10.5,'px');
    const sceneZoom=num(m.sceneZoom,100); setVar(root,`--pd-${prefix}-scene-size`,sceneZoom===100?'cover':`${sceneZoom}% auto`); setUnit(root,`--pd-${prefix}-scene-x`,m.sceneX,50,'%'); setUnit(root,`--pd-${prefix}-scene-y`,m.sceneY,50,'%'); setUnit(root,`--pd-${prefix}-scene-off-x`,m.sceneOffsetX,0,'px'); setUnit(root,`--pd-${prefix}-scene-off-y`,m.sceneOffsetY,0,'px'); setUnit(root,`--pd-${prefix}-scene-bright`,m.sceneBrightness,100,'%'); setUnit(root,`--pd-${prefix}-scene-contrast`,m.sceneContrast,100,'%'); setUnit(root,`--pd-${prefix}-scene-sat`,m.sceneSaturation,100,'%');
  }

  function applyConfig(next,options={}){
    current=normalize(next); const root=document.documentElement; const d=current.mode.desktop,m=current.mode.mobile;
    applyModeVars(root,'d',d,true); applyModeVars(root,'m',m,false);
    setVar(root,'--pd-tagline-color',current.appearance.taglineColor||'#3c2a23'); setVar(root,'--pd-cta-text',current.appearance.ctaTextColor||'#fff'); setVar(root,'--pd-cta-top',current.appearance.ctaTop||'#dca071'); setVar(root,'--pd-cta-bottom',current.appearance.ctaBottom||'#b96e43'); setVar(root,'--pd-category-color',current.appearance.categoryColor||'#4a3026'); setVar(root,'--pd-footer-color',current.appearance.footerColor||'#664939'); setVar(root,'--pd-preview-fit',current.appearance.previewFit==='contain'?'contain':'cover');
    applyText(current); applyVisibility(current); applyPreviewMode(current);
    const renderMode=effectiveMode();
    root.dataset.pdMode=renderMode;
    if(options.live) applyLiveDom(current.mode[renderMode],renderMode==='desktop',options.changed);
    root.dataset.pageDesignV1='1'; root.classList.toggle('pd-editor-guides-v2',IS_EDITOR_PREVIEW&&!!current.editor?.showGuides);
    if(options.save)saveStored(next);
    if(window.parent&&window.parent!==window)window.parent.postMessage({channel:CHANNEL,type:'applied',mode:effectiveMode(),config:current},'*');
    return current;
  }

  const observer=new MutationObserver(()=>{applyText(current);applyVisibility(current);applyPreviewMode(current);});
  let resizeTimer=0;
  function syncEditorViewport(){
    if(!IS_EDITOR_PREVIEW)return;
    clearTimeout(resizeTimer);
    resizeTimer=setTimeout(()=>{
      /* V21.72: resize changes the preview shell, but never changes the
         editor-selected mode. The parent editor sends the authoritative
         desktop/mobile mode with each apply. */
      try { applyConfig(current,{save:false,live:true,changed:'__viewport__'}); } catch(_) {}
    },40);
  }
  function startObserver(){const host=document.getElementById('portfolio-container');if(host)observer.observe(host,{childList:true,subtree:true});
    if(IS_EDITOR_PREVIEW) window.addEventListener('resize',syncEditorViewport,{passive:true});
  }
  window.addEventListener('message',event=>{
    const data=event.data;if(!data||data.channel!==CHANNEL)return;
    if(data.type==='apply'){ if(data.mode==='desktop'||data.mode==='mobile') editorModeOverride=data.mode; applyConfig(data.config,{save:false,live:IS_EDITOR_PREVIEW,changed:data.changed||'__all__'}); }
    if(data.type==='save'){ if(data.mode==='desktop'||data.mode==='mobile') editorModeOverride=data.mode; applyConfig(data.config,{save:true,live:IS_EDITOR_PREVIEW,changed:data.changed||'__all__'}); }
    if(data.type==='reset'){try{localStorage.removeItem(STORAGE_KEY);}catch(_){}applyConfig(null,{save:false,live:true,changed:'__all__'});}
    if(data.type==='get')event.source?.postMessage({channel:CHANNEL,type:'state',config:current,mode:activeMode(),hasPhysicalFile:!!physicalFileConfig()},'*');
  });
  window.DariaPageDesignV1={
    STORAGE_KEY,
    DEFAULTS:deepClone(DEFAULTS),
    get:()=>deepClone(current),
    apply:(config,options={})=>{ if(options.mode==='desktop'||options.mode==='mobile') editorModeOverride=options.mode; return applyConfig(config,{save:false,live:options.live??IS_EDITOR_PREVIEW,changed:options.changed||'__all__'}); },
    save:(config,options={})=>{ if(options.mode==='desktop'||options.mode==='mobile') editorModeOverride=options.mode; return applyConfig(config,{save:true,live:options.live??IS_EDITOR_PREVIEW,changed:options.changed||'__all__'}); },
    reset:()=>{try{localStorage.removeItem(STORAGE_KEY);}catch(_){}return applyConfig(null,{save:false});},
    hasPhysicalFile:()=>!!physicalFileConfig()
  };
  /* V21.33: strona ma zastosować konfigurację zawsze, gdy istnieje plik fizyczny,
     szkic w localStorage, LUB gdy to podgląd edytora — dzięki temu produkcyjny
     index.html też honoruje zapisany page-design-config.js. */
  const boot=()=>{
    /* V21.50: editor preview starts from the physical V3 percentage/VH/VW config.
       A stale V4/px draft is never applied at boot. Live changes are applied only
       after an explicit editor action. */
    if(IS_EDITOR_PREVIEW){ startObserver(); return; }
    if(initialFileConfig||initialDraft){applyConfig(initialDraft,{save:false});startObserver();}
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();