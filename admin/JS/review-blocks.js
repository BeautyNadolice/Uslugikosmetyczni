/* ========================================================================== 
   ADMIN V30.24 — REVIEW / BLOKADY Z GOOGLE CALENDAR
   - WIFE_CALENDAR pozostaje READ_ONLY.
   - edytujemy wyłącznie adnotację/kopię CRM, nigdy wydarzenie źródłowe żony.
   - pełny kontekst rekordu do sprawdzenia jest na głównej karcie szczegółów.
   ========================================================================== */
(function(){
  "use strict";

  function text(v){ return String(v==null?"":v).trim(); }
  function esc(v){
    return text(v).replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
  }
  function isExternal(item){ return item?.eventType === "external"; }
  function isReadOnlySource(item){ return isExternal(item) && Boolean(item?.sourceReadOnly || /WIFE_CALENDAR/i.test(text(item?.sourceType))); }
  function meaningfulRaw(item){ return text(item?.rawText || item?.originalTitle || item?.externalDescription || item?.name); }
  function hardBlockLabel(item){
    if(!isExternal(item)) return "";
    let raw=meaningfulRaw(item).split(/\r?\n/)[0].trim();
    raw=raw.replace(/^\d{1,2}:\d{2}\s*/,"")
      .replace(/^[^0-9A-Za-zĄĆĘŁŃÓŚŹŻąćęłńóśźż\u0400-\u04FF]+/,"")
      .replace(/^(?:może być na rano|moze byc na rano|może być rano|moze byc rano)\s+/i,"")
      .trim();
    const m=raw.match(/^(blokada|wolne|urlop|przerwa|prywatne|nieczynne|stomatolog|dentysta|lekarz|szkolenie|kurs|warsztat)\b/i);
    return m ? m[1].toUpperCase() : "";
  }
  function isKnownHardBlock(item){ return Boolean(hardBlockLabel(item) || item?.knownHardBlock); }
  function isReview(item){
    if(!isExternal(item) || isKnownHardBlock(item)) return false;
    return Boolean(item?.reviewRequired || item?.canEditReview || /WIFE_CALENDAR_BLOCK/i.test(text(item?.sourceType)));
  }
  function meaningfulName(item){
    const preferred=text(item?.reviewClient || item?.name);
    if(preferred && !/zaj[eę]te/i.test(preferred)) return preferred;
    let raw=meaningfulRaw(item).split(/\r?\n/)[0].trim();
    raw=raw.replace(/^\d{1,2}:\d{2}\s*/,"").replace(/^[^0-9A-Za-zĄĆĘŁŃÓŚŹŻąćęłńóśźż\u0400-\u04FF]+/,"").replace(/^(?:może być na rano|moze byc na rano|może być rano|moze byc rano)\s+/i,"").trim();
    return raw && !/^zaj[eę]te/i.test(raw) ? raw : "Blokada czasu";
  }

  function currentAppointment(){
    try{ if(typeof currentEditingAppointment!=="undefined" && currentEditingAppointment) return currentEditingAppointment; }catch(ignore){}
    return window.currentEditingAppointment || null;
  }
  function appsScriptUrl(){
    try{ if(typeof APPS_SCRIPT_URL!=="undefined" && APPS_SCRIPT_URL) return APPS_SCRIPT_URL; }catch(ignore){}
    return window.APPS_SCRIPT_URL || "";
  }

  function meaningfulService(item){
    if(isKnownHardBlock(item)) return "Blokada czasu";
    const service=text(item?.reviewService || item?.service);
    if(service && !/^(rezerwacja zewnętrzna|do sprawdzenia|brak usługi)$/i.test(service)) return service;
    return isReview(item) ? "Do sprawdzenia" : (service || "Rezerwacja zewnętrzna");
  }

  function domProcedureRows(){
    let rows=[];
    try{ if(typeof currentServices!=="undefined" && Array.isArray(currentServices)) rows=currentServices; }catch(ignore){}
    if(!rows.length && Array.isArray(window.currentServices)) rows=window.currentServices;
    const seen=new Set();
    return rows.map((service,index)=>({
      name:text(service?.name || service?.service || service?.title),
      category:text(service?.category || "Inne"),
      categoryOrder:Number(service?.categoryOrder||9999),
      serviceOrder:Number(service?.serviceOrder||index+1)
    })).filter(row=>row.name).filter(row=>{
      const key=row.name.toLocaleLowerCase("pl-PL");
      if(seen.has(key)) return false;
      seen.add(key); return true;
    }).sort((a,b)=>a.categoryOrder-b.categoryOrder || a.serviceOrder-b.serviceOrder || a.name.localeCompare(b.name,"pl"));
  }
  function procedureSelectHtml(selected){
    const rows=domProcedureRows();
    const chosen=text(selected);
    const has=rows.some(row=>row.name===chosen);
    const groups=new Map();
    rows.forEach(row=>{ if(!groups.has(row.category)) groups.set(row.category,[]); groups.get(row.category).push(row.name); });
    let html='<select id="crmReviewServiceV309"><option value="">— Wybierz procedurę —</option>';
    if(chosen && !has) html+=`<option value="${esc(chosen)}" selected>${esc(chosen)} — z wpisu</option>`;
    groups.forEach((names,category)=>{
      html+=`<optgroup label="${esc(category)}">`+names.map(name=>`<option value="${esc(name)}" ${name===chosen?'selected':''}>${esc(name)}</option>`).join("")+'</optgroup>';
    });
    html+='</select>';
    return html;
  }

  function isCatalogProcedure(name){
    const wanted=text(name).toLocaleLowerCase('pl-PL');
    return Boolean(wanted && domProcedureRows().some(row=>row.name.toLocaleLowerCase('pl-PL')===wanted));
  }

  function localReviewCount(){
    try{
      if(typeof appointmentsData!=="undefined" && Array.isArray(appointmentsData)) return appointmentsData.filter(isReview).length;
    }catch(ignore){}
    return 0;
  }

  function ensureQueueBadgeV3011(){
    const sidebar=document.querySelector('#tab-kalendarz .calendar-sidebar');
    const header=document.querySelector('#tab-kalendarz .calendar-layout-header');
    const host=sidebar||header;
    if(!host) return null;
    let badge=document.getElementById('crmReviewQueueBadgeV3011');
    if(!badge){
      badge=document.createElement('button');
      badge.type='button';
      badge.id='crmReviewQueueBadgeV3011';
      badge.className='crm-review-queue-badge-v3011';
      badge.setAttribute('aria-live','polite');
      badge.setAttribute('aria-expanded','false');
      badge.setAttribute('aria-controls','crmReviewQueuePanelV3012');
      badge.onclick=()=>window.crmReviewToggleQueueV3012();
      if(sidebar) sidebar.appendChild(badge);
      else {
        const actions=header?.lastElementChild;
        if(actions) header.insertBefore(badge,actions); else header?.appendChild(badge);
      }
    }
    return badge;
  }

  function paintQueueBadgeV3011(count,extra){
    const badge=ensureQueueBadgeV3011(); if(!badge)return;
    const n=Math.max(0,Number(count)||0);
    badge.innerHTML=`<span class="crm-review-queue-dot-v3011">!</span><span>Do sprawdzenia</span><strong>${n}</strong><span class="crm-review-queue-chevron-v3012">›</span>`;
    badge.classList.toggle('is-zero',n===0);
    if(extra){
      const booksy=Number(extra.booksyReviewRows)||0;
      const wife=Number(extra.wifeReviewRows)||0;
      badge.title=`Google Calendar do sprawdzenia: ${n}. Do identyfikacji klienta: ${Number(extra.toIdentify)||0}. Do uzupełnienia: ${Number(extra.toComplete)||0}. Pozostałe do sprawdzenia: ${Number(extra.toCheck)||0}. Wszystkie wpisy WIFE w logu: ${wife}. Booksy do weryfikacji: ${booksy}.`;
    }else badge.title=`Wpisy do sprawdzenia w aktualnie wczytanym zakresie: ${n}`;
  }

  let queueItemsV3012=[];
  let queueSearchV3012="";
  let queueTotalV3012=null;

  function queueLocalItemsV3012(){
    try{
      if(typeof appointmentsData!=="undefined" && Array.isArray(appointmentsData)){
        return appointmentsData.filter(isReview).map(item=>({
          sourceId:text(item.sourceId),
          clientName:meaningfulName(item),
          service:meaningfulService(item)==="Do sprawdzenia"?"":meaningfulService(item),
          reason:text(item.reviewReason),
          rawText:meaningfulRaw(item),
          startIso:text(item.date),
          eventId:text(item.eventId),
          queueClass:text(item.reviewClass||"DO_SPRAWDZENIA"),
          queueLabel:text(item.reviewLabel||"Do sprawdzenia")
        }));
      }
    }catch(ignore){}
    return [];
  }

  function queueDateLabelV3012(value){
    const d=new Date(value);
    if(Number.isNaN(d.getTime())) return text(value)||"Brak daty";
    const date=new Intl.DateTimeFormat('pl-PL',{weekday:'short',day:'2-digit',month:'2-digit',year:'numeric'}).format(d);
    const time=new Intl.DateTimeFormat('pl-PL',{hour:'2-digit',minute:'2-digit'}).format(d);
    return `${date} • ${time}`;
  }

  function ensureQueuePanelV3012(){
    let panel=document.getElementById('crmReviewQueuePanelV3012');
    if(panel) return panel;
    panel=document.createElement('aside');
    panel.id='crmReviewQueuePanelV3012';
    panel.className='crm-review-queue-panel-v3012';
    panel.hidden=true;
    panel.innerHTML=`
      <div class="crm-review-queue-panel-head-v3012">
        <div><span>DO SPRAWDZENIA</span><h3>Wpisy wymagające decyzji</h3></div>
        <button type="button" class="crm-review-queue-close-v3012" aria-label="Zamknij">×</button>
      </div>
      <div class="crm-review-queue-tools-v3012">
        <input id="crmReviewQueueSearchV3012" type="search" placeholder="Szukaj klienta, procedury lub wpisu…" autocomplete="off">
        <span id="crmReviewQueueCountV3012">0</span>
      </div>
      <div id="crmReviewQueueListV3012" class="crm-review-queue-list-v3012"></div>`;
    panel.querySelector('.crm-review-queue-close-v3012').onclick=()=>window.crmReviewCloseQueueV3012();
    panel.querySelector('#crmReviewQueueSearchV3012').addEventListener('input',event=>{
      queueSearchV3012=text(event.target.value).toLocaleLowerCase('pl-PL');
      renderQueuePanelV3012();
    });
    document.querySelector('#tab-kalendarz')?.appendChild(panel);
    return panel;
  }

  function queueItemMatchesV3012(item){
    if(!queueSearchV3012) return true;
    const hay=[item.clientName,item.service,item.reason,item.rawText,item.startIso].map(text).join(' ').toLocaleLowerCase('pl-PL');
    return hay.includes(queueSearchV3012);
  }

  function queueClassMetaV3023(item){
    const code=text(item?.queueClass||"DO_SPRAWDZENIA").toUpperCase();
    const map={
      DO_ZIDENTYFIKOWANIA_KLIENTA:{label:"Klient do identyfikacji",css:"identify"},
      DO_UZUPELNIENIA_USLUGI:{label:"Uzupełnij procedurę",css:"complete"},
      DO_UZUPELNIENIA_TERMINU:{label:"Sprawdź termin",css:"time"},
      DO_SPRAWDZENIA:{label:"Do sprawdzenia",css:"check"}
    };
    return map[code]||{label:text(item?.queueLabel||"Do sprawdzenia"),css:"check"};
  }

  function renderQueuePanelV3012(){
    const panel=ensureQueuePanelV3012();
    const list=panel.querySelector('#crmReviewQueueListV3012');
    const count=panel.querySelector('#crmReviewQueueCountV3012');
    const rows=(queueItemsV3012.length?queueItemsV3012:queueLocalItemsV3012()).filter(queueItemMatchesV3012);
    if(count) count.textContent=String(rows.length);
    if(!rows.length){
      list.innerHTML=`<div class="crm-review-queue-empty-v3012"><b>${queueSearchV3012?'Brak pasujących wpisów':'Wszystko zidentyfikowane'}</b><span>${queueSearchV3012?'Zmień wyszukiwanie.':'Nie ma teraz wpisów Google Calendar wymagających decyzji.'}</span></div>`;
      return;
    }
    list.innerHTML=rows.map((item,index)=>{
      const client=text(item.clientName)||'Klient nierozpoznany';
      const service=text(item.service)||'Procedura nierozpoznana';
      const raw=text(item.rawText)||client;
      const reason=text(item.reason)||'Wymaga ręcznego sprawdzenia';
      const qmeta=queueClassMetaV3023(item);
      return `<button type="button" class="crm-review-queue-item-v3012 is-${esc(qmeta.css)}" data-source-id="${esc(item.sourceId)}" data-start="${esc(item.startIso)}" data-index="${index}">
        <div class="crm-review-queue-item-top-v3012"><span class="crm-review-queue-item-alert-v3012">!</span><strong>${esc(client)}</strong><time>${esc(queueDateLabelV3012(item.startIso))}</time></div>
        <div class="crm-review-queue-type-v3023">${esc(item.queueLabel||qmeta.label)}</div>
        <div class="crm-review-queue-item-service-v3012">${esc(service)}</div>
        <div class="crm-review-queue-item-raw-v3012">${esc(raw)}</div>
        <div class="crm-review-queue-item-reason-v3012">${esc(reason)}</div>
      </button>`;
    }).join('');
    list.querySelectorAll('.crm-review-queue-item-v3012').forEach(btn=>{
      btn.onclick=()=>window.crmReviewOpenQueueItemV3012(btn.dataset.sourceId,btn.dataset.start);
    });
  }

  window.crmReviewToggleQueueV3012=async function(){
    const panel=ensureQueuePanelV3012();
    const badge=ensureQueueBadgeV3011();
    const willOpen=panel.hidden;
    panel.hidden=!willOpen;
    if(badge) badge.setAttribute('aria-expanded',willOpen?'true':'false');
    if(!willOpen) return;
    renderQueuePanelV3012();
    await refreshQueueBadgeV3011(true);
    renderQueuePanelV3012();
  };
  window.crmReviewCloseQueueV3012=function(){
    const panel=document.getElementById('crmReviewQueuePanelV3012');
    if(panel) panel.hidden=true;
    const badge=ensureQueueBadgeV3011();
    if(badge) badge.setAttribute('aria-expanded','false');
  };

  window.crmReviewOpenQueueItemV3012=async function(sourceId,startIso){
    const wanted=text(sourceId).replace(/@google\.com$/i,'').toLocaleLowerCase('pl-PL');
    const date=new Date(startIso);
    try{
      if(!Number.isNaN(date.getTime())){
        if(typeof window.crmFinalV3SelectDate==='function') window.crmFinalV3SelectDate(date);
        else if(typeof crmFinalV3SelectDate==='function') crmFinalV3SelectDate(date);
        if(typeof window.crmLightSyncCalendarData==='function') await window.crmLightSyncCalendarData('review-queue-open');
        else if(typeof crmLightSyncCalendarData==='function') await crmLightSyncCalendarData('review-queue-open');
      }
      let hit=null;
      try{
        if(typeof appointmentsData!=="undefined" && Array.isArray(appointmentsData)) hit=appointmentsData.find(item=>text(item.sourceId).replace(/@google\.com$/i,'').toLocaleLowerCase('pl-PL')===wanted);
      }catch(ignore){}
      if(hit && typeof window.openAppointmentDetailsModal==='function') window.openAppointmentDetailsModal(hit);
      else if(typeof window.crmToast==='function') window.crmToast('Wpis nie jest jeszcze w aktualnym zakresie kalendarza. Odświeżono jego dzień — kliknij kartę w kalendarzu.');
    }catch(error){
      if(typeof window.crmToast==='function') window.crmToast('Nie udało się otworzyć wpisu: '+(error.message||error),'error');
    }
  };

  let queueRefreshPromise=null;
  async function refreshQueueBadgeV3011(forceBackend){
    paintQueueBadgeV3011(queueTotalV3012==null?localReviewCount():queueTotalV3012);
    const isDev=document.body.classList.contains('crm-dev-v4');
    if(isDev || !forceBackend) return;
    if(queueRefreshPromise) return queueRefreshPromise;
    queueRefreshPromise=(async()=>{
      try{
        let data;
        if(typeof window.crmPost==='function') data=await window.crmPost({action:'getExternalReviewQueueStatusV4715'});
        else{
          const response=await fetch(appsScriptUrl(),{method:'POST',headers:{'Content-Type':'text/plain'},body:JSON.stringify({action:'getExternalReviewQueueStatusV4715'})});
          data=await response.json();
        }
        if(data?.success){
          queueItemsV3012=Array.isArray(data.items)?data.items:queueItemsV3012;
          queueTotalV3012=Math.max(0,Number(data.pendingTotal ?? data.toIdentify)||0);
          paintQueueBadgeV3011(queueTotalV3012,data);
          const panel=document.getElementById('crmReviewQueuePanelV3012');
          if(panel && !panel.hidden) renderQueuePanelV3012();
        }
      }catch(error){ console.warn('Nie udało się pobrać licznika review:',error); }
      finally{ queueRefreshPromise=null; }
    })();
    return queueRefreshPromise;
  }

  function refreshConfirmStateV3011(){
    const client=text(document.getElementById('crmReviewClientV309')?.value);
    const service=text(document.getElementById('crmReviewServiceV309')?.value);
    const btn=document.getElementById('crmReviewConfirmV3011');
    if(!btn)return;
    const ok=Boolean(client && isCatalogProcedure(service));
    btn.disabled=!ok;
    btn.title=ok?'Potwierdź wpis jako normalną wizytę':'Wpisz klienta i wybierz procedurę dokładnie z Cennika DOM';
  }

  /* Status w kartach: trójkąt = blokada, czerwony ! = wymaga sprawdzenia. */
  const oldStatusHtml=window.crmV304StatusHtml;
  window.crmV304StatusHtml=function(item,size="small"){
    if(isExternal(item)){
      return `<span class="crm-v309-review-mark ${isReview(item)?"needs-review":""} ${esc(size)}" title="${isReview(item)?"Blokada — wymaga sprawdzenia":"Blokada czasu"}"><i>▲</i>${isReview(item)?"<b>!</b>":""}</span>`;
    }
    return typeof oldStatusHtml==="function" ? oldStatusHtml(item,size) : "";
  };

  const oldStatusIcon=window.crmStatusIcon;
  window.crmStatusIcon=function(item){
    if(isExternal(item)) return "▲";
    return typeof oldStatusIcon==="function" ? oldStatusIcon(item) : "●";
  };

  const oldClientLabel=window.crmV304ClientLabel;
  window.crmV304ClientLabel=function(item){
    if(isExternal(item)) return meaningfulName(item);
    return typeof oldClientLabel==="function" ? oldClientLabel(item) : text(item?.name||"Wizyta");
  };

  const oldVisitService=window.crmVisitService;
  window.crmVisitService=function(item){
    if(isExternal(item)) return meaningfulService(item);
    return typeof oldVisitService==="function" ? oldVisitService(item) : text(item?.service||item?.name||"Wpis");
  };

  function ensureContext(){
    const main=document.getElementById("crmVisitTabContent");
    if(!main) return null;
    let box=document.getElementById("crmReviewContextV309");
    if(!box){
      box=document.createElement("section");
      box.id="crmReviewContextV309";
      box.className="crm-review-context-v309";
      const timeGrid=main.querySelector(".crm-safe-time-grid");
      if(timeGrid) timeGrid.insertAdjacentElement("afterend",box); else main.appendChild(box);
    }
    return box;
  }

  function hideInfoTab(){
    const btn=document.getElementById("crmVisitTabInfo");
    const info=document.getElementById("crmInfoTabContent");
    if(btn) btn.hidden=true;
    if(info) info.hidden=true;
    const visit=document.getElementById("crmVisitTabContent");
    if(visit) visit.hidden=false;
    document.getElementById("crmVisitTabVisit")?.classList.add("active");
  }

  function sourceLabel(item){
    if(/WIFE_CALENDAR/i.test(text(item?.sourceType))) return "Google Calendar — kalendarz źródłowy READ_ONLY";
    return text(item?.sourceType || item?.source || item?.bookingSource || "Google Calendar");
  }

  function renderContext(item){
    const box=ensureContext();
    if(!box) return;
    if(!isExternal(item)){
      box.hidden=true;
      box.innerHTML="";
      return;
    }
    box.hidden=false;
    const raw=meaningfulRaw(item) || "Brak dodatkowego tekstu źródłowego";
    const hard=hardBlockLabel(item);
    const reason=hard ? ("Rozpoznana blokada: "+hard) : (text(item?.reviewReason) || (isReview(item)?"Wpis wymaga ręcznego sprawdzenia":"Zewnętrzna blokada czasu"));
    const sourceId=text(item?.sourceId) || "—";
    const editButton=isReview(item) && (item?.canEditReview || isReadOnlySource(item))
      ? `<button type="button" class="crm-review-edit-v309" onclick="crmReviewOpenEditorV309()">✎ Edytuj dane CRM</button>` : "";
    const identityRows=hard
      ? `<div><dt>Rodzaj blokady</dt><dd>${esc(hard)}</dd></div><div><dt>Status</dt><dd>Czas zablokowany</dd></div>`
      : `<div><dt>Klient</dt><dd>${esc(meaningfulName(item))}</dd></div><div><dt>Procedura</dt><dd>${esc(meaningfulService(item))}</dd></div>`;
    box.innerHTML=`
      <div class="crm-review-heading-v309"><strong>${isReview(item)?"Do sprawdzenia":"Blokada czasu"}</strong>${isReview(item)?"<span class=\"crm-review-alert-v309\">!</span>":""}</div>
      <dl class="crm-review-grid-v309">
        <div><dt>Źródło</dt><dd>${esc(sourceLabel(item))}</dd></div>
        <div><dt>Powód</dt><dd>${esc(reason)}</dd></div>
        ${identityRows}
        <div class="wide"><dt>Oryginalny wpis</dt><dd class="crm-review-raw-v309">${esc(raw)}</dd></div>
        <div class="wide technical"><dt>SourceId</dt><dd>${esc(sourceId)}</dd></div>
      </dl>
      ${editButton}
      <div id="crmReviewEditorV309" class="crm-review-editor-v309" hidden></div>`;
  }

  function applyDetails(item){
    if(!item) return;
    hideInfoTab();
    const modal=document.getElementById("appointmentDetailsModal");
    if(modal){
      modal.dataset.crmReview= isReview(item)?"1":"0";
      modal.classList.toggle("crm-v309-review-open",isReview(item));
    }
    if(isExternal(item)){
      const name=meaningfulName(item),service=meaningfulService(item);
      const nameEl=document.getElementById("details-name"); if(nameEl) nameEl.textContent=name;
      const serviceEl=document.getElementById("details-service"); if(serviceEl) serviceEl.textContent=service;
      const desc=document.getElementById("crmServiceDescription"); if(desc) desc.textContent=isReview(item)?(text(item.reviewReason)||"Wymaga sprawdzenia — czas zablokowany"):"Blokada z Google Calendar";
      const title=document.getElementById("appointmentDetailsTitle"); if(title) title.innerHTML=isReview(item)?'<span class="crm-review-title-mark-v309">▲ <b>!</b></span> DO SPRAWDZENIA':'▲ BLOKADA CZASU';
      const clientCard=document.querySelector("#appointmentDetailsModal .crm-safe-client-card");
      if(clientCard && isReview(item)){
        clientCard.classList.remove("is-readonly");
        clientCard.title="Edytuj dane CRM tej blokady (źródło Google pozostaje bez zmian)";
        clientCard.tabIndex=0;
        clientCard.onclick=()=>window.crmReviewOpenEditorV309();
        clientCard.onkeydown=e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();window.crmReviewOpenEditorV309();}};
      }
      if(isReadOnlySource(item)){
        const trash=document.getElementById("crmVisitTrashButton"); if(trash) trash.hidden=true;
        const ext=document.getElementById("crm-external-actions"); if(ext) ext.style.display="none";
      }
    }
    renderContext(item);
  }

  const oldOpen=window.openAppointmentDetailsModal;
  if(typeof oldOpen==="function"){
    window.openAppointmentDetailsModal=function(item){
      const result=oldOpen.apply(this,arguments);
      applyDetails(item);
      requestAnimationFrame(()=>applyDetails(item));
      return result;
    };
  }

  window.crmReviewOpenEditorV309=function(){
    const item=currentAppointment();
    if(!item || !isReview(item)) return;
    const box=document.getElementById("crmReviewEditorV309");
    if(!box) return;
    box.hidden=false;
    const selectedService=meaningfulService(item)==="Do sprawdzenia"?"":meaningfulService(item);
    box.innerHTML=`
      <label>Klient<input id="crmReviewClientV309" type="text" value="${esc(meaningfulName(item)==="Blokada czasu"?"":meaningfulName(item))}" oninput="crmReviewRefreshConfirmStateV3011()"></label>
      <label>Procedura${procedureSelectHtml(selectedService)}</label>
      <label class="wide">Notatka CRM<textarea id="crmReviewNoteV309" rows="3" placeholder="Opcjonalna informacja po sprawdzeniu"></textarea></label>
      <p class="crm-review-editor-help-v3011 wide">„Zapisz roboczo” tylko poprawia dane w kolejce. „OK — utwórz wizytę” tworzy normalną wizytę, dodaje/łączy klienta i usuwa ten wpis z „Do sprawdzenia”.</p>
      <div class="crm-review-editor-actions-v309"><button type="button" class="btn-secondary" onclick="crmReviewCloseEditorV309()">Anuluj</button><button type="button" class="btn-secondary" onclick="crmReviewSaveEditorV309()">Zapisz roboczo</button><button id="crmReviewConfirmV3011" type="button" class="btn-primary crm-review-confirm-v3011" onclick="crmReviewConfirmAsVisitV3011()">✓ OK — utwórz wizytę</button></div>`;
    const select=document.getElementById('crmReviewServiceV309');
    if(select) select.addEventListener('change',refreshConfirmStateV3011);
    requestAnimationFrame(refreshConfirmStateV3011);
  };
  window.crmReviewCloseEditorV309=function(){ const box=document.getElementById("crmReviewEditorV309"); if(box) box.hidden=true; };
  window.crmReviewSaveEditorV309=async function(){
    const item=currentAppointment();
    if(!item || !isReview(item)) return;
    const clientName=text(document.getElementById("crmReviewClientV309")?.value);
    const service=text(document.getElementById("crmReviewServiceV309")?.value);
    const note=text(document.getElementById("crmReviewNoteV309")?.value);
    const btn=document.querySelector("#crmReviewEditorV309 .btn-primary"); if(btn){btn.disabled=true;btn.textContent="Zapisywanie…";}
    try{
      let data;
      if(document.body.classList.contains("crm-dev-v4") || /^DEV-V/.test(text(item.eventId))){
        data={success:true,clientName,service,note,reviewReason:item.reviewReason||"Niepewny termin — do sprawdzenia"};
      }else if(typeof window.crmPost==="function"){
        data=await window.crmPost({action:"updateExternalReviewAnnotationV4713",eventId:item.eventId||"",sourceId:item.sourceId||"",clientName,service,note});
      }else{
        const response=await fetch(appsScriptUrl(),{method:"POST",headers:{"Content-Type":"text/plain"},body:JSON.stringify({action:"updateExternalReviewAnnotationV4713",eventId:item.eventId||"",sourceId:item.sourceId||"",clientName,service,note})});
        data=await response.json();
      }
      if(!data?.success) throw new Error(data?.error||"Nie udało się zapisać danych review");
      item.name=clientName||item.name; item.reviewClient=clientName; item.service=service||"Do sprawdzenia"; item.reviewService=service; item.reviewReason=data.reviewReason||item.reviewReason; item.reviewRequired=true;
      window.crmReviewCloseEditorV309();
      applyDetails(item);
      if(typeof window.renderBooksyCalendar==="function") window.renderBooksyCalendar();
      if(typeof window.crmRenderDayVisitsList==="function") window.crmRenderDayVisitsList();
      if(typeof window.crmToast==="function") window.crmToast("Dane zapisane roboczo. Wpis nadal czeka na potwierdzenie jako wizyta.");
      refreshQueueBadgeV3011(false);
    }catch(error){
      if(typeof window.crmToast==="function") window.crmToast("Błąd zapisu: "+(error.message||error),"error"); else alert(error.message||error);
    }finally{if(btn){btn.disabled=false;btn.textContent="Zapisz roboczo";} refreshConfirmStateV3011();}
  };

  window.crmReviewRefreshConfirmStateV3011=refreshConfirmStateV3011;
  window.crmReviewConfirmAsVisitV3011=async function(){
    const item=currentAppointment();
    if(!item || !isReview(item)) return;
    const clientName=text(document.getElementById('crmReviewClientV309')?.value);
    const service=text(document.getElementById('crmReviewServiceV309')?.value);
    const note=text(document.getElementById('crmReviewNoteV309')?.value);
    if(!clientName){ if(typeof window.crmToast==='function')window.crmToast('Wpisz klienta przed potwierdzeniem.','error'); return; }
    if(!isCatalogProcedure(service)){ if(typeof window.crmToast==='function')window.crmToast('Wybierz procedurę dokładnie z Cennika DOM.','error'); return; }
    const btn=document.getElementById('crmReviewConfirmV3011');
    if(btn){btn.disabled=true;btn.textContent='Potwierdzanie…';}
    try{
      let data;
      if(document.body.classList.contains('crm-dev-v4') || /^DEV-V/.test(text(item.eventId))){
        data={success:true,confirmed:true,clientName,service,sourceCalendarTouched:false};
      }else if(typeof window.crmPost==='function'){
        data=await window.crmPost({action:'confirmExternalReviewAsVisitV4715',eventId:item.eventId||'',sourceId:item.sourceId||'',clientName,service,note});
      }else{
        const response=await fetch(appsScriptUrl(),{method:'POST',headers:{'Content-Type':'text/plain'},body:JSON.stringify({action:'confirmExternalReviewAsVisitV4715',eventId:item.eventId||'',sourceId:item.sourceId||'',clientName,service,note})});
        data=await response.json();
      }
      if(!data?.success) throw new Error(data?.error||'Nie udało się potwierdzić wizyty');

      if(document.body.classList.contains('crm-dev-v4')){
        try{
          if(typeof appointmentsData!=='undefined' && Array.isArray(appointmentsData)){
            item.eventType='appointment'; item.reviewRequired=false; item.canEditReview=false; item.sourceType='WIFE_CALENDAR'; item.bookingSource='DOM'; item.source='DOM'; item.name=clientName; item.service=service; item.status='POTWIERDZONA'; item.crmStatus='POTWIERDZONA';
          }
        }catch(ignore){}
      }else if(typeof window.crmLightSyncCalendarData==='function'){
        await window.crmLightSyncCalendarData('review-confirmed');
      }else if(typeof crmLightSyncCalendarData==='function'){
        await crmLightSyncCalendarData('review-confirmed');
      }else if(typeof window.renderBooksyCalendar==='function'){
        window.renderBooksyCalendar();
      }

      if(typeof window.closeAppointmentModal==='function') window.closeAppointmentModal();
      else{ const modal=document.getElementById('appointmentDetailsModal'); if(modal) modal.style.display='none'; }
      if(typeof window.crmToast==='function') window.crmToast('Potwierdzono. Utworzono normalną wizytę i usunięto wpis z „Do sprawdzenia”.');
      await refreshQueueBadgeV3011(true);
    }catch(error){
      if(typeof window.crmToast==='function') window.crmToast('Nie udało się potwierdzić: '+(error.message||error),'error'); else alert(error.message||error);
    }finally{
      if(btn){btn.disabled=false;btn.textContent='✓ OK — utwórz wizytę';}
      refreshConfirmStateV3011();
    }
  };

  const renderBeforeQueueV3011=window.renderBooksyCalendar;
  if(typeof renderBeforeQueueV3011==='function'){
    window.renderBooksyCalendar=function(){
      const result=renderBeforeQueueV3011.apply(this,arguments);
      requestAnimationFrame(()=>paintQueueBadgeV3011(queueTotalV3012==null?localReviewCount():queueTotalV3012));
      return result;
    };
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',()=>setTimeout(()=>refreshQueueBadgeV3011(true),700));
  else setTimeout(()=>refreshQueueBadgeV3011(true),700);
  window.crmRefreshReviewQueueBadgeV3011=()=>refreshQueueBadgeV3011(true);

  /* Dostępne dla Full Test V2. */
  window.crmReviewUiV309={isReview,isKnownHardBlock,hardBlockLabel,meaningfulName,meaningfulService,applyDetails,isCatalogProcedure,localReviewCount,refreshQueueBadgeV3011,queueClassMetaV3023};
  window.crmReviewBlocksVersionV309="30.24";
})();
