const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycby9Z_OaiPzCLKO7uxHz_kZQfRabqZiz_38infIV1YkVE6Rbx8MAkq-LLYNpFHQZidIypg/exec";

// --- СОСТОЯНИЕ И ЛОКАЛЬНАЯ ИСТОРИЯ (UNDO / REDO) ---
let currentServices = [];       // Текущее состояние списка услуг на экране
let allCategories = [];         // Глобальный список категорий (не пропадает при удалении услуг!)
let undoStack = [];             // Стек для отмены действий (кнопка "Cofnij")
let redoStack = [];             // Стек для возврата действий (кнопка "Ponów")
let hasUnsavedChanges = false;  // Флаг наличия несохраненных изменений

document.addEventListener("DOMContentLoaded", () => {
    // При старте загружаем услуги и текущие настройки из таблицы
    loadAdminServices();
    loadSettings();

    // Предупреждение перед закрытием вкладки, если изменения не сохранены
    window.addEventListener("beforeunload", (e) => {
        if (hasUnsavedChanges) {
            e.preventDefault();
            e.returnValue = "Masz niezapisane zmiany w Szkicach! Czy na pewno chcesz opuścić stronę?";
        }
    });

    // Горячие клавиши (Ctrl+Z / Ctrl+Y)
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

// 1. Переключение вкладок
function switchTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.style.display = 'none';
    });
    
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    const targetTab = document.getElementById(`tab-${tabName}`);
    if (targetTab) {
        targetTab.style.display = 'block';
    }
    
    const activeBtn = document.querySelector(`.tab-btn[onclick*="${tabName}"]`);
    if (activeBtn) {
        activeBtn.classList.add('active');
    }
}

// 2. Загрузка настроек из Google Таблицы
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

// 3. Сохранение настроек
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
        
        if (result.success) {
            alert("Ustawienia zostały pomyślnie zapisane!");
        } else {
            alert("Błąd: " + (result.error || "nieznany błąd"));
        }
    } catch (e) {
        console.error(e);
        alert("Błąd połąчения з сервером.");
    } finally {
        btn.innerText = originalText;
        btn.disabled = false;
    }
}

// 4. Первичная загрузка списка услуг из базы
async function loadAdminServices() {
    const tbody = document.getElementById("adminServicesTableBody");
    if (!tbody) return;

    tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: var(--text-muted);">Ładowanie usług z bazy...</td></tr>';

    try {
        const response = await fetch(APPS_SCRIPT_URL + "?getPrices=true");
        const services = await response.json();

        currentServices = services || [];
        
        // Инициализируем наш стабильный список категорий на основе загруженных услуг
        const rawCategories = currentServices.map(s => s.category ? s.category.trim() : "");
        allCategories = [...new Set(rawCategories)].filter(c => c.length > 0);

        undoStack = [];
        redoStack = [];
        hasUnsavedChanges = false;

        renderTable();
        updateUndoRedoButtons();

    } catch (error) {
        console.error("Błąd ładowania usług:", error);
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: red;">Błąd połączenia z bazą danych.</td></tr>';
    }
}

