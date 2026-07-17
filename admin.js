const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyD7pEtz0K2Kg-JfSw7YK1nM6F_CnHww_QO94v0ZKExWmTcOLkw6Y6xKr0JgG_gIYupcg/exec";
const ALLOWED_EMAIL = "vasha_jena@gmail.com"; 
let currentUserEmail = null;

let currentServices = [];       
let allCategories = [];         
let undoStack = [];             
let redoStack = [];             
let hasUnsavedChanges = false;  

// ПЕРЕМЕННЫЕ ДЛЯ РАБОТЫ КАЛЕНДАРЯ
let selectedCalendarDate = new Date(); // Текущая открытая дата в календаре
let miniMonthDate = new Date();        // Дата для отображения мини-календаря слева
let calendarViewMode = "day";          // Режим отображения: 'day' или 'week'
let appointmentsData = [];             // Записи из таблицы и Google Календаря
let globalColors = {};                 // Цвета категорий
let settingsData = {                   // Настройки по умолчанию
    work_start_hour: "09:00",
    work_end_hour: "18:00",
    buffer_hours: 1
};

document.addEventListener("DOMContentLoaded", () => {
    checkAuthSession();

    window.addEventListener("beforeunload", (e) => {
        if (hasUnsavedChanges) {
            e.preventDefault();
            e.returnValue = "Masz niezapisane zmiany w Szkicach!";
        }
    });

    document.addEventListener("keydown", (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
            e.preventDefault();
            undo();
        }
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
            e.preventDefault();
            redo();
        }
    });
});

// ==========================================================================
// СИСТЕМА АВТОРИЗАЦИИ (MODAL WINDOW FLOW)
// ==========================================================================

function checkAuthSession() {
    const savedEmail = localStorage.getItem("admin_email");
    if (savedEmail) {
        if (savedEmail === ALLOWED_EMAIL || savedEmail === "test_admin@test.com") {
            currentUserEmail = savedEmail;
            showAdminPanel();
            return;
        }
    }
    showLoginScreen();
}

function showAdminPanel() {
    document.getElementById("login-modal").style.display = "none";
    document.getElementById("admin-panel-wrapper").style.display = "block";
    loadAdminServices();
    loadSettings();
}

function showLoginScreen() {
    document.getElementById("login-modal").style.display = "flex";
    document.getElementById("admin-panel-wrapper").style.display = "none";
}

function closeLoginModal() {
    document.getElementById("login-modal").style.display = "none";
    window.location.href = "index.html";
}

function loginTest() {
    console.log("Вход выполнен через Тестовый режим");
    currentUserEmail = "test_admin@test.com"; 
    localStorage.setItem("admin_email", currentUserEmail);
    showAdminPanel();
}

function handleCredentialResponse(response) {
    try {
        const base64Url = response.credential.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        const payload = JSON.parse(jsonPayload);
        const userEmail = payload.email.trim().toLowerCase();

        if (userEmail === ALLOWED_EMAIL.trim().toLowerCase()) {
            currentUserEmail = userEmail;
            localStorage.setItem("admin_email", currentUserEmail);
            localStorage.setItem("google_id_token", response.credential); 
            showAdminPanel();
        } else {
            alert(`Brak dostępu! Email ${userEmail} nie ma uprawnień administratora.`);
            google.accounts.id.disableAutoSelect();
        }
    } catch (e) {
        console.error("Błąd autoryzacji Google:", e);
        alert("Wystąpił błąd podczas logowania przez Google.");
    }
}

function logout() {
    if (hasUnsavedChanges) {
        if (!confirm("Masz niezapisane zmiany! Czy na pewno chcesz się wylogować?")) return;
    }
    
    localStorage.removeItem("admin_email");
    localStorage.removeItem("google_id_token");
    currentUserEmail = null;
    
    alert("Wylogowano pomyślnie.");
    window.location.href = "index.html"; 
}

// ==========================================================================
// УПРАВЛЕНИЕ ВКЛАДКАМИ И ЗАГРУЗКА ДАННЫХ
// ==========================================================================

function switchTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.style.display = 'none');
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    
    const targetTab = document.getElementById(`tab-${tabName}`);
    if (targetTab) targetTab.style.display = 'block';
    
    const activeBtn = document.querySelector(`.tab-btn[onclick*="${tabName}"]`);
    if (activeBtn) activeBtn.classList.add('active');

    if (tabName === "kalendarz") {
        renderBooksyCalendar();
    }
}

function setCalendarView(mode) {
    calendarViewMode = mode;
    document.getElementById("view-day-btn").classList.toggle("active", mode === "day");
    document.getElementById("view-week-btn").classList.toggle("active", mode === "week");
    renderBooksyCalendar();
}

