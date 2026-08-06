/* ==========================================================================
   CORE. URUCHOMIENIE I WSPOLNY STAN ADMIN
   Plik wygenerowany zachowawczo z admin.js. Kolejnosc elementow wewnatrz
   modulu odpowiada kolejnosci w monolicie. Nie zmieniac nazw globalnych.
   ========================================================================== */

/* ----- CORE.1. ALLOWED_EMAIL (oryginalna linia 15) ----- */
const ALLOWED_EMAIL =
"strsasa@gmail.com";

/* ----- CORE.2. allCategories (oryginalna linia 28) ----- */
let allCategories = [];

/* ----- CORE.3. isBlockingTime (oryginalna linia 38) ----- */
let isBlockingTime = false;

/* ----- CORE.4. blok z linii 44 (oryginalna linia 44) ----- */
/* ==========================================================
   START APP
   ========================================================== */

document.addEventListener(
    "DOMContentLoaded",
    initializeCRM
);

/* ----- CORE.5. initializeCRM (oryginalna linia 49) ----- */
async function initializeCRM() {

    // Dostęp otwarty: autoryzacja Google i logowanie testowe są wyłączone.
    await showAdminPanel();

}

/* ----- CORE.6. checkAuthSession (oryginalna linia 61) ----- */
/* ==========================================================
   AUTH
   ========================================================== */

function checkAuthSession() {

    // Funkcja pozostaje dla zgodności ze starszym kodem, ale nie blokuje dostępu.
    showAdminPanel();

}

/* ----- CORE.7. showLoginScreen (oryginalna linia 69) ----- */
function showLoginScreen() {

    document.getElementById(
        "login-modal"
    ).style.display = "flex";

}

/* ----- CORE.8. showAdminPanel (oryginalna linia 78) ----- */
async function showAdminPanel() {

    const loginModal = document.getElementById("login-modal");
    if (loginModal) loginModal.style.display = "none";

    document.getElementById(
        "admin-panel-wrapper"
    ).style.display = "flex";

    try{

        await loadSystem();

    }catch(e){

        console.error(e);

    }

}

/* ----- CORE.9. logout (oryginalna linia 112) ----- */
function logout() {

    localStorage.clear();

    location.reload();

}

/* ----- CORE.10. openCreateModal (oryginalna linia 1683) ----- */
function openCreateModal() {

    currentEditingAppointment =
        null;

    populateAppointmentDropdowns();

    document.getElementById(
        "modalTitleAppointment"
    ).innerText =
        "Utwórz nową wizytę";

    document.getElementById(
        "appointmentName"
    ).value =
        "";

    document.getElementById(
        "appointmentPhone"
    ).value =
        "";

    document.getElementById(
        "appointmentService"
    ).value =
        "";

    document.getElementById(
        "appointmentDuration"
    ).value =
        "45";

    document.getElementById(
        "appointmentDateTime"
    ).value =
        "";

    document.getElementById(
        "appointmentModal"
    ).style.display =
        "flex";

}

/* ----- CORE.11. setInputValue (oryginalna linia 3032) ----- */
/* ==========================================================
   SETTINGS FORM POPULATE
   ========================================================== */

function setInputValue(id, value) {
    const input =
        document.getElementById(id);

    if (input) {
        input.value =
            value !== undefined && value !== null
                ? value
                : "";
    }
}

/* ----- CORE.12. blok z linii 3193 (oryginalna linia 3193) ----- */
/* ==========================================================
   DASHBOARD AUTO REFRESH
   ========================================================== */

setInterval(()=>{

    renderDashboard();

},30000);

/* ----- CORE.13. handleCredentialResponse (oryginalna linia 3223) ----- */
/* ==========================================================
   GOOGLE LOGIN CALLBACK
   ========================================================== */

function handleCredentialResponse(response){

    console.log(
        response
    );

}

/* ----- CORE.14. CRM_BOOKING_MODES (oryginalna linia 3618) ----- */
/* ==========================================================
   END OF PART 5
   ========================================================== */


/* ==========================================================
   DUZY PAKIET CRM 3.3E-3.3H
   HISTORIA, RYZYKO, KOLEJNY WIZYT I GRAFIK RODZINNY
   ========================================================== */

const CRM_BOOKING_MODES = {
    STANDARD: "STANDARDOWY",
    CONFIRMATION: "WYMAGA_POTWIERDZENIA",
    RESTRICTED: "REZERWACJA_OGRANICZONA",
    CONTACT_ONLY: "TYLKO_KONTAKT"
};

/* ----- CORE.15. initializeExtendedCRM (oryginalna linia 3629) ----- */
async function initializeExtendedCRM() {
    const response = await crmExtendedPost("initializeCRMExtensions");
    if (!response || !response.success) {
        throw new Error(response && response.error ? response.error : "Nie udało się przygotować modułów CRM");
    }
    return response;
}