// 5. Отрисовка таблицы услуг на экране
function renderTable() {
    const tbody = document.getElementById("adminServicesTableBody");
    if (!tbody) return;

    tbody.innerHTML = "";

    if (currentServices.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: var(--text-muted);">Brak usług. Kliknij "Dodaj nowy", aby dodać zabieg.</td></tr>';
        return;
    }

    currentServices.forEach((item, index) => {
        const tr = document.createElement("tr");
        const isDraft = item.status === "Draft" || item.status === "Szkic" || item.isLocalChange;
        
        const statusBadge = isDraft 
            ? '<span class="badge" style="background-color: #f0ad4e; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold; font-size: 0.85em;">Szkic</span>' 
            : '<span class="badge" style="background-color: #5cb85c; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold; font-size: 0.85em;">Opublikowany</span>';

        tr.innerHTML = `
            <td><strong>${item.category}</strong></td>
            <td>${item.name}</td>
            <td>${item.price} zł</td>
            <td>${item.duration} min</td>
            <td>${statusBadge}</td>
            <td>
                <button class="btn-small btn-primary" onclick="editService(${index})">Edytuj</button>
                <button class="btn-small btn-danger" onclick="deleteService(${index})" style="margin-left: 5px;">Usuń</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// 6. СОХРАНЕНИЕ ТЕКУЩЕЙ СТРАНИЦЫ В ИСТОРИЮ (Перед изменениями)
function saveToHistory() {
    // Сохраняем глубокую копию услуг И категорий, чтобы Undo возвращал и категории тоже!
    undoStack.push({
        services: JSON.parse(JSON.stringify(currentServices)),
        categories: JSON.parse(JSON.stringify(allCategories))
    });
    redoStack = []; 
    hasUnsavedChanges = true;
    updateUndoRedoButtons();
}

// Физическая кнопка: Назад (Undo)
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

// Физическая кнопка: Вперед (Redo)
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

// Обновление доступности кнопок Cofnij/Ponów на экране
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

// 7. ЛОКАЛЬНЫЕ ИЗМЕНЕНИЯ (Работают через Undo/Redo)

// Добавление новой услуги (локально)
function addServiceLocal(newService) {
    saveToHistory();
    newService.isLocalChange = true;
    newService.status = "Szkic";
    currentServices.push(newService);
    renderTable();
    updateUndoRedoButtons();
}

// Редактирование услуги (локально)
function updateServiceLocal(index, updatedService) {
    saveToHistory();
    updatedService.isLocalChange = true;
    updatedService.status = "Szkic";
    currentServices[index] = updatedService;
    renderTable();
    updateUndoRedoButtons();
}

// Удаление услуги (локально)
function deleteService(index) {
    if (confirm("Czy na pewno chcesz usunąć tę usługę z listy? (Zmiana zostanie zapisana po kliknięciu 'Zapisz jako Szkic')")) {
        saveToHistory();
        currentServices.splice(index, 1);
        // Обратите внимание: категорию мы отсюда НЕ удаляем!
        renderTable();
        updateUndoRedoButtons();
    }
}

// 8. ОТПРАВКА ЛОКАЛЬНОГО ЧЕРНОВИКА В СЕТЬ (В таблицу Draft_Prices)
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
                prices: currentServices
            })
        });
        const result = await response.json();

        if (result.success) {
            hasUnsavedChanges = false;
            currentServices.forEach(s => delete s.isLocalChange);
            renderTable();
            updateUndoRedoButtons();
            alert("Szkic został pomyślnie zapisany w Google Sheets!");
        } else {
            alert("Błąd zapisu szkicu: " + result.error);
        }
    } catch (e) {
        console.error(e);
        alert("Błąd połączenia z bazą danych.");
    } finally {
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
}

// 9. 🚀 ПУБЛИКАЦИЯ ИЗМЕНЕНИЙ ИЗ ТАБЛИЦЫ В ПУБЛИЧНЫЙ ДОСТУП
async function publishDrafts() {
    if (hasUnsavedChanges) {
        const confirmSave = confirm("Masz niezapisane zmiany na ekranie. Czy chcesz najpierw zapisać je jako Szkic i opublikować?");
        if (confirmSave) {
            await saveDraftsToCloud();
        } else {
            return;
        }
    }

    if (!confirm("Czy na pewno chcesz opublikować wszystkie zmiany? Nowy cennik będzie natychmiast widoczny dla klientów na stronie głównej!")) {
        return;
    }

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
            alert("Gratulacje! Nowy cennik został pomyślnie opublikowany!");
        } else {
            alert("Błąd publikacji: " + result.error);
        }
    } catch (e) {
        console.error(e);
        alert("Błąd połączenia z serwerem.");
    } finally {
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
}

// ==========================================================================
// ЛОГИКА МОДАЛЬНОГО ОКНА (ДОБАВЛЕНИЕ И РЕДАКТИРОВАНИЕ)
// ==========================================================================

// Показывает/скрывает текстовое поле для новой категории
function toggleNewCategoryInput() {
    const select = document.getElementById("serviceCategorySelect");
    const newCatGroup = document.getElementById("newCategoryGroup");
    
    if (select && select.value === "__NEW__") {
        newCatGroup.style.display = "block";
    } else if (newCatGroup) {
        newCatGroup.style.display = "none";
    }
}

// Закрытие модального окна услуг
function closeServiceModal() {
    const modal = document.getElementById("serviceModal");
    if (modal) modal.style.display = "none";
}

// --- ОТКРЫТИЕ МОДАЛКИ УСЛУГ ---

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

// Построение выпадающего списка категорий на базе СТАБИЛЬНОГО allCategories
function buildCategorySelect(selectId, selectedValue) {
    const select = document.getElementById(selectId);
    if (!select) return;
    
    select.innerHTML = "";

    // Используем глобальный отсортированный по алфавиту список без лишних пробелов
    const sortedCategories = [...allCategories].sort((a, b) => a.localeCompare(b));

    sortedCategories.forEach(cat => {
        const opt = document.createElement("option");
        opt.value = cat;
        opt.innerText = cat;
        if (cat.toLowerCase() === (selectedValue || "").trim().toLowerCase()) {
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

// --- СОХРАНЕНИЕ ДАННЫХ ИЗ ОКНА УСЛУГ ---
function saveServiceModalData() {
    const index = parseInt(document.getElementById("editServiceIndex").value);
    
    const select = document.getElementById("serviceCategorySelect");
    if (!select) return;
    let category = select.value.trim();
    
    if (category === "__NEW__") {
        category = document.getElementById("serviceCategoryNew").value.trim();
        
        // Если пользователь создал новую категорию, добавляем её в наш стабильный список категорий (без дублирования)
        if (category) {
            const exists = allCategories.some(c => c.toLowerCase() === category.toLowerCase());
            if (!exists) {
                saveToHistory();
                allCategories.push(category);
            } else {
                // Если она уже существовала (но, например, в другом регистре), берем существующую
                const match = allCategories.find(c => c.toLowerCase() === category.toLowerCase());
                category = match;
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

// --- ЛОГИКА ОКНА РЕДАКТИРОВАНИЯ КАТЕГОРИЙ (МАССОВОЕ ИЗМЕНЕНИЕ И УДАЛЕНИЕ!) ---

function openCategoryModal() {
    if (allCategories.length === 0) {
        alert("Brak kategorii do edycji!");
        return;
    }

    const select = document.getElementById("renameCategorySelect");
    if (!select) return;
    select.innerHTML = "";
    
    const sortedCategories = [...allCategories].sort((a, b) => a.localeCompare(b));
    sortedCategories.forEach(cat => {
        const opt = document.createElement("option");
        opt.value = cat;
        opt.innerText = cat;
        select.appendChild(opt);
    });

    document.getElementById("renameCategoryNewName").value = "";
    document.getElementById("categoryModal").style.display = "flex";
}

function closeCategoryModal() {
    const modal = document.getElementById("categoryModal");
    if (modal) modal.style.display = "none";
}

// Массовое переименование выбранной категории
function renameCategoryGlobal() {
    const select = document.getElementById("renameCategorySelect");
    if (!select) return;
    const oldName = select.value;
    const newName = document.getElementById("renameCategoryNewName").value.trim();

    if (!newName) {
        alert("Wpisz nową nazwę kategorii!");
        return;
    }

    if (oldName === newName) {
        closeCategoryModal();
        return;
    }

    saveToHistory();

    // 1. Обновляем имя в списке категорий
    allCategories = allCategories.map(cat => cat === oldName ? newName : cat);

    // 2. Обновляем категорию во всех связанных услугах
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
    alert(`Nazwa kategorii została zmieniona! Zaktualizowano ${modifiedCount} zabiegów.`);
    closeCategoryModal();
}

// Новая функция: Удаление категории целиком вместе со всеми её услугами
function deleteCategoryGlobal() {
    const select = document.getElementById("renameCategorySelect");
    if (!select) return;
    const catToDelete = select.value;

    if (!catToDelete) return;

    // Считаем, сколько услуг затронет удаление
    const count = currentServices.filter(s => s.category && s.category.trim() === catToDelete).length;

    const confirmMsg = count > 0 
        ? `Czy na pewno chcesz usunąć kategorię "${catToDelete}"? Spowoduje to również USUNIĘCIE wszystkich przypisanych do niej zabiegów (${count} szt.) z listy!` 
        : `Czy na pewno chcesz usunąć pustą kategorię "${catToDelete}"?`;

    if (confirm(confirmMsg)) {
        saveToHistory();

        // 1. Удаляем категорию из глобального списка
        allCategories = allCategories.filter(cat => cat !== catToDelete);

        // 2. Удаляем все услуги, принадлежащие этой категории
        currentServices = currentServices.filter(s => !s.category || s.category.trim() !== catToDelete);

        renderTable();
        updateUndoRedoButtons();
        alert(`Kategoria "${catToDelete}" oraz jej zabiegi zostały pomyślnie usunięte локально (kliknij "Zapisz jako Szkic", aby zapisać zmiany).`);
        closeCategoryModal();
    }
}

// Выход
function logout() {
    if (hasUnsavedChanges) {
        if (!confirm("Masz niezapisane zmiany! Czy na pewno chcesz się wylogować?")) return;
    }
    alert("Wylogowano pomyślnie!");
}
