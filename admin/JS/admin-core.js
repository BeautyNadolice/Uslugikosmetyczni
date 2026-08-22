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
    // V12: przy starcie tylko lokalne przygotowanie UI.
    // initializeCRMExtensions pozostaje dostępne ręcznie, ale nie obciąża startu ADMIN.
    ensureAppointmentLifecycleButtons();
});

/* ----- CORE.17. blok z linii 3953 (oryginalna linia 3953) ----- */
document.addEventListener("DOMContentLoaded", () => {
    const dt = document.getElementById("appointmentDateTime");
    if (dt) dt.step = "300";
    ensureSchedulePanel();
    ensureScheduleCalendarUnderMainCalendar();
    // V12: żadnych zapytań sieciowych grafiku/kolorów przy starcie.
    // Dane grafiku są pobierane dopiero po wejściu do Ustawień.
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
    window.crmPendingRequestsData = rows;
    window.crmCancelledCountsByDate = (r.cancelledByDate && typeof r.cancelledByDate === "object") ? r.cancelledByDate : {};
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
    NO_SHOW: { icon: "❗", label: "NIEOBECNOŚĆ", css: "no-show" },
    IN_PROGRESS: { icon: "▶", label: "W TRAKCIE", css: "in-progress" },
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
    /* Bez pollingu: jedno sprawdzenie przy uruchomieniu. Kolejne tylko po zdarzeniach UI. */
    if (crmRequestNoticeTimer) { window.clearInterval(crmRequestNoticeTimer); crmRequestNoticeTimer = null; }
    crmCheckNewBookingRequests({ render: true });
}

/* Event-driven: właściwe listenery skrzynki są instalowane w końcowym bloku ADMIN EVENT-DRIVEN. */
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

/* ========================================================================== 
   ADMIN FINAL: PROSTE POWIADOMIENIE I AUTOMATYCZNA LISTA PROSB
   ========================================================================== */
function crmOpenPendingRequestsPanel(newRequestIds = []) {
    const panel = document.getElementById("booking-requests-panel");
    if (panel) panel.open = true;

    window.setTimeout(() => {
        newRequestIds.forEach(requestId => {
            const safeId = typeof CSS !== "undefined" && CSS.escape
                ? CSS.escape(String(requestId || ""))
                : String(requestId || "").replace(/["\\]/g, "\\$&");
            const card = document.querySelector(`[data-request-id="${safeId}"]`);
            if (!card) return;
            card.classList.add("crm-request-is-new");
            window.setTimeout(() => card.classList.remove("crm-request-is-new"), CRM_REQUEST_HIGHLIGHT_MS);
        });
    }, 80);
}

function crmRenderRequestNotice(requests) {
    const rows = Array.isArray(requests) ? requests : [];
    let box = document.getElementById("crmRequestNoticeFinal");

    if (!rows.length) {
        if (box) box.remove();
        return;
    }

    if (!box) {
        box = document.createElement("aside");
        box.id = "crmRequestNoticeFinal";
        box.className = "crm-request-notice-final crm-request-notice-simple";
        box.setAttribute("role", "status");
        box.setAttribute("aria-live", "polite");
        document.body.appendChild(box);
    }

    box.className = "crm-request-notice-final crm-request-notice-simple";
    box.innerHTML = `
      <button type="button" class="crm-request-notice-simple-close" aria-label="Zamknij">×</button>
      <p>Otrzymano nową prośbę.</p>
      <button type="button" class="btn-primary crm-request-notice-simple-ok">OK</button>`;

    const close = () => box.remove();
    box.querySelector(".crm-request-notice-simple-close").onclick = close;
    box.querySelector(".crm-request-notice-simple-ok").onclick = close;
}

if (typeof crmShowNewRequestsDialog === "function") {
    crmShowNewRequestsDialog = function(requests) {
        crmRenderRequestNotice(requests || []);
    };
}

const crmRequestSimpleCheckOriginal = crmCheckNewBookingRequests;
crmCheckNewBookingRequests = async function(options = {}) {
    if (crmRequestNoticeBusy || document.hidden) return;
    crmRequestNoticeBusy = true;
    try {
        const response = await crmPost({ action: "getBookingRequests" });
        if (!response || response.success !== true) throw new Error(response?.error || "Błąd API");

        const rows = Array.isArray(response.requests) ? response.requests : [];
        const count = rows.length;
        window.crmPendingRequestsData = rows;
        window.crmCancelledCountsByDate = (response.cancelledByDate && typeof response.cancelledByDate === "object") ? response.cancelledByDate : {};
        window.crmPendingRequestsCountFromApi = count;
        const currentIds = new Set(rows.map(item => String(item.id || "")).filter(Boolean));

        window.crmPendingRequestsCountFromApi = count;
        if (typeof crmV3SetPendingCount === "function") crmV3SetPendingCount(count);

        if (crmKnownRequestIds === null) {
            crmKnownRequestIds = currentIds;
            if (options.render === true) {
                await loadBookingRequests();
                if (count > 0) crmOpenPendingRequestsPanel([]);
            }
            if (typeof crmRenderCalendarInsights === "function") crmRenderCalendarInsights();
            return;
        }

        const newRows = rows.filter(item => !crmKnownRequestIds.has(String(item.id || "")));
        crmKnownRequestIds = currentIds;

        if (options.render === true || newRows.length) await loadBookingRequests();
        if (newRows.length) {
            const newIds = newRows.map(item => item.id);
            crmOpenPendingRequestsPanel(newIds);
            crmRenderRequestNotice(newRows);
        }

        if (typeof crmRenderCalendarInsights === "function") crmRenderCalendarInsights();
    } catch (error) {
        console.error("Sprawdzanie nowych próśb:", error);
    } finally {
        crmRequestNoticeBusy = false;
    }
};
/* KONIEC ADMIN FINAL: PROSTE POWIADOMIENIE I AUTOMATYCZNA LISTA PROSB */


/* ========================================================================== 
   ADMIN FINAL: JEDNO ZRODLO PROSB I AUTOMATYCZNIE OTWARTA LISTA
   ========================================================================== */
function crmPendingRequestsAfterApiRender() {
    const rows = Array.isArray(window.crmPendingRequestsData) ? window.crmPendingRequestsData : [];
    const count = rows.length;
    window.crmPendingRequestsCountFromApi = count;

    const panel = document.getElementById("booking-requests-panel");
    if (panel && count > 0) panel.open = true;

    const badge = document.getElementById("crmLeftPendingBadge");
    if (badge) {
        badge.textContent = String(count);
        badge.hidden = count === 0;
        badge.classList.toggle("has-items", count > 0);
    }

    const topCount = document.getElementById("crmPendingRequestsCount");
    if (topCount) topCount.textContent = String(count);

    if (typeof crmRenderCalendarInsights === "function") crmRenderCalendarInsights();
    if (typeof crmApplyPendingRequestDayMarkers === "function") {
        requestAnimationFrame(crmApplyPendingRequestDayMarkers);
    }
}

const crmPendingLoadBookingRequestsOriginal = loadBookingRequests;
loadBookingRequests = async function() {
    const result = await crmPendingLoadBookingRequestsOriginal.apply(this, arguments);
    crmPendingRequestsAfterApiRender();
    return result;
};

crmUpdateLeftPendingBadge = function() {
    crmPendingRequestsAfterApiRender();
};
/* KONIEC ADMIN FINAL: JEDNO ZRODLO PROSB I AUTOMATYCZNIE OTWARTA LISTA */


/* ========================================================================== 
   ADMIN EVENT-DRIVEN: FORMULARZ KONTAKTOWY, NOWE WIZYTY I STATUS CZASOWY
   ========================================================================== */
const CRM_CONTACT_SEEN_KEY = "crmSeenContactRequestsV1";
const CRM_BOOKING_REQUEST_SEEN_KEY = "crmSeenBookingRequestsV1";
const CRM_APPOINTMENT_SEEN_KEY = "crmSeenAppointmentsV1";
let crmEventInboxBusy = false;
let crmEventInboxLastCheck = 0;
let crmVisitEndTimer = null;
window.crmContactRequestsData = window.crmContactRequestsData || [];

function crmReadSeenSet(key) {
    try { return new Set(JSON.parse(localStorage.getItem(key) || "[]").map(String)); }
    catch (_) { return new Set(); }
}
function crmWriteSeenSet(key, set) {
    try { localStorage.setItem(key, JSON.stringify(Array.from(set).slice(-2000))); } catch (_) {}
}
function crmNewRowsFromSeen(key, rows, getId) {
    const hasState = localStorage.getItem(key) !== null;
    const seen = crmReadSeenSet(key);
    const currentIds = rows.map(getId).map(String).filter(Boolean);
    if (!hasState) {
        currentIds.forEach(id => seen.add(id));
        crmWriteSeenSet(key, seen);
        return [];
    }
    const fresh = rows.filter(row => {
        const id = String(getId(row) || "");
        return id && !seen.has(id);
    });
    currentIds.forEach(id => seen.add(id));
    crmWriteSeenSet(key, seen);
    return fresh;
}

function crmShowSimpleAdminNotice(message, actionLabel, action) {
    let box = document.getElementById("crmRequestNoticeFinal");
    if (!box) {
        box = document.createElement("aside");
        box.id = "crmRequestNoticeFinal";
        box.className = "crm-request-notice-final crm-request-notice-simple";
        box.setAttribute("role", "status");
        box.setAttribute("aria-live", "polite");
        document.body.appendChild(box);
    }
    box.innerHTML = `<button type="button" class="crm-request-notice-simple-close" aria-label="Zamknij">×</button><p></p><button type="button" class="btn-primary crm-request-notice-simple-ok"></button>`;
    box.querySelector("p").textContent = message;
    const btn = box.querySelector(".crm-request-notice-simple-ok");
    btn.textContent = actionLabel || "OK";
    const close = () => box.remove();
    box.querySelector(".crm-request-notice-simple-close").onclick = close;
    btn.onclick = () => { close(); if (typeof action === "function") action(); };
}

/* Ostateczna wersja sprawdzania próśb INDEX: bez interval i z trwałą pamięcią ID. */
crmCheckNewBookingRequests = async function(options = {}) {
    if (crmRequestNoticeBusy || document.hidden) return;
    crmRequestNoticeBusy = true;
    try {
        /* loadBookingRequests wykonuje dokładnie jedno żądanie i od razu renderuje listę. */
        await loadBookingRequests();
        const rows = Array.isArray(window.crmPendingRequestsData) ? window.crmPendingRequestsData : [];
        if (typeof crmV3SetPendingCount === "function") crmV3SetPendingCount(rows.length);
        const fresh = crmNewRowsFromSeen(CRM_BOOKING_REQUEST_SEEN_KEY, rows, row => row.id);
        if (fresh.length) {
            crmOpenPendingRequestsPanel(fresh.map(row => row.id));
            crmShowSimpleAdminNotice(
                fresh.length === 1 ? `Nowa prośba o wizytę: ${fresh[0].client || "Klient"}` : `Nowe prośby o wizytę: ${fresh.length}`,
                "Pokaż",
                () => { const panel=document.getElementById("booking-requests-panel"); if(panel){panel.open=true;panel.scrollIntoView({behavior:"smooth",block:"nearest"});} }
            );
        }
        if (typeof crmRenderCalendarInsights === "function") crmRenderCalendarInsights();
    } catch (error) {
        console.error("Sprawdzanie nowych próśb:", error);
    } finally {
        crmRequestNoticeBusy = false;
    }
};

function crmEnsureContactRequestsPanel() {
    let panel = document.getElementById("contact-form-requests-panel");
    if (!panel) {
        panel = document.createElement("details");
        panel.id = "contact-form-requests-panel";
        panel.style.marginTop = "12px";
        panel.innerHTML = `<summary style="cursor:pointer;pointer-events:auto;user-select:none;"><strong>Zapytania nowych klientów</strong> <span id="crmContactRequestsCount" style="display:none;place-items:center;min-width:20px;height:20px;padding:0 6px;margin-left:6px;border-radius:999px;background:#b05c75;color:#fff;font-size:11px;">0</span></summary><div id="contactFormRequestsList" style="margin-top:14px;"></div>`;
    }

    const summary = panel.querySelector("summary");
    if (summary && summary.dataset.crmToggleBound !== "1") {
        summary.dataset.crmToggleBound = "1";
        summary.setAttribute("role", "button");
        summary.setAttribute("aria-controls", "contactFormRequestsList");
        summary.tabIndex = 0;
        const togglePanel = (event) => {
            if (event) event.preventDefault();
            panel.open = !panel.open;
            summary.setAttribute("aria-expanded", panel.open ? "true" : "false");

            // Bez pollingu: po ręcznym otwarciu skrzynki pobierz aktualny stan.
            if (panel.open && typeof crmLoadContactFormRequests === "function") {
                crmLoadContactFormRequests({ notify: false }).catch(error => {
                    console.error("Odświeżanie zapytań formularza:", error);
                    const list = document.getElementById("contactFormRequestsList");
                    if (list) list.innerHTML = '<div style="padding:10px;color:#b3261e;">Nie udało się pobrać zapytań. Sprawdź uprawnienia Google Form.</div>';
                });
            }
        };
        summary.addEventListener("click", togglePanel);
        summary.addEventListener("keydown", (event) => {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                togglePanel();
            }
        });
        summary.setAttribute("aria-expanded", panel.open ? "true" : "false");
    }

    const sidebar = document.querySelector("#tab-kalendarz .calendar-sidebar");
    const bookingPanel = document.getElementById("booking-requests-panel");
    if (sidebar && panel.parentNode !== sidebar) {
        if (bookingPanel && bookingPanel.parentNode === sidebar) bookingPanel.insertAdjacentElement("afterend", panel);
        else sidebar.appendChild(panel);
    }
    return panel;
}

function crmOpenAppointmentForContact(request) {
    if (!request) return;
    currentEditingAppointment = null;
    if (typeof populateAppointmentDropdowns === "function") populateAppointmentDropdowns();
    const modal = document.getElementById("appointmentModal");
    const title = document.getElementById("modalTitleAppointment");
    const name = document.getElementById("appointmentName");
    const phone = document.getElementById("appointmentPhone");
    const service = document.getElementById("appointmentService");
    const date = document.getElementById("appointmentDateTime");
    if (title) title.textContent = "Nowa wizyta z zapytania";
    if (name) { name.value = request.name || ""; name.readOnly = false; }
    if (phone) { phone.value = request.phone || ""; phone.readOnly = false; }
    if (service) service.value = "";
    if (date) date.value = "";
    if (modal) modal.style.display = "flex";
    if (service) setTimeout(() => service.focus(), 0);
}

async function crmHandleContactRequest(request, action) {
    if (!request?.id) return;
    try {
        const response = await crmPost({ action: "decideContactFormRequest", requestId: request.id, decision: action });
        if (!response?.success) throw new Error(response?.error || "Nie udało się obsłużyć zapytania");
        if (action === "ADD_CLIENT") {
            if (typeof loadClients === "function") await loadClients();
            crmToast(response.added ? "Klient został dodany do bazy." : "Klient już znajduje się w bazie.");
            crmOpenAppointmentForContact(request);
        } else {
            crmToast("Zapytanie oznaczono jako obsłużone.");
        }
        await crmLoadContactFormRequests({ notify: false });
    } catch (error) { crmToast(error.message || String(error), "error"); }
}

function crmRenderContactFormRequests(rows) {
    const panel = crmEnsureContactRequestsPanel();
    const list = document.getElementById("contactFormRequestsList");
    const count = document.getElementById("crmContactRequestsCount");
    const data = Array.isArray(rows) ? rows : [];
    window.crmContactRequestsData = data;
    if (count) {
        count.textContent = String(data.length);
        count.style.display = data.length > 0 ? "inline-grid" : "none";
        count.hidden = data.length === 0;
    }
    if (!list) return;
    list.innerHTML = data.length ? "" : '<div style="padding:10px;color:#777;">Brak nowych zapytań.</div>';
    if (panel && data.length === 0) {
        panel.open = false;
        const summary = panel.querySelector("summary");
        if (summary) summary.setAttribute("aria-expanded", "false");
    }
    data.forEach(request => {
        const card = document.createElement("div");
        card.className = "dashboard-card";
        card.style.marginBottom = "10px";
        const title = document.createElement("strong"); title.textContent = request.name || "Nowy klient";
        const phone = document.createElement("div"); phone.textContent = request.phone || "Brak numeru telefonu"; phone.style.marginTop = "4px";
        const question = document.createElement("div"); question.textContent = request.question || "—"; question.style.cssText = "margin-top:8px;white-space:pre-wrap;color:#555;";
        const meta = document.createElement("small"); meta.textContent = `${request.createdAt || ""} • ${String(request.status||"NOWE").replaceAll("_"," ")}`; meta.style.cssText="display:block;margin-top:8px;";
        const actions = document.createElement("div"); actions.style.cssText="display:flex;flex-wrap:wrap;gap:8px;margin-top:10px;";
        const add = document.createElement("button"); add.type="button"; add.className="btn-primary"; add.textContent="Dodaj klienta i umów"; add.onclick=()=>crmHandleContactRequest(request,"ADD_CLIENT");
        const done = document.createElement("button"); done.type="button"; done.className="btn-secondary"; done.textContent="Obsłużone"; done.onclick=()=>crmHandleContactRequest(request,"DONE");
        actions.append(add,done); card.append(title,phone,question,meta,actions); list.appendChild(card);
    });
    if (panel && data.length > 0 && panel.dataset.autoOpened !== "1") { panel.dataset.autoOpened="1"; panel.open=true; }
}

async function crmLoadContactFormRequests(options = {}) {
    const response = await crmPost({ action: "getContactFormRequests" });
    if (!response?.success) throw new Error(response?.error || "Błąd pobierania zapytań z formularza");
    const rows = Array.isArray(response.requests) ? response.requests : [];
    crmRenderContactFormRequests(rows);
    const fresh = crmNewRowsFromSeen(CRM_CONTACT_SEEN_KEY, rows, row => row.id);
    if (options.notify !== false && fresh.length) {
        crmShowSimpleAdminNotice(
            fresh.length === 1 ? `Nowe zapytanie od: ${fresh[0].name || "klienta"}` : `Nowe zapytania z formularza: ${fresh.length}`,
            "Pokaż",
            () => { const panel=crmEnsureContactRequestsPanel();panel.open=true;panel.scrollIntoView({behavior:"smooth",block:"nearest"}); }
        );
    }
    return rows;
}

async function crmCheckEventDrivenInbox(options = {}) {
    const now = Date.now();
    if (crmEventInboxBusy) return;
    if (!options.force && now - crmEventInboxLastCheck < 8000) return;
    crmEventInboxBusy = true; crmEventInboxLastCheck = now;
    try { await Promise.allSettled([crmCheckNewBookingRequests({render:true}), crmLoadContactFormRequests({notify:true})]); }
    finally { crmEventInboxBusy = false; }
}

function crmAppointmentNoticeKey(item) {
    if (!item || item.eventType !== "appointment") return "";
    return String(item.appointmentId || item.eventId || [item.date,item.phone,item.name,item.service].join("|"));
}
function crmRememberAppointmentsAsSeen() {
    const seen=crmReadSeenSet(CRM_APPOINTMENT_SEEN_KEY);
    (appointmentsData||[]).filter(x=>x?.eventType==="appointment").forEach(x=>{const k=crmAppointmentNoticeKey(x);if(k)seen.add(k);});
    crmWriteSeenSet(CRM_APPOINTMENT_SEEN_KEY,seen);
}
window.crmRememberAppointmentsAsSeen=crmRememberAppointmentsAsSeen;
const CRM_APPOINTMENT_NOTICE_SESSION_BASELINE_V17 = "crm_appointment_notice_baseline_v17";

function crmDetectNewAppointments() {
    const rows=(appointmentsData||[]).filter(x=>x?.eventType==="appointment");

    let baselineReady=false;
    try{
        baselineReady=sessionStorage.getItem(CRM_APPOINTMENT_NOTICE_SESSION_BASELINE_V17)==="1";
    }catch(ignore){}

    if(!baselineReady){
        crmRememberAppointmentsAsSeen();
        try{sessionStorage.setItem(CRM_APPOINTMENT_NOTICE_SESSION_BASELINE_V17,"1");}catch(ignore){}
        return [];
    }

    const fresh=crmNewRowsFromSeen(CRM_APPOINTMENT_SEEN_KEY,rows,crmAppointmentNoticeKey);
    if(!fresh.length)return [];

    const first=fresh[0];
    crmShowSimpleAdminNotice(
        fresh.length===1
            ? `Nowa wizyta: ${first.name||"Klient"}`
            : `Nowe wizyty: ${fresh.length}`,
        "Pokaż kalendarz",
        ()=>{if(typeof switchTab==="function")switchTab("kalendarz");}
    );
    return fresh;
}

function crmVisitTransitionTimes(item) {
    if(!item||item.eventType!=="appointment")return [];
    const raw=String(item.crmStatus||item.status||"POTWIERDZONA").toUpperCase();
    if(/ANUL|CANCEL|NIEOBEC|NO_SHOW|ODRZUC|REJECT|COMPLET|ZREALIZ/.test(raw))return [];
    const start=new Date(item.date||"");if(Number.isNaN(start.getTime()))return [];
    const explicit=item.endDate?new Date(item.endDate):null;
    const end=(explicit&&!Number.isNaN(explicit.getTime()))?explicit:new Date(start.getTime()+Math.max(5,Number(item.duration)||45)*60000);
    return [start.getTime(),end.getTime()];
}
function crmScheduleNextVisitEndStatusRefresh() {
    if(crmVisitEndTimer){clearTimeout(crmVisitEndTimer);crmVisitEndTimer=null;}
    const now=Date.now();
    const transitions=(appointmentsData||[]).flatMap(crmVisitTransitionTimes).filter(t=>t>now).sort((a,b)=>a-b);
    if(!transitions.length)return;
    crmVisitEndTimer=setTimeout(()=>{crmVisitEndTimer=null;if(typeof renderBooksyCalendar==="function")renderBooksyCalendar();if(typeof renderDashboard==="function")renderDashboard();if(typeof calculateFinanceReport==="function")calculateFinanceReport();if(currentEditingAppointment&&typeof crmApplyReadableVisitStatus==="function")crmApplyReadableVisitStatus(currentEditingAppointment);crmScheduleNextVisitEndStatusRefresh();},Math.min(2147483000,Math.max(50,transitions[0]-now+120)));
}
window.crmScheduleNextVisitEndStatusRefresh=crmScheduleNextVisitEndStatusRefresh;

if(typeof renderBooksyCalendar==="function"){
    const crmEventRenderCalendarOriginal=renderBooksyCalendar;
    renderBooksyCalendar=function(){const result=crmEventRenderCalendarOriginal.apply(this,arguments);crmScheduleNextVisitEndStatusRefresh();return result;};
}
if(typeof crmLightSyncCalendarData==="function"){
    const crmEventLightSyncOriginal=crmLightSyncCalendarData;
    crmLightSyncCalendarData=async function(){const result=await crmEventLightSyncOriginal.apply(this,arguments);crmDetectNewAppointments();crmScheduleNextVisitEndStatusRefresh();return result;};
}
if(typeof switchTab==="function"){
    const crmEventSwitchTabOriginal=switchTab;
    switchTab=async function(tabName){
        const result=await crmEventSwitchTabOriginal.apply(this,arguments);
        if(tabName==="kalendarz"){
            crmCheckEventDrivenInbox().catch(console.error);
            if(typeof crmLightSyncCalendarData==="function") crmLightSyncCalendarData("wejscie-kalendarz").catch(console.error);
        }
        return result;
    };
}

document.addEventListener("DOMContentLoaded",()=>setTimeout(()=>{crmEnsureContactRequestsPanel();crmCheckEventDrivenInbox({force:true}).catch(console.error);crmDetectNewAppointments();crmScheduleNextVisitEndStatusRefresh();},1500));
document.addEventListener("visibilitychange",()=>{if(!document.hidden)crmCheckEventDrivenInbox().catch(console.error);});
window.addEventListener("focus",()=>crmCheckEventDrivenInbox().catch(console.error));
/* KONIEC ADMIN EVENT-DRIVEN */

/* ==========================================================================
   ADMIN INBOX V1 2026-08-12
   Jedna szybka skrzynka w Kalendarzu. Bez pollingu i bez skanowania Forms
   podczas zwykłego otwierania.
   ========================================================================== */
let crmUnifiedInboxBusy = false;
let crmUnifiedInboxItems = [];
let crmUnifiedInboxFilter = "ALL";

function crmInboxEscape(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
        "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
    })[char]);
}

