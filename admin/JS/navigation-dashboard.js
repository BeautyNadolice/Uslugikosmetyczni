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

/* ----- NAV.2. renderDashboard (oryginalna linia 350) ----- */
/* ==========================================================
   DASHBOARD
   ========================================================== */

function renderDashboard() {

    const today =
        new Date();

    let todayCount = 0;

    let todayIncome = 0;

    let monthIncome = 0;


    appointmentsData.forEach(app => {

        if(!app.date) return;

        const appDate =
            new Date(app.date);

        const service =
            currentServices.find(
                s =>
                s.name &&
                app.service &&
                s.name.trim()
                .toLowerCase()
                ===
                app.service.trim()
                .toLowerCase()
            );

        const price =
            service
            ?
            Number(service.price)
            :
            0;


        if(
            appDate.toDateString()
            ===
            today.toDateString()
        ) {

            todayCount++;

            todayIncome += price;

        }

        if(
            appDate.getMonth()
            ===
            today.getMonth()
            &&
            appDate.getFullYear()
            ===
            today.getFullYear()
        ) {

            monthIncome += price;

        }

    });


    setText(
        "dashboard-today-visits",
        todayCount
    );

    setText(
        "dashboard-today-income",
        todayIncome.toFixed(2)
        + " zł"
    );

    setText(
        "dashboard-month-income",
        monthIncome.toFixed(2)
        + " zł"
    );

    setText(
        "dashboard-total-clients",
        customersData.length
    );

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
