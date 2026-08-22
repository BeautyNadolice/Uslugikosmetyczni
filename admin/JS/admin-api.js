/* ==========================================================================
   API. KOMUNIKACJA Z GOOGLE APPS SCRIPT
   Plik wygenerowany zachowawczo z admin.js. Kolejnosc elementow wewnatrz
   modulu odpowiada kolejnosci w monolicie. Nie zmieniac nazw globalnych.
   ========================================================================== */

/* ----- API.1. APPS_SCRIPT_URL (oryginalna linia 12) ----- */
/* ==========================================================
   NAIL-ART DARIA CRM V2
   ADMIN.JS
   CORE
   ========================================================== */


/* ==========================================================
   CONFIG
   ========================================================== */

const APPS_SCRIPT_URL =
"https://script.google.com/macros/s/AKfycbzrx1vRCQpx45lPEnPvF-LJpkpAiLqPmME60VIq2A0_YDF4figLOF2uO8griaC6ijYpOQ/exec";


/* ==========================================================================
   API TRANSPORT V10 2026-08-12
   Stabilny GET do Apps Script przez JSONP.
   Omija CORS/redirect i ma prawdziwy timeout całej odpowiedzi.
   ========================================================================== */
let crmJsonpCounterV10 = 0;

function crmJsonpGetV10(url, timeoutMs = 7000) {
    return new Promise((resolve, reject) => {
        const callbackName =
            `crmJsonpV10_${Date.now()}_${++crmJsonpCounterV10}_${Math.random().toString(36).slice(2,7)}`;

        const separator = url.includes("?") ? "&" : "?";
        const script = document.createElement("script");
        let settled = false;

        const cleanup = () => {
            if (script.parentNode) script.parentNode.removeChild(script);
            try { delete window[callbackName]; } catch (ignore) { window[callbackName] = undefined; }
            if (timer) window.clearTimeout(timer);
        };

        window[callbackName] = data => {
            if (settled) return;
            settled = true;
            cleanup();
            resolve(data);
        };

        const timer = window.setTimeout(() => {
            if (settled) return;
            settled = true;
            cleanup();
            reject(new Error("Serwer nie odpowiedział w wyznaczonym czasie."));
        }, Math.max(2500, Number(timeoutMs) || 7000));

        script.onerror = () => {
            if (settled) return;
            settled = true;
            cleanup();
            reject(new Error("Nie udało się połączyć z serwerem Google."));
        };

        script.async = true;
        script.src =
            `${url}${separator}callback=${encodeURIComponent(callbackName)}&_jsonp=${Date.now()}`;

        document.head.appendChild(script);
    });
}

window.crmJsonpGetV10 = crmJsonpGetV10;
/* KONIEC API TRANSPORT V10 */

/* ----- API.2. loadSystem (oryginalna linia 3203) ----- */
/* ==========================================================
   LOAD SYSTEM EXTENSION
   ========================================================== */
async function loadSystemLegacy() {
    await loadServices();
    await loadSettings();
    await loadClients();
    renderDashboard();
    calculateFinanceReport();
    buildColorsEditor();
}

/* ----- API.3. crmExtendedPost (oryginalna linia 3625) ----- */
async function crmExtendedPost(action, payload) {
    return crmTestPost(Object.assign({ action: action }, payload || {}));
}

/* ----- API.4. crmTestPost (oryginalna linia 4889) ----- */
async function crmTestPost(payload, options = {}) {
    const action = String(payload?.action || "");
    const quickReadActions = new Set([
        "getAdminInbox",
        "getContactFormRequests",
        "getBookingRequests"
    ]);
    const defaultTimeoutMs = quickReadActions.has(action) ? 12000 : 30000;
    const timeoutMs = Math.max(3000, Number(options.timeoutMs) || defaultTimeoutMs);
    const controller = typeof AbortController !== "undefined" ? new AbortController() : null;
    const timer = controller
        ? window.setTimeout(() => controller.abort(), timeoutMs)
        : null;

    try {
        const response = await fetch(APPS_SCRIPT_URL, {
            method: "POST",
            headers: { "Content-Type": "text/plain" },
            body: JSON.stringify(payload),
            signal: controller ? controller.signal : undefined
        });

        const text = await response.text();
        if (!response.ok) throw new Error("HTTP " + response.status + ": " + text);

        try {
            return JSON.parse(text);
        } catch (error) {
            throw new Error("API nie zwrocilo JSON: " + text.substring(0, 500));
        }
    } catch (error) {
        if (error && error.name === "AbortError") {
            throw new Error("Serwer ADMIN nie odpowiedzial w ciagu " + Math.round(timeoutMs / 1000) + " s. Operacja mogla nadal zakonczyc sie po stronie Google.");
        }
        throw error;
    } finally {
        if (timer) window.clearTimeout(timer);
    }
}

/* ----- API.5. crmPost: zgodny punkt wejscia dla starszych modulow ----- */
async function crmPost(payload) {
    const result = await crmTestPost(payload || {});
    if (!result || typeof result !== "object") {
        throw new Error("API zwrocilo nieprawidlowa odpowiedz");
    }
    return result;
}

/* ==========================================================================
   API RELIABILITY V2 2026-08-12
   Kolejnosc startu, retry 1/5 i lekkie sprawdzanie zmian.
   ========================================================================== */
let crmInitialBootPromiseV2 = null;
let crmSystemBootCompleteV2 = false;
let crmRemoteStateV2 = null;
let crmRemoteStateBusyV2 = null;
window.crmSystemBootCompleteV2 = false;
window.crmRemoteStateV2 = null;
window.crmBootInProgressV2 = false;

function crmSleepV2(ms) {
    return new Promise(resolve => window.setTimeout(resolve, ms));
}