/* ----- CORE.16. blok z linii 3797 (oryginalna linia 3797) ----- */
document.addEventListener("DOMContentLoaded", function () {
    ensureAppointmentLifecycleButtons();
    initializeExtendedCRM().catch(error => console.error("Inicjalizacja rozszerzonego CRM:", error));
});

/* ----- CORE.17. blok z linii 3953 (oryginalna linia 3953) ----- */
document.addEventListener("DOMContentLoaded", () => {
    const dt = document.getElementById("appointmentDateTime");
    if (dt) dt.step = "300";
    ensureSchedulePanel();
    ensureScheduleCalendarUnderMainCalendar();
    syncCategoryColorsAndRefresh().catch(console.error);
    refreshSchedulePanel().catch(console.error);
    renderWorkScheduleCalendar().catch(console.error);
});

/* ----- CORE.18. crmUiOperationLock (oryginalna linia 3991) ----- */
/* KONIEC ETAPU 3.4 I 3.5 */


/* ==========================================================
   PAKIET POPRAWEK PO ZYWYM TESCIE ADMIN
   ========================================================== */
let crmUiOperationLock = false;

/* ----- CORE.19. crmEnsureUiLayer (oryginalna linia 3993) ----- */
function crmEnsureUiLayer() {
    if (!document.getElementById("crm-toast-container")) {
        const host = document.createElement("div");
        host.id = "crm-toast-container";
        host.style.cssText = "position:fixed;right:18px;bottom:18px;z-index:99999;display:flex;flex-direction:column;gap:8px;max-width:380px";
        document.body.appendChild(host);
    }
}

/* ----- CORE.20. crmSetActionGroupBusy (oryginalna linia 4022) ----- */
function crmSetActionGroupBusy(busy, activeButton, busyText) {
    const box = document.getElementById("crm-lifecycle-actions");
    if (!box) return;
    box.querySelectorAll("button").forEach(btn => {
        if (!btn.dataset.originalText) btn.dataset.originalText = btn.textContent;
        btn.disabled = busy;
        if (btn === activeButton && busy) btn.textContent = busyText || "Zapisywanie...";
        if (!busy) btn.textContent = btn.dataset.originalText;
    });
}

/* ----- CORE.21. crmRefreshAllViews (oryginalna linia 4032) ----- */
async function crmRefreshAllViews() {
    await loadSystem();
    await loadClients();
    renderDashboard();
    renderBooksyCalendar();
    await renderWorkScheduleCalendar();
}

/* ----- CORE.22. crmSyncFiveMinuteControlsFromHidden (oryginalna linia 4142) ----- */
function crmSyncFiveMinuteControlsFromHidden() {
    const input=document.getElementById("appointmentDateTime"),box=document.getElementById("appointmentDateTimeFiveMinute");
    if(!input||!box)return;
    const value=String(input.value||"");
    box.querySelector("[data-date]").value=value.slice(0,10);
    if(value.length>=16){box.querySelector("[data-hour]").value=value.slice(11,13);const minute=Math.round(Number(value.slice(14,16))/5)*5%60;box.querySelector("[data-minute]").value=String(minute).padStart(2,"0");}
}

/* ----- CORE.23. blok z linii 4149 (oryginalna linia 4149) ----- */
document.addEventListener("click", () => setTimeout(crmSyncFiveMinuteControlsFromHidden,0), true);

/* ----- CORE.24. blok z linii 4181 (oryginalna linia 4181) ----- */
document.addEventListener("DOMContentLoaded",()=>{crmEnsureUiLayer();crmInstallFiveMinuteDateTimePicker();});

/* ----- CORE.25. crmPreviousFolderCheck (oryginalna linia 4211) ----- */
const crmPreviousFolderCheck=checkScheduleDriveFolderNow;

/* ----- CORE.26. crmCanvasToBase64 (oryginalna linia 4223) ----- */
function crmCanvasToBase64(canvas){return canvas.toDataURL("image/jpeg",0.96).split(",")[1];}

/* ----- CORE.27. crmFindNameColumnBoundary (oryginalna linia 4269) ----- */
function crmFindNameColumnBoundary(ctx,width,height){
    // W oficjalnym arkuszu kolumna z nazwiskiem zajmuje około 12% szerokości.
    // Szukamy silnej pionowej linii w zakresie 8-20%, a jeśli jej nie ma, używamy 12%.
    let bestX=Math.round(width*0.12),bestScore=-1;
    for(let x=Math.round(width*0.08);x<=Math.round(width*0.20);x++){
        let dark=0;for(let y=0;y<height;y++){const p=ctx.getImageData(x,y,1,1).data;if(p[0]<110&&p[1]<110&&p[2]<110)dark++;}
        if(dark>bestScore){bestScore=dark;bestX=x;}
    }
    return bestX;
}