function changeSelectedDate(days) {
    if (calendarViewMode === "week") {
        selectedCalendarDate.setDate(selectedCalendarDate.getDate() + (days * 7));
    } else {
        selectedCalendarDate.setDate(selectedCalendarDate.getDate() + days);
    }
    miniMonthDate = new Date(selectedCalendarDate);
    renderBooksyCalendar();
}

// Загрузка настроек, встреч и персональных цветов
async function loadSettings() {
    try {
        const response = await fetch(APPS_SCRIPT_URL + "?checkBusy=true");
        const data = await response.json();
        if (data.settings) {
            settingsData = data.settings;
            document.getElementById("work_start_hour").value = data.settings.work_start_hour || "09:00";
            document.getElementById("work_end_hour").value = data.settings.work_end_hour || "18:00";
            document.getElementById("buffer_hours").value = data.settings.buffer_hours || 1;
            
            globalColors = data.settings.colors || {};
            appointmentsData = data.appointments || [];
            
            buildColorsEditor();
            miniMonthDate = new Date(selectedCalendarDate);
            renderBooksyCalendar();
        }
    } catch (e) {
        console.error("Błąd ładowania ustawień:", e);
    }
}

// Сохранение настроек и кастомных цветов категорий
async function saveSettings() {
    const btn = document.getElementById("saveSettingsBtn");
    if (!btn) return;
    const originalText = btn.innerText;
    btn.innerText = "Zapisywanie...";
    btn.disabled = true;

    const categoryColors = {};
    const colorInputs = document.querySelectorAll("#categories-colors-list input[type='color']");
    colorInputs.forEach(input => {
        const cat = input.getAttribute("data-category");
        categoryColors[cat] = input.value;
    });

    const payload = {
        work_start_hour: document.getElementById("work_start_hour").value.trim(),
        work_end_hour: document.getElementById("work_end_hour").value.trim(),
        buffer_hours: parseInt(document.getElementById("buffer_hours").value) || 1,
        colors: categoryColors
    };

    try {
        await fetch(APPS_SCRIPT_URL, {
            method: "POST",
            mode: "no-cors", 
            headers: { "Content-Type": "text/plain" },
            body: JSON.stringify({ action: "updateSettings", payload: payload })
        });
        
        alert("Ustawienia zapisane!");
        globalColors = categoryColors;
        renderBooksyCalendar();
    } catch (e) {
        console.error(e);
        alert("Błąd połączenia.");
    } finally {
        btn.innerText = originalText;
        btn.disabled = false;
    }
}

function buildColorsEditor() {
    const container = document.getElementById("categories-colors-list");
    if (!container) return;
    container.innerHTML = "";
    
    if (allCategories.length === 0) {
        container.innerHTML = "<p style='grid-column: span 2; color:#999; text-align:center;'>Wpierw dodaj usługi w Cenniku, aby móc zmieniać ich kolory.</p>";
        return;
    }
    
    allCategories.forEach(cat => {
        const defaultColor = globalColors[cat] || "#b05c75"; 
        const div = document.createElement("div");
        div.style = "display: flex; align-items: center; justify-content: space-between; background: #fff; padding: 10px; border-radius:6px; border: 1px solid #eee;";
        div.innerHTML = `
            <span style="font-weight: bold; font-size:13px; color:#444;">${cat}</span>
            <input type="color" data-category="${cat}" value="${defaultColor}" style="border:none; cursor:pointer; width:45px; height:30px; border-radius:4px; padding:0;">
        `;
        container.appendChild(div);
    });
}

// ==========================================================================
// ГЕНЕРАЦИЯ ОБНОВЛЕННОГО ДВУХПАНЕЛЬНОГО КАЛЕНДАРЯ
// ==========================================================================

function changeMiniMonth(dir) {
    miniMonthDate.setMonth(miniMonthDate.getMonth() + dir);
    renderMiniMonthCalendar();
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
    if (startDayOfWeek === 0) startDayOfWeek = 7; // Делаем Понедельник первым
    
    const daysInMonth = new Date(miniMonthDate.getFullYear(), miniMonthDate.getMonth() + 1, 0).getDate();
    
    // Пустые ячейки для смещения начала месяца
    for (let i = 1; i < startDayOfWeek; i++) {
        const empty = document.createElement("div");
        grid.appendChild(empty);
    }
    
    const today = new Date();
    
    for (let day = 1; day <= daysInMonth; day++) {
        const dayCell = document.createElement("div");
        dayCell.className = "mini-date-cell";
        dayCell.innerText = day;
        
        const cellDate = new Date(miniMonthDate.getFullYear(), miniMonthDate.getMonth(), day);
        
        // Подсвечиваем сегодня
        if (cellDate.toDateString() === today.toDateString()) {
            dayCell.classList.add("today");
        }
        
        // Подсвечиваем выбранный в основном календаре день
        if (cellDate.toDateString() === selectedCalendarDate.toDateString()) {
            dayCell.classList.add("selected");
        }
        
        dayCell.onclick = () => {
            selectedCalendarDate = cellDate;
            renderBooksyCalendar();
        };
        
        grid.appendChild(dayCell);
    }
}

