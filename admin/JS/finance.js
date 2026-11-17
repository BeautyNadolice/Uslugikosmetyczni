// BUILD MARKER: V30.35 — COLLAPSIBLE SERVICES + COMPACT STATISTICS UI
/* ==========================================================================
   FINANSE + STATYSTYKA V30.35 / zwijane Usługi + kompaktowy układ + filtrowalne operacje Booksy
   ========================================================================== */
const crmFinanceStateV3026={initialized:false,loading:false,requestNo:0,data:null,mode:"finanse",defaultStaffApplied:false,operationFilter:"ALL",operationsExpanded:false};

function crmFinanceMoneyV3026(value){return new Intl.NumberFormat("pl-PL",{style:"currency",currency:"PLN",minimumFractionDigits:0,maximumFractionDigits:2}).format(Number(value)||0);}
function crmFinanceNumberV3026(value){return new Intl.NumberFormat("pl-PL",{maximumFractionDigits:2}).format(Number(value)||0);}
function crmFinanceEscapeV3026(value){return String(value??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;");}
function crmFinanceMinutesV3026(value){const m=Math.max(0,Math.round(Number(value)||0));const h=Math.floor(m/60),r=m%60;return h?`${h} h${r?` ${r} min`:""}`:`${r} min`;}
function crmFinanceIsoDateV3026(date){const d=new Date(date),y=d.getFullYear(),m=String(d.getMonth()+1).padStart(2,"0"),day=String(d.getDate()).padStart(2,"0");return `${y}-${m}-${day}`;}

function crmFinanceSetPeriodV3026(preset){
    const now=new Date();let from=new Date(now.getFullYear(),now.getMonth(),1),to=new Date(now.getFullYear(),now.getMonth()+1,0);
    if(preset==="PREV_MONTH"){from=new Date(now.getFullYear(),now.getMonth()-1,1);to=new Date(now.getFullYear(),now.getMonth(),0);}
    else if(preset==="7D"){from=new Date(now);from.setDate(from.getDate()-6);to=new Date(now);}
    else if(preset==="30D"){from=new Date(now);from.setDate(from.getDate()-29);to=new Date(now);}
    else if(preset==="YEAR"){from=new Date(now.getFullYear(),0,1);to=new Date(now.getFullYear(),11,31);}
    const f=document.getElementById("finance-from-v3026"),t=document.getElementById("finance-to-v3026");if(f)f.value=crmFinanceIsoDateV3026(from);if(t)t.value=crmFinanceIsoDateV3026(to);
}

function crmFinanceModeV3026(mode){
    crmFinanceStateV3026.mode=mode==="statystyka"?"statystyka":"finanse";
    document.querySelectorAll("[data-finance-mode-v3026]").forEach(btn=>btn.classList.toggle("active",btn.dataset.financeModeV3026===crmFinanceStateV3026.mode));
    document.querySelectorAll("[data-finance-panel-v3026]").forEach(panel=>panel.hidden=panel.dataset.financePanelV3026!==crmFinanceStateV3026.mode);
}

function crmFinanceEnsureLayoutV3034(){
    const statPanel=document.querySelector('[data-finance-panel-v3026="statystyka"]');
    const statGrid=statPanel?.querySelector(".crm-finance-grid-v3026");
    const kpis=statPanel?.querySelector(".crm-finance-kpis-v3026");
    const staffPanel=crmFinanceClosestV3028("finance-by-staff-v3026","section");
    const servicePanel=crmFinanceClosestV3028("finance-by-service-v3026","section");
    const operationsPanel=crmFinanceClosestV3028("finance-booksy-ops-v3026","section");
    if(staffPanel&&kpis){
        staffPanel.classList.add("crm-finance-staff-strip-panel-v3034");
        if(staffPanel.previousElementSibling!==kpis)kpis.insertAdjacentElement("afterend",staffPanel);
    }
    if(servicePanel)servicePanel.classList.add("crm-finance-services-panel-v3034");
    if(operationsPanel)operationsPanel.classList.add("crm-finance-operations-panel-v3034");
    if(statGrid){
        const sourcePanel=crmFinanceClosestV3028("finance-by-source-v3026","section");
        const trendPanel=crmFinanceClosestV3028("finance-trend-v3026","section");
        if(sourcePanel&&sourcePanel.parentElement===statGrid&&trendPanel&&trendPanel.parentElement===statGrid&&sourcePanel.nextElementSibling!==trendPanel){
            statGrid.insertBefore(trendPanel,sourcePanel.nextElementSibling);
        }
    }
}

function crmFinanceInitV3026(){
    if(crmFinanceStateV3026.initialized)return;crmFinanceStateV3026.initialized=true;crmFinanceSetPeriodV3026("MONTH");crmFinanceModeV3026("finanse");crmFinanceEnsureCompliancePanelsV3028();crmFinanceEnsureLayoutV3034();crmFinanceApplySourceViewV3028();
    const preset=document.getElementById("finance-preset-v3026");if(preset)preset.addEventListener("change",()=>{if(preset.value!=="CUSTOM")crmFinanceSetPeriodV3026(preset.value);crmFinanceLoadV3026(true);});
    ["finance-from-v3026","finance-to-v3026","finance-source-v3026","finance-staff-v3026"].forEach(id=>{const el=document.getElementById(id);if(el)el.addEventListener("change",()=>{if((id==="finance-from-v3026"||id==="finance-to-v3026")&&preset)preset.value="CUSTOM";if(id==="finance-source-v3026")crmFinanceApplySourceViewV3028();crmFinanceLoadV3026(true);});});
}

function crmFinanceSetLoadingV3026(flag,text){crmFinanceStateV3026.loading=Boolean(flag);const status=document.getElementById("finance-status-v3026"),refresh=document.getElementById("finance-refresh-v3026");if(status)status.textContent=text||(flag?"Ładowanie…":"");if(refresh)refresh.disabled=Boolean(flag);}
function crmFinanceCardV3026(id,value,sub){const el=document.getElementById(id),small=document.getElementById(id+"-sub");if(el)el.textContent=value;if(small)small.textContent=sub||"";}

function crmFinanceCurrentSourceV3028(){return String(document.getElementById("finance-source-v3026")?.value||"ALL").toUpperCase();}
function crmFinanceClosestV3028(id,selector){const el=document.getElementById(id);return el?el.closest(selector):null;}
function crmFinanceSetHiddenV3028(node,hidden){if(node)node.hidden=Boolean(hidden);}
function crmFinanceSetCardLabelV3028(id,label){const card=crmFinanceClosestV3028(id,".crm-finance-kpi-v3026");const span=card?.querySelector("span");if(span)span.textContent=label;}
function crmFinanceEnsureCompliancePanelsV3028(){
    const statGrid=document.querySelector('[data-finance-panel-v3026="statystyka"] .crm-finance-grid-v3026');
    if(statGrid&&!document.getElementById("finance-stat-time-panel-v3028")){
        const section=document.createElement("section");section.id="finance-stat-time-panel-v3028";section.className="crm-finance-panel-v3026 crm-finance-span-v3026";section.innerHTML='<h2>Czas i efektywność</h2><p>Statystyka czasu, przerw, przychodu i efektywności zgodnie z wybranym źródłem.</p><div id="finance-stat-time-v3028"></div>';statGrid.appendChild(section);
    }
    if(statGrid&&!document.getElementById("finance-staff-cancel-audit-panel-v3033")){
        const section=document.createElement("section");section.id="finance-staff-cancel-audit-panel-v3033";section.className="crm-finance-panel-v3026 crm-finance-span-v3026";section.innerHTML='<h2>Anulowane przez personel</h2><p>Informacyjny audyt anulowań wykonanych przez personel Booksy. Te wpisy nie są doliczane do przychodu, czasu ani wynagrodzenia.</p><div id="finance-staff-cancel-audit-v3033"></div>';statGrid.appendChild(section);
    }
    const financeGrid=document.querySelector('[data-finance-panel-v3026="finanse"] .crm-finance-grid-v3026');
    if(financeGrid&&!document.getElementById("finance-source-split-panel-v3028")){
        const section=document.createElement("section");section.id="finance-source-split-panel-v3028";section.className="crm-finance-panel-v3026 crm-finance-span-v3026";section.innerHTML='<h2>Podział przychodu według źródła</h2><p>Przy widoku Wszystko DOM i Booksy pozostają rozdzielone.</p><div id="finance-source-split-v3028"></div>';financeGrid.insertBefore(section,financeGrid.firstChild);
    }
}
function crmFinanceApplySourceViewV3028(){
    crmFinanceEnsureCompliancePanelsV3028();crmFinanceEnsureLayoutV3034();
    const source=crmFinanceCurrentSourceV3028(),isDom=source==="DOM",isBooksy=source==="BOOKSY",isAll=!isDom&&!isBooksy;
    const staffSelect=document.getElementById("finance-staff-v3026"),staffField=staffSelect?.closest("label");if(staffField)staffField.hidden=isDom;
    ["finance-f-earnings-v3026","finance-f-commission-v3026","finance-f-hourly-v3026","finance-f-paidtime-v3026","finance-f-rate-v3026"].forEach(id=>crmFinanceSetHiddenV3028(crmFinanceClosestV3028(id,".crm-finance-kpi-v3026"),isDom));
    ["finance-threshold-v3026","finance-time-v3026","finance-payroll-period-v3026","finance-booksy-timeline-v3026"].forEach(id=>crmFinanceSetHiddenV3028(crmFinanceClosestV3028(id,"section"),isDom));
    crmFinanceSetHiddenV3028(crmFinanceClosestV3028("finance-dom-time-v3026","section"),isBooksy);
    crmFinanceSetHiddenV3028(crmFinanceClosestV3028("finance-booksy-ops-v3026","section"),isDom);
    crmFinanceSetHiddenV3028(document.getElementById("finance-staff-cancel-audit-panel-v3033"),isDom);
    crmFinanceSetHiddenV3028(crmFinanceClosestV3028("finance-by-staff-v3026","section"),isDom);
    crmFinanceSetHiddenV3028(document.getElementById("finance-source-split-panel-v3028"),!isAll);
    crmFinanceSetCardLabelV3028("finance-f-earnings-v3026","Zarobek Booksy");
    crmFinanceSetCardLabelV3028("finance-f-commission-v3026","% od usług Booksy");
    crmFinanceSetCardLabelV3028("finance-f-hourly-v3026","Za czas Booksy");
    crmFinanceSetCardLabelV3028("finance-f-paidtime-v3026","Płatny czas Booksy");
    crmFinanceSetCardLabelV3028("finance-f-rate-v3026","Efektywna stawka Booksy");
    const staffPanel=crmFinanceClosestV3028("finance-by-staff-v3026","section"),staffTitle=staffPanel?.querySelector("h2"),staffDesc=staffPanel?.querySelector("p");if(staffTitle)staffTitle.textContent="Pracownicy Booksy";if(staffDesc)staffDesc.textContent="Statystyka przychodu Booksy według pracownika.";
}
function crmFinanceSourceRevenueV3028(data,key){return Number((data.bySource||[]).find(x=>x.key===key)?.revenue)||0;}
function crmFinanceMiniGridV3028(items){
    return `<div class="crm-finance-mini-grid-v3026">${items.map(x=>`<div><span>${crmFinanceEscapeV3026(x[0])}</span><strong>${x[1]}</strong></div>`).join("")}</div>`;
}
function crmFinanceRenderStatTimeV3028(data){
    const host=document.getElementById("finance-stat-time-v3028");if(!host)return;
    const source=crmFinanceCurrentSourceV3028(),p=data.payroll||{},dom=data.domTime||{};
    const booksy=crmFinanceMiniGridV3028([
        ["Zabiegi Booksy",crmFinanceMinutesV3026(p.procedureMinutes)],
        ["Płatne przerwy",crmFinanceMinutesV3026(p.paidGapMinutes)],
        ["Niepłatne potwierdzone",crmFinanceMinutesV3026(p.unpaidGapMinutes)],
        ["Do decyzji",crmFinanceMinutesV3026(p.reviewGapMinutes)],
        ["Długie / opcjonalne",crmFinanceMinutesV3026(p.optionalGapMinutes)],
        ["Łączny płatny czas",crmFinanceMinutesV3026(p.paidMinutes)],
        ["Faktyczna obecność",crmFinanceMinutesV3026(p.actualPresenceMinutes)],
        ["Przychód Booksy",crmFinanceMoneyV3026(crmFinanceSourceRevenueV3028(data,"BOOKSY"))],
        ["Zarobek Booksy",crmFinanceMoneyV3026(p.total)],
        ["Efektywna stawka Booksy",`${crmFinanceMoneyV3026(p.effectiveRate)}/h`]
    ]);
    const domBlock=crmFinanceMiniGridV3028([
        ["Praca DOM",crmFinanceMinutesV3026(dom.procedureMinutes)],
        ["Przerwy statystyczne",crmFinanceMinutesV3026(dom.breakMinutes)],
        ["Łączny czas DOM",crmFinanceMinutesV3026(dom.totalMinutes)],
        ["Przychód DOM",crmFinanceMoneyV3026(dom.revenue)],
        ["Przychód/h pracy",`${crmFinanceMoneyV3026(dom.revenuePerProcedureHour)}/h`],
        ["Przychód/h z przerwami",`${crmFinanceMoneyV3026(dom.revenuePerTotalHour)}/h`]
    ]);
    if(source==="DOM"){host.innerHTML=domBlock;return;}
    if(source==="BOOKSY"){host.innerHTML=booksy;return;}
    host.innerHTML=`<div class="crm-finance-day-v3026">Booksy — czas i efektywność</div>${booksy}<div class="crm-finance-day-v3026">DOM — czas i efektywność</div>${domBlock}`;
}
function crmFinanceRenderSourceSplitV3028(data){
    const host=document.getElementById("finance-source-split-v3028");if(!host)return;
    host.innerHTML=crmFinanceRowsV3026(data.bySource,"label","Brak danych źródłowych.");
}

function crmFinanceRowsV3026(items,labelKey,empty){
    if(!Array.isArray(items)||!items.length)return `<div class="crm-finance-empty-v3026">${crmFinanceEscapeV3026(empty)}</div>`;
    const max=Math.max(...items.map(x=>Number(x.revenue)||Number(x.count)||0),1);
    return items.map(item=>{const value=Number(item.revenue)||0,count=Number(item.visits)||Number(item.count)||0,percent=Math.max(2,Math.round(((value||count)/max)*100)),label=String(item[labelKey]||item.label||item.type||"—");return `<div class="crm-finance-row-v3026"><div class="crm-finance-row-main-v3026"><strong>${crmFinanceEscapeV3026(label)}</strong><span>${item.revenue!==undefined?crmFinanceMoneyV3026(value):`${count} oper.`}</span></div><div class="crm-finance-meter-v3026"><i style="width:${percent}%"></i></div><small>${item.revenue!==undefined?`${count} wizyt · śr. ${crmFinanceMoneyV3026(item.average||0)}`:`${count} operacji`}</small></div>`;}).join("");
}

function crmFinanceRenderStaffStripV3034(items){
    const list=Array.isArray(items)?items:[];
    if(!list.length)return '<div class="crm-finance-empty-v3026">Brak danych personelu.</div>';
    return `<div class="crm-finance-staff-strip-list-v3034">${list.map(x=>`<div class="crm-finance-staff-strip-item-v3034"><div><strong>${crmFinanceEscapeV3026(x.label||x.name||"Pracownik")}</strong><small>${Number(x.visits)||0} wizyt · śr. ${crmFinanceMoneyV3026(x.average)}</small></div><b>${crmFinanceMoneyV3026(x.revenue)}</b></div>`).join("")}</div>`;
}

function crmFinanceUpdateStaffV3026(data){
    const select=document.getElementById("finance-staff-v3026");if(!select)return;
    const prev=select.value,active=(Array.isArray(data.staff)?data.staff:[]).filter(x=>x.active!==false),main=data.mainStaff||active.find(x=>x.position==="MASTER_GLOWNY")||active[0];
    select.innerHTML=active.map(x=>`<option value="${crmFinanceEscapeV3026(x.name)}">${crmFinanceEscapeV3026(x.name)}${x.position==="MASTER_GLOWNY"?" — główny":""}</option>`).join("")+`<option value="__ALL__">Wszyscy pracownicy</option>`;
    if(prev&&[...select.options].some(o=>o.value===prev))select.value=prev;
    else if(data.filters&&data.filters.staff&&data.filters.staff!=="__ALL__"&&[...select.options].some(o=>o.value===data.filters.staff))select.value=data.filters.staff;
    else if(main)select.value=main.name;
    crmFinanceStateV3026.defaultStaffApplied=true;
}

function crmFinanceRenderQualityV3026(data){
    const s=data.summary||{},el=document.getElementById("finance-quality-v3026"),n=Number(s.unresolvedVisits)||0,c=Number(s.cancelledVisits)||0;if(!el)return;
    el.classList.toggle("is-warning",n>0);el.disabled=n===0;
    el.innerHTML=n>0?`<strong>${n} wizyt nie wliczono</strong><span>Kliknij, aby zobaczyć które wizyty i dokładny powód. Anulowane: ${c}.</span><b>›</b>`:`<strong>Dane kompletne dla wybranego zakresu</strong><span>Wszystkie aktywne wizyty mają rozpoznaną cenę. Anulowane: ${c}.</span><b>✓</b>`;
}

function crmFinanceRenderUnresolvedV3026(data){
    const host=document.getElementById("finance-unresolved-list-v3026"),items=Array.isArray(data.unresolvedDetails)?data.unresolvedDetails:[];if(!host)return;
    host.innerHTML=items.length?items.map((item,index)=>`<article class="crm-finance-unresolved-item-v3026" role="button" tabindex="0" onclick="crmFinanceFixUnresolvedV3029(${index})" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();crmFinanceFixUnresolvedV3029(${index});}"><div><strong>${crmFinanceEscapeV3026(item.date)} ${crmFinanceEscapeV3026(item.time||"")} · ${crmFinanceEscapeV3026(item.client||"Bez klienta")}</strong><span>${crmFinanceEscapeV3026(item.service||"Brak usługi")} · ${crmFinanceEscapeV3026(item.source||"")}</span></div><ul>${(item.reasons||[]).map(r=>`<li>${crmFinanceEscapeV3026(r)}</li>`).join("")}</ul><div class="crm-finance-unresolved-action-v3029"><small>ID: ${crmFinanceEscapeV3026(item.appointmentId||"—")} · źródło ceny: ${crmFinanceEscapeV3026(item.priceSource||"—")}</small><button type="button" class="btn-primary" onclick="event.stopPropagation();crmFinanceFixUnresolvedV3029(${index})">Popraw wizytę</button></div></article>`).join(""):`<div class="crm-finance-empty-v3026">Brak wizyt niewliczonych.</div>`;
}
function crmFinanceOpenUnresolvedV3026(){if(!(crmFinanceStateV3026.data?.unresolvedDetails||[]).length)return;const modal=document.getElementById("finance-unresolved-modal-v3026");if(modal)modal.hidden=false;}
function crmFinanceCloseUnresolvedV3026(){const modal=document.getElementById("finance-unresolved-modal-v3026");if(modal)modal.hidden=true;}
function crmFinanceResolveVisitForEditV3030(item){
    if(!item)return null;
    const id=String(item.appointmentId||""),eventId=String(item.visit&&item.visit.eventId||"");
    const rows=Array.isArray(window.appointmentsData)?window.appointmentsData:(typeof appointmentsData!=="undefined"&&Array.isArray(appointmentsData)?appointmentsData:[]);
    return rows.find(v=>(id&&String(v&&v.appointmentId||"")===id)||(eventId&&String(v&&v.eventId||"")===eventId))||item.visit||null;
}
async function crmFinanceFetchVisitForEditV3030(item){
    const local=crmFinanceResolveVisitForEditV3030(item);
    if(local)return local;
    const appointmentId=String(item&&item.appointmentId||"").trim();
    if(!appointmentId)return null;
    try{
        const data=await crmAdminPostV3027({action:"getFinanceVisitForEditV4744",appointmentId},{timeoutMs:12000,cacheMs:0,force:true});
        return data&&data.success&&data.visit?data.visit:null;
    }catch(error){
        console.error("Finance V30.30 visit lookup",error);
        return null;
    }
}
async function crmFinanceFixUnresolvedV3029(index){
    const items=crmFinanceStateV3026.data&&Array.isArray(crmFinanceStateV3026.data.unresolvedDetails)?crmFinanceStateV3026.data.unresolvedDetails:[],item=items[Number(index)];
    if(!item)return;
    const visit=await crmFinanceFetchVisitForEditV3030(item);
    if(!visit){
        if(typeof crmToast==="function")crmToast("Nie udało się pobrać tej wizyty z CRM.","error");
        else alert("Nie udało się pobrać tej wizyty z CRM.");
        return;
    }
    crmFinanceCloseUnresolvedV3026();
    if(typeof openAppointmentDetailsModal!=="function"){
        if(typeof crmToast==="function")crmToast("Moduł edycji wizyty nie jest dostępny.","error");
        return;
    }
    openAppointmentDetailsModal(visit);
    const source=String(visit.bookingSource||visit.source||item.source||"").toUpperCase();
    const isBooksy=source.indexOf("BOOKSY")!==-1;
    if(isBooksy){
        if(typeof crmToast==="function")crmToast("Otworzyłem wizytę Booksy. Włącz edycję danych CRM, jeśli chcesz ją poprawić.","info");
        return;
    }
    if(typeof openEditAppointmentModal==="function"){
        try{await openEditAppointmentModal({changeService:true});}
        catch(error){console.error("Finance V30.30 direct fix",error);if(typeof crmToast==="function")crmToast("Wizyta została otwarta, ale nie udało się uruchomić zmiany usługi.","error");}
    }
}
window.crmFinanceFixUnresolvedV3029=crmFinanceFixUnresolvedV3029;

const CRM_FINANCE_OPERATION_LABELS_V3034={
    CLIENT_CANCEL:"Anulowane przez klienta",
    CLIENT_CONFIRMED_PROPOSAL:"Potwierdzona propozycja klienta",
    CLIENT_RESCHEDULE:"Zmiana terminu przez klienta",
    NEW:"Nowa wizyta",
    STAFF_CANCEL:"Anulowane przez personel",
    STAFF_CHANGE:"Zmiana przez personel",
    TECHNICAL_NONE:"Operacja techniczna"
};
function crmFinanceOperationLabelV3034(type){
    const key=String(type||"INNE").toUpperCase();
    if(CRM_FINANCE_OPERATION_LABELS_V3034[key])return CRM_FINANCE_OPERATION_LABELS_V3034[key];
    return key.toLowerCase().replace(/_/g," ").replace(/(^|\s)\S/g,m=>m.toUpperCase());
}
function crmFinanceSetOperationsFilterV3034(type){
    crmFinanceStateV3026.operationFilter=String(type||"ALL").toUpperCase();
    crmFinanceStateV3026.operationsExpanded=true;
    if(crmFinanceStateV3026.data)crmFinanceRenderOperationsV3026(crmFinanceStateV3026.data);
}
function crmFinanceToggleOperationsV3034(){
    crmFinanceStateV3026.operationsExpanded=!crmFinanceStateV3026.operationsExpanded;
    if(crmFinanceStateV3026.data)crmFinanceRenderOperationsV3026(crmFinanceStateV3026.data);
}
window.crmFinanceSetOperationsFilterV3034=crmFinanceSetOperationsFilterV3034;
window.crmFinanceToggleOperationsV3034=crmFinanceToggleOperationsV3034;

function crmFinanceRenderOperationsV3026(data){
    const operations=data.booksyOperations||{},types=Array.isArray(operations.types)?operations.types:[],items=Array.isArray(operations.items)?operations.items:[],operators=Array.isArray(operations.operators)?operations.operators:[],host=document.getElementById("finance-booksy-ops-v3026");if(!host)return;
    const total=items.length||types.reduce((sum,x)=>sum+(Number(x.count)||0),0);
    const filter=crmFinanceStateV3026.operationFilter||"ALL";
    const chipButton=(key,label,count)=>`<button type="button" class="crm-finance-op-filter-v3034${filter===key?" is-active":""}" onclick="crmFinanceSetOperationsFilterV3034('${crmFinanceEscapeV3026(key)}')"><span>${crmFinanceEscapeV3026(label)}</span><b>${Number(count)||0}</b></button>`;
    const typeOrder=["NEW","CLIENT_RESCHEDULE","CLIENT_CONFIRMED_PROPOSAL","STAFF_CHANGE","CLIENT_CANCEL","STAFF_CANCEL","TECHNICAL_NONE"];
    const orderedTypes=types.slice().sort((a,b)=>{const ak=String(a.type||"INNE").toUpperCase(),bk=String(b.type||"INNE").toUpperCase(),ai=typeOrder.indexOf(ak),bi=typeOrder.indexOf(bk);return (ai<0?999:ai)-(bi<0?999:bi)||crmFinanceOperationLabelV3034(ak).localeCompare(crmFinanceOperationLabelV3034(bk),"pl");});
    const chips=[chipButton("ALL","Wszystkie",total)].concat(orderedTypes.map(x=>chipButton(String(x.type||"INNE").toUpperCase(),crmFinanceOperationLabelV3034(x.type),x.count))).join("");
    let content="";
    if(items.length){
        const filtered=filter==="ALL"?items:items.filter(x=>String(x.type||"").toUpperCase()===filter);
        content=filtered.length?`<div class="crm-finance-ops-grid-v3034">${filtered.map(x=>{
            const client=x.client||"Bez klienta",service=x.service||crmFinanceOperationLabelV3034(x.type),visit=x.visitDate||x.messageDate||"—",operator=x.operator||"—",role=x.role?` · ${x.role}`:"",amount=(x.amount!==null&&x.amount!==undefined&&x.amount!=="")?` · ${crmFinanceMoneyV3026(x.amount)}`:"";
            return `<article class="crm-finance-op-card-v3034"><div class="crm-finance-op-card-top-v3034"><strong>${crmFinanceEscapeV3026(client)}</strong><span>${crmFinanceEscapeV3026(crmFinanceOperationLabelV3034(x.type))}</span></div><p>${crmFinanceEscapeV3026(service)}</p><small>${crmFinanceEscapeV3026(visit)}${amount}</small><footer>${crmFinanceEscapeV3026(operator)}${crmFinanceEscapeV3026(role)}</footer></article>`;
        }).join("")}</div>`:`<div class="crm-finance-empty-v3026">Brak operacji tego typu w wybranym okresie.</div>`;
    }else if(operators.length){
        content=`<div class="crm-finance-ops-grid-v3034">${operators.map(x=>`<article class="crm-finance-op-card-v3034"><div class="crm-finance-op-card-top-v3034"><strong>${crmFinanceEscapeV3026(x.name)}</strong><span>${crmFinanceEscapeV3026(x.role||"")}</span></div><p>zmiany ${x.changes||0} · anulowania ${x.cancellations||0}</p><small>techniczne ${x.technical||0} · razem ${x.count||0}</small></article>`).join("")}</div>`;
    }else content='<div class="crm-finance-empty-v3026">Brak operacji Booksy.</div>';
    host.innerHTML=`<div class="crm-finance-ops-toolbar-v3034"><div class="crm-finance-ops-filters-v3034">${chips}</div><button type="button" class="crm-finance-ops-toggle-v3034" onclick="crmFinanceToggleOperationsV3034()">${crmFinanceStateV3026.operationsExpanded?"Zwiń":"Pokaż"}</button></div>${crmFinanceStateV3026.operationsExpanded?`<div class="crm-finance-ops-body-v3034">${content}</div>`:""}`;
}

function crmFinanceRenderStaffCancellationAuditV3033(data){
    const host=document.getElementById("finance-staff-cancel-audit-v3033");if(!host)return;
    const audit=data.staffCancellations||{},items=Array.isArray(audit.items)?audit.items:[],operators=Array.isArray(audit.operators)?audit.operators:[];
    if(!items.length){host.innerHTML='<div class="crm-finance-empty-v3026">Brak anulowań wykonanych przez personel w wybranym okresie.</div>';return;}
    const chips=`<div class="crm-finance-chips-v3026"><span class="crm-finance-chip-v3026"><b>Razem</b>${Number(audit.count)||items.length}</span>${operators.map(x=>`<span class="crm-finance-chip-v3026"><b>${crmFinanceEscapeV3026(x.name||"Personel")}</b>${Number(x.count)||0}</span>`).join("")}</div>`;
    const rows=items.map(x=>`<details class="crm-finance-visit-v3026"><summary><span><b>${crmFinanceEscapeV3026(x.visitDate||"—")}</b> ${crmFinanceEscapeV3026(x.client||"Bez klienta")} · ${crmFinanceEscapeV3026(x.service||"Brak usługi")}</span><strong>${crmFinanceEscapeV3026(x.operator||"Personel")}${x.partial?" · częściowe":""}</strong></summary><div class="crm-finance-visit-details-v3026"><div><span>Operator</span><b>${crmFinanceEscapeV3026(x.operator||"—")}</b></div><div><span>Rola</span><b>${crmFinanceEscapeV3026(x.role||"—")}</b></div><div><span>Data anulowania</span><b>${crmFinanceEscapeV3026(x.cancelledAt||"—")}</b></div><div><span>Termin wizyty</span><b>${crmFinanceEscapeV3026(x.visitDate||"—")}</b></div><div><span>Cena z operacji</span><b>${x.amount!==null&&x.amount!==undefined&&x.amount!==""?crmFinanceMoneyV3026(x.amount):"—"}</b></div><div><span>Typ</span><b>${x.partial?"Częściowe anulowanie":"Anulowanie wizyty/usługi"}</b></div><div class="wide"><span>AppointmentId</span><b>${crmFinanceEscapeV3026(x.appointmentId||"—")}</b></div><div class="wide"><span>SourceId</span><b>${crmFinanceEscapeV3026(x.sourceId||"—")}</b></div>${x.notes?`<div class="wide"><span>Uwagi</span><b>${crmFinanceEscapeV3026(x.notes)}</b></div>`:""}</div></details>`).join("");
    host.innerHTML=chips+rows;
}

function crmFinanceRenderThresholdV3026(data){
    const host=document.getElementById("finance-threshold-v3026"),rows=Array.isArray(data.thresholdBreakdown)?data.thresholdBreakdown:[];if(!host)return;
    host.innerHTML=rows.length?rows.map(x=>`<div class="crm-finance-threshold-v3026"><div><strong>${crmFinanceEscapeV3026(x.month)} · ${crmFinanceEscapeV3026(x.staff)}</strong><span>${x.enabled?"Próg aktywny":"Próg wyłączony"}</span></div><dl><dt>Obrót</dt><dd>${crmFinanceMoneyV3026(x.turnover)}</dd><dt>Próg</dt><dd>${crmFinanceMoneyV3026(x.threshold)}</dd><dt>Nie wliczono przez próg</dt><dd>${crmFinanceMoneyV3026(x.deducted)}</dd><dt>Baza do %</dt><dd>${crmFinanceMoneyV3026(x.commissionBase)}</dd><dt>Wynagrodzenie % w zakresie</dt><dd>${crmFinanceMoneyV3026(x.commission)}</dd><dt>Prowizja całego miesiąca</dt><dd>${crmFinanceMoneyV3026(x.commissionMonth??x.commission)}</dd></dl><small>Reguła progu pozostaje roboczą formułą Finance v0.1 do końcowego potwierdzenia.</small></div>`).join(""):`<div class="crm-finance-empty-v3026">Brak wizyt Booksy w wybranym zakresie.</div>`;
}

function crmFinanceRenderTimeV3026(data){
    const p=data.payroll||{},host=document.getElementById("finance-time-v3026");if(!host)return;
    host.innerHTML=`<div class="crm-finance-mini-grid-v3026"><div><span>Zabiegi</span><strong>${crmFinanceMinutesV3026(p.procedureMinutes)}</strong></div><div><span>Przed pierwszą wizytą</span><strong>${crmFinanceMinutesV3026(p.preFirstPaidMinutes)}</strong></div><div><span>Po ostatniej wizycie</span><strong>${crmFinanceMinutesV3026(p.postLastPaidMinutes)}</strong></div><div><span>Płatne przerwy</span><strong>${crmFinanceMinutesV3026(p.paidGapMinutes)}</strong></div><div><span>Niepłatne potwierdzone</span><strong>${crmFinanceMinutesV3026(p.unpaidGapMinutes)}</strong></div><div><span>Do decyzji</span><strong>${crmFinanceMinutesV3026(p.reviewGapMinutes)}</strong></div><div><span>Długie / opcjonalne</span><strong>${crmFinanceMinutesV3026(p.optionalGapMinutes)}</strong></div><div><span>Łączny płatny czas</span><strong>${crmFinanceMinutesV3026(p.paidMinutes)}</strong></div><div><span>Faktyczna obecność</span><strong>${crmFinanceMinutesV3026(p.actualPresenceMinutes)}</strong></div></div>`;
    const dom=data.domTime||{},domHost=document.getElementById("finance-dom-time-v3026");if(domHost)domHost.innerHTML=`<div class="crm-finance-mini-grid-v3026"><div><span>Praca</span><strong>${crmFinanceMinutesV3026(dom.procedureMinutes)}</strong></div><div><span>Przerwy statystyczne</span><strong>${crmFinanceMinutesV3026(dom.breakMinutes)}</strong></div><div><span>Łączny czas</span><strong>${crmFinanceMinutesV3026(dom.totalMinutes)}</strong></div><div><span>Przychód/h pracy</span><strong>${crmFinanceMoneyV3026(dom.revenuePerProcedureHour)}/h</strong></div><div><span>Przychód/h z przerwami</span><strong>${crmFinanceMoneyV3026(dom.revenuePerTotalHour)}/h</strong></div><div><span>Przychód DOM</span><strong>${crmFinanceMoneyV3026(dom.revenue)}</strong></div></div>`;
    const periodHost=document.getElementById("finance-payroll-period-v3026");if(periodHost)periodHost.innerHTML=`<div class="crm-finance-mini-grid-v3026"><div><span>Zarobek do dziś</span><strong>${crmFinanceMoneyV3026(p.realized)}</strong></div><div><span>Planowany przyszły</span><strong>${crmFinanceMoneyV3026(p.planned)}</strong></div><div><span>Łącznie</span><strong>${crmFinanceMoneyV3026(p.total)}</strong></div></div>`;
}

function crmFinanceGapLabelV3026(g){return g.state==="AUTO_PAID"?"Płatna automatycznie":g.state==="MANUAL_PAID"?"Płatna ręcznie":g.state==="MANUAL_UNPAID"?"Niepłatna potwierdzona":g.state==="REVIEW"?"Wymaga decyzji":"Długa przerwa · opcjonalny płatny czas";}
function crmFinanceBufferLabelV3031(b){return b.type==="PRE_FIRST"?"Przed pierwszą wizytą":"Po ostatniej wizycie";}
function crmFinanceRenderDayBufferV3031(b){
    if(!b)return "";
    const state=b.state==="MANUAL_UNPAID"?"Niepłatne ręcznie":b.state==="MANUAL_PAID"?"Płatne ręcznie":"Płatne automatycznie";
    const range=b.paidMinutes?`${crmFinanceEscapeV3026(b.from)}–${crmFinanceEscapeV3026(b.to)} · `:"";
    const familyNote=b.type==="POST_LAST"&&b.familyAdjusted
        ? ` · grafik rodzinny: ${crmFinanceEscapeV3026(b.familyStateLabel||b.familyState||"")} · maks. ${crmFinanceEscapeV3026(b.familyLimit||"16:30")}`
        : "";
    return `<div class="crm-finance-gap-v3026 ${String(b.state||"AUTO_PAID").toLowerCase()}"><div><strong>${crmFinanceBufferLabelV3031(b)} · ${crmFinanceMinutesV3026(b.paidMinutes)} · ${state}</strong><span>${range}${b.paidMinutes?crmFinanceMoneyV3026(b.pay):"0 min"}${familyNote}</span></div><div><button type="button" onclick="crmFinanceEditDayBufferV3031('${crmFinanceEscapeV3026(b.key)}')">Edytuj</button>${b.state!=="AUTO_PAID"?`<button type="button" onclick="crmFinanceResetDayBufferV3031('${crmFinanceEscapeV3026(b.key)}')">Domyślne</button>`:""}</div></div>`;
}
function crmFinanceRenderTimelineV3026(data){
    const host=document.getElementById("finance-booksy-timeline-v3026"),visits=Array.isArray(data.booksyVisits)?data.booksyVisits:[],gaps=Array.isArray(data.gaps)?data.gaps:[],buffers=Array.isArray(data.dayBuffers)?data.dayBuffers:[];if(!host)return;
    if(!visits.length){host.innerHTML='<div class="crm-finance-empty-v3026">Brak wizyt Booksy dla wybranego pracownika i okresu.</div>';return;}
    const gapByPrev={},preByDate={},postByVisit={};gaps.forEach(g=>gapByPrev[g.prevVisitId]=g);buffers.forEach(b=>{if(b.type==="PRE_FIRST")preByDate[b.date]=b;else if(b.type==="POST_LAST")postByVisit[b.visitId]=b;});
    let lastDate="";const out=[];
    visits.forEach(v=>{
        if(v.date!==lastDate){lastDate=v.date;out.push(`<div class="crm-finance-day-v3026">${crmFinanceEscapeV3026(v.date)} · ${crmFinanceEscapeV3026(v.worker||"")}</div>`);if(preByDate[v.date])out.push(crmFinanceRenderDayBufferV3031(preByDate[v.date]));}
        out.push(`<details class="crm-finance-visit-v3026"><summary><span><b>${crmFinanceEscapeV3026(v.time)}</b> ${crmFinanceEscapeV3026(v.client||"Bez klienta")} · ${crmFinanceEscapeV3026(v.service||"Usługa")}</span><strong>${crmFinanceMoneyV3026(v.amount)} · zarobek ${crmFinanceMoneyV3026(v.totalEarnings)}</strong></summary><div class="crm-finance-visit-details-v3026"><div><span>Czas zabiegu</span><b>${crmFinanceMinutesV3026(v.duration)}</b></div><div><span>Stawka godzinowa</span><b>${crmFinanceMoneyV3026(v.hourlyRate)}/h</b></div><div><span>Za czas zabiegu</span><b>${crmFinanceMoneyV3026(v.hourlyPay)}</b></div><div><span>% od usług</span><b>${crmFinanceMoneyV3026(v.serviceCommission)}</b></div>${(v.serviceItems||[]).map(i=>`<div class="wide"><span>${crmFinanceEscapeV3026(i.service)} · ${crmFinanceMoneyV3026(i.amount)} · ${crmFinanceNumberV3026(i.percent)}%</span><b>baza ${crmFinanceMoneyV3026(i.commissionBase)} → ${crmFinanceMoneyV3026(i.commission)}</b></div>`).join("")}</div></details>`);
        const g=gapByPrev[v.appointmentId];if(g){let actions="";if(g.state==="AUTO_PAID"||g.state==="MANUAL_PAID")actions=`<button type="button" onclick="crmFinanceSetGapV3026('${crmFinanceEscapeV3026(g.key)}','UNPAID',${g.gapMinutes})">Ustaw niepłatną</button>`;else if(g.state==="MANUAL_UNPAID")actions=`<button type="button" onclick="crmFinanceSetGapV3026('${crmFinanceEscapeV3026(g.key)}','PAID',${g.gapMinutes})">Ustaw płatną</button>`;else if(g.state==="REVIEW")actions=`<button type="button" onclick="crmFinanceSetGapV3026('${crmFinanceEscapeV3026(g.key)}','PAID',${g.gapMinutes})">Ustaw płatną</button><button type="button" onclick="crmFinanceSetGapV3026('${crmFinanceEscapeV3026(g.key)}','UNPAID',${g.gapMinutes})">Ustaw niepłatną</button>`;else actions=`<button type="button" onclick="crmFinanceSetGapV3026('${crmFinanceEscapeV3026(g.key)}','PAID',${g.gapMinutes})">+ Płatny czas</button>`;out.push(`<div class="crm-finance-gap-v3026 ${g.state.toLowerCase()}"><div><strong>${crmFinanceMinutesV3026(g.gapMinutes)} przerwy · ${crmFinanceGapLabelV3026(g)}</strong><span>${crmFinanceEscapeV3026(g.from)}–${crmFinanceEscapeV3026(g.to)}${g.paidMinutes?` · płatne ${crmFinanceMinutesV3026(g.paidMinutes)} = ${crmFinanceMoneyV3026(g.pay)}`:""}</span></div><div>${actions}</div></div>`);}
        if(postByVisit[v.appointmentId])out.push(crmFinanceRenderDayBufferV3031(postByVisit[v.appointmentId]));
    });host.innerHTML=out.join("");
}

async function crmFinanceSetGapV3026(key,decision,gapMinutes){
    const data=crmFinanceStateV3026.data,g=(data?.gaps||[]).find(x=>x.key===key);if(!g)return;let paidMinutes=0;
    if(decision==="PAID"){const raw=prompt(`Ile minut z przerwy ${g.gapMinutes} min ma być płatne?`,String(g.gapMinutes));if(raw===null)return;paidMinutes=Math.max(0,Math.min(g.gapMinutes,Number(raw)||0));}
    try{const res=await crmTestPost({action:"saveFinanceGapDecisionV4738",key:g.key,staff:g.staffId||g.staff,date:g.date,prevVisitId:g.prevVisitId,nextVisitId:g.nextVisitId,gapMinutes:g.gapMinutes,decision,paidMinutes},{timeoutMs:20000});if(!res?.success)throw new Error(res?.error||"Nie udało się zapisać czasu");await crmFinanceLoadV3026(true);}catch(e){alert(e.message||e);}
}

async function crmFinanceEditDayBufferV3031(key){
    const data=crmFinanceStateV3026.data,b=(data?.dayBuffers||[]).find(x=>x.key===key);if(!b)return;
    const label=b.type==="PRE_FIRST"?"przed pierwszą wizytą":"po ostatniej wizycie",raw=prompt(`Ile płatnych minut ${label}?`,String(b.paidMinutes??b.defaultMinutes??30));if(raw===null)return;
    const paidMinutes=Math.max(0,Math.min(180,Number(raw)||0)),decision=paidMinutes>0?"PAID":"UNPAID",gapMinutes=Math.max(Number(b.defaultMinutes)||0,paidMinutes);
    try{const res=await crmTestPost({action:"saveFinanceGapDecisionV4738",key:b.key,staff:b.staffId||b.staff,date:b.date,prevVisitId:b.prevVisitId,nextVisitId:b.nextVisitId,gapMinutes,decision,paidMinutes,notes:`Korekta ${label}`},{timeoutMs:20000});if(!res?.success)throw new Error(res?.error||"Nie udało się zapisać czasu");await crmFinanceLoadV3026(true);}catch(e){alert(e.message||e);}
}
async function crmFinanceResetDayBufferV3031(key){
    const data=crmFinanceStateV3026.data,b=(data?.dayBuffers||[]).find(x=>x.key===key);if(!b)return;
    try{const res=await crmTestPost({action:"saveFinanceGapDecisionV4738",key:b.key,staff:b.staffId||b.staff,date:b.date,prevVisitId:b.prevVisitId,nextVisitId:b.nextVisitId,gapMinutes:Number(b.defaultMinutes)||0,decision:"AUTO",paidMinutes:0,notes:"Powrót do wartości domyślnej"},{timeoutMs:20000});if(!res?.success)throw new Error(res?.error||"Nie udało się przywrócić czasu");await crmFinanceLoadV3026(true);}catch(e){alert(e.message||e);}
}

function crmFinanceRenderV3026(data){
    crmFinanceStateV3026.data=data;crmFinanceUpdateStaffV3026(data);const s=data.summary||{},p=data.payroll||{};
    crmFinanceCardV3026("finance-total-v3026",crmFinanceMoneyV3026(s.revenue),`${s.visits||0} wizyt z ceną`);crmFinanceCardV3026("finance-realized-v3026",crmFinanceMoneyV3026(s.realizedRevenue),"terminy do dziś");crmFinanceCardV3026("finance-planned-v3026",crmFinanceMoneyV3026(s.plannedRevenue),"przyszłe aktywne terminy");crmFinanceCardV3026("finance-average-v3026",crmFinanceMoneyV3026(s.average),"średnia wartość wizyty");crmFinanceCardV3026("finance-clients-v3026",crmFinanceNumberV3026(s.uniqueClients),"unikalni klienci");crmFinanceCardV3026("finance-unresolved-v3026",crmFinanceNumberV3026(s.unresolvedVisits),"kliknij, aby zobaczyć");
    crmFinanceCardV3026("finance-f-revenue-v3026",crmFinanceMoneyV3026(s.revenue),`${s.visits||0} wizyt`);crmFinanceCardV3026("finance-f-earnings-v3026",crmFinanceMoneyV3026(p.total),p.staff||data.mainStaff?.name||"Daria Strelnikova");crmFinanceCardV3026("finance-f-commission-v3026",crmFinanceMoneyV3026(p.serviceCommission),"po progu i procentach usług");crmFinanceCardV3026("finance-f-hourly-v3026",crmFinanceMoneyV3026(p.hourlyPay),"zabiegi + przerwy + początek/koniec dnia");crmFinanceCardV3026("finance-f-paidtime-v3026",crmFinanceMinutesV3026(p.paidMinutes),`przerwy ${crmFinanceMinutesV3026(p.paidGapMinutes)} · przed/po ${crmFinanceMinutesV3026(p.dayBufferPaidMinutes)}`);crmFinanceCardV3026("finance-f-rate-v3026",`${crmFinanceMoneyV3026(p.effectiveRate)}/h`,"zarobek / płatny czas");
    const source=document.getElementById("finance-by-source-v3026"),trend=document.getElementById("finance-trend-v3026"),services=document.getElementById("finance-by-service-v3026"),staff=document.getElementById("finance-by-staff-v3026");if(source)source.innerHTML=crmFinanceRowsV3026(data.bySource,"label","Brak danych.");if(trend)trend.innerHTML=crmFinanceRowsV3026(data.trend,"label","Brak trendu.");if(services)services.innerHTML=crmFinanceRowsV3026(data.byService,"label","Brak usług.");if(staff)staff.innerHTML=crmFinanceRenderStaffStripV3034(data.byStaff);
    crmFinanceRenderOperationsV3026(data);crmFinanceRenderStaffCancellationAuditV3033(data);crmFinanceRenderQualityV3026(data);crmFinanceRenderUnresolvedV3026(data);crmFinanceRenderThresholdV3026(data);crmFinanceRenderTimeV3026(data);crmFinanceRenderTimelineV3026(data);crmFinanceRenderStatTimeV3028(data);crmFinanceRenderSourceSplitV3028(data);crmFinanceApplySourceViewV3028();const note=document.getElementById("finance-note-v3026");if(note)note.textContent=data.accountingNote||"";
}

async function crmFinanceLoadV3026(force){
    crmFinanceInitV3026();if(crmFinanceStateV3026.loading&&!force)return;const from=document.getElementById("finance-from-v3026")?.value||"",to=document.getElementById("finance-to-v3026")?.value||"",source=document.getElementById("finance-source-v3026")?.value||"ALL",staff=document.getElementById("finance-staff-v3026")?.value||"",requestNo=++crmFinanceStateV3026.requestNo;crmFinanceSetLoadingV3026(true,"Ładowanie raportu…");
    try{const data=await crmAdminPostV3027({action:"getFinanceStatisticsV4738",from,to,source,staff},{timeoutMs:30000,cacheMs:3000,force:Boolean(force)});if(requestNo!==crmFinanceStateV3026.requestNo)return;if(!data?.success)throw new Error(data?.error||"Nie udało się pobrać raportu");crmFinanceRenderV3026(data);crmFinanceSetLoadingV3026(false,`Dane ${data.period?.from||from} – ${data.period?.to||to}${data.performance?.elapsedMs?` · serwer ${(data.performance.elapsedMs/1000).toFixed(1)} s`:""}`);}catch(error){console.error("Finance V30.33",error);if(requestNo!==crmFinanceStateV3026.requestNo)return;crmFinanceSetLoadingV3026(false,"Błąd pobierania danych");const q=document.getElementById("finance-quality-v3026");if(q){q.classList.add("is-warning");q.innerHTML=`<strong>Nie udało się pobrać raportu</strong><span>${crmFinanceEscapeV3026(error.message||error)}</span><b>!</b>`;}}
}

function calculateFinanceReport(){return crmFinanceLoadV3026(false);}
window.crmFinanceLoadV3026=crmFinanceLoadV3026;window.crmFinanceModeV3026=crmFinanceModeV3026;window.crmFinanceOpenUnresolvedV3026=crmFinanceOpenUnresolvedV3026;window.crmFinanceCloseUnresolvedV3026=crmFinanceCloseUnresolvedV3026;window.crmFinanceSetGapV3026=crmFinanceSetGapV3026;window.crmFinanceApplySourceViewV3028=crmFinanceApplySourceViewV3028;
