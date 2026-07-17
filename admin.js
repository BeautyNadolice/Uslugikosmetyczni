const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzt05Q17aZVe0Up6C5AVSfzG5M2XmVgr5qDaJ7OerhFE084bSVQwYezgTAV36Xth0bkAw/exec";
const ALLOWED_EMAIL = "vasha_jena@gmail.com"; 
let currentUserEmail = null;

let currentServices = [];       
let allCategories = [];         
let undoStack = [];             
let redoStack = [];             
let hasUnsavedChanges = false;  

// ПЕРЕМЕННЫЕ ДЛЯ РАБОТЫ КАЛЕНДАРЯ
let selectedCalendarDate = new Date(); // Текущая открытая дата в календаре
let appointmentsData = [];             // Записи из таблицы (Wizyty)
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
}

// Изменение текущего отображаемого дня в календаре
function changeSelectedDate(days) {
    selectedCalendarDate.setDate(selectedCalendarDate.getDate() + days);
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

    // Сбор цветов из палитры
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
            headers: {
                "Content-Type": "text/plain"
            },
            body: JSON.stringify({ action: "updateSettings", payload: payload })
        });
        
        // В режиме no-cors ответ непрозрачный, поэтому выводим сообщение об успехе без чтения JSON
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

// Построение палитры цветов в настройках на основе существующих категорий
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

// Генерация Booksy-сетки календаря
function renderBooksyCalendar() {
    const timeline = document.getElementById("booksy-timeline");
    const grid = document.getElementById("booksy-grid");
    const title = document.getElementById("calendar-current-date-title");
    if (!timeline || !grid) return;
    
    // Склонение месяцев и дней на польском
    const daysOfWeek = ["Niedziela", "Poniedziałek", "Wtorek", "Środa", "Czwartek", "Piątek", "Sobota"];
    const months = ["Stycznia", "Lutego", "Marca", "Kwietnia", "Maja", "Czerwca", "Lipca", "Sierpnia", "Września", "Października", "Listopada", "Grudnia"];
    
    title.innerText = `${daysOfWeek[selectedCalendarDate.getDay()]}, ${selectedCalendarDate.getDate()} ${months[selectedCalendarDate.getMonth()]} ${selectedCalendarDate.getFullYear()}`;
    
    timeline.innerHTML = "";
    grid.innerHTML = "";
    
    const startHour = parseInt((settingsData.work_start_hour || "09:00").split(":")[0], 10);
    const endHour = parseInt((settingsData.work_end_hour || "18:00").split(":")[0], 10);
    const totalHours = endHour - startHour;
    
    const pxPerMinute = 1.2; 
    
    // Создание временных меток слева
    for (let h = startHour; h <= endHour; h++) {
        const label = document.createElement("div");
        label.className = "time-label";
        label.style.height = `${60 * pxPerMinute}px`;
        label.innerText = `${h.toString().padStart(2, '0')}:00`;
        timeline.appendChild(label);
    }
    
    const totalMinutes = totalHours * 60;
    grid.style.height = `${totalMinutes * pxPerMinute}px`;
    
    // Отрисовка разделительных линий по 30 минут
    for (let m = 0; m < totalMinutes; m += 30) {
        const line = document.createElement("div");
        line.className = "grid-halfhour-line";
        line.style.top = `${m * pxPerMinute}px`;
        grid.appendChild(line);
    }
    
    // Фильтрация записей только на выбранный день
    const targetDateStr = selectedCalendarDate.getFullYear() + "-" + 
                          String(selectedCalendarDate.getMonth() + 1).padStart(2, '0') + "-" + 
                          String(selectedCalendarDate.getDate()).padStart(2, '0');
    
    const targetAppointments = appointmentsData.filter(app => app.date.startsWith(targetDateStr));
    
    targetAppointments.forEach(app => {
        const appTimeStr = app.date.split("T")[1]; // "HH:MM"
        const [appH, appM] = appTimeStr.split(":").map(Number);
        
        const startOffsetMinutes = (appH * 60 + appM) - (startHour * 60);
        const topPos = startOffsetMinutes * pxPerMinute;
        const heightPos = app.duration * pxPerMinute;
        
        if (topPos >= 0 && topPos < totalMinutes * pxPerMinute) {
            const card = document.createElement("div");
            card.className = "booksy-event-card";
            card.style.top = `${topPos}px`;
            card.style.setProperty('--event-calculated-height', `${heightPos}px`);
            
            // Получаем персональный цвет для категории, иначе используем стандартный пудровый цвет
            const categoryColor = globalColors[app.category] || "#b05c75"; 
            card.style.backgroundColor = categoryColor;
            
            card.innerHTML = `
                <div class="event-time">${appTimeStr} - ${getEndTimeStr(appTimeStr, app.duration)}</div>
                <div class="event-name">${app.name}</div>
                <div class="event-service">${app.service}</div>
                <div class="event-phone">📞 ${app.phone}</div>
            `;
            
            grid.appendChild(card);
        }
    });
}

function getEndTimeStr(startTimeStr, durationMin) {
    const [h, m] = startTimeStr.split(":").map(Number);
    const d = new Date();
    d.setHours(h, m + durationMin);
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
}

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

// Повторить действие (Redo)
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

// Сохранение черновика
async function saveDraftsToCloud() {
    const btn = document.getElementById("saveDraftsBtn");
    if (!btn) return;
    btn.disabled = true;

    try {
        await fetch(APPS_SCRIPT_URL, {
            method: "POST",
            mode: "no-cors", 
            headers: {
                "Content-Type": "text/plain"
            },
            body: JSON.stringify({ action: "saveDraftPrices", prices: currentServices })
        });
        
        // В режиме no-cors мы не можем прочитать JSON, поэтому сразу считаем отправку успешной
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

// Публикация черновика
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
            headers: {
                "Content-Type": "text/plain"
            },
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

// ==========================================================================
// УПРАВЛЕНИЕ МОДАЛЬНЫМИ ОКНАМИ
// ==========================================================================

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
