/* ==========================================================
   NAIL-ART DARIA CRM V2
   ADMIN.JS
   CORE
   ========================================================== */


/* ==========================================================
   CONFIG
   ========================================================== */

const APPS_SCRIPT_URL =
"https://script.google.com/macros/s/AKfycbwwBboidDdr5gX8RtCXuokMnwMMl_Jy6o88iDYQjrFNc6ubxD87xeWhrLQFYUvsXLLd/exec";

const ALLOWED_EMAIL =
"strsasa@gmail.com";


/* ==========================================================
   GLOBAL STATE
   ========================================================== */

let currentServices = [];
let appointmentsData = [];
let customersData = [];
let settingsData = {};
let globalColors = {};
let allCategories = [];

let currentEditingAppointment = null;

let selectedCalendarDate = new Date();
let miniMonthDate = new Date();
let calendarViewMode = "day";

let isDeletingAppointment = false;
let isSavingAppointment = false;
let isBlockingTime = false;

/* ==========================================================
   START APP
   ========================================================== */

document.addEventListener(
    "DOMContentLoaded",
    initializeCRM
);

async function initializeCRM() {

    checkAuthSession();

}


/* ==========================================================
   AUTH
   ========================================================== */

function checkAuthSession() {

    const savedEmail =
        localStorage.getItem("admin_email");

    if (
        savedEmail === ALLOWED_EMAIL ||
        savedEmail === "test_admin@test.com"
    ) {

        showAdminPanel();

    } else {

        showLoginScreen();

    }

}


function showLoginScreen() {

    document.getElementById(
        "login-modal"
    ).style.display = "flex";

}


async function showAdminPanel() {

    document.getElementById(
        "login-modal"
    ).style.display = "none";

    document.getElementById(
        "admin-panel-wrapper"
    ).style.display = "flex";

    try{

        await loadSystem();

    }catch(e){

        console.error(e);

    }

}


function loginTest() {

    localStorage.setItem(
        "admin_email",
        "test_admin@test.com"
    );

    showAdminPanel();

}


function logout() {

    localStorage.clear();

    location.reload();

}


/* ==========================================================
   SYSTEM LOAD
   ========================================================== */

async function loadServices() {

    try {

        const response =
            await fetch(
                APPS_SCRIPT_URL +
                "?getPrices=true"
            );

        currentServices =
            await response.json();

        renderServicesTable();

    }

    catch(err) {

        console.error(err);

    }

}
function renderServicesTable() {

    const tbody =
        document.getElementById(
            "adminServicesTableBody"
        );

    if (!tbody) return;

    tbody.innerHTML = "";

    if (
        !currentServices ||
        currentServices.length === 0
    ) {

        tbody.innerHTML =
            `
            <tr>
                <td colspan="6"
                    style="text-align:center;">
                    Brak usług
                </td>
            </tr>
            `;

        return;

    }

    currentServices.forEach((service, index) => {

        const tr =
            document.createElement("tr");

        tr.innerHTML = `

            <td>
                ${service.category || ""}
            </td>

            <td>
                ${service.name || ""}
            </td>

            <td>
                ${service.price || 0} zł
            </td>

            <td>
                ${service.duration || 0} min
            </td>

            <td>
                ${service.status || ""}
            </td>

            <td>
    <button
        class="btn-secondary"
        onclick="editService(${index})">
        Edytuj
    </button>

    <button
        class="btn-danger"
        onclick="deleteService(${index})">
        Usuń
    </button>
</td>
        `;

        tbody.appendChild(tr);

    });

}
async function loadSettings() {

    try {

        const response =
            await fetch(
                APPS_SCRIPT_URL +
                "?checkBusy=true"
            );

        const data =
            await response.json();

        settingsData =
            data.settings || {};

        appointmentsData =
            data.appointments || [];

        globalColors = {};

        if (settingsData.colors) {

            Object.keys(
                settingsData.colors
            ).forEach(key => {

                globalColors[key] =
                    settingsData.colors[key];

            });

        }

        allCategories =
            settingsData.all_categories || [];

       populateSettingsForm();
renderMiniMonthCalendar();
renderBooksyCalendar();
    }

    catch(err) {

        console.error(
            "Settings error",
            err
        );

    }

}
/* ==========================================================
   SIDEBAR TABS
   ========================================================== */

function switchTab(tabName) {

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


/* ==========================================================
   HELPERS
   ========================================================== */

function setText(id,value){

    const el =
        document.getElementById(id);

    if(el){

        el.innerText =
            value;

    }

}


function getFormattedISOBlockDate(dateObj){

    return (
        dateObj.getFullYear()
        +
        "-"
        +
        String(
            dateObj.getMonth()+1
        ).padStart(2,"0")
        +
        "-"
        +
        String(
            dateObj.getDate()
        ).padStart(2,"0")
    );

}
/* ==========================================================
   CALENDAR VIEW
   ========================================================== */

function setCalendarView(mode){

    calendarViewMode = mode;

    document
        .querySelectorAll(
            ".btn-toggle"
        )
        .forEach(btn=>{

            btn.classList.remove(
                "active"
            );

        });

    if(mode==="day"){

        document
            .getElementById(
                "view-day-btn"
            )
            .classList.add(
                "active"
            );

    }

    if(mode==="week"){

        document
            .getElementById(
                "view-week-btn"
            )
            .classList.add(
                "active"
            );

    }

    if(mode==="month"){

        document
            .getElementById(
                "view-month-btn"
            )
            .classList.add(
                "active"
            );

    }

    renderBooksyCalendar();

}


/* ==========================================================
   DATE NAVIGATION
   ========================================================== */

function changeSelectedDate(days){

    if(calendarViewMode==="week"){

        selectedCalendarDate.setDate(
            selectedCalendarDate.getDate()
            +
            (days*7)
        );

    }
    else if(calendarViewMode==="month"){

        selectedCalendarDate.setMonth(
            selectedCalendarDate.getMonth()
            +
            days
        );

    }
    else{

        selectedCalendarDate.setDate(
            selectedCalendarDate.getDate()
            +
            days
        );

    }

    renderBooksyCalendar();

}


function changeMiniMonth(months){

    miniMonthDate.setMonth(
        miniMonthDate.getMonth()
        +
        months
    );

    renderMiniMonthCalendar();

}


/* ==========================================================
   MINI CALENDAR
   ========================================================== */

function renderMiniMonthCalendar(){

    const grid =
        document.getElementById(
            "mini-month-days-grid"
        );

    const title =
        document.getElementById(
            "mini-month-title"
        );

    if(!grid) return;

    grid.innerHTML = "";

    const monthNames = [

        "Styczeń",
        "Luty",
        "Marzec",
        "Kwiecień",
        "Maj",
        "Czerwiec",
        "Lipiec",
        "Sierpień",
        "Wrzesień",
        "Październik",
        "Listopad",
        "Grudzień"

    ];

    title.innerText =
        `${monthNames[
            miniMonthDate.getMonth()
        ]} ${miniMonthDate.getFullYear()}`;

    const firstDay =
        new Date(
            miniMonthDate.getFullYear(),
            miniMonthDate.getMonth(),
            1
        );

    let startDay =
        firstDay.getDay();

    if(startDay===0){

        startDay = 7;

    }

    const daysInMonth =
        new Date(
            miniMonthDate.getFullYear(),
            miniMonthDate.getMonth()+1,
            0
        ).getDate();

    for(let i=1;i<startDay;i++){

        grid.appendChild(
            document.createElement("div")
        );

    }

    for(let day=1;day<=daysInMonth;day++){

        const cell =
            document.createElement("div");

        cell.className =
            "mini-date-cell";

        cell.innerText =
            day;

        const date =
            new Date(
                miniMonthDate.getFullYear(),
                miniMonthDate.getMonth(),
                day
            );

        if(
            date.toDateString()
            ===
            new Date().toDateString()
        ){

            cell.classList.add(
                "today"
            );

        }

        if(
            date.toDateString()
            ===
            selectedCalendarDate.toDateString()
        ){

            cell.classList.add(
                "selected"
            );

        }

        cell.onclick=()=>{

            selectedCalendarDate = date;

            renderBooksyCalendar();

        };

        grid.appendChild(
            cell
        );

    }

}


/* ==========================================================
   MAIN CALENDAR
   ========================================================== */

function renderBooksyCalendar(){
    const grid = document.getElementById("booksy-grid");
    if (document.getElementById("work-schedule-calendar")) renderWorkScheduleCalendar().catch(console.error);
    if (!grid) return;

    updateCalendarRangeTitle();

    if (calendarViewMode === "week") {
        renderWeekCalendar(grid);
        return;
    }

    if (calendarViewMode === "month") {
        renderMonthCalendar(grid);
        return;
    }

    renderDayCalendar(grid);
}

function getCalendarEventsForDate(date) {
    const dateKey = getFormattedISOBlockDate(date);
    return appointmentsData
        .filter(item => item.date && item.date.startsWith(dateKey))
        .sort((a, b) => {
            const pa = a.eventType === "work_shift" ? 0 : 1;
            const pb = b.eventType === "work_shift" ? 0 : 1;
            return pa - pb || a.date.localeCompare(b.date);
        });
}

function formatCalendarTime(dateValue) {
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return "";
    return String(date.getHours()).padStart(2, "0") + ":" +
        String(date.getMinutes()).padStart(2, "0");
}

function getMondayOfWeek(date) {
    const monday = new Date(date);
    const day = monday.getDay();
    const distance = day === 0 ? -6 : 1 - day;
    monday.setDate(monday.getDate() + distance);
    monday.setHours(0, 0, 0, 0);
    return monday;
}

function formatPolishShortDate(date) {
    return date.toLocaleDateString("pl-PL", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
    });
}

function updateCalendarRangeTitle() {
    const title = document.getElementById("calendar-current-date-title");
    if (!title) return;

    if (calendarViewMode === "week") {
        const monday = getMondayOfWeek(selectedCalendarDate);
        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);
        title.innerText = formatPolishShortDate(monday) + " – " + formatPolishShortDate(sunday);
        return;
    }

    if (calendarViewMode === "month") {
        title.innerText = selectedCalendarDate.toLocaleDateString("pl-PL", {
            month: "long",
            year: "numeric"
        });
        return;
    }

    title.innerText = selectedCalendarDate.toLocaleDateString("pl-PL", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
    });
}

function renderDayCalendar(grid) {
    grid.innerHTML = "";
    grid.style.display = "block";
    grid.style.gridTemplateColumns = "";
    grid.style.gap = "";
    grid.style.overflowX = "";
    grid.dataset.calendarView = "day";
    const events = getCalendarEventsForDate(selectedCalendarDate);

    if (events.length === 0) {
        grid.innerHTML = '<div style="padding:40px;text-align:center;color:#777;">Brak wizyt i blokad</div>';
        return;
    }

    events.forEach(item => renderAppointmentCard(item, grid));
}

function renderCompactCalendarEvent(item, container, mode) {
    const event = document.createElement("button");
    event.type = "button";
    event.className = "calendar-compact-event";
    event.style.cssText = [
        "display:block",
        "width:100%",
        "margin:4px 0",
        "padding:6px 7px",
        "border:0",
        "border-radius:6px",
        "text-align:left",
        "color:#fff",
        "cursor:pointer",
        "font-size:" + (mode === "month" ? "11px" : "12px"),
        "line-height:1.25",
        "overflow:hidden"
    ].join(";");

    let color = "#b05c75";
    if (item.eventType === "block") color = "#8c6b4f";
    else if (item.eventType === "external") color = "#555555";
    else if (item.eventType === "work_shift") color = "#f2c94c";
    else {
        const service = currentServices.find(value =>
            value.name && item.service &&
            value.name.trim().toLowerCase() === item.service.trim().toLowerCase()
        );
        if (service && globalColors[service.category]) color = globalColors[service.category];
    }

    event.style.background = color;
    const time = formatCalendarTime(item.date);
    if (item.eventType === "work_shift") {
        event.style.color = "#111";
        event.style.fontWeight = "700";
        event.innerHTML = item.name || "Brak";
        event.title = item.name || "Grafik pracy";
        event.onclick = null;
    } else {
        event.innerHTML = "<strong>" + time + "</strong> " + (item.name || item.service || "Wpis");
        event.title = time + " " + (item.name || "") + " " + (item.service || "");
        event.onclick = () => openAppointmentDetailsModal(item);
    }
    container.appendChild(event);
}

function renderWeekCalendar(grid) {
    grid.innerHTML = "";
    grid.dataset.calendarView = "week";
    grid.style.display = "grid";
    grid.style.gridTemplateColumns = "repeat(7, minmax(130px, 1fr))";
    grid.style.gap = "8px";
    grid.style.alignItems = "stretch";
    grid.style.overflowX = "auto";

    const monday = getMondayOfWeek(selectedCalendarDate);
    const dayNames = ["Pon", "Wt", "Śr", "Czw", "Pt", "Sob", "Ndz"];

    for (let index = 0; index < 7; index++) {
        const date = new Date(monday);
        date.setDate(monday.getDate() + index);
        const column = document.createElement("section");
        column.className = "calendar-week-day";
        column.dataset.date = getFormattedISOBlockDate(date);
        column.style.cssText = "min-height:260px;padding:9px;border:1px solid #e3d8cf;border-radius:9px;background:#fff;box-sizing:border-box;";

        if (date.toDateString() === new Date().toDateString()) {
            column.style.borderColor = "#b05c75";
            column.style.boxShadow = "0 0 0 2px rgba(176,92,117,.12)";
        }

        const header = document.createElement("button");
        header.type = "button";
        header.style.cssText = "width:100%;padding:5px;border:0;background:transparent;font-weight:700;cursor:pointer;color:#3d3330;";
        header.innerText = dayNames[index] + " " + date.getDate() + "." + (date.getMonth() + 1);
        header.onclick = () => {
            selectedCalendarDate = new Date(date);
            setCalendarView("day");
        };
        column.appendChild(header);

        const events = getCalendarEventsForDate(date);
        if (events.length === 0) {
            const empty = document.createElement("div");
            empty.style.cssText = "padding:20px 4px;text-align:center;color:#aaa;font-size:12px;";
            empty.innerText = "Brak wpisów";
            column.appendChild(empty);
        } else {
            events.forEach(item => renderCompactCalendarEvent(item, column, "week"));
        }
        grid.appendChild(column);
    }
}

function renderMonthCalendar(grid) {
    grid.innerHTML = "";
    grid.dataset.calendarView = "month";
    grid.style.display = "grid";
    grid.style.gridTemplateColumns = "repeat(7, minmax(115px, 1fr))";
    grid.style.gap = "6px";
    grid.style.overflowX = "auto";

    const year = selectedCalendarDate.getFullYear();
    const month = selectedCalendarDate.getMonth();
    const weekdayNames = ["Pon", "Wt", "Śr", "Czw", "Pt", "Sob", "Ndz"];

    weekdayNames.forEach(name => {
        const header = document.createElement("div");
        header.style.cssText = "padding:8px;text-align:center;font-weight:700;color:#5c504a;";
        header.innerText = name;
        grid.appendChild(header);
    });

    const first = new Date(year, month, 1);
    const last = new Date(year, month + 1, 0);
    const leading = first.getDay() === 0 ? 6 : first.getDay() - 1;
    const totalCells = Math.ceil((leading + last.getDate()) / 7) * 7;

    for (let cellIndex = 0; cellIndex < totalCells; cellIndex++) {
        const dayNumber = cellIndex - leading + 1;
        const date = new Date(year, month, dayNumber);
        const inCurrentMonth = date.getMonth() === month;
        const cell = document.createElement("section");
        cell.className = "calendar-month-day";
        cell.dataset.date = getFormattedISOBlockDate(date);
        cell.style.cssText = "min-height:120px;padding:7px;border:1px solid #e3d8cf;border-radius:8px;background:" +
            (inCurrentMonth ? "#fff" : "#f7f3f0") + ";opacity:" + (inCurrentMonth ? "1" : ".58") + ";box-sizing:border-box;";

        if (date.toDateString() === new Date().toDateString()) {
            cell.style.borderColor = "#b05c75";
            cell.style.boxShadow = "0 0 0 2px rgba(176,92,117,.12)";
        }
        if (date.toDateString() === selectedCalendarDate.toDateString()) {
            cell.style.background = "#fff4f7";
        }

        const dayButton = document.createElement("button");
        dayButton.type = "button";
        dayButton.style.cssText = "min-width:30px;padding:3px 6px;border:0;border-radius:15px;background:transparent;font-weight:700;cursor:pointer;";
        dayButton.innerText = date.getDate();
        dayButton.onclick = () => {
            selectedCalendarDate = new Date(date);
            miniMonthDate = new Date(date);
            setCalendarView("day");
            renderMiniMonthCalendar();
        };
        cell.appendChild(dayButton);

        getCalendarEventsForDate(date).forEach(item => renderCompactCalendarEvent(item, cell, "month"));
        grid.appendChild(cell);
    }
}

/* ==========================================================
   EVENT CARD
   ========================================================== */

function renderAppointmentCard(app,container){

    const card =
        document.createElement("div");

    card.className =
        "booksy-event-card";

    let color =
        "#b05c75";

    const isBlock = app.eventType === "block";
    const isWorkShift = app.eventType === "work_shift";

    const isExternal =
        app.eventType === "external" ||
        (app.phone === "Google Calendar" && !isBlock && !isWorkShift);

    if (isBlock) {
        color = "#8c6b4f";
        card.classList.add("booksy-block-card");
    }
    else if(isExternal){
        color = "#555555";
    }
    else if(isWorkShift){
        color = "#f2c94c";
        card.style.color = "#111";
        card.classList.add("booksy-work-shift-card");
    }
    else{

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

        if(
            service &&
            globalColors[
                service.category
            ]
        ){

            color =
                globalColors[
                    service.category
                ];

        }

    }

    card.style.background =
        color;

    if (isWorkShift) {
        card.innerHTML = `<strong>${app.name || "Brak"}</strong>`;
        card.onclick = null;
        card.style.cursor = "default";
    } else {
        card.innerHTML = `
            <strong>${app.name}</strong>
            <br>
            ${app.service}
            <br>
            ${app.date}
        `;
        card.onclick = () => openAppointmentDetailsModal(app);
    }

    container.appendChild(
        card
    );

}

/* ==========================================================
   APPOINTMENT AUTOCOMPLETE / DATALISTS
   ========================================================== */

function populateAppointmentDropdowns() {

    populateAppointmentDatalists();

}

function populateAppointmentDatalists() {

    populateClientNameDatalist();

    populateClientPhoneDatalist();

    populateServiceNameDatalist();

}

function populateClientNameDatalist() {

    const list =
        document.getElementById(
            "appointmentClientNameList"
        );

    if (!list) {
        return;
    }

    list.innerHTML = "";

    if (
        !customersData ||
        customersData.length === 0
    ) {
        return;
    }

    customersData.forEach(client => {

        if (!client.name) {
            return;
        }

        const option =
            document.createElement(
                "option"
            );

        option.value =
            client.name || "";

        option.label =
            client.phone || "";

        list.appendChild(
            option
        );

    });

}

function populateClientPhoneDatalist() {

    const list =
        document.getElementById(
            "appointmentClientPhoneList"
        );

    if (!list) {
        return;
    }

    list.innerHTML = "";

    if (
        !customersData ||
        customersData.length === 0
    ) {
        return;
    }

    customersData.forEach(client => {

        if (!client.phone) {
            return;
        }

        const option =
            document.createElement(
                "option"
            );

        option.value =
            client.phone || "";

        option.label =
            client.name || "";

        list.appendChild(
            option
        );

    });

}

function populateServiceNameDatalist() {

    const list =
        document.getElementById(
            "appointmentServiceNameList"
        );

    if (!list) {
        return;
    }

    list.innerHTML = "";

    if (
        !currentServices ||
        currentServices.length === 0
    ) {
        return;
    }

    currentServices.forEach(service => {

        if (!service.name) {
            return;
        }

        const option =
            document.createElement(
                "option"
            );

        option.value =
            service.name || "";

        option.label =
            (
                service.category || "Inne"
            ) +
            " / " +
            (
                service.duration || 45
            ) +
            " min / " +
            (
                service.price || 0
            ) +
            " zł";

        list.appendChild(
            option
        );

    });

}

function handleAppointmentNameInput() {

    const nameInput =
        document.getElementById(
            "appointmentName"
        );

    const phoneInput =
        document.getElementById(
            "appointmentPhone"
        );

    if (!nameInput || !phoneInput) {
        return;
    }

    const typedName =
        nameInput.value
            .trim()
            .toLowerCase();

    if (!typedName) {
        return;
    }

    const client =
        customersData.find(item => {
            return (
                item.name &&
                item.name
                    .toString()
                    .trim()
                    .toLowerCase() === typedName
            );
        });

    if (client) {
        phoneInput.value =
            client.phone || "";
    }

}

function handleAppointmentPhoneInput() {

    const nameInput =
        document.getElementById(
            "appointmentName"
        );

    const phoneInput =
        document.getElementById(
            "appointmentPhone"
        );

    if (!nameInput || !phoneInput) {
        return;
    }

    const typedPhone =
        phoneInput.value.trim();

    if (!typedPhone) {
        return;
    }

    const client =
        customersData.find(item => {
            return (
                item.phone &&
                item.phone
                    .toString()
                    .trim() === typedPhone
            );
        });

    if (client) {
        nameInput.value =
            client.name || "";
    }

}

function handleAppointmentServiceInput() {

    const serviceInput =
        document.getElementById(
            "appointmentService"
        );

    const durationInput =
        document.getElementById(
            "appointmentDuration"
        );

    if (!serviceInput || !durationInput) {
        return;
    }

    const typedService =
        serviceInput.value
            .trim()
            .toLowerCase();

    if (!typedService) {
        return;
    }

    const service =
        currentServices.find(item => {
            return (
                item.name &&
                item.name
                    .toString()
                    .trim()
                    .toLowerCase() === typedService
            );
        });

    if (service) {
        durationInput.value =
            service.duration || 45;
    }

}
/* ==========================================================
   CREATE APPOINTMENT
   ========================================================== */
async function saveAppointment() {

    if (isSavingAppointment) {
        return;
    }

    const name =
        document.getElementById(
            "appointmentName"
        ).value.trim();

    const phone =
        document.getElementById(
            "appointmentPhone"
        ).value.trim();

    const service =
        document.getElementById(
            "appointmentService"
        ).value.trim();

    const duration =
        Number(
            document.getElementById(
                "appointmentDuration"
            ).value
        ) || 45;

    const dateValue =
        document.getElementById(
            "appointmentDateTime"
        ).value;

    if (
        !name ||
        !phone ||
        !service ||
        !dateValue
    ) {
        alert(
            "Uzupełnij wszystkie pola wizyty."
        );
        return;
    }

    const saveBtn =
        document.getElementById(
            "saveAppointmentBtn"
        );

    isSavingAppointment = true;

    if (saveBtn) {
        saveBtn.disabled = true;
        saveBtn.innerText =
            currentEditingAppointment
                ? "Aktualizowanie..."
                : "Zapisywanie...";
    }

    const payload = {
        action:
        "createBooking",

        bookingSource:
        "ADMIN",

        phone:
        phone,

        name:
        name,

        service:
        service,

        date:
        dateValue,

        duration:
        duration,

        rodo:
        currentEditingAppointment
            ? "Edytowano z CRM"
            : "Dodano z CRM"
    };

    if (
        currentEditingAppointment
    ) {

        const oldEventId =
            currentEditingAppointment.eventId || "";

        if (
            !oldEventId
        ) {
            alert(
                "Nie można edytować wizyty, bo brakuje Event ID. Odśwież kalendarz i spróbuj ponownie."
            );

            isSavingAppointment = false;

            if (saveBtn) {
                saveBtn.disabled = false;
                saveBtn.innerText = "Zapisz wizytę";
            }

            return;
        }

        payload.editFlag =
            true;

        payload.oldEventId =
            oldEventId;

        payload.oldDate =
            currentEditingAppointment.date;

        payload.oldName =
            currentEditingAppointment.name;

    }

    try {

        const response =
            await fetch(
                APPS_SCRIPT_URL,
                {
                    method:
                    "POST",

                    headers: {
                        "Content-Type":
                        "text/plain"
                    },

                    body:
                    JSON.stringify(
                        payload
                    )
                }
            );

        const data =
            await response.json();

        if (
            data.success
        ) {

            alert(
                currentEditingAppointment
                    ? "Wizyta została zaktualizowana."
                    : "Wizyta została dodana."
            );

            currentEditingAppointment =
                null;

            closeCreateAppointmentModal();

            await loadSettings();

            renderDashboard();

            calculateFinanceReport();

        } else {

            alert(
                "Błąd zapisu wizyty: " +
                (
                    data.error ||
                    "Nieznany błąd"
                )
            );

        }

    } catch(error) {

        console.error(
            error
        );

        alert(
            "Błąd połączenia podczas zapisu wizyty."
        );

    } finally {

        isSavingAppointment = false;

        if (saveBtn) {
            saveBtn.disabled = false;
            saveBtn.innerText = "Zapisz wizytę";
        }

    }

}
function formatDateTimeLocalValue(dateString) {
    const date =
        new Date(dateString);

    if (
        !date ||
        isNaN(date.getTime())
    ) {
        return "";
    }

    const year =
        date.getFullYear();

    const month =
        String(
            date.getMonth() + 1
        ).padStart(2, "0");

    const day =
        String(
            date.getDate()
        ).padStart(2, "0");

    const hours =
        String(
            date.getHours()
        ).padStart(2, "0");

    const minutes =
        String(
            date.getMinutes()
        ).padStart(2, "0");

    return (
        year +
        "-" +
        month +
        "-" +
        day +
        "T" +
        hours +
        ":" +
        minutes
    );
}

