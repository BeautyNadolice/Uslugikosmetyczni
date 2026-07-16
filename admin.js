const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyv-DB-G_om0MxZ4mQtHhWO-6jn0ZimHFCRu6-VuZAaWBQhcp1eVSTA8XY7GYIERoMmeg/exec";
// === НАСТРОЙКИ БЕЗОПАСНОСТИ ===
const ALLOWED_EMAIL = "vasha_jena@gmail.com"; // 🌟 ЗАМЕНИТЕ НА РЕАЛЬНЫЙ EMAIL ЖЕНЫ
let currentUserEmail = null;

// --- СОСТОЯНИЕ И ЛОКАЛЬНАЯ ИСТОРИЯ (UNDO / REDO) ---
let currentServices = [];       // Текущее состояние списка услуг на экране
let allCategories = [];         // Глобальный список категорий (в порядке отображения)
let undoStack = [];             // Стек для отмены действий (Cofnij)
let redoStack = [];             // Стек для возврата действий (Ponów)
let hasUnsavedChanges = false;  // Флаг несохраненных изменений

document.addEventListener("DOMContentLoaded", () => {
    // Проверяем, была ли сохранена сессия авторизации ранее
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
// СИСТЕМА АВТОРИЗАЦИИ (GOOGLE & TEST BYPASS)
// ==========================================================================

// 1. Проверка сессии при загрузке страницы
function checkAuthSession() {
    const savedEmail = localStorage.getItem("admin_email");
    
    if (savedEmail) {
        if (savedEmail === ALLOWED_EMAIL || savedEmail === "test_admin@test.com") {
            currentUserEmail = savedEmail;
            showAdminPanel();
            return;
        }
    }
    // Если сессии нет, показываем экран входа
    showLoginScreen();
}

// 2. Показать панель администратора и загрузить данные
function showAdminPanel() {
    document.getElementById("login-screen").style.display = "none";
    document.getElementById("admin-panel-wrapper").style.display = "block";
    
    // Загружаем данные только ПОСЛЕ успешного входа
    loadAdminServices();
    loadSettings();
}

// 3. Показать экран входа
function showLoginScreen() {
    document.getElementById("login-screen").style.display = "flex";
    document.getElementById("admin-panel-wrapper").style.display = "none";
}

// 4. ТЕСТОВЫЙ ВХОД (Для разработки, потом можно удалить кнопку в HTML)
function loginTest() {
    console.log("Вход выполнен через Тестовый режим");
    currentUserEmail = "test_admin@test.com"; // Временный тестовый email
    localStorage.setItem("admin_email", currentUserEmail);
    showAdminPanel();
}

// 5. Обработчик входа через реальный Google Google (JWT Credential)
function handleCredentialResponse(response) {
    try {
        // Декодируем JWT токен от Google без сторонних библиотек
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
            localStorage.setItem("google_id_token", response.credential); // сохраняем токен безопасности
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

// 6. Выход из системы
function logout() {
    if (hasUnsavedChanges) {
        if (!confirm("Masz niezapisane zmiany! Czy на pewno chcesz się wylogować?")) return;
    }
    
    // Очищаем сессии
    localStorage.removeItem("admin_email");
    localStorage.removeItem("google_id_token");
    currentUserEmail = null;
    
    alert("Wylogowano pomyślnie.");
    
    // Перенаправляем на главную клиентскую страницу сайта
    window.location.href = "index.html"; 
}

// ==========================================================================
// ОСТАЛЬНОЙ КОД ПАНЕЛИ (Переключение вкладок, Загрузка, Сохранение и т.д.)
// ==========================================================================

function switchTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.style.display = 'none');
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    
    const targetTab = document.getElementById(`tab-${tabName}`);
    if (targetTab) targetTab.style.display = 'block';
    
    const activeBtn = document.querySelector(`.tab-btn[onclick*="${tabName}"]`);
    if (activeBtn) activeBtn.classList.add('active');
}

async function loadSettings() {
    try {
        const response = await fetch(APPS_SCRIPT_URL + "?checkBusy=true");
        const data = await response.json();
        if (data.settings) {
            document.getElementById("work_start_hour").value = data.settings.work_start_hour || "09:00";
            document.getElementById("work_end_hour").value = data.settings.work_end_hour || "18:00";
            document.getElementById("buffer_hours").value = data.settings.buffer_hours || 1;
        }
    } catch (e) {
        console.error("Błąd ładowania ustawień:", e);
    }
}

async function saveSettings() {
    const btn = document.getElementById("saveSettingsBtn");
    if (!btn) return;
    const originalText = btn.innerText;
    btn.innerText = "Zapisywanie...";
    btn.disabled = true;

    const payload = {
        work_start_hour: document.getElementById("work_start_hour").value.trim(),
        work_end_hour: document.getElementById("work_end_hour").value.trim(),
        buffer_hours: parseInt(document.getElementById("buffer_hours").value) || 1
    };

    try {
        const response = await fetch(APPS_SCRIPT_URL, {
            method: "POST",
            body: JSON.stringify({ action: "updateSettings", payload: payload })
        });
        const result = await response.json();
        if (result.success) alert("Ustawienia zapisane!");
        else alert("Błąd: " + (result.error || "nieznany"));
    } catch (e) {
        console.error(e);
        alert("Błąd połączenia.");
    } finally {
        btn.innerText = originalText;
        btn.disabled = false;
    }
}

async function loadAdminServices() {
    const tbody = document.getElementById("adminServicesTableBody");
    if (!tbody) return;

    tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">Ładowanie usług z bazy...</td></tr>';

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
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">Brak usług. Dodaj nową usługę.</td></tr>';
        return;
    }

    const grouped = {};
    allCategories.forEach(cat => {
        grouped[cat.trim()] = [];
    });

    currentServices.forEach((service, originalIndex) => {
        const catKey = (service.category || "Inne").trim();
        if (!grouped[catKey]) {
            grouped[catKey] = [];
        }
        grouped[catKey].push({ ...service, originalIndex });
    });

    allCategories.forEach((catName, index) => {
        const servicesInCat = grouped[catName] || [];

        const headerTr = document.createElement("tr");
        headerTr.style.backgroundColor = "#fdf5f7"; 
        
        const isFirst = index === 0;
        const isLast = index === allCategories.length - 1;

        headerTr.innerHTML = `
            <td colspan="6" style="font-weight: bold; font-size: 1.1em; color: #b05c75; padding: 12px 10px; border-bottom: 2px solid #f2d6dc;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span>🏷️ Kategoria: ${catName} <span style="font-weight: normal; font-size: 0.8em; color: #888;">(Zabiegów: ${servicesInCat.length})</span></span>
                    <div style="display: flex; gap: 5px;">
                        <button class="btn-small" onclick="moveCategoryOrder(${index}, 'up')" ${isFirst ? 'disabled style="opacity: 0.3; cursor: not-allowed;"' : ''} style="padding: 4px 8px; background: #fff; border: 1px solid #ccc; border-radius: 4px; cursor: pointer;">🔼 W górę</button>
                        <button class="btn-small" onclick="moveCategoryOrder(${index}, 'down')" ${isLast ? 'disabled style="opacity: 0.3; cursor: not-allowed;"' : ''} style="padding: 4px 8px; background: #fff; border: 1px solid #ccc; border-radius: 4px; cursor: pointer;">🔽 W dół</button>
                    </div>
                </div>
            </td>
        `;
        tbody.appendChild(headerTr);

        if (servicesInCat.length === 0) {
            const emptyTr = document.createElement("tr");
            emptyTr.innerHTML = `
                <td colspan="6" style="text-align: center; color: #aaa; font-style: italic; padding: 10px;">
                    Ta kategoria jest pusta. Możesz przenieść tutaj zabiegi lub dodać nowy.
                </td>
            `;
            tbody.appendChild(emptyTr);
            return;
        }

        servicesInCat.forEach(item => {
            const tr = document.createElement("tr");
            const isDraft = item.status === "Draft" || item.status === "Szkic" || item.isLocalChange;
            const statusBadge = isDraft 
                ? '<span class="badge" style="background-color: #f0ad4e; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold; font-size: 0.8em;">Szkic</span>' 
                : '<span class="badge" style="background-color: #5cb85c; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold; font-size: 0.8em;">Opublikowany</span>';

            let categorySelectHTML = `<select onchange="moveServiceToCategory(${item.originalIndex}, this.value)" style="padding: 4px; border-radius: 4px; border: 1px solid #ccc; font-size: 0.9em; max-width: 150px;">`;
            allCategories.forEach(c => {
                const selected = c.trim() === catName ? "selected" : "";
                categorySelectHTML += `<option value="${c}" ${selected}>${c}</option>`;
            });
            categorySelectHTML += `</select>`;

            tr.innerHTML = `
                <td>${categorySelectHTML}</td>
                <td><strong>${item.name}</strong></td>
                <td>${item.price} zł</td>
                <td>${item.duration} min</td>
                <td>${statusBadge}</td>
                <td>
                    <button class="btn-small btn-primary" onclick="editService(${item.originalIndex})">Edytuj</button>
                    <button class="btn-small btn-danger" onclick="deleteService(${item.originalIndex})" style="margin-left: 5px;">Usuń</button>
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
    currentServices.sort((a, b) => {
        const indexA = allCategories.indexOf((a.category || "").trim());
        const indexB = allCategories.indexOf((b.category || "").trim());
        return indexA - indexB;
    });
    currentServices.forEach(s => {
        s.status = "Szkic";
        s.isLocalChange = true;
    });
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
        redoStack.push({
            services: JSON.parse(JSON.stringify(currentServices)),
            categories: JSON.parse(JSON.stringify(allCategories))
        });
        const popped = undoStack.pop();
        currentServices = popped.services;
        allCategories = popped.categories;
        renderTable();
        updateUndoRedoButtons();
    }
}

function redo() {
    if (redoStack.length > 0) {
        undoStack.push({
            services: JSON.parse(JSON.stringify(currentServices)),
            categories: JSON.parse(JSON.stringify(allCategories))
        });
        const popped = redoStack.pop();
        currentServices = popped.services;
        allCategories = popped.categories;
        renderTable();
        updateUndoRedoButtons();
    }
}

function updateUndoRedoButtons() {
    const undoBtn = document.getElementById("undoBtn");
    const redoBtn = document.getElementById("redoBtn");
    const saveDraftsBtn = document.getElementById("saveDraftsBtn");

    if (undoBtn) undoBtn.disabled = undoStack.length === 0;
    if (redoBtn) redoBtn.disabled = redoStack.length === 0;

    if (saveDraftsBtn) {
        if (hasUnsavedChanges) {
            saveDraftsBtn.style.opacity = "1";
            saveDraftsBtn.style.boxShadow = "0 0 10px rgba(240, 173, 78, 0.6)";
            saveDraftsBtn.style.border = "2px solid #fff";
        } else {
            saveDraftsBtn.style.opacity = "0.8";
            saveDraftsBtn.style.boxShadow = "none";
            saveDraftsBtn.style.border = "none";
        }
    }
}

function addServiceLocal(newService) {
    saveToHistory();
    newService.isLocalChange = true;
    newService.status = "Szkic";
    currentServices.push(newService);
    sortServicesByGlobalCategoryOrder();
    renderTable();
    updateUndoRedoButtons();
}

function updateServiceLocal(index, updatedService) {
    saveToHistory();
    updatedService.isLocalChange = true;
    updatedService.status = "Szkic";
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
    const originalText = btn.innerHTML;
    btn.innerHTML = "💾 Zapisywanie...";
    btn.disabled = true;

    try {
        const response = await fetch(APPS_SCRIPT_URL, {
            method: "POST",
            body: JSON.stringify({
                action: "saveDraftPrices",
                prices: currentServices,
                categoriesOrder: allCategories
            })
        });
        const result = await response.json();

        if (result.success) {
            hasUnsavedChanges = false;
            currentServices.forEach(s => delete s.isLocalChange);
            renderTable();
            updateUndoRedoButtons();
            alert("Szkic zapisany w Google Sheets!");
        } else {
            alert("Błąd: " + result.error);
        }
    } catch (e) {
        console.error(e);
        alert("Błąd połączenia.");
    } finally {
        btn.innerHTML = originalText;
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

    const btn = document.getElementById("publishBtn");
    if (!btn) return;
    const originalText = btn.innerHTML;
    btn.innerHTML = "🚀 Publikowanie...";
    btn.disabled = true;

    try {
        const response = await fetch(APPS_SCRIPT_URL, {
            method: "POST",
            body: JSON.stringify({ action: "publishDraftToPublic" })
        });
        const result = await response.json();

        if (result.success) {
            await loadAdminServices();
            alert("Cennik opublikowany!");
        } else {
            alert("Błąd: " + result.error);
        }
    } catch (e) {
        console.error(e);
        alert("Błąd połączenia.");
    } finally {
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
}

// ==========================================================================
// ЛОГИКА ОКНА ДОБАВЛЕНИЯ/РЕДАКТИРОВАНИЯ УСЛУГ
// ==========================================================================

function toggleNewCategoryInput() {
    const select = document.getElementById("serviceCategorySelect");
    const newCatGroup = document.getElementById("newCategoryGroup");
    
    if (select && select.value === "__NEW__") {
        newCatGroup.style.display = "block";
    } else if (newCatGroup) {
        newCatGroup.style.display = "none";
    }
}

function closeServiceModal() {
    document.getElementById("serviceModal").style.display = "none";
}

function openAddServiceModal() {
    document.getElementById("modalTitle").innerText = "Dodaj nowy zabieg";
    document.getElementById("editServiceIndex").value = "-1";
    
    document.getElementById("serviceName").value = "";
    document.getElementById("servicePrice").value = "";
    document.getElementById("serviceDuration").value = "";
    document.getElementById("serviceCategoryNew").value = "";

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
    document.getElementById("serviceCategoryNew").value = "";

    buildCategorySelect("serviceCategorySelect", service.category);
    document.getElementById("serviceModal").style.display = "flex";
}

function buildCategorySelect(selectId, selectedValue) {
    const select = document.getElementById(selectId);
    if (!select) return;
    
    select.innerHTML = "";
    const sortedCategories = [...allCategories]; 

    sortedCategories.forEach(cat => {
        const opt = document.createElement("option");
        opt.value = cat;
        opt.innerText = cat;
        if (cat.trim().toLowerCase() === (selectedValue || "").trim().toLowerCase()) {
            opt.selected = true;
        }
        select.appendChild(opt);
    });

    const optNew = document.createElement("option");
    optNew.value = "__NEW__";
    optNew.innerText = "➕ + Nowa kategoria";
    if (selectedValue === "" || !sortedCategories.some(c => c.toLowerCase() === selectedValue.trim().toLowerCase())) {
        optNew.selected = true;
    }
    select.appendChild(optNew);

    toggleNewCategoryInput();
}

function saveServiceModalData() {
    const index = parseInt(document.getElementById("editServiceIndex").value);
    
    const select = document.getElementById("serviceCategorySelect");
    if (!select) return;
    let category = select.value.trim();
    
    if (category === "__NEW__") {
        category = document.getElementById("serviceCategoryNew").value.trim();
        if (category) {
            const exists = allCategories.some(c => c.toLowerCase() === category.toLowerCase());
            if (!exists) {
                saveToHistory();
                allCategories.push(category);
            } else {
                category = allCategories.find(c => c.toLowerCase() === category.toLowerCase());
            }
        }
    }

    const name = document.getElementById("serviceName").value.trim();
    const price = parseInt(document.getElementById("servicePrice").value);
    const duration = parseInt(document.getElementById("serviceDuration").value);

    if (!category || !name || isNaN(price) || isNaN(duration)) {
        alert("Wszystkie pola muszą być wypełnione poprawnie!");
        return;
    }

    const serviceData = {
        category: category,
        name: name,
        price: price,
        duration: duration,
        status: "Szkic",
        isLocalChange: true
    };

    if (index === -1) {
        addServiceLocal(serviceData);
    } else {
        updateServiceLocal(index, serviceData);
    }

    closeServiceModal();
}

// ==========================================================================
// ОКНО РЕДАКТИРОВАНИЯ И УДАЛЕНИЯ КАТЕГОРИЙ
// ==========================================================================

function openCategoryModal() {
    const select = document.getElementById("renameCategorySelect");
    if (!select) return;
    select.innerHTML = "";
    
    allCategories.forEach(cat => {
        const opt = document.createElement("option");
        opt.value = cat;
        opt.innerText = cat;
        select.appendChild(opt);
    });

    document.getElementById("renameCategoryNewName").value = "";
    document.getElementById("categoryModal").style.display = "flex";
}

function closeCategoryModal() {
    document.getElementById("categoryModal").style.display = "none";
}

function renameCategoryGlobal() {
    const select = document.getElementById("renameCategorySelect");
    if (!select) return;
    const oldName = select.value;
    const newName = document.getElementById("renameCategoryNewName").value.trim();

    if (!newName) {
        alert("Wpisz nową nazwę!");
        return;
    }

    if (oldName === newName) {
        closeCategoryModal();
        return;
    }

    saveToHistory();

    allCategories = allCategories.map(cat => cat === oldName ? newName : cat);

    let modifiedCount = 0;
    currentServices.forEach(service => {
        if (service.category && service.category.trim() === oldName) {
            service.category = newName;
            service.status = "Szkic";
            service.isLocalChange = true;
            modifiedCount++;
        }
    });

    renderTable();
    updateUndoRedoButtons();
    alert(`Zmieniono nazwę kategorii dla ${modifiedCount} zabiegów.`);
    closeCategoryModal();
}

function deleteCategoryGlobal() {
    const select = document.getElementById("renameCategorySelect");
    if (!select) return;
    const catToDelete = select.value;

    if (!catToDelete) return;

    const count = currentServices.filter(s => s.category && s.category.trim() === catToDelete).length;
    const confirmMsg = count > 0 
        ? `Czy na pewno chcesz usunąć kategorię "${catToDelete}"? Spowoduje to USUNIĘCIE wszystkich należących do niej zabiegów (${count} szt.)!` 
        : `Czy usunąć pustą kategorię "${catToDelete}"?`;

    if (confirm(confirmMsg)) {
        saveToHistory();

        allCategories = allCategories.filter(cat => cat !== catToDelete);
        currentServices = currentServices.filter(s => !s.category || s.category.trim() !== catToDelete);

        renderTable();
        updateUndoRedoButtons();
        alert(`Kategoria "${catToDelete}" została usunięta.`);
        closeCategoryModal();
    }
}

// ==========================================================================
// СОЗДАНИЕ НОВОЙ ПУСТОЙ КАТЕГОРИИ ИЗ ОКНА УПРАВЛЕНИЯ
// ==========================================================================
function addNewCategoryEmpty() {
    const input = document.getElementById("createNewCategoryName");
    if (!input) return;

    const newCatName = input.value.trim();

    if (!newCatName) {
        alert("Wpisz nazwę nowej kategorii!");
        return;
    }

    const exists = allCategories.some(c => c.toLowerCase() === newCatName.toLowerCase());
    if (exists) {
        alert("Taka kategoria już istnieje!");
        return;
    }

    saveToHistory();
    allCategories.push(newCatName);
    input.value = "";

    renderTable();
    updateUndoRedoButtons();

    const select = document.getElementById("renameCategorySelect");
    if (select) {
        const opt = document.createElement("option");
        opt.value = newCatName;
        opt.innerText = newCatName;
        select.appendChild(opt);
    }

    alert(`Utworzono nową pustą kategorię: "${newCatName}"!`);
}