/* ----- CORE.28. crmCellThumbnail (oryginalna linia 4279) ----- */
function crmCellThumbnail(sourceCanvas,x,y,w,h){
    const c=document.createElement("canvas");c.width=120;c.height=54;const ctx=c.getContext("2d");ctx.imageSmoothingEnabled=false;ctx.fillStyle="#fff";ctx.fillRect(0,0,c.width,c.height);ctx.drawImage(sourceCanvas,x,y,w,h,4,4,c.width-8,c.height-8);return c.toDataURL("image/png");
}

/* ----- CORE.29. crmUseSegmentedCodes (oryginalna linia 4297) ----- */
function crmUseSegmentedCodes(){
    const source=Array.from(document.querySelectorAll("[data-segment-day]"));if(source.length!==31)return crmToast("Brak kompletu 31 komórek.","error");
    source.forEach(select=>{const day=select.dataset.segmentDay,target=document.querySelector(`[data-official-day="${day}"]`);if(target)target.value=select.value;});
    const unknown=source.filter(x=>x.value==="?").length;crmToast(unknown?`Przeniesiono podpowiedzi. Pozostało ${unknown} nierozpoznanych dni.`:"Przeniesiono wszystkie 31 kodów. Sprawdź je przed zatwierdzeniem.");
    document.getElementById("sch-import-review")?.scrollIntoView({behavior:"smooth",block:"start"});
}

/* ----- CORE.30. crmOldRenderCropPanel (oryginalna linia 4305) ----- */
const crmOldRenderCropPanel=crmRenderScheduleCropPanel;

/* ----- CORE.31. blok z linii 4362 (oryginalna linia 4362) ----- */
document.addEventListener("DOMContentLoaded",()=>setTimeout(crmInstallCalendarCleanupControls,100));

/* ----- CORE.32. blok z linii 4403 (oryginalna linia 4403) ----- */
document.addEventListener("DOMContentLoaded",()=>setTimeout(crmUpdateSchedulePanelForXlsx,150));

/* ----- CORE.33. crmWrapSectionAsDetails (oryginalna linia 4410) ----- */
/* KONIEC POPRAWKI ADMIN XLSX */


/* ==========================================================
   FINALNY UKLAD ZWIJANY I AUTOMATYCZNA AKTUALIZACJA GRAFIKU
   ========================================================== */
function crmWrapSectionAsDetails(section, title) {
    if (!section || section.dataset.collapsibleReady === "1") return;
    section.dataset.collapsibleReady = "1";
    const details = document.createElement("details");
    details.className = "crm-main-collapsible";
    details.style.cssText = "border:0;margin:0";
    const summary = document.createElement("summary");
    summary.style.cssText = "cursor:pointer;font-size:22px;font-weight:700;padding:4px 0;list-style-position:outside";
    summary.textContent = title;
    const body = document.createElement("div");
    body.style.cssText = "padding-top:14px";
    Array.from(section.children).forEach(child => {
        if (child.tagName === "H2") child.remove();
        else body.appendChild(child);
    });
    details.append(summary, body);
    section.appendChild(details);
}

/* ----- CORE.34. crmMakeProcedure (oryginalna linia 4428) ----- */
function crmMakeProcedure(details, title) {
    if (!details) return;
    details.open = false;
    const summary = details.querySelector(":scope > summary");
    if (summary && title) summary.textContent = title;
}

/* ----- CORE.35. crmCreateProcedure (oryginalna linia 4434) ----- */
function crmCreateProcedure(title, contentNode) {
    const details = document.createElement("details");
    details.style.cssText = "margin:8px 0";
    const summary = document.createElement("summary");
    summary.style.cssText = "cursor:pointer;font-weight:700";
    summary.textContent = title;
    const body = document.createElement("div");
    body.style.cssText = "padding:10px 0 4px 16px";
    if (contentNode) body.appendChild(contentNode);
    details.append(summary, body);
    return details;
}

/* ----- CORE.36. crmInstallSmartButton (oryginalna linia 4551) ----- */
function crmInstallSmartButton() {}

/* ----- CORE.37. crmApplyFinalLayout (oryginalna linia 4552) ----- */
function crmApplyFinalLayout() {
    const cycle = document.getElementById("schedule_cycle");
    if (cycle) {
        const wrapper = cycle.closest(".form-group, .setting-row, label, div");
        if (wrapper) wrapper.style.display = "none";
        else cycle.style.display = "none";
    }
    crmArrangeSchedulePanel();
    crmArrangeDiagnosticsPanel();
    crmCollapseWorkCalendar();
}

/* ----- CORE.38. blok z linii 4563 (oryginalna linia 4563) ----- */
document.addEventListener("DOMContentLoaded", () => {
    setTimeout(crmApplyFinalLayout, 250);
    setTimeout(crmApplyFinalLayout, 1000);
});

/* ----- CORE.39. blok z linii 4742 (oryginalna linia 4742) ----- */
window.addEventListener("resize", () => {
    clearTimeout(window.crmV13WeekResizeTimer);
    window.crmV13WeekResizeTimer = setTimeout(() => {
        if (calendarViewMode === "week") renderBooksyCalendar();
    }, 140);
});