function renderBooksyCalendar() {
    renderMiniMonthCalendar();
    
    const timeline = document.getElementById("booksy-timeline");
    const grid = document.getElementById("booksy-grid");
    const title = document.getElementById("calendar-current-date-title");
    const scrollWrapper = document.getElementById("booksy-cal-scroll-node");
    if (!timeline || !grid) return;
    
    const daysOfWeek = ["Niedziela", "Poniedziałek", "Wtorek", "Środa", "Czwartek", "Piątek", "Sobota"];
    const months = ["Stycznia", "Lutego", "Marca", "Kwietnia", "Maja", "Czerwca", "Lipca", "Sierpnia", "Września", "Października", "Listopada", "Grudnia"];
    
    timeline.innerHTML = "";
    grid.innerHTML = "";
    
    const startHour = parseInt((settingsData.work_start_hour || "09:00").split(":")[0], 10);
    const endHour = parseInt((settingsData.work_end_hour || "18:00").split(":")[0], 10);
    const totalHours = endHour - startHour;
    const pxPerMinute = 1.2; 
    const totalMinutes = totalHours * 60;
    
    grid.style.height = `${totalMinutes * pxPerMinute}px`;
    
    // Строим временную шкалу слева
    for (let h = startHour; h <= endHour; h++) {
        const label = document.createElement("div");
        label.className = "time-label";
        label.style.height = `${60 * pxPerMinute}px`;
        label.innerText = `${h.toString().padStart(2, '0')}:00`;
        timeline.appendChild(label);
    }

    // Режим "ДЕНЬ"
    if (calendarViewMode === "day") {
        scrollWrapper.classList.remove("week-view-active");
        title.innerText = `${daysOfWeek[selectedCalendarDate.getDay()]}, ${selectedCalendarDate.getDate()} ${months[selectedCalendarDate.getMonth()]} ${selectedCalendarDate.getFullYear()}`;
        
        for (let m = 0; m < totalMinutes; m += 30) {
            const line = document.createElement("div");
            line.className = "grid-halfhour-line";
            line.style.top = `${m * pxPerMinute}px`;
            grid.appendChild(line);
        }
        
        const targetDateStr = getFormattedISOBlockDate(selectedCalendarDate);
        const targetAppointments = appointmentsData.filter(app => app.date.startsWith(targetDateStr));
        
        targetAppointments.forEach(app => {
            const appTimeStr = app.date.split("T")[1].substring(0, 5); 
            const [appH, appM] = appTimeStr.split(":").map(Number);
            const startOffsetMinutes = (appH * 60 + appM) - (startHour * 60);
            const topPos = startOffsetMinutes * pxPerMinute;
            const heightPos = app.duration * pxPerMinute;
            
            if (topPos >= 0 && topPos < totalMinutes * pxPerMinute) {
                const card = document.createElement("div");
                card.className = "booksy-event-card";
                card.style.top = `${topPos}px`;
                card.style.left = "10px";
                card.style.right = "10px";
                card.style.setProperty('--event-calculated-height', `${heightPos}px`);
                
                const isBlock = app.phone === "Google Calendar" || app.service === "Rezerwacja zewnętrzna";
                card.style.backgroundColor = isBlock ? "#555555" : (globalColors[app.category] || "#b05c75");
                if (isBlock) card.style.borderLeft = "4px solid #cc0000";

                card.innerHTML = `
                    <div class="event-time">${appTimeStr} - ${getEndTimeStr(appTimeStr, app.duration)}</div>
                    <div class="event-name">${app.name}</div>
                    <div class="event-service">${app.service}</div>
                    ${isBlock ? '' : `<div class="event-phone">📞 ${app.phone}</div>`}
                `;
                
                // Клик открывает модалку управления визитом
                card.onclick = () => openAppointmentDetailsModal(app);
                grid.appendChild(card);
            }
        });
    } 
    // Режим "НЕДЕЛЯ"
    else {
        scrollWrapper.classList.add("week-view-active");
        
        // Получаем дату понедельника текущей выбранной недели
        const currentDay = selectedCalendarDate.getDay();
        const distanceToMonday = currentDay === 0 ? -6 : 1 - currentDay;
        const mondayDate = new Date(selectedCalendarDate);
        mondayDate.setDate(mondayDate.getDate() + distanceToMonday);
        
        const sundayDate = new Date(mondayDate);
        sundayDate.setDate(sundayDate.getDate() + 6);
        
        title.innerText = `${mondayDate.getDate()} ${months[mondayDate.getMonth()]} - ${sundayDate.getDate()} ${months[sundayDate.getMonth()]} ${sundayDate.getFullYear()}`;
        
        // Создаем 7 колонок сетки
        for (let d = 0; d < 7; d++) {
            const colDate = new Date(mondayDate);
            colDate.setDate(colDate.getDate() + d);
            
            const col = document.createElement("div");
            col.className = "calendar-week-column";
            
            const colHeader = document.createElement("div");
            colHeader.className = "week-column-header";
            if (colDate.toDateString() === new Date().toDateString()) colHeader.classList.add("today-col");
            colHeader.innerHTML = `<strong>${colDate.getDate()}</strong><div>${daysOfWeek[colDate.getDay()].substring(0, 3)}</div>`;
            col.appendChild(colHeader);
            
            const colGrid = document.createElement("div");
            colGrid.className = "week-column-grid-inner";
            colGrid.style.height = `${totalMinutes * pxPerMinute}px`;
            
            for (let m = 0; m < totalMinutes; m += 30) {
                const line = document.createElement("div");
                line.className = "grid-halfhour-line";
                line.style.top = `${m * pxPerMinute}px`;
                colGrid.appendChild(line);
            }
            
            const targetDateStr = getFormattedISOBlockDate(colDate);
            const targetAppointments = appointmentsData.filter(app => app.date.startsWith(targetDateStr));
            
            targetAppointments.forEach(app => {
                const appTimeStr = app.date.split("T")[1].substring(0, 5);
                const [appH, appM] = appTimeStr.split(":").map(Number);
                const startOffsetMinutes = (appH * 60 + appM) - (startHour * 60);
                const topPos = startOffsetMinutes * pxPerMinute;
                const heightPos = app.duration * pxPerMinute;
                
                if (topPos >= 0 && topPos < totalMinutes * pxPerMinute) {
                    const card = document.createElement("div");
                    card.className = "booksy-event-card week-card";
                    card.style.top = `${topPos}px`;
                    card.style.setProperty('--event-calculated-height', `${heightPos}px`);
                    
                    const isBlock = app.phone === "Google Calendar" || app.service === "Rezerwacja zewnętrzna";
                    card.style.backgroundColor = isBlock ? "#555555" : (globalColors[app.category] || "#b05c75");
                    
                    card.innerHTML = `
                        <div class="event-time">${appTimeStr}</div>
                        <div class="event-name" style="font-size:11px;">${app.name}</div>
                        <div class="event-service" style="font-size:10px; margin-bottom:0;">${app.service}</div>
                    `;
                    card.onclick = () => openAppointmentDetailsModal(app);
                    colGrid.appendChild(card);
                }
            });
            
            col.appendChild(colGrid);
            grid.appendChild(col);
        }
    }
}

