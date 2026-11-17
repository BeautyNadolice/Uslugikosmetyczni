/* ==========================================================================
   CRM TEST FULL
   Stały pełny test regresyjny.
   Zmieniamy go tylko wtedy, gdy do CRM dochodzi nowa stała funkcjonalność.

   UWAGA:
   Marker danych testowych nadal ma techniczny prefiks CRM_E2E_ ponieważ
   backend cleanup V1 celowo akceptuje tylko taki bezpieczny wzorzec.
   ========================================================================== */

/* ==========================================================================
   CRM TEST FULL V2 2026-08-29
   Stały pełny test regresyjny CRM.
   - wykonuje testy kolejno, bez lawiny requestów,
   - tworzy wyłącznie dane oznaczone unikalnym CRM_E2E_...,
   - w finally zawsze uruchamia sprzątanie,
   - nie publikuje ani nie nadpisuje Cennika produkcyjnego,
   - nie zmienia ustawień na inne wartości (zapisuje bieżące wartości).
   ========================================================================== */
const CRM_TEST_FULL_VERSION = "2.6.5";
const CRM_E2E_INDEX_WEB_APP_URL = ""; // V2.5: pełny test nie zapisuje do osobnego / zewnętrznego wdrożenia INDEX.

function crmE2EWait(ms){ return new Promise(resolve=>window.setTimeout(resolve,ms)); }
function crmE2EStage(step,text){
    if(typeof crmTestSetStage==="function") return crmTestSetStage(step,19,text);
    return crmTestSetProgress(Math.round((Number(step)||0)/19*100),text);
}
function crmE2EMarker(){
    return `CRM_E2E_${Date.now()}_${Math.random().toString(36).slice(2,8).toUpperCase()}`;
}
function crmE2ESafe(value){
    if(value===undefined) return "";
    if(value===null) return null;
    if(value instanceof Error) return {message:value.message,stack:value.stack};
    return value;
}
function crmE2EAdd(report,status,name,details){
    crmTestAdd(report,status,name,crmE2ESafe(details));
}
function crmE2EPass(report,name,details){ crmE2EAdd(report,"OK",name,details); }
function crmE2EWarn(report,name,details){ crmE2EAdd(report,"OSTRZEZENIE",name,details); }
function crmE2EFail(report,name,details){ crmE2EAdd(report,"BLAD",name,details); }
function crmE2EAssert(report,condition,name,detailsOk,detailsFail){
    crmE2EAdd(report,condition?"OK":"BLAD",name,condition?detailsOk:detailsFail);
    return Boolean(condition);
}
function crmE2EIsoDay(iso){ return String(iso||"").slice(0,10); }
function crmE2EPlusMinutes(iso,minutes){
    const d=new Date(String(iso));
    if(Number.isNaN(d.getTime())) return "";
    d.setMinutes(d.getMinutes()+Number(minutes||0));
    const p=v=>String(v).padStart(2,"0");
    return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}:00`;
}
function crmE2EFormatQuery(params){
    return Object.keys(params||{}).map(k=>encodeURIComponent(k)+"="+encodeURIComponent(params[k])).join("&");
}
async function crmE2EAdminPost(payload,timeoutMs=50000){
    if(typeof crmTestPost!=="function") throw new Error("Brak crmTestPost()");
    return crmTestPost(Object.assign({},payload,{_e2eClientTime:Date.now()}),{timeoutMs});
}
async function crmE2EAdminGet(params,timeoutMs=45000){
    if(typeof crmTestGet!=="function") throw new Error("Brak crmTestGet()");
    return crmTestGet(Object.assign({},params,{_e2e:Date.now()}),{timeoutMs});
}
async function crmE2EIndexPost(){
    throw new Error("CRM Test Full 2.6.5: zewnętrzny INDEX jest celowo wyłączony. Test używa wyłącznie bieżącego TEST backendu.");
}

function crmE2EActiveTab(){
    if(typeof crmDetectActiveTabV6==="function") return crmDetectActiveTabV6();
    const visible=Array.from(document.querySelectorAll(".tab-page")).find(node=>getComputedStyle(node).display!=="none");
    return visible?.id?.replace(/^tab-/,"")||"kalendarz";
}
function crmE2EFindAppointment(data,predicate){
    return Array.isArray(data?.appointments)?data.appointments.find(predicate):null;
}
async function crmE2EBusyAround(iso){
    const d=new Date(String(iso));
    if(Number.isNaN(d.getTime())) return crmE2EAdminGet({checkBusy:"true"});
    const from=new Date(d); from.setDate(from.getDate()-1);
    const to=new Date(d); to.setDate(to.getDate()+1);
    const fmt=x=>`${x.getFullYear()}-${String(x.getMonth()+1).padStart(2,"0")}-${String(x.getDate()).padStart(2,"0")}`;
    return crmE2EAdminGet({checkBusy:"true",rangeStart:fmt(from),rangeEnd:fmt(to)},50000);
}
async function crmE2EInbox(){ return crmE2EAdminGet({adminInbox:"true"},50000); }
async function crmE2EPing(){ return crmE2EAdminGet({adminInboxPing:"true"},40000); }
async function crmE2EInspect(marker){ return crmE2EAdminPost({action:"crmE2EInspect",marker},50000); }
async function crmE2ECleanup(marker){ return crmE2EAdminPost({action:"crmE2ECleanup",marker},60000); }

function crmE2EInstallDialogSpy(){
    const original={alert:window.alert,confirm:window.confirm,prompt:window.prompt};
    const calls=[];
    window.alert=function(message){calls.push({type:"alert",message:String(message||"")});};
    window.confirm=function(message){calls.push({type:"confirm",message:String(message||"")});return true;};
    window.prompt=function(message,value){calls.push({type:"prompt",message:String(message||"")});return value||"";};
    return {calls,restore(){window.alert=original.alert;window.confirm=original.confirm;window.prompt=original.prompt;}};
}

function crmE2ETestGeometry(report){
    try{
        if(typeof crmV8FixCalendarToolbarWidth==="function") crmV8FixCalendarToolbarWidth();
        const header=document.querySelector("#tab-kalendarz .calendar-layout-header");
        const side=document.querySelector("#tab-kalendarz .calendar-sidebar");
        const main=document.querySelector("#tab-kalendarz .calendar-main-schedule");
        const insights=document.querySelector("#tab-kalendarz .crm-calendar-insights");
        if(!header||!side||!main||!insights){
            crmE2EFail(report,"Geometria Kalendarza","Brak jednego z bloków layoutu");
            return;
        }
        const h=header.getBoundingClientRect(), s=side.getBoundingClientRect(), m=main.getBoundingClientRect(), r=insights.getBoundingClientRect();
        const leftOk=Math.abs(h.left-s.left)<=8;
        const rightOk=Math.abs(h.right-m.right)<=12;
        const rightPanelOk=r.left>=m.right-2;
        crmE2EAssert(report,leftOk,"Toolbar zaczyna się nad małym kalendarzem",{headerLeft:Math.round(h.left),miniLeft:Math.round(s.left)},{headerLeft:Math.round(h.left),miniLeft:Math.round(s.left),roznica:Math.round(h.left-s.left)});
        crmE2EAssert(report,rightOk,"Toolbar kończy się na końcu dużego kalendarza",{headerRight:Math.round(h.right),calendarRight:Math.round(m.right)},{headerRight:Math.round(h.right),calendarRight:Math.round(m.right),roznica:Math.round(h.right-m.right)});
        crmE2EAssert(report,rightPanelOk,"Prawy panel jest osobną stałą kolumną",{calendarRight:Math.round(m.right),panelLeft:Math.round(r.left)},{calendarRight:Math.round(m.right),panelLeft:Math.round(r.left)});
    }catch(error){crmE2EFail(report,"Geometria Kalendarza",error.message||String(error));}
}

function crmE2ETestBlockingAppointmentModal(report){
    const modal=document.getElementById("appointmentModal");
    if(!modal){crmE2EFail(report,"Okno dodawania wizyty","Brak #appointmentModal");return;}
    const oldDisplay=modal.style.display;
    try{
        modal.style.display="flex";
        const rect=modal.getBoundingClientRect();
        const style=getComputedStyle(modal);
        const covers=rect.width>=window.innerWidth*0.92 && rect.height>=window.innerHeight*0.92 && style.pointerEvents!=="none";
        crmE2EAdd(report,covers?"OSTRZEZENIE":"OK","Okno Dodaj/Edytuj wizytę nie powinno blokować całej strony",{
            coversViewport:covers,width:Math.round(rect.width),height:Math.round(rect.height),pointerEvents:style.pointerEvents,position:style.position
        });
    }finally{modal.style.display=oldDisplay;}
}

async function crmE2ETestTabReturn(report,savedTab){
    if(typeof switchTab!=="function"){crmE2EFail(report,"Powrót do karty przeglądarki","Brak switchTab()");return;}
    const target=savedTab==="kalendarz"?"klienci":savedTab;
    const originalLight=window.crmLightSyncCalendarData;
    let lightSyncCalls=0;
    try{
        if(typeof originalLight==="function"){
            window.crmLightSyncCalendarData=async function(){ lightSyncCalls++; return null; };
        }
        await switchTab(target);
        const before=crmE2EActiveTab();
        lightSyncCalls=0;
        window.dispatchEvent(new Event("focus"));
        await crmE2EWait(300);
        const after=crmE2EActiveTab();
        crmE2EAssert(report,before===after,"Focus przeglądarki nie zmienia aktywnej zakładki CRM",{before,after},{before,after});
        crmE2EAssert(report,lightSyncCalls===0,"Focus nie uruchamia ponownego pobierania Kalendarza","0 wywołań crmLightSyncCalendarData",{lightSyncCalls});
    }catch(error){
        crmE2EFail(report,"Focus przeglądarki / cichy powrót",error.message||String(error));
    }finally{
        if(typeof originalLight==="function") window.crmLightSyncCalendarData=originalLight;
    }
}

async function crmE2ECreateAdminBooking(ctx,suffix,iso,extra={}){
    const operationId=`${ctx.marker}_OP_${suffix}`;
    const payload=Object.assign({
        action:"createBooking",operationId,phone:`TEST-${ctx.marker}-${suffix}`,
        name:`${ctx.marker} ${suffix}`,service:ctx.serviceName,date:iso,duration:ctx.duration,
        rodo:`${ctx.marker} E2E`,bookingSource:"ADMIN"
    },extra);
    const result=await crmE2EAdminPost(payload,60000);
    return {result,payload,operationId};
}



async function crmE2ETestUiDetailsV2(report){
    const tabs=["dashboard","kalendarz","klienci","cennik","finanse","ustawienia"];
    for(const tab of tabs){
        const node=document.getElementById("tab-"+tab);
        crmE2EAssert(report,Boolean(node),`UI: zakładka ${tab}`,"Znaleziono","Brak zakładki");
        if(node&&typeof switchTab==="function"){
            try{await switchTab(tab);await crmE2EWait(35);crmE2EAssert(report,getComputedStyle(node).display!=="none",`UI: otwarcie ${tab}`,"Widoczna","Niewidoczna po switchTab");}
            catch(error){crmE2EFail(report,`UI: otwarcie ${tab}`,error.message||String(error));}
        }
    }

    const fullTestButton=document.getElementById("runCRMTestFullBtn");
    crmE2EAssert(report,Boolean(fullTestButton)&&/2\.6\.2/.test(fullTestButton.textContent||""),"UI: etykieta CRM Test Full odpowiada wersji testera",fullTestButton?.textContent?.trim()||"","Stara etykieta wersji testu");
    crmE2EAssert(report,Boolean(document.getElementById("appointmentServiceCategory")),"Wizyta: wybór kategorii usługi jest dostępny","Znaleziono","Brak #appointmentServiceCategory");
    crmE2EAssert(report,document.getElementById("appointmentService")?.tagName==="SELECT","Wizyta: usługa jest wybierana po kategorii","SELECT","Pole usługi nie jest selectem");

    if(typeof switchTab==="function") await switchTab("klienci");
    try { if (typeof crmClientsViewV269 !== "undefined") crmClientsViewV269 = "steady"; } catch (_) {}
    try { if (typeof loadClients === "function") await loadClients(); } catch (_) {}
    await crmE2EWait(90);
    try { if (typeof renderClients === "function") renderClients(); } catch (_) {}
    const sourceNavV3014=document.getElementById("crmClientsSourceNavV3014");
    crmE2EAssert(report,Boolean(sourceNavV3014)&&sourceNavV3014.hidden===false&&sourceNavV3014.querySelectorAll("[data-crm-client-source-v3014]").length===2,"Klienci: podział DOM + Google Calendar / Booksy",sourceNavV3014?.textContent?.replace(/\s+/g," ").trim()||"","Brak podziału źródła klientów V30.14");
    const bookingFilterV3014=document.getElementById("crmClientsBookingFilterV263");
    crmE2EAssert(report,Boolean(bookingFilterV3014?.querySelector('option[value="REZERWACJA_OGRANICZONA"]')),"Klienci: filtr zawiera tryb REZERWACJA_OGRANICZONA","Znaleziono","Brak trybu ograniczonego w filtrze");

    if(typeof switchTab==="function") await switchTab("cennik");
    await crmE2EWait(30);
    const domState=document.getElementById("crmDomSaveStateV309");
    const booksyState=document.getElementById("crmBooksySaveStateV29");
    crmE2EAssert(report,Boolean(domState),"Cennik DOM: dynamiczny status zapis/publikacja",domState?.textContent||"", "Brak #crmDomSaveStateV309");
    crmE2EAssert(report,Boolean(booksyState),"Cennik Booksy: status zapisu",booksyState?.textContent||"", "Brak statusu Booksy");

    if(typeof switchTab==="function") await switchTab("kalendarz");
    await crmE2EWait(40);
    const reviewQueueBadge=document.getElementById("crmReviewQueueBadgeV3011");
    crmE2EAssert(report,Boolean(reviewQueueBadge)&&/Do zidentyfikowania/i.test(reviewQueueBadge.textContent||""),"Kalendarz: licznik wpisów do zidentyfikowania",reviewQueueBadge?.textContent||"","Brak licznika review");
    crmE2EAssert(report,reviewQueueBadge?.tagName==="BUTTON"&&reviewQueueBadge?.getAttribute("aria-controls")==="crmReviewQueuePanelV3012","Kalendarz: licznik review jest klikalnym przyciskiem",{tag:reviewQueueBadge?.tagName,controls:reviewQueueBadge?.getAttribute("aria-controls")},"Licznik nie jest klikalnym przyciskiem kolejki");
    try{
      if(typeof window.crmReviewToggleQueueV3012==="function") await window.crmReviewToggleQueueV3012();
      const queuePanel=document.getElementById("crmReviewQueuePanelV3012");
      const queueList=document.getElementById("crmReviewQueueListV3012");
      crmE2EAssert(report,Boolean(queuePanel)&&queuePanel.hidden===false&&Boolean(queueList),"Kalendarz: kliknięcie licznika otwiera listę wszystkich do identyfikacji",{hidden:queuePanel?.hidden,items:queueList?.children?.length||0},"Panel kolejki nie został otwarty");
      if(typeof window.crmReviewCloseQueueV3012==="function") window.crmReviewCloseQueueV3012();
    }catch(queueUiError){crmE2EAssert(report,false,"Kalendarz: otwarcie kolejki review",null,queueUiError?.message||queueUiError);}
    if(typeof openAppointmentDetailsModal==="function"){
        const appointment={eventType:"appointment",eventId:"CRM_E2E_UI_APPOINTMENT",name:"E2E Klient",phone:"48111111111",service:"E2E Usługa",duration:45,date:new Date().toISOString(),status:"POTWIERDZONA",crmStatus:"POTWIERDZONA",bookingSource:"ADMIN",source:"ADMIN"};
        openAppointmentDetailsModal(appointment);await crmE2EWait(30);
        const detail=document.getElementById("appointmentDetailsModal");
        crmE2EAssert(report,detail&&getComputedStyle(detail).display!=="none","Szczegóły: zwykła wizyta otwiera panel","Widoczny","Panel niewidoczny");
        crmE2EAssert(report,document.getElementById("crmVisitTabInfo")?.hidden===true,"Szczegóły: najważniejsze dane są na głównej karcie","INFORMACJE ukryte","Zakładka INFORMACJE nadal jest podstawowym widokiem");

        if(typeof openEditAppointmentModal==="function"){
            const servicesBeforePicker = Array.isArray(currentServices) ? currentServices.slice() : [];
            const pickerCacheBefore = (()=>{try{return window.sessionStorage?.getItem("crm_appointment_services_v3017")||null;}catch(ignore){return null;}})();
            const bootstrapSessionBefore = (()=>{try{return window.sessionStorage?.getItem("crm_admin_bootstrap_v18")||null;}catch(ignore){return null;}})();
            try{
                /* 2.6.4 odtwarza sytuację z ekranu użytkownika: currentServices jest jeszcze puste,
                   ale ADMIN ma już snapshot bootstrapu. Picker ma użyć istniejących danych i NIE
                   uruchamiać kolejnego długiego requestu do Google. */
                currentServices = [];
                try { window.sessionStorage?.removeItem("crm_appointment_services_v3017"); } catch(ignore) {}
                if(servicesBeforePicker.length){
                    try{
                        window.sessionStorage?.setItem("crm_admin_bootstrap_v18",JSON.stringify({savedAt:Date.now(),data:{services:servicesBeforePicker}}));
                    }catch(ignore){}
                }

                const startedAt=Date.now();
                await openEditAppointmentModal({changeService:true});
                const pickerLoadMs=Date.now()-startedAt;
                await crmE2EWait(60);
                const categorySelect=document.getElementById("appointmentServiceCategory");
                const serviceSelect=document.getElementById("appointmentService");
                const durationInput=document.getElementById("appointmentDuration");
                const categoryTexts=categorySelect?Array.from(categorySelect.options).map(o=>String(o.textContent||"").trim()):[];
                crmE2EAssert(report,Boolean(categorySelect)&&categorySelect.options.length>1&&!categoryTexts.some(x=>/Ładowanie kategorii/i.test(x)),"Edycja usługi: on-demand Cennik nie zatrzymuje się na Ładowanie kategorii",{ms:pickerLoadMs,categories:categoryTexts},"Picker pozostał w stanie ładowania albo lista kategorii jest pusta");
                crmE2EAssert(report,pickerLoadMs<4000,"Edycja usługi: istniejący cache/bootstrap otwiera picker bez długiego czekania",{ms:pickerLoadMs,source:window.crmAppointmentPickerSourceV3018||""},`Ładowanie trwało ${pickerLoadMs} ms`);
                crmE2EAssert(report,!/loading/i.test(String(categorySelect?.textContent||"")),"Edycja usługi: po odczycie nie zostaje tekst Ładowanie kategorii",categoryTexts,"Pole nadal pokazuje ładowanie");
                crmE2EAssert(report,Boolean(durationInput)&&String(durationInput.value||"")===""&&durationInput.disabled===true,"Edycja usługi: czas jest wyczyszczony do wyboru nowej usługi",{value:durationInput?.value,disabled:durationInput?.disabled},{value:durationInput?.value,disabled:durationInput?.disabled});
                if(categorySelect&&categorySelect.options.length>1){
                    categorySelect.selectedIndex=1;
                    categorySelect.dispatchEvent(new Event("change",{bubbles:true}));
                    await crmE2EWait(10);
                    crmE2EAssert(report,Boolean(serviceSelect)&&serviceSelect.disabled===false&&serviceSelect.options.length>1,"Edycja usługi: po kategorii pojawiają się tylko usługi do wyboru",serviceSelect?{disabled:serviceSelect.disabled,options:serviceSelect.options.length}:null,"Lista usług nie została odblokowana");
                }
                /* 2.6.5: stara ścieżka "Edytuj wizytę" ma zachować i zaznaczyć kategorię
                   bieżącej dokładnej usługi zamiast pozostawiać kategorię pustą/loading. */
                if(servicesBeforePicker.length){
                    const exactService = servicesBeforePicker.find(item => String(item?.name||"").trim() && String(item?.category||"").trim());
                    if(exactService){
                        currentServices = servicesBeforePicker.slice();
                        currentEditingAppointment = Object.assign({}, currentEditingAppointment, {
                            service:String(exactService.name||""),
                            category:String(exactService.category||""),
                            duration:Number(exactService.duration)||45
                        });
                        await openEditAppointmentModal();
                        await crmE2EWait(20);
                        const normalCategory=document.getElementById("appointmentServiceCategory");
                        const normalService=document.getElementById("appointmentService");
                        crmE2EAssert(report,String(normalCategory?.value||"")===String(exactService.category||""),"Edycja wizyty: bieżąca kategoria usługi jest zaznaczona",{category:normalCategory?.value,expected:exactService.category},"Kategoria bieżącej usługi nie została zaznaczona");
                        crmE2EAssert(report,String(normalService?.value||"")===String(exactService.name||""),"Edycja wizyty: bieżąca usługa pozostaje wybrana",{service:normalService?.value,expected:exactService.name},"Bieżąca usługa nie została zachowana");
                    }
                }
                const appointmentModal=document.getElementById("appointmentModal");
                if(appointmentModal) appointmentModal.style.display="none";
            }catch(servicePickerError){
                crmE2EFail(report,"Edycja usługi: Kategoria -> Usługa / odczyt on-demand",servicePickerError?.message||String(servicePickerError));
            }finally{
                if(servicesBeforePicker.length) currentServices=servicesBeforePicker;
                try{
                    if(pickerCacheBefore===null) window.sessionStorage?.removeItem("crm_appointment_services_v3017");
                    else window.sessionStorage?.setItem("crm_appointment_services_v3017",pickerCacheBefore);
                }catch(ignore){}
                try{
                    if(bootstrapSessionBefore===null) window.sessionStorage?.removeItem("crm_admin_bootstrap_v18");
                    else window.sessionStorage?.setItem("crm_admin_bootstrap_v18",bootstrapSessionBefore);
                }catch(ignore){}
            }
        }
        if(typeof closeAppointmentModal==="function") closeAppointmentModal();

        const review={eventType:"external",eventId:"DEV-E2E-REVIEW",name:"Renata Mazur",reviewClient:"Renata Mazur",service:"Manicure żelowy",reviewService:"Manicure żelowy",duration:60,date:new Date().toISOString(),source:"GOOGLE",sourceType:"WIFE_CALENDAR_BLOCK",sourceId:"CRM_E2E_UI_WIFE@google.com",reviewRequired:true,reviewReason:"Niepewny termin — do sprawdzenia",originalTitle:"18:00📍📍📍może być na rano Renata Mazur żel",rawText:"18:00📍📍📍może być na rano Renata Mazur żel",sourceReadOnly:true,canEditReview:true};
        openAppointmentDetailsModal(review);await crmE2EWait(30);
        const ctx=document.getElementById("crmReviewContextV309");
        crmE2EAssert(report,Boolean(ctx)&&/Renata Mazur/.test(ctx.textContent)&&/Manicure żelowy/.test(ctx.textContent),"Review: pełny kontekst bez otwierania Google Calendar",ctx?.textContent?.slice(0,500)||"", "Brak klienta/usługi w głównym panelu");
        crmE2EAssert(report,Boolean(document.querySelector("#crmReviewContextV309 .crm-review-edit-v309")),"Review: edycja danych CRM jest dostępna","Przycisk edycji widoczny","Brak edycji review");
        crmE2EAssert(report,!/ZAJĘTE/.test(document.getElementById("details-name")?.textContent||""),"Review: znane dane nie są zastępowane ZAJĘTE",document.getElementById("details-name")?.textContent||"", "Nadal pokazuje ZAJĘTE");
        if(typeof window.crmReviewOpenEditorV309==="function"){
            window.crmReviewOpenEditorV309();await crmE2EWait(15);
            const proc=document.getElementById("crmReviewServiceV309");
            crmE2EAssert(report,proc?.tagName==="SELECT"&&proc.options.length>1,"Review: procedura jest wybierana z Cennika DOM",proc?{tag:proc.tagName,options:proc.options.length}:null,"Brak listy procedur");
            if(proc&&proc.options.length>1){proc.selectedIndex=1;proc.dispatchEvent(new Event("change",{bubbles:true}));await crmE2EWait(5);}
            const confirmBtn=document.getElementById("crmReviewConfirmV3011");
            crmE2EAssert(report,Boolean(confirmBtn)&&/utwórz wizytę/i.test(confirmBtn.textContent||""),"Review: osobny przycisk OK tworzący wizytę",confirmBtn?.textContent||"","Brak jawnego potwierdzenia jako wizyta");
            if(typeof window.crmReviewCloseEditorV309==="function") window.crmReviewCloseEditorV309();
        }

        const hardBlock={eventType:"external",eventId:"DEV-E2E-STOMATOLOG",name:"STOMATOLOG",service:"Do sprawdzenia",duration:60,date:new Date().toISOString(),source:"GOOGLE",sourceType:"WIFE_CALENDAR_BLOCK",sourceId:"CRM_E2E_UI_STOMATOLOG@google.com",reviewRequired:true,reviewReason:"stary wpis review",originalTitle:"STOMATOLOG",rawText:"STOMATOLOG",sourceReadOnly:true,canEditReview:true};
        openAppointmentDetailsModal(hardBlock);await crmE2EWait(20);
        const hardCtx=document.getElementById("crmReviewContextV309");
        crmE2EAssert(report,!document.querySelector("#crmReviewContextV309 .crm-review-alert-v309")&&!document.querySelector("#crmReviewContextV309 .crm-review-edit-v309"),"Blokada STOMATOLOG: bez czerwonego ! i bez edycji klient/procedura",hardCtx?.textContent?.slice(0,350)||"","STOMATOLOG nadal potraktowany jak review");
        crmE2EAssert(report,/Blokada czasu/i.test(document.getElementById("details-service")?.textContent||"")&&/STOMATOLOG/.test(hardCtx?.textContent||""),"Blokada STOMATOLOG: rozpoznana jako twarda blokada",{service:document.getElementById("details-service")?.textContent,context:hardCtx?.textContent?.slice(0,250)},"Nie rozpoznano twardej blokady");

        if(typeof crmOpenDayVisitsList==="function"){
            try{crmOpenDayVisitsList(new Date());await crmE2EWait(30);}catch(_){ }
        }
        const list=document.querySelector("#crmDayVisitsOverlay .crm-day-list-panel");
        const insights=document.querySelector("#tab-kalendarz .crm-calendar-insights");
        if(window.innerWidth>=1250){
            [detail,list,insights].forEach((node,i)=>{
                if(!node)return;
                const r=node.getBoundingClientRect();
                crmE2EAssert(report,r.width>=280&&r.right<=window.innerWidth+8&&r.left>=-8,`3 panele: geometria ${i+1}`,{left:Math.round(r.left),right:Math.round(r.right),width:Math.round(r.width)},{left:r.left,right:r.right,width:r.width,viewport:window.innerWidth});
            });
        }else crmE2EWarn(report,"3 panele: test geometrii desktop pominięty",{viewport:window.innerWidth});
        if(typeof closeAppointmentModal==="function") closeAppointmentModal();
        try{document.getElementById("crmDayVisitsOverlay")?.style.setProperty("display","none");}catch(_){ }
    }else crmE2EFail(report,"Szczegóły: openAppointmentDetailsModal","Brak funkcji");
}

async function runCRMTestFull(){
    if(window.crmTestFullRunning || crmTestIsRunning){
        if(typeof crmToast==="function") crmToast("Test CRM jest już uruchomiony.","error");
        return;
    }

    window.crmTestFullRunning=true;
    window.crmCurrentTestKind="CRM_TEST_FULL";
    crmResetTestPanelForRun("CRM Test Full");
    crmTestSetRunning(true);
    window.crmDiagnosticsNetworkModeV11=true;

    const report=crmTestCreateReport("CRM_TEST_FULL", CRM_TEST_FULL_VERSION);
    report.testerVersion=CRM_TEST_FULL_VERSION;
    crmLastTestReport=report;
    const started=Date.now();
    const marker=crmE2EMarker();
    const savedTab=crmE2EActiveTab();
    const savedView=typeof calendarViewMode!=="undefined"?calendarViewMode:null;
    const savedDate=typeof selectedCalendarDate!=="undefined"&&selectedCalendarDate?new Date(selectedCalendarDate):null;
    const dialogSpy=crmE2EInstallDialogSpy();
    const ctx={marker,serviceName:"",duration:15,slots:null};
    report.testData={marker,indexMode:"TEST_BACKEND_ONLY"};

    let cleanupAttempted=false;
    try{
        crmE2EStage(1,"CRM Test Full: przygotowanie i pre-cleanup…");
        const preCleanup=await crmE2ECleanup(marker);
        crmE2EAssert(report,preCleanup?.success===true,"Pre-cleanup markera testowego",preCleanup,preCleanup);

        // 1. UI / layout
        crmE2EStage(2,"CRM Test Full: kontrola interfejsu…");
        const required=["admin-panel-wrapper","tab-kalendarz","booksy-grid","appointmentModal","appointmentDetailsModal","clientModal","serviceModal","blockTimeModal","crm-diagnostics-panel"];
        required.forEach(id=>crmE2EAssert(report,Boolean(document.getElementById(id)),`HTML #${id}`,"Znaleziono","Brak elementu"));
        if(savedTab!=="kalendarz") await switchTab("kalendarz");
        if(typeof setCalendarView==="function") setCalendarView("month");
        await crmE2EWait(80);
        crmE2ETestGeometry(report);
        crmE2ETestBlockingAppointmentModal(report);
        await crmE2ETestUiDetailsV2(report);
        await crmE2ETestTabReturn(report,savedTab);
        if(typeof switchTab==="function") await switchTab("kalendarz");

        // 2. Network baseline
        crmE2EStage(3,"CRM Test Full: transport ADMIN i podstawowe dane…");
        const probe=await crmE2EAdminGet({serverProbe:"true"},35000);
        crmE2EAssert(report,probe?.success===true,"ADMIN serverProbe",probe,probe);
        const prices=await crmE2EAdminGet({getPrices:"true"},40000);
        crmE2EAssert(report,Array.isArray(prices)&&prices.length>0,"Odczyt Cennika",{count:Array.isArray(prices)?prices.length:0},prices);
        const svc=Array.isArray(prices)?prices.find(x=>x&&x.name):null;
        ctx.serviceName=String(svc?.name||"Test E2E");
        ctx.duration=Math.max(5,Math.min(30,Number(svc?.duration)||15));
        const clients0=await crmE2EAdminGet({getClients:"true"},40000);
        crmE2EAssert(report,Array.isArray(clients0),"Odczyt Klientów",{count:Array.isArray(clients0)?clients0.length:0},clients0);
        const booksySample=Array.isArray(clients0)?clients0.find(x=>String(x?.source||"").toUpperCase().includes("BOOKSY")):null;
        if(booksySample){
            const booksyProfile=await crmE2EAdminPost({action:"getClientCRMProfileV4718",identity:{phone:String(booksySample.phone||""),sourceKey:String(booksySample.sourceKey||""),name:String(booksySample.name||""),source:String(booksySample.source||"")}});
            crmE2EAssert(report,booksyProfile?.success===true&&String(booksyProfile?.profile?.bookingMode||"").toUpperCase()==="TYLKO_KONTAKT","Klient Booksy: specjalny tryb TYLKO_KONTAKT",booksyProfile?.profile,booksyProfile);
        }
        const ping0=await crmE2EPing();
        crmE2EAssert(report,ping0?.success===true,"Lekki ping Skrzynki",ping0,ping0);
        const inbox0=await crmE2EInbox();
        crmE2EAssert(report,inbox0?.success===true&&Array.isArray(inbox0.items),"Pełny odczyt Skrzynki",{count:inbox0?.items?.length||0},inbox0);

        // 3. Free safe slots
        crmE2EStage(4,"CRM Test Full: szukanie bezpiecznych wolnych terminów…");
        const free=await crmE2EAdminPost({action:"crmE2EFindFreeSlots",marker,duration:ctx.duration},60000);
        ctx.slots=free;
        const adminSlots=Array.isArray(free?.adminSlots)?free.adminSlots:[];
        const indexSlots=Array.isArray(free?.indexSlots)?free.indexSlots:[];
        crmE2EAssert(report,free?.success===true&&adminSlots.length>=22,"Wolne terminy ADMIN do testu",{count:adminSlots.length},free);
        crmE2EAssert(report,indexSlots.length>=5,"Wolne terminy INDEX do testu",{count:indexSlots.length},free);
        if(adminSlots.length<22||indexSlots.length<5) throw new Error("Za mało wolnych terminów do bezpiecznego E2E");

        // 4. Client CRUD and profile + bezpieczny test polityki INDEX
        crmE2EStage(5,"CRM Test Full: klient — dodanie, edycja, profil i tryb…");
        const clientPhone=`TEST-${marker}-CLIENT`;
        const clientName=`${marker} KLIENT`;
        const clientEdited=`${marker} KLIENT EDYCJA`;

        // WAŻNE: oldPhone ustawiamy na ten sam unikalny numer. Dzięki temu tester 2.5
        // nie może nadpisać klienta Booksy z pustym telefonem nawet na starszym backendzie.
        let r=await crmE2EAdminPost({action:"saveClient",oldPhone:clientPhone,client:{name:clientName,phone:clientPhone,visits:0,cancelled:0,lastVisit:""}});
        crmE2EAssert(report,r?.success===true,"Dodanie klienta",r,r);

        let clients=await crmE2EAdminGet({getClients:"true"});
        crmE2EAssert(report,Array.isArray(clients)&&clients.some(x=>String(x.phone)===clientPhone),"Klient widoczny po zapisie",clientPhone,clients);

        let profile=await crmE2EAdminPost({action:"getClientCRMProfile",phone:clientPhone});
        crmE2EAssert(report,profile?.success===true&&profile.profile,"Profil CRM klienta",profile?.profile,profile);
        const sourceBefore=String(profile?.profile?.client?.source||"").toUpperCase();
        crmE2EAssert(report,sourceBefore&&!sourceBefore.includes("BOOKSY"),"Nowy klient salonu nie dziedziczy źródła Booksy",profile?.profile?.client,profile);

        r=await crmE2EAdminPost({action:"setClientBookingMode",phone:clientPhone,mode:"STANDARDOWY",reason:marker,changedBy:"E2E"});
        crmE2EAssert(report,r?.success===true&&r.mode==="STANDARDOWY","Zapis trybu rezerwacji klienta",r,r);

        r=await crmE2EAdminPost({action:"saveClient",oldPhone:clientPhone,client:{name:clientEdited,phone:clientPhone,visits:0,cancelled:0,lastVisit:""}});
        crmE2EAssert(report,r?.success===true,"Edycja klienta",r,r);

        // 5. Polityka INDEX na TYM SAMYM backendzie TEST.
        // Nie wysyłamy danych do osobnego /exec, więc tester nie może zaśmiecić innej bazy.
        crmE2EStage(6,"CRM Test Full: polityka rezerwacji INDEX na backendzie TEST…");
        const idxDirect=indexSlots[0].iso;
        const unknownIndex=await crmE2EAdminPost({
            action:"createBooking",phone:`TEST-${marker}-INDEX-NIEZNANY`,name:`${marker} INDEX NIEZNANY`,
            service:ctx.serviceName,date:idxDirect,duration:ctx.duration,rodo:"Tak",bookingSource:"INDEX",operationId:`${marker}_OP_INDEX_UNKNOWN`
        },60000);
        crmE2EAssert(report,unknownIndex?.success===false&&["CLIENT_NOT_FOUND","CLIENT_NOT_VERIFIED"].includes(String(unknownIndex?.code||"")),"INDEX: niezweryfikowany klient jest odrzucany zgodnie z polityką",unknownIndex,unknownIndex);

        const idxCreate=await crmE2EAdminPost({
            action:"createBooking",phone:clientPhone,name:clientEdited,service:ctx.serviceName,date:idxDirect,duration:ctx.duration,
            rodo:"Tak",bookingSource:"INDEX",operationId:`${marker}_OP_INDEX_OK`
        },60000);
        crmE2EAssert(report,idxCreate?.success===true,"INDEX: zweryfikowany klient może utworzyć wizytę",idxCreate,idxCreate);
        let busy=await crmE2EBusyAround(idxDirect);
        let idxApp=crmE2EFindAppointment(busy,x=>String(x.phone)===clientPhone||String(x.eventId)===String(idxCreate?.eventId||""));
        crmE2EAssert(report,Boolean(idxApp),"ADMIN widzi wizytę utworzoną jako INDEX",idxApp,"Nie znaleziono");
        crmE2EAssert(report,String(idxApp?.bookingSource||"").toUpperCase()==="INDEX","Źródło wizyty INDEX zapisane poprawnie",idxApp?.bookingSource,idxApp);
        if(idxCreate?.eventId){
            r=await crmE2EAdminPost({action:"createBooking",bookingSource:"ADMIN",deleteFlag:true,eventId:idxCreate.eventId,date:idxDirect,name:clientEdited});
            crmE2EAssert(report,r?.success===true,"Usunięcie testowej wizyty INDEX przez ADMIN",r,r);
        }

        r=await crmE2EAdminPost({action:"deleteClient",phone:clientPhone});
        crmE2EAssert(report,r?.success===true,"Usunięcie klienta",r,r);
        clients=await crmE2EAdminGet({getClients:"true"});
        crmE2EAssert(report,Array.isArray(clients)&&!clients.some(x=>String(x.phone)===clientPhone),"Klient znika po usunięciu","Nie znaleziono — OK",clients);

        // 6. ADMIN booking + idempotency + edit + hard delete
        crmE2EStage(7,"CRM Test Full: wizyta ADMIN — zapis, idempotencja i edycja…");
        const a1=await crmE2ECreateAdminBooking(ctx,"IDEMPOTENT",adminSlots[0].iso);
        crmE2EAssert(report,a1.result?.success===true,"ADMIN: utworzenie wizyty",a1.result,a1.result);
        const a1dup=await crmE2EAdminPost(a1.payload,60000);
        crmE2EAssert(report,a1dup?.success===true&&a1dup?.duplicatePrevented===true,"Idempotencja operationId — brak duplikatu",a1dup,a1dup);
        busy=await crmE2EBusyAround(adminSlots[0].iso);
        let app=crmE2EFindAppointment(busy,x=>String(x.eventId)===String(a1.result?.eventId||"")||String(x.phone)===String(a1.payload.phone));
        crmE2EAssert(report,Boolean(app),"Odczyt wizyty ADMIN po zapisie",app,"Nie znaleziono");
        const editPayload={action:"createBooking",editFlag:true,oldEventId:a1.result?.eventId||app?.eventId||"",oldDate:adminSlots[0].iso,oldName:a1.payload.name,operationId:`${marker}_OP_EDIT`,phone:a1.payload.phone,name:a1.payload.name,service:ctx.serviceName,date:adminSlots[2].iso,duration:ctx.duration,rodo:marker,bookingSource:"ADMIN"};
        const edit=await crmE2EAdminPost(editPayload,60000);
        crmE2EAssert(report,edit?.success===true,"Edycja/przeniesienie wizyty przez formularz ADMIN",edit,edit);
        busy=await crmE2EBusyAround(adminSlots[2].iso);
        app=crmE2EFindAppointment(busy,x=>String(x.eventId)===String(edit?.eventId||"")||String(x.phone)===String(a1.payload.phone));
        crmE2EAssert(report,Boolean(app)&&String(app.date||"").slice(0,10)===crmE2EIsoDay(adminSlots[2].iso),"Wizyta znajduje się w nowym terminie",app,"Nie znaleziono po edycji");
        if(edit?.eventId){
            r=await crmE2EAdminPost({action:"createBooking",bookingSource:"ADMIN",deleteFlag:true,eventId:edit.eventId,date:adminSlots[2].iso,name:a1.payload.name});
            crmE2EAssert(report,r?.success===true,"Twarde usunięcie wizyty ADMIN",r,r);
        }

        // 7. Lifecycle: cancel with event present
        crmE2EStage(8,"CRM Test Full: anulowanie i trwałość statusów…");
        const cancel=await crmE2ECreateAdminBooking(ctx,"CANCEL_CLIENT",adminSlots[4].iso);
        crmE2EAssert(report,cancel.result?.success===true,"Przygotowanie wizyty do anulowania przez klienta",cancel.result,cancel.result);
        r=await crmE2EAdminPost({action:"recordAppointmentLifecycle",eventId:cancel.result?.eventId||"",phone:cancel.payload.phone,clientName:cancel.payload.name,service:ctx.serviceName,operation:"ANULOWANIE",initiator:"KLIENT",oldDate:adminSlots[4].iso,reason:marker,deleteCalendarEvent:true},60000);
        crmE2EAssert(report,r?.success===true&&String(r.status)==="ANULOWANA_KLIENT","Anulowanie przez klienta",r,r);
        busy=await crmE2EBusyAround(adminSlots[4].iso);
        crmE2EAssert(report,!crmE2EFindAppointment(busy,x=>String(x.phone)===String(cancel.payload.phone)),"Anulowana wizyta nie wraca do aktywnego kalendarza","Nieaktywna — OK",busy);

        // 8. Lifecycle: Google event already missing
        const miss=await crmE2ECreateAdminBooking(ctx,"CANCEL_MISSING_GOOGLE",adminSlots[6].iso);
        crmE2EAssert(report,miss.result?.success===true,"Przygotowanie wizyty do testu brakującego Google Event",miss.result,miss.result);
        r=await crmE2EAdminPost({action:"crmE2EDeleteCalendarEventOnly",marker,eventId:miss.result?.eventId||""});
        crmE2EAssert(report,r?.success===true,"Usunięcie samego Google Event przed anulowaniem",r,r);
        r=await crmE2EAdminPost({action:"recordAppointmentLifecycle",eventId:miss.result?.eventId||"",phone:miss.payload.phone,clientName:miss.payload.name,service:ctx.serviceName,operation:"ANULOWANIE",initiator:"SALON",oldDate:adminSlots[6].iso,reason:marker,deleteCalendarEvent:true},60000);
        crmE2EAssert(report,r?.success===true&&r.calendarEventAlreadyMissing===true,"Anulowanie działa mimo brakującego Google Event",r,r);

        // 9. No-show lifecycle — exposes active-filter bug if present
        const noshow=await crmE2ECreateAdminBooking(ctx,"NO_SHOW",adminSlots[8].iso);
        crmE2EAssert(report,noshow.result?.success===true,"Przygotowanie wizyty NIEOBECNOŚĆ",noshow.result,noshow.result);
        r=await crmE2EAdminPost({action:"recordAppointmentLifecycle",eventId:noshow.result?.eventId||"",phone:noshow.payload.phone,clientName:noshow.payload.name,service:ctx.serviceName,operation:"NIEOBECNOSC",initiator:"SALON",oldDate:adminSlots[8].iso,reason:marker,deleteCalendarEvent:true},60000);
        crmE2EAssert(report,r?.success===true&&String(r.status)==="NIEOBECNOSC","Zapis statusu NIEOBECNOŚĆ",r,r);
        busy=await crmE2EBusyAround(adminSlots[8].iso);
        const noShowStillActive=Boolean(crmE2EFindAppointment(busy,x=>String(x.phone)===String(noshow.payload.phone)));
        crmE2EAssert(report,!noShowStillActive,"NIEOBECNOŚĆ nie blokuje aktywnego kalendarza","Nie blokuje — OK",{problem:"Rekord NIEOBECNOŚĆ nadal jest zwracany jako aktywny",appointment:crmE2EFindAppointment(busy,x=>String(x.phone)===String(noshow.payload.phone))});

        const completed=await crmE2ECreateAdminBooking(ctx,"COMPLETED",adminSlots[9].iso);
        crmE2EAssert(report,completed.result?.success===true,"Przygotowanie wizyty ZREALIZOWANA",completed.result,completed.result);
        r=await crmE2EAdminPost({action:"recordAppointmentLifecycle",eventId:completed.result?.eventId||"",phone:completed.payload.phone,clientName:completed.payload.name,service:ctx.serviceName,operation:"ZREALIZOWANA",initiator:"SALON",oldDate:adminSlots[9].iso,reason:marker,deleteCalendarEvent:false},60000);
        crmE2EAssert(report,r?.success===true&&String(r.status)==="ZREALIZOWANA","Zapis statusu ZREALIZOWANA",r,r);

        // 10. Block time create/update/delete
        crmE2EStage(9,"CRM Test Full: blokady czasu…");
        const blockDate=crmE2EIsoDay(adminSlots[10].iso), blockStart=String(adminSlots[10].time), blockEnd=crmE2EPlusMinutes(adminSlots[10].iso,ctx.duration+20).slice(11,16);
        const blockTitle=`${marker} BLOKADA`;
        const block=await crmE2EAdminPost({action:"blockTime",blockType:"hours",date:blockDate,startTime:blockStart,endTime:blockEnd,title:blockTitle},60000);
        crmE2EAssert(report,block?.success===true&&block?.eventId,"Utworzenie blokady czasu",block,block);
        const updDate=crmE2EIsoDay(adminSlots[12].iso), updStart=String(adminSlots[12].time), updEnd=crmE2EPlusMinutes(adminSlots[12].iso,ctx.duration+20).slice(11,16);
        r=await crmE2EAdminPost({action:"updateBlockTime",eventId:block.eventId,date:updDate,startTime:updStart,endTime:updEnd,title:blockTitle+" EDYCJA"},60000);
        crmE2EAssert(report,r?.success===true&&r?.updated===true,"Edycja blokady czasu",r,r);
        r=await crmE2EAdminPost({action:"deleteBlockTime",eventId:block.eventId,start:adminSlots[12].iso,end:crmE2EPlusMinutes(adminSlots[12].iso,ctx.duration+20),title:blockTitle+" EDYCJA"},60000);
        crmE2EAssert(report,r?.success===true,"Usunięcie blokady czasu",r,r);

        // 11. External Google event protection
        crmE2EStage(10,"CRM Test Full: ochrona zewnętrznego Google Calendar…");
        const external=await crmE2EAdminPost({action:"crmE2ECreateExternalEvent",marker,start:adminSlots[14].iso,duration:ctx.duration},60000);
        crmE2EAssert(report,external?.success===true&&external?.eventId,"Utworzenie zewnętrznego wydarzenia testowego",external,external);
        busy=await crmE2EBusyAround(adminSlots[14].iso);
        crmE2EAssert(report,Boolean(crmE2EFindAppointment(busy,x=>String(x.eventId)===String(external.eventId))),"Zewnętrzne wydarzenie jest widoczne jako zajętość",external.eventId,busy);
        r=await crmE2EAdminPost({action:"deleteBlockTime",eventId:external.eventId,start:adminSlots[14].iso,end:crmE2EPlusMinutes(adminSlots[14].iso,ctx.duration),title:`${marker} EXTERNAL`},60000);
        crmE2EAssert(report,r?.success===false,"deleteBlockTime odmawia usunięcia zwykłego Google Event",r,{problem:"Zewnętrzne wydarzenie zostało potraktowane jak blokada",result:r});

        // 11B. Review WIFE mirror — pełny kontekst, kolejka, edycja i jawne potwierdzenie jako normalna wizyta
        const reviewQueueBefore=await crmE2EAdminPost({action:"getExternalReviewQueueStatusV4715"},60000);
        crmE2EAssert(report,reviewQueueBefore?.success===true&&Number.isFinite(Number(reviewQueueBefore?.toIdentify)),"Review queue: odczyt licznika",reviewQueueBefore,reviewQueueBefore);
        crmE2EAssert(report,Array.isArray(reviewQueueBefore?.items)&&Number(reviewQueueBefore.items.length)===Number(reviewQueueBefore.toIdentify),"Review queue: backend zwraca pełną listę wszystkich nierozwiązanych wpisów",{count:reviewQueueBefore?.toIdentify,items:reviewQueueBefore?.items?.length},reviewQueueBefore);
        const reviewBlock=await crmE2EAdminPost({action:"crmE2ECreateReviewBlockV4713",marker,start:adminSlots[15].iso,duration:ctx.duration+15,clientName:`${marker} Renata Mazur`,service:ctx.serviceName,originalTitle:`18:00📍📍📍może być na rano ${marker} Renata Mazur ${ctx.serviceName}`},60000);
        crmE2EAssert(report,reviewBlock?.success===true&&reviewBlock?.eventId,"Review: utworzenie bezpiecznej kopii testowej",reviewBlock,reviewBlock);
        let reviewQueueCreated=await crmE2EAdminPost({action:"getExternalReviewQueueStatusV4715"},60000);
        crmE2EAssert(report,reviewQueueCreated?.success===true&&Number(reviewQueueCreated.toIdentify)===Number(reviewQueueBefore.toIdentify)+1,"Review queue: nowy blok zwiększa licznik o 1",{before:reviewQueueBefore?.toIdentify,after:reviewQueueCreated?.toIdentify},reviewQueueCreated);
        busy=await crmE2EBusyAround(adminSlots[15].iso);
        let reviewApp=crmE2EFindAppointment(busy,x=>String(x.eventId)===String(reviewBlock?.eventId||""));
        const reviewFull=Boolean(reviewApp)&&reviewApp.reviewRequired===true&&reviewApp.sourceReadOnly===true&&String(reviewApp.rawText||"").includes(marker)&&!/^.*ZAJĘTE.*$/i.test(String(reviewApp.name||""));
        crmE2EAssert(report,reviewFull,"Review: checkBusy zwraca pełny kontekst, nie samo ZAJĘTE",reviewApp,busy);
        r=await crmE2EAdminPost({action:"updateExternalReviewAnnotationV4713",eventId:reviewBlock.eventId,sourceId:reviewBlock.sourceId,clientName:`${marker} Renata POPRAWIONA`,service:ctx.serviceName,note:`${marker} notatka CRM`},60000);
        crmE2EAssert(report,r?.success===true&&r?.sourceCalendarTouched===false,"Review: zapis roboczy nie dotyka kalendarza źródłowego",r,r);
        busy=await crmE2EBusyAround(adminSlots[15].iso);
        reviewApp=crmE2EFindAppointment(busy,x=>String(x.eventId)===String(reviewBlock?.eventId||""));
        crmE2EAssert(report,String(reviewApp?.name||"").includes("POPRAWIONA")&&String(reviewApp?.service||"")===String(ctx.serviceName),"Review: roboczo edytowane dane wracają do ADMINA",reviewApp,busy);
        const confirmedReview=await crmE2EAdminPost({action:"confirmExternalReviewAsVisitV4715",eventId:reviewBlock.eventId,sourceId:reviewBlock.sourceId,clientName:`${marker} Renata POPRAWIONA`,service:ctx.serviceName,note:`${marker} potwierdzone E2E`},60000);
        crmE2EAssert(report,confirmedReview?.success===true&&confirmedReview?.confirmed===true&&confirmedReview?.reviewRemoved===true&&confirmedReview?.sourceCalendarTouched===false,"Review: OK tworzy normalną wizytę bez dotykania źródła",confirmedReview,confirmedReview);
        busy=await crmE2EBusyAround(adminSlots[15].iso);
        const confirmedApp=crmE2EFindAppointment(busy,x=>String(x.eventId)===String(confirmedReview?.eventId||""));
        const oldReviewStill=crmE2EFindAppointment(busy,x=>String(x.eventId)===String(reviewBlock?.eventId||""));
        crmE2EAssert(report,Boolean(confirmedApp)&&confirmedApp.eventType==="appointment"&&String(confirmedApp.name||"").includes("POPRAWIONA")&&String(confirmedApp.service||"")===String(ctx.serviceName),"Review: po OK widoczna jest normalna wizyta",confirmedApp,busy);
        crmE2EAssert(report,!oldReviewStill,"Review: stara karta do sprawdzenia znika po OK",oldReviewStill||"Brak — OK",oldReviewStill);
        const reviewQueueAfter=await crmE2EAdminPost({action:"getExternalReviewQueueStatusV4715"},60000);
        crmE2EAssert(report,reviewQueueAfter?.success===true&&Number(reviewQueueAfter.toIdentify)===Number(reviewQueueBefore.toIdentify),"Review queue: po OK licznik wraca do wartości początkowej",{before:reviewQueueBefore?.toIdentify,after:reviewQueueAfter?.toIdentify},reviewQueueAfter);

        // 11C. Znana twarda blokada nie może zostać review nawet przy starym wierszu Do weryfikacji TEST
        const knownBlock=await crmE2EAdminPost({action:"crmE2ECreateReviewBlockV4713",marker,start:adminSlots[13].iso,duration:ctx.duration,clientName:"STOMATOLOG",service:"",originalTitle:"STOMATOLOG"},60000);
        crmE2EAssert(report,knownBlock?.success===true&&knownBlock?.eventId,"STOMATOLOG: utworzenie bezpiecznej kopii testowej",knownBlock,knownBlock);
        busy=await crmE2EBusyAround(adminSlots[13].iso);
        const knownApp=crmE2EFindAppointment(busy,x=>String(x.eventId)===String(knownBlock?.eventId||""));
        crmE2EAssert(report,Boolean(knownApp)&&knownApp.knownHardBlock===true&&knownApp.reviewRequired===false&&knownApp.canEditReview===false&&String(knownApp.service)==="Blokada czasu","STOMATOLOG: backend rozpoznaje twardą blokadę zamiast review",knownApp,busy);

        // 12. STANDARD request w TEST DB -> inbox -> read -> MAIN
        crmE2EStage(11,"CRM Test Full: prośba STANDARD i Skrzynka…");
        const stdPhone=`TEST-${marker}-STD`;
        const stdName=`${marker} STANDARD LIVE`;
        const stdReq=await crmE2EAdminPost({action:"crmE2ECreateRequest",marker,requestType:"STANDARD",phone:stdPhone,name:stdName,service:ctx.serviceName,duration:ctx.duration,main:indexSlots[1].iso,alternative:indexSlots[3].iso});
        crmE2EAssert(report,stdReq?.success===true&&stdReq?.requestId,"STANDARD: utworzenie bezpiecznej prośby w TEST DB",stdReq,stdReq);
        let ping=await crmE2EPing();
        crmE2EAssert(report,ping?.success===true&&Number(ping.newCount)>=1,"Ping widzi nowe wpisy Skrzynki",ping,ping);
        let inbox=await crmE2EInbox();
        let item=Array.isArray(inbox?.items)?inbox.items.find(x=>String(x.id)===String(stdReq.requestId)):null;
        crmE2EAssert(report,Boolean(item)&&item.requestType==="STANDARD","Skrzynka pokazuje prośbę STANDARD",item,inbox);
        r=await crmE2EAdminPost({action:"markAdminInboxRead",inboxType:"BOOKING_REQUEST",requestId:stdReq.requestId});
        crmE2EAssert(report,r?.success===true,"Oznaczenie prośby STANDARD jako przeczytanej",r,r);
        r=await crmE2EAdminPost({action:"decideBookingRequest",requestId:stdReq.requestId,choice:"MAIN"},60000);
        crmE2EAssert(report,r?.success===true&&r?.status==="POTWIERDZONA","Potwierdzenie terminu głównego STANDARD",r,r);
        busy=await crmE2EBusyAround(indexSlots[1].iso);
        app=crmE2EFindAppointment(busy,x=>String(x.sourceRequestId||"")===String(stdReq.requestId)||String(x.phone)===stdPhone);
        crmE2EAssert(report,Boolean(app)&&String(app.bookingSource||"").toUpperCase()==="INDEX_REQUEST","Potwierdzona prośba tworzy wizytę INDEX_REQUEST",app,busy);

        // 13. STANDARD ALT + REJECT via safe helper
        crmE2EStage(12,"CRM Test Full: alternatywa i odrzucenie prośby…");
        const altReq=await crmE2EAdminPost({action:"crmE2ECreateRequest",marker,requestType:"STANDARD",phone:`TEST-${marker}-ALT`,name:`${marker} STANDARD ALT`,service:ctx.serviceName,duration:ctx.duration,main:adminSlots[16].iso,alternative:adminSlots[17].iso});
        crmE2EAssert(report,altReq?.success===true,"Przygotowanie prośby do wyboru ALT",altReq,altReq);
        r=await crmE2EAdminPost({action:"decideBookingRequest",requestId:altReq.requestId,choice:"ALT"},60000);
        crmE2EAssert(report,r?.success===true&&r?.status==="POTWIERDZONA","Potwierdzenie terminu alternatywnego",r,r);
        const rejectReq=await crmE2EAdminPost({action:"crmE2ECreateRequest",marker,requestType:"STANDARD",phone:`TEST-${marker}-REJ`,name:`${marker} STANDARD REJECT`,service:ctx.serviceName,duration:ctx.duration,main:adminSlots[18].iso,alternative:adminSlots[19].iso});
        crmE2EAssert(report,rejectReq?.success===true,"Przygotowanie prośby do odrzucenia",rejectReq,rejectReq);
        r=await crmE2EAdminPost({action:"decideBookingRequest",requestId:rejectReq.requestId,choice:"REJECT"},60000);
        crmE2EAssert(report,r?.success===true&&r?.status==="ODRZUCONA","Odrzucenie prośby STANDARD",r,r);

        // 14. FIRST VISIT w TEST DB -> inbox fields -> nonblocking -> booking -> client source
        crmE2EStage(13,"CRM Test Full: pierwsza wizyta i Skrzynka…");
        const fvPhone=`TEST-${marker}-FV`;
        const fvName=`${marker} FIRST VISIT`;
        const fvProposal=adminSlots[20];
        const fvReq=await crmE2EAdminPost({
            action:"crmE2ECreateRequest",marker,requestType:"FIRST_VISIT",phone:fvPhone,name:fvName,email:`e2e.${Date.now()}@example.com`,
            service:ctx.serviceName,duration:ctx.duration,proposals:[{date:fvProposal.date,times:[fvProposal.time]}],
            contactConsent:true,message:`${marker} wiadomość E2E`
        },60000);
        crmE2EAssert(report,fvReq?.success===true&&fvReq?.requestId,"FIRST_VISIT: utworzenie bezpiecznej prośby w TEST DB",fvReq,fvReq);
        inbox=await crmE2EInbox();
        item=Array.isArray(inbox?.items)?inbox.items.find(x=>String(x.id)===String(fvReq.requestId)):null;
        const fvFields=Boolean(item)&&item.requestType==="FIRST_VISIT"&&String(item.phone)===fvPhone&&String(item.service)===ctx.serviceName&&Array.isArray(item.proposals)&&item.proposals.length>0;
        crmE2EAssert(report,fvFields,"Skrzynka pokazuje komplet danych FIRST_VISIT",item,inbox);
        r=await crmE2EAdminPost({action:"markAdminInboxRead",inboxType:"BOOKING_REQUEST",requestId:fvReq.requestId});
        crmE2EAssert(report,r?.success===true,"FIRST_VISIT: oznaczenie jako przeczytane",r,r);
        busy=await crmE2EBusyAround(fvProposal.iso);
        const proposalBlocks=Boolean(crmE2EFindAppointment(busy,x=>String(x.phone)===fvPhone||String(x.sourceRequestId||"")===String(fvReq.requestId)));
        crmE2EAssert(report,!proposalBlocks,"Propozycja FIRST_VISIT nie blokuje kalendarza","Brak blokady — OK",busy);
        const fvBooking=await crmE2ECreateAdminBooking(ctx,"FIRST_VISIT_BOOKING",fvProposal.iso,{phone:fvPhone,name:fvName,firstVisitRequestId:fvReq.requestId,bookingSource:"FORM_FIRST"});
        crmE2EAssert(report,fvBooking.result?.success===true&&fvBooking.result?.firstVisitRequestHandled===true,"Utworzenie wizyty z FIRST_VISIT i zamknięcie prośby",fvBooking.result,fvBooking.result);
        busy=await crmE2EBusyAround(fvProposal.iso);
        app=crmE2EFindAppointment(busy,x=>String(x.eventId)===String(fvBooking.result?.eventId||"")||String(x.phone)===fvPhone);
        crmE2EAssert(report,Boolean(app)&&String(app.bookingSource||"").toUpperCase()==="FORM_FIRST","Źródło wizyty FIRST_VISIT = FORM_FIRST",app,busy);
        crmE2EAssert(report,Boolean(app)&&app.firstVisit===true,"Rzeczywiście nowy klient FIRST_VISIT zachowuje Pierwsza wizyta = TAK",app,busy);
        const inspectFV=await crmE2EInspect(marker);
        const clientRows=inspectFV?.sheets?.["Klienci"]?.rows||[];
        const fvClient=clientRows.find(row=>Array.isArray(row.values)&&String(row.values[0])===fvPhone);
        crmE2EAssert(report,Boolean(fvClient)&&String(fvClient.values[6]||"")==="PIERWSZA_WIZYTA_ONLINE","Nowy klient ma źródło PIERWSZA_WIZYTA_ONLINE",fvClient,clientRows);

        // 15. FIRST_VISIT handled without booking
        const fvNoBook=await crmE2EAdminPost({action:"crmE2ECreateRequest",marker,requestType:"FIRST_VISIT",phone:`TEST-${marker}-FV-NOBOOK`,name:`${marker} FIRST NOBOOK`,service:ctx.serviceName,duration:ctx.duration,email:`nobook.${Date.now()}@example.com`,proposals:[{date:adminSlots[21].date,times:[adminSlots[21].time]}],message:`${marker} bez wizyty`});
        crmE2EAssert(report,fvNoBook?.success===true,"Przygotowanie FIRST_VISIT bez wizyty",fvNoBook,fvNoBook);
        r=await crmE2EAdminPost({action:"decideBookingRequest",requestId:fvNoBook.requestId,choice:"REJECT"});
        crmE2EAssert(report,r?.success===true&&r?.status==="ODRZUCONA","FIRST_VISIT: Obsłużone bez wizyty / odrzucone",r,r);

        // 16. FIRST_VISIT -> istniejący klient DOM/Google bez telefonu.
        // Najpierw zgłoszenie zawiera pełne propozycje, potem mistrzyni świadomie łączy klienta.
        // Samo połączenie nie zatwierdza wizyty i nie może zmienić propozycji.
        crmE2EStage(14,"CRM Test Full: klient bez telefonu + bezpieczne łączenie FIRST_VISIT…");
        const linkedBaseName=`${marker} ISTNIEJACY GOOGLE`;
        const linkedEditedName=`${marker} ISTNIEJACY GOOGLE EDYCJA`;
        const linkedSourceKey=`DOM:${marker}@google.com`;
        const noPhone=await crmE2EAdminPost({action:"crmE2ECreateNoPhoneClientV4718",marker,name:linkedBaseName,source:"DOM",sourceKey:linkedSourceKey,visits:2});
        crmE2EAssert(report,noPhone?.success===true&&noPhone?.phone===""&&String(noPhone?.source)==="DOM","Klient Google/DOM bez telefonu: bezpieczne utworzenie danych testowych",noPhone,noPhone);

        let noPhoneProfile=await crmE2EAdminPost({action:"getClientCRMProfileV4718",identity:{sourceKey:linkedSourceKey,name:linkedBaseName,source:"DOM"}});
        crmE2EAssert(report,noPhoneProfile?.success===true&&noPhoneProfile?.profile?.client?.phone===""&&String(noPhoneProfile?.profile?.bookingMode||"").toUpperCase()==="WYMAGA_POTWIERDZENIA","Klient bez telefonu: profil ładuje się i domyślnie wymaga potwierdzenia",noPhoneProfile?.profile,noPhoneProfile);

        r=await crmE2EAdminPost({action:"setClientBookingModeV4718",identity:{sourceKey:linkedSourceKey,name:linkedBaseName,source:"DOM"},mode:"REZERWACJA_OGRANICZONA",reason:marker,changedBy:"E2E"});
        crmE2EAssert(report,r?.success===true&&r?.mode==="REZERWACJA_OGRANICZONA","Klient bez telefonu: można ustawić REZERWACJA_OGRANICZONA",r,r);
        noPhoneProfile=await crmE2EAdminPost({action:"getClientCRMProfileV4718",identity:{sourceKey:linkedSourceKey,name:linkedBaseName,source:"DOM"}});
        crmE2EAssert(report,String(noPhoneProfile?.profile?.bookingMode||"").toUpperCase()==="REZERWACJA_OGRANICZONA","Klient bez telefonu: tryb ograniczony wraca po ponownym odczycie",noPhoneProfile?.profile,noPhoneProfile);
        r=await crmE2EAdminPost({action:"setClientBookingModeV4718",identity:{sourceKey:linkedSourceKey,name:linkedBaseName,source:"DOM"},mode:"WYMAGA_POTWIERDZENIA",reason:marker,changedBy:"E2E"});
        crmE2EAssert(report,r?.success===true,"Klient bez telefonu: przywrócenie trybu WYMAGA_POTWIERDZENIA",r,r);

        r=await crmE2EAdminPost({action:"saveClientV4718",identity:{sourceKey:linkedSourceKey,name:linkedBaseName,source:"DOM"},client:{name:linkedEditedName,phone:""}});
        crmE2EAssert(report,r?.success===true&&r?.updated===true&&String(r?.customer?.sourceKey||"")===linkedSourceKey,"Klient bez telefonu: edycja po SourceKey bez wymuszania telefonu",r,r);

        const linkedRequestPhone=`TEST-${marker}-LINKED-FV`;
        const linkedProposals=[
            {date:adminSlots[11].date,times:[adminSlots[11].time]},
            {date:adminSlots[21].date,times:[adminSlots[21].time]}
        ];
        const linkedReq=await crmE2EAdminPost({
            action:"crmE2ECreateRequest",marker,requestType:"FIRST_VISIT",phone:linkedRequestPhone,name:linkedEditedName,
            email:`linked.${Date.now()}@example.com`,service:ctx.serviceName,category:ctx.serviceName,duration:ctx.duration,
            preferredWindow:"rano lub po południu",contactMethod:"WHATSAPP",contactConsent:true,
            proposals:linkedProposals,message:`${marker} FIRST_VISIT do połączenia`
        },60000);
        crmE2EAssert(report,linkedReq?.success===true&&linkedReq?.requestId,"FIRST_VISIT istniejącego klienta bez telefonu: zgłoszenie zapisane przed łączeniem",linkedReq,linkedReq);

        inbox=await crmE2EInbox();
        let linkedItem=Array.isArray(inbox?.items)?inbox.items.find(x=>String(x.id)===String(linkedReq.requestId)):null;
        const proposalsBeforeLink=Array.isArray(linkedItem?.proposals)?linkedItem.proposals:[];
        const candidate=Array.isArray(linkedItem?.possibleClientMatches)?linkedItem.possibleClientMatches.find(x=>String(x.sourceKey||"")===linkedSourceKey):null;
        crmE2EAssert(report,Boolean(linkedItem)&&linkedItem.status==="OCZEKUJE"&&JSON.stringify(proposalsBeforeLink)===JSON.stringify(linkedProposals),"FIRST_VISIT przed łączeniem: komplet propozycji pozostaje w Skrzynce",linkedItem,inbox);
        crmE2EAssert(report,Boolean(candidate)&&!linkedItem?.linkedClient,"FIRST_VISIT: ADMIN tylko sugeruje istniejącego klienta bez automatycznego połączenia",candidate,linkedItem);

        const linkResult=await crmE2EAdminPost({action:"linkFirstVisitExistingClientV4718",requestId:linkedReq.requestId,target:{sourceKey:linkedSourceKey,name:linkedEditedName,source:"DOM"}},60000);
        crmE2EAssert(report,linkResult?.success===true&&linkResult?.linked===true&&linkResult?.proposalsPreserved===true&&String(linkResult?.requestStatus||"").toUpperCase()==="OCZEKUJE","FIRST_VISIT: ręczne połączenie nie zatwierdza wizyty i zachowuje propozycje",linkResult,linkResult);
        crmE2EAssert(report,JSON.stringify(linkResult?.proposals||[])===JSON.stringify(proposalsBeforeLink),"FIRST_VISIT: propozycje są identyczne przed i po połączeniu",linkResult?.proposals,{before:proposalsBeforeLink,after:linkResult?.proposals});

        inbox=await crmE2EInbox();
        linkedItem=Array.isArray(inbox?.items)?inbox.items.find(x=>String(x.id)===String(linkedReq.requestId)):null;
        crmE2EAssert(report,Boolean(linkedItem?.linkedClient)&&String(linkedItem.linkedClient.sourceKey||"")===linkedSourceKey&&String(linkedItem.status||"").toUpperCase()==="OCZEKUJE","FIRST_VISIT po połączeniu: Skrzynka pokazuje powiązanego klienta, ale prośba nadal oczekuje",linkedItem,inbox);
        crmE2EAssert(report,JSON.stringify(linkedItem?.proposals||[])===JSON.stringify(proposalsBeforeLink),"FIRST_VISIT po ponownym odczycie: propozycje nadal nie zniknęły",linkedItem?.proposals,{before:proposalsBeforeLink,after:linkedItem?.proposals});

        let inspectLinked=await crmE2EInspect(marker);
        let linkedCustomerRows=(inspectLinked?.sheets?.["Klienci"]?.rows||[]).filter(row=>Array.isArray(row.values)&&String(row.values[7]||"")===linkedSourceKey);
        crmE2EAssert(report,linkedCustomerRows.length===1&&String(linkedCustomerRows[0]?.values?.[0]||"")===linkedRequestPhone&&String(linkedCustomerRows[0]?.values?.[6]||"")==="DOM","FIRST_VISIT: telefon dopisany do starego klienta bez duplikatu i bez utraty źródła",linkedCustomerRows,inspectLinked?.sheets?.["Klienci"]);

        const linkedBooking=await crmE2ECreateAdminBooking(ctx,"FIRST_VISIT_LINKED",adminSlots[11].iso,{phone:linkedRequestPhone,name:linkedEditedName,firstVisitRequestId:linkedReq.requestId,bookingSource:"FORM_FIRST"});
        crmE2EAssert(report,linkedBooking.result?.success===true&&linkedBooking.result?.firstVisitRequestHandled===true&&linkedBooking.result?.firstVisit===false,"Połączony istniejący klient: zatwierdzona wizyta ma Pierwsza wizyta = NIE",linkedBooking.result,linkedBooking.result);
        busy=await crmE2EBusyAround(adminSlots[11].iso);
        const linkedApp=crmE2EFindAppointment(busy,x=>String(x.eventId)===String(linkedBooking.result?.eventId||"")||String(x.phone)===linkedRequestPhone);
        crmE2EAssert(report,Boolean(linkedApp)&&String(linkedApp.bookingSource||"").toUpperCase()==="FORM_FIRST"&&linkedApp.firstVisit===false,"Połączona wizyta: techniczne źródło FORM_FIRST zostaje, ale firstVisit=false",linkedApp,busy);

        inspectLinked=await crmE2EInspect(marker);
        linkedCustomerRows=(inspectLinked?.sheets?.["Klienci"]?.rows||[]).filter(row=>Array.isArray(row.values)&&String(row.values[7]||"")===linkedSourceKey);
        crmE2EAssert(report,linkedCustomerRows.length===1&&String(linkedCustomerRows[0]?.values?.[6]||"")==="DOM"&&String(linkedCustomerRows[0]?.values?.[7]||"")===linkedSourceKey,"Po zatwierdzeniu: istniejący klient zachowuje źródło i SourceKey",linkedCustomerRows,inspectLinked?.sheets?.["Klienci"]);
        crmE2EAssert(report,Number(linkedCustomerRows[0]?.values?.[2]||0)>=2,"Po zatwierdzeniu: historyczny licznik wizyt klienta nie został wyzerowany",linkedCustomerRows[0],linkedCustomerRows[0]);

        // 17. Generic contact inbox flow
        crmE2EStage(15,"CRM Test Full: Kontakt z salonem / Skrzynka…");
        const contact=await crmE2EAdminPost({action:"crmE2ECreateRequest",marker,requestType:"CONTACT_FORM",phone:`TEST-${marker}-CONTACT`,name:`${marker} CONTACT`,message:`${marker} kontakt ogólny`});
        crmE2EAssert(report,contact?.success===true,"Utworzenie testowego kontaktu",contact,contact);
        inbox=await crmE2EInbox();
        item=Array.isArray(inbox?.items)?inbox.items.find(x=>String(x.id)===String(contact.requestId)):null;
        crmE2EAssert(report,Boolean(item)&&item.type==="CONTACT_FORM","Kontakt pojawia się w jednej Skrzynce",item,inbox);
        r=await crmE2EAdminPost({action:"markAdminInboxRead",inboxType:"CONTACT_FORM",requestId:contact.requestId});
        crmE2EAssert(report,r?.success===true,"Kontakt: oznacz jako przeczytane",r,r);
        r=await crmE2EAdminPost({action:"decideContactFormRequest",requestId:contact.requestId,decision:"DONE",note:marker});
        crmE2EAssert(report,r?.success===true&&r?.status==="OBSŁUŻONE","Kontakt: Obsłużone",r,r);
        inbox=await crmE2EInbox();
        const handledContact=Array.isArray(inbox?.items)?inbox.items.find(x=>String(x.id)===String(contact.requestId)):null;
        crmE2EAssert(report,Boolean(handledContact)&&String(handledContact.readState).toUpperCase().includes("OBS"),"Obsłużony wpis pozostaje widoczny w Skrzynce przez okno 2 h",handledContact,inbox);

        // 18. Settings write path without changing value
        crmE2EStage(16,"CRM Test Full: Ustawienia i odczyty końcowe…");
        const busySettings=await crmE2EAdminGet({checkBusy:"true",rangeStart:crmE2EIsoDay(adminSlots[0].iso),rangeEnd:crmE2EIsoDay(adminSlots[0].iso)},50000);
        const s=busySettings?.settings||{};
        const samePayload={};
        ["work_start_hour","work_end_hour","buffer_hours","slot_interval_minutes","start_offset_minutes","cleanup_buffer_minutes"].forEach(k=>{if(s[k]!==undefined)samePayload[k]=s[k];});
        r=await crmE2EAdminPost({action:"updateSettings",payload:samePayload});
        crmE2EAssert(report,r?.success===true,"Zapis Ustawień bez zmiany wartości",samePayload,r);
        crmE2EPass(report,"Cenniki DOM i Booksy: test bezpieczny nie wykonuje publikacji","Odczyty i stany UI są sprawdzone; automatyczny E2E celowo nie publikuje ani nie nadpisuje cenników.");

        // 19. Before cleanup inspect
        const inspectBefore=await crmE2EInspect(marker);
        crmE2EAssert(report,inspectBefore?.success===true&&Number(inspectBefore.totalRows)>0,"Inspekcja danych utworzonych przez test",{rows:inspectBefore?.totalRows,calendarEvents:inspectBefore?.calendarEventCount},inspectBefore);

    }catch(error){
        crmE2EFail(report,"Główny przebieg CRM Test Full",error?.message||String(error));
    }finally{
        crmE2EStage(17,"CRM Test Full: bezwarunkowe sprzątanie danych testowych…");
        try{
            cleanupAttempted=true;
            const cleaned=await crmE2ECleanup(marker);
            crmE2EAssert(report,cleaned?.success===true,"Cleanup danych CRM Test Full",cleaned,cleaned);
        }catch(error){
            crmE2EFail(report,"Cleanup danych CRM Test Full",error?.message||String(error));
        }

        try{
            await crmE2EWait(500);
            const leftovers=await crmE2EInspect(marker);
            const clean=leftovers?.success===true&&Number(leftovers.totalRows||0)===0&&Number(leftovers.calendarEventCount||0)===0;
            crmE2EAssert(report,clean,"Pozostałości po teście: 0",clean?"0":{rows:leftovers?.totalRows,calendarEvents:leftovers?.calendarEventCount,sheets:leftovers?.sheets},leftovers);
        }catch(error){
            crmE2EFail(report,"Kontrola pozostałości po cleanup",error?.message||String(error));
        }

        const dialogs=dialogSpy.calls.slice();
        dialogSpy.restore();
        const dialogSummary=dialogs.reduce((acc,x)=>{acc[x.type]=(acc[x.type]||0)+1;return acc;},{});
        crmE2EAdd(report,dialogs.length?"OSTRZEZENIE":"OK","Blokujące dialogi wywołane podczas CRM Test Full",dialogs.length?{counts:dialogSummary,samples:dialogs.slice(0,10)}:"0");

        try{
            if(savedView&&typeof setCalendarView==="function") setCalendarView(savedView);
            if(savedDate&&typeof selectedCalendarDate!=="undefined") selectedCalendarDate=new Date(savedDate);
            if(typeof switchTab==="function") await switchTab(savedTab||"kalendarz");
        }catch(error){console.warn("CRM Test Full: nie udało się przywrócić widoku",error);}

        crmTestFinish(report,started);
        crmE2EStage(18,"CRM Test Full: zapis raportu…");
        try{
            await saveCRMTestReport(report);
            crmE2EPass(report,"Raport CRM Test Full zapisany w Testy CRM","OK");
        }catch(error){
            crmE2EWarn(report,"Zapis raportu CRM Test Full do Google Sheets",error?.message||String(error));
        }
        crmTestFinish(report,started);
        crmE2EStage(19,`CRM Test Full zakończony: ${report.status}.`);
        window.crmDiagnosticsNetworkModeV11=false;
        crmTestSetRunning(false);
        window.crmTestFullRunning=false;

        try{
            if(typeof crmRunInboxPingV5==="function") window.setTimeout(()=>crmRunInboxPingV5({force:true}).catch(()=>{}),800);
        }catch(ignore){}
    }
}
window.runCRMTestFull=runCRMTestFull;
