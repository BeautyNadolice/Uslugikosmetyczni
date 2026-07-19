const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzgZ-FgaxZszGtFHPQdj8TghVgDWf3TCvIBXMh9yCS-vkysbGrHmAOEwNH144JB2cyvcA/exec";
const ALLOWED_EMAIL = "strsasa@gmail.com"; // Zaktualizowane na podstawie zrzutu ekranu kalendarza

let currentServices = [];       
let allCategories = []; 
let selectedCalendarDate = new Date(); 
let miniMonthDate = new Date();        
let calendarViewMode = "day";          
let appointmentsData = [];             
let globalColors = {};                 
let settingsData = {};
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

function switchTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.style.display = 'none');
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`tab-${tabName}`).style.display = 'block';
    
    const activeBtn = document.querySelector(`.tab-btn[onclick*="${tabName}"]`);
    if (activeBtn) activeBtn.classList.add('active');
    
    if (tabName === "kalendarz") { renderBooksyCalendar(); }
    if (tabName === "finanse") { calculateFinanceReport(); }
}

function setCalendarView(mode) {
    calendarViewMode = mode;
    document.getElementById("view-day-btn").classList.toggle("active", mode === "day");
    document.getElementById("view-week-btn").classList.toggle("active", mode === "week");
    document.getElementById("view-month-btn").classList.toggle("active", mode === "month");
    renderBooksyCalendar();
}

function changeSelectedDate(days) {
    if (calendarViewMode === "week") {
        selectedCalendarDate.setDate(selectedCalendarDate.getDate() + (days * 7));
    } else if (calendarViewMode === "month") {
        selectedCalendarDate.setMonth(selectedCalendarDate.getMonth() + days);
    } else {
        selectedCalendarDate.setDate(selectedCalendarDate.getDate() + days);
    }
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
            
            // Mapowanie kolorów uwzględniające prefiks "color_" z bazy danych
            globalColors = {};
            if(data.settings.colors) {
                Object.keys(data.settings.colors).forEach(key => {
                    const cleanKey = key.replace("color_", "").trim();
                    globalColors[cleanKey] = data.settings.colors[key];
                });
            }
            
            allCategories = data.settings.all_categories || [];
            appointmentsData = data.appointments || [];
            
            // Mapowanie obiektów bazy na zmienne JS (Dopasowanie do kolumn: Data/Godzina, Imię, Zabieg, Telefon)
            appointmentsData = appointmentsData.map(app => {
                return {
                    date: app["Data/Godzina"] || app.date,
                    name: app["Imię"] || app.name,
                    service: app["Zabieg"] || app.service,
                    phone: app["Telefon"] || app.phone,
                    duration: app["Czas trwania"] || app.duration || 45,
                    category: "Inne"
                };
            });
            
            appointmentsData.forEach(app => {
                if (app.service) {
                    const match = currentServices.find(s => s.name.trim().toLowerCase() === app.service.trim().toLowerCase());
                    if (match) app.category = match.category.trim();
                }
            });

            buildColorsEditor();
            renderBooksyCalendar();
        }
    } catch (e) {
        console.error("Błąd ładowania ustawień systemu:", e);
    }
}

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
        const targetAppointments = appointmentsData.filter(app => app.date && app.date.startsWith(targetDateStr));
        
        if (targetAppointments.length === 0) {
            grid.innerHTML = `<div style="padding: 40px; text-align: center; color: #999; font-weight: bold; width:100%;">Brak zaplanowanych wizyt na ten dzień. ✨</div>`;
            return;
        }

        targetAppointments.sort((a,b) => a.date.localeCompare(b.date)).forEach(app => {
            const appTimeStr = app.date.split("T")[1].substring(0, 5);
            const card = document.createElement("div");
            card.className = "booksy-event-card";
            card.style = "position: relative; margin: 10px 0; padding: 12px; border-radius: 8px; color: white; cursor: pointer;";
            
            const isBlock = app.phone === "Google Calendar" || app.service === "Rezerwacja zewnętrzna";
            card.style.backgroundColor = isBlock ? "#555555" : (globalColors[app.category] || "#b05c75");

            card.innerHTML = `
                <div class="event-time">⏰ ${appTimeStr} - ${getEndTimeStr(appTimeStr, app.duration)} (${app.duration} min)</div>
                <div class="event-name">👤 ${app.name}</div>
                <div class="event-service">💅 Zabieg: ${app.service}</div>
                ${isBlock ? '' : `<div class="event-phone">📞 Tel: ${app.phone}</div>`}
            `;
            card.onclick = () => openAppointmentDetailsModal(app);
            grid.appendChild(card);
        });
    } else if (calendarViewMode === "week") {
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
            const targetAppointments = appointmentsData.filter(app => app.date && app.date.startsWith(targetDateStr));
            
            if (targetAppointments.length > 0) {
                hasAnyWeeklyBooking = true;
                const colBlock = document.createElement("div");
                colBlock.style = "background: #fff; border: 1px solid #eee; border-radius: 8px; padding: 10px; margin-bottom: 15px;";
                colBlock.innerHTML = `<h4 style="margin: 0 0 10px 0; color:#b05c75; border-bottom:1px solid #f9fafb; padding-bottom:5px;">${daysOfWeek[colDate.getDay()]} (${colDate.getDate()})</h4>`;
                
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
            grid.innerHTML = `<div style="padding: 40px; text-align: center; color: #999; font-weight: bold; width:100%;">Cały tydzień wolny! ✨</div>`;
        }
    } else if (calendarViewMode === "month") {
        title.innerText = `Widok: ${months[selectedCalendarDate.getMonth()]} ${selectedCalendarDate.getFullYear()}`;
        const currentMonth = selectedCalendarDate.getMonth();
        const currentYear = selectedCalendarDate.getFullYear();
        
        const monthlyAppointments = appointmentsData.filter(app => {
            if(!app.date) return false;
            const d = new Date(app.date);
            return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        });

        if (monthlyAppointments.length === 0) {
            grid.innerHTML = `<div style="padding: 40px; text-align: center; color: #999; font-weight: bold; width:100%;">Brak rezerwacji w tym miesiącu. 🌸</div>`;
            return;
        }

        monthlyAppointments.sort((a,b) => a.date.localeCompare(b.date)).forEach(app => {
            const dObj = new Date(app.date);
            const dayStr = String(dObj.getDate()).padStart(2, '0');
            const timeStr = app.date.split("T")[1].substring(0, 5);
            
            const isBlock = app.phone === "Google Calendar" || app.service === "Rezerwacja zewnętrzna";
            const item = document.createElement("div");
            item.style = `background: ${isBlock ? '#555' : (globalColors[app.category] || '#b05c75')}; color: white; padding: 10px; border-radius: 6px; margin-bottom: 8px; cursor: pointer; display: flex; justify-content: space-between;`;
            item.innerHTML = `<span>📅 <strong>Dzień ${dayStr} o ${timeStr}</strong> - ${app.name} (${app.service})</span> <span>${app.duration} min</span>`;
            item.onclick = () => openAppointmentDetailsModal(app);
            grid.appendChild(item);
        });
    }
}

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

