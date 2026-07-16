const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycby9Z_OaiPzCLKO7uxHz_kZQfRabqZiz_38infIV1YkVE6Rbx8MAkq-LLYNpFHQZidIypg/exec";

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
    // Скрываем весь контент вкладок
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.style.display = 'none';
    });
    
    // Убираем класс active у всех кнопок
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Показываем нужный контент
    const targetTab = document.getElementById(`tab-${tabName}`);
    if (targetTab) {
        targetTab.style.display = 'block';
    }
    
    // Находим нажатую кнопку по ее onclick атрибуту и делаем активной
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
            document.getElementById("buffer_hours").value