function openEditAppointmentModal() {

    if (isDeletingAppointment) {
        return;
    }

    if (!currentEditingAppointment) {
        alert(
            "Nie wybrano wizyty do edycji."
        );
        return;
    }

    populateAppointmentDropdowns();

    document.getElementById(
        "modalTitleAppointment"
    ).innerText =
        "Edytuj wizytę";

    document.getElementById(
        "appointmentName"
    ).value =
        currentEditingAppointment.name || "";

    document.getElementById(
        "appointmentPhone"
    ).value =
        currentEditingAppointment.phone || "";

    document.getElementById(
        "appointmentService"
    ).value =
        currentEditingAppointment.service || "";

    document.getElementById(
        "appointmentDuration"
    ).value =
        currentEditingAppointment.duration || 45;

    document.getElementById(
        "appointmentDateTime"
    ).value =
        formatDateTimeLocalValue(
            currentEditingAppointment.date
        );

    closeAppointmentModal();

    document.getElementById(
        "appointmentModal"
    ).style.display =
        "flex";

}
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


function closeCreateAppointmentModal(){

    document.getElementById(
        "appointmentModal"
    ).style.display =
        "none";

}

/* ==========================================================
   DETAILS MODAL
   ========================================================== */

function openAppointmentDetailsModal(app){
    currentEditingAppointment = app;
    const isBlock = app.eventType === "block";
    const isExternal = app.eventType === "external";
    const isWorkShift = app.eventType === "work_shift";
    setText("appointmentDetailsTitle", isWorkShift ? "Szczegóły grafiku pracy" : (isBlock ? "Szczegóły blokady czasu" : (isExternal ? "Szczegóły wydarzenia zewnętrznego" : "Szczegóły rezerwacji")));
    setText("details-name-label", isWorkShift ? "Wpis grafiku:" : (isBlock ? "Nazwa blokady:" : "Klient:"));
    setText("details-service-label", isWorkShift ? "Rodzaj:" : (isBlock ? "Typ:" : "Zabieg:"));
    setText("details-name", app.name || "");
    setText("details-phone", app.phone || "");
    setText("details-service", app.service || "");
    setText("details-datetime", app.date || "");
    setText("details-duration", app.duration || 45);
    const phoneRow = document.getElementById("details-phone-row");
    if (phoneRow) phoneRow.style.display = (isBlock || isWorkShift) ? "none" : "block";
    const deleteBtn = document.getElementById("deleteAppointmentBtn");
    const editBtn = document.getElementById("editAppointmentBtn");
    if (deleteBtn) {
        deleteBtn.style.display = (isExternal || isWorkShift) ? "none" : "inline-block";
        deleteBtn.innerText = isBlock ? "Usuń blokadę 🗑️" : "Usuń wizytę 🗑️";
    }
    if (editBtn) editBtn.style.display = (isBlock || isExternal || isWorkShift) ? "none" : "inline-block";
    document.getElementById("appointmentDetailsModal").style.display = "flex";
}
function closeAppointmentModal(){

    document.getElementById(
        "appointmentDetailsModal"
    ).style.display =
        "none";

}


/* ==========================================================
   USUWANIE BLOKADY CZASU
   ========================================================== */
function deleteSelectedCalendarItemFromAdmin() {
    if (!currentEditingAppointment) return;
    if (currentEditingAppointment.eventType === "block") return deleteBlockTimeFromAdmin();
    deleteAppointmentFromAdmin();
}
async function deleteBlockTimeFromAdmin() {
    if (!currentEditingAppointment || currentEditingAppointment.eventType !== "block") return alert("Nie wybrano blokady czasu.");
    if (isDeletingAppointment || !confirm("Usunąć wybraną blokadę czasu?")) return;
    const block = currentEditingAppointment;
    const btn = document.getElementById("deleteAppointmentBtn");
    isDeletingAppointment = true;
    if (btn) { btn.disabled = true; btn.innerText = "Usuwanie blokady..."; }
    try {
        const response = await fetch(APPS_SCRIPT_URL, {
            method: "POST", headers: {"Content-Type":"text/plain"},
            body: JSON.stringify({action:"deleteBlockTime", eventId:block.eventId||"", start:block.date||"", end:block.endDate||"", title:block.name||""})
        });
        const data = await response.json();
        if (!data.success) throw new Error(data.error || "Nieznany błąd");
        appointmentsData = appointmentsData.filter(x => !(block.eventId && x.eventId === block.eventId));
        currentEditingAppointment = null;
        closeAppointmentModal();
        await loadSettings();
        alert("Blokada czasu została usunięta.");
    } catch(error) { console.error(error); alert("Błąd usuwania blokady czasu: " + (error.message || error)); }
    finally { isDeletingAppointment = false; if (btn) {btn.disabled=false;btn.innerText="Usuń blokadę 🗑️";} }
}

/* ==========================================================
   DELETE FIX
   ========================================================== */

async function deleteAppointmentFromAdmin() {

    if (
        !currentEditingAppointment
    ) {
        return;
    }

    if (
        isDeletingAppointment
    ) {
        return;
    }

    if (
        !confirm(
            "Usunąć wizytę?"
        )
    ) {
        return;
    }

    const deleteBtn =
        document.getElementById(
            "deleteAppointmentBtn"
        );
const editBtn =
    document.getElementById(
        "editAppointmentBtn"
    );
    isDeletingAppointment =
        true;

    if (
        deleteBtn
    ) {
        deleteBtn.disabled =
            true;

        deleteBtn.innerText =
            "Usuwanie...";
    }
if (
    editBtn
) {
    editBtn.disabled =
        true;

    editBtn.innerText =
        "Edycja zablokowana";
}
    const appointmentToDelete =
        currentEditingAppointment;

    try {

        const response =
            await fetch(
                APPS_SCRIPT_URL,
                {
                    method:
                    "POST",

                    headers: {
                        "Content-Type":
                        "text/plain"
                    },

                    body:
                    JSON.stringify({
                        action:
                        "createBooking",

                        deleteFlag:
                        true,

                        eventId:
                        appointmentToDelete.eventId || "",

                        date:
                        new Date(
                            appointmentToDelete.date
                        )
                        .toISOString(),

                        name:
                        appointmentToDelete.name
                    })
                }
            );

        const data =
            await response.json();

        if (
            data.success
        ) {

            const deletedEventId =
                appointmentToDelete.eventId || "";

            const deletedDate =
                appointmentToDelete.date || "";

            const deletedName =
                appointmentToDelete.name || "";

            appointmentsData =
                appointmentsData.filter(app => {

                    if (
                        deletedEventId &&
                        app.eventId === deletedEventId
                    ) {
                        return false;
                    }

                    if (
                        !deletedEventId &&
                        app.date === deletedDate &&
                        app.name === deletedName
                    ) {
                        return false;
                    }

                    return true;

                });

            currentEditingAppointment =
                null;

            closeAppointmentModal();

            closeCreateAppointmentModal();

            renderBooksyCalendar();

            renderDashboard();

            calculateFinanceReport();

            alert(
                "Wizyta usunięta."
            );

            await loadSettings();

            renderBooksyCalendar();

            renderDashboard();

            calculateFinanceReport();

        } else {

            alert(
                "Błąd usuwania wizyty: " +
                (
                    data.error ||
                    "Nieznany błąd"
                )
            );

        }

    } catch(error) {

        console.error(
            error
        );

        alert(
            "Błąd połączenia podczas usuwania wizyty."
        );

    } finally {

        isDeletingAppointment =
            false;

        if (
            deleteBtn
        ) {
            deleteBtn.disabled =
                false;

            deleteBtn.innerText =
                "Usuń wizytę 🗑️";
        }
if (
    editBtn
) {
    editBtn.disabled =
        false;

    editBtn.innerText =
        "Edytuj wizytę";
}
    }

}


/* ==========================================================
   BLOCK TIME
   ========================================================== */

function openBlockTimeModal() {

    const blockDateInput =
        document.getElementById(
            "block-date"
        );

    const blockTypeInput =
        document.getElementById(
            "block-type"
        );

    const blockStartInput =
        document.getElementById(
            "block-start-time"
        );

    const blockEndInput =
        document.getElementById(
            "block-end-time"
        );

    const blockTitleInput =
        document.getElementById(
            "block-title"
        );

    if (blockDateInput) {
        blockDateInput.value =
            getFormattedISOBlockDate(
                selectedCalendarDate
            );
    }

    if (blockTypeInput) {
        blockTypeInput.value =
            "hours";
    }

    if (blockStartInput) {
        blockStartInput.value =
            "09:00";
    }

    if (blockEndInput) {
        blockEndInput.value =
            "18:00";
    }

    if (blockTitleInput) {
        blockTitleInput.value =
            "Zablokowane";
    }

    toggleBlockTimeFields();

    document.getElementById(
        "blockTimeModal"
    ).style.display =
        "flex";

}


function closeBlockTimeModal() {

    document.getElementById(
        "blockTimeModal"
    ).style.display =
        "none";

}


function toggleBlockTimeFields() {

    const blockType =
        document.getElementById(
            "block-type"
        ).value;

    const group =
        document.getElementById(
            "block-hours-group"
        );

    if (!group) {
        return;
    }

    group.style.display =
        blockType === "hours"
            ? "block"
            : "none";

}


async function submitBlockTime() {
    if (isBlockingTime) {
        return;
    }

    const blockTypeInput =
        document.getElementById(
            "block-type"
        );

    const blockDateInput =
        document.getElementById(
            "block-date"
        );

    const blockStartInput =
        document.getElementById(
            "block-start-time"
        );

    const blockEndInput =
        document.getElementById(
            "block-end-time"
        );

    const blockTitleInput =
        document.getElementById(
            "block-title"
        );

    const blockType =
        blockTypeInput
            ? blockTypeInput.value
            : "hours";

    const blockDate =
        blockDateInput
            ? blockDateInput.value
            : "";

    const blockStart =
        blockStartInput
            ? blockStartInput.value
            : "09:00";

    const blockEnd =
        blockEndInput
            ? blockEndInput.value
            : "18:00";

    const blockTitle =
        blockTitleInput
            ? blockTitleInput.value.trim()
            : "Zablokowane";

    if (!blockDate) {
        alert(
            "Wybierz datę blokady."
        );
        return;
    }

    if (
        blockType === "hours" &&
        (
            !blockStart ||
            !blockEnd
        )
    ) {
        alert(
            "Wybierz godzinę rozpoczęcia i zakończenia."
        );
        return;
    }

    if (
        blockType === "hours" &&
        blockStart >= blockEnd
    ) {
        alert(
            "Godzina zakończenia musi być późniejsza niż godzina rozpoczęcia."
        );
        return;
    }

    const submitBtn =
        document.getElementById(
            "blockTimeSubmitBtn"
        );

    isBlockingTime = true;

    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerText = "Blokowanie...";
    }

    try {
        const response =
            await fetch(
                APPS_SCRIPT_URL,
                {
                    method:
                    "POST",
                    headers: {
                        "Content-Type":
                        "text/plain"
                    },
                    body:
                    JSON.stringify({
                        action:
                        "blockTime",
                        blockType:
                        blockType,
                        date:
                        blockDate,
                        startTime:
                        blockStart,
                        endTime:
                        blockEnd,
                        title:
                        blockTitle || "Zablokowane"
                    })
                }
            );

        const data =
            await response.json();

        if (data.success) {
            alert(
                "Czas został zablokowany."
            );

            closeBlockTimeModal();

            await loadSettings();

            renderBooksyCalendar();
            renderDashboard();
            calculateFinanceReport();
        } else {
            alert(
                "Błąd blokowania czasu: " +
                (
                    data.error ||
                    "Nieznany błąd"
                )
            );
        }
    } catch(error) {
        console.error(
            error
        );

        alert(
            "Błąd połączenia podczas blokowania czasu."
        );
    } finally {
        isBlockingTime = false;

        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerText = "Zablokuj czas 🔒";
        }
    }
}
/* ==========================================================
   CLIENTS
   CRM V2
   ========================================================== */

async function loadClients(){

    try{

        const response =
            await fetch(
                APPS_SCRIPT_URL +
                "?getClients=true"
            );

        customersData =
            await response.json();
        renderClients();
    }

    catch(error){

        console.error(
            "Clients error",
            error
        );

        customersData = [];

    }

}


function normalizeClientCounter(value) {
    if (typeof value === "number" && isFinite(value)) {
        return Math.max(0, Math.trunc(value));
    }

    if (typeof value === "string" && /^\d+$/.test(value.trim())) {
        return Math.max(0, parseInt(value.trim(), 10));
    }

    return 0;
}

function renderClients(){

    const tbody =
        document.getElementById(
            "clientsTableBody"
        );

    if(!tbody) return;

    tbody.innerHTML = "";

    if(
        !customersData ||
        customersData.length === 0
    ){

        tbody.innerHTML = `

            <tr>

                <td colspan="6"
                    style="text-align:center;">

                    Brak klientów

                </td>

            </tr>

        `;

        return;

    }

    customersData.forEach(client=>{

        const tr =
            document.createElement(
                "tr"
            );

        tr.innerHTML = `

            <td>
                ${client.name || ""}
            </td>

            <td>
                ${client.phone || ""}
            </td>

            <td>
                ${normalizeClientCounter(client.visits)}
            </td>

            <td>
                ${normalizeClientCounter(client.cancelled)}
            </td>

            <td>
                ${client.lastVisit || "-"}
            </td>

            <td>

                <button
                    class="btn-secondary"
                    onclick="editClient('${client.phone}')">

                    Edytuj

                </button>

                <button
                    class="btn-danger"
                    onclick="deleteClient('${client.phone}')">

                    Usuń

                </button>

            </td>

        `;

        tbody.appendChild(
            tr
        );

    });

}

/* ==========================================================
   CLIENT CRUD - MODAL
   ========================================================== */

function openAddClientModal() {

    document.getElementById(
        "clientModalTitle"
    ).innerText =
        "Dodaj klienta";

    document.getElementById(
        "editClientPhone"
    ).value =
        "";

    document.getElementById(
        "clientModalName"
    ).value =
        "";

    document.getElementById(
        "clientModalPhone"
    ).value =
        "";

    document.getElementById(
        "clientModalVisits"
    ).value =
        "0";

    document.getElementById(
        "clientModalCancelled"
    ).value =
        "0";

    document.getElementById(
        "clientModalLastVisit"
    ).value =
        "";

    document.getElementById(
        "clientModal"
    ).style.display =
        "flex";

}

function closeClientModal() {

    document.getElementById(
        "clientModal"
    ).style.display =
        "none";

}

function formatClientDateForInput(value) {

    if (!value) {
        return "";
    }

    const date =
        new Date(value);

    if (
        !date ||
        isNaN(date.getTime())
    ) {
        return "";
    }

    const year =
        date.getFullYear();

    const month =
        String(
            date.getMonth() + 1
        ).padStart(2, "0");

    const day =
        String(
            date.getDate()
        ).padStart(2, "0");

    return (
        year +
        "-" +
        month +
        "-" +
        day
    );

}

function editClient(phone) {

    const client =
        customersData.find(item => {
            return (
                item.phone &&
                item.phone.toString().trim() ===
                phone.toString().trim()
            );
        });

    if (!client) {
        alert(
            "Nie znaleziono klienta."
        );
        return;
    }

    document.getElementById(
        "clientModalTitle"
    ).innerText =
        "Edytuj klienta";

    document.getElementById(
        "editClientPhone"
    ).value =
        client.phone || "";

    document.getElementById(
        "clientModalName"
    ).value =
        client.name || "";

    document.getElementById(
        "clientModalPhone"
    ).value =
        client.phone || "";

    document.getElementById(
        "clientModalVisits"
    ).value =
        client.visits || 0;

    document.getElementById(
        "clientModalCancelled"
    ).value =
        client.cancelled || 0;

    document.getElementById(
        "clientModalLastVisit"
    ).value =
        formatClientDateForInput(
            client.lastVisit
        );

    document.getElementById(
        "clientModal"
    ).style.display =
        "flex";

}

function saveClientModalData() {

    const oldPhone =
        document.getElementById(
            "editClientPhone"
        ).value.trim();

    const name =
        document.getElementById(
            "clientModalName"
        ).value.trim();

    const phone =
        document.getElementById(
            "clientModalPhone"
        ).value.trim();

    const visits =
        Number(
            document.getElementById(
                "clientModalVisits"
            ).value
        ) || 0;

    const cancelled =
        Number(
            document.getElementById(
                "clientModalCancelled"
            ).value
        ) || 0;

    const lastVisit =
        document.getElementById(
            "clientModalLastVisit"
        ).value;

    if (!name || !phone) {
        alert(
            "Wpisz imię i telefon klienta."
        );
        return;
    }

    const clientData = {
        name:
        name,

        phone:
        phone,

        visits:
        visits,

        cancelled:
        cancelled,

        lastVisit:
        lastVisit
    };

    if (oldPhone) {

        const index =
            customersData.findIndex(item => {
                return (
                    item.phone &&
                    item.phone.toString().trim() ===
                    oldPhone
                );
            });

        if (index !== -1) {
            customersData[index] =
                clientData;
        } else {
            customersData.push(
                clientData
            );
        }

    } else {

        const alreadyExists =
            customersData.some(item => {
                return (
                    item.phone &&
                    item.phone.toString().trim() ===
                    phone
                );
            });

        if (alreadyExists) {
            alert(
                "Klient z takim telefonem już istnieje."
            );
            return;
        }

        customersData.push(
            clientData
        );

    }

    renderClients();

    closeClientModal();

   saveClientToCloud(clientData, oldPhone);

}
async function saveClientToCloud(clientData, oldPhone) {

    try {

        const response =
            await fetch(
                APPS_SCRIPT_URL,
                {
                    method:
                    "POST",

                    headers: {
                        "Content-Type":
                        "text/plain"
                    },

                    body:
                    JSON.stringify({
                        action:
                        "saveClient",

                        oldPhone:
                        oldPhone || "",

                        client:
                        clientData
                    })
                }
            );

        const data =
            await response.json();

        if (data.success) {

            alert(
                "Klient zapisany."
            );

            closeClientModal();

            await loadClients();

            renderDashboard();

        } else {

            alert(
                "Błąd zapisu klienta: " +
                (
                    data.error ||
                    "Nieznany błąd"
                )
            );

        }

    } catch(error) {

        console.error(
            error
        );

        alert(
            "Błąd połączenia podczas zapisu klienta."
        );

    }

}
async function deleteClient(phone) {

    if (
        !confirm(
            "Usunąć klienta?"
        )
    ) {
        return;
    }

    try {

        const response =
            await fetch(
                APPS_SCRIPT_URL,
                {
                    method:
                    "POST",

                    headers: {
                        "Content-Type":
                        "text/plain"
                    },

                    body:
                    JSON.stringify({
                        action:
                        "deleteClient",

                        phone:
                        phone
                    })
                }
            );

        const data =
            await response.json();

        if (data.success) {

            alert(
                "Klient usunięty."
            );

            await loadClients();

            renderDashboard();

        } else {

            alert(
                "Błąd usuwania klienta: " +
                (
                    data.error ||
                    "Nieznany błąd"
                )
            );

        }

    } catch(error) {

        console.error(
            error
        );

        alert(
            "Błąd połączenia podczas usuwania klienta."
        );

    }

}


/* ==========================================================
   FINANCE
   ========================================================== */

function calculateFinanceReport(){

    let todaySum = 0;

    let weekSum = 0;

    let monthSum = 0;

    const now =
        new Date();


    const firstDayOfWeek =
        new Date(now);

    const currentDay =
        now.getDay();

    const offset =
        currentDay === 0
        ? 6
        : currentDay - 1;

    firstDayOfWeek.setDate(
        now.getDate() - offset
    );

    firstDayOfWeek.setHours(
        0,0,0,0
    );

    const lastDayOfWeek =
        new Date(
            firstDayOfWeek
        );

    lastDayOfWeek.setDate(
        firstDayOfWeek.getDate()
        + 6
    );

    lastDayOfWeek.setHours(
        23,59,59,999
    );


    appointmentsData.forEach(app=>{

        if(
            !app.date ||
            !app.service
        ){
            return;
        }

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

        const appDate =
            new Date(app.date);

        if(
            appDate.toDateString()
            ===
            now.toDateString()
        ){

            todaySum += price;

        }

        if(
            appDate >= firstDayOfWeek &&
            appDate <= lastDayOfWeek
        ){

            weekSum += price;

        }

        if(
            appDate.getMonth()
            ===
            now.getMonth()
            &&
            appDate.getFullYear()
            ===
            now.getFullYear()
        ){

            monthSum += price;

        }

    });


    setText(
        "finance-today",
        todaySum.toFixed(2)
        + " zł"
    );

    setText(
        "finance-week",
        weekSum.toFixed(2)
        + " zł"
    );

    setText(
        "finance-month",
        monthSum.toFixed(2)
        + " zł"
    );

}


/* ==========================================================
   CATEGORY COLOR SYSTEM
   ========================================================== */

function buildColorsEditor(){

    const container =
        document.getElementById(
            "categories-colors-list"
        );

    if(!container) return;

    container.innerHTML = "";

    allCategories.forEach(cat=>{

        const row =
            document.createElement(
                "div"
            );

        row.className =
            "category-color-row";

        const color =
            globalColors[cat]
            ||
            "#b05c75";

        row.innerHTML = `

            <label>

                ${cat}

            </label>

            <input
                type="color"
                data-category="${cat}"
                value="${color}">

        `;

        container.appendChild(
            row
        );

    });

}

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

function populateSettingsForm() {
    setInputValue(
        "work_start_hour",
        settingsData.work_start_hour || "09:00"
    );

    setInputValue(
        "work_end_hour",
        settingsData.work_end_hour || "18:00"
    );

    setInputValue(
        "buffer_hours",
        settingsData.buffer_hours !== undefined
            ? settingsData.buffer_hours
            : 1
    );

    setInputValue(
        "slot_interval_minutes",
        settingsData.slot_interval_minutes !== undefined
            ? settingsData.slot_interval_minutes
            : 45
    );

    setInputValue(
        "start_offset_minutes",
        settingsData.start_offset_minutes !== undefined
            ? settingsData.start_offset_minutes
            : 0
    );

    setInputValue(
        "cleanup_buffer_minutes",
        settingsData.cleanup_buffer_minutes !== undefined
            ? settingsData.cleanup_buffer_minutes
            : 0
    );

    setInputValue(
        "schedule_cycle",
        settingsData.schedule_cycle || "4x4"
    );
}
/* ==========================================================
   SAVE SETTINGS
   ========================================================== */

async function saveSettings(){

    const categoryColors =
        {};

    document
        .querySelectorAll(
            "#categories-colors-list input[type='color']"
        )
        .forEach(input=>{

            categoryColors[
                input.dataset.category
            ] =
            input.value;

        });

    try{

        await fetch(
            APPS_SCRIPT_URL,
            {
                method:"POST",

                headers:{
                    "Content-Type":
                    "text/plain"
                },

                body:
                JSON.stringify({

                    action:
                    "updateSettings",

                   payload: {
    work_start_hour:
        document.getElementById(
            "work_start_hour"
        ).value,

    work_end_hour:
        document.getElementById(
            "work_end_hour"
        ).value,

    buffer_hours:
        document.getElementById("buffer_hours")
            ? Math.max(0, Number(document.getElementById("buffer_hours").value) || 0)
            : 1,

    slot_interval_minutes:
        Math.max(5, Number(document.getElementById("slot_interval_minutes").value) || 45),

    start_offset_minutes:
        Math.max(0, Number(document.getElementById("start_offset_minutes").value) || 0),

    cleanup_buffer_minutes:
        Math.max(0, Number(document.getElementById("cleanup_buffer_minutes").value) || 0),

    schedule_cycle:
        document.getElementById("schedule_cycle").value.trim() || "4x4",

    colors:
        categoryColors

                    }

                })

            }
        );

        alert(
            "Ustawienia zapisane"
        );

        await loadSettings();

    }

    catch(error){

        console.error(
            error
        );

        alert(
            "Błąd zapisu"
        );

    }

}


/* ==========================================================
   DASHBOARD AUTO REFRESH
   ========================================================== */

setInterval(()=>{

    renderDashboard();

},30000);


/* ==========================================================
   LOAD SYSTEM EXTENSION
   ========================================================== */
async function loadSystem() {

    await loadServices();

    await loadSettings();

    await loadClients();

    renderDashboard();

    calculateFinanceReport();

    buildColorsEditor();

}

/* ==========================================================
   GOOGLE LOGIN CALLBACK
   ========================================================== */

function handleCredentialResponse(response){

    console.log(
        response
    );

}

/* ==========================================================
   CENNIK - ADD / EDIT SERVICE
   ========================================================== */

function openAddServiceModal() {
    document.getElementById("editServiceIndex").value = "-1";
    document.getElementById("serviceModalTitle").innerText = "Dodaj usługę";

    document.getElementById("serviceCategory").value = "";
    document.getElementById("serviceName").value = "";
    document.getElementById("servicePrice").value = "";
    document.getElementById("serviceDuration").value = "60";
    document.getElementById("serviceStatus").value = "Szkic";

    document.getElementById("serviceModal").style.display = "flex";
}

function closeServiceModal() {
    document.getElementById("serviceModal").style.display = "none";
}

function editService(index) {
    const service = currentServices[index];

    if (!service) {
        alert("Nie znaleziono usługi do edycji.");
        return;
    }

    document.getElementById("editServiceIndex").value = index;
    document.getElementById("serviceModalTitle").innerText = "Edytuj usługę";

    document.getElementById("serviceCategory").value = service.category || "";
    document.getElementById("serviceName").value = service.name || "";
    document.getElementById("servicePrice").value = service.price || "";
    document.getElementById("serviceDuration").value = service.duration || 60;
    document.getElementById("serviceStatus").value = service.status || "Szkic";

    document.getElementById("serviceModal").style.display = "flex";
}

