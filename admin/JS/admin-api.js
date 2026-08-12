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