function crmInboxStatusLabel(state) {
    const raw = String(state || "NOWE").toUpperCase();
    if (raw === "PRZECZYTANE") return "PRZECZYTANE";
    if (raw === "OBSŁUŻONE" || raw === "OBSLUZONE") return "OBSŁUŻONE";
    return "NOWE";
}

function crmInboxStatusColor(state) {
    const raw = crmInboxStatusLabel(state);
    if (raw === "NOWE") return "#b3261e";
    if (raw === "PRZECZYTANE") return "#8a6a00";
    return "#2e7d32";
}

function crmEnsureUnifiedInboxButton() {
    let button = document.getElementById("crmUnifiedInboxButton");
    if (button) return button;

    button = document.createElement("button");
    button.type = "button";
    button.id = "crmUnifiedInboxButton";
    button.className = "btn-secondary";
    button.style.cssText =
        "width:100%;margin:0 0 12px;padding:11px 12px;display:flex;" +
        "align-items:center;justify-content:space-between;gap:10px;font-weight:700;";
    button.innerHTML =
        '<span>📥 Skrzynka</span>' +
        '<span id="crmUnifiedInboxBadge" style="display:none;min-width:22px;height:22px;' +
        'padding:0 7px;border-radius:999px;background:#b3261e;color:#fff;' +
        'align-items:center;justify-content:center;font-size:11px;">0</span>';
    button.onclick = () => crmOpenUnifiedInbox();

    const sidebar = document.querySelector("#tab-kalendarz .calendar-sidebar");
    const bookingPanel = document.getElementById("booking-requests-panel");
    if (sidebar) {
        if (bookingPanel && bookingPanel.parentNode === sidebar) {
            sidebar.insertBefore(button, bookingPanel);
        } else {
            sidebar.prepend(button);
        }
    }

    return button;
}

function crmEnsureUnifiedInboxModal() {
    let modal = document.getElementById("crmUnifiedInboxModal");
    if (modal) return modal;

    modal = document.createElement("div");
    modal.id = "crmUnifiedInboxModal";
    modal.style.cssText =
        "display:none;position:fixed;inset:0;z-index:100001;background:rgba(0,0,0,.45);" +
        "align-items:center;justify-content:center;padding:18px;";

    modal.innerHTML = `
      <section style="width:min(760px,96vw);max-height:88vh;background:#fff;border-radius:16px;
                      box-shadow:0 18px 60px rgba(0,0,0,.28);display:flex;flex-direction:column;overflow:hidden;">
        <header style="padding:18px 20px;border-bottom:1px solid #eee;display:flex;align-items:center;gap:12px;">
          <div style="flex:1">
            <h2 style="margin:0;font-size:22px;">📥 Skrzynka ADMIN</h2>
            <div id="crmUnifiedInboxSummary" style="margin-top:4px;color:#777;font-size:13px;"></div>
          </div>
          <button type="button" id="crmUnifiedInboxSyncForm" class="btn-secondary"
                  title="Awaryjnie pobierz odpowiedzi bezpośrednio z Google Form">↻ Google Form</button>
          <button type="button" id="crmUnifiedInboxRefresh" class="btn-secondary">Odśwież</button>
          <button type="button" id="crmUnifiedInboxClose" class="crm-interactive-symbol-control" style="border:0;background:transparent;font-size:26px;cursor:pointer;">×</button>
        </header>

        <nav style="padding:10px 20px;border-bottom:1px solid #eee;display:flex;gap:8px;flex-wrap:wrap;">
          <button type="button" data-inbox-filter="ALL" class="btn-secondary">Wszystkie</button>
          <button type="button" data-inbox-filter="NOWE" class="btn-secondary">Nowe</button>
          <button type="button" data-inbox-filter="PRZECZYTANE" class="btn-secondary">Przeczytane</button>
          <button type="button" data-inbox-filter="OBSŁUŻONE" class="btn-secondary">Obsłużone</button>
        </nav>

        <div id="crmUnifiedInboxBody" style="padding:16px 20px;overflow:auto;min-height:180px;">
          <div style="padding:20px;color:#777;">Ładowanie…</div>
        </div>
      </section>`;

    document.body.appendChild(modal);

    modal.querySelector("#crmUnifiedInboxClose").onclick = () => { modal.style.display = "none"; };
    modal.addEventListener("click", event => { if (event.target === modal) modal.style.display = "none"; });
    modal.querySelector("#crmUnifiedInboxRefresh").onclick = () => crmLoadUnifiedInbox({force:true});
    modal.querySelector("#crmUnifiedInboxSyncForm").onclick = () => crmManualSyncContactFormInbox();

    modal.querySelectorAll("[data-inbox-filter]").forEach(button => {
        button.onclick = () => {
            crmUnifiedInboxFilter = button.dataset.inboxFilter || "ALL";
            crmRenderUnifiedInbox();
        };
    });

    return modal;
}

function crmUpdateUnifiedInboxBadge(counts) {
    crmEnsureUnifiedInboxButton();
    const badge = document.getElementById("crmUnifiedInboxBadge");
    const fresh = Math.max(0, Number(counts?.new) || 0);
    if (!badge) return;
    badge.textContent = String(fresh);
    badge.style.display = fresh > 0 ? "inline-flex" : "none";
}

function crmRenderUnifiedInbox() {
    const body = document.getElementById("crmUnifiedInboxBody");
    const summary = document.getElementById("crmUnifiedInboxSummary");
    if (!body) return;

    const all = Array.isArray(crmUnifiedInboxItems) ? crmUnifiedInboxItems : [];
    const rows = crmUnifiedInboxFilter === "ALL"
        ? all
        : all.filter(item => crmInboxStatusLabel(item.readState) === crmUnifiedInboxFilter);

    const counts = { total: all.length, new:0, read:0, handled:0 };
    all.forEach(item => {
        const state = crmInboxStatusLabel(item.readState);
        if (state === "NOWE") counts.new++;
        else if (state === "PRZECZYTANE") counts.read++;
        else counts.handled++;
    });

    crmUpdateUnifiedInboxBadge(counts);
    if (summary) {
        summary.textContent =
            `${counts.new} nowe • ${counts.read} przeczytane • ${counts.handled} obsłużone`;
    }

    if (!rows.length) {
        body.innerHTML = '<div style="padding:22px;text-align:center;color:#777;">Brak wpisów w tym filtrze.</div>';
        return;
    }

    body.innerHTML = "";

    rows.forEach(item => {
        const state = crmInboxStatusLabel(item.readState);
        const card = document.createElement("article");
        card.style.cssText =
            "border:1px solid #e7e1e3;border-left:4px solid " + crmInboxStatusColor(state) +
            ";border-radius:12px;padding:14px 15px;margin-bottom:10px;background:#fff;";

        const kind = item.type === "CONTACT_FORM"
            ? "Pierwsza wizyta – formularz"
            : "Prośba o termin przez stronę";

        const businessStatus = item.type === "BOOKING_REQUEST" && item.status
            ? ` • ${crmInboxEscape(String(item.status).replaceAll("_"," "))}`
            : "";

        let extra = "";
        if (item.type === "BOOKING_REQUEST") {
            extra = `
              <div style="margin-top:8px;font-size:13px;color:#555;">
                <div><b>Termin główny:</b> ${crmInboxEscape(item.main || "—")}</div>
                <div><b>Alternatywny:</b> ${crmInboxEscape(item.alternative || "—")}</div>
              </div>`;
        }

        card.innerHTML = `
          <div style="display:flex;align-items:flex-start;gap:10px;">
            <div style="flex:1;min-width:0;">
              <div style="font-size:12px;color:#777;">${crmInboxEscape(kind)} • ${crmInboxEscape(item.createdAt || "")}</div>
              <strong style="display:block;margin-top:3px;font-size:16px;">${crmInboxEscape(item.name || "Klient")}</strong>
              <div style="font-size:13px;color:#555;margin-top:2px;">${crmInboxEscape(item.phone || "")}</div>
            </div>
            <span style="background:${crmInboxStatusColor(state)};color:#fff;border-radius:999px;padding:5px 8px;font-size:10px;font-weight:800;">
              ${crmInboxEscape(state)}
            </span>
          </div>
          <div style="margin-top:9px;white-space:pre-wrap;">${crmInboxEscape(item.message || item.title || "—")}</div>
          ${extra}
          <div style="margin-top:8px;font-size:11px;color:#888;">${crmInboxEscape(item.status || "")}${businessStatus}</div>
          <div class="crm-inbox-actions" style="display:flex;gap:8px;flex-wrap:wrap;margin-top:12px;"></div>`;

        const actions = card.querySelector(".crm-inbox-actions");

        if (state === "NOWE") {
            const read = document.createElement("button");
            read.type = "button";
            read.className = "btn-secondary";
            read.textContent = "Oznacz jako przeczytane";
            read.onclick = async () => {
                await crmMarkUnifiedInboxItemRead(item);
            };
            actions.appendChild(read);
        }

        if (item.type === "CONTACT_FORM" && state !== "OBSŁUŻONE") {
            const schedule = document.createElement("button");
            schedule.type = "button";
            schedule.className = "btn-primary";
            schedule.textContent = "Dodaj klienta i umów";
            schedule.onclick = async () => {
                await crmMarkUnifiedInboxItemRead(item, false);
                await crmHandleContactRequest(item, "ADD_CLIENT");
                await crmLoadUnifiedInbox({force:true});
            };

            const done = document.createElement("button");
            done.type = "button";
            done.className = "btn-secondary";
            done.textContent = "Obsłużone";
            done.onclick = async () => {
                await crmHandleContactRequest(item, "DONE");
                await crmLoadUnifiedInbox({force:true});
            };

            actions.append(schedule, done);
        }

        if (item.type === "BOOKING_REQUEST" && item.status === "OCZEKUJE") {
            const open = document.createElement("button");
            open.type = "button";
            open.className = "btn-primary";
            open.textContent = "Otwórz prośbę";
            open.onclick = async () => {
                await crmMarkUnifiedInboxItemRead(item, false);
                modal = document.getElementById("crmUnifiedInboxModal");
                if (modal) modal.style.display = "none";
                const panel = document.getElementById("booking-requests-panel");
                if (panel) panel.open = true;
                await loadBookingRequests();
                const cardNode = document.querySelector(`[data-request-id="${CSS.escape(String(item.id || ""))}"]`);
                if (cardNode) cardNode.scrollIntoView({behavior:"smooth",block:"center"});
            };
            actions.appendChild(open);
        }

        body.appendChild(card);
    });
}

async function crmLoadUnifiedInbox(options = {}) {
    if (crmUnifiedInboxBusy) return;
    crmUnifiedInboxBusy = true;

    const body = document.getElementById("crmUnifiedInboxBody");
    if (body && options.silent !== true) {
        body.innerHTML = '<div style="padding:20px;color:#777;">Ładowanie skrzynki…</div>';
    }

    try {
        const response = await crmPost({ action: "getAdminInbox" });
        if (!response?.success) throw new Error(response?.error || "Nie udało się pobrać skrzynki");
        crmUnifiedInboxItems = Array.isArray(response.items) ? response.items : [];
        crmRenderUnifiedInbox();
        return crmUnifiedInboxItems;
    } catch (error) {
        if (body) {
            body.innerHTML =
                `<div style="padding:14px;color:#b3261e;">
                   ${crmInboxEscape(error.message || String(error))}
                   <div style="margin-top:10px;"><button type="button" class="btn-secondary" id="crmInboxRetry">Spróbuj ponownie</button></div>
                 </div>`;
            document.getElementById("crmInboxRetry")?.addEventListener("click", () => crmLoadUnifiedInbox({force:true}));
        }
        throw error;
    } finally {
        crmUnifiedInboxBusy = false;
    }
}

async function crmOpenUnifiedInbox() {
    const modal = crmEnsureUnifiedInboxModal();
    modal.style.display = "flex";
    await crmLoadUnifiedInbox({force:true}).catch(console.error);
}

async function crmMarkUnifiedInboxItemRead(item, reload = true) {
    if (!item?.id) return;
    const response = await crmPost({
        action: "markAdminInboxRead",
        inboxType: item.type,
        requestId: item.id
    });
    if (!response?.success) throw new Error(response?.error || "Nie udało się oznaczyć jako przeczytane");
    item.readState = response.status || "PRZECZYTANE";
    if (reload) crmRenderUnifiedInbox();
}

async function crmManualSyncContactFormInbox() {
    const button = document.getElementById("crmUnifiedInboxSyncForm");
    if (button) { button.disabled = true; button.textContent = "Synchronizacja…"; }

    try {
        const response = await crmPost({ action: "syncContactFormInbox" });
        if (!response?.success) throw new Error(response?.error || "Synchronizacja nie powiodła się");
        if (typeof crmToast === "function") {
            crmToast(
                response.imported > 0
                    ? `Zaimportowano ${response.imported} odpowiedzi z Google Form.`
                    : "Google Form jest zsynchronizowany. Brak nowych odpowiedzi."
            );
        }
        await crmLoadUnifiedInbox({force:true});
    } catch (error) {
        if (typeof crmToast === "function") crmToast(error.message || String(error), "error");
    } finally {
        if (button) { button.disabled = false; button.textContent = "↻ Google Form"; }
    }
}

/* Stary panel Google Form korzysta z szybkiego arkusza, więc nie wisi na FormApp. */
const crmLoadContactFormRequestsBeforeInboxV1 = crmLoadContactFormRequests;
crmLoadContactFormRequests = async function(options = {}) {
    const response = await crmPost({ action: "getContactFormRequests" });
    if (!response?.success) throw new Error(response?.error || "Błąd pobierania zapytań z formularza");
    const rows = Array.isArray(response.requests) ? response.requests : [];
    crmRenderContactFormRequests(rows);
    return rows;
};

/* Otwarta karta nie jest odpytywana cyklicznie.
   Licznik skrzynki odświeżamy przy uruchomieniu, focusie i wejściu do Kalendarza. */
document.addEventListener("DOMContentLoaded", () => {
    window.setTimeout(() => {
        crmEnsureUnifiedInboxButton();
        crmEnsureUnifiedInboxModal();
        crmLoadUnifiedInbox({silent:true}).catch(console.error);
    }, 1700);
});

window.addEventListener("focus", () => crmLoadUnifiedInbox({silent:true}).catch(console.error));
document.addEventListener("visibilitychange", () => {
    if (!document.hidden) crmLoadUnifiedInbox({silent:true}).catch(console.error);
});

if (typeof switchTab === "function") {
    const crmInboxSwitchTabOriginal = switchTab;
    switchTab = async function(tabName) {
        const result = await crmInboxSwitchTabOriginal.apply(this, arguments);
        if (tabName === "kalendarz") {
            crmEnsureUnifiedInboxButton();
            crmLoadUnifiedInbox({silent:true}).catch(console.error);
        }
        return result;
    };
}

/* KONIEC ADMIN INBOX V1 */

/* ==========================================================================
   ADMIN INBOX V2 2026-08-12
   - potwierdzenie/poprawa danych klienta przed umawianiem,
   - brak przedwczesnego dodawania klienta,
   - stare panele ukryte,
   - prośby o wizytę obsługiwane bezpośrednio w Skrzynce,
   - odświeżanie nowych wizyt przy powrocie do karty (bez pollingu).
   ========================================================================== */

window.crmPendingContactRequestForBooking = window.crmPendingContactRequestForBooking || null;

function crmHideLegacyInboxPanelsV2() {
    const bookingPanel = document.getElementById("booking-requests-panel");
    const contactPanel = document.getElementById("contact-form-requests-panel");

    if (bookingPanel) bookingPanel.style.display = "none";
    if (contactPanel) contactPanel.style.display = "none";
}

function crmEnsureContactDataConfirmModalV2() {
    let modal = document.getElementById("crmContactDataConfirmModalV2");
    if (modal) return modal;

    modal = document.createElement("div");
    modal.id = "crmContactDataConfirmModalV2";
    modal.style.cssText =
        "display:none;position:fixed;inset:0;z-index:100003;background:rgba(0,0,0,.46);" +
        "align-items:center;justify-content:center;padding:18px;";

    modal.innerHTML = `
      <section style="width:min(470px,96vw);background:#fff;border-radius:16px;
                      box-shadow:0 18px 60px rgba(0,0,0,.28);padding:22px;">
        <div style="display:flex;align-items:flex-start;gap:12px;">
          <div style="flex:1">
            <h3 style="margin:0;font-size:20px;">Sprawdź dane klienta</h3>
            <p style="margin:7px 0 0;color:#666;font-size:13px;line-height:1.45;">
              Czy dane są poprawne? Jeśli nie — popraw je tutaj przed utworzeniem wizyty.
            </p>
          </div>
          <button type="button" data-close class="crm-interactive-symbol-control" style="border:0;background:transparent;font-size:25px;cursor:pointer;">×</button>
        </div>

        <label style="display:block;margin-top:18px;font-weight:700;font-size:13px;">Imię i nazwisko</label>
        <input id="crmContactConfirmNameV2" type="text"
               style="width:100%;box-sizing:border-box;margin-top:6px;padding:11px 12px;border:1px solid #ddd;border-radius:9px;">

        <label style="display:block;margin-top:14px;font-weight:700;font-size:13px;">Telefon</label>
        <input id="crmContactConfirmPhoneV2" type="tel"
               style="width:100%;box-sizing:border-box;margin-top:6px;padding:11px 12px;border:1px solid #ddd;border-radius:9px;">

        <div id="crmContactConfirmQuestionV2"
             style="margin-top:15px;padding:11px 12px;background:#faf7f8;border-radius:9px;color:#555;
                    white-space:pre-wrap;font-size:13px;"></div>

        <div style="display:flex;justify-content:flex-end;gap:9px;flex-wrap:wrap;margin-top:19px;">
          <button type="button" class="btn-secondary" data-cancel>Anuluj</button>
          <button type="button" class="btn-primary" data-confirm>Dane poprawne — przejdź do wizyty</button>
        </div>
      </section>`;

    document.body.appendChild(modal);

    const close = () => {
        modal.style.display = "none";
        modal._crmRequest = null;
    };

    modal.querySelector("[data-close]").onclick = close;
    modal.querySelector("[data-cancel]").onclick = close;
    modal.addEventListener("click", event => {
        if (event.target === modal) close();
    });

    modal.querySelector("[data-confirm]").onclick = () => {
        const original = modal._crmRequest;
        if (!original) return;

        const name = String(document.getElementById("crmContactConfirmNameV2")?.value || "").trim();
        const phone = String(document.getElementById("crmContactConfirmPhoneV2")?.value || "").trim();

        if (!name || !phone) {
            if (typeof crmToast === "function") crmToast("Uzupełnij imię i numer telefonu.", "error");
            return;
        }

        const request = Object.assign({}, original, { name, phone });
        window.crmPendingContactRequestForBooking = request;

        close();

        const inbox = document.getElementById("crmUnifiedInboxModal");
        if (inbox) inbox.style.display = "none";

        // Nie dodajemy klienta i nie zamykamy zgłoszenia na tym etapie.
        crmOpenAppointmentForContact(request);
    };

    return modal;
}

function crmConfirmContactDataV2(request) {
    if (!request) return;

    const modal = crmEnsureContactDataConfirmModalV2();
    modal._crmRequest = request;

    const name = document.getElementById("crmContactConfirmNameV2");
    const phone = document.getElementById("crmContactConfirmPhoneV2");
    const question = document.getElementById("crmContactConfirmQuestionV2");

    if (name) name.value = request.name || "";
    if (phone) phone.value = request.phone || "";
    if (question) question.textContent = request.message || request.question || "Brak dodatkowej wiadomości.";

    modal.style.display = "flex";
    window.setTimeout(() => name?.focus(), 0);
}

/* Stary przycisk w ukrytym panelu także korzysta z nowego, bezpiecznego przebiegu. */
const crmHandleContactRequestBeforeInboxV2 = crmHandleContactRequest;
crmHandleContactRequest = async function(request, action) {
    if (!request?.id) return;

    if (action === "ADD_CLIENT") {
        crmConfirmContactDataV2(request);
        return;
    }

    return crmHandleContactRequestBeforeInboxV2(request, action);
};

async function crmDecideBookingRequestFromInboxV2(item, choice) {
    if (!item?.id) return;

    const label =
        choice === "MAIN" ? item.main :
        choice === "ALT" ? item.alternative :
        "oba terminy";

    if (choice !== "REJECT") {
        const ok = window.confirm(`Potwierdzić termin ${label || "—"}?`);
        if (!ok) return;
    } else {
        const ok = window.confirm("Odrzucić oba zaproponowane terminy?");
        if (!ok) return;
    }

    try {
        const response = await crmPost({
            action: "decideBookingRequest",
            requestId: item.id,
            choice
        });

        if (!response?.success) {
            throw new Error(response?.error || "Nie udało się zapisać decyzji");
        }

        item.readState = "OBSŁUŻONE";
        item.status = choice === "REJECT" ? "ODRZUCONA" : "POTWIERDZONA";
        crmRenderUnifiedInbox();

        if (typeof crmToast === "function") {
            crmToast(choice === "REJECT" ? "Prośba została odrzucona." : "Termin został potwierdzony.");
        }

        Promise.resolve().then(async () => {
            if (typeof crmLightSyncCalendarData === "function") {
                await crmLightSyncCalendarData("decyzja-skrzynka");
            }
            await crmLoadUnifiedInbox({ silent: true, force: true });
        }).catch(console.error);

    } catch (error) {
        if (typeof crmToast === "function") crmToast(error.message || String(error), "error");
    }
}