/* ----- CORE.40. blok z linii 5457 (oryginalna linia 5457) ----- */
(function crmMoveCategoryColorsToPrices() {
    const hideColors = () => {
        const list = document.getElementById("categories-colors-list");
        if (!list) return;
        const block = list.closest("section, fieldset, .settings-section, div");
        if (block) block.style.display = "none";
        else list.style.display = "none";
    };
    document.addEventListener("DOMContentLoaded", hideColors);
    setTimeout(hideColors, 800);
})();

/* ----- CORE.41. blok z linii 5527 (oryginalna linia 5527) ----- */
document.addEventListener("change", event => {
    if (event.target && event.target.id === "serviceCategory") crmRefreshServiceFormChoices();
});

/* ----- CORE.42. blok z linii 5553 (oryginalna linia 5553) ----- */
document.addEventListener("DOMContentLoaded", () => setTimeout(crmReplaceServiceFormInputs, 300));

/* ----- CORE.43. loadBookingRequests (oryginalna linia 5560) ----- */
/* KONIEC WYBORU KATEGORII I ZABIEGU */


// ==========================================================
// ADMIN V2: prośby o wizytę i porządek cennika
// ==========================================================
async function loadBookingRequests(){
  const box=document.getElementById('bookingRequestsList');if(!box)return;box.innerHTML='Ładowanie...';
  try{
    const r=await crmPost({action:'getBookingRequests'});
    if(!r || r.success !== true) throw new Error(r?.error || 'Nieprawidłowa odpowiedź API');
    const rows=Array.isArray(r.requests) ? r.requests : [];
    window.crmPendingRequestsCountFromApi = rows.length;
    if (typeof crmV3SetPendingCount === "function") crmV3SetPendingCount(rows.length);
    if (typeof crmUpdateLeftPendingBadge === "function") crmUpdateLeftPendingBadge();
    box.innerHTML=rows.length ? '' : 'Brak oczekujących próśb.';
    rows.forEach(x=>{
      const d=document.createElement('div');
      d.className='dashboard-card';
      d.dataset.requestId=String(x.id||'');
      d.innerHTML=`<strong>${x.client}</strong><br>${x.service}<br>Główny: ${x.main}<br>Alternatywny: ${x.alternative}<br><small>${x.reason||''}</small><div style="margin-top:10px"><button class="btn-primary" data-choice="MAIN">Potwierdź główny</button> <button class="btn-secondary" data-choice="ALT">Potwierdź alternatywny</button> <button class="btn-danger" data-choice="REJECT">Odrzuć oba</button></div>`;
      d.querySelectorAll('button').forEach(b=>b.onclick=async()=>{
        if(b.disabled)return;
        const chosenLabel=b.dataset.choice==='ALT'?x.alternative:(b.dataset.choice==='MAIN'?x.main:'oba terminy');
        if(b.dataset.choice!=='REJECT' && !window.confirm(`Potwierdzić termin ${chosenLabel}?`)) return;
        d.querySelectorAll('button').forEach(z=>z.disabled=true);
        try{
          const res=await crmPost({action:'decideBookingRequest',requestId:x.id,choice:b.dataset.choice});
          if(!res.success)throw new Error(res.error||'Błąd decyzji');
          await loadSystem();
          if(typeof renderBooksyCalendar==='function')renderBooksyCalendar();
          await loadBookingRequests();
          if(typeof crmToast==='function')crmToast(b.dataset.choice==='REJECT'?'Prośba została odrzucona.':'Wizyta została potwierdzona i kalendarz odświeżony.');
        }catch(error){
          console.error('Decyzja dotycząca prośby:',error);
          alert(error.message||'Błąd');
          d.querySelectorAll('button').forEach(z=>z.disabled=false);
        }
      });
      box.appendChild(d);
    });
  }catch(e){
    console.error('Pobieranie próśb o wizytę:', e);
    box.textContent='Błąd pobierania próśb.';
  }
}

/* ----- CORE.44. CRM_V3_STATUS_META (oryginalna linia 5573) ----- */
/* ==========================================================
   ADMIN V3: BOOKSY WORKSPACE, STATUSY I OCZEKUJĄCE
   Warstwa interfejsu. Nie zmienia endpointów Google Apps Script.
   ========================================================== */
const CRM_V3_STATUS_META = {
    CONFIRMED: { icon: "●", label: "POTWIERDZONO", css: "confirmed" },
    PENDING: { icon: "⏳", label: "OCZEKUJE POTWIERDZENIA", css: "pending" },
    ALTERNATIVE: { icon: "🔄", label: "TERMIN ALTERNATYWNY", css: "alternative" },
    CONTACT: { icon: "📞", label: "WYMAGA KONTAKTU", css: "contact" },
    CANCELLED_CLIENT: { icon: "🚫", label: "ANULOWANA PRZEZ KLIENTA", css: "cancelled-client" },
    CANCELLED_SALON: { icon: "⛔", label: "ANULOWANA PRZEZ SALON", css: "cancelled-salon" },
    COMPLETED: { icon: "✓", label: "ZREALIZOWANA", css: "completed" }
};