function closeCreateAppointmentModal() {
    document.getElementById('appointmentModal').style.display = 'none';
}

function openAppointmentDetailsModal(app) {
    currentEditingAppointment = app; 
    
    document.getElementById("details-name").innerText = app.name;
    document.getElementById("details-phone").innerText = app.phone;
    document.getElementById("details-service").innerText = app.service;
    document.getElementById("details-datetime").innerText = new Date(app.date).toLocaleString();
    document.getElementById("details-duration").innerText = app.duration || "45";
    
    document.getElementById("edit-app-name").value = app.name;
    document.getElementById("edit-app-phone").value = app.phone;
    document.getElementById("edit-app-service").value = app.service;
    document.getElementById("edit-app-duration").value = app.duration || "45";
    
    const d = new Date(app.date);
    document.getElementById("edit-app-datetime").value = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0,16);
    
    switchToViewAppointment();
    document.getElementById("appointmentDetailsModal").style.display = "flex";
}

function closeAppointmentModal() {
    document.getElementById("appointmentDetailsModal").style.display = "none";
}

function switchToEditAppointment() {
    document.getElementById("appointment-details-view").style.display = "none";
    document.getElementById("appointment-edit-form").style.display = "block";
}

function switchToViewAppointment() {
    document.getElementById("appointment-details-view").style.display = "block";
    document.getElementById("appointment-edit-form").style.display = "none";
}

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

    fetch(APPS_SCRIPT_URL, {
        method: "POST",
        mode: "cors", 
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify(payload)
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            alert("Nowa wizyta została utworzona!");
            document.getElementById('appointmentModal').style.display = 'none';
            loadSettings(); 
        } else { alert("Błąd: " + data.error); }
    }).catch(err => alert("Błąd sieci połączenia."));
}

function saveEditedAppointment() {
    if (!currentEditingAppointment) return;

    let payload = {
        action: "createBooking",
        editFlag: true,
        oldDate: new Date(currentEditingAppointment.date).toISOString(),
        oldName: currentEditingAppointment.name,
        name: document.getElementById("edit-app-name").value.trim(),
        phone: document.getElementById("edit-app-phone").value.trim(),
        service: document.getElementById("edit-app-service").value.trim(),
        duration: document.getElementById("edit-app-duration").value,
        date: new Date(document.getElementById("edit-app-datetime").value).toISOString()
    };

    fetch(APPS_SCRIPT_URL, {
        method: "POST",
        mode: "cors",
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify(payload)
    })
    .then(res => res.json())
    .then(data => {
        if(data.success) {
            alert("Zaktualizowano dane i skorygowano czas wizyty!");
            closeAppointmentModal();
            loadSettings();
        } else { alert("Błąd edycji: " + data.error); }
    }).catch(() => alert("Błąd sieci przy zapisie zmian."));
}