/* Nadpisujemy wyłącznie render Skrzynki, zachowując jej strukturę i filtry. */
const crmRenderUnifiedInboxBeforeV2 = crmRenderUnifiedInbox;
crmRenderUnifiedInbox = function() {
    crmRenderUnifiedInboxBeforeV2();

    const body = document.getElementById("crmUnifiedInboxBody");
    if (!body) return;

    // Podmień akcje kart na finalny przepływ.
    const rows = crmUnifiedInboxFilter === "ALL"
        ? crmUnifiedInboxItems
        : crmUnifiedInboxItems.filter(item => crmInboxStatusLabel(item.readState) === crmUnifiedInboxFilter);

    const cards = Array.from(body.querySelectorAll("article"));

    cards.forEach((card, index) => {
        const item = rows[index];
        if (!item) return;

        const actions = card.querySelector(".crm-inbox-actions");
        if (!actions) return;

        const state = crmInboxStatusLabel(item.readState);

        // Zachowaj tylko przycisk "Oznacz jako przeczytane" utworzony przez V1.
        const readButton = Array.from(actions.querySelectorAll("button"))
            .find(btn => btn.textContent.includes("Oznacz jako przeczytane"));

        actions.innerHTML = "";
        if (readButton && state === "NOWE") actions.appendChild(readButton);

        if (item.type === "CONTACT_FORM" && state !== "OBSŁUŻONE") {
            const schedule = document.createElement("button");
            schedule.type = "button";
            schedule.className = "btn-primary";
            schedule.textContent = "Dodaj klienta i umów";
            schedule.onclick = () => crmConfirmContactDataV2(item);

            const done = document.createElement("button");
            done.type = "button";
            done.className = "btn-secondary";
            done.textContent = "Obsłużone";
            done.onclick = async () => {
                await crmHandleContactRequestBeforeInboxV2(item, "DONE");
                await crmLoadUnifiedInbox({ silent: true, force: true }).catch(console.error);
            };

            actions.append(schedule, done);
        }

        if (item.type === "BOOKING_REQUEST" && item.status === "OCZEKUJE") {
            const main = document.createElement("button");
            main.type = "button";
            main.className = "btn-primary";
            main.textContent = "Potwierdź główny";
            main.onclick = () => crmDecideBookingRequestFromInboxV2(item, "MAIN");

            const alt = document.createElement("button");
            alt.type = "button";
            alt.className = "btn-secondary";
            alt.textContent = "Potwierdź alternatywny";
            alt.onclick = () => crmDecideBookingRequestFromInboxV2(item, "ALT");

            const reject = document.createElement("button");
            reject.type = "button";
            reject.className = "btn-danger";
            reject.textContent = "Odrzuć";
            reject.onclick = () => crmDecideBookingRequestFromInboxV2(item, "REJECT");

            actions.append(main, alt, reject);
        }
    });

    crmHideLegacyInboxPanelsV2();
};

/* Powrót do ADMIN = lekka synchronizacja nowych wizyt.
   Nie ma setInterval; działa tylko na focus/visibility. */
let crmAppointmentsReturnSyncLastV2 = 0;
function crmSyncAppointmentsOnReturnV2() {
    const now = Date.now();
    if (now - crmAppointmentsReturnSyncLastV2 < 8000) return;
    crmAppointmentsReturnSyncLastV2 = now;

    if (typeof crmLightSyncCalendarData === "function") {
        crmLightSyncCalendarData("powrot-do-admin").catch(error => {
            console.error("Odświeżanie wizyt po powrocie do ADMIN:", error);
        });
    }
}

document.addEventListener("DOMContentLoaded", () => {
    window.setTimeout(() => {
        crmHideLegacyInboxPanelsV2();
        crmEnsureContactDataConfirmModalV2();
    }, 1900);
});

window.addEventListener("focus", crmSyncAppointmentsOnReturnV2);
document.addEventListener("visibilitychange", () => {
    if (!document.hidden) crmSyncAppointmentsOnReturnV2();
});

/* KONIEC ADMIN INBOX V2 */

/* ==========================================================================
   ADMIN INBOX V3 2026-08-12
   JEDEN ODCZYT SKRZYNKI — bez równoległych starych zapytań.
   ========================================================================== */
let crmUnifiedInboxPromiseV3 = null;
let crmUnifiedInboxLastSuccessV3 = 0;

function crmSetUnifiedInboxConnectionStateV3(ok, message) {
    const badge = document.getElementById("crmUnifiedInboxBadge");
    const summary = document.getElementById("crmUnifiedInboxSummary");

    if (ok) {
        if (badge) {
            badge.title = "";
            badge.style.background = "#b3261e";
        }
        return;
    }

    if (badge) {
        badge.textContent = "!";
        badge.style.display = "inline-flex";
        badge.style.background = "#b3261e";
        badge.title = message || "Nie udało się odświeżyć Skrzynki";
    }

    if (summary) {
        summary.textContent = "Nie udało się odświeżyć danych.";
    }
}

async function crmFetchUnifiedInboxFastV3() {
    const controller = typeof AbortController !== "undefined"
        ? new AbortController()
        : null;

    // Osobny lekki endpoint. 15 s obejmuje również sporadyczny cold-start Apps Script.
    const timer = controller
        ? window.setTimeout(() => controller.abort(), 15000)
        : null;

    try {
        const separator = APPS_SCRIPT_URL.includes("?") ? "&" : "?";
        const url =
            `${APPS_SCRIPT_URL}${separator}adminInbox=true&_crmInbox=${Date.now()}`;

        const response = await fetch(url, {
            method: "GET",
            cache: "no-store",
            signal: controller ? controller.signal : undefined
        });

        if (!response.ok) {
            throw new Error("HTTP " + response.status);
        }

        const data = await response.json();

        if (!data || data.success !== true) {
            throw new Error(data?.error || "Nieprawidłowa odpowiedź Skrzynki");
        }

        return data;
    } catch (error) {
        if (error?.name === "AbortError") {
            throw new Error("Skrzynka ADMIN nie odpowiedziała. Spróbuj ponownie.");
        }
        throw error;
    } finally {
        if (timer) window.clearTimeout(timer);
    }
}

/*
 * Finalne nadpisanie loadera.
 * Jeżeli kilka zdarzeń (focus, visibility, wejście w Kalendarz) wystąpi naraz,
 * wszystkie czekają na TEN SAM promise zamiast wysyłać 2–4 zapytania.
 */
crmLoadUnifiedInbox = async function(options = {}) {
    if (crmUnifiedInboxPromiseV3) {
        return crmUnifiedInboxPromiseV3;
    }

    const body = document.getElementById("crmUnifiedInboxBody");

    if (body && options.silent !== true) {
        body.innerHTML =
            '<div style="padding:20px;color:#777;">Ładowanie skrzynki…</div>';
    }

    crmUnifiedInboxPromiseV3 = (async () => {
        try {
            const response = await crmFetchUnifiedInboxFastV3();

            crmUnifiedInboxItems =
                Array.isArray(response.items) ? response.items : [];

            crmUnifiedInboxLastSuccessV3 = Date.now();
            crmSetUnifiedInboxConnectionStateV3(true);
            crmRenderUnifiedInbox();

            return crmUnifiedInboxItems;
        } catch (error) {
            const message = error?.message || String(error);
            crmSetUnifiedInboxConnectionStateV3(false, message);

            if (body && options.silent !== true) {
                body.innerHTML =
                    `<div style="padding:14px;color:#b3261e;">
                       ${crmInboxEscape(message)}
                       <div style="margin-top:10px;">
                         <button type="button" class="btn-secondary" id="crmInboxRetryV3">
                           Spróbuj ponownie
                         </button>
                       </div>
                     </div>`;

                document.getElementById("crmInboxRetryV3")
                    ?.addEventListener("click", () =>
                        crmLoadUnifiedInbox({ force: true }).catch(console.error)
                    );
            }

            throw error;
        } finally {
            crmUnifiedInboxPromiseV3 = null;
        }
    })();

    return crmUnifiedInboxPromiseV3;
};

/*
 * KLUCZOWA POPRAWKA:
 * stare listenery EVENT-DRIVEN nadal istnieją w pliku, ale od teraz
 * wywołują wyłącznie nową Skrzynkę. Nie uruchamiają już równolegle
 * getBookingRequests + getContactFormRequests.
 */
crmCheckEventDrivenInbox = async function(options = {}) {
    return crmLoadUnifiedInbox({
        silent: options?.notify === false || document.getElementById("crmUnifiedInboxModal")?.style.display !== "flex"
    });
};

/* Nie używamy starego watchera próśb jako osobnego źródła danych. */
crmStartRequestNoticeWatch = function() {
    crmLoadUnifiedInbox({ silent: true }).catch(console.error);
};

/*
 * Badge ma być zawsze wynikiem ostatniego poprawnego odczytu.
 * Przy błędzie dostaje "!", więc nie pokazuje starej liczby jako aktualnej.
 */
const crmUpdateUnifiedInboxBadgeBeforeV3 = crmUpdateUnifiedInboxBadge;
crmUpdateUnifiedInboxBadge = function(counts) {
    crmUpdateUnifiedInboxBadgeBeforeV3(counts);
    const badge = document.getElementById("crmUnifiedInboxBadge");
    if (badge) {
        badge.title = "";
        badge.style.background = "#b3261e";
    }
};

/* KONIEC ADMIN INBOX V3 */

/* ==========================================================================
   ADMIN INBOX FINAL V5 2026-08-12
   Prawy panel + mikro-ping co 60 s tylko przy aktywnej karcie.
   ========================================================================== */
const CRM_INBOX_PING_INTERVAL_MS = 60000;
const CRM_INBOX_NOTIFICATION_SEEN_KEY = "crm_admin_inbox_notification_seen_v1";
let crmInboxPingTimerV5 = null;
let crmInboxPingBusyV5 = false;

function crmCloseUnifiedInboxPanelV5() {
    const overlay = document.getElementById("crmUnifiedInboxModal");
    if (overlay) overlay.hidden = true;
}

function crmCloseOtherRightContextsV5(except) {
    if (except !== "inbox") crmCloseUnifiedInboxPanelV5();

    if (except !== "day-list" && typeof crmCloseDayVisitsList === "function") {
        crmCloseDayVisitsList();
    }

    if (except !== "visit") {
        try {
            const details = document.getElementById("appointmentDetailsModal");
            if (details && getComputedStyle(details).display !== "none" && typeof closeAppointmentModal === "function") {
                closeAppointmentModal();
            }
        } catch (ignore) {}
        if (typeof crmToggleVisitStatusMenu === "function") crmToggleVisitStatusMenu(false);
        if (typeof crmToggleVisitTrashMenu === "function") crmToggleVisitTrashMenu(false);
    }
}

crmEnsureUnifiedInboxModal = function() {
    let overlay = document.getElementById("crmUnifiedInboxModal");

    if (overlay && overlay.dataset.crmRightInboxV5 !== "1") {
        overlay.remove();
        overlay = null;
    }
    if (overlay) return overlay;

    overlay = document.createElement("div");
    overlay.id = "crmUnifiedInboxModal";
    overlay.dataset.crmRightInboxV5 = "1";
    overlay.className = "crm-day-list-overlay";
    overlay.hidden = true;

    overlay.innerHTML = `
      <section class="crm-day-list-panel" role="dialog" aria-modal="false" aria-labelledby="crmUnifiedInboxTitle">
        <header>
          <div style="min-width:0;flex:1;">
            <span>WIADOMOŚCI I PROŚBY</span>
            <h3 id="crmUnifiedInboxTitle">Skrzynka</h3>
            <small id="crmUnifiedInboxSummary" style="display:block;margin-top:4px;color:#7b7076;font-size:11px;"></small>
          </div>
          <div style="display:flex;align-items:center;gap:6px;">
            <button type="button" id="crmUnifiedInboxSyncForm" class="btn-secondary"
                    style="min-height:34px;padding:6px 9px;font-size:10px;"
                    title="Awaryjna synchronizacja formularza pierwszej wizyty">↻ Formularz</button>
            <button type="button" id="crmUnifiedInboxRefresh" class="btn-secondary"
                    style="min-height:34px;padding:6px 9px;font-size:10px;">Odśwież</button>
            <button type="button" id="crmUnifiedInboxClose" class="crm-day-list-close" aria-label="Zamknij">×</button>
          </div>
        </header>

        <div style="padding:10px 12px;border-bottom:1px solid #eee5e9;display:flex;gap:3px;flex-wrap:wrap;">
          <button type="button" data-inbox-filter="ALL" class="btn-secondary" style="font-size:10px;padding:6px 9px;">Wszystkie</button>
          <button type="button" data-inbox-filter="NOWE" class="btn-secondary" style="font-size:10px;padding:6px 9px;">Nowe</button>
          <button type="button" data-inbox-filter="PRZECZYTANE" class="btn-secondary" style="font-size:10px;padding:6px 9px;">Przeczytane</button>
          <button type="button" data-inbox-filter="OBSŁUŻONE" class="btn-secondary" style="font-size:10px;padding:6px 9px;">Obsłużone (2 h)</button>
        </div>

        <div id="crmUnifiedInboxBody" class="crm-day-list-body">
          <div style="padding:20px;color:#777;">Ładowanie…</div>
        </div>
      </section>`;

    document.body.appendChild(overlay);

    overlay.querySelector("#crmUnifiedInboxClose").onclick = crmCloseUnifiedInboxPanelV5;
    overlay.querySelector("#crmUnifiedInboxRefresh").onclick =
        () => crmLoadUnifiedInbox({force:true}).catch(console.error);
    overlay.querySelector("#crmUnifiedInboxSyncForm").onclick =
        () => crmManualSyncContactFormInbox();

    overlay.querySelectorAll("[data-inbox-filter]").forEach(button => {
        button.onclick = () => {
            crmUnifiedInboxFilter = button.dataset.inboxFilter || "ALL";
            crmRenderUnifiedInbox();
        };
    });

    return overlay;
};

crmOpenUnifiedInbox = async function() {
    crmCloseOtherRightContextsV5("inbox");
    const overlay = crmEnsureUnifiedInboxModal();
    overlay.hidden = false;
    await crmLoadUnifiedInbox({force:true}).catch(console.error);
};

function crmReadInboxNotificationSeenV5() {
    try {
        const raw = JSON.parse(localStorage.getItem(CRM_INBOX_NOTIFICATION_SEEN_KEY) || "[]");
        return new Set(Array.isArray(raw) ? raw.map(String) : []);
    } catch (ignore) {
        return new Set();
    }
}

function crmWriteInboxNotificationSeenV5(set) {
    try {
        localStorage.setItem(
            CRM_INBOX_NOTIFICATION_SEEN_KEY,
            JSON.stringify(Array.from(set).slice(-500))
        );
    } catch (ignore) {}
}

async function crmFetchInboxPingV5() {
    const separator = APPS_SCRIPT_URL.includes("?") ? "&" : "?";
    const url = `${APPS_SCRIPT_URL}${separator}adminInboxPing=true&_crmPing=${Date.now()}`;
    const controller = typeof AbortController !== "undefined" ? new AbortController() : null;
    const timer = controller ? window.setTimeout(() => controller.abort(), 9000) : null;

    try {
        const response = await fetch(url, {
            method:"GET",
            cache:"no-store",
            signal:controller ? controller.signal : undefined
        });
        if (!response.ok) throw new Error("HTTP " + response.status);
        const data = await response.json();
        if (!data?.success) throw new Error(data?.error || "Błąd licznika Skrzynki");
        return data;
    } finally {
        if (timer) window.clearTimeout(timer);
    }
}

async function crmRunInboxPingV5() {
    if (crmInboxPingBusyV5 || document.hidden) return;
    crmInboxPingBusyV5 = true;

    try {
        const data = await crmFetchInboxPingV5();
        const items = Array.isArray(data.newItems) ? data.newItems : [];
        const count = Math.max(0, Number(data.newCount) || 0);
        crmUpdateUnifiedInboxBadge({new:count});

        const seen = crmReadInboxNotificationSeenV5();
        const initialized = localStorage.getItem(CRM_INBOX_NOTIFICATION_SEEN_KEY) !== null;

        const fresh = items.filter(item => {
            const key = `${item.type}:${item.id}`;
            return key && !seen.has(key);
        });

        items.forEach(item => {
            const key = `${item.type}:${item.id}`;
            if (key) seen.add(key);
        });
        crmWriteInboxNotificationSeenV5(seen);

        if (initialized && fresh.length) {
            const first = fresh[0];
            const title = fresh.length > 1
                ? `Nowe wpisy w Skrzynce: ${fresh.length}`
                : (first.type === "CONTACT_FORM" || first.requestType === "FIRST_VISIT")
                    ? `Nowe zapytanie o pierwszą wizytę${first.name ? ": " + first.name : ""}`
                    : `Nowa prośba o termin przez stronę${first.name ? ": " + first.name : ""}`;

            if (typeof crmShowSimpleAdminNotice === "function") {
                crmShowSimpleAdminNotice(title, "Otwórz Skrzynkę", () => crmOpenUnifiedInbox());
            } else if (typeof crmToast === "function") {
                crmToast(title);
            }

            const overlay = document.getElementById("crmUnifiedInboxModal");
            if (overlay && !overlay.hidden) {
                crmLoadUnifiedInbox({silent:true, force:true}).catch(console.error);
            }
        }
    } catch (error) {
        console.warn("Lekki ping Skrzynki:", error?.message || error);
    } finally {
        crmInboxPingBusyV5 = false;
    }
}

function crmStartInboxPingV5() {
    if (crmInboxPingTimerV5) clearInterval(crmInboxPingTimerV5);
    window.setTimeout(() => crmRunInboxPingV5(), 6000);
    crmInboxPingTimerV5 = window.setInterval(() => {
        if (!document.hidden) crmRunInboxPingV5();
    }, CRM_INBOX_PING_INTERVAL_MS);
}

if (typeof openAppointmentDetailsModal === "function") {
    const crmInboxVisitOpenOriginalV5 = openAppointmentDetailsModal;
    openAppointmentDetailsModal = function() {
        crmCloseOtherRightContextsV5("visit");
        return crmInboxVisitOpenOriginalV5.apply(this, arguments);
    };
}

if (typeof crmOpenDayVisitsList === "function") {
    const crmInboxDayListOpenOriginalV5 = crmOpenDayVisitsList;
    crmOpenDayVisitsList = function() {
        crmCloseOtherRightContextsV5("day-list");
        return crmInboxDayListOpenOriginalV5.apply(this, arguments);
    };
}

const crmHideLegacyInboxPanelsBeforeV5 =
    typeof crmHideLegacyInboxPanelsV2 === "function"
        ? crmHideLegacyInboxPanelsV2
        : null;

crmHideLegacyInboxPanelsV2 = function() {
    if (crmHideLegacyInboxPanelsBeforeV5) crmHideLegacyInboxPanelsBeforeV5();
    const bookingPanel = document.getElementById("booking-requests-panel");
    const contactPanel = document.getElementById("contact-form-requests-panel");
    if (bookingPanel) bookingPanel.style.display = "none";
    if (contactPanel) contactPanel.style.display = "none";
};

document.addEventListener("DOMContentLoaded", () => {
    window.setTimeout(() => {
        crmEnsureUnifiedInboxButton();
        crmEnsureUnifiedInboxModal();
        crmHideLegacyInboxPanelsV2();
        crmStartInboxPingV5();
    }, 2100);
});

document.addEventListener("visibilitychange", () => {
    if (!document.hidden) crmRunInboxPingV5();
});
window.addEventListener("focus", () => crmRunInboxPingV5());

/* KONIEC ADMIN INBOX FINAL V5 */

/* ==========================================================================
   CORE RELIABILITY V6 2026-08-12
   Pasek stanu pod kalendarzem + szybkie odswiezanie aktywnej zakladki.
   ========================================================================== */
let crmActiveTabNameV6 = "kalendarz";
let crmTabRefreshBusyV6 = false;
let crmLastTabRefreshAtV6 = 0;

function crmEnsureBackgroundStatusPanel() {
    let panel = document.getElementById("crmBackgroundStatusPanel");
    if (panel) return panel;

    panel = document.createElement("section");
    panel.id = "crmBackgroundStatusPanel";
    panel.style.cssText =
        "margin:10px 0 12px;padding:0;display:grid;gap:7px;";

    panel.innerHTML = `
      <button type="button" id="crmTaskStatusSync"
              style="display:none;width:100%;text-align:left;border:1px solid #eadfe4;
                     background:#fff;border-radius:10px;padding:9px 10px;color:#675f63;
                     font-size:11px;line-height:1.35;cursor:default;"></button>
      <button type="button" id="crmTaskStatusSave"
              style="display:none;width:100%;text-align:left;border:1px solid #eadfe4;
                     background:#fff;border-radius:10px;padding:9px 10px;color:#675f63;
                     font-size:11px;line-height:1.35;cursor:pointer;"></button>`;

    const sidebar = document.querySelector("#tab-kalendarz .calendar-sidebar");
    const inboxButton = document.getElementById("crmUnifiedInboxButton");

    if (sidebar) {
        if (inboxButton && inboxButton.parentNode === sidebar) {
            sidebar.insertBefore(panel, inboxButton);
        } else {
            sidebar.appendChild(panel);
        }
    }

    return panel;
}

function crmSetBackgroundTaskStatus(task, state, text, options = {}) {
    /*
     * ADMIN UX V17.1
     * Zwykła synchronizacja danych działa całkowicie po cichu.
     * Nie tworzymy i nie odświeżamy już widocznego cyklu:
     * "Kalendarz: pobieranie...", "Dane gotowe", retry itd.
     *
     * To ogranicza zbędne operacje DOM podczas startu i synchronizacji.
     */
    if (task !== "save") {
        const oldSync = document.getElementById("crmTaskStatusSync");
        if (oldSync) oldSync.style.display = "none";

        // Błąd nadal może zostać pokazany jako lekki toast, bez stałego panelu.
        if (
            (state === "error" || state === "attention") &&
            text &&
            typeof crmToast === "function"
        ) {
            crmToast(String(text), "error");
        }
        return;
    }

    /*
     * Status operacji zapisu zostaje, bo pojawia się tylko podczas
     * konkretnej akcji użytkownika i może zawierać możliwość ponowienia.
     */
    crmEnsureBackgroundStatusPanel();

    const button = document.getElementById("crmTaskStatusSave");
    if (!button) return;

    if (!text || state === "hidden") {
        button.style.display = "none";
        button.onclick = null;
        return;
    }

    const icons = {
        loading: "⏳",
        retry: "↻",
        success: "✓",
        error: "⚠",
        pending: "•",
        attention: "!"
    };

    const palette = {
        loading: ["#f7f4f5", "#d9cbd1", "#665c61"],
        retry: ["#fff8ec", "#e7c477", "#8a6200"],
        success: ["#f1f8f2", "#a7cfad", "#2f6f3d"],
        error: ["#fff1f1", "#e0a4a4", "#9c2f2f"],
        pending: ["#f7f4f5", "#d9cbd1", "#665c61"],
        attention: ["#fff8ec", "#e7c477", "#8a6200"]
    };

    const colors = palette[state] || palette.pending;
    button.style.display = "block";
    button.style.background = colors[0];
    button.style.borderColor = colors[1];
    button.style.color = colors[2];
    button.innerHTML = `<strong>${icons[state] || "•"} ${String(text)}</strong>`;

    if (typeof options.onClick === "function") {
        button.style.cursor = "pointer";
        button.onclick = options.onClick;
    } else {
        button.style.cursor = "default";
        button.onclick = null;
    }

    if (state === "success" && options.keep !== true) {
        window.clearTimeout(button._crmHideTimer);
        button._crmHideTimer = window.setTimeout(() => {
            if (button.textContent.includes(String(text))) button.style.display = "none";
        }, Number(options.hideAfter) || 2500);
    }
}
window.crmSetBackgroundTaskStatus = crmSetBackgroundTaskStatus;

function crmDetectActiveTabV6() {
    const visible = Array.from(document.querySelectorAll(".tab-page")).find(node => {
        const style = getComputedStyle(node);
        return style.display !== "none";
    });
    return visible?.id?.replace(/^tab-/, "") || crmActiveTabNameV6 || "kalendarz";
}

async function crmRetryCalendarLightSyncV6(reason) {
    let lastError = null;
    const attempts = 5;
    const delays = [0, 800, 1600, 3200, 5500];

    for (let attempt = 1; attempt <= attempts; attempt += 1) {
        if (attempt > 1) {
            crmSetBackgroundTaskStatus(
                "sync",
                "retry",
                `Kalendarz: problem z odświeżeniem · próba ${attempt}/${attempts}`
            );
            await new Promise(resolve => setTimeout(resolve, delays[attempt - 1]));
        }

        try {
            const result = await crmLightSyncCalendarData(reason);
            crmSetBackgroundTaskStatus("sync", "success", "Kalendarz aktualny");
            return result;
        } catch (error) {
            lastError = error;
        }
    }

    crmSetBackgroundTaskStatus(
        "sync",
        "error",
        "Kalendarz: nie udało się odświeżyć. Kliknij, aby ponowić.",
        { onClick: () => crmRetryCalendarLightSyncV6("reczne-ponowienie").catch(console.error) }
    );
    throw lastError || new Error("Nie udało się odświeżyć Kalendarza");
}

