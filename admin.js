const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxptmseksKkEens4-K-dwX0TaQNM00vMWUcK2BCQ2USdE6Z6u2NbMBmHEPdXvANnd591Q/exec";

// --- СОСТОЯНИЕ И ЛОКАЛЬНАЯ ИСТОРИЯ (UNDO / REDO) ---
let currentServices = [];       // Текущее состояние списка услуг на экране
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

    // Оставляем горячие клавиши как альтернативу для удобства (Ctrl+Z / Ctrl+Y)
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
    if (event && event.target) {
        event.target.classList.add('active');
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
        alert("Błąd połączenia с сервером.");
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

        // Сбрасываем историю при первой чистой загрузке из базы
        currentServices = services || [];
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
        
        // --- ПОЛЬСКИЕ СТАТУСЫ НА ЭКРАНЕ ---
        // Если у услуги статус "Draft" (из Google Таблицы) или есть локальные несохраненные изменения — пишем "Szkic"
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
    // Делаем "глубокий" снимок состояния списка услуг
    undoStack.push(JSON.parse(JSON.stringify(currentServices)));
    redoStack = []; // Любое новое действие затирает стек "Вперед"
    hasUnsavedChanges = true;
    updateUndoRedoButtons();
}

// Физическая кнопка: Назад (Undo)
function undo() {
    if (undoStack.length > 0) {
        redoStack.push(JSON.parse(JSON.stringify(currentServices)));
        currentServices = undoStack.pop();
        renderTable();
        updateUndoRedoButtons();
    }
}

// Физическая кнопка: Вперед (Redo)
function redo() {
    if (redoStack.length > 0) {
        undoStack.push(JSON.parse(JSON.stringify(currentServices)));
        currentServices = redoStack.pop();
        renderTable();
        updateUndoRedoButtons();
    }
}

// Обновление доступности кнопок Cofnij/Ponów на экране
function updateUndoRedoButtons() {
    const undoBtn = document.getElementById("undoBtn");
    const redoBtn = document.getElementById("redoBtn");
    const saveDraftsBtn = document.getElementById("saveDraftsBtn");

    // Если в стеках пусто — делаем кнопки серыми (disabled)
    if (undoBtn) undoBtn.disabled = undoStack.length === 0;
    if (redoBtn) redoBtn.disabled = redoStack.length === 0;

    // Подсвечиваем кнопку сохранения черновика, если есть изменения
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
        renderTable();
        updateUndoRedoButtons();
    }
}

// 8. ОТПРАВКА ЛОКАЛЬНОГО ЧЕРНОВИКА В СЕТЬ (В таблицу Draft_Prices)
async function saveDraftsToCloud() {
    const btn = document.getElementById("saveDraftsBtn");
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
            // Убираем флаги локальных изменений, так как они сохранены в Google Sheets
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
            // Перегружаем таблицу, все статусы станут зелеными "Opublikowany"
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

// Выход
function logout() {
    if (hasUnsavedChanges) {
        if (!confirm("Masz niezapisane zmiany! Czy na pewno chcesz się wylogować?")) return;
    }
    alert("Wylogowano pomyślnie!");
}