function saveServiceModalData() {
    const index = parseInt(
        document.getElementById("editServiceIndex").value,
        10
    );

    const serviceData = {
        category: document.getElementById("serviceCategory").value.trim(),
        name: document.getElementById("serviceName").value.trim(),
        price: Number(document.getElementById("servicePrice").value) || 0,
        duration: Number(document.getElementById("serviceDuration").value) || 60,
        showPrice: "Tak",
        showDuration: "Tak",
        status: document.getElementById("serviceStatus").value || "Szkic"
    };

    if (!serviceData.category || !serviceData.name) {
        alert("Wpisz kategorię i nazwę usługi.");
        return;
    }

    if (index >= 0) {
        currentServices[index] = serviceData;
    } else {
        currentServices.push(serviceData);
    }

    renderServicesTable();
    syncCategoryColorsAndRefresh().catch(console.error);
    buildColorsEditor();
    closeServiceModal();

    alert("Usługa zapisana lokalnie. Następny krok: zapis szkicu do arkusza.");
}

/* ==========================================================
   CENNIK - CATEGORY MANAGEMENT
   ========================================================== */

function getUniqueServiceCategories() {
    const categories = [];

    currentServices.forEach(service => {
        const category =
            service.category
                ? service.category.trim()
                : "";

        if (
            category &&
            !categories.includes(category)
        ) {
            categories.push(category);
        }
    });

    return categories.sort();
}

function openCategoryModal() {
    renderCategoryModalList();
    document.getElementById("categoryModal").style.display = "flex";
}

function closeCategoryModal() {
    document.getElementById("categoryModal").style.display = "none";
}

function renderCategoryModalList() {
    const select =
        document.getElementById("categorySelectForEdit");

    if (!select) {
        return;
    }

    select.innerHTML = "";

    const categories =
        getUniqueServiceCategories();

    if (categories.length === 0) {
        const option =
            document.createElement("option");

        option.value = "";
        option.textContent = "Brak kategorii";

        select.appendChild(option);
        return;
    }

    categories.forEach(category => {
        const option =
            document.createElement("option");

        option.value = category;
        option.textContent = category;

        select.appendChild(option);
    });
}

function addNewCategoryFromModal() {
    const input =
        document.getElementById("categoryCreateName");

    const newCategory =
        input.value.trim();

    if (!newCategory) {
        alert("Wpisz nazwę nowej kategorii.");
        return;
    }

    const categories =
        getUniqueServiceCategories();

    if (categories.includes(newCategory)) {
        alert("Taka kategoria już istnieje.");
        return;
    }

    currentServices.push({
        category: newCategory,
        name: "Nowa usługa",
        price: 0,
        duration: 60,
        showPrice: "Tak",
        showDuration: "Tak",
        status: "Szkic"
    });

    input.value = "";

    renderServicesTable();
    renderCategoryModalList();
    buildColorsEditor();

    alert(
        "Kategoria została dodana lokalnie.\n\n" +
        "Kliknij „Zapisz szkic”, a potem „Publikuj”, żeby zapisać zmiany."
    );
}

function renameCategoryFromModal() {
    const select =
        document.getElementById("categorySelectForEdit");

    const input =
        document.getElementById("categoryNewName");

    const oldCategory =
        select.value;

    const newCategory =
        input.value.trim();

    if (!oldCategory) {
        alert("Wybierz kategorię.");
        return;
    }

    if (!newCategory) {
        alert("Wpisz nową nazwę kategorii.");
        return;
    }

    currentServices.forEach(service => {
        if (service.category === oldCategory) {
            service.category = newCategory;
        }
    });

    input.value = "";

    renderServicesTable();
    renderCategoryModalList();
    buildColorsEditor();

    alert(
        "Nazwa kategorii została zmieniona lokalnie.\n\n" +
        "Kliknij „Zapisz szkic”, a potem „Publikuj”, żeby zapisać zmiany."
    );
}

function deleteCategoryFromModal() {
    const select =
        document.getElementById("categorySelectForEdit");

    const category =
        select.value;

    if (!category) {
        alert("Wybierz kategorię.");
        return;
    }

    const servicesInCategory =
        currentServices.filter(service => {
            return service.category === category;
        });

    if (servicesInCategory.length > 0) {
        const confirmDelete =
            confirm(
                "Ta kategoria zawiera " +
                servicesInCategory.length +
                " usług.\n\n" +
                "Usunięcie kategorii usunie też wszystkie usługi w tej kategorii.\n\n" +
                "Kontynuować?"
            );

        if (!confirmDelete) {
            return;
        }
    }

    currentServices =
        currentServices.filter(service => {
            return service.category !== category;
        });

    renderServicesTable();
    renderCategoryModalList();
    buildColorsEditor();

    alert(
        "Kategoria została usunięta lokalnie.\n\n" +
        "Kliknij „Zapisz szkic”, a potem „Publikuj”, żeby zapisać zmiany."
    );
}
/* ==========================================================
   CENNIK - SAVE DRAFT / PUBLISH
   ========================================================== */

async function saveDraftsToCloud() {
    try {
        if (!currentServices || currentServices.length === 0) {
            alert("Brak usług do zapisania.");
            return;
        }

        const response = await fetch(
            APPS_SCRIPT_URL,
            {
                method: "POST",
                headers: {
                    "Content-Type": "text/plain"
                },
                body: JSON.stringify({
                    action: "saveDraftPrices",
                    prices: currentServices
                })
            }
        );

        const data = await response.json();

        if (data.success) {
            alert("Szkic cennika zapisany.");
            await loadServices();
        } else {
            alert(
                "Błąd zapisu szkicu: " +
                (data.error || "Nieznany błąd")
            );
        }
    } catch (error) {
        console.error(error);
        alert("Błąd połączenia podczas zapisu szkicu.");
    }
}

async function publishDrafts() {
    if (!confirm("Opublikować aktualny szkic cennika na stronie klienta?")) {
        return;
    }

    try {
        const response = await fetch(
            APPS_SCRIPT_URL,
            {
                method: "POST",
                headers: {
                    "Content-Type": "text/plain"
                },
                body: JSON.stringify({
                    action: "publishDraftToPublic"
                })
            }
        );

        const data = await response.json();

        if (data.success) {
            alert("Cennik opublikowany.");
            await loadServices();
        } else {
            alert(
                "Błąd publikacji: " +
                (data.error || "Nieznany błąd")
            );
        }
    } catch (error) {
        console.error(error);
        alert("Błąd połączenia podczas publikacji.");
    }
}
function deleteService(index) {
    const service = currentServices[index];

    if (!service) {
        alert("Nie znaleziono usługi do usunięcia.");
        return;
    }

    const confirmDelete = confirm(
        "Usunąć usługę?\n\n" +
        (service.name || "Bez nazwy")
    );

    if (!confirmDelete) {
        return;
    }

    currentServices.splice(index, 1);

    renderServicesTable();
    buildColorsEditor();

    alert(
        "Usługa usunięta lokalnie.\n\n" +
        "Kliknij teraz „Zapisz szkic”, a potem „Publikuj”, żeby usunąć ją z arkusza i strony klienta."
    );
}
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

async function crmExtendedPost(action, payload) {
    return crmTestPost(Object.assign({ action: action }, payload || {}));
}

async function initializeExtendedCRM() {
    const response = await crmExtendedPost("initializeCRMExtensions");
    if (!response || !response.success) {
        throw new Error(response && response.error ? response.error : "Nie udało się przygotować modułów CRM");
    }
    return response;
}

async function loadClientCRMProfile(phone) {
    const response = await crmExtendedPost("getClientCRMProfile", { phone: phone });
    if (!response || !response.success) {
        throw new Error(response && response.error ? response.error : "Nie udało się pobrać profilu klienta");
    }
    return response.profile;
}

async function saveClientBookingMode(phone, mode, reason) {
    const response = await crmExtendedPost("setClientBookingMode", {
        phone: phone,
        mode: mode,
        reason: reason || "",
        changedBy: "MISTRZYNI"
    });
    if (!response || !response.success) {
        throw new Error(response && response.error ? response.error : "Nie udało się zmienić trybu rezerwacji");
    }
    await loadClients();
    return response;
}

async function recordAppointmentLifecycle(options) {
    const response = await crmExtendedPost("recordAppointmentLifecycle", options || {});
    if (!response || !response.success) {
        throw new Error(response && response.error ? response.error : "Nie udało się zapisać historii wizyty");
    }
    await loadSystem();
    return response;
}

async function cancelAppointmentWithHistory(initiator, reason) {
    if (!currentEditingAppointment) return;
    if (!confirm("Anulować wizytę i zapisać zdarzenie w historii?")) return;
    try {
        await recordAppointmentLifecycle({
            operation: "ANULOWANIE",
            eventId: currentEditingAppointment.eventId || "",
            phone: currentEditingAppointment.phone || "",
            clientName: currentEditingAppointment.name || "",
            service: currentEditingAppointment.service || "",
            oldDate: currentEditingAppointment.date || "",
            initiator: initiator || "MISTRZYNI",
            reason: reason || "",
            deleteCalendarEvent: true
        });
        closeAppointmentModal();
        alert("Wizyta została anulowana, a zdarzenie zapisane w historii.");
    } catch (error) {
        alert("Błąd anulowania wizyty: " + (error.message || error));
    }
}

async function completeCurrentAppointment() {
    if (!currentEditingAppointment) return;
    try {
        await recordAppointmentLifecycle({
            operation: "ZREALIZOWANA",
            eventId: currentEditingAppointment.eventId || "",
            phone: currentEditingAppointment.phone || "",
            clientName: currentEditingAppointment.name || "",
            service: currentEditingAppointment.service || "",
            oldDate: currentEditingAppointment.date || "",
            initiator: "MISTRZYNI"
        });
        closeAppointmentModal();
        alert("Wizyta została oznaczona jako zrealizowana.");
    } catch (error) {
        alert("Błąd zmiany statusu: " + (error.message || error));
    }
}

async function markCurrentAppointmentNoShow() {
    if (!currentEditingAppointment) return;
    try {
        await recordAppointmentLifecycle({
            operation: "NIEOBECNOSC",
            eventId: currentEditingAppointment.eventId || "",
            phone: currentEditingAppointment.phone || "",
            clientName: currentEditingAppointment.name || "",
            service: currentEditingAppointment.service || "",
            oldDate: currentEditingAppointment.date || "",
            initiator: "KLIENT"
        });
        closeAppointmentModal();
        alert("Nieobecność została zapisana.");
    } catch (error) {
        alert("Błąd zapisu nieobecności: " + (error.message || error));
    }
}

async function getSmartNextVisitSuggestion(phone, service, baseDate, preference) {
    const response = await crmExtendedPost("getSmartNextVisit", {
        phone: phone,
        service: service,
        baseDate: baseDate || new Date().toISOString(),
        preference: preference || "REKOMENDOWANY"
    });
    if (!response || !response.success) {
        throw new Error(response && response.error ? response.error : "Nie udało się wyznaczyć kolejnej wizyty");
    }
    return response;
}

async function planNextVisitFromCurrentAppointment() {
    if (!currentEditingAppointment) return;
    try {
        const suggestion = await getSmartNextVisitSuggestion(
            currentEditingAppointment.phone,
            currentEditingAppointment.service,
            currentEditingAppointment.date,
            "REKOMENDOWANY"
        );
        const hours = (suggestion.availableSlots || []).slice(0, 6).join(", ");
        alert(
            "Rekomendowana data: " + suggestion.recommendedDate + "\n" +
            "Dostępne godziny: " + (hours || "brak automatycznych propozycji") + "\n\n" +
            "Termin można zmienić ręcznie w formularzu wizyty."
        );
    } catch (error) {
        alert("Błąd planowania kolejnej wizyty: " + (error.message || error));
    }
}

async function saveFamilyScheduleEntry(entry) {
    const response = await crmExtendedPost("saveFamilySchedule", { entry: entry || {} });
    if (!response || !response.success) {
        throw new Error(response && response.error ? response.error : "Nie udało się zapisać grafiku rodzinnego");
    }
    return response;
}

async function loadFamilySchedule(fromDate, toDate) {
    const response = await crmExtendedPost("getFamilySchedule", {
        fromDate: fromDate || "",
        toDate: toDate || ""
    });
    if (!response || !response.success) {
        throw new Error(response && response.error ? response.error : "Nie udało się pobrać grafiku rodzinnego");
    }
    return response.entries || [];
}

function ensureAppointmentLifecycleButtons() {
    const modal = document.getElementById("appointmentDetailsModal");
    if (!modal || document.getElementById("crm-lifecycle-actions")) return;
    const content = modal.querySelector(".modal-content") || modal;
    const box = document.createElement("div");
    box.id = "crm-lifecycle-actions";
    box.style.cssText = "display:flex;flex-wrap:wrap;gap:8px;margin-top:14px;padding-top:12px;border-top:1px solid #eadfd5;";
    box.innerHTML = `
        <button type="button" class="btn-secondary" onclick="completeCurrentAppointment()">Oznacz jako zrealizowaną</button>
        <button type="button" class="btn-secondary" onclick="markCurrentAppointmentNoShow()">Nieobecność</button>
        <button type="button" class="btn-secondary" onclick="cancelAppointmentWithHistory('KLIENT', '')">Anuluj przez klienta</button>
        <button type="button" class="btn-secondary" onclick="cancelAppointmentWithHistory('MISTRZYNI', '')">Anuluj przez salon</button>
        <button type="button" class="btn-primary" onclick="planNextVisitFromCurrentAppointment()">Zaplanuj następny wizyt</button>
    `;
    content.appendChild(box);
}

document.addEventListener("DOMContentLoaded", function () {
    ensureAppointmentLifecycleButtons();
    initializeExtendedCRM().catch(error => console.error("Inicjalizacja rozszerzonego CRM:", error));
});

/* ==========================================================
   KONIEC DUZEGO PAKIETU CRM 3.3E-3.3H
   ========================================================== */


/* ==========================================================
   ROZSZERZENIE: KATEGORIE, GRAFIK 4X4, KOREKTY I IMPORT
   ========================================================== */
async function syncCategoryColorsAndRefresh() {
    const response = await crmExtendedPost("syncCategoryColors", { categories: getUniqueServiceCategories() });
    if (!response.success) throw new Error(response.error || "Błąd synchronizacji kategorii");
    globalColors = Object.assign({}, globalColors, response.colors || {});
    buildColorsEditor();
    renderBooksyCalendar();
    return response;
}
async function saveScheduleCorrectionFromPanel() {
    const entry = {
        date: document.getElementById("sch-date").value,
        dayType: document.getElementById("sch-type").value,
        husbandShift: document.getElementById("sch-shift").value,
        availableFrom: document.getElementById("sch-from").value,
        availableTo: document.getElementById("sch-to").value,
        fullDayBlocked: false,
        reason: document.getElementById("sch-reason").value,
        source: "RECZNA_KOREKTA"
    };
    const response = await crmExtendedPost("saveScheduleCorrection", { entry });
    if (!response.success) throw new Error(response.error || "Błąd korekty");
    alert("Ręczna korekta została zapisana. Nie zostanie nadpisana przez oficjalny grafik.");
    await refreshSchedulePanel();
    await renderWorkScheduleCalendar();
}

async function generateSchedule4x4FromPanel() {
    const response = await crmExtendedPost("generateSchedule4x4", {
        year: Number(document.getElementById("sch-year").value),
        startDate: document.getElementById("sch-start").value
    });
    if (!response.success) throw new Error(response.error || "Błąd generowania");
    alert("Prognoza 4×4 utworzona: 1, 1, 2, 2, W, W, W, W.");
    await refreshSchedulePanel();
    await renderWorkScheduleCalendar();
}

async function refreshSchedulePanel() {
    const output = document.getElementById("sch-output");
    const month = document.getElementById("sch-month");
    if (!output || !month) return;
    const response = await crmExtendedPost("getEffectiveSchedule", { month: month.value });
    if (!response.success) throw new Error(response.error || "Błąd odczytu grafiku");
    output.innerHTML = response.entries.map(item =>
        `<div style="padding:6px;border-bottom:1px solid #ddd"><strong>${item.date}</strong> | ${item.code || item.dayType} | źródło: ${item.source} | ${item.reason || ""}</div>`
    ).join("") || "Brak wpisów";
}

async function checkScheduleDriveFolderNow() {
    const button = document.getElementById("sch-check-folder-btn");
    const status = document.getElementById("sch-folder-status");
    if (button) button.disabled = true;
    if (status) status.textContent = "Sprawdzanie folderu...";
    try {
        const response = await crmExtendedPost("checkScheduleDriveFolder", { manual: true });
        if (!response.success) throw new Error(response.error || "Błąd sprawdzania folderu");
        if (status) status.textContent = `Ostatnie sprawdzenie: ${response.checkedAt}. Nowe: ${response.newFiles}, zmienione: ${response.changedFiles}, bez zmian: ${response.unchangedFiles}.`;
        await refreshSchedulePanel();
        await renderWorkScheduleCalendar();
    } finally {
        if (button) button.disabled = false;
    }
}

async function installScheduleFolderTriggers() {
    const response = await crmExtendedPost("installScheduleFolderTriggers");
    if (!response.success) throw new Error(response.error || "Błąd instalacji harmonogramu");
    alert("Kontrola folderu została ustawiona: poniedziałek, czwartek i ostatni dzień miesiąca.");
}

async function synchronizeWorkScheduleWithGoogleCalendar() {
    const month = document.getElementById("sch-month").value;
    const response = await crmExtendedPost("syncWorkScheduleToGoogleCalendar", { month });
    if (!response.success) throw new Error(response.error || "Błąd synchronizacji Google Calendar");
    alert(`Zaktualizowano oznaczenia Google Calendar: ${response.created} utworzono, ${response.removed} usunięto.`);
}

function scheduleCodeColor(code) {
    const value = String(code || "W").toUpperCase();
    if (value === "1") return { bg: "#fff200", fg: "#111" };
    if (value === "2") return { bg: "#8bc34a", fg: "#111" };
    if (["UW", "OP", "BHP"].includes(value)) return { bg: "#82b1d8", fg: "#111" };
    if (["SW", "ŚW"].includes(value)) return { bg: "#ef5350", fg: "#fff" };
    return { bg: "#fff", fg: "#111" };
}

async function renderWorkScheduleCalendar() {
    const host = document.getElementById("work-schedule-calendar");
    if (!host) return;
    const year = selectedCalendarDate.getFullYear();
    const monthIndex = selectedCalendarDate.getMonth();
    const monthKey = `${year}-${String(monthIndex + 1).padStart(2, "0")}`;
    const response = await crmExtendedPost("getEffectiveSchedule", { month: monthKey });
    if (!response.success) {
        host.textContent = response.error || "Nie udało się pobrać grafiku.";
        return;
    }
    const byDate = {};
    response.entries.forEach(item => { byDate[item.date] = item; });
    const names = ["Pon", "Wt", "Śr", "Czw", "Pt", "Sob", "Niedz"];
    const monthName = new Date(year, monthIndex, 1).toLocaleDateString("pl-PL", { month: "long", year: "numeric" });
    let html = `<h3 style="margin:0 0 12px">${monthName}</h3><div class="work-schedule-grid" style="display:grid;grid-template-columns:repeat(7,minmax(70px,1fr));gap:5px">`;
    names.forEach(name => { html += `<div style="font-weight:700;text-align:center;padding:5px">${name}</div>`; });
    const first = new Date(year, monthIndex, 1);
    const leading = first.getDay() === 0 ? 6 : first.getDay() - 1;
    for (let i = 0; i < leading; i++) html += "<div></div>";
    const days = new Date(year, monthIndex + 1, 0).getDate();
    for (let day = 1; day <= days; day++) {
        const dateKey = `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        const entry = byDate[dateKey] || {};
        const code = entry.code || "";
        const color = scheduleCodeColor(code);
        const title = entry.source ? `Kod: ${code}; źródło: ${entry.source}; ${entry.reason || ""}` : "Brak danych";
        html += `<button type="button" title="${title.replace(/"/g, "&quot;")}" style="min-height:58px;border:1px solid #d8cec6;border-radius:7px;background:${color.bg};color:${color.fg};cursor:pointer"><span style="display:block;font-size:12px">${day}</span><strong style="font-size:17px">${code}</strong></button>`;
    }
    host.innerHTML = html + "</div><p style=\"font-size:12px;color:#666\">1 = zmiana dzienna, 2 = zmiana nocna. Grafik ma charakter informacyjny i sam nie blokuje wizyt.</p>";
}

function ensureScheduleCalendarUnderMainCalendar() {
    if (document.getElementById("work-schedule-calendar")) return;
    const grid = document.getElementById("booksy-grid");
    if (!grid || !grid.parentNode) return;
    const host = document.createElement("section");
    host.id = "work-schedule-calendar";
    host.style.cssText = "margin-top:22px;padding:18px;border:1px solid #e3d8cf;border-radius:12px;background:#fff";
    grid.parentNode.insertBefore(host, grid.nextSibling);
}

function ensureSchedulePanel() {
    const tab = document.getElementById("tab-ustawienia");
    if (!tab || document.getElementById("schedule-full-panel")) return;
    const now = new Date();
    const panel = document.createElement("section");
    panel.id = "schedule-full-panel";
    panel.style.cssText = "margin-top:30px;padding:18px;border:2px solid #c2a383;border-radius:12px;background:#fffaf6";
    panel.innerHTML = `<h2 style="margin-top:0">Grafik pracy</h2>
      <details><summary style="cursor:pointer;font-weight:700">Prognoza 4×4</summary><p>Schemat stały: 1, 1, 2, 2, W, W, W, W. Wskaż pierwszy dzień zmiany dziennej.</p><input id="sch-year" type="number" value="${now.getFullYear()}"><input id="sch-start" type="date"><button type="button" class="btn-primary" onclick="generateSchedule4x4FromPanel()">Generuj prognozę</button></details>
      <details><summary style="cursor:pointer;font-weight:700">Ręczna korekta dnia</summary><input id="sch-date" type="date"><select id="sch-type"><option value="WOLNE">Dzień wolny</option><option value="PRACA">Dzień pracy</option><option value="UW">Urlop wypoczynkowy</option><option value="OP">Opieka nad dzieckiem</option><option value="BHP">BHP</option><option value="SW">Dzień świąteczny</option></select><select id="sch-shift"><option value="WOLNE">Wolne</option><option value="1">1</option><option value="2">2</option><option value="BHP">BHP</option></select><input id="sch-from" type="time" step="300"><input id="sch-to" type="time" step="300"><input id="sch-reason" placeholder="Powód korekty"><button type="button" class="btn-primary" onclick="saveScheduleCorrectionFromPanel()">Zapisz korektę</button></details>
      <details open><summary style="cursor:pointer;font-weight:700">Oficjalny grafik z Google Drive</summary><p>Folder: Grafik. Nazwa pliku: RRRR-MM. Pracownik: Oleksandr Strelnkov.</p><button id="sch-check-folder-btn" type="button" class="btn-primary" onclick="checkScheduleDriveFolderNow()">Sprawdź folder teraz</button><button type="button" class="btn-secondary" onclick="installScheduleFolderTriggers()">Ustaw kontrolę automatyczną</button><button type="button" class="btn-secondary" onclick="synchronizeWorkScheduleWithGoogleCalendar()">Synchronizuj z Google Calendar</button><p id="sch-folder-status">Automatycznie: poniedziałek, czwartek i ostatni dzień miesiąca. OCR tylko dla nowego lub zmienionego pliku.</p></details>
      <details><summary style="cursor:pointer;font-weight:700">Podgląd danych i historii</summary><input id="sch-month" type="month" value="${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}" onchange="refreshSchedulePanel()"><button type="button" class="btn-secondary" onclick="refreshSchedulePanel()">Odśwież</button><div id="sch-output"></div></details>`;
    tab.insertBefore(panel, document.getElementById("crm-diagnostics-panel") || null);
}

document.addEventListener("DOMContentLoaded", () => {
    const dt = document.getElementById("appointmentDateTime");
    if (dt) dt.step = "300";
    ensureSchedulePanel();
    ensureScheduleCalendarUnderMainCalendar();
    syncCategoryColorsAndRefresh().catch(console.error);
    refreshSchedulePanel().catch(console.error);
    renderWorkScheduleCalendar().catch(console.error);
});

/* KONIEC ROZSZERZENIA GRAFIKU I KATEGORII */


/* ==========================================================
   ETAP 3.4 I 3.5: SYNCHRONIZACJA, TESTY I BACKUP ADMIN
   ========================================================== */
async function loadCalendarSyncHistory() {
    const response=await crmExtendedPost("getCalendarSyncHistory",{limit:30});
    if(!response.success)throw new Error(response.error||"Błąd historii synchronizacji");
    return response.entries||[];
}
async function runPoint35Diagnostics() {
    const response=await crmExtendedPost("runPoint35Diagnostics");
    if(!response.success)throw new Error(response.error||"Diagnostyka 3.5 zakończona błędem");
    return response;
}
async function createFinalAdminBackup() {
    const response=await crmExtendedPost("createFinalAdminBackup",{description:"Finalny backup po etapach 3.4 i 3.5"});
    if(!response.success)throw new Error(response.error||"Nie udało się utworzyć backupu");
    alert("Backup ADMIN zapisany: "+response.version);
    return response;
}
/* KONIEC ETAPU 3.4 I 3.5 */


/* ==========================================================
   PAKIET POPRAWEK PO ZYWYM TESCIE ADMIN
   ========================================================== */
let crmUiOperationLock = false;