/* Wszystkie istniejące listenery calendar.js wołają tę nazwę dynamicznie,
   więc od tej chwili również korzystają z retry. */
crmScheduleCalendarLightSync = function(reason) {
    clearTimeout(crmScheduleCalendarLightSync.timer);
    crmScheduleCalendarLightSync.timer = setTimeout(() => {
        crmRetryCalendarLightSyncV6(reason).catch(console.error);
    }, 100);
};
crmScheduleCalendarLightSync.timer = null;

async function crmRefreshTabIfChangedV6(tabName, reason) {
    if (!window.crmSystemBootCompleteV2 || crmTabRefreshBusyV6) return;

    const now = Date.now();
    if (now - crmLastTabRefreshAtV6 < 2500) return;
    crmLastTabRefreshAtV6 = now;
    crmTabRefreshBusyV6 = true;

    try {
        tabName = tabName || crmDetectActiveTabV6();

        /* Google Calendar może zmienić się niezależnie od arkusza,
           więc przy powrocie do Kalendarza robimy jego lekki zakresowy sync. */
        if (tabName === "kalendarz") {
            await crmRetryCalendarLightSyncV6(reason || "powrot-do-kalendarza");
            if (typeof crmCaptureRemoteStateV2 === "function") {
                await crmCaptureRemoteStateV2();
            }
            return;
        }

        if (typeof crmFetchRemoteStateV2 !== "function") return;
        const next = await crmFetchRemoteStateV2();
        const previous = window.crmRemoteStateV2 || null;

        const changed = key =>
            !previous || String(previous[key] || "") !== String(next[key] || "");

        if (tabName === "klienci" && changed("clients") && typeof crmLoadClientsPrimaryV2 === "function") {
            await crmLoadClientsPrimaryV2();
        } else if (
            (tabName === "cennik" || tabName === "ustawienia") &&
            (changed("services") || changed("calendar"))
        ) {
            if (changed("services") && typeof crmLoadServicesPrimaryV2 === "function") {
                await crmLoadServicesPrimaryV2();
            }
            if (tabName === "ustawienia" && changed("calendar") && typeof crmLoadCalendarPrimaryV2 === "function") {
                await crmLoadCalendarPrimaryV2();
            }
        } else if ((tabName === "dashboard" || tabName === "finanse") && changed("calendar")) {
            await crmRetryCalendarLightSyncV6("zmiana-danych:" + tabName);
        }

        window.crmRemoteStateV2 = next;

        if (typeof renderDashboard === "function" && tabName === "dashboard") renderDashboard();
        if (typeof calculateFinanceReport === "function" && tabName === "finanse") calculateFinanceReport();
    } catch (error) {
        console.warn("Szybkie odświeżanie zakładki:", error);
    } finally {
        crmTabRefreshBusyV6 = false;
    }
}

if (typeof switchTab === "function") {
    const crmReliabilitySwitchTabOriginalV6 = switchTab;
    switchTab = function(tabName) {
        crmActiveTabNameV6 = tabName || "kalendarz";
        const result = crmReliabilitySwitchTabOriginalV6.apply(this, arguments);
        window.setTimeout(() => {
            crmRefreshTabIfChangedV6(crmActiveTabNameV6, "wejscie:" + crmActiveTabNameV6);
        }, 30);
        return result;
    };
}

document.addEventListener("DOMContentLoaded", () => {
    window.setTimeout(() => {
        crmEnsureBackgroundStatusPanel();
        crmActiveTabNameV6 = crmDetectActiveTabV6();
    }, 500);
});

window.addEventListener("focus", () => {
    crmRefreshTabIfChangedV6(crmDetectActiveTabV6(), "focus");
});

document.addEventListener("visibilitychange", () => {
    if (!document.hidden) {
        crmRefreshTabIfChangedV6(crmDetectActiveTabV6(), "powrot-do-karty");
    }
});

/* KONIEC CORE RELIABILITY V6 */

/* CORE RELIABILITY V6.1 — stare listenery nie rozbijaja kolejnosci startu. */
if (typeof crmLightSyncCalendarData === "function") {
    const crmReliabilityLightSyncOriginalV61 = crmLightSyncCalendarData;
    crmLightSyncCalendarData = async function() {
        if (window.crmBootInProgressV2) return { skippedDuringBoot:true };
        return crmReliabilityLightSyncOriginalV61.apply(this, arguments);
    };
}

crmCheckEventDrivenInbox = async function(options = {}) {
    if (window.crmBootInProgressV2) return [];
    if (typeof crmLoadUnifiedInbox === "function") {
        return crmLoadUnifiedInbox({
            silent: options?.notify === false ||
                document.getElementById("crmUnifiedInboxModal")?.hidden !== false
        });
    }
    return [];
};
/* KONIEC CORE RELIABILITY V6.1 */



/* ==========================================================================
   ADMIN FIRST VISIT V8 2026-08-12
   Skrzynka -> propozycje na glownym Kalendarzu -> standardowy zapis wizyty.
   ========================================================================== */
window.crmFirstVisitSelectionModeV8 = window.crmFirstVisitSelectionModeV8 || {active:false,item:null};
window.crmPendingFirstVisitRequestForBooking = window.crmPendingFirstVisitRequestForBooking || null;

function crmFirstVisitNormalizeProposalsV8(item){
    const proposals=Array.isArray(item?.proposals)?item.proposals:[];
    return proposals.filter(row=>row&&/^\d{4}-\d{2}-\d{2}$/.test(String(row.date||""))).slice(0,3).map(row=>({
        date:String(row.date),
        times:Array.isArray(row.times)?Array.from(new Set(row.times.map(v=>String(v||"").slice(0,5)))).slice(0,2):[]
    }));
}
function crmFirstVisitFormatDayV8(dateKey){
    const date=new Date(`${dateKey}T12:00:00`);
    if(Number.isNaN(date.getTime()))return dateKey;
    return date.toLocaleDateString("pl-PL",{weekday:"short",day:"2-digit",month:"2-digit"});
}
function crmFirstVisitSetSelectionModeV8(item){
    window.crmFirstVisitSelectionModeV8={active:Boolean(item),item:item||null};
    window.crmPendingFirstVisitRequestForBooking=item||null;
    document.body.classList.toggle("crm-first-visit-selection-active",Boolean(item));
    if(typeof crmSetBackgroundTaskStatus==="function"&&item){
        crmSetBackgroundTaskStatus("save","pending",
            `Wybór terminu: ${item.name||"pierwsza wizyta"} — kliknij propozycję albo wolne miejsce w kalendarzu`,
            {keep:true,onClick:()=>{const inbox=document.getElementById("crmUnifiedInboxModal");if(inbox)inbox.hidden=false;}}
        );
    }
}
function crmFirstVisitClearSelectionModeV8(){
    window.crmFirstVisitSelectionModeV8={active:false,item:null};
    window.crmPendingFirstVisitRequestForBooking=null;
    const appointmentModal=document.getElementById("appointmentModal");
    if(appointmentModal)delete appointmentModal.dataset.crmFirstVisitRequestIdV816;
    document.body.classList.remove("crm-first-visit-selection-active");
    const saveStatus=document.getElementById("crmTaskStatusSave");
    if(saveStatus&&!window.crmAppointmentSaveJobV7)saveStatus.style.display="none";
    if(typeof renderBooksyCalendar==="function")renderBooksyCalendar();
    if(typeof renderMiniMonthCalendar==="function")renderMiniMonthCalendar();
}
window.crmFirstVisitClearSelectionModeV8=crmFirstVisitClearSelectionModeV8;

function crmFirstVisitGoToDateV8(item,dateKey){
    if(!item||!dateKey)return;
    crmFirstVisitSetSelectionModeV8(item);
    if(typeof switchTab==="function")switchTab("kalendarz");
    if(typeof setCalendarView==="function")setCalendarView("day");
    const date=new Date(`${dateKey}T12:00:00`);
    if(!Number.isNaN(date.getTime())){
        selectedCalendarDate=new Date(date.getFullYear(),date.getMonth(),date.getDate());
        miniMonthDate=new Date(selectedCalendarDate);
    }
    if(typeof renderMiniMonthCalendar==="function")renderMiniMonthCalendar();
    if(typeof renderBooksyCalendar==="function")renderBooksyCalendar();
}
window.crmFirstVisitGoToDateV8=crmFirstVisitGoToDateV8;

async function crmShowFirstVisitProposalsV8(item){
    if(!item)return;
    try{
        if(crmInboxStatusLabel(item.readState)==="NOWE")await crmMarkUnifiedInboxItemRead(item,false);
    }catch(error){console.warn("Oznaczanie pierwszej wizyty:",error);}
    const proposals=crmFirstVisitNormalizeProposalsV8(item);
    const firstDate=proposals[0]?.date||new Date().toISOString().slice(0,10);
    crmFirstVisitGoToDateV8(item,firstDate);
    const inbox=document.getElementById("crmUnifiedInboxModal");if(inbox)inbox.hidden=false;
}
window.crmShowFirstVisitProposalsV8=crmShowFirstVisitProposalsV8;

function crmOpenFirstVisitAppointmentV8(item,isoDateTime=""){
    if(!item)return;

    crmFirstVisitSetSelectionModeV8(item);
    window.crmPendingFirstVisitRequestForBooking=item;
    window.crmPendingContactRequestForBooking=null;

    const appointmentModal=document.getElementById("appointmentModal");
    const alreadyOpen=Boolean(
        appointmentModal &&
        getComputedStyle(appointmentModal).display!=="none" &&
        String(appointmentModal.dataset.crmFirstVisitRequestIdV816 || "")===String(item.id || "")
    );

    /*
     * V26.16:
     * Kliknięcie kolejnej propozycji / innej godziny dla TEJ SAMEJ prośby
     * nie otwiera następnego formularza i nie parkuje poprzedniego.
     * Aktualizujemy istniejący formularz 1:1.
     */
    if(!alreadyOpen){
        window.crmOpeningFirstVisitAppointmentV8 = true;
        try {
            if(typeof openCreateModal==="function")openCreateModal();
        } finally {
            window.crmOpeningFirstVisitAppointmentV8 = false;
        }
        if(appointmentModal){
            appointmentModal.dataset.crmFirstVisitRequestIdV816=String(item.id||"");
        }
    }

    const set=(id,value)=>{const node=document.getElementById(id);if(node)node.value=value??"";};

    /*
     * Przy ponownym wyborze terminu nie resetujemy ręcznych poprawek
     * w imieniu/usłudze. Uzupełniamy dane klienta tylko przy pierwszym otwarciu.
     */
    if(!alreadyOpen){
        set("appointmentName",item.name||"");
        set("appointmentPhone",item.phone||"");
        set("appointmentService",item.service||"");
        set("appointmentDuration",Number(item.duration)||45);
    }

    if(isoDateTime)set("appointmentDateTime",isoDateTime);

    if(typeof crmSyncFiveMinuteControlsFromHidden==="function")crmSyncFiveMinuteControlsFromHidden();

    const title=document.getElementById("modalTitleAppointment");
    if(title)title.textContent="Pierwsza wizyta – zapytanie online";

    if(!alreadyOpen && typeof handleAppointmentServiceInput==="function"){
        handleAppointmentServiceInput();
    }

    const inbox=document.getElementById("crmUnifiedInboxModal");
    if(inbox)inbox.hidden=true;
}
window.crmOpenFirstVisitAppointmentV8=crmOpenFirstVisitAppointmentV8;

async function crmFirstVisitCloseWithoutBookingV8(item){
    if(!item?.id)return;
    if(!window.confirm("Oznaczyć tę prośbę jako obsłużoną bez tworzenia wizyty?"))return;
    try{
        const response=await crmPost({action:"decideBookingRequest",requestId:item.id,choice:"REJECT"});
        if(!response?.success)throw new Error(response?.error||"Nie udało się zamknąć prośby");
        item.status="ODRZUCONA";item.readState="OBSŁUŻONE";
        if(window.crmFirstVisitSelectionModeV8?.item?.id===item.id)crmFirstVisitClearSelectionModeV8();
        crmRenderUnifiedInbox();
        if(typeof crmToast==="function")crmToast("Prośba została oznaczona jako obsłużona.");
    }catch(error){if(typeof crmToast==="function")crmToast(error.message||String(error),"error");}
}

const crmRenderUnifiedInboxBeforeFirstVisitV8=crmRenderUnifiedInbox;
crmRenderUnifiedInbox=function(){
    crmRenderUnifiedInboxBeforeFirstVisitV8();
    const body=document.getElementById("crmUnifiedInboxBody");if(!body)return;
    const rows=crmUnifiedInboxFilter==="ALL"?(crmUnifiedInboxItems||[]):(crmUnifiedInboxItems||[]).filter(item=>crmInboxStatusLabel(item.readState)===crmUnifiedInboxFilter);
    const cards=Array.from(body.querySelectorAll("article"));
    cards.forEach((card,index)=>{
        const item=rows[index];
        if(!item||item.type!=="BOOKING_REQUEST"||item.requestType!=="FIRST_VISIT")return;
        card.classList.add("crm-first-visit-inbox-card");
        const proposals=crmFirstVisitNormalizeProposalsV8(item);
        const oldMain=Array.from(card.querySelectorAll("div")).find(node=>node.textContent?.includes("Termin główny:"));
        if(oldMain)oldMain.remove();
        let info=card.querySelector(".crm-first-visit-inbox-info");
        if(!info){info=document.createElement("div");info.className="crm-first-visit-inbox-info";const actions=card.querySelector(".crm-inbox-actions");if(actions)card.insertBefore(info,actions);else card.appendChild(info);}
        const proposalHtml=proposals.length?proposals.map(row=>`
          <button type="button" class="crm-first-visit-date-chip" data-first-visit-date="${row.date}">
            <b>${crmInboxEscape(crmFirstVisitFormatDayV8(row.date))}</b>
            <span>${row.times.length?crmInboxEscape(row.times.join(" · ")):"dowolna godzina"}</span>
          </button>`).join(""):`<span class="crm-first-visit-no-proposals">Klient nie wskazał konkretnego dnia.</span>`;
        info.innerHTML=`
          <div class="crm-first-visit-inbox-service"><span>Zabieg</span><strong>${crmInboxEscape(item.service||"—")}</strong><small>${Number(item.duration)||45} min</small></div>
          ${item.email?`<div class="crm-first-visit-inbox-email"><span>E-mail</span><strong>${crmInboxEscape(item.email)}</strong></div>`:""}
          <div class="crm-first-visit-inbox-proposals"><span>Preferencje klienta</span><div>${proposalHtml}</div></div>`;
        info.querySelectorAll("[data-first-visit-date]").forEach(button=>button.onclick=()=>crmFirstVisitGoToDateV8(item,button.dataset.firstVisitDate));
        const actions=card.querySelector(".crm-inbox-actions");if(!actions)return;
        const state=crmInboxStatusLabel(item.readState);
        const readButton=Array.from(actions.querySelectorAll("button")).find(btn=>btn.textContent.includes("Oznacz jako przeczytane"));
        actions.innerHTML="";if(readButton&&state==="NOWE")actions.appendChild(readButton);
        if(state!=="OBSŁUŻONE"&&item.status==="OCZEKUJE"){
            const show=document.createElement("button");show.type="button";show.className="btn-primary";show.textContent=proposals.length?"Pokaż propozycje w kalendarzu":"Wybierz termin w kalendarzu";show.onclick=()=>crmShowFirstVisitProposalsV8(item);
            const manual=document.createElement("button");manual.type="button";manual.className="btn-secondary";manual.textContent=proposals.length?"Wybierz inny termin":"Otwórz wybór terminu";manual.onclick=()=>{crmFirstVisitSetSelectionModeV8(item);if(typeof switchTab==="function")switchTab("kalendarz");if(typeof setCalendarView==="function")setCalendarView("day");if(typeof renderBooksyCalendar==="function")renderBooksyCalendar();};
            const done=document.createElement("button");done.type="button";done.className="btn-secondary";done.textContent="Obsłużone bez wizyty";done.onclick=()=>crmFirstVisitCloseWithoutBookingV8(item);
            actions.append(show,manual,done);
        }
    });
    const formSync=document.getElementById("crmUnifiedInboxSyncForm");if(formSync)formSync.style.display="none";
};
/* KONIEC ADMIN FIRST VISIT V8 */



/* Ręczne "Dodaj wizytę" nie może przypadkiem przejąć aktywnej prośby pierwszej wizyty. */
if (typeof openCreateModal === "function") {
    const crmOpenCreateModalBeforeFirstVisitV8 = openCreateModal;
    openCreateModal = function() {
        if (!window.crmOpeningFirstVisitAppointmentV8) {
            window.crmPendingFirstVisitRequestForBooking = null;
        }
        return crmOpenCreateModalBeforeFirstVisitV8.apply(this, arguments);
    };
}

/* ==========================================================================
   ADMIN NETWORK STABILITY V9 2026-08-12
   ========================================================================== */
let crmUnifiedInboxRequestGenerationV9 = 0;
let crmUnifiedInboxHardBusyV9 = false;

function crmUnifiedInboxIsOpenV9() {
    const modal = document.getElementById("crmUnifiedInboxModal");
    return Boolean(modal && modal.hidden === false);
}

async function crmFetchUnifiedInboxAttemptV9(attempt, total) {
    const body = document.getElementById("crmUnifiedInboxBody");

    if (body) {
        body.innerHTML =
            `<div style="padding:20px;color:#777;">Ładowanie skrzynki · próba ${attempt}/${total}</div>`;
    }

    const separator = APPS_SCRIPT_URL.includes("?") ? "&" : "?";
    const url =
        `${APPS_SCRIPT_URL}${separator}adminInbox=true&_crmInbox=${Date.now()}_${attempt}`;

    const controller =
        typeof AbortController !== "undefined" ? new AbortController() : null;

    let timer = null;

    try {
        const fetchPromise = fetch(url, {
            method:"GET",
            cache:"no-store",
            signal:controller ? controller.signal : undefined
        });

        const timeoutPromise = new Promise((_, reject) => {
            timer = window.setTimeout(() => {
                try { controller?.abort(); } catch (ignore) {}
                reject(new Error("Skrzynka nie odpowiedziała w wyznaczonym czasie."));
            }, 6500);
        });

        const response = await Promise.race([fetchPromise, timeoutPromise]);

        if (!response.ok) throw new Error("HTTP " + response.status);

        const data = await response.json();

        if (!data || data.success !== true) {
            throw new Error(data?.error || "Nieprawidłowa odpowiedź Skrzynki");
        }

        return data;
    } finally {
        if (timer) window.clearTimeout(timer);
    }
}

async function crmFetchUnifiedInboxReliableV9() {
    const total = 3;
    let lastError = null;

    for (let attempt = 1; attempt <= total; attempt += 1) {
        try {
            if (attempt > 1) {
                await new Promise(resolve =>
                    window.setTimeout(resolve, attempt === 2 ? 700 : 1400)
                );
            }
            return await crmFetchUnifiedInboxAttemptV9(attempt, total);
        } catch (error) {
            lastError = error;
        }
    }

    throw lastError || new Error("Nie udało się pobrać Skrzynki.");
}

/*
 * Ciche eventy nie pobierają pełnej Skrzynki.
 * Dzięki temu stare focus/visibility listenery nie tworzą kolejki.
 */
crmLoadUnifiedInbox = async function(options = {}) {
    const silent = options.silent === true;
    const force = options.force === true;
    const modalOpen = crmUnifiedInboxIsOpenV9();

    if (silent && !modalOpen) {
        if (typeof crmRunInboxPingV5 === "function") {
            try { await crmRunInboxPingV5(); } catch (ignore) {}
        }
        return Array.isArray(crmUnifiedInboxItems) ? crmUnifiedInboxItems : [];
    }

    if (crmUnifiedInboxHardBusyV9 && !force) {
        return Array.isArray(crmUnifiedInboxItems) ? crmUnifiedInboxItems : [];
    }

    const generation = ++crmUnifiedInboxRequestGenerationV9;
    const body = document.getElementById("crmUnifiedInboxBody");

    crmUnifiedInboxHardBusyV9 = true;

    try {
        const response = await crmFetchUnifiedInboxReliableV9();

        if (generation !== crmUnifiedInboxRequestGenerationV9) {
            return Array.isArray(crmUnifiedInboxItems) ? crmUnifiedInboxItems : [];
        }

        crmUnifiedInboxItems =
            Array.isArray(response.items) ? response.items : [];

        crmUnifiedInboxLastSuccessV3 = Date.now();

        if (typeof crmSetUnifiedInboxConnectionStateV3 === "function") {
            crmSetUnifiedInboxConnectionStateV3(true);
        }

        crmRenderUnifiedInbox();
        return crmUnifiedInboxItems;
    } catch (error) {
        const message = error?.message || String(error);

        if (typeof crmSetUnifiedInboxConnectionStateV3 === "function") {
            crmSetUnifiedInboxConnectionStateV3(false, message);
        }

        if (body && crmUnifiedInboxIsOpenV9()) {
            body.innerHTML = `
              <div style="padding:16px;color:#9b3a3a;">
                <strong>Nie udało się pobrać zawartości Skrzynki.</strong>
                <div style="margin-top:5px;font-size:11px;color:#766;">
                  Licznik nowych zgłoszeń nadal działa.
                </div>
                <div style="margin-top:11px;">
                  <button type="button" class="btn-secondary" id="crmInboxRetryV9">
                    Spróbuj ponownie
                  </button>
                </div>
              </div>`;

            document.getElementById("crmInboxRetryV9")?.addEventListener(
                "click",
                () => crmLoadUnifiedInbox({force:true}).catch(console.error)
            );
        }

        throw error;
    } finally {
        crmUnifiedInboxHardBusyV9 = false;
    }
};

crmOpenUnifiedInbox = async function() {
    crmCloseOtherRightContextsV5("inbox");
    const overlay = crmEnsureUnifiedInboxModal();
    overlay.hidden = false;

    crmUnifiedInboxRequestGenerationV9++;
    await crmLoadUnifiedInbox({force:true}).catch(console.error);
};

/* Focus / visibility / wejście w Kalendarz = tylko licznik. */
crmCheckEventDrivenInbox = async function() {
    if (window.crmBootInProgressV2) return [];
    if (typeof crmRunInboxPingV5 === "function") {
        try { await crmRunInboxPingV5(); } catch (ignore) {}
    }
    return [];
};

crmStartRequestNoticeWatch = function() {
    if (typeof crmRunInboxPingV5 === "function") {
        crmRunInboxPingV5().catch(console.error);
    }
};

/* Stary niezależny focus listener synchronizacji wizyt dublował kolejne zapytanie. */
try {
    if (typeof crmSyncAppointmentsOnReturnV2 === "function") {
        window.removeEventListener("focus", crmSyncAppointmentsOnReturnV2);
    }
} catch (ignore) {}

/*
 * Kalendarz: tylko lekki sync widocznego zakresu.
 * adminState jest potrzebny dopiero dla innych zakładek.
 */
