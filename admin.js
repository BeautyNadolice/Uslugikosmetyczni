/* ==========================================================
   NAIL-ART DARIA CRM V2
   ADMIN.JS
   CORE
   ========================================================== */


/* ==========================================================
   CONFIG
   ========================================================== */

const APPS_SCRIPT_URL =
"https://script.google.com/macros/s/AKfycbzgZ-FgaxZszGtFHPQdj8TghVgDWf3TCvIBXMh9yCS-vkysbGrHmAOEwNH144JB2cyvcA/exec";

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

    await loadSystem();

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

async function loadSystem() {

    await loadServices();

    await loadSettings();

    renderDashboard();

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

        if (
            settingsData.colors
        ) {

            Object.keys(
                settingsData.colors
            ).forEach(key => {

                globalColors[key] =
                    settingsData.colors[key];

            });

        }

        allCategories =
            settingsData.all_categories || [];

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


async function loadServices() {

    try {

        const response =
            await fetch(
                APPS_SCRIPT_URL +
                "?getPrices=true"
            );

        currentServices =
            await response.json();

    }

    catch(err) {

        console.error(
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

    if(activeButton) {

        activeButton.classList.add(
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

    const grid =
    document.getElementById("booksy-grid");

if (!grid) return;

    if(!grid) return;

    grid.innerHTML = "";

    const currentDate =
        getFormattedISOBlockDate(
            selectedCalendarDate
        );

    const dailyAppointments =
        appointmentsData.filter(app=>{

            return (
                app.date &&
                app.date.startsWith(
                    currentDate
                )
            );

        });

    if(
        dailyAppointments.length===0
    ){

        grid.innerHTML = `
            <div
                style="
                padding:40px;
                text-align:center;
                color:#777;
                ">
                Brak wizyt
            </div>
        `;

        return;

    }

    dailyAppointments
        .sort(
            (a,b)=>
            a.date.localeCompare(
                b.date
            )
        )
        .forEach(app=>{

            renderAppointmentCard(
                app,
                grid
            );

        });

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

    const isExternal =
        app.phone ===
        "Google Calendar";

    if(isExternal){

        color =
            "#555555";

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
   CREATE APPOINTMENT
   ========================================================== */

function openCreateModal(){

    currentEditingAppointment =
        null;

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

    currentEditingAppointment =
        app;

    setText(
        "details-name",
        app.name
    );

    setText(
        "details-phone",
        app.phone
    );

    setText(
        "details-service",
        app.service
    );

    setText(
        "details-datetime",
        app.date
    );

    setText(
        "details-duration",
        app.duration || 45
    );

    document.getElementById(
        "appointmentDetailsModal"
    ).style.display =
        "flex";

}


function closeAppointmentModal(){

    document.getElementById(
        "appointmentDetailsModal"
    ).style.display =
        "none";

}


/* ==========================================================
   DELETE FIX
   ========================================================== */

async function deleteAppointmentFromAdmin(){

    if(
        !currentEditingAppointment
    ){
        return;
    }

    if(
        !confirm(
            "Usunąć wizytę?"
        )
    ){
        return;
    }

    try{

        const response =
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
                        "createBooking",

                        deleteFlag:
                        true,

                        date:
                        new Date(
                            currentEditingAppointment.date
                        )
                        .toISOString(),

                        name:
                        currentEditingAppointment.name

                    })

                }
            );

        const data =
            await response.json();

        if(data.success){

            alert(
                "Wizyta usunięta"
            );

            closeAppointmentModal();

            await loadSettings();

        }

    }
    catch(error){

        alert(
            "Błąd usuwania"
        );

    }

}


/* ==========================================================
   BLOCK TIME
   ========================================================== */

function openBlockTimeModal(){

    document.getElementById(
        "blockTimeModal"
    ).style.display =
        "flex";

}


function closeBlockTimeModal(){

    document.getElementById(
        "blockTimeModal"
    ).style.display =
        "none";

}


function toggleBlockTimeFields(){

    const blockType =
        document.getElementById(
            "block-type"
        ).value;

    const group =
        document.getElementById(
            "block-hours-group"
        );

    if(!group) return;

    group.style.display =
        blockType === "hours"
        ?
        "block"
        :
        "none";

}


function submitBlockTime(){

    alert(
        "Wersja V2 - backend blockTime do podłączenia"
    );

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
                ${client.visits || 0}
            </td>

            <td>
                ${client.cancelled || 0}
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
   CLIENT CRUD
   ========================================================== */

function editClient(phone){

    alert(
        "Edycja klienta V2\nTelefon: " +
        phone
    );

}


async function deleteClient(phone){

    if(
        !confirm(
            "Usunąć klienta?"
        )
    ){
        return;
    }

    try{

        await fetch(
            APPS_SCRIPT_URL,
            {
                method:"POST",

                headers:{
                    "Content-Type":
                    "text/plain"
                },

                body:JSON.stringify({

                    action:
                    "deleteClient",

                    phone:
                    phone

                })
            }
        );

        await loadClients();

    }

    catch(error){

        console.error(error);

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

                    payload:{

                        work_start_hour:
                        document.getElementById(
                            "work_start_hour"
                        ).value,

                        work_end_hour:
                        document.getElementById(
                            "work_end_hour"
                        ).value,

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

const _oldLoadSystem =
    loadSystem;

loadSystem =
async function(){

    await loadServices();

    await loadSettings();

    await loadClients();

    renderDashboard();

    calculateFinanceReport();

    buildColorsEditor();

};


/* ==========================================================
   GOOGLE LOGIN CALLBACK
   ========================================================== */

function handleCredentialResponse(response){

    console.log(
        response
    );

}


/* ==========================================================
   END OF PART 5
   ========================================================== */
