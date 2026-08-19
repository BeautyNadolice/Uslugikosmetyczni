/* ==========================================================================
   CRM TEST LIGHT V6 — PERFORMANCE ACTIONS AFTER V20
   2026-08-16

   CEL:
   Zmierzyć realny czas najważniejszych operacji CRM bez zmiany produkcyjnej
   logiki. Test tworzy wyłącznie dane z bezpiecznym markerem CRM_E2E_...
   i zawsze uruchamia cleanup w finally.

   To jest pomiar po optymalizacji V20. Czasy same w sobie nie powodują błędu testu.
   BŁĄD = operacja nie wykonała się poprawnie.
   ========================================================================== */

const CRM_TEST_LIGHT_VERSION = "7.1.0";
const CRM_TEST_LIGHT_SCOPE = "PERFORMANCE_INDEX_AFTER_V21";
const CRM_ACTIONS_INDEX_URL_V5 =
    "https://script.google.com/macros/s/AKfycbz__JS6RJOB8VwEvbmXc4J_22k3bpBLr-oCiogTIhzz3sXc5DzXfbggnfa8VhInwuWP2g/exec";

function crmActionsMarkerV5() {
    return `CRM_E2E_${Date.now()}_${Math.random().toString(36).slice(2,8).toUpperCase()}`;
}

function crmActionsCompactV5(value) {
    if (value === undefined) return "";
    if (value === null) return null;
    if (value instanceof Error) return { message:value.message };
    if (Array.isArray(value)) return { count:value.length };

    if (typeof value === "object") {
        const out = {};
        [
            "success","status","eventId","appointmentId","operationId",
            "updated","deleted","deletedBy","duplicatePrevented",
            "calendarEventDeleted","calendarEventAlreadyMissing",
            "newCount","count","requestId","error","perf"
        ].forEach(key => {
            if (Object.prototype.hasOwnProperty.call(value,key)) out[key] = value[key];
        });

        if (Array.isArray(value.appointments)) out.appointments = value.appointments.length;
        if (Array.isArray(value.items)) out.items = value.items.length;
        if (Array.isArray(value.adminSlots)) out.adminSlots = value.adminSlots.length;
        if (Array.isArray(value.indexSlots)) out.indexSlots = value.indexSlots.length;

        return Object.keys(out).length ? out : value;
    }
    return value;
}

function crmActionsAddV5(report,status,name,details) {
    crmTestAdd(report,status,name,details);
}

function crmActionsAssertV5(report,condition,name,okDetails,failDetails) {
    crmActionsAddV5(
        report,
        condition ? "OK" : "BLAD",
        name,
        condition ? okDetails : failDetails
    );
    return Boolean(condition);
}

async function crmActionsPostV5(payload, timeoutMs=60000) {
    if (typeof crmTestPost !== "function") throw new Error("Brak crmTestPost()");

    const requestPayload = Object.assign(
        {},
        payload,
        {_perfActions:Date.now()}
    );

    /*
     * V7.1 — chwilowy redirect Google może zwrócić HTTP 404 już po
     * prawidłowym wykonaniu Apps Script.
     *
     * Retry jest dozwolony WYŁĄCZNIE dla bezpiecznych akcji testowych:
     * - crmE2EFindFreeSlots: czysty odczyt,
     * - crmE2EInspect: czysty odczyt,
     * - crmE2ECleanup: idempotentny cleanup tylko po unikalnym markerze testu.
     *
     * Normalne create/edit/delete/cancel/save nadal NIE są tutaj ponawiane.
     */
    const retrySafeActionsV71 = new Set([
        "crmE2EFindFreeSlots",
        "crmE2EInspect",
        "crmE2ECleanup"
    ]);

    const action = String(requestPayload?.action || "");

    try {
        return await crmTestPost(requestPayload, {timeoutMs});
    } catch (error) {
        const message = String(error?.message || error || "");
        const transient =
            /HTTP\s*404/i.test(message) ||
            /Failed to fetch/i.test(message) ||
            /NetworkError/i.test(message) ||
            /Load failed/i.test(message);

        if (!retrySafeActionsV71.has(action) || !transient) {
            throw error;
        }

        console.warn(
            `CRM Test Light V7.1: ${action} — chwilowy błąd transportu, jedno bezpieczne ponowienie.`,
            message
        );

        await new Promise(resolve => window.setTimeout(resolve, 650));

        return crmTestPost(
            Object.assign({}, requestPayload, {
                _perfActionsRetryV71: Date.now()
            }),
            {timeoutMs}
        );
    }
}