crmRefreshTabIfChangedV6 = async function(tabName, reason) {
    if (!window.crmSystemBootCompleteV2 || crmTabRefreshBusyV6) return;

    const now = Date.now();
    if (now - crmLastTabRefreshAtV6 < 3000) return;

    crmLastTabRefreshAtV6 = now;
    crmTabRefreshBusyV6 = true;

    try {
        tabName = tabName || crmDetectActiveTabV6();

        if (tabName === "kalendarz") {
            await crmRetryCalendarLightSyncV6(reason || "powrot-do-kalendarza");
            return;
        }

        if (typeof crmFetchRemoteStateV2 !== "function") return;

        const next = await crmFetchRemoteStateV2();
        const previous = window.crmRemoteStateV2 || null;
        const changed = key =>
            !previous || String(previous[key] || "") !== String(next[key] || "");

        if (
            tabName === "klienci" &&
            changed("clients") &&
            typeof crmLoadClientsPrimaryV2 === "function"
        ) {
            await crmLoadClientsPrimaryV2();
        } else if (
            (tabName === "cennik" || tabName === "ustawienia") &&
            (changed("services") || changed("calendar"))
        ) {
            if (
                changed("services") &&
                typeof crmLoadServicesPrimaryV2 === "function"
            ) {
                await crmLoadServicesPrimaryV2();
            }

            if (
                tabName === "ustawienia" &&
                changed("calendar") &&
                typeof crmLoadCalendarPrimaryV2 === "function"
            ) {
                await crmLoadCalendarPrimaryV2();
            }
        } else if (
            (tabName === "dashboard" || tabName === "finanse") &&
            changed("calendar")
        ) {
            await crmRetryCalendarLightSyncV6("zmiana-danych:" + tabName);
        }

        window.crmRemoteStateV2 = next;

        if (typeof renderDashboard === "function" && tabName === "dashboard") {
            renderDashboard();
        }
        if (
            typeof calculateFinanceReport === "function" &&
            tabName === "finanse"
        ) {
            calculateFinanceReport();
        }
    } catch (error) {
        console.warn("Szybkie sprawdzanie zmian:", error);
    } finally {
        crmTabRefreshBusyV6 = false;
    }
};

/* KONIEC ADMIN NETWORK STABILITY V9 */

/* ==========================================================================
   ADMIN INBOX TRANSPORT V10 2026-08-12
   JSONP dla Skrzynki i pingu — bez wiszącego response.json().
   ========================================================================== */

crmFetchUnifiedInboxAttemptV9 = async function(attempt, total) {
    const body = document.getElementById("crmUnifiedInboxBody");

    if (body && crmUnifiedInboxIsOpenV9()) {
        body.innerHTML =
            `<div style="padding:20px;color:#777;">Ładowanie skrzynki · próba ${attempt}/${total}</div>`;
    }

    const data = await crmJsonpGetV10(
        `${APPS_SCRIPT_URL}?adminInbox=true&_crmInbox=${Date.now()}_${attempt}`,
        6000
    );

    if (!data || data.success !== true) {
        throw new Error(data?.error || "Nieprawidłowa odpowiedź Skrzynki");
    }

    return data;
};

crmFetchInboxPingV5 = async function() {
    const data = await crmJsonpGetV10(
        `${APPS_SCRIPT_URL}?adminInboxPing=true&_crmPing=${Date.now()}`,
        5000
    );

    if (!data || data.success !== true) {
        throw new Error(data?.error || "Błąd licznika Skrzynki");
    }

    return data;
};

/*
 * Po załadowaniu nowej wersji nie dziedziczymy żadnego starego,
 * zawieszonego Promise/flag ze wcześniejszych warstw.
 */
crmUnifiedInboxPromiseV3 = null;
crmUnifiedInboxHardBusyV9 = false;
crmInboxPingBusyV5 = false;

/*
 * Ręczny klik Odśwież również zawsze rozpoczyna świeżą generację.
 */
document.addEventListener("DOMContentLoaded", () => {
    window.setTimeout(() => {
        const refresh = document.getElementById("crmUnifiedInboxRefresh");
        if (refresh) {
            refresh.onclick = () => {
                crmUnifiedInboxRequestGenerationV9++;
                crmUnifiedInboxHardBusyV9 = false;
                crmLoadUnifiedInbox({force:true}).catch(console.error);
            };
        }
    }, 2300);
});

/* KONIEC ADMIN INBOX TRANSPORT V10 */

/* ==========================================================================
   ADMIN NETWORK COORDINATOR V11 2026-08-12
   Usuwa lawinę: ping + inbox + state + legacy getBookingRequests.
   ========================================================================== */
let crmInboxPromiseV11=null;
let crmInboxLastPingAtV11=0;
let crmInboxScheduleTimerV11=null;
const CRM_INBOX_MIN_PING_GAP_V11=55000;
const CRM_INBOX_BACKGROUND_DELAY_V11=60000;
const CRM_INBOX_FULL_CACHE_TTL_V25=45000;

/* Stary panel jest ukryty. Nie może już generować ciężkiego POST
   getBookingRequests przy każdym switchTab. */
loadBookingRequests=async function(){ return []; };
if(typeof crmLoadContactFormRequests==="function"){
    crmLoadContactFormRequests=async function(){ return []; };
}

crmFetchInboxPingV5=async function(){
    const data=await crmQueuedGetV11(
        `${APPS_SCRIPT_URL}?adminInboxPing=true&_crmPing=${Date.now()}`,
        {key:"adminInboxPing",priority:25,timeoutMs:30000}
    );
    if(!data?.success) throw new Error(data?.error||"Błąd licznika Skrzynki");
    return data;
};

crmRunInboxPingV5=async function(options={}){
    if(document.hidden || window.crmBootInProgressV2 || window.crmDiagnosticsNetworkModeV11) return null;
    if(document.getElementById("crmUnifiedInboxModal")?.hidden===false) return null;

    const now=Date.now();
    if(!options.force && now-crmInboxLastPingAtV11<CRM_INBOX_MIN_PING_GAP_V11) return null;
    crmInboxLastPingAtV11=now;

    try{
        const data=await crmFetchInboxPingV5();
        const items=Array.isArray(data.newItems)?data.newItems:[];
        const count=Math.max(0,Number(data.newCount)||0);
        window.crmInboxPingNewCountV25=count;
        crmUpdateUnifiedInboxBadge({new:count});

        const seen=crmReadInboxNotificationSeenV5();
        const initialized=localStorage.getItem(CRM_INBOX_NOTIFICATION_SEEN_KEY)!==null;
        const fresh=items.filter(item=>{
            const key=`${item.type}:${item.id}`;
            return key && !seen.has(key);
        });
        items.forEach(item=>{ const key=`${item.type}:${item.id}`; if(key) seen.add(key); });
        crmWriteInboxNotificationSeenV5(seen);

        if(initialized && fresh.length){
            const first=fresh[0];
            const title=fresh.length>1
                ? `Nowe wpisy w Skrzynce: ${fresh.length}`
                : (first.type==="CONTACT_FORM" || first.requestType==="FIRST_VISIT")
                    ? `Nowa prośba o pierwszą wizytę${first.name?": "+first.name:""}`
                    : `Nowa prośba o termin przez stronę${first.name?": "+first.name:""}`;
            if(typeof crmShowSimpleAdminNotice==="function"){
                crmShowSimpleAdminNotice(title,"Otwórz Skrzynkę",()=>crmOpenUnifiedInbox());
            }else if(typeof crmToast==="function") crmToast(title);
        }
        return data;
    }catch(error){
        console.warn("Lekki ping Skrzynki:",error?.message||error);
        return null;
    }
};

/* Jeden samoplanujący ping. Nie setInterval i nigdy nie nakłada się na siebie. */
crmStartInboxPingV5=function(){
    try{ if(crmInboxPingTimerV5) clearInterval(crmInboxPingTimerV5); }catch(ignore){}
    if(crmInboxScheduleTimerV11) clearTimeout(crmInboxScheduleTimerV11);

    const schedule=()=>{
        crmInboxScheduleTimerV11=window.setTimeout(async()=>{
            try{ await crmRunInboxPingV5(); }
            finally{ schedule(); }
        },CRM_INBOX_BACKGROUND_DELAY_V11);
    };
    schedule();
};

crmLoadUnifiedInbox=async function(options={}){
    const silent=options.silent===true;
    const force=options.force===true;
    const modal=document.getElementById("crmUnifiedInboxModal");
    const open=Boolean(modal && modal.hidden===false);

    if(silent && !open){
        await crmRunInboxPingV5();
        return Array.isArray(crmUnifiedInboxItems)?crmUnifiedInboxItems:[];
    }

    const cachedItems=Array.isArray(crmUnifiedInboxItems)?crmUnifiedInboxItems:[];
    const cacheAge=Date.now()-Number(crmUnifiedInboxLastSuccessV3||0);
    const cachedNewCount=cachedItems.reduce((sum,item)=>
        sum+(String(item?.readState||"").trim().toUpperCase()==="NOWE"?1:0),0
    );
    const pingNewCount=Number(window.crmInboxPingNewCountV25);
    const pingAgrees=!Number.isFinite(pingNewCount) || pingNewCount===cachedNewCount;
    const cacheFresh=
        !force &&
        crmUnifiedInboxLastSuccessV3>0 &&
        cacheAge>=0 &&
        cacheAge<CRM_INBOX_FULL_CACHE_TTL_V25 &&
        pingAgrees;

    /* Reopen Skrzynki w krótkim czasie = natychmiast z RAM, bez drugiego GET.
       Jeśli ping wykrył inną liczbę nowych wpisów, cache nie jest używany. */
    if(open && cacheFresh){
        crmRenderUnifiedInbox();
        return cachedItems;
    }

    /* Jeśli pełna Skrzynka już jest pobierana, drugi klik czeka na TEN SAM request.
       Nie uruchamiamy drugiego Apps Script. */
    if(crmInboxPromiseV11) return crmInboxPromiseV11;

    const body=document.getElementById("crmUnifiedInboxBody");
    const hasCachedView=open && crmUnifiedInboxLastSuccessV3>0;
    if(hasCachedView){
        crmRenderUnifiedInbox();
    }else if(body){
        body.innerHTML='<div style="padding:20px;color:#777;">Ładowanie skrzynki…</div>';
    }

    crmInboxPromiseV11=(async()=>{
        try{
            const data=await crmQueuedGetV11(
                `${APPS_SCRIPT_URL}?adminInbox=true&_crmInbox=${Date.now()}`,
                {key:"adminInbox",priority:95,timeoutMs:30000}
            );
            if(!data?.success || !Array.isArray(data.items)){
                throw new Error(data?.error||"Nieprawidłowa odpowiedź Skrzynki");
            }
            crmUnifiedInboxItems=data.items;
            crmUnifiedInboxLastSuccessV3=Date.now();
            window.crmInboxPingNewCountV25=Math.max(0,Number(data?.counts?.new)||0);
            crmUpdateUnifiedInboxBadge({new:window.crmInboxPingNewCountV25});
            crmSetUnifiedInboxConnectionStateV3?.(true);
            crmRenderUnifiedInbox();
            return crmUnifiedInboxItems;
        }catch(error){
            crmSetUnifiedInboxConnectionStateV3?.(false,error?.message||String(error));
            if(body && document.getElementById("crmUnifiedInboxModal")?.hidden===false && !hasCachedView){
                body.innerHTML=`<div style="padding:16px;color:#9b3a3a;">
                    <strong>Nie udało się pobrać Skrzynki.</strong>
                    <div style="margin-top:6px;font-size:11px;color:#766;">${crmInboxEscape(error?.message||String(error))}</div>
                    <button type="button" id="crmInboxRetryV11" class="btn-secondary" style="margin-top:12px;">Spróbuj ponownie</button>
                </div>`;
                document.getElementById("crmInboxRetryV11")?.addEventListener("click",()=>crmLoadUnifiedInbox({force:true}).catch(console.error));
            }
            throw error;
        }finally{
            crmInboxPromiseV11=null;
        }
    })();
    return crmInboxPromiseV11;
};

crmOpenUnifiedInbox=async function(){
    crmCloseOtherRightContextsV5("inbox");
    const overlay=crmEnsureUnifiedInboxModal();
    overlay.hidden=false;
    return crmLoadUnifiedInbox({force:false}).catch(console.error);
};

crmCheckEventDrivenInbox=async function(){
    if(window.crmBootInProgressV2 || window.crmDiagnosticsNetworkModeV11) return [];
    await crmRunInboxPingV5();
    return [];
};

crmStartRequestNoticeWatch=function(){ return crmRunInboxPingV5(); };

/* Odśwież Skrzynki nie tworzy nowej generacji, jeśli poprzedni odczyt trwa. */
document.addEventListener("DOMContentLoaded",()=>{
    window.setTimeout(()=>{
        const refresh=document.getElementById("crmUnifiedInboxRefresh");
        if(refresh) refresh.onclick=()=>crmLoadUnifiedInbox({force:true}).catch(console.error);
    },2400);
});
/* KONIEC ADMIN NETWORK COORDINATOR V11 */

/* ==========================================================================
   ADMIN CLEAN BOOT V12 2026-08-12
   Jeden start, brak retry lawiny, ciężkie Ustawienia dopiero po wejściu.
   ========================================================================== */
let crmSettingsExtrasPromiseV12=null;
let crmSettingsExtrasLoadedAtV12=0;

async function crmLoadSettingsExtrasV12(options={}){
    const force=options.force===true;
    if(window.crmBootInProgressV2 || window.crmDiagnosticsNetworkModeV11) return null;
    if(!force && Date.now()-crmSettingsExtrasLoadedAtV12<120000) return true;
    if(crmSettingsExtrasPromiseV12) return crmSettingsExtrasPromiseV12;

    crmSettingsExtrasPromiseV12=(async()=>{
        try{
            if(typeof crmLoadEffectiveScheduleViewsV12==="function"){
                await crmLoadEffectiveScheduleViewsV12({force});
            }
            crmSettingsExtrasLoadedAtV12=Date.now();
            return true;
        }catch(error){
            console.warn("Dane dodatkowe Ustawień:",error?.message||error);
            return false;
        }finally{
            crmSettingsExtrasPromiseV12=null;
        }
    })();
    return crmSettingsExtrasPromiseV12;
}
window.crmLoadSettingsExtrasV12=crmLoadSettingsExtrasV12;

/* Ostatnia warstwa nawigacji: ciężki grafik tylko gdy użytkownik faktycznie
   otworzy Ustawienia. */
if(typeof switchTab==="function"){
    const crmSwitchTabBeforeCleanBootV12=switchTab;
    switchTab=async function(tabName){
        const result=await crmSwitchTabBeforeCleanBootV12.apply(this,arguments);
        if(tabName==="ustawienia"){
            window.setTimeout(()=>crmLoadSettingsExtrasV12().catch(console.error),60);
        }
        return result;
    };
}

/* Stara funkcja retry Kalendarza nie może już odpalać 5 kolejnych wykonań
   Apps Script po jednym timeout. */
crmRetryCalendarLightSyncV6=async function(reason){
    if(window.crmBootInProgressV2 || window.crmDiagnosticsNetworkModeV11) return null;
    try{
        const result=await crmLightSyncCalendarData(reason||"lekki-sync");
        if(typeof crmSetBackgroundTaskStatus==="function"){
            crmSetBackgroundTaskStatus("sync","success","Kalendarz aktualny");
        }
        return result;
    }catch(error){
        if(typeof crmSetBackgroundTaskStatus==="function"){
            crmSetBackgroundTaskStatus(
                "sync","error",
                "Kalendarz: nie udało się odświeżyć. Kliknij, aby ponowić.",
                {onClick:()=>crmRetryCalendarLightSyncV6("reczne-ponowienie").catch(console.error)}
            );
        }
        throw error;
    }
};
/* KONIEC ADMIN CLEAN BOOT V12 */

/* ==========================================================================
   ADMIN EVENT COORDINATOR V13 2026-08-12
   Bez adminState i bez równoległych odświeżeń po focus/visibility.
   ========================================================================== */
let crmReturnRefreshBusyV13 = false;
let crmReturnRefreshAtV13 = 0;
let crmClientsLoadedAtV13 = Date.now();
let crmServicesLoadedAtV13 = Date.now();

crmRefreshTabIfChangedV6 = async function(tabName, reason) {
    if (
        window.crmBootInProgressV2 ||
        window.crmDiagnosticsNetworkModeV11 ||
        crmReturnRefreshBusyV13
    ) return null;

    const now = Date.now();
    if (now - crmReturnRefreshAtV13 < 8000) return null;

    crmReturnRefreshAtV13 = now;
    crmReturnRefreshBusyV13 = true;

    try {
        tabName = tabName || (
            typeof crmDetectActiveTabV6 === "function"
                ? crmDetectActiveTabV6()
                : "kalendarz"
        );

        const normalizedReason = String(reason || "").trim().toLowerCase();
        const isBrowserReturn =
            normalizedReason === "focus" ||
            normalizedReason === "powrot-do-karty" ||
            normalizedReason === "powrot-do-admin";

        if (isBrowserReturn) {
            try {
                if (typeof crmRunInboxPingV5 === "function") {
                    await crmRunInboxPingV5();
                }
            } catch (ignore) {}
            return true;
        }

        if (tabName === "kalendarz") {
            return await crmRetryCalendarLightSyncV6(reason || "wejscie-do-kalendarza");
        }

        if (tabName === "klienci") {
            if (now - crmClientsLoadedAtV13 > 120000) {
                await crmLoadClientsPrimaryV2();
                crmClientsLoadedAtV13 = Date.now();
            }
            return true;
        }

        if (tabName === "cennik") {
            if (now - crmServicesLoadedAtV13 > 120000) {
                await crmLoadServicesPrimaryV2();
                crmServicesLoadedAtV13 = Date.now();
            }
            return true;
        }

        if (tabName === "ustawienia") {
            if (typeof crmLoadSettingsExtrasV12 === "function") {
                await crmLoadSettingsExtrasV12();
            }
            return true;
        }

        if (tabName === "dashboard" && typeof renderDashboard === "function") {
            renderDashboard();
        }
        if (tabName === "finanse" && typeof calculateFinanceReport === "function") {
            calculateFinanceReport();
        }

        return true;
    } catch (error) {
        console.warn("Odświeżenie aktywnej zakładki V13:", error?.message || error);
        return null;
    } finally {
        crmReturnRefreshBusyV13 = false;
    }
};

/*
 * Stary anonimowy visibility-listener wywołuje nazwę tej funkcji dynamicznie.
 * Teraz przechodzi przez jeden koordynator V13.
 */
crmSyncAppointmentsOnReturnV2 = function() {
    return crmRefreshTabIfChangedV6(
        typeof crmDetectActiveTabV6 === "function"
            ? crmDetectActiveTabV6()
            : "kalendarz",
        "powrot-do-admin"
    );
};

/*
 * Wszystkie stare event-driven wywołania zostają sprowadzone do jednego,
 * odseparowanego pingu Skrzynki.
 */
crmCheckEventDrivenInbox = async function() {
    if (window.crmBootInProgressV2 || window.crmDiagnosticsNetworkModeV11) {
        return [];
    }
    try {
        await crmRunInboxPingV5();
    } catch (ignore) {}
    return [];
};

/* KONIEC ADMIN EVENT COORDINATOR V13 */

/* ==========================================================================
   ADMIN UX V17 2026-08-16
   Systemowe alert("...") nie blokują już pracy i nie wymagają klikania OK.
   ========================================================================== */
if (!window.crmNativeAlertBeforeV17) {
    window.crmNativeAlertBeforeV17 = window.alert.bind(window);
}

window.alert = function(message) {
    const text = String(message ?? "").trim();
    if (typeof crmToast === "function") {
        const errorLike =
            /błąd|blad|nie uda|nie można|nie mozna|brak |uzupełnij|uzupelnij|nie wybrano|wymagane/i.test(text);
        crmToast(text || "Gotowe.", errorLike ? "error" : undefined);
        return;
    }
    return window.crmNativeAlertBeforeV17(text);
};
/* KONIEC ADMIN UX V17 */

/* ==========================================================================
   ADMIN UX V17.1: UKRYCIE CYKLU ŁADOWANIA
   ========================================================================== */
function crmHideLegacySyncStatusV171() {
    const sync = document.getElementById("crmTaskStatusSync");
    if (sync) sync.style.display = "none";

    const panel = document.getElementById("crmBackgroundStatusPanel");
    const save = document.getElementById("crmTaskStatusSave");

    if (panel && (!save || save.style.display === "none" || getComputedStyle(save).display === "none")) {
        panel.style.display = "none";
    }
}

document.addEventListener("DOMContentLoaded", () => {
    window.setTimeout(crmHideLegacySyncStatusV171, 0);
    window.setTimeout(crmHideLegacySyncStatusV171, 800);
});
/* KONIEC ADMIN UX V17.1 */

/* ==========================================================================
   ADMIN RETURN COORDINATOR V17.2 2026-08-16
   Neutralizuje stary anonimowy visibilitychange z calendar.js.
   Powrót do karty = tylko lekki ping Skrzynki, bez Calendar sync.
   ========================================================================== */
crmScheduleCalendarLightSync = function(reason) {
    const normalizedReason = String(reason || "").trim().toLowerCase();
    const isBrowserReturn =
        normalizedReason === "powrot-do-karty" ||
        normalizedReason === "powrot-do-admin" ||
        normalizedReason === "focus";

    if (isBrowserReturn) {
        try {
            if (typeof crmRunInboxPingV5 === "function") {
                crmRunInboxPingV5().catch(() => {});
            }
        } catch (ignore) {}
        return;
    }

    window.clearTimeout(crmScheduleCalendarLightSync.timer);
    crmScheduleCalendarLightSync.timer = window.setTimeout(() => {
        if (typeof crmRetryCalendarLightSyncV6 === "function") {
            crmRetryCalendarLightSyncV6(reason).catch(error => {
                console.warn("Lekka synchronizacja Kalendarza:", error?.message || error);
            });
        }
    }, 100);
};
crmScheduleCalendarLightSync.timer = null;
/* KONIEC ADMIN RETURN COORDINATOR V17.2 */

/* ==========================================================================
   ADMIN PERFORMANCE COORDINATOR V18 2026-08-16
   - blokuje pusty render Kalendarza w trakcie startu;
   - wejście do zakładki natychmiast renderuje dane lokalne;
   - odświeżenie sieciowe po wejściu jest tylko tłem i tylko po TTL;
   - zwykły powrót do przeglądarki nadal = tylko ping Skrzynki.
   ========================================================================== */

const CRM_PERF_CALENDAR_TTL_V18 = 5 * 60 * 1000;
const CRM_PERF_DATA_TTL_V18 = 10 * 60 * 1000;

if (typeof renderBooksyCalendar === "function" && !window.crmRenderBooksyCalendarBeforePerfV18) {
    window.crmRenderBooksyCalendarBeforePerfV18 = renderBooksyCalendar;
    renderBooksyCalendar = function() {
        if (window.crmPerfSuppressCalendarRenderV18) return null;
        return window.crmRenderBooksyCalendarBeforePerfV18.apply(this, arguments);
    };
}

function crmPerfRenderTabNowV18(tabName) {
    if (typeof window.crmPerfRenderCurrentTabV18 === "function") {
        window.crmPerfRenderCurrentTabV18(tabName, { includeCalendar: true });
    }
}

function crmPerfRefreshInBackgroundV18(tabName) {
    const fresh = window.crmPerfFreshAtV18 || {};
    const now = Date.now();

    if (tabName === "kalendarz") {
        if (now - Number(fresh.calendar || 0) < CRM_PERF_CALENDAR_TTL_V18) return;
        Promise.resolve()
            .then(() => typeof crmRetryCalendarLightSyncV6 === "function"
                ? crmRetryCalendarLightSyncV6("stale:kalendarz")
                : null)
            .catch(error => console.warn("Tło Kalendarza V18:", error?.message || error));
        return;
    }

    if (tabName === "klienci") {
        if (now - Number(fresh.clients || 0) < CRM_PERF_DATA_TTL_V18) return;
        Promise.resolve()
            .then(() => typeof crmLoadClientsPrimaryV2 === "function"
                ? crmLoadClientsPrimaryV2()
                : null)
            .catch(error => console.warn("Tło Klientów V18:", error?.message || error));
        return;
    }

    if (tabName === "cennik") {
        if (now - Number(fresh.services || 0) < CRM_PERF_DATA_TTL_V18) return;
        Promise.resolve()
            .then(() => typeof crmLoadServicesPrimaryV2 === "function"
                ? crmLoadServicesPrimaryV2()
                : null)
            .catch(error => console.warn("Tło Cennika V18:", error?.message || error));
    }
}
window.crmPerfRefreshInBackgroundV18 = crmPerfRefreshInBackgroundV18;

