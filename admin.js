const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzhokxJb8mrF71U96L41eRdFX-HUZtl5OtM7pj24TtNRZoFy9rreCRa1j3Ua7df1Fq2ag/exec";
const ALLOWED_EMAIL = "vasha_jena@gmail.com"; 

let currentServices = [];       
let allCategories = []; // Trwała lista pobierana bezpośrednio z zapamiętanych ustawień bazy
let undoStack = [];             
let redoStack = [];             
let hasUnsavedChanges = false;  

let selectedCalendarDate = new Date(); 
let miniMonthDate = new Date();        
let calendarViewMode = "day";          
let appointmentsData = [];             
let globalColors = {};                 
let settingsData = {};

// Przełącznik stanu: edycja czy nowa rezerwacja
let currentEditingAppointment = null; 

document.addEventListener("DOMContentLoaded", () => {
    checkAuthSession();
});

function checkAuthSession() {
    const savedEmail = localStorage.getItem("admin_email");
    if (savedEmail === ALLOWED_EMAIL || savedEmail === "test_admin@test.com") {
        showAdminPanel();
    } else {
        showLoginScreen();
    }
}

function showAdminPanel() {
    document.getElementById("login-modal").style.display = "none";
    document.getElementById("admin-panel-wrapper").style.display = "block";
    loadAdminServices();
    loadSettings();
}

function showLoginScreen() {
    document.getElementById("login-modal").style.display = "flex";
}

function loginTest() {
    localStorage.setItem("admin_email", "test_admin@test.com");
    showAdminPanel();
}

function logout() {
    localStorage.clear();
    window.location.reload();
}

function closeLoginModal() {
    document.getElementById("login-modal").style.display = "none";
}

function switchTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.style.display = 'none');
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`tab-${tabName}`).style.display = 'block';
    const activeBtn = document.querySelector(`.tab-btn[onclick*="${tabName}"]`);
    if (activeBtn) activeBtn.classList.add('active');
    if (tabName === "kalendarz") { renderBooksyCalendar(); }
}

function setCalendarView(mode) {
    calendarViewMode = mode;
    document.getElementById("view-day-btn").classList.toggle("active", mode === "day");
    document.getElementById("view-week-btn").classList.toggle("active", mode === "week");
    renderBooksyCalendar();
}

function changeSelectedDate(days) {
    selectedCalendarDate.setDate(selectedCalendarDate.getDate() + (calendarViewMode === "week" ? days * 7 : days));
    miniMonthDate = new Date(selectedCalendarDate);
    renderBooksyCalendar();
}

function changeMiniMonth(months) {
    miniMonthDate.setMonth(miniMonthDate.getMonth() + months);
    renderMiniMonthCalendar();
}

async function loadSettings() {
    try {
        const response = await fetch(APPS_SCRIPT_URL + "?checkBusy=true");
        const data = await response.json();
        if (data.settings) {
            settingsData = data.settings;
            globalColors = data.settings.colors || {};
            
            // Kategorie ładujemy bezpośrednio z bazy zdefiniowanych kolorów (trwała pamięć)
            allCategories = data.settings.all_categories || [];
            appointmentsData = data.appointments || [];
            
            // Mapowanie kategorii na podstawie pobranych usług
            appointmentsData.forEach(app => {
                const match = currentServices.find(s => s.name.trim().toLowerCase() === app.service.trim().toLowerCase());
                app.category = match ? match.category : "Inne";
            });

            buildColorsEditor();
            renderBooksyCalendar();
        }
    } catch (e) {
        console.error("Błąd ładowania ustawień:", e);
    }
}