function getEndTimeStr(startTimeStr, durationMin) {
    const [h, m] = startTimeStr.split(":").map(Number);
    const d = new Date();
    d.setHours(h, m + durationMin);
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
}

function getFormattedISOBlockDate(dateObj) {
    return dateObj.getFullYear() + "-" + 
           String(dateObj.getMonth() + 1).padStart(2, '0') + "-" + 
           String(dateObj.getDate()).padStart(2, '0');
}

// ==========================================================================
// ОКНО ДЕТАЛЕЙ, РЕДАКТИРОВАНИЯ И УДАЛЕНИЯ ВИЗИТОВ
// ==========================================================================

let activeSelectedAppointment = null;

function openAppointmentDetailsModal(app) {
    activeSelectedAppointment = app;
    
    document.getElementById("details-name").innerText = app.name || "Brak";
    document.getElementById("details-phone").innerText = app.phone || "Brak";
    document.getElementById("details-service").innerText = app.service || "Brak";
    
    const d = new Date(app.date);
    document.getElementById("details-datetime").innerText = d.toLocaleString("pl-PL");
    document.getElementById("details-duration").innerText = app.duration || 45;
    
    switchToViewAppointment();
    document.getElementById("appointmentDetailsModal").style.display = "flex";
}

function closeAppointmentModal() {
    document.getElementById("appointmentDetailsModal").style.display = "none";
}

function switchToViewAppointment() {
    document.getElementById("appointment-details-view").style.display = "block";
    document.getElementById("appointment-edit-form").style.display = "none";
}