function crmEnsureUiLayer() {
    if (!document.getElementById("crm-toast-container")) {
        const host = document.createElement("div");
        host.id = "crm-toast-container";
        host.style.cssText = "position:fixed;right:18px;bottom:18px;z-index:99999;display:flex;flex-direction:column;gap:8px;max-width:380px";
        document.body.appendChild(host);
    }
}
function crmToast(message, type) {
    crmEnsureUiLayer();
    const item = document.createElement("div");
    const ok = type !== "error";
    item.style.cssText = `padding:13px 16px;border-radius:10px;color:#fff;background:${ok ? "#2e7d32" : "#b3261e"};box-shadow:0 6px 22px rgba(0,0,0,.2);font-weight:600`;
    item.textContent = (ok ? "✓ " : "⚠ ") + message;
    document.getElementById("crm-toast-container").appendChild(item);
    setTimeout(() => item.remove(), ok ? 3500 : 6500);
}
function crmConfirm(message, confirmText) {
    return new Promise(resolve => {
        const overlay = document.createElement("div");
        overlay.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,.42);z-index:100000;display:flex;align-items:center;justify-content:center;padding:20px";
        overlay.innerHTML = `<div style="background:#fff;border-radius:14px;padding:22px;max-width:430px;width:100%;box-shadow:0 12px 44px rgba(0,0,0,.28)"><h3 style="margin:0 0 12px">Potwierdzenie</h3><p style="margin:0 0 20px;line-height:1.45"></p><div style="display:flex;justify-content:flex-end;gap:10px"><button type="button" data-no>Wróć</button><button type="button" class="btn-primary" data-yes></button></div></div>`;
        overlay.querySelector("p").textContent = message;
        overlay.querySelector("[data-yes]").textContent = confirmText || "Potwierdź";
        overlay.querySelector("[data-no]").onclick = () => { overlay.remove(); resolve(false); };
        overlay.querySelector("[data-yes]").onclick = () => { overlay.remove(); resolve(true); };
        document.body.appendChild(overlay);
    });
}
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
async function crmRefreshAllViews() {
    await loadSystem();
    await loadClients();
    renderDashboard();
    renderBooksyCalendar();
    await renderWorkScheduleCalendar();
}
function crmFormatDateTime(value) {
    const date = new Date(value);
    return isNaN(date.getTime()) ? String(value || "") : date.toLocaleString("pl-PL", {dateStyle:"short",timeStyle:"short"});
}
function crmUpdateLifecycleVisibility(app) {
    const box = document.getElementById("crm-lifecycle-actions");
    if (!box) return;
    const external = app && app.eventType === "external";
    const block = app && app.eventType === "block";
    const workShift = app && app.eventType === "work_shift";
    box.style.display = (external || block || workShift) ? "none" : "flex";
    let externalBox = document.getElementById("crm-external-actions");
    if (!externalBox) {
        externalBox = document.createElement("div");
        externalBox.id = "crm-external-actions";
        externalBox.style.cssText = "display:none;gap:8px;flex-wrap:wrap;margin-top:14px;padding-top:12px;border-top:1px solid #eadfd5";
        externalBox.innerHTML = `<button type="button" class="btn-primary" onclick="window.open('https://calendar.google.com/calendar/u/0/r','_blank','noopener')">Otwórz Google Calendar</button><button type="button" class="btn-secondary" onclick="convertExternalToCRMAppointment()">Przekształć w wizytę CRM</button>`;
        box.parentNode.appendChild(externalBox);
    }
    externalBox.style.display = external ? "flex" : "none";
}
function convertExternalToCRMAppointment() {
    const app = currentEditingAppointment;
    if (!app || app.eventType !== "external") return;
    closeAppointmentModal();
    openCreateAppointmentModal();
    setTimeout(() => {
        const name = document.getElementById("appointmentName");
        const date = document.getElementById("appointmentDateTime");
        const duration = document.getElementById("appointmentDuration");
        if (name) name.value = app.name || "";
        if (date) date.value = String(app.date || "").slice(0,16);
        if (duration) duration.value = app.duration || 60;
        crmSyncFiveMinuteControlsFromHidden();
        crmToast("Uzupełnij klienta, telefon i usługę, a następnie zapisz wizytę.");
    }, 0);
}

const crmOriginalOpenAppointmentDetailsModal = openAppointmentDetailsModal;
openAppointmentDetailsModal = function(app) {
    crmOriginalOpenAppointmentDetailsModal(app);
    setText("details-datetime", crmFormatDateTime(app.date));
    crmUpdateLifecycleVisibility(app);
};

async function crmRunLifecycleOperation(operation, initiator, deleteCalendarEvent, successText, button) {
    if (crmUiOperationLock || !currentEditingAppointment || currentEditingAppointment.eventType !== "appointment") return;
    crmUiOperationLock = true;
    crmSetActionGroupBusy(true, button, "Zapisywanie...");
    try {
        await recordAppointmentLifecycle({operation, eventId:currentEditingAppointment.eventId||"", phone:currentEditingAppointment.phone||"", clientName:currentEditingAppointment.name||"", service:currentEditingAppointment.service||"", oldDate:currentEditingAppointment.date||"", initiator:initiator||"MISTRZYNI", deleteCalendarEvent:Boolean(deleteCalendarEvent)});
        closeAppointmentModal();
        await crmRefreshAllViews();
        crmToast(successText);
    } catch (error) {
        crmToast(error.message || String(error), "error");
    } finally {
        crmUiOperationLock = false;
        crmSetActionGroupBusy(false);
    }
}
completeCurrentAppointment = async function() {
    return crmRunLifecycleOperation("ZREALIZOWANA", "MISTRZYNI", false, "Wizyta została oznaczona jako zrealizowana.", document.activeElement);
};
markCurrentAppointmentNoShow = async function() {
    const ok = await crmConfirm("Czy zapisać nieobecność klienta?", "Zapisz nieobecność");
    if (!ok) return;
    return crmRunLifecycleOperation("NIEOBECNOSC", "KLIENT", false, "Nieobecność została zapisana.", document.activeElement);
};
cancelAppointmentWithHistory = async function(initiator) {
    const ok = await crmConfirm("Czy na pewno anulować tę wizytę?", initiator === "KLIENT" ? "Anuluj przez klienta" : "Anuluj przez salon");
    if (!ok) return;
    return crmRunLifecycleOperation("ANULOWANIE", initiator || "MISTRZYNI", true, "Wizyta została anulowana.", document.activeElement);
};
planNextVisitFromCurrentAppointment = async function() {
    if (crmUiOperationLock || !currentEditingAppointment || currentEditingAppointment.eventType !== "appointment") return;
    crmUiOperationLock = true;
    crmSetActionGroupBusy(true, document.activeElement, "Wyszukiwanie...");
    try {
        const suggestion = await getSmartNextVisitSuggestion(currentEditingAppointment.phone,currentEditingAppointment.service,currentEditingAppointment.date,"REKOMENDOWANY");
        crmToast(`Rekomendowana data: ${suggestion.recommendedDate}. Godziny: ${(suggestion.availableSlots||[]).slice(0,6).join(", ") || "brak propozycji"}`);
    } catch (error) { crmToast(error.message || String(error), "error"); }
    finally { crmUiOperationLock=false; crmSetActionGroupBusy(false); }
};

function crmInstallFiveMinuteDateTimePicker() {
    const input = document.getElementById("appointmentDateTime");
    if (!input || document.getElementById("appointmentDateTimeFiveMinute")) return;
    input.type = "hidden";
    const box = document.createElement("div");
    box.id = "appointmentDateTimeFiveMinute";
    box.style.cssText = "display:grid;grid-template-columns:minmax(145px,1fr) 86px 86px;gap:8px";
    box.innerHTML = `<input type="date" data-date><select data-hour>${Array.from({length:24},(_,i)=>`<option value="${String(i).padStart(2,"0")}">${String(i).padStart(2,"0")}</option>`).join("")}</select><select data-minute>${Array.from({length:12},(_,i)=>`<option value="${String(i*5).padStart(2,"0")}">${String(i*5).padStart(2,"0")}</option>`).join("")}</select>`;
    input.parentNode.insertBefore(box,input.nextSibling);
    box.addEventListener("change", crmSyncHiddenDateTimeFromFiveMinuteControls);
    crmSyncFiveMinuteControlsFromHidden();
}
function crmSyncHiddenDateTimeFromFiveMinuteControls() {
    const input=document.getElementById("appointmentDateTime"),box=document.getElementById("appointmentDateTimeFiveMinute");
    if(!input||!box)return;
    const d=box.querySelector("[data-date]").value,h=box.querySelector("[data-hour]").value,m=box.querySelector("[data-minute]").value;
    input.value=d?`${d}T${h}:${m}`:"";
}
function crmSyncFiveMinuteControlsFromHidden() {
    const input=document.getElementById("appointmentDateTime"),box=document.getElementById("appointmentDateTimeFiveMinute");
    if(!input||!box)return;
    const value=String(input.value||"");
    box.querySelector("[data-date]").value=value.slice(0,10);
    if(value.length>=16){box.querySelector("[data-hour]").value=value.slice(11,13);const minute=Math.round(Number(value.slice(14,16))/5)*5%60;box.querySelector("[data-minute]").value=String(minute).padStart(2,"0");}
}
document.addEventListener("click", () => setTimeout(crmSyncFiveMinuteControlsFromHidden,0), true);

const crmOldGenerateSchedule4x4 = generateSchedule4x4FromPanel;
generateSchedule4x4FromPanel = async function() {
    if (crmUiOperationLock) return;
    const button = document.querySelector('#schedule-full-panel button[onclick="generateSchedule4x4FromPanel()"]') || document.activeElement;
    crmUiOperationLock=true;
    if(button){button.disabled=true;button.dataset.oldText=button.textContent;button.textContent="Generowanie...";}
    try {
        const year=Number(document.getElementById("sch-year").value),startDate=document.getElementById("sch-start").value;
        if(!startDate) throw new Error("Wskaż pierwszy dzień zmiany 1.");
        const response=await crmExtendedPost("generateSchedule4x4",{year,startDate});
        if(!response.success)throw new Error(response.error||"Błąd generowania");
        selectedCalendarDate=new Date(year,Number(document.getElementById("sch-month").value.slice(5,7))-1,1);
        await refreshSchedulePanel(); await renderWorkScheduleCalendar();
        const verify=await crmExtendedPost("getEffectiveSchedule",{month:document.getElementById("sch-month").value});
        if(!verify.success||!verify.entries||!verify.entries.length)throw new Error("Prognoza została zapisana, ale nie udało się odświeżyć kalendarza.");
        crmToast(`Prognoza wygenerowana. Zapisano ${response.days || 365} dni.`);
    } catch(error){crmToast(error.message||String(error),"error");}
    finally{crmUiOperationLock=false;if(button){button.disabled=false;button.textContent=button.dataset.oldText||"Generuj prognozę";}}
};
checkScheduleDriveFolderNow = async function() {
    if(crmUiOperationLock)return; const button=document.getElementById("sch-check-folder-btn"),status=document.getElementById("sch-folder-status");
    crmUiOperationLock=true;if(button){button.disabled=true;button.textContent="Sprawdzanie...";}
    try{const r=await crmExtendedPost("checkScheduleDriveFolder",{manual:true});if(!r.success)throw new Error(r.error||"Błąd folderu");
      const names=(r.candidates||[]).map(x=>x.name).join(", ");
      const rejected=(r.rejected||[]).map(x=>x.name||"bez nazwy").join(", ");
      status.textContent=`Folder ${r.folderName||"Grafik"} (${r.folderId||""}). Pliki: ${r.totalFiles||0}, pasujące: ${r.matchingFiles||0}, nowe: ${r.newFiles||0}, zmienione: ${r.changedFiles||0}, bez zmian: ${r.unchangedFiles||0}.${names?" Rozpoznane: "+names+".":""}${rejected?" Pominięte: "+rejected+".":""}`;
      crmToast(r.matchingFiles?`Znaleziono ${r.matchingFiles} pasujący plik.`:"Folder dostępny, ale brak pasujących plików.",r.matchingFiles?"success":"error");
    }catch(e){crmToast(e.message||String(e),"error");}finally{crmUiOperationLock=false;if(button){button.disabled=false;button.textContent="Sprawdź folder teraz";}}
};

document.addEventListener("DOMContentLoaded",()=>{crmEnsureUiLayer();crmInstallFiveMinuteDateTimePicker();});
/* KONIEC PAKIETU POPRAWEK PO ZYWYM TESCIE */


/* ==========================================================
   IMPORT OFICJALNEGO GRAFIKU Z OCR I WERYFIKACJA
   ========================================================== */
let crmLastScheduleImport = null;
function crmScheduleCodeOptions(selected){
    return ["?","1","2","W","WH","WN","UW","OP","SW","BHP"].map(code=>`<option value="${code}" ${code===selected?"selected":""}>${code}</option>`).join("");
}
function crmRenderScheduleImportReview(data){
    const panel=document.getElementById("sch-import-review")||document.createElement("div");
    if(!panel.id){panel.id="sch-import-review";panel.style.cssText="margin-top:14px;padding:14px;border:1px solid #d7baa0;border-radius:10px;background:#fff";document.getElementById("sch-folder-status").after(panel);}
    if(data.alreadyApplied){panel.innerHTML=`<strong>${data.message}</strong>`;return;}
    crmLastScheduleImport=data;
    panel.innerHTML=`<h3 style="margin:0 0 8px">Sprawdź grafik: ${data.month}</h3><p>Pracownik: ${data.employeeFound?"znaleziony elastycznie":"nie znaleziony"}. Rozpoznano automatycznie ${data.recognized||0} z ${data.days||0} dni. Popraw znaki „?” przed zatwierdzeniem.</p><div style="display:grid;grid-template-columns:repeat(7,minmax(70px,1fr));gap:6px">${(data.codes||[]).map((code,i)=>`<label style="display:flex;flex-direction:column;gap:3px;font-size:12px">Dzień ${i+1}<select data-official-day="${i+1}">${crmScheduleCodeOptions(code)}</select></label>`).join("")}</div><div style="display:flex;gap:8px;margin-top:12px"><button type="button" class="btn-primary" onclick="crmApplyOfficialSchedule()">Zatwierdź oficjalny grafik</button><button type="button" class="btn-secondary" onclick="crmProcessOfficialScheduleFile('${data.fileId||""}',true)">Przetwórz ponownie OCR</button></div><details style="margin-top:10px"><summary>Tekst rozpoznanego wiersza</summary><pre style="white-space:pre-wrap">${String(data.ocrLine||"").replace(/</g,"&lt;")}</pre></details>`;
}
async function crmProcessOfficialScheduleFile(fileId,force){
    if(!fileId)return crmToast("Brak identyfikatora pliku do przetworzenia.","error");
    crmToast("Odczytywanie oficjalnego grafiku...");
    try{const r=await crmExtendedPost("processOfficialScheduleFile",{fileId:fileId,force:Boolean(force)});if(!r.success)throw new Error(r.error||"Błąd OCR");r.fileId=fileId;crmRenderScheduleImportReview(r);crmToast(r.alreadyApplied?"Plik był już zatwierdzony.":"OCR zakończony. Sprawdź rozpoznane dni.");}catch(e){crmToast(e.message||String(e),"error");}
}
async function crmApplyOfficialSchedule(){
    if(!crmLastScheduleImport)return;
    const codes=Array.from(document.querySelectorAll("[data-official-day]")).map(x=>x.value);
    const unknown=codes.map((x,i)=>x==="?"?i+1:null).filter(Boolean);if(unknown.length)return crmToast("Popraw nierozpoznane dni: "+unknown.join(", "),"error");
    const btn=document.activeElement;if(btn){btn.disabled=true;btn.textContent="Zapisywanie...";}
    try{const r=await crmExtendedPost("applyOfficialSchedule",{importId:crmLastScheduleImport.importId,month:crmLastScheduleImport.month,codes:codes});if(!r.success)throw new Error(r.error||"Błąd zapisu");await refreshSchedulePanel();await renderWorkScheduleCalendar();crmToast("Oficjalny grafik został zastosowany.");}catch(e){crmToast(e.message||String(e),"error");}finally{if(btn){btn.disabled=false;btn.textContent="Zatwierdź oficjalny grafik";}}
}
const crmPreviousFolderCheck=checkScheduleDriveFolderNow;
checkScheduleDriveFolderNow=async function(){
    if(crmUiOperationLock)return;const button=document.getElementById("sch-check-folder-btn"),status=document.getElementById("sch-folder-status");crmUiOperationLock=true;if(button){button.disabled=true;button.textContent="Sprawdzanie...";}
    try{const r=await crmExtendedPost("checkScheduleDriveFolder",{manual:true});if(!r.success)throw new Error(r.error||"Błąd folderu");const names=(r.candidates||[]).map(x=>x.name).join(", ");status.textContent=`Folder ${r.folderName||"Grafik"} (${r.folderId||""}). Pliki: ${r.totalFiles||0}, pasujące: ${r.matchingFiles||0}.${names?" Rozpoznane: "+names+".":""}`;if(r.candidates&&r.candidates.length){crmToast(`Znaleziono ${r.candidates.length} plik. Rozpoczynam OCR.`);await crmProcessOfficialScheduleFile(r.candidates[0].id,false);}else crmToast("Folder dostępny, ale brak pasujących plików.","error");}catch(e){crmToast(e.message||String(e),"error");}finally{crmUiOperationLock=false;if(button){button.disabled=false;button.textContent="Sprawdź folder teraz";}}
};
/* KONIEC IMPORTU OFICJALNEGO GRAFIKU */


/* ==========================================================
   KADROWANIE WIERSZA GRAFIKU PRZED OCR
   ========================================================== */
let crmScheduleImageSource=null;
function crmCanvasToBase64(canvas){return canvas.toDataURL("image/jpeg",0.96).split(",")[1];}
function crmDrawScheduleCrop(){
    if(!crmScheduleImageSource)return;const canvas=document.getElementById("sch-crop-canvas"),top=Number(document.getElementById("sch-crop-top").value),height=Number(document.getElementById("sch-crop-height").value),ctx=canvas.getContext("2d"),img=crmScheduleImageSource;
    const sy=Math.max(0,Math.round(img.naturalHeight*top/100)),sh=Math.max(12,Math.min(img.naturalHeight-sy,Math.round(img.naturalHeight*height/100)));
    canvas.width=img.naturalWidth;canvas.height=sh;ctx.fillStyle="#fff";ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(img,0,sy,img.naturalWidth,sh,0,0,img.naturalWidth,sh);
    document.getElementById("sch-crop-info").textContent=`Kadrowanie: od ${top}% wysokości, wysokość ${height}% (${sy}-${sy+sh}px).`;
}
function crmRenderScheduleCropPanel(file){
    let panel=document.getElementById("sch-crop-panel");if(!panel){panel=document.createElement("div");panel.id="sch-crop-panel";panel.style.cssText="margin-top:14px;padding:14px;border:1px solid #d7baa0;border-radius:10px;background:#fff";document.getElementById("sch-folder-status").after(panel);}
    panel.innerHTML=`<h3 style="margin:0 0 8px">Kadrowanie wiersza pracownika</h3><p>Ramka pokazuje fragment wysyłany do OCR. Jeśli wiersz pracownika nie jest widoczny, przesuń zakres.</p><label>Położenie od góry: <input id="sch-crop-top" type="range" min="0" max="94" value="60" step="1"></label><label style="margin-left:16px">Wysokość wycinka: <input id="sch-crop-height" type="range" min="5" max="25" value="12" step="1"></label><div id="sch-crop-info" style="margin:8px 0"></div><div style="overflow:auto;max-height:240px;border:1px solid #ddd"><canvas id="sch-crop-canvas" style="max-width:100%;display:block"></canvas></div><div style="display:flex;gap:8px;margin-top:10px"><button type="button" class="btn-primary" onclick="crmRunCroppedScheduleOCR()">Odczytaj ten wiersz</button><button type="button" class="btn-secondary" onclick="crmAutoFindScheduleRow()">Ustaw typowe położenie</button></div>`;
    document.getElementById("sch-crop-top").oninput=crmDrawScheduleCrop;document.getElementById("sch-crop-height").oninput=crmDrawScheduleCrop;
    const img=new Image();img.onload=()=>{crmScheduleImageSource=img;crmDrawScheduleCrop();};img.src=`data:${file.mimeType};base64,${file.base64Data}`;
}
function crmAutoFindScheduleRow(){document.getElementById("sch-crop-top").value="60";document.getElementById("sch-crop-height").value="12";crmDrawScheduleCrop();}
async function crmPrepareScheduleCrop(fileId){
    try{crmToast("Pobieranie obrazu grafiku...");const r=await crmExtendedPost("getScheduleImageData",{fileId:fileId});if(!r.success)throw new Error(r.error||"Błąd pobierania obrazu");crmRenderScheduleCropPanel(r);crmToast("Sprawdź, czy wycinek zawiera cały wiersz pracownika.");}catch(e){crmToast(e.message||String(e),"error");}
}
async function crmRunCroppedScheduleOCR(){
    const canvas=document.getElementById("sch-crop-canvas"),button=document.activeElement;if(!canvas||!canvas.width)return;
    if(button){button.disabled=true;button.textContent="Odczytywanie...";}
    try{const top=Number(document.getElementById("sch-crop-top").value),height=Number(document.getElementById("sch-crop-height").value),r=await crmExtendedPost("processCroppedScheduleImage",{fileName:"2026-07.jpg",mimeType:"image/jpeg",base64Data:crmCanvasToBase64(canvas),crop:{topPercent:top,heightPercent:height}});if(!r.success)throw new Error(r.error||"Błąd OCR wycinka");r.fileId=crmLastScheduleImport&&crmLastScheduleImport.fileId||"";crmRenderScheduleImportReview(r);crmToast(`OCR wycinka rozpoznał ${r.recognized||0} z ${r.days||0} dni.`);}catch(e){crmToast(e.message||String(e),"error");}finally{if(button){button.disabled=false;button.textContent="Odczytaj ten wiersz";}}
}
// Po nieudanym pełnym OCR pokaż narzędzie kadrowania zamiast 31 pustych pól bez wyjaśnienia.
const crmOldRenderScheduleImportReview=crmRenderScheduleImportReview;
crmRenderScheduleImportReview=function(data){crmOldRenderScheduleImportReview(data);if((data.recognized||0)===0&&data.fileId)crmPrepareScheduleCrop(data.fileId);};
/* KONIEC KADROWANIA WIERSZA GRAFIKU */


/* ==========================================================
   SEGMENTACJA 31 KOMOREK GRAFIKU I ANALIZA KOLORU
   ========================================================== */
let crmSegmentedScheduleCells=[];
function crmAverageCellColor(ctx,x,y,w,h){
    const sx=Math.round(x+w*0.22),sy=Math.round(y+h*0.22),sw=Math.max(2,Math.round(w*0.56)),sh=Math.max(2,Math.round(h*0.56));
    const data=ctx.getImageData(sx,sy,sw,sh).data;let r=0,g=0,b=0,n=0;
    for(let i=0;i<data.length;i+=4){if(data[i+3]<100)continue;r+=data[i];g+=data[i+1];b+=data[i+2];n++;}
    return n?{r:Math.round(r/n),g:Math.round(g/n),b:Math.round(b/n)}:{r:255,g:255,b:255};
}
function crmGuessCodeFromColor(c){
    // Kolor daje bezpieczną podpowiedź kategorii. Użytkownik nadal zatwierdza kod tekstowy.
    if(c.r>190&&c.g>185&&c.b<105)return{code:"1",confidence:"wysoka",kind:"żółta"};
    if(c.g>135&&c.r<190&&c.b<150)return{code:"2",confidence:"wysoka",kind:"zielona"};
    if(c.b>145&&c.r<190&&c.g>125)return{code:"UW",confidence:"średnia",kind:"niebieska"};
    if(c.r>205&&c.g>205&&c.b>205)return{code:"W",confidence:"średnia",kind:"biała"};
    return{code:"?",confidence:"niska",kind:"nieznana"};
}
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
function crmCellThumbnail(sourceCanvas,x,y,w,h){
    const c=document.createElement("canvas");c.width=120;c.height=54;const ctx=c.getContext("2d");ctx.imageSmoothingEnabled=false;ctx.fillStyle="#fff";ctx.fillRect(0,0,c.width,c.height);ctx.drawImage(sourceCanvas,x,y,w,h,4,4,c.width-8,c.height-8);return c.toDataURL("image/png");
}
function crmSegmentCurrentScheduleRow(){
    const canvas=document.getElementById("sch-crop-canvas");if(!canvas||!canvas.width)return crmToast("Najpierw ustaw widoczny wiersz grafiku.","error");
    const ctx=canvas.getContext("2d"),nameEnd=crmFindNameColumnBoundary(ctx,canvas.width,canvas.height),gridWidth=canvas.width-nameEnd,cellWidth=gridWidth/31;
    crmSegmentedScheduleCells=[];
    for(let i=0;i<31;i++){
        const x=Math.round(nameEnd+i*cellWidth),next=Math.round(nameEnd+(i+1)*cellWidth),w=Math.max(2,next-x),color=crmAverageCellColor(ctx,x,0,w,canvas.height),guess=crmGuessCodeFromColor(color);
        crmSegmentedScheduleCells.push({day:i+1,x:x,width:w,color:color,guess:guess,thumbnail:crmCellThumbnail(canvas,x,0,w,canvas.height)});
    }
    crmRenderSegmentedScheduleReview(nameEnd);
}
function crmRenderSegmentedScheduleReview(nameEnd){
    let panel=document.getElementById("sch-cell-review");if(!panel){panel=document.createElement("div");panel.id="sch-cell-review";panel.style.cssText="margin-top:14px;padding:14px;border:1px solid #d7baa0;border-radius:10px;background:#fff";document.getElementById("sch-crop-panel").after(panel);}
    const high=crmSegmentedScheduleCells.filter(x=>x.guess.confidence==="wysoka").length,medium=crmSegmentedScheduleCells.filter(x=>x.guess.confidence==="średnia").length;
    panel.innerHTML=`<h3 style="margin:0 0 8px">Analiza 31 komórek</h3><p>Granica nazwiska: ${nameEnd}px. Pewne kolory: ${high}. Wymagające kontroli tekstu: ${medium}. Każda miniatura pochodzi bezpośrednio z oficjalnego pliku.</p><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(125px,1fr));gap:8px">${crmSegmentedScheduleCells.map(cell=>`<label style="border:1px solid #ddd;border-radius:8px;padding:6px;display:flex;flex-direction:column;gap:4px"><strong>Dzień ${cell.day}</strong><img src="${cell.thumbnail}" alt="Komórka dnia ${cell.day}" style="width:100%;height:54px;object-fit:contain;image-rendering:auto;background:#fff"><select data-segment-day="${cell.day}">${crmScheduleCodeOptions(cell.guess.code)}</select><small>${cell.guess.kind}, RGB ${cell.color.r}/${cell.color.g}/${cell.color.b}, pewność ${cell.guess.confidence}</small></label>`).join("")}</div><div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:12px"><button type="button" class="btn-primary" onclick="crmUseSegmentedCodes()">Przenieś kody do formularza</button><button type="button" class="btn-secondary" onclick="crmSegmentCurrentScheduleRow()">Analizuj ponownie</button></div><p style="margin-bottom:0"><strong>Uwaga:</strong> żółte i zielone komórki są rozpoznawane jako 1 i 2. Białe oraz niebieskie wymagają wzrokowej kontroli, ponieważ kolor nie odróżnia W od WH/WN ani UW od OP/BHP.</p>`;
}
function crmUseSegmentedCodes(){
    const source=Array.from(document.querySelectorAll("[data-segment-day]"));if(source.length!==31)return crmToast("Brak kompletu 31 komórek.","error");
    source.forEach(select=>{const day=select.dataset.segmentDay,target=document.querySelector(`[data-official-day="${day}"]`);if(target)target.value=select.value;});
    const unknown=source.filter(x=>x.value==="?").length;crmToast(unknown?`Przeniesiono podpowiedzi. Pozostało ${unknown} nierozpoznanych dni.`:"Przeniesiono wszystkie 31 kodów. Sprawdź je przed zatwierdzeniem.");
    document.getElementById("sch-import-review")?.scrollIntoView({behavior:"smooth",block:"start"});
}
// Zmieniamy domyślne ustawienie kadrowania na wartość potwierdzoną w żywym teście.
crmAutoFindScheduleRow=function(){document.getElementById("sch-crop-top").value="62";document.getElementById("sch-crop-height").value="5";crmDrawScheduleCrop();};
const crmOldRenderCropPanel=crmRenderScheduleCropPanel;
crmRenderScheduleCropPanel=function(file){crmOldRenderCropPanel(file);setTimeout(()=>{crmAutoFindScheduleRow();const actions=document.querySelector("#sch-crop-panel div:last-child");if(actions&&!document.getElementById("sch-segment-btn")){const btn=document.createElement("button");btn.id="sch-segment-btn";btn.type="button";btn.className="btn-primary";btn.textContent="Podziel na 31 komórek";btn.onclick=crmSegmentCurrentScheduleRow;actions.appendChild(btn);}},100);};
/* KONIEC SEGMENTACJI 31 KOMOREK */

