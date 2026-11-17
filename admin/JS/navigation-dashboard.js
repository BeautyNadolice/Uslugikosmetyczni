/* ==========================================================================
   NAV. NAWIGACJA I DASHBOARD
   Plik wygenerowany zachowawczo z admin.js. Kolejnosc elementow wewnatrz
   modulu odpowiada kolejnosci w monolicie. Nie zmieniac nazw globalnych.
   ========================================================================== */

/* ----- NAV.1. switchTab (oryginalna linia 282) ----- */
/* ==========================================================
   SIDEBAR TABS
   ========================================================== */

function switchTab(tabName) {

    // Panel szczegółów wizyty może być widoczny wyłącznie w Kalendarzu.
    // Po przejściu do innej zakładki zamykamy go i przywracamy statyczny panel po prawej.
    if (tabName !== "kalendarz") {
        const appointmentPanel = document.getElementById("appointmentDetailsModal");
        if (appointmentPanel) appointmentPanel.style.display = "none";
        document.body.classList.remove("crm-v3-details-open");
    }

    document.querySelectorAll('.tab-page')
        .forEach(tab => tab.style.display = 'none');

    document.querySelectorAll('.nav-btn')
        .forEach(btn => btn.classList.remove('active'));

    const page =
        document.getElementById(
            "tab-" + tabName
        );

    if(page) {

        page.style.display =
            "block";

    }

   const activeBtn =
document.querySelector(
    `.nav-btn[onclick*="${tabName}"]`
);

if(activeBtn){

    activeBtn.classList.add(
        "active"
    );

}

    if(tabName === "dashboard") {

        renderDashboard();

    }

    if(tabName === "kalendarz") {

        renderBooksyCalendar();

    }

    if(tabName === "finanse") {

        calculateFinanceReport();

    }

}

/* ----- SHARED ADMIN REQUEST DEDUPE V30.27 ----- */
const crmAdminRequestStateV3027={inflight:new Map(),cache:new Map()};
function crmAdminRequestKeyV3027(payload){
    const obj=payload||{};return Object.keys(obj).sort().map(k=>`${k}:${JSON.stringify(obj[k])}`).join("|");
}
function crmAdminPostV3027(payload,options={}){
    const key=crmAdminRequestKeyV3027(payload),now=Date.now(),cacheMs=Math.max(0,Number(options.cacheMs)||0);
    const cached=crmAdminRequestStateV3027.cache.get(key);
    if(!options.force&&cached&&cacheMs&&now-cached.time<cacheMs)return Promise.resolve(cached.data);
    if(crmAdminRequestStateV3027.inflight.has(key))return crmAdminRequestStateV3027.inflight.get(key);
    const request=crmTestPost(payload,{timeoutMs:Number(options.timeoutMs)||30000}).then(data=>{
        if(cacheMs)crmAdminRequestStateV3027.cache.set(key,{time:Date.now(),data});
        return data;
    }).finally(()=>crmAdminRequestStateV3027.inflight.delete(key));
    crmAdminRequestStateV3027.inflight.set(key,request);
    return request;
}
function crmAdminInvalidateV3027(action){
    [...crmAdminRequestStateV3027.cache.keys()].forEach(key=>{if(!action||key.includes(`action:${JSON.stringify(action)}`))crmAdminRequestStateV3027.cache.delete(key);});
}
window.crmAdminPostV3027=crmAdminPostV3027;
window.crmAdminInvalidateV3027=crmAdminInvalidateV3027;

function crmGetServicePriceMapV25() {
    const map = new Map();
    (Array.isArray(currentServices) ? currentServices : []).forEach(service => {
        const key = String(service?.name || "").trim().toLowerCase();
        if (!key) return;
        map.set(key, Number(service?.price) || 0);
    });
    return map;
}

/* ----- NAV.2. renderDashboard (oryginalna linia 350) ----- */
/* ==========================================================
   DASHBOARD
   ========================================================== */