async function crmActionsGetV5(params, timeoutMs=50000) {
    if (typeof crmTestGet !== "function") throw new Error("Brak crmTestGet()");
    return crmTestGet(
        Object.assign({}, params, {_perfActions:Date.now()}),
        {timeoutMs}
    );
}

async function crmActionsIndexPostV5(payload, timeoutMs=60000) {
    const controller = typeof AbortController !== "undefined"
        ? new AbortController()
        : null;
    let timer = null;

    try {
        const whole = (async () => {
            const response = await fetch(CRM_ACTIONS_INDEX_URL_V5, {
                method:"POST",
                headers:{"Content-Type":"text/plain"},
                body:JSON.stringify(Object.assign({},payload,{diagnosticTest:true})),
                signal:controller ? controller.signal : undefined
            });

            const text = await response.text();
            if (!response.ok) {
                throw new Error(`INDEX HTTP ${response.status}: ${text.slice(0,400)}`);
            }

            try { return JSON.parse(text); }
            catch (error) {
                throw new Error("INDEX nie zwrócił JSON: " + text.slice(0,400));
            }
        })();

        const deadline = new Promise((_,reject) => {
            timer = window.setTimeout(() => {
                try { controller?.abort(); } catch (ignore) {}
                reject(new Error(`INDEX timeout ${Math.round(timeoutMs/1000)} s`));
            }, timeoutMs);
        });

        return await Promise.race([whole,deadline]);
    } finally {
        if (timer) window.clearTimeout(timer);
    }
}

function crmActionsIsoDayV5(iso) {
    return String(iso || "").slice(0,10);
}

