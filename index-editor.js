(() => {
  'use strict';
  const CHANNEL = 'DARIA_INDEX_DESIGN_V1';
  const EDITOR_VERSION = 'V21.72';
  const PAGE_DESIGN_SRC = 'page-design.js?v=21.72';
  const PAGE_DESIGN_CONFIG_SRC = 'page-design-config.js?v=21.72';
  const STORAGE_KEY = 'daria-index-design-v1';
  const CONFIG_FILE_NAME = 'page-design-config.js';
  const HANDLE_DB_NAME = 'NailArtIndexDevSyncV1';
  const FALLBACK_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbz__JS6RJOB8VwEvbmXc4J_22k3bpBLr-oCiogTIhzz3sXc5DzXfbggnfa8VhInwuWP2g/exec';
  const app = document.querySelector('.editor-app');
  const frame = document.getElementById('designPreview');
  const shell = document.getElementById('previewShell');
  const toastEl = document.getElementById('toast');
  const modeButtons = Array.from(document.querySelectorAll('[data-device]'));
  const selectedLabel = document.getElementById('selectedLabel');
  const selection = document.getElementById('selectionChip');
  const showSelection = document.getElementById('showSelection');
  const showGuides = document.getElementById('showGuides');
  const statusEl = document.getElementById('indexDevStatusV1');
  const modeEl = document.getElementById('indexDevSyncModeV1');
  let config = null;
  let mode = 'desktop';
  let selected = 'card';
  let frameReady = false;
  let drag = null;
  let localFileHandle = null;
  let dirtyPhysical = false; /* true = w edytorze są zmiany jeszcze niezapisane fizycznie */
  const undoStack=[]; const redoStack=[]; let historyBusy=false; let acceptNextState=false;
  const isEmbedded=new URLSearchParams(location.search).has('embedded');
  let embeddedControlsCollapsed=false;

  function sizePreviewShell(){
    if (!shell) return;
    const host = shell.parentElement;
    const hs = host ? getComputedStyle(host) : null;
    const hr = host?.getBoundingClientRect?.();
    const padX = hs ? (parseFloat(hs.paddingLeft)||0) + (parseFloat(hs.paddingRight)||0) : 24;
    const padY = hs ? (parseFloat(hs.paddingTop)||0) + (parseFloat(hs.paddingBottom)||0) : 24;
    const visibleH = Math.max(240, window.innerHeight - Math.max(0, hr?.top || 0));
    const availableW = Math.max(240, (host?.clientWidth || window.innerWidth) - padX);
    const availableH = Math.max(240, Math.min(host?.clientHeight || visibleH, visibleH) - padY);

    let width, height;
    if (mode === 'mobile') {
      const phoneView = config?.editor?.phonePreview === 'screen' ? 'screen' : 'card';
      const ratio = phoneView === 'screen' ? (19.5 / 9) : 1.5;
      const maxPhoneW = Math.min(phoneView === 'screen' ? 430 : 520, availableW);
      width = maxPhoneW;
      height = width * ratio;
      if (height > availableH) { height = availableH; width = height / ratio; }
      shell.classList.toggle('phone-card-only', phoneView === 'card');
    } else {
      shell.classList.remove('phone-card-only');
      width = Math.min(1600, availableW);
      height = width * 9 / 16;
      if (height > Math.min(900, availableH)) { height = Math.min(900, availableH); width = height * 16 / 9; }
    }
    shell.style.width = `${Math.max(240, Math.round(width))}px`;
    shell.style.height = `${Math.max(240, Math.round(height))}px`;
  }

  const elements = {
    card: { selector: '.container.landing-v217', label: 'Karta', x: 'cardX', y: 'cardY' },
    logo: { selector: '.brand-logo-main-v217', label: 'Logo', x: 'logoBoxX', y: 'logoBoxY' },
    tagline: { selector: '.landing-tagline-v2111', label: 'Hasło', x: 'taglineX', y: 'taglineY' },
    cta: { selector: '.landing-cta-v217', label: 'Przycisk', x: 'ctaX', y: 'ctaY' },
    gallery: { selector: '.portfolio-showcase-v2111', label: 'Galeria', x: 'galleryX', y: 'galleryY' },
    footer: { selector: '.landing-footer-v2111', label: 'Stopka', x: 'footerX', y: 'footerY' }
  };

  function toast(text){
    toastEl.textContent = text; toastEl.hidden = false;
    clearTimeout(toastEl._t); toastEl._t = setTimeout(() => { toastEl.hidden = true; }, 2300);
  }

  /* ---------- STATUS PANEL (parytet z ADMIN DEV: zawsze widać tryb zapisu
     i wynik ostatniej operacji, nie tylko dymek na zaznaczonym elemencie) ---------- */
  function runtimeMode(){ return 'local-file'; }
  function runtimeLabel(){
    const m = runtimeMode();
    return 'LOCAL DEV — zapis fizyczny do page-design-config.js (GitHub zablokowany)';
  }
  function setStatus(text, kind=''){
    if (!statusEl) return;
    statusEl.textContent = text;
    statusEl.className = 'index-dev-v1-status';
    if (kind === 'ok') statusEl.classList.add('is-ok');
    if (kind === 'warn') statusEl.classList.add('is-warn');
  }
  function refreshModeLabel(){
    if (modeEl) modeEl.textContent = runtimeLabel();
    const saveBtn = document.getElementById('savePhysicalBtn');
    if (saveBtn) saveBtn.textContent = runtimeMode() === 'github' ? 'Zapisz do GitHub / INDEX (nieaktywne)' : 'Zapisz plik INDEX (fizycznie)';
  }

  function deepClone(v){ return JSON.parse(JSON.stringify(v)); }
  function getPath(obj,path){ return path.split('.').reduce((a,k)=>a?.[k],obj); }
  function setPath(obj,path,value){ const p=path.split('.'); let o=obj; p.slice(0,-1).forEach(k=>o=o[k]||(o[k]={})); o[p.at(-1)]=value; }
  function currentMode(){ return config?.mode?.[mode]; }

  function post(type, extra={}){
    if (!frame.contentWindow || !config) return;
    acceptNextState = false;
    const payload={channel:CHANNEL,type,config:deepClone(config),mode,...extra};
    /* V21.37: nie polegamy wyłącznie na postMessage. Jeśli bridge strony jest
       już załadowany, wołamy jego API bezpośrednio; postMessage zostaje jako
       drugi kanał i obsługuje również późne załadowanie bridge. */
    try {
      const api=frame.contentWindow.DariaPageDesignV1;
      if(api && typeof api.apply==='function' && (type==='apply'||type==='save')) {
        api[type==='save'?'save':'apply'](deepClone(config), {live:true, changed: extra.changed || '__all__', mode});
      }
    } catch(_) {}
    try { frame.contentWindow.postMessage(payload, '*'); } catch(_) {}
  }
  function saveStored(value){ try{ localStorage.setItem(STORAGE_KEY, JSON.stringify(value)); }catch(_){} }
  function isV3PercentConfig(value){ return !!value && typeof value==='object' && Number(value.version||3)===3 && value.mode && value.mode.desktop && value.mode.mobile && value.__pxGeometryMigrated!==true; }
  function sanitizeStored(value){ if(isV3PercentConfig(value)) return value; try{ localStorage.removeItem(STORAGE_KEY); }catch(_){} return null; }
  function snapshot(){ return config ? deepClone(config) : null; }
  function pushHistory(){ if(!config) return; const snap=snapshot(); const last=undoStack.at(-1); if(last && JSON.stringify(last)===JSON.stringify(snap)) return; undoStack.push(snap); if(undoStack.length>50) undoStack.shift(); redoStack.length=0; refreshHistoryButtons(); }
  function refreshHistoryButtons(){ document.getElementById('undoBtn')?.toggleAttribute('disabled',!undoStack.length); document.getElementById('redoBtn')?.toggleAttribute('disabled',!redoStack.length); }
  function restoreSnapshot(snap){ if(!snap)return; historyBusy=true; config=deepClone(snap); apply(false,false); historyBusy=false; refreshHistoryButtons(); }
  function undo(){ if(!undoStack.length||!config)return; redoStack.push(snapshot()); const snap=undoStack.pop(); restoreSnapshot(snap); toast('Cofnięto zmianę'); }
  function redo(){ if(!redoStack.length||!config)return; undoStack.push(snapshot()); const snap=redoStack.pop(); restoreSnapshot(snap); toast('Przywrócono zmianę'); }

  function apply(save=false, recordHistory=true, changed=null){
    if (!config) return;
    acceptNextState = false;
    if (recordHistory && !historyBusy) pushHistory();
    updateFields(); post(save?'save':'apply', changed ? {changed} : {}); setTimeout(updateSelection,40);
    if (!save) { dirtyPhysical = true; setStatus('Zmiany są robocze w DEV. Zapis fizyczny wymaga osobnego przycisku i pliku page-design-config.js.', 'warn'); }
  }
  function loadLocalFallback(){ try{return sanitizeStored(JSON.parse(localStorage.getItem(STORAGE_KEY)||'null'));}catch(_){try{localStorage.removeItem(STORAGE_KEY);}catch(_){} return null;} }
  function requestState(){ acceptNextState = true; frame.contentWindow?.postMessage({channel:CHANNEL,type:'get'}, '*'); }

  window.addEventListener('message', event => {
    const data=event.data; if(!data||data.channel!==CHANNEL)return;
    if(data.type==='toggleEmbeddedControls' && isEmbedded){
      embeddedControlsCollapsed=!embeddedControlsCollapsed;
      document.body.classList.toggle('embedded-controls-collapsed', embeddedControlsCollapsed);
      const button=document.getElementById('embeddedControlToggle');
      if(button){ button.textContent=embeddedControlsCollapsed?'＋':'—'; button.title=embeddedControlsCollapsed?'Pokaż ustawienia INDEX':'Zwiń ustawienia INDEX'; }
      return;
    }
    if((data.type==='state'||data.type==='applied')&&data.config){
      const incoming=sanitizeStored(data.config);
      if(!incoming) return;
      /* V21.50: odpowiedź GET z iframe nie może nadpisać świeżej konfiguracji
         użytkownika. To była przyczyna powrotu do bazy po kliknięciu/zmianie:
         opóźniony 'state' z bootu wygrywał z bieżącym szkicem DEV. */
      if(data.type==='state'){
        if(!acceptNextState) return;
        acceptNextState = false;
        config=deepClone(incoming);
      } else if(!config){
        config=deepClone(incoming);
      }
      updateFields(); syncPhonePreviewButtons(); sizePreviewShell(); attachPreviewEvents(); updateSelection();
    }
  });

  function injectPreviewBridge(){
    try{
      const doc=frame.contentDocument; if(!doc) return;
      /* V21.68: index.html already loads the real bridge/config. Do not identify
         those scripts only by data-* markers, because the normal <script src>
         tags do not have markers. A second page-design.js creates a duplicate
         bridge and can re-run boot/apply in a different order. */
      const hasConfigScript=Array.from(doc.scripts||[]).some(script=>/\/(?:page-design-config)\.js(?:[?#]|$)/.test(script.src));
      const hasDesignScript=Array.from(doc.scripts||[]).some(script=>/\/(?:page-design)\.js(?:[?#]|$)/.test(script.src));
      const append=(src,marker)=>new Promise((resolve,reject)=>{
        const script=doc.createElement('script');
        script.src=src;
        if(marker==='dariaPageDesignConfig') script.dataset.dariaPageDesignConfig='1';
        if(marker==='dariaPageDesign') script.dataset.dariaPageDesign='1';
        script.onload=resolve; script.onerror=reject;
        (doc.head||doc.documentElement).appendChild(script);
      });
      setStatus('Podgląd INDEX V21.72: ładowanie konfiguracji…','warn');
      const chain = hasConfigScript ? Promise.resolve() : append(PAGE_DESIGN_CONFIG_SRC,'dariaPageDesignConfig');
      chain.then(()=>hasDesignScript ? null : append(PAGE_DESIGN_SRC,'dariaPageDesign'))
        .then(()=>{setStatus('Podgląd INDEX V21.72 gotowy.','ok');requestState();})
        .catch(()=>setStatus('Podgląd działa, ale nie udało się dołączyć konfiguracji edytora. Uruchom DEV z tego samego serwera HTTP.','warn'));
    }catch(_){ setStatus('Podgląd działa, ale nie udało się dołączyć warstwy edytora. Uruchom DEV z tego samego serwera HTTP.','warn'); }
  }

  frame.addEventListener('load', () => {
    frameReady=true;
    /* V21.47: po otwarciu preview NIE wysyłamy automatycznie config do LIVE DOM.
       Najpierw pokazujemy natywny INDEX z fizycznego page-design-config.js.
       Konfigurację nakładamy dopiero po świadomej zmianie użytkownika. */
    injectPreviewBridge();
    requestState();
    setTimeout(() => {
      if(!config) config=loadLocalFallback();
      if(config) { config.version=3; delete config.__pxGeometryMigrated; updateFields(); syncPhonePreviewButtons(); }
      attachPreviewEvents();
      updateSelection();
    },250);
  });

  modeButtons.forEach(btn => btn.addEventListener('click', () => {
    mode=btn.dataset.device;
    modeButtons.forEach(b=>b.classList.toggle('active',b===btn));
    shell.classList.toggle('desktop',mode==='desktop');
    shell.classList.toggle('mobile',mode==='mobile');
    app.classList.toggle('is-mobile',mode==='mobile');
    syncPhonePreviewButtons();
    sizePreviewShell();
    updateFields();
    /* V21.72: najpierw pozwól przeglądarce zakończyć zmianę geometrii iframe,
       dopiero potem wyślij konfigurację. Dzięki temu page-design.js odczyta
       właściwy activeMode() z nowej szerokości iframe. */
    requestAnimationFrame(() => requestAnimationFrame(() => {
      apply(false, true, '__all__');
      setTimeout(updateSelection,220);
    }));
  }));

  document.querySelectorAll('[data-select-element]').forEach(btn=>btn.addEventListener('click',()=>selectElement(btn.dataset.selectElement)));
  function updateEditorPanels(){
    const target = selected;
    document.querySelectorAll('.editor-target-panel').forEach(panel=>{
      const panelKey = panel.dataset.editorPanel || '';
      const show = panelKey === target || (target === 'card' && panelKey === 'card');
      panel.hidden = !show;
      if(show){ panel.open = true; }
    });
  }

  function selectElement(key){
    if(!elements[key])return;
    selected=key;
    selectedLabel.textContent=elements[key].label;
    document.querySelectorAll('[data-select-element]').forEach(b=>b.classList.toggle('active',b.dataset.selectElement===key));
    updateEditorPanels();
    updateSelection();
    const activePanel=document.querySelector(`.editor-target-panel[data-editor-panel="${key}"]`);
    if(activePanel) activePanel.scrollIntoView({block:'nearest',behavior:'smooth'});
    /* V21.50: po zaznaczeniu Logo pokazujemy jego rzeczywiste pole/maskę,
       ale nie zapisujemy żadnej zmiany konfiguracji. */
    if(key==='logo' && config) post('apply',{changed:`mode.${mode}.logoWidth`});
  }

  function attachPreviewEvents(){
    let doc; try{doc=frame.contentDocument;}catch(_){return;}
    if(!doc||doc.__dariaEditorBound)return; doc.__dariaEditorBound=true;
    doc.addEventListener('click', event => {
      for(const [key,meta] of Object.entries(elements)){
        if(event.target.closest(meta.selector)){ event.preventDefault(); event.stopPropagation(); selectElement(key); break; }
      }
    },true);
    doc.addEventListener('pointerdown', event => {
      const meta=elements[selected]; const node=event.target.closest(meta?.selector||'.__none__');
      if(!node||event.button!==0)return;
      if(event.target.closest('.landing-menu-v217,.portfolio-preview-button-v2124'))return;
      event.preventDefault(); const m=currentMode();
      drag={startX:event.clientX,startY:event.clientY,baseX:Number(m[meta.x]||0),baseY:Number(m[meta.y]||0),meta};
      try{node.setPointerCapture(event.pointerId);}catch(_){}
    },true);
    doc.addEventListener('pointermove', event => {
      if(!drag||!config)return; const m=currentMode();
      m[drag.meta.x]=Math.round((drag.baseX+event.clientX-drag.startX)*10)/10;
      m[drag.meta.y]=Math.round((drag.baseY+event.clientY-drag.startY)*10)/10;
      apply(false, false, `mode.${mode}.${drag.meta.x}`); updateFields(); updateSelection();
      dirtyPhysical = true; setStatus('Zmiany są tylko w podglądzie / szkicu przeglądarki. Kliknij „Zapisz plik INDEX”, aby zapisać fizycznie.', 'warn');
    },true);
    doc.addEventListener('pointerup',()=>{drag=null;},true);
    doc.addEventListener('pointercancel',()=>{drag=null;},true);
  }

  function updateSelection(){
    if(!frameReady||!showSelection?.checked){ selection.style.display='none'; return; }
    try{
      const node=frame.contentDocument?.querySelector(elements[selected]?.selector);
      if(!node){selection.style.display='none';return;}
      const r=node.getBoundingClientRect(),fr=frame.getBoundingClientRect(),sr=shell.getBoundingClientRect();
      const scaleX=fr.width/frame.contentWindow.innerWidth, scaleY=fr.height/frame.contentWindow.innerHeight;
      selection.dataset.label=elements[selected].label+' — przeciągnij'; selection.style.display='block';
      selection.style.left=(fr.left-sr.left+r.left*scaleX)+'px'; selection.style.top=(fr.top-sr.top+r.top*scaleY)+'px';
      selection.style.width=Math.max(8,r.width*scaleX)+'px'; selection.style.height=Math.max(8,r.height*scaleY)+'px';
    }catch(_){selection.style.display='none';}
  }
  window.addEventListener('resize',()=>{sizePreviewShell();updateSelection();});

  function syncPhonePreviewButtons(){
    const view=config?.editor?.phonePreview === 'screen' ? 'screen' : 'card';
    document.getElementById('phoneCardPreviewBtn')?.classList.toggle('active',view==='card');
    document.getElementById('phoneScreenPreviewBtn')?.classList.toggle('active',view==='screen');
  }
  function setPhonePreview(view){
    if(!config)return; acceptNextState=false; config.editor=config.editor||{}; config.editor.phonePreview=view==='screen'?'screen':'card';
    syncPhonePreviewButtons(); sizePreviewShell(); post('apply'); setTimeout(updateSelection,80);
  }
  document.getElementById('phoneCardPreviewBtn')?.addEventListener('click',()=>setPhonePreview('card'));
  document.getElementById('phoneScreenPreviewBtn')?.addEventListener('click',()=>setPhonePreview('screen'));

  function enhanceRanges(){
    document.querySelectorAll('input[type="range"][data-key]').forEach(range => {
      if(range.dataset.enhanced)return; range.dataset.enhanced='1';
      const wrap=document.createElement('div'); wrap.className='range-row';
      range.parentNode.insertBefore(wrap,range); wrap.appendChild(range);
      const number=document.createElement('input'); number.type='number'; number.className='range-number';
      /* V21.46: pole liczbowe jest świadomie bez min/max. Slider zachowuje
         wygodny zakres wizualny, ale wpisana liczba nie jest przez niego
         sztucznie ograniczana. Jednostki pozostają natywne: %, vh, vw, px. */
      number.step='any'; number.setAttribute('aria-label','Wartość liczbowa');
      wrap.appendChild(number); range._number=number; number._range=range;
      const fromRange=()=>{number.value=range.value;};
      const fromNumber=()=>{
        if(!config)return; const v=Number(number.value); if(!Number.isFinite(v))return;
        const key=range.dataset.key, scope=range.dataset.scope||'mode';
        setPath(config,scope==='mode'?`mode.${mode}.${key}`:`${scope}.${key}`,v);
        /* Range jest tylko pomocniczym suwakiem: poza jego zakresem ustawiamy
           thumb na najbliższej granicy, ale wartość w polu i config pozostaje dokładna. */
        const lo=range.min===''?null:Number(range.min), hi=range.max===''?null:Number(range.max);
        let rv=v; if(lo!==null&&Number.isFinite(lo))rv=Math.max(lo,rv); if(hi!==null&&Number.isFinite(hi))rv=Math.min(hi,rv);
        range.value=String(rv); number.value=String(v);
        const out=range.closest('.field')?.querySelector('output'); if(out)out.textContent=String(v)+(range.dataset.unit||'');
        apply(false,true,(scope==='mode'?`mode.${mode}.${key}`:`${scope}.${key}`));
      };
      range.addEventListener('input',fromRange); number.addEventListener('input',fromNumber); number.addEventListener('change',fromNumber); fromRange();
    });
  }
  enhanceRanges();

  function bindField(el){
    const isString = el.type==='text'||el.type==='color'||el.tagName==='SELECT'||el.tagName==='TEXTAREA';
    const type=el.dataset.type||(el.type==='checkbox'?'bool':isString?'string':'number');
    const scope=el.dataset.scope||'mode', key=el.dataset.key; if(!key)return;
    const handler=()=>{
      if(!config)return; let value;
      if(type==='bool')value=!!el.checked; else if(type==='number')value=Number(el.value); else value=el.value;
      if(type==='number' && !Number.isFinite(value)) return;
      setPath(config,scope==='mode'?`mode.${mode}.${key}`:`${scope}.${key}`,value);
      const out=el.closest('.field')?.querySelector('output'); if(out)out.textContent=String(value)+(el.dataset.unit||'');
      if(el._number) el._number.value=String(value);
      if(el._range && Number.isFinite(value)){
        el._range.value=String(value);
        const out2=el._range.closest('.field')?.querySelector('output'); if(out2)out2.textContent=String(value)+(el._range.dataset.unit||'');
      }
      apply(false, true, (scope==='mode'?`mode.${mode}.${key}`:`${scope}.${key}`));
    };
    el.addEventListener(el.type==='range'?'input':(el.type==='number'?'change':'change'),handler);
    if(el.type==='text'||el.tagName==='TEXTAREA')el.addEventListener('input',handler);
  }
  document.querySelectorAll('[data-key]').forEach(bindField);


  function updateFields(){
    if(!config)return;
    document.querySelectorAll('[data-key]').forEach(el=>{
      const scope=el.dataset.scope||'mode',key=el.dataset.key,path=scope==='mode'?`mode.${mode}.${key}`:`${scope}.${key}`,value=getPath(config,path);
      if(value===undefined)return;
      if(el.type==='checkbox')el.checked=!!value; else el.value=value;
      if(el._number)el._number.value=value;
      const out=el.closest('.field')?.querySelector('output'); if(out)out.textContent=String(value)+(el.dataset.unit||'');
    });
    selectedLabel.textContent=selected&&elements[selected]?elements[selected].label:'Wybierz sekcję';
    updateEditorPanels();
    if(showGuides) showGuides.checked=!!config.editor?.showGuides;
  }

  const widePreset={
    desktop:{contentWidth:84,logoWidth:90,taglineWidth:106,taglineFont:34,ctaWidth:76,ctaHeight:60,ctaFont:17,galleryWidth:84,galleryGap:10,categoryFont:20,footerWidth:84,footerFont:12,cardPaddingX:8.4},
    mobile:{contentWidth:80,logoWidth:90,taglineWidth:104,taglineFont:28,ctaWidth:80,ctaHeight:55,ctaFont:15.5,galleryWidth:80,galleryGap:8,categoryFont:18,footerWidth:80,footerFont:11,cardPaddingX:8.6}
  };
  document.getElementById('presetWide').addEventListener('click',()=>{
    if(!config)return; Object.assign(config.mode.desktop,widePreset.desktop); Object.assign(config.mode.mobile,widePreset.mobile); apply(false, true, '__all__'); toast('Preset szeroki zastosowany');
  });

  function setContentPreset(kind){
    if(!config)return; const m=currentMode();
    if(kind==='full') Object.assign(m,{contentWidth:100,cardPaddingX:0});
    else if(kind==='wide') Object.assign(m,{contentWidth:90,cardPaddingX:5});
    else Object.assign(m,{contentWidth:mode==='desktop'?66:67,cardPaddingX:10.8});
    config.editor=config.editor||{}; config.editor.showGuides=true; if(showGuides)showGuides.checked=true;
    apply(false); toast(kind==='full'?'Obszar treści = 100% karty':kind==='wide'?'Obszar treści = 90%':'Obszar treści zresetowany');
  }
  document.getElementById('contentFullBtn')?.addEventListener('click',()=>setContentPreset('full'));
  document.getElementById('content90Btn')?.addEventListener('click',()=>setContentPreset('wide'));
  document.getElementById('contentResetBtn')?.addEventListener('click',()=>setContentPreset('reset'));

  document.getElementById('frameSingleBtn').addEventListener('click',()=>{
    if(!config)return; const m=currentMode(); m.cardBgZoom=107.5; m.cardBgX=50; m.cardBgY=50; apply(false); toast('Wewnętrzna rama schowana przez crop 107,5%');
  });
  document.getElementById('frameFullBtn').addEventListener('click',()=>{
    if(!config)return; const m=currentMode(); m.cardBgZoom=100; m.cardBgX=50; m.cardBgY=50; apply(false); toast('Pełna rama karty przywrócona');
  });

  function nudgeScene(delta){ if(!config)return; const m=currentMode(); m.sceneOffsetY=Number(m.sceneOffsetY||0)+delta; apply(false); }
  document.getElementById('sceneUpBtn')?.addEventListener('click',()=>nudgeScene(-25));
  document.getElementById('sceneDownBtn')?.addEventListener('click',()=>nudgeScene(25));
  document.getElementById('sceneResetBtn')?.addEventListener('click',()=>{
    if(!config)return; const m=currentMode(); Object.assign(m,{sceneZoom:100,sceneX:50,sceneY:50,sceneOffsetX:0,sceneOffsetY:0,sceneBrightness:100,sceneContrast:100,sceneSaturation:100}); apply(false); toast('Tło sceny wyzerowane');
  });

  showSelection?.addEventListener('change',()=>{app.classList.toggle('hide-selection',!showSelection.checked);updateSelection();});
  showGuides?.addEventListener('change',()=>{
    if(!config)return; config.editor=config.editor||{}; config.editor.showGuides=!!showGuides.checked; post('apply');
  });

  /* ---------- ZAPIS SZKICU W PRZEGLĄDARCE (localStorage) — jak dotychczas ---------- */
  document.getElementById('saveBtn').addEventListener('click',()=>{
    if(!config){ setStatus('Brak konfiguracji do zapisania.', 'warn'); return; }
    try {
      const safe=deepClone(config); safe.version=3; delete safe.__pxGeometryMigrated;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(safe));
      toast('✓ Zapisano szkic DEV');
      setStatus('✓ Szkic DEV zapisany w przeglądarce. Podgląd INDEX nie został ponownie przeskalowany. Plik INDEX pozostaje bez zmian.', 'ok');
    } catch(error) {
      console.error('INDEX DEV draft save:', error);
      setStatus('BŁĄD ZAPISU SZKICU: ' + (error?.message || String(error)), 'warn');
    }
  });

  /* ---------- ZAPIS FIZYCZNY LOKALNY (File System Access API) ----------
     Nie wymaga żadnego serwera ani zmian w Google Apps Script — działa od razu
     w Chrome/Edge, zarówno na file://, jak i http://localhost.
     Przed nadpisaniem: stara zawartość page-design-config.js jest pobierana
     jako lokalny plik-backup (bo Apps Script nie ma jeszcze akcji do backupu
     na Google Drive — to zostanie dodane, gdy zostanie przyznany dostęp
     do projektu Apps Script). */
  function openHandleDb(){
    return new Promise((resolve, reject) => {
      if (!window.indexedDB) return resolve(null);
      const request = indexedDB.open(HANDLE_DB_NAME, 1);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains('handles')) db.createObjectStore('handles');
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
  async function rememberHandle(handle){
    try {
      const db = await openHandleDb(); if (!db) return;
      await new Promise((resolve, reject) => {
        const tx = db.transaction('handles','readwrite');
        tx.objectStore('handles').put(handle,'indexConfig');
        tx.oncomplete = resolve; tx.onerror = () => reject(tx.error);
      });
      db.close();
    } catch(_) {}
  }
  async function restoreHandle(){
    try {
      const db = await openHandleDb(); if (!db) return null;
      const handle = await new Promise((resolve, reject) => {
        const tx = db.transaction('handles','readonly');
        const req = tx.objectStore('handles').get('indexConfig');
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => reject(req.error);
      });
      db.close(); return handle;
    } catch(_) { return null; }
  }
  async function getConfigFileHandle(){
    if (!localFileHandle) localFileHandle = await restoreHandle();
    if (localFileHandle) {
      try {
        const permission = await localFileHandle.queryPermission({mode:'readwrite'});
        if (permission === 'granted') return localFileHandle;
        if (await localFileHandle.requestPermission({mode:'readwrite'}) === 'granted') return localFileHandle;
      } catch(_) { localFileHandle = null; }
    }
    /* V21.49: przy pierwszym zapisie NIE wymagamy istniejącego pliku.
       Edytor może być uruchomiony z paczki, w której użytkownik nie ma jeszcze
       własnego pliku page-design-config.js w wybranej lokalizacji. Tworzymy go
       przez Save File Picker, a potem zapamiętujemy uchwyt i kolejne zapisy są
       już bez pytania o plik. */
    if (typeof window.showSaveFilePicker !== 'function') {
      throw new Error('Ta przeglądarka nie obsługuje zapisu fizycznego (użyj Chrome lub Edge).');
    }
    const handle = await window.showSaveFilePicker({
      suggestedName: CONFIG_FILE_NAME,
      types:[{description:'INDEX design config', accept:{'text/javascript':['.js']}}],
      excludeAcceptAllOption:false
    });
    if (!handle) throw new Error('Nie wybrano miejsca zapisu.');
    localFileHandle = handle;
    await rememberHandle(handle);
    return handle;
  }
  function downloadTextBackup(oldContent){
    try {
      const stamp = new Date().toISOString().replace(/[:.]/g,'-');
      const blob = new Blob([oldContent], {type:'text/javascript;charset=utf-8'});
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `page-design-config.BACKUP-${stamp}.js`; a.click();
      setTimeout(()=>URL.revokeObjectURL(url), 1000);
    } catch(_) {}
  }
  function buildConfigFileContent(cfg){
    const safe=deepClone(cfg); safe.version=3; delete safe.__pxGeometryMigrated;
    return `/* NAIL-ART INDEX — page-design-config.js\n   Zapisano automatycznie przez DEV Editor: ${new Date().toISOString()}\n   NIE edytuj ręcznie w trakcie pracy z index-editor.html — zostanie nadpisany. */\nwindow.DariaPageDesignConfigV1 = ${JSON.stringify(safe, null, 2)};\n`;
  }
  async function saveToPhysicalLocalFile(){
    if (!config) { setStatus('Brak konfiguracji do zapisania.', 'warn'); return; }
    const btn = document.getElementById('savePhysicalBtn');
    if (btn) { btn.disabled = true; btn.textContent = 'Zapisywanie…'; }
    setStatus('Zapisuję fizycznie do page-design-config.js…', 'warn');
    try {
      const handle = await getConfigFileHandle();
      let oldContent = '';
      try {
        const file = await handle.getFile();
        oldContent = await file.text();
      } catch(_) {
        /* Nowy cel z Save File Picker może jeszcze nie istnieć — to jest poprawne. */
        oldContent = '';
      }
      if (oldContent) downloadTextBackup(oldContent); /* backup tylko gdy istniała poprzednia wersja */
      const newContent = buildConfigFileContent(config);
      const writable = await handle.createWritable();
      await writable.write(newContent);
      await writable.close();
      const verifyFile = await handle.getFile();
      const verifyText = await verifyFile.text();
      if (!verifyText.includes('window.DariaPageDesignConfigV1')) {
        throw new Error('Zapisano, ale weryfikacja po zapisie nie powiodła się.');
      }
      /* V21.72: po potwierdzonym zapisie fizycznym usuń szkic DEV.
         Dzięki temu editor preview i zwykły INDEX nie mogą mieć dwóch
         różnych utrwalonych stanów. */
      try { localStorage.removeItem(STORAGE_KEY); } catch(_) {}
      dirtyPhysical = false;
      setStatus(`✓ Zapisano fizycznie do ${handle.name}. Kopia poprzedniej wersji pobrana jako plik BACKUP w folderze pobierania.`, 'ok');
      toast('Zapisano fizycznie do pliku INDEX');
    } catch (error) {
      console.error('INDEX DEV physical save:', error);
      setStatus('BŁĄD ZAPISU: ' + (error?.message || String(error)), 'warn');
    } finally {
      if (btn) { btn.disabled = false; refreshModeLabel(); }
    }
  }

  /* ---------- GITHUB SAVE — PRZYGOTOWANE, NA RAZIE NIEAKTYWNE ----------
     Funkcja jest gotowa strukturalnie (tak samo jak w ADMIN DEV), ale:
     1) uruchamia się tylko gdy runtimeMode() === 'github' (czyli strona
        hostowana na realnej domenie, nie na localhost/file), więc podczas
        testów lokalnych nigdy nie zostanie wywołana;
     2) backend Google Apps Script NIE MA jeszcze akcji 'saveIndexDevConfigToGithub'
        — to trzeba dopisać, gdy zostanie przyznany dostęp do projektu Apps Script.
     Zostawiam kod tutaj zgodnie z ustaleniem: funkcja ma być gotowa, ale
     GitHub na razie nie jest aktualizowany. */
  function appsScriptUrl(){
    try { return typeof APPS_SCRIPT_URL !== 'undefined' && APPS_SCRIPT_URL ? APPS_SCRIPT_URL : FALLBACK_APPS_SCRIPT_URL; }
    catch(_) { return FALLBACK_APPS_SCRIPT_URL; }
  }
  async function postJson(url, payload, timeoutMs=45000){
    const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
    const timer = controller ? setTimeout(()=>controller.abort(), timeoutMs) : null;
    try {
      const response = await fetch(url, {method:'POST', headers:{'Content-Type':'text/plain'}, body:JSON.stringify(payload), signal: controller?controller.signal:undefined});
      const text = await response.text();
      if (!response.ok) throw new Error(`HTTP ${response.status}: ${text.slice(0,300)}`);
      let data; try { data = JSON.parse(text); } catch(_) { throw new Error('Serwer nie zwrócił JSON: ' + text.slice(0,300)); }
      return data;
    } finally { if (timer) clearTimeout(timer); }
  }
  async function saveGithub(){
    /* TODO (po przyznaniu dostępu do Apps Script): dopisać w backendzie akcję
       "saveIndexDevConfigToGithub" (branch index-dev, plik page-design-config.js),
       analogiczną do saveDevLayoutToGithub używanej przez ADMIN DEV. */
    return postJson(appsScriptUrl(), {
      action: 'saveIndexDevConfigToGithub',
      content: buildConfigFileContent(config),
      pageUrl: location.href
    }, 90000);
  }
  document.getElementById('savePhysicalBtn')?.addEventListener('click', async () => {
    /* GitHub jest świadomie niedostępny w tym etapie. */
    await saveToPhysicalLocalFile();
  });

  document.getElementById('resetBtn').addEventListener('click',()=>{
    if(!confirm('Przywrócić bazową konfigurację INDEX i usunąć szkic DEV? Zapisany fizyczny plik page-design-config.js nie zostanie nadpisany.'))return;
    try{localStorage.removeItem(STORAGE_KEY);}catch(_){}
    /* Bazą resetu jest FIZYCZNY page-design-config.js załadowany w iframe,
       a nie przypadkowe/nieaktualne DEFAULTS ani poprzedni szkic. */
    try{
      const physical = frame.contentWindow?.DariaPageDesignConfigV1;
      if(physical && typeof physical==='object'){
        config=deepClone(physical);
        config.version=3; delete config.__pxGeometryMigrated;
      } else {
        config=null;
      }
    }catch(_){ config=null; }
    /* Reset ma przywrócić CZYSTY CSS/HTML bazowy. Nie wolno ponownie nakładać
       konfiguracji przez inline styles, bo wtedy cardVh=63 nadpisuje bazową geometrię
       .landing-v217 (56.8vh / 79.6vh). Przeładuj tylko iframe; fizyczny plik pozostaje
       nietknięty, a po load editor ponownie odczyta jego stan. */
    try{ frame.contentWindow?.location?.reload(); }catch(_){ frame.src=frame.src; }
    updateFields(); syncPhonePreviewButtons();
    setTimeout(requestState,350);
    dirtyPhysical=false;
    toast('Przywrócono czystą bazę INDEX z page-design-config.js');
    setStatus('Przywrócono bazową konfigurację z fizycznego page-design-config.js. Plik fizyczny nie został zmieniony.', 'ok');
  });
  document.getElementById('copyBtn').addEventListener('click',async()=>{
    if(!config)return; const text=JSON.stringify(config,null,2);
    try{await navigator.clipboard.writeText(text);toast('Konfiguracja skopiowana');}catch(_){prompt('Skopiuj konfigurację:',text);}
  });
  document.getElementById('exportBtn').addEventListener('click',()=>{
    if(!config)return; const blob=new Blob([JSON.stringify(config,null,2)],{type:'application/json'}),a=document.createElement('a');
    a.href=URL.createObjectURL(blob);a.download='daria-index-design-v2.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);
  });
  document.getElementById('importInput').addEventListener('change',async event=>{
    const file=event.target.files?.[0];if(!file)return;
    try{config=JSON.parse(await file.text());apply(false);toast('Konfiguracja wczytana — kliknij Zapisz');}catch(_){alert('Nieprawidłowy plik JSON.');}
    event.target.value='';
  });
  document.getElementById('openPreviewBtn').addEventListener('click',()=>window.open('index.html','_blank'));

  if(!config)config=loadLocalFallback(); syncPhonePreviewButtons(); sizePreviewShell(); updateFields(); selected=null; updateEditorPanels(); updateSelection();
  refreshModeLabel();
  refreshHistoryButtons();
  document.getElementById('undoBtn')?.addEventListener('click',undo);
  document.getElementById('redoBtn')?.addEventListener('click',redo);
  document.addEventListener('keydown',event=>{
    if ((event.ctrlKey||event.metaKey) && event.key.toLowerCase()==='z' && !event.shiftKey) { event.preventDefault(); undo(); }
    else if ((event.ctrlKey||event.metaKey) && (event.key.toLowerCase()==='y' || (event.key.toLowerCase()==='z'&&event.shiftKey))) { event.preventDefault(); redo(); }
  });
  if(isEmbedded) document.body.classList.add('is-embedded');
  setStatus('Gotowe. V21.72 — wspólny DEV ADMIN/INDEX. Wybierz sekcję; live dopiero po zmianie.', 'ok');
})();