// Kompaktowy kalendarz bez sztywnych godzin - tylko zajęte bloki
function renderBooksyCalendar() {
    const timeline = document.getElementById("booksy-timeline");
    const grid = document.getElementById("booksy-grid");
    const title = document.getElementById("calendar-current-date-title");
    if (!timeline || !grid) return;
    
    renderMiniMonthCalendar();
    timeline.innerHTML = "";
    grid.innerHTML = "";
    grid.style.height = "auto"; 
    
    const daysOfWeek = ["Niedziela", "Poniedziałek", "Wtorek", "Środa", "Czwartek", "Piątek", "Sobota"];
    const months = ["Stycznia", "Lutego", "Marca", "Kwietnia", "Maja", "Czerwca", "Lipca", "Sierpnia", "Września", "Października", "Listopada", "Grudnia"];

    if (calendarViewMode === "day") {
        title.innerText = `${daysOfWeek[selectedCalendarDate.getDay()]}, ${selectedCalendarDate.getDate()} ${months[selectedCalendarDate.getMonth()]}`;
        const targetDateStr = getFormattedISOBlockDate(selectedCalendarDate);
        const targetAppointments = appointmentsData.filter(app => app.date.startsWith(targetDateStr));
        
        if (targetAppointments.length === 0) {
            grid.innerHTML = `<div style="padding: 40px; text-align: center; color: #999; font-weight: bold; width:100%;">Brak zaplanowanych wizyt na ten dzień. ✨</div>`;
            return;
        }

        // Sortowanie po godzinie rozpoczęcia
        targetAppointments.sort((a,b) => a.date.localeCompare(b.date));

        targetAppointments.forEach(app => {
            const appTimeStr = app.date.split("T")[1].substring(0, 5);
            const card = document.createElement("div");
            card.className = "booksy-event-card";
            card.style.position = "relative";
            card.style.margin = "10px 0";
            card.style.left = "0"; card.style.right = "0";
            
            const isBlock = app.phone === "Google Calendar" || app.service === "Rezerwacja zewnętrzna";
            card.style.backgroundColor = isBlock ? "#555555" : (globalColors[app.category] || "#b05c75");

            card.innerHTML = `
                <div class="event-time" style="font-size: 13px;">⏰ ${appTimeStr} - ${getEndTimeStr(appTimeStr, app.duration)} (${app.duration} min)</div>
                <div class="event-name" style="font-size: 15px; margin: 5px 0;">👤 ${app.name}</div>
                <div class="event-service" style="font-size: 13px;">💅 Zabieg: ${app.service}</div>
                ${isBlock ? '' : `<div class="event-phone">📞 Tel: ${app.phone}</div>`}
            `;
            card.onclick = () => openAppointmentDetailsModal(app);
            grid.appendChild(card);
        });
    } else {
        // Widok tygodnia składający się tylko z zajętych dni
        const currentDay = selectedCalendarDate.getDay();
        const distanceToMonday = currentDay === 0 ? -6 : 1 - currentDay;
        const mondayDate = new Date(selectedCalendarDate);
        mondayDate.setDate(mondayDate.getDate() + distanceToMonday);
        
        title.innerText = `Tydzień: ${mondayDate.getDate()} ${months[mondayDate.getMonth()]}`;
        
        let hasAnyWeeklyBooking = false;

        for (let d = 0; d < 7; d++) {
            const colDate = new Date(mondayDate);
            colDate.setDate(colDate.getDate() + d);
            const targetDateStr = getFormattedISOBlockDate(colDate);
            const targetAppointments = appointmentsData.filter(app => app.date.startsWith(targetDateStr));
            
            if (targetAppointments.length > 0) {
                hasAnyWeeklyBooking = true;
                const colBlock = document.createElement("div");
                colBlock.style = "background: #fff; border: 1px solid #eee; border-radius: 8px; padding: 10px; margin-bottom: 15px;";
                colBlock.innerHTML = `<h4 style="margin: 0 0 10px 0; color:#b05c75; border-bottom:1px solid #f9fafb; padding-bottom:5px;">${daysOfWeek[colDate.getDay()]}, ${colDate.getDate()}</h4>`;
                
                targetAppointments.sort((a,b) => a.date.localeCompare(b.date)).forEach(app => {
                    const appTimeStr = app.date.split("T")[1].substring(0, 5);
                    const isBlock = app.phone === "Google Calendar" || app.service === "Rezerwacja zewnętrzna";
                    const item = document.createElement("div");
                    item.style = `background: ${isBlock ? '#555' : (globalColors[app.category] || '#b05c75')}; color: white; padding: 8px; border-radius: 5px; margin-bottom: 5px; cursor: pointer; font-size: 12px;`;
                    item.innerHTML = `<strong>${appTimeStr}</strong> | ${app.name} - ${app.service}`;
                    item.onclick = () => openAppointmentDetailsModal(app);
                    colBlock.appendChild(item);
                });
                grid.appendChild(colBlock);
            }
        }
        if (!hasAnyWeeklyBooking) {
            grid.innerHTML = `<div style="padding: 40px; text-align: center; color: #999; font-weight: bold; width:100%;">Cały tydzień wolny od pracy! ✨</div>`;
        }
    }
}

