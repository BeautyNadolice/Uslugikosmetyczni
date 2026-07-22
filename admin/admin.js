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
        .sort((a, b) => a.date.localeCompare(b.date));
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
    else {
        const service = currentServices.find(value =>
            value.name && item.service &&
            value.name.trim().toLowerCase() === item.service.trim().toLowerCase()
        );
        if (service && globalColors[service.category]) color = globalColors[service.category];
    }

    event.style.background = color;
    const time = formatCalendarTime(item.date);
    event.innerHTML = "<strong>" + time + "</strong> " + (item.name || item.service || "Wpis");
    event.title = time + " " + (item.name || "") + " " + (item.service || "");
    event.onclick = () => openAppointmentDetailsModal(item);
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

    const isExternal =
        app.eventType === "external" ||
        (app.phone === "Google Calendar" && !isBlock);

    if (isBlock) {
        color = "#8c6b4f";
        card.classList.add("booksy-block-card");
    }
    else if(isExternal){
        color = "#555555";
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

    card.innerHTML = `

        <strong>
            ${app.name}
        </strong>

        <br>

        ${app.service}

        <br>

        ${app.date}

    `;

    card.onclick = ()=>{

        openAppointmentDetailsModal(
            app
        );

    };

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
    setText("appointmentDetailsTitle", isBlock ? "Szczegóły blokady czasu" : (isExternal ? "Szczegóły wydarzenia zewnętrznego" : "Szczegóły rezerwacji"));
    setText("details-name-label", isBlock ? "Nazwa blokady:" : "Klient:");
    setText("details-service-label", isBlock ? "Typ:" : "Zabieg:");
    setText("details-name", app.name || "");
    setText("details-phone", app.phone || "");
    setText("details-service", app.service || "");
    setText("details-datetime", app.date || "");
    setText("details-duration", app.duration || 45);
    const phoneRow = document.getElementById("details-phone-row");
    if (phoneRow) phoneRow.style.display = isBlock ? "none" : "block";
    const deleteBtn = document.getElementById("deleteAppointmentBtn");
    const editBtn = document.getElementById("editAppointmentBtn");
    if (deleteBtn) {
        deleteBtn.style.display = isExternal ? "none" : "inline-block";
        deleteBtn.innerText = isBlock ? "Usuń blokadę 🗑️" : "Usuń wizytę 🗑️";
    }
    if (editBtn) editBtn.style.display = (isBlock || isExternal) ? "none" : "inline-block";
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
    let html = `<h3 style="margin:0 0 12px">Grafik pracy: ${monthName}</h3><div class="work-schedule-grid" style="display:grid;grid-template-columns:repeat(7,minmax(70px,1fr));gap:5px">`;
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

        const backupResult = await crmExtendedPost("createFinalAdminBackup", { description: "Automatyczny backup testu " + testId });
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