/* ==========================================================
   POPRAWKA ADMIN: CZYSZCZENIE I NOWA SYNCHRONIZACJA GRAFIKU
   ========================================================== */
let crmWorkCalendarCleanupToken = "";
let crmWorkCalendarOperationBusy = false;
async function scanOldWorkScheduleEventsFromAdmin() {
    if (crmWorkCalendarOperationBusy) return;
    crmWorkCalendarOperationBusy = true;
    const status=document.getElementById("sch-calendar-cleanup-status"),button=document.getElementById("sch-scan-calendar-btn");
    if(button){button.disabled=true;button.textContent="Wyszukiwanie...";}
    try{
        const r=await crmExtendedPost("scanOldWorkScheduleEvents");
        if(!r.success)throw new Error(r.error||"Błąd wyszukiwania");
        crmWorkCalendarCleanupToken=r.token||"";
        if(status)status.textContent=`Znaleziono ${r.count||0} starych wpisów grafiku w zakresie ${r.from} - ${r.to}.`;
        const del=document.getElementById("sch-delete-calendar-btn");if(del)del.disabled=!(r.count>0&&crmWorkCalendarCleanupToken);
        crmToast(`Znaleziono ${r.count||0} wpisów grafiku.`);
    }catch(e){crmToast(e.message||String(e),"error");}
    finally{crmWorkCalendarOperationBusy=false;if(button){button.disabled=false;button.textContent="Znajdź stare wpisy grafiku";}}
}
async function deleteOldWorkScheduleEventsFromAdmin() {
    if(crmWorkCalendarOperationBusy||!crmWorkCalendarCleanupToken)return;
    const ok=await crmConfirm("Usunąć znalezione automatyczne wpisy Wyjazd/Powrót ze zmiany z okresu 01.01.2026-31.01.2027? Wizyty klientów, blokady i prywatne wydarzenia nie będą usuwane.","Usuń wpisy grafiku");
    if(!ok)return;
    crmWorkCalendarOperationBusy=true;const button=document.getElementById("sch-delete-calendar-btn"),status=document.getElementById("sch-calendar-cleanup-status");
    if(button){button.disabled=true;button.textContent="Usuwanie...";}
    try{
        const r=await crmExtendedPost("deleteOldWorkScheduleEvents",{token:crmWorkCalendarCleanupToken});
        if(!r.success)throw new Error(r.error||"Błąd usuwania");
        crmWorkCalendarCleanupToken="";if(status)status.textContent=`Usunięto ${r.removed||0} starych wpisów grafiku.`;
        await loadSettings();crmToast(`Usunięto ${r.removed||0} wpisów. Teraz wygeneruj nową prognozę i uruchom synchronizację.`);
    }catch(e){crmToast(e.message||String(e),"error");}
    finally{crmWorkCalendarOperationBusy=false;if(button){button.textContent="Usuń stare wpisy grafiku";button.disabled=true;}}
}
function crmInstallCalendarCleanupControls(){
    const syncButton=document.querySelector('#schedule-full-panel button[onclick="synchronizeWorkScheduleWithGoogleCalendar()"]');
    if(!syncButton||document.getElementById("sch-calendar-cleanup-box"))return;
    const box=document.createElement("div");box.id="sch-calendar-cleanup-box";box.style.cssText="margin-top:12px;padding:12px;border:1px solid #d8b38c;border-radius:9px;background:#fff";
    box.innerHTML='<strong>Jednorazowe czyszczenie starego grafiku</strong><p id="sch-calendar-cleanup-status">Najpierw wyszukaj stare wpisy. Usuwane są tylko automatyczne wpisy grafiku.</p><div style="display:flex;gap:8px;flex-wrap:wrap"><button id="sch-scan-calendar-btn" type="button" class="btn-secondary" onclick="scanOldWorkScheduleEventsFromAdmin()">Znajdź stare wpisy grafiku</button><button id="sch-delete-calendar-btn" type="button" class="btn-danger" onclick="deleteOldWorkScheduleEventsFromAdmin()" disabled>Usuń stare wpisy grafiku</button></div>';
    syncButton.parentNode.insertBefore(box,syncButton.nextSibling);
}
const crmOldSynchronizeWorkScheduleWithGoogleCalendar=synchronizeWorkScheduleWithGoogleCalendar;
synchronizeWorkScheduleWithGoogleCalendar=async function(){
    if(crmWorkCalendarOperationBusy)return;crmWorkCalendarOperationBusy=true;
    const button=document.querySelector('#schedule-full-panel button[onclick="synchronizeWorkScheduleWithGoogleCalendar()"]');
    if(button){button.disabled=true;button.dataset.oldText=button.textContent;button.textContent="Synchronizacja...";}
    try{
        const month=document.getElementById("sch-month").value,r=await crmExtendedPost("syncWorkScheduleToGoogleCalendar",{month});
        if(!r.success)throw new Error(r.error||"Błąd synchronizacji");
        await loadSettings();crmToast(`Synchronizacja zakończona. Utworzono ${r.created||0}, usunięto ${r.removed||0}, duplikaty ${r.duplicates||0}.`);
    }catch(e){crmToast(e.message||String(e),"error");}
    finally{crmWorkCalendarOperationBusy=false;if(button){button.disabled=false;button.textContent=button.dataset.oldText||"Synchronizuj z Google Calendar";}}
};
document.addEventListener("DOMContentLoaded",()=>setTimeout(crmInstallCalendarCleanupControls,100));
/* KONIEC POPRAWKI ADMIN KALENDARZA */

/* ==========================================================
   POPRAWKA ADMIN: GOTOWY PLIK Grafik_Oleksandr.xlsx
   ========================================================== */
let crmScheduleXlsxCandidate=null;
checkScheduleDriveFolderNow=async function(){
    if(crmUiOperationLock)return;const button=document.getElementById("sch-check-folder-btn"),status=document.getElementById("sch-folder-status");
    crmUiOperationLock=true;if(button){button.disabled=true;button.textContent="Sprawdzanie...";}
    try{
        const r=await crmExtendedPost("checkScheduleDriveFolder",{manual:true});if(!r.success)throw new Error(r.error||"Błąd folderu");
        crmScheduleXlsxCandidate=r.candidates&&r.candidates.length?r.candidates[0]:null;
        if(status)status.textContent=`Folder ${r.folderName||"Grafik"}. Pliki: ${r.totalFiles||0}, pasujące XLSX: ${r.matchingFiles||0}. Oczekiwany plik: ${r.expectedFile||"Grafik_Oleksandr.xlsx"}.`;
        let importBtn=document.getElementById("sch-import-xlsx-btn");
        if(!importBtn&&button){importBtn=document.createElement("button");importBtn.id="sch-import-xlsx-btn";importBtn.type="button";importBtn.className="btn-primary";importBtn.textContent="Importuj Grafik_Oleksandr.xlsx";importBtn.onclick=importScheduleXlsxFromPanel;button.after(importBtn);}
        if(importBtn)importBtn.disabled=!crmScheduleXlsxCandidate;
        crmToast(crmScheduleXlsxCandidate?"Znaleziono Grafik_Oleksandr.xlsx. Można rozpocząć import.":"Folder dostępny, ale nie znaleziono Grafik_Oleksandr.xlsx.",crmScheduleXlsxCandidate?"success":"error");
    }catch(e){crmToast(e.message||String(e),"error");}
    finally{crmUiOperationLock=false;if(button){button.disabled=false;button.textContent="Sprawdź folder teraz";}}
}
async function importScheduleXlsxFromPanel(){
    if(crmUiOperationLock||!crmScheduleXlsxCandidate)return;
    const button=document.getElementById("sch-import-xlsx-btn");crmUiOperationLock=true;if(button){button.disabled=true;button.textContent="Importowanie XLSX...";}
    try{
        const r=await crmExtendedPost("importScheduleXlsx",{fileId:crmScheduleXlsxCandidate.id});if(!r.success)throw new Error(r.error||"Błąd importu XLSX");
        await refreshSchedulePanel();await renderWorkScheduleCalendar();
        crmToast(`Zaimportowano ${r.rows} dni z ${r.fileName}. Zakres ${r.from} - ${r.to}.`);
    }catch(e){crmToast(e.message||String(e),"error");}
    finally{crmUiOperationLock=false;if(button){button.disabled=false;button.textContent="Importuj Grafik_Oleksandr.xlsx";}}
}
function crmUpdateSchedulePanelForXlsx(){
    const panel=document.getElementById("schedule-full-panel");if(!panel)return;
    panel.dataset.scheduleVersion="XLSX-V4-BEZ-OCR";
    let badge=document.getElementById("sch-xlsx-version-badge");
    if(!badge){badge=document.createElement("div");badge.id="sch-xlsx-version-badge";badge.style.cssText="display:inline-block;margin:0 0 12px;padding:5px 9px;border-radius:14px;background:#e8f5e9;color:#1b5e20;font-size:12px;font-weight:700";badge.textContent="Grafik aktualny";panel.querySelector("h2").after(badge);}else{badge.textContent="Grafik aktualny";}
    const details=Array.from(panel.querySelectorAll("details")).find(d=>d.querySelector("summary")&&d.querySelector("summary").textContent.includes("Oficjalny grafik"));
    if(!details)return;const p=details.querySelector("p");if(p)p.textContent="Folder: Grafik. Plik: Grafik_Oleksandr.xlsx. Źródło danych: arkusz Dane CRM, kolumny Data i Kod końcowy.";
    const triggerBtn=details.querySelector('button[onclick="installScheduleFolderTriggers()"]');if(triggerBtn)triggerBtn.style.display="none";
    const status=document.getElementById("sch-folder-status");if(status)status.textContent="Sprawdź folder, a następnie zaimportuj gotowy plik XLSX. OCR zdjęć nie jest używany.";
}
document.addEventListener("DOMContentLoaded",()=>setTimeout(crmUpdateSchedulePanelForXlsx,150));
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
function crmMakeProcedure(details, title) {
    if (!details) return;
    details.open = false;
    const summary = details.querySelector(":scope > summary");
    if (summary && title) summary.textContent = title;
}
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
function crmArrangeSchedulePanel() {
    const panel = document.getElementById("schedule-full-panel");
    if (!panel || panel.dataset.finalLayout === "1") return;
    panel.dataset.finalLayout = "1";

    const details = Array.from(panel.querySelectorAll(":scope > details"));
    const forecast = details.find(d => /Prognoza 4x4|Prognoza 4×4/i.test(d.querySelector("summary")?.textContent || ""));
    const manual = details.find(d => /Ręczna korekta dnia/i.test(d.querySelector("summary")?.textContent || ""));
    const official = details.find(d => /Oficjalny grafik|Aktualizacja pliku/i.test(d.querySelector("summary")?.textContent || ""));
    const preview = details.find(d => /Podgląd danych i historii/i.test(d.querySelector("summary")?.textContent || ""));

    // Prognoza 4x4 pozostaje mechanizmem technicznym w backendzie.
    // Edycja grafiku odbywa się wyłącznie w Grafik_Oleksandr.xlsx.
    forecast?.remove();
    manual?.remove();

    const actions = document.createElement("div");
    actions.id = "sch-main-actions";
    actions.style.cssText = "display:flex;gap:10px;flex-wrap:wrap;margin:10px 0 14px";

    const updateButton = document.createElement("button");
    updateButton.id = "sch-smart-update-btn";
    updateButton.type = "button";
    updateButton.className = "btn-primary";
    updateButton.textContent = "Sprawdź aktualizację";
    updateButton.onclick = crmSmartScheduleUpdateNow;
    actions.appendChild(updateButton);

    const syncButton = official?.querySelector('button[onclick="synchronizeWorkScheduleWithGoogleCalendar()"]');
    if (syncButton) {
        syncButton.textContent = "Synchronizuj z Google Calendar";
        actions.appendChild(syncButton);
    }
    official?.remove();

    const cleanup = document.getElementById("sch-calendar-cleanup-box");
    let cleanupDetails = null;
    if (cleanup) cleanupDetails = crmCreateProcedure("Czyszczenie wpisów grafiku", cleanup);

    if (preview) {
        preview.open = false;
        const summary = preview.querySelector(":scope > summary");
        if (summary) summary.textContent = "Podgląd danych i historii";
    }

    const badge = document.getElementById("sch-xlsx-version-badge");
    badge?.remove();

    // Usuń wszystkie pozostawione opisy techniczne poza podglądem.
    Array.from(panel.children).forEach(child => {
        if (child.tagName === "P" && !child.closest("details")) child.remove();
    });

    panel.insertBefore(actions, panel.firstChild?.nextSibling || null);
    if (cleanupDetails) panel.insertBefore(cleanupDetails, preview || null);
    crmWrapSectionAsDetails(panel, "Grafik męża");
}

function crmArrangeDiagnosticsPanel() {
    const panel = document.getElementById("crm-diagnostics-panel");
    if (!panel || panel.dataset.finalLayout === "1") return;
    panel.dataset.finalLayout = "1";
    const buttons = Array.from(panel.querySelectorAll("button"));
    const host = document.createElement("div");
    host.style.cssText = "display:block";
    const definitions = [
        ["Szybki test", b => /Szybki test/i.test(b.textContent)],
        ["Pełny test CRM", b => /Pełny test/i.test(b.textContent)],
        ["Raport diagnostyczny", b => /Kopiuj raport/i.test(b.textContent)],
        ["Historia testów", b => /Historia testów/i.test(b.textContent)]
    ];
    definitions.forEach(([title, match]) => {
        const button = buttons.find(match);
        if (!button) return;
        const row = document.createElement("div");
        row.appendChild(button);
        host.appendChild(crmCreateProcedure(title, row));
    });
    const firstDetails = panel.querySelector("details");
    if (firstDetails) firstDetails.before(host); else panel.appendChild(host);
    Array.from(panel.querySelectorAll("details")).forEach(d => d.open = false);
    crmWrapSectionAsDetails(panel, "Diagnostyka systemu CRM");
}
function crmCollapseWorkCalendar() {
    const host = document.getElementById("work-schedule-calendar");
    const panel = document.getElementById("schedule-full-panel");
    if (!host || !panel) return;
    const mainBody = panel.querySelector(":scope > details.crm-main-collapsible > div");
    if (!mainBody) return;
    host.style.cssText = "padding:4px 0 14px;border:0;background:transparent";
    mainBody.insertBefore(host, mainBody.firstChild);
}

async function crmSmartScheduleUpdateNow() {
    const button = document.getElementById("sch-smart-update-btn");
    if (button) { button.disabled = true; button.textContent = "Sprawdzanie..."; }
    try {
        const response = await crmExtendedPost("smartScheduleUpdate", {manual:true});
        if (!response.success) throw new Error(response.error || "Błąd aktualizacji grafiku");
        const message = response.changed ? "Grafik zaktualizowany" : "Grafik aktualny";
        crmToast(message);
        await crmRefreshAllViews();
    } catch (error) { crmToast(error.message || String(error), "error"); }
    finally { if (button) { button.disabled = false; button.textContent = "Sprawdź aktualizację"; } }
}
function crmInstallSmartButton() {}
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
document.addEventListener("DOMContentLoaded", () => {
    setTimeout(crmApplyFinalLayout, 250);
    setTimeout(crmApplyFinalLayout, 1000);
});
/* KONIEC FINALNEGO UKLADU I AKTUALIZACJI */

/* ==========================================================
   DIAGNOSTYKA SYSTEMU CRM - MODUL STALY
   WERSJA TESTERA: 1.0.1

   TEN BLOK MUSI POZOSTAC NA SAMYM KONCU ADMIN.JS.
   POD NIM NIE DODAJEMY INNEGO KODU.
   ABY USUNAC TESTER, USUN CALY BLOK OD TEGO KOMENTARZA
   DO KOMENTARZA "KONIEC DIAGNOSTYKI SYSTEMU CRM".
   ========================================================== */

const CRM_TESTER_VERSION = "1.0.1";
let crmTestIsRunning = false;
let crmLastTestReport = null;

function crmTestCreateReport(testType) {
    const now = new Date();
    return {
        testId: "CRM_TEST_" + now.getTime(),
        testerVersion: CRM_TESTER_VERSION,
        testType: testType,
        startedAt: now.toISOString(),
        finishedAt: "",
        durationSeconds: 0,
        status: "W TRAKCIE",
        passed: 0,
        warnings: 0,
        errors: 0,
        currentStage: "Przygotowanie testu",
        tests: [],
        testData: {}
    };
}

function crmTestAdd(report, status, name, details) {
    report.tests.push({
        status: status,
        name: name,
        details: details === undefined ? "" : details
    });
    if (status === "OK") report.passed += 1;
    else if (status === "OSTRZEZENIE") report.warnings += 1;
    else report.errors += 1;
    crmTestRenderReport(report);
}

function crmTestWait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function crmTestSetProgress(percent, text) {
    const wrapper = document.getElementById("crm-test-progress-wrapper");
    const bar = document.getElementById("crm-test-progress-bar");
    const label = document.getElementById("crm-test-progress-text");
    if (wrapper) wrapper.style.display = "block";
    if (bar) bar.style.width = Math.max(0, Math.min(100, percent)) + "%";
    if (label) label.textContent = text;
    if (crmLastTestReport) crmLastTestReport.currentStage = text;
}

function crmTestSetRunning(running) {
    crmTestIsRunning = running;
    ["runQuickCRMTestBtn", "runFullCRMTestBtn"].forEach(id => {
        const button = document.getElementById(id);
        if (button) button.disabled = running;
    });
}

function crmTestSafeText(value) {
    if (value === undefined || value === null || value === "") return "";
    if (typeof value === "string") return value;
    try { return JSON.stringify(value); }
    catch (error) { return String(value); }
}

function buildCRMTestTextReport(report) {
    if (!report) return "Brak raportu.";
    const lines = [
        "CRM TEST REPORT",
        "ID testu: " + report.testId,
        "Wersja testera: " + report.testerVersion,
        "Rodzaj testu: " + report.testType,
        "Status: " + report.status,
        "Rozpoczecie: " + report.startedAt,
        "Zakonczenie: " + (report.finishedAt || "test trwa"),
        "Czas: " + report.durationSeconds + " s",
        "Zaliczone: " + report.passed,
        "Ostrzezenia: " + report.warnings,
        "Bledy: " + report.errors,
        "",
        "SZCZEGOLY:"
    ];
    report.tests.forEach((test, index) => {
        const icon = test.status === "OK" ? "[OK]" :
            (test.status === "OSTRZEZENIE" ? "[OSTRZEZENIE]" : "[BLAD]");
        lines.push((index + 1) + ". " + icon + " " + test.name);
        const details = crmTestSafeText(test.details);
        if (details) lines.push("   " + details);
    });
    return lines.join("\n");
}

function crmTestRenderReport(report) {
    const output = document.getElementById("crm-test-report-output");
    if (output) output.textContent = buildCRMTestTextReport(report);
}

function crmTestRenderSummary(report) {
    const box = document.getElementById("crm-test-summary");
    if (!box) return;
    const isError = report.errors > 0;
    const isWarning = !isError && report.warnings > 0;
    const color = isError ? "#b42318" : (isWarning ? "#a15c00" : "#198754");
    const title = isError ? "Test wykryl bledy" :
        (isWarning ? "Test zakonczony z ostrzezeniami" : "Test zakonczony pomyslnie");
    box.style.display = "block";
    box.style.borderLeft = "6px solid " + color;
    box.innerHTML =
        '<h3 style="color:' + color + ';margin-top:0;">' + title + '</h3>' +
        '<p><strong>ID testu:</strong> ' + report.testId + '</p>' +
        '<p>OK: <strong>' + report.passed + '</strong> &nbsp; ' +
        'Ostrzezenia: <strong>' + report.warnings + '</strong> &nbsp; ' +
        'Bledy: <strong>' + report.errors + '</strong></p>' +
        '<p>Czas: <strong>' + report.durationSeconds + ' s</strong></p>';
}

async function crmTestGet(parameters) {
    const query = Object.keys(parameters).map(key =>
        encodeURIComponent(key) + "=" + encodeURIComponent(parameters[key])
    ).join("&");
    const response = await fetch(APPS_SCRIPT_URL + "?" + query, {
        method: "GET",
        cache: "no-store"
    });
    const text = await response.text();
    if (!response.ok) throw new Error("HTTP " + response.status + ": " + text);
    try { return JSON.parse(text); }
    catch (error) { throw new Error("API nie zwrocilo JSON: " + text.substring(0, 500)); }
}

async function crmTestPost(payload) {
    const response = await fetch(APPS_SCRIPT_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify(payload)
    });
    const text = await response.text();
    if (!response.ok) throw new Error("HTTP " + response.status + ": " + text);
    try { return JSON.parse(text); }
    catch (error) { throw new Error("API nie zwrocilo JSON: " + text.substring(0, 500)); }
}

function crmTestFrontendChecks(report) {
    [
        "admin-panel-wrapper", "tab-dashboard", "tab-kalendarz", "tab-klienci",
        "tab-cennik", "tab-finanse", "tab-ustawienia", "booksy-grid",
        "clientsTableBody", "adminServicesTableBody", "settingsForm",
        "work_start_hour", "work_end_hour", "buffer_hours", "slot_interval_minutes",
        "start_offset_minutes", "cleanup_buffer_minutes", "schedule_cycle", "appointmentModal",
        "appointmentDetailsModal", "blockTimeModal", "clientModal", "serviceModal",
        "categoryModal", "crm-diagnostics-panel"
    ].forEach(id => {
        const exists = Boolean(document.getElementById(id));
        crmTestAdd(report, exists ? "OK" : "BLAD", "Element HTML #" + id,
            exists ? "Znaleziono" : "Nie znaleziono");
    });
    [
        "loadSystem", "loadServices", "loadSettings", "loadClients",
        "renderDashboard", "renderBooksyCalendar", "renderMiniMonthCalendar",
        "renderDayCalendar", "renderWeekCalendar", "renderMonthCalendar",
        "normalizeClientCounter", "renderClients", "renderServicesTable", "calculateFinanceReport",
        "saveSettings", "saveAppointment", "deleteAppointmentFromAdmin",
        "deleteBlockTimeFromAdmin", "deleteSelectedCalendarItemFromAdmin",
        "recordAppointmentLifecycle", "loadClientCRMProfile", "saveClientBookingMode",
        "getSmartNextVisitSuggestion", "saveFamilyScheduleEntry",
        "submitBlockTime", "saveClientModalData", "deleteClient",
        "saveDraftsToCloud", "publishDrafts"
    ].forEach(name => {
        const exists = typeof window[name] === "function";
        crmTestAdd(report, exists ? "OK" : "BLAD", "Funkcja " + name + "()",
            exists ? "Dostepna" : "Brak funkcji");
    });
}