/*
 * Wszystkie wcześniejsze listenery wołają tę nazwę dynamicznie.
 * Finalna wersja nie blokuje nawigacji oczekiwaniem na sieć.
 */
crmRefreshTabIfChangedV6 = async function(tabName, reason) {
    if (window.crmBootInProgressV2 || window.crmDiagnosticsNetworkModeV11) return null;

    tabName = tabName || (
        typeof crmDetectActiveTabV6 === "function"
            ? crmDetectActiveTabV6()
            : "kalendarz"
    );

    const normalizedReason = String(reason || "").trim().toLowerCase();
    const isBrowserReturn =
        normalizedReason === "focus" ||
        normalizedReason === "powrot-do-karty" ||
        normalizedReason === "powrot-do-admin";

    if (isBrowserReturn) {
        try {
            if (typeof crmRunInboxPingV5 === "function") {
                crmRunInboxPingV5().catch(() => {});
            }
        } catch (ignore) {}
        return true;
    }

    /*
     * Najpierw natychmiast render z pamięci RAM. Sieć dopiero później.
     */
    crmPerfRenderTabNowV18(tabName);

    if (tabName === "ustawienia") {
        if (typeof populateSettingsForm === "function") populateSettingsForm();
        if (typeof crmLoadSettingsExtrasV12 === "function") {
            window.setTimeout(() => {
                crmLoadSettingsExtrasV12().catch(console.error);
            }, 0);
        }
        return true;
    }

    if (tabName === "dashboard" && typeof renderDashboard === "function") {
        renderDashboard();
        return true;
    }

    if (tabName === "finanse" && typeof calculateFinanceReport === "function") {
        calculateFinanceReport();
        return true;
    }

    crmPerfRefreshInBackgroundV18(tabName);
    return true;
};

/*
 * Nie wykonujemy pełnego łańcucha switchTab dla kliknięcia już aktywnej
 * zakładki. To usuwa zbędny rerender, ale nie wpływa na zmianę zakładki.
 */
if (typeof switchTab === "function") {
    const crmSwitchTabBeforePerfV18 = switchTab;
    switchTab = async function(tabName) {
        const current = typeof crmDetectActiveTabV6 === "function"
            ? crmDetectActiveTabV6()
            : "";

        if (
            tabName &&
            current === tabName &&
            !window.crmBootInProgressV2
        ) {
            crmPerfRenderTabNowV18(tabName);
            return true;
        }

        /*
         * PERFORMANCE V23 — szybkie wejście do Klientów z RAM.
         *
         * Starszy switchTab przechodzi przez kilka warstw kompatybilności.
         * Dla zakładki Klienci żadna z nich nie musi czekać na sieć: dane są już
         * w customersData, a ewentualne odświeżenie po TTL ma działać w tle.
         *
         * Fast-path uruchamiamy wyłącznie gdy nie ma niezapisanych zmian.
         * Gdy formularz jest brudny, pozostaje pełny stary łańcuch z ochroną.
         */
        const hasUnsavedChangesV23 =
            typeof crmHasUnsavedChanges !== "undefined" &&
            Boolean(crmHasUnsavedChanges);

        if (
            tabName === "klienci" &&
            !window.crmBootInProgressV2 &&
            !hasUnsavedChangesV23
        ) {
            if (typeof crmCloseDayVisitsList === "function") crmCloseDayVisitsList();
            if (typeof crmToggleVisitStatusMenu === "function") crmToggleVisitStatusMenu(false);

            const detailsPanel = document.getElementById("appointmentDetailsModal");
            if (detailsPanel) detailsPanel.style.display = "none";
            document.body.classList.remove("crm-v3-details-open");
            if (typeof currentEditingAppointment !== "undefined") {
                currentEditingAppointment = null;
            }

            document.querySelectorAll(".tab-page")
                .forEach(tab => { tab.style.display = "none"; });
            document.querySelectorAll(".nav-btn")
                .forEach(btn => btn.classList.remove("active"));

            const page = document.getElementById("tab-klienci");

            const activeBtn = document.querySelector('.nav-btn[onclick*="klienci"]');
            if (activeBtn) activeBtn.classList.add("active");

            if (typeof crmActiveTabNameV6 !== "undefined") {
                crmActiveTabNameV6 = "klienci";
            }

            /*
             * PERFORMANCE V25.1: renderujemy ciężką tabelę, gdy zakładka nadal
             * jest ukryta. Przeglądarka nie przelicza layoutu po każdym wierszu.
             */
            if (typeof renderClients === "function") renderClients();
            if (page) page.style.display = "block";

            try {
                sessionStorage.setItem("crm_active_tab_v18", "klienci");
            } catch (ignore) {}

            /* Sieć nie blokuje kliknięcia — ewentualny refresh jest wyłącznie tłem. */
            window.setTimeout(() => {
                if (typeof crmRefreshTabIfChangedV6 === "function") {
                    Promise.resolve(crmRefreshTabIfChangedV6("klienci", "wejscie:klienci"))
                        .catch(error => console.warn("Tło Klientów V23:", error?.message || error));
                }
            }, 0);

            return true;
        }

        const result = await crmSwitchTabBeforePerfV18.apply(this, arguments);

        try {
            sessionStorage.setItem("crm_active_tab_v18", String(tabName || "kalendarz"));
        } catch (ignore) {}

        return result;
    };
}

/* KONIEC ADMIN PERFORMANCE COORDINATOR V18 */

/* ==========================================================================
   ADMIN PERFORMANCE V19: publiczny snapshot metryk dla testera
   ========================================================================== */
window.crmGetPerformanceSnapshotV19 = function() {
    return {
        boot: Object.assign({}, window.crmPerfMetricsV18 || {}),
        persistent: Object.assign({}, window.crmPerfMetricsV19 || {}),
        freshAt: Object.assign({}, window.crmPerfFreshAtV18 || {})
    };
};
/* KONIEC ADMIN PERFORMANCE V19 */

/* ==========================================================================
   ADMIN PERFORMANCE V19.1: stan świeżego bootstrapu
   ========================================================================== */
window.crmGetPerformanceSnapshotV191 = function() {
    return {
        boot: Object.assign({}, window.crmPerfMetricsV18 || {}),
        persistent: Object.assign({}, window.crmPerfMetricsV19 || {}),
        freshAt: Object.assign({}, window.crmPerfFreshAtV18 || {}),
        freshBootstrap: {
            state: window.crmPerfFreshBootstrapStateV191 || "idle",
            error: window.crmPerfFreshBootstrapErrorV191 || ""
        }
    };
};
/* KONIEC ADMIN PERFORMANCE V19.1 */


/* ==========================================================================
   ADMIN V25.2.5 — SKRZYNKA + BOCZNE PANELE CRUD
   2026-08-20

   1) Skrzynka: FIRST_VISIT nie usuwa już całej karty zgłoszenia.
      Poprawka powyżej: usuwamy tylko stary blok „Termin główny / Alternatywny”.

   2) Standardowe okna:
      - Dodaj / Edytuj klienta
      - Dodaj / Edytuj usługę
      - Zarządzaj kategoriami
      dostają przycisk „—” i mogą być minimalizowane tak jak Dodaj wizytę
      i Zablokuj czas.

   WAŻNE:
   - pozycje X / — są ustawiane w styleadmin-overrides.css,
   - wartości są takie same jak aktualnie w Dodaj wizytę / Zablokuj czas,
   - brak zmian backendu i brak nowego deploymentu Apps Script.
   ========================================================================== */

