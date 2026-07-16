const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycby9Z_OaiPzCLKO7uxHz_kZQfRabqZiz_38infIV1YkVE6Rbx8MAkq-LLYNpFHQZidIypg/exec";
document.addEventListener("DOMContentLoaded", () => {
    // При старте загружаем услуги и текущие настройки из таблицы
    loadAdminServices();
    loadSettings();
});

// 1. Переключение вкладок в админ-панели
function switchTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.style.display = 'none';
    });
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    document.getElementById(`tab-${tabName}`).style.display = 'block';
    if (event && event.target) {
        event.target.classList.add('active');
    }
}

// 2. Загрузка настроек из Google Таблицы при входе в админку
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

// 3. Сохранение настроек в Google Таблицу
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
            alert("Ustawienia zostały pomyślnie zapisane w Google Sheets!");
        } else {
            alert("Błąd podczas zapisu: " + (result.error || "nieznany błąd"));
        }
    } catch (e) {
        console.error(e);
        alert("Błąd połączenia z serwerem. Upewnij się, że wdrożyłeś nową wersję Web App в Apps Script.");
    } finally {
        btn.innerText = originalText;
        btn.disabled = false;
    }
}

// 4. Загрузка списка услуг (черновиков)
async function loadAdminServices() {
    const tbody = document.getElementById("adminServicesTableBody");
    if (!tbody) return;

    tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: var(--text-muted);">Ładowanie usług z bazy...</td></tr>';

    try {
        const response = await fetch(APPS_SCRIPT_URL + "?getPrices=true");
        const services = await response.json();

        tbody.innerHTML = "";

        if (!services || services.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: var(--text-muted);">Brak usług w bazie danych.</td></tr>';
            return;
        }

        services.forEach((item, index) => {
            const tr = document.createElement("tr");
            const statusBadge = item.status === "Draft" 
                ? '<span class="badge badge-warning">Draft</span>' 
                : '<span class="badge badge-success">Publiczny</span>';

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

    } catch (error) {
        console.error("Błąd ładowния usług w админке:", error);
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: red;">Błąd połączenia z bazą danych. Sprawdź konsolę przeglądarki.</td></tr>';
    }
}

// Временные заглушки для редактирования услуг
function openAddServiceModal() {
    alert("Funkcja dodawania nowego zabiegu zostanie wdrożona в kolejnym kroku.");
}

function editService(index) {
    alert("Funkcja edycji zabiegu zostanie wdrożona в kolejnym kroku.");
}

function deleteService(index) {
    if (confirm("Czy na pewno chcesz usunąć tę usługę?")) {
        alert("Funkcja usuwania zostanie wdrożona в kolejnym kroku.");
    }
}

async function publishDrafts() {
    alert("Publikacja zmian zostanie wdrożona в kolejnym kroku.");
}

function logout() {
    alert("Wylogowano!");
}