async function crmTestApiChecks(report) {
    const busy = await crmTestGet({ checkBusy: "true", testTimestamp: Date.now() });
    const validBusy = busy && typeof busy === "object" && busy.settings &&
        typeof busy.settings === "object" && Array.isArray(busy.appointments);
    crmTestAdd(report, validBusy ? "OK" : "BLAD", "Odczyt ustawien i kalendarza",
        validBusy ? "Poprawna odpowiedz" : busy);
    if (!validBusy) throw new Error("Nieprawidlowa odpowiedz checkBusy");

    [
        "work_start_hour", "work_end_hour", "buffer_hours", "slot_interval_minutes",
        "start_offset_minutes", "cleanup_buffer_minutes", "schedule_cycle",
        "calendar_id", "colors", "all_categories"
    ].forEach(key => {
        const exists = Object.prototype.hasOwnProperty.call(busy.settings, key);
        crmTestAdd(report, exists ? "OK" : "OSTRZEZENIE", "Ustawienie " + key,
            exists ? busy.settings[key] : "Brak ustawienia");
    });
    const services = await crmTestGet({ getPrices: "true", testTimestamp: Date.now() });
    crmTestAdd(report, Array.isArray(services) ? "OK" : "BLAD", "Odczyt cennika",
        Array.isArray(services) ? "Liczba uslug: " + services.length : services);
    const clients = await crmTestGet({ getClients: "true", testTimestamp: Date.now() });
    crmTestAdd(report, Array.isArray(clients) ? "OK" : "BLAD", "Odczyt klientow",
        Array.isArray(clients) ? "Liczba klientow: " + clients.length : clients);
    return busy;
}

function crmTestLocalDate(daysForward, hour, minute) {
    const date = new Date();
    date.setDate(date.getDate() + daysForward);
    date.setHours(hour, minute, 0, 0);
    const p = value => String(value).padStart(2, "0");
    return date.getFullYear() + "-" + p(date.getMonth() + 1) + "-" + p(date.getDate()) +
        "T" + p(date.getHours()) + ":" + p(date.getMinutes());
}

function crmTestLocalDay(daysForward) {
    return crmTestLocalDate(daysForward, 0, 0).substring(0, 10);
}

function crmTestFinish(report, startedAtMs) {
    report.finishedAt = new Date().toISOString();
    report.durationSeconds = Math.round((Date.now() - startedAtMs) / 1000);
    report.status = report.errors > 0 ? "BLEDY" :
        (report.warnings > 0 ? "OSTRZEZENIA" : "ZALICZONY");
    crmTestRenderReport(report);
    crmTestRenderSummary(report);
}

async function saveCRMTestReport(report) {
    const result = await crmTestPost({ action: "saveTestReport", report: report });
    if (!result || !result.success) {
        throw new Error(result && result.error ? result.error : "Nie zapisano raportu");
    }
    return result;
}

async function runCRMQuickTest() {
    if (crmTestIsRunning) return alert("Test CRM jest juz uruchomiony.");
    crmTestSetRunning(true);
    const report = crmTestCreateReport("SZYBKI");
    crmLastTestReport = report;
    const started = Date.now();
    try {
        crmTestSetProgress(15, "Sprawdzanie HTML i JavaScript...");
        crmTestFrontendChecks(report);
        crmTestSetProgress(55, "Sprawdzanie API i danych...");
        await crmTestApiChecks(report);
    } catch (error) {
        crmTestAdd(report, "BLAD", "Glowny przebieg szybkiego testu", error.message || String(error));
    } finally {
        crmTestFinish(report, started);
        crmTestSetProgress(90, "Zapisywanie raportu...");
        try { await saveCRMTestReport(report); }
        catch (error) { crmTestAdd(report, "BLAD", "Zapis raportu", error.message || String(error)); crmTestFinish(report, started); }
        crmTestSetProgress(100, "Szybki test zakonczony.");
        crmTestSetRunning(false);
    }
}

async function runCRMFullTest() {
    if (crmTestIsRunning) return alert("Test CRM jest juz uruchomiony.");
    crmTestSetRunning(true);
    const report = crmTestCreateReport("PELNY");
    crmLastTestReport = report;
    const started = Date.now();
    const marker = Date.now();
    const phone = "TEST-" + marker;
    const clientName = "CRM_TEST_KLIENT_" + marker;
    const editedName = "CRM_TEST_EDYCJA_" + marker;
    const serviceName = "CRM_TEST_USLUGA_" + marker;
    const blockTitle = "CRM_TEST_BLOKADA_" + marker;
    const appointmentDate = crmTestLocalDate(20, 10, 15);
    const editedDate = crmTestLocalDate(20, 12, 30);
    let appointmentEventId = "";
    let blockEventId = "";
    report.testData = { marker, phone, clientName, editedName, serviceName, blockTitle };

    try {
        crmTestSetProgress(5, "Sprawdzanie HTML i JavaScript...");
        crmTestFrontendChecks(report);

        const savedViewMode = calendarViewMode;
        const savedSelectedDate = new Date(selectedCalendarDate);
        ["day", "week", "month"].forEach(mode => {
            setCalendarView(mode);
            const calendarGrid = document.getElementById("booksy-grid");
            crmTestAdd(
                report,
                calendarGrid && calendarGrid.dataset.calendarView === mode ? "OK" : "BLAD",
                "Renderowanie widoku " + mode,
                calendarGrid ? calendarGrid.dataset.calendarView : "Brak siatki kalendarza"
            );
        });
        selectedCalendarDate = savedSelectedDate;
        setCalendarView(savedViewMode);

        crmTestSetProgress(15, "Sprawdzanie API i ustawien...");
        await crmTestApiChecks(report);

        const extensionInit = await crmExtendedPost("initializeCRMExtensions");
        crmTestAdd(report, extensionInit && extensionInit.success ? "OK" : "BLAD",
            "Inicjalizacja modułów 3.3E-3.3H", extensionInit);

        const familyRead = await crmExtendedPost("getFamilySchedule", { fromDate: "", toDate: "" });
        crmTestAdd(report, familyRead && familyRead.success && Array.isArray(familyRead.entries) ? "OK" : "BLAD",
            "Odczyt grafiku rodzinnego", familyRead);

        const point35 = await crmExtendedPost("runPoint35Diagnostics");
        crmTestAdd(report, point35 && point35.success ? "OK" : "BLAD", "Diagnostyka końcowa 3.4 i 3.5", point35);
        crmTestAdd(report, point35 && point35.drive && point35.drive.folderAccessible ? "OK" : "BLAD", "Dostęp do folderu prawdziwego grafiku", point35 && point35.drive);
        crmTestAdd(report, point35 && point35.manualCorrectionHighestPriority ? "OK" : "BLAD", "Ręczna korekta ma najwyższy priorytet", point35);
        crmTestAdd(report, point35 && point35.privateCalendarProtection ? "OK" : "BLAD", "Ochrona prywatnych wydarzeń Google Calendar", point35);
        crmTestAdd(report, point35 && point35.smartVisitEngine ? "OK" : "BLAD", "Silnik inteligentnego kolejnego wizytu", point35);

        const backupResult = await crmExtendedPost("createFinalAdminBackup", { description: "Automatyczny backup testu " + report.testId });
        crmTestAdd(report, backupResult && backupResult.success ? "OK" : "BLAD", "Finalny backup ADMIN", backupResult);

        crmTestSetProgress(25, "Tworzenie klienta testowego...");
        const clientCreate = await crmTestPost({
            action: "saveClient", oldPhone: "",
            client: { name: clientName, phone, visits: 0, cancelled: 0, lastVisit: "" }
        });
        crmTestAdd(report, clientCreate.success ? "OK" : "BLAD", "Tworzenie klienta testowego", clientCreate);
        const clientEdit = await crmTestPost({
            action: "saveClient", oldPhone: phone,
            client: { name: editedName, phone, visits: 2, cancelled: 1, lastVisit: "" }
        });
        crmTestAdd(report, clientEdit.success ? "OK" : "BLAD", "Edycja klienta testowego", clientEdit);

        crmTestSetProgress(40, "Tworzenie wizyty testowej...");
        const appointmentCreate = await crmTestPost({
            action: "createBooking", phone, name: editedName, service: serviceName,
            date: appointmentDate, duration: 45, rodo: "Test automatyczny CRM"
        });
        crmTestAdd(report, appointmentCreate.success ? "OK" : "BLAD", "Tworzenie wizyty testowej", appointmentCreate);
        await crmTestWait(1500);
        let busy = await crmTestGet({ checkBusy: "true", testTimestamp: Date.now() });
        let appointment = busy.appointments.find(item =>
            String(item.phone) === phone && item.name === editedName && item.service === serviceName
        );
        if (appointment) appointmentEventId = appointment.eventId || "";
        crmTestAdd(report, appointment ? "OK" : "BLAD", "Odczyt utworzonej wizyty", appointment || "Nie znaleziono");
        crmTestAdd(report, appointmentEventId ? "OK" : "OSTRZEZENIE", "Event ID wizyty", appointmentEventId || "Brak Event ID");
        crmTestAdd(report, appointment && Number(appointment.duration) === 45 ? "OK" : "BLAD",
            "Czas trwania utworzonej wizyty", appointment ? appointment.duration + " min" : "Brak wizyty");

        let clientsAfterCreate = await crmTestGet({ getClients: "true", testTimestamp: Date.now() });
        let testClientStats = clientsAfterCreate.find(item => String(item.phone) === phone);
        crmTestAdd(report, testClientStats && Number(testClientStats.visits) === 1 ? "OK" : "BLAD",
            "Statystyka klienta po utworzeniu wizyty", testClientStats || "Nie znaleziono klienta");
        crmTestAdd(report, testClientStats && typeof testClientStats.visits === "number" ? "OK" : "BLAD",
            "Licznik wizyt klienta jest liczbą", testClientStats || "Nie znaleziono klienta");

        const conflictAttempt = await crmTestPost({
            action: "createBooking",
            phone: phone + "-KONFLIKT",
            name: "CRM_TEST_KONFLIKT_" + marker,
            service: serviceName + "_KONFLIKT",
            date: crmTestLocalDate(20, 11, 0),
            duration: 45,
            rodo: "Test konfliktu CRM"
        });
        const conflictRejected =
            conflictAttempt &&
            conflictAttempt.success === false &&
            conflictAttempt.code === "TIME_CONFLICT";
        crmTestAdd(report, conflictRejected ? "OK" : "BLAD",
            "Odrzucenie nakładającej się wizyty", conflictAttempt);

        crmTestSetProgress(52, "Edytowanie wizyty testowej...");
        if (appointmentEventId) {
            const appointmentEdit = await crmTestPost({
                action: "createBooking", editFlag: true, oldEventId: appointmentEventId,
                oldDate: appointmentDate, oldName: editedName, phone, name: editedName,
                service: serviceName + "_EDYCJA", date: editedDate, duration: 60,
                rodo: "Edycja automatyczna CRM"
            });
            crmTestAdd(report, appointmentEdit.success ? "OK" : "BLAD", "Edycja wizyty testowej", appointmentEdit);
            await crmTestWait(1500);
            busy = await crmTestGet({ checkBusy: "true", testTimestamp: Date.now() });
            appointment = busy.appointments.find(item =>
                String(item.phone) === phone && item.service === serviceName + "_EDYCJA"
            );
            if (appointment) appointmentEventId = appointment.eventId || appointmentEventId;
            crmTestAdd(report, appointment ? "OK" : "BLAD", "Weryfikacja wizyty po edycji", appointment || "Nie znaleziono");
            crmTestAdd(report, appointment && Number(appointment.duration) === 60 ? "OK" : "BLAD",
                "Czas trwania wizyty po edycji", appointment ? appointment.duration + " min" : "Brak wizyty");

            const clientsAfterEdit = await crmTestGet({ getClients: "true", testTimestamp: Date.now() });
            testClientStats = clientsAfterEdit.find(item => String(item.phone) === phone);
            crmTestAdd(report, testClientStats && Number(testClientStats.visits) === 1 ? "OK" : "BLAD",
                "Edycja nie zwiększa licznika wizyt", testClientStats || "Nie znaleziono klienta");
        }

        crmTestSetProgress(65, "Tworzenie blokady testowej...");
        const blockCreate = await crmTestPost({
            action: "blockTime", blockType: "hours", date: crmTestLocalDay(21),
            startTime: "14:10", endTime: "15:20", title: blockTitle
        });
        if (blockCreate.success) blockEventId = blockCreate.eventId || "";
        crmTestAdd(report, blockCreate.success ? "OK" : "BLAD", "Tworzenie blokady testowej", blockCreate);
        crmTestAdd(report, blockEventId ? "OK" : "OSTRZEZENIE", "Event ID blokady", blockEventId || "Brak Event ID");

        crmTestSetProgress(78, "Sprzatanie danych testowych...");
        if (appointmentEventId) {
            const result = await crmTestPost({
                action: "createBooking", deleteFlag: true, eventId: appointmentEventId,
                date: editedDate, name: editedName
            });
            let deletionSucceeded = Boolean(result && result.success);
            if (!deletionSucceeded) {
                await crmTestWait(700);
                const verificationBusy = await crmTestGet({ checkBusy: "true", testTimestamp: Date.now() });
                const stillExists = verificationBusy && Array.isArray(verificationBusy.appointments)
                    ? verificationBusy.appointments.some(item => item.eventId === appointmentEventId)
                    : true;
                deletionSucceeded = !stillExists;
            }
            crmTestAdd(report, deletionSucceeded ? "OK" : "BLAD", "Usuwanie wizyty testowej",
                deletionSucceeded && (!result || !result.success)
                    ? "Wizyta usunięta; odpowiedź API została utracona, stan potwierdzony odczytem"
                    : result);
            await crmTestWait(500);
            const clientsAfterAppointmentDelete = await crmTestGet({ getClients: "true", testTimestamp: Date.now() });
            testClientStats = clientsAfterAppointmentDelete.find(item => String(item.phone) === phone);
            const customerRemovedAfterCleanup = !testClientStats;
            const customerCounterReset = testClientStats && Number(testClientStats.visits) === 0;
            crmTestAdd(report, customerRemovedAfterCleanup || customerCounterReset ? "OK" : "BLAD",
                "Licznik klienta po usunięciu wizyty",
                customerRemovedAfterCleanup
                    ? "Klient testowy bez wizyt został automatycznie usunięty"
                    : testClientStats);
        }
        if (blockEventId) {
            const result = await crmTestPost({
                action: "deleteBlockTime", eventId: blockEventId,
                start: crmTestLocalDay(21) + "T14:10", end: crmTestLocalDay(21) + "T15:20", title: blockTitle
            });
            crmTestAdd(report, result.success ? "OK" : "BLAD", "Usuwanie blokady przez deleteBlockTime", result);
        }
        const clientDelete = await crmTestPost({ action: "deleteClient", phone });
        crmTestAdd(report, clientDelete.success ? "OK" : "BLAD", "Usuwanie klienta testowego", clientDelete);

        crmTestSetProgress(88, "Weryfikacja sprzatania...");
        await crmTestWait(1200);
        const finalClients = await crmTestGet({ getClients: "true", testTimestamp: Date.now() });
        const clientExists = Array.isArray(finalClients) && finalClients.some(item => String(item.phone) === phone);
        crmTestAdd(report, !clientExists ? "OK" : "BLAD", "Kontrola usuniecia klienta",
            !clientExists ? "Klient usuniety" : "Klient nadal istnieje");
        const finalBusy = await crmTestGet({ checkBusy: "true", testTimestamp: Date.now() });
        const appointmentExists = finalBusy.appointments.some(item => item.eventId === appointmentEventId || String(item.phone) === phone);
        const blockExists = finalBusy.appointments.some(item => item.eventId === blockEventId || item.name === blockTitle);
        crmTestAdd(report, !appointmentExists ? "OK" : "BLAD", "Kontrola usuniecia wizyty",
            !appointmentExists ? "Wizyta usunieta" : "Wizyta nadal istnieje");
        crmTestAdd(report, !blockExists ? "OK" : "BLAD", "Kontrola usuniecia blokady",
            !blockExists ? "Blokada usunieta" : "Blokada nadal istnieje");
    } catch (error) {
        crmTestAdd(report, "BLAD", "Glowny przebieg pelnego testu", error.message || String(error));
        try { await crmTestPost({ action: "deleteClient", phone }); } catch (cleanupError) { console.error(cleanupError); }
    } finally {
        crmTestFinish(report, started);
        crmTestSetProgress(95, "Zapisywanie raportu w Google Sheets...");
        try { await saveCRMTestReport(report); }
        catch (error) { crmTestAdd(report, "BLAD", "Zapis raportu", error.message || String(error)); crmTestFinish(report, started); }
        crmTestSetProgress(100, "Pelny test CRM zakonczony.");
        crmTestSetRunning(false);
        try { await loadSystem(); } catch (error) { console.error("Blad odswiezenia po tescie:", error); }
    }
}

async function copyCRMTestReport() {
    if (!crmLastTestReport) return alert("Nie ma jeszcze raportu do skopiowania.");
    const text = buildCRMTestTextReport(crmLastTestReport);
    try {
        await navigator.clipboard.writeText(text);
        alert("Raport zostal skopiowany.");
    } catch (error) {
        const field = document.createElement("textarea");
        field.value = text;
        document.body.appendChild(field);
        field.select();
        document.execCommand("copy");
        field.remove();
        alert("Raport zostal skopiowany.");
    }
}

async function loadCRMTestHistory() {
    const container = document.getElementById("crm-test-history");
    if (!container) return;
    container.style.display = "block";
    container.textContent = "Ladowanie historii testow...";
    try {
        const response = await crmTestPost({ action: "getTestReports", limit: 10 });
        if (!response.success || !Array.isArray(response.reports)) {
            throw new Error(response.error || "Nieprawidlowa odpowiedz");
        }
        if (response.reports.length === 0) {
            container.innerHTML = "<p>Brak zapisanych raportow.</p>";
            return;
        }
        let html = '<h3>Ostatnie testy CRM</h3><div style="overflow-x:auto;">' +
            '<table class="admin-table"><thead><tr><th>Data</th><th>ID</th><th>Typ</th>' +
            '<th>Status</th><th>OK</th><th>Ostrzezenia</th><th>Bledy</th><th>Czas</th>' +
            '</tr></thead><tbody>';
        response.reports.forEach(item => {
            html += "<tr><td>" + (item.date || "") + "</td><td>" + (item.testId || "") +
                "</td><td>" + (item.testType || "") + "</td><td>" + (item.status || "") +
                "</td><td>" + (item.passed || 0) + "</td><td>" + (item.warnings || 0) +
                "</td><td>" + (item.errors || 0) + "</td><td>" +
                (item.durationSeconds || 0) + " s</td></tr>";
        });
        container.innerHTML = html + "</tbody></table></div>";
    } catch (error) {
        container.innerHTML = '<p style="color:#b42318;">Blad historii: ' +
            String(error.message || error) + "</p>";
    }
}

/* ==========================================================
   KONIEC DIAGNOSTYKI SYSTEMU CRM
   TEN KOMENTARZ MUSI POZOSTAC NA SAMYM KONCU ADMIN.JS.
   ========================================================== */


/* ==========================================================
   CENNIK: KATEGORIE, KOLORY I KOLEJNOSC
   ========================================================== */
function crmPriceId(prefix) {
    return prefix + "-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 8);
}

function crmPreparePriceStructure() {
    const seenCategories = new Map();
    currentServices.forEach((service, index) => {
        service.serviceId = service.serviceId || crmPriceId("srv");
        service.serviceOrder = Number(service.serviceOrder) > 0 ? Number(service.serviceOrder) : index + 1;
        const name = String(service.category || "Inne").trim() || "Inne";
        service.category = name;
        if (!seenCategories.has(name)) {
            seenCategories.set(name, {
                categoryId: service.categoryId || crmPriceId("cat"),
                categoryOrder: Number(service.categoryOrder) > 0 ? Number(service.categoryOrder) : seenCategories.size + 1,
                categoryColor: service.categoryColor || globalColors[name] || "#b05c75"
            });
        }
        const meta = seenCategories.get(name);
        service.categoryId = meta.categoryId;
        service.categoryOrder = meta.categoryOrder;
        service.categoryColor = meta.categoryColor;
        globalColors[name] = meta.categoryColor;
    });
    currentServices.sort((a, b) => Number(a.categoryOrder) - Number(b.categoryOrder) || Number(a.serviceOrder) - Number(b.serviceOrder));
}

function crmCategoriesFromPrices() {
    crmPreparePriceStructure();
    const map = new Map();
    currentServices.forEach((service, serviceIndex) => {
        if (!map.has(service.categoryId)) {
            map.set(service.categoryId, {
                id: service.categoryId,
                name: service.category,
                color: service.categoryColor,
                order: Number(service.categoryOrder),
                services: []
            });
        }
        map.get(service.categoryId).services.push({ service, serviceIndex });
    });
    return Array.from(map.values()).sort((a, b) => a.order - b.order);
}

function crmNormalizePriceOrder() {
    const categories = crmCategoriesFromPrices();
    categories.forEach((category, categoryIndex) => {
        category.services.sort((a, b) => Number(a.service.serviceOrder) - Number(b.service.serviceOrder));
        category.services.forEach((item, serviceIndex) => {
            item.service.categoryOrder = categoryIndex + 1;
            item.service.serviceOrder = serviceIndex + 1;
            item.service.category = category.name;
            item.service.categoryId = category.id;
            item.service.categoryColor = category.color;
        });
    });
    currentServices.sort((a, b) => Number(a.categoryOrder) - Number(b.categoryOrder) || Number(a.serviceOrder) - Number(b.serviceOrder));
}

function crmMoveCategory(categoryId, direction) {
    const categories = crmCategoriesFromPrices();
    const index = categories.findIndex(category => category.id === categoryId);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= categories.length) return;
    const firstOrder = categories[index].order;
    categories[index].services.forEach(item => item.service.categoryOrder = categories[target].order);
    categories[target].services.forEach(item => item.service.categoryOrder = firstOrder);
    crmNormalizePriceOrder();
    renderServicesTable();
}

function crmMoveService(serviceId, direction) {
    crmPreparePriceStructure();
    const service = currentServices.find(item => item.serviceId === serviceId);
    if (!service) return;
    const siblings = currentServices.filter(item => item.categoryId === service.categoryId)
        .sort((a, b) => Number(a.serviceOrder) - Number(b.serviceOrder));
    const index = siblings.findIndex(item => item.serviceId === serviceId);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= siblings.length) return;
    const oldOrder = siblings[index].serviceOrder;
    siblings[index].serviceOrder = siblings[target].serviceOrder;
    siblings[target].serviceOrder = oldOrder;
    crmNormalizePriceOrder();
    renderServicesTable();
}

function crmChangeCategoryColor(categoryId, color) {
    currentServices.filter(service => service.categoryId === categoryId).forEach(service => service.categoryColor = color);
    renderServicesTable();
}

function crmEditCategory(categoryId) {
    const category = crmCategoriesFromPrices().find(item => item.id === categoryId);
    if (!category) return;
    const newName = prompt("Nazwa kategorii:", category.name);
    if (newName === null) return;
    const cleanName = newName.trim();
    if (!cleanName) return alert("Nazwa kategorii nie może być pusta.");
    const duplicate = crmCategoriesFromPrices().some(item => item.id !== categoryId && item.name.toLowerCase() === cleanName.toLowerCase());
    if (duplicate) return alert("Taka kategoria już istnieje.");
    currentServices.filter(service => service.categoryId === categoryId).forEach(service => service.category = cleanName);
    renderServicesTable();
}

function renderServicesTable() {
    const tbody = document.getElementById("adminServicesTableBody");
    if (!tbody) return;
    crmPreparePriceStructure();
    const table = tbody.closest("table");
    if (table) {
        const head = table.querySelector("thead tr");
        if (head) head.innerHTML = "<th>Kategoria i usługi</th>";
    }
    tbody.innerHTML = "";
    const categories = crmCategoriesFromPrices();
    if (!categories.length) {
        tbody.innerHTML = '<tr><td style="text-align:center">Brak kategorii i usług</td></tr>';
        return;
    }
    categories.forEach((category, categoryIndex) => {
        const categoryRow = document.createElement("tr");
        categoryRow.className = "crm-price-category-row";
        categoryRow.innerHTML = `<td>
          <details open class="crm-price-category" data-category-id="${category.id}">
            <summary style="display:flex;align-items:center;gap:10px;cursor:pointer;padding:10px 0">
              <span style="width:16px;height:16px;border-radius:4px;background:${category.color};display:inline-block"></span>
              <strong style="flex:1">${category.name}</strong>
              <span>${category.services.length} usług</span>
              <button type="button" class="btn-secondary" ${categoryIndex === 0 ? "disabled" : ""} onclick="event.preventDefault();crmMoveCategory('${category.id}',-1)">↑</button>
              <button type="button" class="btn-secondary" ${categoryIndex === categories.length - 1 ? "disabled" : ""} onclick="event.preventDefault();crmMoveCategory('${category.id}',1)">↓</button>
              <input type="color" value="${category.color}" title="Kolor kategorii" onclick="event.stopPropagation()" onchange="crmChangeCategoryColor('${category.id}',this.value)">
              <button type="button" class="btn-secondary" onclick="event.preventDefault();crmEditCategory('${category.id}')">Edytuj kategorię</button>
            </summary>
            <div style="overflow:auto">
              <table style="width:100%"><thead><tr><th>Kolejność</th><th>Usługa</th><th>Cena</th><th>Czas</th><th>Status</th><th>Akcje</th></tr></thead>
              <tbody>${category.services.map((item, serviceIndex) => `<tr>
                <td><button type="button" class="btn-secondary" ${serviceIndex === 0 ? "disabled" : ""} onclick="crmMoveService('${item.service.serviceId}',-1)">↑</button> <button type="button" class="btn-secondary" ${serviceIndex === category.services.length - 1 ? "disabled" : ""} onclick="crmMoveService('${item.service.serviceId}',1)">↓</button></td>
                <td>${item.service.name || ""}</td><td>${Number(item.service.price || 0)} zł</td><td>${Number(item.service.duration || 0)} min</td><td>${item.service.status || ""}</td>
                <td><button class="btn-secondary" onclick="editService(${item.serviceIndex})">Edytuj</button> <button class="btn-danger" onclick="deleteService(${item.serviceIndex})">Usuń</button></td>
              </tr>`).join("")}</tbody></table>
            </div>
          </details>
        </td>`;
        tbody.appendChild(categoryRow);
    });
}

