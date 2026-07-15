const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbz1GVocAldQxrudzp3VyzoFGrmE5nVl88uWJ2VWh1B04HYXHQdTmmcrIgDwyLcHMdZErA/exec";

document.addEventListener("DOMContentLoaded", () => {
    // При старте загружаем список услуг для админки
    loadAdminServices();
});

// 1. Переключение вкладок в админ-панели
function switchTab(tabName) {
    // Скрываем все вкладки
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.style.display = 'none';
    });
    // Снимаем активный класс со всех кнопок
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Показываем нужную вкладку и делаем кнопку активной
    document.getElementById(`tab-${tabName}`).style.display = 'block';
    event.target.classList.add('active');
}

// 2. Загрузка услуг для панели администратора
async function loadAdminServices() {
    const tbody = document.getElementById("adminServicesTableBody");
    if (!tbody) return;

    tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: var(--text-muted);">Ładowanie usług z bazy...</td></tr>';

    try {
        // Запрашиваем цены (в будущем скрипт будет отдавать именно черновики для редактирования)
        const response = await fetch(`${APPS_SCRIPT_URL}?getPrices=true`);
        const prices = await response.json();

        if (!prices || prices.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: var(--text-muted);">Brak usług в базе данных.</td></tr>';
            return;
        }

        tbody.innerHTML = ""; // Очищаем лоадер

        prices.forEach((item, index) => {
            const tr = document.createElement("tr");

            // Определяем красивый бейдж статуса (пока по умолчанию public, далее свяжем с колонками)
            const statusBadge = item.showPrice 
                ? '<span class="status-badge status-public">Widoczna</span>' 
                : '<span class="status-badge status-draft">Ukryta</span>';

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
        console.error("Błąd ładowania usług в админке:", error);
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: red;">Błąd połączenia z bazą danych.</td></tr>';
    }
}

// 3. Заглушки под функции добавления, изменения и публикации (их логику свяжем с обновлением Code.gs на следующем шаге)
function openAddServiceModal() {
    alert("Funkcja dodawania nowego zabiegu zostanie wdrożona w kolejnym kroku integracji API.");
}

function editService(index) {
    alert("Funkcja edycji zabiegu o indeksie " + index + " zostanie wdrożona w kolejnym kroku.");
}

function deleteService(index) {
    if (confirm("Czy na pewno chcesz usunąć tę usługę?")) {
        alert("Funkcja usuwania zostanie wdrożona w kolejnym kroku.");
    }
}

async function publishDrafts() {
    alert("Publikacja zmian: Dane zostaną przeniesione z tabeli roboczej do publicznej cennika.");
}

function logoutAdmin() {
    alert("Wylogowano pomyślnie!");
    // Здесь позже будет редирект или сброс сессии авторизации
}
