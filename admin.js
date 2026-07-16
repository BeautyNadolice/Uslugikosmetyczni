const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwIK1JhZbieZ6Gl_77pcRZqVdHLbdiageRd138k-RN7cPq2YXzc5SliYCYoO-BLQBdTSw/exec";

document.addEventListener("DOMContentLoaded", () => {
    loadAdminServices();
    loadSettings();
});

// 1. Загрузка настроек
async function loadSettings() {
    try {
        const response = await fetch(APPS_SCRIPT_URL + "?checkBusy=true");
        const data = await response.json();
        if (data.settings) {
            document.getElementById("work_start_hour").value = data.settings.work_start_hour;
            document.getElementById("work_end_hour").value = data.settings.work_end_hour;
            document.getElementById("buffer_hours").value = data.settings.buffer_hours;
        }
    } catch (e) {
        console.error("Błąd ładowania ustawień:", e);
    }
}

// 2. Сохранение настроек
async function saveSettings() {
    const btn = document.getElementById("saveSettingsBtn");
    btn.innerText = "Zapisywanie...";
    
    const payload = {
        work_start_hour: document.getElementById("work_start_hour").value,
        work_end_hour: document.getElementById("work_end_hour").value,
        buffer_hours: parseInt(document.getElementById("buffer_hours").value)
    };

    try {
        const response = await fetch(APPS_SCRIPT_URL, {
            method: "POST",
            body: JSON.stringify({ action: "updateSettings", payload: payload })
        });
        const result = await response.json();
        
        if (result.status === "success") {
            alert("Ustawienia zapisane!");
        } else {
            alert("Błąd zapisu.");
        }
    } catch (e) {
        alert("Błąd połączenia.");
    } finally {
        btn.innerText = "Zapisz ustawienia";
    }
}

// Переключение вкладок
function switchTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.style.display = 'none');
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`tab-${tabName}`).style.display = 'block';
    event.target.classList.add('active');
}

// Загрузка услуг (ваша существующая функция)
async function loadAdminServices() {
    // ... ваш код загрузки услуг ...
}
