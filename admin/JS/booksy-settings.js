// BUILD MARKER: V30.32 — BOOKSY FINANCE SETTINGS 30/30
/* ==========================================================================
   USTAWIENIA BOOKSY V30.27 — PERSONEL + FINANSE V0.1 PERFORMANCE
   ========================================================================== */
const crmBooksySettingsStateV3026={loaded:false,loading:false,loadPromise:null,staff:[],positions:[],managementRoles:[],mainStaff:null,selectedFinanceStaff:"",finance:null,services:[],financeRequestNo:0};
function crmBooksyEscapeV3026(v){return String(v??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;");}
function crmBooksyTodayV3026(){const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;}
function crmBooksyRoleLabelV3026(v,opts){const hit=(opts||[]).find(x=>x.value===v);return hit?hit.label:(v||"Brak");}
async function crmBooksySettingsTabV3026(name){
  document.querySelectorAll("[data-booksy-settings-tab-v3026]").forEach(b=>b.classList.toggle("active",b.dataset.booksySettingsTabV3026===name));
  document.querySelectorAll("[data-booksy-settings-panel-v3026]").forEach(p=>p.hidden=p.dataset.booksySettingsPanelV3026!==name);
  if(name!=="finanse")return;
  crmPrimeBooksyFinanceUiV3027();
  try{
    if(!crmBooksySettingsStateV3026.loaded)await crmLoadBooksySettingsV3026(false);
    crmPrimeBooksyFinanceStaffSelectV3027();
    await crmLoadBooksyFinanceSettingsV3026(false);
  }catch(e){console.error(e);}
}
function crmBooksyPositionOptionsV3026(selected){return (crmBooksySettingsStateV3026.positions||[]).map(x=>`<option value="${crmBooksyEscapeV3026(x.value)}" ${x.value===selected?"selected":""}>${crmBooksyEscapeV3026(x.label)}</option>`).join("");}
function crmBooksyManagementOptionsV3026(selected){return (crmBooksySettingsStateV3026.managementRoles||[]).map(x=>`<option value="${crmBooksyEscapeV3026(x.value)}" ${x.value===selected?"selected":""}>${crmBooksyEscapeV3026(x.label)}</option>`).join("");}
function crmPrimeBooksyFinanceUiV3027(){
  const defaults={"booksy-fin-hourly-v3026":25,"booksy-fin-percent-v3026":20,"booksy-fin-threshold-v3026":4000,"booksy-fin-dom-break-v3026":15,"booksy-fin-auto-gap-v3026":30,"booksy-fin-review-gap-v3026":120,"booksy-fin-first-buffer-v3026":30,"booksy-fin-last-buffer-v3026":30};
  Object.keys(defaults).forEach(id=>{const el=document.getElementById(id);if(el&&(el.value===""||el.value===null))el.value=defaults[id];});
  const date=document.getElementById("booksy-fin-effective-v3026");if(date&&!date.value)date.value=crmBooksyTodayV3026();
  const chk=document.getElementById("booksy-fin-threshold-enabled-v3026");if(chk&&!chk.dataset.primedV3027){chk.checked=true;chk.dataset.primedV3027="1";}
  const select=document.getElementById("booksy-fin-staff-v3026");if(select&&!select.options.length)select.innerHTML='<option value="">Daria Strelnikova — główny</option>';
}
function crmPrimeBooksyFinanceStaffSelectV3027(){
  const staff=(crmBooksySettingsStateV3026.staff||[]).filter(x=>x.active!==false),main=crmBooksySettingsStateV3026.mainStaff||staff.find(x=>String(x.name).toLowerCase()==="daria strelnikova")||staff[0]||null;
  if(!staff.length)return crmPrimeBooksyFinanceUiV3027();
  crmFinanceSettingsStaffOptionsV3026({staff,mainStaff:main,selectedStaff:main});
}
function crmBooksyStaffCardV3026(item,index){const id=item.id||`NEW_${Date.now()}_${index}`,active=item.active!==false,isMain=item.position==="MASTER_GLOWNY";return `<article class="crm-booksy-staff-card-v3026 ${isMain?"is-main":""}" data-staff-id-v3026="${crmBooksyEscapeV3026(id)}"><div class="crm-booksy-staff-card-head-v3026"><div><strong>${crmBooksyEscapeV3026(item.name||"Nowy pracownik")}${isMain?" · GŁÓWNY":""}</strong><span>${crmBooksyEscapeV3026(crmBooksyRoleLabelV3026(item.position,crmBooksySettingsStateV3026.positions))}${item.managementRole?` · ${crmBooksyEscapeV3026(crmBooksyRoleLabelV3026(item.managementRole,crmBooksySettingsStateV3026.managementRoles))}`:""}</span></div><label class="crm-booksy-active-v3026"><input type="checkbox" data-field-v3026="active" ${active?"checked":""}> Aktywny</label></div><div class="crm-booksy-staff-grid-v3026"><label><span>Imię i nazwisko</span><input type="text" data-field-v3026="name" value="${crmBooksyEscapeV3026(item.name||"")}"></label><label><span>Stanowisko</span><select data-field-v3026="position">${crmBooksyPositionOptionsV3026(item.position||"PERSONEL")}</select></label><label><span>Rola zarządcza</span><select data-field-v3026="managementRole">${crmBooksyManagementOptionsV3026(item.managementRole||"")}</select></label><label class="crm-booksy-wide-v3026"><span>Aliasy z maili Booksy</span><input type="text" data-field-v3026="aliases" value="${crmBooksyEscapeV3026(item.aliases||"")}"></label><label class="crm-booksy-wide-v3026"><span>Uwagi</span><input type="text" data-field-v3026="notes" value="${crmBooksyEscapeV3026(item.notes||"")}"></label></div><div class="crm-booksy-staff-actions-v3026"><small>Osoby nie usuwamy z historii — przy odejściu ustaw Aktywny = NIE.</small><button type="button" class="btn-primary" onclick="crmSaveBooksyStaffV3026('${crmBooksyEscapeV3026(id)}')">Zapisz</button></div></article>`;}

function crmRenderBooksyStaffV3026(){const host=document.getElementById("booksy-staff-list-v3026"),staff=crmBooksySettingsStateV3026.staff||[];if(host)host.innerHTML=staff.length?staff.map(crmBooksyStaffCardV3026).join(""):'<div class="crm-finance-empty-v3026">Brak pracowników.</div>';const count=document.getElementById("booksy-staff-count-v3026");if(count)count.textContent=`${staff.filter(x=>x.active!==false).length} aktywnych / ${staff.length} wszystkich`;const main=document.getElementById("booksy-main-staff-v3026");if(main)main.textContent=crmBooksySettingsStateV3026.mainStaff?.name||"Daria Strelnikova";}

async function crmLoadBooksySettingsV3026(force){
  if(crmBooksySettingsStateV3026.loading&&crmBooksySettingsStateV3026.loadPromise)return crmBooksySettingsStateV3026.loadPromise;
  if(crmBooksySettingsStateV3026.loaded&&!force)return;
  crmBooksySettingsStateV3026.loading=true;
  const status=document.getElementById("booksy-settings-status-v3026");if(status)status.textContent="Ładowanie…";
  crmBooksySettingsStateV3026.loadPromise=(async()=>{
    try{
      const data=await crmTestPost({action:"getBooksyAdminSettingsV4737"},{timeoutMs:20000});
      if(!data?.success)throw new Error(data?.error||"Błąd ustawień personelu");
      crmBooksySettingsStateV3026.staff=data.staff||[];crmBooksySettingsStateV3026.positions=data.positions||[];crmBooksySettingsStateV3026.managementRoles=data.managementRoles||[];
      crmBooksySettingsStateV3026.mainStaff=(data.staff||[]).find(x=>x.active!==false&&x.position==="MASTER_GLOWNY")||(data.staff||[]).find(x=>String(x.name).toLowerCase()==="daria strelnikova")||(data.staff||[])[0]||null;
      crmBooksySettingsStateV3026.loaded=true;crmRenderBooksyStaffV3026();crmPrimeBooksyFinanceStaffSelectV3027();if(status)status.textContent="Personel gotowy · Finance V0.1";
    }catch(e){console.error(e);if(status)status.textContent="Błąd: "+(e.message||e);throw e;}
    finally{crmBooksySettingsStateV3026.loading=false;crmBooksySettingsStateV3026.loadPromise=null;}
  })();
  return crmBooksySettingsStateV3026.loadPromise;
}
function crmAddBooksyStaffV3026(){if(!crmBooksySettingsStateV3026.loaded)return crmLoadBooksySettingsV3026(true);crmBooksySettingsStateV3026.staff.push({id:`NEW_${Date.now()}`,name:"",position:"MASTER",managementRole:"",active:true,aliases:"",notes:""});crmRenderBooksyStaffV3026();const cards=document.querySelectorAll(".crm-booksy-staff-card-v3026"),last=cards[cards.length-1];if(last)last.scrollIntoView({behavior:"smooth",block:"center"});}
async function crmSaveBooksyStaffV3026(id){const card=[...document.querySelectorAll(".crm-booksy-staff-card-v3026")].find(el=>el.dataset.staffIdV3026===id);if(!card)return;const get=f=>card.querySelector(`[data-field-v3026="${f}"]`),payload={id:id.startsWith("NEW_")?"":id,name:get("name")?.value.trim()||"",position:get("position")?.value||"PERSONEL",managementRole:get("managementRole")?.value||"",active:Boolean(get("active")?.checked),aliases:get("aliases")?.value.trim()||"",notes:get("notes")?.value.trim()||""};if(!payload.name){alert("Podaj imię i nazwisko.");return;}try{const data=await crmTestPost({action:"saveBooksyStaffV4737",staff:payload},{timeoutMs:20000});if(!data?.success)throw new Error(data?.error||"Błąd zapisu");crmBooksySettingsStateV3026.staff=data.staff||[];crmBooksySettingsStateV3026.positions=data.positions||[];crmBooksySettingsStateV3026.managementRoles=data.managementRoles||[];crmBooksySettingsStateV3026.mainStaff=(data.staff||[]).find(x=>x.active!==false&&x.position==="MASTER_GLOWNY")||(data.staff||[])[0]||null;crmRenderBooksyStaffV3026();}catch(e){alert(e.message||e);}}

function crmFinanceSettingsStaffOptionsV3026(data){const select=document.getElementById("booksy-fin-staff-v3026"),staff=(data.staff||[]).filter(x=>x.active!==false),selected=data.selectedStaff?.id||data.mainStaff?.id||"";if(!select)return;select.innerHTML=staff.map(x=>`<option value="${crmBooksyEscapeV3026(x.id)}" ${x.id===selected?"selected":""}>${crmBooksyEscapeV3026(x.name)}${x.position==="MASTER_GLOWNY"?" — główny":""}</option>`).join("");crmBooksySettingsStateV3026.selectedFinanceStaff=select.value;}
function crmRenderFinanceSettingsV3026(data){crmBooksySettingsStateV3026.finance=data.settings||{};crmBooksySettingsStateV3026.services=data.services||[];crmBooksySettingsStateV3026.mainStaff=data.mainStaff||crmBooksySettingsStateV3026.mainStaff;crmBooksySettingsStateV3026.staff=data.staff||crmBooksySettingsStateV3026.staff;crmFinanceSettingsStaffOptionsV3026(data);const s=data.settings||{},set=(id,val)=>{const el=document.getElementById(id);if(el)el.value=val??"";};set("booksy-fin-hourly-v3026",s.hourlyRate??25);set("booksy-fin-percent-v3026",s.defaultPercent??20);set("booksy-fin-threshold-v3026",s.minimumTurnover??4000);set("booksy-fin-dom-break-v3026",s.domBreakMinutes??15);set("booksy-fin-auto-gap-v3026",s.autoPaidGapMaxMinutes??30);set("booksy-fin-review-gap-v3026",s.decisionGapMaxMinutes??120);set("booksy-fin-first-buffer-v3026",s.firstVisitBufferMinutes??30);set("booksy-fin-last-buffer-v3026",s.lastVisitBufferMinutes??30);set("booksy-fin-effective-v3026",crmBooksyTodayV3026());const chk=document.getElementById("booksy-fin-threshold-enabled-v3026");if(chk)chk.checked=s.minimumTurnoverEnabled!==false;crmRenderServicePercentsV3026();const main=document.getElementById("booksy-main-staff-v3026");if(main)main.textContent=data.mainStaff?.name||"Daria Strelnikova";}

async function crmLoadBooksyFinanceSettingsV3026(force){
  crmPrimeBooksyFinanceUiV3027();
  if(!crmBooksySettingsStateV3026.loaded&&!crmBooksySettingsStateV3026.loading){try{await crmLoadBooksySettingsV3026(false);}catch(ignore){}}
  crmPrimeBooksyFinanceStaffSelectV3027();
  const select=document.getElementById("booksy-fin-staff-v3026"),staff=select?.value||crmBooksySettingsStateV3026.selectedFinanceStaff||crmBooksySettingsStateV3026.mainStaff?.id||"",requestNo=++crmBooksySettingsStateV3026.financeRequestNo;
  const status=document.getElementById("booksy-settings-status-v3026");if(status)status.textContent="Ładowanie rozliczeń…";
  try{
    const data=await crmAdminPostV3027({action:"getBooksyFinanceSettingsV4738",staff},{timeoutMs:20000,cacheMs:10000,force:Boolean(force)});
    if(requestNo!==crmBooksySettingsStateV3026.financeRequestNo)return;
    if(!data?.success)throw new Error(data?.error||"Błąd ustawień finansowych");
    crmRenderFinanceSettingsV3026(data);
    if(status)status.textContent=`Rozliczenia ${data.selectedStaff?.name||"Daria"} · V${data.version||"4.7.39"}`;
  }catch(e){
    if(requestNo!==crmBooksySettingsStateV3026.financeRequestNo)return;
    console.error(e);if(status)status.textContent="Błąd: "+(e.message||e);
  }
}

async function crmSaveBooksyFinanceSettingsV3026(){const staff=document.getElementById("booksy-fin-staff-v3026")?.value||"",num=id=>Number(document.getElementById(id)?.value)||0,settings={hourlyRate:num("booksy-fin-hourly-v3026"),defaultPercent:num("booksy-fin-percent-v3026"),minimumTurnover:num("booksy-fin-threshold-v3026"),minimumTurnoverEnabled:Boolean(document.getElementById("booksy-fin-threshold-enabled-v3026")?.checked),domBreakMinutes:num("booksy-fin-dom-break-v3026"),autoPaidGapMaxMinutes:num("booksy-fin-auto-gap-v3026"),decisionGapMaxMinutes:num("booksy-fin-review-gap-v3026"),firstVisitBufferMinutes:num("booksy-fin-first-buffer-v3026"),lastVisitBufferMinutes:num("booksy-fin-last-buffer-v3026"),effectiveFrom:document.getElementById("booksy-fin-effective-v3026")?.value||crmBooksyTodayV3026()};try{const data=await crmTestPost({action:"saveBooksyFinanceSettingsV4738",staff,settings},{timeoutMs:25000});if(!data?.success)throw new Error(data?.error||"Błąd zapisu ustawień");crmRenderFinanceSettingsV3026(data);if(typeof crmAdminInvalidateV3027==="function"){crmAdminInvalidateV3027("getBooksyFinanceSettingsV4738");crmAdminInvalidateV3027("getFinanceStatisticsV4738");}alert("Ustawienia rozliczenia zapisane jako wersja historyczna.");if(typeof crmFinanceLoadV3026==="function")crmFinanceLoadV3026(true);}catch(e){alert(e.message||e);}}

function crmRenderServicePercentsV3026(){const host=document.getElementById("booksy-service-percent-list-v3026"),services=crmBooksySettingsStateV3026.services||[],def=Number(crmBooksySettingsStateV3026.finance?.defaultPercent)||20;if(!host)return;host.innerHTML=services.length?services.map((s,i)=>`<div class="crm-booksy-service-percent-row-v3026" data-service-name-v3026="${crmBooksyEscapeV3026(String(s.name||"").toLowerCase())}"><div><strong>${crmBooksyEscapeV3026(s.name)}</strong><span>${crmBooksyEscapeV3026(s.category||"")} · ${crmBooksyEscapeV3026(s.price)} zł</span></div><label><input type="number" min="0" max="100" step="0.01" value="${s.percent===null||s.percent===undefined?def:s.percent}" data-original-v3026="${s.percent===null||s.percent===undefined?def:s.percent}" data-service-index-v3026="${i}"> %</label><small>${s.percent===null||s.percent===undefined?`domyślny ${def}%`:`indywidualny od ${crmBooksyEscapeV3026(s.effectiveFrom||"?")}`}</small></div>`).join(""):'<div class="crm-finance-empty-v3026">Brak usług Booksy.</div>';}
function crmFilterServicePercentsV3026(){const q=String(document.getElementById("booksy-service-search-v3026")?.value||"").toLowerCase();document.querySelectorAll(".crm-booksy-service-percent-row-v3026").forEach(row=>row.hidden=q&&!row.dataset.serviceNameV3026.includes(q));}
async function crmSaveBooksyServicePercentsV3026(){const staff=document.getElementById("booksy-fin-staff-v3026")?.value||"",effectiveFrom=document.getElementById("booksy-fin-effective-v3026")?.value||crmBooksyTodayV3026(),items=[];document.querySelectorAll("[data-service-index-v3026]").forEach(input=>{if(String(input.value)!==String(input.dataset.originalV3026)){const s=crmBooksySettingsStateV3026.services[Number(input.dataset.serviceIndexV3026)];if(s)items.push({serviceName:s.name,percent:Number(input.value)||0});}});if(!items.length){alert("Nie zmieniono żadnego procentu usługi.");return;}try{const data=await crmTestPost({action:"saveBooksyServicePercentsV4738",staff,effectiveFrom,items},{timeoutMs:30000});if(!data?.success)throw new Error(data?.error||"Błąd zapisu procentów");crmRenderFinanceSettingsV3026(data);if(typeof crmAdminInvalidateV3027==="function"){crmAdminInvalidateV3027("getBooksyFinanceSettingsV4738");crmAdminInvalidateV3027("getFinanceStatisticsV4738");}alert(`Zapisano ${items.length} zmian procentów usług.`);if(typeof crmFinanceLoadV3026==="function")crmFinanceLoadV3026(true);}catch(e){alert(e.message||e);}}

window.crmPrimeBooksyFinanceUiV3027=crmPrimeBooksyFinanceUiV3027;window.crmBooksySettingsTabV3026=crmBooksySettingsTabV3026;window.crmLoadBooksySettingsV3026=crmLoadBooksySettingsV3026;window.crmAddBooksyStaffV3026=crmAddBooksyStaffV3026;window.crmSaveBooksyStaffV3026=crmSaveBooksyStaffV3026;window.crmLoadBooksyFinanceSettingsV3026=crmLoadBooksyFinanceSettingsV3026;window.crmSaveBooksyFinanceSettingsV3026=crmSaveBooksyFinanceSettingsV3026;window.crmSaveBooksyServicePercentsV3026=crmSaveBooksyServicePercentsV3026;window.crmFilterServicePercentsV3026=crmFilterServicePercentsV3026;