/* ----- CORE.45. crmV3ApplyStatusToElement (oryginalna linia 5598) ----- */
function crmV3ApplyStatusToElement(element, item) {
    if (!element || !item || item.eventType !== "appointment") return;
    const key = crmV3NormalizeStatus(item);
    const meta = CRM_V3_STATUS_META[key];
    element.dataset.crmStatus = meta.css;
    if (!element.querySelector(".crm-v3-status-icon")) {
        const badge = document.createElement("span");
        badge.className = "crm-v3-status-icon";
        badge.textContent = meta.icon;
        badge.title = meta.label;
        element.prepend(badge);
    }
}



/* ----- CORE.48. crmV3SetPendingCount (oryginalna linia 5649) ----- */
function crmV3SetPendingCount(value) {
    const count = Math.max(0, Number(value) || 0);
    const node = document.getElementById("crmPendingRequestsCount");
    const button = document.getElementById("crmPendingRequestsBtn");
    if (node) node.textContent = String(count);
    if (button) button.classList.toggle("has-items", count > 0);
}

/* ----- CORE.49. crmFocusPendingRequests (oryginalna linia 5657) ----- */
function crmFocusPendingRequests() {
    const panel = document.getElementById("booking-requests-panel");
    if (!panel) return;
    panel.open = true;
    panel.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

/* ----- CORE.50. crmV3LoadBookingRequestsOriginal (oryginalna linia 5664) ----- */
const crmV3LoadBookingRequestsOriginal = loadBookingRequests;

/* ----- CORE.51. loadBookingRequests (oryginalna linia 5665) ----- */
loadBookingRequests = async function() {
    await crmV3LoadBookingRequestsOriginal();
    crmV3SetPendingCount(window.crmPendingRequestsCountFromApi || 0);
};

/* ----- CORE.52. blok z linii 5683 (oryginalna linia 5683) ----- */
document.addEventListener("DOMContentLoaded", function() {
    setTimeout(crmV3InitializeWorkspace, 450);
});


/* ----- CORE.54. blok z linii 5800 (oryginalna linia 5800) ----- */
document.addEventListener("click", function(event) {
    const menu = document.getElementById("crmVisitStatusMenu");
    const button = document.getElementById("crmVisitStatusButton");
    if (menu && !menu.hidden && !menu.contains(event.target) && !button?.contains(event.target)) menu.hidden = true;
});

/* ----- CORE.55. crmRenderCurrentTimeLine (oryginalna linia 5892) ----- */
function crmRenderCurrentTimeLine(layer, selectedDate, rangeStart, rangeEnd, pixelsPerMinute) {
    const now = new Date();
    if (selectedDate.toDateString() !== now.toDateString()) return;
    const minute = now.getHours() * 60 + now.getMinutes();
    if (minute < rangeStart || minute > rangeEnd) return;
    const line = document.createElement("div");
    line.className = "crm-day-now-line";
    line.style.top = `${(minute - rangeStart) * pixelsPerMinute}px`;
    line.innerHTML = `<span>${crmFormatVisitTime(now)}</span>`;
    layer.appendChild(line);
}

/* ----- CORE.56. crmPaymentFilter (oryginalna linia 5981) ----- */
/* KONIEC ADMIN V5 */

/* ==========================================================
   ADMIN V6: LEWY PANEL KALENDARZA
   ========================================================== */
let crmPaymentFilter = "all";

/* ----- CORE.57. crmPaymentState (oryginalna linia 6005) ----- */
function crmPaymentState(item) {
    const raw = String(item?.paymentStatus || item?.payment || item?.paidStatus || "").trim().toUpperCase();
    if (item?.paid === true || ["PAID","OPLACONE","OPŁACONE","ZAPLACONE","ZAPŁACONE"].includes(raw)) return "paid";
    if (item?.paid === false || ["UNPAID","NIEOPLACONE","NIEOPŁACONE"].includes(raw)) return "unpaid";
    return "unknown";
}

/* ----- CORE.58. crmSetPaymentFilter (oryginalna linia 6011) ----- */
function crmSetPaymentFilter(value) {
    crmPaymentFilter = ["paid","unpaid"].includes(value) ? value : "all";
    renderBooksyCalendar();
}

/* ----- CORE.59. crmLoadBookingRequestsOriginalV6 (oryginalna linia 6031) ----- */
const crmLoadBookingRequestsOriginalV6 = loadBookingRequests;

/* ----- CORE.60. loadBookingRequests (oryginalna linia 6032) ----- */
loadBookingRequests = async function() {
    await crmLoadBookingRequestsOriginalV6();
    crmUpdateLeftPendingBadge();
};

/* ----- CORE.61. blok z linii 6036 (oryginalna linia 6036) ----- */
document.addEventListener("DOMContentLoaded", function() {
    setTimeout(() => {
        crmUpdateLeftPendingBadge();
        const panel = document.getElementById("booking-requests-panel");
        const sidebar = document.querySelector("#tab-kalendarz .calendar-sidebar");
        if (panel && sidebar && panel.parentNode !== sidebar) sidebar.appendChild(panel);
    }, 500);
});

/* ----- CORE.62. blok z linii 6456 (oryginalna linia 6456) ----- */
document.addEventListener("DOMContentLoaded", crmInstallSafeRightVisitPanel);

/* ----- CORE.63. crmStatusIcon (oryginalna linia 6522) ----- */
function crmStatusIcon(item) {
    const status = String(item?.crmStatus || item?.status || "").toUpperCase();
    if (/COMPLET|ZREALIZ/.test(status)) return "✓";
    if (/PENDING|OCZEK/.test(status)) return "⌛";
    if (/CANCEL|ANUL/.test(status)) return "×";
    if (/NO_SHOW|NIEOBEC/.test(status)) return "!";
    if (item?.eventType === "block") return "■";
    const start = new Date(item?.date);
    const duration = Math.max(5, Number(item?.duration) || 45);
    const end = new Date(start.getTime() + duration * 60000);
    const now = new Date();
    if (!isNaN(start.getTime()) && start <= now && now < end) return "▶";
    return "●";
}

/* ----- CORE.64. blok z linii 6692 (oryginalna linia 6692) ----- */
document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
        const overlay = document.getElementById("crmDayVisitsOverlay");
        if (overlay && !overlay.hidden) crmCloseDayVisitsList();
    }
});