function deleteAppointmentFromAdmin() {
    if (!currentEditingAppointment || !confirm("Czy na pewno chcesz odwołać tę wizytę?")) return;

    fetch(APPS_SCRIPT_URL, {
        method: "POST",
        mode: "cors",
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify({
            action: "deleteBooking", 
            date: new Date(currentEditingAppointment.date).toISOString(),
            name: currentEditingAppointment.name
        })
    })
    .then(res => res.json())
    .then(data => {
        alert("Wizyta została pomyślnie usunięta!");
        closeAppointmentModal();
        loadSettings();
    }).catch(() => alert("Błąd sieci przy usuwaniu."));
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

    if (!currentServices || currentServices.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:20px; color:#999;">Brak danych w cenniku.</td></tr>`;
        return;
    }

    const uniqueCategories = [...new Set(currentServices.map(s => s.category ? s.category.trim() : "Inne"))];

    uniqueCategories.forEach(catName => {
        const servicesInCat = currentServices.filter(s => (s.category ? s.category.trim() : "Inne") === catName);
        const headerTr = document.createElement("tr");
        headerTr.innerHTML = `<td colspan="6" style="font-weight: bold; padding: 10px; background: #faf0f2;">🏷️ Kategoria: ${catName}</td>`;
        tbody.appendChild(headerTr);

        servicesInCat.forEach((item) => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${item.category || "Inne"}</td> <td><strong>${item.name}</strong></td> <td>${item.price} zł</td> <td>${item.duration} min</td> <td>${item.status || "Aktywna"}</td>
                <td>
                    <button onclick="alert('Edycja w przygotowaniu')">Edytuj</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    });
}

function calculateFinanceReport() {
    let todaySum = 0, weekSum = 0, monthSum = 0;
    const now = new Date();
    
    appointmentsData.forEach(app => {
        if(!app.date || !app.service) return;
        const appDate = new Date(app.date);
        const match = currentServices.find(s => s.name.trim().toLowerCase() === app.service.trim().toLowerCase());
        const price = match ? parseFloat(match.price) || 0 : 0;

        if (appDate.toDateString() === now.toDateString()) todaySum += price;
        if (appDate.getMonth() === now.getMonth() && appDate.getFullYear() === now.getFullYear()) monthSum += price;
        
        const diffTime = Math.abs(now - appDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays <= 7) weekSum += price;
    });

    document.getElementById("finance-today").innerText = todaySum.toFixed(2) + " zł";
    document.getElementById("finance-week").innerText = weekSum.toFixed(2) + " zł";
    document.getElementById("finance-month").innerText = monthSum.toFixed(2) + " zł";
}

function getEndTimeStr(startTimeStr, durationMin) {
    if(!startTimeStr) return "";
    const parts = startTimeStr.split(":");
    const h = parseInt(parts[0]) || 0;
    const m = parseInt(parts[1]) || 0;
    const d = new Date(); d.setHours(h, m + parseInt(durationMin || 45));
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
    for (let i = 1; i < startDayOfWeek; i++) { grid.appendChild(document.createElement("div")); }
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

function buildColorsEditor() {
    const container = document.getElementById("categories-colors-list");
    if (!container) return; container.innerHTML = "";
    allCategories.forEach(cat => {
        const cleanCat = cat.replace("color_", "").trim();
        const defaultColor = globalColors[cleanCat] || "#b05c75"; 
        const div = document.createElement("div");
        div.style = "display: flex; align-items: center; justify-content: space-between; background: #fff; padding: 10px; border-radius:6px; border: 1px solid #eee;";
        div.innerHTML = `<span style="font-weight: bold; font-size:13px; color:#444;">${cleanCat}</span><input type="color" data-category="${cleanCat}" value="${defaultColor}" style="border:none; cursor:pointer; width:45px; height:30px;">`;
        container.appendChild(div);
    });
}

async function saveSettings() {
    const categoryColors = {};
    document.querySelectorAll("#categories-colors-list input[type='color']").forEach(input => {
        const cat = input.getAttribute("data-category");
        categoryColors["color_" + cat] = input.value;
    });
    try {
        await fetch(APPS_SCRIPT_URL, {
            method: "POST",
            headers: { "Content-Type": "text/plain" },
            body: JSON.stringify({ action: "updateSettings", payload: { colors: categoryColors } })
        });
        alert("Ustawienia kolorów zostały zapisane pomyślnie w bazie!");
        await loadSettings();
    } catch(e) { alert("Błąd zapisu ustawień."); }
}

function handleCredentialResponse(response) { console.log(response); }
function openBlockTimeModal() { document.getElementById("blockTimeModal").style.display = "flex"; }
function closeBlockTimeModal() { document.getElementById("blockTimeModal").style.display = "none"; }
function toggleBlockTimeFields() {
    const type = document.getElementById("block-type").value;
    document.getElementById("block-hours-group").style.display = (type === "hours") ? "block" : "none";
}
function submitBlockTime() { closeBlockTimeModal(); }