async function renderDashboard() {
    const dashboardPage=document.getElementById("tab-dashboard");
    if(dashboardPage&&window.getComputedStyle(dashboardPage).display==="none")return;
    const ids = {
        visits: "dashboard-today-visits",
        todayRevenue: "dashboard-today-income",
        monthRevenue: "dashboard-month-income",
        booksyRevenue: "dashboard-booksy-income",
        domRevenue: "dashboard-dom-income",
        earnings: "dashboard-main-earnings",
        hours: "dashboard-main-hours",
        clients: "dashboard-total-clients"
    };
    try {
        const now = new Date();
        const from = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}-01`;
        const toDate = new Date(now.getFullYear(), now.getMonth()+1, 0);
        const to = `${toDate.getFullYear()}-${String(toDate.getMonth()+1).padStart(2,"0")}-${String(toDate.getDate()).padStart(2,"0")}`;
        const today = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}-${String(now.getDate()).padStart(2,"0")}`;
        const data = await crmAdminPostV3027({ action:"getFinanceStatisticsV4738", from, to, source:"ALL", staff:"" }, { timeoutMs:30000, cacheMs:15000 });
        if (!data || !data.success) throw new Error(data?.error || "Brak danych Finance");
        const day = (data.daily || []).find(item => item.key === today) || {};
        const bySource = Object.fromEntries((data.bySource || []).map(item => [item.key, item]));
        const payroll = data.payroll || {};
        setText(ids.visits, String(day.visits || 0));
        setText(ids.todayRevenue, typeof crmFinanceMoneyV3026 === "function" ? crmFinanceMoneyV3026(day.revenue || 0) : `${Number(day.revenue||0).toFixed(2)} zł`);
        setText(ids.monthRevenue, typeof crmFinanceMoneyV3026 === "function" ? crmFinanceMoneyV3026(data.summary?.revenue || 0) : `${Number(data.summary?.revenue||0).toFixed(2)} zł`);
        setText(ids.booksyRevenue, typeof crmFinanceMoneyV3026 === "function" ? crmFinanceMoneyV3026(bySource.BOOKSY?.revenue || 0) : `${Number(bySource.BOOKSY?.revenue||0).toFixed(2)} zł`);
        setText(ids.domRevenue, typeof crmFinanceMoneyV3026 === "function" ? crmFinanceMoneyV3026(bySource.DOM?.revenue || 0) : `${Number(bySource.DOM?.revenue||0).toFixed(2)} zł`);
        setText(ids.earnings, typeof crmFinanceMoneyV3026 === "function" ? crmFinanceMoneyV3026(payroll.total || 0) : `${Number(payroll.total||0).toFixed(2)} zł`);
        setText(ids.hours, typeof crmFinanceMinutesV3026 === "function" ? crmFinanceMinutesV3026(payroll.paidMinutes || 0) : `${((payroll.paidMinutes||0)/60).toFixed(1)} h`);
        setText(ids.clients, String(data.summary?.uniqueClients || 0));
        const mainName = data.mainStaff?.name || "Daria Strelnikova";
        const label = document.getElementById("dashboard-main-earnings-label");
        if (label) label.textContent = `Zarobek Booksy — ${mainName} — miesiąc`;
        const booksyLabel = document.getElementById("dashboard-booksy-label");
        if (booksyLabel) booksyLabel.textContent = `Booksy — ${mainName.split(" ")[0]}`;
        return;
    } catch (error) {
        console.warn("Dashboard Finance V30.28 fallback", error);
    }

    const today = new Date();
    let todayCount = 0, todayIncome = 0, monthIncome = 0;
    const servicePriceMap = crmGetServicePriceMapV25();
    appointmentsData.forEach(app => {
        if (!app.date) return;
        const appDate = new Date(app.date), serviceKey = String(app.service || "").trim().toLowerCase(), price = servicePriceMap.get(serviceKey) || 0;
        if (appDate.toDateString() === today.toDateString()) { todayCount++; todayIncome += price; }
        if (appDate.getMonth() === today.getMonth() && appDate.getFullYear() === today.getFullYear()) monthIncome += price;
    });
    setText(ids.visits, todayCount);
    setText(ids.todayRevenue, todayIncome.toFixed(2) + " zł");
    setText(ids.monthRevenue, monthIncome.toFixed(2) + " zł");
    setText(ids.clients, customersData.length);
}

/* ----- NAV.3. _switchTabV2 (oryginalna linia 5566) ----- */
const _switchTabV2=switchTab;

/* ----- NAV.4. switchTab (oryginalna linia 5566) ----- */
switchTab=function(name){_switchTabV2(name);if(name==='ustawienia')loadBookingRequests();};

/* ----- NAV.5. crmV3InitializeWorkspace (oryginalna linia 5678) ----- */
function crmV3InitializeWorkspace() {
    crmV3MoveRequestsToCalendar();
    loadBookingRequests().catch(console.error);
}

/* ----- NAV.6. crmV11SwitchTabOriginal (oryginalna linia 6706) ----- */
const crmV11SwitchTabOriginal = switchTab;

/* ----- NAV.7. switchTab (oryginalna linia 6707) ----- */
switchTab = function(tabName) {
    if (tabName !== "kalendarz") {
        /* NAV.7.1. Wyjscie z Kalendarza zamyka caly kontekst kalendarzowy:
           liste dnia, szczegoly wizyty i menu statusu. */
        if (typeof crmCloseDayVisitsList === "function") crmCloseDayVisitsList();
        if (typeof crmToggleVisitStatusMenu === "function") crmToggleVisitStatusMenu(false);

        const detailsPanel = document.getElementById("appointmentDetailsModal");
        if (detailsPanel) detailsPanel.style.display = "none";

        document.body.classList.remove("crm-v3-details-open");
        currentEditingAppointment = null;
    }
    return crmV11SwitchTabOriginal(tabName);
};

/* ADMIN FINAL: OCHRONA ZMIANY ZAKLADKI */
const crmFinalSwitchTabOriginal=switchTab;
switchTab=async function(tabName){if(crmHasUnsavedChanges){const ok=await crmConfirmUnsavedNavigation();if(!ok)return;crmSetUnsavedChanges(false);}return crmFinalSwitchTabOriginal(tabName);};

/* ----- NAV V30.28: Ustawienia Booksy + Finance v0.1 compliance ----- */
const crmV3026SwitchTabOriginal = switchTab;
switchTab = async function(tabName) {
    const result = await crmV3026SwitchTabOriginal(tabName);
    if (tabName === "ustawienia" && typeof crmLoadBooksySettingsV3026 === "function") {
        crmLoadBooksySettingsV3026(false).catch(console.error);
    }
    return result;
};