/* ----- CORE.65. blok z linii 6699 (oryginalna linia 6699) ----- */
window.addEventListener("resize", () => {
    clearTimeout(crmWeekResizeTimer);
    crmWeekResizeTimer = setTimeout(() => {
        if (calendarViewMode === "week") renderBooksyCalendar();
    }, 140);
});

/* ----- CORE.66. Powiadomienia o nowych prosbach INDEX ----- */
let crmRequestNoticeBusy = false;
let crmKnownRequestIds = null;
let crmRequestNoticeTimer = null;
const CRM_REQUEST_NOTICE_INTERVAL_MS = 30000;
const CRM_REQUEST_HIGHLIGHT_MS = 65000;

function crmEnsureRequestNoticeDialog() {
    let dialog = document.getElementById("crmNewRequestsDialog");
    if (dialog) return dialog;
    dialog = document.createElement("div");
    dialog.id = "crmNewRequestsDialog";
    dialog.className = "crm-request-notice-overlay";
    dialog.hidden = true;
    dialog.innerHTML = `
      <section class="crm-request-notice-card" role="dialog" aria-modal="true" aria-labelledby="crmNewRequestsTitle">
        <button type="button" class="crm-request-notice-close" aria-label="Zamknij">×</button>
        <span class="crm-request-notice-eyebrow">Nowa rezerwacja</span>
        <h2 id="crmNewRequestsTitle">Masz nową prośbę o wizytę</h2>
        <div id="crmNewRequestsList" class="crm-request-notice-list"></div>
        <div class="crm-request-notice-actions">
          <button type="button" class="btn-secondary" data-request-action="ok">OK</button>
          <button type="button" class="btn-primary" data-request-action="details">Przejdź do szczegółów</button>
        </div>
      </section>`;
    document.body.appendChild(dialog);
    const close = () => { dialog.hidden = true; };
    dialog.querySelector(".crm-request-notice-close").onclick = close;
    dialog.querySelector('[data-request-action="ok"]').onclick = close;
    dialog.querySelector('[data-request-action="details"]').onclick = async () => {
        dialog.hidden = true;
        if (typeof switchTab === "function") switchTab("kalendarz");
        await loadBookingRequests();
        const panel = document.getElementById("booking-requests-panel");
        if (panel) {
            panel.open = true;
            panel.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    };
    dialog.addEventListener("click", event => { if (event.target === dialog) close(); });
    return dialog;
}

function crmShowNewRequestsDialog(rows) {
    const dialog = crmEnsureRequestNoticeDialog();
    const list = dialog.querySelector("#crmNewRequestsList");
    const title = dialog.querySelector("#crmNewRequestsTitle");
    title.textContent = rows.length === 1
        ? "Masz nową prośbę o wizytę"
        : `Masz ${rows.length} nowe prośby o wizytę`;
    list.innerHTML = "";
    rows.forEach(item => {
        const row = document.createElement("button");
        row.type = "button";
        row.className = "crm-request-notice-item";
        row.innerHTML = `<strong></strong><span></span><small></small>`;
        row.querySelector("strong").textContent = item.client || "Klient";
        row.querySelector("span").textContent = item.service || "Usługa";
        row.querySelector("small").textContent = `Główny: ${item.main || "—"} | Alternatywny: ${item.alternative || "—"}`;
        row.onclick = async () => {
            dialog.hidden = true;
            if (typeof switchTab === "function") switchTab("kalendarz");
            await loadBookingRequests();
            const card = document.querySelector(`[data-request-id="${CSS.escape(String(item.id || ""))}"]`);
            const panel = document.getElementById("booking-requests-panel");
            if (panel) panel.open = true;
            if (card) card.scrollIntoView({ behavior: "smooth", block: "center" });
        };
        list.appendChild(row);
    });
    dialog.hidden = false;
}

function crmHighlightNewRequestCards(ids) {
    window.setTimeout(() => {
        ids.forEach(id => {
            const card = document.querySelector(`[data-request-id="${CSS.escape(String(id))}"]`);
            if (!card) return;
            card.classList.add("crm-request-is-new");
            window.setTimeout(() => card.classList.remove("crm-request-is-new"), CRM_REQUEST_HIGHLIGHT_MS);
        });
    }, 80);
}

async function crmCheckNewBookingRequests(options = {}) {
    if (crmRequestNoticeBusy || document.hidden) return;
    crmRequestNoticeBusy = true;
    try {
        const response = await crmPost({ action: "getBookingRequests" });
        if (!response || response.success !== true) throw new Error(response?.error || "Błąd API");
        const rows = Array.isArray(response.requests) ? response.requests : [];
        const currentIds = new Set(rows.map(item => String(item.id || "")).filter(Boolean));
        if (crmKnownRequestIds === null) {
            crmKnownRequestIds = currentIds;
            if (options.render === true) await loadBookingRequests();
            return;
        }
        const newRows = rows.filter(item => !crmKnownRequestIds.has(String(item.id || "")));
        crmKnownRequestIds = currentIds;
        if (!newRows.length) return;
        await loadBookingRequests();
        crmHighlightNewRequestCards(newRows.map(item => item.id));
        crmShowNewRequestsDialog(newRows);
        if (typeof crmToast === "function") crmToast(newRows.length === 1 ? "Nowa prośba o wizytę." : `${newRows.length} nowe prośby o wizytę.`);
    } catch (error) {
        console.error("Sprawdzanie nowych próśb:", error);
    } finally {
        crmRequestNoticeBusy = false;
    }
}

function crmStartRequestNoticeWatch() {
    if (crmRequestNoticeTimer) window.clearInterval(crmRequestNoticeTimer);
    crmCheckNewBookingRequests({ render: true });
    crmRequestNoticeTimer = window.setInterval(crmCheckNewBookingRequests, CRM_REQUEST_NOTICE_INTERVAL_MS);
}

document.addEventListener("DOMContentLoaded", () => setTimeout(crmStartRequestNoticeWatch, 1200));
document.addEventListener("visibilitychange", () => {
    if (!document.hidden) crmCheckNewBookingRequests({ render: true });
});
window.addEventListener("focus", () => crmCheckNewBookingRequests({ render: true }));
/* KONIEC CORE.66 */


/* ========================================================================== 
   ADMIN FINAL 2026-08-04: ZEGAREK I NIEBLOKUJACE POWIADOMIENIA
   ========================================================================== */
const CRM_ADMIN_TIME_ZONE="Europe/Warsaw";
let crmNoticeRequests=[];
function crmInstallAdminClock(){
  if(document.getElementById("crmAdminClock")) return;
  const header=document.querySelector("#tab-kalendarz .calendar-layout-header"); if(!header) return;
  const box=document.createElement("div"); box.id="crmAdminClock"; box.className="crm-admin-clock";
  box.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"></circle><path d="M12 7v5l3 2"></path></svg><span><strong></strong><small></small></span>';
  const scroller=header.querySelector(".calendar-date-scroller");
  if(scroller) header.insertBefore(box,scroller); else header.appendChild(box);
  const tick=()=>{const now=new Date();box.querySelector("strong").textContent=new Intl.DateTimeFormat("pl-PL",{timeZone:CRM_ADMIN_TIME_ZONE,hour:"2-digit",minute:"2-digit"}).format(now);box.querySelector("small").textContent=new Intl.DateTimeFormat("pl-PL",{timeZone:CRM_ADMIN_TIME_ZONE,weekday:"long",day:"numeric",month:"long"}).format(now);};
  tick(); setInterval(tick,60000);
}
function crmRequestKey(r){return String(r.requestId||r.id||[r.phone,r.mainDate||r.date,r.service].join("|"));}
function crmNoticeStorePosition(box){localStorage.setItem("crmNoticePosition",JSON.stringify({left:box.style.left,top:box.style.top}));}
function crmMakeNoticeDraggable(box,handle){
  let active=false,dx=0,dy=0;
  handle.addEventListener("pointerdown",e=>{if(e.target.closest("button"))return;active=true;dx=e.clientX-box.offsetLeft;dy=e.clientY-box.offsetTop;handle.setPointerCapture(e.pointerId);});
  handle.addEventListener("pointermove",e=>{if(!active)return;const maxX=Math.max(0,innerWidth-box.offsetWidth),maxY=Math.max(0,innerHeight-box.offsetHeight);box.style.left=Math.max(0,Math.min(maxX,e.clientX-dx))+"px";box.style.top=Math.max(0,Math.min(maxY,e.clientY-dy))+"px";box.style.right="auto";box.style.bottom="auto";});
  handle.addEventListener("pointerup",()=>{active=false;crmNoticeStorePosition(box);});
}
function crmRenderRequestNotice(requests){
  crmNoticeRequests=requests||[]; let box=document.getElementById("crmRequestNoticeFinal");
  if(!crmNoticeRequests.length){box?.remove();return;}
  if(!box){box=document.createElement("aside");box.id="crmRequestNoticeFinal";box.className="crm-request-notice-final";document.body.appendChild(box);const saved=JSON.parse(localStorage.getItem("crmNoticePosition")||"null");if(saved){box.style.left=saved.left;box.style.top=saved.top;box.style.right="auto";}}
  box.innerHTML='<header><span class="crm-notice-grip">⋮⋮</span><strong>'+(crmNoticeRequests.length===1?'Nowa prośba o wizytę':'Nowe prośby: '+crmNoticeRequests.length)+'</strong><button type="button" aria-label="Odłóż">×</button></header><div class="crm-notice-list"></div><footer><button type="button" class="btn-secondary" data-later>Później</button><button type="button" class="btn-primary" data-show>Pokaż wszystkie</button></footer>';
  const list=box.querySelector(".crm-notice-list");crmNoticeRequests.slice(0,5).forEach(r=>{const b=document.createElement("button");b.type="button";b.className="crm-notice-row";b.innerHTML='<strong>'+crmSafeText(r.name||"Klient")+'</strong><span>'+crmSafeText(r.service||"Wizyta")+'</span><small>'+crmSafeText(r.mainDate||r.date||"")+(r.alternativeDate?' • alternatywa: '+crmSafeText(r.alternativeDate):'')+'</small>';b.onclick=()=>{box.classList.add("is-minimized");document.getElementById("booking-requests-panel")?.scrollIntoView({behavior:"smooth",block:"nearest"});};list.appendChild(b);});
  const later=()=>box.classList.add("is-minimized");box.querySelector("header button").onclick=later;box.querySelector("[data-later]").onclick=later;box.querySelector("[data-show]").onclick=()=>{box.classList.add("is-minimized");document.getElementById("booking-requests-panel")?.scrollIntoView({behavior:"smooth",block:"nearest"});};crmMakeNoticeDraggable(box,box.querySelector("header"));
}
const crmOriginalShowNewRequestNotification=typeof crmShowNewRequestNotification==="function"?crmShowNewRequestNotification:null;
crmShowNewRequestNotification=function(requests){crmRenderRequestNotice(requests);};
const crmOriginalInitializeWorkspaceFinal=typeof crmV3InitializeWorkspace==="function"?crmV3InitializeWorkspace:null;
if(crmOriginalInitializeWorkspaceFinal) crmV3InitializeWorkspace=function(){const r=crmOriginalInitializeWorkspaceFinal.apply(this,arguments);setTimeout(crmInstallAdminClock,0);return r;};
document.addEventListener("DOMContentLoaded",()=>setTimeout(crmInstallAdminClock,200));
/* KONIEC ADMIN FINAL: ZEGAREK I POWIADOMIENIA */


/* ========================================================================== 
   ADMIN SAFE 2026-08-06: PROSBY API, POWIADOMIENIA I NIEZAPISANE FORMULARZE
   ========================================================================== */
if (typeof crmShowNewRequestsDialog === "function") {
    crmShowNewRequestsDialog = function(requests) {
        if (typeof crmRenderRequestNotice === "function") crmRenderRequestNotice(requests || []);
    };
}
(function crmInstallUnsavedFormGuard(){
    let dirty = false;
    const selector = "#appointment-form, #block-time-form, #settings-form, form[data-crm-guard]";
    document.addEventListener("input", event => {
        if (event.target.closest(selector)) dirty = true;
    }, true);
    document.addEventListener("change", event => {
        if (event.target.closest(selector)) dirty = true;
    }, true);
    document.addEventListener("submit", event => {
        if (event.target.matches(selector)) dirty = false;
    }, true);
    document.addEventListener("click", event => {
        if (event.target.closest("[data-crm-saved], .btn-save, button[type='submit']")) {
            setTimeout(() => { dirty = false; }, 500);
        }
    }, true);
    window.crmHasUnsavedChanges = () => dirty;
    window.crmMarkFormsSaved = () => { dirty = false; };
    window.addEventListener("beforeunload", event => {
        if (!dirty) return;
        event.preventDefault();
        event.returnValue = "";
    });
})();
/* KONIEC ADMIN SAFE 2026-08-06 */