function switchToEditAppointment() {
    if (!activeSelectedAppointment) return;
    
    document.getElementById("edit-app-name").value = activeSelectedAppointment.name || "";
    document.getElementById("edit-app-phone").value = activeSelectedAppointment.phone || "";
    document.getElementById("edit-app-service").value = activeSelectedAppointment.service || "";
    document.getElementById("edit-app-duration").value = activeSelectedAppointment.duration || 45;
    
    // Переводим в формат YYYY-MM-DDTHH:MM
    const d = new Date(activeSelectedAppointment.date);
    const tzOffset = d.getTimezoneOffset() * 60000;
    const localISOTime = new Date(d.getTime() - tzOffset).toISOString().slice(0, 16);
    document.getElementById("edit-app-datetime").value = localISOTime;
    
    document.getElementById("appointment-details-view").style.display = "none";
    document.getElementById("appointment-edit-form").style.display = "block";
}

// УДАЛЕНИЕ ЗАПИСИ ИЗ АДМИНКИ С СИНХРОНИЗАЦИЕЙ С ТАБЛИЦЕЙ И КАЛЕНДАРЕМ
async function deleteAppointmentFromAdmin() {
    if (!activeSelectedAppointment) return;
    if (!confirm(`Czy na pewno chcesz ODWOŁAĆ i całkowicie usunąć wizytę klienta: ${activeSelectedAppointment.name}? Zmiana usunie ją z Tabeli oraz Kalendarza Google.`)) return;
    
    const originalText = document.querySelector("#appointment-details-view .btn-danger").innerText;
    document.querySelector("#appointment-details-view .btn-danger").innerText = "Usuwanie...";
    
    try {
        // Мы отправляем запрос POST с типом deleteBooking на Apps Script бэкенд
        await fetch(APPS_SCRIPT_URL, {
            method: "POST",
            mode: "no-cors",
            headers: { "Content-Type": "text/plain" },
            body: JSON.stringify({
                action: "createBooking", // используем ту же структуру, но передаем специальный флаг удаления
                deleteFlag: true,
                date: activeSelectedAppointment.date,
                phone: activeSelectedAppointment.phone,
                name: activeSelectedAppointment.name
            })
        });
        
        alert("Wizyta została pomyślnie usunięta!");
        closeAppointmentModal();
        await loadSettings(); // Перезагружаем календарную сетку
    } catch (e) {
        console.error(e);
        alert("Błąd соединения с сервером.");
    }
}

// СОХРАНЕНИЕ ОТРЕДАКТИРОВАННОГО ВИЗИТА
async function saveEditedAppointment() {
    if (!activeSelectedAppointment) return;
    
    const payload = {
        action: "createBooking",
        editFlag: true,
        oldDate: activeSelectedAppointment.date,
        oldName: activeSelectedAppointment.name,
        date: document.getElementById("edit-app-datetime").value,
        name: document.getElementById("edit-app-name").value.trim(),
        phone: document.getElementById("edit-app-phone").value.trim(),
        service: document.getElementById("edit-app-service").value.trim(),
        duration: parseInt(document.getElementById("edit-app-duration").value, 10) || 45
    };
    
    if (!payload.name || !payload.date) {
        alert("Wypełnij wymagane pola!");
        return;
    }
    
    try {
        await fetch(APPS_SCRIPT_URL, {
            method: "POST",
            mode: "no-cors",
            headers: { "Content-Type": "text/plain" },
            body: JSON.stringify(payload)
        });
        
        alert("Wizyta została pomyślnie zmodyfikowana!");
        closeAppointmentModal();
        await loadSettings();
    } catch (e) {
        console.error(e);
        alert("Błąd zapisu.");
    }
}

// ==========================================================================
// УПРАВЛЕНИЕ ВЫХОДНЫМИ / БЛОКИРОВКА ВРЕМЕНИ
// ==========================================================================

function openBlockTimeModal() {
    document.getElementById("block-date").value = getFormattedISOBlockDate(selectedCalendarDate);
    document.getElementById("block-title").value = "Wolne / Przerwa";
    toggleBlockTimeFields();
    document.getElementById("blockTimeModal").style.display = "flex";
}

function closeBlockTimeModal() {
    document.getElementById("blockTimeModal").style.display = "none";
}

function toggleBlockTimeFields() {
    const type = document.getElementById("block-type").value;
    document.getElementById("block-hours-group").style.display = (type === "hours") ? "block" : "none";
}