function saveServiceModalData() {
    const index = parseInt(document.getElementById("editServiceIndex").value, 10);
    const previous = index >= 0 ? currentServices[index] : null;
    const categoryName = document.getElementById("serviceCategory").value.trim();
    const category = crmCategoriesFromPrices().find(item => item.name === categoryName);
    const serviceData = {
        ...(previous || {}),
        serviceId: previous?.serviceId || crmPriceId("srv"),
        category: categoryName,
        categoryId: category?.id || previous?.categoryId || crmPriceId("cat"),
        categoryOrder: category?.order || previous?.categoryOrder || crmCategoriesFromPrices().length + 1,
        categoryColor: category?.color || previous?.categoryColor || "#b05c75",
        serviceOrder: previous?.categoryId === category?.id ? previous.serviceOrder : ((category?.services.length || 0) + 1),
        name: document.getElementById("serviceName").value.trim(),
        price: Number(document.getElementById("servicePrice").value) || 0,
        duration: Number(document.getElementById("serviceDuration").value) || 60,
        showPrice: "Tak", showDuration: "Tak",
        status: document.getElementById("serviceStatus").value || "Szkic"
    };
    if (!serviceData.category || !serviceData.name) return alert("Wpisz kategorię i nazwę usługi.");
    if (index >= 0) currentServices[index] = serviceData; else currentServices.push(serviceData);
    crmNormalizePriceOrder();
    renderServicesTable();
    closeServiceModal();
    alert("Usługa zapisana lokalnie. Zapisz szkic, a następnie opublikuj cennik.");
}

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
/* KONIEC CENNIKA */

/* ==========================================================
   CENNIK: WYBOR KATEGORII I ZABIEGU W FORMULARZU
   ========================================================== */
function crmReplaceServiceFormInputs() {
    const categoryInput = document.getElementById("serviceCategory");
    const serviceInput = document.getElementById("serviceName");
    if (!categoryInput || !serviceInput) return;

    if (categoryInput.tagName !== "SELECT") {
        const select = document.createElement("select");
        Array.from(categoryInput.attributes).forEach(attribute => select.setAttribute(attribute.name, attribute.value));
        select.id = "serviceCategory";
        select.name = categoryInput.name || "serviceCategory";
        select.innerHTML = '<option value="">Wybierz kategorię</option>';
        categoryInput.replaceWith(select);
    }

    const currentServiceInput = document.getElementById("serviceName");
    if (currentServiceInput && !currentServiceInput.getAttribute("list")) {
        currentServiceInput.setAttribute("list", "crmServiceNamesList");
        currentServiceInput.setAttribute("autocomplete", "off");
        currentServiceInput.placeholder = "Wybierz lub wpisz nazwę zabiegu";
        const datalist = document.createElement("datalist");
        datalist.id = "crmServiceNamesList";
        currentServiceInput.after(datalist);
    }

    crmRefreshServiceFormChoices();
}

function crmRefreshServiceFormChoices(selectedCategory, selectedService) {
    const select = document.getElementById("serviceCategory");
    if (!select || select.tagName !== "SELECT") return;
    const current = selectedCategory !== undefined ? selectedCategory : select.value;
    const categories = crmCategoriesFromPrices();
    select.innerHTML = '<option value="">Wybierz kategorię</option>' + categories
        .map(category => `<option value="${category.name.replace(/"/g, "&quot;")}">${category.name}</option>`)
        .join("");
    if (current && !categories.some(category => category.name === current)) {
        const option = document.createElement("option");
        option.value = current;
        option.textContent = current;
        select.appendChild(option);
    }
    select.value = current || "";

    const list = document.getElementById("crmServiceNamesList");
    if (list) {
        const names = [...new Set(currentServices
            .filter(service => !select.value || service.category === select.value)
            .map(service => String(service.name || "").trim())
            .filter(Boolean))];
        list.innerHTML = names.map(name => `<option value="${name.replace(/"/g, "&quot;")}"></option>`).join("");
    }
    if (selectedService !== undefined) document.getElementById("serviceName").value = selectedService || "";
}

document.addEventListener("change", event => {
    if (event.target && event.target.id === "serviceCategory") crmRefreshServiceFormChoices();
});

const crmOriginalOpenAddServiceModal = openAddServiceModal;
openAddServiceModal = function() {
    crmOriginalOpenAddServiceModal();
    crmReplaceServiceFormInputs();
    crmRefreshServiceFormChoices("", "");
};

const crmOriginalEditService = editService;
editService = function(index) {
    const service = currentServices[index];
    crmReplaceServiceFormInputs();
    crmOriginalEditService(index);
    if (service) crmRefreshServiceFormChoices(service.category || "", service.name || "");
};

const crmOriginalLoadServicesForChoices = loadServices;
loadServices = async function() {
    await crmOriginalLoadServicesForChoices();
    crmReplaceServiceFormInputs();
    crmRefreshServiceFormChoices();
};

document.addEventListener("DOMContentLoaded", () => setTimeout(crmReplaceServiceFormInputs, 300));
/* KONIEC WYBORU KATEGORII I ZABIEGU */


// ==========================================================
// ADMIN V2: prośby o wizytę i porządek cennika
// ==========================================================
async function loadBookingRequests(){
  const box=document.getElementById('bookingRequestsList');if(!box)return;box.innerHTML='Ładowanie...';
  try{const r=await crmPost({action:'getBookingRequests'});const rows=r.requests||[];box.innerHTML=rows.length?'':'Brak oczekujących próśb.';
    rows.forEach(x=>{const d=document.createElement('div');d.className='dashboard-card';d.innerHTML=`<strong>${x.client}</strong><br>${x.service}<br>Główny: ${x.main}<br>Alternatywny: ${x.alternative}<br><small>${x.reason||''}</small><div style="margin-top:10px"><button class="btn-primary" data-choice="MAIN">Potwierdź główny</button> <button class="btn-secondary" data-choice="ALT">Potwierdź alternatywny</button> <button class="btn-danger" data-choice="REJECT">Odrzuć oba</button></div>`;d.querySelectorAll('button').forEach(b=>b.onclick=async()=>{if(b.disabled)return;d.querySelectorAll('button').forEach(z=>z.disabled=true);const res=await crmPost({action:'decideBookingRequest',requestId:x.id,choice:b.dataset.choice});if(!res.success)alert(res.error||'Błąd');await loadBookingRequests();await loadSystem();});box.appendChild(d);});
  }catch(e){box.textContent='Błąd pobierania próśb.';}
}
const _switchTabV2=switchTab;switchTab=function(name){_switchTabV2(name);if(name==='ustawienia')loadBookingRequests();};


/* ==========================================================
   ADMIN V3: BOOKSY WORKSPACE, STATUSY I OCZEKUJĄCE
   Warstwa interfejsu. Nie zmienia endpointów Google Apps Script.
   ========================================================== */
const CRM_V3_STATUS_META = {
    CONFIRMED: { icon: "✅", label: "POTWIERDZONO", css: "confirmed" },
    PENDING: { icon: "⏳", label: "OCZEKUJE POTWIERDZENIA", css: "pending" },
    ALTERNATIVE: { icon: "🔄", label: "TERMIN ALTERNATYWNY", css: "alternative" },
    CONTACT: { icon: "📞", label: "WYMAGA KONTAKTU", css: "contact" },
    CANCELLED_CLIENT: { icon: "🚫", label: "ANULOWANA PRZEZ KLIENTA", css: "cancelled-client" },
    CANCELLED_SALON: { icon: "⛔", label: "ANULOWANA PRZEZ SALON", css: "cancelled-salon" },
    COMPLETED: { icon: "⭐", label: "ZREALIZOWANA", css: "completed" }
};

function crmV3NormalizeStatus(item) {
    const raw = String(item?.crmStatus || item?.status || item?.bookingStatus || "CONFIRMED")
        .trim().toUpperCase();
    const map = {
        "POTWIERDZONA":"CONFIRMED", "POTWIERDZONO":"CONFIRMED", "CONFIRMED":"CONFIRMED",
        "OCZEKUJE":"PENDING", "OCZEKUJE_POTWIERDZENIA":"PENDING", "PENDING":"PENDING",
        "TERMIN_ALTERNATYWNY":"ALTERNATIVE", "ALTERNATIVE":"ALTERNATIVE",
        "WYMAGA_KONTAKTU":"CONTACT", "CONTACT":"CONTACT",
        "ANULOWANA_PRZEZ_KLIENTA":"CANCELLED_CLIENT", "CANCELLED_CLIENT":"CANCELLED_CLIENT",
        "ANULOWANA_PRZEZ_SALON":"CANCELLED_SALON", "CANCELLED_SALON":"CANCELLED_SALON",
        "ZREALIZOWANA":"COMPLETED", "COMPLETED":"COMPLETED"
    };
    return map[raw] || "CONFIRMED";
}

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

const crmV3RenderAppointmentCardOriginal = renderAppointmentCard;
renderAppointmentCard = function(app, container) {
    const before = container.children.length;
    crmV3RenderAppointmentCardOriginal(app, container);
    crmV3ApplyStatusToElement(container.children[before], app);
};

const crmV3RenderCompactEventOriginal = renderCompactCalendarEvent;
renderCompactCalendarEvent = function(item, container, mode) {
    const before = container.children.length;
    crmV3RenderCompactEventOriginal(item, container, mode);
    crmV3ApplyStatusToElement(container.children[before], item);
};

function crmV3UpdateDetailsStatus(item) {
    const modal = document.getElementById("appointmentDetailsModal");
    if (!modal) return;
    const key = crmV3NormalizeStatus(item);
    const meta = CRM_V3_STATUS_META[key];
    modal.dataset.crmStatus = meta.css;
    const title = document.getElementById("appointmentDetailsTitle");
    if (title && item?.eventType === "appointment") title.textContent = meta.icon + " " + meta.label;
}

const crmV3OpenDetailsOriginal = openAppointmentDetailsModal;
openAppointmentDetailsModal = function(item) {
    crmV3OpenDetailsOriginal(item);
    crmV3UpdateDetailsStatus(item);
    document.body.classList.add("crm-v3-details-open");
};

const crmV3CloseDetailsOriginal = closeAppointmentModal;
closeAppointmentModal = function() {
    crmV3CloseDetailsOriginal();
    document.body.classList.remove("crm-v3-details-open");
};

function crmV3SetPendingCount(value) {
    const count = Math.max(0, Number(value) || 0);
    const node = document.getElementById("crmPendingRequestsCount");
    const button = document.getElementById("crmPendingRequestsBtn");
    if (node) node.textContent = String(count);
    if (button) button.classList.toggle("has-items", count > 0);
}