/**
 * Otwiera modal do TWORZENIA nowej rezerwacji
 */
function openCreateModal(selectedDate = new Date()) {
    currentEditingAppointment = null; 
    
    document.getElementById('appointmentName').value = "";
    document.getElementById('appointmentPhone').value = "";
    document.getElementById('appointmentService').value = "";
    document.getElementById('appointmentDuration').value = "45";
    
    const localIsoString = new Date(selectedDate.getTime() - selectedDate.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    document.getElementById('appointmentDateTime').value = localIsoString;
    
    document.getElementById('modalTitleAppointment').innerText = "Utwórz nową wizytę";
    document.getElementById('appointmentModal').style.display = 'flex';
}

/**
 * Otwiera modal do EDYCJI istniejącej rezerwacji
 */
function openEditModal(appointmentData) {
    currentEditingAppointment = {
        oldDate: appointmentData.date,
        oldName: appointmentData.name
    };
    
    document.getElementById('appointmentName').value = appointmentData.name;
    document.getElementById('appointmentPhone').value = appointmentData.phone;
    document.getElementById('appointmentService').value = appointmentData.service;
    document.getElementById('appointmentDuration').value = appointmentData.duration || "45";
    
    const dateObj = new Date(appointmentData.date);
    const localIsoString = new Date(dateObj.getTime() - dateObj.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    document.getElementById('appointmentDateTime').value = localIsoString;
    
    document.getElementById('modalTitleAppointment').innerText = "Edytuj wizytę";
    document.getElementById('appointmentModal').style.display = 'flex';
}

function closeCreateAppointmentModal() {
    document.getElementById('appointmentModal').style.display = 'none';
}

/**
 * Funkcja wysyłania danych wizyty na serwer Google Apps Script
 */
function saveAppointment() {
    const name = document.getElementById('appointmentName').value.trim();
    const phone = document.getElementById('appointmentPhone').value.trim();
    const service = document.getElementById('appointmentService').value.trim();
    const duration = document.getElementById('appointmentDuration').value;
    const dateTime = document.getElementById('appointmentDateTime').value;

    if (!dateTime || !name) {
        alert("Imię oraz Data/Godzina są wymagane!");
        return;
    }

    let payload = {
        action: "createBooking",
        name: name,
        phone: phone,
        service: service,
        duration: duration,
        date: new Date(dateTime).toISOString()
    };

    if (currentEditingAppointment) {
        payload.editFlag = true;
        payload.oldDate = new Date(currentEditingAppointment.oldDate).toISOString();
        payload.oldName = currentEditingAppointment.oldName;
    }

    fetch(APPS_SCRIPT_URL, {
        method: "POST",
        mode: "cors", 
        headers: {
            "Content-Type": "text/plain" 
        },
        body: JSON.stringify(payload)
    })
    .then(response => response.json()) 
    .then(data => {
        if (data.success) {
            alert(currentEditingAppointment ? "Pomyślnie zmieniono rezerwację!" : "Nowa wizyta została utworzona!");
            document.getElementById('appointmentModal').style.display = 'none';
            loadSettings(); 
        } else {
            alert("Błąd serwera: " + data.error);
        }
    })
    .catch(err => {
        console.error("Obsługa błędu sieci:", err);
        alert("Nie udało się zapisać wizyty z powodu błędu sieci.");
    });
} // <--- TUTAJ BRAKOWAŁO TEJ KLAMRY ZAMYKAJĄCEJ FUNKCJĘ SAVEAPPOINTMENT!

function getEndTimeStr(startTimeStr, durationMin) {
    const [h, m] = startTimeStr.split(":").map(Number);
    const d = new Date(); d.setHours(h, m + durationMin);
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
}

function getFormattedISOBlockDate(dateObj) {
    return dateObj.getFullYear() + "-" + String(dateObj.getMonth() + 1).padStart(2, '0') + "-" + String(dateObj.getDate()).padStart(2, '0');
}

function renderMiniMonthCalendar() {
    const grid = document.getElementById("mini-month-days-grid");
    const title = document.getElementById("mini-month-title");
    if (!grid || !title) return;
    grid.innerHTML = "";
    const PolishMonths = ["Styczeń", "Luty", "Marzec", "Kwiecień", "Maj", "Czerwiec", "Lipiec", "Sierpień", "Wrzesień", "Październik", "Listopad", "Grudzień"];
    title.innerText = `${PolishMonths[miniMonthDate.getMonth()]} ${miniMonthDate.getFullYear()}`;
    const firstDay = new Date(miniMonthDate.getFullYear(), miniMonthDate.getMonth(), 1);
    let startDayOfWeek = firstDay.getDay(); 
    if (startDayOfWeek === 0) startDayOfWeek = 7;
    const daysInMonth = new Date(miniMonthDate.getFullYear(), miniMonthDate.getMonth() + 1, 0).getDate();
    for (let i = 1; i < startDayOfWeek; i++) {
        grid.appendChild(document.createElement("div"));
    }
    for (let day = 1; day <= daysInMonth; day++) {
        const dayCell = document.createElement("div");
        dayCell.className = "mini-date-cell";
        dayCell.innerText = day;
        const cellDate = new Date(miniMonthDate.getFullYear(), miniMonthDate.getMonth(), day);
        if (cellDate.toDateString() === new Date().toDateString()) dayCell.classList.add("today");
        if (cellDate.toDateString() === selectedCalendarDate.toDateString()) dayCell.classList.add("selected");
        dayCell.onclick = () => {
            selectedCalendarDate = cellDate;
            renderBooksyCalendar();
        };
        grid.appendChild(dayCell);
    }
}

async function loadAdminServices() {
    try {
        const response = await fetch(APPS_SCRIPT_URL + "?getPrices=true");
        currentServices = await response.json();
        renderTable();
    } catch (error) {
        console.error("Błąd ładowania usług:", error);
    }
}

function renderTable() {
    const tbody = document.getElementById("adminServicesTableBody");
    if (!tbody) return;
    tbody.innerHTML = "";

    const visibleCategories = allCategories.filter(cat => currentServices.some(s => s.category.trim() === cat.trim()));

    visibleCategories.forEach(catName => {
        const servicesInCat = currentServices.filter(s => s.category.trim() === catName.trim());
        const headerTr = document.createElement("tr");
        headerTr.innerHTML = `<td colspan="6" style="font-weight: bold; padding: 10px; background: #faf0f2;">🏷️ Kategoria: ${catName}</td>`;
        tbody.appendChild(headerTr);

        servicesInCat.forEach((item, originalIndex) => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${item.category}</td> <td><strong>${item.name}</strong></td> <td>${item.price} zł</td> <td>${item.duration} min</td> <td>${item.status}</td>
                <td>
                    <button onclick="editService(${originalIndex})">Edytuj</button>
                    <button onclick="deleteService(${originalIndex})" style="color:red;">Usuń</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    });
}

function buildColorsEditor() {
    const container = document.getElementById("categories-colors-list");
    if (!container) return;
    container.innerHTML = "";
    
    allCategories.forEach(cat => {
        const defaultColor = globalColors[cat] || "#b05c75"; 
        const div = document.createElement("div");
        div.style = "display: flex; align-items: center; justify-content: space-between; background: #fff; padding: 10px; border-radius:6px; border: 1px solid #eee;";
        div.innerHTML = `
            <span style="font-weight: bold; font-size:13px; color:#444;">${cat}</span>
            <div style="display:flex; gap:5px; align-items:center;">
               <input type="color" data-category="${cat}" value="${defaultColor}" style="border:none; cursor:pointer; width:45px; height:30px;">
               <button onclick="deleteCategoryPermanently('${cat}')" style="background:none; border:none; color:red; cursor:pointer;">🗑️</button>
            </div>
        `;
        container.appendChild(div);
    });
}

async function deleteCategoryPermanently(catName) {
    if (!confirm(`Czy na pewno chcesz CAŁKOWICIE usunąć kategorię "${catName}" z bazy danych ustawień kolorów?`)) return;
    try {
        await fetch(APPS_SCRIPT_URL, {
            method: "POST",
            headers: { "Content-Type": "text/plain" },
            body: JSON.stringify({ action: "updateSettings", deleteCategoryName: catName, payload: { colors: {} } })
        });
        alert("Kategoria usunięta permanentnie.");
        await loadSettings();
    } catch(e) { alert("Błąd połączenia."); }
}

async function addNewCategoryEmpty() {
    const input = document.getElementById("createNewCategoryName"); 
    const newCatName = input.value.trim();
    if (!newCatName) return;
    
    const updatedColors = { ...globalColors };
    updatedColors[newCatName] = "#b05c75";

    try {
        await fetch(APPS_SCRIPT_URL, {
            method: "POST",
            headers: { "Content-Type": "text/plain" },
            body: JSON.stringify({ action: "updateSettings", payload: { colors: updatedColors } })
        });
        input.value = "";
        alert("Utworzono stałą kategorię!");
        await loadSettings();
        closeCategoryModal();
    } catch(e) { alert("Błąd połączenia."); }
}

async function saveSettings() {
    const categoryColors = {};
    document.querySelectorAll("#categories-colors-list input[type='color']").forEach(input => {
        categoryColors[input.getAttribute("data-category")] = input.value;
    });

    try {
        await fetch(APPS_SCRIPT_URL, {
            method: "POST",
            headers: { "Content-Type": "text/plain" },
            body: JSON.stringify({ action: "updateSettings", payload: { colors: categoryColors } })
        });
        alert("Kolory zapisane pomyślnie.");
        await loadSettings();
    } catch(e) { alert("Błąd zapisu."); }
}

// Pozostałe wymagane funkcje interfejsu modali, aby zapobiec błędom JS
void function handleCredentialResponse(response) { console.log(response); };
function openBlockTimeModal() { document.getElementById("blockTimeModal").style.display = "flex"; }
function closeBlockTimeModal() { document.getElementById("blockTimeModal").style.display = "none"; }
function toggleBlockTimeFields() {
    const type = document.getElementById("block-type").value;
    document.getElementById("block-hours-group").style.display = (type === "hours") ? "block" : "none";
}
function submitBlockTime() { closeBlockTimeModal(); }
function closeCategoryModal() { document.getElementById("categoryModal").style.display = "none"; }
function openCategoryModal() { document.getElementById("categoryModal").style.display = "flex"; }
function openAppointmentDetailsModal(app) {
    document.getElementById("details-name").innerText = app.name;
    document.getElementById("details-phone").innerText = app.phone;
    document.getElementById("details-service").innerText = app.service;
    document.getElementById("details-datetime").innerText = app.date;
    document.getElementById("details-duration").innerText = app.duration || "45";
    document.getElementById("appointmentDetailsModal").style.display = "flex";
}
function closeAppointmentModal() { document.getElementById("appointmentDetailsModal").style.display = "none"; }
function switchToEditAppointment() {
    document.getElementById("appointment-details-view").style.display = "none";
    document.getElementById("appointment-edit-form").style.display = "block";
}
function switchToViewAppointment() {
    document.getElementById("appointment-details-view").style.display = "block";
    document.getElementById("appointment-edit-form").style.display = "none";
}
function deleteAppointmentFromAdmin() { closeAppointmentModal(); }
function saveEditedAppointment() { closeAppointmentModal(); }
function openAddServiceModal() { document.getElementById("serviceModal").style.display = "flex"; }
function closeServiceModal() { document.getElementById("serviceModal").style.display = "none"; }
function toggleNewCategoryInput() {}
function saveServiceModalData() { closeServiceModal(); }
function renameCategoryGlobal() {}
function deleteCategoryGlobal() {}
function undo() {}
function redo() {}
function saveDraftsToCloud() {}
function publishDrafts() {}
function editService(idx) {}
function deleteService(idx) {}