async function submitBlockTime() {
    const type = document.getElementById("block-type").value;
    const dateVal = document.getElementById("block-date").value;
    const titleVal = document.getElementById("block-title").value.trim() || "Zablokowane";
    
    if (!dateVal) {
        alert("Wybierz datę!");
        return;
    }
    
    let startDateTimeIso, durationMin;
    
    if (type === "full_day") {
        startDateTimeIso = dateVal + "T" + (settingsData.work_start_hour || "09:00");
        const sh = parseInt((settingsData.work_start_hour || "09:00").split(":")[0], 10);
        const eh = parseInt((settingsData.work_end_hour || "18:00").split(":")[0], 10);
        durationMin = (eh - sh) * 60;
    } else {
        const startTime = document.getElementById("block-start-time").value;
        const endTime = document.getElementById("block-end-time").value;
        if (!startTime || !endTime) {
            alert("Wpisz godziny!");
            return;
        }
        startDateTimeIso = dateVal + "T" + startTime;
        const [sh, sm] = startTime.split(":").map(Number);
        const [eh, em] = endTime.split(":").map(Number);
        durationMin = (eh * 60 + em) - (sh * 60 + sm);
    }
    
    if (durationMin <= 0) {
        alert("Godzina zakończenia musi być po godzinie rozpoczęcia!");
        return;
    }
    
    const payload = {
        action: "createBooking",
        date: startDateTimeIso,
        duration: durationMin,
        name: titleVal,
        service: "Rezerwacja zewnętrzna",
        phone: "Google Calendar",
        rodo: "Nie"
    };
    
    try {
        await fetch(APPS_SCRIPT_URL, {
            method: "POST",
            mode: "no-cors",
            headers: { "Content-Type": "text/plain" },
            body: JSON.stringify(payload)
        });
        
        alert("Czas został zablokowany w kalendarzu!");
        closeBlockTimeModal();
        await loadSettings();
    } catch (e) {
        console.error(e);
        alert("Błąd blokowania czasu.");
    }
}

// ==========================================================================
// УПРАВЛЕНИЕ СЕРВИСАМИ В ТАБЛИЦЕ (СТАРЫЙ ФУНКЦИОНАЛ БЕЗ ИЗМЕНЕНИЙ)
// ==========================================================================

async function loadAdminServices() {
    const tbody = document.getElementById("adminServicesTableBody");
    if (!tbody) return;

    tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">Ładowanie usług...</td></tr>';

    try {
        const response = await fetch(APPS_SCRIPT_URL + "?getPrices=true");
        const services = await response.json();

        currentServices = services || [];
        
        const rawCategories = currentServices.map(s => s.category ? s.category.trim() : "");
        allCategories = [...new Set(rawCategories)].filter(c => c.length > 0);

        undoStack = [];
        redoStack = [];
        hasUnsavedChanges = false;

        renderTable();
        updateUndoRedoButtons();
    } catch (error) {
        console.error("Błąd:", error);
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: red;">Błąd połączenia.</td></tr>';
    }
}