async function crmFetchJsonRetryV2(url, options = {}) {
    const label = options.label || "Dane";
    const attempts = Math.max(1, Number(options.attempts) || 5);
    const timeoutMs = Math.max(3000, Number(options.timeoutMs) || 12000);
    const delays = [0, 900, 1800, 3500, 6000];

    let lastError = null;

    for (let attempt = 1; attempt <= attempts; attempt += 1) {
        if (attempt > 1) {
            if (typeof crmSetBackgroundTaskStatus === "function" && options.quietStatus !== true) {
                crmSetBackgroundTaskStatus(
                    "sync",
                    "retry",
                    `${label}: problem z ładowaniem · próba ${attempt}/${attempts}`
                );
            }
            await crmSleepV2(delays[Math.min(attempt - 1, delays.length - 1)]);
        } else if (typeof crmSetBackgroundTaskStatus === "function" && options.quietStatus !== true) {
            crmSetBackgroundTaskStatus(
                "sync",
                "loading",
                `${label}: ładowanie · próba 1/${attempts}`
            );
        }

        const controller =
            typeof AbortController !== "undefined" ? new AbortController() : null;

        let timer = null;

        try {
            /*
             * WAŻNE V10:
             * timeout obejmuje fetch + pobranie CAŁEGO body.
             * V9 kończył timeout po nagłówkach i response.json() mogło wisieć bez końca.
             */
            const wholeRequest = (async () => {
                const response = await fetch(url, {
                    method: options.method || "GET",
                    cache: "no-store",
                    signal: controller ? controller.signal : undefined,
                    headers: options.headers,
                    body: options.body
                });

                const text = await response.text();

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${text.substring(0,300)}`);
                }

                let data;
                try {
                    data = JSON.parse(text);
                } catch (parseError) {
                    throw new Error(
                        `${label}: serwer zwrócił nieprawidłową odpowiedź`
                    );
                }

                if (options.validate && !options.validate(data)) {
                    throw new Error(
                        options.invalidMessage || "Nieprawidłowa odpowiedź serwera"
                    );
                }

                return data;
            })();

            const deadline = new Promise((_, reject) => {
                timer = window.setTimeout(() => {
                    try { controller?.abort(); } catch (ignore) {}
                    reject(new Error(`${label}: przekroczono czas oczekiwania`));
                }, timeoutMs);
            });

            return await Promise.race([wholeRequest, deadline]);
        } catch (error) {
            lastError = error;
        } finally {
            if (timer) window.clearTimeout(timer);
        }
    }

    throw lastError || new Error(`${label}: nie udało się pobrać danych`);
}

async function crmLoadCalendarPrimaryV2() {
    const data = await crmFetchJsonRetryV2(
        `${APPS_SCRIPT_URL}?checkBusy=true&_boot=${Date.now()}`,
        {
            label: "Kalendarz",
            attempts: 5,
            timeoutMs: 14000,
            validate: value => value && Array.isArray(value.appointments)
        }
    );

    settingsData = data.settings || {};
    appointmentsData = data.appointments || [];

    globalColors = {};
    if (settingsData.colors) {
        Object.keys(settingsData.colors).forEach(key => {
            globalColors[key] = settingsData.colors[key];
        });
    }
    allCategories = settingsData.all_categories || [];

    if (typeof populateSettingsForm === "function") populateSettingsForm();
    if (typeof renderMiniMonthCalendar === "function") renderMiniMonthCalendar();
    if (typeof renderBooksyCalendar === "function") renderBooksyCalendar();
    if (typeof crmRenderCalendarInsights === "function") crmRenderCalendarInsights();

    return data;
}

async function crmLoadServicesPrimaryV2() {
    const data = await crmFetchJsonRetryV2(
        `${APPS_SCRIPT_URL}?getPrices=true&_boot=${Date.now()}`,
        {
            label: "Usługi i kolory",
            attempts: 5,
            timeoutMs: 12000,
            validate: Array.isArray
        }
    );

    currentServices = data;
    if (typeof renderServicesTable === "function") renderServicesTable();
    if (typeof renderBooksyCalendar === "function") renderBooksyCalendar();
    return data;
}

async function crmLoadClientsPrimaryV2() {
    const data = await crmFetchJsonRetryV2(
        `${APPS_SCRIPT_URL}?getClients=true&_boot=${Date.now()}`,
        {
            label: "Klienci",
            attempts: 5,
            timeoutMs: 12000,
            validate: Array.isArray
        }
    );

    customersData = data;
    if (typeof renderClients === "function") renderClients();
    return data;
}

async function crmFetchRemoteStateV2() {
    if (crmRemoteStateBusyV2) return crmRemoteStateBusyV2;

    crmRemoteStateBusyV2 = (async () => {
        let lastError = null;

        for (let attempt = 1; attempt <= 2; attempt += 1) {
            try {
                const data = await crmJsonpGetV10(
                    `${APPS_SCRIPT_URL}?adminState=true&_state=${Date.now()}_${attempt}`,
                    5500
                );

                if (!data || data.success !== true) {
                    throw new Error(data?.error || "Nieprawidłowy stan danych");
                }

                return data;
            } catch (error) {
                lastError = error;
                if (attempt < 2) await crmSleepV2(700);
            }
        }

        throw lastError || new Error("Nie udało się sprawdzić stanu danych");
    })().finally(() => {
        crmRemoteStateBusyV2 = null;
    });

    return crmRemoteStateBusyV2;
}
async function crmCaptureRemoteStateV2() {
    try {
        crmRemoteStateV2 = await crmFetchRemoteStateV2();
        window.crmRemoteStateV2 = crmRemoteStateV2;
    } catch (error) {
        console.warn("Nie udało się pobrać stanu danych:", error);
    }
    return crmRemoteStateV2;
}

async function loadSystem() {
    if (crmInitialBootPromiseV2) return crmInitialBootPromiseV2;

    crmInitialBootPromiseV2 = (async () => {
        crmSystemBootCompleteV2 = false;
        window.crmSystemBootCompleteV2 = false;
        window.crmBootInProgressV2 = true;

        // Kalendarz ma być widoczny od razu, zanim skończy się cały start.
        try {
            if (typeof switchTab === "function") switchTab("kalendarz");
        } catch (error) {
            console.warn("Start Kalendarza:", error);
        }

        // 1. Najpierw dane kalendarza.
        try {
            await crmLoadCalendarPrimaryV2();
        } catch (error) {
            console.error(error);
            if (typeof crmSetBackgroundTaskStatus === "function") {
                crmSetBackgroundTaskStatus(
                    "sync",
                    "error",
                    "Kalendarz: nie udało się pobrać danych. Kliknij, aby spróbować ponownie.",
                    { onClick: () => loadSystem(true) }
                );
            }
        }

        // 2. Następnie dane potrzebne do poprawnego wyglądu kalendarza.
        try {
            await crmLoadServicesPrimaryV2();
        } catch (error) {
            console.error(error);
        }

        // 3. Skrzynka — tylko lekki odczyt/ping, nie blokuje pozostałych danych.
        try {
            if (typeof crmRunInboxPingV5 === "function") {
                await crmRunInboxPingV5();
            }
        } catch (error) {
            console.warn("Skrzynka start:", error);
        }

        // 4. Dopiero później klienci i reszta panelu.
        try {
            await crmLoadClientsPrimaryV2();
        } catch (error) {
            console.error(error);
        }

        try {
            if (typeof renderDashboard === "function") renderDashboard();
            if (typeof calculateFinanceReport === "function") calculateFinanceReport();
            if (typeof buildColorsEditor === "function") buildColorsEditor();
        } catch (error) {
            console.error("Render końcowy:", error);
        }

        crmSystemBootCompleteV2 = true;
        window.crmSystemBootCompleteV2 = true;
        window.crmBootInProgressV2 = false;
        if (typeof crmSetBackgroundTaskStatus === "function") {
            crmSetBackgroundTaskStatus("sync", "success", "Dane gotowe");
        }

        // Kontrola zmian nie blokuje już startu ADMIN.
        window.setTimeout(() => {
            crmCaptureRemoteStateV2().catch?.(() => {});
        }, 1800);

        return true;
    })().finally(() => {
        window.crmBootInProgressV2 = false;
        window.setTimeout(() => {
            crmInitialBootPromiseV2 = null;
        }, 300);
    });

    return crmInitialBootPromiseV2;
}

/* Wymuszone ponowienie pełnego startu, używane po błędzie. */
window.crmRestartSystemLoadV2 = async function() {
    crmInitialBootPromiseV2 = null;
    return loadSystem();
};

/* KONIEC API RELIABILITY V2 */

/* ==========================================================================
   API TRANSPORT / KOLEJKA V11 2026-08-12
   Jeden odczyt Apps Script naraz. Brak automatycznych retry po timeout.
   Timeout klienta nie uruchamia od razu kolejnego wykonania po stronie Google.
   ========================================================================== */
const CRM_READ_TIMEOUT_V11 = 30000;
let crmReadQueueV11 = [];
let crmReadActiveV11 = null;
const crmReadByKeyV11 = new Map();

function crmReadKeyV11(url, fallback="GET") {
    try {
        const parsed = new URL(url, window.location.href);
        const params=[];
        parsed.searchParams.forEach((value,key)=>{
            if(key==="callback" || key.startsWith("_")) return;
            params.push(`${key}=${value}`);
        });
        params.sort();
        return params.join("&") || fallback;
    } catch(ignore) {
        return fallback;
    }
}

async function crmFetchWholeJsonV11(url, options={}) {
    const timeoutMs=Math.max(5000,Number(options.timeoutMs)||CRM_READ_TIMEOUT_V11);
    const controller=typeof AbortController!=="undefined"?new AbortController():null;
    let timer=null;
    const started=Date.now();

    try {
        const whole=(async()=>{
            const response=await fetch(url,{
                method:"GET",
                cache:"no-store",
                signal:controller?controller.signal:undefined
            });
            const text=await response.text();
            if(!response.ok) throw new Error(`HTTP ${response.status}: ${text.substring(0,300)}`);
            try { return JSON.parse(text); }
            catch(error){ throw new Error("Serwer ADMIN zwrócił odpowiedź, która nie jest JSON."); }
        })();

        const deadline=new Promise((_,reject)=>{
            timer=window.setTimeout(()=>{
                try{controller?.abort();}catch(ignore){}
                const error=new Error(`Serwer ADMIN nie odpowiedział w ciągu ${Math.round(timeoutMs/1000)} s.`);
                error.crmTimeoutV11=true;
                reject(error);
            },timeoutMs);
        });

        const data=await Promise.race([whole,deadline]);
        return data;
    } finally {
        if(timer) window.clearTimeout(timer);
    }
}

function crmPumpReadQueueV11(){
    if(crmReadActiveV11 || !crmReadQueueV11.length) return;

    crmReadQueueV11.sort((a,b)=>b.priority-a.priority || a.createdAt-b.createdAt);
    const task=crmReadQueueV11.shift();
    crmReadActiveV11=task;

    (async()=>{
        try{
            const data=await crmFetchWholeJsonV11(task.url,{timeoutMs:task.timeoutMs});
            task.resolve(data);
        }catch(error){
            task.reject(error);
            /* Abort w przeglądarce nie zatrzymuje Apps Script.
               Po timeout dajemy serwerowi chwilę zanim ruszy następny odczyt. */
            if(error?.crmTimeoutV11){
                await new Promise(resolve=>window.setTimeout(resolve,5000));
            }
        }finally{
            crmReadByKeyV11.delete(task.key);
            crmReadActiveV11=null;
            crmPumpReadQueueV11();
        }
    })();
}

function crmQueuedGetV11(url, options={}){
    const key=String(options.key||crmReadKeyV11(url,"GET"));
    if(crmReadByKeyV11.has(key)) return crmReadByKeyV11.get(key);

    const promise=new Promise((resolve,reject)=>{
        crmReadQueueV11.push({
            url,
            key,
            priority:Number(options.priority)||0,
            timeoutMs:Math.max(5000,Number(options.timeoutMs)||CRM_READ_TIMEOUT_V11),
            createdAt:Date.now(),
            resolve,
            reject
        });
        crmPumpReadQueueV11();
    });

    crmReadByKeyV11.set(key,promise);
    return promise;
}

window.crmFetchWholeJsonV11=crmFetchWholeJsonV11;
window.crmQueuedGetV11=crmQueuedGetV11;
window.crmReadQueueV11=crmReadQueueV11;

/* V10 JSONP pozostaje tylko jako nazwa zgodnościowa.
   Od V11 NIE tworzymy <script callback=...>, więc nie będzie już
   późnych "callback is not defined". */
crmJsonpGetV10=function(url,timeoutMs){
    return crmQueuedGetV11(url,{
        key:crmReadKeyV11(url,"compat"),
        priority:20,
        timeoutMs:Math.max(25000,Number(timeoutMs)||30000)
    });
};
window.crmJsonpGetV10=crmJsonpGetV10;

crmFetchRemoteStateV2=function(){
    if(crmRemoteStateBusyV2) return crmRemoteStateBusyV2;
    crmRemoteStateBusyV2=crmQueuedGetV11(
        `${APPS_SCRIPT_URL}?adminState=true&_state=${Date.now()}`,
        {key:"adminState",priority:5,timeoutMs:30000}
    ).then(data=>{
        if(!data?.success) throw new Error(data?.error||"Nieprawidłowy stan danych");
        return data;
    }).finally(()=>{crmRemoteStateBusyV2=null;});
    return crmRemoteStateBusyV2;
};

crmLoadCalendarPrimaryV2=async function(){
    const now=new Date();
    const from=new Date(now.getFullYear(),now.getMonth(),1);
    from.setDate(from.getDate()-3);
    const to=new Date(now.getFullYear(),now.getMonth()+1,0);
    to.setDate(to.getDate()+7);
    const fmt=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
    const url=`${APPS_SCRIPT_URL}?checkBusy=true&rangeStart=${encodeURIComponent(fmt(from))}&rangeEnd=${encodeURIComponent(fmt(to))}&_boot=${Date.now()}`;
    const data=await crmQueuedGetV11(url,{key:`calendar:${fmt(from)}:${fmt(to)}`,priority:100,timeoutMs:35000});
    if(!data||!Array.isArray(data.appointments)) throw new Error(data?.error||"Kalendarz nie zwrócił danych");

    settingsData=data.settings||{};
    appointmentsData=data.appointments||[];
    globalColors={};
    if(settingsData.colors) Object.keys(settingsData.colors).forEach(key=>globalColors[key]=settingsData.colors[key]);
    allCategories=settingsData.all_categories||[];
    if(typeof populateSettingsForm==="function")populateSettingsForm();
    if(typeof renderMiniMonthCalendar==="function")renderMiniMonthCalendar();
    if(typeof renderBooksyCalendar==="function")renderBooksyCalendar();
    if(typeof crmRenderCalendarInsights==="function")crmRenderCalendarInsights();
    return data;
};

crmLoadServicesPrimaryV2=async function(){
    const data=await crmQueuedGetV11(`${APPS_SCRIPT_URL}?getPrices=true&_preload=${Date.now()}`,{
        key:"getPrices",priority:15,timeoutMs:30000
    });
    if(!Array.isArray(data)) throw new Error("Cennik nie zwrócił listy usług");
    currentServices=data;
    if(typeof renderServicesTable==="function")renderServicesTable();
    if(typeof renderBooksyCalendar==="function")renderBooksyCalendar();
    return data;
};

crmLoadClientsPrimaryV2=async function(){
    const data=await crmQueuedGetV11(`${APPS_SCRIPT_URL}?getClients=true&_preload=${Date.now()}`,{
        key:"getClients",priority:10,timeoutMs:30000
    });
    if(!Array.isArray(data)) throw new Error("Klienci nie zwrócili listy");
    customersData=data;
    if(typeof renderClients==="function")renderClients();
    return data;
};

/* Start: czekamy wyłącznie na Kalendarz. Reszta doładowuje się później
   w tym samym kolejniku, więc nie blokuje głównego widoku. */
loadSystem=async function(){
    if(crmInitialBootPromiseV2) return crmInitialBootPromiseV2;

    crmInitialBootPromiseV2=(async()=>{
        crmSystemBootCompleteV2=false;
        window.crmSystemBootCompleteV2=false;
        window.crmBootInProgressV2=true;

        try{ if(typeof switchTab==="function") switchTab("kalendarz"); }
        catch(error){ console.warn("Start Kalendarza:",error); }

        let calendarOk=false;
        try{
            if(typeof crmSetBackgroundTaskStatus==="function"){
                crmSetBackgroundTaskStatus("sync","loading","Kalendarz: pobieranie danych…");
            }
            await crmLoadCalendarPrimaryV2();
            calendarOk=true;
        }catch(error){
            console.error(error);
            if(typeof crmSetBackgroundTaskStatus==="function"){
                crmSetBackgroundTaskStatus("sync","error","Kalendarz: problem z pobraniem. Kliknij, aby ponowić.",{
                    onClick:()=>window.crmRestartSystemLoadV2?.()
                });
            }
        }

        crmSystemBootCompleteV2=true;
        window.crmSystemBootCompleteV2=true;
        window.crmBootInProgressV2=false;
        if(calendarOk && typeof crmSetBackgroundTaskStatus==="function"){
            crmSetBackgroundTaskStatus("sync","success","Kalendarz gotowy · pozostałe dane doładowują się w tle");
        }

        window.setTimeout(async()=>{
            if(window.crmDiagnosticsNetworkModeV11) return;
            try{ await crmLoadServicesPrimaryV2(); }catch(error){ console.warn("Cennik preload:",error); }
            try{ await crmLoadClientsPrimaryV2(); }catch(error){ console.warn("Klienci preload:",error); }
            try{ if(typeof crmRunInboxPingV5==="function") await crmRunInboxPingV5({force:true}); }catch(error){ console.warn("Skrzynka preload:",error); }
            if(typeof crmSetBackgroundTaskStatus==="function") crmSetBackgroundTaskStatus("sync","success","Dane gotowe");
        },1500);

        return calendarOk;
    })().finally(()=>{
        window.crmBootInProgressV2=false;
        window.setTimeout(()=>{crmInitialBootPromiseV2=null;},300);
    });

    return crmInitialBootPromiseV2;
};

window.crmRestartSystemLoadV2=async function(){
    crmInitialBootPromiseV2=null;
    return loadSystem();
};
/* KONIEC API TRANSPORT / KOLEJKA V11 */

/* ==========================================================================
   API CLEAN BOOT / ONE SERVER LANE V12 2026-08-12
   Wszystkie GET/POST z tej strony przechodzą przez jedną kolejkę.
   ========================================================================== */
let crmServerLaneQueueV12=[];
let crmServerLaneActiveV12=false;
const crmServerLaneByKeyV12=new Map();
const CRM_SERVER_READ_TIMEOUT_V12=45000;
const CRM_SERVER_WRITE_TIMEOUT_V12=60000;

function crmServerLanePumpV12(){
    if(crmServerLaneActiveV12 || !crmServerLaneQueueV12.length) return;
    crmServerLaneQueueV12.sort((a,b)=>b.priority-a.priority || a.createdAt-b.createdAt);
    const task=crmServerLaneQueueV12.shift();
    crmServerLaneActiveV12=true;

    (async()=>{
        try{
            const result=await task.runner();
            task.resolve(result);
        }catch(error){
            task.reject(error);
            if(error?.crmTimeoutV12){
                // Abort w przeglądarce nie kończy Apps Script. Nie puszczamy od razu kolejnej pracy.
                await new Promise(resolve=>window.setTimeout(resolve,10000));
            }
        }finally{
            if(task.key) crmServerLaneByKeyV12.delete(task.key);
            crmServerLaneActiveV12=false;
            crmServerLanePumpV12();
        }
    })();
}

function crmServerLaneTaskV12(key,runner,options={}){
    const normalizedKey=key?String(key):"";
    if(normalizedKey && crmServerLaneByKeyV12.has(normalizedKey)){
        return crmServerLaneByKeyV12.get(normalizedKey);
    }
    const promise=new Promise((resolve,reject)=>{
        crmServerLaneQueueV12.push({
            key:normalizedKey,
            runner,
            priority:Number(options.priority)||0,
            createdAt:Date.now(),
            resolve,reject
        });
        crmServerLanePumpV12();
    });
    if(normalizedKey) crmServerLaneByKeyV12.set(normalizedKey,promise);
    return promise;
}

async function crmFetchJsonV12(url,options={}){
    const timeoutMs=Math.max(8000,Number(options.timeoutMs)||CRM_SERVER_READ_TIMEOUT_V12);
    const controller=typeof AbortController!=="undefined"?new AbortController():null;
    let timer=null;
    try{
        const whole=(async()=>{
            const response=await fetch(url,{
                method:"GET",
                cache:"no-store",
                signal:controller?controller.signal:undefined
            });
            const text=await response.text();
            if(!response.ok) throw new Error(`HTTP ${response.status}: ${text.substring(0,300)}`);
            try{return JSON.parse(text);}
            catch(error){throw new Error("Serwer ADMIN zwrócił nieprawidłowy JSON.");}
        })();

        const deadline=new Promise((_,reject)=>{
            timer=window.setTimeout(()=>{
                try{controller?.abort();}catch(ignore){}
                const error=new Error(`Serwer ADMIN nie odpowiedział w ciągu ${Math.round(timeoutMs/1000)} s.`);
                error.crmTimeoutV12=true;
                reject(error);
            },timeoutMs);
        });

        return await Promise.race([whole,deadline]);
    }finally{
        if(timer)window.clearTimeout(timer);
    }
}

async function crmPostJsonV12(payload,options={}){
    const timeoutMs=Math.max(10000,Number(options.timeoutMs)||CRM_SERVER_WRITE_TIMEOUT_V12);
    const controller=typeof AbortController!=="undefined"?new AbortController():null;
    let timer=null;

    try{
        const whole=(async()=>{
            const response=await fetch(APPS_SCRIPT_URL,{
                method:"POST",
                headers:{"Content-Type":"text/plain"},
                body:JSON.stringify(payload||{}),
                signal:controller?controller.signal:undefined
            });
            const text=await response.text();
            if(!response.ok) throw new Error(`HTTP ${response.status}: ${text.substring(0,500)}`);
            try{return JSON.parse(text);}
            catch(error){throw new Error("API nie zwróciło JSON: "+text.substring(0,500));}
        })();

        const deadline=new Promise((_,reject)=>{
            timer=window.setTimeout(()=>{
                try{controller?.abort();}catch(ignore){}
                const error=new Error(
                    `Serwer ADMIN nie odpowiedział w ciągu ${Math.round(timeoutMs/1000)} s. `+
                    `Operacja mogła nadal zakończyć się po stronie Google.`
                );
                error.crmTimeoutV12=true;
                reject(error);
            },timeoutMs);
        });

        return await Promise.race([whole,deadline]);
    }finally{
        if(timer)window.clearTimeout(timer);
    }
}

crmQueuedGetV11=function(url,options={}){
    const key=String(options.key||crmReadKeyV11(url,"GET"));
    return crmServerLaneTaskV12(
        "GET:"+key,
        ()=>crmFetchJsonV12(url,{timeoutMs:options.timeoutMs}),
        {priority:Number(options.priority)||0}
    );
};
window.crmQueuedGetV11=crmQueuedGetV11;
window.crmFetchWholeJsonV11=crmFetchJsonV12;

crmTestPost=function(payload,options={}){
    const action=String(payload?.action||"POST");
    const readLike=new Set([
        "getAdminInbox","getContactFormRequests","getBookingRequests",
        "getEffectiveSchedule","getFamilySchedule","getTestReports",
        "runPoint35Diagnostics"
    ]);
    const stablePayload=readLike.has(action)
        ? JSON.stringify(payload||{})
        : "";
    const key=readLike.has(action) ? `POST:${action}:${stablePayload}` : "";
    return crmServerLaneTaskV12(
        key,
        ()=>crmPostJsonV12(payload,{
            timeoutMs:Number(options.timeoutMs)||
                (readLike.has(action)?45000:CRM_SERVER_WRITE_TIMEOUT_V12)
        }),
        {priority:readLike.has(action)?30:80}
    );
};
window.crmTestPost=crmTestPost;

crmPost=async function(payload){
    const result=await crmTestPost(payload||{});
    if(!result || typeof result!=="object") throw new Error("API zwróciło nieprawidłową odpowiedź");
    return result;
};

crmExtendedPost=async function(action,payload){
    return crmTestPost(Object.assign({action},payload||{}));
};

function crmApplyBootstrapV12(data){
    settingsData=data.settings||{};
    appointmentsData=Array.isArray(data.appointments)?data.appointments:[];
    currentServices=Array.isArray(data.services)?data.services:[];
    customersData=Array.isArray(data.clients)?data.clients:[];

    globalColors={};
    if(settingsData.colors){
        Object.keys(settingsData.colors).forEach(key=>{globalColors[key]=settingsData.colors[key];});
    }
    allCategories=settingsData.all_categories||[];

    if(typeof populateSettingsForm==="function")populateSettingsForm();
    if(typeof renderServicesTable==="function")renderServicesTable();
    if(typeof renderClients==="function")renderClients();
    if(typeof renderMiniMonthCalendar==="function")renderMiniMonthCalendar();
    if(typeof renderBooksyCalendar==="function")renderBooksyCalendar();
    if(typeof renderDashboard==="function")renderDashboard();
    if(typeof calculateFinanceReport==="function")calculateFinanceReport();
    if(typeof buildColorsEditor==="function")buildColorsEditor();
    if(typeof crmRenderCalendarInsights==="function")crmRenderCalendarInsights();

    if(data.inboxPing && typeof crmUpdateUnifiedInboxBadge==="function"){
        crmUpdateUnifiedInboxBadge({new:Math.max(0,Number(data.inboxPing.newCount)||0)});
    }
}

async function crmLoadAdminBootstrapV12(){
    const now=new Date();
    const from=new Date(now.getFullYear(),now.getMonth(),1);
    from.setDate(from.getDate()-3);
    const to=new Date(now.getFullYear(),now.getMonth()+1,0);
    to.setDate(to.getDate()+7);
    const fmt=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;

    const url=
        `${APPS_SCRIPT_URL}?adminBootstrap=true`+
        `&rangeStart=${encodeURIComponent(fmt(from))}`+
        `&rangeEnd=${encodeURIComponent(fmt(to))}`+
        `&_boot=${Date.now()}`;

    const data=await crmQueuedGetV11(url,{
        key:"adminBootstrap",
        priority:120,
        timeoutMs:50000
    });
    if(!data?.success) throw new Error(data?.error||"Bootstrap ADMIN zwrócił błąd");
    crmApplyBootstrapV12(data);
    return data;
}
window.crmLoadAdminBootstrapV12=crmLoadAdminBootstrapV12;

crmLoadCalendarPrimaryV2=async function(){
    const range=typeof crmCalendarVisibleRange==="function"
        ? crmCalendarVisibleRange()
        : {start:new Date(),end:new Date(Date.now()+7*86400000)};
    const fmt=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
    const from=fmt(range.start),to=fmt(range.end);
    const data=await crmQueuedGetV11(
        `${APPS_SCRIPT_URL}?checkBusy=true&rangeStart=${encodeURIComponent(from)}&rangeEnd=${encodeURIComponent(to)}&_refresh=${Date.now()}`,
        {key:`calendar:${from}:${to}`,priority:100,timeoutMs:45000}
    );
    if(!data||!Array.isArray(data.appointments))throw new Error(data?.error||"Kalendarz nie zwrócił danych");
    settingsData={...settingsData,...(data.settings||{})};
    appointmentsData=data.appointments;
    if(typeof populateSettingsForm==="function")populateSettingsForm();
    if(typeof renderMiniMonthCalendar==="function")renderMiniMonthCalendar();
    if(typeof renderBooksyCalendar==="function")renderBooksyCalendar();
    return data;
};

crmLoadServicesPrimaryV2=async function(){
    const data=await crmQueuedGetV11(`${APPS_SCRIPT_URL}?getPrices=true&_refresh=${Date.now()}`,{
        key:"getPrices",priority:20,timeoutMs:35000
    });
    if(!Array.isArray(data))throw new Error("Cennik nie zwrócił listy usług");
    currentServices=data;
    if(typeof renderServicesTable==="function")renderServicesTable();
    return data;
};

crmLoadClientsPrimaryV2=async function(){
    const data=await crmQueuedGetV11(`${APPS_SCRIPT_URL}?getClients=true&_refresh=${Date.now()}`,{
        key:"getClients",priority:20,timeoutMs:35000
    });
    if(!Array.isArray(data))throw new Error("Klienci nie zwrócili listy");
    customersData=data;
    if(typeof renderClients==="function")renderClients();
    return data;
};

/* Starsze moduły nie omijają już kolejki transportowej. */
loadSettings=crmLoadCalendarPrimaryV2;
loadServices=crmLoadServicesPrimaryV2;
loadClients=crmLoadClientsPrimaryV2;

crmFetchRemoteStateV2=function(){
    if(crmRemoteStateBusyV2)return crmRemoteStateBusyV2;
    crmRemoteStateBusyV2=crmQueuedGetV11(
        `${APPS_SCRIPT_URL}?adminState=true&_state=${Date.now()}`,
        {key:"adminState",priority:5,timeoutMs:35000}
    ).then(data=>{
        if(!data?.success)throw new Error(data?.error||"Nieprawidłowy stan danych");
        return data;
    }).finally(()=>{crmRemoteStateBusyV2=null;});
    return crmRemoteStateBusyV2;
};

loadSystem=async function(){
    if(crmInitialBootPromiseV2)return crmInitialBootPromiseV2;

    crmInitialBootPromiseV2=(async()=>{
        crmSystemBootCompleteV2=false;
        window.crmSystemBootCompleteV2=false;
        window.crmBootInProgressV2=true;

        try{
            if(typeof switchTab==="function")await switchTab("kalendarz");
        }catch(error){console.warn("Start Kalendarza:",error);}

        try{
            if(typeof crmSetBackgroundTaskStatus==="function"){
                crmSetBackgroundTaskStatus("sync","loading","Pobieranie danych ADMIN…");
            }
            await crmLoadAdminBootstrapV12();

            crmSystemBootCompleteV2=true;
            window.crmSystemBootCompleteV2=true;
            window.crmBootInProgressV2=false;

            if(typeof crmSetBackgroundTaskStatus==="function"){
                crmSetBackgroundTaskStatus("sync","success","Dane gotowe");
            }
            return true;
        }catch(error){
            crmSystemBootCompleteV2=false;
            window.crmSystemBootCompleteV2=false;
            window.crmBootInProgressV2=false;
            console.error("Bootstrap ADMIN:",error);

            if(typeof crmSetBackgroundTaskStatus==="function"){
                crmSetBackgroundTaskStatus(
                    "sync","error",
                    "Nie udało się pobrać danych ADMIN. Kliknij, aby ponowić.",
                    {onClick:()=>window.crmRestartSystemLoadV2?.()}
                );
            }
            throw error;
        }
    })().finally(()=>{
        window.crmBootInProgressV2=false;
        window.setTimeout(()=>{crmInitialBootPromiseV2=null;},300);
    });

    return crmInitialBootPromiseV2;
};

window.crmRestartSystemLoadV2=async function(){
    crmInitialBootPromiseV2=null;
    crmReadQueueV11.length=0;
    crmReadByKeyV11.clear();
    return loadSystem();
};
/* KONIEC API CLEAN BOOT / ONE SERVER LANE V12 */

/* ==========================================================================
   API LOCAL TRANSPORT / START V13 2026-08-12
   Cel:
   - lokalny file:// używa GET przez JSONP bez abortowania redirectu Google;
   - żadnego automatycznego retry;
   - późna odpowiedź nie powoduje "callback is not defined";
   - start nie używa ciężkiego adminBootstrap — dane idą kolejno.
   ========================================================================== */
let crmJsonpCounterV13 = 0;

function crmJsonpGetV13(url, options = {}) {
    const timeoutMs = Math.max(12000, Number(options.timeoutMs) || 45000);

    return new Promise((resolve, reject) => {
        const callbackName =
            `crmJsonpV13_${Date.now()}_${++crmJsonpCounterV13}_${Math.random().toString(36).slice(2,8)}`;

        const separator = url.includes("?") ? "&" : "?";
        const script = document.createElement("script");
        let settled = false;
        let timeoutId = null;
        let finalCleanupId = null;

        const removeScript = () => {
            try {
                if (script.parentNode) script.parentNode.removeChild(script);
            } catch (ignore) {}
        };

        const deleteCallback = () => {
            try { delete window[callbackName]; }
            catch (ignore) { window[callbackName] = undefined; }
        };

        const fullCleanup = () => {
            if (timeoutId) window.clearTimeout(timeoutId);
            if (finalCleanupId) window.clearTimeout(finalCleanupId);
            removeScript();
            deleteCallback();
        };

        window[callbackName] = data => {
            if (!settled) {
                settled = true;
                fullCleanup();
                resolve(data);
                return;
            }

            // Odpowiedź przyszła już po timeout.
            // Callback istnieje nadal, więc nie ma ReferenceError.
            fullCleanup();
        };

        script.async = true;

        script.onerror = () => {
            if (settled) {
                fullCleanup();
                return;
            }
            settled = true;
            fullCleanup();
            reject(new Error("Google Web App zwrócił błąd ładowania GET."));
        };

        script.src =
            `${url}${separator}callback=${encodeURIComponent(callbackName)}&_jsonp13=${Date.now()}`;

        timeoutId = window.setTimeout(() => {
            if (settled) return;
            settled = true;

            /*
             * NIE usuwamy od razu <script> ani callbacku.
             * Apps Script może nadal kończyć wykonanie. Pozostawiamy bezpieczny
             * callback przez 2 minuty, aby późna odpowiedź nie wygenerowała
             * "callback is not defined".
             */
            const error = new Error(
                `Serwer ADMIN nie odpowiedział w ciągu ${Math.round(timeoutMs/1000)} s.`
            );
            error.crmTimeoutV12 = true;
            error.crmTimeoutV13 = true;
            reject(error);

            finalCleanupId = window.setTimeout(fullCleanup, 120000);
        }, timeoutMs);

        document.head.appendChild(script);
    });
}
window.crmJsonpGetV13 = crmJsonpGetV13;

/*
 * Odczyty GET uruchamianego lokalnie ADMIN-a nie korzystają już z fetch(),
 * który potrafił zostać przerwany podczas redirectu script.googleusercontent.com.
 */
const crmFetchJsonNativeBeforeV13 = crmFetchJsonV12;
crmFetchJsonV12 = async function(url, options = {}) {
    if (window.location && window.location.protocol === "file:") {
        return crmJsonpGetV13(url, {
            timeoutMs: Math.max(20000, Number(options.timeoutMs) || 45000)
        });
    }
    return crmFetchJsonNativeBeforeV13(url, options);
};
window.crmFetchJsonV12 = crmFetchJsonV12;
window.crmFetchWholeJsonV11 = crmFetchJsonV12;

/* Nazwa V10 zostaje kompatybilna, ale korzysta już z bezpiecznego V13. */
crmJsonpGetV10 = function(url, timeoutMs) {
    return crmJsonpGetV13(url, {
        timeoutMs: Math.max(20000, Number(timeoutMs) || 45000)
    });
};
window.crmJsonpGetV10 = crmJsonpGetV10;

/*
 * adminState tymczasowo wyłączamy z automatycznej ścieżki.
 * Nie jest potrzebny do poprawnego działania Kalendarza/Skrzynki,
 * a test pokazał, że często dobija do limitu 8–9 s.
 */
crmFetchRemoteStateV2 = async function() {
    return {
        success: true,
        disabledV13: true,
        calendar: "",
        clients: "",
        services: "",
        inbox: ""
    };
};
window.crmFetchRemoteStateV2 = crmFetchRemoteStateV2;

async function crmLoadSystemSequentialV13() {
    crmSystemBootCompleteV2 = false;
    window.crmSystemBootCompleteV2 = false;
    window.crmBootInProgressV2 = true;

    try {
        try {
            if (typeof switchTab === "function") await switchTab("kalendarz");
        } catch (error) {
            console.warn("Start Kalendarza:", error);
        }

        let calendarOk = false;

        if (typeof crmSetBackgroundTaskStatus === "function") {
            crmSetBackgroundTaskStatus(
                "sync",
                "loading",
                "Kalendarz: pobieranie danych…"
            );
        }

        try {
            await crmLoadCalendarPrimaryV2();
            calendarOk = true;
            if (typeof crmSetBackgroundTaskStatus === "function") {
                crmSetBackgroundTaskStatus(
                    "sync",
                    "loading",
                    "Kalendarz gotowy · pobieram cennik…"
                );
            }
        } catch (error) {
            console.error("Kalendarz start V13:", error);
            if (typeof crmSetBackgroundTaskStatus === "function") {
                crmSetBackgroundTaskStatus(
                    "sync",
                    "error",
                    "Kalendarz: problem z pobraniem. Możesz ponowić ręcznie."
                );
            }
        }

        try {
            await crmLoadServicesPrimaryV2();
            if (typeof crmSetBackgroundTaskStatus === "function") {
                crmSetBackgroundTaskStatus(
                    "sync",
                    "loading",
                    "Pobieram klientów…"
                );
            }
        } catch (error) {
            console.warn("Cennik start V13:", error);
        }

        try {
            await crmLoadClientsPrimaryV2();
        } catch (error) {
            console.warn("Klienci start V13:", error);
        }

        /*
         * Boot kończymy przed pingiem. Ping nie może blokować uruchomienia CRM.
         */
        crmSystemBootCompleteV2 = true;
        window.crmSystemBootCompleteV2 = true;
        window.crmBootInProgressV2 = false;

        try {
            if (typeof crmRunInboxPingV5 === "function") {
                await crmRunInboxPingV5({ force:true });
            }
        } catch (error) {
            console.warn("Skrzynka start V13:", error);
        }

        try {
            if (typeof renderDashboard === "function") renderDashboard();
            if (typeof calculateFinanceReport === "function") calculateFinanceReport();
            if (typeof buildColorsEditor === "function") buildColorsEditor();
        } catch (error) {
            console.warn("Render końcowy V13:", error);
        }

        if (typeof crmSetBackgroundTaskStatus === "function") {
            crmSetBackgroundTaskStatus(
                "sync",
                calendarOk ? "success" : "error",
                calendarOk
                    ? "Dane gotowe"
                    : "Dane częściowo gotowe · Kalendarz wymaga ponowienia"
            );
        }

        return calendarOk;
    } finally {
        window.crmBootInProgressV2 = false;
    }
}

/*
 * Ostateczny start V13:
 * żadnego adminBootstrap=true.
 * Kalendarz -> cennik -> klienci -> ping, dokładnie po jednym żądaniu.
 */
loadSystem = async function() {
    if (crmInitialBootPromiseV2) return crmInitialBootPromiseV2;

    crmInitialBootPromiseV2 = crmLoadSystemSequentialV13()
        .finally(() => {
            window.crmBootInProgressV2 = false;
            window.setTimeout(() => {
                crmInitialBootPromiseV2 = null;
            }, 400);
        });

    return crmInitialBootPromiseV2;
};

window.crmRestartSystemLoadV2 = async function() {
    crmInitialBootPromiseV2 = null;

    /*
     * Czyścimy tylko oczekującą kolejkę. Trwającego Apps Script nie próbujemy
     * "zabijać", bo po stronie Google i tak może ono nadal pracować.
     */
    try { crmReadQueueV11.length = 0; } catch (ignore) {}
    try { crmReadByKeyV11.clear(); } catch (ignore) {}

    return loadSystem();
};

/* KONIEC API LOCAL TRANSPORT / START V13 */

/* ==========================================================================
   API PERFORMANCE V18 2026-08-16
   - jeden bootstrap GET zamiast Kalendarz -> Cennik -> Klienci -> ping;
   - session cache daje natychmiastowy pierwszy render po reload;
   - ciężkie tabele innych zakładek są renderowane dopiero po wejściu;
   - fallback do V13 pozostaje, gdy bootstrap naprawdę zawiedzie.
   ========================================================================== */

const CRM_PERF_CACHE_KEY_V18 = "crm_admin_bootstrap_v18";
const CRM_PERF_CACHE_TTL_V18 = 10 * 60 * 1000;

window.crmPerfMetricsV18 = window.crmPerfMetricsV18 || {
    strategy: "single-bootstrap-v18",
    bootNetworkRequests: 0,
    bootStartedAt: 0,
    bootFinishedAt: 0,
    bootNetworkMs: 0,
    cacheUsed: false,
    freshApplied: false,
    fallbackUsed: false
};

window.crmPerfFreshAtV18 = window.crmPerfFreshAtV18 || {
    calendar: 0,
    services: 0,
    clients: 0
};

function crmPerfActiveTabV18() {
    if (typeof crmDetectActiveTabV6 === "function") {
        try { return crmDetectActiveTabV6(); } catch (ignore) {}
    }
    const visible = Array.from(document.querySelectorAll(".tab-page"))
        .find(node => getComputedStyle(node).display !== "none");
    return visible?.id?.replace(/^tab-/, "") || "kalendarz";
}

function crmPerfReadCacheV18() {
    try {
        const raw = sessionStorage.getItem(CRM_PERF_CACHE_KEY_V18);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        const age = Date.now() - Number(parsed?.savedAt || 0);
        if (!parsed?.data || age < 0 || age > CRM_PERF_CACHE_TTL_V18) {
            sessionStorage.removeItem(CRM_PERF_CACHE_KEY_V18);
            return null;
        }
        return parsed.data;
    } catch (error) {
        return null;
    }
}

function crmPerfWriteCacheV18(data) {
    try {
        const safe = {
            settings: data?.settings || settingsData || {},
            appointments: Array.isArray(data?.appointments) ? data.appointments : (appointmentsData || []),
            services: Array.isArray(data?.services) ? data.services : (currentServices || []),
            clients: Array.isArray(data?.clients) ? data.clients : (customersData || [])
        };
        sessionStorage.setItem(
            CRM_PERF_CACHE_KEY_V18,
            JSON.stringify({ savedAt: Date.now(), data: safe })
        );
    } catch (error) {
        // Cache jest wyłącznie optymalizacją; jego błąd nie wpływa na CRM.
    }
}

function crmPerfMarkFreshV18(parts) {
    const now = Date.now();
    (parts || []).forEach(part => {
        window.crmPerfFreshAtV18[part] = now;
    });
}

function crmPerfRenderCurrentTabV18(tabName, options = {}) {
    const tab = tabName || crmPerfActiveTabV18();
    const includeCalendar = options.includeCalendar !== false;

    if (tab === "kalendarz" && includeCalendar) {
        if (typeof renderMiniMonthCalendar === "function") renderMiniMonthCalendar();
        if (typeof renderBooksyCalendar === "function") renderBooksyCalendar();
        if (typeof crmRenderCalendarInsights === "function") crmRenderCalendarInsights();
        return;
    }

    if (tab === "klienci") {
        if (typeof renderClients === "function") renderClients();
        return;
    }

    if (tab === "cennik") {
        if (typeof renderServicesTable === "function") renderServicesTable();
        if (typeof crmReplaceServiceFormInputs === "function") crmReplaceServiceFormInputs();
        if (typeof crmRefreshServiceFormChoices === "function") crmRefreshServiceFormChoices();
        return;
    }

    if (tab === "dashboard") {
        if (typeof renderDashboard === "function") renderDashboard();
        return;
    }

    if (tab === "finanse") {
        if (typeof calculateFinanceReport === "function") calculateFinanceReport();
        return;
    }

    if (tab === "ustawienia") {
        if (typeof populateSettingsForm === "function") populateSettingsForm();
        if (typeof buildColorsEditor === "function") buildColorsEditor();
    }
}
window.crmPerfRenderCurrentTabV18 = crmPerfRenderCurrentTabV18;

function crmPerfApplyBootstrapV18(data, options = {}) {
    if (!data || typeof data !== "object") return false;

    settingsData = data.settings || settingsData || {};
    appointmentsData = Array.isArray(data.appointments) ? data.appointments : (appointmentsData || []);
    currentServices = Array.isArray(data.services) ? data.services : (currentServices || []);
    customersData = Array.isArray(data.clients) ? data.clients : (customersData || []);

    globalColors = {};
    if (settingsData?.colors) {
        Object.keys(settingsData.colors).forEach(key => {
            globalColors[key] = settingsData.colors[key];
        });
    }
    allCategories = settingsData?.all_categories || allCategories || [];

    crmPerfMarkFreshV18(["calendar", "services", "clients"]);

    /*
     * Start ADMIN = Kalendarz. Nie renderujemy przy tym tabel Klientów,
     * Cennika, Dashboardu ani Finansów.
     */
    const tab = crmPerfActiveTabV18();
    crmPerfRenderCurrentTabV18(tab, { includeCalendar: true });

    if (!options.fromCache && data.inboxPing && typeof crmUpdateUnifiedInboxBadge === "function") {
        crmUpdateUnifiedInboxBadge({
            new: Math.max(0, Number(data.inboxPing.newCount) || 0)
        });
    }

    return true;
}
window.crmPerfApplyBootstrapV18 = crmPerfApplyBootstrapV18;

async function crmPerfFetchBootstrapV18() {
    const now = new Date();
    const from = new Date(now.getFullYear(), now.getMonth(), 1);
    from.setDate(from.getDate() - 3);
    const to = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    to.setDate(to.getDate() + 7);

    const fmt = d =>
        `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;

    const url =
        `${APPS_SCRIPT_URL}?adminBootstrap=true` +
        `&rangeStart=${encodeURIComponent(fmt(from))}` +
        `&rangeEnd=${encodeURIComponent(fmt(to))}` +
        `&_perf18=${Date.now()}`;

    window.crmPerfMetricsV18.bootNetworkRequests += 1;
    const started = performance.now();

    const data = await crmQueuedGetV11(url, {
        key: "adminBootstrapV18",
        priority: 125,
        timeoutMs: 50000
    });

    window.crmPerfMetricsV18.bootNetworkMs =
        Math.round(performance.now() - started);

    if (!data?.success) {
        throw new Error(data?.error || "Bootstrap ADMIN V18 zwrócił błąd");
    }

    return data;
}
window.crmPerfFetchBootstrapV18 = crmPerfFetchBootstrapV18;

/*
 * Opakowujemy normalne loadery, aby każda późniejsza prawdziwa
 * synchronizacja aktualizowała znacznik świeżości i session-cache.
 */
const crmLoadCalendarPrimaryBeforePerfV18 = crmLoadCalendarPrimaryV2;
crmLoadCalendarPrimaryV2 = async function() {
    const result = await crmLoadCalendarPrimaryBeforePerfV18.apply(this, arguments);
    crmPerfMarkFreshV18(["calendar"]);
    crmPerfWriteCacheV18({});
    return result;
};

const crmLoadServicesPrimaryBeforePerfV18 = crmLoadServicesPrimaryV2;
crmLoadServicesPrimaryV2 = async function() {
    const result = await crmLoadServicesPrimaryBeforePerfV18.apply(this, arguments);
    crmPerfMarkFreshV18(["services"]);
    crmPerfWriteCacheV18({});
    return result;
};

const crmLoadClientsPrimaryBeforePerfV18 = crmLoadClientsPrimaryV2;
crmLoadClientsPrimaryV2 = async function() {
    const result = await crmLoadClientsPrimaryBeforePerfV18.apply(this, arguments);
    crmPerfMarkFreshV18(["clients"]);
    crmPerfWriteCacheV18({});
    return result;
};

/* Aliasy starszych modułów kierujemy na aktualne opakowane loadery. */
loadSettings = crmLoadCalendarPrimaryV2;
loadServices = crmLoadServicesPrimaryV2;
loadClients = crmLoadClientsPrimaryV2;

async function crmLoadSystemFastV18() {
    const metrics = window.crmPerfMetricsV18;
    metrics.strategy = "single-bootstrap-v18";
    metrics.bootNetworkRequests = 0;
    metrics.bootStartedAt = Date.now();
    metrics.bootFinishedAt = 0;
    metrics.bootNetworkMs = 0;
    metrics.cacheUsed = false;
    metrics.freshApplied = false;
    metrics.fallbackUsed = false;

    crmSystemBootCompleteV2 = false;
    window.crmSystemBootCompleteV2 = false;
    window.crmBootInProgressV2 = true;
    window.crmPerfSuppressCalendarRenderV18 = true;

    try {
        try {
            if (typeof switchTab === "function") await switchTab("kalendarz");
        } catch (error) {
            console.warn("Start Kalendarza V18:", error);
        }

        const cached = crmPerfReadCacheV18();
        if (cached) {
            metrics.cacheUsed = true;
            window.crmPerfSuppressCalendarRenderV18 = false;
            crmPerfApplyBootstrapV18(cached, { fromCache: true });
            window.crmPerfSuppressCalendarRenderV18 = true;
        }

        try {
            const fresh = await crmPerfFetchBootstrapV18();

            window.crmPerfSuppressCalendarRenderV18 = false;
            crmPerfApplyBootstrapV18(fresh, { fromCache: false });
            crmPerfWriteCacheV18(fresh);

            metrics.freshApplied = true;
            crmSystemBootCompleteV2 = true;
            window.crmSystemBootCompleteV2 = true;
            return true;
        } catch (bootstrapError) {
            console.warn("Bootstrap V18:", bootstrapError);

            /*
             * Jeśli cache już dał działający ekran, nie uruchamiamy lawiny
             * 3 kolejnych żądań tylko dlatego, że pojedynczy refresh się nie udał.
             */
            if (cached) {
                crmSystemBootCompleteV2 = true;
                window.crmSystemBootCompleteV2 = true;
                if (typeof crmToast === "function") {
                    crmToast("Dane są dostępne z pamięci. Świeże dane pobiorę przy kolejnej synchronizacji.", "error");
                }
                return true;
            }

            /*
             * Pierwszy start bez cache: zachowujemy bezpieczny fallback V13.
             */
            metrics.fallbackUsed = true;
            window.crmPerfSuppressCalendarRenderV18 = false;
            const ok = await crmLoadSystemSequentialV13();
            if (ok) crmPerfWriteCacheV18({});
            return ok;
        }
    } finally {
        window.crmPerfSuppressCalendarRenderV18 = false;
        window.crmBootInProgressV2 = false;
        metrics.bootFinishedAt = Date.now();
    }
}

/* Ostateczny punkt startowy ADMIN. */
loadSystem = async function() {
    if (crmInitialBootPromiseV2) return crmInitialBootPromiseV2;

    crmInitialBootPromiseV2 = crmLoadSystemFastV18()
        .finally(() => {
            window.crmBootInProgressV2 = false;
            window.setTimeout(() => {
                crmInitialBootPromiseV2 = null;
            }, 250);
        });

    return crmInitialBootPromiseV2;
};

window.crmRestartSystemLoadV2 = async function() {
    crmInitialBootPromiseV2 = null;
    try { crmReadQueueV11.length = 0; } catch (ignore) {}
    try { crmReadByKeyV11.clear(); } catch (ignore) {}
    try { sessionStorage.removeItem(CRM_PERF_CACHE_KEY_V18); } catch (ignore) {}
    return loadSystem();
};

/* KONIEC API PERFORMANCE V18 */

/* ==========================================================================
   API PERFORMANCE V19 2026-08-16
   - persistent localStorage snapshot: szybki start także po ponownym otwarciu;
   - stale-while-revalidate: stary snapshot tylko do pierwszego świeżego GET;
   - fingerprint: jeśli świeży payload = ten sam stan, nie robimy drugiego renderu;
   - zapisujemy server timings zwrócone przez Google ADMIN.
   ========================================================================== */

const CRM_PERF_PERSIST_KEY_V19 = "crm_admin_bootstrap_persist_v19";
const CRM_PERF_PERSIST_MAX_AGE_V19 = 24 * 60 * 60 * 1000;

window.crmPerfMetricsV19 = window.crmPerfMetricsV19 || {
    persistentCacheUsed: false,
    persistentCacheAgeMs: 0,
    immediateRenderMs: 0,
    freshPayloadChanged: true,
    freshRenderSkipped: false,
    payloadBytes: 0,
    serverPerf: null
};

window.crmPerfAppliedFingerprintV19 = window.crmPerfAppliedFingerprintV19 || "";

function crmPerfSnapshotV19(data) {
    return {
        settings: data?.settings || settingsData || {},
        appointments: Array.isArray(data?.appointments) ? data.appointments : (appointmentsData || []),
        services: Array.isArray(data?.services) ? data.services : (currentServices || []),
        clients: Array.isArray(data?.clients) ? data.clients : (customersData || [])
    };
}

function crmPerfFingerprintV19(data) {
    const snapshot = crmPerfSnapshotV19(data);
    let text = "";
    try { text = JSON.stringify(snapshot); }
    catch (error) { return String(Date.now()); }

    // FNV-1a 32 bit — wystarczy do wykrycia identycznego renderu UI.
    let hash = 2166136261;
    for (let i = 0; i < text.length; i++) {
        hash ^= text.charCodeAt(i);
        hash = Math.imul(hash, 16777619);
    }
    return (hash >>> 0).toString(16) + ":" + text.length;
}
window.crmPerfFingerprintV19 = crmPerfFingerprintV19;

function crmPerfWritePersistentCacheV19(data) {
    try {
        const snapshot = crmPerfSnapshotV19(data);
        localStorage.setItem(
            CRM_PERF_PERSIST_KEY_V19,
            JSON.stringify({
                savedAt: Date.now(),
                fingerprint: crmPerfFingerprintV19(snapshot),
                data: snapshot
            })
        );
        return true;
    } catch (error) {
        return false;
    }
}
window.crmPerfWritePersistentCacheV19 = crmPerfWritePersistentCacheV19;

function crmPerfReadPersistentCacheV19() {
    try {
        const raw = localStorage.getItem(CRM_PERF_PERSIST_KEY_V19);
        if (!raw) return null;

        const parsed = JSON.parse(raw);
        const age = Date.now() - Number(parsed?.savedAt || 0);

        if (
            !parsed?.data ||
            age < 0 ||
            age > CRM_PERF_PERSIST_MAX_AGE_V19
        ) {
            localStorage.removeItem(CRM_PERF_PERSIST_KEY_V19);
            return null;
        }

        return {
            data: parsed.data,
            savedAt: Number(parsed.savedAt || 0),
            ageMs: age,
            fingerprint: parsed.fingerprint || crmPerfFingerprintV19(parsed.data)
        };
    } catch (error) {
        return null;
    }
}
window.crmPerfReadPersistentCacheV19 = crmPerfReadPersistentCacheV19;

function crmPerfApplySnapshotWithoutForcedRenderV19(data, options = {}) {
    if (!data || typeof data !== "object") return false;

    const fingerprint = crmPerfFingerprintV19(data);
    const same = fingerprint === window.crmPerfAppliedFingerprintV19;

    settingsData = data.settings || settingsData || {};
    appointmentsData = Array.isArray(data.appointments) ? data.appointments : (appointmentsData || []);
    currentServices = Array.isArray(data.services) ? data.services : (currentServices || []);
    customersData = Array.isArray(data.clients) ? data.clients : (customersData || []);

    globalColors = {};
    if (settingsData?.colors) {
        Object.keys(settingsData.colors).forEach(key => {
            globalColors[key] = settingsData.colors[key];
        });
    }
    allCategories = settingsData?.all_categories || allCategories || [];

    if (typeof crmPerfMarkFreshV18 === "function") {
        crmPerfMarkFreshV18(["calendar", "services", "clients"]);
    }

    const shouldRender = options.forceRender === true || !same;

    if (shouldRender) {
        const tab = typeof crmPerfActiveTabV18 === "function"
            ? crmPerfActiveTabV18()
            : "kalendarz";

        if (typeof crmPerfRenderCurrentTabV18 === "function") {
            crmPerfRenderCurrentTabV18(tab, { includeCalendar: true });
        }
    }

    window.crmPerfAppliedFingerprintV19 = fingerprint;
    return { same, rendered: shouldRender, fingerprint };
}
window.crmPerfApplySnapshotWithoutForcedRenderV19 = crmPerfApplySnapshotWithoutForcedRenderV19;

/*
 * Nadpisujemy tylko start V18. Cała kolejka transportowa i fallback pozostają.
 */
async function crmLoadSystemFastV19() {
    const metrics18 = window.crmPerfMetricsV18 || {};
    const metrics19 = window.crmPerfMetricsV19 || {};

    metrics18.strategy = "single-bootstrap-v19";
    metrics18.bootNetworkRequests = 0;
    metrics18.bootStartedAt = Date.now();
    metrics18.bootFinishedAt = 0;
    metrics18.bootNetworkMs = 0;
    metrics18.cacheUsed = false;
    metrics18.freshApplied = false;
    metrics18.fallbackUsed = false;

    metrics19.persistentCacheUsed = false;
    metrics19.persistentCacheAgeMs = 0;
    metrics19.immediateRenderMs = 0;
    metrics19.freshPayloadChanged = true;
    metrics19.freshRenderSkipped = false;
    metrics19.payloadBytes = 0;
    metrics19.serverPerf = null;

    crmSystemBootCompleteV2 = false;
    window.crmSystemBootCompleteV2 = false;
    window.crmBootInProgressV2 = true;
    window.crmPerfSuppressCalendarRenderV18 = true;

    const visualStart = performance.now();

    try {
        try {
            if (typeof switchTab === "function") await switchTab("kalendarz");
        } catch (error) {
            console.warn("Start Kalendarza V19:", error);
        }

        /*
         * 1. Najpierw sessionStorage V18.
         * 2. Jeśli go nie ma — persistent localStorage V19.
         */
        let cached = typeof crmPerfReadCacheV18 === "function"
            ? crmPerfReadCacheV18()
            : null;

        if (cached) {
            metrics18.cacheUsed = true;
            window.crmPerfSuppressCalendarRenderV18 = false;
            const applied = crmPerfApplySnapshotWithoutForcedRenderV19(cached, { forceRender: true });
            metrics19.immediateRenderMs = Math.round(performance.now() - visualStart);
            window.crmPerfSuppressCalendarRenderV18 = true;
        } else {
            const persistent = crmPerfReadPersistentCacheV19();
            if (persistent?.data) {
                metrics19.persistentCacheUsed = true;
                metrics19.persistentCacheAgeMs = Math.max(0, persistent.ageMs || 0);

                window.crmPerfSuppressCalendarRenderV18 = false;
                crmPerfApplySnapshotWithoutForcedRenderV19(
                    persistent.data,
                    { forceRender: true }
                );
                metrics19.immediateRenderMs = Math.round(performance.now() - visualStart);
                window.crmPerfSuppressCalendarRenderV18 = true;

                cached = persistent.data;
            }
        }

        try {
            const fresh = await crmPerfFetchBootstrapV18();

            try {
                metrics19.payloadBytes = JSON.stringify(fresh).length;
            } catch (ignore) {
                metrics19.payloadBytes = 0;
            }

            metrics19.serverPerf = fresh?.perf || null;

            const freshFingerprint = crmPerfFingerprintV19(fresh);
            const previousFingerprint = window.crmPerfAppliedFingerprintV19;
            const changed = freshFingerprint !== previousFingerprint;

            metrics19.freshPayloadChanged = changed;

            window.crmPerfSuppressCalendarRenderV18 = false;

            const applied = crmPerfApplySnapshotWithoutForcedRenderV19(
                fresh,
                { forceRender: !previousFingerprint || changed }
            );

            metrics19.freshRenderSkipped = Boolean(
                previousFingerprint && !changed && applied?.rendered === false
            );

            crmPerfWriteCacheV18(fresh);
            crmPerfWritePersistentCacheV19(fresh);

            metrics18.freshApplied = true;
            crmSystemBootCompleteV2 = true;
            window.crmSystemBootCompleteV2 = true;
            return true;
        } catch (bootstrapError) {
            console.warn("Bootstrap V19:", bootstrapError);

            if (cached) {
                crmSystemBootCompleteV2 = true;
                window.crmSystemBootCompleteV2 = true;
                if (typeof crmToast === "function") {
                    crmToast(
                        "Pokazuję ostatnie zapisane dane. Świeże dane pobiorę przy kolejnej synchronizacji.",
                        "error"
                    );
                }
                return true;
            }

            metrics18.fallbackUsed = true;
            window.crmPerfSuppressCalendarRenderV18 = false;
            const ok = await crmLoadSystemSequentialV13();
            if (ok) {
                crmPerfWriteCacheV18({});
                crmPerfWritePersistentCacheV19({});
            }
            return ok;
        }
    } finally {
        window.crmPerfSuppressCalendarRenderV18 = false;
        window.crmBootInProgressV2 = false;
        metrics18.bootFinishedAt = Date.now();
    }
}

loadSystem = async function() {
    if (crmInitialBootPromiseV2) return crmInitialBootPromiseV2;

    crmInitialBootPromiseV2 = crmLoadSystemFastV19()
        .finally(() => {
            window.crmBootInProgressV2 = false;
            window.setTimeout(() => {
                crmInitialBootPromiseV2 = null;
            }, 250);
        });

    return crmInitialBootPromiseV2;
};

window.crmRestartSystemLoadV2 = async function() {
    crmInitialBootPromiseV2 = null;

    try { crmReadQueueV11.length = 0; } catch (ignore) {}
    try { crmReadByKeyV11.clear(); } catch (ignore) {}
    try { sessionStorage.removeItem(CRM_PERF_CACHE_KEY_V18); } catch (ignore) {}
    try { localStorage.removeItem(CRM_PERF_PERSIST_KEY_V19); } catch (ignore) {}

    return loadSystem();
};

/* KONIEC API PERFORMANCE V19 */

/* ==========================================================================
   API PERFORMANCE V19.1 2026-08-16
   Korekta migracji cache + obserwowalność background bootstrap.
   ========================================================================== */

window.crmPerfFreshBootstrapPromiseV191 = null;
window.crmPerfFreshBootstrapStateV191 = "idle";
window.crmPerfFreshBootstrapErrorV191 = "";

async function crmLoadSystemFastV191() {
    const metrics18 = window.crmPerfMetricsV18 || {};
    const metrics19 = window.crmPerfMetricsV19 || {};

    metrics18.strategy = "single-bootstrap-v19.1";
    metrics18.bootNetworkRequests = 0;
    metrics18.bootStartedAt = Date.now();
    metrics18.bootFinishedAt = 0;
    metrics18.bootNetworkMs = 0;
    metrics18.cacheUsed = false;
    metrics18.freshApplied = false;
    metrics18.fallbackUsed = false;

    metrics19.persistentCacheUsed = false;
    metrics19.persistentCacheAgeMs = 0;
    metrics19.immediateRenderMs = 0;
    metrics19.freshPayloadChanged = true;
    metrics19.freshRenderSkipped = false;
    metrics19.payloadBytes = 0;
    metrics19.serverPerf = null;

    window.crmPerfFreshBootstrapStateV191 = "idle";
    window.crmPerfFreshBootstrapErrorV191 = "";
    window.crmPerfFreshBootstrapPromiseV191 = null;

    crmSystemBootCompleteV2 = false;
    window.crmSystemBootCompleteV2 = false;
    window.crmBootInProgressV2 = true;
    window.crmPerfSuppressCalendarRenderV18 = true;

    const visualStart = performance.now();

    try {
        try {
            if (typeof switchTab === "function") await switchTab("kalendarz");
        } catch (error) {
            console.warn("Start Kalendarza V19.1:", error);
        }

        let cached = typeof crmPerfReadCacheV18 === "function"
            ? crmPerfReadCacheV18()
            : null;

        if (cached) {
            metrics18.cacheUsed = true;

            /*
             * Migracja V18 -> V19:
             * już posiadany poprawny session snapshot od razu staje się
             * persistent snapshotem. Nie czekamy na Google.
             */
            crmPerfWritePersistentCacheV19(cached);

            window.crmPerfSuppressCalendarRenderV18 = false;
            crmPerfApplySnapshotWithoutForcedRenderV19(
                cached,
                { forceRender: true }
            );
            metrics19.immediateRenderMs =
                Math.round(performance.now() - visualStart);

            /*
             * V19.4: skoro poprawny cache jest już widoczny, nie blokujemy
             * ręcznych renderów Kalendarza podczas background bootstrap.
             * Użytkownik może od razu zmieniać Dzień/Tydzień/Miesiąc,
             * datę i korzystać z lokalnie pokazanych danych.
             */
            window.crmPerfSuppressCalendarRenderV18 = false;
        } else {
            const persistent = crmPerfReadPersistentCacheV19();

            if (persistent?.data) {
                metrics19.persistentCacheUsed = true;
                metrics19.persistentCacheAgeMs =
                    Math.max(0, persistent.ageMs || 0);

                window.crmPerfSuppressCalendarRenderV18 = false;
                crmPerfApplySnapshotWithoutForcedRenderV19(
                    persistent.data,
                    { forceRender: true }
                );
                metrics19.immediateRenderMs =
                    Math.round(performance.now() - visualStart);

                /*
                 * V19.4: persistent cache został już wyrenderowany.
                 * Świeży request Google działa dalej w tle, ale nie zamraża UI.
                 */
                window.crmPerfSuppressCalendarRenderV18 = false;

                cached = persistent.data;
            }
        }

        /*
         * Udostępniamy dokładnie TEN request testerowi.
         * Tester nie tworzy drugiego bootstrap requestu.
         */
        window.crmPerfFreshBootstrapStateV191 = "pending";

        const freshPromise = crmPerfFetchBootstrapV18();
        window.crmPerfFreshBootstrapPromiseV191 = freshPromise;

        try {
            const fresh = await freshPromise;

            window.crmPerfFreshBootstrapStateV191 = "success";

            try {
                metrics19.payloadBytes = JSON.stringify(fresh).length;
            } catch (ignore) {
                metrics19.payloadBytes = 0;
            }

            metrics19.serverPerf = fresh?.perf || null;

            const freshFingerprint = crmPerfFingerprintV19(fresh);
            const previousFingerprint = window.crmPerfAppliedFingerprintV19;
            const changed = freshFingerprint !== previousFingerprint;

            metrics19.freshPayloadChanged = changed;

            window.crmPerfSuppressCalendarRenderV18 = false;

            const applied = crmPerfApplySnapshotWithoutForcedRenderV19(
                fresh,
                { forceRender: !previousFingerprint || changed }
            );

            metrics19.freshRenderSkipped = Boolean(
                previousFingerprint &&
                !changed &&
                applied?.rendered === false
            );

            crmPerfWriteCacheV18(fresh);
            crmPerfWritePersistentCacheV19(fresh);

            metrics18.freshApplied = true;
            crmSystemBootCompleteV2 = true;
            window.crmSystemBootCompleteV2 = true;
            return true;

        } catch (bootstrapError) {
            window.crmPerfFreshBootstrapStateV191 = "error";
            window.crmPerfFreshBootstrapErrorV191 =
                bootstrapError?.message || String(bootstrapError);

            console.warn("Bootstrap V19.1:", bootstrapError);

            if (cached) {
                crmSystemBootCompleteV2 = true;
                window.crmSystemBootCompleteV2 = true;

                if (typeof crmToast === "function") {
                    crmToast(
                        "Pokazuję ostatnie zapisane dane. Świeże dane pobiorę przy kolejnej synchronizacji.",
                        "error"
                    );
                }
                return true;
            }

            metrics18.fallbackUsed = true;
            window.crmPerfSuppressCalendarRenderV18 = false;

            const ok = await crmLoadSystemSequentialV13();

            if (ok) {
                crmPerfWriteCacheV18({});
                crmPerfWritePersistentCacheV19({});
            }
            return ok;
        }
    } finally {
        window.crmPerfSuppressCalendarRenderV18 = false;
        window.crmBootInProgressV2 = false;
        metrics18.bootFinishedAt = Date.now();
    }
}

window.crmWaitForFreshBootstrapV191 = async function(timeoutMs = 60000) {
    if (window.crmPerfFreshBootstrapStateV191 === "success") {
        return { success: true, state: "success" };
    }

    if (window.crmPerfFreshBootstrapStateV191 === "error") {
        return {
            success: false,
            state: "error",
            error: window.crmPerfFreshBootstrapErrorV191 || "Bootstrap error"
        };
    }

    const promise = window.crmPerfFreshBootstrapPromiseV191;
    if (!promise || typeof promise.then !== "function") {
        return {
            success: false,
            state: window.crmPerfFreshBootstrapStateV191 || "idle",
            error: "Brak aktywnego bootstrap promise"
        };
    }

    let timer = null;

    try {
        await Promise.race([
            promise,
            new Promise((_, reject) => {
                timer = window.setTimeout(
                    () => reject(new Error("Timeout oczekiwania na bootstrap V19.1")),
                    Math.max(1000, Number(timeoutMs) || 60000)
                );
            })
        ]);

        return {
            success: window.crmPerfFreshBootstrapStateV191 === "success",
            state: window.crmPerfFreshBootstrapStateV191,
            error: window.crmPerfFreshBootstrapErrorV191 || ""
        };
    } catch (error) {
        return {
            success: false,
            state: window.crmPerfFreshBootstrapStateV191,
            error: error?.message || String(error)
        };
    } finally {
        if (timer) window.clearTimeout(timer);
    }
};

loadSystem = async function() {
    if (crmInitialBootPromiseV2) return crmInitialBootPromiseV2;

    crmInitialBootPromiseV2 = crmLoadSystemFastV191()
        .finally(() => {
            window.crmBootInProgressV2 = false;
            window.setTimeout(() => {
                crmInitialBootPromiseV2 = null;
            }, 250);
        });

    return crmInitialBootPromiseV2;
};

window.crmRestartSystemLoadV2 = async function() {
    crmInitialBootPromiseV2 = null;

    try { crmReadQueueV11.length = 0; } catch (ignore) {}
    try { crmReadByKeyV11.clear(); } catch (ignore) {}
    try { sessionStorage.removeItem(CRM_PERF_CACHE_KEY_V18); } catch (ignore) {}
    try { localStorage.removeItem(CRM_PERF_PERSIST_KEY_V19); } catch (ignore) {}

    return loadSystem();
};

/* KONIEC API PERFORMANCE V19.1 */


/* ==========================================================================
   API TRANSPORT V19.3 — STABILNY REDIRECT GOOGLE / SAFE READ RETRY
   2026-08-19

   Cel:
   - nie zmieniać logiki zapisów;
   - GET: przy chwilowym 404/błędzie transportu wykonać JEDNO ponowienie;
   - POST tylko dla akcji CZYSTO ODCZYTOWYCH: przy chwilowym 404/błędzie
     transportu wykonać JEDNO ponowienie;
   - POST-y zmieniające dane NIGDY nie są automatycznie ponawiane;
   - dla file:// zachowujemy istniejący JSONP V13;
   - brak pollingu i brak cyklicznych retry.
   ========================================================================== */

const crmFetchJsonBeforeV193 = crmFetchJsonV12;
const crmPostJsonBeforeV193 = crmPostJsonV12;

const CRM_READ_ONLY_POST_ACTIONS_V193 = new Set([
    "getAdminInbox",
    "getContactFormRequests",
    "getBookingRequests",
    "getEffectiveSchedule",
    "getFamilySchedule",
    "getTestReports",
    "runPoint35Diagnostics",
    "getClientCRMProfile",
    "getSmartNextVisit"
]);

function crmTransientRedirectErrorV193(error) {
    const message = String(error?.message || error || "");
    return (
        /HTTP\s*404/i.test(message) ||
        /Google Web App zwrócił błąd ładowania GET/i.test(message) ||
        /Failed to fetch/i.test(message) ||
        /NetworkError/i.test(message) ||
        /Load failed/i.test(message)
    );
}

function crmWaitV193(ms) {
    return new Promise(resolve => window.setTimeout(resolve, ms));
}

/*
 * HTTPS / GitHub:
 * normalny fetch -> przy chwilowym błędzie redirectu tylko 1 ponowienie fetch.
 *
 * file://:
 * pozostaje dotychczasowy V13 JSONP, bo tam fetch po redirectach Google
 * jest niestabilny z powodu origin file://.
 */
crmFetchJsonV12 = async function(url, options = {}) {
    if (window.location && window.location.protocol === "file:") {
        return crmFetchJsonBeforeV193(url, options);
    }

    try {
        return await crmFetchJsonBeforeV193(url, options);
    } catch (error) {
        if (!crmTransientRedirectErrorV193(error)) {
            throw error;
        }

        console.warn(
            "GET Google: chwilowy błąd redirectu — jedno ponowienie V19.3:",
            error?.message || error
        );

        await crmWaitV193(450);
        return crmFetchJsonBeforeV193(url, options);
    }
};

window.crmFetchJsonV12 = crmFetchJsonV12;
window.crmFetchWholeJsonV11 = crmFetchJsonV12;

/*
 * POST:
 * retry WYŁĄCZNIE dla akcji odczytowych.
 * create/edit/delete/cancel/save itd. nigdy nie są tu ponawiane.
 */
crmPostJsonV12 = async function(payload, options = {}) {
    const action = String(payload?.action || "");
    const readOnly = CRM_READ_ONLY_POST_ACTIONS_V193.has(action);

    try {
        return await crmPostJsonBeforeV193(payload, options);
    } catch (error) {
        if (!readOnly || !crmTransientRedirectErrorV193(error)) {
            throw error;
        }

        console.warn(
            `POST read-only ${action}: chwilowy błąd redirectu — jedno ponowienie V19.3:`,
            error?.message || error
        );

        await crmWaitV193(450);
        return crmPostJsonBeforeV193(payload, options);
    }
};

window.crmPostJsonV12 = crmPostJsonV12;

/*
 * Aktualizujemy klasyfikację crmTestPost, aby wszystkie odczyty miały
 * wspólną kolejkę/prioritet odczytowy. Logika zapisu pozostaje bez zmian.
 */
crmTestPost = function(payload, options = {}) {
    const action = String(payload?.action || "POST");
    const readLike = CRM_READ_ONLY_POST_ACTIONS_V193;
    const stablePayload = readLike.has(action)
        ? JSON.stringify(payload || {})
        : "";
    const key = readLike.has(action)
        ? `POST:${action}:${stablePayload}`
        : "";

    return crmServerLaneTaskV12(
        key,
        () => crmPostJsonV12(payload, {
            timeoutMs:
                Number(options.timeoutMs) ||
                (readLike.has(action)
                    ? 45000
                    : CRM_SERVER_WRITE_TIMEOUT_V12)
        }),
        {
            priority: readLike.has(action) ? 30 : 80
        }
    );
};

window.crmTestPost = crmTestPost;

crmPost = async function(payload) {
    const result = await crmTestPost(payload || {});
    if (!result || typeof result !== "object") {
        throw new Error("API zwróciło nieprawidłową odpowiedź");
    }
    return result;
};

crmExtendedPost = async function(action, payload) {
    return crmTestPost(Object.assign({ action }, payload || {}));
};

window.crmTransportVersionV193 = "19.3-safe-read-retry";

/* KONIEC API TRANSPORT V19.3 */

/* ==========================================================================
   ADMIN CALENDAR INTERACTION FIX V19.4 — 2026-08-19
   Po wyrenderowaniu session/persistent cache Kalendarz pozostaje interaktywny
   podczas background bootstrap. Brak oczekiwania na Google przy zmianie
   Dzień / Tydzień / Miesiąc i innych lokalnych renderach.
   ========================================================================== */
window.crmCalendarInteractionFixV194 = "19.4-instant-calendar-view";
/* KONIEC V19.4 */