function crmActionsPlusMinutesV5(iso, minutes) {
    const d = new Date(String(iso));
    if (Number.isNaN(d.getTime())) return "";
    d.setMinutes(d.getMinutes() + Number(minutes || 0));
    const p = v => String(v).padStart(2,"0");
    return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}:00`;
}

async function crmActionsTimedV5(report, timings, name, fn, validate) {
    const started = performance.now();
    try {
        const result = await fn();
        const ms = Math.max(0, Math.round(performance.now() - started));
        const ok = typeof validate === "function" ? Boolean(validate(result)) : true;

        timings.push({
            name,
            ms,
            success:ok
        });

        crmActionsAddV5(
            report,
            ok ? "OK" : "BLAD",
            name,
            {
                ms,
                result:crmActionsCompactV5(result)
            }
        );

        return result;
    } catch (error) {
        const ms = Math.max(0, Math.round(performance.now() - started));
        timings.push({
            name,
            ms,
            success:false,
            error:error?.message || String(error)
        });

        crmActionsAddV5(
            report,
            "BLAD",
            name,
            {
                ms,
                error:error?.message || String(error)
            }
        );

        throw error;
    }
}

async function crmActionsMeasureUiV5(report,timings,name,fn) {
    const started = performance.now();
    try {
        await fn();
        await new Promise(resolve => requestAnimationFrame(() => resolve()));
        const ms = Math.max(0, Math.round(performance.now() - started));
        timings.push({name,ms,success:true,kind:"UI"});
        crmActionsAddV5(report,"OK",name,{ms,kind:"UI/local"});
        return ms;
    } catch (error) {
        const ms = Math.max(0, Math.round(performance.now() - started));
        timings.push({name,ms,success:false,kind:"UI",error:error?.message||String(error)});
        crmActionsAddV5(report,"BLAD",name,{ms,error:error?.message||String(error)});
        throw error;
    }
}

function crmActionsActiveTabV5() {
    if (typeof crmDetectActiveTabV6 === "function") {
        try { return crmDetectActiveTabV6(); } catch (ignore) {}
    }
    const visible = Array.from(document.querySelectorAll(".tab-page"))
        .find(node => getComputedStyle(node).display !== "none");
    return visible?.id?.replace(/^tab-/,"") || "kalendarz";
}

async function runCRMTestLight() {
    if (crmTestIsRunning) {
        if (typeof crmToast === "function") {
            crmToast("Inny test jest już uruchomiony.", "error");
        }
        return;
    }

    crmResetTestPanelForRun("CRM Test Light");
    crmTestSetRunning(true);

    const report = crmTestCreateReport("CRM_TEST_LIGHT", CRM_TEST_LIGHT_VERSION);
    report.scope = CRM_TEST_LIGHT_SCOPE;
    crmLastTestReport = report;

    const started = Date.now();
    const marker = crmActionsMarkerV5();
    const timings = [];

    const savedTab = crmActionsActiveTabV5();
    const savedView =
        typeof calendarViewMode !== "undefined" ? calendarViewMode : null;
    const savedDate =
        typeof selectedCalendarDate !== "undefined" && selectedCalendarDate
            ? new Date(selectedCalendarDate)
            : null;
    const savedDiagnosticsMode = window.crmDiagnosticsNetworkModeV11;

    let cleanupStarted = false;
    let adminSlots = [];
    let indexSlots = [];
    let serviceName = "";
    let duration = 15;
    let clientPhone = "";
    let clientName = "";
    let adminBooking = null;
    let editedBooking = null;
    let indexBooking = null;
    let blockEventId = "";

    report.testData = {marker};

    try {
        window.crmDiagnosticsNetworkModeV11 = true;

        crmTestSetProgress(3,"CRM Test Light: przygotowanie testu ACTIONS…");

        const preCleanup = await crmActionsTimedV5(
            report,
            timings,
            "SETUP — pre-cleanup markera",
            () => crmActionsPostV5({action:"crmE2ECleanup",marker},60000),
            result => result?.success === true
        );

        // Do not include cached UI startup as an action; V19.1 already measured it.
        if (typeof window.crmWaitForFreshBootstrapV191 === "function") {
            await window.crmWaitForFreshBootstrapV191(60000);
        }

        crmTestSetProgress(8,"CRM Test Light: przygotowanie usługi i wolnych terminów…");

        let services = Array.isArray(window.currentServices)
            ? window.currentServices
            : (typeof currentServices !== "undefined" && Array.isArray(currentServices)
                ? currentServices
                : []);

        if (!services.length) {
            services = await crmActionsTimedV5(
                report,
                timings,
                "ODCZYT — Cennik",
                () => crmActionsGetV5({getPrices:"true"},45000),
                result => Array.isArray(result)
            );
        }

        const svc = Array.isArray(services)
            ? services.find(item => item && item.name)
            : null;

        serviceName = String(svc?.name || "Test Performance");
        duration = Math.max(5, Math.min(30, Number(svc?.duration) || 15));

        const free = await crmActionsTimedV5(
            report,
            timings,
            "SETUP — wyszukanie bezpiecznych wolnych terminów",
            () => crmActionsPostV5({
                action:"crmE2EFindFreeSlots",
                marker,
                duration
            },60000),
            result =>
                result?.success === true &&
                Array.isArray(result.adminSlots) &&
                result.adminSlots.length >= 8 &&
                Array.isArray(result.indexSlots) &&
                result.indexSlots.length >= 1
        );

        adminSlots = Array.isArray(free?.adminSlots) ? free.adminSlots : [];
        indexSlots = Array.isArray(free?.indexSlots) ? free.indexSlots : [];

        if (adminSlots.length < 8 || indexSlots.length < 1) {
            throw new Error("Za mało bezpiecznych wolnych terminów do PERFORMANCE ACTIONS.");
        }

        crmTestSetProgress(16,"CRM Test Light: Klienci — zapis/edycja/profil…");

        clientPhone = `TEST-${marker}-CLIENT`;
        clientName = `${marker} CLIENT`;

        await crmActionsTimedV5(
            report,
            timings,
            "KLIENT — dodanie",
            () => crmActionsPostV5({
                action:"saveClient",
                oldPhone:"",
                client:{
                    name:clientName,
                    phone:clientPhone,
                    visits:0,
                    cancelled:0,
                    lastVisit:""
                }
            }),
            result => result?.success === true
        );

        await crmActionsTimedV5(
            report,
            timings,
            "KLIENT — edycja",
            () => crmActionsPostV5({
                action:"saveClient",
                oldPhone:clientPhone,
                client:{
                    name:clientName + " EDIT",
                    phone:clientPhone,
                    visits:0,
                    cancelled:0,
                    lastVisit:""
                }
            }),
            result => result?.success === true
        );

        await crmActionsTimedV5(
            report,
            timings,
            "KLIENT — profil CRM",
            () => crmActionsPostV5({
                action:"getClientCRMProfile",
                phone:clientPhone
            }),
            result => result?.success === true && Boolean(result.profile)
        );

        crmTestSetProgress(27,"CRM Test Light: wizyta ADMIN — create/edit/cancel…");

        const operationCreate = `${marker}_PERF_CREATE`;
        const createPayload = {
            action:"createBooking",
            operationId:operationCreate,
            phone:`TEST-${marker}-ADMIN`,
            name:`${marker} ADMIN ACTION`,
            service:serviceName,
            date:adminSlots[0].iso,
            duration,
            rodo:marker,
            bookingSource:"ADMIN"
        };

        adminBooking = await crmActionsTimedV5(
            report,
            timings,
            "WIZYTA ADMIN — utworzenie",
            () => crmActionsPostV5(createPayload,60000),
            result => result?.success === true && Boolean(result.eventId)
        );

        const editPayload = {
            action:"createBooking",
            editFlag:true,
            oldEventId:adminBooking?.eventId || "",
            oldDate:adminSlots[0].iso,
            oldName:createPayload.name,
            operationId:`${marker}_PERF_EDIT`,
            phone:createPayload.phone,
            name:createPayload.name,
            service:serviceName,
            date:adminSlots[2].iso,
            duration,
            rodo:marker,
            bookingSource:"ADMIN"
        };

        editedBooking = await crmActionsTimedV5(
            report,
            timings,
            "WIZYTA ADMIN — edycja / przeniesienie",
            () => crmActionsPostV5(editPayload,60000),
            result => result?.success === true && Boolean(result.eventId)
        );

        await crmActionsTimedV5(
            report,
            timings,
            "KALENDARZ — odczyt po edycji",
            () => {
                const d = new Date(String(adminSlots[2].iso));
                const from = new Date(d);
                const to = new Date(d);
                from.setDate(from.getDate()-1);
                to.setDate(to.getDate()+1);
                const fmt = x =>
                    `${x.getFullYear()}-${String(x.getMonth()+1).padStart(2,"0")}-${String(x.getDate()).padStart(2,"0")}`;
                return crmActionsGetV5({
                    checkBusy:"true",
                    rangeStart:fmt(from),
                    rangeEnd:fmt(to)
                },50000);
            },
            result => Array.isArray(result?.appointments)
        );

        await crmActionsTimedV5(
            report,
            timings,
            "WIZYTA ADMIN — anulowanie przez klienta",
            () => crmActionsPostV5({
                action:"recordAppointmentLifecycle",
                eventId:editedBooking?.eventId || "",
                phone:createPayload.phone,
                clientName:createPayload.name,
                service:serviceName,
                operation:"ANULOWANIE",
                initiator:"KLIENT",
                oldDate:adminSlots[2].iso,
                reason:marker,
                deleteCalendarEvent:true
            },60000),
            result =>
                result?.success === true &&
                String(result.status || "") === "ANULOWANA_KLIENT"
        );

        crmTestSetProgress(43,"CRM Test Light: blokada czasu — create/edit/delete…");

        const blockDate = crmActionsIsoDayV5(adminSlots[4].iso);
        const blockStart = String(adminSlots[4].time);
        const blockEnd = crmActionsPlusMinutesV5(
            adminSlots[4].iso,
            duration + 20
        ).slice(11,16);
        const blockTitle = `${marker} PERF BLOCK`;

        const block = await crmActionsTimedV5(
            report,
            timings,
            "BLOKADA — utworzenie",
            () => crmActionsPostV5({
                action:"blockTime",
                blockType:"hours",
                date:blockDate,
                startTime:blockStart,
                endTime:blockEnd,
                title:blockTitle
            },60000),
            result => result?.success === true && Boolean(result.eventId)
        );

        blockEventId = block?.eventId || "";

        const blockEditDate = crmActionsIsoDayV5(adminSlots[6].iso);
        const blockEditStart = String(adminSlots[6].time);
        const blockEditEnd = crmActionsPlusMinutesV5(
            adminSlots[6].iso,
            duration + 20
        ).slice(11,16);

        await crmActionsTimedV5(
            report,
            timings,
            "BLOKADA — edycja",
            () => crmActionsPostV5({
                action:"updateBlockTime",
                eventId:blockEventId,
                date:blockEditDate,
                startTime:blockEditStart,
                endTime:blockEditEnd,
                title:blockTitle + " EDIT"
            },60000),
            result => result?.success === true && result?.updated === true
        );

        await crmActionsTimedV5(
            report,
            timings,
            "BLOKADA — usunięcie",
            () => crmActionsPostV5({
                action:"deleteBlockTime",
                eventId:blockEventId,
                start:adminSlots[6].iso,
                end:crmActionsPlusMinutesV5(adminSlots[6].iso,duration+20),
                title:blockTitle + " EDIT"
            },60000),
            result => result?.success === true
        );
        blockEventId = "";

        crmTestSetProgress(57,"CRM Test Light: prawdziwa rezerwacja INDEX…");

        const idxPhone = `TEST-${marker}-INDEX`;
        const idxName = `${marker} INDEX ACTION`;

        indexBooking = await crmActionsTimedV5(
            report,
            timings,
            "INDEX — utworzenie wizyty",
            () => crmActionsIndexPostV5({
                action:"createBooking",
                phone:idxPhone,
                name:idxName,
                service:serviceName,
                date:indexSlots[0].iso,
                duration,
                rodo:"Tak",
                bookingSource:"INDEX"
            },60000),
            result => result?.success === true && Boolean(result.eventId)
        );

        if (indexBooking?.eventId) {
            await crmActionsTimedV5(
                report,
                timings,
                "INDEX — usunięcie wizyty przez ADMIN",
                () => crmActionsPostV5({
                    action:"createBooking",
                    deleteFlag:true,
                    eventId:indexBooking.eventId,
                    date:indexSlots[0].iso,
                    name:idxName
                },60000),
                result => result?.success === true
            );
        }

        crmTestSetProgress(70,"CRM Test Light: Skrzynka i odświeżenie Kalendarza…");

        await crmActionsTimedV5(
            report,
            timings,
            "SKRZYNKA — lekki ping",
            () => crmActionsGetV5({adminInboxPing:"true"},40000),
            result =>
                result?.success === true &&
                typeof result.newCount !== "undefined"
        );

        await crmActionsTimedV5(
            report,
            timings,
            "SKRZYNKA — pełny odczyt",
            () => crmActionsGetV5({adminInbox:"true"},50000),
            result => result?.success === true && Array.isArray(result.items)
        );

        /*
         * Realny frontendowy refresh. Na czas tej jednej operacji wyłączamy
         * diagnostics guard, bo crmLightSyncCalendarData celowo ignoruje sieć
         * podczas testów diagnostycznych.
         */
        if (typeof crmRetryCalendarLightSyncV6 === "function") {
            const oldDiag = window.crmDiagnosticsNetworkModeV11;
            window.crmDiagnosticsNetworkModeV11 = false;
            try {
                await crmActionsTimedV5(
                    report,
                    timings,
                    "KALENDARZ UI — pełne lekkie odświeżenie po akcji",
                    () => crmRetryCalendarLightSyncV6("perf-actions-v5"),
                    result => result === null || Array.isArray(result?.appointments)
                );
            } finally {
                window.crmDiagnosticsNetworkModeV11 = oldDiag;
            }
        } else {
            crmActionsAddV5(
                report,
                "BLAD",
                "KALENDARZ UI — pełne lekkie odświeżenie po akcji",
                "Brak crmRetryCalendarLightSyncV6()"
            );
        }

        crmTestSetProgress(82,"CRM Test Light: lokalna szybkość nawigacji…");

        if (typeof switchTab === "function") {
            await crmActionsMeasureUiV5(
                report,
                timings,
                "UI — przejście do Klienci z danych w RAM",
                () => switchTab("klienci")
            );

            await crmActionsMeasureUiV5(
                report,
                timings,
                "UI — powrót do Kalendarza z danych w RAM",
                () => switchTab("kalendarz")
            );
        }

        crmTestSetProgress(88,"CRM Test Light: usunięcie klienta testowego…");

        await crmActionsTimedV5(
            report,
            timings,
            "KLIENT — usunięcie",
            () => crmActionsPostV5({
                action:"deleteClient",
                phone:clientPhone
            }),
            result => result?.success === true
        );

        clientPhone = "";

        crmTestSetProgress(92,"CRM Test Light: podsumowanie czasów…");

        const ranked = timings
            .filter(item => !String(item.name).startsWith("SETUP"))
            .slice()
            .sort((a,b) => b.ms - a.ms);

        report.performanceActions = ranked;

        crmActionsAddV5(
            report,
            "OK",
            "PERFORMANCE ACTIONS — ranking najwolniejszych operacji",
            ranked.map((item,index) => ({
                pozycja:index+1,
                operacja:item.name,
                ms:item.ms,
                success:item.success
            }))
        );

        const baselineV5 = {
            "KLIENT — dodanie":1728,
            "KLIENT — edycja":2128,
            "KLIENT — profil CRM":10213,
            "WIZYTA ADMIN — utworzenie":7503,
            "WIZYTA ADMIN — edycja / przeniesienie":6809,
            "KALENDARZ — odczyt po edycji":2904,
            "WIZYTA ADMIN — anulowanie przez klienta":9070,
            "BLOKADA — utworzenie":2674,
            "BLOKADA — edycja":4488,
            "BLOKADA — usunięcie":9800,
            "INDEX — utworzenie wizyty":6048,
            "INDEX — usunięcie wizyty przez ADMIN":3812,
            "SKRZYNKA — lekki ping":2827,
            "SKRZYNKA — pełny odczyt":2664,
            "KALENDARZ UI — pełne lekkie odświeżenie po akcji":2389,
            "KLIENT — usunięcie":2035
        };

        const comparisonV20 = ranked
            .filter(item => Object.prototype.hasOwnProperty.call(baselineV5,item.name))
            .map(item => {
                const before = baselineV5[item.name];
                const delta = item.ms - before;
                const percent = before
                    ? Math.round((delta / before) * 100)
                    : 0;
                return {
                    operacja:item.name,
                    przed_ms:before,
                    teraz_ms:item.ms,
                    roznica_ms:delta,
                    zmiana_proc:percent
                };
            })
            .sort((a,b) => a.zmiana_proc - b.zmiana_proc);

        crmActionsAddV5(
            report,
            "OK",
            "PERFORMANCE V20 — porównanie z baseline V5",
            comparisonV20
        );

        const backendOnly = ranked.filter(item => item.kind !== "UI");
        const slowest = backendOnly[0] || null;

        crmActionsAddV5(
            report,
            "OK",
            "PERFORMANCE ACTIONS — najwolniejsza operacja backend",
            slowest
                ? {name:slowest.name,ms:slowest.ms}
                : "Brak pomiaru"
        );

    } catch (error) {
        crmActionsAddV5(
            report,
            "BLAD",
            "Główny przebieg PERFORMANCE ACTIONS",
            error?.message || String(error)
        );
    } finally {
        crmTestSetProgress(96,"CRM Test Light: cleanup danych testowych…");

        try {
            cleanupStarted = true;
            const cleanup = await crmActionsTimedV5(
                report,
                timings,
                "CLEANUP — dane PERFORMANCE ACTIONS",
                () => crmActionsPostV5({
                    action:"crmE2ECleanup",
                    marker
                },60000),
                result => result?.success === true
            );

            const leftover = await crmActionsPostV5({
                action:"crmE2EInspect",
                marker
            },50000);

            const rows = Number(leftover?.rows || 0);
            const events = Number(leftover?.calendarEvents || 0);

            crmActionsAssertV5(
                report,
                rows === 0 && events === 0,
                "Pozostałości po PERFORMANCE ACTIONS",
                {rows,calendarEvents:events},
                {rows,calendarEvents:events,result:crmActionsCompactV5(leftover)}
            );
        } catch (cleanupError) {
            crmActionsAddV5(
                report,
                "BLAD",
                "Cleanup PERFORMANCE ACTIONS",
                cleanupError?.message || String(cleanupError)
            );
        }

        try {
            if (savedView && typeof setCalendarView === "function") {
                setCalendarView(savedView);
            }
            if (
                savedDate &&
                typeof selectedCalendarDate !== "undefined"
            ) {
                selectedCalendarDate = new Date(savedDate);
            }
            if (typeof switchTab === "function") {
                await switchTab(savedTab || "kalendarz");
            }
        } catch (restoreError) {
            console.warn("PERFORMANCE ACTIONS: restore UI", restoreError);
        }

        window.crmDiagnosticsNetworkModeV11 = savedDiagnosticsMode;

        crmTestFinish(report, started);
        crmTestSetProgress(
            100,
            "CRM Test Light PERFORMANCE ACTIONS zakończony: " + report.status + "."
        );
        crmTestSetRunning(false);
    }
}

window.runCRMTestLight = runCRMTestLight;

/* KONIEC CRM TEST LIGHT V5 */


/* CRM TEST LIGHT V7 — INDEX PERFORMANCE V21 */
window.crmTestLightPerformanceIndexV21 = "7.1.0";


/* CRM TEST LIGHT V7.1 — SAFE DIAGNOSTIC TRANSPORT RETRY */
window.crmTestLightSafeDiagnosticRetryV71 = "7.1.0";