function renderTable() {
    const tbody = document.getElementById("adminServicesTableBody");
    if (!tbody) return;

    tbody.innerHTML = "";

    if (currentServices.length === 0 && allCategories.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">Brak usług.</td></tr>';
        return;
    }

    const grouped = {};
    allCategories.forEach(cat => grouped[cat.trim()] = []);

    currentServices.forEach((service, originalIndex) => {
        const catKey = (service.category || "Inne").trim();
        if (!grouped[catKey]) grouped[catKey] = [];
        grouped[catKey].push({ ...service, originalIndex });
    });

    allCategories.forEach((catName, index) => {
        const servicesInCat = grouped[catName] || [];
        const headerTr = document.createElement("tr");
        headerTr.style.backgroundColor = "#fdf5f7"; 
        
        const isFirst = index === 0;
        const isLast = index === allCategories.length - 1;

        headerTr.innerHTML = `
            <td colspan="6" style="font-weight: bold; padding: 10px; background: #faf0f2;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span>🏷️ Kategoria: ${catName}</span>
                    <div>
                        <button onclick="moveCategoryOrder(${index}, 'up')" ${isFirst ? 'disabled' : ''}>🔼</button>
                        <button onclick="moveCategoryOrder(${index}, 'down')" ${isLast ? 'disabled' : ''}>🔽</button>
                    </div>
                </div>
            </td>
        `;
        tbody.appendChild(headerTr);

        servicesInCat.forEach(item => {
            const tr = document.createElement("tr");
            const isDraft = item.status === "Szkic" || item.isLocalChange;
            const statusBadge = isDraft 
                ? '<span style="background: #f0ad4e; color: white; padding: 2px 5px; border-radius:3px;">Szkic</span>' 
                : '<span style="background: #5cb85c; color: white; padding: 2px 5px; border-radius:3px;">Opublikowany</span>';

            let categorySelectHTML = `<select onchange="moveServiceToCategory(${item.originalIndex}, this.value)">`;
            allCategories.forEach(c => {
                categorySelectHTML += `<option value="${c}" ${c.trim() === catName ? "selected" : ""}>${c}</option>`;
            });
            categorySelectHTML += `</select>`;

            tr.innerHTML = `
                <td>${categorySelectHTML}</td>
                <td><strong>${item.name}</strong></td>
                <td>${item.price} zł</td>
                <td>${item.duration} min</td>
                <td>${statusBadge}</td>
                <td>
                    <button onclick="editService(${item.originalIndex})">Edytuj</button>
                    <button onclick="deleteService(${item.originalIndex})" style="color:red;">Usuń</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    });
}

function moveCategoryOrder(index, direction) {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === allCategories.length - 1) return;
    saveToHistory();
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const temp = allCategories[index];
    allCategories[index] = allCategories[targetIndex];
    allCategories[targetIndex] = temp;
    sortServicesByGlobalCategoryOrder();
    renderTable();
    updateUndoRedoButtons();
}

function sortServicesByGlobalCategoryOrder() {
    currentServices.sort((a, b) => allCategories.indexOf((a.category || "").trim()) - allCategories.indexOf((b.category || "").trim()));
    currentServices.forEach(s => { s.status = "Szkic"; s.isLocalChange = true; });
}

function moveServiceToCategory(originalIndex, newCategoryName) {
    if (!currentServices[originalIndex]) return;
    saveToHistory();
    currentServices[originalIndex].category = newCategoryName.trim();
    currentServices[originalIndex].status = "Szkic";
    currentServices[originalIndex].isLocalChange = true;
    sortServicesByGlobalCategoryOrder();
    renderTable();
    updateUndoRedoButtons();
}

function saveToHistory() {
    undoStack.push({
        services: JSON.parse(JSON.stringify(currentServices)),
        categories: JSON.parse(JSON.stringify(allCategories))
    });
    redoStack = []; 
    hasUnsavedChanges = true;
    updateUndoRedoButtons();
}

function undo() {
    if (undoStack.length > 0) {
        redoStack.push({ services: JSON.parse(JSON.stringify(currentServices)), categories: JSON.parse(JSON.stringify(allCategories)) });
        const popped = undoStack.pop();
        currentServices = popped.services;
        allCategories = popped.categories;
        renderTable();
        updateUndoRedoButtons();
    }
}

function redo() {
    if (redoStack.length > 0) {
        undoStack.push({ services: JSON.parse(JSON.stringify(currentServices)), categories: JSON.parse(JSON.stringify(allCategories)) });
        const popped = redoStack.pop();
        currentServices = popped.services;
        allCategories = popped.categories;
        renderTable();
        updateUndoRedoButtons();
    }
}

function updateUndoRedoButtons() {
    if (document.getElementById("undoBtn")) document.getElementById("undoBtn").disabled = undoStack.length === 0;
    if (document.getElementById("redoBtn")) document.getElementById("redoBtn").disabled = redoStack.length === 0;
}

function addServiceLocal(newService) {
    saveToHistory();
    currentServices.push(newService);
    sortServicesByGlobalCategoryOrder();
    renderTable();
    updateUndoRedoButtons();
}

function updateServiceLocal(index, updatedService) {
    saveToHistory();
    currentServices[index] = updatedService;
    sortServicesByGlobalCategoryOrder();
    renderTable();
    updateUndoRedoButtons();
}

function deleteService(index) {
    if (confirm("Czy na pewno chcesz usunąć tę usługę?")) {
        saveToHistory();
        currentServices.splice(index, 1);
        renderTable();
        updateUndoRedoButtons();
    }
}

async function saveDraftsToCloud() {
    const btn = document.getElementById("saveDraftsBtn");
    if (!btn) return;
    btn.disabled = true;

    try {
        await fetch(APPS_SCRIPT_URL, {
            method: "POST",
            mode: "no-cors", 
            headers: { "Content-Type": "text/plain" },
            body: JSON.stringify({ action: "saveDraftPrices", prices: currentServices })
        });
        
        hasUnsavedChanges = false;
        currentServices.forEach(s => delete s.isLocalChange);
        renderTable();
        alert("Szkic zapisany!");
    } catch (e) {
        console.error(e);
        alert("Błąd połączenia.");
    } finally {
        btn.disabled = false;
    }
}

async function publishDrafts() {
    if (hasUnsavedChanges) {
        if (confirm("Masz niezapisane zmiany. Czy zapisać je teraz jako Szkic i opublikować?")) {
            await saveDraftsToCloud();
        } else {
            return;
        }
    }
    if (!confirm("Czy na pewno chcesz opublikować zmiany dla klientów?")) return;

    try {
        await fetch(APPS_SCRIPT_URL, {
            method: "POST",
            mode: "no-cors", 
            headers: { "Content-Type": "text/plain" },
            body: JSON.stringify({ action: "publishDraftToPublic" })
        });
        
        alert("Cennik został opublikowany! Synchronizacja danych...");
        setTimeout(async () => {
            await loadAdminServices();
        }, 1500); 
    } catch (e) {
        console.error(e);
        alert("Błąd połączenia.");
    }
}

function toggleNewCategoryInput() {
    const select = document.getElementById("serviceCategorySelect");
    document.getElementById("newCategoryGroup").style.display = (select && select.value === "__NEW__") ? "block" : "none";
}

function closeServiceModal() { document.getElementById("serviceModal").style.display = "none"; }

function openAddServiceModal() {
    document.getElementById("modalTitle").innerText = "Dodaj nowy zabieg";
    document.getElementById("editServiceIndex").value = "-1";
    document.getElementById("serviceName").value = "";
    document.getElementById("servicePrice").value = "";
    document.getElementById("serviceDuration").value = "";
    buildCategorySelect("serviceCategorySelect", "");
    document.getElementById("serviceModal").style.display = "flex";
}

function editService(index) {
    const service = currentServices[index];
    if (!service) return;
    document.getElementById("modalTitle").innerText = "Edytuj zabieg";
    document.getElementById("editServiceIndex").value = index;
    document.getElementById("serviceName").value = service.name || "";
    document.getElementById("servicePrice").value = service.price || 0;
    document.getElementById("serviceDuration").value = service.duration || 0;
    buildCategorySelect("serviceCategorySelect", service.category);
    document.getElementById("serviceModal").style.display = "flex";
}

function buildCategorySelect(selectId, selectedValue) {
    const select = document.getElementById(selectId);
    if (!select) return;
    select.innerHTML = "";
    allCategories.forEach(cat => {
        const opt = document.createElement("option");
        opt.value = cat; opt.innerText = cat;
        if (cat.trim().toLowerCase() === (selectedValue || "").trim().toLowerCase()) opt.selected = true;
        select.appendChild(opt);
    });
    const optNew = document.createElement("option");
    optNew.value = "__NEW__"; optNew.innerText = "➕ + Nowa kategoria";
    if (selectedValue === "") optNew.selected = true;
    select.appendChild(optNew);
    toggleNewCategoryInput();
}

function saveServiceModalData() {
    const index = parseInt(document.getElementById("editServiceIndex").value, 10);
    const select = document.getElementById("serviceCategorySelect");
    let category = select.value.trim();
    
    if (category === "__NEW__") {
        category = document.getElementById("serviceCategoryNew").value.trim();
        if (category && !allCategories.some(c => c.toLowerCase() === category.toLowerCase())) {
            allCategories.push(category);
        }
    }

    const name = document.getElementById("serviceName").value.trim();
    const price = parseInt(document.getElementById("servicePrice").value, 10);
    const duration = parseInt(document.getElementById("serviceDuration").value, 10);

    if (!category || !name || isNaN(price) || isNaN(duration)) {
        alert("Wypełnij poprawnie wszystkie pola!");
        return;
    }

    const serviceData = { category, name, price, duration, status: "Szkic", isLocalChange: true };
    if (index === -1) addServiceLocal(serviceData); else updateServiceLocal(index, serviceData);
    closeServiceModal();
}

function openCategoryModal() {
    const select = document.getElementById("renameCategorySelect");
    if (!select) return;
    select.innerHTML = "";
    allCategories.forEach(cat => {
        const opt = document.createElement("option");
        opt.value = cat; opt.innerText = cat;
        select.appendChild(opt);
    });
    document.getElementById("renameCategoryNewName").value = "";
    document.getElementById("categoryModal").style.display = "flex";
}

function closeCategoryModal() { document.getElementById("categoryModal").style.display = "none"; }

function renameCategoryGlobal() {
    const oldName = document.getElementById("renameCategorySelect").value;
    const newName = document.getElementById("renameCategoryNewName").value.trim();
    if (!newName) return;
    saveToHistory();
    allCategories = allCategories.map(cat => cat === oldName ? newName : cat);
    currentServices.forEach(s => { if (s.category === oldName) { s.category = newName; s.status = "Szkic"; } });
    renderTable();
    closeCategoryModal();
}

function deleteCategoryGlobal() {
    const catToDelete = document.getElementById("renameCategorySelect").value;
    if (!catToDelete || !confirm(`Czy na pewno chcesz usunąć kategorię "${catToDelete}" wraz ze wszystkimi zabiegami?`)) return;
    saveToHistory();
    allCategories = allCategories.filter(cat => cat !== catToDelete);
    currentServices = currentServices.filter(s => s.category !== catToDelete);
    renderTable();
    closeCategoryModal();
}

function addNewCategoryEmpty() {
    const input = document.getElementById("createNewCategoryName");
    const newCatName = input.value.trim();
    if (!newCatName || allCategories.some(c => c.toLowerCase() === newCatName.toLowerCase())) return;
    saveToHistory();
    allCategories.push(newCatName);
    input.value = "";
    renderTable();
    closeCategoryModal();
}