function crmFocusPendingRequests() {
    const panel = document.getElementById("booking-requests-panel");
    if (!panel) return;
    panel.open = true;
    panel.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

const crmV3LoadBookingRequestsOriginal = loadBookingRequests;
loadBookingRequests = async function() {
    await crmV3LoadBookingRequestsOriginal();
    const list = document.getElementById("bookingRequestsList");
    const cards = list ? list.querySelectorAll(":scope > .dashboard-card").length : 0;
    crmV3SetPendingCount(cards);
};

function crmV3MoveRequestsToCalendar() {
    const panel = document.getElementById("booking-requests-panel");
    const sidebar = document.querySelector("#tab-kalendarz .calendar-sidebar");
    if (panel && sidebar && panel.parentNode !== sidebar) sidebar.appendChild(panel);
}

function crmV3InitializeWorkspace() {
    crmV3MoveRequestsToCalendar();
    loadBookingRequests().catch(console.error);
}

document.addEventListener("DOMContentLoaded", function() {
    setTimeout(crmV3InitializeWorkspace, 450);
});
/* KONIEC ADMIN V3 */


/* ==========================================================
   ADMIN V4: NOWY PANEL WIZYTY BOOKSY WORKSPACE
   ========================================================== */
function crmEscapePanelValue(value, fallback) {
    const text = String(value ?? "").trim();
    return text || (fallback || "—");
}
function crmParseVisitDate(value) {
    const raw = String(value || "");
    const parsed = new Date(raw);
    if (!Number.isNaN(parsed.getTime())) return parsed;
    const match = raw.match(/(\d{1,2})[.\/-](\d{1,2})[.\/-](\d{4}).*?(\d{1,2}):(\d{2})/);
    if (!match) return null;
    return new Date(Number(match[3]), Number(match[2])-1, Number(match[1]), Number(match[4]), Number(match[5]));
}
function crmFormatVisitDay(date) {
    if (!date) return "Data wizyty";
    const text = date.toLocaleDateString("pl-PL", {weekday:"short",day:"numeric",month:"short"});
    return text.charAt(0).toUpperCase() + text.slice(1).replace(/\.$/, "");
}
function crmFormatVisitTime(date) {
    return date ? date.toLocaleTimeString("pl-PL", {hour:"2-digit",minute:"2-digit"}) : "—";
}
function crmFindServiceForVisit(app) {
    const name = String(app?.service || "").trim().toLowerCase();
    return (Array.isArray(currentServices) ? currentServices : []).find(item => String(item.name || "").trim().toLowerCase() === name) || null;
}
function crmGetServicePriceText(app) {
    const service = crmFindServiceForVisit(app);
    const value = app?.price ?? service?.price;
    if (value === undefined || value === null || value === "") return "—";
    const number = Number(String(value).replace(",","."));
    return Number.isFinite(number) ? number.toLocaleString("pl-PL", {minimumFractionDigits:2,maximumFractionDigits:2}) + " zł" : String(value);
}
function crmGetVisitWorker(app) {
    return crmEscapePanelValue(app?.worker || app?.employee || app?.master || app?.staffName, "Nie przypisano");
}
function crmGetVisitEquipment(app) {
    return crmEscapePanelValue(app?.equipment || app?.room || app?.cabinet, "Nie przypisano");
}
function crmInitial(name) {
    const value = String(name || "K").trim();
    return (Array.from(value)[0] || "K").toUpperCase();
}
function crmSwitchVisitPanelTab(tab) {
    const visit = tab !== "info";
    document.getElementById("crmVisitTabVisit")?.classList.toggle("active", visit);
    document.getElementById("crmVisitTabInfo")?.classList.toggle("active", !visit);
    const visitContent = document.getElementById("crmVisitTabContent");
    const infoContent = document.getElementById("crmInfoTabContent");
    if (visitContent) visitContent.hidden = !visit;
    if (infoContent) infoContent.hidden = visit;
}
function crmToggleVisitStatusMenu(force) {
    const menu = document.getElementById("crmVisitStatusMenu");
    if (!menu) return;
    menu.hidden = typeof force === "boolean" ? !force : !menu.hidden;
}
async function crmVisitStatusAction(action) {
    crmToggleVisitStatusMenu(false);
    if (action === "COMPLETED") return completeCurrentAppointment();
    if (action === "NO_SHOW") return markCurrentAppointmentNoShow();
    if (action === "CANCEL_CLIENT") return cancelAppointmentWithHistory("KLIENT", "");
    if (action === "CANCEL_SALON") return cancelAppointmentWithHistory("MISTRZYNI", "");
}
function crmPopulateNewVisitPanel(app) {
    const isAppointment = app?.eventType === "appointment";
    const date = crmParseVisitDate(app?.date);
    const duration = Math.max(0, Number(app?.duration) || 0);
    const end = date ? new Date(date.getTime() + duration * 60000) : null;
    const service = crmFindServiceForVisit(app);
    const name = crmEscapePanelValue(app?.name, isAppointment ? "Klient" : "Wydarzenie");

    setText("details-name", name);
    setText("details-phone", crmEscapePanelValue(app?.phone, "Numer telefonu jest ukryty"));
    setText("details-service", crmEscapePanelValue(app?.service, "Brak usługi"));
    setText("details-duration", duration || 0);
    setText("details-datetime", crmFormatDateTime(app?.date));
    setText("crmInfoClient", name);
    setText("crmInfoService", crmEscapePanelValue(app?.service, "Brak usługi"));
    setText("crmInfoSource", crmEscapePanelValue(app?.source || app?.eventType, "CRM"));
    setText("crmClientAvatar", crmInitial(name));
    setText("crmVisitReservationId", "ID rezerwacji klienta: " + crmEscapePanelValue(app?.requestId || app?.eventId || app?.id, "—"));
    setText("crmVisitDateHeading", crmFormatVisitDay(date));
    setText("crmVisitStart", crmFormatVisitTime(date));
    setText("crmVisitEnd", crmFormatVisitTime(end));
    setText("crmVisitWorker", crmGetVisitWorker(app));
    setText("crmVisitEquipment", crmGetVisitEquipment(app));
    setText("crmServiceDescription", crmEscapePanelValue(app?.serviceDescription || service?.description, "Usługa salonowa"));
    setText("crmServicePrice", crmGetServicePriceText(app));

    const stripe = document.getElementById("crmServiceStripe");
    if (stripe) stripe.style.background = app?.color || service?.color || "#d6df73";
    const group = document.getElementById("crmVisitGroupFlag");
    const recurring = document.getElementById("crmVisitRecurringFlag");
    if (group) group.hidden = !(app?.group || app?.isGroup);
    if (recurring) recurring.hidden = !(app?.recurring || app?.isRecurring);
    const statusButton = document.getElementById("crmVisitStatusButton");
    const repeatButton = document.getElementById("crmRepeatVisitBtn");
    const settleButton = document.getElementById("crmSettleVisitBtn");
    if (statusButton) statusButton.hidden = !isAppointment;
    if (repeatButton) repeatButton.hidden = !isAppointment;
    if (settleButton) settleButton.hidden = !isAppointment;
    crmSwitchVisitPanelTab("visit");
    crmToggleVisitStatusMenu(false);
}
const crmV4OpenDetailsOriginal = openAppointmentDetailsModal;
openAppointmentDetailsModal = function(app) {
    crmV4OpenDetailsOriginal(app);
    crmPopulateNewVisitPanel(app);
};
document.addEventListener("click", function(event) {
    const menu = document.getElementById("crmVisitStatusMenu");
    const button = document.getElementById("crmVisitStatusButton");
    if (menu && !menu.hidden && !menu.contains(event.target) && !button?.contains(event.target)) menu.hidden = true;
});
/* KONIEC ADMIN V4 */

/* ==========================================================
   ADMIN V5: WIDOK DNIA NA OSI CZASU
   ========================================================== */
function crmDayMinutes(value, fallback) {
    const match = String(value || "").match(/^(\d{1,2}):(\d{2})/);
    return match ? Number(match[1]) * 60 + Number(match[2]) : fallback;
}
function crmDaySettingsRange() {
    const start = crmDayMinutes(settingsData?.work_start_hour, 8 * 60);
    const end = crmDayMinutes(settingsData?.work_end_hour, 21 * 60);
    return {start: Math.min(start, end - 60), end: Math.max(end, start + 60)};
}
function crmDayEventDate(item) {
    if (typeof crmParseVisitDate === "function") return crmParseVisitDate(item?.date);
    const date = new Date(item?.date || "");
    return Number.isNaN(date.getTime()) ? null : date;
}
function crmDayEventColor(item) {
    if (item?.eventType === "block") return "#ddd6dc";
    if (item?.eventType === "external") return "#d9dde4";
    if (item?.eventType === "work_shift") return "#f5d976";
    const service = (Array.isArray(currentServices) ? currentServices : []).find(value =>
        value.name && item?.service && value.name.trim().toLowerCase() === item.service.trim().toLowerCase()
    );
    return item?.color || (service && globalColors[service.category]) || "#e8bfd0";
}
function crmDayPastelColor(color) {
    const source = String(color || "#e8bfd0").trim();
    if (!/^#[0-9a-f]{6}$/i.test(source)) return {background:"#f5dfe8", border:"#d8799e"};
    const red = parseInt(source.slice(1,3),16);
    const green = parseInt(source.slice(3,5),16);
    const blue = parseInt(source.slice(5,7),16);
    const mix = component => Math.round(component * .28 + 255 * .72);
    return {
        background:`rgb(${mix(red)},${mix(green)},${mix(blue)})`,
        border:`rgb(${Math.round(red*.7)},${Math.round(green*.7)},${Math.round(blue*.7)})`
    };
}
function crmDayAssignLanes(items) {
    const sorted = [...items].sort((a,b) => a.start - b.start || a.end - b.end);
    const laneEnds = [];
    sorted.forEach(entry => {
        let lane = laneEnds.findIndex(end => end <= entry.start);
        if (lane < 0) lane = laneEnds.length;
        laneEnds[lane] = entry.end;
        entry.lane = lane;
    });
    sorted.forEach(entry => {
        const overlapping = sorted.filter(other => other.start < entry.end && other.end > entry.start);
        entry.laneCount = Math.max(1, ...overlapping.map(other => other.lane + 1));
    });
    return sorted;
}
function crmRenderDayTimelineCard(entry, layer, rangeStart, pixelsPerMinute) {
    const item = entry.item;
    const palette = crmDayPastelColor(crmDayEventColor(item));
    const card = document.createElement("button");
    card.type = "button";
    card.className = "crm-day-event";
    card.dataset.crmStatus = typeof crmV3NormalizeStatus === "function" ? CRM_V3_STATUS_META[crmV3NormalizeStatus(item)].css : "confirmed";
    const width = 100 / entry.laneCount;
    card.style.top = `${(entry.start - rangeStart) * pixelsPerMinute}px`;
    card.style.height = `${Math.max(42, (entry.end - entry.start) * pixelsPerMinute - 4)}px`;
    card.style.left = `calc(${entry.lane * width}% + 8px)`;
    card.style.width = `calc(${width}% - 14px)`;
    card.style.background = palette.background;
    card.style.borderLeftColor = palette.border;

    const startText = crmFormatVisitTime(entry.date);
    const endText = crmFormatVisitTime(entry.endDate);
    const icon = item.eventType === "appointment" && typeof crmV3NormalizeStatus === "function"
        ? CRM_V3_STATUS_META[crmV3NormalizeStatus(item)].icon : "";
    const title = item.eventType === "work_shift" ? (item.name || "Grafik pracy") : (item.service || item.name || "Wpis");
    const client = item.eventType === "appointment" ? (item.name || "") : "";
    card.innerHTML = `
      <span class="crm-day-event__time">${icon ? `<span class="crm-day-event__status">${icon}</span>` : ""}${startText} – ${endText}</span>
      <strong>${title}</strong>
      ${item.serviceDescription ? `<span>${item.serviceDescription}</span>` : ""}
      ${client ? `<span>${client}</span>` : ""}
    `;
    card.title = `${startText}–${endText} ${title} ${client}`.trim();
    if (item.eventType !== "work_shift") card.onclick = () => openAppointmentDetailsModal(item);
    else card.disabled = true;
    layer.appendChild(card);
}
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
renderDayCalendar = function(grid) {
    grid.innerHTML = "";
    grid.dataset.calendarView = "day";
    grid.style.cssText = "";
    grid.className = "crm-day-timeline";

    const {start, end} = crmDaySettingsRange();
    const pixelsPerMinute = 1.12;
    const timelineHeight = (end - start) * pixelsPerMinute;
    const shell = document.createElement("div");
    shell.className = "crm-day-timeline__shell";

    const labels = document.createElement("div");
    labels.className = "crm-day-timeline__labels";
    labels.style.height = `${timelineHeight}px`;
    const canvas = document.createElement("div");
    canvas.className = "crm-day-timeline__canvas";
    canvas.style.height = `${timelineHeight}px`;
    const layer = document.createElement("div");
    layer.className = "crm-day-timeline__events";

    for (let minute = start; minute <= end; minute += 30) {
        const hour = Math.floor(minute / 60) % 24;
        const mins = minute % 60;
        const top = (minute - start) * pixelsPerMinute;
        const line = document.createElement("div");
        line.className = mins === 0 ? "crm-day-grid-line is-hour" : "crm-day-grid-line is-half";
        line.style.top = `${top}px`;
        canvas.appendChild(line);
        if (mins === 0 && minute < end) {
            const label = document.createElement("span");
            label.className = "crm-day-time-label";
            label.style.top = `${top}px`;
            label.textContent = `${String(hour).padStart(2,"0")}:00`;
            labels.appendChild(label);
        }
    }

    const dayItems = getCalendarEventsForDate(selectedCalendarDate);
    const allDayInfo = dayItems.filter(item => item.eventType === "work_shift");
    const entries = dayItems
        .filter(item => item.eventType !== "work_shift")
        .map(item => {
            const date = crmDayEventDate(item);
            if (!date) return null;
            const itemStart = date.getHours() * 60 + date.getMinutes();
            const duration = Math.max(15, Number(item.duration) || 45);
            return {item, date, endDate:new Date(date.getTime()+duration*60000), start:Math.max(start,itemStart), end:Math.min(end,itemStart+duration)};
        })
        .filter(entry => entry && entry.end > start && entry.start < end);

    crmDayAssignLanes(entries).forEach(entry => crmRenderDayTimelineCard(entry, layer, start, pixelsPerMinute));
    crmRenderCurrentTimeLine(layer, selectedCalendarDate, start, end, pixelsPerMinute);
    canvas.appendChild(layer);
    shell.append(labels, canvas);

    if (allDayInfo.length) {
        const infoBar = document.createElement("div");
        infoBar.className = "crm-day-all-day-info";
        infoBar.innerHTML = allDayInfo.map(item =>
            `<span title="Informacyjny wpis grafiku">${String(item.name || "Brak")}</span>`
        ).join("");
        grid.appendChild(infoBar);
    }
    grid.appendChild(shell);

    if (!entries.length) {
        const empty = document.createElement("div");
        empty.className = "crm-day-empty";
        empty.textContent = "Brak wizyt i blokad w tym dniu";
        canvas.appendChild(empty);
    }
};
/* KONIEC ADMIN V5 */

/* ==========================================================
   ADMIN V6: LEWY PANEL KALENDARZA
   ========================================================== */
let crmPaymentFilter = "all";
function crmJumpCalendarDays(days) {
    selectedCalendarDate = new Date(selectedCalendarDate);
    selectedCalendarDate.setDate(selectedCalendarDate.getDate() + Number(days || 0));
    miniMonthDate = new Date(selectedCalendarDate);
    updateCalendarRangeTitle();
    renderMiniMonthCalendar();
    renderBooksyCalendar();
}
function crmGoToToday() {
    selectedCalendarDate = new Date();
    miniMonthDate = new Date();
    updateCalendarRangeTitle();
    renderMiniMonthCalendar();
    renderBooksyCalendar();
}
function crmFocusMiniCalendar() {
    const grid = document.getElementById("mini-month-days-grid");
    if (!grid) return;
    grid.scrollIntoView({behavior:"smooth",block:"nearest"});
    grid.classList.remove("crm-mini-calendar-pulse");
    requestAnimationFrame(() => grid.classList.add("crm-mini-calendar-pulse"));
    setTimeout(() => grid.classList.remove("crm-mini-calendar-pulse"), 900);
}
function crmPaymentState(item) {
    const raw = String(item?.paymentStatus || item?.payment || item?.paidStatus || "").trim().toUpperCase();
    if (item?.paid === true || ["PAID","OPLACONE","OPŁACONE","ZAPLACONE","ZAPŁACONE"].includes(raw)) return "paid";
    if (item?.paid === false || ["UNPAID","NIEOPLACONE","NIEOPŁACONE"].includes(raw)) return "unpaid";
    return "unknown";
}
function crmSetPaymentFilter(value) {
    crmPaymentFilter = ["paid","unpaid"].includes(value) ? value : "all";
    renderBooksyCalendar();
}
const crmGetCalendarEventsForDateOriginalV6 = getCalendarEventsForDate;
getCalendarEventsForDate = function(date) {
    const rows = crmGetCalendarEventsForDateOriginalV6(date);
    if (crmPaymentFilter === "all") return rows;
    return rows.filter(item => item.eventType !== "appointment" || crmPaymentState(item) === crmPaymentFilter);
};
function crmUpdateLeftPendingBadge() {
    const list = document.getElementById("bookingRequestsList");
    const badge = document.getElementById("crmLeftPendingBadge");
    const topCount = document.getElementById("crmPendingRequestsCount");
    if (!badge || !list) return;
    const count = list.querySelectorAll(":scope > .dashboard-card").length;
    badge.textContent = String(count);
    badge.classList.toggle("has-items", count > 0);
    if (topCount) topCount.textContent = String(count);
}
const crmLoadBookingRequestsOriginalV6 = loadBookingRequests;
loadBookingRequests = async function() {
    await crmLoadBookingRequestsOriginalV6();
    crmUpdateLeftPendingBadge();
};
document.addEventListener("DOMContentLoaded", function() {
    setTimeout(() => {
        crmUpdateLeftPendingBadge();
        const panel = document.getElementById("booking-requests-panel");
        const sidebar = document.querySelector("#tab-kalendarz .calendar-sidebar");
        if (panel && sidebar && panel.parentNode !== sidebar) sidebar.appendChild(panel);
    }, 500);
});
/* KONIEC ADMIN V6 */

/* ==========================================================
   ADMIN V6.2: ŹRÓDŁO WIZYTY I UPROSZCZENIE PANELU
   ========================================================== */
function crmVisitSourceInfo(app) {
    const raw = String(app?.bookingSource || app?.source || app?.createdBy || "").trim().toUpperCase();
    const phone = String(app?.phone || "").trim().toUpperCase();
    if (raw.includes("BOOKSY")) return { code:"BOOKSY", label:"Wizyta zaimportowana z Booksy", manual:false };
    if (raw.includes("GOOGLE") || phone === "GOOGLE CALENDAR") return { code:"GOOGLE", label:"Wizyta dodana ręcznie w Google Calendar", manual:true };
    if (raw.includes("ADMIN") || raw.includes("MISTRZYNI") || raw.includes("MASTER")) return { code:"ADMIN", label:"Wizyta dodana ręcznie w ADMIN", manual:true };
    if (raw.includes("INDEX") || raw.includes("ONLINE") || raw.includes("CLIENT") || raw.includes("KLIENT")) return { code:"ONLINE", label:"Klient zarezerwował online", manual:false };
    return { code:"ONLINE", label:"Klient zarezerwował online", manual:false };
}
function crmApplyVisitPanelBusinessRules(app) {
    const source = crmVisitSourceInfo(app);
    const note = document.getElementById("crmWorkerNote");
    if (note) {
        note.hidden = !source.manual;
        note.textContent = source.manual ? "Pracownik wybrany ręcznie" : "";
    }
    const sourceNode = document.getElementById("crmInfoSource");
    if (sourceNode) sourceNode.textContent = source.label;
    const reservationId = document.getElementById("crmVisitReservationId");
    if (reservationId) reservationId.hidden = true;
    const fields = document.querySelectorAll("#appointmentDetailsModal .crm-visit-field");
    fields.forEach(field => {
        const label = field.querySelector("span")?.textContent?.trim();
        if (label === "Pracownik" || label === "Sprzęt") field.hidden = true;
    });
    document.querySelector("#appointmentDetailsModal .crm-client-choice")?.setAttribute("hidden", "");
    const settle = document.getElementById("crmSettleVisitBtn");
    if (settle) settle.hidden = true;
    const repeat = document.getElementById("crmRepeatVisitBtn");
    if (repeat) repeat.textContent = "UMÓW PONOWNIE";
}
const crmPopulateNewVisitPanelV62 = crmPopulateNewVisitPanel;
crmPopulateNewVisitPanel = function(app) {
    crmPopulateNewVisitPanelV62(app);
    crmApplyVisitPanelBusinessRules(app);
};
/* KONIEC ADMIN V6.2 */


/* ==========================================================
   ADMIN V8: TERMINARZ 3-DNIOWY I STAŁY PANEL INFORMACJI
   ========================================================== */
const CRM_THREE_DAY_COUNT = 3;
function crmSafeText(value) {
    return String(value ?? "").replace(/[&<>"]/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[char]));
}
function crmHexToRgb(hex) {
    const value = String(hex || "").trim();
    const short = value.match(/^#([0-9a-f]{3})$/i);
    const full = value.match(/^#([0-9a-f]{6})$/i);
    if (short) return short[1].split("").map(x => parseInt(x+x,16));
    if (full) return [parseInt(full[1].slice(0,2),16),parseInt(full[1].slice(2,4),16),parseInt(full[1].slice(4,6),16)];
    return [187,111,143];
}
function crmCategoryColor(item) {
    if (item?.eventType === "block") return "#b8afb4";
    if (item?.eventType === "external") return "#9ba8ba";
    if (item?.eventType === "work_shift") return "#d9b43b";
    const service = (Array.isArray(currentServices) ? currentServices : []).find(value =>
        value.name && item?.service && value.name.trim().toLowerCase() === item.service.trim().toLowerCase()
    );
    return item?.categoryColor || item?.color || service?.categoryColor || globalColors?.[service?.category] || globalColors?.[item?.category] || "#bb6f8f";
}
function crmCategoryPalette(item) {
    const color = crmCategoryColor(item);
    const [r,g,b] = crmHexToRgb(color);
    return {stripe:color, fill:`rgba(${r},${g},${b},.16)`, hover:`rgba(${r},${g},${b},.22)`};
}
function crmVisitEntry(item, rangeStart, rangeEnd) {
    const date = crmDayEventDate(item);
    if (!date) return null;
    const start = date.getHours()*60 + date.getMinutes();
    const duration = Math.max(15,Number(item.duration)||45);
    const end = start + duration;
    if (end <= rangeStart || start >= rangeEnd) return null;
    return {item,date,endDate:new Date(date.getTime()+duration*60000),start:Math.max(rangeStart,start),end:Math.min(rangeEnd,end)};
}
function crmRenderThreeDayEvent(entry, layer, rangeStart, ppm) {
    const item=entry.item, palette=crmCategoryPalette(item);
    const card=document.createElement("button");
    card.type="button"; card.className="crm-3day-event";
    const exactTop = Math.round((entry.start - rangeStart) * ppm);
    const exactHeight = Math.max(48, Math.round((entry.end - entry.start) * ppm) - 4);
    card.style.top = `${exactTop}px`;
    card.style.height = `${exactHeight}px`;
    card.style.setProperty("--event-stripe",palette.stripe);
    card.style.setProperty("--event-fill",palette.fill);
    const statusKey=typeof crmV3NormalizeStatus==="function"?crmV3NormalizeStatus(item):"CONFIRMED";
    const meta=typeof CRM_V3_STATUS_META!=="undefined"?CRM_V3_STATUS_META[statusKey]:null;
    const service=crmSafeText(item.service||item.name||"Wpis");
    const client=item.eventType==="appointment"?crmSafeText(item.name||""):"";
    card.innerHTML=`<span class="crm-3day-event__time">${meta?`<i>${meta.icon}</i>`:""}${crmFormatVisitTime(entry.date)} – ${crmFormatVisitTime(entry.endDate)}</span><strong>${service}</strong>${client?`<span>${client}</span>`:""}`;
    card.title=`${crmFormatVisitTime(entry.date)}–${crmFormatVisitTime(entry.endDate)} ${service} ${client}`;
    if(item.eventType!=="work_shift") card.onclick=()=>openAppointmentDetailsModal(item); else card.disabled=true;
    layer.appendChild(card);
}
function crmRenderThreeDayCalendar(grid) {
    const {start,end}=crmDaySettingsRange(), ppm=1.08, height=(end-start)*ppm;
    grid.innerHTML=""; grid.className="crm-three-day-calendar"; grid.dataset.calendarView="day";
    const shell=document.createElement("div"); shell.className="crm-3day-shell";
    const labels=document.createElement("div"); labels.className="crm-3day-labels"; labels.style.height=`${height+48}px`;
    const spacer=document.createElement("div"); spacer.className="crm-3day-corner"; labels.appendChild(spacer);
    for(let minute=start;minute<end;minute+=60){const label=document.createElement("span");label.style.top=`${48+(minute-start)*ppm}px`;label.textContent=`${String(Math.floor(minute/60)).padStart(2,"0")}:00`;labels.appendChild(label);}
    shell.appendChild(labels);
    for(let dayIndex=0;dayIndex<CRM_THREE_DAY_COUNT;dayIndex++){
        const date=new Date(selectedCalendarDate); date.setDate(date.getDate()+dayIndex);
        const col=document.createElement("section"); col.className="crm-3day-column";
        const header=document.createElement("button"); header.type="button"; header.className="crm-3day-header";
        header.innerHTML=`<b>${date.getDate()}</b><span>${date.toLocaleDateString("pl-PL",{weekday:"short",day:"numeric",month:"short"})}</span>`;
        if(date.toDateString()===new Date().toDateString()) header.classList.add("is-today");
        header.onclick=()=>{selectedCalendarDate=new Date(date);crmRenderCalendarInsights();renderMiniMonthCalendar();};
        const canvas=document.createElement("div"); canvas.className="crm-3day-canvas"; canvas.style.height=`${height}px`;
        for(let minute=start;minute<=end;minute+=30){const line=document.createElement("div");line.className=minute%60===0?"crm-3day-line is-hour":"crm-3day-line";line.style.top=`${(minute-start)*ppm}px`;canvas.appendChild(line);}
        const layer=document.createElement("div"); layer.className="crm-3day-events";
        getCalendarEventsForDate(date).filter(x=>x.eventType!=="work_shift").map(x=>crmVisitEntry(x,start,end)).filter(Boolean).forEach(e=>crmRenderThreeDayEvent(e,layer,start,ppm));
        crmRenderCurrentTimeLine(layer,date,start,end,ppm);
        canvas.appendChild(layer); col.append(header,canvas); shell.appendChild(col);
    }
    grid.appendChild(shell); crmRenderCalendarInsights();
}
function crmInsightRange() {
    const from=new Date(selectedCalendarDate); from.setHours(0,0,0,0);
    const to=new Date(from);
    if(calendarViewMode==="month") to.setMonth(to.getMonth()+1,0);
    else if(calendarViewMode==="week") to.setDate(to.getDate()+6);
    else to.setDate(to.getDate()+CRM_THREE_DAY_COUNT-1);
    to.setHours(23,59,59,999); return {from,to};
}
function crmInsightAppointments() {
    const {from,to}=crmInsightRange();
    return (appointmentsData||[]).filter(x=>x.eventType==="appointment").filter(x=>{const d=crmDayEventDate(x);return d&&d>=from&&d<=to;});
}
function crmRenderCalendarInsights() {
    const panel=document.getElementById("crmCalendarInsights"); if(!panel)return;
    const rows=crmInsightAppointments(), {from,to}=crmInsightRange();
    const totalMinutes=rows.reduce((sum,x)=>sum+(Number(x.duration)||45),0);
    const revenue=rows.reduce((sum,x)=>{const srv=(currentServices||[]).find(s=>s.name&&x.service&&s.name.trim().toLowerCase()===x.service.trim().toLowerCase());return sum+(Number(x.price??srv?.price)||0);},0);
    const cancelled=rows.filter(x=>/ANUL|CANCEL/.test(String(x.status||x.crmStatus||"").toUpperCase())).length;
    const pending=rows.filter(x=>/OCZEK|PENDING/.test(String(x.status||x.crmStatus||"").toUpperCase())).length;
    const chronological=[...rows].sort((a,b)=>crmDayEventDate(a)-crmDayEventDate(b));
    const title=calendarViewMode==="month"?from.toLocaleDateString("pl-PL",{month:"long",year:"numeric"}):calendarViewMode==="week"?`${formatPolishShortDate(from)} – ${formatPolishShortDate(to)}`:`${formatPolishShortDate(from)} – ${formatPolishShortDate(to)}`;
    document.getElementById("crmInsightsEyebrow").textContent=calendarViewMode==="month"?"Podsumowanie miesiąca":calendarViewMode==="week"?"Podsumowanie tygodnia":"Podsumowanie terminarza";
    document.getElementById("crmInsightsTitle").textContent=title;
    const metric=(icon,label,value)=>`<div><i>${icon}</i><span>${label}</span><strong>${value}</strong></div>`;
    document.getElementById("crmInsightsMetrics").innerHTML=[metric("▣","Liczba wizyt",rows.length),metric("◷","Łączny czas",`${Math.floor(totalMinutes/60)} h ${totalMinutes%60} min`),metric("○","Wolne terminy","wg grafiku"),metric("▤","Przewidywany obrót",`${revenue.toLocaleString("pl-PL",{minimumFractionDigits:2,maximumFractionDigits:2})} zł`),metric("☆","Oczekujące prośby",pending),metric("⊗","Anulowane wizyty",cancelled)].join("");
    const next=chronological.find(x=>crmDayEventDate(x)>=new Date())||chronological[0];
    document.getElementById("crmInsightsNext").innerHTML=next?`<h4>Następna wizyta</h4><button type="button"><b>${crmFormatVisitTime(crmDayEventDate(next))}</b><span><strong>${crmSafeText(next.service||"Wizyta")}</strong>${crmSafeText(next.name||"")}</span></button>`:"<h4>Brak wizyt w wybranym okresie</h4>";
}
const crmRenderBooksyCalendarV8=renderBooksyCalendar;
renderBooksyCalendar=function(){
    if(calendarViewMode==="day"){
        const grid=document.getElementById("booksy-grid"); if(!grid)return;
        updateCalendarRangeTitle(); crmRenderThreeDayCalendar(grid); return;
    }
    crmRenderBooksyCalendarV8(); crmRenderCalendarInsights();
};
const crmChangeSelectedDateV8=changeSelectedDate;
changeSelectedDate=function(days){
    if(calendarViewMode==="day"){
        selectedCalendarDate.setDate(selectedCalendarDate.getDate()+days*CRM_THREE_DAY_COUNT);
        miniMonthDate=new Date(selectedCalendarDate);renderMiniMonthCalendar();renderBooksyCalendar();return;
    }
    crmChangeSelectedDateV8(days);
};
const crmUpdateCalendarRangeTitleV8=updateCalendarRangeTitle;
updateCalendarRangeTitle=function(){
    if(calendarViewMode!=="day")return crmUpdateCalendarRangeTitleV8();
    const title=document.getElementById("calendar-current-date-title");if(!title)return;
    const end=new Date(selectedCalendarDate);end.setDate(end.getDate()+2);
    title.textContent=`${selectedCalendarDate.toLocaleDateString("pl-PL",{weekday:"long",day:"numeric",month:"short"})} – ${end.toLocaleDateString("pl-PL",{weekday:"long",day:"numeric",month:"short",year:"numeric"})}`;
};
/* KONIEC ADMIN V8 */

/* ==========================================================
   ADMIN V8.1: HARMONIJNY TERMINARZ I KOLORY KATEGORII
   ========================================================== */
function crmApplyCategoryVisualsToLegacyCards() {
    document.querySelectorAll('.calendar-compact-event,.booksy-event-card,.crm-day-event').forEach(card => {
        const item = card.__crmItem;
        if (!item) return;
        const palette = crmCategoryPalette(item);
        card.style.setProperty('--event-stripe', palette.stripe);
        card.style.setProperty('--event-fill', palette.fill);
        card.style.background = palette.fill;
        card.style.borderLeftColor = palette.stripe;
    });
}
const crmRenderCalendarInsightsV81 = crmRenderCalendarInsights;
crmRenderCalendarInsights = function() {
    crmRenderCalendarInsightsV81();
    const nextButton = document.querySelector('#crmInsightsNext button');
    if (nextButton) {
        const rows = crmInsightAppointments().sort((a,b) => crmDayEventDate(a)-crmDayEventDate(b));
        const next = rows.find(x => crmDayEventDate(x) >= new Date()) || rows[0];
        if (next) {
            const palette = crmCategoryPalette(next);
            nextButton.style.borderLeftColor = palette.stripe;
            nextButton.onclick = () => openAppointmentDetailsModal(next);
        }
    }
};
/* KONIEC ADMIN V8.1 */


/* ==========================================================
   ADMIN V9: ZEBRANE POPRAWKI WIDOKÓW I PODSUMOWANIA
   ========================================================== */
function crmCompactEventStatusMeta(item) {
    if (item?.eventType !== "appointment" || typeof crmV3NormalizeStatus !== "function") return null;
    return CRM_V3_STATUS_META[crmV3NormalizeStatus(item)] || null;
}
function crmCompactEventEnd(item) {
    const start = crmDayEventDate(item);
    if (!start) return null;
    return new Date(start.getTime() + Math.max(15, Number(item.duration) || 45) * 60000);
}
renderCompactCalendarEvent = function(item, container, mode) {
    if (item.eventType === "work_shift") {
        const info = document.createElement("div");
        info.className = "crm-schedule-info";
        info.textContent = item.name || "BRAK";
        info.title = "Informacyjny wpis grafiku";
        container.appendChild(info);
        return;
    }
    const palette = crmCategoryPalette(item);
    const event = document.createElement("button");
    event.type = "button";
    event.className = "calendar-compact-event crm-category-event";
    event.style.setProperty("--event-stripe", palette.stripe);
    event.style.setProperty("--event-fill", palette.fill);
    const start = crmDayEventDate(item);
    const end = crmCompactEventEnd(item);
    const meta = crmCompactEventStatusMeta(item);
    const time = start ? crmFormatVisitTime(start) : "";
    const endTime = end ? crmFormatVisitTime(end) : "";
    const service = crmSafeText(item.service || item.name || "Wpis");
    const client = item.eventType === "appointment" ? crmSafeText(item.name || "") : "";
    const timeText = mode === "week" && endTime ? `${time}–${endTime}` : time;
    event.innerHTML = `<span class="crm-compact-time">${meta ? `<i>${meta.icon}</i>` : ""}${timeText}</span><strong>${service}</strong>${client ? `<span class="crm-compact-client">${client}</span>` : ""}`;
    event.title = `${timeText} ${service} ${client}`.trim();
    event.onclick = () => openAppointmentDetailsModal(item);
    container.appendChild(event);
};

function crmRenderInsightsMetricsWithoutAvailability() {
    const panel = document.getElementById("crmCalendarInsights");
    if (!panel) return;
    const rows = crmInsightAppointments();
    const totalMinutes = rows.reduce((sum,x)=>sum+(Number(x.duration)||45),0);
    const revenue = rows.reduce((sum,x)=>{
        const srv=(currentServices||[]).find(s=>s.name&&x.service&&s.name.trim().toLowerCase()===x.service.trim().toLowerCase());
        return sum+(Number(x.price ?? srv?.price)||0);
    },0);
    const cancelled=rows.filter(x=>/ANUL|CANCEL/.test(String(x.status||x.crmStatus||"").toUpperCase())).length;
    const pending=rows.filter(x=>/OCZEK|PENDING/.test(String(x.status||x.crmStatus||"").toUpperCase())).length;
    const icon=(path)=>`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${path}"/></svg>`;
    const metric=(svg,label,value)=>`<div><i>${svg}</i><span>${label}</span><strong>${value}</strong></div>`;
    document.getElementById("crmInsightsMetrics").innerHTML=[
      metric(icon("M5 5h14v14H5zM9 9h6M9 13h6"),"Liczba wizyt",rows.length),
      metric(icon("M12 7v5l3 2M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z"),"Łączny czas",`${Math.floor(totalMinutes/60)} h ${totalMinutes%60} min`),
      metric(icon("M5 19V9M10 19V5M15 19v-7M4 20h16"),"Przewidywany obrót",`${revenue.toLocaleString("pl-PL",{minimumFractionDigits:2,maximumFractionDigits:2})} zł`),
      metric(icon("M12 3 14 9h6l-5 3.5 2 6L12 15l-5 3.5 2-6L4 9h6Z"),"Oczekujące prośby",pending),
      metric(icon("M8 8l8 8M16 8l-8 8M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z"),"Anulowane wizyty",cancelled)
    ].join("");
}
const crmRenderCalendarInsightsV9 = crmRenderCalendarInsights;
crmRenderCalendarInsights = function() {
    crmRenderCalendarInsightsV9();
    crmRenderInsightsMetricsWithoutAvailability();
    const actions = document.querySelector('.crm-insights-actions');
    actions?.querySelector('button')?.remove();
};

/* Gęstość osi: około 74 px na godzinę. */
const crmRenderThreeDayCalendarV9 = crmRenderThreeDayCalendar;
crmRenderThreeDayCalendar = function(grid) {
    crmRenderThreeDayCalendarV9(grid);
    document.documentElement.style.setProperty('--crm-hour-height','74px');
};
/* KONIEC ADMIN V9 */


/* ==========================================================
   ADMIN V10: PANEL KALENDARZA I ZAMYKANIE SZCZEGÓŁÓW
   ========================================================== */
function crmIsCalendarTabVisible() {
    const tab = document.getElementById("tab-kalendarz");
    return Boolean(tab && getComputedStyle(tab).display !== "none");
}
function crmCloseVisitPanelForNavigation() {
    const modal = document.getElementById("appointmentDetailsModal");
    if (modal) modal.style.display = "none";
    document.body.classList.remove("crm-v3-details-open");
    currentEditingAppointment = null;
    const menu = document.getElementById("crmVisitStatusMenu");
    if (menu) menu.hidden = true;
}
const crmSwitchTabBeforeV10 = switchTab;
switchTab = function(tabName) {
    if (tabName !== "kalendarz") crmCloseVisitPanelForNavigation();
    crmSwitchTabBeforeV10(tabName);
    document.body.classList.toggle("crm-calendar-tab-active", tabName === "kalendarz");
    if (tabName === "kalendarz") {
        const summary = document.getElementById("crmCalendarInsights");
        if (summary) summary.style.display = "block";
        if (typeof crmRenderCalendarInsights === "function") crmRenderCalendarInsights();
    }
};
const crmOpenAppointmentBeforeV10 = openAppointmentDetailsModal;
openAppointmentDetailsModal = function(app) {
    if (!crmIsCalendarTabVisible()) return;
    crmOpenAppointmentBeforeV10(app);
    document.body.classList.add("crm-v3-details-open");
    const summary = document.getElementById("crmCalendarInsights");
    if (summary) summary.style.visibility = "hidden";
};
const crmCloseAppointmentBeforeV10 = closeAppointmentModal;
closeAppointmentModal = function() {
    crmCloseAppointmentBeforeV10();
    document.body.classList.remove("crm-v3-details-open");
    currentEditingAppointment = null;
    const summary = document.getElementById("crmCalendarInsights");
    if (summary) {
        summary.style.visibility = "visible";
        summary.style.display = crmIsCalendarTabVisible() ? "block" : "none";
    }
    if (crmIsCalendarTabVisible() && typeof crmRenderCalendarInsights === "function") crmRenderCalendarInsights();
};
document.addEventListener("DOMContentLoaded", function() {
    const calendarTab = document.getElementById("tab-kalendarz");
    document.body.classList.toggle("crm-calendar-tab-active", Boolean(calendarTab && getComputedStyle(calendarTab).display !== "none"));
    if (!crmIsCalendarTabVisible()) crmCloseVisitPanelForNavigation();
});
/* KONIEC ADMIN V10 */
