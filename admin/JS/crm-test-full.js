/* ==========================================================================
   CRM TEST FULL
   Stały pełny test regresyjny.
   Zmieniamy go tylko wtedy, gdy do CRM dochodzi nowa stała funkcjonalność.

   UWAGA:
   Marker danych testowych nadal ma techniczny prefiks CRM_E2E_ ponieważ
   backend cleanup V1 celowo akceptuje tylko taki bezpieczny wzorzec.
   ========================================================================== */

/* ==========================================================================
   CRM TEST FULL V1 2026-08-16
   Stały pełny test regresyjny CRM.
   - wykonuje testy kolejno, bez lawiny requestów,
   - tworzy wyłącznie dane oznaczone unikalnym CRM_E2E_...,
   - w finally zawsze uruchamia sprzątanie,
   - nie publikuje ani nie nadpisuje Cennika produkcyjnego,
   - nie zmienia ustawień na inne wartości (zapisuje bieżące wartości).
   ========================================================================== */
const CRM_TEST_FULL_VERSION = "1.0.0";
const CRM_E2E_INDEX_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbz__JS6RJOB8VwEvbmXc4J_22k3bpBLr-oCiogTIhzz3sXc5DzXfbggnfa8VhInwuWP2g/exec";

function crmE2EWait(ms){ return new Promise(resolve=>window.setTimeout(resolve,ms)); }
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
async function crmE2EIndexPost(payload,timeoutMs=50000){
    const controller=typeof AbortController!=="undefined"?new AbortController():null;
    let timer=null;
    try{
        const whole=(async()=>{
            const response=await fetch(CRM_E2E_INDEX_WEB_APP_URL,{
                method:"POST",
                headers:{"Content-Type":"text/plain"},
                body:JSON.stringify(Object.assign({},payload,{diagnosticTest:true})),
                signal:controller?controller.signal:undefined
            });
            const text=await response.text();
            if(!response.ok) throw new Error(`INDEX HTTP ${response.status}: ${text.slice(0,500)}`);
            try{return JSON.parse(text);}catch(error){throw new Error("INDEX nie zwrócił JSON: "+text.slice(0,500));}
        })();
        const deadline=new Promise((_,reject)=>{
            timer=window.setTimeout(()=>{
                try{controller?.abort();}catch(ignore){}
                reject(new Error(`INDEX nie odpowiedział w ciągu ${Math.round(timeoutMs/1000)} s.`));
            },timeoutMs);
        });
        return await Promise.race([whole,deadline]);
    }finally{ if(timer)window.clearTimeout(timer); }
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

async function runCRMTestFull(){
    if(window.crmTestFullRunning || crmTestIsRunning){
        if(typeof crmToast==="function") crmToast("Test CRM jest już uruchomiony.","error");
        return;
    }

    window.crmTestFullRunning=true;
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
    report.testData={marker,indexWebApp:CRM_E2E_INDEX_WEB_APP_URL};

    let cleanupAttempted=false;
    try{
        crmTestSetProgress(2,"CRM Test Full: przygotowanie i pre-cleanup…");
        const preCleanup=await crmE2ECleanup(marker);
        crmE2EAssert(report,preCleanup?.success===true,"Pre-cleanup markera testowego",preCleanup,preCleanup);

        // 1. UI / layout
        crmTestSetProgress(6,"CRM Test Full: kontrola interfejsu…");
        const required=["admin-panel-wrapper","tab-kalendarz","booksy-grid","appointmentModal","appointmentDetailsModal","clientModal","serviceModal","blockTimeModal","crm-diagnostics-panel"];
        required.forEach(id=>crmE2EAssert(report,Boolean(document.getElementById(id)),`HTML #${id}`,"Znaleziono","Brak elementu"));
        if(savedTab!=="kalendarz") await switchTab("kalendarz");
        if(typeof setCalendarView==="function") setCalendarView("month");
        await crmE2EWait(80);
        crmE2ETestGeometry(report);
        crmE2ETestBlockingAppointmentModal(report);
        await crmE2ETestTabReturn(report,savedTab);
        if(typeof switchTab==="function") await switchTab("kalendarz");

        // 2. Network baseline
        crmTestSetProgress(10,"CRM Test Full: transport ADMIN i podstawowe dane…");
        const probe=await crmE2EAdminGet({serverProbe:"true"},35000);
        crmE2EAssert(report,probe?.success===true,"ADMIN serverProbe",probe,probe);
        const prices=await crmE2EAdminGet({getPrices:"true"},40000);
        crmE2EAssert(report,Array.isArray(prices)&&prices.length>0,"Odczyt Cennika",{count:Array.isArray(prices)?prices.length:0},prices);
        const svc=Array.isArray(prices)?prices.find(x=>x&&x.name):null;
        ctx.serviceName=String(svc?.name||"Test E2E");
        ctx.duration=Math.max(5,Math.min(30,Number(svc?.duration)||15));
        const clients0=await crmE2EAdminGet({getClients:"true"},40000);
        crmE2EAssert(report,Array.isArray(clients0),"Odczyt Klientów",{count:Array.isArray(clients0)?clients0.length:0},clients0);
        const ping0=await crmE2EPing();
        crmE2EAssert(report,ping0?.success===true,"Lekki ping Skrzynki",ping0,ping0);
        const inbox0=await crmE2EInbox();
        crmE2EAssert(report,inbox0?.success===true&&Array.isArray(inbox0.items),"Pełny odczyt Skrzynki",{count:inbox0?.items?.length||0},inbox0);

        // 3. Free safe slots
        crmTestSetProgress(14,"CRM Test Full: szukanie bezpiecznych wolnych terminów…");
        const free=await crmE2EAdminPost({action:"crmE2EFindFreeSlots",marker,duration:ctx.duration},60000);
        ctx.slots=free;
        const adminSlots=Array.isArray(free?.adminSlots)?free.adminSlots:[];
        const indexSlots=Array.isArray(free?.indexSlots)?free.indexSlots:[];
        crmE2EAssert(report,free?.success===true&&adminSlots.length>=22,"Wolne terminy ADMIN do testu",{count:adminSlots.length},free);
        crmE2EAssert(report,indexSlots.length>=5,"Wolne terminy INDEX do testu",{count:indexSlots.length},free);
        if(adminSlots.length<22||indexSlots.length<5) throw new Error("Za mało wolnych terminów do bezpiecznego E2E");

        // 4. Client CRUD and profile
        crmTestSetProgress(18,"CRM Test Full: klient — dodanie, edycja, profil i tryb…");
        const clientPhone=`TEST-${marker}-CLIENT`;
        const clientName=`${marker} KLIENT`;
        const clientEdited=`${marker} KLIENT EDYCJA`;
        let r=await crmE2EAdminPost({action:"saveClient",oldPhone:"",client:{name:clientName,phone:clientPhone,visits:0,cancelled:0,lastVisit:""}});
        crmE2EAssert(report,r?.success===true,"Dodanie klienta",r,r);
        let clients=await crmE2EAdminGet({getClients:"true"});
        crmE2EAssert(report,Array.isArray(clients)&&clients.some(x=>String(x.phone)===clientPhone),"Klient widoczny po zapisie",clientPhone,clients);
        r=await crmE2EAdminPost({action:"saveClient",oldPhone:clientPhone,client:{name:clientEdited,phone:clientPhone,visits:0,cancelled:0,lastVisit:""}});
        crmE2EAssert(report,r?.success===true,"Edycja klienta",r,r);
        r=await crmE2EAdminPost({action:"getClientCRMProfile",phone:clientPhone});
        crmE2EAssert(report,r?.success===true&&r.profile,"Profil CRM klienta",r?.profile,r);
        r=await crmE2EAdminPost({action:"setClientBookingMode",phone:clientPhone,mode:"STANDARDOWY",reason:marker,changedBy:"E2E"});
        crmE2EAssert(report,r?.success===true&&r.mode==="STANDARDOWY","Zapis trybu rezerwacji klienta",r,r);
        r=await crmE2EAdminPost({action:"deleteClient",phone:clientPhone});
        crmE2EAssert(report,r?.success===true,"Usunięcie klienta",r,r);
        clients=await crmE2EAdminGet({getClients:"true"});
        crmE2EAssert(report,Array.isArray(clients)&&!clients.some(x=>String(x.phone)===clientPhone),"Klient znika po usunięciu","Nie znaleziono — OK",clients);

        // 5. Live INDEX direct booking
        crmTestSetProgress(23,"CRM Test Full: prawdziwa rezerwacja przez INDEX…");
        const idxDirect=indexSlots[0].iso;
        const idxPhone=`TEST-${marker}-INDEX`;
        const idxName=`${marker} INDEX DIRECT`;
        const idxCreate=await crmE2EIndexPost({action:"createBooking",phone:idxPhone,name:idxName,service:ctx.serviceName,date:idxDirect,duration:ctx.duration,rodo:"Tak",bookingSource:"INDEX"});
        crmE2EAssert(report,idxCreate?.success===true,"INDEX: bezpośrednie utworzenie wizyty",idxCreate,idxCreate);
        let busy=await crmE2EBusyAround(idxDirect);
        let idxApp=crmE2EFindAppointment(busy,x=>String(x.phone)===idxPhone||String(x.eventId)===String(idxCreate?.eventId||""));
        crmE2EAssert(report,Boolean(idxApp),"ADMIN widzi wizytę utworzoną przez INDEX",idxApp,"Nie znaleziono");
        crmE2EAssert(report,String(idxApp?.bookingSource||"").toUpperCase()==="INDEX","Źródło wizyty INDEX zapisane poprawnie",idxApp?.bookingSource,idxApp);
        if(idxCreate?.eventId){
            r=await crmE2EAdminPost({action:"createBooking",deleteFlag:true,eventId:idxCreate.eventId,date:idxDirect,name:idxName});
            crmE2EAssert(report,r?.success===true,"Usunięcie testowej wizyty INDEX",r,r);
        }

        // 6. ADMIN booking + idempotency + edit + hard delete
        crmTestSetProgress(29,"CRM Test Full: wizyta ADMIN — zapis, idempotencja i edycja…");
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
            r=await crmE2EAdminPost({action:"createBooking",deleteFlag:true,eventId:edit.eventId,date:adminSlots[2].iso,name:a1.payload.name});
            crmE2EAssert(report,r?.success===true,"Twarde usunięcie wizyty ADMIN",r,r);
        }

        // 7. Lifecycle: cancel with event present
        crmTestSetProgress(35,"CRM Test Full: anulowanie i trwałość statusów…");
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
        crmTestSetProgress(42,"CRM Test Full: blokady czasu…");
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
        crmTestSetProgress(47,"CRM Test Full: ochrona zewnętrznego Google Calendar…");
        const external=await crmE2EAdminPost({action:"crmE2ECreateExternalEvent",marker,start:adminSlots[14].iso,duration:ctx.duration},60000);
        crmE2EAssert(report,external?.success===true&&external?.eventId,"Utworzenie zewnętrznego wydarzenia testowego",external,external);
        busy=await crmE2EBusyAround(adminSlots[14].iso);
        crmE2EAssert(report,Boolean(crmE2EFindAppointment(busy,x=>String(x.eventId)===String(external.eventId))),"Zewnętrzne wydarzenie jest widoczne jako zajętość",external.eventId,busy);
        r=await crmE2EAdminPost({action:"deleteBlockTime",eventId:external.eventId,start:adminSlots[14].iso,end:crmE2EPlusMinutes(adminSlots[14].iso,ctx.duration),title:`${marker} EXTERNAL`},60000);
        crmE2EAssert(report,r?.success===false,"deleteBlockTime odmawia usunięcia zwykłego Google Event",r,{problem:"Zewnętrzne wydarzenie zostało potraktowane jak blokada",result:r});

        // 12. Live STANDARD request from INDEX -> inbox -> read -> MAIN
        crmTestSetProgress(53,"CRM Test Full: prośba STANDARD z INDEX i Skrzynka…");
        const stdPhone=`TEST-${marker}-STD`;
        const stdName=`${marker} STANDARD LIVE`;
        const stdReq=await crmE2EIndexPost({action:"createBookingRequest",phone:stdPhone,name:stdName,service:ctx.serviceName,date:indexSlots[1].iso,alternativeDate:indexSlots[3].iso,duration:ctx.duration,rodo:"Tak",confirmationReason:marker});
        crmE2EAssert(report,stdReq?.success===true&&stdReq?.requestId,"INDEX: utworzenie prośby STANDARD",stdReq,stdReq);
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
        crmTestSetProgress(60,"CRM Test Full: alternatywa i odrzucenie prośby…");
        const altReq=await crmE2EAdminPost({action:"crmE2ECreateRequest",marker,requestType:"STANDARD",phone:`TEST-${marker}-ALT`,name:`${marker} STANDARD ALT`,service:ctx.serviceName,duration:ctx.duration,main:adminSlots[16].iso,alternative:adminSlots[17].iso});
        crmE2EAssert(report,altReq?.success===true,"Przygotowanie prośby do wyboru ALT",altReq,altReq);
        r=await crmE2EAdminPost({action:"decideBookingRequest",requestId:altReq.requestId,choice:"ALT"},60000);
        crmE2EAssert(report,r?.success===true&&r?.status==="POTWIERDZONA","Potwierdzenie terminu alternatywnego",r,r);
        const rejectReq=await crmE2EAdminPost({action:"crmE2ECreateRequest",marker,requestType:"STANDARD",phone:`TEST-${marker}-REJ`,name:`${marker} STANDARD REJECT`,service:ctx.serviceName,duration:ctx.duration,main:adminSlots[18].iso,alternative:adminSlots[19].iso});
        crmE2EAssert(report,rejectReq?.success===true,"Przygotowanie prośby do odrzucenia",rejectReq,rejectReq);
        r=await crmE2EAdminPost({action:"decideBookingRequest",requestId:rejectReq.requestId,choice:"REJECT"},60000);
        crmE2EAssert(report,r?.success===true&&r?.status==="ODRZUCONA","Odrzucenie prośby STANDARD",r,r);

        // 14. FIRST VISIT live INDEX -> inbox fields -> nonblocking -> booking -> client source
        crmTestSetProgress(67,"CRM Test Full: pierwsza wizyta z INDEX…");
        const fvPhone=`TEST-${marker}-FV`;
        const fvName=`${marker} FIRST VISIT`;
        const fvProposal=adminSlots[20];
        const fvReq=await crmE2EIndexPost({
            action:"createFirstVisitRequest",phone:fvPhone,name:fvName,email:`e2e.${Date.now()}@example.com`,
            service:ctx.serviceName,duration:ctx.duration,proposals:[{date:fvProposal.date,times:[fvProposal.time]}],
            contactConsent:true,rodo:true,message:`${marker} wiadomość E2E`
        },60000);
        crmE2EAssert(report,fvReq?.success===true&&fvReq?.requestId,"INDEX: utworzenie FIRST_VISIT",fvReq,fvReq);
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
        const inspectFV=await crmE2EInspect(marker);
        const clientRows=inspectFV?.sheets?.["Klienci"]?.rows||[];
        const fvClient=clientRows.find(row=>Array.isArray(row.values)&&String(row.values[0])===fvPhone);
        crmE2EAssert(report,Boolean(fvClient)&&String(fvClient.values[6]||"")==="PIERWSZA_WIZYTA_ONLINE","Nowy klient ma źródło PIERWSZA_WIZYTA_ONLINE",fvClient,clientRows);

        // 15. FIRST_VISIT handled without booking
        const fvNoBook=await crmE2EAdminPost({action:"crmE2ECreateRequest",marker,requestType:"FIRST_VISIT",phone:`TEST-${marker}-FV-NOBOOK`,name:`${marker} FIRST NOBOOK`,service:ctx.serviceName,duration:ctx.duration,email:`nobook.${Date.now()}@example.com`,proposals:[{date:adminSlots[21].date,times:[adminSlots[21].time]}],message:`${marker} bez wizyty`});
        crmE2EAssert(report,fvNoBook?.success===true,"Przygotowanie FIRST_VISIT bez wizyty",fvNoBook,fvNoBook);
        r=await crmE2EAdminPost({action:"decideBookingRequest",requestId:fvNoBook.requestId,choice:"REJECT"});
        crmE2EAssert(report,r?.success===true&&r?.status==="ODRZUCONA","FIRST_VISIT: Obsłużone bez wizyty / odrzucone",r,r);

        // 16. Generic contact inbox flow
        crmTestSetProgress(76,"CRM Test Full: Kontakt z salonem / Skrzynka…");
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

        // 17. Settings write path without changing value
        crmTestSetProgress(81,"CRM Test Full: Ustawienia i odczyty końcowe…");
        const busySettings=await crmE2EAdminGet({checkBusy:"true",rangeStart:crmE2EIsoDay(adminSlots[0].iso),rangeEnd:crmE2EIsoDay(adminSlots[0].iso)},50000);
        const s=busySettings?.settings||{};
        const samePayload={};
        ["work_start_hour","work_end_hour","buffer_hours","slot_interval_minutes","start_offset_minutes","cleanup_buffer_minutes"].forEach(k=>{if(s[k]!==undefined)samePayload[k]=s[k];});
        r=await crmE2EAdminPost({action:"updateSettings",payload:samePayload});
        crmE2EAssert(report,r?.success===true,"Zapis Ustawień bez zmiany wartości",samePayload,r);
        crmE2EWarn(report,"Cennik: zapis/publikacja produkcyjna pominięta","Tester sprawdza odczyt Cennika, ale celowo nie nadpisuje Szkicu ani opublikowanej oferty podczas automatycznego E2E.");

        // 18. Before cleanup inspect
        const inspectBefore=await crmE2EInspect(marker);
        crmE2EAssert(report,inspectBefore?.success===true&&Number(inspectBefore.totalRows)>0,"Inspekcja danych utworzonych przez test",{rows:inspectBefore?.totalRows,calendarEvents:inspectBefore?.calendarEventCount},inspectBefore);

    }catch(error){
        crmE2EFail(report,"Główny przebieg CRM Test Full",error?.message||String(error));
    }finally{
        crmTestSetProgress(90,"CRM Test Full: bezwarunkowe sprzątanie danych testowych…");
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
        crmTestSetProgress(96,"CRM Test Full: zapis raportu…");
        try{
            await saveCRMTestReport(report);
            crmE2EPass(report,"Raport CRM Test Full zapisany w Testy CRM","OK");
        }catch(error){
            crmE2EWarn(report,"Zapis raportu CRM Test Full do Google Sheets",error?.message||String(error));
        }
        crmTestFinish(report,started);
        crmTestSetProgress(100,`CRM Test Full zakończony: ${report.status}. Marker ${marker}.`);
        window.crmDiagnosticsNetworkModeV11=false;
        crmTestSetRunning(false);
        window.crmTestFullRunning=false;

        try{
            if(typeof crmRunInboxPingV5==="function") window.setTimeout(()=>crmRunInboxPingV5({force:true}).catch(()=>{}),800);
        }catch(ignore){}
    }
}
window.runCRMTestFull=runCRMTestFull;