(function crmInstallUtilitySidePanelsV2525() {
    const configs = [
        {
            id: "clientModal",
            kind: "client",
            title: "Klient",
            icon: "👤",
            detail: () => String(document.getElementById("clientModalName")?.value || "").trim() ||
                String(document.getElementById("clientModalTitle")?.textContent || "Klient").trim(),
            openFunctions: ["openAddClientModal", "editClient"],
            closeFunctions: ["closeClientModal"]
        },
        {
            id: "serviceModal",
            kind: "service",
            title: "Usługa",
            icon: "💅",
            detail: () => String(document.getElementById("serviceName")?.value || "").trim() ||
                String(document.getElementById("serviceModalTitle")?.textContent || "Usługa").trim(),
            openFunctions: ["openAddServiceModal", "editService"],
            closeFunctions: ["closeServiceModal"]
        },
        {
            id: "categoryModal",
            kind: "category",
            title: "Kategorie",
            icon: "🏷️",
            detail: () => String(document.getElementById("categorySelectForEdit")?.value || "").trim() ||
                "Zarządzanie kategoriami",
            openFunctions: ["openCategoryModal"],
            closeFunctions: ["closeCategoryModal"]
        },
        {
            id: "crmContactDataConfirmModalV2",
            kind: "contact-confirm",
            title: "Dane klienta",
            icon: "✓",
            detail: () => String(document.getElementById("crmContactConfirmNameV2")?.value || "").trim() ||
                "Sprawdź dane klienta",
            openFunctions: ["crmConfirmContactDataV2"],
            closeFunctions: [],
            headerSelector: "section > div:first-child",
            closeSelector: "[data-close]"
        }
    ];

    function ensureDock() {
        if (typeof crmV172EnsureMinimizedDock === "function") {
            return crmV172EnsureMinimizedDock();
        }
        let dock = document.getElementById("crmMinimizedPanelDockV172");
        if (dock) return dock;
        dock = document.createElement("div");
        dock.id = "crmMinimizedPanelDockV172";
        dock.setAttribute("aria-live", "polite");
        document.body.appendChild(dock);
        return dock;
    }

    function clearDockItem(kind) {
        const button = document.getElementById(`crmMinimizedDock_${kind}_V2525`);
        if (button) button.remove();
        const dock = document.getElementById("crmMinimizedPanelDockV172");
        if (dock && !dock.querySelector(".crm-minimized-dock-item-v172")) {
            dock.hidden = true;
        }
    }

    function setDockItem(config) {
        const dock = ensureDock();
        const id = `crmMinimizedDock_${config.kind}_V2525`;
        let button = document.getElementById(id);

        if (!button) {
            button = document.createElement("button");
            button.type = "button";
            button.id = id;
            button.className = "crm-minimized-dock-item-v172";
            dock.appendChild(button);
        }

        button.innerHTML = "";

        const icon = document.createElement("span");
        icon.className = "crm-minimized-dock-icon-v172";
        icon.textContent = config.icon || "▣";

        const copy = document.createElement("span");
        copy.className = "crm-minimized-dock-copy-v172";

        const strong = document.createElement("strong");
        strong.textContent = config.title || "Panel";

        const small = document.createElement("small");
        let detail = "Kliknij, aby wrócić";
        try { detail = config.detail?.() || detail; } catch (ignore) {}
        small.textContent = detail;

        copy.append(strong, small);
        button.append(icon, copy);
        button.onclick = () => restore(config);
        button.style.display = "flex";
        dock.hidden = false;
    }

    function minimize(config) {
        const modal = document.getElementById(config.id);
        if (!modal) return;
        modal.dataset.crmMinimized = "1";
        modal.style.display = "none";
        setDockItem(config);
    }

    function restore(config) {
        const modal = document.getElementById(config.id);
        if (!modal) return;
        modal.dataset.crmMinimized = "0";
        modal.style.display = "flex";
        clearDockItem(config.kind);
    }

    function ensureMinimizeButton(config) {
        const modal = document.getElementById(config.id);
        if (!modal) return null;

        const buttonId = `crmUtilityMinimize_${config.kind}_V2525`;
        let button = document.getElementById(buttonId);
        if (button) return button;

        const header = modal.querySelector(config.headerSelector || ".modal-header");
        const close = header?.querySelector(config.closeSelector || ".modal-close");
        if (!header) return null;

        button = document.createElement("button");
        button.type = "button";
        button.id = buttonId;
        button.className = "crm-panel-minimize-v172 crm-utility-minimize-v2525";
        button.title = "Zwiń panel";
        button.setAttribute("aria-label", "Zwiń panel");
        button.textContent = "—";
        button.onclick = () => minimize(config);

        if (close) header.insertBefore(button, close);
        else header.appendChild(button);

        return button;
    }

    function wrapOpenFunction(functionName, config) {
        const original = window[functionName];
        if (typeof original !== "function" || original.__crmV2525Wrapped) return;

        const wrapped = function() {
            const result = original.apply(this, arguments);
            const modal = document.getElementById(config.id);
            if (modal) modal.dataset.crmMinimized = "0";
            clearDockItem(config.kind);
            ensureMinimizeButton(config);
            return result;
        };
        wrapped.__crmV2525Wrapped = true;
        window[functionName] = wrapped;
    }

    function wrapCloseFunction(functionName, config) {
        const original = window[functionName];
        if (typeof original !== "function" || original.__crmV2525Wrapped) return;

        const wrapped = function() {
            const result = original.apply(this, arguments);
            const modal = document.getElementById(config.id);
            if (modal) modal.dataset.crmMinimized = "0";
            clearDockItem(config.kind);
            return result;
        };
        wrapped.__crmV2525Wrapped = true;
        window[functionName] = wrapped;
    }

    function install() {
        configs.forEach(config => {
            ensureMinimizeButton(config);
            (config.openFunctions || []).forEach(name => wrapOpenFunction(name, config));
            (config.closeFunctions || []).forEach(name => wrapCloseFunction(name, config));
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", install, { once: true });
    } else {
        install();
    }

    window.crmUtilityPanelsV2525 = {
        install,
        minimize: kind => {
            const config = configs.find(item => item.kind === kind);
            if (config) minimize(config);
        },
        restore: kind => {
            const config = configs.find(item => item.kind === kind);
            if (config) restore(config);
        }
    };
})();

/* KONIEC ADMIN V25.2.5 */

/* ==========================================================================
   ADMIN V25.2.17 — PARKING WIELOPOZYCYJNY + RĘCZNE „—”
   2026-08-20

   LOGIKA:
   1. Parking powstaje normalnie TYLKO po świadomym kliknięciu „—”.
   2. Wyjątek bezpieczeństwa: formularze mogące zawierać niezapisane dane
      są automatycznie odkładane, gdy otwieramy inny konkurencyjny panel.
   3. Panele podglądu (Szczegóły wizyty, Wszystkie wizyty, Skrzynka)
      nie trafiają automatycznie do parkingu.
   4. Zmiana głównej zakładki NIE tworzy parkingu.
   5. Można mieć wiele zwiniętych:
      - różnych wizyt,
      - różnych klientów,
      - różnych usług.
   6. Parking jest tylko w RAM — nic nie jest dopisywane do trwałego cache.
   7. Każda karta parkingu ma X, a przy 2+ pozycjach pojawia się
      „Zamknij wszystko”.
   ========================================================================== */

(function crmInstallPanelManagerV25217() {
    if (window.crmPanelManagerV25217?.installed) return;

    const CONFIGS = [
        { id:"appointmentModal", kind:"appointment-form", title:"Wizyta", icon:"📅", mode:"display", form:true },
        { id:"blockTimeModal", kind:"block-form", title:"Blokowanie", icon:"🔒", mode:"display", form:true },
        { id:"appointmentDetailsModal", kind:"visit-details", title:"Szczegóły wizyty", icon:"🗓️", mode:"details", form:false },
        { id:"crmDayVisitsOverlay", kind:"day-visits", title:"Wszystkie wizyty", icon:"📋", mode:"hidden", form:false },
        { id:"crmUnifiedInboxModal", kind:"inbox", title:"Skrzynka", icon:"✉️", mode:"hidden", form:false },
        { id:"clientModal", kind:"client", title:"Klient", icon:"👤", mode:"display", form:true },
        { id:"serviceModal", kind:"service", title:"Usługa", icon:"💅", mode:"display", form:true },
        { id:"categoryModal", kind:"category", title:"Kategorie", icon:"🏷️", mode:"display", form:true },
        { id:"crmContactDataConfirmModalV2", kind:"contact-confirm", title:"Dane klienta", icon:"✓", mode:"display", form:true }
    ];

    const BY_ID = new Map(CONFIGS.map(c => [c.id, c]));
    const parked = new Map();
    const panelSelector = CONFIGS.map(c => `#${c.id}`).join(",");

    let busy = false;
    let switchingTab = false;
    let restoreContext = null;
    let serial = 0;

    function getConfig(value) {
        if (!value) return null;
        if (typeof value === "object" && value.id) return value;
        const raw = String(value);
        return BY_ID.get(raw) || CONFIGS.find(c => c.kind === raw) || null;
    }

    function getElement(value) {
        const c = getConfig(value);
        return c ? document.getElementById(c.id) : null;
    }

    function clonePlain(value) {
        if (value === undefined) return undefined;
        try {
            if (typeof structuredClone === "function") return structuredClone(value);
        } catch (_) {}
        try { return JSON.parse(JSON.stringify(value)); }
        catch (_) { return value; }
    }

    function activeTab() {
        try {
            if (typeof crmDetectActiveTabV6 === "function") {
                const value = crmDetectActiveTabV6();
                if (value) return String(value);
            }
        } catch (_) {}

        const page = Array.from(document.querySelectorAll(".tab-page"))
            .find(node => {
                try { return getComputedStyle(node).display !== "none"; }
                catch (_) { return false; }
            });

        return page?.id?.replace(/^tab-/, "") || "";
    }

    function isVisible(value) {
        const c = getConfig(value);
        const el = getElement(c);
        if (!c || !el || el.hidden) return false;

        try {
            const style = getComputedStyle(el);
            return style.display !== "none" &&
                   style.visibility !== "hidden" &&
                   style.opacity !== "0";
        } catch (_) {
            return false;
        }
    }

    function formatTime(value) {
        const d = new Date(value || "");
        if (Number.isNaN(d.getTime())) return "";
        return d.toLocaleTimeString("pl-PL", {
            hour:"2-digit",
            minute:"2-digit"
        });
    }

    function stableVisitKey(app) {
        if (!app) return "";
        try {
            if (typeof crmVisitStableKey === "function") {
                const key = crmVisitStableKey(app);
                if (key) return String(key);
            }
        } catch (_) {}

        return String(
            app.eventId ||
            app.appointmentId ||
            [app.date, app.phone, app.name, app.service].join("|")
        );
    }

    function captureControls(root) {
        if (!root) return [];

        return Array.from(root.querySelectorAll("input,select,textarea"))
            .map((node, index) => {
                const item = {
                    id: node.id || "",
                    name: node.name || "",
                    index,
                    tag: node.tagName,
                    type: String(node.type || "").toLowerCase(),
                    value: node.value
                };

                if (item.type === "checkbox" || item.type === "radio") {
                    item.checked = Boolean(node.checked);
                }

                if (node.tagName === "SELECT" && node.multiple) {
                    item.selectedValues = Array.from(node.selectedOptions)
                        .map(option => option.value);
                }

                return item;
            });
    }

    function restoreControls(root, items) {
        if (!root || !Array.isArray(items)) return;

        const all = Array.from(root.querySelectorAll("input,select,textarea"));

        items.forEach(item => {
            let node = null;

            if (item.id) {
                try { node = root.querySelector(`#${CSS.escape(item.id)}`); }
                catch (_) {}
            }

            if (!node && item.name) {
                node = all.find(candidate => candidate.name === item.name) || null;
            }

            if (!node && Number.isInteger(item.index)) {
                node = all[item.index] || null;
            }

            if (!node) return;

            if (
                (item.type === "checkbox" || item.type === "radio") &&
                "checked" in item
            ) {
                node.checked = Boolean(item.checked);
            }

            if (
                node.tagName === "SELECT" &&
                node.multiple &&
                Array.isArray(item.selectedValues)
            ) {
                const selected = new Set(item.selectedValues.map(String));
                Array.from(node.options).forEach(option => {
                    option.selected = selected.has(String(option.value));
                });
            } else {
                node.value = item.value ?? "";
            }
        });

        try {
            if (typeof crmSyncFiveMinuteControlsFromHidden === "function") {
                crmSyncFiveMinuteControlsFromHidden();
            }
        } catch (_) {}
    }

    function currentAppointmentClone() {
        try {
            if (typeof currentEditingAppointment !== "undefined") {
                return clonePlain(currentEditingAppointment);
            }
        } catch (_) {}
        return null;
    }

    function setCurrentAppointment(value) {
        try {
            if (typeof currentEditingAppointment !== "undefined") {
                currentEditingAppointment = clonePlain(value);
            }
        } catch (_) {}
    }

    function nextUnique(prefix) {
        serial += 1;
        return `${prefix}:${Date.now()}:${serial}`;
    }

    function panelLabel(c, state) {
        if (c.id === "serviceModal") {
            return String(state.snapshot?.serviceName || "").trim() ||
                   String(state.snapshot?.title || "").trim() ||
                   "Usługa";
        }

        if (c.id === "clientModal") {
            return String(state.snapshot?.clientName || "").trim() ||
                   "Klient";
        }

        if (c.id === "appointmentDetailsModal") {
            const app = state.app || {};
            const name = String(app.name || "Wizyta").trim();
            const time = formatTime(app.date);
            return time ? `${name} · ${time}` : name;
        }

        if (c.id === "appointmentModal") {
            const name = String(state.snapshot?.appointmentName || "").trim();
            const time = formatTime(state.snapshot?.appointmentDateTime);
            if (name && time) return `${name} · ${time}`;
            return name || "Nowa wizyta";
        }

        if (c.id === "blockTimeModal") {
            return String(state.snapshot?.blockTitle || "").trim() ||
                   "Blokowanie";
        }

        if (c.id === "crmDayVisitsOverlay") {
            return String(state.snapshot?.dayTitle || "").trim() ||
                   "Wszystkie wizyty";
        }

        if (c.id === "categoryModal") {
            return String(state.snapshot?.categoryName || "").trim() ||
                   "Kategorie";
        }

        if (c.id === "crmContactDataConfirmModalV2") {
            return String(state.snapshot?.contactName || "").trim() ||
                   "Dane klienta";
        }

        return c.title;
    }

    function buildState(c, reason) {
        const el = getElement(c);
        const controls = captureControls(el);

        const state = {
            panelId: c.id,
            kind: c.kind,
            icon: c.icon,
            ownerTab: activeTab(),
            controls,
            reason,
            createdAt: Date.now(),
            app: null,
            snapshot: {}
        };

        if (c.id === "appointmentDetailsModal") {
            state.app = currentAppointmentClone();
        }

        if (c.id === "appointmentModal") {
            state.app = currentAppointmentClone();
            state.snapshot.appointmentName =
                document.getElementById("appointmentName")?.value || "";
            state.snapshot.appointmentDateTime =
                document.getElementById("appointmentDateTime")?.value || "";
            state.snapshot.title =
                document.getElementById("modalTitleAppointment")?.textContent || "";
        }

        if (c.id === "blockTimeModal") {
            state.app = currentAppointmentClone();
            state.snapshot.blockTitle =
                document.getElementById("block-title")?.value || "";
        }

        if (c.id === "clientModal") {
            state.snapshot.clientName =
                document.getElementById("clientModalName")?.value || "";
            state.snapshot.editPhone =
                document.getElementById("editClientPhone")?.value || "";
            state.snapshot.clientPhone =
                document.getElementById("clientModalPhone")?.value || "";
        }

        if (c.id === "serviceModal") {
            state.snapshot.serviceName =
                document.getElementById("serviceName")?.value || "";
            state.snapshot.editIndex =
                document.getElementById("editServiceIndex")?.value || "-1";
            state.snapshot.title =
                document.getElementById("serviceModalTitle")?.textContent || "";
        }

        if (c.id === "categoryModal") {
            state.snapshot.categoryName =
                document.getElementById("categorySelectForEdit")?.value ||
                document.querySelector("#categoryModal input")?.value ||
                "";
        }

        if (c.id === "crmContactDataConfirmModalV2") {
            state.snapshot.contactName =
                document.getElementById("crmContactConfirmNameV2")?.value || "";
        }

        if (c.id === "crmDayVisitsOverlay") {
            state.snapshot.dayTitle =
                document.getElementById("crmDayVisitsTitle")?.textContent || "";
            try {
                if (typeof crmOpenDayListDate !== "undefined" && crmOpenDayListDate) {
                    state.snapshot.dayDate = new Date(crmOpenDayListDate).toISOString();
                }
            } catch (_) {}
        }

        state.label = panelLabel(c, state);
        return state;
    }

    function resolveParkingKey(c, state) {
        const el = getElement(c);
        const existing = el?.dataset.crmParkingEntryKeyV25217;
        if (existing) return existing;

        if (c.id === "appointmentDetailsModal") {
            const visitKey = stableVisitKey(state.app);
            return visitKey ? `visit:${visitKey}` : nextUnique("visit");
        }

        if (c.id === "clientModal") {
            const phone = String(
                state.snapshot.editPhone ||
                state.snapshot.clientPhone ||
                ""
            ).trim();

            return phone ? `client:${phone}` : nextUnique("client:new");
        }

        if (c.id === "serviceModal") {
            const index = String(state.snapshot.editIndex ?? "-1");
            return index !== "-1" ? `service:${index}` : nextUnique("service:new");
        }

        if (c.id === "appointmentModal") {
            const eventId = String(
                state.app?.eventId ||
                state.app?.appointmentId ||
                ""
            ).trim();

            return eventId ? `appointment:${eventId}` : nextUnique("appointment:new");
        }

        if (c.id === "blockTimeModal") {
            const eventId = String(state.app?.eventId || "").trim();
            return eventId ? `block:${eventId}` : nextUnique("block:new");
        }

        if (c.id === "categoryModal") {
            const name = String(state.snapshot.categoryName || "").trim();
            return name ? `category:${name}` : nextUnique("category");
        }

        if (c.id === "crmContactDataConfirmModalV2") {
            const name = String(state.snapshot.contactName || "").trim();
            return name ? `contact:${name}` : nextUnique("contact");
        }

        if (c.id === "crmDayVisitsOverlay") {
            const date = String(state.snapshot.dayDate || "").trim();
            return date ? `day-list:${date}` : nextUnique("day-list");
        }

        return c.id;
    }

    function clearActiveEntryIdentity(c) {
        const el = getElement(c);
        if (el) delete el.dataset.crmParkingEntryKeyV25217;
    }

    /* ----------------------------------------------------------
       MENU GŁÓWNE / LICZNIKI
       ---------------------------------------------------------- */

    function findTabHost(tabName) {
        if (!tabName) return null;

        const candidates = Array.from(document.querySelectorAll(
            ".nav-btn,.sidebar button,.sidebar a,.main-sidebar button,.main-sidebar a,nav button,nav a"
        ));

        return candidates.find(node => {
            const raw = String(node.getAttribute("onclick") || "");
            const match = raw.match(/switchTab\s*\(\s*["']([^"']+)["']/);
            return Boolean(match && match[1] === tabName);
        }) || null;
    }

    function ensureCountBadge(tabName) {
        const host = findTabHost(tabName);
        if (!host) return null;

        host.classList.add("crm-panel-badge-host-v25217");

        let badge = Array.from(
            host.querySelectorAll(".crm-collapsed-panels-badge-v25217")
        ).find(node => node.dataset.crmTab === tabName);

        if (!badge) {
            badge = document.createElement("span");
            badge.className = "crm-collapsed-panels-badge-v25217";
            badge.dataset.crmTab = tabName;
            badge.setAttribute("aria-hidden", "true");
            host.appendChild(badge);
        }

        return badge;
    }

    function syncCountBadges() {
        const counts = new Map();

        parked.forEach(state => {
            const tab = String(state.ownerTab || "").trim();
            if (!tab) return;
            counts.set(tab, (counts.get(tab) || 0) + 1);
        });

        document.querySelectorAll(".crm-collapsed-panels-badge-v25217")
            .forEach(badge => {
                const tab = String(badge.dataset.crmTab || "");
                if (!(counts.get(tab) > 0)) badge.remove();
            });

        counts.forEach((count, tabName) => {
            const badge = ensureCountBadge(tabName);
            if (!badge) return;

            badge.textContent = count > 99 ? "99+" : String(count);
            badge.hidden = false;
            badge.classList.add("is-visible");
            badge.title = `Zwinięte panele: ${count}`;
        });
    }

    /* ----------------------------------------------------------
       PARKING — DÓŁ LEWEGO PASKA
       ---------------------------------------------------------- */

    function findMainSidebar() {
        const candidates = Array.from(
            document.querySelectorAll(".sidebar,.main-sidebar,aside.sidebar")
        );

        return candidates.find(node => {
            const text = String(node.textContent || "");
            return /Dashboard/i.test(text) &&
                   /Kalendarz/i.test(text) &&
                   /Klienci/i.test(text);
        }) || null;
    }

    function ensureParking() {
        const sidebar = findMainSidebar();
        if (!sidebar) return null;

        let parking = document.getElementById("crmPanelParkingV25217");

        if (!parking) {
            parking = document.createElement("div");
            parking.id = "crmPanelParkingV25217";
            parking.setAttribute("aria-live", "polite");
            document.body.appendChild(parking);
        }

        return parking;
    }

    function positionParking() {
        const sidebar = findMainSidebar();
        const parking = ensureParking();

        if (!sidebar || !parking || parking.hidden) return;

        const rect = sidebar.getBoundingClientRect();
        const sidePadding = 10;

        parking.style.setProperty(
            "left",
            `${Math.round(rect.left + sidePadding)}px`,
            "important"
        );

        parking.style.setProperty(
            "width",
            `${Math.max(120, Math.round(rect.width - sidePadding * 2))}px`,
            "important"
        );

        parking.style.setProperty("bottom", "72px", "important");
    }

    function removeParked(key) {
        if (!key) return;
        parked.delete(key);
        syncUi();
    }

    function closeAllForCurrentTab() {
        const tab = activeTab();

        Array.from(parked.entries()).forEach(([key, state]) => {
            if (String(state.ownerTab || "") === String(tab || "")) {
                parked.delete(key);
            }
        });

        syncUi();
    }

    function renderParking() {
        const parking = ensureParking();
        if (!parking) return;

        const tab = activeTab();
        const rows = Array.from(parked.entries())
            .filter(([, state]) =>
                String(state.ownerTab || "") === String(tab || "")
            );

        parking.replaceChildren();

        rows.forEach(([key, state]) => {
            const row = document.createElement("div");
            row.className = "crm-panel-parking-row-v25217";
            row.dataset.crmPanelId = state.panelId || "";

            const open = document.createElement("button");
            open.type = "button";
            open.className = "crm-panel-parking-item-v25217";
            open.title = `Przywróć: ${state.label || "panel"}`;

            const icon = document.createElement("span");
            icon.className = "crm-panel-parking-icon-v25217";
            icon.textContent = state.icon || "▣";

            const label = document.createElement("strong");
            label.textContent = state.label || "Panel";

            open.append(icon, label);

            if (state.panelId === "crmUnifiedInboxModal") {
                const pending = Math.max(
                    0,
                    Number(window.crmInboxPendingActionCountV25221) || 0
                );

                if (pending > 0) {
                    const attention = document.createElement("span");
                    attention.className = "crm-panel-parking-inbox-pending-v25221";
                    attention.textContent = pending > 99 ? "99+" : String(pending);
                    attention.title = `Do obsłużenia w Skrzynce: ${pending}`;
                    open.appendChild(attention);
                }
            }

            open.onclick = event => {
                event.preventDefault();
                event.stopPropagation();
                restoreEntry(key);
            };

            const close = document.createElement("button");
            close.type = "button";
            close.className = "crm-panel-parking-close-v25217";
            close.textContent = "×";
            close.title = "Zamknij tę zwiniętą kartę";
            close.setAttribute("aria-label", "Zamknij zwiniętą kartę");
            close.onclick = event => {
                event.preventDefault();
                event.stopPropagation();
                removeParked(key);
            };

            row.append(open, close);
            parking.appendChild(row);
        });

        if (rows.length >= 2) {
            const closeAll = document.createElement("button");
            closeAll.type = "button";
            closeAll.className = "crm-panel-parking-close-all-v25217";
            closeAll.textContent = "Zamknij wszystko";
            closeAll.onclick = event => {
                event.preventDefault();
                event.stopPropagation();
                closeAllForCurrentTab();
            };
            parking.appendChild(closeAll);
        }

        parking.hidden = rows.length === 0;

        if (!parking.hidden) {
            requestAnimationFrame(positionParking);
        }
    }

    /* ----------------------------------------------------------
       BLUR INFO DNIA — TYLKO REALNE PRZYKRYCIE
       ---------------------------------------------------------- */

    function rectanglesOverlap(a, b) {
        return Boolean(
            a && b &&
            a.left < b.right &&
            a.right > b.left &&
            a.top < b.bottom &&
            a.bottom > b.top
        );
    }

    function visualSurface(c) {
        const el = getElement(c);
        if (!el) return null;

        if (
            c.id === "appointmentModal" ||
            c.id === "blockTimeModal" ||
            c.id === "clientModal" ||
            c.id === "serviceModal" ||
            c.id === "categoryModal"
        ) {
            return el.querySelector(".modal-content") || el;
        }

        if (c.id === "crmContactDataConfirmModalV2") {
            return el.querySelector(":scope > section") || el;
        }

        if (
            c.id === "crmDayVisitsOverlay" ||
            c.id === "crmUnifiedInboxModal"
        ) {
            return el.querySelector(".crm-day-list-panel") || el;
        }

        return el;
    }

    function syncInfoBlur() {
        const info = document.getElementById("crmCalendarInsights");
        let overlap = false;

        if (info) {
            try {
                const style = getComputedStyle(info);

                if (
                    style.display !== "none" &&
                    style.visibility !== "hidden"
                ) {
                    const infoRect = info.getBoundingClientRect();

                    overlap = CONFIGS.some(c => {
                        if (!isVisible(c)) return false;

                        const surface = visualSurface(c);
                        if (!surface) return false;

                        const rect = surface.getBoundingClientRect();
                        if (rect.width <= 0 || rect.height <= 0) return false;

                        return rectanglesOverlap(rect, infoRect);
                    });
                }
            } catch (_) {}
        }

        document.body.classList.toggle(
            "crm-panel-manager-overlap-v25217",
            overlap
        );
    }

    function syncUi() {
        const workPanelOpen = CONFIGS.some(c =>
            c.id !== "crmDayVisitsOverlay" &&
            isVisible(c)
        );

        /*
         * CSS używa tej klasy wyłącznie do ustawienia warstw:
         * panel roboczy nad „Wybrany dzień”, a „Wszystkie wizyty”
         * obok niego, bez zamykania listy.
         */
        document.body.classList.toggle(
            "crm-panel-work-open-v2617",
            workPanelOpen
        );

        syncCountBadges();
        renderParking();
        syncInfoBlur();
    }

    /* ----------------------------------------------------------
       MINUSY DLA PANELI PODGLĄDU
       ---------------------------------------------------------- */

    function addSimpleMinus(container, beforeNode, id, title) {
        if (!container || document.getElementById(id)) return;

        const button = document.createElement("button");
        button.type = "button";
        button.id = id;
        button.className = "crm-panel-minimize-v25217";
        button.textContent = "—";
        button.title = title || "Zwiń";
        button.setAttribute("aria-label", title || "Zwiń");

        if (beforeNode?.parentNode === container) {
            container.insertBefore(button, beforeNode);
        } else {
            container.appendChild(button);
        }
    }

    function ensureManualMinimizeButtons() {
        const details = document.getElementById("appointmentDetailsModal");
        const detailsHeader = details?.querySelector(".crm-safe-header");
        const detailsClose = detailsHeader?.querySelector(".crm-safe-close");

        if (detailsHeader && !document.getElementById("crmVisitDetailsMinimizeV25217")) {
            const button = document.createElement("button");
            button.type = "button";
            button.id = "crmVisitDetailsMinimizeV25217";
            button.className =
                "crm-panel-minimize-v25217 crm-visit-details-minimize-v25217";
            button.textContent = "—";
            button.title = "Zwiń tę wizytę";
            button.setAttribute("aria-label", "Zwiń tę wizytę");
            detailsHeader.appendChild(button);
        }

        const dayOverlay = document.getElementById("crmDayVisitsOverlay");
        const dayHeader = dayOverlay?.querySelector(".crm-day-list-panel > header");
        const dayClose = dayHeader?.querySelector(".crm-day-list-close");
        addSimpleMinus(
            dayHeader,
            dayClose,
            "crmDayVisitsMinimizeV25217",
            "Zwiń listę wizyt"
        );

        const inbox = document.getElementById("crmUnifiedInboxModal");
        const inboxHeader = inbox?.querySelector(".crm-day-list-panel > header");
        const inboxClose = inboxHeader?.querySelector("#crmUnifiedInboxClose");
        addSimpleMinus(
            inboxHeader,
            inboxClose,
            "crmInboxMinimizeV25217",
            "Zwiń Skrzynkę"
        );
    }

    /* ----------------------------------------------------------
       PARKOWANIE / ZAMYKANIE BIEŻĄCYCH PANELI
       ---------------------------------------------------------- */

    function hidePanelWithoutParking(c) {
        const el = getElement(c);
        if (!el) return;

        clearActiveEntryIdentity(c);

        if (c.id === "appointmentDetailsModal") {
            try {
                if (typeof closeAppointmentModal === "function") {
                    closeAppointmentModal();
                    return;
                }
            } catch (_) {}
        }

        if (c.id === "crmDayVisitsOverlay") {
            try {
                if (typeof crmCloseDayVisitsList === "function") {
                    crmCloseDayVisitsList();
                    return;
                }
            } catch (_) {}
        }

        if (c.id === "crmUnifiedInboxModal") {
            try {
                if (typeof crmCloseUnifiedInboxPanelV5 === "function") {
                    crmCloseUnifiedInboxPanelV5();
                    return;
                }
            } catch (_) {}
        }

        if (c.mode === "hidden") el.hidden = true;
        else el.style.display = "none";

        if (c.mode === "details") {
            document.body.classList.remove("crm-v3-details-open");
        }
    }

    function parkPanel(value, reason = "manual") {
        const c = getConfig(value);
        const el = getElement(c);

        if (!c || !el) return false;

        const state = buildState(c, reason);
        const key = resolveParkingKey(c, state);

        state.key = key;
        state.label = panelLabel(c, state);

        parked.set(key, state);

        clearActiveEntryIdentity(c);

        if (c.mode === "hidden") el.hidden = true;
        else el.style.display = "none";

        if (c.mode === "details") {
            document.body.classList.remove("crm-v3-details-open");
        }

        syncUi();
        return true;
    }

    function prepareForOpening(targetId) {
        if (busy) return;

        busy = true;

        try {
            const target = BY_ID.get(targetId);
            const targetIsDayVisits = targetId === "crmDayVisitsOverlay";

            /*
             * V26.17 — układ ustalony dla Kalendarza:
             *
             * 1) „Wybrany dzień” (#crmCalendarInsights) jest stałą bazą
             *    i NIE jest częścią konkurencji paneli.
             *
             * 2) „Wszystkie wizyty” jest niezależnym wyjątkiem.
             *    Może pozostać otwarte razem z jednym panelem roboczym.
             *
             * 3) Wszystkie pozostałe panele robocze współdzielą jedno miejsce
             *    NAD „Wybrany dzień”. W danej chwili aktywny jest tylko jeden.
             *
             * 4) Gdy otwieramy kolejny panel roboczy:
             *    - formularz -> bezpiecznie do parkingu (z zachowaniem danych),
             *    - podgląd -> zwykłe zamknięcie bez parkingu.
             *
             * 5) Otwieranie „Wszystkie wizyty” nie zamyka ani nie parkuje
             *    aktualnego panelu roboczego.
             */
            if (!targetIsDayVisits) {
                CONFIGS.forEach(c => {
                    if (!isVisible(c)) return;

                    // Niezależny panel „Wszystkie wizyty” zostaje na miejscu.
                    if (c.id === "crmDayVisitsOverlay") return;

                    /*
                     * Ten sam formularz może zostać zastąpiony inną usługą/klientem.
                     * Jeśli zawiera dane formularza — odkładamy go przed resetem.
                     */
                    if (c.form) {
                        parkPanel(c, "auto-safe");
                    } else {
                        hidePanelWithoutParking(c);
                    }
                });
            }

            if (target) clearActiveEntryIdentity(target);
        } finally {
            busy = false;
        }

        syncUi();
    }

    function closeVisibleForTabChange() {
        CONFIGS.forEach(c => {
            if (isVisible(c)) {
                hidePanelWithoutParking(c);
            }
        });

        syncUi();
    }

    /* ----------------------------------------------------------
       PRZYWRACANIE SNAPSHOTÓW
       ---------------------------------------------------------- */

    async function restoreEntry(key) {
        const state = parked.get(key);
        if (!state) return false;

        const c = BY_ID.get(state.panelId);
        if (!c) {
            parked.delete(key);
            syncUi();
            return false;
        }

        const ownerTab = String(state.ownerTab || "");
        const currentTab = activeTab();

        if (
            ownerTab &&
            currentTab &&
            ownerTab !== currentTab &&
            typeof switchTab === "function"
        ) {
            switchingTab = true;
            try {
                await switchTab(ownerTab);
            } finally {
                switchingTab = false;
            }
        }

        prepareForOpening(c.id);

        parked.delete(key);

        restoreContext = { key, state, panelId:c.id };

        try {
            if (c.id === "appointmentDetailsModal") {
                if (state.app && typeof openAppointmentDetailsModal === "function") {
                    openAppointmentDetailsModal(clonePlain(state.app));
                }
            } else if (c.id === "clientModal") {
                const editPhone = String(state.snapshot?.editPhone || "").trim();

                if (editPhone && typeof editClient === "function") {
                    editClient(editPhone);
                } else if (typeof openAddClientModal === "function") {
                    openAddClientModal();
                }

                restoreControls(getElement(c), state.controls);
            } else if (c.id === "serviceModal") {
                const index = Number(state.snapshot?.editIndex);

                if (
                    Number.isInteger(index) &&
                    index >= 0 &&
                    typeof editService === "function"
                ) {
                    editService(index);
                } else if (typeof openAddServiceModal === "function") {
                    openAddServiceModal();
                }

                restoreControls(getElement(c), state.controls);
            } else if (c.id === "appointmentModal") {
                setCurrentAppointment(state.app);

                const el = getElement(c);
                if (el) el.style.display = "flex";

                restoreControls(el, state.controls);
            } else if (c.id === "blockTimeModal") {
                setCurrentAppointment(state.app);

                const el = getElement(c);
                if (el) el.style.display = "flex";

                restoreControls(el, state.controls);

                try {
                    if (typeof toggleBlockTimeFields === "function") {
                        toggleBlockTimeFields();
                    }
                } catch (_) {}
            } else if (c.id === "categoryModal") {
                if (typeof openCategoryModal === "function") {
                    openCategoryModal();
                } else {
                    const el = getElement(c);
                    if (el) el.style.display = "flex";
                }

                restoreControls(getElement(c), state.controls);
            } else if (c.id === "crmContactDataConfirmModalV2") {
                const el = getElement(c);
                if (el) el.style.display = "flex";
                restoreControls(el, state.controls);
            } else if (c.id === "crmUnifiedInboxModal") {
                if (typeof crmOpenUnifiedInbox === "function") {
                    await crmOpenUnifiedInbox();
                }
            } else if (c.id === "crmDayVisitsOverlay") {
                if (
                    state.snapshot?.dayDate &&
                    typeof crmOpenDayVisitsList === "function"
                ) {
                    crmOpenDayVisitsList(new Date(state.snapshot.dayDate));
                } else {
                    const el = getElement(c);
                    if (el) el.hidden = false;
                }
            }

            const el = getElement(c);
            if (el) {
                el.dataset.crmParkingEntryKeyV25217 = key;
            }

            ensureManualMinimizeButtons();
        } finally {
            restoreContext = null;
        }

        syncUi();
        return true;
    }

    /* ----------------------------------------------------------
       WRAPPERY OTWIERANIA
       ---------------------------------------------------------- */

    function wrapOpen(functionName, panelId) {
        const original = window[functionName];

        if (
            typeof original !== "function" ||
            original.__crmPanelManagerV25217
        ) {
            return;
        }

        const wrapped = function() {
            const restoring =
                restoreContext &&
                restoreContext.panelId === panelId;

            if (!restoring) {
                prepareForOpening(panelId);
            }

            const result = original.apply(this, arguments);

            Promise.resolve(result).finally(() => {
                const c = BY_ID.get(panelId);
                const el = getElement(c);

                if (el && isVisible(c)) {
                    if (restoring) {
                        el.dataset.crmParkingEntryKeyV25217 =
                            restoreContext?.key || "";
                    } else {
                        clearActiveEntryIdentity(c);
                    }
                }

                ensureManualMinimizeButtons();
                syncUi();
            });

            return result;
        };

        wrapped.__crmPanelManagerV25217 = true;
        wrapped.__crmPanelManagerOriginal = original;
        window[functionName] = wrapped;
    }

    function installOpenHooks() {
        [
            ["openCreateModal", "appointmentModal"],
            ["openBlockTimeModal", "blockTimeModal"],
            ["openEditBlockTimeModal", "blockTimeModal"],
            ["openAppointmentDetailsModal", "appointmentDetailsModal"],
            ["crmOpenDayVisitsList", "crmDayVisitsOverlay"],
            ["crmOpenUnifiedInbox", "crmUnifiedInboxModal"],
            ["crmOpenAppointmentForContact", "appointmentModal"],
            ["openAddClientModal", "clientModal"],
            ["editClient", "clientModal"],
            ["openAddServiceModal", "serviceModal"],
            ["editService", "serviceModal"],
            ["openCategoryModal", "categoryModal"],
            ["crmConfirmContactDataV2", "crmContactDataConfirmModalV2"]
        ].forEach(([name, id]) => wrapOpen(name, id));
    }

    /*
     * Starsza funkcja V5 nie może już automatycznie tworzyć parkingu.
     * Dla paneli podglądu po prostu zamyka konkurencyjny podgląd.
     * Formularze zabezpiecza prepareForOpening().
     */
    if (typeof crmCloseOtherRightContextsV5 === "function") {
        crmCloseOtherRightContextsV5 = function(except) {
            const exceptId =
                except === "inbox" ? "crmUnifiedInboxModal" :
                except === "day-list" ? "crmDayVisitsOverlay" :
                except === "visit" ? "appointmentDetailsModal" :
                "";

            /*
             * V26.17:
             * „Wszystkie wizyty” jest niezależnym panelem.
             * Jeśli właśnie je otwieramy, nie ruszamy panelu roboczego.
             * Jeśli otwieramy panel roboczy, nie ruszamy „Wszystkie wizyty”.
             */
            if (exceptId !== "crmDayVisitsOverlay") {
                CONFIGS.forEach(c => {
                    if (
                        c.id === exceptId ||
                        c.id === "crmDayVisitsOverlay" ||
                        !isVisible(c)
                    ) {
                        return;
                    }

                    if (c.form) {
                        parkPanel(c, "auto-safe");
                    } else {
                        hidePanelWithoutParking(c);
                    }
                });
            }

            try {
                if (typeof crmToggleVisitStatusMenu === "function") {
                    crmToggleVisitStatusMenu(false);
                }
            } catch (_) {}

            try {
                if (typeof crmToggleVisitTrashMenu === "function") {
                    crmToggleVisitTrashMenu(false);
                }
            } catch (_) {}

            syncUi();
        };
    }

    /* ----------------------------------------------------------
       RĘCZNE „—” — JEDYNA ZWYKŁA DROGA DO PARKINGU
       ---------------------------------------------------------- */

    document.addEventListener("click", event => {
        const minus = event.target?.closest?.(
            "#crmAppointmentMinimizeBtnV7," +
            "#crmBlockTimeMinimizeBtnV172," +
            "#clientModal .crm-utility-minimize-v2525," +
            "#serviceModal .crm-utility-minimize-v2525," +
            "#categoryModal .crm-utility-minimize-v2525," +
            "#crmContactDataConfirmModalV2 .crm-utility-minimize-v2525," +
            "#crmVisitDetailsMinimizeV25217," +
            "#crmDayVisitsMinimizeV25217," +
            "#crmInboxMinimizeV25217"
        );

        if (!minus) return;

        const panel = minus.closest(panelSelector);
        if (!panel?.id || !BY_ID.has(panel.id)) return;

        event.preventDefault();
        event.stopPropagation();

        if (typeof event.stopImmediatePropagation === "function") {
            event.stopImmediatePropagation();
        }

        parkPanel(panel.id, "manual");
    }, true);

    /* X = zamknij, nigdy nie twórz parkingu. */
    document.addEventListener("click", event => {
        const close = event.target?.closest?.(
            "#appointmentModal .modal-header > .modal-close," +
            "#blockTimeModal .modal-header > .modal-close," +
            "#appointmentDetailsModal .crm-safe-close," +
            "#appointmentDetailsModal .modal-header > .modal-close," +
            "#crmDayVisitsOverlay .crm-day-list-close," +
            "#crmUnifiedInboxModal #crmUnifiedInboxClose," +
            "#clientModal .modal-header > .modal-close," +
            "#serviceModal .modal-header > .modal-close," +
            "#categoryModal .modal-header > .modal-close," +
            "#crmContactDataConfirmModalV2 [data-close]"
        );

        if (!close) return;

        const panel = close.closest(panelSelector);
        if (!panel?.id || !BY_ID.has(panel.id)) return;

        const c = BY_ID.get(panel.id);
        clearActiveEntryIdentity(c);

        window.setTimeout(() => {
            syncUi();
        }, 0);
    }, true);

    /*
     * Zmiana dnia / nagłówka dnia / mini-kalendarza zamyka zwykły podgląd
     * szczegółów. Nie odkłada go do parkingu.
     */
    document.addEventListener("click", event => {
        const dayChange = event.target?.closest?.(
            ".crm-3day-header," +
            ".crm-week-day-header button," +
            ".crm-month-cell[data-date]," +
            ".mini-date-cell[data-date]"
        );

        if (!dayChange) return;

        const details = BY_ID.get("appointmentDetailsModal");

        if (details && isVisible(details)) {
            hidePanelWithoutParking(details);
            syncUi();
        }
    }, true);

    /* ----------------------------------------------------------
       ZMIANA GŁÓWNEJ ZAKŁADKI — BEZ AUTOMATYCZNEGO PARKINGU
       ---------------------------------------------------------- */

    if (
        typeof switchTab === "function" &&
        !switchTab.__crmPanelManagerV25217
    ) {
        const originalSwitchTab = switchTab;

        switchTab = async function(tabName) {
            const before = activeTab();
            const result = await originalSwitchTab.apply(this, arguments);
            const after = activeTab();

            if (
                before &&
                after &&
                before !== after &&
                !switchingTab
            ) {
                closeVisibleForTabChange();
            }

            window.setTimeout(() => {
                syncUi();
                syncCalendarAttention();
            }, 0);

            return result;
        };

        switchTab.__crmPanelManagerV25217 = true;
    }

    /* ----------------------------------------------------------
       CZERWONY ! — NOWA REZERWACJA / PROŚBA
       ---------------------------------------------------------- */

    const ATTENTION_KEY = "crmCalendarAttentionV25217";

    function readCalendarAttention() {
        try {
            return localStorage.getItem(ATTENTION_KEY) === "1";
        } catch (_) {
            return false;
        }
    }

    function ensureCalendarAttentionBadge() {
        const host = findTabHost("kalendarz");
        if (!host) return null;

        host.classList.add("crm-panel-badge-host-v25217");

        let badge = host.querySelector(".crm-calendar-attention-badge-v25217");

        if (!badge) {
            badge = document.createElement("span");
            badge.className = "crm-calendar-attention-badge-v25217";
            badge.textContent = "!";
            badge.setAttribute("aria-hidden", "true");
            host.appendChild(badge);
        }

        return badge;
    }

    function syncCalendarAttention() {
        const badge = ensureCalendarAttentionBadge();
        if (!badge) return;

        const show = readCalendarAttention();
        badge.hidden = !show;
        badge.classList.toggle("is-visible", show);
    }

    function setCalendarAttention(value) {
        try {
            if (value) localStorage.setItem(ATTENTION_KEY, "1");
            else localStorage.removeItem(ATTENTION_KEY);
        } catch (_) {}

        syncCalendarAttention();
    }

    function installAttentionHooks() {
        if (
            typeof crmShowSimpleAdminNotice === "function" &&
            !crmShowSimpleAdminNotice.__crmAttentionV25217
        ) {
            const originalNotice = crmShowSimpleAdminNotice;

            crmShowSimpleAdminNotice = function(message) {
                const text = String(message || "");

                if (
                    /nowa|nowe/i.test(text) &&
                    /wizy|rezerw|prośb|prosb|zapyt/i.test(text)
                ) {
                    setCalendarAttention(true);
                }

                return originalNotice.apply(this, arguments);
            };

            crmShowSimpleAdminNotice.__crmAttentionV25217 = true;
        }

    }

    /* ----------------------------------------------------------
       STARE API MINIMALIZACJI CRUD
       ---------------------------------------------------------- */

    function hookLegacyUtilityApi() {
        if (!window.crmUtilityPanelsV2525) return;

        const kindToId = {
            client:"clientModal",
            service:"serviceModal",
            category:"categoryModal",
            "contact-confirm":"crmContactDataConfirmModalV2"
        };

        window.crmUtilityPanelsV2525.minimize = kind => {
            const id = kindToId[kind];
            if (id) parkPanel(id, "manual");
        };

        window.crmUtilityPanelsV2525.restore = kind => {
            const id = kindToId[kind];
            if (!id) return;

            const entry = Array.from(parked.entries())
                .reverse()
                .find(([, state]) => state.panelId === id);

            if (entry) restoreEntry(entry[0]);
        };
    }

    /* ----------------------------------------------------------
       START
       ---------------------------------------------------------- */

    function install() {
        ensureParking();
        ensureManualMinimizeButtons();
        installOpenHooks();
        installAttentionHooks();
        hookLegacyUtilityApi();

        syncUi();
        syncCalendarAttention();

        window.setTimeout(() => {
            ensureManualMinimizeButtons();
            installOpenHooks();
            installAttentionHooks();
            hookLegacyUtilityApi();
            syncUi();
            syncCalendarAttention();
        }, 350);

        window.setTimeout(() => {
            ensureManualMinimizeButtons();
            installOpenHooks();
            installAttentionHooks();
            hookLegacyUtilityApi();
            syncUi();
            syncCalendarAttention();
        }, 1300);
    }

    window.addEventListener("resize", positionParking);

    window.crmPanelManagerV25217 = {
        installed:true,
        park:parkPanel,
        restore:restoreEntry,
        remove:removeParked,
        closeAllForCurrentTab,
        setCalendarAttention,
        refresh:syncUi,
        getParked:() =>
            Array.from(parked.entries())
                .map(([key, state]) => ({ key, ...state }))
    };

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", install, { once:true });
    } else {
        install();
    }
})();

/* KONIEC ADMIN V25.2.17 */

/* ==========================================================================
   ADMIN V25.2.21 — SKRZYNKA: DO OBSŁUŻENIA + MINUS PO RENDERZE
   ========================================================================== */

const CRM_INBOX_PENDING_COUNT_KEY_V25221 = "crmInboxPendingActionCountV25221";
const CRM_INBOX_PENDING_COUNT_KEY_LEGACY_V25219 = "crmInboxPendingActionCountV25219";
const CRM_INBOX_PENDING_RECONCILE_MS_V25221 = 10 * 60 * 1000;

window.crmInboxPendingActionCountV25221 = (() => {
    try {
        const current = localStorage.getItem(CRM_INBOX_PENDING_COUNT_KEY_V25221);
        if (current !== null) return Math.max(0, Number(current) || 0);

        const legacy = localStorage.getItem(CRM_INBOX_PENDING_COUNT_KEY_LEGACY_V25219);
        if (legacy !== null) return Math.max(0, Number(legacy) || 0);
    } catch (_) {}

    return 0;
})();

let crmInboxPendingKnownV25221 = (() => {
    try {
        return (
            localStorage.getItem(CRM_INBOX_PENDING_COUNT_KEY_V25221) !== null ||
            localStorage.getItem(CRM_INBOX_PENDING_COUNT_KEY_LEGACY_V25219) !== null
        );
    } catch (_) {
        return false;
    }
})();

let crmInboxPendingReconcileBusyV25221 = false;
let crmInboxPendingLastFullCheckV25221 = 0;

function crmInboxNeedsHandlingV25221(item) {
    if (!item) return false;

    const readState = typeof crmInboxStatusLabel === "function"
        ? crmInboxStatusLabel(item.readState)
        : String(item.readState || "NOWE").trim().toUpperCase();

    if (readState === "OBSŁUŻONE" || readState === "OBSLUZONE") {
        return false;
    }

    const type = String(item.type || "").trim().toUpperCase();
    const requestType = String(item.requestType || "").trim().toUpperCase();
    const status = String(item.status || "").trim().toUpperCase();

    if (type === "BOOKING_REQUEST" || requestType === "FIRST_VISIT") {
        if (status && status !== "OCZEKUJE") return false;
        return true;
    }

    if (type === "CONTACT_FORM") {
        return true;
    }

    return true;
}

function crmInboxPendingCountFromItemsV25221(items) {
    return (Array.isArray(items) ? items : []).reduce(
        (count, item) => count + (crmInboxNeedsHandlingV25221(item) ? 1 : 0),
        0
    );
}

function crmPersistInboxPendingCountV25221(count) {
    try {
        localStorage.setItem(
            CRM_INBOX_PENDING_COUNT_KEY_V25221,
            String(Math.max(0, Number(count) || 0))
        );
        localStorage.removeItem(CRM_INBOX_PENDING_COUNT_KEY_LEGACY_V25219);
    } catch (_) {}
}

function crmApplyInboxPendingIndicatorsV25221(count) {
    const pending = Math.max(0, Number(count) || 0);

    window.crmInboxPendingActionCountV25221 = pending;
    crmInboxPendingKnownV25221 = true;
    crmPersistInboxPendingCountV25221(pending);

    try {
        if (typeof crmEnsureUnifiedInboxButton === "function") {
            crmEnsureUnifiedInboxButton();
        }
    } catch (_) {}

    const button = document.getElementById("crmUnifiedInboxButton");
    const badge = document.getElementById("crmUnifiedInboxBadge");

    if (badge) {
        badge.textContent = pending > 99 ? "99+" : String(pending);
        badge.style.display = pending > 0 ? "inline-flex" : "none";
        badge.style.background = "#b3261e";
        badge.title = pending > 0
            ? `Do obsłużenia: ${pending}`
            : "Brak wpisów wymagających obsługi";
    }

    if (button) {
        button.classList.toggle("crm-inbox-has-pending-v25221", pending > 0);
        button.title = pending > 0
            ? `Skrzynka — ${pending} do obsłużenia`
            : "Skrzynka";
    }

    try {
        window.crmPanelManagerV25217?.setCalendarAttention?.(pending > 0);
    } catch (_) {}

    try {
        window.crmPanelManagerV25217?.refresh?.();
    } catch (_) {}

    return pending;
}

function crmSyncInboxPendingFromCurrentItemsV25221() {
    const items = Array.isArray(crmUnifiedInboxItems)
        ? crmUnifiedInboxItems
        : [];

    return crmApplyInboxPendingIndicatorsV25221(
        crmInboxPendingCountFromItemsV25221(items)
    );
}

function crmEnsureInboxMinimizeButtonV25221() {
    const modal = document.getElementById("crmUnifiedInboxModal");
    const header = modal?.querySelector(".crm-day-list-panel > header");

    if (!header) return null;

    let button = document.getElementById("crmInboxMinimizeV25217");

    if (button && header.contains(button)) {
        return button;
    }

    if (button) button.remove();

    button = document.createElement("button");
    button.type = "button";
    button.id = "crmInboxMinimizeV25217";
    button.className = "crm-panel-minimize-v25217";
    button.textContent = "—";
    button.title = "Zwiń Skrzynkę";
    button.setAttribute("aria-label", "Zwiń Skrzynkę");

    const close = header.querySelector("#crmUnifiedInboxClose");

    if (close?.parentNode === header) {
        header.insertBefore(button, close);
    } else {
        header.appendChild(button);
    }

    return button;
}

const crmUpdateUnifiedInboxBadgeBeforeV25221 = crmUpdateUnifiedInboxBadge;
crmUpdateUnifiedInboxBadge = function(counts = {}) {
    const hasRead = Object.prototype.hasOwnProperty.call(counts || {}, "read");
    const newCount = Math.max(0, Number(counts?.new) || 0);

    if (hasRead) {
        if (Array.isArray(crmUnifiedInboxItems)) {
            crmSyncInboxPendingFromCurrentItemsV25221();
        } else {
            const readCount = Math.max(0, Number(counts?.read) || 0);
            crmApplyInboxPendingIndicatorsV25221(newCount + readCount);
        }
        return;
    }

    const current = Math.max(
        0,
        Number(window.crmInboxPendingActionCountV25221) || 0
    );

    crmApplyInboxPendingIndicatorsV25221(
        Math.max(current, newCount)
    );
};

const crmRenderUnifiedInboxBeforeV25221 = crmRenderUnifiedInbox;
crmRenderUnifiedInbox = function() {
    const result = crmRenderUnifiedInboxBeforeV25221.apply(this, arguments);

    crmSyncInboxPendingFromCurrentItemsV25221();
    crmEnsureInboxMinimizeButtonV25221();

    requestAnimationFrame(() => {
        crmEnsureInboxMinimizeButtonV25221();
        window.crmPanelManagerV25217?.refresh?.();
    });

    return result;
};

const crmOpenUnifiedInboxBeforeV25221 = crmOpenUnifiedInbox;
crmOpenUnifiedInbox = async function() {
    crmEnsureInboxMinimizeButtonV25221();

    const result = await crmOpenUnifiedInboxBeforeV25221.apply(this, arguments);

    crmSyncInboxPendingFromCurrentItemsV25221();
    crmEnsureInboxMinimizeButtonV25221();

    requestAnimationFrame(() => {
        crmEnsureInboxMinimizeButtonV25221();
        window.crmPanelManagerV25217?.refresh?.();
    });

    return result;
};

async function crmReconcileInboxPendingV25221(options = {}) {
    if (
        crmInboxPendingReconcileBusyV25221 ||
        document.hidden ||
        window.crmBootInProgressV2 ||
        window.crmDiagnosticsNetworkModeV11
    ) {
        return;
    }

    const force = options.force === true;
    const now = Date.now();

    if (
        !force &&
        crmInboxPendingLastFullCheckV25221 > 0 &&
        now - crmInboxPendingLastFullCheckV25221 < CRM_INBOX_PENDING_RECONCILE_MS_V25221
    ) {
        return;
    }

    crmInboxPendingReconcileBusyV25221 = true;
    crmInboxPendingLastFullCheckV25221 = now;

    try {
        if (typeof crmLoadUnifiedInbox === "function") {
            await crmLoadUnifiedInbox({ force:true, silent:false });
            crmSyncInboxPendingFromCurrentItemsV25221();
        }
    } catch (error) {
        console.warn(
            "Synchronizacja pozycji do obsłużenia:",
            error?.message || error
        );
    } finally {
        crmInboxPendingReconcileBusyV25221 = false;
    }
}

function crmInstallInboxPendingV25221() {
    crmApplyInboxPendingIndicatorsV25221(
        window.crmInboxPendingActionCountV25221
    );

    crmEnsureInboxMinimizeButtonV25221();

    window.setTimeout(() => {
        crmEnsureInboxMinimizeButtonV25221();

        if (!crmInboxPendingKnownV25221) {
            crmReconcileInboxPendingV25221({ force:true }).catch(console.error);
        }
    }, 2800);

    window.setTimeout(() => {
        crmEnsureInboxMinimizeButtonV25221();

        if (!crmInboxPendingKnownV25221) {
            crmReconcileInboxPendingV25221({ force:true }).catch(console.error);
        }
    }, 6500);
}

window.addEventListener("focus", () => {
    crmReconcileInboxPendingV25221().catch(console.error);
});

document.addEventListener("visibilitychange", () => {
    if (!document.hidden) {
        crmReconcileInboxPendingV25221().catch(console.error);
    }
});

if (document.readyState === "loading") {
    document.addEventListener(
        "DOMContentLoaded",
        crmInstallInboxPendingV25221,
        { once:true }
    );
} else {
    crmInstallInboxPendingV25221();
}

/* KONIEC ADMIN V25.2.21 */

/* ==========================================================================
   ADMIN FIRST VISIT V9 — PEŁNE DANE W SKRZYNCE
   2026-08-22

   Backend przekazuje teraz:
   - category
   - preferredWindow
   - contactMethod
   - email
   - proposals
   - message

   Ten patch nie dodaje żadnego requestu ani pollingu.
   Wyłącznie wzbogaca już wyrenderowaną Skrzynkę.
   ========================================================================== */

function crmInboxContactLabelV269(item) {
    const method =
        String(item?.contactMethod || "")
            .trim()
            .toUpperCase();

    if (method === "WHATSAPP") {
        return "WhatsApp";
    }

    if (method === "SMS") {
        return "SMS";
    }

    if (method === "EMAIL") {
        return "E-mail";
    }

    return item?.email ? "E-mail" : "Telefon";
}

function crmInboxContactValueV269(item) {
    const method =
        String(item?.contactMethod || "")
            .trim()
            .toUpperCase();

    if (method === "EMAIL") {
        return String(item?.email || "—");
    }

    return String(item?.phone || item?.email || "—");
}

const crmRenderUnifiedInboxBeforeFirstVisitV9 =
    crmRenderUnifiedInbox;

crmRenderUnifiedInbox = function() {
    const result =
        crmRenderUnifiedInboxBeforeFirstVisitV9
            .apply(this, arguments);

    const body =
        document.getElementById(
            "crmUnifiedInboxBody"
        );

    if (!body) return result;

    const rows =
        crmUnifiedInboxFilter === "ALL"
            ? (crmUnifiedInboxItems || [])
            : (crmUnifiedInboxItems || [])
                .filter(item =>
                    crmInboxStatusLabel(
                        item.readState
                    ) ===
                    crmUnifiedInboxFilter
                );

    const cards =
        Array.from(
            body.querySelectorAll("article")
        );

    cards.forEach((card, index) => {
        const item = rows[index];
        if (!item) return;

        card.dataset.crmInboxId =
            String(item?.id || "");

        if (
            item.type !== "BOOKING_REQUEST" ||
            item.requestType !== "FIRST_VISIT"
        ) {
            return;
        }

        const info =
            card.querySelector(
                ".crm-first-visit-inbox-info"
            );

        if (!info) return;

        const proposals =
            typeof crmFirstVisitNormalizeProposalsV8 === "function"
                ? crmFirstVisitNormalizeProposalsV8(item)
                : (
                    Array.isArray(item?.proposals)
                        ? item.proposals
                        : []
                );

        const proposalHtml =
            proposals.length
                ? proposals
                    .map(row => `
                      <button type="button"
                              class="crm-first-visit-date-chip"
                              data-first-visit-date="${crmInboxEscape(row.date || "")}">
                        <b>${crmInboxEscape(
                            typeof crmFirstVisitFormatDayV8 === "function"
                                ? crmFirstVisitFormatDayV8(row.date)
                                : row.date
                        )}</b>
                        <span>${row.times?.length
                            ? crmInboxEscape(row.times.join(" · "))
                            : "dowolna godzina"}</span>
                      </button>`)
                    .join("")
                : `
                  <span class="crm-first-visit-no-proposals">
                    Klient nie wskazał konkretnego dnia.
                  </span>`;

        const category =
            item.category ||
            item.service ||
            "—";

        const description =
            String(item.message || "").trim();

        const preferredWindow =
            String(item.preferredWindow || "").trim();

        const contactLabel =
            crmInboxContactLabelV269(item);

        const contactValue =
            crmInboxContactValueV269(item);

        info.innerHTML = `
          <div class="crm-first-visit-inbox-service">
            <span>Kategoria</span>
            <strong>${crmInboxEscape(category)}</strong>
            <small>${Number(item.duration) || 45} min</small>
          </div>

          ${description
            ? `
              <div class="crm-first-visit-inbox-description-v269">
                <span>Opis klienta</span>
                <strong>${crmInboxEscape(description)}</strong>
              </div>`
            : ""}

          ${preferredWindow
            ? `
              <div class="crm-first-visit-inbox-window-v269">
                <span>Preferowane widełki</span>
                <strong>${crmInboxEscape(preferredWindow)}</strong>
              </div>`
            : ""}

          <div class="crm-first-visit-inbox-contact-v269">
            <span>Sposób kontaktu</span>
            <strong>${crmInboxEscape(contactLabel)}</strong>
            <small>${crmInboxEscape(contactValue)}</small>
          </div>

          <div class="crm-first-visit-inbox-proposals">
            <span>Konkretne terminy</span>
            <div>${proposalHtml}</div>
          </div>`;

        info
            .querySelectorAll(
                "[data-first-visit-date]"
            )
            .forEach(button => {
                button.onclick = () => {
                    if (
                        typeof crmFirstVisitGoToDateV8 ===
                        "function"
                    ) {
                        crmFirstVisitGoToDateV8(
                            item,
                            button.dataset.firstVisitDate
                        );
                    }
                };
            });
    });

    return result;
};

/* KONIEC ADMIN FIRST VISIT V9 */

/* ===== ADMIN/DEV V5 — PHYSICAL CSS ONLY / LEGACY CLEANUP ===== */
(function crmDisableLegacyDevLayoutV5() {
    const LEGACY_STORAGE_KEY = "nailArtDevLayoutV4";
    const LEGACY_STYLE_ID = "crmDevSavedLayoutStyleV4";

    function clearLegacyLayout() {
        try { localStorage.removeItem(LEGACY_STORAGE_KEY); } catch (_) {}
        document.getElementById(LEGACY_STYLE_ID)?.remove();
        return true;
    }

    /*
     * DEV V5 nie używa localStorage do przechowywania layoutu.
     * Źródłem prawdy jest fizyczny plik:
     * admin/CSS/styleadmin-overrides.css
     */
    clearLegacyLayout();

    window.crmApplySavedDevLayoutV4 = function() {
        clearLegacyLayout();
        return false;
    };
    window.crmClearSavedDevLayoutV4 = clearLegacyLayout;
    window.crmDevLayoutStorageModeV5 = "PHYSICAL_CSS_ONLY";
})();
/* ===== KONIEC ADMIN/DEV V5 ===== */
